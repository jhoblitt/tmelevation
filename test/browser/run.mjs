// npm run test:browser: builds a v0.0.0 and a v1.2.3 artifact, smoke-tests
// each against its own version, then runs the end-to-end tests. Every step
// runs even after a failure; the exit status is non-zero if any failed.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = (path) => fileURLToPath(new URL(path, import.meta.url));
const BUILDER = script('../../scripts/build-artifact.mjs');
const SMOKE = script('./smoke.mjs');
const E2E = script('./e2e.mjs');

const node = (...args) => spawnSync(process.execPath, args, { stdio: 'inherit' }).status === 0;

const work = mkdtempSync(join(tmpdir(), 'tmelevation-browser-'));
const results = [];
try {
  for (const version of ['v0.0.0', 'v1.2.3']) {
    const dir = join(work, version);
    results.push([
      `smoke ${version}`,
      node(BUILDER, version, dir) && node(SMOKE, dir, '--expect-version', version),
    ]);
  }
  results.push(['e2e', node(E2E)]);
} finally {
  rmSync(work, { recursive: true, force: true });
}
for (const [name, ok] of results) {
  console.log(`${ok ? 'ok' : 'not ok'} - ${name}`);
}
process.exitCode = results.every(([, ok]) => ok) ? 0 : 1;
