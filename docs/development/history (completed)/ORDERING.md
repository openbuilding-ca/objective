# Calculation Ordering and Stability Guidelines

This document outlines critical considerations for calculation sequencing and stability within the TEUI Calculator application, particularly to address issues related to race conditions and ensuring dependent calculations use settled values.

## Core Principle: Ensure Precedent Stability

Downstream calculations, especially in summary sections like Section 14 (TEDI Summary) and Section 15 (TEUI Summary), must only execute _after_ all their precedent values from other sections (01-13) have been fully calculated and have settled in the `StateManager`.

This is crucial during:

1.  **Initial Page Load:** When `TEUI.Calculator.calculateAll()` is first invoked.
2.  **File Import:** After `TEUI.FileHandler.updateStateFromImportData()` completes and triggers `TEUI.Calculator.calculateAll()`.
3.  **User Interactions:** When changes in one section trigger recalculations that cascade to others.

Failure to ensure precedent stability can lead to summary sections using stale or intermediate values, resulting in incorrect final outputs until a subsequent, potentially unrelated event, triggers a correcting recalculation.

## CTO Advisory on `setTimeout` Usage

Our CTO has advised:

> "All the timeout function calls are problematic. There are a bunch of wait 500ms before performing some action...this will not 'Avoid' race conditions."

**Implications:**
Reliance on `setTimeout` or arbitrary delays to manage calculation order is fragile and an anti-pattern. It does not guarantee that prerequisite calculations will have completed, especially on slower devices or under heavy load. Such practices mask underlying ordering issues and should be eliminated.

## Recommended Approach: Robust Dependency Management and Sequential Execution

1.  **`TEUI.Calculator.calculateAll()` Ordering:**

    - The primary `TEUI.Calculator.calculateAll()` function must invoke the `calculateAll()` methods of individual section modules in a **strict, logically dependent order**.
    - Sections that produce foundational values (e.g., Section 03 Climate, Section 12 Geometries, Section 10 Gains, Section 11 Losses, Section 13 Mechanical Loads) must be calculated _before_ sections that consume these values (e.g., Section 14 TEDI, Section 15 TEUI).
    - A clear, documented order of execution for section modules within `TEUI.Calculator.calculateAll()` needs to be established and enforced.

2.  **`StateManager` Listeners and Event-Driven Updates:**

    - Leverage `StateManager.addListener()` for cross-section dependencies as outlined in `README.md`.
    - Ensure that a listener in a dependent section only proceeds with its calculation _after confirming_ that all its specific input values from `StateManager` are indeed the final, intended values from the source sections.
    - Avoid overly broad `calculateAll()` calls from every minor listener if a more targeted recalculation within the section (or a specific dependent section) is sufficient.

3.  **File Import Recalculation (`TEUI.FileHandler.js`):**

    - The single call to `this.calculator.calculateAll()` at the end of `updateStateFromImportData` is correct in principle.
    - The internal logic of `TEUI.Calculator.calculateAll()` must be robust enough to handle the state changes from the import and calculate all sections in the correct dependency order without race conditions.

4.  **Eliminate `setTimeout` for Calculation Sequencing:**
    - Actively identify and remove any `setTimeout` calls used as a mechanism to "wait" for other calculations to finish.
    - Replace these with proper dependency declarations, event-driven triggers via `StateManager`, or a strictly ordered calculation flow within a central orchestrator like `TEUI.Calculator.calculateAll()`.

By adhering to these principles, we can build a more predictable and reliable calculation engine, ensuring that values are accurate and reflect the true state of dependencies at all times.

## Critical: Excel Import Data Mapping and DOM Field ID Alignment (Discovered 2024-08-XX)

**Issue:** Console warnings during file import like "Skipping import for unknown fieldId: f_103" or "Skipping import for field d_103: Invalid value ... for type dropdown" indicate a misalignment between the Excel data mapping (`4011-ExcelMapper.js`) and the actual DOM field IDs or field types defined in section modules.

**Example:** An import attempting to map to `f_103` (expecting a simple input) when the correct field is `g_103` (a dropdown) will fail or lead to incorrect data handling.

**Impact:** This can cause:

- Incomplete data import.
- Default values being used instead of imported values.
- Downstream calculation errors due to missing or incorrect precedent data.
- Apparent discrepancies between Excel and application results that are due to mapping errors, not calculation logic errors.

**Action Required (High Priority):**

1.  **Thoroughly review `4011-ExcelMapper.js`** against the field definitions in all section modules (e.g., `sections/4011-SectionXX.js`) and the `3037DOM.csv` specification.
2.  **Correct all identified misalignments** in `4011-ExcelMapper.js` to ensure it targets the correct DOM `data-field-id` for each piece of Excel data AND respects the field's type (input, dropdown, etc.).
3.  Pay special attention to fields that have been moved or had their type changed during development (e.g., an input becoming a dropdown).
4.  Test imports rigorously with multiple TEUIv3036/3037/3038 Excel files after corrections to ensure all relevant data is imported correctly and warnings are eliminated or understood.

Addressing these mapping issues is crucial for data integrity and reliable calculation outcomes. It should be prioritized before or alongside further `setTimeout` refactoring, as unstable data inputs will make ordering fixes difficult to verify.

## Lessons from `setTimeout` Refactoring (August 2024)

**Context:** Attempts were made to replace `setTimeout` calls used for calculation sequencing/timing with more robust event-driven or procedural ordering, specifically in `4011-SectionIntegrator.js` (related to `setInitialDropdownValues`) and `4011-ReferenceManager.js` (related to `fetchInitialStandard`).

**Outcome:** While the intentions were aligned with the principles in this document, the changes led to unexpected regressions:

- Visual glitches in Section 01 gauges.
- Incorrect behavior of the emissions factor updates in Section 04 (dependent on province/year).
- Minor UI issues in the Dependency Graph (persistent grab hand).

These issues indicated that the `setTimeout` calls, while not ideal, were masking more complex timing interdependencies or race conditions that were not fully understood or addressed by the initial refactoring attempt. The system reverted to a state prior to these specific `setTimeout` changes to restore stability.

**Key Learnings & Cautious Approach for Future `setTimeout` Refactoring:**

1.  **Deep Dive Analysis:** Before removing or altering a `setTimeout` suspected of managing calculation order:

    - Thoroughly understand what specific state or event it is _truly_ waiting for (e.g., another module's initialization, data availability from an async operation, `StateManager` updates from multiple sources).
    - Identify all functions or modules that might be affected by its removal or change in timing.

2.  **Incremental Changes:** Modify **one `setTimeout` instance in one file at a time.**

    - Avoid bundling multiple `setTimeout` refactors or other unrelated changes into a single commit.

3.  **Rigorous & Targeted Testing:** After each single `setTimeout` modification:

    - Test all application functionalities, paying extremely close attention to the specific areas the `setTimeout` was thought to influence (e.g., if it was in `ReferenceManager`, test all Reference Mode functionality, related calculations, and UI updates).
    - Test general application stability, initial load, section rendering, and import/export.
    - Monitor the browser console for any new errors or warnings, even if they seem unrelated.

4.  **Isolate the Cause:** If regressions occur, the small, incremental nature of the change makes it easier to identify the problematic modification and revert it quickly and precisely.

5.  **Alternative Robust Mechanisms:** When replacing a `setTimeout`, prefer:

    - **Specific Custom Events:** If module A needs to wait for module B to be ready, have module B dispatch a custom event (e.g., `module-b-ready`) that module A listens for.
    - **Callbacks/Promises:** For asynchronous operations, use callbacks or promises to ensure sequential execution.
    - **Centralized Orchestration:** If a sequence of operations across modules is critical, ensure a central orchestrator (like `TEUI.Calculator.calculateAll` or parts of `4011-init.js`) calls them in the correct, guaranteed order.
    - **`StateManager` Listeners:** For reacting to specific data changes, `StateManager.addListener` is appropriate, but ensure the listened-to value has truly settled before triggering complex downstream effects.

6.  **Consider UI Delays Separately:** `setTimeout` calls used purely for UI effects (e.g., debouncing rapid user input, animating a brief message, delaying a non-critical UI update) are generally less risky but should still be clearly commented as such and not confused with calculation ordering mechanisms.

By following these more cautious steps, future attempts to improve calculation ordering by refactoring `setTimeout` calls can be made more safely and effectively, minimizing the risk of widespread regressions.
