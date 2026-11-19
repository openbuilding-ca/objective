/**
 * Basesimp.js's slab-on-grade path against SlabOnGradeHLR.xls, computed by Excel - no browser.
 *
 *   node test/basesimpSlab.test.cjs
 *
 * The witness for 2026-11-19: F280 Mode On ran BASESIMP on every house, and a slab house (Hemmingford,
 * case 03) stopped at "no below-grade wall area" - our port was BasementHLR.xls alone. NRCan's F280
 * package carries the slab twin, SlabOnGradeHLR_2014.xls. The fixture (test/fixtures/
 * basesimp-slab-workbooks.json, tools/f280/slab_fixture.py) holds what EXCEL computed for six workbooks
 * (tools/f280/slab_variants.py): NRCan's shipped SCB_25 example (the interpolation, RSI 1.4), RSI 3.5
 * (BS1 alone), SCN_1 uninsulated, a radiant slab (the MAX in Input!C58), 20 m of 36.4 m exposed, and an
 * Ottawa (Orleans) SCB_31 slab on F280's weather.
 */
const path = require("path");
const assert = require("assert");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/BasesimpData.js"));
require(path.join(__dirname, "..", "src/core/Basesimp.js"));
const B = window.TEUI.Basesimp;
const { records } = require(path.join(__dirname, "fixtures/basesimp-slab-workbooks.json"));

// As test/basesimp.test.cjs: IEEE doubles both sides, Excel's own POWER/EXP/COS the only difference
const REL = 1e-9;
let checks = 0;
function close(actual, expected, what) {
  const tol = REL * Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= tol, `${what}: ${actual} vs the workbook's ${expected} (diff ${actual - expected})`);
  checks++;
}

for (const c of records) {
  const r = B.compute(c.input);
  const e = c.expect;
  const at = k => `${c.name} ${k}`;
  assert.ok(r.slab, at("is read as a slab configuration"));
  close(r.rsi1, e.rsi1, at("Loads!B12 rsi1"));
  close(r.rsi2, e.rsi2, at("Loads!B14 rsi2"));
  assert.strictEqual(r.interpolated, e.interpolated, at("Loads!B25 interpolate?"));
  for (const k of ["sag", "sbgAvg", "sbgVar", "phase"]) {
    close(r.set1[k], e.set1[k], at(`Loads row 20 (BS1) ${k}`));
    close(r.set2[k], e.set2[k], at(`Loads row 19 (BS2) ${k}`));
    close(r[k], e.output[k], at(`Loads row 26 (output) ${k}`));
  }
  close(r.ca1, e.ca1, at("Loads!E31 Ca1"));
  close(r.ca2, e.ca2, at("Loads!H31 Ca2"));
  r.fhl.forEach((v, i) => close(v, e.fhl[i], at(`Loads FHLmon month ${i + 1}`)));
  close(r.exposedFraction, e.exposedFraction, at("Input!L7 exposed fraction"));
  close(r.heatingLoad, e.heatingLoad, at("Loads!B48 heating load"));
  close(r.coolingLoad, e.coolingLoad, at("Loads!B53 cooling load"));
  console.log(`ok  ${c.name.padEnd(24)} #${String(c.input.configuration).padEnd(3)} heating ${r.heatingLoad.toFixed(3).padStart(8)} W  cooling ${r.coolingLoad.toFixed(3).padStart(8)} W`);
}

// The fixture must exercise each slab path, or a green run proves less than it says.
assert.ok(records.some(c => c.expect.interpolated), "no case takes the interpolation path");
assert.ok(records.some(c => !c.expect.interpolated && c.expect.rsi1 > 1.5), "no case above RSI 1.5");
assert.ok(records.some(c => c.input.heating.slab > c.input.heating.room), "no radiant slab case");
assert.ok(records.some(c => c.expect.exposedFraction < 1), "no partly exposed case");
// And the basement path is not a slab
assert.ok(!B.isSlab(1) && B.isSlab(52) && B.isSlab(28), "isSlab reads FoundationCC's SC* names");
console.log(`\nall pass (${checks} checks against Excel)`);
