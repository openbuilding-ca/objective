// Paste this in console:
const originalSetValue = window.TEUI.sect13.TargetState.setValue;
window.TEUI.sect13.TargetState.setValue = function(fieldId, value, source) {
  if (fieldId === "j_115") {
    console.log(`[TargetState.setValue] j_115 = "${value}" (source: ${source})`);
    console.trace();
  }
  return originalSetValue.call(this, fieldId, value, source);
};

console.log("=== DEBUG INSTALLED ===");
console.log("Now: 1) Edit j_115 to 0.92, 2) Switch to Reference, 3) Switch back to Target");
console.log("Watch for any setValue calls with j_115='0.90'");
VM552:11 === DEBUG INSTALLED ===
VM552:12 Now: 1) Edit j_115 to 0.92, 2) Switch to Reference, 3) Switch back to Target
VM552:13 Watch for any setValue calls with j_115='0.90'
undefined
VM552:5 [TargetState.setValue] j_115 = "0.90" (source: system-update)
VM552:6 console.trace
window.TEUI.sect13.TargetState.setValue @ VM552:6
setValue @ Section13.js:396
handleHeatingSystemChangeForGhosting @ Section13.js:3669
updateConditionalUI @ Section13.js:488
switchMode @ Section13.js:280
(anonymous) @ Section13.js:567
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement