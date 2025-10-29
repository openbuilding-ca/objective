/**
 * 4011-StateManager.js
 *
 * State management module for TEUI Calculator 4.011
 * Handles the state of all calculator values with support for dependencies and efficient recalculation
 *
 * Refactored to use DOM-based field IDs (e.g. 'd-12' for cell D12).
 */

// Define the global namespace if it doesn't exist
window.TEUI = window.TEUI || {};

// State Manager Module
TEUI.StateManager = (function () {
  /**
   * Global utility to format numbers based on specified types.
   * Handles various decimal places, percentages, commas, specific types like U-Value/RSI, and raw output.
   * @param {string|number|null|undefined} value - The value to format.
   * @param {string} [formatType='number-2dp'] - The format rule (e.g., 'number-2dp', 'number-3dp', 'number-2dp-comma', 'percent-0dp', 'percent-1dp', 'percent-2dp', 'integer', 'integer-nocomma', 'currency-2dp', 'currency-3dp', 'u-value', 'rsi', 'raw').
   * @returns {string} The formatted string.
   */
  window.TEUI.formatNumber = function (value, formatType = "number-2dp") {
    // Handle N/A or null/undefined input first
    if (
      value === null ||
      value === undefined ||
      String(value).trim().toUpperCase() === "N/A"
    ) {
      return "N/A";
    }
    // Handle raw format type
    if (formatType === "raw") {
      return String(value);
    }

    // Use global parseNumeric to get a clean number or NaN
    const numValue = window.TEUI.parseNumeric(value, NaN);

    // Handle non-numeric values after parsing
    if (isNaN(numValue)) {
      // Return original string if it wasn't parseable but wasn't explicitly N/A
      if (typeof value === "string" && value.trim() !== "") return value;
      // Otherwise return a default based on expected format
      if (formatType.startsWith("percent")) return "0%";
      if (formatType.startsWith("currency")) return "$0.00"; // Basic currency default
      return "0.00"; // Default numeric format
    }

    try {
      // Handle Aliases
      if (formatType === "u-value") formatType = "number-3dp";
      if (formatType === "rsi") formatType = "number-2dp";

      // Handle Integer types first
      if (formatType === "integer") {
        return numValue.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          useGrouping: true,
        }); // With commas
      }
      if (formatType === "integer-nocomma") {
        return numValue.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          useGrouping: false,
        }); // No commas
      }

      // Parsing complex format types
      const formatParts = formatType.split("-");
      let type = formatParts[0]; // 'number', 'percent', 'cad'
      const dpPart = formatParts[1] || ""; // e.g., '0dp', '2dp', '3dp', '4dp'
      const useCommas = formatParts.includes("comma");

      let decimals = 2; // Default decimal places
      if (dpPart) {
        const match = dpPart.match(/(\d+)d/);
        if (match) decimals = parseInt(match[1], 10);
      }

      // Percentage Formatting
      if (type === "percent") {
        // OBC Matrix compatibility: basic "percent" defaults to 0dp
        const percentDecimals = dpPart ? decimals : 0;
        return numValue.toLocaleString(undefined, {
          style: "percent",
          minimumFractionDigits: percentDecimals,
          maximumFractionDigits: percentDecimals,
        });
      }
      // CAD Currency Formatting (using toFixed)
      else if (type === "cad") {
        if (isNaN(decimals) || decimals < 0) decimals = 2; // Safety check
        const fixedString = numValue.toFixed(decimals);
        // Basic comma insertion - might need refinement for edge cases
        let finalString = fixedString;
        if (useCommas) {
          const parts = fixedString.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
          finalString = parts.join(".");
        }
        return "$" + finalString;
      }
      // Number Formatting (Default)
      else {
        // OBC Matrix compatibility: default to no commas unless explicitly requested
        const shouldUseCommas = formatParts.includes("comma");
        return numValue.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          useGrouping: shouldUseCommas,
        });
      }
    } catch (e) {
      console.error(
        `Error formatting value ${value} with format ${formatType}:`,
        e,
      );
      return String(value); // Fallback to string representation on error
    }
  };

  /**
   * Global utility to safely parse numeric values from strings.
   * Handles commas and returns a default value if parsing fails.
   * Moved here from init.js to ensure availability before section modules load.
   * @param {string|number|null|undefined} value - The value to parse.
   * @param {number} [defaultValue=0] - The value to return if parsing fails.
   * @returns {number} The parsed number or the default value.
   */
  window.TEUI.parseNumeric = function (value, defaultValue = 0) {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    let numericValue;
    if (typeof value === "string") {
      // Remove currency symbols, commas, and trim whitespace
      const cleanedValue = value
        .replace(/[$£€¥]/g, "")
        .replace(/,/g, "")
        .trim();
      if (cleanedValue === "" || cleanedValue.toUpperCase() === "N/A") {
        return defaultValue;
      }
      numericValue = parseFloat(cleanedValue);
    } else if (typeof value === "number") {
      numericValue = value;
    } else {
      numericValue = NaN; // Handle other types if needed
    }
    // Return defaultValue if parsing resulted in NaN
    return isNaN(numericValue) ? defaultValue : numericValue;
  };

  // Value state constants
  const VALUE_STATES = {
    DEFAULT: "default", // Original default value
    IMPORTED: "imported", // Value imported from saved data
    USER_MODIFIED: "user-modified", // Value changed by user
    OVER_RIDDEN: "over-ridden", // Value overridden by ReferenceValues overlay (when d_13 changes)
    CALCULATED: "calculated", // Value calculated by the system
    DERIVED: "derived", // Value derived from another field
  };

  // Private properties
  let fields = new Map(); // Map of all field values
  let dependencies = new Map(); // Map of field dependencies
  let calculatedFields = new Set(); // Set of fields that are calculated
  let dirtyFields = new Set(); // Fields needing recalculation
  let listeners = new Map(); // Field change listeners
  let listenersActive = true; // Flag to mute listeners during import quarantine
  let activeReferenceDataSet = {};
  let independentReferenceState = {}; // << NEW: For independently editable Reference fields (like h_12)
  let isApplicationStateMuted = false; // << NEW: Flag for muting application state updates
  let lastImportedState = {}; // << NEW: To store the last imported state

  /**
   * Initialize the state manager
   */
  function initialize() {
    // CRITICAL FIX: Don't clear on initialization - preserve existing state for cross-system navigation
    // Only clear internal maps, not localStorage
    fields.clear();
    dependencies.clear();
    calculatedFields.clear();
    dirtyFields.clear();
    listeners.clear();

    // Load any existing state from localStorage FIRST (before registering defaults)
    loadState();

    // Initialize with default values from FieldManager (only if not already loaded)
    if (window.TEUI.fields) {
      initializeFromFieldManager();
    }

    registerTEUIFields();
    registerTEDITELIFields();
    registerVolumeMetricsFields();

    // Add listeners for TEUI source fields
    addListener("f_32", () => updateTEUICalculations("f_32"));
    addListener("j_32", () => updateTEUICalculations("j_32"));
    addListener("h_15", () => updateTEUICalculations("h_15"));

    // Initial calculation
    updateTEUICalculations("init");
  }

  /**
   * Initialize state with values from FieldManager
   */
  function initializeFromFieldManager() {
    const allFields = window.TEUI.fields;
    if (!allFields) return;

    Object.entries(allFields).forEach(([fieldId, field]) => {
      // Skip fields without default values
      if (field.defaultValue === undefined) return;

      // CRITICAL FIX: Only set default if field doesn't already exist (preserves loaded state)
      if (!fields.has(fieldId)) {
        setValue(fieldId, field.defaultValue, VALUE_STATES.DEFAULT);
      }

      // Register dependencies if any
      if (field.dependencies && Array.isArray(field.dependencies)) {
        field.dependencies.forEach((dependencyId) => {
          registerDependency(dependencyId, fieldId);
        });
      }
    });
  }

  /**
   * Clear all state data
   */
  function clear() {
    fields.clear();
    dependencies.clear();
    calculatedFields.clear();
    dirtyFields.clear();
    listeners.clear();

    // Also clear localStorage
    try {
      localStorage.removeItem("TEUI_Calculator_State");
      console.log("TEUI StateManager: Cleared state from localStorage");

      // ✅ NEW: Explicitly clear all dual-state section storage keys
      const dualStateKeys = [
        "S02_TARGET_STATE",
        "S02_REFERENCE_STATE",
        "S03_TARGET_STATE",
        "S03_REFERENCE_STATE",
        "S04_TARGET_STATE",
        "S04_REFERENCE_STATE",
        "S05_TARGET_STATE",
        "S05_REFERENCE_STATE",
        "S06_TARGET_STATE",
        "S06_REFERENCE_STATE",
        "S07_TARGET_STATE",
        "S07_REFERENCE_STATE",
        "S08_TARGET_STATE",
        "S08_REFERENCE_STATE",
        "S09_TARGET_STATE",
        "S09_REFERENCE_STATE",
        "S10_TARGET_STATE",
        "S10_REFERENCE_STATE",
        "S11_TARGET_STATE",
        "S11_REFERENCE_STATE",
        "S12_TARGET_STATE",
        "S12_REFERENCE_STATE",
        "S13_TARGET_STATE",
        "S13_REFERENCE_STATE",
        "S14_TARGET_STATE",
        "S14_REFERENCE_STATE",
        "S15_TARGET_STATE",
        "S15_REFERENCE_STATE",
      ];

      dualStateKeys.forEach((key) => {
        localStorage.removeItem(key);
        console.log(`Global Reset: Cleared ${key}`);
      });
      console.log("Global Reset: All dual-state localStorage cleared.");
    } catch (e) {
      console.error("TEUI StateManager: Failed to clear localStorage:", e);
    }
  }

  /**
   * Get a field value
   * @param {string} fieldId - Field ID (DOM-based, e.g. 'd-12')
   * @returns {any} The field value or null if not found
   */
  function getValue(fieldId) {
    if (
      window.TEUI &&
      TEUI.ReferenceToggle &&
      TEUI.ReferenceToggle.isReferenceMode()
    ) {
      // In Reference Mode, check independently editable fields first
      if (
        Object.prototype.hasOwnProperty.call(independentReferenceState, fieldId)
      ) {
        return independentReferenceState[fieldId];
      }

      // Then check activeReferenceDataSet
      // Fallback to application default if somehow not in activeReferenceDataSet (should be rare)
      return Object.prototype.hasOwnProperty.call(
        activeReferenceDataSet,
        fieldId,
      )
        ? activeReferenceDataSet[fieldId]
        : fields.has(fieldId)
          ? fields.get(fieldId).value
          : null; // Last resort fallback
    } else {
      // Existing logic for Application Mode
      return fields.has(fieldId) ? fields.get(fieldId).value : null;
    }
  }

  /**
   * Set a field value
   * @param {string} fieldId - Field ID (DOM-based, e.g. 'd-12')
   * @param {any} value - New value
   * @param {string} state - Value state (default, user-modified, calculated, etc.)
   * @returns {boolean} True if the value changed
   */
  function setValue(fieldId, value, state = VALUE_STATES.USER_MODIFIED) {
    // 🎯 SMART USER INTERACTION TIMING: Auto-detect user changes and start performance timing
    if (
      state === VALUE_STATES.USER_MODIFIED &&
      window.TEUI?.Clock?.markUserInteractionStart
    ) {
      window.TEUI.Clock.markUserInteractionStart();
    }

    // 🔍 RACE CONDITION DEBUG: Track all h_10 setValue calls (COMMENTED OUT - too verbose)
    // if (fieldId === "h_10") {
    //   console.log(
    //     `[StateManager] 🎯 h_10 setValue: "${value}" (state: ${state})`,
    //   );
    //   console.trace("[StateManager] h_10 setValue stack trace:");
    // }

    // 🔍 DEBUG: Track ref_h_15 to catch who overwrites imported value
    if (fieldId === "ref_h_15") {
      console.log(
        `[StateManager DEBUG] ref_h_15 setValue: "${value}" (state: ${state}, prev: ${fields.get(fieldId)?.value})`,
      );
      console.trace("[StateManager] ref_h_15 setValue stack trace:");
    }

    // Check if we're in Reference Mode and this is an independently editable field
    if (
      window.TEUI &&
      TEUI.ReferenceToggle &&
      TEUI.ReferenceToggle.isReferenceMode() &&
      state === VALUE_STATES.USER_MODIFIED
    ) {
      // Check if this field is independently editable in Reference Mode
      if (window.TEUI?.AppendixE?.getFieldBehavior) {
        const currentStandard = getValue("d_13") || "OBC SB10 5.5-6 Z6";
        const behavior = window.TEUI.AppendixE.getFieldBehavior(
          fieldId,
          currentStandard,
        );
        if (behavior === "Independently User-Editable in Reference Mode") {
          // Store in separate reference state and update activeReferenceDataSet
          const oldValue = independentReferenceState[fieldId] || null;
          independentReferenceState[fieldId] = value;
          activeReferenceDataSet[fieldId] = value; // Keep in sync

          notifyListeners(fieldId, value, oldValue, "reference-user-modified");
          return true;
        }
      }
    }

    // << NEW: Check if application state updates are muted >>
    if (
      isApplicationStateMuted &&
      state !== VALUE_STATES.CALCULATED &&
      state !== VALUE_STATES.DERIVED
    ) {
      return false; // Prevent update to this.fields (application state)
    }

    // << NEW: Store value if it's from an import >>
    if (state === VALUE_STATES.IMPORTED) {
      lastImportedState[fieldId] = value;
    }

    const _fieldDefinition = fields[fieldId]; // This line was in the original, but seems unused. Let's keep it for now to minimize changes from the original revert point.

    const oldValue = getValue(fieldId); // Use mode-aware getValue for oldValue as original did.

    // If field doesn't exist, create it
    if (!fields.has(fieldId)) {
      fields.set(fieldId, {
        id: fieldId,
        value: value,
        state: state,
      });

      notifyListeners(fieldId, value, null, state);
      return true;
    }

    // Update the existing field
    const field = fields.get(fieldId);

    if (field.value === value && field.state === state) {
      return false;
    }

    field.value = value;
    field.state = state;

    if (state !== VALUE_STATES.CALCULATED && state !== VALUE_STATES.DERIVED) {
      markDependentsDirty(fieldId);
    }

    notifyListeners(fieldId, value, oldValue, state);

    // Auto-save state for user-modified and imported values (not defaults)
    if (
      state === VALUE_STATES.USER_MODIFIED ||
      state === VALUE_STATES.IMPORTED
    ) {
      // Debounce saves to avoid excessive localStorage writes
      clearTimeout(window.teuiAutoSaveTimeout);
      window.teuiAutoSaveTimeout = setTimeout(() => {
        saveState();
      }, 1000); // Save 1 second after last change
    }

    return true;
  }

  /**
   * Register a dependency between fields
   * @param {string} sourceId - Source field ID (DOM-based, e.g. 'd-12')
   * @param {string} targetId - Target (dependent) field ID (DOM-based, e.g. 'cf-d-22')
   */
  function registerDependency(sourceId, targetId) {
    // Ensure source is in the dependency map
    if (!dependencies.has(sourceId)) {
      dependencies.set(sourceId, new Set());
    }

    // Add target to source's dependencies
    dependencies.get(sourceId).add(targetId);

    // Add target to calculated fields set
    calculatedFields.add(targetId);
  }

  /**
   * Mark a field and its dependents as dirty
   * @param {string} fieldId - Field ID (DOM-based, e.g. 'd-12')
   * @param {Set} visited - Set of already visited fields (to prevent circular dependencies)
   */
  function markDependentsDirty(fieldId, visited = new Set()) {
    // Skip if already visited (prevent circular dependency infinite recursion)
    if (visited.has(fieldId)) {
      return;
    }

    // Add to visited set
    visited.add(fieldId);

    // Skip if no dependencies
    if (!dependencies.has(fieldId)) {
      return;
    }

    // Get dependent fields
    const dependents = dependencies.get(fieldId);

    // Mark each dependent as dirty and recurse
    dependents.forEach((dependentId) => {
      dirtyFields.add(dependentId);
      markDependentsDirty(dependentId, visited);
    });
  }

  /**
   * Get all dirty fields
   * @returns {Array} Array of dirty field IDs
   */
  function getDirtyFields() {
    return [...dirtyFields];
  }

  /**
   * Clear dirty status for specified fields
   * @param {Array} fieldIds - Array of field IDs to clear, or empty for all
   */
  function clearDirtyStatus(fieldIds = []) {
    if (fieldIds.length === 0) {
      dirtyFields.clear();
    } else {
      fieldIds.forEach((id) => dirtyFields.delete(id));
    }
  }

  /**
   * Add a listener for a field
   * @param {string} fieldId - Field ID (DOM-based, e.g. 'd-12')
   * @param {Function} callback - Callback function(newValue, oldValue, fieldId, state)
   */
  function addListener(fieldId, callback) {
    if (!listeners.has(fieldId)) {
      listeners.set(fieldId, new Set());
    }

    listeners.get(fieldId).add(callback);
  }

  /**
   * Remove a listener from a field
   * @param {string} fieldId - Field ID (DOM-based, e.g. 'd-12')
   * @param {Function} callback - Callback function to remove
   */
  function removeListener(fieldId, callback) {
    if (!listeners.has(fieldId)) {
      return;
    }

    listeners.get(fieldId).delete(callback);
  }

  /**
   * Notify all listeners for a field
   * @param {string} fieldId - Field ID (DOM-based, e.g. 'd-12')
   * @param {any} newValue - New value
   * @param {any} oldValue - Old value
   * @param {string} state - Value state
   */
  function notifyListeners(fieldId, newValue, oldValue, state) {
    // Check if listeners are muted (import quarantine)
    if (!listenersActive) {
      console.log(
        `[StateManager] Skipped listener for ${fieldId} (quarantine active)`,
      );
      return;
    }

    // Original loop for other fieldIds
    if (!listeners.has(fieldId)) {
      return;
    }
    listeners.get(fieldId).forEach((callback) => {
      try {
        callback(newValue, oldValue, fieldId, state);
      } catch (error) {
        console.error(`Error in listener for ${fieldId}:`, error);
      }
    });
  }

  /**
   * Save the current state to localStorage
   */
  function saveState() {
    // Create a serializable state object
    const state = {};

    // Only save user-modified fields to keep the state small
    fields.forEach((field, fieldId) => {
      if (
        field.state === VALUE_STATES.USER_MODIFIED ||
        field.state === VALUE_STATES.IMPORTED
      ) {
        state[fieldId] = {
          value: field.value,
          state: field.state,
        };
      }
    });

    // Save to localStorage
    try {
      localStorage.setItem("TEUI_Calculator_State", JSON.stringify(state));
    } catch (error) {
      console.error("Error saving state to localStorage:", error);
    }
  }

  /**
   * Load state from localStorage
   */
  function loadState() {
    try {
      // Get state from localStorage
      const stateJson = localStorage.getItem("TEUI_Calculator_State");

      if (!stateJson) {
        return;
      }

      // Parse state
      const state = JSON.parse(stateJson);

      // Load each field
      Object.entries(state).forEach(([fieldId, field]) => {
        setValue(fieldId, field.value, field.state);
        // CRITICAL FIX: Update UI to display loaded values
        updateUI(fieldId, field.value);
      });
    } catch (error) {
      console.error("Error loading state from localStorage:", error);
    }
  }

  /**
   * Import state from a data object
   * @param {Object} data - Data object with field values
   */
  function importState(data) {
    // Import each field
    Object.entries(data).forEach(([fieldId, value]) => {
      setValue(fieldId, value, VALUE_STATES.IMPORTED);
    });
  }

  /**
   * Export the current state
   * @returns {Object} State object with field values
   */
  function exportState() {
    const state = {};

    // Export all fields
    fields.forEach((field, fieldId) => {
      state[fieldId] = field.value;
    });

    return state;
  }

  /**
   * Get calculation order for dirty fields
   * @returns {Array} Field IDs in calculation order
   */
  function getCalculationOrder() {
    const visited = new Set();
    const temp = new Set();
    const order = [];

    // Helper function for depth-first topological sort
    const visit = (fieldId) => {
      if (temp.has(fieldId)) {
        return;
      }

      if (!visited.has(fieldId)) {
        temp.add(fieldId);

        // Visit all dependents
        if (dependencies.has(fieldId)) {
          dependencies.get(fieldId).forEach((depId) => visit(depId));
        }

        temp.delete(fieldId);
        visited.add(fieldId);
        order.push(fieldId);
      }
    };

    // Start with dirty fields
    getDirtyFields().forEach((fieldId) => visit(fieldId));

    // Reverse to get correct calculation order
    return order.reverse();
  }

  /**
   * Update the UI with a field value
   * @param {string} fieldId - Field ID (DOM-based, e.g. 'd-12')
   * @param {any} value - Value to display
   */
  function updateUI(fieldId, value) {
    // Find the element by data-field-id attribute
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!element) return;

    // Different update based on field type
    if (element.tagName === "SELECT") {
      element.value = value;
    } else if (element.tagName === "INPUT") {
      element.value = value;
    } else {
      // For non-input elements, just set the text content
      element.textContent = value;
    }
  }

  /**
   * Get all keys currently in the state
   * @returns {Array} Array of all field IDs in the state
   */
  function getAllKeys() {
    return Array.from(fields.keys());
  }

  /**
   * Get state information for debugging
   * @param {string} fieldId - Optional field ID to get info for
   * @returns {Object} Debug information
   */
  function getDebugInfo(fieldId = null) {
    if (fieldId) {
      return fields.has(fieldId) ? fields.get(fieldId) : null;
    }

    return {
      fieldCount: fields.size,
      dependencyCount: dependencies.size,
      calculatedCount: calculatedFields.size,
      dirtyCount: dirtyFields.size,
      listenerCount: listeners.size,
    };
  }

  /**
   * Register critical energy fields used by TEUI calculations
   * This ensures that Section01 TEUI values can be calculated from Section04 data
   *
   * NOTE ON ORDERING: Fields are organized by dependency relationships, not row numbers.
   * Input fields must be registered before dependent calculated fields to ensure proper
   * initialization and dependency chain establishment.
   */
  function registerTEUIFields() {
    // =========================================================================
    // 1. REGISTER INPUT FIELDS FIRST (always register dependencies before dependents)
    // =========================================================================

    // Section02 Row 15 - Conditioned Area (input from Building Info section)
    if (!fields.has("h_15")) {
      setValue("h_15", "1427.20", VALUE_STATES.DEFAULT);
    }

    // Section04 Row 32 - Energy values (calculated in Energy section)
    if (!fields.has("f_32")) {
      setValue("f_32", "132938.00", VALUE_STATES.DEFAULT);
    }

    if (!fields.has("j_32")) {
      setValue("j_32", "132765.65", VALUE_STATES.DEFAULT);
    }

    // =========================================================================
    // 2. REGISTER OUTPUT/CALCULATED FIELDS SECOND
    // =========================================================================

    // Section01 Row 10 - TEUI values (calculated from the above inputs)
    if (!fields.has("h_10")) {
      setValue("h_10", "93.0", VALUE_STATES.CALCULATED);
    }

    if (!fields.has("k_10")) {
      setValue("k_10", "93.1", VALUE_STATES.CALCULATED);
    }

    // =========================================================================
    // 3. ESTABLISH FORMAL DEPENDENCY RELATIONSHIPS (for calculation chain)
    // =========================================================================

    // The order here explicitly defines the calculation flow for visualization
    registerDependency("h_15", "h_10"); // Area affects target TEUI
    registerDependency("j_32", "h_10"); // Target energy affects target TEUI

    registerDependency("h_15", "k_10"); // Area affects actual TEUI
    registerDependency("f_32", "k_10"); // Actual energy affects actual TEUI
  }

  /**
   * Register TEDI/TELI and TEUI Summary fields for integration
   * This ensures that Section14 and Section15 values are properly initialized
   */
  function registerTEDITELIFields() {
    // =========================================================================
    // 1. REGISTER KEY TEDI & TELI FIELDS (SECTION 14)
    // =========================================================================

    // Critical TEDI value that's used by Section 15
    if (!fields.has("h_126")) {
      setValue("h_126", "83.50", VALUE_STATES.CALCULATED);
    }

    // Critical TELI value also used by Section 15
    if (!fields.has("h_130")) {
      setValue("h_130", "81.33", VALUE_STATES.CALCULATED);
    }

    // =========================================================================
    // 2. REGISTER TEUI SUMMARY FIELDS (SECTION 15)
    // =========================================================================

    // Primary TEUI value in Section 15
    if (!fields.has("h_136")) {
      setValue("h_136", "93.0", VALUE_STATES.CALCULATED);
    }

    // Reduction percentage in Section 15
    if (!fields.has("d_144")) {
      setValue("d_144", "15.2", VALUE_STATES.CALCULATED);
    }

    // Cost metrics in Section 15
    if (!fields.has("d_141")) {
      setValue("d_141", "12.35", VALUE_STATES.CALCULATED);
    }

    if (!fields.has("h_141")) {
      setValue("h_141", "10.47", VALUE_STATES.CALCULATED);
    }

    // =========================================================================
    // 3. ESTABLISH CROSS-SECTION DEPENDENCY RELATIONSHIPS
    // =========================================================================

    // Section 15 key dependencies (additional ones registered in SectionIntegrator)
    registerDependency("h_126", "h_136"); // TEDI affects primary TEUI value
    registerDependency("h_10", "h_136"); // TEUI (Section 1) affects TEUI Summary
    registerDependency("k_10", "d_144"); // TEUI actual affects reduction percentage

    // TEUI Summary influences Section 1 (bidirectional relationship)
    registerDependency("h_136", "k_10"); // Summary TEUI affects main TEUI values

    // Building area influences all intensity values
    registerDependency("h_15", "d_144"); // Area affects reduction calculations
    registerDependency("h_15", "d_141"); // Area affects cost metrics
    registerDependency("h_15", "h_141"); // Area affects cost metrics
  }

  /**
   * Register Volume and Surface Metrics fields (Section 12)
   * This ensures proper integration with other sections
   */
  function registerVolumeMetricsFields() {
    // =========================================================================
    // 1. REGISTER KEY SURFACE AREA FIELDS
    // =========================================================================

    // Total area exposed to air
    if (!fields.has("d_101")) {
      setValue("d_101", "2476.62", VALUE_STATES.DEFAULT);
    }

    // Total area exposed to ground
    if (!fields.has("d_102")) {
      setValue("d_102", "1100.42", VALUE_STATES.DEFAULT);
    }

    // =========================================================================
    // 2. REGISTER VOLUME AND U-VALUE FIELDS
    // =========================================================================

    // Total conditioned volume
    if (!fields.has("d_105")) {
      setValue("d_105", "8000.00", VALUE_STATES.DEFAULT);
    }

    // Combined U-value
    if (!fields.has("d_104")) {
      setValue("d_104", "0.292", VALUE_STATES.CALCULATED);
    }

    // Window to Wall Ratio
    if (!fields.has("d_107")) {
      setValue("d_107", "32.59%", VALUE_STATES.CALCULATED);
    }

    // =========================================================================
    // 3. REGISTER HEAT LOSS/GAIN FIELDS
    // =========================================================================

    // Total heat loss through envelope
    if (!fields.has("i_104")) {
      setValue("i_104", "116070.33", VALUE_STATES.CALCULATED);
    }

    // Air leakage heat loss
    if (!fields.has("i_103")) {
      setValue("i_103", "23178.39", VALUE_STATES.CALCULATED);
    }

    // =========================================================================
    // 4. ESTABLISH DEPENDENCY RELATIONSHIPS
    // =========================================================================

    // Areas affect heat loss calculations
    registerDependency("d_101", "i_101"); // Area affects heat loss through air
    registerDependency("d_102", "i_102"); // Area affects heat loss through ground

    // U-values affect heat loss calculations
    registerDependency("g_101", "i_101"); // U-value affects heat loss through air
    registerDependency("g_102", "i_102"); // U-value affects heat loss through ground

    // Air leakage affects heat loss
    registerDependency("g_109", "i_103"); // ACH50 affects air leakage heat loss

    // Building volume affects metrics
    registerDependency("d_105", "g_105"); // Volume affects volume/area ratio
    registerDependency("d_105", "i_105"); // Volume affects area/volume ratio
  }

  /**
   * Update TEUI calculations when source values change
   * @param {string} _sourceField - The source field that changed
   *
   * ⚠️  DISABLED: This function bypasses the dual-engine architecture.
   * S01 is designed as a PURE DISPLAY CONSUMER that reads upstream values.
   * Direct StateManager calculation overwrites h_10/k_10 without mode awareness.
   */
  function updateTEUICalculations(_sourceField) {
    // ❌ DISABLED: Bypasses dual-engine architecture
    return;

    /* LEGACY CODE BELOW (disabled)
    try {
      // Get raw values from state manager
      const rawActualEnergy = getValue("f_32");
      const rawTargetEnergy = getValue("j_32");
      const rawArea = getValue("h_15");

      // Parse values with appropriate fallbacks
      let actualEnergy, targetEnergy, area;

      // Parse Actual Energy (f_32)
      if (typeof rawActualEnergy === "string") {
        actualEnergy = parseFloat(rawActualEnergy.replace(/,/g, ""));
      } else {
        actualEnergy = parseFloat(rawActualEnergy);
      }

      // Parse Target Energy (j_32)
      if (typeof rawTargetEnergy === "string") {
        targetEnergy = parseFloat(rawTargetEnergy.replace(/,/g, ""));
      } else {
        targetEnergy = parseFloat(rawTargetEnergy);
      }

      // Parse Conditioned Area (h_15)
      if (typeof rawArea === "string") {
        area = parseFloat(rawArea.replace(/,/g, ""));
      } else {
        area = parseFloat(rawArea);
      }

      // If parsing fails, get values from DOM as backup
      if (isNaN(actualEnergy)) {
        const f32Element = document.querySelector('[data-field-id="f_32"]');
        if (f32Element) {
          const domValue = f32Element.textContent.trim();
          actualEnergy = parseFloat(domValue.replace(/,/g, ""));
        }
      }

      if (isNaN(targetEnergy)) {
        const j32Element = document.querySelector('[data-field-id="j_32"]');
        if (j32Element) {
          const domValue = j32Element.textContent.trim();
          targetEnergy = parseFloat(domValue.replace(/,/g, ""));
        }
      }

      if (isNaN(area) || area <= 0) {
        const h15Element = document.querySelector('[data-field-id="h_15"]');
        if (h15Element) {
          const domValue = h15Element.textContent.trim();
          area = parseFloat(domValue.replace(/,/g, ""));
        }
      }

      // Final fallbacks
      if (isNaN(actualEnergy)) {
        actualEnergy = 132938.0; // Default value
      }

      if (isNaN(targetEnergy)) {
        targetEnergy = 132765.65; // Default value
      }

      if (isNaN(area) || area <= 0) {
        area = 1427.2; // Default value
      }

      // Calculate TEUI values (rounded to 1 decimal place)
      let actualTEUI, targetTEUI;

      // Calculate Actual TEUI - handle zero energy case
      if (actualEnergy === 0) {
        actualTEUI = 0.0;
      } else {
        actualTEUI = Math.round((actualEnergy / area) * 10) / 10;
      }

      // Calculate Target TEUI - always use target energy
      targetTEUI = Math.round((targetEnergy / area) * 10) / 10;

      // Update the TEUI values
      setValue("k_10", actualTEUI.toString(), VALUE_STATES.CALCULATED);
      setValue("h_10", targetTEUI.toString(), VALUE_STATES.CALCULATED);
    } catch (error) {
      console.error("Error updating TEUI calculations:", error);
    }
    */
  }

  /**
   * Exports the dependency data in a format suitable for visualization.
   * Includes both field-level dependencies and architectural module dependencies.
   * @param {string} mode - "target" (default), "reference", or "both" for dual-state analysis
   * @returns {object} Object containing nodes and links, e.g., { nodes: [], links: [] }
   */
  function exportDependencyGraph(mode = "target") {
    // console.log(`[StateManager] Exporting dependency graph data for mode: ${mode}...`);
    const nodes = new Map(); // Use a Map to easily track unique nodes
    const links = [];

    // === ARCHITECTURAL MODULE DEPENDENCIES FOR AI AGENTS ===
    // Add module-level architectural nodes to help AI agents understand execution flow
    const architecturalNodes = [
      {
        id: "FOUNDATION-StateManager",
        group: "🏗️ Foundation",
        type: "module",
        architecturalLayer: "Foundation",
        label: "StateManager",
        description: "Central state management, single source of truth",
      },
      {
        id: "FOUNDATION-FieldManager",
        group: "🏗️ Foundation",
        type: "module",
        architecturalLayer: "Foundation",
        label: "FieldManager",
        description: "DOM generation, section coordination",
      },
      {
        id: "FOUNDATION-ReferenceValues",
        group: "🏗️ Foundation",
        type: "module",
        architecturalLayer: "Foundation",
        label: "ReferenceValues",
        description: "Building code standards database",
      },
      {
        id: "COORDINATION-Calculator",
        group: "🧮 Coordination",
        type: "module",
        architecturalLayer: "Coordination",
        label: "Calculator",
        description: "Traffic Cop coordination, orchestrates calculateAll()",
      },
      {
        id: "COORDINATION-ReferenceSystem",
        group: "🧮 Coordination",
        type: "module",
        architecturalLayer: "Coordination",
        label: "Reference System",
        description: "Master dual-state coordination",
      },
      {
        id: "COORDINATION-SectionIntegrator",
        group: "🧮 Coordination",
        type: "module",
        architecturalLayer: "Coordination",
        label: "SectionIntegrator",
        description: "Cross-section data flow patterns",
      },
      {
        id: "MODULE-Section01",
        group: "🎯 Application",
        type: "module",
        architecturalLayer: "Application",
        label: "Section 01 (Key Values)",
        description: "Dashboard, consumes S15 outputs",
      },
      {
        id: "MODULE-Section03",
        group: "🎯 Application",
        type: "module",
        architecturalLayer: "Application",
        label: "Section 03 (Climate)",
        description: "Climate data, foundation calculations",
      },
      {
        id: "MODULE-Section14",
        group: "🎯 Application",
        type: "module",
        architecturalLayer: "Application",
        label: "Section 14 (TEDI)",
        description: "Summary calculations, consumes S9-S13",
      },
      {
        id: "MODULE-Section15",
        group: "🎯 Application",
        type: "module",
        architecturalLayer: "Application",
        label: "Section 15 (TEUI)",
        description: "Final energy summary, feeds S01",
      },
    ];

    // Add architectural module dependencies
    const architecturalLinks = [
      // Foundation dependencies
      { source: "FOUNDATION-StateManager", target: "FOUNDATION-FieldManager" },
      { source: "FOUNDATION-StateManager", target: "COORDINATION-Calculator" },
      {
        source: "FOUNDATION-FieldManager",
        target: "COORDINATION-SectionIntegrator",
      },
      {
        source: "FOUNDATION-ReferenceValues",
        target: "COORDINATION-ReferenceSystem",
      },

      // Coordination dependencies
      { source: "COORDINATION-Calculator", target: "MODULE-Section03" },
      { source: "COORDINATION-Calculator", target: "MODULE-Section14" },
      { source: "COORDINATION-Calculator", target: "MODULE-Section15" },
      { source: "COORDINATION-Calculator", target: "MODULE-Section01" },
      { source: "COORDINATION-ReferenceSystem", target: "MODULE-Section01" },

      // Section execution flow (from Calculator.js calculateAll order)
      { source: "MODULE-Section03", target: "MODULE-Section14" },
      { source: "MODULE-Section14", target: "MODULE-Section15" },
      { source: "MODULE-Section15", target: "MODULE-Section01" },
    ];

    // Add architectural nodes and links
    architecturalNodes.forEach((node) => nodes.set(node.id, node));
    links.push(...architecturalLinks);

    // === MODE-BASED DEPENDENCY PROCESSING ===
    // Process Target, Reference, or both sets of dependencies based on mode

    // Iterate through the dependencies map (source -> Set<target>)
    // Process dependencies based on mode for AI agent analysis
    const processFieldDependencies = (
      sourcePrefix = "",
      targetPrefix = "",
      nodePrefix = "",
    ) => {
      dependencies.forEach((targets, sourceId) => {
        const processedSourceId = sourcePrefix + sourceId;

        // Add source node if not already added
        if (!nodes.has(processedSourceId)) {
          nodes.set(processedSourceId, {
            id: processedSourceId,
            originalId: sourceId,
            dependencyMode: nodePrefix || "target",
          });
        }

        targets.forEach((targetId) => {
          const processedTargetId = targetPrefix + targetId;

          // Add target node if not already added
          if (!nodes.has(processedTargetId)) {
            nodes.set(processedTargetId, {
              id: processedTargetId,
              originalId: targetId,
              dependencyMode: nodePrefix || "target",
            });
          }

          // Add dependency link
          links.push({
            source: processedSourceId,
            target: processedTargetId,
            dependencyMode: nodePrefix || "target",
          });
        });
      });
    };

    // Process dependencies based on requested mode
    if (mode === "target" || mode === "both") {
      // Standard Target state dependencies (current behavior)
      processFieldDependencies("", "", "target");
    }

    if (mode === "reference" || mode === "both") {
      // Reference state dependencies (ref_ prefixed fields)
      // For Reference mode, we map the same logical dependencies but with ref_ prefixes
      processFieldDependencies("ref_", "ref_", "reference");
    }

    // Enhance node data using FieldManager
    if (window.TEUI?.FieldManager) {
      const fieldManager = window.TEUI.FieldManager;
      nodes.forEach((node) => {
        const fieldDef = fieldManager.getField(node.id);
        node.type = fieldDef?.type || "unknown";
        node.label = fieldDef?.label || node.id; // Use fieldDef label or fallback to ID
        node.rowId = fieldDef?.rowId || node.id.split("_")[1] || "?"; // Try to get rowId
        // Add grouping logic based on fieldDef or node.id
        node.group = getNodeGroup(node.id, fieldDef); // Use helper function
      });
    } else {
      console.warn(
        "[StateManager] FieldManager not available to enhance node data.",
      );
    }

    const nodesArray = Array.from(nodes.values());
    // console.log(
    //   `[StateManager] Exported ${nodesArray.length} nodes and ${links.length} links.`,
    // );
    return { nodes: nodesArray, links: links };
  }

  /**
   * Helper function (moved inside StateManager IIFE)
   * Determines the group for a node based on its ID or field definition.
   * @param {string} nodeId
   * @param {object | null} _fieldDef
   * @returns {string} The determined group name.
   */
  function getNodeGroup(nodeId, _fieldDef) {
    // Updated to match the colorScheme's camelCase naming
    if (nodeId.includes("_1") && nodeId.split("_").length > 1)
      return "keyValues"; // Section 01
    if (nodeId.includes("_2") && nodeId.split("_").length > 1)
      return "buildingInfo"; // Section 02
    if (nodeId.includes("_3") && nodeId.split("_").length > 1)
      return "climateCalculations"; // Section 03
    if (nodeId.includes("_4") && nodeId.split("_").length > 1)
      return "actualTargetEnergy"; // Section 04
    if (nodeId.includes("_5") && nodeId.split("_").length > 1)
      return "co2eEmissions"; // Section 05
    if (nodeId.includes("_6") && nodeId.split("_").length > 1)
      return "renewableEnergy"; // Section 06
    if (nodeId.includes("_7") && nodeId.split("_").length > 1)
      return "waterUse"; // Section 07
    if (nodeId.includes("_8") && nodeId.split("_").length > 1)
      return "indoorAirQuality"; // Section 08
    if (nodeId.includes("_9") && nodeId.split("_").length > 1)
      return "occupantInternalGains"; // Section 09
    if (nodeId.includes("_10") && nodeId.split("_").length > 1)
      return "radiantGains"; // Section 10
    if (nodeId.includes("_11") && nodeId.split("_").length > 1)
      return "transmissionLosses"; // Section 11
    if (nodeId.includes("_12") && nodeId.split("_").length > 1)
      return "volumeSurfaceMetrics"; // Section 12
    if (nodeId.includes("_13") && nodeId.split("_").length > 1)
      return "mechanicalLoads"; // Section 13
    if (nodeId.includes("_14") && nodeId.split("_").length > 1)
      return "tediSummary"; // Section 14
    if (nodeId.includes("_15") && nodeId.split("_").length > 1)
      return "teuiSummary"; // Section 15

    return "Other"; // Default fallback
  }

  /**
   * AI AGENT HELPER: Get dual-state dependency analysis
   * Returns structured data about both Target and Reference calculation flows
   * @returns {object} Object with targetDependencies, referenceDependencies, and combined analysis
   */
  function getDualStateDependencyAnalysis() {
    const targetGraph = exportDependencyGraph("target");
    const referenceGraph = exportDependencyGraph("reference");
    const combinedGraph = exportDependencyGraph("both");

    return {
      target: {
        description: "Target state dependencies (user design values)",
        nodeCount: targetGraph.nodes.length,
        linkCount: targetGraph.links.length,
        graph: targetGraph,
      },
      reference: {
        description: "Reference state dependencies (code compliance values)",
        nodeCount: referenceGraph.nodes.length,
        linkCount: referenceGraph.links.length,
        graph: referenceGraph,
      },
      combined: {
        description: "Complete dual-state dependency map",
        nodeCount: combinedGraph.nodes.length,
        linkCount: combinedGraph.links.length,
        graph: combinedGraph,
      },
      analysis: {
        coverageRatio: referenceGraph.nodes.length / targetGraph.nodes.length,
        totalDependencies:
          targetGraph.links.length + referenceGraph.links.length,
        dualStateCompliant: referenceGraph.nodes.length > 0,
      },
    };
  }

  /**
   * NEW METHOD: Builds the activeReferenceDataSet for Reference Mode.
   * @param {string} standardKey - The key of the selected reference standard.
   */
  function loadReferenceData(standardKey) {
    console.log(
      `[StateManager] Loading reference data for standard: ${standardKey}`,
    );
    activeReferenceDataSet = {}; // Initialize/Clear

    // Helper to get current application state value, bypassing mode-aware getValue for this step
    const getApplicationStateValueInternal = (id) => {
      if (fields.has(id)) {
        return fields.get(id).value;
      }
      const fieldDef = window.TEUI && TEUI.FieldManager?.getField(id);
      return fieldDef?.defaultValue;
    };

    const allUserEditableFields =
      window.TEUI && TEUI.FieldManager?.getAllUserEditableFields();

    if (allUserEditableFields) {
      Object.keys(allUserEditableFields).forEach((fieldId) => {
        // Check if this field has an independent Reference value
        if (
          Object.prototype.hasOwnProperty.call(
            independentReferenceState,
            fieldId,
          )
        ) {
          // Use the independent Reference value
          activeReferenceDataSet[fieldId] = independentReferenceState[fieldId];
        } else {
          // Use application state value
          activeReferenceDataSet[fieldId] =
            getApplicationStateValueInternal(fieldId);
        }
      });
      console.log(
        "[StateManager] Step 1: Copied application state to activeReferenceDataSet (preserving independent Reference values). d_53 value:",
        activeReferenceDataSet["d_53"],
      );
    } else {
      console.warn(
        "[StateManager] Could not get allUserEditableFields from FieldManager for Step 1.",
      );
      // Fallback: try to copy from current 'fields' if FieldManager helper isn't ready/available
      fields.forEach((fieldData, fieldId) => {
        // A basic check if it might be user-editable (e.g., not purely calculated from the start)
        if (
          fieldData.state !== VALUE_STATES.CALCULATED &&
          fieldData.state !== VALUE_STATES.DERIVED
        ) {
          activeReferenceDataSet[fieldId] = fieldData.value;
        }
      });
      if (Object.keys(activeReferenceDataSet).length > 0) {
        console.log(
          "[StateManager] Step 1 (Fallback): Copied from current fields map to activeReferenceDataSet. d_53 value:",
          activeReferenceDataSet["d_53"],
        );
      }
    }

    // Step 2: Apply Specific "Reference Mode Defaults" (from Appendix E - placeholder)
    const referenceModeDefaults =
      (window.TEUI && TEUI.AppendixE?.getReferenceModeDefaults()) || {};
    Object.keys(referenceModeDefaults).forEach((fieldId) => {
      // Ensure it's a known field we care about changing
      if (
        Object.prototype.hasOwnProperty.call(activeReferenceDataSet, fieldId) ||
        (allUserEditableFields && allUserEditableFields[fieldId])
      ) {
        activeReferenceDataSet[fieldId] = referenceModeDefaults[fieldId];
      }
    });
    console.log(
      "[StateManager] Step 2: Applied Reference Mode Defaults. d_53 value:",
      activeReferenceDataSet["d_53"],
    );

    // Step 3: Overlay Explicit Standard Overrides
    console.log(
      `[StateManager] Attempting to access TEUI.ReferenceValues for standardKey: "${standardKey}"`,
    );

    // DEBUG: Check if TEUI.ReferenceValues exists
    console.log(
      "[StateManager] TEUI.ReferenceValues exists?",
      !!(window.TEUI && window.TEUI.ReferenceValues),
    );
    if (window.TEUI && window.TEUI.ReferenceValues) {
      console.log(
        "[StateManager] Available standards:",
        Object.keys(window.TEUI.ReferenceValues),
      );
      console.log(
        "[StateManager] Exact standardKey being requested:",
        JSON.stringify(standardKey),
      );

      // Check if the exact standard exists
      const exactMatch = window.TEUI.ReferenceValues[standardKey];
      // console.log("[StateManager] Exact match found?", !!exactMatch);
      if (exactMatch) {
        // console.log("[StateManager] Standard data:", exactMatch);
        console.log(
          "[StateManager] d_53 in standard?",
          Object.prototype.hasOwnProperty.call(exactMatch, "d_53"),
        );
        if (Object.prototype.hasOwnProperty.call(exactMatch, "d_53")) {
          console.log(
            "[StateManager] d_53 value in standard:",
            exactMatch["d_53"],
          );
        }
      }
    }

    // FIXED: Access the reference data directly from TEUI.ReferenceValues[standardKey]
    const standardOverrideData =
      window.TEUI && TEUI.ReferenceValues && TEUI.ReferenceValues[standardKey]
        ? TEUI.ReferenceValues[standardKey]
        : undefined;

    if (standardOverrideData) {
      // console.log("[StateManager] Found standard override data, applying...");
      Object.keys(standardOverrideData).forEach((fieldId) => {
        console.log(
          `[StateManager] Checking field: ${fieldId}, value: ${standardOverrideData[fieldId]}`,
        );
        // Apply if the field is already in our dataset (meaning it's a recognized user-editable field)
        if (
          Object.prototype.hasOwnProperty.call(
            activeReferenceDataSet,
            fieldId,
          ) ||
          (allUserEditableFields && allUserEditableFields[fieldId])
        ) {
          console.log(
            `[StateManager] Applying ${fieldId} = ${standardOverrideData[fieldId]}`,
          );
          activeReferenceDataSet[fieldId] = standardOverrideData[fieldId];
        } else {
          console.warn(
            `[StateManager] Standard ${standardKey} defines field ${fieldId} not in known user-editable fields`,
          );
        }
      });
      console.log(
        "[StateManager] Step 3: Applied standard overrides. d_53 value:",
        activeReferenceDataSet["d_53"],
      );
    } else {
      console.warn(
        `[StateManager] No override data found for standard: ${standardKey}. Available standards:`,
        Object.keys(window.TEUI?.ReferenceValues || {}),
      );
    }

    // Step 4 (Ensure Completeness - Fallback if needed)
    if (allUserEditableFields) {
      Object.keys(allUserEditableFields).forEach((fieldId) => {
        if (
          !Object.prototype.hasOwnProperty.call(activeReferenceDataSet, fieldId)
        ) {
          const fieldDef = TEUI.FieldManager?.getField(fieldId);
          activeReferenceDataSet[fieldId] = fieldDef?.defaultValue;
        }
      });
    }
    console.log(
      "[StateManager] FINAL d_53 value in activeReferenceDataSet:",
      activeReferenceDataSet["d_53"],
    );
    console.log(
      "[StateManager] Final activeReferenceDataSet keys:",
      Object.keys(activeReferenceDataSet).length,
    );
  }

  /**
   * NEW METHOD: Sets a value directly into the activeReferenceDataSet for edits made in Reference Mode.
   * @param {string} fieldId - The ID of the field to set.
   * @param {any} value - The new value for the field.
   * @returns {boolean} True if the value was set (always true for now, could add checks).
   */
  function setValueInReferenceMode(fieldId, value) {
    if (
      !(
        window.TEUI &&
        TEUI.ReferenceToggle &&
        TEUI.ReferenceToggle.isReferenceMode()
      )
    ) {
      console.warn(
        "[StateManager] Attempted to setValueInReferenceMode when not in Reference Mode.",
      );
      return false;
    }

    const oldValueInRef = activeReferenceDataSet[fieldId]; // Get old value specifically from ref dataset
    activeReferenceDataSet[fieldId] = value;

    // For independently editable fields, also store in a separate reference state
    if (window.TEUI?.AppendixE?.getFieldBehavior) {
      const currentStandard = getValue("d_13") || "OBC SB10 5.5-6 Z6";
      const behavior = window.TEUI.AppendixE.getFieldBehavior(
        fieldId,
        currentStandard,
      );
      if (behavior === "Independently User-Editable in Reference Mode") {
        // Store in separate reference state storage
        if (!independentReferenceState) {
          independentReferenceState = {};
        }
        independentReferenceState[fieldId] = value;
        console.log(
          `[StateManager] Stored independent Reference value for ${fieldId}: ${value}`,
        );
      }
    }

    // Notify listeners. Consider a specific state like 'reference-user-modified'
    // For now, using existing notifyListeners to ensure dependents are aware.
    // The main calculation loop should use mode-aware getValue().
    // Using a distinct state prevents this from being caught by the mute if it also checks state.
    notifyListeners(fieldId, value, oldValueInRef, "reference-user-modified");

    // Auto-save reference mode changes to localStorage
    clearTimeout(window.teuiAutoSaveTimeout);
    window.teuiAutoSaveTimeout = setTimeout(() => {
      saveState();
    }, 1000); // Save 1 second after last change

    // TODO: Consider if markDependentsDirty specifically for reference mode is needed,
    // or if the existing mechanism + mode-aware getValue is sufficient.
    console.log(
      `[StateManager] Value set in Reference Mode for ${fieldId}: ${value}`,
    );
    return true;
  }

  /**
   * NEW METHOD: Sets the mute state for application state updates.
   * @param {boolean} isMuted - True to mute updates to application state, false to allow.
   */
  function setMuteApplicationStateUpdates(isMuted) {
    isApplicationStateMuted = isMuted;
  }

  /**
   * NEW METHOD: Gets a field value directly from the application state (this.fields).
   * @param {string} fieldId - Field ID
   * @returns {any} The field value from application state or null if not found.
   */
  function getApplicationStateValue(fieldId) {
    return fields.has(fieldId) ? fields.get(fieldId).value : null;
  }

  /**
   * NEW METHOD: Gets a field value directly from the activeReferenceDataSet.
   * @param {string} fieldId - Field ID
   * @returns {any} The field value from reference state or null if not found.
   */
  function getActiveReferenceModeValue(fieldId) {
    return Object.prototype.hasOwnProperty.call(activeReferenceDataSet, fieldId)
      ? activeReferenceDataSet[fieldId]
      : null;
  }

  /**
   * NEW METHOD: Reverts the application state to the last successfully imported state,
   * or performs a system refresh if no imported data exists.
   */
  function revertToLastImportedState() {
    if (Object.keys(lastImportedState).length === 0) {
      // No imported data - perform a system refresh instead
      console.log(
        "[StateManager] No imported data found. Performing system refresh...",
      );

      // Trigger a full recalculation to refresh the system
      if (
        window.TEUI &&
        window.TEUI.Calculator &&
        typeof window.TEUI.Calculator.calculateAll === "function"
      ) {
        window.TEUI.Calculator.calculateAll();
      } else {
        console.warn(
          "[StateManager] Calculator.calculateAll not available for system refresh.",
        );
      }

      // Also trigger reference model recalculation if in reference mode
      if (
        window.TEUI &&
        window.TEUI.ReferenceToggle &&
        window.TEUI.ReferenceToggle.isReferenceMode()
      ) {
        // Reload reference data to ensure consistency
        const currentStandard = getValue("d_13") || "OBC SB10 5.5-6 Z6";
        loadReferenceData(currentStandard);

        // Trigger another calculation pass for reference values
        setTimeout(() => {
          if (
            window.TEUI.Calculator &&
            typeof window.TEUI.Calculator.calculateAll === "function"
          ) {
            window.TEUI.Calculator.calculateAll();
          }
        }, 100);
      }

      if (
        window.TEUI &&
        window.TEUI.FileHandler &&
        typeof window.TEUI.FileHandler.showStatus === "function"
      ) {
        window.TEUI.FileHandler.showStatus(
          "System defaults restored (no imported states yet)",
          "info",
        );
      }
      // console.log("[StateManager] System refresh completed.");
      return;
    }

    // console.log("[StateManager] Reverting to last imported state...");
    let revertedCount = 0;

    Object.entries(lastImportedState).forEach(([fieldId, importedValue]) => {
      // Set the value in the main application state
      const valueChanged = setValue(
        fieldId,
        importedValue,
        "system_reverted_to_import",
      ); // Use a new distinct source

      // Update the UI display for the field
      if (
        window.TEUI &&
        window.TEUI.FieldManager &&
        typeof window.TEUI.FieldManager.updateFieldDisplay === "function"
      ) {
        const fieldDef = window.TEUI.FieldManager.getField(fieldId);
        if (fieldDef) {
          try {
            window.TEUI.FieldManager.updateFieldDisplay(
              fieldId,
              importedValue,
              fieldDef,
            );
            if (valueChanged) revertedCount++;
          } catch (e) {
            console.error(
              `[StateManager] Error calling FieldManager.updateFieldDisplay for ${fieldId} during revert:`,
              e,
            );
          }
        }
      } else {
        console.warn(
          `[StateManager] FieldManager.updateFieldDisplay not available during revert for ${fieldId}.`,
        );
      }
    });

    // Trigger a full recalculation of all dependent fields
    if (
      window.TEUI &&
      window.TEUI.Calculator &&
      typeof window.TEUI.Calculator.calculateAll === "function"
    ) {
      window.TEUI.Calculator.calculateAll();
    } else {
      console.warn(
        "[StateManager] Calculator.calculateAll not available to trigger after reverting state.",
      );
    }

    if (
      window.TEUI &&
      window.TEUI.FileHandler &&
      typeof window.TEUI.FileHandler.showStatus === "function"
    ) {
      window.TEUI.FileHandler.showStatus(
        `Application state reset to last imported values. ${revertedCount} fields updated.`,
        "success",
      );
    }
    console.log(
      `[StateManager] Reverted to last imported state. ${revertedCount} fields updated.`,
    );
  }

  /**
   * DUAL-ENGINE EXPLICIT STATE GETTERS
   * These methods provide direct access to specific state repositories
   * for use in calculation engines, independent of current UI mode.
   */

  /**
   * Get a field value from Application/Target state (for Column H calculations)
   * @param {string} fieldId - Field ID
   * @returns {any} The field value from application state or null if not found
   */
  function getApplicationValue(fieldId) {
    return fields.has(fieldId) ? fields.get(fieldId).value : null;
  }

  /**
   * Get a field value from Reference state (for Column E calculations)
   * @param {string} fieldId - Field ID
   * @returns {any} The field value from reference state or null if not found
   */
  function getReferenceValue(fieldId) {
    // First check if this is an independently editable field with a separate Reference value
    if (
      Object.prototype.hasOwnProperty.call(independentReferenceState, fieldId)
    ) {
      return independentReferenceState[fieldId];
    }

    // Otherwise use the standard activeReferenceDataSet
    return Object.prototype.hasOwnProperty.call(activeReferenceDataSet, fieldId)
      ? activeReferenceDataSet[fieldId]
      : null;
  }

  /**
   * Get a field value for UI display purposes (mode-aware)
   * This is the existing getValue() logic, renamed for clarity
   * @param {string} fieldId - Field ID
   * @returns {any} The field value based on current UI mode
   */
  function getCurrentDisplayValue(fieldId) {
    if (
      window.TEUI &&
      TEUI.ReferenceToggle &&
      TEUI.ReferenceToggle.isReferenceMode()
    ) {
      // In Reference Mode, check independently editable fields first
      if (
        Object.prototype.hasOwnProperty.call(independentReferenceState, fieldId)
      ) {
        return independentReferenceState[fieldId];
      }

      // Then check activeReferenceDataSet
      // Fallback to application default if somehow not in activeReferenceDataSet (should be rare)
      return Object.prototype.hasOwnProperty.call(
        activeReferenceDataSet,
        fieldId,
      )
        ? activeReferenceDataSet[fieldId]
        : fields.has(fieldId)
          ? fields.get(fieldId).value
          : null; // Last resort fallback
    } else {
      // Existing logic for Application Mode
      return fields.has(fieldId) ? fields.get(fieldId).value : null;
    }
  }

  /**
   * T-CELLS REFERENCE COMPARISON SYSTEM
   * Support for pass/fail comparison logic using T-cell reference values
   */

  /**
   * Get the corresponding T-cell field ID for an application field
   * @param {string} fieldId - Application field ID (e.g., 'f_85')
   * @returns {string|null} The corresponding T-cell ID (e.g., 't_85') or null if no mapping
   */
  function getCorrespondingTCell(fieldId) {
    // Extract row number from fieldId pattern (e.g., 'f_85' -> '85')
    const rowMatch = fieldId.match(/[a-z]_(\d+)/);
    if (rowMatch) {
      return `t_${rowMatch[1]}`;
    }

    // Special cases for non-standard patterns
    const specialMappings = {
      h_127: "t_127", // TEDI
      h_140: "t_140", // GHGI
      d_104: "t_104", // Combined U-Value
      // Add other special cases as needed
    };

    return specialMappings[fieldId] || null;
  }

  /**
   * Get the T-cell reference value for comparison with an application field
   * @param {string} applicationFieldId - Application field ID
   * @returns {any} The T-cell reference value or null if not found
   */
  function getTCellValue(applicationFieldId) {
    const tCellId = getCorrespondingTCell(applicationFieldId);
    if (!tCellId) return null;

    return getReferenceValue(tCellId);
  }

  /**
   * Mute all listeners (import quarantine)
   * Used during Excel import to prevent cascading calculations with stale values
   */
  function muteListeners() {
    listenersActive = false;
    console.log("[StateManager] 🔒 Listeners MUTED (import quarantine active)");
  }

  /**
   * Unmute all listeners (end import quarantine)
   * Restores normal listener notification after import completes
   */
  function unmuteListeners() {
    listenersActive = true;
    console.log(
      "[StateManager] 🔓 Listeners UNMUTED (import quarantine ended)",
    );
  }

  // Public API
  return {
    // Constants
    VALUE_STATES: VALUE_STATES,

    // Basic functions
    initialize: initialize,
    clear: clear,
    getValue: getValue,
    setValue: setValue,

    // Dependency management
    registerDependency: registerDependency,
    markDependentsDirty: markDependentsDirty,
    getDirtyFields: getDirtyFields,
    clearDirtyStatus: clearDirtyStatus,
    getCalculationOrder: getCalculationOrder,

    // Listener management
    addListener: addListener,
    removeListener: removeListener,
    muteListeners: muteListeners,
    unmuteListeners: unmuteListeners,

    // UI updates
    updateUI: updateUI,

    // State persistence
    saveState: saveState,
    loadState: loadState,
    importState: importState,
    exportState: exportState,

    // Debugging
    getAllKeys: getAllKeys,
    getDebugInfo: getDebugInfo,
    exportDependencyGraph: exportDependencyGraph,
    getDualStateDependencyAnalysis: getDualStateDependencyAnalysis,
    loadReferenceData: loadReferenceData,
    setValueInReferenceMode: setValueInReferenceMode,
    setMuteApplicationStateUpdates: setMuteApplicationStateUpdates,
    revertToLastImportedState: revertToLastImportedState,
    getApplicationStateValue: getApplicationStateValue,
    getActiveReferenceModeValue: getActiveReferenceModeValue,
    getApplicationValue: getApplicationValue,
    getReferenceValue: getReferenceValue,
    getCurrentDisplayValue: getCurrentDisplayValue,
    getCorrespondingTCell: getCorrespondingTCell,
    getTCellValue: getTCellValue,
  };
})();

// NOTE: Initialization is now handled in index.html to control the sequence properly
