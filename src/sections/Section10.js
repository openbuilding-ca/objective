/**
 * 4012-Section10.js
 * Radiant Gains (Section 10) module for TEUI Calculator 4.012
 *
 * Uses the consolidated declarative approach where field definitions
 * are integrated directly into the layout structure.
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 10: Radiant Gains Module
window.TEUI.SectionModules.sect10 = (function () {
  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

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

  //==========================================================================
  // HELPER FUNCTIONS (Refactored for Self-Contained State Module)
  //==========================================================================

  /**
   * Get field default value from field definitions (single source of truth)
   * Prevents hardcoded defaults anti-pattern
   */
  function getFieldDefault(fieldId) {
    const fields = getFields();
    return fields[fieldId]?.defaultValue || fields[fieldId]?.value || "";
  }

  /**
   * Formats a number for display.
   * Handles specific formats like percentage (integer + %), currency.
   * @param {number} value - The number to format.
   * @param {string} [format='number'] - 'number', 'percent', 'currency'.
   * @returns {string} The formatted number.
   */
  function formatNumber(value, format = "number") {
    if (value === null || value === undefined || isNaN(value)) {
      return format === "percent"
        ? "0%"
        : format === "currency"
          ? "$0.00"
          : "0.00";
    }

    const num = Number(value);

    if (format === "percent") {
      // Input is raw decimal (e.g., 0.152 for 15.20%), output with 2 decimal places + %
      return (
        (num * 100).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + "%"
      );
    } else if (format === "currency") {
      return (
        "$" +
        num.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } else {
      // Default number format (kWh, Gain Factor, etc.)
      return num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
  }

  function handleFieldBlur(_event) {
    const fieldElement = this;
    const currentFieldId = fieldElement.getAttribute("data-field-id");
    if (!currentFieldId) return;

    if (currentFieldId === "d_74") {
      /* No specific action for d_74 blur, but keeping structure */
    }

    let valueStr = fieldElement.textContent.trim().replace(/,/g, "");
    let displayValue = "0.00";
    let rawValueToStore = "0";

    let numValue = window.TEUI.parseNumeric(valueStr, NaN);

    if (!isNaN(numValue)) {
      // Successfully parsed a number
      // Store the raw number string *first* for all valid number cases
      rawValueToStore = numValue.toString();

      // Apply specific formatting based on field type
      if (currentFieldId === "d_97") {
        // Thermal Bridge Penalty (%)
        // Convert input number to decimal (assume input "20" means 20% -> 0.2)
        let decimalValue = numValue / 100;
        // Clamp the DECIMAL value between 0 and 1
        decimalValue = Math.max(0, Math.min(1, decimalValue));
        rawValueToStore = decimalValue.toString(); // Overwrite with clamped decimal value for state
        displayValue = formatNumber(decimalValue * 100, "number"); // Display as number 0-100, not percentage string
      } else if (currentFieldId.startsWith("g_")) {
        // U-Value (3 decimals)
        displayValue = formatNumber(numValue, "W/m2"); // Use specific format
        // rawValueToStore is already set to numValue.toString()
      } else {
        // Default: Area (d_), RSI (f_) - 2 decimals
        displayValue = formatNumber(numValue, "number");
        // rawValueToStore is already set to numValue.toString()
      }
    } else {
      // Handle invalid input (set to 0 or 0%)
      if (currentFieldId === "d_97") {
        displayValue = "0%";
        rawValueToStore = "0"; // Store 0 for invalid TBP
      } else if (currentFieldId.startsWith("g_")) {
        displayValue = formatNumber(0, "W/m2");
        rawValueToStore = "0";
      } else {
        displayValue = formatNumber(0, "number");
        rawValueToStore = "0";
      }
    }
    fieldElement.textContent = displayValue; // Update DOM display

    // Store value via mode-aware helper
    setModeValue(currentFieldId, rawValueToStore, "user-modified");
  }

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // UNIT SUBHEADER - MUST COME FIRST
    header: {
      id: "10-ID",
      rowId: "10-ID",
      label: "RG-Unts",
      cells: {
        c: { content: "" }, // Empty column for row labels
        d: { content: "Area m² (RO)" }, // Empty column for row labels
        e: {
          content: "Orientation",
          classes: ["section-subheader", "align-center"],
          style: "white-space: pre-line;",
        },
        f: {
          content: "SHGC",
          classes: ["section-subheader", "align-center"],
          style: "white-space: pre-line;",
        },
        g: {
          content: "Winter Shading",
          classes: ["section-subheader", "align-center"],
          style: "white-space: pre-line;",
        },
        h: {
          content: "Summer Shading",
          classes: ["section-subheader", "align-center"],
          style: "white-space: pre-line;",
        },
        i: {
          content: "Heatgain\nkWh/Heating Season",
          classes: ["section-subheader", "align-right"],
          style: "white-space: pre-line;",
        },
        j: {
          content: "Heatgain %",
          classes: ["section-subheader", "align-right"],
          style: "white-space: pre-line;",
        },
        k: {
          content: "Heatgain\nkWh/Cool Season",
          classes: ["section-subheader", "align-right"],
          style: "white-space: pre-line;",
        },
        l: {
          content: "Heatgain %",
          classes: ["section-subheader", "align-right"],
          style: "white-space: pre-line;",
        },
        m: {
          content: "G-Factor kWh/m²/yr",
          classes: ["section-subheader", "align-right"],
          style: "white-space: pre-line;",
        },
      },
    },

    // Row 73: G.7 Doors
    73: {
      id: "G.7.1",
      rowId: "G.7.1",
      label: "Door",
      cells: {
        c: { label: "Door" },
        d: {
          fieldId: "d_73",
          semanticPath: "radiant.doors.area",
          type: "editable",
          value: "7.50",
          section: "envelopeRadiantGains",
          classes: ["user-input", "col-medium"],
          label: "S10: Doors Area: m²",
          tooltip: true, // Area of Doors
        },
        e: {
          fieldId: "e_73",
          semanticPath: "radiant.doors.orientation",
          type: "dropdown",
          dropdownId: "dd_e_73",
          value: "Average",
          section: "envelopeRadiantGains",
          tooltip: true, // Select an Orientation
          options: [
            { value: "North", name: "North" },
            { value: "NorthEast", name: "NorthEast" },
            { value: "East", name: "East" },
            { value: "SouthEast", name: "SouthEast" },
            { value: "South", name: "South" },
            { value: "SouthWest", name: "SouthWest" },
            { value: "West", name: "West" },
            { value: "NorthWest", name: "NorthWest" },
            { value: "Average", name: "Average" },
            { value: "Skylight", name: "Skylight" },
          ],
          classes: ["col-medium"],
          label: "Doors: Orientation",
        },
        f: {
          fieldId: "f_73",
          semanticPath: "radiant.doors.shgc",
          type: "coefficient_slider",
          value: "0.50",
          min: 0.2,
          max: 0.6,
          step: 0.05,
          tooltip: true, // Solar Heat Gain Coefficient
          section: "envelopeRadiantGains",
          classes: ["col-small", "slider-container"],
          label: "Door: SHGC",
        },
        g: {
          fieldId: "g_73",
          semanticPath: "radiant.doors.winterShading",
          type: "percentage",
          value: "0",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          classes: ["col-large", "slider-container"],
          label: "Door: Winter Shading %",
        },
        h: {
          fieldId: "h_73",
          semanticPath: "radiant.doors.summerShading",
          type: "percentage",
          value: "100",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          classes: ["col-large", "slider-container"],
          label: "Doors: Summer Shading %",
        },
        i: {
          fieldId: "i_73",
          semanticPath: "radiant.doors.heatingGain",
          type: "calculated",
          value: "225.00",
          section: "envelopeRadiantGains",
          dependencies: ["d_73", "f_73", "g_73", "m_73"],
          label: "Doors: Solar Gain Heating: kWh/yr",
        },
        j: {
          fieldId: "j_73",
          semanticPath: "radiant.doors.heatingGainPercent",
          type: "calculated",
          value: "1.55%", // DEFAULTS ANTIPATTERN if values are calculated, why do we tell them what they should be here?
          section: "envelopeRadiantGains",
          dependencies: ["i_73", "i_79"], // Fixed: was h_79 (doesn't exist), should be i_79 (Sum of Gains)
          label: "Doors: Solar Gain Heating %",
        },
        k: {
          fieldId: "k_73",
          semanticPath: "radiant.doors.coolingGain",
          type: "calculated",
          value: "0.00",
          section: "envelopeRadiantGains",
          dependencies: ["d_73", "f_73", "h_73", "m_73"],
          label: "Doors: Solar Gain Cooling kWh/yr",
        },
        l: {
          fieldId: "l_73",
          semanticPath: "radiant.doors.coolingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "envelopeRadiantGains",
          dependencies: ["k_73", "k_79"],
          label: "Doors: Solar Gain Cooling %",
        },
        m: {
          fieldId: "m_73",
          semanticPath: "radiant.doors.gainFactor",
          type: "calculated",
          value: "50",
          section: "envelopeRadiantGains",
          dependencies: ["j_19", "e_73"],
          conditionalDeps: ["j_19"],
          classes: ["reference-value"],
          label: "Doors: Gain Factor kWh/m²/yr",
        },
        p: {
          fieldId: "p_73",
          semanticPath: "radiant.doors.cost",
          type: "calculated",
          dependencies: ["l_12", "k_73", "i_73"],
        }, // Column P (Cost)
      },
    },

    // Row 74: G.8.1 Window Area North
    74: {
      id: "G.8.1",
      rowId: "G.8.1",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_74",
          semanticPath: "radiant.windowNorth.area",
          type: "editable",
          value: "81.14",
          section: "envelopeRadiantGains",
          classes: ["user-input", "col-medium"],
          label: "S10: Window Area North: m²",
          tooltip: true, // Area of Window North
        },
        e: {
          fieldId: "e_74",
          semanticPath: "radiant.windowNorth.orientation",
          type: "dropdown",
          dropdownId: "dd_e_74",
          value: "North",
          section: "envelopeRadiantGains",
          tooltip: true, // Select an Orientation
          options: [
            { value: "North", name: "North" },
            { value: "NorthEast", name: "NorthEast" },
            { value: "East", name: "East" },
            { value: "SouthEast", name: "SouthEast" },
            { value: "South", name: "South" },
            { value: "SouthWest", name: "SouthWest" },
            { value: "West", name: "West" },
            { value: "NorthWest", name: "NorthWest" },
            { value: "Average", name: "Average" },
            { value: "Skylight", name: "Skylight" },
          ],
          classes: ["col-medium"],
          label: "Window North: Orientation",
        },
        f: {
          fieldId: "f_74",
          semanticPath: "radiant.windowNorth.shgc",
          type: "coefficient_slider",
          value: "0.50",
          min: 0.2,
          max: 0.6,
          step: 0.05,
          tooltip: true, // Solar Heat Gain Coefficient
          section: "envelopeRadiantGains",
          classes: ["col-small", "slider-container"],
          label: "Window North: SHGC",
        },
        g: {
          fieldId: "g_74",
          semanticPath: "radiant.windowNorth.winterShading",
          type: "percentage",
          value: "0",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          classes: ["col-large", "slider-container"],
          label: "Window North: Winter Shading %",
        },
        h: {
          fieldId: "h_74",
          semanticPath: "radiant.windowNorth.summerShading",
          type: "percentage",
          value: "100",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          classes: ["col-large", "slider-container"],
          label: "Window North: Summer Shading %",
        },
        i: {
          fieldId: "i_74",
          semanticPath: "radiant.windowNorth.heatingGain",
          type: "calculated",
          value: "106.29",
          section: "envelopeRadiantGains",
          dependencies: ["d_74", "f_74", "g_74", "m_74"],
          label: "Window Area North: Solar Gain Heating kWh/yr",
        },
        j: {
          fieldId: "j_74",
          semanticPath: "radiant.windowNorth.heatingGainPercent",
          type: "calculated",
          value: "0.73%",
          section: "envelopeRadiantGains",
          dependencies: ["i_74", "h_79"],
          label: "Window Area North: Solar Gain Heating %",
        },
        k: {
          fieldId: "k_74",
          semanticPath: "radiant.windowNorth.coolingGain",
          type: "calculated",
          value: "0.00",
          section: "envelopeRadiantGains",
          dependencies: ["d_74", "f_74", "h_74", "m_74"],
          label: "Window Area North: Solar Gain Cooling kWh/yr",
        },
        l: {
          fieldId: "l_74",
          semanticPath: "radiant.windowNorth.coolingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "envelopeRadiantGains",
          dependencies: ["k_74", "k_79"],
          label: "Window Area North: Solar Gain Cooling %",
        },
        m: {
          fieldId: "m_74",
          semanticPath: "radiant.windowNorth.gainFactor",
          type: "calculated",
          value: "1.31",
          section: "envelopeRadiantGains",
          dependencies: ["j_19", "e_74"],
          conditionalDeps: ["j_19"],
          classes: ["reference-value"],
          label: "Window North: Gain Factor kWh/m²/yr",
          p: {
            fieldId: "p_74",
            semanticPath: "radiant.windowNorth.cost",
            type: "calculated",
            dependencies: ["l_12", "k_74", "i_74"],
          },
        },
      },
    },

    // Row 75: G.8.2 Window Area East
    75: {
      id: "G.8.2",
      rowId: "G.8.2",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_75",
          semanticPath: "radiant.windowEast.area",
          type: "editable",
          value: "3.83",
          section: "envelopeRadiantGains",
          classes: ["user-input"],
          label: "S10: Window Area East: m²",
          tooltip: true, // Area of Window East
        },
        e: {
          fieldId: "e_75",
          semanticPath: "radiant.windowEast.orientation",
          type: "dropdown",
          dropdownId: "dd_e_75",
          value: "East",
          section: "envelopeRadiantGains",
          tooltip: true, // Select an Orientation
          options: [
            { value: "North", name: "North" },
            { value: "NorthEast", name: "NorthEast" },
            { value: "East", name: "East" },
            { value: "SouthEast", name: "SouthEast" },
            { value: "South", name: "South" },
            { value: "SouthWest", name: "SouthWest" },
            { value: "West", name: "West" },
            { value: "NorthWest", name: "NorthWest" },
            { value: "Average", name: "Average" },
            { value: "Skylight", name: "Skylight" },
          ],
          label: "Window East: Orientation",
        },
        f: {
          fieldId: "f_75",
          semanticPath: "radiant.windowEast.shgc",
          type: "coefficient_slider",
          value: "0.50",
          min: 0.2,
          max: 0.6,
          step: 0.05,
          tooltip: true, // Solar Heat Gain Coefficient
          section: "envelopeRadiantGains",
          classes: ["col-small", "slider-container"],
          label: "Window East: SHGC",
        },
        g: {
          fieldId: "g_75",
          semanticPath: "radiant.windowEast.winterShading",
          type: "percentage",
          value: "0",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Window East: Winter Shading %",
        },
        h: {
          fieldId: "h_75",
          semanticPath: "radiant.windowEast.summerShading",
          type: "percentage",
          value: "100",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Window East: Summer Shading %",
        },
        i: {
          fieldId: "i_75",
          semanticPath: "radiant.windowEast.heatingGain",
          type: "calculated",
          value: "294.68",
          section: "envelopeRadiantGains",
          dependencies: ["d_75", "f_75", "g_75", "m_75"],
          label: "Window Area East: Solar Gain Heating kWh/yr",
        },
        j: {
          fieldId: "j_75",
          semanticPath: "radiant.windowEast.heatingGainPercent",
          type: "calculated",
          value: "2.04%",
          section: "envelopeRadiantGains",
          dependencies: ["i_75", "h_79"],
          label: "Window Area East: Solar Gain Heating %",
        },
        k: {
          fieldId: "k_75",
          semanticPath: "radiant.windowEast.coolingGain",
          type: "calculated",
          value: "0.00",
          section: "envelopeRadiantGains",
          dependencies: ["d_75", "f_75", "h_75", "m_75"],
          label: "Window Area East: Solar Gain Cooling kWh/yr",
        },
        l: {
          fieldId: "l_75",
          semanticPath: "radiant.windowEast.coolingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "envelopeRadiantGains",
          dependencies: ["k_75", "k_79"],
          label: "Window Area East: Solar Gain Cooling %",
        },
        m: {
          fieldId: "m_75",
          semanticPath: "radiant.windowEast.gainFactor",
          type: "calculated",
          value: "76.94",
          section: "envelopeRadiantGains",
          dependencies: ["j_19", "e_75"],
          conditionalDeps: ["j_19"],
          classes: ["reference-value"],
          p: {
            fieldId: "p_75",
            semanticPath: "radiant.windowEast.cost",
            type: "calculated",
            dependencies: ["l_12", "k_75", "i_75"],
          },
        },
      },
    },

    // Row 76: G.8.3 Window Area South
    76: {
      id: "G.8.3",
      rowId: "G.8.3",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_76",
          semanticPath: "radiant.windowSouth.area",
          type: "editable",
          value: "159.00",
          section: "envelopeRadiantGains",
          classes: ["user-input"],
          label: "S10: Window Area South: m²",
          tooltip: true, // Area of Window South
        },
        e: {
          fieldId: "e_76",
          semanticPath: "radiant.windowSouth.orientation",
          type: "dropdown",
          dropdownId: "dd_e_76",
          value: "South",
          section: "envelopeRadiantGains",
          tooltip: true, // Select an Orientation
          options: [
            { value: "North", name: "North" },
            { value: "NorthEast", name: "NorthEast" },
            { value: "East", name: "East" },
            { value: "SouthEast", name: "SouthEast" },
            { value: "South", name: "South" },
            { value: "SouthWest", name: "SouthWest" },
            { value: "West", name: "West" },
            { value: "NorthWest", name: "NorthWest" },
            { value: "Average", name: "Average" },
            { value: "Skylight", name: "Skylight" },
          ],
          label: "Window South: Orientation",
        },
        f: {
          fieldId: "f_76",
          semanticPath: "radiant.windowSouth.shgc",
          type: "coefficient_slider",
          value: "0.50",
          min: 0.2,
          max: 0.6,
          step: 0.05,
          tooltip: true, // Solar Heat Gain Coefficient
          section: "envelopeRadiantGains",
          classes: ["col-small", "slider-container"],
          label: "Window South: SHGC",
        },
        g: {
          fieldId: "g_76",
          semanticPath: "radiant.windowSouth.winterShading",
          type: "percentage",
          value: "0",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Window South: Winter Shading %",
        },
        h: {
          fieldId: "h_76",
          semanticPath: "radiant.windowSouth.summerShading",
          type: "percentage",
          value: "100",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Window South: Summer Shading %",
        },
        i: {
          fieldId: "i_76",
          semanticPath: "radiant.windowSouth.heatingGain",
          type: "calculated",
          value: "11,247.66",
          section: "envelopeRadiantGains",
          dependencies: ["d_76", "f_76", "g_76", "m_76"],
          label: "Window Area South: Solar Gain Heating kWh/yr",
        },
        j: {
          fieldId: "j_76",
          semanticPath: "radiant.windowSouth.heatingGainPercent",
          type: "calculated",
          value: "77.69%",
          section: "envelopeRadiantGains",
          dependencies: ["i_76", "i_79"],
          label: "Window Area South: Solar Gain Heating %",
        },
        k: {
          fieldId: "k_76",
          semanticPath: "radiant.windowSouth.coolingGain",
          type: "calculated",
          value: "0.00",
          section: "envelopeRadiantGains",
          dependencies: ["d_76", "f_76", "h_76", "m_76"],
          label: "Window Area South: Solar Gain Cooling kWh/yr",
        },
        l: {
          fieldId: "l_76",
          semanticPath: "radiant.windowSouth.coolingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "envelopeRadiantGains",
          dependencies: ["k_76", "k_79"],
          label: "Window Area South: Solar Gain Cooling %",
        },
        m: {
          fieldId: "m_76",
          semanticPath: "radiant.windowSouth.gainFactor",
          type: "calculated",
          value: "70.74",
          section: "envelopeRadiantGains",
          dependencies: ["j_19", "e_76"],
          conditionalDeps: ["j_19"],
          classes: ["reference-value"],
          p: {
            fieldId: "p_76",
            semanticPath: "radiant.windowSouth.cost",
            type: "calculated",
            dependencies: ["l_12", "k_76", "i_76"],
          },
        },
      },
    },

    // Row 77: G.8.4 Window Area West
    77: {
      id: "G.8.4",
      rowId: "G.8.4",
      label: "Window",
      cells: {
        c: { label: "Window" },
        d: {
          fieldId: "d_77",
          semanticPath: "radiant.windowWest.area",
          type: "editable",
          value: "100.66",
          section: "envelopeRadiantGains",
          classes: ["user-input"],
          label: "S10: Window Area West: m²",
          tooltip: true, // Area of Window West
        },
        e: {
          fieldId: "e_77",
          semanticPath: "radiant.windowWest.orientation",
          type: "dropdown",
          dropdownId: "dd_e_77",
          value: "West",
          section: "envelopeRadiantGains",
          tooltip: true, // Select an Orientation
          options: [
            { value: "North", name: "North" },
            { value: "NorthEast", name: "NorthEast" },
            { value: "East", name: "East" },
            { value: "SouthEast", name: "SouthEast" },
            { value: "South", name: "South" },
            { value: "SouthWest", name: "SouthWest" },
            { value: "West", name: "West" },
            { value: "NorthWest", name: "NorthWest" },
            { value: "Average", name: "Average" },
            { value: "Skylight", name: "Skylight" },
          ],
          label: "Window West: Orientation",
        },
        f: {
          fieldId: "f_77",
          semanticPath: "radiant.windowWest.shgc",
          type: "coefficient_slider",
          value: "0.50",
          min: 0.2,
          max: 0.6,
          step: 0.05,
          tooltip: true, // Solar Heat Gain Coefficient
          section: "envelopeRadiantGains",
          classes: ["col-small", "slider-container"],
          label: "Window West: SHGC",
        },
        g: {
          fieldId: "g_77",
          semanticPath: "radiant.windowWest.winterShading",
          type: "percentage",
          value: "0",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Window West: Winter Shading %",
        },
        h: {
          fieldId: "h_77",
          semanticPath: "radiant.windowWest.summerShading",
          type: "percentage",
          value: "90",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Window West: Summer Shading %",
        },
        i: {
          fieldId: "i_77",
          semanticPath: "radiant.windowWest.heatingGain",
          type: "calculated",
          value: "2,603.07",
          section: "envelopeRadiantGains",
          dependencies: ["d_77", "f_77", "g_77", "m_77"],
          label: "Window Area West: Solar Gain Heating kWh/yr",
        },
        j: {
          fieldId: "j_77",
          semanticPath: "radiant.windowWest.heatingGainPercent",
          type: "calculated",
          value: "17.98%",
          section: "envelopeRadiantGains",
          dependencies: ["i_77", "i_79"],
          label: "Window Area West: Solar Gain Heating %",
        },
        k: {
          fieldId: "k_77",
          semanticPath: "radiant.windowWest.coolingGain",
          type: "calculated",
          value: "130.15",
          section: "envelopeRadiantGains",
          dependencies: ["d_77", "f_77", "h_77", "m_77"],
          label: "Window Area West: Solar Gain Cooling kWh/yr",
        },
        l: {
          fieldId: "l_77",
          semanticPath: "radiant.windowWest.coolingGainPercent",
          type: "calculated",
          value: "100.00%",
          section: "envelopeRadiantGains",
          dependencies: ["k_77", "k_79"],
          label: "Window Area West: Solar Gain Cooling %",
        },
        m: {
          fieldId: "m_77",
          semanticPath: "radiant.windowWest.gainFactor",
          type: "calculated",
          value: "25.86",
          section: "envelopeRadiantGains",
          dependencies: ["j_19", "e_77"],
          conditionalDeps: ["j_19"],
          classes: ["reference-value"],
          p: {
            fieldId: "p_77",
            semanticPath: "radiant.windowWest.cost",
            type: "calculated",
            dependencies: ["l_12", "k_77", "i_77"],
          },
        },
      },
    },

    // Row 78: G.8.5 Skylights
    78: {
      id: "G.8.5",
      rowId: "G.8.5",
      label: "Skylights",
      cells: {
        c: { label: "Skylights" },
        d: {
          fieldId: "d_78",
          semanticPath: "radiant.skylight.area",
          type: "editable",
          value: "0.00",
          section: "envelopeRadiantGains",
          classes: ["user-input"],
          label: "S10: Skylights: m²",
          tooltip: true, // Area of Skylights
        },
        e: {
          fieldId: "e_78",
          semanticPath: "radiant.skylight.orientation",
          type: "dropdown",
          dropdownId: "dd_e_78",
          value: "Skylight",
          section: "envelopeRadiantGains",
          tooltip: true, // Select an Orientation
          options: [
            { value: "North", name: "North" },
            { value: "NorthEast", name: "NorthEast" },
            { value: "East", name: "East" },
            { value: "SouthEast", name: "SouthEast" },
            { value: "South", name: "South" },
            { value: "SouthWest", name: "SouthWest" },
            { value: "West", name: "West" },
            { value: "NorthWest", name: "NorthWest" },
            { value: "Average", name: "Average" },
            { value: "Skylight", name: "Skylight" },
          ],
          label: "Skylight: Orientation",
        },
        f: {
          fieldId: "f_78",
          semanticPath: "radiant.skylight.shgc",
          type: "coefficient_slider",
          value: "0.50",
          min: 0.2,
          max: 0.6,
          step: 0.05,
          tooltip: true, // Solar Heat Gain Coefficient
          section: "envelopeRadiantGains",
          classes: ["col-small", "slider-container"],
          label: "Skylight: SHGC",
        },
        g: {
          fieldId: "g_78",
          semanticPath: "radiant.skylight.winterShading",
          type: "percentage",
          value: "0",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Skylights: Winter Shading %",
        },
        h: {
          fieldId: "h_78",
          semanticPath: "radiant.skylight.summerShading",
          type: "percentage",
          value: "80",
          min: 0,
          max: 100,
          step: 1,
          section: "envelopeRadiantGains",
          label: "Skylights: Summer Shading %",
        },
        i: {
          fieldId: "i_78",
          semanticPath: "radiant.skylight.heatingGain",
          type: "calculated",
          value: "0.00",
          section: "envelopeRadiantGains",
          dependencies: ["d_78", "f_78", "g_78", "m_78"],
          label: "Skylights: Solar Gain Heating kWh/yr",
        },
        j: {
          fieldId: "j_78",
          semanticPath: "radiant.skylight.heatingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "envelopeRadiantGains",
          dependencies: ["i_78", "i_79"],
          label: "Skylights: Solar Gain Heating %",
        },
        k: {
          fieldId: "k_78",
          semanticPath: "radiant.skylight.coolingGain",
          type: "calculated",
          value: "0.00",
          section: "envelopeRadiantGains",
          dependencies: ["d_78", "f_78", "h_78", "m_78"],
          label: "Skylights: Solar Gain Cooling kWh/yr",
        },
        l: {
          fieldId: "l_78",
          semanticPath: "radiant.skylight.coolingGainPercent",
          type: "calculated",
          value: "0.00%",
          section: "envelopeRadiantGains",
          dependencies: ["k_78", "k_79"],
          label: "Skylights: Solar Gain Cooling %",
        },
        m: {
          fieldId: "m_78",
          semanticPath: "radiant.skylight.gainFactor",
          type: "calculated",
          value: "75",
          section: "envelopeRadiantGains",
          dependencies: ["j_19", "e_78"],
          conditionalDeps: ["j_19"],
          classes: ["reference-value"],
          p: {
            fieldId: "p_78",
            semanticPath: "radiant.skylight.cost",
            type: "calculated",
            dependencies: ["l_12", "k_78", "i_78"],
          },
        },
      },
    },

    // Row 79: G.1 Subtotal Solar Gains
    79: {
      id: "G.1",
      rowId: "G.1",
      label: "Subtotal Solar Gains",
      cells: {
        c: { label: "Subtotal Solar Gains" },
        d: { content: "" }, // Empty cell
        e: { content: "" }, // Empty cell
        f: { content: "" }, // Empty cell
        g: { content: "" }, // Empty cell
        h: { content: "" }, // Empty cell
        i: {
          fieldId: "i_79",
          semanticPath: "radiant.subtotal.heatingGain",
          type: "calculated",
          value: "14,626.70",
          section: "radiantGains",
          dependencies: ["i_73", "i_74", "i_75", "i_76", "i_77", "i_78"],
          label: "Subtotal: Solar Gains Heating kWh/yr",
        },
        j: {
          fieldId: "j_79",
          semanticPath: "radiant.subtotal.heatingGainPercent",
          type: "calculated",
          value: "100%",
          section: "radiantGains",
          dependencies: [
            "d_80",
            "j_73",
            "j_74",
            "j_75",
            "j_76",
            "j_77",
            "j_78",
          ],
          conditionalDeps: ["d_80"],
          label: "Subtotal: Solar Gain Heating %",
        },
        k: {
          fieldId: "k_79",
          semanticPath: "radiant.subtotal.coolingGain",
          type: "calculated",
          value: "130.15",
          section: "radiantGains",
          dependencies: ["k_73", "k_74", "k_75", "k_76", "k_77", "k_78"],
          label: "Subtotal: Solar Gains Cooling kWh/yr",
        },
        l: {
          fieldId: "l_79",
          semanticPath: "radiant.subtotal.coolingGainPercent",
          type: "calculated",
          value: "100%",
          section: "radiantGains",
          dependencies: ["l_73", "l_74", "l_75", "l_76", "l_77", "l_78"],
          label: "Subtotal: Solar Gain Cooling %",
        },
        m: {
          fieldId: "m_79",
          semanticPath: "radiant.subtotal.netCoolingFactor",
          type: "calculated",
          value: "14,626.70",
          section: "radiantGains",
          dependencies: ["i_79", "j_79", "k_79", "l_79"],
          label: "Subtotal: Net Cooling Gain Factor",
        },
        p: {
          fieldId: "p_79",
          semanticPath: "radiant.subtotal.costImpact",
          type: "calculated",
          value: "14,626.70",
          section: "radiantGains",
          dependencies: ["i_79", "j_79", "k_79", "l_79"],
          label: "Subtotal: Cooling vs Heating Cost Impact",
        },
      },
    },

    // Row 80: G.2 Gains Utilization Factor (n-Factor)
    80: {
      id: "G.2",
      rowId: "G.2",
      label: "Gains Utilization Factor (n-Factor)",
      cells: {
        c: { label: "Gains Utilization Factor (n-Factor)" },
        d: {
          fieldId: "d_80",
          semanticPath: "radiant.utilization.method",
          type: "dropdown",
          dropdownId: "dd_d_80",
          value: "NRC 40%",
          section: "radiantGains",
          tooltip: true, // A Note on Methods
          options: [
            { value: "NRC 0%", name: "NRC 0%" },
            { value: "NRC 40%", name: "NRC 40%" },
            { value: "NRC 50%", name: "NRC 50%" },
            { value: "NRC 60%", name: "NRC 60%" },
            { value: "PH Method", name: "PH Method" },
          ],
        },
        e: {
          fieldId: "e_80",
          semanticPath: "radiant.utilization.totalGains",
          type: "calculated",
          value: "114,698.37",
          section: "radiantGains",
          dependencies: ["i_79", "i_71"],
          label: "Total Gains at n-Factor kWh/yr",
        },
        f: { content: "Total Gains" },
        g: {
          fieldId: "g_80",
          semanticPath: "radiant.utilization.nFactorPercent",
          type: "calculated",
          value: "40.00%",
          section: "radiantGains",
          tooltip: true, // A Note on Methods
          dependencies: ["d_80"],
          label: "n-Factor Value % by Method",
        },
        h: { content: "" }, // Empty cell
        i: {
          fieldId: "i_80",
          semanticPath: "radiant.utilization.netUsableGains",
          type: "calculated",
          value: "45,879.35",
          section: "radiantGains",
          dependencies: ["e_80", "g_80"],
          label: "Net Usable Gains kWh/yr",
        },
        j: {
          content: "G.3 nGains",
          classes: ["tooltip-cell"],
          "data-tooltip": "G.3 Net Usable Gains by Method Selected",
        },
      },
    },

    // Row 81: G.4 Net Usable Heating Season Gains
    81: {
      id: "G.4",
      rowId: "G.4",
      label: "Net Usable Heating Season Gains",
      cells: {
        c: { label: "Net Usable Heating Season Gains" },
        d: {
          content: "PH Method",
          classes: ["reference-value"], // Use reference style (typically red text in the Excel)
        },
        e: {
          fieldId: "e_81",
          semanticPath: "radiant.phppMethod.totalGains",
          type: "calculated",
          value: "114,698.37",
          section: "radiantGains",
          dependencies: ["e_80"],
          classes: ["reference-value"], // Apply reference styling
          label: "Total Gains PHPP Method kWh/yr",
        },
        f: {
          content: "Total Gains",
          classes: ["reference-value"],
        },
        g: {
          fieldId: "g_81",
          semanticPath: "radiant.phppMethod.nFactorPercent",
          type: "calculated",
          value: "94.43%",
          section: "radiantGains",
          dependencies: ["i_79", "i_71", "i_97", "i_103", "m_121", "i_98"],
          classes: ["reference-value"], // Apply reference styling
          label: "PHPP Method: n-Factor Value %",
        },
        h: { content: "", classes: ["reference-value"] }, // Empty cell
        i: {
          fieldId: "i_81",
          semanticPath: "radiant.phppMethod.netUsableGains",
          type: "calculated",
          value: "108,307.67",
          section: "radiantGains",
          dependencies: ["e_81", "g_81"],
          classes: ["reference-value"], // Apply reference styling
          label: "Net Usable Gains by PHPP Method kWh/yr",
        },
        j: {
          content: "G.4 nGains",
          classes: ["reference-value", "tooltip-cell"],
          "data-tooltip": "Net Usable Gains by PHPP Method (Reference)",
        },
      },
    },

    // Row 82: G.5 Net UN-usable Htg. Gains
    82: {
      id: "G.5",
      rowId: "G.5",
      label: "Net UN-usable Htg. Gains",
      cells: {
        c: { label: "Net UN-usable Htg. Gains" },
        i: {
          fieldId: "i_82",
          semanticPath: "radiant.unusable.heatingGains",
          type: "calculated",
          value: "68,819.02",
          section: "radiantGains",
          dependencies: ["e_80", "i_80"],
          label: "Net UN-usable Heating Gains kWh/yr",
        },
      },
    },
  };

  // The opening rows after the first (Openings.js; Andy 2026-11-20): door rows G.7.2-G.7.4 take row
  // 73's shape, window rows G.8.6-G.8.12 row 74's - each its own area, orientation (North for a window,
  // as a new row 74), SHGC and shading. They wait hidden for S10's +.
  const OPENINGS = window.TEUI.Openings;
  OPENINGS.SLOTS.forEach(o => {
    const door = o.kind === "door";
    const base = door ? "73" : "74";
    sectionRows[o.s10] = OPENINGS.cloneRow(sectionRows[base], base, o.s10, {
      id: OPENINGS.s10RowId(o),
      label: door ? "Door" : "Window",
      pathFrom: door ? "doors" : "windowNorth",
      pathTo: o.id,
      textPattern: door ? /\bDoors?\b/g : /\bWindow( Area)? North\b/g,
      textTo: door ? `Door ${OPENINGS.s10RowId(o)}` : `Window ${OPENINGS.s10RowId(o)}`,
      orientation: door ? "Average" : "North",
    });
  });

  // The rows in order: an opening's rows sit with their group (object keys put 73a after every number)
  const ROW_ORDER = [
    "header",
    ...OPENINGS.DOORS.map(o => o.s10),
    ...OPENINGS.WINDOWS.map(o => o.s10),
    ...Object.keys(sectionRows).filter(
      k => k !== "header" && !OPENINGS.ALL.some(o => o.s10 === k)
    ),
  ];

  //==========================================================================
  // ACCESSOR METHODS TO EXTRACT FIELDS AND LAYOUT
  //==========================================================================

  /**
   * Extract field definitions from the integrated layout
   * This method is required for compatibility with the FieldManager
   */
  function getFields() {
    try {
      const fields = {};

      // Extract field definitions from all rows except the header
      Object.entries(sectionRows).forEach(([rowKey, row]) => {
        if (rowKey === "header") return; // Skip the header row
        if (!row.cells) return;

        // Process each cell in the row
        Object.entries(row.cells).forEach(([_colKey, cell]) => {
          if (cell.fieldId && cell.type) {
            // Create field definition with all relevant properties
            fields[cell.fieldId] = {
              type: cell.type,
              label: cell.label || row.label,
              defaultValue: cell.value || "",
              section: cell.section || "radiantGains",
              semanticPath: cell.semanticPath || null, // Phase 5: Include semantic path
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
    } catch (_error) {
      return {}; // Return empty object to avoid breaking the application
    }
  }

  /**
   * Extract dropdown options from the integrated layout
   * Required for backward compatibility
   */
  function getDropdownOptions() {
    try {
      const options = {};

      // Extract dropdown options from all cells with dropdownId
      Object.values(sectionRows).forEach(row => {
        if (!row.cells) return;

        Object.values(row.cells).forEach(cell => {
          if (cell.dropdownId && cell.options) {
            options[cell.dropdownId] = cell.options;
          }
        });
      });

      return options;
    } catch (_error) {
      return {}; // Return empty object to avoid breaking the application
    }
  }

  /**
   * Generate layout from integrated row definitions
   * This converts our compact definition to the format expected by the renderer
   */
  function getLayout() {
    try {
      // IMPORTANT: To ensure the header appears first, we process the rows in
      // a specific order: header first, then all other rows

      // Start with an empty array for rows
      const layoutRows = [];

      // Header first, then the openings by group, then the subtotal and utilization rows (ROW_ORDER)
      ROW_ORDER.forEach(key => {
        if (sectionRows[key]) layoutRows.push(createLayoutRow(sectionRows[key]));
      });

      return { rows: layoutRows };
    } catch (_error) {
      return { rows: [] }; // Return empty rows to avoid breaking the application
    }
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
    columns.forEach(col => {
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
        // BUT preserve the classes property which is critical for styling
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
  // EVENT HANDLING AND CALCULATIONS
  //==========================================================================


  /**
   * Initialize event handlers for this section
   */
  function initializeEventHandlers() {
    const sectionElement = document.getElementById("envelopeRadiantGains");
    if (!sectionElement) return;

    // Add handlers for editable fields
    const editableFields = sectionElement.querySelectorAll(
      '.user-input, [contenteditable="true"]'
    );
    editableFields.forEach(field => {
      // Make text fields editable
      if (field.classList.contains("user-input")) {
        field.setAttribute("contenteditable", "true");
      }

      // Handle blur event for text fields
      field.addEventListener("blur", handleFieldBlur);

      // Handle Enter key
      field.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault(); // Prevent adding a newline
          this.blur(); // Remove focus to trigger the blur event
        }
      });
    });

    // Add dropdown change event handlers
    const dropdowns = sectionElement.querySelectorAll("select");
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener("change", function () {
        const fieldId = this.getAttribute("data-field-id");
        if (!fieldId) return;

        setModeValue(fieldId, this.value, "user-modified");
      });
    });

    // Add slider change handlers
    const sliders = sectionElement.querySelectorAll('input[type="range"]');
    sliders.forEach(slider => {
      slider.addEventListener("input", function () {
        const fieldId = this.getAttribute("data-field-id");
        if (!fieldId) return;

        setModeValue(fieldId, this.value, "user-modified");

        // CORRECTED PATTERN: Use the direct nextElementSibling property for the input handler as well.
        const displayElement = this.nextElementSibling;

        if (displayElement) {
          if (fieldId.startsWith("g_") || fieldId.startsWith("h_")) {
            displayElement.textContent = `${this.value}%`;
          } else {
            displayElement.textContent = parseFloat(this.value).toFixed(2);
          }
        }
      });
      slider.addEventListener("change", function () {
        // Graph handles recalculation via StateManager listener
      });
    });
  }

  /**
   * Set up default values for dropdowns in this section
   */
  function setupDropdownDefaults() {
    try {
      // Find all dropdowns in this section
      const dropdowns = document.querySelectorAll(
        '[data-section="envelopeRadiantGains"] select'
      );

      // For each dropdown, set default value based on the field definition
      dropdowns.forEach(dropdown => {
        const fieldId = dropdown.getAttribute("data-field-id");
        if (!fieldId) return;

        // Get default value from state manager if available
        const defaultValue = window.TEUI?.StateManager?.getValue(fieldId);
        if (defaultValue) {
          dropdown.value = defaultValue;
        }
      });

      // console.log('Radiant Gains dropdown defaults initialized');
    } catch (_error) {
      // Error in setupDropdownDefaults was previously logged here
    }
  }

  /**
   * Register values with the StateManager
   */
  function registerWithStateManager() {
    try {
      if (!window.TEUI?.StateManager) {
        return;
      }

      // Register key values with the state manager
      // This ensures they're available to other sections
      const orientations = [
        "Average",
        "North",
        "East",
        "South",
        "West",
        "Skylight",
      ];
      orientations.forEach(_orientation => {
        // Register orientation-specific fields if needed
      });

      // console.log('Radiant Gains values registered with StateManager');
    } catch (_error) {
      // Error in registerWithStateManager was previously logged here
    }
  }

  /**
   * Called when the section is rendered
   * This is a good place to initialize values and run initial calculations
   */
  function onSectionRendered() {
    console.log("S10: Section rendered.");

    // Initialize event handlers for this section
    initializeEventHandlers();

    registerWithStateManager();

    // The opening rows' +/- (Openings.js), and their visibility on every change and stamp
    OPENINGS.installControls("S10");
    document.addEventListener("teui-openings-changed", () => OPENINGS.applyVisibility("S10"));

    // Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    // Field definitions and layout - REQUIRED
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,

    // Event handling and initialization - REQUIRED
    initializeEventHandlers: initializeEventHandlers,

    onSectionRendered: onSectionRendered,

    setupDropdownDefaults: setupDropdownDefaults,
    registerWithStateManager: registerWithStateManager,

    // After each stamp (an import, a recompute, a mode switch): a row with an area shows
    postStamp: () => OPENINGS.applyVisibility("S10"),
  };
})();
