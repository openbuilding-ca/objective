# Documentation: "Run Reference" Functionality (TEUI v.4.011 - RUN-REFERENCE Branch)

## 1. Purpose

This document outlines the functionality implemented under the "Run Reference" initiative. The goal was to provide a stable and understandable way to calculate a Reference Model scenario, cache its inputs and results, and display these alongside the active Target Model for comparison, while mitigating state contamination issues observed in previous dynamic reference modes.

This was achieved by replacing the previous single "Show Reference/Show Design" toggle with a two-button system:

1.  **"Run Reference & Update Comparison"**
2.  **"Show Cached Reference Inputs" / "Show Target Inputs"**

## 2. Core Components and Workflow

### 2.1. "Run Reference & Update Comparison" Button

**ID:** `runReferenceBtn`

**Functionality:**
When clicked, this button orchestrates the following sequence, primarily managed by `TEUI.ReferenceToggle.executeReferenceRunAndCache()`:

1.  **Mute Application State:** `TEUI.StateManager.setMuteApplicationStateUpdates(true)` is called to prevent immediate UI refreshes or recalculations while reference data is being loaded.
2.  **Load Reference Data:** The selected reference standard's data is loaded into `TEUI.StateManager.activeReferenceDataSet` using `TEUI.StateManager.loadReferenceData(standardKey)`. The `referenceMode` flag in `ReferenceToggle` is temporarily set to `true` so that `StateManager.getValue` (when called by the calculator) sources data from `activeReferenceDataSet`.
3.  **Calculate Reference Scenario:** `TEUI.Calculator.calculateAll()` is invoked. Because `referenceMode` is temporarily true and `StateManager` is configured to use `activeReferenceDataSet`, the calculator processes the reference values.
4.  **Cache Results:**
    - **Inputs:** The values from `TEUI.StateManager.activeReferenceDataSet` (which represent the _inputs_ used for the reference calculation) are cached in `TEUI.ReferenceToggle.cachedReferenceResults`.
    - **Outputs:** Calculated and derived values resulting from the reference run (now present in `TEUI.StateManager.fields` because the calculator updated them) are also cached into `TEUI.ReferenceToggle.cachedReferenceResults`. `TEUI.FieldManager.getAllFields()` is used to distinguish input types from calculated/derived types for correct caching.
5.  **Restore Target State Focus:**
    - The temporary `referenceMode` flag in `ReferenceToggle` is set back to `false`.
    - `TEUI.StateManager.setMuteApplicationStateUpdates(false)` is called.
6.  **Recalculate Target Model:** `TEUI.Calculator.calculateAll()` is called again. Now, with `referenceMode` false, it recalculates based on the live user inputs in the Target model, refreshing `TEUI.StateManager.fields`.
7.  **Update Comparison Display:** `TEUI.ReferenceToggle.updateComparisonDisplay()` is called. This function iterates through HTML elements designated with `data-compare-field-id` and populates them with the corresponding values from `cachedReferenceResults`.
8.  **Refresh Cached Inputs View (if active):** If the user is currently viewing the cached reference inputs, this view is refreshed with the newly cached data.

### 2.2. "Show Cached Reference Inputs" / "Show Target Inputs" Button

**ID:** `viewReferenceInputsBtn`

**Functionality:**
This button, managed by `TEUI.ReferenceToggle.toggleReferenceInputsView()`, allows the user to switch the main UI input fields between two states:

1.  **"Show Target Inputs" (Default):**
    - The UI displays the live, editable Target Model values.
    - Input fields are styled normally (e.g., blue text for user inputs).
    - The `document.body` does _not_ have the `viewing-reference-inputs` class.
2.  **"Show Cached Reference Inputs":**
    - The UI displays the _input values_ that were used for the last "Run Reference & Update Comparison" execution. These values are pulled from `cachedReferenceResults`.
    - All input fields are made read-only (programmatically disabled and styled with `reference-input-display-locked` class).
    - The `document.body` gets the `viewing-reference-inputs` class, triggering a visual theme change (e.g., red section headers, specific styling for locked fields).
    - `TEUI.FieldManager.updateFieldDisplay()` is used to update the display of each field with the cached reference input value and apply the locked styling.

## 3. Key Modules Involved

- `OBJECTIVE-2025.05.30.8h23/4011-ReferenceToggle.js`: Orchestrates the entire process, handles button events, manages caching, and controls UI state for viewing reference inputs.
- `OBJECTIVE-2025.05.30.8h23/4011-StateManager.js`: Manages application state, including `activeReferenceDataSet` for reference values and the `isApplicationStateMuted` flag.
- `OBJECTIVE-2025.05.30.8h23/4011-Calculator.js`: Performs the core calculations, triggered for both reference and target scenarios.
- `OBJECTIVE-2025.05.30.8h23/4011-FieldManager.js`: Provides field definitions (to distinguish inputs from outputs for caching) and updates the UI display of fields when switching to "Show Cached Reference Inputs" mode.
- `OBJECTIVE-2025.05.30.8h23/index.html`: Contains the HTML for the two new control buttons.
- `OBJECTIVE-2025.05.30.8h23/4011-styles.css`: Contains CSS rules for the `viewing-reference-inputs` body class and the `.reference-input-display-locked` class to style the UI when viewing cached reference inputs.

## 4. Known Issues / Areas for Further Investigation

- **Minor Target State Contamination:** A minor shift in some Target state values (e.g., `h_10` - Key TEUI) has been observed immediately after the "Run Reference & Update Comparison" sequence completes and the Target model is recalculated. This suggests a subtle, lingering state interaction despite the muting and explicit recalculation steps. While it doesn't break the core functionality of displaying cached reference values, it requires further investigation to ensure perfect Target state integrity.
- **Section 13 (Mechanical Loads) Value Discrepancies:** Some selections within Section 13 may produce unexpected or inconsistent values in either the Target or Reference calculations. This issue appears to be pre-existing and not directly caused by the new "Run Reference" implementation. It will require separate troubleshooting focused on the S13 calculation logic and its dependencies.

## 5. Files Modified/Created for this Feature

- `OBJECTIVE-2025.05.30.8h23/4011-ReferenceToggle.js` (Major refactoring and new functions)
- `OBJECTIVE-2025.05.30.8h23/index.html` (Button modifications)
- `OBJECTIVE-2025.05.30.8h23/4011-styles.css` (Added `viewing-reference-inputs` and `reference-input-display-locked` styles)
- `OBJECTIVE-2025.05.30.8h23/documentation/RUN-REFERENCE.md` (This documentation file)
