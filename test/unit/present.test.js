import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { TOURS } from '../../site/js/data.js';
import {
  ELLIPSIS,
  EM_DASH,
  MINUS,
  angleCell,
  distanceCell,
  launchCells,
  rowStatus,
} from '../../site/js/present.js';

const transcription = readFileSync(
  new URL('../../docs/research/trackman-2023-tour-averages.md', import.meta.url),
  'utf8',
);

// The published text of the six launch columns, cell by cell, exactly as printed.
function transcribedRows(title) {
  const section = transcription.split(/^## /m).find((candidate) => candidate.startsWith(title));
  assert.ok(section, `no "${title}" section in the transcription`);
  return section
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .slice(2)
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
}

const tour = (id) => TOURS.find((candidate) => candidate.id === id);
const pgaRow = (club) => tour('pga').rows.find((row) => row.club === club);

const opts = (overrides = {}) => ({
  mode: 'abs',
  showDelta: true,
  status: 'ready',
  label: 'carry',
  ...overrides,
});
const pct = (overrides = {}) => opts({ mode: 'pct', ...overrides });

test('the delta glyphs are the characters the spec names', () => {
  assert.equal(MINUS, '−');
  assert.equal(ELLIPSIS, '…');
  assert.equal(EM_DASH, '—');
});

test('launchCells prints every launch column of both tours as TrackMan does', () => {
  for (const { id } of TOURS) {
    const published = transcribedRows(id === 'pga' ? 'PGA TOUR' : 'LPGA TOUR');
    const { rows } = tour(id);
    assert.equal(rows.length, published.length);
    rows.forEach((row, index) => {
      const cells = published[index];
      assert.equal(row.club, cells[0]);
      assert.deepEqual(
        launchCells(row),
        {
          clubSpeed: cells[1],
          attack: `${cells[2]}°`,
          ballSpeed: cells[3],
          smash: cells[4],
          launch: `${cells[5]}°`,
          spin: cells[6],
        },
        `${id} ${row.club}`,
      );
    });
  }
});

test('launchCells keeps the hyphen-minus, trailing zeros and unseparated spin', () => {
  assert.deepEqual(launchCells(pgaRow('Driver')), {
    clubSpeed: '115',
    attack: '-0.9°',
    ballSpeed: '171',
    smash: '1.49',
    launch: '10.4°',
    spin: '2545',
  });
  assert.equal(launchCells(pgaRow('6 Iron')).launch, '14.0°');
  assert.equal(launchCells(pgaRow('9 Iron')).launch, '20.0°');
  assert.equal(launchCells(tour('lpga').rows[9]).smash, '1.30');
  assert.equal(launchCells(tour('lpga').rows[0]).attack, '2.8°');
});

test('at sea level every cell is the published value with no delta line', () => {
  for (const mode of ['abs', 'pct']) {
    const hidden = (label) => opts({ mode, showDelta: false, label });
    for (const { rows } of TOURS) {
      for (const row of rows) {
        const expected = { delta: '', deltaHidden: true, a11y: '' };
        assert.deepEqual(distanceCell(row.carry, 0, hidden('carry')), {
          value: `${row.carry.yd}/${row.carry.m}`,
          ...expected,
        });
        assert.deepEqual(distanceCell(row.maxHeight, 0, hidden('max height')), {
          value: `${row.maxHeight.yd}/${row.maxHeight.m}`,
          ...expected,
        });
        assert.deepEqual(angleCell(row.land, 0, hidden('land angle')), {
          value: `${row.land}°`,
          ...expected,
        });
      }
    }
  }
  assert.equal(distanceCell(pgaRow('4 Iron').carry, 0, opts({ showDelta: false })).value, '209/192');
  assert.equal(
    distanceCell(tour('lpga').rows[10].carry, 0, opts({ showDelta: false })).value,
    '111/101',
  );
  assert.equal(angleCell(39, 0, opts({ showDelta: false, label: 'land angle' })).value, '39°');
});

test('a hidden delta line wins over a pending or failed status', () => {
  for (const status of ['pending', 'failed']) {
    assert.deepEqual(distanceCell({ yd: 164, m: 150 }, 0, opts({ showDelta: false, status })), {
      value: '164/150',
      delta: '',
      deltaHidden: true,
      a11y: '',
    });
  }
});

test('absolute carry: PGA 8 Iron at +7.6 yd shows 172/157 over +8/+7', () => {
  assert.deepEqual(distanceCell(pgaRow('8 Iron').carry, 7.6, opts()), {
    value: '172/157',
    delta: '+8/+7',
    deltaHidden: false,
    a11y: 'plus 8 yards, plus 7 metres versus sea level',
  });
});

test('absolute max height: a fall shows U+2212 and singular units', () => {
  assert.deepEqual(distanceCell({ yd: 33, m: 30 }, -1.1, opts({ label: 'max height' })), {
    value: '32/29',
    delta: '−1/−1',
    deltaHidden: false,
    a11y: 'minus 1 yard, minus 1 metre versus sea level',
  });
});

test('absolute distance: each unit is rounded on its own', () => {
  // 209 + 0.5 rounds up in yards; 192 + 0.5 * 0.9144 = 192.46 does not in metres.
  assert.deepEqual(distanceCell({ yd: 209, m: 192 }, 0.5, opts()), {
    value: '210/192',
    delta: '+1/±0',
    deltaHidden: false,
    a11y: 'plus 1 yard, no change in metres versus sea level',
  });
  // Past 0.547 yd the metre change rounds up as well, so the two units agree again.
  assert.equal(distanceCell({ yd: 209, m: 192 }, 0.6, opts()).value, '210/193');
  assert.equal(distanceCell({ yd: 209, m: 192 }, 0.6, opts()).delta, '+1/+1');
  // A rounded half stays put in yards (208.5 -> 209) and in metres (191.54 -> 192).
  assert.equal(distanceCell({ yd: 209, m: 192 }, -0.5, opts()).delta, '\u00b10/\u00b10');
  assert.equal(distanceCell({ yd: 209, m: 192 }, -0.6, opts()).delta, '\u22121/\u22121');
});

test('absolute distance: a change that rounds to nothing is no change in both units', () => {
  assert.deepEqual(distanceCell({ yd: 164, m: 150 }, 0.3, opts()), {
    value: '164/150',
    delta: '±0/±0',
    deltaHidden: false,
    a11y: 'no change versus sea level',
  });
});

test('absolute distance: a delta of exactly zero reads as no change', () => {
  const cell = distanceCell({ yd: 164, m: 150 }, 0, opts());
  assert.equal(cell.value, '164/150');
  assert.equal(cell.delta, '±0/±0');
  assert.equal(cell.deltaHidden, false);
  assert.equal(cell.a11y, 'no change versus sea level');
});

test('absolute distance: plural and mixed-sign accessible text', () => {
  assert.equal(
    distanceCell({ yd: 282, m: 258 }, -2.6, opts()).a11y,
    'minus 3 yards, minus 2 metres versus sea level',
  );
  assert.equal(
    distanceCell({ yd: 282, m: 258 }, 17.28, opts()).a11y,
    'plus 17 yards, plus 16 metres versus sea level',
  );
});

test('absolute angle: 51 degrees at -4.1 shows 47 over U+2212 4', () => {
  assert.deepEqual(angleCell(51, -4.1, opts({ label: 'land angle' })), {
    value: '47°',
    delta: '−4°',
    deltaHidden: false,
    a11y: 'minus 4 degrees versus sea level',
  });
});

test('absolute angle: a small change is shown as plus-minus zero', () => {
  assert.deepEqual(angleCell(51, 0.4, opts({ label: 'land angle' })), {
    value: '51°',
    delta: '±0°',
    deltaHidden: false,
    a11y: 'no change versus sea level',
  });
});

test('absolute angle: a rise and the singular degree', () => {
  const rise = angleCell(36, 1.2, opts({ label: 'land angle' }));
  assert.equal(rise.value, '37°');
  assert.equal(rise.delta, '+1°');
  assert.equal(rise.a11y, 'plus 1 degree versus sea level');
  assert.equal(angleCell(36, 2.6, opts()).a11y, 'plus 3 degrees versus sea level');
});

test('percent: carry change is the yard change over the published yards', () => {
  assert.deepEqual(distanceCell({ yd: 164, m: 150 }, 8.036, pct()), {
    value: '172/157',
    delta: '+4.9%',
    deltaHidden: false,
    a11y: 'plus 4.9 percent versus sea level',
  });
});

test('percent: a change under 0.05 percent is plus-minus 0.0, never minus 0.0', () => {
  const cell = distanceCell({ yd: 164, m: 150 }, -0.04, pct());
  assert.equal(cell.delta, '±0.0%');
  assert.equal(cell.a11y, 'no change versus sea level');
  assert.equal(cell.value, '164/150');
  assert.equal(distanceCell({ yd: 164, m: 150 }, 0, pct()).delta, '±0.0%');
  assert.equal(angleCell(39, -0.0001, pct()).delta, '±0.0%');
  assert.ok(!distanceCell({ yd: 164, m: 150 }, -0.04, pct()).delta.includes('-'));
});

test('percent: land angle change is the degree change over the published degrees', () => {
  assert.deepEqual(angleCell(39, -3.78, pct({ label: 'land angle' })), {
    value: '35°',
    delta: '−9.7%',
    deltaHidden: false,
    a11y: 'minus 9.7 percent versus sea level',
  });
});

test('percent: ties round half away from zero', () => {
  // -2.5 / 200 = -1.25 % exactly, 2.5 / 200 = +1.25 % exactly.
  assert.equal(distanceCell({ yd: 200, m: 183 }, -2.5, pct()).delta, '−1.3%');
  assert.equal(distanceCell({ yd: 200, m: 183 }, 2.5, pct()).delta, '+1.3%');
  assert.equal(distanceCell({ yd: 200, m: 183 }, 2.5, pct()).a11y, 'plus 1.3 percent versus sea level');
  // 0.1 yd on 200 yd is exactly 0.05 %, a tie: away from zero is 0.1, not 0.0.
  assert.equal(distanceCell({ yd: 200, m: 183 }, 0.1, pct()).delta, '+0.1%');
  assert.equal(distanceCell({ yd: 200, m: 183 }, -0.1, pct()).delta, '−0.1%');
});

test('the two modes can disagree near zero, as the methods page says', () => {
  // 38.51 rounds back to 39, but -0.49 deg is -1.3 % of 39 deg.
  const flat = angleCell(39, -0.49, opts());
  assert.equal(flat.value, '39°');
  assert.equal(flat.delta, '\u00b10°');
  assert.equal(angleCell(39, -0.49, pct()).delta, '\u22121.3%');
  // 0.4 yd rounds away in both units, yet is +0.2 % of 164 yd.
  assert.equal(distanceCell({ yd: 164, m: 150 }, 0.4, opts()).delta, '\u00b10/\u00b10');
  assert.equal(distanceCell({ yd: 164, m: 150 }, 0.4, pct()).delta, '+0.2%');
});

test('a pending cell keeps the published value and shows an ellipsis', () => {
  for (const mode of ['abs', 'pct']) {
    assert.deepEqual(distanceCell({ yd: 164, m: 150 }, 0, opts({ mode, status: 'pending' })), {
      value: '164/150',
      delta: '…',
      deltaHidden: false,
      a11y: 'calculating',
    });
    assert.deepEqual(angleCell(51, 0, opts({ mode, status: 'pending' })), {
      value: '51°',
      delta: '…',
      deltaHidden: false,
      a11y: 'calculating',
    });
  }
});

test('a failed cell keeps the published value and shows an em dash', () => {
  for (const mode of ['abs', 'pct']) {
    assert.deepEqual(distanceCell({ yd: 164, m: 150 }, 0, opts({ mode, status: 'failed' })), {
      value: '164/150',
      delta: '—',
      deltaHidden: false,
      a11y: 'model unavailable for this row',
    });
    assert.deepEqual(angleCell(51, 0, opts({ mode, status: 'failed' })), {
      value: '51°',
      delta: '—',
      deltaHidden: false,
      a11y: 'model unavailable for this row',
    });
  }
});

test('a pending or failed cell ignores the delta it is handed', () => {
  assert.equal(distanceCell({ yd: 164, m: 150 }, 99, opts({ status: 'pending' })).value, '164/150');
  assert.equal(angleCell(51, 99, opts({ status: 'failed' })).value, '51°');
});

test('rowStatus maps the entry status and the delta to the cell status', () => {
  assert.equal(rowStatus('pending', null), 'pending');
  assert.equal(rowStatus('failed', null), 'failed');
  assert.equal(rowStatus('ready', { ok: false, reason: 'nonfinite', steps: 1 }), 'failed');
  assert.equal(
    rowStatus('ready', { ok: true, carryYd: 1, maxHeightYd: -1, landDeg: -1, steps: 10 }),
    'ready',
  );
});
