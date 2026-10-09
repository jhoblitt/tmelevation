// Prints every reference oracle's result. Fails only on a hard oracle; a
// failing soft oracle is a warning, raised as a GitHub annotation in CI.
import {
  createOracleContext,
  evaluateOracles,
  formatAnnotation,
  formatBand,
} from '../site/js/oracles.js';

const results = evaluateOracles(createOracleContext());

function verdict({ oracle, pass }) {
  if (pass) {
    return 'PASS';
  }
  return oracle.kind === 'hard' ? 'FAIL' : 'WARN';
}

const table = [
  ['id', 'kind', 'value', 'band', 'result'],
  ...results.map((result) => [
    result.oracle.id,
    result.oracle.kind,
    result.display,
    result.oracle.band === null ? result.oracle.expected : formatBand(result.oracle.band),
    verdict(result),
  ]),
];
const widths = table[0].map((_, column) => Math.max(...table.map((row) => row[column].length)));
for (const row of table) {
  console.log(
    row
      .map((cell, column) => (column === row.length - 1 ? cell : cell.padEnd(widths[column])))
      .join('  '),
  );
}

if (process.env.GITHUB_ACTIONS === 'true') {
  for (const result of results) {
    if (result.oracle.kind === 'soft' && !result.pass) {
      console.log(formatAnnotation(result));
    }
  }
}

if (results.some(({ oracle, pass }) => oracle.kind === 'hard' && !pass)) {
  process.exitCode = 1;
}
