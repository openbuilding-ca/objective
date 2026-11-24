// @ts-check
/**
 * S09 lighting compliance (m_66 / n_66) compares the two models' lighting densities as entered.
 *
 * Mark's #134 review: under F280 Mode On a model's lighting in effect is 0 (Cl. 6.2.5 folds lights into the
 * plug load), and m_66 / n_66 compared in-effect values. On a "CSA F280 Review Format" house (Target Off,
 * Reference On) m_66 read "100%" beside a failing n_66 for the Target's 1.5 W/m2, which passed against the
 * standard's 2.0 before. A Reference of 0 has no ratio: N/A and no mark, never "100%" beside a fail.
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE = path.join(__dirname, "..", "src/template/case-studies/03-residence-phi-classic-f280.csv");

test("S09 lighting compliance: the densities as entered, whatever F280 Mode", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  await page.goto("/index.html");
  await page.waitForFunction(
    () => window.TEUI?.ComputationIntegration?.isInitialized?.() && window.TEUI?.FileHandler?.processImportedCSV,
    { timeout: 60000 }
  );
  await page.waitForTimeout(3000);
  await page.evaluate((text) => window.TEUI.FileHandler.processImportedCSV(text), fs.readFileSync(CASE, "utf8"));
  await page.waitForTimeout(1500);

  const read = () =>
    page.evaluate(() => {
      const CI = window.TEUI.ComputationIntegration, s = CI.getState(), r = CI.getRefModelId();
      const t = s.getModelIds().find((i) => i !== r), SM = window.TEUI.StateManager;
      return {
        modes: [SM.getValue("f280_mode"), SM.getValue("ref_f280_mode")],
        densities: [parseFloat(SM.getValue("d_66")), parseFloat(SM.getValue("ref_d_66"))],
        refInEffect: s.getValueForModel(r, "internal.lightingDensity.inEffect"),
        ratio: s.getValueForModel(t, "compliance.lighting.ratio"),
        pass: s.getValueForModel(t, "compliance.lighting.pass"),
      };
    });

  const house = await read();
  expect(house.modes).toEqual(["Off", "On"]);
  expect(house.refInEffect, "the Reference's lighting in effect under On").toBe(0);
  const [t, r] = house.densities;
  expect(r).toBeGreaterThan(0);
  expect(house.ratio).toBe(`${Math.round((t / r) * 100)}%`);
  expect(house.pass).toBe(t <= r ? "✓" : "✗");

  await page.evaluate(() => {
    window.TEUI.StateManager.setValue("ref_d_66", "0", "user-modified");
    window.TEUI.Calculator.calculateAll();
  });
  await page.waitForTimeout(800);
  const zero = await read();
  expect([zero.ratio, zero.pass], "a Reference of 0").toEqual(["N/A", ""]);
});
