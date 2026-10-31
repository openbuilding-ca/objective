/**
 * 4012-Section08.js
 * Indoor Air Quality (Section 8) module for TEUI Calculator 4.012
 *
 * REFACTORED: Uses the self-contained DualState architecture proven in Section 03.
 * This pattern provides robust state isolation for Target and Reference modes.
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};
window.TEUI.sect08 = window.TEUI.sect08 || {};

window.TEUI.SectionModules.sect08 = (function () {
  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

  //==========================================================================
  // HELPER FUNCTIONS
  //==========================================================================

  // getFieldFormat and setElementClass remain largely the same, but ensure they respect the current mode
  function getFieldFormat(fieldId) {
    const formatMap = {
      d_56: "number-0dp",
      d_57: "number-0dp",
      d_58: "number-0dp",
      d_59: "number-0dp",
      i_59: "number-0dp",
      d_60: "number-2dp-comma",
      k_56: "number-0dp",
      k_57: "number-0dp",
      k_58: "number-0dp",
      m_56: "percent-0dp",
      m_57: "percent-0dp",
      m_58: "percent-0dp",
      m_59: "raw", // Shows "30-60%" range text
      n_56: "raw",
      n_57: "raw",
      n_58: "raw",
      n_59: "raw",
    };
    return formatMap[fieldId] || "number-0dp";
  }

  function setElementClass(fieldId, isCompliant) {
    // Apply styling in both Target and Reference modes for S08
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      element.classList.remove("checkmark", "warning");
      element.classList.add(isCompliant ? "checkmark" : "warning");
    }
  }

  //==========================================================================
  // EVENT HANDLING
  // FieldManager handles all user input (sliders, editables, dropdowns)
  // and routes through writeUserInput → SM → graph → DOMBridge.
  //==========================================================================
  function initializeEventHandlers() {
    // FieldManager already handles slider input/change and editable blur
    // for all sections. No section-level delegation needed.
  }

  //==========================================================================
  // LAYOUT & INITIALIZATION
  //==========================================================================
  const sectionRows = {
    header: {
      id: "08-ID",
      rowId: "08-ID",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "Targeted", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "Guidance Limits", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: {
          content: "% per Health Canada/NBC",
          classes: ["section-subheader"],
        },
        n: { content: "Status", classes: ["section-subheader"] },
      },
    },
    56: {
      id: "A.2",
      label: "Radon (annual avg.)",
      cells: {
        c: { label: "Radon (annual avg.)" },
        d: {
          fieldId: "d_56",
          semanticPath: "airQuality.radon.target",
          type: "editable",
          value: "50",
          classes: ["user-input"],
          label: "Radon Target: Bq/m³",
        },
        e: { content: "Bq/m³" },
        k: {
          fieldId: "k_56",
          semanticPath: "airQuality.radon.limit",
          type: "calculated",
          value: "150",
          label: "Radon Reference Limit: Bq/m³",
        },
        l: { content: "Bq/m³" },
        m: {
          fieldId: "m_56",
          semanticPath: "airQuality.radon.compliance",
          type: "calculated",
          value: "0%",
          dependencies: ["d_56", "k_56"],
          label: "Radon Compliance: %",
        },
        n: {
          fieldId: "n_56",
          semanticPath: "airQuality.radon.status",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
          dependencies: ["m_56"],
          label: "Radon Compliance Status",
        },
      },
    },
    57: {
      id: "A.3",
      label: "CO2 (annual avg.)",
      cells: {
        c: { label: "CO2 (annual avg.)" },
        d: {
          fieldId: "d_57",
          semanticPath: "airQuality.co2.target",
          type: "editable",
          value: "550",
          classes: ["user-input"],
          label: "CO2 Target: ppm",
        },
        e: { content: "ppm" },
        k: {
          fieldId: "k_57",
          semanticPath: "airQuality.co2.limit",
          type: "calculated",
          value: "1000",
          label: "CO2 Reference Limit: ppm",
        },
        l: { content: "ppm" },
        m: {
          fieldId: "m_57",
          semanticPath: "airQuality.co2.compliance",
          type: "calculated",
          value: "0%",
          dependencies: ["d_57", "k_57"],
          label: "CO2 Compliance: %",
        },
        n: {
          fieldId: "n_57",
          semanticPath: "airQuality.co2.status",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
          dependencies: ["m_57"],
          label: "CO2 Compliance Status",
        },
      },
    },
    58: {
      id: "A.4",
      label: "TVOC (annual avg.)",
      cells: {
        c: { label: "TVOC (annual avg.)" },
        d: {
          fieldId: "d_58",
          semanticPath: "airQuality.tvoc.target",
          type: "editable",
          value: "100",
          classes: ["user-input"],
          label: "TVOC Target: ppm",
        },
        e: { content: "ppm" },
        k: {
          fieldId: "k_58",
          semanticPath: "airQuality.tvoc.limit",
          type: "calculated",
          value: "400",
          label: "TVOC Reference Limit: ppm",
        },
        l: { content: "ppm" },
        m: {
          fieldId: "m_58",
          semanticPath: "airQuality.tvoc.compliance",
          type: "calculated",
          value: "0%",
          dependencies: ["d_58", "k_58"],
          label: "TVOC Compliance: %",
        },
        n: {
          fieldId: "n_58",
          semanticPath: "airQuality.tvoc.status",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
          dependencies: ["m_58"],
          label: "TVOC Compliance Status",
        },
      },
    },
    59: {
      id: "A.5.1",
      label: "Indoor Heating Season Avg.",
      cells: {
        c: { label: "Indoor Heating Season Avg." },
        d: {
          fieldId: "d_59",
          semanticPath: "airQuality.humidity.heatingTarget",
          type: "percentage",
          value: "45",
          min: 0,
          max: 100,
          step: 1,
          classes: ["user-input"],
          tooltip: true, // RH% Annual Average
          label: "RH Heating Season Target: %",
        },
        e: { content: "% RH" },
        f: { content: "A.5.2" },
        g: {
          fieldId: "g_59",
          semanticPath: "airQuality.humidity.coolingLatentBasis",
          type: "dropdown",
          dropdownId: "dd_g_59",
          value: "F280",
          tooltip: true,
          options: [
            { value: "F280", name: "F280 50%" },
            { value: "Target", name: "Target RH" },
          ],
          label: "Indoor State for the Latent Cooling Load",
        },
        h: { content: "Indoor Cooling Season Avg." },
        i: {
          fieldId: "i_59",
          semanticPath: "airQuality.humidity.coolingTarget",
          type: "percentage",
          value: "45",
          min: 0,
          max: 100,
          step: 1,
          classes: ["user-input"],
          tooltip: true, // RH% Cooling Season Average
          label: "RH Cooling Season Target: %",
        },
        j: { content: "% RH" },
        k: {
          fieldId: "k_59",
          semanticPath: "airQuality.humidity.limit",
          type: "calculated",
          value: "30-60",
          label: "RH Reference Range: %",
        },
        l: { content: "%" },
        m: {
          fieldId: "m_59",
          semanticPath: "airQuality.humidity.range",
          type: "calculated",
          value: "30-60%",
          dependencies: ["d_59", "i_59"],
          label: "RH Acceptable Range",
        },
        n: {
          fieldId: "n_59",
          semanticPath: "airQuality.humidity.status",
          type: "calculated",
          value: "✓",
          classes: ["checkmark"],
          dependencies: ["m_59"],
          label: "RH Compliance Status",
        },
      },
    },
    60: {
      id: "A.6",
      label: "Wood Emissions Offset (Calculated)",
      cells: {
        c: { label: "Wood Emissions Offset (Calculated from Target Wood Use)" },
        d: {
          fieldId: "d_60",
          type: "calculated",
          value: "0.00",
          tooltip: true,
          dependencies: ["d_31", "k_31"],
          conditionalDeps: ["k_31"], // Only read k_31 when d_31 > 0
          label: "Atmospheric Offsets: MT/yr CO2e",
        },
        e: { content: "MT/yr CO2e" },
      },
    },
  };

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label, // ✅ Proper label resolution
            defaultValue: cell.value || "",
            section: "indoorAirQuality",
            semanticPath: cell.semanticPath || null, // Phase 5: Include semantic path for migration
          };
          // Copy dependencies if present
          if (cell.dependencies) {
            fields[cell.fieldId].dependencies = cell.dependencies;
          }
          if (cell.conditionalDeps) {
            fields[cell.fieldId].conditionalDeps = cell.conditionalDeps;
          }
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
          if (cell.dropdownId) {
            fields[cell.fieldId].dropdownId = cell.dropdownId;
            fields[cell.fieldId].options = cell.options;
          }
        }
      });
    });
    return fields;
  }
  // The section's dropdowns (g_59, the latent basis) - as Section 13's
  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options;
        }
      });
    });
    return options;
  }
  function getLayout() {
    const layoutRows = [];
    if (sectionRows["header"])
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    Object.keys(sectionRows).forEach(key => {
      if (key !== "header") layoutRows.push(createLayoutRow(sectionRows[key]));
    });
    return { rows: layoutRows };
  }
  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] };
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
    columns.forEach(col => {
      const cell = row.cells?.[col] || {};
      if (col === "c" && !cell.label && row.label) cell.label = row.label;
      rowDef.cells.push(cell);
    });
    return rowDef;
  }

  function onSectionRendered() {
    addStatusStyles();
    initializeEventHandlers();

    // ✅ CRITICAL: Setup S04 listeners for wood offset calculation
    setupS04Listeners();

    // Graph handles all calculations including wood offset dependencies

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  /**
   * Setup listeners for S04 fields that affect d_60 (Wood Offset)
   */
  function setupS04Listeners() {
    // Graph handles cross-section computation via wildcard listener.
  }

  function addStatusStyles() {
    if (!document.getElementById("air-quality-status-styles")) {
      const styleElement = document.createElement("style");
      styleElement.id = "air-quality-status-styles";
      styleElement.textContent = `
        .checkmark { color: #28a745 !important; font-weight: bold; font-size: 1.2em; }
        .warning { color: #dc3545 !important; font-weight: bold; font-size: 1.2em; }
      `;
      document.head.appendChild(styleElement);
    }
  }

  return {
    getFields,
    getDropdownOptions,
    getLayout,
    onSectionRendered,
  };
})();
