// @ts-check
/**
 * S03 G.4.10's BASESIMP hover and S12 B.19.13's AIM-2 hover describe the model on screen.
 *
 * Mark's #134 review: both read getActiveModelId(), which stays the Target in Reference mode. On a Review
 * Format file in Reference mode, with the Reference's G.4.4 at a slab configuration while S11 has
 * below-grade wall, G.4.10 showed Unavailable but its hover gave the Target's configuration and no error.
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE = path.join(__dirname, "..", "src/template/case-studies/10-residence-sb12-duplex-f280.csv");

test("the BASESIMP and AIM-2 hovers describe the Reference in Reference mode", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  await page.goto("/index.html");
  await page.waitForFunction(
    () => window.TEUI?.ComputationIntegration?.isInitialized?.() && window.TEUI?.FileHandler?.processImportedCSV,
    { timeout: 60000 }
  );
  await page.waitForTimeout(3000);
  await page.evaluate((text) => window.TEUI.FileHandler.processImportedCSV(text), fs.readFileSync(CASE, "utf8"));
  await page.waitForTimeout(1500);

  const hovers = () =>
    page.evaluate(() => ({
      basesimp: document.querySelector('td[data-field-id="l_26b"]')?.title ?? null,
      aim2: document.querySelector('td[data-field-id="d_112f"]')?.title ?? null,
      config: [window.TEUI.StateManager.getValue("l_25"), window.TEUI.StateManager.getValue("ref_l_25")],
    }));

  // The Reference's foundation becomes a slab on grade (SCB_25, #52): its BASESIMP cannot run; the Target's can
  await page.evaluate(() => {
    window.TEUI.StateManager.setValue("ref_l_25", "52", "user-modified");
    window.TEUI.ReferenceToggle.switchMode("reference");
    window.TEUI.Calculator.calculateAll();
  });
  await page.waitForTimeout(1500);
  const ref = await hovers();
  expect(ref.config[1]).toBe("52");
  expect(ref.basesimp, "G.4.10 on the Reference").toMatch(/^BASESIMP cannot run: .*slab on grade/);

  await page.evaluate(() => {
    window.TEUI.ReferenceToggle.switchMode("target");
    window.TEUI.Calculator.calculateAll();
  });
  await page.waitForTimeout(1500);
  const target = await hovers();
  expect(target.basesimp, "G.4.10 on the Target").not.toMatch(/cannot run/);
  expect(target.basesimp).not.toBe("");
  expect(target.aim2, "B.19.13 on the Target").not.toBe("");
});
