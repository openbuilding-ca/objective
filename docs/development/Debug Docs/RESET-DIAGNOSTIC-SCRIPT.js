/**
 * RESET DIAGNOSTIC SCRIPT
 *
 * Purpose: Diagnose why "Undo Changes" doesn't restore correct TEUI values
 *
 * Issue: After import TEUI shows 511.4, after "Undo Changes" shows 154.8
 *
 * Run this in browser console at different stages:
 * 1. After import (before modifications)
 * 2. After modifications
 * 3. After "Undo Changes"
 */

// ============================================================================
// DIAGNOSTIC 1: Check what's in lastImportedState
// ============================================================================
function diagnostic1_checkLastImportedState() {
  console.log("=== DIAGNOSTIC 1: Check lastImportedState ===");

  // Access lastImportedState from localStorage
  const importedStateJson = localStorage.getItem("TEUI_Last_Imported_State");

  if (!importedStateJson) {
    console.error("❌ TEUI_Last_Imported_State not found in localStorage!");
    return;
  }

  const importedState = JSON.parse(importedStateJson);
  const fieldCount = Object.keys(importedState).length;

  console.log(`✅ Found ${fieldCount} fields in lastImportedState`);
  console.log("First 10 fields:", Object.keys(importedState).slice(0, 10));
  console.log("Last 10 fields:", Object.keys(importedState).slice(-10));

  // Check for key TEUI-related fields
  const keyFields = ["h_15", "d_27", "d_28", "d_29", "d_30", "d_31"]; // Area, Actual Energy
  console.log("\nKey TEUI fields in lastImportedState:");
  keyFields.forEach(field => {
    if (importedState[field]) {
      console.log(`  ${field}: ${importedState[field]}`);
    } else {
      console.warn(`  ⚠️ ${field}: NOT FOUND`);
    }
  });

  return importedState;
}

// ============================================================================
// DIAGNOSTIC 2: Check what's in current StateManager
// ============================================================================
function diagnostic2_checkStateManager() {
  console.log("\n=== DIAGNOSTIC 2: Check StateManager ===");

  if (!window.TEUI || !window.TEUI.StateManager) {
    console.error("❌ StateManager not available!");
    return;
  }

  const allKeys = window.TEUI.StateManager.getAllKeys();
  console.log(`✅ StateManager has ${allKeys.length} total fields`);

  // Count by state
  let importedCount = 0;
  let userModifiedCount = 0;
  let defaultCount = 0;
  let calculatedCount = 0;

  allKeys.forEach(key => {
    const debugInfo = window.TEUI.StateManager.getDebugInfo(key);
    if (debugInfo) {
      switch(debugInfo.state) {
        case 'imported': importedCount++; break;
        case 'user-modified': userModifiedCount++; break;
        case 'default': defaultCount++; break;
        case 'calculated': calculatedCount++; break;
      }
    }
  });

  console.log(`Field states:`);
  console.log(`  imported: ${importedCount}`);
  console.log(`  user-modified: ${userModifiedCount}`);
  console.log(`  default: ${defaultCount}`);
  console.log(`  calculated: ${calculatedCount}`);

  // Check key TEUI fields
  const keyFields = ["h_15", "d_27", "d_28", "d_29", "d_30", "d_31"];
  console.log("\nKey TEUI fields in StateManager:");
  keyFields.forEach(field => {
    const value = window.TEUI.StateManager.getValue(field);
    const debugInfo = window.TEUI.StateManager.getDebugInfo(field);
    console.log(`  ${field}: ${value} (state: ${debugInfo?.state || 'unknown'})`);
  });

  // Check the reset tier
  const tier = window.TEUI.StateManager.getResetTier();
  console.log(`\nReset Tier: ${tier} (0=defaults, 1=modified, 2=has import)`);
}

// ============================================================================
// DIAGNOSTIC 3: Check TEUI calculation fields
// ============================================================================
function diagnostic3_checkTEUIFields() {
  console.log("\n=== DIAGNOSTIC 3: Check TEUI Calculation Fields ===");

  if (!window.TEUI || !window.TEUI.StateManager) {
    console.error("❌ StateManager not available!");
    return;
  }

  // Check S01 TEUI-related fields
  const teuiFields = {
    // Inputs
    "h_15": "Conditioned Area (m²)",
    "d_27": "Actual Elec Use (kWh)",
    "d_28": "Actual Gas Use (m³)",
    "d_29": "Actual Propane Use (L)",
    "d_30": "Actual Oil Use (L)",
    "d_31": "Actual Wood Use (kg)",

    // Renewable
    "d_44": "PV kWh/yr",
    "d_45": "Wind kWh/yr",
    "d_46": "Remove EV Charging kWh/yr",

    // Calculated TEUI components (from S15)
    "h_121": "Heating ekWh/yr",
    "h_122": "Cooling ekWh/yr",
    "h_123": "DHW ekWh/yr",
    "h_124": "Vent ekWh/yr",
    "h_125": "Lighting ekWh/yr",
    "h_126": "Plug ekWh/yr",

    // Final TEUI (S01)
    "f_32": "TEUI Target (ekWh/m²/yr)",
    "j_32": "TEUI Actual (ekWh/m²/yr)",
  };

  console.log("TEUI Field Values:");
  Object.entries(teuiFields).forEach(([field, label]) => {
    const value = window.TEUI.StateManager.getValue(field);
    const debugInfo = window.TEUI.StateManager.getDebugInfo(field);
    const state = debugInfo?.state || 'unknown';
    console.log(`  ${field} (${label}): ${value} [${state}]`);
  });

  // Calculate expected TEUI manually
  const area = parseFloat(window.TEUI.StateManager.getValue("h_15")) || 1;
  const h_121 = parseFloat(window.TEUI.StateManager.getValue("h_121")) || 0;
  const h_122 = parseFloat(window.TEUI.StateManager.getValue("h_122")) || 0;
  const h_123 = parseFloat(window.TEUI.StateManager.getValue("h_123")) || 0;
  const h_124 = parseFloat(window.TEUI.StateManager.getValue("h_124")) || 0;
  const h_125 = parseFloat(window.TEUI.StateManager.getValue("h_125")) || 0;
  const h_126 = parseFloat(window.TEUI.StateManager.getValue("h_126")) || 0;

  const totalEkWh = h_121 + h_122 + h_123 + h_124 + h_125 + h_126;
  const calculatedTEUI = totalEkWh / area;

  console.log(`\nManual TEUI Calculation:`);
  console.log(`  Total ekWh: ${totalEkWh.toFixed(2)}`);
  console.log(`  Area: ${area.toFixed(2)} m²`);
  console.log(`  Expected TEUI: ${calculatedTEUI.toFixed(2)} ekWh/m²/yr`);
  console.log(`  Actual f_32: ${window.TEUI.StateManager.getValue("f_32")}`);

  if (Math.abs(calculatedTEUI - parseFloat(window.TEUI.StateManager.getValue("f_32"))) > 0.1) {
    console.warn(`⚠️ MISMATCH! Expected ${calculatedTEUI.toFixed(2)} but got ${window.TEUI.StateManager.getValue("f_32")}`);
  }
}

// ============================================================================
// DIAGNOSTIC 4: Compare lastImportedState vs current StateManager
// ============================================================================
function diagnostic4_compareStates() {
  console.log("\n=== DIAGNOSTIC 4: Compare lastImportedState vs StateManager ===");

  const importedStateJson = localStorage.getItem("TEUI_Last_Imported_State");
  if (!importedStateJson) {
    console.error("❌ No lastImportedState found!");
    return;
  }

  const importedState = JSON.parse(importedStateJson);
  const importedKeys = Object.keys(importedState);

  console.log(`Checking ${importedKeys.length} imported fields against current StateManager...`);

  let matchCount = 0;
  let mismatchCount = 0;
  let missingCount = 0;
  const mismatches = [];

  importedKeys.forEach(key => {
    const importedValue = importedState[key];
    const currentValue = window.TEUI.StateManager.getValue(key);

    if (currentValue === null || currentValue === undefined) {
      missingCount++;
    } else if (String(importedValue) === String(currentValue)) {
      matchCount++;
    } else {
      mismatchCount++;
      mismatches.push({
        field: key,
        imported: importedValue,
        current: currentValue
      });
    }
  });

  console.log(`Results:`);
  console.log(`  ✅ Match: ${matchCount}`);
  console.log(`  ⚠️ Mismatch: ${mismatchCount}`);
  console.log(`  ❌ Missing: ${missingCount}`);

  if (mismatchCount > 0) {
    console.log(`\nFirst 10 mismatches:`);
    mismatches.slice(0, 10).forEach(m => {
      console.log(`  ${m.field}: imported=${m.imported}, current=${m.current}`);
    });
  }

  return { matchCount, mismatchCount, missingCount, mismatches };
}

// ============================================================================
// DIAGNOSTIC 5: Trace revertToLastImportedState execution
// ============================================================================
function diagnostic5_traceRevert() {
  console.log("\n=== DIAGNOSTIC 5: Trace Revert Execution ===");

  console.log("This diagnostic will add instrumentation to revertToLastImportedState");
  console.log("It will log each field being reverted and any errors.");
  console.log("\n⚠️ This requires modifying StateManager temporarily!");
  console.log("Run this, then trigger 'Undo Changes', then check console for detailed logs.");

  // Save original function
  if (!window._originalRevert) {
    window._originalRevert = window.TEUI.StateManager.revertToLastImportedState;
  }

  // Wrap with instrumentation
  window.TEUI.StateManager.revertToLastImportedState = function() {
    console.log("🔍 [TRACE] revertToLastImportedState() called");

    const importedStateJson = localStorage.getItem("TEUI_Last_Imported_State");
    if (!importedStateJson) {
      console.error("❌ [TRACE] No lastImportedState found in localStorage!");
      return;
    }

    const lastImportedState = JSON.parse(importedStateJson);
    console.log(`🔍 [TRACE] Found ${Object.keys(lastImportedState).length} fields to revert`);

    let successCount = 0;
    let errorCount = 0;

    Object.entries(lastImportedState).forEach(([fieldId, importedValue], index) => {
      try {
        const oldValue = window.TEUI.StateManager.getValue(fieldId);
        const changed = window.TEUI.StateManager.setValue(fieldId, importedValue, "system_reverted_to_import");

        if (changed) {
          successCount++;
          if (index < 5 || index % 20 === 0) { // Log first 5 and every 20th
            console.log(`  ✅ [${index}] ${fieldId}: ${oldValue} → ${importedValue}`);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`  ❌ [${index}] ${fieldId}: ERROR - ${error.message}`);
      }
    });

    console.log(`🔍 [TRACE] Revert complete: ${successCount} success, ${errorCount} errors`);
    console.log(`🔍 [TRACE] Calling calculateAll()...`);

    if (window.TEUI?.Calculator?.calculateAll) {
      window.TEUI.Calculator.calculateAll();
      console.log(`🔍 [TRACE] calculateAll() completed`);
    }

    // Call Pattern A refresh
    console.log(`🔍 [TRACE] Refreshing Pattern A sections...`);
    const patternASections = ["sect02", "sect03", "sect04", "sect05", "sect06", "sect07", "sect08", "sect09", "sect10", "sect11", "sect12", "sect13", "sect15"];
    patternASections.forEach((sectionId) => {
      const section = window.TEUI?.SectionModules?.[sectionId];
      if (section?.ModeManager?.refreshUI) {
        section.ModeManager.refreshUI();
        if (section.ModeManager.updateCalculatedDisplayValues) {
          section.ModeManager.updateCalculatedDisplayValues();
        }
        console.log(`  ✅ ${sectionId} refreshed`);
      } else {
        console.warn(`  ⚠️ ${sectionId} ModeManager not available`);
      }
    });

    console.log(`🔍 [TRACE] Revert process complete!`);
  };

  console.log("✅ Instrumentation added! Now trigger 'Undo Changes' and watch the console.");
}

// ============================================================================
// RUN ALL DIAGNOSTICS
// ============================================================================
function runAllDiagnostics() {
  console.clear();
  console.log("==================================================");
  console.log("RESET DIAGNOSTICS - FULL SUITE");
  console.log("==================================================\n");

  diagnostic1_checkLastImportedState();
  diagnostic2_checkStateManager();
  diagnostic3_checkTEUIFields();
  const comparison = diagnostic4_compareStates();

  console.log("\n==================================================");
  console.log("SUMMARY");
  console.log("==================================================");
  console.log("Run diagnostic5_traceRevert() to instrument the revert function");
  console.log("Then trigger 'Undo Changes' and check console for detailed execution trace");

  return comparison;
}

// Export for use in console
window.resetDiagnostics = {
  diagnostic1_checkLastImportedState,
  diagnostic2_checkStateManager,
  diagnostic3_checkTEUIFields,
  diagnostic4_compareStates,
  diagnostic5_traceRevert,
  runAllDiagnostics
};

console.log("✅ Reset diagnostics loaded!");
console.log("Run: resetDiagnostics.runAllDiagnostics()");
console.log("Or run individual diagnostics:");
console.log("  - resetDiagnostics.diagnostic1_checkLastImportedState()");
console.log("  - resetDiagnostics.diagnostic2_checkStateManager()");
console.log("  - resetDiagnostics.diagnostic3_checkTEUIFields()");
console.log("  - resetDiagnostics.diagnostic4_compareStates()");
console.log("  - resetDiagnostics.diagnostic5_traceRevert()");
