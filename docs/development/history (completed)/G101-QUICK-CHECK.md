// Quick check - what's actually stored where?
console.log("\n=== QUICK g_101 CHECK ===");
console.log("ref_g_101 in StateManager:", window.TEUI.StateManager.getValue("ref_g_101"));
console.log("g_101 in StateManager:", window.TEUI.StateManager.getValue("g_101"));
console.log("S12 lastReferenceResults.g_101:", window.TEUI.SectionModules.sect12.lastReferenceResults?.g_101);
console.log("\nNow force recalculate...");
window.TEUI.SectionModules.sect12.calculateAll();
console.log("\nAfter recalc:");
console.log("ref_g_101 in StateManager:", window.TEUI.StateManager.getValue("ref_g_101"));
console.log("g_101 in StateManager:", window.TEUI.StateManager.getValue("g_101"));
console.log("S12 lastReferenceResults.g_101:", window.TEUI.SectionModules.sect12.lastReferenceResults?.g_101);
console.log("=== END CHECK ===\n");
