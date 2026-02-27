/**
 * S12 k_104 Bug - Automated Diagnostic Tool
 *
 * USAGE:
 * 1. Hard refresh page (Cmd+Shift+R)
 * 2. Click "Initialize"
 * 3. Open browser console
 * 4. Copy-paste this ENTIRE file into console
 * 5. Run: await runFullDiagnostic()
 * 6. Copy the output and paste into Logs.md
 */

async function runFullDiagnostic() {
  const results = [];

  function log(msg) {
    console.log(msg);
    results.push(msg);
  }

  function captureState(phaseName) {
    log(`\n${"=".repeat(70)}`);
    log(`${phaseName}`);
    log("=".repeat(70));

    // S11 State
    log("\n--- S11 State ---");
    try {
      log(
        `  CurrentMode: ${window.TEUI.SectionModules?.sect11?.ModeManager?.currentMode || "undefined"}`,
      );
      log(
        `  DOM k_98: ${document.querySelector('[data-field-id="k_98"]')?.textContent || "not visible"}`,
      );
      log(
        `  TargetState k_98: ${window.TEUI.SectionModules?.sect11?.TargetState?.getValue("k_98") ?? "undefined"}`,
      );
      log(
        `  ReferenceState k_98: ${window.TEUI.SectionModules?.sect11?.ReferenceState?.getValue("k_98") ?? "undefined"}`,
      );
    } catch (e) {
      log(`  ERROR: ${e.message}`);
    }

    // S12 State
    log("\n--- S12 State ---");
    try {
      log(
        `  CurrentMode: ${window.TEUI.SectionModules?.sect12?.ModeManager?.currentMode || "undefined"}`,
      );
      log(
        `  DOM k_104: ${document.querySelector('[data-field-id="k_104"]')?.textContent || "not visible"}`,
      );
      log(
        `  TargetState k_104: ${window.TEUI.SectionModules?.sect12?.TargetState?.getValue("k_104") ?? "undefined"}`,
      );
      log(
        `  ReferenceState k_104: ${window.TEUI.SectionModules?.sect12?.ReferenceState?.getValue("k_104") ?? "undefined"}`,
      );
    } catch (e) {
      log(`  ERROR: ${e.message}`);
    }

    // StateManager (Global)
    log("\n--- StateManager (Cross-Section Communication) ---");
    try {
      log(
        `  ref_k_98: ${window.TEUI.StateManager.getValue("ref_k_98") ?? "undefined"}`,
      );
      log(
        `  ref_k_104: ${window.TEUI.StateManager.getValue("ref_k_104") ?? "undefined"}`,
      );
    } catch (e) {
      log(`  ERROR: ${e.message}`);
    }
  }

  // Helper to click section tab
  function navigateToSection(sectionNum) {
    const tab = document.querySelector(
      `a[href="#section${sectionNum.toString().padStart(2, "0")}"]`,
    );
    if (tab) {
      tab.click();
      return true;
    }
    return false;
  }

  // Helper to toggle section mode
  function toggleSectionMode(sectionNum) {
    const toggle = document.querySelector(
      `#section${sectionNum.toString().padStart(2, "0")} .mode-toggle`,
    );
    if (toggle) {
      toggle.click();
      return true;
    }
    return false;
  }

  // Helper to change Stories slider
  function changeStories(value) {
    const slider = document.querySelector('[data-field-id="d_103"]');
    if (slider && slider.hasAttribute("contenteditable")) {
      slider.textContent = value;
      slider.dispatchEvent(new Event("blur", { bubbles: true }));
      return true;
    }
    return false;
  }

  // Wait helper
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  try {
    // PHASE 1: Post-initialization
    captureState("PHASE 1: Post-Initialization (No navigation)");
    await wait(500);

    // PHASE 2: Navigate to S11 (Target mode)
    log("\n>>> ACTION: Navigating to Section 11...");
    navigateToSection(11);
    await wait(500);
    captureState("PHASE 2: S11 in Target Mode");

    // PHASE 3: Switch S11 to Reference mode
    log("\n>>> ACTION: Switching S11 to Reference mode...");
    toggleSectionMode(11);
    await wait(500);
    captureState("PHASE 3: S11 in Reference Mode");

    // PHASE 4: Navigate to S12 (Target mode)
    log("\n>>> ACTION: Navigating to Section 12...");
    navigateToSection(12);
    await wait(500);
    captureState("PHASE 4: S12 in Target Mode (S11 still in Reference)");

    // PHASE 5: Switch S12 to Reference mode (BUG SHOULD APPEAR HERE)
    log("\n>>> ACTION: Switching S12 to Reference mode...");
    toggleSectionMode(12);
    await wait(500);
    captureState("PHASE 5: S12 in Reference Mode ❌ BUG APPEARS HERE");

    // PHASE 6: "Prime" by changing Stories
    log("\n>>> ACTION: Priming bug fix - changing Stories to 1.5...");
    changeStories("1.5");
    await wait(500);
    log("\n>>> ACTION: Changing Stories back to 1...");
    changeStories("1");
    await wait(500);
    captureState("PHASE 6: After Priming (Bug should be fixed) ✅");

    // Final summary
    log("\n" + "=".repeat(70));
    log("DIAGNOSTIC COMPLETE");
    log("=".repeat(70));
    log("\nKEY QUESTIONS TO ANSWER:");
    log("1. What is StateManager.ref_k_98 in Phase 3 (S11 Reference mode)?");
    log(
      "2. What is StateManager.ref_k_98 in Phase 5 (when S12 shows wrong value)?",
    );
    log("3. What is S12.ReferenceState.k_104 in Phase 5?");
    log("4. Does StateManager.ref_k_98 ever contain -1895.40 (correct)?");
    log("5. Does it change between phases, or stay at -4267.63?");
    log("\nCopy the output above and paste into Logs.md");
  } catch (error) {
    log(`\n❌ ERROR during diagnostic: ${error.message}`);
    log(error.stack);
  }

  // Return results as string for easy copying
  return results.join("\n");
}

// Instructions
console.log("Automated diagnostic loaded!");
console.log("Run: await runFullDiagnostic()");
console.log("Then copy the output to Logs.md");
