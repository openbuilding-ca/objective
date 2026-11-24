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
 * 3. Mirror Geometry copies the added rows' areas but not their U, SHGC or RSI, nor F280 Mode or the F280
 *    code inputs (Mark, #134: its row patterns were anchored to the original rows).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

async function open(page) {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto("/index.html"); // playwright.config.cjs's server (Mark, #134)
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

test("Mirror Geometry: the added rows' areas copy, their U, SHGC and RSI and F280 Mode do not", async ({ page }) => {
  await open(page);
  // A "CSA F280 Review Format" house: Target F280 Mode Off, Reference On
  const csv = fs.readFileSync(path.join(__dirname, "..", "src/template/case-studies/03-residence-phi-classic-f280.csv"), "utf8");
  await page.evaluate((text) => window.TEUI.FileHandler.processImportedCSV(text), csv);
  await page.waitForTimeout(1500);
  // On the Target: window row G.8.6 (S10 78a / S11 93a) at U 0.8, SHGC 0.25; opaque row 87a at RSI 9;
  // ATRE 0.9 - each with an area, so each is a real row
  const TARGET = { d_78a: "5", g_93a: "0.8", f_78a: "0.25", d_87a: "12", f_87a: "9", l_123: "0.9" };
  const KEPT = ["g_93a", "f_78a", "f_87a", "l_123", "f280_mode"];
  const before = await page.evaluate(({ target, kept }) => {
    const SM = window.TEUI.StateManager;
    for (const [id, v] of Object.entries(target)) SM.setValue(id, v, "user-modified");
    window.TEUI.Calculator.calculateAll();
    return Object.fromEntries(kept.map((id) => [id, String(SM.getValue(`ref_${id}`))]));
  }, { target: TARGET, kept: KEPT });
  expect(before.f280_mode).toBe("On");
  for (const id of KEPT.slice(0, 4)) expect(before[id], `the Reference's ${id} differs from the Target's`).not.toBe(TARGET[id]);

  await page.evaluate(() => document.getElementById("mirrorGeometryBtn").click());
  await page.waitForTimeout(1500);
  const after = await page.evaluate((ids) => {
    const SM = window.TEUI.StateManager;
    return Object.fromEntries(ids.map((id) => [id, String(SM.getValue(`ref_${id}`))]));
  }, [...KEPT, "d_78a", "d_87a"]);
  expect(after.d_78a, "the window row's area is geometry").toBe("5");
  expect(after.d_87a, "the opaque row's area is geometry").toBe("12");
  for (const id of KEPT) expect(after[id], `the Reference's ${id} is its own`).toBe(before[id]);
});
