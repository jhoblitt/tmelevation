// THROWAWAY SPIKE CODE (land-angle spike, coordinator, 2026-10-10).
//
// What refitting the S > 0.22 drag branch to Aoki 2011 would do, against the
// shipped law (harness R0), under the app's per-row calibration.
// Usage: node highs-drag-impact.mjs
const H = new URL('.', import.meta.url).pathname;
const core = await import(`${H}/core.mjs`);
const { cl0, cd0, K_RE } = await import(`${H}/laws2.mjs`);

const decay = core.smitsDecay(1);
const reTerm = (re) => K_RE * (Math.max(re, 1e5) - 1.5e5);

// Aoki 2011 supercritical means (Re 8e4, 1.3e5) with the shipped Re term
// removed; above S 1.0 the measured Re-4e4 rise to S 1.8 (0.515 -> 0.645).
const KNOTS_P = [[0.22, cd0(0.22)], [0.4, 0.3747], [0.6, 0.4347], [0.8, 0.4567], [1.0, 0.4767], [1.8, 0.6067]];
const KNOTS_P0 = [...KNOTS_P.slice(0, 5)];
const interp = (knots) => (s) => {
  if (s <= knots[0][0]) return cd0(s);
  for (let i = 1; i < knots.length; i++) {
    if (s <= knots[i][0]) {
      const [s0, c0] = knots[i - 1];
      const [s1, c1] = knots[i];
      return c0 + ((c1 - c0) * (s - s0)) / (s1 - s0);
    }
  }
  return knots[knots.length - 1][1];
};

const law = (cdBySpin) => ({
  cd: (re, s) => cdBySpin(s) + reTerm(re),
  cl: (re, s) => cl0(s),
  decay: (ctx) => decay(ctx),
});
const LAWS = {
  shipped: law((s) => cd0(s)),
  P: law(interp(KNOTS_P)),
  P0: law(interp(KNOTS_P0)),
};

const rows = core.tableRows();
const round = (x) => (x < 0 ? -Math.round(-x) : Math.round(x));
const grid = Array.from({ length: 31 }, (_, i) => i * 500);
const results = {};
for (const [name, lw] of Object.entries(LAWS)) {
  const per = rows.map((row) => {
    const targets = { carryM: row.carryYd * core.M_PER_YD, maxHeightM: row.heightYd * core.M_PER_YD };
    const cal = core.calibrate(row.launch, lw, {}, targets);
    if (!cal.ok) throw new Error(`${name} ${row.id}: ${cal.reason}`);
    const sea = core.fly(row.launch, lw, {}, cal, { rhoRatio: 1 });
    const at = grid.map((ft) => {
      const f = core.fly(row.launch, lw, {}, cal, { rhoRatio: core.rhoRatioAtFt(ft) });
      return {
        dCarry: core.toYd(f.carryM - sea.carryM),
        dHeight: core.toYd(f.maxHeightM - sea.maxHeightM),
        dLand: core.toDeg(f.landRad - sea.landRad),
      };
    });
    return { row, cal, landGap: core.toDeg(sea.landRad) - row.landDeg, at };
  });
  results[name] = per;
  const rms = Math.sqrt(per.reduce((s, r) => s + r.landGap ** 2, 0) / per.length);
  const kD = per.map((r) => r.cal.kD);
  const kL = per.map((r) => r.cal.kL);
  let falls = 0;
  for (const r of per) for (let i = 1; i < grid.length && grid[i] <= 10000; i++) if (r.at[i].dCarry < r.at[i - 1].dCarry) falls++;
  console.log(`${name.padEnd(8)} land RMS ${rms.toFixed(3)}°  kD ${Math.min(...kD).toFixed(3)}–${Math.max(...kD).toFixed(3)}  kL ${Math.min(...kL).toFixed(3)}–${Math.max(...kL).toFixed(3)}  carry falls 0–10k (500 ft grid): ${falls}`);
}

for (const name of ['P', 'P0']) {
  let cells = 0;
  let diff = 0;
  let worst = { d: 0 };
  results[name].forEach((r, i) => {
    const b = results.shipped[i];
    r.at.forEach((a, j) => {
      const row = r.row;
      const pairs = [
        [round(row.carryYd + a.dCarry), round(row.carryYd + b.at[j].dCarry), 'carry yd', a.dCarry - b.at[j].dCarry],
        [round(row.heightYd + a.dHeight), round(row.heightYd + b.at[j].dHeight), 'height yd', a.dHeight - b.at[j].dHeight],
        [round(row.landDeg + a.dLand), round(row.landDeg + b.at[j].dLand), 'land °', a.dLand - b.at[j].dLand],
      ];
      for (const [x, y, what, raw] of pairs) {
        cells++;
        if (x !== y) diff++;
        if (Math.abs(raw) > Math.abs(worst.d)) worst = { d: raw, what, id: row.id, ft: grid[j] };
      }
    });
  });
  console.log(`${name}: displayed cells (yd, °) differing from shipped over 0–15,000 ft every 500 ft: ${diff} of ${cells}; largest raw change ${worst.d.toFixed(2)} ${worst.what} (${worst.id} @ ${worst.ft} ft)`);
}

console.log('\nchange at 10,000 ft, candidate P minus shipped (carry yd / height yd / land °), rows with S above 0.64 on descent:');
const j10 = grid.indexOf(10000);
results.P.forEach((r, i) => {
  const b = results.shipped[i].at[j10];
  const a = r.at[j10];
  console.log(`  ${r.row.id.padEnd(12)} ${(a.dCarry - b.dCarry).toFixed(2).padStart(6)} / ${(a.dHeight - b.dHeight).toFixed(2).padStart(6)} / ${(a.dLand - b.dLand).toFixed(2).padStart(6)}   (shipped Δcarry ${b.dCarry.toFixed(1)})`);
});
