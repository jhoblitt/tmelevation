import { densityRatio, pressureAtElevation } from './atmosphere.js';
import { calibrate } from './calibrate.js';
import { fly, launchFrom } from './flight.js';
import { createModel } from './model.js';
import { MPS_PER_MPH, M_PER_FT, M_PER_YD, radToDeg } from './units.js';

const CARRY_TOLERANCE_YD = 5;
const LAND_TOLERANCE_DEG = 3;
const SUFFIX = { '%': '%', deg: '°', yd: ' yd' };

const SOURCE = {
  padjen: {
    label: 'PGA TOUR, "Elevated expectations" (Padjen/TrackMan, Aoyama), 2017-02-28',
    url: 'https://www.pgatour.com/article/news/long-form/2017/02/28/elevated-expectations-wgc-mexico-championship-altitude',
  },
  shih: {
    label:
      'PGA TOUR, Paul Hodowanic, "Altitude adjustment ... BMW Championship" (Shih/TrackMan), 2024-08-21',
    url: 'https://pgatour.com/article/news/latest/2024/08/21/altitude-adjustment-colorado-castle-pines-golf-club-elevation-challenge-bmw-championship',
  },
  normalization: {
    label: 'TrackMan blog, "Normalization feature explained", 2014-07-09',
    url: 'https://www.trackman.com/blog/golf/normalization-feature-explained',
  },
  vgAltitude: {
    label: 'TrackMan Support, "VG | Altitude in Course Play", 2026-06-15',
    url: 'https://support.trackmangolf.com/hc/en-us/articles/51714287935387-VG-Altitude-in-Course-Play',
  },
  golfDigest: {
    label:
      'Australian Golf Digest / Golf Digest, Luke Kerr-Dineen, "According to Trackman ... 6 percent at 1,500 metres", 2025-01-24',
    url: 'https://www.australiangolfdigest.com.au/pro-golfers-calculate-their-yardages-golf-course-strategy-game-plan-golf-digest/',
  },
  titleistPosts: {
    label:
      'Titleist / Steve Aoyama, "The Effect of Altitude on Golf Ball Performance" and "Golf Ball Aerodynamics and the Effect of Altitude" (titleist.* returned 403)',
    url: 'https://www.titleist.com/teamtitleist/b/tourblog/posts/the-effect-of-altitude-golf-ball-aerodynamics',
  },
  titleistLab: {
    label: 'Titleist Learning Lab, "Altitude and Ball Flight" (Wayback Machine copy; titleist.com returns 403)',
    url: 'http://web.archive.org/web/20260509230837/https://www.titleist.com/learning-lab/performance/altitude-and-golf-ball-flight',
  },
  golfwrx: {
    label: 'GolfWRX, Ryan Barath (verbatim Aoyama quotes), 2019-02-17',
    url: 'https://golfwrx.com/545618/tiger-woods-lofting-up-for-thin-air-examining-the-switch-and-what-happens-when-you-play-at-altitude/',
  },
  taylormade: {
    label:
      'TaylorMade Clubhouse, Mike Esse, "Seen on Tour: ... prepare for altitude at the BMW Championship", 2024-08-22',
    url: 'https://taylormadegolf.fr/clubhouse/801423-seen-on-tour-scottie-rory-collin-tommy-prepare-for-altitude-at-the-bmw-championship.html?lang=fr_FR',
  },
  penge: {
    label:
      'DP World Tour, "A numbers game - Players tackle altitude at Omega European Masters", 2026-09-02',
    url: 'https://app.europeantour.com/dpworld-tour/news/articles/detail/a-numbers-game-players-tackle-altitude-at-omega-european-masters/',
  },
  foresight: {
    label: 'Foresight Sports, "How Altitude Affects Golf Ball Distance", 2020-11-25',
    url: 'https://www.foresightsports.com/how-altitude-affects-golf-ball-distance',
  },
};

function cite(source, note) {
  return { ...source, note };
}

const PADJEN_DRIVER = cite(
  SOURCE.padjen,
  'Secondary: Justin Padjen (TrackMan), quoted by PGA TOUR before the 2017 WGC-Mexico: for a player with 113 mph club speed and 10.7° launch, carry 282 → 306 yd (+8.5%; the article rounds to 8%), apex 102 → 84 ft and land angle 38° → 29° at 7,800 ft. Ball speed, spin and temperature are not given, and that these are TrackMan model runs is inferred from "has run the numbers". Applied by analogy to the 2023 row (115 mph club speed, 10.4°, 171 mph, 2545 rpm).',
);

const PENGE_CRANS = cite(
  SOURCE.penge,
  'Secondary: Marco Penge\'s launch-monitor planning numbers at Crans-Montana (1,500 m): "Seven-and-a-half per cent in the nine, eight, seven and six iron and then five per cent for the rest"; the woods are mapped here to Driver. Not a same-temperature comparison: his 8-iron gains about 5% in the cool morning and "upwards of ten per cent" as it warms.',
);

const DIRECTION_SOURCES = [
  cite(
    SOURCE.padjen,
    'Secondary: the only quantified apex and land-angle change, from Padjen (TrackMan): apex 102 → 84 ft and land angle 38° → 29° while carry rises 282 → 306 yd at 7,800 ft.',
  ),
  cite(
    SOURCE.shih,
    'Secondary: TrackMan\'s Harrison Shih, paraphrased: the ball "flies lower" at altitude.',
  ),
  cite(
    SOURCE.foresight,
    'Primary, qualitative: at altitude the apex is lower and the ball lands flatter.',
  ),
];

// TrackMan's 2014 "Calm" model shots (oracles 10 and 12).
const SHOTS = {
  pga: {
    name: 'PGA',
    tour: 'PGA TOUR',
    oracle: '10a',
    ballSpeedMph: 130,
    launchDeg: 14.7,
    spinRpm: 6088,
    carryYd: 184,
    maxHeightYd: 33.8,
    landDeg: 48.0,
  },
  lpga: {
    name: 'LPGA',
    tour: 'LPGA Tour',
    oracle: '10b',
    ballSpeedMph: 110,
    launchDeg: 18.6,
    spinRpm: 5950,
    carryYd: 152,
    maxHeightYd: 27.7,
    landDeg: 45.6,
  },
};

const NORMALIZATION_CALM = cite(
  SOURCE.normalization,
  'Primary (full HTML and table images): the "Calm" column of the PGA TOUR and LPGA Tour 6-iron tables, TrackMan\'s own model with fully specified inputs. TrackMan does not state these tables\' altitude or temperature; sea level and 77 °F are inferred from the Normalization defaults. 2014-era tour shots with −3.1° (PGA) and −1.5° (LPGA) attack angle.',
);

const NORMALIZATION_WIND = cite(
  SOURCE.normalization,
  'Primary (table images): the 10 and 20 mph head- and tailwind columns of the same tables as oracle 10, TrackMan\'s own model with fully specified inputs. Conditions are as for the "Calm" column, which TrackMan does not state.',
);

const WIND = [
  { tourId: 'pga', dir: 'hw', mph: 10, carryYd: 166, maxHeightYd: 38.1, landDeg: 58.1 },
  { tourId: 'pga', dir: 'hw', mph: 20, carryYd: 143, maxHeightYd: 42.8, landDeg: 69.5 },
  { tourId: 'pga', dir: 'tw', mph: 10, carryYd: 198, maxHeightYd: 29.7, landDeg: 39.5 },
  { tourId: 'pga', dir: 'tw', mph: 20, carryYd: 207, maxHeightYd: 26.1, landDeg: 32.7 },
  { tourId: 'lpga', dir: 'hw', mph: 10, carryYd: 139, maxHeightYd: 31.3, landDeg: 55.6 },
  { tourId: 'lpga', dir: 'hw', mph: 20, carryYd: 121, maxHeightYd: 35.3, landDeg: 67.4 },
  { tourId: 'lpga', dir: 'tw', mph: 10, carryYd: 161, maxHeightYd: 24.5, landDeg: 37.7 },
  { tourId: 'lpga', dir: 'tw', mph: 20, carryYd: 167, maxHeightYd: 21.7, landDeg: 31.7 },
];

// A row or shot the model could not fly: the oracle fails instead of throwing.
class ModelFailure extends Error {}

function guarded(evaluate) {
  return (ctx, opts) => {
    try {
      return evaluate(ctx, opts);
    } catch (error) {
      if (!(error instanceof ModelFailure)) {
        throw error;
      }
      return { value: Number.NaN, display: `model failed: ${error.message}`, pass: false };
    }
  };
}

function grouped(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatNumber(x, unit, signed) {
  const digits = Math.abs(x).toFixed(1);
  let sign = '';
  if (digits === '0.0') {
    sign = signed ? '±' : '';
  } else if (x < 0) {
    sign = '−';
  } else if (signed) {
    sign = '+';
  }
  return `${sign}${digits}${SUFFIX[unit]}`;
}

const formatGain = (pct) => formatNumber(pct, '%', true);

// A band in percent, or one reaching below zero, bounds a change and prints
// signed; an absolute band (a land angle) does not.
function isSigned(band) {
  return band.unit === '%' || band.min < 0;
}

export function formatBand(band) {
  const signed = isSigned(band);
  const min = formatNumber(band.min, band.unit, signed);
  return `${min}…${formatNumber(band.max, band.unit, signed)}`;
}

function rhoRatioAt(ft) {
  return densityRatio(pressureAtElevation(ft * M_PER_FT));
}

function rowName(entry) {
  return `${entry.tourId.toUpperCase()} ${entry.row.club}`;
}

function rowEntry(ctx, tourId, club) {
  return ctx.model.entries.find((entry) => entry.tourId === tourId && entry.row.club === club);
}

function readyDelta(entry, { status, delta }) {
  if (status !== 'ready') {
    throw new ModelFailure(`${rowName(entry)} calibration ${status}`);
  }
  if (!delta.ok) {
    throw new ModelFailure(`${rowName(entry)} flight ${delta.reason}`);
  }
  return delta;
}

function deltaAt(ctx, entry, ft) {
  return readyDelta(entry, ctx.model.deltasAt(rhoRatioAt(ft)).get(entry.key));
}

function carryGain(ctx, tourId, club, ft) {
  const entry = rowEntry(ctx, tourId, club);
  return (100 * deltaAt(ctx, entry, ft).carryYd) / entry.row.carry.yd;
}

function gridPoints(fromFt, toFt, stepFt) {
  if (!(stepFt > 0)) {
    throw new RangeError(`the grid step must be positive, not ${stepFt}`);
  }
  const points = [];
  for (let ft = fromFt; ft < toFt; ft += stepFt) {
    points.push(ft);
  }
  points.push(toFt);
  return points;
}

// Hands `check` each row's delta at every pair of adjacent grid elevations
// and returns the first complaint, or null when there is none.
function sweep(ctx, fromFt, toFt, gridFt, check) {
  let previous = null;
  for (const ft of gridPoints(fromFt, toFt, gridFt)) {
    const deltas = ctx.model.deltasAt(rhoRatioAt(ft));
    const current = ctx.model.entries.map((entry) => ({
      entry,
      delta: readyDelta(entry, deltas.get(entry.key)),
    }));
    if (previous !== null) {
      for (let i = 0; i < current.length; i++) {
        const complaint = check(previous[i], current[i]);
        if (complaint !== null) {
          return `${rowName(current[i].entry)} ${complaint} at ${grouped(ft)} ft`;
        }
      }
    }
    previous = current;
  }
  return null;
}

function shotCalibration(ctx, tourId) {
  if (!ctx.shots.has(tourId)) {
    const shot = SHOTS[tourId];
    const launch = launchFrom(shot);
    const cal = calibrate(launch, {
      carryM: shot.carryYd * M_PER_YD,
      maxHeightM: shot.maxHeightYd * M_PER_YD,
    });
    ctx.shots.set(tourId, { launch, cal });
  }
  const calibrated = ctx.shots.get(tourId);
  if (!calibrated.cal.ok) {
    throw new ModelFailure(`2014 ${SHOTS[tourId].name} shot calibration ${calibrated.cal.reason}`);
  }
  return calibrated;
}

function banded(definition, measure) {
  const { min, max, unit } = definition.band;
  const signed = isSigned(definition.band);
  return {
    ...definition,
    evaluate: guarded((ctx) => {
      const value = measure(ctx);
      const pass = value >= min && value <= max;
      return { value, display: formatNumber(value, unit, signed), pass };
    }),
  };
}

function shotLandOracle(tourId) {
  const shot = SHOTS[tourId];
  return banded(
    {
      id: shot.oracle,
      kind: 'hard',
      title: `TrackMan 2014 ${shot.name} 6 Iron land angle`,
      measures: "sea-level land angle after calibrating to the shot's carry and max height",
      condition: `TrackMan's 2014 "Calm" ${shot.tour} 6 iron: ${shot.ballSpeedMph} mph, ${shot.launchDeg}°, ${shot.spinRpm} rpm → ${shot.carryYd} yd carry, ${shot.maxHeightYd} yd max height; sea level, calm`,
      expected: `${shot.landDeg.toFixed(1)}°`,
      band: {
        min: shot.landDeg - LAND_TOLERANCE_DEG,
        max: shot.landDeg + LAND_TOLERANCE_DEG,
        unit: 'deg',
      },
      sources: [NORMALIZATION_CALM],
    },
    (ctx) => radToDeg(shotCalibration(ctx, tourId).cal.sea.landRad),
  );
}

function windOracle({ tourId, dir, mph, carryYd, maxHeightYd, landDeg }) {
  const shot = SHOTS[tourId];
  const wind = dir === 'hw' ? 'headwind' : 'tailwind';
  const windMps = (dir === 'hw' ? -mph : mph) * MPS_PER_MPH;
  return {
    id: `12-${tourId}-${dir}${mph}`,
    kind: 'soft',
    title: `TrackMan 2014 ${shot.name} 6 Iron, ${mph} mph ${wind}`,
    measures: 'carry, max height and land angle (carry and land angle checked)',
    condition: `the oracle ${shot.oracle} shot, calibrated as there, at sea level in a constant ${mph} mph ${wind}`,
    expected: `${carryYd} yd / ${maxHeightYd.toFixed(1)} yd / ${landDeg.toFixed(1)}° (carry ±${CARRY_TOLERANCE_YD} yd, land ±${LAND_TOLERANCE_DEG}°)`,
    band: null,
    sources: [NORMALIZATION_WIND],
    evaluate: guarded((ctx) => {
      const { launch, cal } = shotCalibration(ctx, tourId);
      const flight = fly(launch, { kD: cal.kD, kL: cal.kL }, { rhoRatio: 1, windMps });
      if (!flight.ok) {
        throw new ModelFailure(`2014 ${shot.name} shot flight ${flight.reason}`);
      }
      const modelCarryYd = flight.carryM / M_PER_YD;
      const modelMaxHeightYd = flight.maxHeightM / M_PER_YD;
      const modelLandDeg = radToDeg(flight.landRad);
      return {
        value: modelCarryYd,
        display: `${modelCarryYd.toFixed(1)} yd / ${modelMaxHeightYd.toFixed(1)} yd / ${modelLandDeg.toFixed(1)}°`,
        pass:
          Math.abs(modelCarryYd - carryYd) <= CARRY_TOLERANCE_YD &&
          Math.abs(modelLandDeg - landDeg) <= LAND_TOLERANCE_DEG,
      };
    }),
  };
}

export const ORACLES = [
  banded(
    {
      id: '1',
      kind: 'hard',
      title: 'PGA Driver carry at 7,800 ft',
      measures: 'carry gain, percent of the published carry',
      condition: 'PGA Driver row (171 mph, 10.4°, 2545 rpm) at 7,800 ft against sea level, same temperature',
      expected: '+8.5% (282 → 306 yd)',
      band: { min: 5, max: 12, unit: '%' },
      sources: [PADJEN_DRIVER],
    },
    (ctx) => carryGain(ctx, 'pga', 'Driver', 7800),
  ),
  banded(
    {
      id: '2',
      kind: 'hard',
      title: 'PGA Driver max height at 7,800 ft',
      measures: 'max height change, percent of the published max height',
      condition: 'PGA Driver row at 7,800 ft against sea level, same temperature',
      expected: '−18% (apex 102 → 84 ft)',
      band: { min: -28, max: -8, unit: '%' },
      sources: [PADJEN_DRIVER],
    },
    (ctx) => {
      const entry = rowEntry(ctx, 'pga', 'Driver');
      return (100 * deltaAt(ctx, entry, 7800).maxHeightYd) / entry.row.maxHeight.yd;
    },
  ),
  banded(
    {
      id: '3',
      kind: 'hard',
      title: 'PGA Driver land angle at 7,800 ft',
      measures: 'land angle change, degrees',
      condition: 'PGA Driver row at 7,800 ft against sea level, same temperature',
      expected: '−9° (38° → 29°)',
      band: { min: -13, max: -5, unit: 'deg' },
      sources: [PADJEN_DRIVER],
    },
    (ctx) => deltaAt(ctx, rowEntry(ctx, 'pga', 'Driver'), 7800).landDeg,
  ),
  banded(
    {
      id: '4',
      kind: 'soft',
      title: 'PGA Driver carry at 5,280 ft',
      measures: 'carry gain, percent of the published carry',
      condition: 'PGA Driver row at 5,280 ft against sea level, same temperature',
      expected: '+6.1% (0.00116 × elevation in feet, a distance rule applied to carry)',
      band: { min: 3.5, max: 8.5, unit: '%' },
      sources: [
        cite(
          SOURCE.golfwrx,
          'Secondary: Steve Aoyama (Acushnet/Titleist), quoted verbatim: "the distance gain" is the elevation in feet multiplied by .00116, about 6% at 5,280 ft; his example drives 250 → 265 yd. A rule of thumb for distance, including roll, applied here to carry as an approximation: if it includes roll the carry gain is lower, so the lower edge of the band matters more than its centre.',
        ),
        cite(
          SOURCE.titleistLab,
          'Primary (archived 2026-05-09): "about 6%" at a mile, partly from "greater roll". The .00116 constant itself appears only in third-party quotes.',
        ),
        cite(SOURCE.padjen, "Secondary: also quotes Aoyama's .00116 rule."),
      ],
    },
    (ctx) => carryGain(ctx, 'pga', 'Driver', 5280),
  ),
  banded(
    {
      id: '5',
      kind: 'soft',
      title: 'Mean PGA carry gain at 7,200 ft',
      measures: 'mean of the 12 PGA rows\' carry gains, percent',
      condition: 'all PGA rows at 7,200 ft against sea level, same temperature',
      expected: '≈ +10%',
      band: { min: 6.5, max: 13, unit: '%' },
      sources: [
        cite(
          SOURCE.vgAltitude,
          'Primary: a TrackMan simulator help page: for a course at "2100m or 7000ft" (its settings show 7,198 ft) "the ball will travel roughly 10% further in the air than at sea level". No club, player group or temperature is given; compared here with the mean carry gain over the PGA bag.',
        ),
      ],
    },
    (ctx) => {
      const rows = ctx.model.entries.filter((entry) => entry.tourId === 'pga');
      const gains = rows.map((entry) => carryGain(ctx, 'pga', entry.row.club, 7200));
      return gains.reduce((total, gain) => total + gain, 0) / gains.length;
    },
  ),
  banded(
    {
      id: '6',
      kind: 'hard',
      title: 'PGA 7 Iron carry at 6,400 ft',
      measures: 'carry gain, percent of the published carry',
      condition: 'PGA 7 Iron row (123 mph, 16.1°, 7124 rpm) at 6,400 ft against sea level, same temperature',
      expected: '+12–14% (Scheffler +12.0%, McIlroy +13.8%)',
      band: { min: 7, max: 16, unit: '%' },
      sources: [
        cite(
          SOURCE.taylormade,
          'Primary publication of the players\' own planning yardages, not measurements: 7-iron 184 → 206 yd (+12.0%) for Scheffler and 195 → 222 yd (+13.8%) for McIlroy at Castle Pines, 2024. McIlroy\'s figures are what the ball "would fly"; Scheffler\'s are unlabelled and vary "based off the lie, whether the hole is uphill or downhill". The article puts the course at "nearly 6,400 feet" and does not say carry or total.',
        ),
      ],
    },
    (ctx) => carryGain(ctx, 'pga', '7 Iron', 6400),
  ),
  {
    id: '7',
    kind: 'soft',
    title: 'PGA club pattern at 6,400 ft',
    measures: 'ordering of the carry gains of PGA Driver, 7 Iron and PW',
    condition: 'PGA Driver, 7 Iron and PW rows at 6,400 ft against sea level, same temperature',
    expected: 'gain(7 Iron) ≥ gain(Driver) and gain(PW) ≤ gain(7 Iron)',
    band: null,
    sources: [
      cite(
        SOURCE.shih,
        'Secondary: TrackMan tour manager Harrison Shih, paraphrased: "the clubs most affected are the mid- and short-irons (6- to 9-irons)"; drivers and woods gain less because the ball flies lower.',
      ),
      cite(
        SOURCE.padjen,
        'Secondary: Padjen (TrackMan) calls the gain "more like a bell curve": wedges and long irons gain less than mid and short irons.',
      ),
      cite(
        SOURCE.taylormade,
        "Scheffler's and McIlroy's planning sheets, two independent teams: woods and long irons about +8–10%, 7–9 irons +12–14%, wedges about +8%.",
      ),
      cite(
        SOURCE.penge,
        'Secondary: Penge gives 7.5% for the 6–9 irons and 5% for wedges and woods.',
      ),
    ],
    evaluate: guarded((ctx) => {
      const driver = carryGain(ctx, 'pga', 'Driver', 6400);
      const iron7 = carryGain(ctx, 'pga', '7 Iron', 6400);
      const pw = carryGain(ctx, 'pga', 'PW', 6400);
      const value = iron7 >= driver && pw <= iron7;
      return {
        value,
        display: `Driver ${formatGain(driver)}, 7 Iron ${formatGain(iron7)}, PW ${formatGain(pw)}`,
        pass: value,
      };
    }),
  },
  banded(
    {
      id: '8a',
      kind: 'soft',
      title: 'PGA 7 Iron carry at 4,920 ft',
      measures: 'carry gain, percent of the published carry',
      condition: 'PGA 7 Iron row at 4,920 ft (1,500 m) against sea level, same temperature',
      expected: '+7.5%',
      band: { min: 4, max: 10, unit: '%' },
      sources: [PENGE_CRANS],
    },
    (ctx) => carryGain(ctx, 'pga', '7 Iron', 4920),
  ),
  banded(
    {
      id: '8b',
      kind: 'soft',
      title: 'PGA Driver carry at 4,920 ft',
      measures: 'carry gain, percent of the published carry',
      condition: 'PGA Driver row at 4,920 ft (1,500 m) against sea level, same temperature',
      expected: '+5%',
      band: { min: 3, max: 7.5, unit: '%' },
      sources: [PENGE_CRANS],
    },
    (ctx) => carryGain(ctx, 'pga', 'Driver', 4920),
  ),
  {
    id: '9a',
    kind: 'hard',
    title: 'Every row monotone up to 10,000 ft',
    measures: 'carry, max height and land angle between adjacent grid elevations',
    condition: 'every row of both tours, 0 → 10,000 ft on a fixed elevation grid',
    expected: 'carry ↑, max height ↓, land angle ↓, monotone',
    band: null,
    sources: DIRECTION_SOURCES,
    evaluate: guarded((ctx, { gridFt = 250 } = {}) => {
      // Non-strict: an equal value at adjacent points is still monotone. The
      // negated comparisons also fail a NaN.
      const complaint = sweep(ctx, 0, 10000, gridFt, (before, after) => {
        if (!(after.delta.carryYd >= before.delta.carryYd)) {
          return 'carry falls';
        }
        if (!(after.delta.maxHeightYd <= before.delta.maxHeightYd)) {
          return 'max height rises';
        }
        if (!(after.delta.landDeg <= before.delta.landDeg)) {
          return 'land angle rises';
        }
        return null;
      });
      return {
        value: complaint === null,
        display: complaint ?? `monotone on a ${grouped(gridFt)} ft grid`,
        pass: complaint === null,
      };
    }),
  },
  {
    id: '9b',
    kind: 'soft',
    title: 'Displayed carry from 10,000 to 15,000 ft',
    measures: 'displayed carry, round(published + Δ) yards, between adjacent grid elevations',
    condition: 'every row of both tours, 10,000 → 15,000 ft on a fixed elevation grid',
    expected: 'displayed carry never decreases between adjacent steps',
    band: null,
    sources: DIRECTION_SOURCES,
    evaluate: guarded((ctx, { gridFt = 10 } = {}) => {
      const displayed = ({ entry, delta }) => Math.round(entry.row.carry.yd + delta.carryYd);
      const complaint = sweep(ctx, 10000, 15000, gridFt, (before, after) => {
        const was = displayed(before);
        const now = displayed(after);
        return now < was ? `carry ${was} → ${now} yd` : null;
      });
      return {
        value: complaint === null,
        display: complaint ?? `never decreases on a ${grouped(gridFt)} ft grid`,
        pass: complaint === null,
      };
    }),
  },
  shotLandOracle('pga'),
  shotLandOracle('lpga'),
  {
    id: '11',
    kind: 'soft',
    title: 'LPGA Driver carry gain against PGA Driver at 5,280 ft',
    measures: 'carry gains of the LPGA and PGA Driver rows, percent',
    condition: 'LPGA and PGA Driver rows at 5,280 ft against sea level, same temperature',
    expected: 'gain(LPGA Driver) ≤ gain(PGA Driver) + 1 point',
    band: null,
    sources: [
      cite(
        SOURCE.golfDigest,
        'Secondary paraphrase of TrackMan, without a link: "slower swings get closer to 5 percent".',
      ),
      cite(
        SOURCE.titleistPosts,
        'Search-engine excerpts and quotes only (the pages return 403): Aoyama says the gain "will be less for players with slower swing speeds".',
      ),
    ],
    evaluate: guarded((ctx) => {
      const lpga = carryGain(ctx, 'lpga', 'Driver', 5280);
      const pga = carryGain(ctx, 'pga', 'Driver', 5280);
      const value = lpga <= pga + 1;
      return { value, display: `LPGA ${formatGain(lpga)}, PGA ${formatGain(pga)}`, pass: value };
    }),
  },
  ...WIND.map(windOracle),
];

// Reuses `model` as given, finishing its calibration if any rows are still
// pending; with none, builds and calibrates one.
export function createOracleContext(model = null) {
  const ctx = { model: model ?? createModel(), shots: new Map() };
  while (ctx.model.calibrateNext()) {}
  return ctx;
}

export function evaluateOracles(ctx, { gridFt } = {}) {
  return ORACLES.map((oracle) => ({ oracle, ...oracle.evaluate(ctx, { gridFt }) }));
}

// GitHub workflow-command escaping: messages escape %, CR and LF; properties
// also escape : and ,.
function escapeData(text) {
  return text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

function escapeProperty(text) {
  return escapeData(text).replaceAll(':', '%3A').replaceAll(',', '%2C');
}

export function formatAnnotation({ oracle, display }) {
  const against =
    oracle.band === null ? `, expected ${oracle.expected}` : ` outside ${formatBand(oracle.band)}`;
  const title = escapeProperty(`Soft oracle ${oracle.id}`);
  return `::warning title=${title}::${escapeData(`${oracle.title}: ${display}${against}`)}`;
}
