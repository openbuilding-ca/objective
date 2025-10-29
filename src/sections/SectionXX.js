/**
 * 4012-SectionXX.js
 * [SECTION NAME] (Section XX) module for TEUI Calculator 4.012 - DUAL-STATE ARCHITECTURE TEMPLATE
 *
 * 🏆 TEMPLATE FOR DUAL-STATE SECTION MODULES (Pattern A Architecture)
 *
 * This template demonstrates the MANDATORY dual-state architecture patterns based on:
 * - Section04 (Excel-compliant refactor success story)
 * - 4012-CHEATSHEET.md (comprehensive compliance guide)
 * - Pattern A self-contained state objects
 *
 * ✅ FEATURES INCLUDED:
 * - TargetState and ReferenceState objects with localStorage persistence
 * - ModeManager facade for dual-state coordination
 * - Header controls with mode toggle and reset button
 * - Dual-engine calculations (calculateTargetModel/calculateReferenceModel)
 * - Mode-aware event handling and DOM updates
 * - Comprehensive QA/QC compliance patterns
 * - Excel formula preservation patterns
 * - Anti-pattern prevention measures
 *
 * 🚨 CRITICAL ARCHITECTURAL PRINCIPLES:
 * 1. **Dual-Engine Calculations**: calculateAll() MUST run both Target and Reference models in parallel
 * 2. **UI Toggle is Display-Only**: switchMode() MUST NOT trigger calculations - only changes display
 * 3. **State Sovereignty**: Each section manages its own TargetState/ReferenceState independently
 * 4. **Reference Results Sharing**: Reference calculations MUST store results with ref_ prefix in StateManager
 * 5. **Mode-Aware DOM Updates**: Calculations MUST ONLY update DOM when their mode matches current UI mode
 *
 * 📋 MANDATORY QA/QC CHECKLIST PHASES:
 *
 * **Phase 1: Pattern B Contamination Scan**
 * - Scan for prefixes: grep -n "target_\|ref_" sections/4011-SectionXX.js
 * - Look for toxic patterns: getValue("target_d_20"), calculateAll() in switchMode()
 * - Fix: Use explicit state access, remove calculations from mode switching
 *
 * **Phase 2: "Current State" Anti-Pattern Elimination**
 * - Scan for ambiguous reads: grep -n "getFieldValue\|getGlobalNumericValue" sections/4011-SectionXX.js
 * - Ensure explicit state access: All calculations read from TargetState or ReferenceState
 *
 * **Phase 3: DOM Update & Function Preservation**
 * - Check DOM updates: Every calculateAll() MUST be followed by updateCalculatedDisplayValues()
 * - Verify working functions preserved: Compare with BACKUP file - NO calculation functions deleted
 *
 * **Phase 4: Excel Formula Preservation**
 * - Formula audit: Compare ALL calculation functions with BACKUP to ensure no changes
 * - NO formula "improvements": Resist urge to "optimize" regulatory-approved calculations
 *
 * **Phase 5: Default Values Anti-Pattern**
 * - Duplicate defaults audit: Scan for hardcoded defaults that duplicate field definitions
 * - Field definitions are SINGLE SOURCE OF TRUTH for all default values
 *
 * **Phase 6: Mode Display Isolation**
 * - NO fallback contamination: updateCalculatedDisplayValues() must NEVER use fallback patterns
 * - Strict mode isolation: Reference shows "0" if missing, NEVER Target values
 *
 * **Phase 7: Direct DOM Manipulation Detection**
 * - Scan for direct DOM handlers: grep -r "addEventListener.*change" sections/
 * - Verify StateManager listener pattern: Use proper event handling architecture
 *
 * **Phase 8: Systematic Downstream Contamination Audit**
 * - ALL sections consuming external data must read correct Target vs Reference values
 * - Reference calculations read ONLY ref_ values with no fallbacks to Target
 *
 * **Phase 9: refreshUI Mode Persistence Compliance**
 * - All user input fields must persist correctly across mode switches
 * - Handle ALL input types: sliders, dropdowns, contenteditable fields
 *
 * 🚨 AGENT FAILURE MODES TO AVOID:
 * - Throwing out working calculation functions from BACKUP files
 * - Changing Excel formulas (they are regulatory-approved)
 * - Adding calculateAll() to switchMode() (major anti-pattern)
 * - Not implementing updateCalculatedDisplayValues() for DOM updates
 * - Speed-reading instead of following patterns exactly
 *
 * 🎯 SUCCESS CRITERIA:
 * - User can change dropdowns and see calculated fields update immediately
 * - Both Target and Reference modes work without state contamination
 * - Perfect state isolation: Reference changes NEVER affect Target values
 * - Excel parity maintained for all calculations
 *
 * 🎨 CSS STYLING REQUIREMENTS:
 * - NO INLINE STYLING: All styling must use CSS classes from 4011-styles.css
 * - ELEGANT INPUT FORMATTING: Grey italic for defaults, blue bold for user inputs
 * - GHOSTING SUPPORT: Use disabled-input class for conditional field hiding
 * - USER-MODIFIED CLASSES: Proper user-modified, editing-intent class management
 * - BOOTSTRAP INTEGRATION: Use Bootstrap classes for controls (btn, badge, form-check)
 *
 * 👻 GHOSTING PATTERNS (Conditional CSS Formatting):
 * - setFieldGhosted(fieldId, shouldBeGhosted): Applies disabled-input class
 * - handleConditionalGhosting(selectedValue): Section-specific ghosting logic
 * - Based on Section07 water heating fuel selection patterns
 * - Based on Section13 heating/cooling system selection patterns
 *
 * ✨ ELEGANT INPUT FORMATTING (4011-styles.css Integration):
 * - Default values: Grey italic (.user-input:not(.user-modified))
 * - User inputs: Blue bold (.user-input.user-modified)
 * - Editing state: Blue underline (.user-input.editing-intent)
 * - Commit/revert: Proper class management based on content validation
 *
 * 🔢 GLOBAL NUMBER FORMATTING (StateManager Integration):
 * - USE GLOBAL: window.TEUI.formatNumber(value, formatType) from StateManager
 * - DO NOT create local formatting functions - use existing global system
 * - Available formats: "number-2dp-comma", "percent-0dp", "integer", "currency-2dp", etc.
 * - Example: window.TEUI.formatNumber(123.456, "number-2dp-comma") → "123.46"
 *
 * 🏛️ REFERENCE OVERRIDES SYSTEM (Master-Reference-Roadmap.md Integration):
 *
 * ✅ DYNAMIC REFERENCE STANDARDS: ReferenceState.setDefaults() integrates with ReferenceValues.js
 * - Reads current standard from d_13: window.TEUI.StateManager.getValue("d_13")
 * - Applies building code values: window.TEUI.ReferenceValues[standard]
 * - Foundation + Selective Overrides: Start with field definitions, override specific code values
 *
 * ✅ REFERENCE STANDARD CHANGE HANDLING: onReferenceStandardChange() function
 * - Listens to d_13 changes: StateManager.addListener("d_13", callback)
 * - Preserves user modifications while updating code minimums
 * - Only refreshes UI if currently in Reference mode
 *
 * ✅ MASTER REFERENCE TOGGLE INTEGRATION: Three setup modes supported
 * - Mirror Target: Copy all Target values to Reference (identical models)
 * - Mirror Target + Reference: Copy Target + apply ReferenceValues overlay (code compliance)
 * - Independent Models: Complete freedom (custom comparisons)
 *
 * 🎯 REFERENCE OVERRIDE EXAMPLES (from S11/S13 proven patterns):
 * ```javascript
 * // Performance values from building code
 * this.data.f_85 = referenceValues.f_85 || "5.30"; // RSI values
 * this.data.g_88 = referenceValues.g_88 || "1.990"; // U-values
 *
 * // System type overrides for Reference model
 * this.data.d_113 = "Electricity"; // Reference uses electric heating
 * this.data.d_116 = "No Cooling"; // Reference has no cooling
 * ```
 *
 * NEWLINES IN SUBHEADER CELLS:
 * To properly display newlines in subheader cells, follow these guidelines:
 * 1. Use the "\n" character in the content string where you want line breaks
 * 2. Add BOTH of these attributes to the cell:
 *    - Add the "section-subheader" class to the cell's classes array
 *    - Add the inline style "white-space: pre-line;" to ensure proper rendering
 *
 * Example:
 * ```javascript
 * h: {
 *     content: "Summer Shading\n%",
 *     classes: ["section-subheader", "align-center"],
 *     style: "white-space: pre-line;"
 * },
 * ```
 *
 * 📚 IMPLEMENTATION PATTERNS FROM EXISTING SECTIONS:
 *
 * ✅ FIELD DEFINITIONS: Single source of truth in sectionRows (like Section04)
 * ✅ STATE OBJECTS: TargetState/ReferenceState with localStorage (like Section04)
 * ✅ MODE MANAGER: Facade pattern for dual-state coordination (like Section04)
 * ✅ REFERENCE OVERRIDES: ReferenceValues.js integration with onReferenceStandardChange (like S11/S13)
 * ✅ GHOSTING: Use existing disabled-input CSS class (like Section07)
 * ✅ FORMATTING: Use global window.TEUI.formatNumber() (like all sections)
 * ✅ CSS CLASSES: Use existing classes from 4011-styles.css (no new styles)
 * ✅ EVENT HANDLING: Mode-aware with proper class management (like Section04)
 *
 * 📋 OPTIMAL FILE STRUCTURE (Based on S10/S11/S13 Complex Sections):
 * 1. Field Definitions (sectionRows) - Data foundation
 * 2. Accessor Methods (getFields, getLayout) - FieldManager integration
 * 3. State Objects (TargetState, ReferenceState) - Dual-state architecture
 * 4. ModeManager - Facade coordination with d_13 listener
 * 5. Helper Functions - Global dependencies and field utilities
 * 6. Calculation Functions - Dual-engine pattern
 * 7. UI Functions - Header controls and ghosting
 * 8. Event Handling - User input management
 * 9. Public API - Minimal interface exposure
 *
 * 🚫 DO NOT CREATE:
 * - New CSS classes or inline styles
 * - Local number formatting functions
 * - Custom elegant formatting functions
 * - New ghosting CSS classes
 * - Duplicate default values in state objects
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Create section-specific namespace for global references
window.TEUI.sectXX = window.TEUI.sectXX || {};
window.TEUI.sectXX.initialized = false;
window.TEUI.sectXX.userInteracted = false;

// Section XX: [SECTION NAME] Module
window.TEUI.SectionModules.sectXX = (function () {
  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  /**
   * IMPORTANT: The section layout must follow these rules:
   * 1. Unit subheader MUST be the first row in the array with id "SECTXX-ID" or "header"
   * 2. Field definitions should be embedded directly in the cell objects
   * 3. Each row must have a unique ID that matches its Excel row number or label
   * 4. Cells must align perfectly with Excel column positions A-N
   * 5. Empty cells still need empty objects {} as placeholders to maintain alignment
   */

  // Define rows with integrated field definitions
  const sectionRows = {
    // ALWAYS PUT UNIT SUBHEADER FIRST - this ensures it appears at the top of the section
    header: {
      id: "SECTXX-ID",
      rowId: "SECTXX-ID",
      label: "Units Header",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "D", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },

    // ROW XX: First content row
    xx: {
      id: "X.1", // Row ID from Excel (e.g., "T.1", "B.1", etc.)
      rowId: "X.1", // Should match the id for consistency
      label: "Row Label", // Label that appears in column C
      cells: {
        // Define each cell by its column letter (lowercase)
        // USE ALL LOWERCASE COLUMN LETTERS
        c: { label: "Row Label Text" }, // PREFERRED: Direct label approach for column C
        d: {
          // Example of a dropdown field
          fieldId: "d_xx", // Replace XX with row number from Excel
          type: "dropdown",
          dropdownId: "dd_d_xx",
          value: "Default Value",
          section: "sectionName", // Replace with correct section name
          options: [
            { value: "option1", name: "Option 1" },
            { value: "option2", name: "Option 2" },
          ],
          // For dynamic options based on another field:
          /*
                    dependencies: ["other_field_id"],
                    getOptions: function(parentValue) {
                        // Logic to return options based on parentValue
                        return [...];
                    }
                    */
        },
        e: {
          // Example of a calculated field
          fieldId: "e_xx",
          type: "calculated",
          value: "0",
          section: "sectionName",
          dependencies: ["d_xx"], // List fields this calculation depends on
        },
        f: { content: "F.1", classes: ["label-prefix"] }, // Label prefix in column F
        g: { content: "Label Text", classes: ["label-main"] }, // Main label in column G
        h: {
          // Example of a slider field
          fieldId: "h_xx",
          type: "percentage", // or "year_slider" or "coefficient"
          value: "50",
          min: 0,
          max: 100,
          step: 5,
          section: "sectionName",
        },
        // Continue for all columns...
        i: {}, // Empty cell example
        j: {}, // Leave empty objects for alignment even if cells are empty
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // ROW XX+1: Second content row
    xx1: {
      id: "X.2",
      rowId: "X.2",
      label: "Another Row",
      cells: {
        c: { label: "Another Row Label" }, // PREFERRED APPROACH for column C
        d: {
          // Example of an editable text field
          fieldId: "d_xx1",
          type: "editable",
          value: "User input",
          section: "sectionName",
        },
        // Define remaining cells...
        e: {},
        f: {},
        g: {},
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },

    // Add more rows as needed following the same pattern
  };

  //==========================================================================
  // ACCESSOR METHODS TO EXTRACT FIELDS AND LAYOUT
  //==========================================================================

  /**
   * Extract field definitions from the integrated layout
   * This method is required for compatibility with the FieldManager
   */
  function getFields() {
    const fields = {};

    // Extract field definitions from all rows except the header
    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header") return; // Skip the header row
      if (!row.cells) return;

      // Process each cell in the row
      Object.entries(row.cells).forEach(([colKey, cell]) => {
        if (cell.fieldId && cell.type) {
          // Create field definition with all relevant properties
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "sectionName", // Replace with actual section name
          };

          // Copy additional field properties if they exist
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
        }
      });
    });

    return fields;
  }

  /**
   * Extract dropdown options from the integrated layout
   * Required for backward compatibility
   */
  function getDropdownOptions() {
    const options = {};

    // Extract dropdown options from all cells with dropdownId
    Object.values(sectionRows).forEach((row) => {
      if (!row.cells) return;

      Object.values(row.cells).forEach((cell) => {
        if (cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options;
        }
      });
    });

    return options;
  }

  /**
   * Generate layout from integrated row definitions
   * This converts our compact definition to the format expected by the renderer
   */
  function getLayout() {
    // IMPORTANT: To ensure the header appears first, we process the rows in
    // a specific order: header first, then all other rows

    // Start with an empty array for rows
    const layoutRows = [];

    // First add the header row if it exists
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }

    // Then add all other rows in their original order, excluding the header
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") {
        layoutRows.push(createLayoutRow(row));
      }
    });

    return { rows: layoutRows };
  }

  /**
   * Helper function to convert a row definition to the layout format
   * This function handles the conversion of column C cells for proper row labels
   */
  function createLayoutRow(row) {
    // Create standard row structure
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A
        {}, // ID column B (auto-populated)
      ],
    };

    // Add cells C through N based on the row definition
    const columns = [
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
    ];

    // For each column, add the cell definition if it exists in the row
    columns.forEach((col) => {
      if (row.cells && row.cells[col]) {
        // Create a simplified cell definition for the renderer
        // without the extra field properties
        const cell = { ...row.cells[col] };

        // Special handling for column C to support both label patterns
        if (col === "c") {
          // If using content+type pattern, convert to label pattern
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type; // Not needed for rendering
            delete cell.content; // Not needed once we have label
          }
          // If neither label nor content exists, use row's label as fallback
          else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        // Special handling for column C - use row's label if available
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          // Otherwise add empty cell
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  //==========================================================================
  // PATTERN A DUAL-STATE ARCHITECTURE (Excel-Compliant)
  //==========================================================================

  /**
   * TargetState: Self-contained state object for Target model (user design values)
   * Based on Section04 proven pattern with localStorage persistence
   */
  const TargetState = {
    data: {},
    storageKey: "SXX_TARGET_STATE", // Replace XX with section number

    initialize: function () {
      this.setDefaults();
      this.loadState();
    },

    setDefaults: function () {
      // ✅ ANTI-PATTERN FIX: Field definitions are single source of truth - no hardcoded fallbacks
      this.data = {
        // ONLY user input fields - read defaults from field definitions
        // Example: d_xx: getFieldDefault("d_xx") || "default_value",
        // Add your section's user input fields here
      };
      console.log(
        "SXX: Target defaults set from field definitions - single source of truth",
      );
    },

    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const savedData = JSON.parse(saved);
          this.data = { ...this.data, ...savedData };
          console.log("SXX: Target state loaded from localStorage");
        }
      } catch (error) {
        console.warn("SXX: Error loading Target state:", error);
      }
    },

    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (error) {
        console.warn("SXX: Error saving Target state:", error);
      }
    },

    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    getValue: function (fieldId) {
      return this.data[fieldId] || "";
    },
  };

  /**
   * ReferenceState: Self-contained state object for Reference model (code minimums)
   * Based on Section04 proven pattern with localStorage persistence
   */
  const ReferenceState = {
    data: {},
    storageKey: "SXX_REFERENCE_STATE", // Replace XX with section number

    initialize: function () {
      this.setDefaults();
      this.loadState();
    },

    setDefaults: function () {
      // ✅ DYNAMIC LOADING: Get current reference standard from dropdown d_13
      const currentStandard =
        window.TEUI?.StateManager?.getValue?.("d_13") || "OBC SB10 5.5-6 Z6";
      const referenceValues =
        window.TEUI?.ReferenceValues?.[currentStandard] || {};

      // ✅ FOUNDATION: Initialize from field definitions (single source of truth)
      this.data = {
        // Start with field definition defaults
        // Example: d_xx: getFieldDefault("d_xx") || "default_value",
        // Add your section's user input fields here
      };

      // ✅ SELECTIVE REFERENCE OVERRIDES: Apply building code standards from ReferenceValues.js
      // Only override specific fields that should differ from Target for code compliance
      // Example patterns from S11/S13:
      // this.data.f_xx = referenceValues.f_xx || "code_minimum_value"; // Performance values
      // this.data.d_yy = "Reference_System_Type"; // System type overrides

      console.log(
        `SXX: Reference defaults loaded from standard: ${currentStandard}`,
      );
    },

    // ✅ MANDATORY: Include onReferenceStandardChange for d_13 changes (Master-Reference-Roadmap.md)
    onReferenceStandardChange: function () {
      console.log("SXX: Reference standard changed, reloading defaults");
      this.setDefaults();
      this.saveState();

      // Only refresh UI if currently in reference mode
      if (ModeManager.currentMode === "reference") {
        ModeManager.refreshUI();
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      }
    },

    loadState: function () {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const savedData = JSON.parse(saved);
          this.data = { ...this.data, ...savedData };
          console.log("SXX: Reference state loaded from localStorage");
        }
      } catch (error) {
        console.warn("SXX: Error loading Reference state:", error);
      }
    },

    saveState: function () {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      } catch (error) {
        console.warn("SXX: Error saving Reference state:", error);
      }
    },

    setValue: function (fieldId, value, source = "calculated") {
      this.data[fieldId] = value;
      if (source === "user" || source === "user-modified") {
        this.saveState();
      }
    },

    getValue: function (fieldId) {
      return this.data[fieldId] || "";
    },
  };

  /**
   * ModeManager: Pattern A facade for dual-state coordination
   * Based on Section04 proven pattern with mode switching and UI management
   */
  const ModeManager = {
    currentMode: "target",

    initialize: function () {
      console.log("SXX: Initializing Pattern A ModeManager");
      TargetState.initialize();
      ReferenceState.initialize();

      // ✅ REFERENCE OVERRIDES: Listen for reference standard changes (Master-Reference-Roadmap.md)
      if (window.TEUI?.StateManager?.addListener) {
        window.TEUI.StateManager.addListener("d_13", () => {
          ReferenceState.onReferenceStandardChange();
        });
      }
    },

    switchMode: function (mode) {
      if (mode !== "target" && mode !== "reference") {
        console.warn(`SXX: Invalid mode: ${mode}`);
        return;
      }
      this.currentMode = mode;
      console.log(`SXX: Switched to ${mode.toUpperCase()} mode`);

      // ✅ PATTERN A: UI toggle only switches display, values should already be calculated
      this.refreshUI();
      this.updateCalculatedDisplayValues();
    },

    getCurrentState: function () {
      return this.currentMode === "target" ? TargetState : ReferenceState;
    },

    getValue: function (fieldId) {
      return this.getCurrentState().getValue(fieldId);
    },

    setValue: function (fieldId, value, source = "calculated") {
      this.getCurrentState().setValue(fieldId, value, source);

      // ✅ CRITICAL BRIDGE: Sync Target changes to StateManager (NO PREFIX)
      if (this.currentMode === "target" && window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(fieldId, value, source);
      }

      // ✅ CRITICAL BRIDGE: Sync Reference changes to StateManager with ref_ prefix
      if (this.currentMode === "reference" && window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
      }
    },

    refreshUI: function () {
      console.log(
        `[SXX] Refreshing UI for ${this.currentMode.toUpperCase()} mode`,
      );

      const sectionElement = document.getElementById("sectionXX"); // Replace with actual section ID
      if (!sectionElement) return;

      const currentState = this.getCurrentState();

      // Update user-editable input fields from current state
      const editableFields = []; // Add your section's editable field IDs here

      editableFields.forEach((fieldId) => {
        const stateValue = currentState.getValue(fieldId);
        if (stateValue === undefined || stateValue === null) return;

        const element = sectionElement.querySelector(
          `[data-field-id="${fieldId}"]`,
        );
        if (!element) return;

        if (element.hasAttribute("contenteditable")) {
          element.textContent = stateValue;
        } else if (element.matches("select")) {
          element.value = stateValue;
        } else if (element.matches('input[type="range"]')) {
          element.value = stateValue;
          // Update slider display if present
          const display = element.nextElementSibling;
          if (display) {
            display.textContent = stateValue;
          }
        }
      });

      // ✅ ELEGANT FORMATTING: CSS classes handle visual states automatically
    },

    updateCalculatedDisplayValues: function () {
      if (!window.TEUI?.StateManager) return;

      console.log(
        `[SXX] 🔄 Updating calculated display values for ${this.currentMode} mode`,
      );

      // All calculated fields in this section
      const calculatedFields = [
        // Add your section's calculated field IDs here
        // Example: "f_xx", "g_xx", "h_xx"
      ];

      calculatedFields.forEach((fieldId) => {
        let valueToDisplay;

        if (this.currentMode === "reference") {
          // ✅ STRICT ISOLATION: Reference mode shows ONLY ref_ values
          valueToDisplay = window.TEUI.StateManager.getValue(`ref_${fieldId}`);
          if (valueToDisplay === null || valueToDisplay === undefined) {
            valueToDisplay = 0; // No fallback to Target values
          }
        } else {
          // Target mode: show regular values
          valueToDisplay = window.TEUI.StateManager.getValue(fieldId) || 0;
        }

        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (element && !element.hasAttribute("contenteditable")) {
          const numericValue = window.TEUI.parseNumeric(valueToDisplay);
          if (!isNaN(numericValue)) {
            const formattedValue = window.TEUI.formatNumber(
              numericValue,
              "number-2dp-comma",
            );
            element.textContent = formattedValue;
          }
        }
      });
    },
  };

  //==========================================================================
  // EXCEL-COMPLIANT HELPER FUNCTIONS
  //==========================================================================

  /**
   * Get external dependency from StateManager (mode-aware)
   */
  function getGlobalNumericValue(fieldId) {
    let rawValue;
    if (ModeManager.currentMode === "reference") {
      rawValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
    } else {
      rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    }
    return window.TEUI?.parseNumeric?.(rawValue, 0) ?? 0;
  }

  /**
   * Get external string dependency from StateManager (mode-aware)
   */
  function getGlobalStringValue(fieldId) {
    let rawValue;
    if (ModeManager.currentMode === "reference") {
      rawValue = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
    } else {
      rawValue = window.TEUI?.StateManager?.getValue(fieldId);
    }
    return rawValue ? rawValue.toString() : "";
  }

  /**
   * Set calculated value with proper dual-state routing
   * ✅ USES GLOBAL FORMATTING: Uses window.TEUI.formatNumber() from StateManager
   */
  function setFieldValue(fieldId, value, formatType = "number-2dp-comma") {
    const valueToStore =
      value !== null && value !== undefined ? String(value) : "0";

    // Store in current state
    const currentState =
      ModeManager.currentMode === "target" ? TargetState : ReferenceState;
    currentState.setValue(fieldId, valueToStore, "calculated");

    // Store in StateManager for cross-section communication
    if (ModeManager.currentMode === "target") {
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(fieldId, valueToStore, "calculated");
      }
    } else {
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          `ref_${fieldId}`,
          valueToStore,
          "calculated",
        );
      }
    }

    // ✅ GLOBAL FORMATTING: Update DOM using global formatNumber function
    // Only update DOM if we're in the correct mode to prevent cross-mode contamination
    const shouldUpdateDOM =
      ModeManager.currentMode === "target" ||
      ModeManager.currentMode === "reference";

    if (shouldUpdateDOM) {
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element && !element.hasAttribute("contenteditable")) {
        const numericValue = window.TEUI.parseNumeric(value);
        if (!isNaN(numericValue)) {
          // ✅ USE GLOBAL: window.TEUI.formatNumber() from StateManager
          const formattedValue = window.TEUI.formatNumber(
            numericValue,
            formatType,
          );
          element.textContent = formattedValue;
        }
      }
    }
  }

  /**
   * Get field default from sectionRows definitions (single source of truth)
   */
  function getFieldDefault(fieldId) {
    for (const row of Object.values(sectionRows)) {
      if (row.cells) {
        for (const cell of Object.values(row.cells)) {
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            return cell.value;
          }
        }
      }
    }
    return null;
  }

  //==========================================================================
  // DUAL-ENGINE CALCULATION FUNCTIONS
  //==========================================================================

  /**
   * Calculate Target model values
   * Reads from TargetState and external unprefixed values
   */
  function calculateTargetModel() {
    console.log("[SXX] Calculating Target model");

    // Temporarily switch to target mode for calculations
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "target";

    try {
      // Add your Target calculation logic here
      // Example:
      // const userInput = ModeManager.getValue("d_xx");
      // const externalValue = getGlobalNumericValue("d_20"); // Climate data
      // const result = userInput * externalValue;
      // setFieldValue("f_xx", result);
    } finally {
      ModeManager.currentMode = originalMode;
    }
  }

  /**
   * Calculate Reference model values
   * Reads from ReferenceState and external ref_ prefixed values
   */
  function calculateReferenceModel() {
    console.log("[SXX] Calculating Reference model");

    // Temporarily switch to reference mode for calculations
    const originalMode = ModeManager.currentMode;
    ModeManager.currentMode = "reference";

    try {
      // Add your Reference calculation logic here
      // Example:
      // const userInput = ModeManager.getValue("d_xx");
      // const externalValue = getGlobalNumericValue("d_20"); // Reads ref_d_20 automatically
      // const result = userInput * externalValue;
      // setFieldValue("f_xx", result);
    } finally {
      ModeManager.currentMode = originalMode;
    }
  }

  /**
   * Calculate all values for this section
   * ✅ CRITICAL: MUST run both engines in parallel
   */
  function calculateAll() {
    console.log("[SXX] Starting complete dual-engine calculations");

    // ✅ DUAL-ENGINE PATTERN: Always run both Target and Reference calculations
    calculateTargetModel();
    calculateReferenceModel();

    console.log("[SXX] ✅ Complete dual-engine calculations finished");
  }

  //==========================================================================
  // HEADER CONTROLS INJECTION (Based on Section04 Pattern)
  //==========================================================================

  /**
   * Inject Target/Reference toggle controls into section header
   * ✅ CSS-COMPLIANT: Uses only CSS classes from 4011-styles.css, no inline styling
   */
  function injectHeaderControls() {
    const sectionHeader = document.querySelector("#sectionXX .section-header"); // Replace with actual section ID
    if (
      !sectionHeader ||
      sectionHeader.querySelector(".local-controls-container")
    )
      return;

    // Create controls container with CSS class
    const controlsContainer = document.createElement("div");
    controlsContainer.className = "local-controls-container";

    // Reset button with CSS classes
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset";
    resetButton.className = "btn btn-sm btn-outline-secondary";
    resetButton.addEventListener("click", (event) => {
      event.stopPropagation();
      if (confirm("Reset all values to defaults?")) {
        TargetState.setDefaults();
        ReferenceState.setDefaults();
        ModeManager.refreshUI();
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      }
    });

    // State indicator with CSS classes
    const stateIndicator = document.createElement("div");
    stateIndicator.textContent = "TARGET";
    stateIndicator.className = "badge bg-primary";
    stateIndicator.setAttribute("data-mode", "target");

    // Toggle switch with CSS classes
    const toggleSwitch = document.createElement("div");
    toggleSwitch.className = "form-check form-switch";

    const toggleInput = document.createElement("input");
    toggleInput.className = "form-check-input";
    toggleInput.type = "checkbox";
    toggleInput.id = "modeToggle";

    const toggleLabel = document.createElement("label");
    toggleLabel.className = "form-check-label";
    toggleLabel.setAttribute("for", "modeToggle");
    toggleLabel.textContent = "Reference Mode";

    toggleSwitch.appendChild(toggleInput);
    toggleSwitch.appendChild(toggleLabel);

    toggleInput.addEventListener("change", (event) => {
      event.stopPropagation();
      const isReference = toggleInput.checked;
      if (isReference) {
        stateIndicator.textContent = "REFERENCE";
        stateIndicator.className = "badge bg-danger"; // Reference mode uses red
        stateIndicator.setAttribute("data-mode", "reference");
        ModeManager.switchMode("reference");
      } else {
        stateIndicator.textContent = "TARGET";
        stateIndicator.className = "badge bg-primary"; // Target mode uses blue
        stateIndicator.setAttribute("data-mode", "target");
        ModeManager.switchMode("target");
      }
    });

    controlsContainer.appendChild(resetButton);
    controlsContainer.appendChild(stateIndicator);
    controlsContainer.appendChild(toggleSwitch);
    sectionHeader.appendChild(controlsContainer);

    console.log("SXX: Header controls injected with CSS classes");
  }

  //==========================================================================
  // GHOSTING FUNCTIONALITY (Conditional CSS Formatting)
  //==========================================================================

  /**
   * Set field ghosting state using existing disabled-input CSS class from 4011-styles.css
   * ✅ EXACT COPY from Section07 proven pattern - no new CSS classes created
   */
  function setFieldGhosted(fieldId, shouldBeGhosted) {
    const valueCell = document.querySelector(`td[data-field-id="${fieldId}"]`);
    if (valueCell) {
      valueCell.classList.toggle("disabled-input", shouldBeGhosted);
      const input = valueCell.querySelector(
        'input, select, [contenteditable="true"]',
      );
      if (input) {
        if (input.hasAttribute("contenteditable"))
          input.contentEditable = !shouldBeGhosted;
        else input.disabled = shouldBeGhosted;
      }
      if (valueCell.hasAttribute("contenteditable"))
        valueCell.contentEditable = !shouldBeGhosted;
    }
  }

  /**
   * Example ghosting handler for dropdown changes
   * Replace with your section's specific logic
   */
  function handleConditionalGhosting(selectedValue) {
    // Example: Ghost certain fields based on dropdown selection
    // Replace with your section's specific ghosting logic

    // Example pattern from Section07:
    // const isUserDefined = selectedValue === "User Defined";
    // setFieldGhosted("field_id_1", !isUserDefined);
    // setFieldGhosted("field_id_2", !isUserDefined);

    // Example pattern from Section13:
    // const isHeatpump = selectedValue === "Heatpump";
    // const isGas = selectedValue === "Gas";
    // setFieldGhosted("gas_field", !isGas);
    // setFieldGhosted("heatpump_field", !isHeatpump);

    console.log(`[SXX] Conditional ghosting applied for: ${selectedValue}`);
  }

  //==========================================================================
  // ELEGANT INPUT FORMATTING (Uses existing CSS classes from 4011-styles.css)
  //==========================================================================

  /**
   * ✅ NO NEW FUNCTIONS NEEDED: Elegant input formatting is handled by existing CSS classes:
   *
   * FROM 4011-styles.css (lines 1985-2011):
   * - .user-input:not(.user-modified) → Grey italic for defaults
   * - .user-input.user-modified → Blue bold for user inputs
   * - .user-input.editing-intent → Blue underline while editing
   *
   * The event handlers below automatically apply these classes based on user interaction.
   * No custom formatting functions needed - CSS handles all visual states.
   */

  //==========================================================================
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================

  /**
   * Initialize all event handlers for this section
   * ✅ PATTERN A: Mode-aware event handling with proper state isolation
   */
  function initializeEventHandlers() {
    const sectionElement = document.getElementById("sectionXX"); // Replace with actual section ID
    if (!sectionElement) return;

    // ✅ CRITICAL: Set up editable field handlers (from Section04 pattern)
    const editableFields = sectionElement.querySelectorAll(
      ".editable.user-input",
    );
    editableFields.forEach((field) => {
      if (!field.hasEditableListeners) {
        field.setAttribute("contenteditable", "true");

        // Add focus styling and original value tracking
        field.addEventListener("focus", function () {
          this.classList.add("editing");
          this.dataset.originalValue = this.textContent.trim();
        });

        field.addEventListener("blur", function () {
          this.classList.remove("editing", "editing-intent");
          const fieldId = this.getAttribute("data-field-id");
          if (!fieldId) return;

          let newValue = this.textContent.trim();
          newValue = newValue.replace(/,/g, ""); // Clean commas

          // Only update if value has changed
          if (this.dataset.originalValue !== newValue) {
            console.log(
              `[SXX] User modified ${fieldId}: ${this.dataset.originalValue} → ${newValue}`,
            );

            // Parse and validate
            const numericValue = window.TEUI.parseNumeric(newValue, NaN);
            if (!isNaN(numericValue)) {
              // Format and store
              const formattedValue = window.TEUI.formatNumber(
                numericValue,
                "number-2dp-comma",
              );
              this.textContent = formattedValue;

              // ✅ ELEGANT FORMATTING: Mark as user-modified for blue styling
              this.classList.add("user-modified");

              // ✅ CRITICAL: Use ModeManager for dual-state aware storage
              ModeManager.setValue(
                fieldId,
                numericValue.toString(),
                "user-modified",
              );

              // ✅ CRITICAL: Recalculate and update display
              calculateAll();
              ModeManager.updateCalculatedDisplayValues();
            } else {
              // Revert to previous value
              const previousValue = ModeManager.getValue(fieldId) || "0";
              const prevNumericValue = window.TEUI.parseNumeric(
                previousValue,
                0,
              );
              this.textContent = window.TEUI.formatNumber(
                prevNumericValue,
                "number-2dp-comma",
              );

              // ✅ ELEGANT FORMATTING: Remove user-modified for default grey styling
              this.classList.remove("user-modified");
            }
          } else {
            // No change made - update formatting based on content
            const defaultValue = getFieldDefault(fieldId);
            const hasUserContent = newValue && newValue !== defaultValue;
            this.classList.toggle("user-modified", hasUserContent);
          }
        });

        // ✅ CRITICAL FIX: Prevent Enter key from creating newlines
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault(); // Prevent adding a newline
            this.blur(); // Remove focus to trigger the blur event
          }
        });

        field.hasEditableListeners = true;
      }
    });

    // ✅ CRITICAL: Set up dropdown handlers
    const dropdowns = sectionElement.querySelectorAll("select[data-field-id]");
    dropdowns.forEach((dropdown) => {
      if (!dropdown.hasDropdownListeners) {
        dropdown.addEventListener("change", function (e) {
          const fieldId = this.getAttribute("data-field-id");
          if (!fieldId) return;

          console.log(`[SXX] Dropdown changed ${fieldId}: ${this.value}`);

          // ✅ ELEGANT FORMATTING: Mark dropdown as user-modified
          this.classList.add("user-modified");

          // ✅ CRITICAL: Use ModeManager for dual-state aware storage
          ModeManager.setValue(fieldId, this.value, "user-modified");

          // ✅ GHOSTING: Apply conditional formatting based on selection
          handleConditionalGhosting(this.value);

          // ✅ CRITICAL: Recalculate and update display
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        });

        dropdown.hasDropdownListeners = true;
      }
    });

    // ✅ CRITICAL: Set up slider handlers
    const sliders = sectionElement.querySelectorAll(
      'input[type="range"][data-field-id]',
    );
    sliders.forEach((slider) => {
      if (!slider.hasSliderListeners) {
        slider.addEventListener("input", function (e) {
          const fieldId = this.getAttribute("data-field-id");
          if (!fieldId) return;

          console.log(`[SXX] Slider changed ${fieldId}: ${this.value}`);

          // Update display if present
          const display = this.nextElementSibling;
          if (display) {
            display.textContent = this.value;
          }

          // ✅ CRITICAL: Use ModeManager for dual-state aware storage
          ModeManager.setValue(fieldId, this.value, "user-modified");

          // ✅ CRITICAL: Recalculate and update display
          calculateAll();
          ModeManager.updateCalculatedDisplayValues();
        });

        slider.hasSliderListeners = true;
      }
    });

    // ✅ COMPLETE DUAL-ENGINE DEPENDENCY PAIRS: 100% State Isolation Support (S14/S15 Pattern)
    if (window.TEUI?.StateManager?.addListener) {
      const calculateAndRefresh = () => {
        calculateAll();
        ModeManager.updateCalculatedDisplayValues();
      };

      // ✅ CRITICAL: Target/Reference listener pairs for "Independent Models" capability
      // Every dependency has Target/Reference pair - ordered alphabetically for maintenance
      // Based on S14 proven pattern (lines 1358-1404) and S15 pattern (lines 2139-2268)
      const dependencies = [
        // Building Geometry (Independent Models: different building sizes)
        "h_15",
        "ref_h_15", // Conditioned area

        // Climate Data (Independent Models: different locations/climates)
        "d_20",
        "ref_d_20", // Heating degree days
        "d_21",
        "ref_d_21", // Cooling degree days

        // Location Data (Independent Models: different provinces/years)
        "d_19",
        "ref_d_19", // Province (affects emission factors)
        "h_12",
        "ref_h_12", // Reporting year (affects emission factors)

        // Cross-Section Dependencies (Independent Models: different performance)
        // Add your section's specific external dependencies here as pairs:
        // "field_id", "ref_field_id",   // Description of dependency

        // Example patterns from S14/S15:
        // "k_71", "ref_k_71",     // S09 Internal gains
        // "i_80", "ref_i_80",     // S10 Utilization factors
        // "i_98", "ref_i_98",     // S11 Envelope losses
        // "m_121", "ref_m_121",   // S13 Ventilation loads
      ];

      // Remove duplicates and add listeners for all dependencies
      const uniqueDependencies = [...new Set(dependencies)];
      uniqueDependencies.forEach((fieldId) => {
        window.TEUI.StateManager.addListener(fieldId, calculateAndRefresh);
      });

      console.log(
        `[SXX] Added ${uniqueDependencies.length} dual-engine dependency listeners`,
      );
    }

    console.log(
      "SXX: Event handlers initialized with proper dual-state handling",
    );
  }

  /**
   * Called when the section is rendered
   * This is a good place to initialize values and run initial calculations
   * ✅ PATTERN A: Complete dual-state initialization
   */
  function onSectionRendered() {
    console.log(
      "SXX: Section rendered - initializing Pattern A dual-state module",
    );

    // ✅ CRITICAL: Initialize dual-state architecture first
    ModeManager.initialize();

    // ✅ ADD: Header controls for mode switching
    injectHeaderControls();

    // ✅ ELEGANT FORMATTING: Handled automatically by CSS classes and event handlers

    // Initialize event handlers
    initializeEventHandlers();

    // ✅ CRITICAL: Run initial calculations for both engines
    calculateAll();

    // ✅ CRITICAL: Update DOM with calculated values
    ModeManager.updateCalculatedDisplayValues();

    // ✅ CRITICAL: Refresh UI to show current mode values
    ModeManager.refreshUI();

    // ✅ ELEGANT FORMATTING: CSS classes handle visual states automatically

    console.log("SXX: Pattern A dual-state initialization complete");
  }

  // Expose ModeManager globally for cross-section integration
  window.TEUI.sectXX = window.TEUI.sectXX || {};
  window.TEUI.sectXX.ModeManager = ModeManager;

  //==========================================================================
  // PUBLIC API (MINIMAL INTERFACE)
  //==========================================================================

  return {
    // Standard section interface - REQUIRED
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Initialization - REQUIRED
    onSectionRendered: onSectionRendered,
    initializeEventHandlers: initializeEventHandlers,

    // Calculations - REQUIRED
    calculateAll: calculateAll,

    // Dual-state management - REQUIRED
    ModeManager: ModeManager,

    // Individual calculation engines - OPTIONAL (for debugging)
    calculateTargetModel: calculateTargetModel,
    calculateReferenceModel: calculateReferenceModel,

    // Helper functions - OPTIONAL (for cross-section use)
    getGlobalNumericValue: getGlobalNumericValue,
    getGlobalStringValue: getGlobalStringValue,
    setFieldValue: setFieldValue,
    getFieldDefault: getFieldDefault,

    // Ghosting functions - OPTIONAL (for advanced sections)
    setFieldGhosted: setFieldGhosted,
    handleConditionalGhosting: handleConditionalGhosting,
  };
})();
