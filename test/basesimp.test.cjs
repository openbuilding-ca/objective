/**
 * BASESIMP (src/core/Basesimp.js) against BasementHLR.xls's own results, without a browser.
 *
 *   node test/basesimp.test.cjs
 *
 * CSA F280-12 Cl. 5.2.2.1 requires BasementHLR.xls for every foundation element in contact with soil.
 * The fixture (test/fixtures/basesimp-workbooks.json, tools/f280/basesimp_fixture.py) holds numbers
 * EXCEL computed from the spreadsheet's formulas: NRCan's three shipped examples (BWEB_2/3/4, Winnipeg),
 * the interpolation path below an added RSI of 1.5, and F280 Archetype 1's two basement rooms
 * (BCIN_1, Ottawa (Orleans); tools/f280/basesimp_variants.py). Every intermediate is compared, not only
 * the loads, so a wrong cell is named where it goes wrong.
 */
const path = require("path");
const assert = require("assert");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/BasesimpData.js"));
require(path.join(__dirname, "..", "src/core/Basesimp.js"));
const B = window.TEUI.Basesimp;
const cases = require(path.join(__dirname, "fixtures/basesimp-workbooks.json"));

// Excel and JavaScript both compute in IEEE doubles, with the same operations in the same order where
// the port mirrors a cell; what differs is Excel's own POWER/EXP/COS. 1e-9 relative is far tighter than
// any modelling question and far looser than that last-bit noise.
const REL = 1e-9;
let checks = 0;
function close(actual, expected, what) {
  const tol = REL * Math.max(1, Math.abs(expected));
  assert.ok(
    Math.abs(actual - expected) <= tol,
    `${what}: ${actual} vs the workbook's ${expected} (diff ${actual - expected})`
  );
  checks++;
}

for (const c of cases) {
  const r = B.compute(c.inputs);
  const e = c.expected;
  const at = k => `${c.source} ${k}`;
  close(r.rsi1, e.rsi1, at("Loads!B13 rsi1"));
  close(r.rsi2, e.rsi2, at("Loads!B15 rsi2"));
  assert.strictEqual(r.interpolated, e.interpolated, at("Loads!B26 interpolate?"));
  for (const k of ["sumuo", "sumur", "fcs", "atten", "fcv"]) close(r.set1[k], e.bs1[k], at(`BS1 ${k}`));
  for (const k of ["sag", "sbgAvg", "sbgVar", "phase"]) {
    close(r.set1[k], e.set1[k], at(`Loads row 21 (BS1) ${k}`));
    close(r.set2[k], e.set2[k], at(`Loads row 20 (BS2) ${k}`));
    close(r[k], e[k], at(`Loads row 27 (output) ${k}`));
  }
  for (const k of ["tempS", "amps", "phs"]) close(r.ground[k], e.ground[k], at(`Input Moore ${k}`));
  r.fhl.forEach((v, i) => close(v, e.fhl[i], at(`Loads FHLmon month ${i + 1}`)));
  close(r.heatingLoad, e.heatingLoad, at("Loads!B49 heating load"));
  close(r.coolingLoad, e.coolingLoad, at("Loads!B54 cooling load"));
  console.log(
    `ok  ${c.source.padEnd(30)} #${String(c.inputs.configuration).padEnd(4)}` +
      ` heating ${r.heatingLoad.toFixed(2).padStart(8)} W  cooling ${r.coolingLoad.toFixed(2).padStart(7)} W`
  );
}

// The fixture must exercise both paths, or a green run proves less than it says.
assert.ok(cases.some(c => c.expected.interpolated), "no case takes the interpolation path");
assert.ok(cases.some(c => !c.expected.interpolated), "no case takes the BS1-only path");
// The loads respond the way the physics says: more insulation, less heat loss.
const base = cases.find(c => c.source.startsWith("f280-room1"));
const more = B.compute({ ...base.inputs, interior: base.inputs.interior * 2 });
assert.ok(more.heatingLoad < B.compute(base.inputs).heatingLoad, "doubling the insulation did not cut the loss");
const colder = B.compute({ ...base.inputs, heating: { ...base.inputs.heating, design: -40 } });
assert.ok(colder.heatingLoad > B.compute(base.inputs).heatingLoad, "a colder design day did not raise the loss");
checks += 4;

// --- the heating-season integral (seasonLoss): OBJECTIVE's annual figure under BASESIMP -----------
// Not the spreadsheet's, so no Excel number to meet; witnessed against its own physics instead.
{
  const r = B.compute(base.inputs); // F280-1 room 1, Ottawa (Orleans)
  const s = { room: 20, outdoorMean: -8, deepGround: base.inputs.deepGround };
  // the coldest day of Orleans's air harmonic falls in January
  assert.ok(r.ground.coldestDay > 0 && r.ground.coldestDay < 31, `coldest day ${r.ground.coldestDay}`);
  // a whole year: the harmonic integrates to nothing
  const year = B.seasonLoss(r, { ...s, days: 365 });
  assert.ok(Math.abs(year.harmonic) < 1e-9 * Math.abs(r.ca1), `full-year harmonic ${year.harmonic}`);
  // the closed form against a 1/1000-day midpoint sum of the spreadsheet's rate Ca1 x omega x sin(omega t + Ca2)
  const season = B.seasonLoss(r, { ...s, days: 245 });
  const n = 245000, dt = 245 / n;
  let sum = 0;
  for (let i = 0; i < n; i++) sum += r.ca1 * r.omega * Math.sin(r.omega * (season.startDay + (i + 0.5) * dt) + r.ca2) * dt;
  close(season.harmonic, sum * r.exposedFraction * 24 / 1000, "season harmonic: closed form vs numeric");
  // the same rate's monthly means ARE the spreadsheet's FHLmon (Excel-witnessed above)
  let day = 0;
  r.fhl.forEach((m, i) => {
    let msum = 0; const k = 31000, h = B.DAYS[i] / k;
    for (let j = 0; j < k; j++) msum += r.ca1 * r.omega * Math.sin(r.omega * (day + (j + 0.5) * h) + r.ca2) * h;
    assert.ok(Math.abs(msum / B.DAYS[i] - m) < 1e-6 * Math.max(1, Math.abs(m)), `month ${i + 1}: rate mean ${msum / B.DAYS[i]} vs FHLmon ${m}`);
    day += B.DAYS[i];
  });
  // a cold-centred season loses more per day than the year's mean; walls + slab = total
  assert.ok(season.harmonic > 0, "the cold half of the harmonic adds loss");
  close(season.walls + season.slab, season.total, "walls + slab = total");
  checks += 16;
}

console.log(`\nbasesimp: ${cases.length} workbooks, ${checks} checks passed`);
