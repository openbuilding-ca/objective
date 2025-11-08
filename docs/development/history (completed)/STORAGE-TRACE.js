/**
 * STORAGE TRACE SCRIPT
 *
 * Purpose: Trace whether fields are being stored to lastImportedState during import
 *
 * CRITICAL FINDING: After import + modifications + undo, NO fields restored!
 * Fields tested: d_31, h_12, h_15, h_19, d_39, d_51, d_52, d_64, d_97, d_113, d_118
 *
 * This script will intercept setValue calls to see if "imported" state is being passed
 */

// Wrap StateManager.setValue to trace calls
if (window.TEUI && window.TEUI.StateManager) {
  const originalSetValue = window.TEUI.StateManager.setValue;

  // Track which fields get stored with "imported" state
  const importedFieldsTracked = [];

  window.TEUI.StateManager.setValue = function(fieldId, value, state) {
    // Track fields that are set with "imported" state
    if (state === "imported") {
      importedFieldsTracked.push({
        fieldId,
        value,
        timestamp: new Date().toISOString()
      });
      console.log(`📝 [STORAGE TRACE] Storing ${fieldId} = ${value} with state="imported"`);
    }

    // Call original
    return originalSetValue.call(this, fieldId, value, state);
  };

  // Helper function to check what got stored
  window.checkStoredFields = function() {
    console.log("\n=== STORAGE TRACE REPORT ===");
    console.log(`Total fields stored with "imported" state: ${importedFieldsTracked.length}`);

    // Check specific fields from user's test
    const testFields = ["d_31", "h_12", "h_15", "h_19", "d_39", "d_51", "d_52", "d_64", "d_97", "d_113", "d_118"];

    console.log("\nChecking test fields:");
    testFields.forEach(fieldId => {
      const stored = importedFieldsTracked.find(f => f.fieldId === fieldId);
      if (stored) {
        console.log(`  ✅ ${fieldId}: STORED with value ${stored.value}`);
      } else {
        console.log(`  ❌ ${fieldId}: NOT STORED`);
      }
    });

    // Check localStorage
    const localStorageState = localStorage.getItem("TEUI_Last_Imported_State");
    if (localStorageState) {
      const parsed = JSON.parse(localStorageState);
      console.log(`\nLocalStorage has ${Object.keys(parsed).length} fields`);

      console.log("\nChecking test fields in localStorage:");
      testFields.forEach(fieldId => {
        if (parsed[fieldId] !== undefined) {
          console.log(`  ✅ ${fieldId}: ${parsed[fieldId]}`);
        } else {
          console.log(`  ❌ ${fieldId}: NOT IN LOCALSTORAGE`);
        }
      });
    } else {
      console.log("\n❌ No TEUI_Last_Imported_State in localStorage!");
    }

    return { importedFieldsTracked, testFields };
  };

  console.log("✅ Storage trace installed!");
  console.log("Now import a file, then run: checkStoredFields()");
} else {
  console.error("❌ StateManager not available!");
}
