/**
 * S21 F280 Mode's two streams (Andy 2026-11-19), without a browser.
 *
 *   node test/f280Mode.test.cjs
 *
 * The annual stream reads ground.methodInEffect / airTightness.infiltrationMethodInEffect: BASESIMP and
 * AIM-2 under F280 Mode On, OBJECTIVE's under Off (the selectors G.4.3 / B.19.1 retired 2026-11-19). The
 * F280 stream's air-leakage nodes read no selector at all. (The browser half - Off moves the annual
 * figures and not S21 - is in test/f280WholeHouse.spec.cjs.)
 */
const path = require("path");

global.window = { TEUI: {} };
require(path.join(__dirname, "..", "src/core/Openings.js")); // the opening rows, read by the node files
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
// F280 Mode alone chooses the annual methods (Andy 2026-11-19: the master toggle activates every F280
// option); the per-method selectors G.4.3 / B.19.1 are retired, so the nodes read only the mode.
for (const [mode, want] of [["Off", "OBJECTIVE"], ["On", "BASESIMP"], [undefined, "OBJECTIVE"]]) {
  check(`ground: mode ${mode}`, ground.compute({ "f280.mode": mode }), want);
}
for (const [mode, want] of [["Off", "OBJECTIVE"], ["On", "AIM2"], [undefined, "OBJECTIVE"]]) {
  check(`infiltration: mode ${mode}`, leak.compute({ "f280.mode": mode }), want);
}
check("the annual methods read the mode alone", [ground, leak].every(n => n.dependencies.join() === "f280.mode"), true);
for (const id of ["f280.peakInfiltrationHeatLoss", "f280.peakInfiltrationHeatGain", "f280.peakEnvelopeHeatLoss"]) {
  const deps = node(id).dependencies;
  check(`${id} reads no selector`, deps.some(d => /method/i.test(d)), false);
}

if (!ok) process.exit(1);
console.log("all pass");
