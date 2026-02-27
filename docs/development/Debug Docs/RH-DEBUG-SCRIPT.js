// documentation/RH-DEBUG-SCRIPT.js
// This script provides diagnostic functions to debug the Indoor RH% (i_59) bug.
// To use, open the browser's developer console and call the functions directly.

window.TEUI.diag = window.TEUI.diag || {};

/**
 * Checks the global StateManager for the current values of i_59.
 * This helps determine if Section 08 is correctly PUBLISHING its state.
 */
window.TEUI.diag.checkRHState = function () {
  console.clear();
  console.log("--- RH% StateManager Diagnostic ---");

  if (!window.TEUI || !window.TEUI.StateManager) {
    console.error("StateManager not found!");
    return;
  }

  const targetValue = window.TEUI.StateManager.getValue("i_59");
  const referenceValue = window.TEUI.StateManager.getValue("ref_i_59");

  console.log(`Target (i_59):`, targetValue);
  console.log(`Reference (ref_i_59):`, referenceValue);

  if (referenceValue === null || referenceValue === undefined) {
    console.warn(
      "⚠️ WARNING: 'ref_i_59' is not present in the StateManager. This indicates a PUBLICATION failure in 4012-Section08.js.",
    );
  } else {
    console.log("✅ SUCCESS: 'ref_i_59' is present in the StateManager.");
  }
  console.log("---------------------------------");
};

/**
 * Checks the internal state of the Cooling.js module.
 * This helps determine if Cooling.js is correctly LISTENING for state changes.
 */
window.TEUI.diag.checkCoolingState = function () {
  console.log("--- Cooling.js Internal State ---");

  if (!window.TEUI || !window.TEUI.CoolingCalculations) {
    console.error("CoolingCalculations module not found!");
    return;
  }

  const coolingState = window.TEUI.CoolingCalculations.getDebugInfo();

  console.log(`Current Mode:`, coolingState.currentMode);
  console.log(`Internal Indoor RH:`, coolingState.indoorRH);
  console.log(`Latent Load Factor:`, coolingState.latentLoadFactor);

  console.log("---------------------------------");
  console.log(
    "To test, change the i_59 slider in Reference mode and run this check again. If 'Internal Indoor RH' does not update, it indicates a LISTENING failure in 4012-Cooling.js.",
  );
};

console.log(
  "✅ RH-DEBUG-SCRIPT.js loaded. Use `TEUI.diag.checkRHState()` and `TEUI.diag.checkCoolingState()` to debug.",
);
