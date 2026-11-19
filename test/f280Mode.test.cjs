/**
 * S21 F280 Mode's two streams (Andy 2026-11-19), without a browser.
 *
 *   node test/f280Mode.test.cjs
 *
 * The annual stream reads ground.methodInEffect / airTightness.infiltrationMethodInEffect: S03 G.4.3 /
 * S12 B.19.1's choice under F280 Mode On, OBJECTIVE's under Off whatever the hidden selector holds. The
 * F280 stream's air-leakage nodes read no selector at all. (The browser half - Off moves the annual
 * figures and not S21 - is in test/f280WholeHouse.spec.cjs.)
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/sections/nodes/F280ComplianceNodes.js"));
const nodes = [];
window.TEUI.ComputationNodes.F280Compliance.register({ registerNode: n => nodes.push(n), registerInputs: () => {} });
const node = id => {
  const found = nodes.filter(n => n.id === id);
  if (found.length !== 1) throw new Error(`${found.length} nodes named ${id}`);
  return found[0];
};

let ok = true;
const check = (what, got, want) => {
  const pass = got === want;
  if (!pass) ok = false;
  console.log(`${pass ? "ok  " : "FAIL"} ${what}${pass ? "" : `: got ${got}, want ${want}`}`);
};

const ground = node("ground.methodInEffect");
const leak = node("airTightness.infiltrationMethodInEffect");
for (const [mode, chosen, want] of [
  ["Off", "BASESIMP", "OBJECTIVE"], ["On", "BASESIMP", "BASESIMP"], ["On", "OBJECTIVE", "OBJECTIVE"], [undefined, "BASESIMP", "OBJECTIVE"],
]) {
  check(`ground: mode ${mode}, G.4.3 ${chosen}`, ground.compute({ "f280.mode": mode, "ground.method": chosen }), want);
}
for (const [mode, chosen, want] of [
  ["Off", "AIM2", "OBJECTIVE"], ["On", "AIM2", "AIM2"], ["On", "OBJECTIVE", "OBJECTIVE"], [undefined, "AIM2", "OBJECTIVE"],
]) {
  check(`infiltration: mode ${mode}, B.19.1 ${chosen}`, leak.compute({ "f280.mode": mode, "airTightness.infiltrationMethod": chosen }), want);
}
for (const id of ["f280.peakInfiltrationHeatLoss", "f280.peakInfiltrationHeatGain", "f280.peakEnvelopeHeatLoss"]) {
  const deps = node(id).dependencies;
  check(`${id} reads no selector`, deps.some(d => /method/i.test(d)), false);
}

if (!ok) process.exit(1);
console.log("all pass");
