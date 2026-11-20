/**
 * Wombat's footprint (S19 19.1-19.2b) as graph nodes, and BASESIMP's exposed perimeter from it - no browser.
 *
 *   node test/wombatFootprint.test.cjs
 *
 * The witness for 2026-11-19 (Andy: "As for its perimeter: could we not add that as a field in Wombat?
 * Then all a user needs to do is tweak the aspect ratio"). The rectangle is Section19.js's own
 * (solveGeometry): S11's slab area kept exactly, the slider's L:W (0 = square, -2 = 1:3). S03 G.4.6 blank
 * takes its perimeter; a typed G.4.6 wins (an attached house exposes less than the outline).
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/Openings.js")); // the opening rows, read by the node files
for (const f of ["src/core/BasesimpData.js", "src/core/Basesimp.js", "src/core/F280Weather.js",
  "src/sections/nodes/VolumeMetricsNodes.js", "src/sections/nodes/TransmissionLossNodes.js"]) {
  require(path.join(__dirname, "..", f));
}
const nodes = [];
const graph = { registerNode: n => nodes.push(n), registerInputs: () => {} };
window.TEUI.ComputationNodes.VolumeMetrics.register(graph);
const node = id => nodes.find(n => n.id === id);
const footprint = node("wombat.footprint");
const { basesimpFor } = window.TEUI.ComputationNodes.TransmissionLoss;

let ok = true;
const near = (what, got, want, tol = 1e-9) => {
  const pass = typeof got === "number" && Math.abs(got - want) <= tol;
  if (!pass) ok = false;
  console.log(`${pass ? "ok  " : "FAIL"} ${what}${pass ? "" : `: got ${got}, want ${want}`}`);
};

// Hemmingford (case 03): 106.45 m2 slab, the slider's default -2.0 (L:W 1:3), as S19 draws it: 17.87 x 5.96 m
const f = footprint.compute({ "transmissionLoss.slabOnGrade.area": 106.45, "wombat.aspectRatio": -2 });
near("width = sqrt(A x 3) = 17.87 m", f.width, Math.sqrt(106.45 * 3));
near("length = A / width = 5.96 m", f.length, 106.45 / Math.sqrt(106.45 * 3));
near("the area is kept exactly", f.length * f.width, 106.45, 1e-12);
near("perimeter = 2 (L + W) = 47.65 m", f.perimeter, 2 * (f.length + f.width));
const sq = footprint.compute({ "transmissionLoss.slabOnGrade.area": 106.45, "wombat.aspectRatio": 0 });
near("square: perimeter = 4 sqrt(A)", sq.perimeter, 4 * Math.sqrt(106.45));
const ok2 = footprint.compute({}) === "Unavailable";
if (!ok2) ok = false;
console.log(`${ok2 ? "ok  " : "FAIL"} no slab and no exposed floor: Unavailable`);

// BASESIMP (a slab, SCB_25 #52) with G.4.6 blank takes Wombat's outline: the same rectangle
const house = {
  "ground.basesimp.configuration": 52, "transmissionLoss.slabOnGrade.area": 106.45, "transmissionLoss.wallsBelowGrade.area": 0,
  "transmissionLoss.slabOnGrade.rsi": 7, "transmissionLoss.wallsBelowGrade.rsi": 0, "ground.basesimp.soilConductivity": 0.85,
  "ground.basesimp.waterTable": 8, "climate.location.province": "QC", "climate.location.city": "Hemmingford",
  "climate.heating.obcSetpoint": 20, "climate.cooling.setpoint": 24, "climate.temperature.coldest": -24,
  "climate.temperature.hottest": 30, "climate.coolingDays": 120, "climate.heating.setpoint": 20,
  "climate.temperature.winterAverage": -2, "wombat.footprint.perimeter": f.perimeter,
};
const r = basesimpFor({ ...house, "ground.basesimp.exposedPerimeter": 0 });
if (r.error) { ok = false; console.log("FAIL", r.error); } else {
  near("G.4.6 blank: Wombat's perimeter", r.geometry.perimeter, f.perimeter);
  near("and so Wombat's footprint: the length", r.geometry.length, f.width, 1e-9);
  near("and the width", r.geometry.width, f.length, 1e-9);
  const flag = r.geometry.perimeterFromWombat === true;
  if (!flag) ok = false;
  console.log(`${flag ? "ok  " : "FAIL"} the result says the perimeter came from Wombat`);
}
const typed = basesimpFor({ ...house, "ground.basesimp.exposedPerimeter": 30 });
near("a typed G.4.6 wins (30 m of the outline exposed)", typed.geometry?.perimeter, 30);

console.log(ok ? "\nall pass" : "\nFAILED");
process.exit(ok ? 0 : 1);
