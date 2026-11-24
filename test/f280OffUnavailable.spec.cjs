// @ts-check
/**
 * F280 Mode Off computes OBJECTIVE's way even when an F280 method cannot run - on the real graph.
 *
 * Mark's #134 review: a model with no slab and no exposed floor has no Wombat footprint, so BASESIMP has no
 * perimeter; the engine's "an Unavailable input makes its reader Unavailable" rule then stopped the nodes
 * that read ground.basesimp / airTightness.aim2 before their own method check, and with F280 Mode Off the
 * model read Unavailable down to TEUI (145 nodes). The method nodes now return their { error } instead
 * (acceptsUnavailable); their F280 readers turn it into Unavailable, their OBJECTIVE readers never look.
 *
 * The other half holds too: with F280 Mode On the same model has no BASESIMP, and its TEUI is Unavailable,
 * never a figure with the ground read as 0 (unavailablePropagates.test.cjs, on a fake graph).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE = path.join(__dirname, "computation", "case-studies", "04-OttawaApartments.csv");
// The nodes that are F280's alone: Unavailable here says only that F280 has no figure
const F280_SIDE = /^(wombat\.footprint|ground\.basesimp|aim2\.|f280\.)/;

test("F280 Mode Off: no footprint leaves OBJECTIVE's figures standing; On: Unavailable, not 0", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  await page.goto("/index.html");
  await page.waitForFunction(
    () => window.TEUI?.ComputationIntegration?.isInitialized?.() && window.TEUI?.FileHandler?.processImportedCSV,
    { timeout: 60000 }
  );
  await page.waitForTimeout(3000); // init.js's own sample lands first
  await page.evaluate((text) => window.TEUI.FileHandler.processImportedCSV(text), fs.readFileSync(CASE, "utf8"));
  await page.waitForTimeout(1500);

  const read = () =>
    page.evaluate(() => {
      const CI = window.TEUI.ComputationIntegration, s = CI.getState(), ids = CI.getGraph().getFullComputationOrder();
      return s.getModelIds().map((m) => ({
        model: m,
        unavailable: ids.filter((id) => s.getValueForModel(m, id) === "Unavailable"),
        teui: s.getValueForModel(m, "energy.teui"),
        peakHeating: s.getValueForModel(m, "energy.peakHeating.enclosureKw"),
      }));
    });
  const setBoth = (fields) =>
    page.evaluate((f) => {
      const SM = window.TEUI.StateManager;
      for (const p of ["", "ref_"]) for (const [k, v] of Object.entries(f)) SM.setValue(p + k, v, "user-modified");
    }, fields);

  for (const m of await read()) {
    expect(m.unavailable, `${m.model} before`).toEqual([]);
    expect(typeof m.teui, `${m.model} TEUI before`).toBe("number");
  }

  await setBoth({ f280_mode: "Off", d_95: "0", d_87: "0" }); // S11: no slab, no exposed floor
  await page.waitForTimeout(1500);
  for (const m of await read()) {
    expect(m.unavailable.length, `${m.model}: Wombat has no footprint`).toBeGreaterThan(0);
    expect(m.unavailable.filter((id) => !F280_SIDE.test(id)), `${m.model}: only F280's own nodes`).toEqual([]);
    expect(typeof m.teui, `${m.model} TEUI`).toBe("number");
    expect(m.teui).toBeGreaterThan(0);
    expect(typeof m.peakHeating, `${m.model} d_137`).toBe("number");
  }

  await setBoth({ f280_mode: "On" });
  await page.waitForTimeout(1500);
  for (const m of await read()) {
    expect(m.teui, `${m.model}: BASESIMP cannot run, so no TEUI`).toBe("Unavailable");
    expect(m.peakHeating).toBe("Unavailable");
  }
});
