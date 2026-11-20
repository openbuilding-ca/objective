// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE_STUDIES_DIR = path.join(__dirname, "computation", "case-studies");
const RESULTS_FILE = path.join(__dirname, "case-study-results.json");

test.describe("Case Study Validation", () => {
  test("validate all case study CSVs", async ({ page }) => {
    // Set localStorage BEFORE page loads to prevent disclaimer modal
    await page.addInitScript(() => {
      localStorage.setItem("disclaimerSeen", "true");
    });

    // Load the calculator - over http (playwright.config.cjs's webServer), so
    // the climate station loads. init.js fetches a sample project 1.5 s after
    // start-up, which over http would land on top of the imports below - keep
    // it out, as file:// did.
    await page.route("**/src/template/case-studies/**", (route) => route.abort());
    await page.goto("/index.html");

    // Wait for calculator to initialize
    await page.waitForFunction(
      () =>
        window.TEUI?.ComputationIntegration?.isInitialized?.() &&
        window.TEUI?.StateManager &&
        window.TEUI?.FileHandler?.processImportedCSV,
      { timeout: 60000 }
    );

    console.log("Calculator loaded");

    // Get list of CSV files
    const csvFiles = fs
      .readdirSync(CASE_STUDIES_DIR)
      .filter((f) => f.endsWith(".csv"))
      .sort();

    console.log(`Found ${csvFiles.length} CSV files`);

    const allResults = [];

    for (const csvFile of csvFiles) {
      const csvPath = path.join(CASE_STUDIES_DIR, csvFile);
      const csvContent = fs.readFileSync(csvPath, "utf-8");

      console.log(`Testing: ${csvFile}`);

      // Import CSV and run validation
      const result = await page.evaluate(async (csv) => {
        return new Promise((resolve) => {
          try {
            // Import CSV
            window.TEUI.FileHandler.processImportedCSV(csv);

            // Wait for calculations - and for each model's climate station,
            // which is fetched and recalculates the page when it lands
            const CS = window.TEUI.ClimateStation;
            const stations = () => {
              const st = window.TEUI.ComputationIntegration.getState();
              return (st.getAllModels ? st.getAllModels() : [])
                .map((m) => st.getValueForModel(m.id, "climate.station"))
                .filter(Boolean);
            };
            const validate = () => {
              if (stations().some((id) => !CS.get(id) && !CS.failure(id))) {
                setTimeout(validate, 100);
                return;
              }
              try {
              // Run validation
              const graph = window.TEUI.ComputationIntegration.getGraph();
              const state = window.TEUI.ComputationIntegration.getState();
              const SM = window.TEUI.StateManager;

              const targetId = state.getActiveModelId();

              // Debug j_27 components for detailed analysis
              const j27Debug = {
                // j_27 = d_136 - d_43 - i_43
                d_136: { old: parseFloat(SM.getValue("d_136")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.total.all")) || 0 },
                d_43: { old: parseFloat(SM.getValue("d_43")) || 0, new: parseFloat(state.getValueForModel(targetId, "renewable.onsiteTotal")) || 0 },
                i_43: { old: parseFloat(SM.getValue("i_43")) || 0, new: parseFloat(state.getValueForModel(targetId, "renewable.offsiteTotal")) || 0 },
                // d_136 components (for Heatpump: k51 + d117 + d114 + m43 + h70)
                k_51: { old: parseFloat(SM.getValue("k_51")) || 0, new: parseFloat(state.getValueForModel(targetId, "waterHeating.netElectricalDemand")) || 0 },
                d_117: { old: parseFloat(SM.getValue("d_117")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.cooling.electricalDemand")) || 0 },
                d_114: { old: parseFloat(SM.getValue("d_114")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.demand")) || 0 },
                m_43: { old: parseFloat(SM.getValue("m_43")) || 0, new: parseFloat(state.getValueForModel(targetId, "renewable.onsiteTotal")) || 0 },
                h_70: { old: parseFloat(SM.getValue("h_70")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.plugLoads.subtotal")) || 0 },
                // d_114 inputs: TED / COPheat
                d_127: { old: parseFloat(SM.getValue("d_127")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ted.heating")) || 0 },
                // FIX: Compare h_113 (legacy) vs h_113 (graph's mechanical.heating.copHeat)
                copHeat_h113: { old: parseFloat(SM.getValue("h_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.copHeat")) || 0 },
                // d_117 inputs: m_129 / COP
                m_129: { old: parseFloat(SM.getValue("m_129")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ced.mitigated")) || 0 },
                // FIX: The effective COP doesn't exist as a single field in legacy - show both components
                j_113_coolDerived: { old: parseFloat(SM.getValue("j_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.copCoolDerived")) || 0 },
                j_116_coolDedicated: { old: parseFloat(SM.getValue("j_116")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.cooling.copDedicated")) || 0 },
                // Raw HSPF input
                f_113: { old: parseFloat(SM.getValue("f_113")) || 0, new: parseFloat(state.getValueForModel(targetId, "mechanical.heating.hspf")) || 0 },
                // CED chain: d_129 (unmitigated) - check heat gain components
                d_129_ced_unmit: { old: parseFloat(SM.getValue("d_129")) || 0, new: parseFloat(state.getValueForModel(targetId, "energy.ced.unmitigated")) || 0 },
                k_104_heatGain: { old: parseFloat(SM.getValue("k_104")) || 0, new: parseFloat(state.getValueForModel(targetId, "envelope.total.heatGain")) || 0 },
                // m_129 = d_129 - h_124 - d_123
                h_124_freeCool: { old: parseFloat(SM.getValue("h_124")) || 0, new: parseFloat(state.getValueForModel(targetId, "cooling.freeCoolingLimit")) || 0 },
                d_123_ventRecov: { old: parseFloat(SM.getValue("d_123")) || 0, new: parseFloat(state.getValueForModel(targetId, "ventilation.energyRecoveredCooling")) || 0 },
              };

              // Debug climate and cooling inputs
              const climateDebug = {
                d_19_province: { old: SM.getValue("d_19"), new: state.getValueForModel(targetId, "climate.location.province") },
                h_19_city: { old: SM.getValue("h_19"), new: state.getValueForModel(targetId, "climate.location.city") },
                h_20_timeframe: { old: SM.getValue("h_20"), new: state.getValueForModel(targetId, "climate.timeframe") },
                d_21_cdd: { old: SM.getValue("d_21"), new: state.getValueForModel(targetId, "climate.cooling.degreedays") },
                d_116_coolingType: { old: SM.getValue("d_116"), new: state.getValueForModel(targetId, "mechanical.cooling.systemType") },
                d_113_heatingType: { old: SM.getValue("d_113"), new: state.getValueForModel(targetId, "mechanical.heating.systemType") },
              };

              // Debug ref_m_124 dependencies for Reference model
              const allModels = state.getAllModels ? state.getAllModels() : [];
              const refModelForM124 = allModels.find(m => m.modelType === "reference");
              const ridForM124 = refModelForM124?.id;
              const refM124Debug = ridForM124 ? {
                m_124: { old: parseFloat(SM.getValue("ref_m_124")) || 0, new: parseFloat(state.getValueForModel(ridForM124, "cooling.daysActiveCooling")) || 0 },
                m_129: { old: parseFloat(SM.getValue("ref_m_129")) || 0, new: parseFloat(state.getValueForModel(ridForM124, "energy.ced.mitigated")) || 0 },
                // the daily potential went with the ISO 52016-1 cooling (36b8062); its annual successor
                freeCoolingPotential: { new: parseFloat(state.getValueForModel(ridForM124, "cooling.freeCoolingRaw")) || 0 },
                d_21: { old: SM.getValue("ref_d_21") || SM.getValue("d_21"), new: state.getValueForModel(ridForM124, "climate.cooling.degreedays") },
                m_19: { old: SM.getValue("ref_m_19") || SM.getValue("m_19"), new: state.getValueForModel(ridForM124, "climate.coolingDays") },
                d_116: { old: SM.getValue("ref_d_116"), new: state.getValueForModel(ridForM124, "mechanical.cooling.systemType") },
                d_129_unmitigated: { old: parseFloat(SM.getValue("ref_d_129")) || 0, new: parseFloat(state.getValueForModel(ridForM124, "energy.ced.unmitigated")) || 0 },
                h_124_freeCoolingLimit: { old: parseFloat(SM.getValue("ref_h_124")) || 0, new: parseFloat(state.getValueForModel(ridForM124, "cooling.freeCoolingLimit")) || 0 },
                d_120_ventVolumetric: { old: parseFloat(SM.getValue("ref_d_120")) || 0, new: parseFloat(state.getValueForModel(ridForM124, "ventilation.volumetricRate")) || 0 },
              } : null;

              // Debug i_103 (air leakage heat loss) chain
              // Formula: i_103 = (1.21 × NRL50 × area × HDD × 24) / (N_factor × 1000)
              const i103Debug = {
                i_103: { old: parseFloat(SM.getValue("i_103")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.heatLoss")) || 0 },
                g_108_nrl50: { old: parseFloat(SM.getValue("g_108")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.nrl50")) || 0 },
                d_101_area: { old: parseFloat(SM.getValue("d_101")) || 0, new: parseFloat(state.getValueForModel(targetId, "envelope.airFacing.area")) || 0 },
                g_110_nFactor: { old: parseFloat(SM.getValue("g_110")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.nFactor")) || 0 },
                h_20_hdd: { old: parseFloat(SM.getValue("h_20")) || 0, new: parseFloat(state.getValueForModel(targetId, "climate.heating.degreedays")) || 0 },
                // NRL50 inputs
                d_108_method: { old: SM.getValue("d_108"), new: state.getValueForModel(targetId, "airTightness.method") },
                g_109_measuredAch50: { old: parseFloat(SM.getValue("g_109")) || 0, new: parseFloat(state.getValueForModel(targetId, "airTightness.measuredAch50")) || 0 },
                d_105_volume: { old: parseFloat(SM.getValue("d_105")) || 0, new: parseFloat(state.getValueForModel(targetId, "volume.conditioned")) || 0 },
              };

              // Debug Reference model
              // NOTE: Don't call populateReferenceModel() here - it was already called in
              // Calculator.calculateAll(). Calling again would show correct values but
              // they weren't the ones used during computation (useful for debugging setup,
              // but misleading for diagnosing computation issues).
              const CI = window.TEUI.ComputationIntegration;
              const refPopDebug = null; // See note above

              const refDebug = {
                // Key Reference outputs
                ref_j_32: { old: parseFloat(SM.getValue("ref_j_32")) || 0, new: 0 },
                ref_h_15: { old: parseFloat(SM.getValue("ref_h_15")) || 0, new: 0 },
                e_10: { old: parseFloat(SM.getValue("e_10")) || 0, new: 0 },
                // Reference envelope inputs from StateManager (should come from ReferenceValues.js)
                ref_f_85: SM.getValue("ref_f_85"),
                ref_f_86: SM.getValue("ref_f_86"),
                ref_g_89: SM.getValue("ref_g_89"),
                ref_f_113: SM.getValue("ref_f_113"),
                ref_d_118: SM.getValue("ref_d_118"),
                // Standard selection (d_13 is the standard dropdown)
                d_13: SM.getValue("d_13"),
                // Debug info from populateReferenceModel
                populateDebug: refPopDebug?.debug || null,
              };

              // Get Reference model values if available
              const models = state.getAllModels ? state.getAllModels() : [];
              const refModel = models.find(m => m.modelType === "reference");
              if (refModel) {
                // Use correct semantic paths for Reference model inputs/outputs
                refDebug.ref_j_32.new = parseFloat(state.getValueForModel(refModel.id, "reference.energy.total")) || 0;
                refDebug.ref_h_15.new = parseFloat(state.getValueForModel(refModel.id, "reference.building.conditionedFloorArea")) || 0;
                refDebug.e_10.new = parseFloat(state.getValueForModel(refModel.id, "keyValues.reference.teui")) || 0;
              }

              // Also get the TARGET model's reference.* values (used for e_10 computation)
              refDebug.targetRefJ32 = parseFloat(state.getValueForModel(targetId, "reference.energy.total")) || 0;
              refDebug.targetRefH15 = parseFloat(state.getValueForModel(targetId, "reference.building.conditionedFloorArea")) || 0;
              refDebug.targetE10 = parseFloat(state.getValueForModel(targetId, "keyValues.reference.teui")) || 0;

              // Reference model intermediate values (to diagnose computation differences)
              if (refModel) {
                const rid = refModel.id;
                refDebug.refIntermediate = {
                  d_127_ted: parseFloat(state.getValueForModel(rid, "energy.ted.heating")) || 0,
                  d_114_heatDemand: parseFloat(state.getValueForModel(rid, "mechanical.heating.demand")) || 0,
                  d_117_coolDemand: parseFloat(state.getValueForModel(rid, "mechanical.cooling.electricalDemand")) || 0,
                  d_136_totalEnergy: parseFloat(state.getValueForModel(rid, "energy.total.all")) || 0,
                  j_32_targetTotal: parseFloat(state.getValueForModel(rid, "energy.target.total")) || 0,
                  i_98_transLoss: parseFloat(state.getValueForModel(rid, "transmissionLoss.components.subtotalHeatLoss")) || 0,
                  i_103_airLeak: parseFloat(state.getValueForModel(rid, "airTightness.heatLoss")) || 0,
                  m_121_ventLoss: parseFloat(state.getValueForModel(rid, "ventilation.netHeatLoss")) || 0,
                  i_80_radGains: parseFloat(state.getValueForModel(rid, "radiantGains.usableGains")) || 0,
                };
              }

              const result = {
                matches: 0,
                close: 0,
                mismatches: 0,
                missing: 0,
                mismatchDetails: [],
                j27Debug,
                climateDebug,
                i103Debug,
                refM124Debug,
                refDebug,
              };
              const ABS_TOL = 0.01;
              const REL_TOL = 0.01;

              // Check computation nodes
              for (const nodePath of graph.getAllNodeIds()) {
                const node = graph.getNode(nodePath);
                if (!node?.legacyId) continue;

                const legacyId = node.legacyId;
                const oldVal = SM.getValue(legacyId);
                const newVal = state.getValueForModel(targetId, nodePath);

                if (
                  oldVal === undefined ||
                  oldVal === null ||
                  oldVal === ""
                ) {
                  result.missing++;
                  continue;
                }

                const oldNum = parseFloat(oldVal);
                const newNum = parseFloat(newVal);

                if (isNaN(oldNum) || isNaN(newNum)) {
                  if (String(oldVal) === String(newVal)) {
                    result.matches++;
                  } else {
                    result.mismatches++;
                    result.mismatchDetails.push({
                      legacyId,
                      path: nodePath,
                      old: oldVal,
                      new: newVal,
                    });
                  }
                  continue;
                }

                const diff = Math.abs(oldNum - newNum);
                const relDiff = oldNum !== 0 ? diff / Math.abs(oldNum) : diff;

                if (diff < ABS_TOL) {
                  result.matches++;
                } else if (relDiff < REL_TOL) {
                  result.close++;
                  result.closeDetails = result.closeDetails || [];
                  result.closeDetails.push({
                    legacyId,
                    path: nodePath,
                    old: oldNum,
                    new: newNum,
                    diff: diff.toFixed(4),
                    pctDiff: (relDiff * 100).toFixed(2) + "%",
                  });
                } else {
                  result.mismatches++;
                  result.mismatchDetails.push({
                    legacyId,
                    path: nodePath,
                    old: oldNum,
                    new: newNum,
                    diff: diff.toFixed(4),
                    pctDiff: (relDiff * 100).toFixed(2) + "%",
                  });
                }
              }

              // Check input nodes
              if (graph.getAllInputIds) {
                for (const inputPath of graph.getAllInputIds()) {
                  const input = graph.getInput(inputPath);
                  if (!input?.legacyId) continue;

                  const legacyId = input.legacyId;
                  const oldVal = SM.getValue(legacyId);
                  const newVal = state.getValueForModel(targetId, inputPath);

                  if (
                    oldVal === undefined ||
                    oldVal === null ||
                    oldVal === ""
                  )
                    continue;

                  const oldNum = parseFloat(oldVal);
                  const newNum = parseFloat(newVal);

                  if (isNaN(oldNum) || isNaN(newNum)) continue;

                  const diff = Math.abs(oldNum - newNum);
                  const relDiff = oldNum !== 0 ? diff / Math.abs(oldNum) : diff;

                  if (diff < ABS_TOL) {
                    result.matches++;
                  } else if (relDiff < REL_TOL) {
                    result.close++;
                  } else {
                    result.mismatches++;
                    result.mismatchDetails.push({
                      legacyId,
                      path: inputPath,
                      old: oldNum,
                      new: newNum,
                      diff: diff.toFixed(4),
                      pctDiff: (relDiff * 100).toFixed(2) + "%",
                      type: "input",
                    });
                  }
                }
              }

              // After normal validation, test Reference model computation
              if (CI?.computeAllWithReference) {
                try {
                  // Populate Reference model from ReferenceValues.js
                  const popResult = CI.populateReferenceModel();
                  // Compute both Target and Reference models
                  CI.computeAllWithReference();

                  // Get Reference model ID
                  const models = state.getAllModels ? state.getAllModels() : [];
                  const refModel = models.find(m => m.modelType === "reference");
                  const rid = refModel?.id;

                  // Read the graph-computed ref_j_32 (from Target model's reference.energy.total INPUT)
                  const computedRefJ32 = parseFloat(
                    state.getValueForModel(targetId, "reference.energy.total")
                  ) || 0;
                  // Compare against legacy ref_j_32
                  const legacyRefJ32 = parseFloat(SM.getValue("ref_j_32")) || 0;

                  // Capture Reference model intermediate values for diagnosis
                  const refIntermediates = rid ? {
                    d_113_heatingType: state.getValueForModel(rid, "mechanical.heating.systemType"),
                    d_51_dhwType: state.getValueForModel(rid, "waterHeating.systemType"),
                    d_65_plugLoad: state.getValueForModel(rid, "internal.plugLoadDensity"),
                    d_67_equipLoad: state.getValueForModel(rid, "internal.equipmentDensity"),
                    g_118_ventMethod: state.getValueForModel(rid, "mechanical.ventilation.method"),
                    l_118_ventAch: state.getValueForModel(rid, "mechanical.ventilation.ach"),
                    d_119_ventRate: state.getValueForModel(rid, "mechanical.ventilation.ratePerPerson"),
                    d_120_ventVolumetric: parseFloat(state.getValueForModel(rid, "ventilation.volumetricRate")) || 0,
                    d_121_ventGross: parseFloat(state.getValueForModel(rid, "ventilation.grossHeatLoss")) || 0,
                    d_118_hrvEff: state.getValueForModel(rid, "mechanical.ventilation.efficiency"),
                    d_127_ted: parseFloat(state.getValueForModel(rid, "energy.ted.heating")) || 0,
                    d_114_heatDemand: parseFloat(state.getValueForModel(rid, "mechanical.heating.demand")) || 0,
                    d_117_coolDemand: parseFloat(state.getValueForModel(rid, "mechanical.cooling.electricalDemand")) || 0,
                    k_51_dhwElec: parseFloat(state.getValueForModel(rid, "waterHeating.netElectricalDemand")) || 0,
                    h_70_plugLoads: parseFloat(state.getValueForModel(rid, "energy.plugLoads.subtotal")) || 0,
                    d_136_totalEnergy: parseFloat(state.getValueForModel(rid, "energy.total.all")) || 0,
                    j_32_targetTotal: parseFloat(state.getValueForModel(rid, "energy.target.total")) || 0,
                    i_98_transLoss: parseFloat(state.getValueForModel(rid, "transmissionLoss.components.subtotalHeatLoss")) || 0,
                    i_103_airLeak: parseFloat(state.getValueForModel(rid, "airTightness.heatLoss")) || 0,
                    m_121_ventLoss: parseFloat(state.getValueForModel(rid, "ventilation.netHeatLoss")) || 0,
                    d_43_onsiteRenew: parseFloat(state.getValueForModel(rid, "renewable.onsiteTotal")) || 0,
                    i_43_offsiteRenew: parseFloat(state.getValueForModel(rid, "renewable.offsiteTotal")) || 0,
                    m_43_extLoads: parseFloat(state.getValueForModel(rid, "renewable.exteriorLoads")) || 0,
                  } : null;

                  // Legacy Reference intermediate values for comparison
                  const legacyRefIntermediates = {
                    ref_d_113: SM.getValue("ref_d_113"),
                    ref_d_51: SM.getValue("ref_d_51"),
                    ref_g_118: SM.getValue("ref_g_118"),
                    ref_l_118: SM.getValue("ref_l_118"),
                    ref_d_119: SM.getValue("ref_d_119"),
                    ref_d_120: parseFloat(SM.getValue("ref_d_120")) || 0,
                    ref_d_121: parseFloat(SM.getValue("ref_d_121")) || 0,
                    ref_d_118: SM.getValue("ref_d_118"),
                    ref_d_127: parseFloat(SM.getValue("ref_d_127")) || 0,
                    ref_d_114: parseFloat(SM.getValue("ref_d_114")) || 0,
                    ref_d_117: parseFloat(SM.getValue("ref_d_117")) || 0,
                    ref_k_51: parseFloat(SM.getValue("ref_k_51")) || 0,
                    ref_h_70: parseFloat(SM.getValue("ref_h_70")) || 0,
                    ref_d_136: parseFloat(SM.getValue("ref_d_136")) || 0,
                    ref_d_43: parseFloat(SM.getValue("ref_d_43")) || 0,
                    ref_i_43: parseFloat(SM.getValue("ref_i_43")) || 0,
                    ref_m_43: parseFloat(SM.getValue("ref_m_43")) || 0,
                    ref_i_98: parseFloat(SM.getValue("ref_i_98")) || 0,
                    ref_i_103: parseFloat(SM.getValue("ref_i_103")) || 0,
                    ref_m_121: parseFloat(SM.getValue("ref_m_121")) || 0,
                  };

                  result.refJ32 = {
                    legacy: legacyRefJ32,
                    computed: computedRefJ32,
                    diff: Math.abs(legacyRefJ32 - computedRefJ32),
                    match: Math.abs(legacyRefJ32 - computedRefJ32) < 5.0, // 5 kWh tolerance for floating-point precision
                    refIntermediates,
                    legacyRefIntermediates,
                    populateDebug: popResult?.debug ? {
                      standardName: popResult.debug.standardName,
                      cFieldsFromStandard: popResult.debug.cFieldsFromStandard.length,
                      cFieldsFromStateManager: popResult.debug.cFieldsFromStateManager.length,
                      cFieldsCopiedFromTarget: popResult.debug.cFieldsCopiedFromTarget.length,
                      cFieldsCopiedFromTargetList: popResult.debug.cFieldsCopiedFromTarget.slice(0, 15).map(f => `${f.legacyId}=${f.value}`),
                    } : null,
                  };

                  // Validate ref_k_32 (Reference Emissions Subtotal)
                  const computedRefK32 = parseFloat(
                    state.getValueForModel(targetId, "reference.emissions.subtotal")
                  ) || 0;
                  const legacyRefK32 = parseFloat(SM.getValue("ref_k_32")) || 0;
                  result.refK32 = {
                    legacy: legacyRefK32,
                    computed: computedRefK32,
                    diff: Math.abs(legacyRefK32 - computedRefK32),
                    match: Math.abs(legacyRefK32 - computedRefK32) < 1.0, // 1 kgCO2e tolerance
                  };

                  // Validate e_6 (Reference Lifetime Carbon)
                  const computedE6 = parseFloat(
                    state.getValueForModel(targetId, "keyValues.reference.lifetimeCarbon")
                  ) || 0;
                  const legacyE6 = parseFloat(SM.getValue("e_6")) || 0;
                  result.e6 = {
                    legacy: legacyE6,
                    computed: computedE6,
                    diff: Math.abs(legacyE6 - computedE6),
                    match: Math.abs(legacyE6 - computedE6) < 0.2, // 0.2 kgCO2e/m²/yr tolerance
                  };

                  // Validate e_8 (Reference Annual Carbon)
                  const computedE8 = parseFloat(
                    state.getValueForModel(targetId, "keyValues.reference.annualCarbon")
                  ) || 0;
                  const legacyE8 = parseFloat(SM.getValue("e_8")) || 0;
                  result.e8 = {
                    legacy: legacyE8,
                    computed: computedE8,
                    diff: Math.abs(legacyE8 - computedE8),
                    match: Math.abs(legacyE8 - computedE8) < 0.2, // 0.2 kgCO2e/m²/yr tolerance
                  };
                } catch (refErr) {
                  result.refJ32 = { error: refErr.message };
                }
              }

              result.stations = stations().map((id) => ({ id, loaded: !!CS.get(id) }));

              resolve(result);
              } catch (innerErr) {
                resolve({ error: `Inner error: ${innerErr.message}`, mismatches: 0, mismatchDetails: [] });
              }
            };
            setTimeout(validate, 500);
          } catch (err) {
            resolve({ error: err.message, mismatches: 0, mismatchDetails: [] });
          }
        });
      }, csvContent);

      result.file = csvFile;
      allResults.push(result);

      // Always show ref_j_32 status
      if (result.refJ32) {
        if (result.refJ32.error) {
          console.log(`  [ref_j_32] ERROR: ${result.refJ32.error}`);
        } else if (result.refJ32.match) {
          console.log(`  [ref_j_32] ✅ MATCH legacy=${result.refJ32.legacy.toFixed(2)} computed=${result.refJ32.computed.toFixed(2)} diff=${result.refJ32.diff.toFixed(2)}`);
        } else {
          console.log(`  [ref_j_32] ❌ MISMATCH legacy=${result.refJ32.legacy.toFixed(2)} computed=${result.refJ32.computed.toFixed(2)} diff=${result.refJ32.diff.toFixed(2)}`);
          // Show diagnostic comparison
          const ri = result.refJ32.refIntermediates;
          const li = result.refJ32.legacyRefIntermediates;
          if (ri && li) {
            console.log(`     [Ref Model Inputs]`);
            console.log(`       d_113 heat:    graph="${ri.d_113_heatingType}" legacy="${li.ref_d_113}"`);
            console.log(`       d_51 dhw:      graph="${ri.d_51_dhwType}" legacy="${li.ref_d_51}"`);
            console.log(`       d_65 plug:     graph="${ri.d_65_plugLoad}"`);
            console.log(`       d_67 equip:    graph="${ri.d_67_equipLoad}"`);
            console.log(`     [Ventilation Inputs]`);
            console.log(`       g_118 method:  graph="${ri.g_118_ventMethod}" legacy="${li.ref_g_118}"`);
            console.log(`       l_118 ACH:     graph="${ri.l_118_ventAch}" legacy="${li.ref_l_118}"`);
            console.log(`       d_119 rate:    graph="${ri.d_119_ventRate}" legacy="${li.ref_d_119}"`);
            console.log(`       d_118 HRV eff: graph="${ri.d_118_hrvEff}" legacy="${li.ref_d_118}"`);
            console.log(`       d_120 ventRate: graph=${ri.d_120_ventVolumetric.toFixed(2)} legacy=${li.ref_d_120.toFixed(2)} diff=${(ri.d_120_ventVolumetric - li.ref_d_120).toFixed(2)}`);
            console.log(`       d_121 grossHL:  graph=${ri.d_121_ventGross.toFixed(2)} legacy=${li.ref_d_121.toFixed(2)} diff=${(ri.d_121_ventGross - li.ref_d_121).toFixed(2)}`);
            console.log(`     [Ref Model Intermediates vs Legacy]`);
            console.log(`       i_98 transLoss:  graph=${ri.i_98_transLoss.toFixed(2)} legacy=${li.ref_i_98.toFixed(2)} diff=${(ri.i_98_transLoss - li.ref_i_98).toFixed(2)}`);
            console.log(`       i_103 airLeak:   graph=${ri.i_103_airLeak.toFixed(2)} legacy=${li.ref_i_103.toFixed(2)} diff=${(ri.i_103_airLeak - li.ref_i_103).toFixed(2)}`);
            console.log(`       m_121 ventLoss:  graph=${ri.m_121_ventLoss.toFixed(2)} legacy=${li.ref_m_121.toFixed(2)} diff=${(ri.m_121_ventLoss - li.ref_m_121).toFixed(2)}`);
            console.log(`       d_127 TED:       graph=${ri.d_127_ted.toFixed(2)} legacy=${li.ref_d_127.toFixed(2)} diff=${(ri.d_127_ted - li.ref_d_127).toFixed(2)}`);
            console.log(`       d_114 heatDemand: graph=${ri.d_114_heatDemand.toFixed(2)} legacy=${li.ref_d_114.toFixed(2)} diff=${(ri.d_114_heatDemand - li.ref_d_114).toFixed(2)}`);
            console.log(`       d_117 coolDemand: graph=${ri.d_117_coolDemand.toFixed(2)} legacy=${li.ref_d_117.toFixed(2)} diff=${(ri.d_117_coolDemand - li.ref_d_117).toFixed(2)}`);
            console.log(`       k_51 dhwElec:    graph=${ri.k_51_dhwElec.toFixed(2)} legacy=${li.ref_k_51.toFixed(2)} diff=${(ri.k_51_dhwElec - li.ref_k_51).toFixed(2)}`);
            console.log(`       h_70 plugLoads:  graph=${ri.h_70_plugLoads.toFixed(2)} legacy=${li.ref_h_70.toFixed(2)} diff=${(ri.h_70_plugLoads - li.ref_h_70).toFixed(2)}`);
            console.log(`       d_136 totalAll:  graph=${ri.d_136_totalEnergy.toFixed(2)} legacy=${li.ref_d_136.toFixed(2)} diff=${(ri.d_136_totalEnergy - li.ref_d_136).toFixed(2)}`);
            console.log(`       d_43 onsiteRenew: graph=${ri.d_43_onsiteRenew.toFixed(2)} legacy=${li.ref_d_43.toFixed(2)}`);
            console.log(`       i_43 offsiteRenew: graph=${ri.i_43_offsiteRenew.toFixed(2)} legacy=${li.ref_i_43.toFixed(2)}`);
            console.log(`       m_43 extLoads:   graph=${ri.m_43_extLoads.toFixed(2)} legacy=${li.ref_m_43.toFixed(2)}`);
            console.log(`       j_32 = d_136 - d_43 - i_43 = ${ri.j_32_targetTotal.toFixed(2)}`);
          }
          if (result.refJ32.populateDebug) {
            const pd = result.refJ32.populateDebug;
            console.log(`     [populate: std="${pd.standardName}" fromStd=${pd.cFieldsFromStandard} fromSM=${pd.cFieldsFromStateManager} fromTarget=${pd.cFieldsCopiedFromTarget}]`);
            if (pd.cFieldsCopiedFromTargetList.length > 0) {
              console.log(`       Target fallbacks: ${pd.cFieldsCopiedFromTargetList.join(', ')}`);
            }
          }
        }
      }

      // Show ref_k_32 status
      if (result.refK32) {
        if (result.refK32.match) {
          console.log(`  [ref_k_32] ✅ MATCH legacy=${result.refK32.legacy.toFixed(2)} computed=${result.refK32.computed.toFixed(2)} diff=${result.refK32.diff.toFixed(2)}`);
        } else {
          console.log(`  [ref_k_32] ❌ MISMATCH legacy=${result.refK32.legacy.toFixed(2)} computed=${result.refK32.computed.toFixed(2)} diff=${result.refK32.diff.toFixed(2)}`);
        }
      }

      // Show e_6 (Reference Lifetime Carbon) status
      if (result.e6) {
        if (result.e6.match) {
          console.log(`  [e_6]      ✅ MATCH legacy=${result.e6.legacy.toFixed(2)} computed=${result.e6.computed.toFixed(2)} diff=${result.e6.diff.toFixed(2)}`);
        } else {
          console.log(`  [e_6]      ❌ MISMATCH legacy=${result.e6.legacy.toFixed(2)} computed=${result.e6.computed.toFixed(2)} diff=${result.e6.diff.toFixed(2)}`);
        }
      }

      // Show e_8 (Reference Annual Carbon) status
      if (result.e8) {
        if (result.e8.match) {
          console.log(`  [e_8]      ✅ MATCH legacy=${result.e8.legacy.toFixed(2)} computed=${result.e8.computed.toFixed(2)} diff=${result.e8.diff.toFixed(2)}`);
        } else {
          console.log(`  [e_8]      ❌ MISMATCH legacy=${result.e8.legacy.toFixed(2)} computed=${result.e8.computed.toFixed(2)} diff=${result.e8.diff.toFixed(2)}`);
        }
      }

      if (result.mismatches > 0) {
        console.log(`  ❌ FAIL: ${result.mismatches} mismatches`);
        result.mismatchDetails.slice(0, 3).forEach((m) => {
          console.log(`     ${m.legacyId}: OLD=${m.old} NEW=${m.new}`);
        });
        // Show j_27 debug info if j_27 is a mismatch
        if (result.mismatchDetails.some(m => m.legacyId === "j_27") && result.j27Debug) {
          const d = result.j27Debug;
          console.log(`     [j_27 = d_136 - d_43 - i_43]`);
          console.log(`       d_136: OLD=${d.d_136.old.toFixed(2)} NEW=${d.d_136.new.toFixed(2)} diff=${(d.d_136.new - d.d_136.old).toFixed(2)}`);
          console.log(`       d_43:  OLD=${d.d_43.old.toFixed(2)} NEW=${d.d_43.new.toFixed(2)}`);
          console.log(`       i_43:  OLD=${d.i_43.old.toFixed(2)} NEW=${d.i_43.new.toFixed(2)}`);
          console.log(`     [d_136 = k51 + d117 + d114 + m43 + h70]`);
          console.log(`       k_51:  OLD=${d.k_51.old.toFixed(2)} NEW=${d.k_51.new.toFixed(2)} diff=${(d.k_51.new - d.k_51.old).toFixed(2)}`);
          console.log(`       d_117: OLD=${d.d_117.old.toFixed(2)} NEW=${d.d_117.new.toFixed(2)} diff=${(d.d_117.new - d.d_117.old).toFixed(2)}`);
          console.log(`       d_114: OLD=${d.d_114.old.toFixed(2)} NEW=${d.d_114.new.toFixed(2)} diff=${(d.d_114.new - d.d_114.old).toFixed(2)}`);
          console.log(`       m_43:  OLD=${d.m_43.old.toFixed(2)} NEW=${d.m_43.new.toFixed(2)}`);
          console.log(`       h_70:  OLD=${d.h_70.old.toFixed(2)} NEW=${d.h_70.new.toFixed(2)}`);
          console.log(`     [d_114 = d_127 / copHeat]`);
          console.log(`       d_127 (TED):         OLD=${d.d_127.old.toFixed(2)} NEW=${d.d_127.new.toFixed(2)} diff=${(d.d_127.new - d.d_127.old).toFixed(2)}`);
          console.log(`       h_113 (copHeat):     OLD=${d.copHeat_h113.old.toFixed(4)} NEW=${d.copHeat_h113.new.toFixed(4)}`);
          console.log(`     [d_117 = m_129 / copCool]`);
          console.log(`       m_129 (CED mit):     OLD=${d.m_129.old.toFixed(2)} NEW=${d.m_129.new.toFixed(2)} diff=${(d.m_129.new - d.m_129.old).toFixed(2)}`);
          console.log(`       j_113 (coolDerived): OLD=${d.j_113_coolDerived.old.toFixed(4)} NEW=${d.j_113_coolDerived.new.toFixed(4)}`);
          console.log(`       j_116 (coolDedic):   OLD=${d.j_116_coolDedicated.old.toFixed(4)} NEW=${d.j_116_coolDedicated.new.toFixed(4)}`);
          console.log(`     [CED chain: m_129 = d_129 - h_124 - d_123]`);
          console.log(`       d_129 (CED unmit):   OLD=${d.d_129_ced_unmit.old.toFixed(2)} NEW=${d.d_129_ced_unmit.new.toFixed(2)}`);
          console.log(`       h_124 (free cool):   OLD=${d.h_124_freeCool.old.toFixed(2)} NEW=${d.h_124_freeCool.new.toFixed(2)}`);
          console.log(`       d_123 (vent recov):  OLD=${d.d_123_ventRecov.old.toFixed(2)} NEW=${d.d_123_ventRecov.new.toFixed(2)}`);
          console.log(`       k_104 (heat gain):   OLD=${d.k_104_heatGain.old.toFixed(2)} NEW=${d.k_104_heatGain.new.toFixed(2)}`);
          console.log(`     [Raw inputs]`);
          console.log(`       f_113 (HSPF):        OLD=${d.f_113.old.toFixed(2)} NEW=${d.f_113.new.toFixed(2)}`);
        }
        // Show i_103 debug if i_103 is a mismatch
        if (result.mismatchDetails.some(m => m.legacyId === "i_103") && result.i103Debug) {
          const a = result.i103Debug;
          console.log(`     [i_103 Air Leakage Chain]`);
          console.log(`       i_103 result:    OLD=${a.i_103.old.toFixed(2)} NEW=${a.i_103.new.toFixed(2)} diff=${(a.i_103.new - a.i_103.old).toFixed(2)}`);
          console.log(`       g_108 NRL50:     OLD=${a.g_108_nrl50.old.toFixed(4)} NEW=${a.g_108_nrl50.new.toFixed(4)}`);
          console.log(`       d_101 area:      OLD=${a.d_101_area.old.toFixed(2)} NEW=${a.d_101_area.new.toFixed(2)}`);
          console.log(`       g_110 nFactor:   OLD=${a.g_110_nFactor.old.toFixed(2)} NEW=${a.g_110_nFactor.new.toFixed(2)}`);
          console.log(`       h_20 HDD:        OLD=${a.h_20_hdd.old.toFixed(2)} NEW=${a.h_20_hdd.new.toFixed(2)}`);
          console.log(`     [NRL50 Inputs]`);
          console.log(`       d_108 method:    OLD="${a.d_108_method.old}" NEW="${a.d_108_method.new}"`);
          console.log(`       g_109 measAch50: OLD=${a.g_109_measuredAch50.old.toFixed(2)} NEW=${a.g_109_measuredAch50.new.toFixed(2)}`);
          console.log(`       d_105 volume:    OLD=${a.d_105_volume.old.toFixed(2)} NEW=${a.d_105_volume.new.toFixed(2)}`);
        }
        // Show ref_m_124 debug if ref_m_124 is a mismatch
        if (result.mismatchDetails.some(m => m.legacyId === "m_124" || m.legacyId === "ref_m_124") && result.refM124Debug) {
          const d = result.refM124Debug;
          console.log(`     [ref_m_124 Days Active Cooling Dependencies]`);
          console.log(`       m_124:       OLD=${d.m_124.old.toFixed(2)} NEW=${d.m_124.new.toFixed(2)} diff=${(d.m_124.new - d.m_124.old).toFixed(2)}`);
          console.log(`       m_129 (CED mitigated):  OLD=${d.m_129.old.toFixed(2)} NEW=${d.m_129.new.toFixed(2)} diff=${(d.m_129.new - d.m_129.old).toFixed(2)}`);
          console.log(`       freeCoolingPotential:   NEW=${d.freeCoolingPotential.new.toFixed(2)} kWh/yr`);
          console.log(`       d_21 CDD:    OLD=${d.d_21.old} NEW=${d.d_21.new}`);
          console.log(`       m_19 days:   OLD=${d.m_19.old} NEW=${d.m_19.new}`);
          console.log(`       d_116 cool:  OLD=${d.d_116.old} NEW=${d.d_116.new}`);
          console.log(`       d_129 (CED unmitigated):  OLD=${d.d_129_unmitigated.old.toFixed(2)} NEW=${d.d_129_unmitigated.new.toFixed(2)} diff=${(d.d_129_unmitigated.new - d.d_129_unmitigated.old).toFixed(2)}`);
          console.log(`       h_124 (free cool limit): OLD=${d.h_124_freeCoolingLimit.old.toFixed(2)} NEW=${d.h_124_freeCoolingLimit.new.toFixed(2)}`);
          console.log(`       d_120 (vent rate):       OLD=${d.d_120_ventVolumetric.old.toFixed(2)} NEW=${d.d_120_ventVolumetric.new.toFixed(2)}`);
        }
        // Show e_10 Reference debug if e_10 is a mismatch
        if (result.mismatchDetails.some(m => m.legacyId === "e_10") && result.refDebug) {
          const r = result.refDebug;
          console.log(`     [e_10 Reference TEUI Chain]`);
          console.log(`       e_10 result:     OLD=${r.e_10.old.toFixed(2)} NEW=${r.e_10.new.toFixed(2)} diff=${(r.e_10.new - r.e_10.old).toFixed(2)}`);
          console.log(`       ref_j_32 total:  OLD=${r.ref_j_32.old.toFixed(2)} NEW=${r.ref_j_32.new.toFixed(2)}`);
          console.log(`       ref_h_15 area:   OLD=${r.ref_h_15.old.toFixed(2)} NEW=${r.ref_h_15.new.toFixed(2)}`);
          console.log(`       d_13 standard:   "${r.d_13}"`);
          console.log(`     [Target Model's reference.* values (used for e_10)]`);
          console.log(`       targetRefJ32:    ${r.targetRefJ32?.toFixed(2) || 'N/A'}`);
          console.log(`       targetRefH15:    ${r.targetRefH15?.toFixed(2) || 'N/A'}`);
          console.log(`       targetE10:       ${r.targetE10?.toFixed(2) || 'N/A'}`);
          if (r.refIntermediate) {
            const ri = r.refIntermediate;
            console.log(`     [Reference Model Intermediate Values]`);
            console.log(`       d_127 TED:       ${ri.d_127_ted.toFixed(2)}`);
            console.log(`       i_98 transLoss:  ${ri.i_98_transLoss.toFixed(2)}`);
            console.log(`       i_103 airLeak:   ${ri.i_103_airLeak.toFixed(2)}`);
            console.log(`       m_121 ventLoss:  ${ri.m_121_ventLoss.toFixed(2)}`);
            console.log(`       i_80 radGains:   ${ri.i_80_radGains.toFixed(2)}`);
            console.log(`       d_114 heatDemand:${ri.d_114_heatDemand.toFixed(2)}`);
            console.log(`       d_117 coolDemand:${ri.d_117_coolDemand.toFixed(2)}`);
            console.log(`       d_136 totalAll:  ${ri.d_136_totalEnergy.toFixed(2)}`);
            console.log(`       j_32 total:      ${ri.j_32_targetTotal.toFixed(2)}`);
            console.log(`       MAPPING: ref j_32=${ri.j_32_targetTotal.toFixed(2)} → tgt ref_j_32=${r.targetRefJ32?.toFixed(2)}`);
          }
          console.log(`     [Reference C-Field Sources]`);
          console.log(`       ref_f_85 (walls): ${r.ref_f_85}`);
          console.log(`       ref_f_86 (roof):  ${r.ref_f_86}`);
          console.log(`       ref_g_89 (win):   ${r.ref_g_89}`);
          console.log(`       ref_f_113 (hspf): ${r.ref_f_113}`);
          console.log(`       ref_d_118 (hrv):  ${r.ref_d_118}`);
          if (r.populateDebug) {
            const pd = r.populateDebug;
            console.log(`     [populateReferenceModel Debug]`);
            console.log(`       Standard: ${pd.standardName}`);
            console.log(`       G-fields copied: ${pd.gFields.length}`);
            console.log(`       C-fields from standard: ${pd.cFieldsFromStandard.length}`);
            console.log(`       C-fields from StateManager: ${pd.cFieldsFromStateManager.length}`);
            console.log(`       C-fields copied from Target: ${pd.cFieldsCopiedFromTarget.length}`);
            if (pd.cFieldsCopiedFromTarget.length > 0) {
              console.log(`       ⚠️  C-fields fallback to Target (potential issues):`);
              pd.cFieldsCopiedFromTarget.slice(0, 10).forEach(f => {
                console.log(`         - ${f.legacyId}: ${f.value}`);
              });
              if (pd.cFieldsCopiedFromTarget.length > 10) {
                console.log(`         ... and ${pd.cFieldsCopiedFromTarget.length - 10} more`);
              }
            }
          }
        }
        // Always show climate debug for mismatches
        if (result.climateDebug) {
          const c = result.climateDebug;
          console.log(`     [Climate & Mechanical Inputs]`);
          console.log(`       d_19 province:  OLD="${c.d_19_province.old}" NEW="${c.d_19_province.new}"`);
          console.log(`       h_19 city:      OLD="${c.h_19_city.old}" NEW="${c.h_19_city.new}"`);
          console.log(`       h_20 timeframe: OLD="${c.h_20_timeframe.old}" NEW="${c.h_20_timeframe.new}"`);
          console.log(`       d_21 CDD:       OLD="${c.d_21_cdd.old}" NEW="${c.d_21_cdd.new}"`);
          console.log(`       d_116 cooling:  OLD="${c.d_116_coolingType.old}" NEW="${c.d_116_coolingType.new}"`);
          console.log(`       d_113 heating:  OLD="${c.d_113_heatingType.old}" NEW="${c.d_113_heatingType.new}"`);
        }
      } else {
        console.log(
          `  ✅ PASS (${result.matches} matches, ${result.close} close)`
        );
        if (result.closeDetails && result.closeDetails.length > 0) {
          result.closeDetails.forEach((c) => {
            console.log(`     ~ ${c.legacyId}: OLD=${c.old} NEW=${c.new} (${c.pctDiff})`);
          });
        }
      }
    }

    // Write results to file
    // Summarize ref_j_32 results
    const refJ32Summary = {
      total: allResults.filter(r => r.refJ32 && !r.refJ32.error).length,
      matched: allResults.filter(r => r.refJ32?.match).length,
      mismatched: allResults.filter(r => r.refJ32 && !r.refJ32.error && !r.refJ32.match).length,
      errors: allResults.filter(r => r.refJ32?.error).length,
    };
    console.log(`\nref_j_32 Summary: ${refJ32Summary.matched}/${refJ32Summary.total} matched, ${refJ32Summary.mismatched} mismatched, ${refJ32Summary.errors} errors`);

    // Summarize ref_k_32 results
    const refK32Summary = {
      total: allResults.filter(r => r.refK32).length,
      matched: allResults.filter(r => r.refK32?.match).length,
      mismatched: allResults.filter(r => r.refK32 && !r.refK32.match).length,
    };
    console.log(`ref_k_32 Summary: ${refK32Summary.matched}/${refK32Summary.total} matched, ${refK32Summary.mismatched} mismatched`);

    // Summarize e_6 (Reference Lifetime Carbon) results
    const e6Summary = {
      total: allResults.filter(r => r.e6).length,
      matched: allResults.filter(r => r.e6?.match).length,
      mismatched: allResults.filter(r => r.e6 && !r.e6.match).length,
    };
    console.log(`e_6 Summary:      ${e6Summary.matched}/${e6Summary.total} matched, ${e6Summary.mismatched} mismatched`);

    // Summarize e_8 (Reference Annual Carbon) results
    const e8Summary = {
      total: allResults.filter(r => r.e8).length,
      matched: allResults.filter(r => r.e8?.match).length,
      mismatched: allResults.filter(r => r.e8 && !r.e8.match).length,
    };
    console.log(`e_8 Summary:      ${e8Summary.matched}/${e8Summary.total} matched, ${e8Summary.mismatched} mismatched`);

    const output = {
      timestamp: new Date().toISOString(),
      summary: {
        total: csvFiles.length,
        passed: allResults.filter((r) => !r.error && r.mismatches === 0).length,
        failed: allResults.filter((r) => r.error || r.mismatches > 0).length,
        refJ32: refJ32Summary,
      },
      uniqueMismatches: collectUniqueMismatches(allResults),
      byFile: allResults.map((r) => ({
        file: r.file,
        matches: r.matches,
        close: r.close,
        mismatches: r.mismatches,
        error: r.error,
        refJ32: r.refJ32,
      })),
    };

    fs.writeFileSync(RESULTS_FILE, JSON.stringify(output, null, 2));
    console.log(`\nResults written to ${RESULTS_FILE}`);

    // Assert ref_j_32 matches for all case studies (primary validation metric)
    // Note: Secondary field mismatches are logged but not asserted - ref_j_32 is the critical output
    const refJ32Mismatches = allResults.filter(r => r.refJ32 && !r.refJ32.error && !r.refJ32.match).length;
    const refJ32Errors = allResults.filter(r => r.refJ32?.error).length;
    expect(refJ32Mismatches).toBe(0);
    expect(refJ32Errors).toBe(0);

    // Assert ref_k_32 (Reference Emissions) matches
    const refK32Mismatches = allResults.filter(r => r.refK32 && !r.refK32.match).length;
    expect(refK32Mismatches).toBe(0);

    // Assert e_6 (Reference Lifetime Carbon) matches
    const e6Mismatches = allResults.filter(r => r.e6 && !r.e6.match).length;
    expect(e6Mismatches).toBe(0);

    // Assert e_8 (Reference Annual Carbon) matches
    const e8Mismatches = allResults.filter(r => r.e8 && !r.e8.match).length;
    expect(e8Mismatches).toBe(0);

    // Assert every case's climate station loaded, so its ISO 52016-1 cooling
    // ran - without it the cooling rows read 0 and the parity above still holds
    const stationNotLoaded = allResults
      .filter(r => !r.error && !(r.stations.length && r.stations.every(s => s.loaded)))
      .map(r => r.file);
    expect(stationNotLoaded).toEqual([]);
  });
});

function collectUniqueMismatches(allResults) {
  const map = new Map();
  allResults.forEach((r) => {
    (r.mismatchDetails || []).forEach((m) => {
      if (!map.has(m.legacyId)) {
        map.set(m.legacyId, {
          legacyId: m.legacyId,
          path: m.path,
          occurrences: [],
        });
      }
      map.get(m.legacyId).occurrences.push({
        file: r.file,
        old: m.old,
        new: m.new,
        pctDiff: m.pctDiff,
      });
    });
  });
  return Array.from(map.values());
}
