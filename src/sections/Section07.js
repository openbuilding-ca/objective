/**
 * 4012-Section07.js
 * Water Use (Section 7) module for TEUI Calculator 4.012
 *
 * Refactored to use the standardized dual-engine architecture.
 *
 * ✅ FIXED (Nov 9, 2025): ref_d_63 fallback now uses S09's default (126) instead of 0
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect07 = (function () {
  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

  //==========================================================================
  // MODE-AWARE STATE HELPERS (read/write SM with ref_ prefix in reference mode)
  //==========================================================================

  function getModeValue(fieldId) {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    return window.TEUI.StateManager?.getValue(isRef ? `ref_${fieldId}` : fieldId);
  }

  function setModeValue(fieldId, value, source = "user-modified") {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    const key = isRef ? `ref_${fieldId}` : fieldId;
    if (window.TEUI.StateManager?.setValue) {
      window.TEUI.StateManager.setValue(key, value, source);
    }
  }

  // Helper to get field defaults from sectionRows definition
  function getFieldDefault(fieldId) {
    for (const rowKey in sectionRows) {
      const row = sectionRows[rowKey];
      if (row.cells) {
        for (const cellKey in row.cells) {
          const cell = row.cells[cellKey];
          if (cell.fieldId === fieldId && cell.value !== undefined) {
            return cell.value;
          }
        }
      }
    }
    return null;
  }

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    header: {
      id: "S07-ID",
      rowId: "S07-ID",
      cells: {
        c: { content: "C", classes: ["section-subheader"] },
        d: { content: "Targeted", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "litres/pp/day", classes: ["section-subheader"] },
        i: { content: "litres/yr", classes: ["section-subheader"] },
        j: { content: "Annual kWh/yr", classes: ["section-subheader"] },
        k: { content: "Annual ekWh/yr", classes: ["section-subheader"] },
        l: { content: "L", classes: ["section-subheader"] },
        m: { content: "Ref", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
      },
    },
    49: {
      id: "W.1.0",
      label: "Total Hot+Cold Water Use (Method)",
      cells: {
        c: { label: "Total Hot+Cold Water Use (Method)" },
        d: {
          fieldId: "d_49",
          semanticPath: "waterHeating.method",
          type: "dropdown",
          dropdownId: "d_49",
          value: "User Defined",
          tooltip: true, // DHW/SHW Use Method (lpppd)
          label: "Water Use Method",
          options: [
            "User Defined",
            "By Engineer",
            "PHPP Method",
            "NBC Method",
            "OBC Method",
            "Luxury",
          ],
        },
        e: {
          fieldId: "e_49",
          semanticPath: "waterHeating.userDefinedLpppd",
          type: "editable",
          value: "40.00",
          classes: ["user-input"],
          tooltip: true, // Litres/Per-Person/Day
          label: "User Defined Water Use: l/pp/day",
        },
        f: { content: "lpppd (User Defined)", classes: ["text-left"] },
        h: {
          fieldId: "h_49",
          semanticPath: "waterHeating.totalUse",
          type: "calculated",
          value: "40.00",
          dependencies: ["d_49", "e_49", "j_50", "d_63"],
          conditionalDeps: ["j_50", "d_63"], // Only used in "By Engineer" mode
          label: "Total Water Use: l/pp/day",
        },
        i: {
          fieldId: "i_49",
          semanticPath: "waterHeating.annualUse",
          type: "calculated",
          value: "1,839,600",
          dependencies: ["d_63", "h_49"],
          label: "Annual Water Use: litres/yr",
        },
        j: { content: "Net Emissions", classes: ["text-left"] },
        k: {
          fieldId: "k_49",
          semanticPath: "waterHeating.netEmissions",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_51", "k_54", "l_30", "e_51", "l_28"],
          conditionalDeps: ["k_54", "l_30", "e_51", "l_28"], // Conditional on d_51 system type
          label: "DHW Net Emissions: kgCO2e/yr",
        },
        l: { content: "kgCO2e/yr", classes: ["text-left"] },
        m: {
          fieldId: "m_49",
          semanticPath: "waterHeating.compliance",
          type: "calculated",
          value: "15%",
          dependencies: ["h_49", "ref_h_49"],
          label: "Water Use Compliance: %",
        },
        n: {
          fieldId: "n_49",
          semanticPath: "waterHeating.status",
          type: "calculated",
          value: "✓",
          dependencies: ["m_49"],
          label: "Water Use Compliance Status",
        },
      },
    },
    50: {
      id: "W.1.2",
      label: "DHW Use (40% of W.1.0)",
      cells: {
        c: { label: "DHW Use (40% of W.1.0)" },
        d: { content: "" },
        e: {
          fieldId: "e_50",
          semanticPath: "waterHeating.byEngineerKwh",
          type: "editable",
          value: "10,000.00",
          classes: ["user-input"],
          tooltip: true, // Occupancy-Dependent Calculation
          label: "Engineer Defined SHW/DHW Energy: kWh/yr",
        },
        f: { content: "kWh/yr (IF By Engineer)", classes: ["text-left"] },
        h: {
          fieldId: "h_50",
          semanticPath: "waterHeating.dhwUse",
          type: "calculated",
          value: "16.00",
          dependencies: ["h_49"],
          label: "DHW Use: l/pp/day",
        },
        i: {
          fieldId: "i_50",
          semanticPath: "waterHeating.annualDhwUse",
          type: "calculated",
          value: "735,840",
          dependencies: ["d_63", "h_50"],
          label: "Annual DHW Use: litres/yr",
        },
        j: {
          fieldId: "j_50",
          semanticPath: "waterHeating.energyDemand",
          type: "calculated",
          value: "38,484.43",
          dependencies: ["d_49", "e_50", "h_50", "d_63"],
          conditionalDeps: ["e_50"], // Only used in "By Engineer" mode
          label: "DHW Energy Demand: kWh/yr",
        },
        m: {
          fieldId: "m_50",
          semanticPath: "waterHeating.dhwCompliance",
          type: "calculated",
          value: "15%",
          dependencies: ["h_50", "ref_h_50"],
          label: "DHW Use Compliance: %",
        },
        n: {
          fieldId: "n_50",
          semanticPath: "waterHeating.dhwStatus",
          type: "calculated",
          value: "✓",
          dependencies: ["m_50"],
          label: "DHW Use Compliance Status",
        },
      },
    },
    51: {
      id: "W.3.1",
      label: "DHW or SHW Energy Source",
      cells: {
        c: { label: "DHW or SHW Energy Source" },
        d: {
          fieldId: "d_51",
          semanticPath: "waterHeating.systemType",
          type: "dropdown",
          dropdownId: "d_51",
          value: "Heatpump",
          tooltip: true, // DHW/SHW Heating Source
          label: "DHW/SHW Energy Source",
          options: ["Heatpump", "Gas", "Oil", "Electric"],
        },
        e: {
          fieldId: "e_51",
          semanticPath: "waterHeating.gasVolume",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_51", "j_52", "d_53", "e_52"],
          conditionalDeps: ["j_52", "d_53", "e_52"], // Only used when d_51="Gas"
          label: "Gas Volume: m³/yr",
        },
        f: { content: "Gas m³/yr", classes: ["text-left"] },
        g: { content: "W.3.2", classes: ["text-left"] },
        h: { content: "Net Thermal Demand", classes: ["text-left"] },
        j: {
          fieldId: "j_51",
          semanticPath: "waterHeating.netThermalDemand",
          type: "calculated",
          value: "12,828.14",
          dependencies: ["d_51", "j_50", "e_52"],
          conditionalDeps: ["e_52"], // Uses e_52 for all system types
          label: "Net Thermal Demand: kWh/yr",
        },
        k: {
          fieldId: "k_51",
          semanticPath: "waterHeating.netElectricalDemand",
          type: "calculated",
          value: "12,828.14",
          dependencies: ["d_51", "j_52"],
          conditionalDeps: ["j_52"], // Only non-zero when d_51="Heatpump" or "Electric"
          label: "Net Electrical Demand: kWh/yr",
        },
        l: { content: "W.3.3 Net Elect. Demand", classes: ["text-left"] },
      },
    },
    52: {
      id: "W.4.1",
      label: "DHW or SHW Efficiency Factor (EF)",
      cells: {
        c: { label: "DHW or SHW Efficiency Factor (EF)" },
        d: {
          fieldId: "d_52",
          semanticPath: "waterHeating.efficiency",
          type: "percentage",
          value: "300",
          min: 50,
          max: 400,
          step: 2,
          classes: ["user-input"],
          tooltip: true, // If Heatpump Selected
          label: "DHW/SHW Efficiency Factor: %",
        },
        e: {
          fieldId: "e_52",
          semanticPath: "waterHeating.cop",
          type: "calculated",
          value: "3.00",
          dependencies: ["d_52"],
          label: "DHW/SHW COP",
        },
        f: { content: "COPdhw", classes: ["text-left"] },
        g: { content: "W.5.2", classes: ["text-left"] },
        h: { content: "Net Demand-Recovered", classes: ["text-left"] },
        j: {
          fieldId: "j_52",
          semanticPath: "waterHeating.netDemandAfterRecovery",
          type: "calculated",
          value: "12,828.14",
          dependencies: ["j_51", "e_53"],
          label: "Net Demand After Recovery: kWh/yr",
        },
        k: { content: "", classes: ["text-left"] },
        l: { content: "", classes: ["text-left"] },
        m: {
          fieldId: "m_52",
          semanticPath: "waterHeating.efficiencyCompliance",
          type: "calculated",
          value: "100%",
          dependencies: ["d_52", "ref_d_52"],
          label: "Efficiency Compliance: %",
        },
        n: {
          fieldId: "n_52",
          semanticPath: "waterHeating.efficiencyComplianceStatus",
          type: "calculated",
          value: "✓",
          dependencies: ["m_52"],
          label: "Efficiency Compliance Status",
        },
      },
    },
    53: {
      id: "W.5.1",
      label: "Drain Water Heat Recovery Efficiency",
      cells: {
        c: { label: "Drain Water Heat Recovery Efficiency" },
        d: {
          fieldId: "d_53",
          semanticPath: "waterHeating.dwhrEfficiency",
          type: "percentage",
          value: "0",
          min: 0,
          max: 70,
          step: 1,
          classes: ["user-input"],
          tooltip: true, // Range of DWHR Efficiency
          label: "DWHR Efficiency: %",
        },
        e: {
          fieldId: "e_53",
          semanticPath: "waterHeating.energyRecovered",
          type: "calculated",
          value: "0.00",
          dependencies: ["j_51", "d_53"],
          label: "Energy Recovered: kWh/yr",
        },
        f: { content: "kWh/yr", classes: ["text-left"] },
        g: { content: "W.5.3", classes: ["text-left"] },
        h: { content: "(W.2.W) SHW Wasted", classes: ["text-left"] },
        j: {
          fieldId: "j_53",
          semanticPath: "waterHeating.shwWasted",
          type: "calculated",
          value: "12,828.14",
          dependencies: ["j_51", "e_53"],
          label: "SHW Wasted: kWh/yr",
        },
        m: {
          fieldId: "m_53",
          semanticPath: "waterHeating.dwhrCompliance",
          type: "calculated",
          value: "0%",
          dependencies: ["d_53", "ref_d_53"],
          conditionalDeps: ["ref_d_53"], // N/A if ref_d_53=0
          label: "DWHR Compliance: %",
        },
        n: {
          fieldId: "n_53",
          semanticPath: "waterHeating.dwhrComplianceStatus",
          type: "calculated",
          value: "✓",
          dependencies: ["m_53"],
          label: "DWHR Compliance Status",
        },
      },
    },
    54: {
      id: "W.6.1",
      label: "System Losses (% → W.1.3 Eqpt Gains)",
      cells: {
        c: { label: "System Losses (% → W.1.3 Eqpt Gains)" },
        d: {
          fieldId: "d_54",
          semanticPath: "waterHeating.systemLosses",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_52", "d_49", "j_50"],
          conditionalDeps: ["d_49", "j_50"], // d_49 and j_50 only used conditionally
          label: "System Losses (Equipment Gains): kWh/yr",
        },
        f: { content: "kWh/yr", classes: ["text-left"] },
        g: { content: "W.X", classes: ["text-right"] },
        h: { content: "Exhaust (if Gas or Oil)", classes: ["text-left"] },
        j: {
          fieldId: "j_54",
          semanticPath: "waterHeating.exhaustLosses",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_51", "j_52", "e_52"],
          conditionalDeps: ["j_52", "e_52"], // Only used when d_51="Gas" or "Oil"
          label: "Exhaust Losses: kWh/yr",
        },
        k: {
          fieldId: "k_54",
          semanticPath: "waterHeating.netOilDemand",
          type: "calculated",
          value: "0.00",
          dependencies: ["d_51", "j_52", "d_53", "e_52"],
          conditionalDeps: ["j_52", "d_53", "e_52"], // Only used when d_51="Oil"
          label: "Net Oil Demand: litres",
        },
        l: { content: "W.3.4 Net Oil Demand Ltrs", classes: ["text-left"] },
        m: { content: "", classes: ["text-left"] },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS (Standardized)
  //==========================================================================
  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label, // ✅ Standard label resolution pattern
            defaultValue: cell.value || "",
            section: "waterUse",
            semanticPath: cell.semanticPath || null, // Phase 5: Include semantic path
          };
          // Add additional properties for dropdown fields
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
          // ✅ Add dependency arrays for ZenMaster tracing
          if (cell.dependencies)
            fields[cell.fieldId].dependencies = cell.dependencies;
          if (cell.conditionalDeps)
            fields[cell.fieldId].conditionalDeps = cell.conditionalDeps;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.type === "dropdown" && cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options.map(opt => ({
            value: opt,
            name: opt,
          }));
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

  window.TEUI.sect07 = window.TEUI.sect07 || {};

  //==========================================================================
  // UI MANAGEMENT FUNCTIONS
  //==========================================================================
  function updateSection7Visibility(waterMethod, systemType) {
    const isUserDefined = waterMethod === "User Defined";
    setFieldGhosted("e_49", !isUserDefined);
    const f49Cell = document.querySelector(
      '.data-table tr[data-id="W.1.0"] td:nth-child(6)'
    );
    if (f49Cell) f49Cell.classList.toggle("disabled-input", !isUserDefined);

    const isByEngineer = waterMethod === "By Engineer";
    setFieldGhosted("e_50", !isByEngineer);
    const e50Cell = document.querySelector(
      '.data-table tr[data-id="W.1.2"] td:nth-child(5)'
    );
    const f50Cell = document.querySelector(
      '.data-table tr[data-id="W.1.2"] td:nth-child(6)'
    );
    if (e50Cell) e50Cell.classList.toggle("disabled-input", !isByEngineer);
    if (f50Cell) f50Cell.classList.toggle("disabled-input", !isByEngineer);

    const isGas = systemType === "Gas";
    const isOil = systemType === "Oil";

    setFieldGhosted("e_51", !isGas);
    const f51Cell = document.querySelector(
      '.data-table tr[data-id="W.3.1"] td:nth-child(6)'
    );
    if (f51Cell) f51Cell.classList.toggle("disabled-input", !isGas);

    setFieldGhosted("k_54", !isOil);
    // ✅ PHASE 6: d_52 and e_52 ghosting removed - slider now works for all fuel types
  }

  function setFieldGhosted(fieldId, shouldBeGhosted) {
    window.TEUI.DOMBridge?.ghostField(fieldId, shouldBeGhosted);
  }

  //==========================================================================
  // EVENT HANDLING (Enhanced with Original Functions)
  //==========================================================================
  function handleEditableBlur(event) {
    const fieldElement = this;
    const fieldId = fieldElement.getAttribute("data-field-id");
    if (!fieldId) return;

    let rawTextValue = fieldElement.textContent.trim();
    let numericValue =
      window.TEUI?.parseNumeric?.(rawTextValue, NaN) ??
      parseFloat(rawTextValue.replace(/[$,%]/g, ""));

    if (isNaN(numericValue)) {
      const previousValue = getModeValue(fieldId) || "0";
      numericValue = window.TEUI?.parseNumeric?.(previousValue, 0) ?? 0;
    }

    const formatType = "number-2dp-comma";
    const valueToStore = numericValue.toString();
    const formattedDisplay =
      window.TEUI?.formatNumber?.(numericValue, formatType) ?? valueToStore;
    fieldElement.textContent = formattedDisplay;

    const currentValue = getModeValue(fieldId);
    if (currentValue !== valueToStore) {
      setModeValue(fieldId, valueToStore, "user-modified");
    }
  }

  function handleGenericDropdownChange(e) {
    const fieldId =
      e.target.getAttribute("data-field-id") ||
      e.target.getAttribute("data-dropdown-id");
    const value = e.target.value;

    if (fieldId) {
      setModeValue(fieldId, value, "user-modified");

      if (fieldId === "d_51") handleDHWSourceChange(e);

      const currentWaterMethod = getModeValue("d_49") || "User Defined";
      const currentSystemType = getModeValue("d_51") || "Heatpump";
      updateSection7Visibility(currentWaterMethod, currentSystemType);
    }
  }

  function handleSliderChange(e) {
    const fieldId = e.target.getAttribute("data-field-id");
    const value = e.target.value;
    const displaySpan = document.querySelector(
      `span[data-display-for="${fieldId}"]`
    );

    if (displaySpan) displaySpan.textContent = value + "%";

    if (fieldId && (e.type === "change" || e.type === "input")) {
      if (fieldId === "d_52") {
        const systemType = getModeValue("d_51") || "Heatpump";
        const numValue = parseFloat(value);

        if (
          (systemType === "Gas" || systemType === "Oil") &&
          (numValue < 50 || numValue > 98)
        ) {
          console.warn(
            `[S07] ${systemType} efficiency ${numValue}% outside allowed range (50-98%)`
          );
        }
      }

      setModeValue(fieldId, value, "user-modified");
    }
  }

  function handleDHWSourceChange(event) {
    const selectedSource = event.target.value;
    console.log(
      `[S07] handleDHWSourceChange called: selectedSource="${selectedSource}"`
    );
    const d52Slider = document.querySelector(
      'input[type="range"][data-field-id="d_52"]'
    );
    const d52Display = document.querySelector(`span[data-display-for="d_52"]`);

    let newMinValue = 50,
      newMaxValue = 400,
      newStep = 2,
      newValue = 300;

    // Preserve existing imported/user-modified values when switching system types
    let preservedValue = null;

    if (selectedSource === "Gas" || selectedSource === "Oil") {
      newMinValue = 50;
      newMaxValue = 98;
      newStep = 1;

      const existingD52 = getModeValue("d_52");
      if (existingD52) {
        preservedValue = parseInt(existingD52);
      }

      newValue = preservedValue || 90;

      if (preservedValue && (preservedValue < 50 || preservedValue > 98)) {
        console.warn(
          `[S07] Preserved value ${preservedValue}% outside Gas/Oil range (50-98%), resetting to 90%`
        );
        newValue = 90;
      }
    } else if (selectedSource === "Electric") {
      newMinValue = 90;
      newMaxValue = 100;
      newStep = 1;
      newValue = 100;
    } else {
      const existingCOP = getModeValue("d_52");
      if (existingCOP) {
        preservedValue = parseInt(existingCOP);
      }

      newMinValue = 100;
      newMaxValue = 450;
      newStep = 10;
      newValue = preservedValue || 300;
    }

    console.log(
      `[S07] Setting d_52 slider: min=${newMinValue}, max=${newMaxValue}, value=${newValue}`
    );

    // Write to both target and reference SM keys for d_52
    if (window.TEUI?.StateManager) {
      window.TEUI.StateManager.setValue("d_52", newValue.toString(), "system-update");
      window.TEUI.StateManager.setValue("ref_d_52", newValue.toString(), "system-update");
    }
    if (d52Slider) {
      d52Slider.min = newMinValue;
      d52Slider.max = newMaxValue;
      d52Slider.step = newStep;
      d52Slider.value = newValue;

      let displayElement = d52Display || d52Slider.nextElementSibling;
      if (displayElement) {
        displayElement.textContent = `${newValue}%`;
      }
    }
  }

  function initializeEventHandlers() {
    const sectionElement = document.getElementById("waterUse");
    if (!sectionElement) return;

    // Setup editable field handlers
    const editableFields = ["e_49", "e_50"];
    editableFields.forEach(fieldId => {
      const field = sectionElement.querySelector(
        `[data-field-id="${fieldId}"]`
      );
      if (
        field &&
        field.classList.contains("editable") &&
        !field.hasEditableListeners
      ) {
        field.setAttribute("contenteditable", "true");
        field.classList.add("user-input");
        field.addEventListener("blur", handleEditableBlur);
        field.addEventListener("keydown", function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            this.blur();
          }
        });
        field.hasEditableListeners = true;
      }
    });

    // Setup dropdown handlers
    const dropdowns = sectionElement.querySelectorAll(
      "select[data-dropdown-id]"
    );
    dropdowns.forEach(dropdown => {
      if (!dropdown.hasDropdownListener) {
        dropdown.addEventListener("change", handleGenericDropdownChange);
        dropdown.hasDropdownListener = true;
      }
    });

    // Setup slider handlers
    const sliders = sectionElement.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      if (!slider.hasSliderListener) {
        slider.addEventListener("input", handleSliderChange);
        slider.addEventListener("change", handleSliderChange);
        slider.hasSliderListener = true;
      }
    });

    // Graph handles cross-section computation via wildcard listener.
  }

  //==========================================================================
  // HEADER CONTROLS (Pattern A Mode Switching)
  //==========================================================================

  function onSectionRendered() {
    // Initialize event handlers
    initializeEventHandlers();

    // Initialize visibility based on field defaults
    const initialWaterMethod = getFieldDefault("d_49") || "User Defined";
    const initialSystemType = getFieldDefault("d_51") || "Heatpump";
    updateSection7Visibility(initialWaterMethod, initialSystemType);

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  /**
   * Called by ReferenceToggle when mode switches.
   * Updates visibility/ghosting based on current mode's values.
   */
  function onModeSwitch(mode) {
    const waterMethod = getModeValue("d_49") || getFieldDefault("d_49") || "User Defined";
    const systemType = getModeValue("d_51") || getFieldDefault("d_51") || "Heatpump";
    updateSection7Visibility(waterMethod, systemType);
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================
  return {
    getFields,
    getDropdownOptions,
    getLayout,
    initializeEventHandlers,
    onSectionRendered,
    onModeSwitch,
    updateSection7Visibility,
    setFieldGhosted,
    handleGenericDropdownChange,
    handleSliderChange,
    handleDHWSourceChange,
  };
})();

// Expose UI functions to global namespace for cross-module access
document.addEventListener("DOMContentLoaded", function () {
  const module = window.TEUI.SectionModules.sect07;
  if (module) {
    window.TEUI.sect07.updateSection7Visibility =
      module.updateSection7Visibility;
  }
});
