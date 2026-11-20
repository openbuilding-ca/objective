/**
 * An input a method could not give makes every node that reads it Unavailable, without a browser.
 *
 *   node test/unavailablePropagates.test.cjs
 *
 * The witness for 2026-11-19: Hemmingford (case 03) under F280 Mode On had no BASESIMP slab method, its
 * annual ground loss was Unavailable, and 24 nodes read that as 0 down to S01 (TEUI 53.8 -> 1.6). The rule
 * lives in the engines (MultiModelEngine.computeNode, IncrementalEngine._computeNode): a node with an
 * Unavailable input is Unavailable without running, unless it declares acceptsUnavailable. Fake graph and
 * state, the real engine.
 */
const path = require("path");

global.window = { TEUI: {} };
global.performance = global.performance || { now: () => Date.now() };
require(path.join(__dirname, "..", "src/core/model/MultiModelEngine.js"));

const num = v => (typeof v === "number" ? v : parseFloat(v) || 0); // the parseNum habit that read Unavailable as 0
const nodes = {
  "ground.loss": { id: "ground.loss", dependencies: ["ground.input"], compute: i => (i["ground.input"] > 0 ? i["ground.input"] : "Unavailable") },
  "envelope.total": { id: "envelope.total", dependencies: ["ground.loss", "air.loss"], compute: i => num(i["ground.loss"]) + num(i["air.loss"]) },
  "energy.teui": { id: "energy.teui", dependencies: ["envelope.total"], compute: i => num(i["envelope.total"]) / 100 },
  "display.dash": {
    id: "display.dash", dependencies: ["ground.loss"], acceptsUnavailable: true,
    compute: i => (i["ground.loss"] === "Unavailable" ? "—" : String(i["ground.loss"])),
  },
};
const order = ["ground.loss", "envelope.total", "energy.teui", "display.dash"];
const graph = { getNode: id => nodes[id], getFullComputationOrder: () => order };
const store = new Map();
const state = {
  getValueForModel: (m, k) => store.get(`${m}|${k}`),
  setValueForModel: (m, k, v) => store.set(`${m}|${k}`, v),
};
const engine = window.TEUI.MultiModelEngine.create({ state, graph });

let ok = true;
const check = (what, got, want) => {
  const pass = got === want;
  if (!pass) ok = false;
  console.log(`${pass ? "ok  " : "FAIL"} ${what}${pass ? "" : `: got ${got}, want ${want}`}`);
};

state.setValueForModel("t", "air.loss", 300);
state.setValueForModel("t", "ground.input", 700);
engine.computeAllForModel("t");
check("a method that runs: the total", state.getValueForModel("t", "envelope.total"), 1000);
check("a method that runs: the TEUI", state.getValueForModel("t", "energy.teui"), 10);

state.setValueForModel("t", "ground.input", 0); // the method cannot run
engine.computeAllForModel("t");
check("the method's own node", state.getValueForModel("t", "ground.loss"), "Unavailable");
check("its reader is Unavailable, not 300 (ground read as 0)", state.getValueForModel("t", "envelope.total"), "Unavailable");
check("and two hops down, not 3", state.getValueForModel("t", "energy.teui"), "Unavailable");
check("a node that declares acceptsUnavailable runs and handles it", state.getValueForModel("t", "display.dash"), "—");

console.log(ok ? "\nall pass" : "\nFAILED");
process.exit(ok ? 0 : 1);
