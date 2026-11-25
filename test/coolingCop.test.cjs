/**
 * The effective cooling COP (MechanicalNodes' mechanical.cooling.effectiveCop),
 * without a browser.
 *
 *   node test/coolingCop.test.cjs
 *
 * Andy 2026-10-31: "Reference COP is just the minimum whatever reference
 * standard tells us it must be, in Reference mode only. In target mode, HSPF
 * can determine the COPc for a shared Heating/Cooling system, or if gas or
 * another heating system is selected (Non-heat-pump) then a user can set
 * whatever COPc matches the equipment's nameplate efficiency."
 *
 * - No cooling: 0 in either mode (the load stands, unmet).
 * - Target, heat pump: the derived COPc, whatever j_116 says.
 * - Target, gas: the nameplate j_116.
 * - Reference, heat pump: the standard's minimum (model.referenceCopCool) -
 *   NOT j_116, which the CSV import skips for a heat pump and so can hold the
 *   previous project's value (the 0.00 of a No Cooling case).
 * - Reference, gas: its j_116, as before.
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/sections/nodes/MechanicalNodes.js"));
const node = window.TEUI.ComputationNodes.Mechanical.nodes.find(
  (n) => n.id === "mechanical.cooling.effectiveCop"
);

const base = {
  "mechanical.cooling.systemType": "Cooling",
  "mechanical.heating.systemType": "Heatpump",
  "mechanical.heating.copCoolDerived": 1.0809,
  "mechanical.cooling.copDedicated": 2.66,
  "model.isReference": false,
  "model.referenceCopCool": null,
};
const cases = [
  ["no cooling, target", { "mechanical.cooling.systemType": "No Cooling" }, 0],
  [
    "no cooling, reference",
    { "mechanical.cooling.systemType": "No Cooling", "model.isReference": true, "model.referenceCopCool": "3.3" },
    0,
  ],
  ["target heat pump: derived", {}, 1.0809],
  ["target gas: nameplate j_116", { "mechanical.heating.systemType": "Gas" }, 2.66],
  [
    "reference heat pump: the standard's minimum, not a stale j_116",
    { "model.isReference": true, "model.referenceCopCool": "3.3", "mechanical.cooling.copDedicated": "0.00" },
    3.3,
  ],
  [
    "reference gas: its j_116",
    { "model.isReference": true, "model.referenceCopCool": "3.3", "mechanical.heating.systemType": "Gas", "mechanical.cooling.copDedicated": "3.30" },
    3.3,
  ],
  [
    "target heat pump ignores a reference minimum",
    { "model.referenceCopCool": "3.3" },
    1.0809,
  ],
];

let ok = true;
for (const [name, over, want] of cases) {
  const got = node.compute({ ...base, ...over });
  const pass = Math.abs(Number(got) - want) < 1e-9;
  ok = ok && pass;
  console.log(`  ${pass ? "ok  " : "FAIL"} ${name}: ${got} (want ${want})`);
}
console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
