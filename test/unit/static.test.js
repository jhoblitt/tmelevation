import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SOURCE_URL } from '../../site/js/data.js';

const SITE = new URL('../../site/', import.meta.url);
const JS = new URL('js/', SITE);
const FONTS = new URL('fonts/', SITE);

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
