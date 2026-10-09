import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { build, versionModule } from '../../scripts/build-artifact.mjs';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const SITE = join(ROOT, 'site');
const BUILDER = join(ROOT, 'scripts', 'build-artifact.mjs');
const VERSION = 'v1.2.3';
const STAMP = `?v=${VERSION}`;

const TAG = /<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTRIBUTE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
// The same statement-level form the preload test follows.
const IMPORT = /^\s*(?:import|export)\b[^;]*?\bfrom\s*(['"])(.+?)\1/gm;
const CSS_URL = /url\(\s*(['"]?)(.*?)\1\s*\)/g;

const isRelative = (ref) => !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(ref);

function cli(...args) {
  return spawnSync(process.execPath, [BUILDER, ...args], { encoding: 'utf8' });
}

function tags(html) {
  return [...html.replace(/<!--[\s\S]*?-->/g, '').matchAll(TAG)].map(([, name, attrs]) => ({
    name: name.toLowerCase(),
    attrs: new Map(
      [...attrs.matchAll(ATTRIBUTE)].map(([, key, a, b, c]) => [
        key.toLowerCase(),
        a ?? b ?? c ?? '',
      ]),
    ),
  }));
}

function files(dir, extension) {
  return readdirSync(dir, { recursive: true })
    .filter((name) => name.endsWith(extension))
    .map((name) => join(dir, name));
}

// Every file's path and SHA-256, so an added, removed or changed file shows.
function snapshot(dir) {
  return new Map(
    readdirSync(dir, { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const path = join(entry.parentPath ?? entry.path, entry.name);
        const hash = createHash('sha256').update(readFileSync(path)).digest('hex');
        return [path.slice(dir.length), hash];
      }),
  );
}

// A URL's file, whatever its query.
function fileOf(url) {
  const bare = new URL(url);
  bare.search = '';
  return bare;
}

function importGraph(entry, seen = new Set()) {
  if (seen.has(entry.href)) {
    return seen;
  }
  seen.add(entry.href);
  for (const [, , specifier] of readFileSync(fileOf(entry), 'utf8').matchAll(IMPORT)) {
    importGraph(new URL(specifier, entry), seen);
  }
  return seen;
}

let work;
let out;
let siteBefore;
let built;

before(() => {
  work = mkdtempSync(join(tmpdir(), 'tmelevation-artifact-test-'));
  out = join(work, 'artifact');
  siteBefore = snapshot(SITE);
  built = cli(VERSION, out);
});

after(() => {
  rmSync(work, { recursive: true, force: true });
});

test('the builder exits 0 for a release version', () => {
  assert.equal(built.status, 0, built.stderr);
});

test('the artifact stamps the version into js/version.js', async () => {
  const { VERSION: stamped } = await import(pathToFileURL(join(out, 'js', 'version.js')).href);
  assert.equal(stamped, VERSION);
});

test('every relative import specifier in the artifact carries the version', () => {
  const specifiers = files(join(out, 'js'), '.js').flatMap((path) =>
    [...readFileSync(path, 'utf8').matchAll(IMPORT)].map(([, , specifier]) => ({
      path,
      specifier,
    })),
  );
  assert.ok(specifiers.length >= 20, `only ${specifiers.length} import specifiers found`);
  for (const { path, specifier } of specifiers) {
    if (isRelative(specifier)) {
      assert.ok(specifier.endsWith(`.js${STAMP}`), `${path}: ${specifier}`);
    }
  }
});

test('every script, link and stylesheet url() in the artifact carries the version', () => {
  const refs = [
    ...files(out, '.html').flatMap((path) =>
      tags(readFileSync(path, 'utf8'))
        .filter(({ name }) => name === 'script' || name === 'link')
        .map(({ name, attrs }) => ({ path, ref: attrs.get(name === 'script' ? 'src' : 'href') })),
    ),
    ...files(out, '.css').flatMap((path) =>
      [...readFileSync(path, 'utf8').matchAll(CSS_URL)].map(([, , ref]) => ({ path, ref })),
    ),
  ];
  assert.ok(refs.length >= 30, `only ${refs.length} references found`);
  for (const { path, ref } of refs) {
    assert.ok(ref !== undefined && isRelative(ref), `${path}: ${ref}`);
    assert.ok(ref.endsWith(STAMP), `${path}: ${ref}`);
    assert.equal(ref.indexOf('?'), ref.length - STAMP.length, `${path}: ${ref}`);
  }
});

for (const page of ['index.html', 'methods.html']) {
  test(`${page}: the modulepreload URLs are exactly the module URLs the page imports`, () => {
    const pageUrl = pathToFileURL(join(out, page));
    const all = tags(readFileSync(pageUrl, 'utf8'));
    const entries = all.filter(
      ({ name, attrs }) => name === 'script' && attrs.get('type') === 'module',
    );
    assert.equal(entries.length, 1);
    const graph = importGraph(new URL(entries[0].attrs.get('src'), pageUrl));
    const preloaded = all
      .filter(({ name, attrs }) => name === 'link' && attrs.get('rel') === 'modulepreload')
      .map(({ attrs }) => new URL(attrs.get('href'), pageUrl).href);
    assert.ok(graph.size >= 9, `graph has ${graph.size} modules`);
    assert.equal(new Set(preloaded).size, preloaded.length, 'duplicate modulepreload');
    assert.deepEqual(new Set(preloaded), graph);
  });

  test(`${page}: every preloaded font URL is one its stylesheet loads`, () => {
    const pageUrl = pathToFileURL(join(out, page));
    const all = tags(readFileSync(pageUrl, 'utf8'));
    const sheets = all
      .filter(({ name, attrs }) => name === 'link' && attrs.get('rel') === 'stylesheet')
      .map(({ attrs }) => new URL(attrs.get('href'), pageUrl));
    const loaded = new Set(
      sheets.flatMap((sheet) =>
        [...readFileSync(fileOf(sheet), 'utf8').matchAll(CSS_URL)].map(
          ([, , ref]) => new URL(ref, sheet).href,
        ),
      ),
    );
    const fonts = all
      .filter(
        ({ name, attrs }) =>
          name === 'link' && attrs.get('rel') === 'preload' && attrs.get('as') === 'font',
      )
      .map(({ attrs }) => new URL(attrs.get('href'), pageUrl).href);
    assert.ok(fonts.length > 0, 'no font preloads');
    for (const font of fonts) {
      assert.ok(
        loaded.has(font),
        `${font} is preloaded but the stylesheet loads ${[...loaded].join(', ')}`,
      );
    }
  });
}

test('building leaves site/ byte-identical', () => {
  assert.deepEqual(snapshot(SITE), siteBefore);
});

for (const version of ['v1.2', '1.2.3', 'v1.2.3-rc.1']) {
  test(`the builder rejects ${JSON.stringify(version)} with exit status 2`, () => {
    const target = join(work, `rejected-${version}`);
    const result = cli(version, target);
    assert.equal(result.status, 2, result.stderr);
    assert.ok(!existsSync(target), 'an output directory was created');
  });
}

// Any quoted relative .js path, found without the builder's own patterns, so
// a specifier the builder skipped shows up here.
const JS_LITERAL = /(['"])(\.{1,2}\/[^'"\s]*?\.js)(\?[^'"\s]*)?\1/g;

test('every quoted relative .js path in the artifact carries the version', () => {
  const literals = files(join(out, 'js'), '.js').flatMap((path) =>
    [...readFileSync(path, 'utf8').matchAll(JS_LITERAL)].map(([literal, , , query]) => ({
      path,
      literal,
      query,
    })),
  );
  assert.ok(literals.length >= 20, `only ${literals.length} .js literals found`);
  for (const { path, literal, query } of literals) {
    assert.equal(query, STAMP, `${path}: ${literal}`);
  }
});

const stamped = (source) => versionModule(source, VERSION);

test('the builder leaves strings, comments and templates that look like imports alone', () => {
  const source = [
    `export const NOTE = "Carry from 'TrackMan' data";`,
    `const quoted = 'import { x } from "./x.js"';`,
    `// import y from './y.js';`,
    `/* export * from './z.js'; */`,
    'const template = `${"from"} \'./t.js\' ${`import u from "./u.js"`}`;',
    '',
  ].join('\n');
  assert.deepEqual(stamped(source), { text: source, refs: [] });
});

test('the builder stamps every import and re-export, several to a line', () => {
  const source = [
    `import {a} from './a.js'; import {b} from './b.js';`,
    `import {`,
    `  c,`,
    `  d,`,
    `} from './c.js';`,
    `import e, * as f from "./e.js";`,
    `import g from './g.js';`,
    `export * from './h.js';`,
    `export * as i from './i.js';`,
    `export { j as k } from './j.js';`,
    `export const l = 1;`,
    '',
  ].join('\n');
  const { text, refs } = stamped(source);
  assert.deepEqual(refs, [
    './a.js',
    './b.js',
    './c.js',
    './e.js',
    './g.js',
    './h.js',
    './i.js',
    './j.js',
  ]);
  assert.equal(text, source.replace(/\.js(['"])/g, `.js${STAMP}$1`));
});

test('the builder finds imports after regular expressions and divisions', () => {
  const source = [
    `const quote = /['"]/;`,
    `import { m } from './m.js';`,
    `const half = 1 / 2; const slash = /\\//g;`,
    `import { n } from './n.js';`,
    '',
  ].join('\n');
  assert.deepEqual(stamped(source).refs, ['./m.js', './n.js']);
});

test('the builder rejects dynamic and side-effect-only imports but allows import.meta', () => {
  assert.throws(() => stamped(`const o = import('./o.js');\n`), /cannot be versioned/);
  assert.throws(() => stamped(`import './p.js';\n`), /cannot be versioned/);
  assert.deepEqual(stamped(`const q = import.meta.url;\nimport { r } from './r.js';\n`).refs, [
    './r.js',
  ]);
});

function fixture(files) {
  const dir = mkdtempSync(join(work, 'fixture-'));
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    writeFileSync(join(dir, name), text);
  }
  return dir;
}

test('a stamped reference that names no file fails the build and leaves no output', () => {
  const site = fixture({
    'js/version.js': "export const VERSION = 'dev';\n",
    'js/app.js': "import { s } from './missing.js';\n",
  });
  const target = join(work, 'missing-out');
  assert.throws(() => build(VERSION, target, site), /js\/app\.js: \.\/missing\.js names no file/);
  assert.ok(!existsSync(target), 'the partial output was left behind');
});

test('an import that cannot be versioned fails the build and empties the output again', () => {
  const site = fixture({
    'js/version.js': "export const VERSION = 'dev';\n",
    'js/app.js': "const t = import('./version.js');\n",
  });
  const target = join(work, 'empty-out');
  mkdirSync(target);
  assert.throws(() => build(VERSION, target, site), /js\/app\.js: .*cannot be versioned/);
  assert.deepEqual(readdirSync(target), []);
});

test('the builder refuses an output directory inside site/ with exit status 2', () => {
  // `..x` is a child of site/ whose relative path still starts with `..`.
  for (const name of ['artifact', '..x']) {
    const target = join(SITE, name);
    try {
      const result = cli(VERSION, target);
      assert.equal(result.status, 2, `${name}: ${result.stderr}`);
      assert.ok(!existsSync(target), `${name} was created`);
    } finally {
      rmSync(target, { recursive: true, force: true });
    }
  }
  assert.deepEqual(snapshot(SITE), siteBefore);
});

test('the builder refuses a non-empty output directory with exit status 2', () => {
  const target = join(work, 'occupied');
  mkdirSync(target);
  writeFileSync(join(target, 'keep.txt'), 'keep');
  const result = cli(VERSION, target);
  assert.equal(result.status, 2, result.stderr);
  assert.deepEqual(readdirSync(target), ['keep.txt']);
  assert.equal(readFileSync(join(target, 'keep.txt'), 'utf8'), 'keep');
});

test('the builder requires exactly two arguments', () => {
  assert.equal(cli(VERSION).status, 2);
  assert.equal(cli(VERSION, join(work, 'one'), join(work, 'two')).status, 2);
  assert.ok(!existsSync(join(work, 'one')));
});
