/**
 * The V.1.4 ventilation check (m_119) and its rate table, without a browser.
 *
 *   node test/ventilationCheck.test.cjs
 *
 * Andy 2026-11-18: compare what the system delivers with what the code
 * requires of THIS building - OBC 2024 / NBC 2025 Art. 6.3.1.1.(2), ASHRAE
 * 62.1-2016's Ventilation Rate Procedure, Vbz = Rp x occupants + Ra x area,
 * Rp and Ra by the S02 space type (src/core/VentilationRates.js).
 *
 * The witness: the default building (A-Assembly, Volume by Schedule, ACH 3,
 * 8,319.5 m3, 1,427.2 m2, 126 occupants, 8.33 L/s per person) read 67% X -
 * its per-person 8.33 against the file's Reference 12.50, a rate the Volume
 * method never uses. Under 62.1 (auditorium seating, 2.5 / 0.3): required
 * 2.5 x 126 + 0.3 x 1,427.2 = 743.16 L/s; delivered 3 x 8,319.5 / 3.6 =
 * 6,932.92 L/s; 933%.
 */
const fs = require("fs");
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/VentilationRates.js"));
require(path.join(__dirname, "..", "src/sections/nodes/ComplianceNodes.js"));
const R = window.TEUI.VentilationRates;
const nodes = window.TEUI.ComputationNodes.Compliance.nodes;
const node = id => nodes.find(n => n.id === id);

let ok = true;
function check(name, got, want) {
  const pass = typeof want === "number" ? Math.abs(Number(got) - want) < 1e-6 : got === want;
  ok = ok && pass;
  console.log(`  ${pass ? "ok  " : "FAIL"} ${name}: ${got} (want ${want})`);
}

// --- the table ----------------------------------------------------------
console.log("table:");
const section02 = fs.readFileSync(path.join(__dirname, "..", "src/sections/Section02.js"), "utf8");
const d12Block = section02.slice(section02.indexOf('fieldId: "d_12"'), section02.indexOf('fieldId: "e_12"'));
const occupancies = [...d12Block.matchAll(/value: "([^"]+)",\s*name:/g)].map(m => m[1]);
check("B.1 offers 8 occupancies", occupancies.length, 8);
for (const occ of occupancies) {
  const list = R.byOccupancy[occ];
  check(`${occ} has space types`, Array.isArray(list) && list.length > 0, true);
  for (const t of list || []) {
    const row = R.spaceTypes[t];
    if (!row || !(row.rp >= 0) || !(row.ra >= 0)) check(`${occ} / ${t} is a table row with Rp, Ra`, false, true);
  }
}
check("every listed space type is a table row", Object.values(R.byOccupancy).flat().every(t => R.spaceTypes[t]), true);
// spot rows against 62.1-2016 Table 6.2.2.1 (SI)
check("auditorium Rp", R.spaceTypes["Auditorium seating area"].rp, 2.5);
check("auditorium Ra", R.spaceTypes["Auditorium seating area"].ra, 0.3);
check("gym Rp", R.spaceTypes["Gym, sports arena (play area)"].rp, 10);
check("gym Ra", R.spaceTypes["Gym, sports arena (play area)"].ra, 0.9);
check("office Ra", R.spaceTypes["Office space"].ra, 0.3);
check("sales Ra", R.spaceTypes["Sales (except as below)"].ra, 0.6);
check("pool: area only", R.spaceTypes["Swimming (pool & deck)"].rp + "/" + R.spaceTypes["Swimming (pool & deck)"].ra, "0/2.4");

// --- the space type in effect -------------------------------------------
console.log("resolve:");
check("A, empty: its default", R.resolve("A-Assembly", ""), "Auditorium seating area");
check("A, gym: kept", R.resolve("A-Assembly", "Gym, sports arena (play area)"), "Gym, sports arena (play area)");
check("D, a space A offers but D does not: D's default", R.resolve("D-Business & Personal Services", "Gym, sports arena (play area)"), "Office space");
check("C default", R.resolve("C-Residential", undefined), "Dwelling unit");

// --- the check ----------------------------------------------------------
console.log("V.1.4:");
const required = node("ventilation.requiredOutdoorAir");
const delivered = node("ventilation.deliveredOccupied");
const ratio = node("compliance.ventRate.ratio");
const building = {
  "building.majorOccupancy": "A-Assembly",
  "building.ventilationSpaceType": "",
  "occupancy.occupants": "126",
  "building.conditionedFloorArea": "1427.2",
  "mechanical.ventilation.method": "Volume by Schedule",
  "mechanical.ventilation.ach": "3",
  "mechanical.ventilation.ratePerPerson": "8.33",
  "volume.conditioned": "8319.5",
};
const req = required.compute(building);
check("required, default building (2.5 x 126 + 0.3 x 1427.2)", req, 743.16);
const delVol = delivered.compute(building);
check("delivered, Volume by Schedule = ACH x volume / 3.6 (no schedule)", delVol, 6932.92);
check("delivered, Volume Constant: the same", delivered.compute({ ...building, "mechanical.ventilation.method": "Volume Constant" }), 6932.92);
const delOcc = delivered.compute({ ...building, "mechanical.ventilation.method": "Occupant by Schedule" });
check("delivered, Occupant by Schedule = 8.33 x 126 (no schedule)", delOcc, 1049.58);
check("ratio, default building", ratio.compute({ "ventilation.deliveredOccupied": delVol, "ventilation.requiredOutdoorAir": req }), 933);
check("ratio, Occupant methods", ratio.compute({ "ventilation.deliveredOccupied": delOcc, "ventilation.requiredOutdoorAir": req }), 141);
const gym = required.compute({ ...building, "building.ventilationSpaceType": "Gym, sports arena (play area)" });
check("required, a gym (10 x 126 + 0.9 x 1427.2)", gym, 2544.48);
check("ratio, Occupant at 8.33 in a gym: fails", ratio.compute({ "ventilation.deliveredOccupied": delOcc, "ventilation.requiredOutdoorAir": gym }), 41);
check("no requirement (no people, no area): 100", ratio.compute({ "ventilation.deliveredOccupied": 0, "ventilation.requiredOutdoorAir": 0 }), 100);
check("m_119 no longer reads the Reference's per-person rate", ratio.dependencies.includes("reference.mechanical.ventilation.ratePerPerson"), false);

console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
