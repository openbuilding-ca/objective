/**
 * OBC-ClassificationFilter.js
 * Dynamic Building Classification Filtering System
 *
 * Filters Section 04 building classifications based on Section 02 major occupancy selections.
 * Uses OBC-StateManager as single source of truth - no direct DOM manipulation.
 *
 * ARCHITECTURE COMPLIANCE:
 * - All state monitoring through StateManager.addListener()
 * - All state reading through StateManager.getValue()
 * - All dropdown updates through proper OBC field management
 * - No direct DOM queries or manipulation
 */

// Create namespace
window.OBC = window.OBC || {};
window.OBC.ClassificationFilter = (function () {
  //==========================================================================
  // OCCUPANCY TO BUILDING CLASSIFICATION MAPPING
  //==========================================================================

  // Maps Section 02 occupancy codes to Section 04 building classification groups
  const OCCUPANCY_TO_CLASSIFICATION_MAP = {
    // Group A Assembly Occupancies
    A1: "Group A", // Performing Arts
    A2: "Group A", // Other assembly
    A3: "Group A", // Arenas
    A4: "Group A", // Open-Air Assemblies

    // Group B Institutional Occupancies
    B1: "Group B", // Detention
    B2: "Group B", // Care and Treatment
    B3: "Group B", // Care

    // Group C Residential
    C: "Group C",

    // Group D Business & Personal Services
    D: "Group D",

    // Group E Mercantile
    E: "Group E",

    // Group F Industrial
    F1: "Group F", // High Hazard Industrial
    F2: "Group F", // Medium Hazard Industrial
    F3: "Group F", // Low Hazard Industrial

    // Group G Agricultural (typically not in building classifications)
    G1: null, // High-hazard Agricultural
    G2: null, // Agricultural not elsewhere classified
    G3: null, // Greenhouse Agricultural
    G4: null, // Agricultural with no human occupants
  };

  // Complete building classification list (from Section 04)
  const ALL_BUILDING_CLASSIFICATIONS = [
    { value: "-", name: "Select Building Classification", description: "" },
    // Group A Classifications
    {
      value: "3.2.2.20",
      name: "3.2.2.20",
      description: "Group A, Division 1, Any Height, Any Area, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.21",
      name: "3.2.2.21",
      description: "Group A, Division 1, 1 Storey, Limited Area, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.22",
      name: "3.2.2.22",
      description: "Group A, Division 1, 1 Storey, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.23",
      name: "3.2.2.23",
      description: "Group A, Division 2, Any Height, Any Area, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.24",
      name: "3.2.2.24",
      description:
        "Group A, Division 2, up to 6 Storeys, Any Area, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.25",
      name: "3.2.2.25",
      description: "Group A, Division 2, up to 2 Storeys",
      group: "Group A",
    },
    {
      value: "3.2.2.26",
      name: "3.2.2.26",
      description:
        "Group A, Division 2, up to 2 Storeys, Increased Area, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.27",
      name: "3.2.2.27",
      description: "Group A, Division 2, up to 2 Storeys, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.28",
      name: "3.2.2.28",
      description: "Group A, Division 2, 1 Storey",
      group: "Group A",
    },
    {
      value: "3.2.2.29",
      name: "3.2.2.29",
      description: "Group A, Division 3, Any Height, Any Area, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.30",
      name: "3.2.2.30",
      description: "Group A, Division 3, up to 2 Storeys",
      group: "Group A",
    },
    {
      value: "3.2.2.31",
      name: "3.2.2.31",
      description: "Group A, Division 3, up to 2 Storeys, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.32",
      name: "3.2.2.32",
      description: "Group A, Division 3, 1 Storey, Increased Area",
      group: "Group A",
    },
    {
      value: "3.2.2.33",
      name: "3.2.2.33",
      description: "Group A, Division 3, 1 Storey, Sprinklered",
      group: "Group A",
    },
    {
      value: "3.2.2.34",
      name: "3.2.2.34",
      description: "Group A, Division 3, 1 Storey",
      group: "Group A",
    },
    {
      value: "3.2.2.35",
      name: "3.2.2.35",
      description: "Group A, Division 4",
      group: "Group A",
    },
    // Group B Classifications
    {
      value: "3.2.2.36",
      name: "3.2.2.36",
      description: "Group B, Division 1, Any Height, Any Area, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.37",
      name: "3.2.2.37",
      description: "Group B, Division 1, up to 3 Storeys, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.38",
      name: "3.2.2.38",
      description: "Group B, Division 2, Any Height, Any Area, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.39",
      name: "3.2.2.39",
      description: "Group B, Division 2, up to 3 Storeys, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.40",
      name: "3.2.2.40",
      description: "Group B, Division 2, up to 2 Storeys, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.41",
      name: "3.2.2.41",
      description: "Group B, Division 2, 1 Storey, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.42",
      name: "3.2.2.42",
      description: "Group B, Division 3, Any Height, Any Area, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.43",
      name: "3.2.2.43",
      description:
        "Group B, Division 3, up to 3 Storeys, (Noncombustible), Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.44",
      name: "3.2.2.44",
      description: "Group B, Division 3, up to 3 Storeys, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.45",
      name: "3.2.2.45",
      description: "Group B, Division 3, up to 2 Storeys, Sprinklered",
      group: "Group B",
    },
    {
      value: "3.2.2.46",
      name: "3.2.2.46",
      description: "Group B, Division 3, 1 Storey, Sprinklered",
      group: "Group B",
    },
    // Group C Classifications
    {
      value: "3.2.2.47",
      name: "3.2.2.47",
      description: "Group C, Any Height, Any Area, Sprinklered",
      group: "Group C",
    },
    {
      value: "3.2.2.48",
      name: "3.2.2.48",
      description: "Group C, up to 12 Storeys, Sprinklered",
      group: "Group C",
    },
    {
      value: "3.2.2.49",
      name: "3.2.2.49",
      description:
        "Group C, up to 6 Storeys, Sprinklered, Noncombustible Construction",
      group: "Group C",
    },
    {
      value: "3.2.2.50",
      name: "3.2.2.50",
      description: "Group C, up to 4 Storeys, Noncombustible Construction",
      group: "Group C",
    },
    {
      value: "3.2.2.51",
      name: "3.2.2.51",
      description:
        "Group C, up to 6 Storeys, Sprinklered, Combustible Construction",
      group: "Group C",
    },
    {
      value: "3.2.2.52",
      name: "3.2.2.52",
      description: "Group C, up to 4 Storeys, Sprinklered",
      group: "Group C",
    },
    {
      value: "3.2.2.53",
      name: "3.2.2.53",
      description: "Group C, up to 3 Storeys, Increased Area",
      group: "Group C",
    },
    {
      value: "3.2.2.54",
      name: "3.2.2.54",
      description: "Group C, up to 3 Storeys",
      group: "Group C",
    },
    {
      value: "3.2.2.55",
      name: "3.2.2.55",
      description: "Group C, up to 3 Storeys, Sprinklered",
      group: "Group C",
    },
    {
      value: "3.2.2.55A",
      name: "3.2.2.55A",
      description:
        "Group C, Retirement Home, Any Height, Any Area, Sprinklered",
      group: "Group C",
    },
    {
      value: "3.2.2.55B",
      name: "3.2.2.55B",
      description:
        "Group C, Retirement Home, up to 4 Storeys, Sprinklered, Increased Area",
      group: "Group C",
    },
    {
      value: "3.2.2.55C",
      name: "3.2.2.55C",
      description: "Group C, Retirement Home, up to 4 Storeys, Sprinklered",
      group: "Group C",
    },
    {
      value: "3.2.2.55D",
      name: "3.2.2.55D",
      description:
        "Group C, Retirement Home, up to 3 Storeys, Sprinklered, Noncombustible Construction",
      group: "Group C",
    },
    {
      value: "3.2.2.55E",
      name: "3.2.2.55E",
      description:
        "Group C, Retirement Home, up to 3 Storeys, Sprinklered, Combustible Construction",
      group: "Group C",
    },
    // Group D Classifications
    {
      value: "3.2.2.56",
      name: "3.2.2.56",
      description: "Group D, Any Height, Any Area",
      group: "Group D",
    },
    {
      value: "3.2.2.57",
      name: "3.2.2.57",
      description: "Group D, up to 12 Storeys, Sprinklered",
      group: "Group D",
    },
    {
      value: "3.2.2.58",
      name: "3.2.2.58",
      description: "Group D, up to 6 Storeys",
      group: "Group D",
    },
    {
      value: "3.2.2.59",
      name: "3.2.2.59",
      description:
        "Group D, up to 6 Storeys, Sprinklered, Noncombustible Construction",
      group: "Group D",
    },
    {
      value: "3.2.2.60",
      name: "3.2.2.60",
      description: "Group D, up to 6 Storeys, Sprinklered",
      group: "Group D",
    },
    {
      value: "3.2.2.61",
      name: "3.2.2.61",
      description: "Group D, up to 4 Storeys, Sprinklered",
      group: "Group D",
    },
    {
      value: "3.2.2.62",
      name: "3.2.2.62",
      description: "Group D, up to 3 Storeys",
      group: "Group D",
    },
    {
      value: "3.2.2.63",
      name: "3.2.2.63",
      description: "Group D, up to 3 Storeys, Sprinklered",
      group: "Group D",
    },
    {
      value: "3.2.2.64",
      name: "3.2.2.64",
      description: "Group D, up to 2 Storeys",
      group: "Group D",
    },
    {
      value: "3.2.2.65",
      name: "3.2.2.65",
      description: "Group D, up to 2 Storeys, Sprinklered",
      group: "Group D",
    },
    // Group E Classifications
    {
      value: "3.2.2.66",
      name: "3.2.2.66",
      description: "Group E, Any Height, Any Area, Sprinklered",
      group: "Group E",
    },
    {
      value: "3.2.2.67",
      name: "3.2.2.67",
      description: "Group E, up to 4 Storeys, Sprinklered",
      group: "Group E",
    },
    {
      value: "3.2.2.68",
      name: "3.2.2.68",
      description: "Group E, up to 3 Storeys",
      group: "Group E",
    },
    {
      value: "3.2.2.69",
      name: "3.2.2.69",
      description: "Group E, up to 3 Storeys, Sprinklered",
      group: "Group E",
    },
    {
      value: "3.2.2.70",
      name: "3.2.2.70",
      description: "Group E, up to 2 Storeys",
      group: "Group E",
    },
    {
      value: "3.2.2.71",
      name: "3.2.2.71",
      description: "Group E, up to 2 Storeys, Sprinklered",
      group: "Group E",
    },
    // Group F Classifications
    {
      value: "3.2.2.72",
      name: "3.2.2.72",
      description: "Group F, Division 1, up to 4 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.73",
      name: "3.2.2.73",
      description: "Group F, Division 1, up to 3 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.74",
      name: "3.2.2.74",
      description: "Group F, Division 1, up to 2 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.75",
      name: "3.2.2.75",
      description: "Group F, Division 1, 1 Storey",
      group: "Group F",
    },
    {
      value: "3.2.2.76",
      name: "3.2.2.76",
      description: "Group F, Division 2, Any Height, Any Area, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.77",
      name: "3.2.2.77",
      description:
        "Group F, Division 2, up to 4 Storeys, Increased Area, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.78",
      name: "3.2.2.78",
      description: "Group F, Division 2, up to 3 Storeys",
      group: "Group F",
    },
    {
      value: "3.2.2.79",
      name: "3.2.2.79",
      description: "Group F, Division 2, up to 4 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.80",
      name: "3.2.2.80",
      description: "Group F, Division 2, up to 2 Storeys",
      group: "Group F",
    },
    {
      value: "3.2.2.81",
      name: "3.2.2.81",
      description: "Group F, Division 2, up to 2 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.82",
      name: "3.2.2.82",
      description: "Group F, Division 3, Any Height, Any Area, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.83",
      name: "3.2.2.83",
      description: "Group F, Division 3, up to 6 Storeys",
      group: "Group F",
    },
    {
      value: "3.2.2.84",
      name: "3.2.2.84",
      description: "Group F, Division 3, up to 6 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.85",
      name: "3.2.2.85",
      description: "Group F, Division 3, up to 4 Storeys",
      group: "Group F",
    },
    {
      value: "3.2.2.86",
      name: "3.2.2.86",
      description: "Group F, Division 3, up to 4 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.87",
      name: "3.2.2.87",
      description: "Group F, Division 3, up to 2 Storeys",
      group: "Group F",
    },
    {
      value: "3.2.2.88",
      name: "3.2.2.88",
      description: "Group F, Division 3, up to 2 Storeys, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.89",
      name: "3.2.2.89",
      description: "Group F, Division 3, 1 Storey",
      group: "Group F",
    },
    {
      value: "3.2.2.90",
      name: "3.2.2.90",
      description: "Group F, Division 3, 1 Storey, Sprinklered",
      group: "Group F",
    },
    {
      value: "3.2.2.91",
      name: "3.2.2.91",
      description:
        "Group F, Division 3, 1 Storey, Any Area, Low Fire Load Occupancy",
      group: "Group F",
    },
    {
      value: "3.2.2.92",
      name: "3.2.2.92",
      description: "Group F, Division 3, Storage Garages up to 22 m High",
      group: "Group F",
    },
    // Encapsulated Mass Timber (all groups)
    {
      value: "3.2.2.93",
      name: "3.2.2.93",
      description:
        "Encapsulated mass timber, Various Heights and Areas, Sprinklered",
      group: "Universal",
    },
  ];

  //==========================================================================
  // CONFIGURATION
  //==========================================================================

  // Section 02 occupancy field IDs to monitor
  const OCCUPANCY_FIELD_IDS = ["d_14", "d_15", "d_16", "d_17", "d_18"];

  // Section 04 building classification field IDs to update
  const CLASSIFICATION_FIELD_IDS = [
    "d_40",
    "d_41",
    "d_42",
    "d_43",
    "d_44",
    "e_50",
  ];

  // Current filtered options for each classification dropdown
  let currentFilteredOptions = {};

  //==========================================================================
  // CORE FILTERING LOGIC
  //==========================================================================

  /**
   * Get currently selected major occupancies from Section 02
   * Uses StateManager as single source of truth
   */
  function getSelectedMajorOccupancies() {
    const selectedOccupancies = [];

    OCCUPANCY_FIELD_IDS.forEach((fieldId) => {
      const value = window.OBC?.StateManager?.getValue(fieldId);
      if (
        value &&
        value !== "-" &&
        value !== "Select Occupancy Classification"
      ) {
        selectedOccupancies.push(value);
      }
    });

    return selectedOccupancies;
  }

  /**
   * Map occupancy codes to building classification groups
   */
  function getRelevantClassificationGroups(selectedOccupancies) {
    const relevantGroups = new Set();

    selectedOccupancies.forEach((occupancy) => {
      const group = OCCUPANCY_TO_CLASSIFICATION_MAP[occupancy];
      if (group) {
        relevantGroups.add(group);
      }
    });

    // Always include universal options
    relevantGroups.add("Universal");

    return Array.from(relevantGroups);
  }

  /**
   * Filter building classifications based on relevant groups
   */
  function getFilteredClassifications(relevantGroups) {
    // Always include the default "Select..." option
    const filteredOptions = [
      { value: "-", name: "Select Building Classification", description: "" },
    ];

    // Add classifications from relevant groups
    ALL_BUILDING_CLASSIFICATIONS.forEach((classification) => {
      if (classification.value === "-") return; // Skip duplicate default

      if (relevantGroups.includes(classification.group)) {
        filteredOptions.push(classification);
      }
    });

    return filteredOptions;
  }

  /**
   * Update dropdown options through proper OBC architecture
   * NO direct DOM manipulation - works through FieldManager
   */
  function updateClassificationDropdowns(filteredOptions) {
    CLASSIFICATION_FIELD_IDS.forEach((fieldId) => {
      // Store filtered options for this field
      currentFilteredOptions[fieldId] = filteredOptions;

      // Get current value to preserve selection if still valid
      const currentValue = window.OBC?.StateManager?.getValue(fieldId) || "-";
      const isCurrentValueValid = filteredOptions.some(
        (option) => option.value === currentValue,
      );

      // Update dropdown through FieldManager (proper OBC architecture)
      if (window.OBC?.FieldManager?.updateDropdownOptions) {
        window.OBC.FieldManager.updateDropdownOptions(fieldId, filteredOptions);

        // Reset selection if current value is no longer valid
        if (!isCurrentValueValid && currentValue !== "-") {
          window.OBC.StateManager.setValue(fieldId, "-", "user-modified");
        }
      }
    });
  }

  /**
   * Main filtering function triggered by occupancy changes
   */
  function updateClassificationFilters() {
    const selectedOccupancies = getSelectedMajorOccupancies();

    if (selectedOccupancies.length === 0) {
      // No occupancies selected - show all classifications
      updateClassificationDropdowns(ALL_BUILDING_CLASSIFICATIONS);
      return;
    }

    const relevantGroups = getRelevantClassificationGroups(selectedOccupancies);
    const filteredOptions = getFilteredClassifications(relevantGroups);

    updateClassificationDropdowns(filteredOptions);
  }

  //==========================================================================
  // INITIALIZATION & EVENT HANDLING
  //==========================================================================

  /**
   * Initialize the classification filtering system
   * Sets up StateManager listeners for occupancy changes
   */
  function initialize() {
    if (!window.OBC?.StateManager) {
      console.error("❌ CLASSIFICATION FILTER: StateManager not available");
      return false;
    }

    // Set up listeners for all occupancy dropdowns
    OCCUPANCY_FIELD_IDS.forEach((fieldId) => {
      window.OBC.StateManager.addListener(fieldId, function (_value) {
        // Use requestAnimationFrame for better performance than setTimeout
        requestAnimationFrame(updateClassificationFilters);
      });
    });

    // Run initial filtering using requestAnimationFrame
    requestAnimationFrame(updateClassificationFilters);

    return true;
  }

  /**
   * Get current filtered options for a classification field
   * Used by FieldManager for dropdown rendering
   */
  function getFilteredOptionsForField(fieldId) {
    return currentFilteredOptions[fieldId] || ALL_BUILDING_CLASSIFICATIONS;
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    // Core functionality
    initialize: initialize,
    updateClassificationFilters: updateClassificationFilters,

    // Data access
    getFilteredOptionsForField: getFilteredOptionsForField,
    getSelectedMajorOccupancies: getSelectedMajorOccupancies,

    // Debug utilities
    getAllClassifications: () => ALL_BUILDING_CLASSIFICATIONS,
    getOccupancyMapping: () => OCCUPANCY_TO_CLASSIFICATION_MAP,
    getCurrentFilters: () => currentFilteredOptions,
  };
})();

// Note: Initialization handled by Section 04 to ensure proper timing
