// I59-TRACE-SCRIPT.js
// Comprehensive tracing for i_59/ref_i_59 state flow
// Run this in browser console BEFORE changing i_59 slider

console.log("=== i_59 Trace Script Loading ===");

// 1. Intercept StateManager setValue to trace all i_59 and e_10 writes
if (window.TEUI?.StateManager) {
  const originalSetValue = window.TEUI.StateManager.setValue;
  window.TEUI.StateManager.setValue = function(fieldId, value, source) {
    if (fieldId === "i_59" || fieldId === "ref_i_59") {
      console.log(`%c[StateManager WRITE] ${fieldId} = "${value}" (source: ${source})`,
        'background: #ffeb3b; color: #000; font-weight: bold; padding: 2px 5px;');
      console.trace("Call stack:");
    }
    // ⚠️ CONTAMINATION DETECTION: Track section totals (h_10 = Target, e_10 = Reference)
    if (fieldId === "h_10") {
      console.log(`%c[StateManager WRITE] h_10 = "${value}" (source: ${source}) ✅ TARGET TOTAL CHANGED`,
        'background: #2196f3; color: #fff; font-weight: bold; padding: 2px 5px;');
      console.trace("Call stack:");
    }
    if (fieldId === "e_10") {
      console.log(`%c[StateManager WRITE] e_10 = "${value}" (source: ${source}) ⚠️ REFERENCE TOTAL CHANGED`,
        'background: #f44336; color: #fff; font-weight: bold; padding: 2px 5px;');
      console.trace("Call stack:");
    }
    return originalSetValue.call(this, fieldId, value, source);
  };
  console.log("✅ StateManager.setValue intercepted for i_59/ref_i_59/e_10");
} else {
  console.error("❌ StateManager not found!");
}

// 2. Intercept StateManager getValue to trace all i_59 reads
if (window.TEUI?.StateManager) {
  const originalGetValue = window.TEUI.StateManager.getValue;
  window.TEUI.StateManager.getValue = function(fieldId) {
    const value = originalGetValue.call(this, fieldId);
    if (fieldId === "i_59" || fieldId === "ref_i_59") {
      console.log(`%c[StateManager READ] ${fieldId} = "${value}"`,
        'background: #4caf50; color: #fff; padding: 2px 5px;');
    }
    return value;
  };
  console.log("✅ StateManager.getValue intercepted for i_59/ref_i_59");
} else {
  console.error("❌ StateManager not found!");
}

// 3. Check S08 ModeManager current mode
if (window.TEUI?.sect08?.ModeManager) {
  const s08Mode = window.TEUI.sect08.ModeManager.currentMode;
  console.log(`✅ S08 ModeManager.currentMode = "${s08Mode}"`);
} else {
  console.error("❌ S08 ModeManager not found!");
}

// 4. Check Cooling.js state
if (window.TEUI?.CoolingCalculations) {
  console.log("✅ Cooling.js module found");
  // Note: getDebugInfo() may not exist yet
} else {
  console.error("❌ Cooling.js module not found!");
}

// 5. Utility function to check current state
window.TEUI.checkI59State = function() {
  console.log("\n=== i_59 State Check ===");

  // StateManager (Global State)
  const target_i59 = window.TEUI.StateManager?.getValue("i_59");
  const ref_i59 = window.TEUI.StateManager?.getValue("ref_i_59");

  // S08 Mode
  const s08_mode = window.TEUI.sect08?.ModeManager?.currentMode;

  // Cooling.js state (if exposed)
  const cooling_target = window.TEUI.CoolingCalculations?.TargetState?.getValue?.("i_59");
  const cooling_ref = window.TEUI.CoolingCalculations?.ReferenceState?.getValue?.("i_59");

  // Section totals (to detect contamination)
  const h_10 = window.TEUI.StateManager?.getValue("h_10"); // Target total
  const e_10 = window.TEUI.StateManager?.getValue("e_10"); // Reference total

  console.log("StateManager (Global):");
  console.log(`  i_59 (Target): ${target_i59}`);
  console.log(`  ref_i_59 (Reference): ${ref_i59}`);

  console.log("\nS08 Current Mode:");
  console.log(`  ${s08_mode}`);

  console.log("\nCooling.js Local State:");
  console.log(`  TargetState.i_59: ${cooling_target || 'not exposed'}`);
  console.log(`  ReferenceState.i_59: ${cooling_ref || 'not exposed'}`);

  console.log("\nSection Totals (Contamination Check):");
  console.log(`  h_10 (Target Total): ${h_10}`);
  console.log(`  e_10 (Reference Total): ${e_10}`);

  console.log("======================\n");
};

console.log("\n✅ i_59 Trace Script Ready!");
console.log("📝 Instructions:");
console.log("  1. Run TEUI.checkI59State() to see current state");
console.log("  2. Note the BASELINE values for h_10 (Target) and e_10 (Reference)");
console.log("  3. Change i_59 slider in TARGET mode (e.g., 45% → 70%)");
console.log("  4. Watch console for:");
console.log("     - Yellow: i_59 WRITE");
console.log("     - Green: i_59 READ");
console.log("     - Blue: h_10 WRITE (should change - this is correct)");
console.log("     - Red: e_10 WRITE (should NOT change - contamination if it does!)");
console.log("  5. Run TEUI.checkI59State() again");
console.log("  6. Compare e_10 values - if changed, trace back RED logs for contamination source");
console.log("\n⚠️ KEY EXPECTATION:");
console.log("   When i_59 changes in Target mode:");
console.log("   - h_10 (Target total) SHOULD change ✅");
console.log("   - e_10 (Reference total) should NOT change ❌");
console.log("   - ref_i_59 should stay at its original value ❌");
