/**
 * S09 under S21 F280 Mode On holds CSA F280-12's internal gains (Andy 2026-11-19), without a browser.
 *
 *   node test/f280InternalGains.test.cjs
 *
 * Cl. 6.2.4: 70 W sensible per person. Cl. 6.2.5: 4 W/m2 of floor area, never under 800 W, for lights,
 * appliances and plug loads together - S09's plug load carries it, lighting (in effect) and equipment are 0.
 * Off: OBJECTIVE's own values, unchanged. And a 0 density is 0 in the annual figures (they read `|| 3` and
 * `|| 1.5`, which took a 0 for missing). The real nodes, a fake graph.
 */
const path = require("path");

global.window = { TEUI: { ComputationNodes: {} } };
require(path.join(__dirname, "..", "src/sections/nodes/F280ComplianceNodes.js")); // owns F280's figures
require(path.join(__dirname, "..", "src/sections/nodes/InternalGainsNodes.js"));
const nodes = {};
window.TEUI.ComputationNodes.InternalGains.register({ registerNode: n => (nodes[n.id] = n), registerInputs: () => {} });
const run = (id, inputs) => nodes[id].compute(inputs);

let ok = true;
const check = (what, got, want) => {
  const pass = typeof want === "number" ? Math.abs(got - want) < 1e-12 : got === want;
  if (!pass) ok = false;
  console.log(`${pass ? "ok  " : "FAIL"} ${what}${pass ? "" : `: got ${got}, want ${want}`}`);
};

const house = { "building.referenceStandard": "PH Classic", "building.majorOccupancy": "C-Residential", "internal.activityLevel": "Normal",
  "internal.efficiencySpec": "Regular", "internal.elevators": "No Elevators", "internal.lightingDensity": "1.5" };
const on = { ...house, "f280.mode": "On" };
const off = { ...house, "f280.mode": "Off" };

// Cl. 6.2.5: the 800 W floor below 200 m2, 4 W/m2 above it
check("plug, On, 151.5 m2 (Hemmingford): 800 W / A", run("internal.plugLoadDensity", { ...on, "building.conditionedFloorArea": "151.5" }), 800 / 151.5);
check("plug, On, 200 m2: exactly 4", run("internal.plugLoadDensity", { ...on, "building.conditionedFloorArea": "200" }), 4);
check("plug, On, 472.11 m2 (Port Credit): 4", run("internal.plugLoadDensity", { ...on, "building.conditionedFloorArea": "472.11" }), 4);
check("plug, On, no area: Unavailable", run("internal.plugLoadDensity", { ...on, "building.conditionedFloorArea": "0" }), "Unavailable");
check("equipment, On: 0", run("internal.equipmentDensity", on), 0);
check("lighting in effect, On: 0", run("internal.lightingDensity.inEffect", on), 0);
check("W/person, On: 70 (Cl. 6.2.4)", run("internal.occupants.wattsPerPerson", on), 70);

// Off (and a file with no mode): OBJECTIVE's own
for (const [name, m] of [["Off", off], ["no mode", house]]) {
  check(`plug, ${name}: PH Classic 2.1`, run("internal.plugLoadDensity", { ...m, "building.conditionedFloorArea": "151.5" }), 2.1);
  check(`equipment, ${name}: the table's`, run("internal.equipmentDensity", m) > 0, true);
  check(`lighting in effect, ${name}: the user's`, run("internal.lightingDensity.inEffect", m), "1.5");
  check(`W/person, ${name}: Normal`, run("internal.occupants.wattsPerPerson", m) > 70, true);
}

// The annual figures take a 0 as 0
const year = { "building.conditionedFloorArea": "151.5", "occupancy.occupiedHours": "4380" };
check("equipment kWh at 0 W/m2", run("internal.equipment.annual", { ...year, "internal.equipmentDensity": 0 }), 0);
check("lighting kWh at 0 W/m2", run("internal.lighting.annual", { ...year, "internal.lightingDensity.inEffect": 0 }), 0);
check("plug kWh at 800 / A: 800 W x 4380 h", run("internal.plugLoads.annual", { ...year, "internal.plugLoadDensity": 800 / 151.5 }), 3504);

// S21's design-hour gain takes Cl. 6.2.4 / 6.2.5 itself, whatever the mode (S21 computes F280's way; the
// harness holds Mode Off never moving S21): Hemmingford's 3 people and 151.5 m2, every other term 0
const f280 = {};
window.TEUI.ComputationNodes.F280Compliance.register({ registerNode: n => (f280[n.id] = n), registerInputs: () => {} });
const gain = f280["f280.totalSensibleHeatGain"];
const zero = { "energy.peakCooling.enclosureKw": 0, "f280.peakSolarHeatGain": 0, "f280.peakInfiltrationHeatGain": 0,
  "f280.peakVentilationHeatGain": 0, "f280.opaqueSolarCorrection": 0 };
check("S21 gain, 3 people, 151.5 m2: 800 + 3 x 70", gain.compute({ ...zero, "building.conditionedFloorArea": "151.5", "occupancy.occupants": "3" }), 1010);
check("S21 gain, 4 people, 472.11 m2: 4 x A + 4 x 70", gain.compute({ ...zero, "building.conditionedFloorArea": "472.11", "occupancy.occupants": "4" }), 4 * 472.11 + 280);
check("S21 gain reads no mode and no S09 density", gain.dependencies.some(d => d === "f280.mode" || d.startsWith("internal.")), false);

console.log(ok ? "\nALL PASS" : "\nFAILED");
process.exit(ok ? 0 : 1);
