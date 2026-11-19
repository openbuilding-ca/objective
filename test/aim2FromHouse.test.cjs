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

const noAch = aim2.compute({ ...house, "airTightness.ach50Target": 0 });
check("no ACH50 and no ELA: an error naming both, never a number", /B\.19\.3/.test(noAch.error || "") && /B\.18\.2/.test(noAch.error || ""), noAch.error);

console.log(ok ? "\nall pass" : "\nFAILED");
process.exit(ok ? 0 : 1);
