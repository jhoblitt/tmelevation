import { calibrate } from './calibrate.js';
import { TOURS } from './data.js';
import { fly, launchFrom } from './flight.js';
import { M_PER_YD, radToDeg } from './units.js';

export function launchOfRow(row) {
  return launchFrom({ ballSpeedMph: row.ballSpeed, launchDeg: row.launch, spinRpm: row.spin });
}

// Targets the published yards; the metres column, which TrackMan rounded
// separately, is not used.
export function calibrateRow(row) {
  return calibrate(launchOfRow(row), {
    carryM: row.carry.yd * M_PER_YD,
    maxHeightM: row.maxHeight.yd * M_PER_YD,
  });
}

// The model's change from sea level at density ratio rhoRatio, measured
// against the sea-level flight the calibration already flew.
export function rowDelta(cal, row, rhoRatio) {
  // Ahead of the sea-level answer, so a row without factors never reports a
  // valid-looking zero; fly would otherwise default the missing factors to 1.
  if (!cal?.ok) {
    return { ok: false, reason: 'calibration', steps: 0 };
  }
  if (rhoRatio === 1) {
    return { ok: true, carryYd: 0, maxHeightYd: 0, landDeg: 0, steps: 0 };
  }
  const flight = fly(launchOfRow(row), { kD: cal.kD, kL: cal.kL }, { rhoRatio });
  if (!flight.ok) {
    return { ok: false, reason: flight.reason, steps: flight.steps };
  }
  const { sea } = cal;
  return {
    ok: true,
    carryYd: (flight.carryM - sea.carryM) / M_PER_YD,
    maxHeightYd: (flight.maxHeightM - sea.maxHeightM) / M_PER_YD,
    landDeg: radToDeg(flight.landRad - sea.landRad),
    steps: flight.steps,
  };
}

export function createModel(tours = TOURS) {
  const entries = tours.flatMap((tour) =>
    tour.rows.map((row, index) => ({
      key: `${tour.id}:${index}`,
      tourId: tour.id,
      index,
      row,
      status: 'pending',
      cal: null,
    })),
  );
  // One slot per entry, holding the last ratio asked for: the page asks for
  // one ratio at a time, and keeping every ratio would grow with each slider
  // position.
  const memo = entries.map(() => null);
  let calibrated = 0;
  let steps = 0;

  function calibrateNext() {
    if (calibrated === entries.length) {
      return false;
    }
    const entry = entries[calibrated];
    calibrated += 1;
    entry.cal = calibrateRow(entry.row);
    entry.status = entry.cal.ok ? 'ready' : 'failed';
    steps += entry.cal.steps;
    return true;
  }

  function deltaOf(i, rhoRatio) {
    const slot = memo[i];
    if (slot !== null && slot.rhoRatio === rhoRatio) {
      return slot.delta;
    }
    const { cal, row } = entries[i];
    const delta = rowDelta(cal, row, rhoRatio);
    steps += delta.steps;
    memo[i] = { rhoRatio, delta };
    return delta;
  }

  // Built afresh on every call, so a row calibrated since the last call gets
  // its delta instead of staying pending.
  function deltasAt(rhoRatio) {
    return new Map(
      entries.map((entry, i) => [
        entry.key,
        { status: entry.status, delta: entry.status === 'ready' ? deltaOf(i, rhoRatio) : null },
      ]),
    );
  }

  return {
    entries,
    calibrateNext,
    isComplete: () => calibrated === entries.length,
    deltasAt,
    stepsUsed: () => steps,
  };
}
