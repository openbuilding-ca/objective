// @ts-check
/**
 * Cooling before/after comparison (cooling-iso52016).
 *
 * Imports every case study CSV and records the cooling chain, its climate
 * inputs and TEUI for the Target and Reference models. Writes
 * test/cooling-<label>.json, where <label> comes from COOLING_LABEL. Without
 * it the spec skips: a plain `npm test` must not overwrite a recorded run (it
 * once replaced the BEFORE file with the new engine's values). Run once on the unchanged engine ("baseline"), then
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
const LABEL = process.env.COOLING_LABEL;
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
  // the drivers the before/after table explains a difference by
  "ventilation.volumetricRate",
  "mechanical.heating.systemType",
  "mechanical.cooling.effectiveCop",
  "mechanical.ventilation.recoveryType",
  "cooling.latentMethod",
  "building.coolingLatentBasis",
];

/**
 * One CSV line as its fields. Quote-aware, as FileHandler's parseCSVRow is: a
 * quoted field may hold commas, and "" inside one is a literal quote. A bare
 * split(",") shifted every column after case 09's
 * e_12 "Gym, sports arena (play area)".
 */
function csvRow(line) {
  const fields = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') {
        field += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      fields.push(field.trim());
      field = "";
    } else {
      field += ch;
    }
  }
  fields.push(field.trim());
  return fields;
}

/** The target row's value of one column of a case-study CSV (header "h_19: City"). */
function csvField(csv, id) {
  const [head, row] = csv.split(/\r?\n/);
  const i = csvRow(head).findIndex((h) => h.split(":")[0].trim() === id);
  return i >= 0 ? (csvRow(row || "")[i] ?? "") : null;
}

test("record the cooling chain for every case study", async ({ page }) => {
  test.skip(!LABEL, "set COOLING_LABEL to record a run");
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
      async ({ csv, ids, city }) => {
        window.TEUI.FileHandler.processImportedCSV(csv);
        await new Promise((r) => setTimeout(r, 2000));
        const state = window.TEUI.ComputationIntegration.getState();
        // Wait until the import has LANDED: the case's city, its climate
        // station loaded (the ISO node non-null), and TEUI steady - a fixed
        // 2 s once read the previous project's values (2026-10-31).
        const active = () => state.getActiveModelId();
        const get = (id) => state.getValueForModel(active(), id);
        for (let k = 0, last = null; k < 40; k++) {
          const teui = get("energy.teui");
          const landed =
            (!city || get("climate.location.city") === city) && get("cooling.iso52016") != null;
          if (landed && teui === last) break;
          last = teui;
          await new Promise((r) => setTimeout(r, 500));
        }
        const models = state.getAllModels ? state.getAllModels() : [];
        const ref = models.find((m) => m.modelType === "reference");
        const read = (modelId) => {
          const out = Object.fromEntries(
            ids.map((id) => [id, state.getValueForModel(modelId, id) ?? null])
          );
          const iso = state.getValueForModel(modelId, "cooling.iso52016");
          out["cooling.iso52016"] = iso && {
            sensible: iso.sensible,
            latent: iso.latent.total,
            latentVent: iso.latent.vent,
            latentLeak: iso.latent.leak,
            latentPeople: iso.latent.people,
          };
          return out;
        };
        return {
          target: read(state.getActiveModelId()),
          reference: ref ? read(ref.id) : null,
        };
      },
      { csv, ids: IDS, city: csvField(csv, "h_19") }
    );
    console.log(`${csvFile}: CED mitigated = ${results[csvFile].target["energy.ced.mitigated"]}`);
  }

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ label: LABEL, timestamp: new Date().toISOString(), results }, null, 2)
  );
  console.log(`Wrote ${OUT_FILE}`);
});
