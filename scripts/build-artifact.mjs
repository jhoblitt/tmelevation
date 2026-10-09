// Builds the deploy artifact: node scripts/build-artifact.mjs <version> <outDir>
//
// Copies site/ to <outDir>, writes the release tag into js/version.js, and
// appends ?v=<version> to every relative module specifier, script, link and
// stylesheet url(). Pages serves everything with max-age=600, so without the
// query a returning visitor's cache could mix two releases' modules.
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const SITE = fileURLToPath(new URL('../site/', import.meta.url));
const RELEASE = /^v\d+\.\d+\.\d+$/;

// Over code with its literals blanked: the static import and re-export
// forms, which are the only ones the global constraints allow, up to the
// specifier's opening quote; and every import keyword except import.meta,
// each of which must start one of those forms.
const STATIC_IMPORT =
  /(?<![\w$.])(?:import\s*(?:[\w$]+\s*,\s*)?(?:\{[^}]*\}|\*\s*as\s+[\w$]+|[\w$]+)|export\s*(?:\*(?:\s*as\s+[\w$]+)?|\{[^}]*\}))\s*from\s*(['"])/g;
const IMPORT_KEYWORD = /(?<![\w$.])import(?![\w$])(?!\s*\.)/g;
const TAG = /<(?:script|link)\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const TAG_URL = /(\s(?:src|href)\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/gi;
const CSS_URL = /url\(\s*(['"]?)(.*?)\1\s*\)/g;

// A slash after one of these, or after one of the keywords, starts a
// regular expression rather than a division.
const BEFORE_REGEX = new Set('(,=:[!&|?{};+-*%<>~^');
const KEYWORD_BEFORE_REGEX =
  /(?:^|[^\w$])(?:return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)$/;

function stringEnd(source, start) {
  const quote = source[start];
  for (let i = start + 1; i < source.length; i += 1) {
    if (source[i] === '\\') {
      i += 1;
    } else if (source[i] === quote || source[i] === '\n') {
      return i + 1;
    }
  }
  return source.length;
}

function regexEnd(source, start) {
  let inClass = false;
  for (let i = start + 1; i < source.length; i += 1) {
    const c = source[i];
    if (c === '\\') {
      i += 1;
    } else if (c === '[') {
      inClass = true;
    } else if (c === ']') {
      inClass = false;
    } else if (c === '\n') {
      return i;
    } else if (c === '/' && !inClass) {
      let end = i + 1;
      while (/[a-z]/i.test(source[end] ?? '')) {
        end += 1;
      }
      return end;
    }
  }
  return source.length;
}

// The source with the inside of every comment, string, template and regular
// expression literal blanked, so a pattern over it matches code only. Quotes
// stay and offsets do not move, so a match locates the original text.
export function codeOnly(source) {
  const out = source.split('');
  const blank = (from, to) => {
    for (let i = from; i < to; i += 1) {
      if (out[i] !== '\n') {
        out[i] = ' ';
      }
    }
  };
  const regexAllowed = (at) => {
    let i = at - 1;
    while (i >= 0 && /\s/.test(out[i])) {
      i -= 1;
    }
    if (i < 0 || BEFORE_REGEX.has(out[i])) {
      return true;
    }
    return KEYWORD_BEFORE_REGEX.test(out.slice(Math.max(0, i - 11), i + 1).join(''));
  };
  // Scans code from start; inside a template's ${…} it stops at the closing
  // brace and returns its offset.
  const scan = (start, inExpression) => {
    let depth = 0;
    let i = start;
    while (i < source.length) {
      const c = source[i];
      const next = source[i + 1];
      let end = -1;
      if (c === '/' && next === '/') {
        end = source.indexOf('\n', i);
        end = end === -1 ? source.length : end;
        blank(i, end);
      } else if (c === '/' && next === '*') {
        end = source.indexOf('*/', i + 2);
        end = end === -1 ? source.length : end + 2;
        blank(i, end);
      } else if (c === "'" || c === '"') {
        end = stringEnd(source, i);
        blank(i + 1, end - 1);
      } else if (c === '`') {
        end = templateEnd(i);
        blank(i + 1, end - 1);
      } else if (c === '/' && regexAllowed(i)) {
        end = regexEnd(source, i);
        blank(i + 1, end);
      } else if (inExpression && c === '{') {
        depth += 1;
      } else if (inExpression && c === '}') {
        if (depth === 0) {
          return i;
        }
        depth -= 1;
      }
      i = end === -1 ? i + 1 : end;
    }
    return i;
  };
  const templateEnd = (start) => {
    for (let i = start + 1; i < source.length; i += 1) {
      if (source[i] === '\\') {
        i += 1;
      } else if (source[i] === '`') {
        return i + 1;
      } else if (source[i] === '$' && source[i + 1] === '{') {
        i = scan(i + 2, true);
      }
    }
    return source.length;
  };
  scan(0, false);
  return out.join('');
}

const isRelative = (ref) => !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(ref);

function stampRef(ref, version, refs) {
  if (!isRelative(ref)) {
    return ref;
  }
  if (/[?#]/.test(ref)) {
    throw new Error(`${ref} already has a query or fragment`);
  }
  refs.push(ref);
  return `${ref}?v=${version}`;
}

// Each stamper returns the new text and the relative references it stamped.

export function versionModule(source, version) {
  const code = codeOnly(source);
  const statements = [...code.matchAll(STATIC_IMPORT)];
  const starts = new Set(statements.map(({ index }) => index));
  for (const { index } of code.matchAll(IMPORT_KEYWORD)) {
    if (!starts.has(index)) {
      throw new Error('a dynamic or side-effect-only import cannot be versioned');
    }
  }
  const refs = [];
  let text = source;
  for (const match of statements.reverse()) {
    const from = match.index + match[0].length;
    const to = code.indexOf(match[1], from);
    const specifier = stampRef(source.slice(from, to), version, refs);
    text = text.slice(0, from) + specifier + text.slice(to);
  }
  return { text, refs: refs.reverse() };
}

function versionHtml(source, version) {
  const refs = [];
  const text = source.replace(TAG, (tag) =>
    tag.replace(TAG_URL, (_, head, double, single, bare) => {
      if (double !== undefined) {
        return `${head}"${stampRef(double, version, refs)}"`;
      }
      if (single !== undefined) {
        return `${head}'${stampRef(single, version, refs)}'`;
      }
      return `${head}${stampRef(bare, version, refs)}`;
    }),
  );
  return { text, refs };
}

function versionCss(source, version) {
  const refs = [];
  const text = source.replace(
    CSS_URL,
    (_, quote, ref) => `url(${quote}${stampRef(ref, version, refs)}${quote})`,
  );
  return { text, refs };
}

const VERSIONERS = { '.js': versionModule, '.html': versionHtml, '.css': versionCss };

function within(parent, path) {
  const rel = relative(parent, path);
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${sep}`));
}

// Every stamped reference must name a file of the artifact, so a stamp in
// the wrong place fails the build instead of shipping a broken URL. A
// failed build leaves outDir as it found it.
export function build(version, outDir, site = SITE) {
  const existed = existsSync(outDir);
  try {
    cpSync(site, outDir, { recursive: true });
    writeFileSync(join(outDir, 'js', 'version.js'), `export const VERSION = '${version}';\n`);
    for (const name of readdirSync(outDir, { recursive: true })) {
      const versioner = VERSIONERS[extname(name)];
      if (versioner === undefined) {
        continue;
      }
      const path = join(outDir, name);
      let result;
      try {
        result = versioner(readFileSync(path, 'utf8'), version);
      } catch (error) {
        throw new Error(`${name}: ${error.message}`);
      }
      for (const ref of result.refs) {
        const target = ref.startsWith('/') ? join(outDir, ref) : resolve(dirname(path), ref);
        if (!within(outDir, target) || !existsSync(target)) {
          throw new Error(`${name}: ${ref} names no file of the artifact`);
        }
      }
      writeFileSync(path, result.text);
    }
  } catch (error) {
    rmSync(outDir, { recursive: true, force: true });
    if (existed) {
      mkdirSync(outDir);
    }
    throw error;
  }
}

function usage(message) {
  console.error(`build-artifact: ${message}`);
  console.error('usage: node scripts/build-artifact.mjs <vX.Y.Z> <outDir>');
  process.exit(2);
}

function main([version, outArg, ...extra]) {
  if (outArg === undefined || extra.length > 0) {
    usage('expected exactly two arguments');
  }
  if (!RELEASE.test(version)) {
    usage(`version ${JSON.stringify(version)} does not match vX.Y.Z`);
  }
  const outDir = resolve(outArg);
  if (within(SITE, outDir)) {
    usage(`${outDir} is inside site/`);
  }
  if (existsSync(outDir) && readdirSync(outDir).length > 0) {
    usage(`${outDir} exists and is not empty`);
  }
  try {
    build(version, outDir);
  } catch (error) {
    console.error(`build-artifact: ${error.message}`);
    process.exitCode = 1;
  }
}

// Imported by the unit test, run as a command by everything else.
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  main(process.argv.slice(2));
}
