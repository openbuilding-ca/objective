// @ts-check
/**
 * Section 11: an RSI of 0 still loses heat (Andy 2026-11-18: "An RSI of 0 on any Section 11 line should
 * show heatloss on its own line/row ... that is a real bug").
 *
 * transmissionLoss.<row>.uValue was `rsi > 0 ? 1 / rsi : 0`, so RSI 0 read as U 0 and the row showed
 * 0 W. Now U = 1 / max(RSI, the row's interior surface film), R_SI_MAP in TransmissionLossNodes.js.
 *
 * Witness: F280-1 with its slab at RSI 0 must read U = 1 / 0.17 and a positive heat loss on row 95;
 * the below-grade walls at RSI 2.76 (far above their 0.13 film) must still read exactly 1 / 2.76.
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE = path.join(__dirname, "computation", "case-studies", "F280-1-Archetype1-2010s-Ottawa.csv");

function withSlabRsi(csvText, value) {
  const lines = csvText.split(/\r?\n/);
  const header = lines[0].split(",");
  const i = header.findIndex((h) => h.split(":")[0].trim() === "f_95");
  const row = lines[1].split(",");
  if (i < 0 || row.length !== header.length) throw new Error("F280-1's CSV needs a simple f_95 column");
  row[i] = String(value);
  lines[1] = row.join(",");
  return lines.join("\n");
}

test("Section 11: an RSI of 0 loses heat through its surface film", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  await page.goto(`file://${path.join(__dirname, "..", "index.html")}`);
  await page.waitForFunction(
    () => window.TEUI?.ComputationIntegration?.isInitialized?.() && window.TEUI?.FileHandler?.processImportedCSV,
    { timeout: 60000 }
  );
  const csv = withSlabRsi(fs.readFileSync(CASE, "utf8"), 0);
  await page.evaluate((text) => window.TEUI.FileHandler.processImportedCSV(text), csv);
  await page.waitForTimeout(800);
  const rows = await page.evaluate(() => {
    const state = window.TEUI.ComputationIntegration.getState();
    const id = state.getActiveModelId();
    const get = (k) => parseFloat(state.getValueForModel(id, k));
    return {
      slabArea: get("transmissionLoss.slabOnGrade.area"),
      slabU: get("transmissionLoss.slabOnGrade.uValue"),
      slabLoss: get("transmissionLoss.slabOnGrade.heatLoss"),
      wallU: get("transmissionLoss.wallsBelowGrade.uValue"),
    };
  });
  expect(rows.slabArea).toBeCloseTo(90.311, 3); // the imported case, not the app's own sample
  expect(rows.slabU).toBeCloseTo(1 / 0.17, 9);
  expect(rows.slabLoss).toBeGreaterThan(0);
  expect(rows.wallU).toBeCloseTo(1 / 2.76, 12); // a normal RSI is untouched
});
