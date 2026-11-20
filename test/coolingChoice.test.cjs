/**
 * The cooling choice (M.3.0, d_116) and what reads it, without a browser.
 *
 *   node test/coolingChoice.test.cjs
 *
 * Andy 2026-11-18: three options - "Heatpump Heats & Cools" (the heat pump
 * cools at M.1.3 COPcool, derived from HSPF; offered only when M.1.0 is
 * Heatpump), "Separate Cooling" (a unit of its own at M.3.3 COPcool, beside
 * any heating, a heat pump that only heats included), "No Cooling".
 *
 *   M.3.0                  | cools at | M.1.6 sink        | M.3.4 sink        | M.3.6 CEER
 *   Heatpump Heats & Cools | M.1.3    | elec x (M.1.3-1)  | 0                 | 3.412 x M.1.3
 *   Separate Cooling       | M.3.3    | 0                 | elec x (M.3.3-1)  | 3.412 x M.3.3
 *   No Cooling             | -        | 0                 | 0                 | 0
 *
 * M.1.5 CEER is always 3.412 x M.1.3. Files before 2026-11-18 store "Cooling":
 * on a heat pump the heat pump cools, otherwise a separate unit.
 *
 * The witness for the sinks and CEERs: M.1.5, M.1.6 and M.3.6 read
 * "mechanical.cooling.cop", which nothing defines, so they used the 2.66
 * fallback at every HSPF - M.1.6 showed 94,351 kWh at HSPF 7.1 (elec
 * 56,838 x 1.66) where 56,838 x 0.0809 = 4,598 is right.
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/sections/nodes/MechanicalNodes.js"));
const CS = window.TEUI.CoolingSystem;
const nodes = window.TEUI.ComputationNodes.Mechanical.nodes;
const node = id => {
  const found = nodes.filter(n => n.id === id);
  if (found.length !== 1) throw new Error(`${found.length} nodes named ${id}`);
  return found[0];
};

const HP = CS.HEATPUMP;
const SEP = CS.SEPARATE;
const NONE = CS.NONE;

let ok = true;
function check(name, got, want) {
  const pass =
    typeof want === "number"
      ? Math.abs(Number(got) - want) < 1e-6
      : got === want;
  ok = ok && pass;
  console.log(`  ${pass ? "ok  " : "FAIL"} ${name}: ${got} (want ${want})`);
}

// --- the names, and an old file's "Cooling" -----------------------------
console.log("normalize:");
check("names", [HP, SEP, NONE].join(" | "), "Heatpump Heats & Cools | Separate Cooling | No Cooling");
check("old Cooling on a heat pump", CS.normalize("Cooling", "Heatpump"), HP);
check("old Cooling on gas", CS.normalize("Cooling", "Gas"), SEP);
check("old Cooling on electricity", CS.normalize("Cooling", "Electricity"), SEP);
check("heat pump option without a heat pump", CS.normalize(HP, "Oil"), SEP);
check("separate beside a heat pump stays", CS.normalize(SEP, "Heatpump"), SEP);
check("no cooling stays", CS.normalize(NONE, "Heatpump"), NONE);
check("unset on a heat pump", CS.normalize(undefined, "Heatpump"), HP);
check("unset on gas", CS.normalize(null, "Gas"), SEP);

// --- M.3.3 when Separate Cooling is chosen -------------------------------
// The standard's minimum fills it, except back from No Cooling with a COPc of
// its own there. The witness: M.3.3 typed as 4.20, a look at No Cooling and
// back - it was refilled with 3.30, and the cooling electricity rose unseen.
console.log("seedsCopCool:");
check("leaving the heat pump option: filled", CS.seedsCopCool(HP, "2.66", "default"), true);
check("leaving the heat pump option, an old COPc stored: filled", CS.seedsCopCool(HP, "4.2", "user-modified"), true);
check("leaving an old Cooling: filled", CS.seedsCopCool("Cooling", "4.2", "imported"), true);
check("the choice being left unknown: filled", CS.seedsCopCool(undefined, "4.2", "user-modified"), true);
check("back from No Cooling, typed 4.20: stays", CS.seedsCopCool(NONE, "4.2", "user-modified"), false);
check("back from No Cooling, a file's COPc: stays", CS.seedsCopCool(NONE, "3.85", "imported"), false);
// an earlier fill is stored as "user-modified" too - it stays, the same value
check("back from No Cooling, an earlier fill: stays", CS.seedsCopCool(NONE, "3.3", "user-modified"), false);
// the Reference model's inputs are synced back to ref_j_116 as "calculated"
check("back from No Cooling, the Reference's own: stays", CS.seedsCopCool(NONE, 5.1, "calculated"), false);
check("from No Cooling, the untouched default: filled", CS.seedsCopCool(NONE, "2.66", "default"), true);
check("from No Cooling, a No Cooling file's 0.00: filled", CS.seedsCopCool(NONE, "0.00", "imported"), true);
check("from No Cooling, blank: filled", CS.seedsCopCool(NONE, "", "imported"), true);
check("from No Cooling, nothing stored: filled", CS.seedsCopCool(NONE, null, undefined), true);

// --- the COP the model cools at ------------------------------------------
console.log("effectiveCop:");
const effectiveCop = node("mechanical.cooling.effectiveCop");
const base = {
  "mechanical.heating.systemType": "Heatpump",
  "mechanical.heating.copCoolDerived": 1.0809, // HSPF 7.1
  "mechanical.cooling.copDedicated": 4.25,
  "model.isReference": false,
  "model.referenceCopCool": "3.3",
};
const cop = over => effectiveCop.compute({ ...base, ...over });
check("HP cools: M.1.3", cop({ "mechanical.cooling.systemType": HP }), 1.0809);
check("old Cooling on HP: M.1.3", cop({ "mechanical.cooling.systemType": "Cooling" }), 1.0809);
check("separate beside a heat pump: M.3.3", cop({ "mechanical.cooling.systemType": SEP }), 4.25);
check(
  "separate beside gas: M.3.3",
  cop({ "mechanical.cooling.systemType": SEP, "mechanical.heating.systemType": "Gas" }),
  4.25
);
check(
  "old Cooling on gas: M.3.3",
  cop({ "mechanical.cooling.systemType": "Cooling", "mechanical.heating.systemType": "Gas" }),
  4.25
);
check("no cooling: 0", cop({ "mechanical.cooling.systemType": NONE }), 0);
check(
  "reference, HP cools: the standard's minimum",
  cop({ "mechanical.cooling.systemType": HP, "model.isReference": true }),
  3.3
);
check(
  "reference, separate: its M.3.3",
  cop({ "mechanical.cooling.systemType": SEP, "model.isReference": true }),
  4.25
);

// --- sinks and CEERs, read off the COP in effect ------------------------
console.log("sinks and CEERs:");
const sinkHP = node("mechanical.cooling.sinkEnergy"); // l_114, M.1.6
const sinkSep = node("mechanical.cooling.coolingSink"); // l_116, M.3.4
const ceerHP = node("mechanical.heating.ceer"); // j_114, M.1.5
const ceerCool = node("mechanical.cooling.ceer"); // j_117, M.3.6
const elec = 56837.9985; // HSPF 7.1, the default building
function row(coolingType, heatingType, copInEffect) {
  const inputs = {
    "mechanical.cooling.systemType": coolingType,
    "mechanical.heating.systemType": heatingType,
    "mechanical.cooling.electricalDemand": elec,
    "mechanical.cooling.effectiveCop": copInEffect,
    "mechanical.heating.copCoolDerived": 1.0809,
  };
  return {
    m16: sinkHP.compute(inputs),
    m34: sinkSep.compute(inputs),
    m15: ceerHP.compute(inputs),
    m36: ceerCool.compute(inputs),
  };
}
const hp = row(HP, "Heatpump", 1.0809);
check("HP cools: M.1.6 = elec x (M.1.3 - 1)", hp.m16, elec * 0.0809);
check("HP cools: M.3.4 = 0", hp.m34, 0);
check("HP cools: M.3.6 = 3.412 x M.1.3", hp.m36, 3.69);
check("M.1.5 = 3.412 x M.1.3 (not the 2.66 fallback's 9.08)", hp.m15, 3.69);
const sep = row(SEP, "Heatpump", 4.25);
check("separate: M.1.6 = 0", sep.m16, 0);
check("separate: M.3.4 = elec x (M.3.3 - 1)", sep.m34, +(elec * 3.25).toFixed(2));
check("separate: M.3.6 = 3.412 x M.3.3", sep.m36, 14.5);
check("separate: M.1.5 still the heat pump's", sep.m15, 3.69);
const none = row(NONE, "Heatpump", 0);
check("no cooling: M.1.6 = 0", none.m16, 0);
check("no cooling: M.3.4 = 0", none.m34, 0);
check("no cooling: M.3.6 = 0", none.m36, 0);
const old = row("Cooling", "Gas", 2.67); // case 11
check("old Cooling on gas: M.3.4 is the separate sink", old.m34, +(elec * 1.67).toFixed(2));
check("old Cooling on gas: M.1.6 = 0", old.m16, 0);
// HSPF 12.5: M.1.3 = 2.6635, CEER 9.09 - both rows, the same rounding
const at125 = ceerHP.compute({ "mechanical.heating.copCoolDerived": 2.6635 });
check("M.1.5 at HSPF 12.5", at125, 9.09);
check(
  "M.3.6 at HSPF 12.5 when the heat pump cools",
  ceerCool.compute({ "mechanical.cooling.effectiveCop": 2.6635 }),
  9.09
);

console.log(ok ? "PASS" : "FAIL");
process.exit(ok ? 0 : 1);
