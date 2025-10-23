/**
 * OBC-StateManager.js
 *
 * Simplified state management module for OBC Matrix
 * Handles three states: Default, User-Modified, and Imported
 * Provides global number formatting and reset functionality
 */

// Define the global namespace if it doesn't exist
window.OBC = window.OBC || {};

// OBC State Manager Module
window.OBC.StateManager = (function () {
  // Value state constants
  const VALUE_STATES = {
    DEFAULT: "default", // Original default value
    USER_MODIFIED: "user-modified", // Value changed by user
    IMPORTED: "imported", // Value imported from file
  };

  // Private properties
  let fields = new Map(); // Map of all field values and states
  let listeners = new Map(); // Field change listeners
  let importedState = {}; // Store imported values for reset functionality

  /**
   * Global utility to format numbers for OBC Matrix
   * @param {string|number|null|undefined} value - The value to format
   * @param {string} [formatType='number'] - The format type
   * @returns {string} The formatted string
   */
  window.OBC.formatNumber = function (value, formatType = "number") {
    // Handle N/A or null/undefined input
    if (
      value === null ||
      value === undefined ||
      String(value).trim().toUpperCase() === "N/A"
    ) {
      return "N/A";
    }

    // Handle raw format
    if (formatType === "raw") {
      return String(value);
    }

    // Parse numeric value
    const numValue = window.OBC.parseNumeric(value, NaN);

    // Handle non-numeric values
    if (isNaN(numValue)) {
      if (typeof value === "string" && value.trim() !== "") return value;
      return "0.00";
    }

    try {
      // Handle different format types
      switch (formatType) {
        case "number":
        case "number-2dp":
          return numValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false,
          });

        case "number-0dp":
        case "integer":
          return numValue.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: false,
          });

        case "number-3dp":
          return numValue.toLocaleString(undefined, {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
            useGrouping: false,
          });

        case "number-2dp-comma":
          return numValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true, // Enable thousands separators (commas)
          });

        case "percent":
          return numValue.toLocaleString(undefined, {
            style: "percent",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          });

        default:
          return numValue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: false,
          });
      }
    } catch (e) {
      console.error(
        `Error formatting value ${value} with format ${formatType}:`,
        e,
      );
      return String(value);
    }
  };

  /**
   * Global utility to safely parse numeric values
   * @param {string|number|null|undefined} value - The value to parse
   * @param {number} [defaultValue=0] - The value to return if parsing fails
   * @returns {number} The parsed number or the default value
   */
  window.OBC.parseNumeric = function (value, defaultValue = 0) {
    if (value === null || value === undefined) {
      return defaultValue;
    }

    let numericValue;
    if (typeof value === "string") {
      const cleanedValue = value.replace(/,/g, "").trim();
      if (cleanedValue === "" || cleanedValue.toUpperCase() === "N/A") {
        return defaultValue;
      }
      numericValue = parseFloat(cleanedValue);
    } else if (typeof value === "number") {
      numericValue = value;
    } else {
      numericValue = NaN;
    }

    return isNaN(numericValue) ? defaultValue : numericValue;
  };

  /**
   * Initialize the state manager
   */
  function initialize() {
    fields.clear();
    listeners.clear();
    importedState = {};

    // Try to load saved state from localStorage
    loadState();
  }

  /**
   * Get the value of a field
   * @param {string} fieldId - The field ID
   * @returns {string|null} The field value or null if not found
   */
  function getValue(fieldId) {
    const fieldData = fields.get(fieldId);
    return fieldData ? fieldData.value : null;
  }

  /**
   * Get the state of a field
   * @param {string} fieldId - The field ID
   * @returns {string|null} The field state or null if not found
   */
  function getState(fieldId) {
    const fieldData = fields.get(fieldId);
    return fieldData ? fieldData.state : null;
  }

  /**
   * Set the value of a field
   * @param {string} fieldId - The field ID
   * @param {string|number} value - The value to set
   * @param {string} [state=VALUE_STATES.USER_MODIFIED] - The state to set
   */
  function setValue(fieldId, value, state = VALUE_STATES.USER_MODIFIED) {
    const oldValue = getValue(fieldId);
    const oldState = getState(fieldId);

    // Don't overwrite higher priority states with lower priority ones
    if (
      oldState === VALUE_STATES.USER_MODIFIED &&
      state === VALUE_STATES.DEFAULT
    ) {
      return;
    }
    if (oldState === VALUE_STATES.IMPORTED && state === VALUE_STATES.DEFAULT) {
      return;
    }

    // Store the new value and state
    fields.set(fieldId, {
      value: String(value),
      state: state,
    });

    // Store imported values separately for reset functionality
    if (state === VALUE_STATES.IMPORTED) {
      importedState[fieldId] = String(value);
    }

    // Update the DOM element
    updateUI(fieldId, value);

    // Notify listeners
    notifyListeners(fieldId, value, oldValue, state);

    // Auto-save state for user-modified and imported values (not defaults)
    if (
      state === VALUE_STATES.USER_MODIFIED ||
      state === VALUE_STATES.IMPORTED
    ) {
      // Debounce saves to avoid excessive localStorage writes
      clearTimeout(window.obcAutoSaveTimeout);
      window.obcAutoSaveTimeout = setTimeout(() => {
        saveState();
      }, 1000); // Save 1 second after last change
    }
  }

  /**
   * Add a listener for field changes
   * @param {string} fieldId - The field ID to listen to
   * @param {Function} callback - The callback function
   */
  function addListener(fieldId, callback) {
    if (!listeners.has(fieldId)) {
      listeners.set(fieldId, []);
    }
    listeners.get(fieldId).push(callback);
  }

  /**
   * Remove a listener for field changes
   * @param {string} fieldId - The field ID
   * @param {Function} callback - The callback function to remove
   */
  function removeListener(fieldId, callback) {
    const fieldListeners = listeners.get(fieldId);
    if (fieldListeners) {
      const index = fieldListeners.indexOf(callback);
      if (index > -1) {
        fieldListeners.splice(index, 1);
      }
    }
  }

  /**
   * Notify all listeners of a field change
   * @param {string} fieldId - The field ID that changed
   * @param {string} newValue - The new value
   * @param {string} oldValue - The old value
   * @param {string} state - The new state
   */
  function notifyListeners(fieldId, newValue, oldValue, state) {
    const fieldListeners = listeners.get(fieldId);
    if (fieldListeners) {
      fieldListeners.forEach((callback) => {
        try {
          callback(newValue, oldValue, state);
        } catch (e) {
          console.error(`Error in listener for field ${fieldId}:`, e);
        }
      });
    }
  }

  /**
   * Update the UI element for a field
   * @param {string} fieldId - The field ID
   * @param {string|number} value - The value to display
   */
  function updateUI(fieldId, value) {
    // First try to find a SELECT element with this field ID (for dropdowns)
    let element = document.querySelector(`select[data-field-id="${fieldId}"]`);

    // If no select found, look for any element with this field ID
    if (!element) {
      element = document.querySelector(`[data-field-id="${fieldId}"]`);
    }

    if (element) {
      if (element.tagName === "INPUT") {
        element.value = value;
      } else if (element.tagName === "SELECT") {
        element.value = value;
      } else {
        // Check if this element contains a SELECT (dropdown in a cell)
        const selectChild = element.querySelector("select[data-field-id]");
        if (selectChild) {
          selectChild.value = value;
          element = selectChild; // Use the select for CSS class updates
        } else {
          // Fields that should NOT be formatted as numbers (even if they contain digits)
          const textOnlyFields = ["c_12"]; // License numbers should remain as text

          // Check if this value should be formatted as a number
          const numericValue = window.OBC.parseNumeric(value, NaN);
          const shouldFormatAsNumber =
            !isNaN(numericValue) && !textOnlyFields.includes(fieldId);

          if (shouldFormatAsNumber) {
            // This is a numeric value - apply proper formatting for display
            const formattedValue = window.OBC.formatNumber(
              numericValue,
              "number-2dp-comma",
            );
            element.textContent = formattedValue;
          } else {
            // Non-numeric value or text-only field, update normally
            element.textContent = value;
          }
        }
      }

      // Update CSS classes based on field state
      const fieldState = getState(fieldId);
      if (fieldState === VALUE_STATES.USER_MODIFIED) {
        element.classList.add("user-modified");
        element.classList.remove("default", "imported");
      } else if (fieldState === VALUE_STATES.IMPORTED) {
        element.classList.add("imported");
        element.classList.remove("user-modified", "default");
      } else {
        element.classList.add("default");
        element.classList.remove("user-modified", "imported");
      }
    }
  }

  /**
   * Reset fields based on their current state
   * - User-modified fields: reset to default or imported value
   * - Imported fields: keep imported values
   * - Default fields: keep default values
   */
  function resetFields() {
    console.log("OBC StateManager: Resetting fields...");

    fields.forEach((fieldData, fieldId) => {
      if (fieldData.state === VALUE_STATES.USER_MODIFIED) {
        // If we have an imported value, reset to that; otherwise reset to default
        if (importedState[fieldId]) {
          setValue(fieldId, importedState[fieldId], VALUE_STATES.IMPORTED);
        } else {
          // Reset to default (empty or section-specific default)
          setValue(fieldId, "", VALUE_STATES.DEFAULT);
        }
      }
      // Imported and default fields remain unchanged
    });
  }

  /**
   * Import state from data (e.g., from CSV/Excel file)
   * @param {Object} data - Object with fieldId: value pairs
   */
  function importState(data) {
    console.log("OBC StateManager: Importing state...", data);

    Object.entries(data).forEach(([fieldId, value]) => {
      setValue(fieldId, value, VALUE_STATES.IMPORTED);
    });
  }

  /**
   * Export current state
   * @returns {Object} Object with fieldId: value pairs
   */
  function exportState() {
    const state = {};
    fields.forEach((fieldData, fieldId) => {
      state[fieldId] = fieldData.value;
    });
    return state;
  }

  /**
   * Get debug information about current state
   * @returns {Object} Debug information
   */
  function getDebugInfo() {
    return {
      fieldsCount: fields.size,
      listenersCount: listeners.size,
      importedFieldsCount: Object.keys(importedState).length,
      fields: Array.from(fields.entries()),
      importedState: importedState,
    };
  }

  /**
   * Save current state to localStorage for cross-session persistence
   */
  function saveState() {
    try {
      const stateData = {
        fields: Object.fromEntries(fields.entries()), // Fix: Save as object, not array
        importedState: importedState,
        timestamp: Date.now(),
      };
      localStorage.setItem("OBC_Matrix_State", JSON.stringify(stateData));
    } catch (e) {
      console.error(
        "OBC StateManager: Failed to save state to localStorage:",
        e,
      );
    }
  }

  /**
   * Load state from localStorage
   */
  function loadState() {
    try {
      const savedState = localStorage.getItem("OBC_Matrix_State");
      if (savedState) {
        const stateData = JSON.parse(savedState);

        // Restore fields
        fields.clear();

        // Handle both old array format and new object format
        if (Array.isArray(stateData.fields)) {
          // Legacy array format: [["fieldId", fieldData], ...]
          stateData.fields.forEach(([fieldId, fieldData]) => {
            fields.set(fieldId, fieldData);
            // Update UI for restored fields
            updateUI(fieldId, fieldData.value);
          });
        } else if (stateData.fields && typeof stateData.fields === "object") {
          // New object format: {"fieldId": fieldData, ...}
          Object.entries(stateData.fields).forEach(([fieldId, fieldData]) => {
            fields.set(fieldId, fieldData);
            // Update UI for restored fields
            updateUI(fieldId, fieldData.value);
          });
        }

        // Restore imported state
        importedState = stateData.importedState || {};

        return true;
      }
    } catch (e) {
      console.error(
        "OBC StateManager: Failed to load state from localStorage:",
        e,
      );
    }
    return false;
  }

  /**
   * Clear all state (both memory and localStorage)
   */
  function clear() {
    fields.clear();
    listeners.clear();
    importedState = {};

    // Also clear localStorage
    try {
      localStorage.removeItem("OBC_Matrix_State");
      console.log("OBC StateManager: Cleared state from localStorage");
    } catch (e) {
      console.error("OBC StateManager: Failed to clear localStorage:", e);
    }
  }

  /**
   * Global input handler for field blur events
   * @param {Event} event - The blur event
   */
  function handleFieldBlur(event) {
    const fieldElement = event.target;
    const currentFieldId = fieldElement.getAttribute("data-field-id");

    if (!currentFieldId) return;

    let valueStr = fieldElement.textContent.trim();
    const originalValue = fieldElement.dataset.originalValue || "";

    // Check if the user actually made any changes
    const hasActualChanges = valueStr !== originalValue;

    if (!hasActualChanges) {
      // User clicked in but didn't change anything - no state change needed
      return;
    }

    // Handle numeric formatting if needed
    let numValue = window.OBC.parseNumeric(valueStr, NaN);
    let displayValue = valueStr;

    // Fields that should NOT be formatted as numbers (even if they contain digits)
    const textOnlyFields = ["c_12"]; // License numbers should remain as text

    // Apply formatting for numeric fields (excluding text-only fields)
    if (!isNaN(numValue) && !textOnlyFields.includes(currentFieldId)) {
      // Check if field is explicitly marked as numeric
      const isNumericField =
        fieldElement.hasAttribute("data-type") &&
        fieldElement.getAttribute("data-type") === "numeric";

      // Apply formatting based on field type
      if (isNumericField) {
        displayValue = window.OBC.formatNumber(numValue, "number-2dp-comma");
      } else if (currentFieldId.includes("percent")) {
        displayValue = window.OBC.formatNumber(numValue, "percent");
      } else {
        // Default formatting for numbers
        displayValue = window.OBC.formatNumber(numValue, "number");
      }
    }

    // Update display with formatting first
    fieldElement.textContent = displayValue;

    // Store the RAW USER INPUT in StateManager (for calculations)
    // StateManager stores unformatted values, formatting only happens in display
    setValue(currentFieldId, valueStr, VALUE_STATES.USER_MODIFIED);
  }

  /**
   * Initialize global input handlers for all editable fields
   * Call this after sections are rendered
   */
  function initializeGlobalInputHandlers() {
    // Initializing global input handlers...

    // Find all editable fields across all sections
    const editableFields = document.querySelectorAll(
      ".editable[data-field-id]",
    );

    editableFields.forEach((field) => {
      if (!field.hasOBCGlobalListeners) {
        // Prevent enter key from creating newlines
        field.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            field.blur();
          }
        });

        // Handle field blur (when user finishes editing)
        field.addEventListener("blur", handleFieldBlur);

        // Visual feedback for editing state
        field.addEventListener("focus", () => {
          field.classList.add("editing");

          // Store original value for change detection on blur
          field.dataset.originalValue = field.textContent.trim();

          // Add temporary editing class for immediate blue styling (doesn't change state)
          const currentState = getState(field.getAttribute("data-field-id"));
          if (!currentState || currentState === VALUE_STATES.DEFAULT) {
            field.classList.add("editing-intent");
          }
        });

        field.addEventListener("focusout", () => {
          field.classList.remove("editing");
          field.classList.remove("editing-intent"); // Always remove temporary class
        });

        field.hasOBCGlobalListeners = true; // Mark as listener attached
      }
    });

    // Initialized handlers for editable fields
  }

  // Public API
  return {
    VALUE_STATES: VALUE_STATES,
    initialize: initialize,
    getValue: getValue,
    getState: getState,
    setValue: setValue,
    addListener: addListener,
    removeListener: removeListener,
    resetFields: resetFields,
    importState: importState,
    exportState: exportState,
    saveState: saveState,
    loadState: loadState,
    getDebugInfo: getDebugInfo,
    clear: clear,
    initializeGlobalInputHandlers: initializeGlobalInputHandlers,
  };
})();

// Auto-initialize when script loads
document.addEventListener("DOMContentLoaded", function () {
  if (window.OBC && window.OBC.StateManager) {
    window.OBC.StateManager.initialize();
  }
});
