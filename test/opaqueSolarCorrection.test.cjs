/**
 * CSA F280-12 Cl. 6.2.1's solar correction on opaque assemblies (Table 3), without a browser.
 *
 *   node test/opaqueSolarCorrection.test.cjs
 *
 * HGcop = A / RSI × (DTDc + SC). S15's enclosure term carries A / RSI × DTDc; f280.opaqueSolarCorrection
 * is the SC half on S11's roof, walls, exposed floor and doors. The witness for 2026-11-19: F280-1's
 * own areas and RSIs (Ottawa (Orleans), summer daily range 11 °C: Table 3's first column, DTDc 6)
 * give the correction counted by hand row by row (+157.4 W in the app); a range over 14 °C takes the second column; a
 * correction that would take an assembly's DTDc + SC below 0 stops at 0 (no credit); the windows take
 * no SC; and the total sensible gain carries the term.
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/Openings.js")); // the envelope rows, read by the node files
require(path.join(__dirname, "..", "src/core/F280Weather.js"));
require(path.join(__dirname, "..", "src/sections/nodes/F280ComplianceNodes.js"));
const nodes = [];
window.TEUI.ComputationNodes.F280Compliance.register({ registerNode: n => nodes.push(n), registerInputs: () => {} });
const node = id => {
  const found = nodes.filter(n => n.id === id);
  if (found.length !== 1) throw new Error(`${found.length} nodes named ${id}`);
  return found[0];
};
const sc = node("f280.opaqueSolarCorrection");

let ok = true;
const near = (what, got, want, tol = 1e-9) => {
  const pass = typeof got === "number" && Math.abs(got - want) <= tol;
  if (!pass) ok = false;
  console.log(`${pass ? "ok  " : "FAIL"} ${what}${pass ? "" : `: got ${got}, want ${want}`}`);
};

// F280-1 (test/computation/case-studies/F280-1-Archetype1-2010s-Ottawa.csv): S11 rows 85-88
const F280_1 = {
  "climate.location.province": "ON",
  "climate.location.city": "Ottawa (Orleans)",
  "climate.temperature.hottest": 30,
  "climate.cooling.setpoint": 24,
  "transmissionLoss.thermalBridgePenalty": 0,
  "transmissionLoss.opaque85.area": 118.39, "transmissionLoss.opaque85.uValue": 1 / 9.05,
  "transmissionLoss.opaque86.area": 229.11, "transmissionLoss.opaque86.uValue": 1 / 3.4432,
  "transmissionLoss.opaque87.area": 25.08, "transmissionLoss.opaque87.uValue": 1 / 5.348,
  "transmissionLoss.doors.area": 5.67, "transmissionLoss.doors.uValue": 0.9091
};
const WALL_MEAN_LE14 = (-3.8 - 0.6 + 1.7 + 0.6 - 2.2 + 0.6 + 1.7 - 0.6) / 8; // -0.325
const WALL_MEAN_GT14 = (-6.7 - 3.3 - 1.1 - 2.2 - 5.0 - 2.2 - 1.1 - 3.3) / 8; // -3.1125
const ua = (id, i = F280_1) => i[`transmissionLoss.${id}.area`] * i[`transmissionLoss.${id}.uValue`];

const byHand = ua("opaque85") * 15.0 + ua("opaque86") * WALL_MEAN_LE14 + ua("opaque87") * -3.3 + ua("doors") * WALL_MEAN_LE14;
near("F280-1, Ottawa (Orleans), range 11 C: the first column, by hand", sc.compute(F280_1), byHand);

// A thermal-bridge penalty scales U, as S15's g_101 does.
near("a 20 % TB penalty scales the correction", sc.compute({ ...F280_1, "transmissionLoss.thermalBridgePenalty": 20 }), byHand * 1.2);

// Over 14 C: the second column. Fort MacLeod's range is 15 (F280_Weather.xls); Banff's 14 stays in the first.
const wide = ["AB", "Fort MacLeod"];
if (!(window.TEUI.F280Weather.lookup(...wide).summerRange > 14)) throw new Error("Fort MacLeod is not over 14 C");
near("Banff, range 14 C: still the first column ('up to and including 14')",
  sc.compute({ ...F280_1, "climate.location.province": "AB", "climate.location.city": "Banff" }), byHand);
const hot = { ...F280_1, "climate.location.province": wide[0], "climate.location.city": wide[1], "climate.temperature.hottest": 34 }; // DTDc 10
near(`${wide[1]}, range ${window.TEUI.F280Weather.lookup(...wide).summerRange} C: the second column`, sc.compute(hot),
  ua("opaque85") * 12.2 + ua("opaque86") * WALL_MEAN_GT14 + ua("opaque87") * -6.1 + ua("doors") * WALL_MEAN_GT14);

// DTDc 2 with SC -3.3 on the floor: the floor's DTDc + SC stops at 0, so its correction is -2 x UA, not -3.3.
const mild = { ...F280_1, "climate.temperature.hottest": 26 };
near("DTDc 2: an assembly's DTDc + SC stops at 0 (no credit)", sc.compute(mild),
  ua("opaque85") * 15.0 + ua("opaque86") * WALL_MEAN_LE14 + ua("opaque87") * -2 + ua("doors") * WALL_MEAN_LE14);

// A wall by its FACING (Andy 2026-11-20, the opaque rows): B.5 facing North takes Table 3's North column,
// not the compass mean; a wall row turned to Roof takes the roofs' (the type, not the row, picks the SC).
near("B.5 facing North: Table 3's North (-3.8), not the mean", sc.compute({ ...F280_1, "transmissionLoss.opaque86.facing": "North" }),
  ua("opaque85") * 15.0 + ua("opaque86") * -3.8 + ua("opaque87") * -3.3 + ua("doors") * WALL_MEAN_LE14);
near("B.5 facing Average: the compass mean, as every wall before", sc.compute({ ...F280_1, "transmissionLoss.opaque86.facing": "Average" }), byHand);
near("a wall row typed Roof takes the roofs' 15.0", sc.compute({ ...F280_1, "transmissionLoss.opaque86.type": "roof" }),
  ua("opaque85") * 15.0 + ua("opaque86") * 15.0 + ua("opaque87") * -3.3 + ua("doors") * WALL_MEAN_LE14);

// A city F280 has no row for: Unavailable, never a number.
const none = sc.compute({ ...F280_1, "climate.location.city": "No Such Place" });
if (none !== "Unavailable") ok = false;
console.log(`${none === "Unavailable" ? "ok  " : "FAIL"} a city without an F280 row is Unavailable`);

// The windows take no SC (Cl. 6.2.2): the node reads no window row.
const readsWindows = sc.dependencies.some(d => /window|skylight/i.test(d));
if (readsWindows) ok = false;
console.log(`${readsWindows ? "FAIL" : "ok  "} the windows take no SC`);

// The total sensible gain carries the term.
const total = node("f280.totalSensibleHeatGain");
const base = { "energy.peakCooling.enclosureKw": 1, "building.conditionedFloorArea": 100, "climate.coolingDays": 120 };
near("Cl. 6.2.9's total adds the correction", total.compute({ ...base, "f280.opaqueSolarCorrection": 157.4 }) - total.compute({ ...base, "f280.opaqueSolarCorrection": 0 }), 157.4);

console.log(ok ? "\nall pass" : "\nFAILED");
process.exit(ok ? 0 : 1);
