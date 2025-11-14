// VENT-TRACE-SCRIPT.js
// Trace ventilation rate inputs to find contamination source
// Run this in browser console BEFORE changing i_59 slider

console.log("=== Ventilation Trace Script Loading ===");

// Intercept StateManager setValue for ventilation-related fields
if (window.TEUI?.StateManager) {
  const originalSetValue = window.TEUI.StateManager.setValue;
  window.TEUI.StateManager.setValue = function(fieldId, value, source) {
    // Track ALL ref_ ventilation inputs
    const trackedFields = [
      "ref_d_63",  // Reference occupants
      "ref_i_63",  // Reference occupied hours
      "ref_j_63",  // Reference total hours
      "ref_d_105", // Reference volume
      "ref_h_120", // Reference ventilation rate (OUTPUT - this is what's contaminating)
      "ref_d_120", // Reference ventilation rate L/s
      "i_59",      // Target RH (trigger)
      "ref_i_59"   // Reference RH (should NOT change)
    ];

    if (trackedFields.includes(fieldId)) {
      const oldValue = window.TEUI.StateManager.getValue(fieldId);
      if (oldValue !== value) {
        console.log(`%c[VENT TRACE] ${fieldId}: ${oldValue} → ${value} (source: ${source})`,
          'background: #ff9800; color: #000; font-weight: bold; padding: 2px 5px;');
        console.trace("Call stack:");
      }
    }

    return originalSetValue.call(this, fieldId, value, source);
  };
  console.log("✅ StateManager.setValue intercepted for ventilation fields");
} else {
  console.error("❌ StateManager not found!");
}

// Utility function to check ventilation inputs
window.TEUI.checkVentInputs = function() {
  console.log("\n=== Ventilation Input Check ===");

  const fields = {
    "ref_d_63": "Reference occupants",
    "ref_i_63": "Reference occupied hours",
    "ref_j_63": "Reference total hours",
    "ref_d_105": "Reference volume",
    "ref_h_120": "Reference vent rate (m³/hr)",
    "ref_d_120": "Reference vent rate (L/s)",
    "i_59": "Target RH%",
    "ref_i_59": "Reference RH%"
  };

  Object.entries(fields).forEach(([fieldId, description]) => {
    const value = window.TEUI.StateManager?.getValue(fieldId);
    console.log(`  ${fieldId} (${description}): ${value}`);
  });

  console.log("======================\n");
};

console.log("\n✅ Ventilation Trace Script Ready!");
console.log("📝 Instructions:");
console.log("  1. Run TEUI.checkVentInputs() to see baseline");
console.log("  2. Change i_59 slider in TARGET mode");
console.log("  3. Watch for ORANGE logs showing which ref_ values change");
console.log("  4. Run TEUI.checkVentInputs() again to confirm");
console.log("\n⚠️ KEY EXPECTATION:");
console.log("   When i_59 changes, NO ref_ values should change!");
