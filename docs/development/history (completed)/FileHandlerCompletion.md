# File Handler Strategy & Implementation Status (Excel/CSV Import & CSV Export)

This document outlines the strategy and **final implementation status** for data import/export functionalities within the TEUI Calculator v4.011. It details the successful resolution of UI update issues observed during data import, leveraging these solutions for future Reference Model integration.

**Goal:**

1.  Allow users to import data from legacy Excel files (`.xlsx`/`.xls`) focusing on user inputs from the `REPORT!` sheet. (**Achieved via FileHandler/ExcelMapper**)
2.  Enable users to save/load scenarios locally via CSV export/import of user-editable fields. (**Achieved via FileHandler**)
3.  Ensure that UI elements (inputs, dropdowns, sliders) reliably reflect imported data and trigger dependent logic correctly. (**RESOLVED - Core challenge addressed**)
4.  Apply these robust UI update mechanisms to the Reference Model system for dynamic display of standard values. (**Solution identified, implementation pending**)

## 0. Core Challenge: UI Reactivity to State Changes - RESOLVED

A recurring challenge during development was ensuring the web application's UI elements (input fields, dropdowns, sliders) consistently and accurately reflected changes in the underlying data managed by `TEUI.StateManager`, especially after data import or when switching to the (future) Reference Model.

- **Original Symptom (Import):** Imported values updated `StateManager` correctly, and calculations used the new data, but the UI often showed stale values (inputs, dropdowns, sliders didn't visually update).
- **Original Symptom (Reference Model):** A similar UI desynchronization was anticipated/observed in early tests, where UI elements wouldn't update to show reference standard values.
- **Original Symptom (User Edits):** Some fields (`l_118`, `j_115`) had issues with default display or calculations not triggering after user edits.

**Root Cause & Solution:** The root cause was identified as an inconsistent mechanism for propagating `StateManager` changes to the visual layer and handling UI events. The solution involved several key improvements: 1. **Robust `FieldManager.updateFieldDisplay`:** This function was iteratively refined to correctly handle different field types (`contenteditable`, `dropdown`, `slider`, `number` input), setting their values/text content appropriately and, crucially, **dispatching the correct synthetic events** (`blur`, `change`, `input`) to mimic user interaction. This ensures section-specific event handlers are triggered reliably after programmatic state changes. 2. **Standardized Section Event Handling:** Reviewing and standardizing event handlers within sections (like `handleEditableBlur` in S10, S11, S13) ensures they correctly parse input, update `StateManager`, format the display value, and trigger necessary recalculations (often via `calculateAll()`). 3. **Standardized Global Helpers:** Refactoring sections (like S05, S08) to use global `window.TEUI.parseNumeric` and `window.TEUI.formatNumber` eliminated local errors (like the `TypeError` in S08) and ensures consistent data handling. 4. **Correct Field Definitions:** Ensuring `sectionRows` definitions included necessary classes (like `user-input` for `i_41`) resolved styling/editability issues.

## 1. UI Integration (`index.html`) - _To Be Implemented_

- [ ] Modify the existing "Download Report" button into a Bootstrap dropdown button group.
- [ ] Add menu item: "Import Data (Excel/CSV)" linked to trigger the hidden file input (`id="excel-file-input"`). Assign `id="import-data-btn"` to this menu item.
- [ ] Add menu item: "Export Data (CSV)" linked to trigger the `TEUI.FileHandler.exportToCSV()` function. Assign `id="export-data-btn"` to this menu item.
- [ ] Keep/Update "Download Report (PDF)" menu item.
- [ ] Hide or remove the old standalone `import-excel` and `export-excel` buttons if they exist.

## 2. File Handling Logic (`4011-FileHandler.js`) - _Functionally Complete_

### 2.1. Import Process - **Working & UI Sync Resolved**

- **`handleFileSelect(event)`:** _Implemented & Working._
- **`processImportedExcel(workbook)`:** _Implemented & Working._
- **`processImportedCSV(csvString)`:** _Implemented & Working._ (Correctly skips Section 03).
- **`updateStateFromImportData(importedData, csvSkippedCount)`:** _Implemented & Working._
  - Updates `StateManager` using `setValue(..., 'imported')`.
  - Calls the now-robust `TEUI.FieldManager.updateFieldDisplay(fieldId, parsedValue)` which handles UI sync and event dispatching.
  - Triggers `TEUI.Calculator.calculateAll()`.

### 2.2. Export Process - **Working**

- **`exportToCSV()`:** _Implemented & Working._ Exports user-interactable fields (excluding S03) with layout metadata.

### 2.3. Event Listeners & Helpers - **Working**

- **`setupEventListeners()`:** _Implemented & Working._
- **`showStatus()`:** _Implemented._

## 3. Mapping Logic (`4011-ExcelMapper.js`) - _Partially Implemented_

- **`excelReportInputMapping`:** _Defined (Needs Final Review)_ Needs verification against Excel v3.038 `REPORT!` sheet for completeness.
- **`mapExcelToReportModel(workbook)`:** _Implemented & Working._

## 4. Field & Layout Definitions (`sections/4011-SectionXX.js`) - _Requires Ongoing Review/Standardization_

- **Need for Consistency:** Ongoing review required to ensure consistent use of `type`, `defaultValue`, `classes` and structure across all sections. Standardization of helper functions (using global `parseNumeric`/`formatNumber`) is in progress (S05, S08 done).

## 5. Key Decisions & Considerations

- **Import Priority:** `StateManager` priorities maintained.
- **Section 03 Import:** Correctly skipped in CSV import.
- **Universal UI Updates:** **Achieved.** The core mechanism (`FieldManager.updateFieldDisplay` + correct event dispatch + standardized section handlers) now synchronizes UI with `StateManager` after programmatic changes like imports.

## 6. Learnings from Debugging & `SANKEY3035.html`

The iterative debugging process, particularly using the "55555.csv" test case, was crucial. Key successful patterns confirmed or established:

- **Direct Value/Attribute Setting + Event Dispatch:** The core principle implemented in `FieldManager.updateFieldDisplay` is to directly set the appropriate property (`.value`, `.textContent`, find/set `option.selected`) and then **dispatch the relevant event** (`blur`, `change`, `input`). This reliably triggers section-specific logic as if the user had interacted directly.
- **Robust Global Helpers:** Using `window.TEUI.parseNumeric` and `window.TEUI.formatNumber` prevented subtle errors caused by inconsistent local implementations or unexpected input values (e.g., the S08 `TypeError`).
- **Centralized State Management (`StateManager`):** Keeping `StateManager` as the source of truth and ensuring all changes flow through it (with appropriate `state` flags like `'imported'` or `'user-modified'`) was validated.
- **Explicit Class Definitions:** Ensuring necessary classes like `user-input` are present in the `sectionRows` definitions is vital for correct styling and implied behavior.

## 7. Debugging Journey & Resolution Summary (Consolidated)

Testing import functionality, particularly with the "55555.csv" file, revealed several UI desynchronization bugs where `StateManager` held the correct imported data, but the UI did not visually update.

**Resolved Issues:**

1.  **`StateManager` Correctly Updated:** Confirmed early on; calculations used imported data correctly.
2.  **`contenteditable` Fields (e.g., `d_74` S10 Area, `g_89` S11 U-Value):** **FIXED.** Resolved by ensuring `FieldManager.updateFieldDisplay` sets `textContent` and dispatches `blur`, and section handlers (like S10, S11) correctly process this event without inadvertently reverting the display.
3.  **Dropdown Fields (e.g., `d_113` S13 Heating System, `e_74` S10 Orientation):** **FIXED.** Resolved by ensuring `FieldManager.updateFieldDisplay` sets `select.value`, sets the correct `option.selected = true`, and dispatches `change`. The visual update now works reliably.
4.  **Slider Fields (e.g., `f_74` S10 SHGC, `d_118` S13 SRE):** **FIXED.** Resolved by correcting `FieldManager.updateFieldDisplay` to target the internal `<input type="range">` and display `<span>`, setting their values appropriately using the global `window.TEUI.formatNumber`, and dispatching `input`.
5.  **Specific Field Bugs (`l_118` ACH, `j_115` AFUE):** **FIXED.** Resolved by ensuring correct default value propagation in `onSectionRendered` and proper calculation triggers in event handlers within Section 13.
6.  **`TypeError` in `Section08.js`:** **FIXED.** Resolved by refactoring Section 08 to use the robust global `window.TEUI.parseNumeric` and `window.TEUI.formatNumber`, removing its problematic local `formatNumber`.
7.  **`i_41` (Embodied Carbon) Losing Editability:** **FIXED.** Resolved by adding the missing `user-input` class to its definition in `Section05.js`, ensuring correct styling is applied by `FieldManager`.

**Overall Conclusion:** The core UI update mechanism is now robust for handling data import across different field types. The strategy of updating state, then calling `FieldManager.updateFieldDisplay` (which sets value/attributes _and_ dispatches the appropriate event), is effective.

**Relevance to Reference Model:** The challenge of updating the UI dynamically when fetching Reference Model values (from `4011-ReferenceValues.js` based on `dd_d_13`) is **directly analogous** to updating the UI after a data import. The **same solution** should be applied:

1.  When Reference Mode is activated or the standard changes:
2.  Fetch the appropriate reference value for a given `fieldId`.
3.  Update the `StateManager` (potentially with a specific `'reference'` state, or by managing which fields are "locked" separately).
4.  Call `TEUI.FieldManager.updateFieldDisplay(fieldId, referenceValue, fieldDef)`.
5.  This will update the UI element visually _and_ trigger any necessary section logic via the dispatched events, mirroring the successful import process.

## 8. Next Steps & Future Work

- **Immediate Next Step:**
  1.  **Implement Reference Model UI Updates:** Apply the proven `FieldManager.updateFieldDisplay` mechanism to dynamically update UI elements when entering Reference Mode or changing the reference standard (`d_13`), using data fetched from `4011-ReferenceValues.js`. This includes handling UI locking/styling for reference values.
- **Near-Term Tasks:**
  1.  **Standardize Helpers:** Continue refactoring remaining sections (01-04, 06, 07, 09, 10, 12-15) to consistently use global `parseNumeric`/`formatNumber` and standardized event handling patterns (Phase E).
  2.  **Final `ExcelMapper` Review:** Verify `excelReportInputMapping` against Excel v3.038 (Phase 3).
  3.  **UI Integration:** Implement the Bootstrap dropdown for Import/Export/Report buttons in `index.html` (Phase 1).
  4.  **Code Cleanup:** Remove all remaining temporary debug `console.log` statements.
- **Future Enhancements:**
  - Refactor legacy climate import code (consider JSON).
  - Full Excel v3.038 parity checks.
  - Enhance CSV parser for complex cases.
  - Integrate C.Scale API for `i_41`.
- **NOTE:** Using a local web server for development is still recommended.
