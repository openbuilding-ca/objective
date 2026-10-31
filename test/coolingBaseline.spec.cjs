// @ts-check
/**
 * Cooling before/after comparison (cooling-iso52016).
 *
 * Imports every case study CSV and records the cooling chain, its climate
 * inputs and TEUI for the Target and Reference models. Writes
 * test/cooling-<label>.json, where <label> comes from COOLING_LABEL
 * (default "baseline"). Run once on the unchanged engine ("baseline"), then
 * after the ISO 52016-1 work ("iso52016"), and compare the two files.
 *
 *   COOLING_LABEL=baseline npx playwright test test/coolingBaseline.spec.cjs --config=playwright.config.cjs
 *
 * The ISO 52016-1 cooling fetches the location's climate station, which a
 * file:// page cannot: serve the repo and point COOLING_URL at it.
 *
 *   python3 -m http.server 8770 --bind 127.0.0.1    # in the repo root
 *   COOLING_LABEL=iso52016 COOLING_URL=http://127.0.0.1:8770/index.html npx playwright test ...
 */
const { test } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE_STUDIES_DIR = path.join(__dirname, "computation", "case-studies");
const LABEL = process.env.COOLING_LABEL || "baseline";
const OUT_FILE = path.join(__dirname, `cooling-${LABEL}.json`);
const URL = process.env.COOLING_URL || `file://${path.join(__dirname, "..", "index.html")}`;

const IDS = [
  // inputs that drive cooling
  "climate.location.province",
  "climate.location.city",
  "climate.timeframe",
  "climate.station",
  "climate.cooling.degreedays",
  "climate.coolingDays",
  "climate.cooling.setpoint",
  "climate.cooling.nightTemp",
  "climate.cooling.seasonMeanRH",
  "building.indoorRH",
  "building.typologySelection",
  "building.conditionedFloorArea",
  "mechanical.cooling.systemType",
  "mechanical.ventilation.summerBoost",
  // the cooling chain
  "cooling.latentLoadFactor",
  "cooling.freeCoolingLimit",
  "cooling.freeCoolingPercent",
  "cooling.daysActiveCooling",
  "envelope.total.heatGain",
  "radiantGains.subtotal.coolingGain",
  "internal.coolingLoad.occupants",
  "internal.occupants.coolingGain",
  "climate.temperature.hottestWetBulb",
  "airTightness.heatGain",
  "ventilation.heatGain",
  "transmissionLoss.thermalBridgePenalty.heatGain",
  "ventilation.energyRecoveredCooling",
  "energy.ced.unmitigated",
  "energy.ced.mitigated",
  "energy.cedi.mitigatedWm2",
  "mechanical.cooling.electricalDemand",
  "energy.peakCooling.totalKw",
  "f280.nominalCoolingCapacity",
  // context
  "cooling.freeCoolingRaw",
  "energy.ted.heating",
  "energy.teui",
];

test("record the cooling chain for every case study", async ({ page }) => {
  test.setTimeout(10 * 60 * 1000);
  await page.addInitScript(() => {
    localStorage.setItem("disclaimerSeen", "true");
  });
  await page.goto(URL);
  await page.waitForFunction(
    () =>
      window.TEUI?.ComputationIntegration?.isInitialized?.() &&
      window.TEUI?.StateManager &&
      window.TEUI?.FileHandler?.processImportedCSV,
    { timeout: 60000 }
  );

  const csvFiles = fs
    .readdirSync(CASE_STUDIES_DIR)
    .filter((f) => f.endsWith(".csv"))
    .sort();

  const results = {};
  for (const csvFile of csvFiles) {
    const csv = fs.readFileSync(path.join(CASE_STUDIES_DIR, csvFile), "utf-8");
    results[csvFile] = await page.evaluate(
      async ({ csv, ids }) => {
        window.TEUI.FileHandler.processImportedCSV(csv);
        await new Promise((r) => setTimeout(r, 2000));
        const state = window.TEUI.ComputationIntegration.getState();
        const models = state.getAllModels ? state.getAllModels() : [];
        const ref = models.find((m) => m.modelType === "reference");
        const read = (modelId) =>
          Object.fromEntries(ids.map((id) => [id, state.getValueForModel(modelId, id) ?? null]));
        return {
          target: read(state.getActiveModelId()),
          reference: ref ? read(ref.id) : null,
        };
      },
      { csv, ids: IDS }
    );
    console.log(`${csvFile}: CED mitigated = ${results[csvFile].target["energy.ced.mitigated"]}`);
  }

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ label: LABEL, timestamp: new Date().toISOString(), results }, null, 2)
  );
  console.log(`Wrote ${OUT_FILE}`);
});
