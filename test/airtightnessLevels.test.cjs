/**
 * S12 B.18.1's Airtightness Levels against NBC 2025 Tables 9.36.5.4.-A and -B, without a browser.
 *
 *   node test/airtightnessLevels.test.cjs
 *
 * The witness for 2026-11-19: the NRL50 preset table had AL-2B 0.94, AL-3B 0.70, AL-4B 0.47 where the
 * code says 0.98, 0.78, 0.59, and no AL-5A, AL-5B or AL-6B, though the B.18.1 dropdown offers them;
 * those fell back to AL-1B's 1.17, the loosest level. Two checks: every level the dropdown offers
 * resolves (read from Section12.js's own options), and each level's NRL50 is the code's.
 */
const fs = require("fs");
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/sections/nodes/VolumeMetricsNodes.js"));
const nodes = [];
window.TEUI.ComputationNodes.VolumeMetrics.register({ registerNode: n => nodes.push(n), registerInputs: () => {} });
const nrl50 = nodes.find(n => n.id === "airTightness.nrl50");

// NBC 2025 Div. B, Table 9.36.5.4.-A (guarded) and -B (unguarded): NLR50, L/s.m2, maximum.
const NBC_2025_NLR50 = {
  "AL-1A": 0.89, "AL-2A": 0.71, "AL-3A": 0.53, "AL-4A": 0.35, "AL-5A": 0.21,
  "AL-1B": 1.17, "AL-2B": 0.98, "AL-3B": 0.78, "AL-4B": 0.59, "AL-5B": 0.39, "AL-6B": 0.23,
};

let ok = true;
const check = (what, cond, detail) => {
  if (!cond) ok = false;
  console.log(`${cond ? "ok  " : "FAIL"} ${what}${cond ? "" : `: ${detail}`}`);
};

const s12 = fs.readFileSync(path.join(__dirname, "..", "src/sections/Section12.js"), "utf8");
const offered = [...s12.matchAll(/{ value: "(AL-\d[AB])", name:/g)].map(m => m[1]);
check("the dropdown offers all eleven levels", offered.length === 11 && new Set(offered).size === 11, offered.join(" "));

for (const level of offered) {
  let got;
  try {
    got = nrl50.compute({ "airTightness.method": level, "volume.conditioned": "730.3", "envelope.airFacing.area": 414.285 });
  } catch (e) {
    got = e.message;
  }
  check(`${level} NRL50 ${NBC_2025_NLR50[level]}`, got === NBC_2025_NLR50[level], `got ${got}`);
}

// B.18.4 (d_110) is NLA10 in cm2/m2 (Andy 2026-11-19): the ELA in effect / the air-facing area; m_110's
// basis is the level's NLA10 maximum, none for Measured or a PH preset.
const NBC_2025_NLA10 = {
  "AL-1A": 1.20, "AL-2A": 0.96, "AL-3A": 0.72, "AL-4A": 0.48, "AL-5A": 0.29,
  "AL-1B": 1.92, "AL-2B": 1.6, "AL-3B": 1.28, "AL-4B": 0.96, "AL-5B": 0.64, "AL-6B": 0.38,
};
const limit = nodes.find(n => n.id === "airTightness.nla10Limit");
for (const level of offered) {
  const got = limit.compute({ "airTightness.method": level });
  check(`${level} NLA10 maximum ${NBC_2025_NLA10[level]}`, got === NBC_2025_NLA10[level], `got ${got}`);
}
for (const m of ["MEASURED", "PH_CLASSIC", "PH_LOW", "PH_PLUS"]) {
  check(`${m} names no NBC level`, limit.compute({ "airTightness.method": m }) === 0, "a limit");
}
const nla10 = nodes.find(n => n.id === "airTightness.nla10");
// F280-1 under AIM-2: its Energy Tight ELA 394.3 cm2 (rounded in AIM2.xls's label) over 414.285 m2
const aim2 = { design: { ela: 394.3 } };
const f280 = nla10.compute({ "airTightness.infiltrationMethodInEffect": "AIM2", "airTightness.aim2": aim2, "envelope.airFacing.area": 414.285,
  "airTightness.ach50Target": 1.5, "volume.conditioned": 730.3 });
check("F280-1's NLA10 = 394.3 / 414.285 cm2/m2", f280 === 394.3 / 414.285, `got ${f280}`);

let threw = false;
try {
  nrl50.compute({ "airTightness.method": "AL-9Z" });
} catch (_) {
  threw = true;
}
check("an unknown level is an error, not AL-1B", threw, "it returned a value");

if (!ok) process.exit(1);
console.log("all pass");
