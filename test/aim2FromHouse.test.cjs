/**
 * AIM-2 runs on any house OBJECTIVE models, without a browser.
 *
 *   node test/aim2FromHouse.test.cjs
 *
 * The witness for 2026-11-19 (Andy: "I'd like to actually see what F280 gives us if run as an annual
 * model like OBJECTIVE ... but we need it to work first (not 'unavailable')"). No case study carried
 * AIM-2's B.19.4 or a Custom B.19.3, so AIM-2 stopped on every one of them. Now, blank:
 *   B.19.4 the highest ceiling above grade = storeys (d_103) x S12's Typ. F2F Ht. (g_106; Andy: "It's
 *          Typ. F2F Ht. in S12");
 *   B.19.3 the Custom ELA = B.18.2's ACH50 at AIM2's nearest prescribed type's flow exponent, the ELA
 *          S12 B.18.4 (NLA10) already takes without a measured one.
 * A typed value still wins, and the result says which were derived.
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/Openings.js")); // the opening rows, read by the node files
for (const f of ["src/core/Aim2Data.js", "src/core/Aim2.js", "src/core/F280Weather.js", "src/sections/nodes/VolumeMetricsNodes.js"]) {
  require(path.join(__dirname, "..", f));
}
const nodes = [];
window.TEUI.ComputationNodes.VolumeMetrics.register({ registerNode: n => nodes.push(n), registerInputs: () => {} });
const aim2 = nodes.find(n => n.id === "airTightness.aim2");
const A = window.TEUI.Aim2;

let ok = true;
const check = (what, cond, detail) => {
  if (!cond) ok = false;
  console.log(`${cond ? "ok  " : "FAIL"} ${what}${cond ? "" : `: ${detail}`}`);
};

// Hemmingford's house (case 03): 1.5 storeys, 453 m3, ACH50 0.6, nothing typed in B.19.3 / B.19.4
const house = {
  "volume.conditioned": 453, "volume.numStoreys": 1.5, "volume.floorToFloorHeight": 2.7,
  "airTightness.ach50Target": 0.6, "aim2.tightness": "Custom", "aim2.ela": 0, "aim2.ceilingHeight": 0,
  "climate.location.province": "QC", "climate.location.city": "Hemmingford",
  "climate.temperature.coldest": -24, "climate.temperature.hottest": 30, "ventilation.volumetricRate": 40,
};
const r = aim2.compute(house);
check("runs with B.19.3 and B.19.4 blank", !r.error, r.error);
if (!r.error) {
  check("height = storeys x Typ. F2F Ht. = 4.05 m", Math.abs(r.inputs.ceilingHeight - 1.5 * 2.7) < 1e-12, r.inputs.ceilingHeight);
  const ela = A.elaFromAch50(0.6, 453, A.typicalN(0.6).n);
  check(`ELA from the ACH50 = ${ela.toFixed(2)} cm2`, Math.abs(r.inputs.ela - ela) < 1e-12, r.inputs.ela);
  check("the result names both as derived", r.derived.ceilingHeight && r.derived.ela, JSON.stringify(r.derived));
}

const typed = aim2.compute({ ...house, "aim2.ceilingHeight": 5.53, "aim2.ela": 394 });
check("a typed B.19.4 wins", typed.inputs?.ceilingHeight === 5.53, typed.inputs?.ceilingHeight);
check("a typed B.19.3 wins", typed.inputs?.ela === 394, typed.inputs?.ela);
check("typed values are not called derived", !typed.derived.ceilingHeight && !typed.derived.ela, JSON.stringify(typed.derived));

check("no wall H: storeys x F2F, and the result says so", r.derived?.ceilingHeightFrom === "storeys x F2F", r.derived?.ceilingHeightFrom);

// B.19.4 blank from S11's walls (Andy 2026-11-20): the tallest above-grade wall's H + the basement wall's
// height above grade (B.9's H less G.4.5's depth). F280-1: its stair wall 17.17 ft + 7.75 - 6.75 ft of
// basement = 5.538 m, the 5.53 m Annex G gives (0.30 + 2.77 + 2.46).
const FT = 0.3048;
const walls = { ...house, "transmissionLoss.walls.maxHeight": 17.17 * FT, "transmissionLoss.wallsBelowGrade.height": 7.75 * FT, "ground.basesimp.depth": 6.75 * FT };
const fromWalls = aim2.compute(walls);
check("S11's walls: the tallest wall + the basement above grade = 5.538 m",
  Math.abs(fromWalls.inputs?.ceilingHeight - (17.17 + 1) * FT) < 1e-12, fromWalls.inputs?.ceilingHeight);
check("and the result says so", fromWalls.derived?.ceilingHeightFrom === "S11 walls", fromWalls.derived?.ceilingHeightFrom);
const slab = aim2.compute({ ...walls, "transmissionLoss.wallsBelowGrade.height": 0 });
check("a slab (no B.9 H): the tallest wall alone", Math.abs(slab.inputs?.ceilingHeight - 17.17 * FT) < 1e-12, slab.inputs?.ceilingHeight);
const typedOverWalls = aim2.compute({ ...walls, "aim2.ceilingHeight": 5.53 });
check("a typed B.19.4 still wins over the walls", typedOverWalls.inputs?.ceilingHeight === 5.53 && typedOverWalls.derived.ceilingHeightFrom === "typed",
  JSON.stringify(typedOverWalls.derived));

const noAch = aim2.compute({ ...house, "airTightness.ach50Target": 0 });
check("no ACH50 and no ELA: an error naming both, never a number", /B\.19\.3/.test(noAch.error || "") && /B\.18\.2/.test(noAch.error || ""), noAch.error);

console.log(ok ? "\nall pass" : "\nFAILED");
process.exit(ok ? 0 : 1);
