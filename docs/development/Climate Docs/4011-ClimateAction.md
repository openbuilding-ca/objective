# Workplan: Section 03 Climate Calculations Refactor (CANADA2 Branch)

**Goal:** Refactor Section 03 (Climate Calculations) to eliminate the dependency on external Excel file imports for weather data. Replace this with an internal JavaScript data source (`4011-ClimateValues.js`) containing climate data for Canadian locations. The refactored section should be functionally identical to the original (regarding displayed values and calculations) but faster, lighter, and provide a frictionless user experience for selecting locations, while adhering fully to the application's architecture.

**Branch:** `CANADA2` (Created from latest `main` as of 2024-08-02)

**Key Files:**

- `sections/4011-Section03.js` (The refactored module)
- `4011-ClimateValues.js` (New file holding climate data in JSON format)
- `index.html` (Minor adjustments for button removal/restoration)

---

**Current Status (as of start of workplan):**

1.  **Branch:** `CANADA2` is checked out and based on the latest stable `main`.
2.  **Climate Data File:** `4011-ClimateValues.js` created and populated with initial data for 3 Ontario cities.
3.  **Section 03 Refactor (Initial):**
    - `sections/4011-Section03.js` created (copied from original S03).
    - Excel import logic and related internal functions removed.
    - References to `window.TEUI.ClimateData` added.
    - Module namespace corrected to `sect03`.
    - Redundant initialization listeners removed.
4.  **UI Adjustments:**
    - Excel loader buttons removed from Section 3 header in `index.html`.
    - "More Weather Data" button restored in `index.html`.
5.  **Known Issues:**
    - City dropdown (`dd_h_19`) does not populate correctly based on the selected province.
    - Selecting a city does not trigger the loading of climate data into the section's fields.
    - Initial default selection ("ON" / "Alexandria") and data load is not functioning correctly.

---

**Workplan Tasks:**

**Phase 1: Foundational Fixes & Diagnostics**

1.  **Update Work Plan Documentation (This Step):**

    - Reflect current diagnosis: The core issue is likely a DOM element conflict/re-rendering issue where the city dropdown (`dd_h_19`) becomes unavailable during the `handleProvinceChange` execution, triggered by interactions within the application's architecture (potentially `FieldManager` re-rendering).
    - Prioritize architecturally sound solutions focusing on event handler lifecycle, event delegation, and identifying the source of potential DOM interference.
    - Remove suggestions for non-architectural workarounds (e.g., MutationObserver bandaids unless absolutely necessary as a last resort).

2.  **Populate `4011-ClimateValues.js` (First City per Province/Territory):**

    - **(Completed)** Ensure the data file includes at least the first city listed for _every_ province/territory from `CANDA.csv` to rule out missing data as a factor.

3.  **Strategy 1: Ensure Correct Initialization & Event Handler Lifecycle:**
    - **Goal:** Verify and enforce that event listeners are attached correctly and only once, after the initial `FieldManager` render, and are not lost or duplicated by subsequent updates.
    - **Action (in `sections/4011-Section03.js`):**
      - Remove potentially redundant `DOMContentLoaded` and `teui-rendering-complete` listeners from the bottom of the file.
      - Confirm `onSectionRendered` is the primary initialization point and calls `initializeEventHandlers`.
      - Ensure `initializeEventHandlers` attaches listeners cleanly (potentially using flags to prevent duplicates).
      - Verify correct referencing of globally exposed handlers (`window.TEUI.sect03.handleProvinceChange`, etc.).
    - **Test:** Check if city dropdown populates correctly after province change without errors.
    - **Rollback Point:** Revert changes to `initializeEventHandlers` and bottom event listeners.

**Phase 2: Implement & Test Robust Event Handling**

4.  **Strategy 2: Event Delegation (If Strategy 1 Fails):**
    - **Goal:** Increase resilience to DOM element replacement by attaching listeners to a stable parent.
    - **Action (in `sections/4011-Section03.js`):**
      - Modify `initializeEventHandlers` to attach a single `change` listener to the section container (`#climateCalculations`).
      - Delegate calls to the appropriate handlers (`window.TEUI.sect03.handleProvinceChange` or `window.TEUI.sect03.handleCityChange`) based on `event.target`.
    - **Test:** Check if city dropdown populates correctly without errors.
    - **Rollback Point:** Revert `initializeEventHandlers` to its previous state.

**Phase 3: Deeper Diagnostics (If Phase 2 Fails)**

5.  **Strategy 3: Trace the Re-rendering Source:**
    - **Goal:** Identify the exact cause of the city dropdown element disappearing during the province change flow.
    - **Action:** Add targeted `console.log` statements in `FieldManager.js` (`renderSection`), `StateManager.js` (`setValue`, `notifyListeners`), and `sections/4011-Section03.js` (`handleProvinceChange` just before the failing `querySelector`) to trace the execution sequence and identify unexpected calls to `renderSection('climateCalculations')`.
    - **Analysis:** Observe logs during province change to pinpoint the interfering process.
    - **Fix (Targeted):** Modify the code (e.g., listener, component interaction) that triggers the unnecessary re-render.
    - **Rollback Point:** Remove diagnostic logs and targeted fixes.

**Phase 4: Standardization & Refinement (After Dropdown Fix)**

6.  **Standardize Helper Functions:**

    - Review `getNumericValue`, `getFieldValue`, and `setCalculatedValue` within `Section03.js`.
    - Ensure they strictly follow the standard pattern: use only the global `window.TEUI.parseNumeric` and `window.TEUI.formatNumber` utilities without local fallbacks.
    - Verify that `setCalculatedValue` stores the raw numeric value (as string) in `StateManager` and the formatted value in the DOM.

7.  **Verify Formatting:**

    - Test the display of all climate-related fields (`d_20` to `m_24`, `j_19`).
    - Ensure correct `formatType` strings (`integer`, `number-1dp`, etc.) are used in `setCalculatedValue` calls to match the original Excel appearance.

8.  **"More Weather Data" Modal:**
    - Test the "More Weather Data" button (`#showWeatherDataBtn`).
    - Verify the `showWeatherData` function reads the correct city data from `window.TEUI.ClimateData` and displays all key-value pairs clearly in the modal (`#weatherDataModal`).

**Phase 5: Full Data Population & Final Cleanup**

9.  **Populate `4011-ClimateValues.js` (Complete Data):**

    - **(Deferred until core functionality is fixed)** Write/use a script or manually parse the full `sources of truth 3037/CANDA.csv`.
    - Populate `window.TEUI.ClimateData` with entries for _all_ provinces/territories and their respective cities.
    - Ensure data keys in the JS object exactly match the relevant column headers/JavaScript notations expected by `Section03.js`. Double-check units and values.

10. **Cleanup & Final Testing:**
    - Remove all temporary `console.log` statements added during debugging.
    - Comment out or remove any unused functions or variables.
    - Perform comprehensive testing:
      - Select various provinces and cities.
      - Toggle "Present" / "Future" data.
      - Edit user inputs (`m_19`, `l_24`).
      - Verify calculations within Section 03 are correct.
      - Verify that changes in Section 03 correctly propagate to dependent fields in other sections (e.g., temperature setpoints, HDD/CDD values used elsewhere).
      - Compare key outputs with the original (Excel-based) Section 03 to ensure functional parity.

---

**Completion Criteria:**

- Section 03 loads default "ON" / "Alexandria" data correctly on page initialization.
- Province dropdown selection correctly populates the city dropdown without errors or disappearance.
- City dropdown selection correctly loads and displays all associated climate data fields with correct formatting.
- "Present" / "Future" toggle works correctly.
- User-editable fields (`m_19`, `l_24`) function correctly.
- Internal calculations (GF HDD/CDD, Climate Zone, F temps) update correctly.
- "More Weather Data" modal displays correct data for the selected city.
- Section 03 helpers are standardized per README guidelines.
- No errors in the console related to Section 03 operation.
- Changes successfully propagate to dependent sections.
- All temporary code/logs removed.
- `4011-ClimateValues.js` contains data for all Canadian locations from the source CSV (or at least the first city per province/territory initially).
- Branch `CANADA2` ready for merge into `main`.

---

## Troubleshooting Journey: Province/City Dropdown Issues (Revised Diagnosis)

### Problem Statement

The province (`dd_d_19`) and city (`dd_h_19`) dropdown relationship in Section 03 (Climate Calculations) fails. When changing the province value, the city dropdown element cannot be found by the `handleProvinceChange` function, resulting in an error and failure to populate cities, **even for provinces with data available** in `4011-ClimateValues.js`. This issue occurs within the main TEUI application but not in isolated demos.

### Revised Diagnosis

The previous focus on missing data was incorrect. The root cause is highly likely a **DOM conflict arising from the application's rendering lifecycle**. Specifically:

1.  The `change` event on the province dropdown correctly triggers `handleProvinceChange`.
2.  However, **before or during** the execution of `handleProvinceChange`, another process (likely `FieldManager.renderSection`, possibly triggered unnecessarily by a listener) rebuilds the HTML content of Section 03's table body (`<tbody>`).
3.  This re-rendering **removes the original city dropdown element (`dd_h_19`)** from the DOM.
4.  When `handleProvinceChange` subsequently attempts `document.querySelector('[data-dropdown-id="dd_h_19"]')`, the element no longer exists, causing the observed error.

### Architectural Challenges Implicated

- **DOM Instability During Events:** The application architecture currently allows the DOM structure targeted by an event handler to be destroyed while the handler is executing or queued.
- **Rendering Lifecycle Interference:** The `FieldManager`'s rendering mechanism appears to conflict with the event handling flow for the dropdowns in this specific section. The trigger for this potential re-render needs investigation.
- **Event Handling Robustness:** The current direct event listener attachment in `initializeEventHandlers` is susceptible to element replacement.

### Attempted Solutions (Summary)

Previous attempts included debugging scope issues (resolved by exposing handlers globally) and DOM preservation strategies in demos (like MutationObservers, which act as workarounds rather than root cause fixes).

### Revised Next Steps (Sequential Strategy)

1.  **Strategy 1: Ensure Correct Initialization & Event Handler Lifecycle:** Verify event handlers are attached cleanly and only once after initial render. (See detailed steps above).
2.  **Strategy 2: Event Delegation:** If Strategy 1 fails, refactor to use event delegation on the section container for more robust handling against element replacement. (See detailed steps above).
3.  **Strategy 3: Trace the Re-rendering Source:** If Strategies 1 & 2 fail, use diagnostic logging to pinpoint the exact cause and timing of the interfering `FieldManager.renderSection` call and address its trigger. (See detailed steps above).

This revised plan focuses on identifying and fixing the architectural conflict causing the DOM instability, rather than just treating the symptoms.
