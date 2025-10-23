/**
 * OBC-FieldManager.js
 *
 * V3 of a Lightweight field management system that coordinates section modules
 * which are pre-loaded via script tags in the HTML.
 *
 * This approach avoids dynamic script loading security restrictions
 * while maintaining modularity. NOT yet modified for use wih OBC MAtrix App
 */

window.OBC = window.OBC || {};

// Ensure section modules namespace exists
window.OBC.SectionModules = window.OBC.SectionModules || {};

// FieldManager Module
OBC.FieldManager = (function () {
  // Section mapping from UI IDs to internal section module IDs
  const sections = {
    buildingInfo: "sect01",
    buildingOccupancy: "sect02",
    buildingAreas: "sect03",
    firefightingSystems: "sect04",
    structuralRequirements: "sect05",
    occupantSafety: "sect06",
    fireResistance: "sect07",
    plumbingFixtures: "sect08",
    energySoundComply: "sect09",
    notes: "sect10",
  };

  // Combined field registry (populated from section modules)
  let allFields = {};

  // Dropdown options registry (populated from section modules)
  let dropdownOptions = {};

  // Track initialization state
  let isInitialized = false;

  /**
   * Create an empty module for sections without implementations
   * @param {string} sectionId - Section identifier
   * @returns {Object} - Empty module with required methods
   */
  function createEmptyModule(sectionId) {
    return {
      getFields: function () {
        return {};
      },
      getDropdownOptions: function () {
        return {};
      },
      getLayout: function () {
        return {
          rows: [
            {
              id: `${sectionId} Empty`,
              cells: [
                {}, // Empty column A
                {}, // ID column B
                { content: "This section is currently empty." }, // C
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {},
                {}, // Empty columns D through N
              ],
            },
          ],
        };
      },
    };
  }

  /**
   * Initialize all section modules
   * Uses modules pre-loaded by script tags in the HTML
   */
  function initializeSections() {
    // Process each section, using the already loaded module or creating a fallback
    Object.entries(sections).forEach(([_uiSectionId, moduleSectionId]) => {
      // Check if the module exists in the global namespace
      if (OBC.SectionModules[moduleSectionId]) {
        // Collect fields from this section
        try {
          if (OBC.SectionModules[moduleSectionId].getFields) {
            const sectionFields =
              OBC.SectionModules[moduleSectionId].getFields();
            Object.assign(allFields, sectionFields);
          }

          // Collect dropdown options from this section
          if (OBC.SectionModules[moduleSectionId].getDropdownOptions) {
            const sectionOptions =
              OBC.SectionModules[moduleSectionId].getDropdownOptions();
            Object.assign(dropdownOptions, sectionOptions);
          }
        } catch (e) {
          console.error(`Error processing module ${moduleSectionId}:`, e);
        }
      } else {
        // Create fallback empty module
        OBC.SectionModules[moduleSectionId] =
          createEmptyModule(moduleSectionId);
      }
    });

    isInitialized = true;

    // Make fields available globally for OBC compatibility
    window.OBC.fields = allFields;
  }

  /**
   * Get all field definitions
   * @returns {Object} - All field definitions
   */
  function getAllFields() {
    return allFields;
  }

  /**
   * Get fields for a specific section
   * @param {string} sectionId - Section ID (original name, e.g., "buildingInfo")
   * @returns {Object} - Field definitions for the section
   */
  function getFieldsBySection(sectionId) {
    const internalSectionId = sections[sectionId];
    if (!internalSectionId || !OBC.SectionModules[internalSectionId]) {
      return {};
    }

    try {
      return OBC.SectionModules[internalSectionId].getFields() || {};
    } catch (e) {
      console.error(`Error getting fields for section ${sectionId}:`, e);
      return {};
    }
  }

  /**
   * Get a specific field definition
   * @param {string} fieldId - Field ID (e.g., "d_12")
   * @returns {Object|null} - Field definition or null if not found
   */
  function getField(fieldId) {
    return allFields[fieldId] || null;
  }

  /**
   * Get dropdown options for a specific dropdown
   * @param {string} dropdownId - Dropdown ID (e.g., "dd_d_12")
   * @param {Object} context - Context for dynamic options
   * @returns {Array} - Dropdown options
   */
  function getDropdownOptions(dropdownId, context = {}) {
    // First check if there's a field with this dropdown ID
    const fieldId = Object.keys(allFields).find(
      (id) => allFields[id].dropdownId === dropdownId,
    );

    // If field found and it has options, use those first
    if (fieldId && allFields[fieldId].options) {
      return allFields[fieldId].options;
    }

    // If field has getOptions function, use that
    if (fieldId && allFields[fieldId].getOptions) {
      const parentValue =
        context.parentValue ||
        (allFields[fieldId].dependencies &&
        allFields[fieldId].dependencies.length > 0
          ? OBC.StateManager?.getValue(allFields[fieldId].dependencies[0])
          : null);

      try {
        return allFields[fieldId].getOptions(parentValue);
      } catch (e) {
        console.error(`Error getting options for field ${fieldId}:`, e);
        return [];
      }
    }

    // Otherwise fall back to the central registry
    const options = dropdownOptions[dropdownId];

    // Handle nested dropdown options
    if (
      typeof options === "object" &&
      !Array.isArray(options) &&
      context.parentValue
    ) {
      return options[context.parentValue] || [];
    }

    return options || [];
  }

  /**
   * NEW FUNCTION: Get all field definitions considered user-editable.
   * Filters out calculated and derived fields primarily.
   * @returns {Object} - Filtered field definitions for user-editable fields.
   */
  function getAllUserEditableFields() {
    const userEditableFields = {};
    const editableTypes = [
      "editable",
      "dropdown",
      "year_slider",
      "percentage",
      "coefficient",
      "coefficient_slider",
      "number",
      "generic_slider",
      // Add other types here if they are user-settable inputs that should be part of general state operations.
    ];

    if (!allFields) {
      return {};
    }

    for (const fieldId in allFields) {
      if (Object.prototype.hasOwnProperty.call(allFields, fieldId)) {
        const field = allFields[fieldId];
        // Check if field and field.type are defined, and if type is in editableTypes
        if (
          field &&
          typeof field.type === "string" &&
          editableTypes.includes(field.type)
        ) {
          userEditableFields[fieldId] = field;
        }
      }
    }
    return userEditableFields;
  }

  /**
   * Get layout definition for a section
   * @param {string} sectionId - Section ID (original name, e.g., "buildingInfo")
   * @returns {Object|null} - Layout definition or null if not found
   */
  function getLayoutForSection(sectionId) {
    const internalSectionId = sections[sectionId];
    if (!internalSectionId || !OBC.SectionModules[internalSectionId]) {
      return null;
    }

    try {
      return OBC.SectionModules[internalSectionId].getLayout();
    } catch (error) {
      console.error(`Error getting layout for section ${sectionId}:`, error);
      return {
        rows: [
          {
            id: `${sectionId} Error`,
            cells: [
              {}, // Empty column A
              {}, // ID column B
              { content: `Error loading section: ${error.message}` }, // C
              {},
              {},
              {},
              {},
              {},
              {},
              {},
              {},
              {},
              {},
              {}, // Empty columns D through N
            ],
          },
        ],
      };
    }
  }

  /**
   * Initialize event handlers for a specific section
   * @param {string} sectionId - Section ID
   */
  function initializeSectionEventHandlers(sectionId) {
    const internalSectionId = sections[sectionId];
    if (!internalSectionId || !OBC.SectionModules[internalSectionId]) {
      console.warn(`Module not found for section ${sectionId}`);
      return;
    }

    const sectionModule = OBC.SectionModules[internalSectionId];

    // Call module-specific event handler initialization if it exists
    if (sectionModule.initializeEventHandlers) {
      try {
        sectionModule.initializeEventHandlers();
      } catch (error) {
        console.error(
          `Error in ${sectionId} module initializeEventHandlers:`,
          error,
        );
      }
    }

    // Also call onSectionRendered if it exists (often used for initialization)
    if (sectionModule.onSectionRendered) {
      try {
        sectionModule.onSectionRendered();
      } catch (error) {
        console.error(`Error in ${sectionId} module onSectionRendered:`, error);
      }
    }
  }

  /**
   * Render a specific section
   * @param {string} sectionId - Section ID (original name, e.g., "buildingInfo")
   * @returns {boolean} - True if section was rendered successfully
   */
  function renderSection(sectionId) {
    // Make sure initialization is complete
    if (!isInitialized) {
      initializeSections();
    }

    const internalSectionId = sections[sectionId];
    if (!internalSectionId) {
      console.error(`Unknown section ID: ${sectionId}`);
      return false;
    }

    if (!OBC.SectionModules[internalSectionId]) {
      console.error(
        `Module not found for section ${sectionId} (${internalSectionId})`,
      );
      return false;
    }

    try {
      const layout = getLayoutForSection(sectionId);
      if (!layout) {
        console.error(`No layout available for section ${sectionId}`);
        return false;
      }

      generateSectionContent(sectionId, layout);

      // Initialize dropdowns and sliders
      initializeDropdownsFromFields(sectionId);
      initializeSliders(sectionId);

      // Initialize section-specific event handlers
      initializeSectionEventHandlers(sectionId);

      // Dispatch section-specific rendering complete event
      document.dispatchEvent(
        new CustomEvent(`obc-section-rendered`, {
          detail: { sectionId: sectionId },
        }),
      );

      return true;
    } catch (error) {
      console.error(`Error rendering section ${sectionId}:`, error);
      return false;
    }
  }

  /**
   * Render all sections
   */
  function renderAllSections() {
    // Make sure initialization is complete
    if (!isInitialized) {
      initializeSections();
    }

    // Render each section
    Object.keys(sections).forEach((sectionId) => {
      renderSection(sectionId);
    });

    // Dispatch event to notify other components that rendering is complete
    document.dispatchEvent(
      new CustomEvent("obc-rendering-complete", {
        detail: { message: "All sections rendered successfully" },
      }),
    );

    return true;
  }

  /**
   * Generate content for a section using the layout definition
   * @param {string} sectionId - Section ID
   * @param {Object} layoutDefinition - Layout definition
   */
  function generateSectionContent(sectionId, layoutDefinition) {
    const sectionElement = document.getElementById(sectionId);

    if (!sectionElement) {
      return;
    }

    const contentContainer = sectionElement.querySelector(".section-content");
    if (!contentContainer) {
      return;
    }

    // If there's a render hook, use it instead of creating a new table
    const renderHook = contentContainer.querySelector(
      `[data-render-section="${sectionId}"]`,
    );
    const containerElement = renderHook || contentContainer;

    // Create table if it doesn't exist
    let tableElement = containerElement.querySelector(".data-table");
    if (!tableElement) {
      tableElement = document.createElement("table");
      tableElement.className = "data-table";
      tableElement.innerHTML = `<tbody></tbody>`;

      containerElement.appendChild(tableElement);
    }

    // Use the layout definition if provided, otherwise generate one
    const layout =
      layoutDefinition ||
      generateLayoutDefinition(sectionId, getFieldsBySection(sectionId));

    if (layout && layout.rows) {
      const tbody = tableElement.querySelector("tbody");

      // Clear existing content
      tbody.innerHTML = "";

      // Generate rows based on layout definition
      layout.rows.forEach((rowDef) => {
        const rowElement = document.createElement("tr");
        rowElement.setAttribute("data-id", rowDef.id);

        // Generate cells based on layout definition
        rowDef.cells.forEach((cellDef, index) => {
          // Check if this is column C (description column) with content but no label
          if (
            index === 2 &&
            cellDef.content &&
            cellDef.type === "label" &&
            !cellDef.label
          ) {
            // Convert to label format
            cellDef.label = cellDef.content;
            delete cellDef.content;
            delete cellDef.type;
          }

          const cellElement = document.createElement("td");

          // Apply column class for debugging
          const colLetter = String.fromCharCode(97 + index); // a, b, c, etc.
          cellElement.classList.add(`col-${colLetter}`);

          // Add specific classes
          if (index === 0) {
            // Column A - apply classes and attributes first
            if (cellDef.classes && Array.isArray(cellDef.classes)) {
              cellDef.classes.forEach((className) => {
                cellElement.classList.add(className);
              });
            }
            if (cellDef.attributes && typeof cellDef.attributes === "object") {
              Object.entries(cellDef.attributes).forEach(([key, value]) => {
                cellElement.setAttribute(key, value);
              });
            }

            // Then check for expandable row triggers
            let isExpandableTrigger = false;
            if (
              window.OBC &&
              window.OBC.ExpandableRows &&
              window.OBC.ExpandableRows.processExpandableTriggerCell
            ) {
              isExpandableTrigger =
                window.OBC.ExpandableRows.processExpandableTriggerCell(
                  cellElement,
                  cellDef,
                  rowDef.id,
                  sectionId,
                );
            }

            // Only process normal content if this isn't an expandable trigger
            if (!isExpandableTrigger) {
              // Column A - populate with content if provided
              if (cellDef.content) {
                cellElement.innerHTML = cellDef.content;
              }
            }
          } else if (index === 1) {
            // ID column
            cellElement.textContent = rowDef.id;
          } else if (index === 2) {
            // Description column
            cellElement.textContent = cellDef.label || "";
          } else {
            // Value columns with enhanced dropdown handling
            if (cellDef.fieldId) {
              const fieldId = cellDef.fieldId;
              cellElement.setAttribute("data-field-id", fieldId);

              if (cellDef.type === "dropdown" || cellDef.dropdownId) {
                // Create a select element
                const selectElement = document.createElement("select");
                selectElement.className = "form-select form-select-sm";
                selectElement.setAttribute("data-field-id", fieldId);

                if (cellDef.dropdownId) {
                  selectElement.setAttribute(
                    "data-dropdown-id",
                    cellDef.dropdownId,
                  );
                }

                cellElement.appendChild(selectElement);
              } else if (
                cellDef.type === "year_slider" ||
                cellDef.type === "percentage" ||
                cellDef.type === "coefficient" ||
                cellDef.type === "coefficient_slider"
              ) {
                // For sliders, just create a placeholder that will be replaced by initializeSliders
                cellElement.classList.add("slider-cell");
                cellElement.textContent = cellDef.value || "0";

                // Preserve attributes for slider initialization
                if (cellDef.min)
                  cellElement.setAttribute("data-min", cellDef.min);
                if (cellDef.max)
                  cellElement.setAttribute("data-max", cellDef.max);
                if (cellDef.step)
                  cellElement.setAttribute("data-step", cellDef.step);
                cellElement.setAttribute("data-type", cellDef.type);
              } else if (cellDef.type === "generic_slider") {
                // Generic slider - similar setup but no value display needed here
                cellElement.classList.add("slider-cell");
                // Render just the slider input placeholder
                cellElement.innerHTML = `<input type="range" class="form-range area-adjust-slider" data-field-id="${fieldId}">`; // Use class from Section02 definition
                // Preserve attributes for slider initialization
                if (cellDef.min !== undefined)
                  cellElement.setAttribute("data-min", cellDef.min);
                if (cellDef.max !== undefined)
                  cellElement.setAttribute("data-max", cellDef.max);
                if (cellDef.step !== undefined)
                  cellElement.setAttribute("data-step", cellDef.step);
                if (cellDef.value !== undefined)
                  cellElement.setAttribute("data-value", cellDef.value); // Store default value
                cellElement.setAttribute("data-type", cellDef.type);
              } else if (
                cellDef.type === "calculated" ||
                cellDef.fieldId.startsWith("cf_")
              ) {
                cellElement.classList.add("calculated-value");
                cellElement.textContent = cellDef.value || "0";
              } else if (
                cellDef.type === "derived" ||
                cellDef.fieldId.startsWith("dv_")
              ) {
                cellElement.classList.add("derived-value");
                cellElement.textContent = cellDef.value || "0";
              } else if (cellDef.type === "editable") {
                cellElement.classList.add("editable", "user-input");
                cellElement.textContent = cellDef.value || "0";
                cellElement.setAttribute("contenteditable", "true");
              } else if (cellDef.type === "num-editable") {
                cellElement.classList.add(
                  "editable",
                  "user-input",
                  "numeric-field",
                );
                cellElement.textContent = cellDef.value || "0.00";
                cellElement.setAttribute("contenteditable", "true");
                cellElement.setAttribute("data-type", "numeric");
              } else if (cellDef.type === "number") {
                // Create a number input element
                const inputElement = document.createElement("input");
                inputElement.type = "number";
                inputElement.className =
                  "form-control form-control-sm user-input"; // Keep the styling for blue cursor
                inputElement.setAttribute("data-field-id", fieldId);
                inputElement.value = cellDef.value || "0.00";

                // Add step attribute if defined in cellDef (optional)
                if (cellDef.step !== undefined) {
                  inputElement.step = cellDef.step;
                }
                // Add min/max attributes if defined (optional)
                if (cellDef.min !== undefined) {
                  inputElement.min = cellDef.min;
                }
                if (cellDef.max !== undefined) {
                  inputElement.max = cellDef.max;
                }

                // Simple change handler to update state manager
                inputElement.addEventListener("change", function () {
                  if (window.OBC && window.OBC.StateManager) {
                    window.OBC.StateManager.setValue(
                      fieldId,
                      this.value,
                      "user-modified",
                    );
                  }
                });

                cellElement.appendChild(inputElement);
              }

              // Handle other data attributes
              if (
                cellDef.type === "percentage" ||
                cellDef.type === "coefficient" ||
                cellDef.type === "year_slider"
              ) {
                cellElement.setAttribute("data-type", cellDef.type);
              }

              // Apply any custom classes to this cell
              if (cellDef.classes && Array.isArray(cellDef.classes)) {
                cellDef.classes.forEach((className) => {
                  cellElement.classList.add(className);
                });
              }
            } else if (cellDef.content) {
              cellElement.textContent = cellDef.content;

              // --- ADDED DEBUG LOG for initial textContent ---
              if (cellDef.fieldId === "d_119" || cellDef.fieldId === "j_115") {
                console.log(
                  `[FieldManager] Setting initial textContent for ${cellDef.fieldId} to: "${cellElement.textContent}"`,
                );
              }
              // --- END DEBUG LOG ---

              // Add calculated-value class if this is a calculated cell
              if (cellDef.isCalculated) {
                cellElement.classList.add("calculated-value");
              }

              // Add reference-value class if this is a reference value
              if (cellDef.isReference) {
                cellElement.classList.add("reference-value");
              }

              // Apply any custom classes to this cell
              if (cellDef.classes && Array.isArray(cellDef.classes)) {
                cellDef.classes.forEach((className) => {
                  cellElement.classList.add(className);
                });
              }
            }

            // Handle colSpan
            if (cellDef.span && cellDef.span > 1) {
              cellElement.colSpan = cellDef.span;
            }

            // Handle additional attributes
            if (cellDef.attributes && typeof cellDef.attributes === "object") {
              Object.entries(cellDef.attributes).forEach(([key, value]) => {
                cellElement.setAttribute(key, value);
              });
            }
          }

          rowElement.appendChild(cellElement);
        });

        tbody.appendChild(rowElement);
      });
    }

    // Add event listeners for dropdowns with dependencies
    const fields = getFieldsBySection(sectionId);
    Object.values(fields).forEach((field) => {
      if (field.type === "dropdown" && field.dropdownId) {
        const dropdown = document.querySelector(
          `[data-dropdown-id="${field.dropdownId}"]`,
        );
        if (dropdown) {
          dropdown.addEventListener("change", () => {
            const fieldId = Object.keys(fields).find(
              (key) => fields[key] === field,
            );
            if (fieldId) {
              updateDependentDropdowns(fieldId);
            }
          });
        }
      }
    });
  }

  /**
   * Generate a layout definition based on field definitions if none provided
   * @param {string} sectionId - Section ID
   * @param {Object} fields - Field definitions
   * @returns {Object} - Layout definition
   */
  function generateLayoutDefinition(sectionId, fields) {
    // Group fields by row ID
    const rowGroups = {};

    Object.entries(fields).forEach(([fieldId, field]) => {
      // Extract row ID (e.g., "d_12" -> "12")
      const rowId = field.rowId || fieldId.split("_")[1];

      if (!rowGroups[rowId]) {
        rowGroups[rowId] = [];
      }

      rowGroups[rowId].push({
        fieldId,
        field,
      });
    });

    // Convert groups to layout definition
    const rows = Object.entries(rowGroups).map(([rowId, fieldEntries]) => {
      // Sort field entries by column index
      fieldEntries.sort((a, b) => {
        const colA = a.fieldId.split("_")[0].charCodeAt(0); // 'd' -> 100
        const colB = b.fieldId.split("_")[0].charCodeAt(0); // 'g' -> 103
        return colA - colB;
      });

      // Create cells
      const cells = [
        {}, // Empty column A
        {}, // ID column B (auto-populated)
        { label: rowId }, // Description column C
      ];

      // Add value cells
      fieldEntries.forEach((entry) => {
        cells.push({
          fieldId: entry.fieldId,
          label: entry.field.label,
          type: entry.field.type,
          value: entry.field.defaultValue,
          dropdownId: entry.field.dropdownId,
        });
      });

      return {
        id: rowId,
        cells,
      };
    });

    return {
      rows,
    };
  }

  /**
   * Initialize sliders for a section
   * Includes explicit cleanup and MutationObserver to prevent incorrect editable state.
   * @param {string} sectionId - Section ID
   */
  function initializeSliders(sectionId) {
    const fields = getFieldsBySection(sectionId);

    Object.entries(fields).forEach(([fieldId, field]) => {
      if (
        field.type === "year_slider" ||
        field.type === "percentage" ||
        field.type === "coefficient" ||
        field.type === "coefficient_slider"
      ) {
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!element) return;

        // CRITICAL FIX: Explicitly remove any contenteditable attributes or classes
        // that might have been incorrectly applied to slider cells
        element.removeAttribute("contenteditable");
        element.classList.remove("editable", "user-input");

        // Create range input element
        const rangeInput = document.createElement("input");
        rangeInput.type = "range";
        rangeInput.className = "form-range";
        rangeInput.setAttribute("data-field-id", fieldId);

        // Set range attributes
        rangeInput.min =
          field.min !== undefined
            ? field.min
            : field.type === "percentage" || field.type === "coefficient_slider"
              ? 0
              : 0;
        rangeInput.max =
          field.max !== undefined
            ? field.max
            : field.type === "percentage" || field.type === "coefficient_slider"
              ? field.type === "coefficient_slider"
                ? 1
                : 100
              : 100;
        rangeInput.step =
          field.step !== undefined
            ? field.step
            : field.type === "percentage"
              ? 5
              : field.type === "coefficient_slider"
                ? 0.01
                : 5;
        rangeInput.value =
          field.defaultValue !== undefined
            ? parseFloat(field.defaultValue)
            : field.min || 0;

        // Create display element
        const displaySpan = document.createElement("span");
        displaySpan.className = "slider-value ms-2";

        // Create container for slider and value
        const sliderContainer = document.createElement("div");
        sliderContainer.className =
          "slider-container d-flex align-items-center";

        // Update display when slider changes
        rangeInput.addEventListener("input", function () {
          const value = this.value;
          let displayValue = value;

          if (field.type === "percentage") {
            let valToFormat = parseFloat(value);
            // If it's a 0-1 coefficient specifically marked with displayFactor to be shown as 0-100%
            if (
              field.displayFactor === 100 &&
              valToFormat >= (field.min || 0) &&
              valToFormat <= (field.max || 1) &&
              (field.max || 1) <= 1
            ) {
              // valToFormat is already 0-1, formatNumber('percent-Xdp') expects this decimal
            } else {
              // For standard 0-100% sliders, convert current value (0-100) to decimal (0-1) for formatNumber
              valToFormat = valToFormat / 100;
            }
            displayValue = window.OBC.formatNumber(valToFormat, "percent-0dp");
          } else if (field.type === "coefficient_slider") {
            displayValue = window.OBC.formatNumber(
              parseFloat(value),
              "number-2dp",
            );
          } else if (field.type === "year_slider") {
            displayValue = window.OBC.formatNumber(
              parseFloat(value),
              "integer-nocomma",
            );
          }

          displaySpan.textContent = displayValue;

          // Update state manager
          if (OBC.StateManager && OBC.StateManager.setValue) {
            OBC.StateManager.setValue(fieldId, value, "user-modified");
          }
        });

        // Set initial display value
        let initialDisplayValue = rangeInput.value;
        if (field.type === "percentage") {
          let valToFormat = parseFloat(rangeInput.value);
          if (
            field.displayFactor === 100 &&
            valToFormat >= (field.min || 0) &&
            valToFormat <= (field.max || 1) &&
            (field.max || 1) <= 1
          ) {
            // Value is already in correct range (0-1)
          } else {
            valToFormat = valToFormat / 100;
          }
          initialDisplayValue = window.OBC.formatNumber(
            valToFormat,
            "percent-0dp",
          );
        } else if (field.type === "coefficient_slider") {
          initialDisplayValue = window.OBC.formatNumber(
            parseFloat(rangeInput.value),
            "number-2dp",
          );
        } else if (field.type === "year_slider") {
          initialDisplayValue = window.OBC.formatNumber(
            parseFloat(rangeInput.value),
            "integer-nocomma",
          );
        }
        displaySpan.textContent = initialDisplayValue;

        // Replace original content with slider
        sliderContainer.appendChild(rangeInput);
        sliderContainer.appendChild(displaySpan);
        element.innerHTML = "";
        element.appendChild(sliderContainer);

        // CRITICAL PROTECTION: Apply a mutation observer to ensure the slider cell
        // never gets the contenteditable attribute applied after initialization
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (
              mutation.type === "attributes" &&
              (mutation.attributeName === "contenteditable" ||
                mutation.attributeName === "class")
            ) {
              // If contenteditable is being added, remove it
              if (element.hasAttribute("contenteditable")) {
                element.removeAttribute("contenteditable");
              }
              // If editable class is being added, remove it
              if (
                element.classList.contains("editable") ||
                element.classList.contains("user-input")
              ) {
                element.classList.remove("editable", "user-input");
              }
            }
          });
        });

        // Start observing the slider cell for attribute changes
        observer.observe(element, { attributes: true });
      } else if (field.type === "generic_slider") {
        // Existing logic for generic_slider - ensure it also gets protected if needed
        const element = document.querySelector(`[data-field-id="${fieldId}"]`);
        if (!element) return;

        // Explicit cleanup for generic sliders too
        element.removeAttribute("contenteditable");
        element.classList.remove("editable", "user-input");

        // Create range input element
        const rangeInput = document.createElement("input");
        rangeInput.type = "range";
        rangeInput.className = "form-range area-adjust-slider"; // Use class from Section02 definition
        rangeInput.setAttribute("data-field-id", fieldId);

        // Set range attributes from field definition
        rangeInput.min = field.min !== undefined ? field.min : -100;
        rangeInput.max = field.max !== undefined ? field.max : 100;
        rangeInput.step = field.step !== undefined ? field.step : 1;
        rangeInput.value =
          field.defaultValue !== undefined ? field.defaultValue : 0; // Default to 0 adjustment

        // Generic slider doesn't need a separate display span
        // Replace original content with just the slider
        element.innerHTML = "";
        element.appendChild(rangeInput);

        // Add event listener (defined in Section02.js)
        // Note: The actual event handling logic resides in the section module (Section02.js)
        // This ensures the FieldManager remains generic.

        // Add MutationObserver protection here too if generic sliders face similar issues
        // const genericObserver = new MutationObserver(...);
        // genericObserver.observe(element, { attributes: true });
      }
    });
  }

  /**
   * Initialize dropdowns from field definitions
   * @param {string} sectionId - Section ID
   */
  function initializeDropdownsFromFields(sectionId) {
    const fields = getFieldsBySection(sectionId);

    Object.entries(fields).forEach(([fieldId, field]) => {
      if (field.type === "dropdown" && field.dropdownId) {
        const selectElement = document.querySelector(
          `[data-dropdown-id="${field.dropdownId}"]`,
        );
        if (!selectElement) return;

        // Clear existing options
        selectElement.innerHTML = "";

        // Get options from field definition or dropdown registry
        let options = [];
        if (field.options) {
          options = field.options;
        } else if (field.getOptions) {
          try {
            options = field.getOptions();
          } catch (error) {
            console.error(`Error getting options for field ${fieldId}:`, error);
            options = [];
          }
        } else {
          options = getDropdownOptions(field.dropdownId);
        }

        if (!options || options.length === 0) {
          // console.warn(`No options found for dropdown ${field.dropdownId}`);

          // Add a placeholder option
          const placeholderOption = document.createElement("option");
          placeholderOption.value = "";
          placeholderOption.textContent = "No options available";
          selectElement.appendChild(placeholderOption);
          return;
        }

        // Add options to select element
        options.forEach((option) => {
          const optionEl = document.createElement("option");

          // Handle both object and primitive options
          const value = typeof option === "object" ? option.value : option;
          const text =
            typeof option === "object" ? option.name || option.value : option;

          optionEl.value = value;
          optionEl.textContent = text;

          // Select default value if it matches
          if (value === field.defaultValue) {
            optionEl.selected = true;
          }

          selectElement.appendChild(optionEl);
        });

        // Add change listener to update state
        selectElement.addEventListener("change", function () {
          if (OBC.StateManager && OBC.StateManager.setValue) {
            OBC.StateManager.setValue(fieldId, this.value, "user-modified");
          }

          // Update dependent dropdowns if needed
          updateDependentDropdowns(fieldId);
        });
      }
    });
  }

  /**
   * Update dropdowns that depend on another field
   * @param {string} fieldId - Field ID that changed
   */
  function updateDependentDropdowns(fieldId) {
    // Find all fields that depend on this field
    const dependentFields = Object.values(allFields).filter(
      (f) =>
        f.type === "dropdown" &&
        f.dependencies &&
        f.dependencies.includes(fieldId),
    );

    dependentFields.forEach((depField) => {
      const dependentId = Object.keys(allFields).find(
        (id) => allFields[id] === depField,
      );
      if (!dependentId) return;

      const dropdown = document.querySelector(
        `[data-field-id="${dependentId}"]`,
      );
      if (!dropdown) return;

      // Get the value of the field this dropdown depends on
      const dependencyValue =
        OBC.StateManager?.getValue(fieldId) ||
        document.querySelector(`[data-field-id="${fieldId}"]`)?.value;

      // Get new options using the getOptions function
      let options = [];
      if (depField.getOptions) {
        try {
          options = depField.getOptions(dependencyValue);
        } catch (error) {
          console.error(
            `Error getting dependent options for ${dependentId}:`,
            error,
          );
        }
      }

      // Clear existing options
      dropdown.innerHTML = "";

      // Add new options
      if (options && options.length > 0) {
        options.forEach((option) => {
          const optionEl = document.createElement("option");
          const value = typeof option === "object" ? option.value : option;
          const text =
            typeof option === "object" ? option.name || option.value : option;

          optionEl.value = value;
          optionEl.textContent = text;
          dropdown.appendChild(optionEl);
        });
      } else {
        // Add a placeholder if no options available
        const placeholderOption = document.createElement("option");
        placeholderOption.value = "";
        placeholderOption.textContent = "No options available";
        dropdown.appendChild(placeholderOption);
      }
    });
  }

  /**
   * Initialize a dropdown with options
   * @param {HTMLElement} dropdownEl - Dropdown element
   * @param {Object} config - Dropdown configuration
   * @param {Array} options - Options for the dropdown
   */
  function initializeDropdown(dropdownEl, config, options) {
    if (!dropdownEl || !config) return;

    // Clear existing options
    dropdownEl.innerHTML = "";

    // Add default empty option unless this is a special dropdown
    const isCurrentFutureToggle =
      dropdownEl.getAttribute("data-dropdown-id") === "dd_h_20";

    if (!isCurrentFutureToggle) {
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = `Select ${config.tooltip || ""}`;
      dropdownEl.appendChild(defaultOption);
    }

    // Add options from the options list
    if (options && options.length > 0) {
      options.forEach((option) => {
        const optionEl = document.createElement("option");
        // Support both { value, name } and simple string options
        const value = typeof option === "object" ? option.value : option;
        const text =
          typeof option === "object" ? option.name || option.value : option;

        optionEl.value = value;
        optionEl.textContent = text;
        dropdownEl.appendChild(optionEl);

        // If this is the present/future toggle, select "Present" by default
        if (isCurrentFutureToggle && value === "Present") {
          optionEl.selected = true;
        }
      });
    } else {
      // Add a placeholder if no options available
      const placeholderOption = document.createElement("option");
      placeholderOption.value = "";
      placeholderOption.textContent = "No options available";
      dropdownEl.appendChild(placeholderOption);
    }
  }

  /**
   * NEW FUNCTION: Updates the display of a specific field in the DOM.
   * This function is intended to be called by StateManager listeners or ReferenceToggle.
   * @param {string} fieldId - The ID of the field to update.
   * @param {string} displayValue - The value to display (should be pre-formatted).
   * @param {Object} fieldDef - The field definition object (from getAllFields).
   */
  function updateFieldDisplay(fieldId, displayValue, fieldDef) {
    if (!fieldDef) {
      return;
    }

    const element =
      document.getElementById(fieldId) ||
      document.querySelector(`[data-field-id='${fieldId}']`);
    if (!element) {
      return;
    }

    // Handle different field types
    switch (fieldDef.type) {
      case "dropdown":
        if (element.tagName === "SELECT") {
          element.value = displayValue;
        } else {
          // Handle cases where dropdown is wrapped (e.g. in a div)
          const selectElement = element.querySelector("select");
          if (selectElement) selectElement.value = displayValue;
        }
        break;
      case "editable":
      case "number": // Assuming 'number' type fields are also contenteditable or simple inputs
        if (element.hasAttribute("contenteditable")) {
          // To minimize risk of triggering blur, check if value actually changed
          if (element.textContent !== displayValue) {
            element.textContent = displayValue;
          }
        } else if (element.tagName === "INPUT") {
          if (element.value !== displayValue) {
            element.value = displayValue;
          }
        } else {
          // Fallback for other simple display elements
          if (element.textContent !== displayValue) {
            element.textContent = displayValue;
          }
        }
        break;
      case "year_slider":
      case "percentage": {
        // For sliders, the main element might be a container.
        // The actual input (type=range) and display span are often sub-elements.
        const sliderInput = element.matches('input[type="range"]')
          ? element
          : element.querySelector('input[type="range"]');
        const displaySpan =
          element.parentNode.querySelector(
            `span[data-field-id='${fieldId}-value']`,
          ) || element.querySelector(`span`);

        if (sliderInput) {
          // Note: displayValue for a slider should be the raw numeric value.
          // The slider's own event handler usually formats it for the displaySpan.
          if (sliderInput.value !== displayValue) {
            sliderInput.value = displayValue;
          }
        }
        if (displaySpan) {
          // Attempt to format if a global formatter is available, otherwise set directly
          let formattedSliderValue = displayValue;
          if (window.OBC && window.OBC.formatNumber) {
            if (fieldDef.type === "percentage") {
              // Assuming displayValue is '20' for 20% for the input, but formatNumber expects 0.20 for 'percent'
              // This part might need adjustment based on how slider values are stored/passed.
              // For now, let's assume displayValue is ready for direct display or needs simple formatting.
              formattedSliderValue = window.OBC.formatNumber(
                parseFloat(displayValue) / 100,
                "percent-0dp",
              ); // Example: 20 -> 20%
            } else {
              formattedSliderValue = window.OBC.formatNumber(
                parseFloat(displayValue),
                "number-2dp",
              ); // Default for others
            }
          }
          if (displaySpan.textContent !== formattedSliderValue) {
            displaySpan.textContent = formattedSliderValue;
          }
        }
        break;
      }
      case "coefficient_slider": {
        // For sliders, the main element might be a container.
        // The actual input (type=range) and display span are often sub-elements.
        const sliderInput = element.matches('input[type="range"]')
          ? element
          : element.querySelector('input[type="range"]');
        const displaySpan =
          element.parentNode.querySelector(
            `span[data-field-id='${fieldId}-value']`,
          ) || element.querySelector(`span`);

        if (sliderInput) {
          // Note: displayValue for a slider should be the raw numeric value.
          // The slider's own event handler usually formats it for the displaySpan.
          if (sliderInput.value !== displayValue) {
            sliderInput.value = displayValue;
          }
        }
        if (displaySpan) {
          // Attempt to format if a global formatter is available, otherwise set directly
          let formattedSliderValue = displayValue;
          if (window.OBC && window.OBC.formatNumber) {
            if (fieldDef.type === "percentage") {
              // Assuming displayValue is '20' for 20% for the input, but formatNumber expects 0.20 for 'percent'
              // This part might need adjustment based on how slider values are stored/passed.
              // For now, let's assume displayValue is ready for direct display or needs simple formatting.
              formattedSliderValue = window.OBC.formatNumber(
                parseFloat(displayValue) / 100,
                "percent-0dp",
              ); // Example: 20 -> 20%
            } else {
              formattedSliderValue = window.OBC.formatNumber(
                parseFloat(displayValue),
                "number-2dp",
              ); // Default for others
            }
          }
          if (displaySpan.textContent !== formattedSliderValue) {
            displaySpan.textContent = formattedSliderValue;
          }
        }
        break;
      }
      case "generic_slider": {
        // For sliders, the main element might be a container.
        // The actual input (type=range) and display span are often sub-elements.
        const sliderInput = element.matches('input[type="range"]')
          ? element
          : element.querySelector('input[type="range"]');
        // Generic sliders in some earlier versions might not have had a separate displaySpan for their value,
        // if they did, it would be found similarly to other sliders.
        // const displaySpan = element.parentNode.querySelector(...) || element.querySelector(...);

        if (sliderInput) {
          if (sliderInput.value !== displayValue) {
            sliderInput.value = displayValue;
          }
        }
        // if (displaySpan && displaySpan.textContent !== displayValue) { // If generic had a span
        // displaySpan.textContent = displayValue;
        // }
        break;
      }
      case "calculated":
      case "derived":
      default: {
        // Includes simple text display fields not covered above
        if (element.textContent !== displayValue) {
          element.textContent = displayValue;
        }
        break;
      }
    }
  }

  /**
   * Update dropdown options dynamically (for classification filtering)
   * @param {string} fieldId - Field ID to update
   * @param {Array} newOptions - New options array
   */
  function updateDropdownOptions(fieldId, newOptions) {
    // Try dropdown ID first (dd_fieldId), then fallback to field ID
    const dropdownId = `dd_${fieldId}`;
    let element = document.querySelector(`[data-dropdown-id="${dropdownId}"]`);

    if (!element) {
      element = document.querySelector(`[data-field-id="${fieldId}"]`);
    }

    if (!element || element.tagName !== "SELECT") {
      console.warn(
        `updateDropdownOptions: No select element found for ${fieldId} (tried ${dropdownId} and ${fieldId})`,
      );
      return;
    }

    // Store current selection
    const currentValue = element.value;

    // Clear existing options
    element.innerHTML = "";

    // Add new options
    newOptions.forEach((option) => {
      const optionEl = document.createElement("option");
      const value = typeof option === "object" ? option.value : option;
      const text =
        typeof option === "object" ? option.name || option.value : option;

      optionEl.value = value;
      optionEl.textContent = text;
      element.appendChild(optionEl);
    });

    // Restore selection if still valid
    const isCurrentValueValid = newOptions.some((option) => {
      const value = typeof option === "object" ? option.value : option;
      return value === currentValue;
    });

    if (isCurrentValueValid) {
      element.value = currentValue;
    } else {
      // Reset to default if current value is no longer valid
      element.value = "-";
    }
  }

  // Public API
  return {
    // Initialization
    initialize: function () {
      // Make sure section modules namespace exists
      window.OBC.SectionModules = window.OBC.SectionModules || {};

      // Initialize all sections
      initializeSections();

      // Make fields available to other modules
      window.OBC.fields = getAllFields();

      return this;
    },

    // Field definitions access
    getAllFields,
    getFieldsBySection,
    getField,
    getDropdownOptions,
    getAllUserEditableFields,

    // Section handling
    getSections: function () {
      return sections;
    },
    getLayoutForSection,

    // Rendering
    generateSectionContent,
    renderSection,
    renderAllSections,

    // UI Initialization
    initializeDropdownsFromFields,
    initializeSliders,
    initializeDropdown,
    updateDependentDropdowns,
    updateDropdownOptions,
    initializeSectionEventHandlers,
    updateFieldDisplay,
  };
})();

// Initialize when the document is ready
document.addEventListener("DOMContentLoaded", function () {
  // Initialize and load all section modules
  OBC.FieldManager.initialize();

  // Render all sections
  OBC.FieldManager.renderAllSections();
});
