/**
 * BASESIMP's basement wall height from S11's below-grade wall rows' H - no browser.
 *
 *   node test/basesimpHeight.test.cjs
 *
 * Andy 2026-11-20: "take Ht. from the Bsmt wall ht". transmissionLoss.wallsBelowGrade.height is the
 * area-weighted H of the rows typed Wall below grade that give one (an H and an area); BASESIMP's wall
 * height is that, and with none given it stays the walls' area over the exposed perimeter, as before. The
 * house is F280-1's basement (Table G.1.5 a: (86.69 + 66.63) ft x 7.75 ft, depth 6.75 ft; BCIN_1).
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/Openings.js")); // the envelope rows, read by the node files
for (const f of ["src/core/BasesimpData.js", "src/core/Basesimp.js", "src/core/F280Weather.js",
  "src/sections/nodes/TransmissionLossNodes.js"]) {
  require(path.join(__dirname, "..", f));
}
const nodes = [];
window.TEUI.ComputationNodes.TransmissionLoss.register({ registerNode: n => nodes.push(n), registerInputs: () => {} });
const height = nodes.find(n => n.id === "transmissionLoss.wallsBelowGrade.height");
const { basesimpFor } = window.TEUI.ComputationNodes.TransmissionLoss;

let ok = true;
const near = (what, got, want, tol = 1e-9) => {
  const pass = typeof got === "number" && Math.abs(got - want) <= tol;
  if (!pass) ok = false;
  console.log(`${pass ? "ok  " : "FAIL"} ${what}${pass ? "" : `: got ${got}, want ${want}`}`);
};
const check = (what, pass) => {
  if (!pass) ok = false;
  console.log(`${pass ? "ok  " : "FAIL"} ${what}`);
};

// The height node: B.9 (opaque94) and a second below-grade row (opaque95a), B.10 the slab (opaque95)
const rows = {
  "transmissionLoss.opaque94.type": "wallsBelowGrade", "transmissionLoss.opaque94.area": 50, "transmissionLoss.opaque94.height": 2.36,
  "transmissionLoss.opaque95a.type": "wallsBelowGrade", "transmissionLoss.opaque95a.area": 30, "transmissionLoss.opaque95a.height": 1.5,
  "transmissionLoss.opaque95.type": "slabOnGrade", "transmissionLoss.opaque95.area": 100, "transmissionLoss.opaque95.height": 0.3,
};
near("two walls with H: their area-weighted H", height.compute(rows), (50 * 2.36 + 30 * 1.5) / 80);
near("a slab's H is not a wall's", height.compute({ ...rows, "transmissionLoss.opaque95a.area": 0 }), 2.36);
near("a wall with no H does not count", height.compute({ ...rows, "transmissionLoss.opaque95a.height": 0 }), 2.36);
near("no H at all: 0 (BASESIMP keeps area / perimeter)", height.compute({ ...rows, "transmissionLoss.opaque94.height": 0, "transmissionLoss.opaque95a.height": 0 }), 0);

// The walls' TALLEST H (S12 B.19.4's, Andy 2026-11-20): over the above-grade wall rows with an area
const maxHeight = nodes.find(n => n.id === "transmissionLoss.walls.maxHeight");
const facades = {
  "transmissionLoss.opaque86.type": "walls", "transmissionLoss.opaque86.area": 100, "transmissionLoss.opaque86.height": 5.23,
  "transmissionLoss.opaque87a.type": "walls", "transmissionLoss.opaque87a.area": 20, "transmissionLoss.opaque87a.height": 2.77,
  "transmissionLoss.opaque87b.type": "walls", "transmissionLoss.opaque87b.area": 0, "transmissionLoss.opaque87b.height": 9,
  "transmissionLoss.opaque85.type": "roof", "transmissionLoss.opaque85.area": 80, "transmissionLoss.opaque85.height": 12,
};
near("the tallest wall with an area (5.23; not the arealess 9, not the roof's 12)", maxHeight.compute(facades), 5.23);
near("no wall H: 0", maxHeight.compute({ ...facades, "transmissionLoss.opaque86.height": 0, "transmissionLoss.opaque87a.height": 0 }), 0);

// BASESIMP on F280-1's basement: 110.39 m2 of wall; a typed perimeter 2 x 2 m short of the walls' own run, so
// area / perimeter and the walls' H differ and the source is seen
const FT = 0.3048;
const wallArea = (86.69 + 66.63) * FT * 7.75 * FT;
const perimeter = (86.69 + 66.63) * FT - 4;
const house = {
  "ground.basesimp.configuration": 1, "transmissionLoss.slabOnGrade.area": 90.311, "transmissionLoss.wallsBelowGrade.area": wallArea,
  "transmissionLoss.slabOnGrade.rsi": 0.216, "transmissionLoss.wallsBelowGrade.rsi": 2.76, "ground.basesimp.soilConductivity": 0.85,
  "ground.basesimp.waterTable": 8, "ground.basesimp.depth": 6.75 * FT, "ground.basesimp.exposedPerimeter": perimeter,
  "climate.location.province": "ON", "climate.location.city": "Ottawa (Orléans)",
  "climate.heating.obcSetpoint": 22, "climate.cooling.setpoint": 24, "climate.temperature.coldest": -26,
  "climate.temperature.hottest": 30, "climate.coolingDays": 120, "climate.heating.setpoint": 22,
  "climate.temperature.winterAverage": -4,
};
const before = basesimpFor({ ...house, "transmissionLoss.wallsBelowGrade.height": 0 });
check(`no H: BASESIMP runs (${before.error || "ok"})`, !before.error);
near("no H: the height is area / perimeter, as before", before.geometry?.height, wallArea / perimeter);
check("and says so", before.geometry?.heightFrom === "area / perimeter");
const withH = basesimpFor({ ...house, "transmissionLoss.wallsBelowGrade.height": 7.75 * FT });
check(`H given: BASESIMP runs (${withH.error || "ok"})`, !withH.error);
near("H given: the height is the walls' H (7.75 ft)", withH.geometry?.height, 7.75 * FT);
check("and says so", withH.geometry?.heightFrom === "S11 H");
check(`the height moves the loss (${before.heatingLoad?.toFixed?.(1)} W -> ${withH.heatingLoad?.toFixed?.(1)} W)`,
  Number.isFinite(before.heatingLoad) && Number.isFinite(withH.heatingLoad) && before.heatingLoad !== withH.heatingLoad);
const shallow = basesimpFor({ ...house, "transmissionLoss.wallsBelowGrade.height": 1.5 });
check(`a depth below grade deeper than the walls' H is an error, never a number (${shallow.error})`,
  typeof shallow.error === "string" && /at most the wall height 1\.50/.test(shallow.error));

console.log(ok ? "\nall pass" : "\nFAILED");
process.exit(ok ? 0 : 1);
