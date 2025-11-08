/**
 * SIMPLE RESET TEST SCRIPT
 *
 * Copy this entire file and paste into browser console.
 * Then run the test commands below.
 */

window.resetTest = {

  // TEST 1: Check if imported state was saved
  checkImportedState: function() {
    console.log("\n=== TEST 1: Check Imported State ===");

    const importedStateJson = localStorage.getItem("TEUI_Last_Imported_State");

    if (!importedStateJson) {
      console.error("❌ FAIL: No imported state found in localStorage");
      return false;
    }

    const importedState = JSON.parse(importedStateJson);
    const fieldCount = Object.keys(importedState).length;

    console.log(`✅ Found ${fieldCount} fields in lastImportedState`);

    // Check key test fields
    const testFields = ["h_12", "h_15", "d_31", "d_113"];
    console.log("\nTest fields in imported state:");
    testFields.forEach(f => {
      if (importedState[f] !== undefined) {
        console.log(`  ✅ ${f} = ${importedState[f]}`);
      } else {
        console.log(`  ❌ ${f} = NOT FOUND`);
      }
    });

    return importedState;
  },

  // TEST 2: Check current StateManager values
  checkStateManager: function() {
    console.log("\n=== TEST 2: Check StateManager Values ===");

    const testFields = ["h_12", "h_15", "d_31", "d_113"];

    console.log("Current StateManager values:");
    testFields.forEach(f => {
      const value = TEUI.StateManager.getValue(f);
      console.log(`  ${f} = ${value}`);
    });
  },

  // TEST 3: Check DOM values
  checkDOM: function() {
    console.log("\n=== TEST 3: Check DOM Values ===");

    const testFields = ["h_12", "h_15", "d_31", "d_113"];

    console.log("Current DOM values:");
    testFields.forEach(f => {
      const el = document.querySelector(`[data-field-id="${f}"]`);
      if (el) {
        const value = el.value || el.textContent.trim();
        console.log(`  ${f} = ${value}`);
      } else {
        console.log(`  ${f} = ELEMENT NOT FOUND`);
      }
    });
  },

  // TEST 4: Compare all three sources
  compareAll: function() {
    console.log("\n=== TEST 4: Compare All Sources ===");

    const importedStateJson = localStorage.getItem("TEUI_Last_Imported_State");
    if (!importedStateJson) {
      console.error("❌ No imported state to compare");
      return;
    }

    const importedState = JSON.parse(importedStateJson);
    const testFields = ["h_12", "h_15", "d_31", "d_113"];

    console.log("Field | Imported | StateManager | DOM | Match?");
    console.log("------|----------|--------------|-----|-------");

    testFields.forEach(f => {
      const imported = importedState[f];
      const stateManager = TEUI.StateManager.getValue(f);
      const el = document.querySelector(`[data-field-id="${f}"]`);
      const dom = el ? (el.value || el.textContent.trim()) : "NOT FOUND";

      const match = (imported == stateManager && stateManager == dom) ? "✅ YES" : "❌ NO";

      console.log(`${f} | ${imported} | ${stateManager} | ${dom} | ${match}`);
    });
  },

  // TEST 5: Check TEUI calculations
  checkTEUI: function() {
    console.log("\n=== TEST 5: Check TEUI Calculations ===");

    const h_10 = TEUI.StateManager.getValue("h_10");
    const k_10 = TEUI.StateManager.getValue("k_10");
    const h_15 = TEUI.StateManager.getValue("h_15");

    console.log(`h_10 (Target TEUI): ${h_10}`);
    console.log(`k_10 (Actual TEUI): ${k_10}`);
    console.log(`h_15 (Area): ${h_15}`);
  },

  // RUN ALL TESTS
  runAll: function() {
    console.log("═══════════════════════════════════════");
    console.log("  RESET DIAGNOSTIC - FULL TEST SUITE  ");
    console.log("═══════════════════════════════════════");

    this.checkImportedState();
    this.checkStateManager();
    this.checkDOM();
    this.compareAll();
    this.checkTEUI();

    console.log("\n═══════════════════════════════════════");
    console.log("  TEST COMPLETE");
    console.log("═══════════════════════════════════════\n");
  }
};

console.log("✅ Reset Test Script Loaded!");
console.log("\nAvailable commands:");
console.log("  resetTest.checkImportedState()  - Check localStorage");
console.log("  resetTest.checkStateManager()   - Check StateManager values");
console.log("  resetTest.checkDOM()            - Check DOM values");
console.log("  resetTest.compareAll()          - Compare all sources");
console.log("  resetTest.checkTEUI()           - Check TEUI calculations");
console.log("  resetTest.runAll()              - Run all tests");
console.log("\nUsage:");
console.log("  1. After import: resetTest.runAll()");
console.log("  2. After modify: resetTest.runAll()");
console.log("  3. After undo:   resetTest.runAll()");