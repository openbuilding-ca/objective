// @ts-check
/**
 * A ghosted cell (DOMBridge.ghostField: .disabled-input, contenteditable="false") is not editable in
 * Reference mode, in WebKit.
 *
 * Mark's #123 review, carried into #134: styles.css's Reference-mode rule for .user-input set
 * -webkit-user-modify: read-write !important, which WebKit takes over contenteditable="false", so every
 * ghosted cell was typable there. On Hemmingford's Review Format file seven were (S03 G.4.5 for its slab,
 * M.3.2 / M.3.3 beside its heat pump ...).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE = path.join(__dirname, "..", "src/template/case-studies/03-residence-phi-classic-f280.csv");

test("Reference mode: a ghosted cell cannot be typed in; a live one can", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  await page.goto("/index.html");
  await page.waitForFunction(() => window.TEUI?.ComputationIntegration?.isInitialized?.(), { timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate((text) => window.TEUI.FileHandler.processImportedCSV(text), fs.readFileSync(CASE, "utf8"));
  await page.waitForTimeout(1500);
  await page.evaluate(() => {
    window.TEUI.ReferenceToggle.switchMode("reference");
    window.TEUI.Calculator.calculateAll();
  });
  await page.waitForTimeout(1500);

  const cells = await page.evaluate(() =>
    [...document.querySelectorAll("td.user-input[contenteditable]")].map((td) => ({
      id: td.getAttribute("data-field-id"),
      ghosted: td.classList.contains("disabled-input"),
      editable: td.isContentEditable,
    }))
  );
  const ghosted = cells.filter((c) => c.ghosted);
  expect(ghosted.map((c) => c.id), "S03 G.4.5 is ghosted for the slab").toContain("d_26");
  // The Reference truly has No Cooling (Hemmingford's S13 M.3.1): its M.3.3 COPc is greyed (Andy 2026-11-23)
  expect(await page.evaluate(() => window.TEUI.StateManager.getValue("ref_d_116"))).toBe("No Cooling");
  expect(ghosted.map((c) => c.id), "M.3.3 under No Cooling").toContain("j_116");
  expect(ghosted.filter((c) => c.editable).map((c) => c.id), "ghosted and still editable").toEqual([]);
  expect(cells.filter((c) => !c.ghosted && c.editable).length, "the live inputs stay editable").toBeGreaterThan(20);

  // And typing into G.4.5 changes nothing
  const before = await page.evaluate(() => String(window.TEUI.StateManager.getValue("ref_d_26")));
  const cell = page.locator('td[data-field-id="d_26"]');
  await cell.click({ force: true });
  await page.keyboard.type("9");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  expect(await cell.textContent()).not.toContain("9");
  expect(await page.evaluate(() => String(window.TEUI.StateManager.getValue("ref_d_26")))).toBe(before);
});

test("Reference mode: M.3.3 stays live while the heat pump cools - an engineer's COPc, above or below the standard's", async ({ page }) => {
  // Andy 2026-11-23: "Reference COPc can and should also be an over-ride if an engineer or someone that knows
  // what they are doing wants to put in a lower or higher value in S13"
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  await page.goto("/index.html");
  await page.waitForFunction(() => window.TEUI?.ComputationIntegration?.isInitialized?.(), { timeout: 60000 });
  await page.waitForTimeout(3000);
  await page.evaluate(() => {
    const SM = window.TEUI.StateManager;
    SM.setValue("ref_d_113", "Heatpump", "user-modified");
    SM.setValue("ref_d_116", window.TEUI.CoolingSystem.HEATPUMP, "user-modified");
    window.TEUI.ReferenceToggle.switchMode("reference");
    window.TEUI.Calculator.calculateAll();
  });
  await page.waitForTimeout(1000);
  const cell = page.locator('td[data-field-id="j_116"]');
  expect(await cell.evaluate((td) => [td.classList.contains("disabled-input"), td.isContentEditable])).toEqual([false, true]);
  const effective = () =>
    page.evaluate(() => {
      const CI = window.TEUI.ComputationIntegration;
      return CI.getState().getValueForModel(CI.getRefModelId(), "mechanical.cooling.effectiveCop");
    });
  for (const typed of ["4.8", "2.1"]) { // above, then below, the standard's minimum
    await cell.click();
    await page.keyboard.press("ControlOrMeta+A");
    await page.keyboard.type(typed);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    expect(String(await page.evaluate(() => window.TEUI.StateManager.getValue("ref_j_116")))).toBe(typed);
    expect(await effective(), `the Reference cools at its typed ${typed}`).toBeCloseTo(parseFloat(typed), 9);
  }
});
