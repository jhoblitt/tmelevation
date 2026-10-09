import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SOURCE_URL, TOURS } from '../../site/js/data.js';

const read = (relative) => readFileSync(new URL(relative, import.meta.url), 'utf8');

const transcription = read('../../docs/research/trackman-2023-tour-averages.md');
const dataSource = read('../../site/js/data.js');

function number(cell) {
  const value = Number(cell);
  assert.ok(Number.isFinite(value), `not a number: "${cell}"`);
  return value;
}

function pair(cell) {
  const [yd, m] = cell.split('/').map(number);
  return { yd, m };
}

function parseRow(line) {
  const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
  assert.equal(cells.length, 10, `expected 10 cells in: ${line}`);
  return {
    club: cells[0],
    clubSpeed: number(cells[1]),
    attack: number(cells[2]),
    ballSpeed: number(cells[3]),
    smash: number(cells[4]),
    launch: number(cells[5]),
    spin: number(cells[6]),
    maxHeight: pair(cells[7]),
    land: number(cells[8]),
    carry: pair(cells[9]),
  };
}

// The first table row is the header and the second the alignment rule.
function parseTable(section) {
  const lines = section.split('\n').filter((line) => line.startsWith('|'));
  return lines.slice(2).map(parseRow);
}

function transcribed(title) {
  const section = transcription
    .split(/^## /m)
    .find((candidate) => candidate.startsWith(title));
  assert.ok(section, `no "${title}" section in the transcription`);
  return parseTable(section);
}

const expected = { pga: transcribed('PGA TOUR'), lpga: transcribed('LPGA TOUR') };
const tour = (id) => TOURS.find((candidate) => candidate.id === id);

test('SOURCE_URL is the article the transcription cites', () => {
  assert.equal(SOURCE_URL, 'https://www.trackman.com/blog/introducing-updated-tour-averages');
  assert.ok(transcription.includes(SOURCE_URL));
});

test('TOURS lists the PGA tour then the LPGA tour for 2023', () => {
  assert.deepEqual(
    TOURS.map(({ id, label, title, year }) => ({ id, label, title, year })),
    [
      { id: 'pga', label: 'PGA TOUR', title: 'PGA TOUR AVERAGES', year: 2023 },
      { id: 'lpga', label: 'LPGA TOUR', title: 'LPGA TOUR AVERAGES', year: 2023 },
    ],
  );
});

for (const id of ['pga', 'lpga']) {
  test(`${id} rows match the transcription cell for cell`, () => {
    const { rows } = tour(id);
    assert.equal(rows.length, expected[id].length);
    rows.forEach((row, index) => {
      assert.deepEqual(row, expected[id][index], `${id} ${expected[id][index].club}`);
    });
  });
}

test('PGA has 12 rows from Driver to PW and LPGA has 11 without a 3 Iron', () => {
  const pga = tour('pga').rows.map((row) => row.club);
  const lpga = tour('lpga').rows.map((row) => row.club);
  assert.deepEqual(pga, [
    'Driver', '3-wood', '5-wood', 'Hybrid', '3 Iron', '4 Iron',
    '5 Iron', '6 Iron', '7 Iron', '8 Iron', '9 Iron', 'PW',
  ]);
  assert.deepEqual(lpga, pga.filter((club) => club !== '3 Iron'));
});

test('metres are stored as published, not derived from yards', () => {
  const fourIron = tour('pga').rows.find((row) => row.club === '4 Iron');
  assert.deepEqual(fourIron.carry, { yd: 209, m: 192 });
});

test('data.js opens with the data notice naming the source and the licence', () => {
  const header = dataSource.slice(0, dataSource.indexOf('\nexport '));
  assert.match(header, /^\s*(\/\/|\/\*)/);
  assert.ok(header.includes("TrackMan's 2023 Tour Averages"));
  assert.ok(header.includes(SOURCE_URL));
  assert.match(header, /not covered by .*Apache-2\.0 licen[cs]e/s);
});
