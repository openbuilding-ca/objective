# TEUI 4.011 - Section 13 Refactor/Cleanup Workplan & Developer Notes

**Goal:** Refactor and clean up `sections/4011-Section13.js` (Mechanical Loads) to align with the latest architectural patterns (`README.md`), improve maintainability, ensure calculation accuracy against `FORMULAE-3037.csv` and `COOLING-TARGET.csv`, enhance UI formatting (including dynamic visibility), and potentially implement new analysis features (Overheat Warning, Unmet Hours).

**Last Major Update:** 2024-08-02 (Branch `13TRIAGE` merged to main)

- Completed initial architectural alignment & standardization.
- Integrated cooling logic directly into Section 13.
- Implemented dynamic visibility/ghosting.
- Fixed listener triggers for `g_118` and `k_120`.
- Deferred `m_124` (Cooling Days) calculation due to parity issues.

---

## 1. Refactoring Strategy & Status

1.  **Architectural Alignment & Standardization:**

    - **Status:** ✅ Completed
    - **Actions:**
      - Replaced local helpers (`getNumericValue`, `formatNumber`) with global versions (`window.TEUI.parseNumeric`, `window.TEUI.formatNumber`).
      - Standardized `setCalculatedValue` to use global formatter and store raw string values in state.
      - Corrected `getFieldValue` to remove DOM fallback, relying solely on StateManager.
      - Refined event listeners: Corrected listener call sequences for `g_118` and `k_120` changes to ensure proper calculation flow (`calculateVentilationValues` -> `calculateFreeCooling` -> `calculateMitigatedCED`). Removed redundant local state listeners.
      - Fixed `contenteditable` event handler scope and implementation per README.

2.  **Calculation Logic Debugging & Refinement:**

    - **Status:** ⏳ Partially Complete (Specific issues fixed, full verification pending)
    - **Actions Completed:**
      - Corrected calculation for `d_114` (Heating System Demand) to use correct COP value based on `d_113`.
      - Added missing calculation logic for `l_114` (Heatpump Cooling Sink).
      - Identified and corrected calculation/mapping issues in Section 14 (`d_127`, `h_127`, etc.) that were providing incorrect inputs to Section 13.
    - **TODO:** Perform full verification against `FORMULAE-3037.csv` and `COOLING-TARGET.csv` (See Section 5 Below).

3.  **Cooling Module Integration:**

    - **Status:** ✅ Completed
    - **Actions:**
      - Moved core logic (state variables, calculation functions) from `4011-Cooling.js` directly into `sections/4011-Section13.js`.
      - Updated Section 13 functions (`calculateCoolingVentilation`, `calculateFreeCooling`) to use the integrated logic and state.
      - Removed the separate `initializeCoolingModule` function and dependencies on `window.TEUI.CoolingCalculations` or `cooling_*` state keys from Section 13.
      - Removed `<script src="4011-Cooling.js">` from `index.html`.
    - **Rationale:** Eliminates potential race conditions during initialization, simplifies dependencies, and makes Section 13 more self-contained.
    - **TODO:** Delete `4011-Cooling.js` file (Action taken after this consolidation).

4.  **UI Formatting & Dynamic Visibility:**

    - **Status:** ✅ Completed
    - **Actions:**
      - Applied appropriate number formatting using `window.TEUI.formatNumber` via `setCalculatedValue`.
      - Implemented dynamic visibility/styling ("ghost text") for irrelevant fields based on `d_113` (Heating System) and `d_116` (Cooling Active) selections using the `setFieldGhosted` helper.

5.  **General Cleanup:**

    - **Status:** ✅ Completed
    - **Actions:** Removed commented-out code, diagnostic logs, and improved comments during refactoring.

6.  **NEW Feature - Overheat Warning (Optional):**

    - **Status:** ⏳ Pending
    - Implement if feasible after core refactor is stable.

7.  **NEW Feature - Unmet Hours Analysis (Exploratory - Lower Priority):**
    - **Status:** ⏳ Pending
    - Implement if feasible after core refactor is stable.

---

## 2. Original Developer Notes (Moved from JS Source)

_These notes were originally located at the beginning of `sections/4011-Section13.js` and provide context on the section's internal logic, dependencies, and original design patterns as of commit `43f5588`. Some details might be slightly outdated due to subsequent refactoring._

/\*\*

- 4011-Section13.js
- Mechanical Loads (Section 13) module for TEUI Calculator 4.011
-
- This section integrates with 4011-Cooling.js for complex cooling calculations
- and requires SectionIntegrator and StateManager connections to function properly.
-
- ====================================================================
- INTERNAL COOLING CALCULATIONS
- ====================================================================
-
- This section contains integrated logic for calculating key cooling-related factors,
- replacing the previous dependency on an external Cooling.js module.
-
- 1.  Internal State: Uses an internal `coolingState` object to manage inputs,
- constants (like Air Mass, Specific Heat Capacity, Latent Heat of Vaporization),
- and intermediate/final calculated values.
- 2.  Core Functions: Relies on internal helper functions:
- - `updateCoolingInputs`: Fetches required values from StateManager.
- - `calculateA50Temp`: Calculates intermediate outdoor temperature for psychrometrics.
- - `calculateAtmosphericValues`: Calculates saturation/partial pressures.
- - `calculateHumidityRatios`: Calculates indoor/outdoor humidity ratios.
- - `calculateLatentLoadFactor`: Calculates the factor used in `i_122`.
- - `calculateFreeCoolingLimit`: Calculates potential free cooling (kWh/yr).
- - `calculateDaysActiveCooling`: Estimates active cooling days needed.
- - `runIntegratedCoolingCalculations`: Orchestrates these internal calculations.
- 3.  Key Outputs Used Internally:
- - `coolingState.latentLoadFactor` -> Used for `i_122` calculation.
- - `coolingState.freeCoolingLimit` -> Used for `h_124` calculation (conditionally zeroed based on `g_118`).
- - `coolingState.daysActiveCooling` -> Used for `m_124` calculation.
- 4.  Execution: `runIntegratedCoolingCalculations` is called within
- `calculateCoolingVentilation` and `calculateFreeCooling` to ensure the
- `coolingState` is up-to-date before relevant fields (`i_122`, `h_124`, `m_124`) are set.
-
- ====================================================================
- STATEMANAGER DEPENDENCIES
- ====================================================================
-
- This section has cross-section dependencies managed by StateManager, including:
- - FROM Section 02: `h_15` (Building area) - Affects cooling calcs & intensity.
- - FROM Section 03:
- - `d_20` (HDD) - Affects heating ventilation energy.
- - `d_21` (CDD) - Affects cooling ventilation energy & internal cooling calcs.
- - `h_24` / `l_24` (Cooling Setpoint) - Affects internal cooling calcs.
- - `l_22` (Elevation) - Affects atmospheric pressure in internal cooling calcs.
- - FROM Section 08/09(?): `d_59` (Indoor RH) - Affects internal cooling calcs.
- - FROM Section 09: `d_63`, `i_63`, `j_63` (Occupants / Schedule) - Affects ventilation rates.
- - FROM Section 12: `d_105` (Building volume) - Affects ventilation rates & internal cooling calcs.
- - FROM Section 14:
- - `d_127` (TED) - Affects heating demand.
- - `m_129` (CED Mitigated) - Affects cooling system electrical load.
-
- The `registerWithStateManager()` function declares dependencies relevant for
- StateManager's change propagation, though not all internal dependencies might be
- explicitly listed there if calculations are handled internally via `calculateAll` triggers.
-
- ====================================================================
- SECTIONINTEGRATOR CONNECTIONS
- ====================================================================
-
- SectionIntegrator connects this section to others through these mechanisms:
- 1.  Global access point window.TEUI.sect13.calculateAll() is registered
- 2.  Section exposes key calculation functions as public API methods
- 3.  Listens for teui-section-rendered events for initialization timing
-
- IMPORTANT: This section's calculated values affect TEDI values in Section14,
- creating a bi-directional dependency that requires careful initialization
- order management through SectionIntegrator.
-
- TEMPLATE FOR SECTION MODULES USING THE CONSOLIDATED DECLARATIVE APPROACH
- This template demonstrates the preferred pattern for defining sections where
- field definitions are integrated directly into the layout structure.
-
- IMPORTANT STANDARDS:
- 1.  Column C (row labels) should use this pattern: c: { label: "Row Label Text" }
- This is the preferred approach for maximum compatibility with the rendering system.
- (Alternative pattern c: { content: "Row Label Text", type: "label" } is supported
- but requires special handling in createLayoutRow)
-
- 2.  All unit subheaders must be defined as the first row with "header" key.
-
- 3.  Rows should be named with their Excel row numbers when possible, or descriptive
- IDs that match the CSV pattern.
-
- NEWLINES IN SUBHEADER CELLS:
- To properly display newlines in subheader cells, follow these guidelines:
- 1.  Use the "\n" character in the content string where you want line breaks
- 2.  Add BOTH of these attributes to the cell's classes array
- - Add the "section-subheader" class to the cell's classes array
- - Add the inline style "white-space: pre-line;" to ensure proper rendering
-
- Example:
- ```javascript

  ```

- h: {
-     content: "Summer Shading\n%",
-     classes: ["section-subheader", "align-center"],
-     style: "white-space: pre-line;"
- },
- ```

  ```

-
- The CSS rule `.section-subheader { white-space: pre-line; }` handles the display,
- but adding the inline style ensures consistency across browsers and prevents styling issues.
- This approach follows section 04 and 10's implementation, which works correctly.
-
- Section Module Template
-
- This template provides a standardized format for creating section modules using the
- consolidated declarative approach. Follow these guidelines to ensure your section is
- compatible with the FieldManager and provides a consistent user experience.
-
- IMPORTANT STANDARDS:
- - Unit subheaders should always be the first row
- - Row labels should follow this pattern: <unit> | <category> | <parameter>
- - Prefer defining fields as declarative objects where possible
- - Always match column IDs with Excel column positions (a = column A, b = column B, etc.)
- - Percentage fields should be formatted with the '%' symbol
- - Currency fields should be formatted with the appropriate symbol
-
- COLUMN PERCENTAGES AND CHECKMARKS:
- Section08 includes a percentage and checkmark function that allows displaying a percentage
- in column M based on values from columns D and F, then displaying a checkmark (✓) or X (✗)
- in column N based on whether values meet criteria. This functionality should be implemented
- in other sections as they are refactored.
-
- Here's a sample implementation for reference:
-
- function calculatePercentagesAndStatus() {
-     // Calculate percentage (value/limit * 100)
-     const value = parseFloat(getFieldValue("d_rowId")) || 0;
-     const limit = parseFloat(getFieldValue("f_rowId")) || 100;
-
-     if (limit > 0) {
-         const percent = Math.round((value / limit) * 100);
-         setCalculatedValue("m_rowId", `${percent}%`);
-
-         // Set status - checkmark if under limit, X if over
-         if (value <= limit) {
-             setCalculatedValue("n_rowId", "✓");
-             setElementClass("n_rowId", "checkmark");
-         } else {
-             setCalculatedValue("n_rowId", "✗");
-             setElementClass("n_rowId", "warning");
-         }
-     }
- }
-
- Helper functions needed:
- - getFieldValue(fieldId): Gets a field's value from StateManager or DOM
- - setCalculatedValue(fieldId, value): Sets a calculated field value
- - setElementClass(fieldId, className): Sets appropriate visual classes
- - CSS styles for .checkmark and .warning classes
-
- See Section08 for a complete implementation example.
-
- NUMERIC INPUT HANDLING:
- All numeric inputs should have standardized behavior:
- 1.  Enter key should save the input and exit edit mode (prevent newlines)
- 2.  Numbers should be formatted with thousands separators (commas) after input
- 3.  Decimal values should maintain proper precision (typically 2 decimal places)
-
- Here's the standard implementation to add to each section:
-
- // Prevent newlines and handle Enter key in editable fields
- field.addEventListener('keydown', function(e) {
-     if (e.key === 'Enter') {
-         e.preventDefault(); // Prevent adding a newline
-         this.blur(); // Remove focus to trigger the blur event
-     }
- });
-
- // Format numbers with commas and proper decimals
- function formatNumber(value) {
-     if (Math.abs(value) < 0.01 && value !== 0) {
-         return value.toFixed(2); // Handle very small numbers
-     }
-
-     if (Number.isInteger(parseFloat(value))) {
-         return parseFloat(value).toLocaleString(undefined, {
-             minimumFractionDigits: 0,
-             maximumFractionDigits: 0
-         }); // Integers with commas, no decimals
-     }
-
-     return parseFloat(value).toLocaleString(undefined, {
-         minimumFractionDigits: 2,
-         maximumFractionDigits: 2
-     }); // Format with commas and 2 decimal places
- }
-
- // Apply formatting during blur event
- field.addEventListener('blur', function() {
-     const fieldId = this.getAttribute('data-field-id');
-     if (!fieldId) return;
-
-     // Get and clean the value (remove existing commas)
-     let numValue = this.textContent.trim().replace(/,/g, '');
-
-     // Check if this is a numeric field that should be formatted
-     if (!isNaN(parseFloat(numValue)) && isFinite(numValue)) {
-         // Format and display the number
-         const formattedValue = formatNumber(numValue);
-         this.textContent = formattedValue;
-
-         // Store the raw value in the state manager
-         if (window.TEUI?.StateManager?.setValue) {
-             window.TEUI.StateManager.setValue(fieldId, numValue, 'user-modified');
-         }
-     }
- });
-
- DEFAULT VALUE INITIALIZATION AND ENFORCEMENT:
- ============================================
- When your section needs to ensure specific default values (especially for dropdowns
- or calculated fields), follow this balanced pattern that enforces defaults on initialization
- but respects user changes afterward:
-
- 1.  REGISTER DEFAULT VALUES WITH APPROPRIATE PRIORITY
- Use 'default' state for initial values to avoid overriding user choices:
- ```javascript

  ```

- // In registerWithStateManager()
- window.TEUI.StateManager.setValue("fieldId", "defaultValue", 'default');
- ```

  ```

- Only use 'user-modified' for values that must persist regardless of user interaction.
-
- 2.  IMPLEMENT ONE-TIME INITIALIZATION
- Create a function that sets initial values exactly once using flags to track initialization:
- ```javascript

  ```

- function setupValueEnforcement() {
-        // Create tracker flags
-        window.TEUI = window.TEUI || {};
-        window.TEUI.sectXX = window.TEUI.sectXX || {};
-        window.TEUI.sectXX.initialized = false;
-
-        function initializeDropdownValues() {
-            // Skip if already initialized
-            if (window.TEUI.sectXX.initialized) return;
-
-            // Set initial values
-            const dropdown = document.querySelector('select[data-field-id="fieldId"]');
-            if (dropdown) {
-                dropdown.value = "defaultValue";
-                dropdown.dispatchEvent(new Event('change', { bubbles: true }));
-            }
-
-            // Mark as initialized
-            window.TEUI.sectXX.initialized = true;
-        }
-
-        // Run initialization once
-        initializeDropdownValues();
- }
- ```

  ```

-
- 3.  TRACK USER INTERACTIONS
- Use event properties to distinguish user changes from programmatic ones:
- ```javascript

  ```

- dropdown.addEventListener('change', function(e) {
-        // e.isTrusted is true for real user interactions, false for programmatic ones
-        if (e.isTrusted) {
-            window.TEUI.sectXX.userInteracted = true;
-
-            // Use 'user-modified' state for user changes to ensure they persist
-            window.TEUI.StateManager.setValue(fieldId, this.value, 'user-modified');
-        }
-
-        // Always update calculations
-        performCalculation();
- });
- ```

  ```

-
- 4.  CALL INITIALIZATION AT STRATEGIC POINTS
- Initialize in:
- - onSectionRendered()
- - DOMContentLoaded event handler
- - teui-section-rendered event handler
-
- The key benefit of this approach is balancing automatic initialization with user control.
- Initial values are enforced during page load, but user changes are respected afterward.
- This avoids the frustration of dropdowns that revert to default values when users try
- to change them.
-
- See Section09 (Occupant Internal Gains) for a complete implementation example.
-
- TYPE-SAFE VALUE HANDLING:
- ========================
- Always use type-safe functions to handle values that might be returned as either
- strings or numbers from different sources. This pattern is essential for robust calculations:
-
- ```javascript

  ```

- function getNumericValue(fieldId) {
-     const value = getFieldValue(fieldId);
-     // Handle string values (with comma removal)
-     if (typeof value === 'string') {
-         return parseFloat(value.replace(/,/g, '')) || 0;
-     }
-     // Handle number values directly
-     else if (typeof value === 'number') {
-         return value;
-     }
-     // Default fallback
-     return 0;
- }
- ```

  ```

-
- Always use this helper instead of directly parsing strings with potential formatting.
- This prevents errors when StateManager returns a number but your code expects a string.
-
- CROSS-MODULE FUNCTION ACCESSIBILITY:
- ==================================
- Make key functions globally accessible for cross-module use to prevent "function not found" errors:
-
- ```javascript

  ```

- // At the top of your module
- window.TEUI = window.TEUI || {};
- window.TEUI.sectXX = window.TEUI.sectXX || {}; // Create section namespace
- window.TEUI.sectXX.initialized = false; // Track initialization state
-
- // In your DOMContentLoaded handler
- document.addEventListener('DOMContentLoaded', function() {
-     // Expose critical functions after module is defined
-     const module = window.TEUI.SectionModules.sectXX;
-     window.TEUI.sectXX.calculateSomething = module.calculateSomething;
-     window.TEUI.sectXX.setupListeners = module.setupListeners;
- });
- ```

  ```

-
- For functions that might be called from global context, implement safe wrappers with recursion protection:
-
- ```javascript

  ```

- window.globalFunction = function() {
-     // Prevent infinite recursion
-     if (window.globalFunctionRunning) {
-         console.warn("Preventing recursive call");
-         return;
-     }
-
-     window.globalFunctionRunning = true;
-
-     try {
-         // Try multiple paths to find the actual implementation
-         if (window.TEUI?.SectionModules?.sectXX?.originalFunction) {
-             window.TEUI.SectionModules.sectXX.originalFunction();
-         }
-         else if (window.TEUI?.sectXX?.originalFunction) {
-             window.TEUI.sectXX.originalFunction();
-         }
-         else {
-             console.warn("Function not found in any namespace");
-         }
-     } catch (e) {
-         console.error("Error in wrapper:", e);
-     } finally {
-         // ALWAYS clear recursion flag regardless of success/failure
-         window.globalFunctionRunning = false;
-     }
- };
- ```

  ```

-
- APPROPRIATE COMPLEXITY & DEFENSIVE PROGRAMMING:
- =============================================
- While we strive for simplicity, production-grade code often needs defensive measures:
-
- 1.  Include multiple safety checks for unpredictable browser environments
- 2.  Implement fallback mechanisms when primary access paths fail
- 3.  Use try/catch blocks to prevent cascading failures
- 4.  Handle race conditions between component loading/initialization
-
- The goal is not to over-engineer but to create robust, resilient code. When issues occur
- in browser environments (especially with page refreshes and state persistence), these
- defensive patterns make the difference between a frustrating bug and seamless recovery.
  \*/

---

## 3. Troubleshooting History (Consolidated)

_This section summarizes the key issues encountered and resolved during the Section 13 debugging process, merging notes from `section13-developer-notes.md` and `Section13-troubleshooting.md`._

### Initial Problem (Early May 2024)

- **Symptom:** Mitigated Cooling Energy Demand (`m_129`) was vastly incorrect (~44k kWh/yr vs. target ~10.5k kWh/yr).
- **Initial Suspicion:** StateManager propagation issues between Section 13 and Section 14, potentially causing Section 14 to use stale values for `h_124` (Free Cooling Limit) or `d_123` (Ventilation Recovery).

### Investigation & Root Cause Analysis (Ref: `section13-last-mile.md` v1.3)

1.  **Recursive Calls:** Identified recursive calls involving `calculateFreeCoolingLimit` and `calculateFreeCooling`, causing console flooding. **(Fixed in commit `92bbc76`)**
2.  **Incorrect Outdoor Humidity Ratio:** Found that `calculateHumidityRatios` used the average seasonal RH (55.85%) instead of the required 70% RH for calculating the outdoor component (`coolingState.humidityRatioAvg`), mismatching Excel's `A62` calculation. **(Fixed in commit `92bbc76`)**
3.  **Incorrect Free Cooling Basis (Volume vs. Flow Rate):** Discovered that `calculateFreeCoolingLimit` based its calculation on the total building air mass (from volume `d_105`) instead of the ventilation flow rate (`h_120`) used in the Excel model. **(Fixed in commit `9fde294`)**
4.  **Incorrect Setback Factor Calculation:** Found a bug where the setback factor for scheduled ventilation (`k_120`) was being divided by 100 unnecessarily. **(Fixed in commit `9fde294`)**
5.  **Incorrect Power-to-Energy Conversion:** Identified the final error where the conversion factor from Watts to kWh/day in `calculateFreeCoolingLimit` was incorrect (`0.0864` instead of `0.024`). **(Fixed in commit `9fde294`)**

### Listener Trigger Issues (Branch `13TRIAGE`, Aug 2024)

1.  **Issue:** `d_121` (Heating Season Vent Energy) was not updating when `g_118` (Ventilation Method) changed.
    - **Cause:** The `g_118` listener only called `calculateVentilationRates` (updating `d_120`), but not `calculateVentilationEnergy` (which uses `d_120` to calculate `d_121`). Updates via `setCalculatedValue` don't automatically trigger dependency chains.
    - **Fix:** Changed the `g_118` listener to call `calculateVentilationValues`, which executes both necessary functions.
2.  **Issue:** Row 124 (`d_124`, `h_124`, `m_124`) did not update when `g_118` changed.
    - **Cause:** The `g_118` listener, even after the first fix, did not trigger `calculateFreeCooling`, which is responsible for Row 124 and depends on the updated ventilation rate (`h_120`).
    - **Fix:** Modified the `g_118` listener to call `calculateVentilationValues`, then `calculateFreeCooling`, then `calculateMitigatedCED` in sequence.
3.  **Issue:** `k_120` (Ventilation Setback Slider) changes did not update Row 124.
    - **Cause:** The `handleK120Change` event handler updated the `k_120` value in StateManager but did not explicitly trigger the dependent `calculateFreeCooling` function.
    - **Fix:** Added calls to `calculateFreeCooling` and `calculateMitigatedCED` within the `handleK120Change` handler.

### Historical Notes (Misc.)

- During earlier troubleshooting phases (before the May 2024 fixes were implemented systematically), the _correct target value_ for `h_124` (37,322.83 kWh/yr) was observed _intermittently_ in logs or the UI, but was quickly overwritten or became stuck. This suggested that while parts of the calculation might have been momentarily correct, issues like recursion, incorrect humidity inputs, or the volume-based calculation prevented the correct value from persisting reliably.
- Confirmed formula for `m_129` (`=D129-H124-D123`) was correct in JS, but inputs were sometimes wrong due to the issues above.
- Noted potential dependencies on inputs from S9/S10 (`k71`, `k79`, `k98`) affecting `d_129` calculation in S14.
- Analysis of `d_122` (Ventilation Energy), `h_124` (Free Cooling), `calculateLatentLoadFactor`, and `calculateHumidityRatios` were performed against Excel, leading to fixes described above.

### Current Status (Branch `13TRIAGE` merged)

- The major calculation discrepancies for `h_124` and `m_129` have been resolved.
- Listener triggers for `g_118` and `k_120` are working correctly.
- The application now calculates values very close to the Excel targets using default inputs, **except for `m_124`**.
- `m_124` (Cooling Days) calculation is deferred (displays "TBD") due to remaining parity issues requiring further investigation (See TODOs).
- The code has been cleaned of most diagnostic logs and obsolete commented-out blocks.

---

## 4. Cooling Flow Calculation Details (From `Cooling Flow for Agents.txt`)

_This provides a breakdown of specific cell calculations from `COOLING-TARGET.csv` relevant to the integrated cooling logic._

**Agent asked how A33 is derived:**

A33=345.58 (Heat Removed in one Day (kWh)). It comes from the formula: =A32/3600000, where A32=A31*86400 (Heat Removed in one Day (Joules)) and where A31=A30*E4*A16 (Q̇ = ṁ * cₚ * ΔT (Heat Removal per Second in J/s or Watts)) and where A30=A29*E3 (the Mass-Flow Rate of Air kg/s) where A29=d_120/1000 (comes from d_120 in section13), and E3=20.43ºC, our hard-coded but someday overnight average seasonal (Summer) temperature.

**Other Key Cell Calculations:**

A50=15.11, from =E64, where E64= E60 - (E60 - (E60 - (100 - E59)/5)) _ (0.1 + 0.9 _ (E59 / 100))

- Terms:
  - E60=A3 (Night-Time Temp, 20.43)
  - E59=A4\*100 (Avg RH % = 55.85)

A56=1,713.91, from formula =610.94 _ EXP(17.625 _ A50 / (A50 + 243.04)), where A50 is defined above.

A58=1199.74, from =A56\*A57, where A56 is defined above and A57=70% (hard coded), Outdoor Seasonal Relative Humidity %

A59=610.94 _ EXP(17.625 _ A8 / (A8 + 243.04)), the Pa Saturation Vapor Pressure at Indoor Conditions

- Terms:
  - A8 = TsetCool (h_24 or l_24 override, typically 24)

A60=1340.13, (Pa Partial Pressure of Water Vapor Indoors), from =A52\*A59

- Terms:
  - A52= d_59 (Indoor RH %, typically 45)
  - A59 is defined above

E15=100,368.43 (Example value for 80m ASL), from =E13\*EXP(-E14/8434) (Atmospheric Pressure at Project Elevation)

- Terms:
  - E13 = 101325 (Sea Level Pressure Pa)
  - E14 = Project ASL (m) (l_22, default 80)

A61=0.00842, from =0.62198\*A60/(E15-A60) (Indoor Humidity Ratio kg/kg)

- Terms: E15, A60 defined above

A62=0.00756, from =0.62198\*A58/(E15-A56) (Outdoor Avg Humidity Ratio kg/kg)

- Terms: E15, A58, A56 defined above

A63=-0.00085, Humidity Ratio Difference ΔW=Wavg-Windoor kg/kg PRESENT, from =A62-A61

- Terms: A62, A61 defined above

A64=-8564.32 (Example), from =A54*E3*E6\*A63 (Latent Cooling Load Watts)

- Terms:
  - A54 = h_120/3600 (Vent Rate m3/s)
  - E3 = 1.204 (Air Mass kg/m3)
  - E6 = 2,501,000 (Latent Heat J/kg)
  - A63 defined above

A55=-14,399.24 (Example), from =H26*E3*E4\*(A49-H27) (Sensible Cooling Load Watts)

- Terms:
  - H26 = h_120/3600 (Vent Rate m3/s)
  - E3 = 1.204 (Air Mass kg/m3)
  - E4 = 1005 (Specific Heat J/kgK)
  - A49 = A3 (Avg Overnight Temp = 20.43)
  - H27 = TsetCool (h_24 or l_24 override, typically 24)

A6=159% (Example), from =1+A64/A55 (Latent Load Factor)

- Terms: A64, A55 defined above.
- **Note:** This corresponds to `i_122` in the application.

---

## 5. TODOs / Future Considerations

- **`m_124` (Cooling Days) Calculation Discrepancy:**
  - **Issue:** The value calculated for `m_124` does not match expected values (e.g., -31, -78, -9, 3) based on Excel, despite the core formula appearing correct in logs. Last calculated unclamped value was -212.09 for "Volume Schedule" which should be -31.
  - **Diagnosis:** Inputs (`m_129` Mitigated Load or `h_124` Free Cooling) must differ from Excel intermediate values.
  - **Action:** Defer calculation (set to "TBD"). Requires detailed step-by-step comparison of JS `h_124` and `m_129` calculations (including `calculateFreeCoolingLimit`, `calculateCoolingVentilation`, `calculateMitigatedCED`, and their inputs like `d_129`) against Excel (`COOLING-TARGET.csv`) to find the discrepancy. Remove the temporary `Math.max(0, ...)` clamp in `calculateDaysActiveCooling` when resolved.
- **Full Calculation Verification:** Perform full verification of all Section 13 calculations against `FORMULAE-3037.csv` and `COOLING-TARGET.csv`.
- **Edge Case Testing:** Verify calculations across a wider range of inputs and ventilation methods.
- **Input Source Verification:** Double-check inputs coming from other sections (e.g., `k71`, `k79`, `k98` affecting `d_129` in S14).
- **Dynamic Inputs:** Implement dynamic fetching for values currently hardcoded or using defaults (e.g., `nightTimeTemp`, `coolingSeasonMeanRH` from weather data; `projectElevation` `l_22`).
- **Code Performance:** Monitor for performance bottlenecks.
- **Refactoring Opportunities:** Consider further simplification of `coolingState` or alignment with global utilities.
- **Overheat Warning Feature:** Implement if desired.
- **Unmet Hours Analysis Feature:** Implement if desired.
