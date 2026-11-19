/**
 * AIM-2 (src/core/Aim2.js) against AIM2.xls's own results, without a browser.
 *
 *   node test/aim2.test.cjs
 *
 * CSA F280-12 Cl. 5.2.3: the air-leakage rate for heating is "the output from the spreadsheet" AIM2.xls.
 * test/fixtures/aim2-workbooks.json holds numbers EXCEL computed from AIM2.xls's formulas for six
 * inputs (tools/f280/aim2_variants.py): the workbook as shipped, F280 Archetype 1 / 2010s / Ottawa with
 * its HRV and as the exhaust-only variant, flues with semi-detached / slab, ELA at 4 Pa with supply-only
 * ventilation and a furnace flue, and a 500 m3 house. Every intermediate is compared.
 * test/fixtures/f280-aim2-workbook.json: NRCan's 2015 test cases (natural ACH against volume and
 * against exhaust-only flow), run through the example house of AIM2-F280_Example.xls.
 */
const path = require("path");
const assert = require("assert");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/Aim2Data.js"));
require(path.join(__dirname, "..", "src/core/Aim2.js"));
const A = window.TEUI.Aim2;
const { records } = require(path.join(__dirname, "fixtures/aim2-workbooks.json"));

const REL = 1e-9;
let checks = 0;
function close(actual, expected, what, rel = REL) {
  const tol = rel * Math.max(1, Math.abs(expected));
  assert.ok(Math.abs(actual - expected) <= tol, `${what}: ${actual} vs the workbook's ${expected} (diff ${actual - expected})`);
  checks++;
}

for (const rec of records) {
  const r = A.compute(rec.inputs);
  const e = rec.expected;
  const at = k => `${rec.variant} ${k}`;
  for (const k of ["n", "c50", "flueA", "cFlue", "y", "rs", "x", "cT", "cCon", "sW", "fs", "fw", "qBal", "qUnbal"]) {
    close(r[k], e[k], at(k));
  }
  close(r.heating.natural, e.heatingNatural, at("Ven_Nat_h (LRairh)"));
  close(r.cooling.natural, e.coolingNatural, at("Ven_Nat_c (LRairc)"));
  close(r.heating.heatLoss, e.heatingLoss, at("H_hl_r"));
  close(r.cooling.heatLoss, e.coolingLoss, at("C_hl_r"));
  close(r.ventilationHeating, e.ventilationHeating, at("Ven_mech_HL_h"));
  close(r.ventilationCooling, e.ventilationCooling, at("Ven_mech_HL_c"));
  close(r.totalHeating, e.totalHeating, at("Total_Heating_Loss"));
  close(r.totalCooling, e.totalCooling, at("Total_Cooling_Loss"));
  console.log(`ok  ${rec.variant.padEnd(16)} LRairh ${r.heating.natural.toFixed(5)} AC/H  LRairc ${r.cooling.natural.toFixed(5)}`);
}

// NRCan's 2015 test cases (the example house: Winnipeg -33 / 22 C, 18 km/h, ACH50 1.5, ELA 305.8 @ 10 Pa,
// ceiling 6.4 m, open-flat station, suburban site, very heavy / heavy shielding, detached two storeys
// full basement, no flue), printed to 4 decimals there.
const legacy = require(path.join(__dirname, "fixtures/f280-aim2-workbook.json"));
const example = {
  indoorHeating: 22, indoorCooling: 24, designHeating: -33, designCooling: 30, janWind: 18, julWind: 15,
  stationTerrain: 3, anemometerHeight: 10, siteTerrain: 7, wallShielding: 4, flueShielding: 3,
  buildingType: "Detached", storeys: "Two", foundation: "Full", tightness: "Custom", ach50: 1.5, ela: 305.8,
  elaPa: 10, volume: 566.3, ceilingHeight: 6.4, flues: [0, 0, 0, 0], supplyLs: 0, exhaustLs: 0, furnaceFlueLs: 0,
};
for (const row of legacy.set_1_volume.rows) {
  const r = A.compute({ ...example, volume: row.volume_m3 });
  assert.ok(Math.abs(r.heating.natural - row.natural_ach) < 0.00005, `2015 volume ${row.volume_m3}: ${r.heating.natural} vs ${row.natural_ach}`);
  checks++;
}
for (const row of legacy.set_2_exhaust_only.rows) {
  const r = A.compute({ ...example, exhaustLs: row.exhaust_ls });
  assert.ok(Math.abs(r.heating.natural - row.natural_ach) < 0.00005, `2015 exhaust ${row.exhaust_ls}: ${r.heating.natural} vs ${row.natural_ach}`);
  checks++;
}
console.log("ok  NRCan 2015 test cases (volume, exhaust-only), to their printed 4 decimals");

// --- seasonalRate: OBJECTIVE's annual figure under AIM-2 (not the spreadsheet's; its own witnesses) ----
{
  const p = records.find(r => r.variant === "f280-1-hrv").inputs;
  const flat = A.seasonalRate(p, p.indoorHeating, Array(12).fill(p.designHeating), Array(12).fill(p.janWind / 3.6), Array(12).fill(100));
  close(flat.rate, A.compute(p).heating.natural, "seasonal rate at constant design weather = the design rate");
  const one = A.seasonalRate(p, 20, [-10, -5, 0, 5, 10, 15, 18, 17, 12, 6, 0, -8], Array(12).fill(4), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 30]);
  close(one.rate, one.monthly[11], "all the weight on December = December's rate");
  const s = A.seasonalRate(p, 20, [-10, -5, 0, 5, 10, 15, 18, 17, 12, 6, 0, -8], Array(12).fill(4), [800, 650, 560, 390, 220, 80, 20, 40, 170, 360, 540, 720]);
  assert.ok(s.monthly[0] > s.monthly[6], "January's stack effect drives more air than July's");
  assert.ok(s.rate < A.compute(p).heating.natural, "the season's mean rate sits below the design hour's");
  checks += 2;
}

console.log(`\naim2: ${records.length} workbooks + ${legacy.set_1_volume.rows.length + legacy.set_2_exhaust_only.rows.length} test cases, ${checks} checks passed`);
