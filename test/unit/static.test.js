import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SOURCE_URL } from '../../site/js/data.js';
import { ORACLES } from '../../site/js/oracles.js';

const SITE = new URL('../../site/', import.meta.url);
const JS = new URL('js/', SITE);
const FONTS = new URL('fonts/', SITE);
const ICONS = new URL('icons/', SITE);

const CSP =
  "default-src 'none'; script-src 'self'; style-src 'self'; font-src 'self'; " +
  "img-src 'self'; base-uri 'none'; form-action 'none'; require-trusted-types-for 'script'";

const read = (url) => readFileSync(url, 'utf8');

// A quoted attribute value may contain `>`, so a tag ends at the first `>`
// outside quotes.
const TAG = /<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g;
const ATTRIBUTE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
const SCRIPT = /<script\b((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi;

function withoutComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '');
}

function attributes(source) {
  const map = new Map();
  for (const [, name, double, single, bare] of source.matchAll(ATTRIBUTE)) {
    map.set(name.toLowerCase(), double ?? single ?? bare ?? '');
  }
  return map;
}

function tags(html) {
  return [...withoutComments(html).matchAll(TAG)].map(([, name, attrs]) => ({
    name: name.toLowerCase(),
    attrs: attributes(attrs),
  }));
}

function byId(html, id) {
  return tags(html).find((tag) => tag.attrs.get('id') === id);
}

// The source of the first element whose start tag matches, through its
// matching end tag; null when there is none.
function element(html, matches) {
  const source = withoutComments(html);
  for (const start of source.matchAll(TAG)) {
    const name = start[1].toLowerCase();
    if (!matches({ name, attrs: attributes(start[2]) })) {
      continue;
    }
    const boundary = new RegExp(`<(/?)${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');
    boundary.lastIndex = start.index;
    let depth = 0;
    for (let tag = boundary.exec(source); tag !== null; tag = boundary.exec(source)) {
      depth += tag[1] === '' ? 1 : -1;
      if (depth === 0) {
        return source.slice(start.index, tag.index + tag[0].length);
      }
    }
    return null;
  }
  return null;
}

const pages = readdirSync(SITE).filter((name) => name.endsWith('.html'));
const scripts = readdirSync(JS, { recursive: true }).filter((name) => name.endsWith('.js'));

// Static imports and re-exports only: the global constraints forbid the
// dynamic and side-effect-only forms, which a test below enforces.
const IMPORT = /^\s*(?:import|export)\b[^;]*?\bfrom\s*(['"])(.+?)\1/gm;

function importGraph(entry, seen = new Set()) {
  if (seen.has(entry.href)) {
    return seen;
  }
  seen.add(entry.href);
  for (const [, , specifier] of read(entry).matchAll(IMPORT)) {
    importGraph(new URL(specifier, entry), seen);
  }
  return seen;
}

test('the site has an index page', () => {
  assert.ok(pages.includes('index.html'), `pages found: ${pages.join(', ')}`);
});

test('the site has a methods page', () => {
  assert.ok(pages.includes('methods.html'), `pages found: ${pages.join(', ')}`);
});

for (const page of pages) {
  const html = read(new URL(page, SITE));
  const pageUrl = new URL(page, SITE);

  test(`${page} carries exactly one CSP meta with the global policy`, () => {
    const metas = tags(html).filter(
      (tag) =>
        tag.name === 'meta' &&
        tag.attrs.get('http-equiv')?.toLowerCase() === 'content-security-policy',
    );
    assert.equal(metas.length, 1);
    assert.equal(metas[0].attrs.get('content'), CSP);
  });

  // A meta policy governs only what is requested after it is parsed.
  test(`${page} places its CSP meta in <head> before any link or script`, () => {
    const all = tags(html);
    const at = (predicate) => all.findIndex(predicate);
    const csp = at(
      (tag) => tag.attrs.get('http-equiv')?.toLowerCase() === 'content-security-policy',
    );
    const head = at((tag) => tag.name === 'head');
    const body = at((tag) => tag.name === 'body');
    const link = at((tag) => tag.name === 'link');
    const script = at((tag) => tag.name === 'script');
    assert.ok(head >= 0 && head < csp && csp < body, 'CSP meta is not inside <head>');
    assert.ok(link >= 0 && csp < link, 'a <link> precedes the CSP meta');
    assert.ok(script >= 0 && csp < script, 'a <script> precedes the CSP meta');
  });

  test(`${page} has no inline script, style or event-handler attribute`, () => {
    const found = [...withoutComments(html).matchAll(SCRIPT)];
    assert.ok(found.length > 0, 'no <script> elements');
    for (const [, attrs, body] of found) {
      assert.ok(attributes(attrs).has('src'), `<script${attrs}> has no src`);
      assert.equal(body, '', `<script${attrs}> has a body`);
    }
    for (const { name, attrs } of tags(html)) {
      assert.notEqual(name, 'style', 'inline <style> element');
      for (const attr of attrs.keys()) {
        assert.notEqual(attr, 'style', `style attribute on <${name}>`);
        assert.ok(!attr.startsWith('on'), `${attr} attribute on <${name}>`);
      }
    }
  });

  test(`${page} modulepreloads exactly the import graph of its entry module`, () => {
    const all = tags(html);
    const entries = all.filter(
      (tag) => tag.name === 'script' && tag.attrs.get('type') === 'module',
    );
    assert.equal(entries.length, 1, 'expected one entry module');
    const entry = new URL(entries[0].attrs.get('src'), pageUrl);
    const preloaded = all
      .filter((tag) => tag.name === 'link' && tag.attrs.get('rel') === 'modulepreload')
      .map((tag) => new URL(tag.attrs.get('href'), pageUrl).href);
    assert.equal(new Set(preloaded).size, preloaded.length, 'duplicate modulepreload');
    assert.deepEqual(new Set(preloaded), importGraph(entry));
  });
}

test('no module under site/js writes markup or evaluates strings', () => {
  const forbidden = [
    /innerHTML/,
    /outerHTML/,
    /insertAdjacentHTML/,
    /document\.write/,
    /\beval\s*\(/,
    /new\s+Function\b/,
    /setAttribute\(\s*['"`]style['"`]/,
  ];
  assert.ok(scripts.length > 0);
  for (const name of scripts) {
    const source = read(new URL(name, JS));
    for (const pattern of forbidden) {
      assert.doesNotMatch(source, pattern, `${name} matches ${pattern}`);
    }
  }
});

test('no module under site/js uses dynamic or side-effect-only imports', () => {
  for (const name of scripts) {
    const source = read(new URL(name, JS));
    assert.doesNotMatch(source, /\bimport\s*\(/, `${name} has a dynamic import`);
    assert.doesNotMatch(source, /^\s*import\s*['"]/m, `${name} has a side-effect-only import`);
  }
});

// SOURCES.md lists each shipped font file as a table row:
// | `file` | upstream URL | SHA-256 |
function fontSources() {
  const rows = read(new URL('SOURCES.md', FONTS))
    .split('\n')
    .filter((line) => /^\|\s*`/.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
  return rows.map(([file, url, sha256]) => ({ file: file.replaceAll('`', ''), url, sha256 }));
}

test('every font file listed in SOURCES.md exists and matches its SHA-256', () => {
  const sources = fontSources();
  assert.ok(sources.length > 0, 'SOURCES.md lists no files');
  for (const { file, url, sha256 } of sources) {
    assert.match(url, /^https:\/\//, `${file} has no upstream URL`);
    const bytes = readFileSync(new URL(file, FONTS));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), sha256, file);
  }
});

test('every woff2 under site/fonts is listed and both OFL texts ship', () => {
  const listed = new Set(fontSources().map(({ file }) => file));
  const woff2 = readdirSync(FONTS).filter((name) => name.endsWith('.woff2'));
  assert.ok(woff2.length > 0, 'no woff2 files');
  for (const name of woff2) {
    assert.ok(listed.has(name), `${name} is not in SOURCES.md`);
  }
  for (const name of ['OFL-Oswald.txt', 'OFL-Lato.txt']) {
    assert.ok(existsSync(fileURLToPath(new URL(name, FONTS))), `${name} missing`);
  }
});

test('index.html explains a missing or failed script and links to the source', () => {
  const html = read(new URL('index.html', SITE));
  assert.match(withoutComments(html), /<noscript>[\s\S]*?<\/noscript>/);
  const loadError = byId(html, 'load-error');
  assert.ok(loadError, 'no #load-error');
  assert.ok(loadError.attrs.has('hidden'), '#load-error is not hidden by default');
  const trackman = tags(html).filter(
    (tag) => tag.name === 'a' && tag.attrs.get('href')?.includes('trackman.com'),
  );
  assert.ok(trackman.length >= 3, 'noscript, #load-error and footer each link to TrackMan');
  for (const link of trackman) {
    assert.equal(link.attrs.get('href'), SOURCE_URL);
  }
});

test('index.html turns autocomplete off on every input and select', () => {
  const html = read(new URL('index.html', SITE));
  const controls = tags(html).filter((tag) => tag.name === 'input' || tag.name === 'select');
  assert.deepEqual(
    controls.map((tag) => tag.attrs.get('id')).sort(),
    ['elev', 'elev-unit', 'press', 'press-unit', 'slider'],
  );
  for (const control of controls) {
    assert.equal(control.attrs.get('autocomplete'), 'off', `#${control.attrs.get('id')}`);
  }
});

const index = () => read(new URL('index.html', SITE));
const footerOf = (page) => element(read(new URL(page, SITE)), ({ name }) => name === 'footer');
const footer = () => footerOf('index.html');
const REPO_URL = 'https://github.com/jhoblitt/tmelevation';

test('index.html links the methods page first in its footer, not from the controls', () => {
  const html = index();
  assert.equal(tags(html).filter((tag) => tag.attrs.get('id') === 'methods-link').length, 1);
  const controls = element(html, ({ attrs }) => attrs.get('id') === 'controls');
  assert.ok(controls, 'no #controls');
  assert.equal(byId(controls, 'methods-link'), undefined, '#methods-link is in the controls');
  assert.ok(footer(), 'no <footer>');
  const [first] = tags(footer()).filter((tag) => tag.name === 'a');
  assert.equal(first?.attrs.get('id'), 'methods-link', 'the first footer link is not #methods-link');
  assert.equal(first.attrs.get('href'), 'methods.html');
});

const repoLink = (page) =>
  element(footerOf(page), ({ name, attrs }) => name === 'a' && attrs.get('href') === REPO_URL);

for (const page of ['index.html', 'methods.html']) {
  test(`${page} links the repository from its footer with a GitHub icon`, () => {
    const link = repoLink(page);
    assert.ok(link, `no <a href="${REPO_URL}"> in the footer`);
    const svg = element(link, ({ name }) => name === 'svg');
    assert.ok(svg, 'the link has no <svg>');
    const [svgTag] = tags(svg);
    assert.equal(svgTag.attrs.get('aria-hidden'), 'true');
    assert.equal(svgTag.attrs.get('focusable'), 'false');
    assert.equal(svgTag.attrs.get('fill'), 'currentColor');
    // The svg is hidden, so the link's text is its name.
    const [anchor] = tags(link);
    const name = anchor.attrs.get('aria-label') || text(link.replace(svg, '')).trim();
    assert.ok(name, 'the link has no accessible name');
    assert.equal(anchor.attrs.get('title'), name);
  });
}

test('both pages carry the same repository link', () => {
  assert.ok(repoLink('index.html'), 'index.html has no repository link');
  assert.equal(repoLink('methods.html'), repoLink('index.html'));
});

test('the Octicons licence and the icon source ship in site/icons', () => {
  for (const name of ['LICENSE-octicons.txt', 'SOURCES.md']) {
    assert.ok(existsSync(fileURLToPath(new URL(name, ICONS))), `${name} missing`);
  }
  assert.match(read(new URL('LICENSE-octicons.txt', ICONS)), /^MIT License\b/);
  assert.match(
    read(new URL('SOURCES.md', ICONS)),
    /https:\/\/raw\.githubusercontent\.com\/primer\/octicons\/\S+\/mark-github-24\.svg/,
  );
});

// The methods page

const methods = () => read(new URL('methods.html', SITE));

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

// The page's text with markup removed and entities decoded; every run of
// whitespace, no-break spaces included, reads as one space.
function text(html) {
  return withoutComments(html)
    .replace(TAG, '')
    .replace(/<\/[^>]*>/g, '')
    .replace(/&(?:#(\d+)|#x([\da-f]+)|(\w+));/gi, (entity, dec, hex, name) => {
      if (dec) {
        return String.fromCodePoint(Number(dec));
      }
      if (hex) {
        return String.fromCodePoint(parseInt(hex, 16));
      }
      return ENTITIES[name] ?? entity;
    })
    .replace(/\s+/g, ' ');
}

const MATHML_CORE = new Set([
  'math',
  'mrow',
  'mi',
  'mn',
  'mo',
  'ms',
  'mtext',
  'mspace',
  'msup',
  'msub',
  'msubsup',
  'mfrac',
  'msqrt',
  'mroot',
  'mover',
  'munder',
  'munderover',
  'mmultiscripts',
  'mprescripts',
  'none',
  'mtable',
  'mtr',
  'mtd',
  'mpadded',
  'mphantom',
  'mstyle',
  'merror',
  'semantics',
  'annotation',
  'annotation-xml',
]);

test('methods.html has its sections in order', () => {
  const ids = tags(methods())
    .filter((tag) => tag.name === 'section')
    .map((tag) => tag.attrs.get('id'));
  assert.deepEqual(ids, [
    'assumptions',
    'atmosphere',
    'model',
    'calibration',
    'display',
    'validation',
    'limitations',
    'sources',
  ]);
});

test('methods.html states the assumptions, limitations and caveats', () => {
  const content = text(methods());
  for (const phrase of [
    '25 °C',
    'dry air',
    'barometer',
    'launch elevation',
    'one 1976 ball',
    'about 1 yd',
    'indicative',
    '3.5 % to 174 %',
    'contrast',
    'Kensrud (2010)',
  ]) {
    assert.ok(content.includes(phrase), `missing "${phrase}"`);
  }
});

// Chromium renders MathML Core only; anything else shows as plain text.
test('methods.html writes its equations in MathML Core', () => {
  const blocks = [...withoutComments(methods()).matchAll(/<math\b[\s\S]*?<\/math\s*>/gi)];
  assert.ok(blocks.length > 0, 'no <math> elements');
  for (const [block] of blocks) {
    for (const { name } of tags(block)) {
      assert.ok(MATHML_CORE.has(name), `<${name}> is not MathML Core`);
    }
  }
});

test('methods.html links the main page and cites Penner by DOI', () => {
  const html = methods();
  assert.ok(
    tags(html).some((tag) => tag.name === 'a' && tag.attrs.get('href') === 'index.html'),
    'no link to index.html',
  );
  assert.ok(text(html).includes('10.1119/1.1344164'), 'no Penner DOI');
});

test('methods.html lists the data source and every oracle source under Sources', () => {
  const section = methods().match(/<section\b[^>]*\bid="sources"[^>]*>([\s\S]*?)<\/section>/);
  assert.ok(section, 'no #sources section');
  const linked = new Set(
    tags(section[1])
      .filter((tag) => tag.name === 'a')
      .map((tag) => tag.attrs.get('href')),
  );
  const urls = new Set([SOURCE_URL, ...ORACLES.flatMap(({ sources }) => sources.map(({ url }) => url))]);
  for (const url of urls) {
    assert.ok(linked.has(url), `Sources does not link ${url}`);
  }
});

// An overflowing equation or table must be scrollable from the keyboard.
test('methods.html makes every scroller a focusable, named region', () => {
  const scrollers = tags(methods()).filter((tag) =>
    (tag.attrs.get('class') ?? '').split(/\s+/).some((name) => name === 'eq' || name === 'scroller'),
  );
  assert.ok(scrollers.length > 0, 'no scrollers');
  for (const { name, attrs } of scrollers) {
    const what = `<${name} class="${attrs.get('class')}">`;
    assert.equal(attrs.get('tabindex'), '0', `${what} tabindex`);
    assert.equal(attrs.get('role'), 'region', `${what} role`);
    assert.ok(attrs.get('aria-label') || attrs.get('aria-labelledby'), `${what} has no name`);
  }
});

// boot.js reports a failed load through these two ids.
test('methods.html carries the boot contract and both live tables', () => {
  const html = methods();
  const entry = byId(html, 'app-module');
  assert.equal(entry?.name, 'script');
  assert.equal(entry.attrs.get('type'), 'module');
  const loadError = byId(html, 'load-error');
  assert.ok(loadError?.attrs.has('hidden'), '#load-error is missing or not hidden');
  for (const id of ['calibration-table', 'validation-table', 'version']) {
    assert.ok(byId(html, id), `no #${id}`);
  }
});
