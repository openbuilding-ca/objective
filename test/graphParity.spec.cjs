// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE_STUDIES_DIR = path.join(__dirname, "computation", "case-studies");

/**
 * Helper: load app, import first CSV, return page ready for assertions.
 */
async function loadAndImport(page) {
  await page.addInitScript(() => {
    localStorage.setItem("disclaimerSeen", "true");
  });

  // Over http (playwright.config.cjs's webServer), so the climate station
  // loads. init.js fetches a sample project 1.5 s after start-up, which over
  // http would land on top of the import below - keep it out, as file:// did.
  await page.route("**/src/template/case-studies/**", (route) => route.abort());
  await page.goto("/index.html");

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
  const csvContent = fs.readFileSync(
    path.join(CASE_STUDIES_DIR, csvFiles[0]),
    "utf-8"
  );

  await page.evaluate(async (csv) => {
    return new Promise((resolve) => {
      window.TEUI.FileHandler.processImportedCSV(csv);
      setTimeout(resolve, 1000);
    });
  }, csvContent);

  return csvFiles[0];
}

test.describe("Graph Parity Regression Tests", () => {
  test("no duplicate legacyId registrations in computation graph", async ({ page }) => {
    await loadAndImport(page);

    const duplicates = await page.evaluate(() => {
      const graph = window.TEUI.ComputationIntegration.getGraph();
      const nodeIds = graph.getAllNodeIds();
      const legacyIdMap = {};
      const dupes = [];

      for (const nodeId of nodeIds) {
        const node = graph.getNode(nodeId);
        if (!node?.legacyId) continue;

        if (legacyIdMap[node.legacyId]) {
          dupes.push({
            legacyId: node.legacyId,
            first: legacyIdMap[node.legacyId],
            second: nodeId,
          });
        } else {
          legacyIdMap[node.legacyId] = nodeId;
        }
      }

      // Also check inputs
      const inputs = graph.getAllInputIds ? graph.getAllInputIds() : [];
      for (const inputId of inputs) {
        const input = graph.getInput ? graph.getInput(inputId) : null;
        if (!input?.legacyId) continue;

        if (legacyIdMap[input.legacyId]) {
          dupes.push({
            legacyId: input.legacyId,
            first: legacyIdMap[input.legacyId],
            second: inputId,
          });
        } else {
          legacyIdMap[input.legacyId] = inputId;
        }
      }

      return dupes;
    });

    if (duplicates.length > 0) {
      console.log("Duplicate legacyId registrations:", duplicates);
    }
    expect(duplicates).toHaveLength(0);
  });

  test("ref_* dual-write: reference values exist in both models", async ({ page }) => {
    await loadAndImport(page);

    const result = await page.evaluate(() => {
      const state = window.TEUI.ComputationIntegration.getState();
      const models = state.getAllModels();
      const targetModel = models.find((m) => m.modelType === "target");
      const refModel = models.find((m) => m.modelType === "reference");
      if (!targetModel || !refModel) return { error: "Models not found" };

      const tid = targetModel.id;
      const rid = refModel.id;

      // These ref_* fields should exist in the reference model after CSV import + calculateAll
      // Reference model stores them under base paths (for reference-side computation)
      // Target model stores cross-model OUTPUTS under reference.* paths via REF_OUTPUT_TO_TARGET_INPUT
      // Test C-fields that are registered graph inputs with legacyId
      // LegacyAdapter dual-writes ref_* to both target reference.* path and reference base path
      const testFields = [
        { refField: "ref_f_85", refPath: "transmissionLoss.roof.rsi" },
        { refField: "ref_f_86", refPath: "transmissionLoss.walls.rsi" },
        { refField: "ref_f_87", refPath: "transmissionLoss.exposedFloor.rsi" },
      ];

      const results = [];
      for (const tf of testFields) {
        const smValue = window.TEUI.StateManager.getValue(tf.refField);
        const refValue = state.getValueForModel(rid, tf.refPath);

        results.push({
          field: tf.refField,
          smValue,
          refValue,
          smHasValue: smValue !== undefined && smValue !== null && smValue !== "",
          refHasValue: refValue !== undefined && refValue !== null,
        });
      }

      return { results };
    });

    if (result.error) {
      throw new Error(result.error);
    }

    for (const r of result.results) {
      console.log(
        `${r.field}: SM=${r.smValue}, refModel=${r.refValue}`
      );
      expect(r.smHasValue).toBe(true);
      expect(r.refHasValue).toBe(true);
      // SM and reference model should agree
      expect(parseFloat(r.refValue)).toBeCloseTo(parseFloat(r.smValue), 1);
    }
  });

  test("G-field per-model independence", async ({ page }) => {
    await loadAndImport(page);

    const result = await page.evaluate(() => {
      const state = window.TEUI.ComputationIntegration.getState();
      const models = state.getAllModels();
      const targetModel = models.find((m) => m.modelType === "target");
      const refModel = models.find((m) => m.modelType === "reference");
      if (!targetModel || !refModel) return { error: "Models not found" };

      const tid = targetModel.id;
      const rid = refModel.id;

      // Capture original target province
      const originalTargetProvince = state.getValueForModel(tid, "climate.location.province");

      // Write a different province to the reference model
      const newRefProvince = originalTargetProvince === "BC" ? "ON" : "BC";
      state.setValueForModel(rid, "climate.location.province", newRefProvince);

      // Read back both
      const afterTargetProvince = state.getValueForModel(tid, "climate.location.province");
      const afterRefProvince = state.getValueForModel(rid, "climate.location.province");

      return {
        originalTargetProvince,
        newRefProvince,
        afterTargetProvince,
        afterRefProvince,
      };
    });

    if (result.error) {
      throw new Error(result.error);
    }

    console.log(`Target province: ${result.originalTargetProvince} → ${result.afterTargetProvince} (should be unchanged)`);
    console.log(`Reference province: → ${result.afterRefProvince} (should be ${result.newRefProvince})`);

    // Target province must NOT change when reference province is set
    expect(result.afterTargetProvince).toBe(result.originalTargetProvince);
    // Reference province must have the new value
    expect(result.afterRefProvince).toBe(result.newRefProvince);
  });

  test("SM↔Graph parity: zero mismatches after import", async ({ page }) => {
    const csvFile = await loadAndImport(page);

    const result = await page.evaluate(() => {
      const graph = window.TEUI.ComputationIntegration.getGraph();
      const state = window.TEUI.ComputationIntegration.getState();
      const SM = window.TEUI.StateManager;
      const targetId = state.getActiveModelId();

      const mismatches = [];
      const ABS_TOL = 0.01;

      for (const nodePath of graph.getAllNodeIds()) {
        const node = graph.getNode(nodePath);
        if (!node?.legacyId) continue;

        const legacyId = node.legacyId;
        const smVal = SM.getValue(legacyId);
        const graphVal = state.getValueForModel(targetId, nodePath);

        if (smVal === undefined || smVal === null || smVal === "") continue;

        const smNum = parseFloat(smVal);
        const graphNum = parseFloat(graphVal);

        if (isNaN(smNum) || isNaN(graphNum)) {
          if (String(smVal) !== String(graphVal)) {
            mismatches.push({ legacyId, path: nodePath, sm: smVal, graph: graphVal });
          }
          continue;
        }

        if (Math.abs(smNum - graphNum) >= ABS_TOL) {
          mismatches.push({
            legacyId,
            path: nodePath,
            sm: smNum,
            graph: graphNum,
            diff: Math.abs(smNum - graphNum).toFixed(4),
          });
        }
      }

      return { mismatchCount: mismatches.length, mismatches: mismatches.slice(0, 10) };
    });

    console.log(`SM↔Graph parity for ${csvFile}: ${result.mismatchCount} mismatches`);
    if (result.mismatchCount > 0) {
      console.log("First mismatches:", JSON.stringify(result.mismatches, null, 2));
    }

    expect(result.mismatchCount).toBe(0);
  });

  test("reference model SM↔Graph parity: zero mismatches", async ({ page }) => {
    const csvFile = await loadAndImport(page);

    const result = await page.evaluate(() => {
      const graph = window.TEUI.ComputationIntegration.getGraph();
      const state = window.TEUI.ComputationIntegration.getState();
      const SM = window.TEUI.StateManager;
      const models = state.getAllModels();
      const refModel = models.find((m) => m.modelType === "reference");
      if (!refModel) return { error: "Reference model not found" };

      const rid = refModel.id;
      const mismatches = [];
      const ABS_TOL = 0.01;

      for (const nodePath of graph.getAllNodeIds()) {
        const node = graph.getNode(nodePath);
        if (!node?.legacyId) continue;
        // Skip reference.* paths (those are cross-model mappings on target only)
        if (nodePath.startsWith("reference.")) continue;

        const legacyId = node.legacyId;
        const smKey = `ref_${legacyId}`;
        const smVal = SM.getValue(smKey);
        const graphVal = state.getValueForModel(rid, nodePath);

        if (smVal === undefined || smVal === null || smVal === "") continue;

        const smNum = parseFloat(smVal);
        const graphNum = parseFloat(graphVal);

        if (isNaN(smNum) || isNaN(graphNum)) {
          if (String(smVal) !== String(graphVal)) {
            mismatches.push({ smKey, path: nodePath, sm: smVal, graph: graphVal });
          }
          continue;
        }

        if (Math.abs(smNum - graphNum) >= ABS_TOL) {
          mismatches.push({
            smKey,
            path: nodePath,
            sm: smNum,
            graph: graphNum,
            diff: Math.abs(smNum - graphNum).toFixed(4),
          });
        }
      }

      return { mismatchCount: mismatches.length, mismatches: mismatches.slice(0, 10) };
    });

    if (result.error) throw new Error(result.error);

    console.log(`Reference SM↔Graph parity for ${csvFile}: ${result.mismatchCount} mismatches`);
    if (result.mismatchCount > 0) {
      console.log("First mismatches:", JSON.stringify(result.mismatches, null, 2));
    }

    expect(result.mismatchCount).toBe(0);
  });

  test("mode switch round-trip preserves computed values", async ({ page }) => {
    await loadAndImport(page);

    const result = await page.evaluate(() => {
      const SM = window.TEUI.StateManager;

      // Capture key values in target mode
      const beforeSwitch = {
        e6: SM.getValue("e_6"),
        e8: SM.getValue("e_8"),
        d_127: SM.getValue("d_127"),
        ref_j_32: SM.getValue("ref_j_32"),
        ref_k_32: SM.getValue("ref_k_32"),
      };

      // Switch to reference mode
      window.TEUI.ReferenceToggle.switchMode("reference");

      // Switch back to target mode
      window.TEUI.ReferenceToggle.switchMode("target");

      // Capture values after round-trip
      const afterSwitch = {
        e6: SM.getValue("e_6"),
        e8: SM.getValue("e_8"),
        d_127: SM.getValue("d_127"),
        ref_j_32: SM.getValue("ref_j_32"),
        ref_k_32: SM.getValue("ref_k_32"),
      };

      return { beforeSwitch, afterSwitch };
    });

    for (const key of Object.keys(result.beforeSwitch)) {
      const before = result.beforeSwitch[key];
      const after = result.afterSwitch[key];
      const match = before === after;
      console.log(`${key}: ${before} → ${after} ${match ? "PASS" : "FAIL"}`);
      expect(after).toBe(before);
    }
  });

  test("writeUserInput applies ref_ prefix in reference mode", async ({ page }) => {
    await loadAndImport(page);

    const result = await page.evaluate(() => {
      const SM = window.TEUI.StateManager;
      const RT = window.TEUI.ReferenceToggle;

      // Get a known input field and its current target value
      const targetValue = SM.getValue("d_56");

      // Switch to reference mode
      RT.switchMode("reference");

      // Simulate writeUserInput (same logic as FieldManager)
      const testValue = "999";
      const isRef = RT.isReferenceMode();
      const key = isRef ? "ref_d_56" : "d_56";
      SM.setValue(key, testValue, "user-modified");

      // Verify: ref_d_56 should have new value, d_56 should be unchanged
      const refResult = SM.getValue("ref_d_56");
      const targetResult = SM.getValue("d_56");

      // Switch back
      RT.switchMode("target");

      return {
        isRef,
        key,
        targetOriginal: targetValue,
        refAfterWrite: refResult,
        targetAfterWrite: targetResult,
      };
    });

    console.log(`Reference mode: ${result.isRef}, wrote to key: ${result.key}`);
    console.log(`Target d_56: ${result.targetOriginal} → ${result.targetAfterWrite} (should be unchanged)`);
    console.log(`ref_d_56: ${result.refAfterWrite} (should be 999)`);

    expect(result.isRef).toBe(true);
    expect(result.key).toBe("ref_d_56");
    expect(result.refAfterWrite).toBe("999");
    // Target value should NOT have been overwritten
    expect(result.targetAfterWrite).toBe(result.targetOriginal);
  });
});
