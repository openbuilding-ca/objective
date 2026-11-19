// @ts-check
/**
 * The Reference's code values are DEFAULTS, not locks (Andy 2026-11-19, "Yes").
 *
 *   npx playwright test test/referenceDefaults.spec.cjs --config=playwright.config.cjs
 *
 * 1. Mirror All Inputs makes the Reference the Target's twin: every computed node equal. Before, a heat
 *    pump that heats and cools ran the Reference at the standard's minimum COPc whatever it held (3.30
 *    against the Target's 2.66 on the sample: TEUI 90.0 vs 93.1, Andy's check), and its cooling
 *    set-point at 24 whatever its override.
 * 2. Set on the Reference alone - M.3.3 2.66 and the cooling override 26 - they move the Reference and
 *    leave the Target.
 */
const { test, expect } = require("@playwright/test");
const path = require("path");
const { spawn } = require("child_process");

let URL = process.env.F280_URL;
let server = null;
test.beforeAll(async ({}, testInfo) => {
  if (process.env.F280_URL) return;
  const PORT = 8782 + testInfo.parallelIndex;
  URL = `http://127.0.0.1:${PORT}/index.html`;
  server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: path.join(__dirname, ".."), stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(URL)).ok) return;
    } catch (_) {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 100));
  }
  throw new Error(`no server at ${URL}`);
});
test.afterAll(() => server && server.kill());

async function open(page) {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto(URL);
  await auto;
  await page.waitForTimeout(2000);
}

const both = (page, key) =>
  page.evaluate((k) => {
    const ci = window.TEUI.ComputationIntegration, s = ci.getState(), r = ci.getRefModelId(), t = s.getModelIds().find((i) => i !== r);
    return [s.getValueForModel(t, k), s.getValueForModel(r, k)];
  }, key);

test("Mirror All Inputs: the Reference computes as the Target", async ({ page }) => {
  await open(page);
  await page.evaluate(() => document.getElementById("mirrorAllInputsBtn").click());
  await expect
    .poll(async () => {
      const [t, r] = await both(page, "energy.teui.targeted");
      return t === r;
    }, { timeout: 15000 })
    .toBe(true);
  const differing = await page.evaluate(() => {
    const ci = window.TEUI.ComputationIntegration, s = ci.getState(), g = ci.getGraph(), r = ci.getRefModelId(), t = s.getModelIds().find((i) => i !== r);
    return g.getAllNodeIds().filter((id) => JSON.stringify(s.getValueForModel(t, id)) !== JSON.stringify(s.getValueForModel(r, id)));
  });
  expect(differing).toEqual([]);
});

test("a COPc and a cooling override set on the Reference move the Reference only", async ({ page }) => {
  await open(page);
  const [teuiT] = await both(page, "energy.teui.targeted");
  await page.evaluate(() => {
    window.TEUI.StateManager.setValue("ref_j_116", "2.66", "user-modified");
    window.TEUI.StateManager.setValue("ref_l_24", "26", "user-modified");
  });
  await expect.poll(async () => (await both(page, "mechanical.cooling.effectiveCop"))[1], { timeout: 15000 }).toBe(2.66);
  await expect.poll(async () => (await both(page, "climate.cooling.setpoint"))[1], { timeout: 15000 }).toBe(26);
  expect((await both(page, "climate.cooling.setpoint"))[0]).toBe(24);
  expect((await both(page, "energy.teui.targeted"))[0]).toBe(teuiT);
});
