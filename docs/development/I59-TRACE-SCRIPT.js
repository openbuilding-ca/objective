// I59-TRACE-SCRIPT.js
// Comprehensive tracing for i_59/ref_i_59 state flow
// Run this in browser console BEFORE changing i_59 slider

console.log("=== i_59 Trace Script Loading ===");

// 1. Intercept StateManager setValue to trace all i_59 writes
if (window.TEUI?.StateManager) {
  const original SetValue = window.TEUI.StateManager.setValue;
  window.TEUI.StateManager.setValue = function(fieldId, value, source) {
    if (fieldId === "i_59" || fieldId === "ref_i_59") {
      console.log(`%c[StateManager WRITE] ${fieldId} = "${value}" (source: ${source})`,
        'background: #ffeb3b; color: #000; font-weight: bold; padding: 2px 5px;');
      console.trace("Call stack:");
    }
    return originalSetValue.call(this, fieldId, value, source);
  };
  console.log("✅ StateManager.setValue intercepted for i_59/ref_i_59");
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

  const target_i59 = window.TEUI.StateManager?.getValue("i_59");
  const ref_i59 = window.TEUI.StateManager?.getValue("ref_i_59");
  const s08_mode = window.TEUI.sect08?.ModeManager?.currentMode;
  const s08_target_i59 = window.TEUI.sect08?.TargetState?.getValue?.("i_59");
  const s08_ref_i59 = window.TEUI.sect08?.ReferenceState?.getValue?.("i_59");

  console.log("StateManager:");
  console.log(`  i_59: ${target_i59}`);
  console.log(`  ref_i_59: ${ref_i59}`);

  console.log("\nS08 ModeManager:");
  console.log(`  currentMode: ${s08_mode}`);

  console.log("\nS08 Local State:");
  console.log(`  TargetState.i_59: ${s08_target_i59}`);
  console.log(`  ReferenceState.i_59: ${s08_ref_i59}`);

  console.log("======================\n");
};

console.log("\n✅ i_59 Trace Script Ready!");
console.log("📝 Instructions:");
console.log("  1. Run TEUI.checkI59State() to see current state");
console.log("  2. Change i_59 slider (watch for WRITE and READ logs)");
console.log("  3. Run TEUI.checkI59State() again to see changes");
console.log("  4. Try in both Target and Reference modes");
