/**
 * 4011-ComponentBridge.js
 *
 * This file handles connecting field definitions to the DOM
 * and initializing the appropriate UI components.
 *
 * Refactored to consistently use DOM-based field IDs (e.g. 'd_12' for cell D12).
 */

window.TEUI = window.TEUI || {};

TEUI.ComponentBridge = (function () {
  // DOM utility functions
  function findFieldElement(fieldId) {
    return document.querySelector(`[data-field-id="${fieldId}"]`);
  }

  /**
   * Create dropdown HTML with proper DOM-based IDs
   * @param {string} fieldId - DOM-based field ID (e.g., 'd_12')
   * @param {Array} options - Array of dropdown options
   * @param {string} selectedValue - Selected value
   * @returns {string} HTML for dropdown
   */
  function createDropdownHTML(fieldId, options, selectedValue) {
    // Ensure options is an array and has the correct format
    if (!options) {
      options = [];
    }

    // Convert options to array format if it's not already
    const formattedOptions = Array.isArray(options)
      ? options
      : Object.entries(options).map(([value, name]) => ({ value, name }));

    // Create placeholder option
    let optionsHTML = '<option value="">Select...</option>';

    // Add formatted options
    optionsHTML += formattedOptions
      .map((option) => {
        const value = option.value || option;
        const name = option.name || option;
        return `<option value="${value}" ${value === selectedValue ? "selected" : ""}>${name}</option>`;
      })
      .join("");

    const dropdownId = `dd_${fieldId}`;

    return `
            <select class="form-select form-select-sm" data-field-id="${fieldId}" data-dropdown-id="${dropdownId}">
                ${optionsHTML}
            </select>
        `;
  }

  /**
   * Create slider HTML with proper DOM-based IDs
   * @param {string} fieldId - DOM-based field ID (e.g., 'd_12')
   * @param {string|number} value - Current value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {string} type - Slider type (percentage, coefficient, year_slider)
   * @returns {string} HTML for slider
   */
  function createSliderHTML(fieldId, value, min, max, type) {
    // Add proper data-type attribute based on the type
    return `
            <div class="slider-container">
                <input type="range" 
                    class="form-range" 
                    min="${min}" 
                    max="${max}" 
                    value="${value}" 
                    data-field-id="${fieldId}" 
                    data-type="${type}">
                <span class="slider-value">${value}${type === "percentage" ? "%" : ""}</span>
            </div>
        `;
  }

  /**
   * Create text input HTML with proper DOM-based IDs
   * @param {string} fieldId - DOM-based field ID (e.g., 'd_12')
   * @param {string} value - Current value
   * @returns {string} HTML for text input
   */
  function createTextInputHTML(fieldId, value) {
    return `
            <input type="text" 
                class="form-control form-control-sm" 
                value="${value}" 
                data-field-id="${fieldId}">
        `;
  }

  /**
   * Initialize a single field with proper DOM-based IDs
   * @param {string} fieldId - DOM-based field ID (e.g., 'd_12')
   */
  function initField(fieldId) {
    const field = TEUI.getField(fieldId);
    if (!field) {
      // console.warn(`Field ${fieldId} not found in definitions`);
      return;
    }

    const element = findFieldElement(fieldId);
    if (!element) {
      // console.warn(`Field element with data-field-id="${fieldId}" not found in DOM`);
      return;
    }

    // Render field based on type
    let innerHTML = "";

    switch (field.type) {
      case "dropdown": {
        // Use direct DOM-based dropdown ID
        const dropdownId = field.dropdownId || `dd_${fieldId}`;
        let dropdownOptions = [];

        try {
          // Get dropdown options safely
          if (TEUI.getDropdownOptions) {
            dropdownOptions = TEUI.getDropdownOptions(dropdownId) || [];
          }
        } catch (error) {
          console.error(
            `Error getting options for dropdown ${dropdownId}:`,
            error,
          );
        }

        // Ensure we have an array
        if (!Array.isArray(dropdownOptions)) {
          // console.warn(`Invalid options format for dropdown ${dropdownId}, expected array`);
          dropdownOptions = [];
        }

        innerHTML = createDropdownHTML(
          fieldId,
          dropdownOptions,
          field.defaultValue,
        );
        break;
      }

      case "percentage":
      case "coefficient":
      case "year_slider": {
        const min = field.min || (field.type === "percentage" ? 0 : 0);
        const max = field.max || (field.type === "percentage" ? 100 : 1);
        const value = field.defaultValue;
        innerHTML = createSliderHTML(fieldId, value, min, max, field.type);
        break;
      }

      case "text":
        innerHTML = createTextInputHTML(fieldId, field.defaultValue);
        break;

      case "calculated":
      case "derived":
        // For calculated/derived values, we'd typically just display the value
        element.textContent = field.defaultValue;
        element.classList.add(
          field.type === "calculated" ? "calculated-value" : "derived-value",
        );
        return; // No need for the rest of the initialization
    }

    // Set the innerHTML and add classes
    if (innerHTML) {
      element.innerHTML = innerHTML;
      element.classList.add("editable");

      // Add event listeners
      const inputElement = element.querySelector("input, select");
      if (inputElement) {
        inputElement.addEventListener("change", function (e) {
          // console.log(`Field ${fieldId} changed to ${e.target.value}`);

          // Update state manager if available
          if (window.TEUI.StateManager) {
            window.TEUI.StateManager.setValue(
              fieldId,
              e.target.value,
              "user-modified",
            );
          }

          // For dropdowns with dependencies, update dependent fields
          if (field.type === "dropdown" && field.dependencies) {
            handleDropdownChange(fieldId, e.target.value);
          }
        });
      }
    }
  }

  /**
   * Handle dropdown changes that affect other fields
   * @param {string} fieldId - DOM-based field ID (e.g., 'd_12')
   * @param {string} value - Selected value
   */
  function handleDropdownChange(fieldId, value) {
    const field = TEUI.getField(fieldId);
    if (!field || !field.dependencies) return;

    // Handle each dependent field
    field.dependencies.forEach((dependentFieldId) => {
      const dependentField = TEUI.getField(dependentFieldId);
      if (!dependentField) return;

      // Special case for Province -> City dependency
      if (fieldId === "d_19" && dependentFieldId === "h_19") {
        updateCityDropdown(value);
      }
    });
  }

  /**
   * Special case handler for Province -> City dropdown
   * @param {string} provinceValue - Selected province
   */
  function updateCityDropdown(provinceValue) {
    const cityDropdownElement = document.querySelector(
      '[data-dropdown-id="dd_h_19"]',
    );
    if (!cityDropdownElement) {
      // console.warn('City dropdown not found');
      return;
    }

    // Clear existing options
    cityDropdownElement.innerHTML = '<option value="">Select City...</option>';

    // If province not selected, return
    if (!provinceValue) return;

    // Check if location data handler is available
    if (
      !TEUI.ExcelLocationHandler ||
      !TEUI.ExcelLocationHandler.getLocationData
    ) {
      // console.warn('Location data handler not available');
      return;
    }

    // Get province data
    const locationData = TEUI.ExcelLocationHandler.getLocationData();
    const provinceData = locationData[provinceValue];

    if (!provinceData || !provinceData.cities) {
      // console.warn(`No cities found for province: ${provinceValue}`);
      return;
    }

    // Add city options
    provinceData.cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city.name;
      option.textContent = city.name;
      cityDropdownElement.appendChild(option);
    });
  }

  /**
   * Initialize all fields in a section
   * @param {string} sectionId - Section ID
   */
  function initSection(sectionId) {
    const fields = TEUI.getFieldsBySection
      ? TEUI.getFieldsBySection(sectionId)
      : {};

    // Initialize each field
    Object.keys(fields).forEach((fieldId) => {
      initField(fieldId);
    });

    // console.log(`Initialized section: ${sectionId}`);
  }

  /**
   * Initialize all fields and components
   */
  function initAll() {
    // Get sections if supported
    const sections = TEUI.getSections ? TEUI.getSections() : {};

    // Initialize each section
    Object.keys(sections).forEach((sectionId) => {
      initSection(sectionId);
    });

    // console.log('Initialized all components');
  }

  /**
   * Initialize a dropdown with the registry configuration
   * Handles setting up options, event listeners, and initial state
   */
  function initializeDropdown(dropdownElement, dropdownId) {
    // Check if FieldManager is available
    if (!window.TEUI.FieldManager) {
      // console.warn(`FieldManager not available for dropdown initialization: ${dropdownId}`);
      return;
    }

    if (!dropdownElement || !dropdownId) {
      // console.warn(`Invalid dropdown element or ID: ${dropdownId}`);
      return;
    }

    // Get the field ID from the dropdown ID (e.g., convert dd_d_12 to d_12)
    const fieldId = dropdownId.replace("dd_", "");

    // Get field configuration from FieldManager
    const fieldConfig = window.TEUI.FieldManager.getField(fieldId);

    if (!fieldConfig) {
      console.warn(`No field configuration found for ${fieldId}`);
      return;
    }

    // Special case for Present/Future toggle - always select 'Present' by default
    const isPresentFutureToggle = dropdownId === "dd_h_20";

    // Get options from FieldManager
    let options = window.TEUI.FieldManager.getDropdownOptions(dropdownId);

    if (!options || !Array.isArray(options) || options.length === 0) {
      console.warn(`No options found for dropdown ${dropdownId}`);
      options = [];
    }

    // Clear existing options
    dropdownElement.innerHTML = "";

    // Add default empty option (unless this is the Present/Future toggle)
    if (!isPresentFutureToggle) {
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = `Select ${fieldConfig.label || ""}`;
      dropdownElement.appendChild(defaultOption);
    }

    // Add options
    options.forEach((option) => {
      const optionElement = document.createElement("option");

      // Handle both object and primitive options
      const value = typeof option === "object" ? option.value : option;
      const text =
        typeof option === "object" ? option.name || option.value : option;

      optionElement.value = value;
      optionElement.textContent = text;

      // For Present/Future toggle, select 'Present' by default
      if (isPresentFutureToggle && value === "Present") {
        optionElement.selected = true;
      }

      dropdownElement.appendChild(optionElement);
    });

    // Store the dropdown's config for reference
    dropdownElement.dropdownConfig = fieldConfig;

    // Add change listener
    dropdownElement.addEventListener("change", handleDropdownChange);

    // Initialize value if needed from state
    if (window.TEUI && window.TEUI.StateManager) {
      const stateManager = window.TEUI.StateManager;
      const savedValue = stateManager.getValue(fieldId);

      if (savedValue) {
        dropdownElement.value = savedValue;
      } else if (isPresentFutureToggle) {
        // For Present/Future toggle, default to 'Present' if no saved value
        const defaultOption = Array.from(dropdownElement.options).find(
          (opt) => opt.value === "Present",
        );
        if (defaultOption) {
          dropdownElement.value = "Present";
          stateManager.setValue(fieldId, "Present", "user");
        }
      }
    }
  }

  // ==========================================================================
  // 🔧 DUAL-STATE SYNCHRONIZATION (ComponentBridge Enhancement)
  // ==========================================================================

  let isDualStateSyncInitialized = false;

  /**
   * Initialize dual-state synchronization with selective filtering
   * FIXED: Only sync user inputs, not calculated/derived values
   */
  function initDualStateSync() {
    if (isDualStateSyncInitialized) {
      console.log("🔄 ComponentBridge: Dual-state sync already initialized");
      return;
    }

    if (!window.TEUI.StateManager) {
      console.warn(
        "🔄 ComponentBridge: StateManager not available, dual-state sync delayed",
      );
      return;
    }

    // console.log('🔄 ComponentBridge: Initializing SELECTIVE dual-state synchronization...');

    // Track sync operations to prevent loops
    let isSyncing = false;

    // ✅ FIXED: Hook into StateManager's setValue with SELECTIVE filtering
    const originalSetValue = window.TEUI.StateManager.setValue;

    window.TEUI.StateManager.setValue = function (fieldId, value, source) {
      // Call the original setValue first
      const result = originalSetValue.call(this, fieldId, value, source);

      // 🔥 CRITICAL: Only sync USER INPUTS, not calculated values!
      const isUserInput = source === "user" || source === "user-modified";
      const isBridgeSync = source === "bridge-sync";
      const isCalculated =
        source === "calculated" || source === "derived" || source === "default";

      // Skip if not a user input or already syncing
      if (!isUserInput || isBridgeSync || isSyncing || isCalculated) {
        return result;
      }

      const currentMode = getCurrentMode();

      // Only proceed in Target mode
      if (currentMode !== "target") {
        return result;
      }

      // Prevent recursive calls
      isSyncing = true;

      try {
        // Handle target_* → global sync (user inputs only)
        if (fieldId.startsWith("target_")) {
          const globalFieldId = fieldId.replace("target_", "");
          originalSetValue.call(this, globalFieldId, value, "bridge-sync");
          // console.log(`🔄 ComponentBridge: User input synced ${fieldId} → ${globalFieldId} (${value})`);
        }

        // Handle global → target_* sync (user inputs only)
        else if (
          !fieldId.startsWith("target_") &&
          !fieldId.startsWith("ref_")
        ) {
          const targetFieldId = `target_${fieldId}`;
          originalSetValue.call(this, targetFieldId, value, "bridge-sync");
          // console.log(`🔄 ComponentBridge: User input synced ${fieldId} → ${targetFieldId} (${value})`);
        }
      } catch (error) {
        console.error("🚨 ComponentBridge sync error:", error);
      } finally {
        // Always reset sync flag
        isSyncing = false;
      }

      return result;
    };

    isDualStateSyncInitialized = true;
    // console.log('✅ ComponentBridge: Selective dual-state sync initialized successfully');
    // console.log('📌 ComponentBridge: Only syncing USER INPUTS (user/user-modified), not calculated values');
  }

  /**
   * Get the current mode from dual-state sections
   * @returns {string} 'target' or 'reference'
   */
  function getCurrentMode() {
    // Check for dual-state sections and their ModeManagers
    const dualStateSections = [
      window.TEUI?.SectionModules?.sect03?.ModeManager,
      window.TEUI?.SectionModules?.sect05?.ModeManager, // ✅ NEW: Include S05!
      window.TEUI?.SectionModules?.sect06?.ModeManager, // ✅ CRITICAL: Include S06!
      window.TEUI?.SectionModules?.sect10?.ModeManager,
      window.TEUI?.SectionModules?.sect13?.ModeManager, // ✅ CRITICAL: Include S13!
      // Add other dual-state sections as they're implemented
    ].filter(Boolean);

    // Return the mode from the first available dual-state section
    if (dualStateSections.length > 0) {
      return dualStateSections[0].currentMode || "target";
    }

    // Default to target mode if no dual-state sections are available
    return "target";
  }

  /**
   * Check if dual-state sync is enabled
   * @returns {boolean}
   */
  function isDualStateSyncEnabled() {
    return isDualStateSyncInitialized;
  }

  // Public API
  return {
    initField: initField,
    initSection: initSection,
    initAll: initAll,
    handleDropdownChange: handleDropdownChange,
    initializeDropdown: initializeDropdown,
    initDualStateSync: initDualStateSync,
    getCurrentMode: getCurrentMode,
    isDualStateSyncEnabled: isDualStateSyncEnabled,
  };
})();

// Initialize when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  // console.log('TEUI ComponentBridge ready...');

  // Initialize components after a short delay to ensure all scripts are loaded
  setTimeout(function () {
    TEUI.ComponentBridge.initAll();
  }, 100);
});
