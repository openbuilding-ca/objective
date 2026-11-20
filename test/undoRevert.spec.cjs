// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE_STUDIES_DIR = path.join(__dirname, "computation", "case-studies");

test.describe("Undo / Revert to Import", () => {
  test("province and city revert correctly after undo", async ({ page }) => {
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

    // Import a case study (use first available CSV)
    const csvFiles = fs
      .readdirSync(CASE_STUDIES_DIR)
      .filter((f) => f.endsWith(".csv"))
      .sort();
    const csvContent = fs.readFileSync(
      path.join(CASE_STUDIES_DIR, csvFiles[0]),
      "utf-8"
    );

    console.log(`Importing: ${csvFiles[0]}`);

    // Step 1: Import CSV and capture the imported state
    const importedState = await page.evaluate(async (csv) => {
      return new Promise((resolve) => {
        window.TEUI.FileHandler.processImportedCSV(csv);
        setTimeout(() => {
          const SM = window.TEUI.StateManager;
          const state = window.TEUI.ComputationIntegration.getState();
          const targetId = state.getActiveModelId();
          resolve({
            province: SM.getValue("d_19"),
            city: SM.getValue("h_19"),
            // Capture key target values that depend on province/city
            hdd: SM.getValue("d_20"),
            cdd: SM.getValue("d_21"),
            graphProvince: state.getValueForModel(targetId, "climate.location.province"),
            graphCity: state.getValueForModel(targetId, "climate.location.city"),
            // Capture a few computed target values
            e6: SM.getValue("e_6"),
            e8: SM.getValue("e_8"),
            refJ32: SM.getValue("ref_j_32"),
          });
        }, 1000);
      });
    }, csvContent);

    console.log(`Imported state: province=${importedState.province}, city=${importedState.city}`);
    console.log(`  HDD=${importedState.hdd}, CDD=${importedState.cdd}`);
    console.log(`  Graph: province=${importedState.graphProvince}, city=${importedState.graphCity}`);
    console.log(`  e_6=${importedState.e6}, e_8=${importedState.e8}, ref_j_32=${importedState.refJ32}`);

    expect(importedState.province).toBeTruthy();
    expect(importedState.city).toBeTruthy();

    // Step 2: Change province and city to something different
    const changedState = await page.evaluate(async (origProvince) => {
      return new Promise((resolve) => {
        const SM = window.TEUI.StateManager;

        // Pick a different province
        const newProvince = origProvince === "BC" ? "ON" : "BC";

        // Set new province via public API (same path as UI dropdown change)
        SM.setValue("d_19", newProvince, "user-modified");

        // Sync S03 dropdowns so city options are populated for new province
        const sect03 = window.TEUI.SectionModules?.sect03;
        if (sect03?.syncLocationDropdowns) {
          sect03.syncLocationDropdowns();
        }

        // Pick the first city for the new province
        const newCity = SM.getValue("h_19");

        // Recalculate
        window.TEUI.Calculator.calculateAll();

        setTimeout(() => {
          const state = window.TEUI.ComputationIntegration.getState();
          const targetId = state.getActiveModelId();
          resolve({
            province: SM.getValue("d_19"),
            city: SM.getValue("h_19"),
            hdd: SM.getValue("d_20"),
            cdd: SM.getValue("d_21"),
            graphProvince: state.getValueForModel(targetId, "climate.location.province"),
            graphCity: state.getValueForModel(targetId, "climate.location.city"),
            e6: SM.getValue("e_6"),
            e8: SM.getValue("e_8"),
            refJ32: SM.getValue("ref_j_32"),
          });
        }, 500);
      });
    }, importedState.province);

    console.log(`Changed state: province=${changedState.province}, city=${changedState.city}`);
    console.log(`  HDD=${changedState.hdd}, CDD=${changedState.cdd}`);
    console.log(`  Graph: province=${changedState.graphProvince}, city=${changedState.graphCity}`);

    // Verify province actually changed
    expect(changedState.province).not.toBe(importedState.province);
    console.log("Province changed successfully");

    // Step 3: Undo
    const undoneState = await page.evaluate(async () => {
      return new Promise((resolve) => {
        window.TEUI.StateManager.resetTier1_UndoChanges();

        setTimeout(() => {
          const SM = window.TEUI.StateManager;
          const state = window.TEUI.ComputationIntegration.getState();
          const targetId = state.getActiveModelId();

          // Also check DOM dropdown values
          const provDropdown = document.querySelector('[data-dropdown-id="dd_d_19"]');
          const cityDropdown = document.querySelector('[data-dropdown-id="dd_h_19"]');

          resolve({
            province: SM.getValue("d_19"),
            city: SM.getValue("h_19"),
            hdd: SM.getValue("d_20"),
            cdd: SM.getValue("d_21"),
            graphProvince: state.getValueForModel(targetId, "climate.location.province"),
            graphCity: state.getValueForModel(targetId, "climate.location.city"),
            e6: SM.getValue("e_6"),
            e8: SM.getValue("e_8"),
            refJ32: SM.getValue("ref_j_32"),
            // DOM values
            domProvince: provDropdown?.value || null,
            domCity: cityDropdown?.value || null,
            // Check city dropdown has options
            cityOptionCount: cityDropdown?.options?.length || 0,
          });
        }, 1000);
      });
    });

    console.log(`\nAfter undo:`);
    console.log(`  SM:    province=${undoneState.province}, city=${undoneState.city}`);
    console.log(`  Graph: province=${undoneState.graphProvince}, city=${undoneState.graphCity}`);
    console.log(`  DOM:   province=${undoneState.domProvince}, city=${undoneState.domCity}`);
    console.log(`  City dropdown options: ${undoneState.cityOptionCount}`);
    console.log(`  HDD=${undoneState.hdd}, CDD=${undoneState.cdd}`);
    console.log(`  e_6=${undoneState.e6}, e_8=${undoneState.e8}, ref_j_32=${undoneState.refJ32}`);

    // Verify province and city reverted
    console.log(`\nAssertions:`);

    console.log(`  Province: ${undoneState.province} === ${importedState.province} ? ${undoneState.province === importedState.province ? "PASS" : "FAIL"}`);
    expect(undoneState.province).toBe(importedState.province);

    console.log(`  City: ${undoneState.city} === ${importedState.city} ? ${undoneState.city === importedState.city ? "PASS" : "FAIL"}`);
    expect(undoneState.city).toBe(importedState.city);

    // Graph state matches
    console.log(`  Graph province: ${undoneState.graphProvince} === ${importedState.graphProvince} ? ${undoneState.graphProvince === importedState.graphProvince ? "PASS" : "FAIL"}`);
    expect(undoneState.graphProvince).toBe(importedState.graphProvince);

    console.log(`  Graph city: ${undoneState.graphCity} === ${importedState.graphCity} ? ${undoneState.graphCity === importedState.graphCity ? "PASS" : "FAIL"}`);
    expect(undoneState.graphCity).toBe(importedState.graphCity);

    // DOM dropdowns match
    console.log(`  DOM province: ${undoneState.domProvince} === ${importedState.province} ? ${undoneState.domProvince === importedState.province ? "PASS" : "FAIL"}`);
    expect(undoneState.domProvince).toBe(importedState.province);

    console.log(`  DOM city: ${undoneState.domCity} === ${importedState.city} ? ${undoneState.domCity === importedState.city ? "PASS" : "FAIL"}`);
    expect(undoneState.domCity).toBe(importedState.city);

    // City dropdown is populated
    console.log(`  City options > 0: ${undoneState.cityOptionCount} ? ${undoneState.cityOptionCount > 0 ? "PASS" : "FAIL"}`);
    expect(undoneState.cityOptionCount).toBeGreaterThan(0);

    // Key computed values reverted
    console.log(`  HDD: ${undoneState.hdd} === ${importedState.hdd} ? ${undoneState.hdd === importedState.hdd ? "PASS" : "FAIL"}`);
    expect(undoneState.hdd).toBe(importedState.hdd);

    console.log(`  e_6: ${undoneState.e6} === ${importedState.e6} ? ${undoneState.e6 === importedState.e6 ? "PASS" : "FAIL"}`);
    expect(undoneState.e6).toBe(importedState.e6);

    console.log(`  e_8: ${undoneState.e8} === ${importedState.e8} ? ${undoneState.e8 === importedState.e8 ? "PASS" : "FAIL"}`);
    expect(undoneState.e8).toBe(importedState.e8);

    console.log(`  ref_j_32: ${undoneState.refJ32} === ${importedState.refJ32} ? ${undoneState.refJ32 === importedState.refJ32 ? "PASS" : "FAIL"}`);
    expect(undoneState.refJ32).toBe(importedState.refJ32);

    console.log("\nAll undo assertions passed!");
  });
});
