import { M_PER_YD } from './units.js';

export const MINUS = '−';
export const ELLIPSIS = '…';
export const EM_DASH = '—';

const PLUS_MINUS = '±';
const NO_CHANGE = 'no change versus sea level';

// Half away from zero, so a negative tie does not round towards zero as
// Math.round does.
function round(x) {
  return x < 0 ? -Math.round(-x) : Math.round(x);
}

// The six launch columns are fixed at impact and print as TrackMan prints them.
export function launchCells(row) {
  return {
    clubSpeed: String(row.clubSpeed),
    attack: `${row.attack.toFixed(1)}°`,
    ballSpeed: String(row.ballSpeed),
    smash: row.smash.toFixed(2),
    launch: `${row.launch.toFixed(1)}°`,
    spin: String(row.spin),
  };
}

export function rowStatus(entryStatus, delta) {
  if (entryStatus === 'pending') {
    return 'pending';
  }
  if (entryStatus === 'failed' || delta?.ok === false) {
    return 'failed';
  }
  return 'ready';
}

// A hidden delta line and the two non-ready states show the published value;
// `ready` runs only when there is a modelled change to present.
function cell(opts, published, ready) {
  if (!opts.showDelta) {
    return { value: published, delta: '', deltaHidden: true, a11y: '' };
  }
  if (opts.status === 'pending') {
    return { value: published, delta: ELLIPSIS, deltaHidden: false, a11y: 'calculating' };
  }
  if (opts.status === 'failed') {
    return {
      value: published,
      delta: EM_DASH,
      deltaHidden: false,
      a11y: 'model unavailable for this row',
    };
  }
  return { ...ready(), deltaHidden: false };
}

function signed(n) {
  if (n > 0) {
    return `+${n}`;
  }
  return n < 0 ? `${MINUS}${-n}` : `${PLUS_MINUS}0`;
}

function spoken(n, unit) {
  if (n === 0) {
    return `no change in ${unit}s`;
  }
  const size = Math.abs(n);
  return `${n > 0 ? 'plus' : 'minus'} ${size} ${unit}${size === 1 ? '' : 's'}`;
}

// The change is the unrounded model change, not a difference of displayed
// values, so this can read zero where the absolute delta does not, and the
// reverse.
function percentChange(change, published) {
  const tenths = round((change * 1000) / published);
  if (tenths === 0) {
    return { delta: `${PLUS_MINUS}0.0%`, a11y: NO_CHANGE };
  }
  const size = (Math.abs(tenths) / 10).toFixed(1);
  return {
    delta: `${tenths > 0 ? '+' : MINUS}${size}%`,
    a11y: `${tenths > 0 ? 'plus' : 'minus'} ${size} percent versus sea level`,
  };
}

// dYd is the modelled change in yards; each unit is rounded on its own, so
// the published pairs (209/192) stay exact at sea level.
export function distanceCell({ yd, m }, dYd, opts) {
  return cell(opts, `${yd}/${m}`, () => {
    const shownYd = round(yd + dYd);
    const shownM = round(m + dYd * M_PER_YD);
    const value = `${shownYd}/${shownM}`;
    if (opts.mode === 'pct') {
      return { value, ...percentChange(dYd, yd) };
    }
    const yards = shownYd - yd;
    const metres = shownM - m;
    return {
      value,
      delta: `${signed(yards)}/${signed(metres)}`,
      a11y:
        yards === 0 && metres === 0
          ? NO_CHANGE
          : `${spoken(yards, 'yard')}, ${spoken(metres, 'metre')} versus sea level`,
    };
  });
}

export function angleCell(deg, dDeg, opts) {
  return cell(opts, `${deg}°`, () => {
    const shown = round(deg + dDeg);
    const value = `${shown}°`;
    if (opts.mode === 'pct') {
      return { value, ...percentChange(dDeg, deg) };
    }
    const change = shown - deg;
    return {
      value,
      delta: `${signed(change)}°`,
      a11y: change === 0 ? NO_CHANGE : `${spoken(change, 'degree')} versus sea level`,
    };
  });
}
