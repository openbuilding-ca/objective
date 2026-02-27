/**
 * ACTUAL TEUI TRACE SCRIPT
 *
 * Purpose: Trace the REAL TEUI calculation flow to understand why
 * "Undo Changes" shows 154.8 instead of 511.4
 *
 * ACTUAL CALCULATION CHAIN (from code inspection):
 * 1. Section 04 reads actual energy inputs: d_27 (electricity), d_28 (gas), etc.
 * 2. Section 04 calculates f_32 (actual total energy ekWh/yr)
 * 3. Section 01 divides: f_32 / h_15 (area) = TEUI
 *
 * Run this in browser console at different stages:
 * - After import (TEUI = 511.4)
 * - After modifications
 * - After "Undo Changes" (TEUI = 154.8)
 */

// ============================================================================
// TRACE 1: Check Energy Input Fields (Section 04)
// ============================================================================
function trace1_energyInputs() {
  console.log("=== TRACE 1: Energy Input Fields (S04) ===");

  if (!window.TEUI || !window.TEUI.StateManager) {
    console.error("❌ StateManager not available!");
    return;
  }

  const energyFields = {
    // Actual Energy Inputs (Column D - user utility bills)
    "d_27": "Actual Elec Use (kWh/yr)",
    "d_28": "Actual Gas Use (m³/yr)",
    "d_29": "Actual Propane Use (L/yr)",
    "d_30": "Actual Oil Use (L/yr)",
    "d_31": "Actual Wood Use (kg/yr)",

    // Renewable/Reductions
    "d_44": "PV kWh/yr",
    "d_45": "Wind kWh/yr",
    "d_46": "Remove EV Charging kWh/yr",

    // Area (for TEUI calculation)
    "h_15": "Conditioned Area (m²)",

    // Calculated Totals (Section 04)
    "f_32": "Actual Total Energy (ekWh/yr)",
    "j_32": "Target Total Energy (ekWh/yr)",
  };

  console.log("Energy Field Values:");
  Object.entries(energyFields).forEach(([field, label]) => {
    const value = window.TEUI.StateManager.getValue(field);
    const debugInfo = window.TEUI.StateManager.getDebugInfo(field);
    const state = debugInfo?.state || 'unknown';
    console.log(`  ${field} (${label}): ${value} [${state}]`);
  });
}

// ============================================================================
// TRACE 2: Check TEUI Calculation (Section 01)
// ============================================================================
function trace2_teuiCalculation() {
  console.log("\n=== TRACE 2: TEUI Calculation (S01) ===");

  if (!window.TEUI || !window.TEUI.StateManager) {
    console.error("❌ StateManager not available!");
    return;
  }

  const f_32 = parseFloat(window.TEUI.StateManager.getValue("f_32")) || 0;
  const j_32 = parseFloat(window.TEUI.StateManager.getValue("j_32")) || 0;
  const h_15 = parseFloat(window.TEUI.StateManager.getValue("h_15")) || 1;

  const calculatedActualTEUI = f_32 / h_15;
  const calculatedTargetTEUI = j_32 / h_15;

  const actualTEUI_fromState = window.TEUI.StateManager.getValue("k_10"); // Actual TEUI in S01
  const targetTEUI_fromState = window.TEUI.StateManager.getValue("h_10"); // Target TEUI in S01

  console.log("Manual TEUI Calculation:");
  console.log(`  f_32 (Actual Energy): ${f_32} ekWh/yr`);
  console.log(`  j_32 (Target Energy): ${j_32} ekWh/yr`);
  console.log(`  h_15 (Area): ${h_15} m²`);
  console.log(`  Calculated Actual TEUI: ${calculatedActualTEUI.toFixed(2)} ekWh/m²/yr`);
  console.log(`  Calculated Target TEUI: ${calculatedTargetTEUI.toFixed(2)} ekWh/m²/yr`);
  console.log(`  StateManager k_10 (Actual TEUI): ${actualTEUI_fromState}`);
  console.log(`  StateManager h_10 (Target TEUI): ${targetTEUI_fromState}`);

  if (Math.abs(calculatedActualTEUI - parseFloat(actualTEUI_fromState)) > 0.1) {
    console.warn(`⚠️ MISMATCH! Expected ${calculatedActualTEUI.toFixed(2)} but got ${actualTEUI_fromState}`);
  }
}

// ============================================================================
// TRACE 3: Check lastImportedState for Energy Fields
// ============================================================================
function trace3_importedState() {
  console.log("\n=== TRACE 3: lastImportedState for Energy Fields ===");

  const importedStateJson = localStorage.getItem("TEUI_Last_Imported_State");
  if (!importedStateJson) {
    console.error("❌ TEUI_Last_Imported_State not found in localStorage!");
    return;
  }

  const importedState = JSON.parse(importedStateJson);

  const energyFields = ["d_27", "d_28", "d_29", "d_30", "d_31", "d_44", "d_45", "d_46", "h_15"];

  console.log("Energy fields in lastImportedState:");
  energyFields.forEach(field => {
    if (importedState[field] !== undefined) {
      console.log(`  ${field}: ${importedState[field]}`);
    } else {
      console.warn(`  ⚠️ ${field}: NOT FOUND`);
    }
  });
}

// ============================================================================
// TRACE 4: Compare Imported vs Current State
// ============================================================================
function trace4_compareStates() {
  console.log("\n=== TRACE 4: Compare Imported vs Current State ===");

  const importedStateJson = localStorage.getItem("TEUI_Last_Imported_State");
  if (!importedStateJson) {
    console.error("❌ No lastImportedState found!");
    return;
  }

  const importedState = JSON.parse(importedStateJson);
  const energyFields = ["d_27", "d_28", "d_29", "d_30", "d_31", "d_44", "d_45", "d_46", "h_15", "f_32", "j_32"];

  console.log("Comparing energy fields:");
  energyFields.forEach(field => {
    const importedValue = importedState[field];
    const currentValue = window.TEUI.StateManager.getValue(field);
    const match = String(importedValue) === String(currentValue);

    if (match) {
      console.log(`  ✅ ${field}: ${currentValue} (matches imported)`);
    } else {
      console.warn(`  ⚠️ ${field}: imported=${importedValue}, current=${currentValue}`);
    }
  });
}

// ============================================================================
// RUN ALL TRACES
// ============================================================================
function runAllTraces() {
  console.clear();
  console.log("==================================================");
  console.log("ACTUAL TEUI TRACE - COMPLETE DIAGNOSTIC");
  console.log("==================================================\n");

  trace1_energyInputs();
  trace2_teuiCalculation();
  trace3_importedState();
  trace4_compareStates();

  console.log("\n==================================================");
  console.log("TRACE COMPLETE");
  console.log("==================================================");
}

// Export for use in console
window.teuiTrace = {
  trace1_energyInputs,
  trace2_teuiCalculation,
  trace3_importedState,
  trace4_compareStates,
  runAllTraces
};

console.log("✅ TEUI Trace loaded!");
console.log("Run: teuiTrace.runAllTraces()");
console.log("Or run individual traces:");
console.log("  - teuiTrace.trace1_energyInputs()");
console.log("  - teuiTrace.trace2_teuiCalculation()");
console.log("  - teuiTrace.trace3_importedState()");
console.log("  - teuiTrace.trace4_compareStates()");
