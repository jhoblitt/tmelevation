import { test } from 'node:test';
import assert from 'node:assert/strict';
import { statSync } from 'node:fs';

// semantic-release's exec plugin runs the script by path, so a checkout that
// lost the executable bit fails the release after the version is computed.
test('release-notes.sh is executable', () => {
  const { mode } = statSync(new URL('../../.github/scripts/release-notes.sh', import.meta.url));
  assert.equal(mode & 0o111, 0o111, `mode is ${(mode & 0o777).toString(8)}`);
});
