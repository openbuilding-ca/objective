/**
 * Section19.js - WOMBAT: 3D Thermal Topology Visualization
 * TEUI 4.012 - Created 2025-12-08
 *
 * WOMBAT generates a constraint-driven 3D thermal topology from area-based geometry.
 * Like a wombat creates cubic output from inputs, we transform thermal geometry fields
 * into cube-like topology. This is NOT an architectural model - it's a thermal model as topology.
 *
 * Core Principles:
 * - Volume is Sacred (d_105 ALWAYS preserved exactly)
 * - Areas Drive Form (roof pitch, wall heights emerge from area constraints)
 * - No Validation Errors (impossible geometry renders visually as feedback)
 * - Constraint Satisfaction Feedback (color-coded UI shows how well areas match)
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect19 = (function () {
  "use strict";

  //==========================================================================
  // STATE & CONFIGURATION
  //==========================================================================

  let isActivated = false;
  let threejsLoaded = false;
  let currentModel = null;

  // COORDINATE CONVENTION: Y+ = North (for future window orientation per facade)
  // X+ = East, Y+ = North, Z+ = Up (right-handed coordinate system)
  // Config moved to wombatRender.js

  //==========================================================================
  // PATTERN A DUAL-STATE ARCHITECTURE
  //==========================================================================

  /**
   * TargetState - Holds Target mode values for WOMBAT fields
   * Provides state sovereignty for Target calculation mode
   */
  const TargetState = {
    values: {
      d_150: "1", // Stories (mirrors S12 d_103)
      d_151: "8319.50", // Volume (mirrors S12 d_105)
      d_154: "0.0", // Aspect ratio slider (L:W)
      d_158: "mezzanine", // Floorplate Options (mezzanine/equal)
      d_159: "biplanar", // Roof Type (multiplanar/biplanar/monoplane)
      h_155: "0.00", // Calculated: Footprint width
      h_156: "0.00", // Calculated: Story height
      h_157: "0.00", // Calculated: Footprint length
    },

    getValue: function (fieldId) {
      return this.values[fieldId] !== undefined ? this.values[fieldId] : null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    setDefaults: function () {
      // Initialize from field definitions
      this.values.d_150 = "1.0";
      this.values.d_151 = "8319.50";
      this.values.d_154 = "0.0";
      this.values.d_158 = "mezzanine";
      this.values.d_159 = "biplanar";
      this.values.h_155 = "0.00";
      this.values.h_156 = "0.00";
      this.values.h_157 = "0.00";
    },

    syncFromGlobalState: function () {
      // ✅ MIRROR SYNC: Read S12 source fields (d_103, d_105) and store as S19 mirror fields (d_150, d_151)
      // ExcelMapper only populates d_103/d_105, NOT d_150/d_151 (those are S19-only fields)
      const d_103 = window.TEUI?.StateManager?.getValue("d_103");
      if (d_103 !== null && d_103 !== undefined) {
        this.values.d_150 = d_103; // Stories (mirrors S12 d_103)
      }

      const d_105 = window.TEUI?.StateManager?.getValue("d_105");
      if (d_105 !== null && d_105 !== undefined) {
        this.values.d_151 = d_105; // Volume (mirrors S12 d_105)
      }

      // Sync other S19-specific fields normally
      const fieldIds = ["d_154", "d_158", "d_159", "h_155", "h_156", "h_157"];
      fieldIds.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(fieldId);
        if (value !== null && value !== undefined) {
          this.values[fieldId] = value;
        }
      });
    },
  };

  /**
   * ReferenceState - Holds Reference mode values for WOMBAT fields
   * Provides state sovereignty for Reference calculation mode
   */
  const ReferenceState = {
    values: {
      d_150: "1.0", // Stories (mirrors S12 ref_d_103)
      d_151: "8319.50", // Volume (mirrors S12 ref_d_105)
      d_154: "0.0", // Aspect ratio slider
      d_158: "mezzanine", // Floorplate Options (mezzanine/equal)
      d_159: "biplanar", // Roof Type (multiplanar/biplanar/monoplane)
      h_155: "0.00", // Calculated: Footprint width
      h_156: "0.00", // Calculated: Story height
      h_157: "0.00", // Calculated: Footprint length
    },

    getValue: function (fieldId) {
      return this.values[fieldId] !== undefined ? this.values[fieldId] : null;
    },

    setValue: function (fieldId, value) {
      this.values[fieldId] = value;
    },

    setDefaults: function () {
      // Initialize from field definitions
      this.values.d_150 = "1.0";
      this.values.d_151 = "8319.50";
      this.values.d_154 = "0.0";
      this.values.d_158 = "mezzanine";
      this.values.d_159 = "biplanar";
      this.values.h_155 = "0.00";
      this.values.h_156 = "0.00";
      this.values.h_157 = "0.00";
    },

    syncFromGlobalState: function () {
      // ✅ MIRROR SYNC: Read S12 reference source fields (ref_d_103, ref_d_105) and store as S19 mirror fields
      // ExcelMapper only populates ref_d_103/ref_d_105, NOT ref_d_150/ref_d_151 (those are S19-only fields)
      const ref_d_103 = window.TEUI?.StateManager?.getValue("ref_d_103");
      if (ref_d_103 !== null && ref_d_103 !== undefined) {
        this.values.d_150 = ref_d_103; // Stories (mirrors S12 ref_d_103)
      }

      const ref_d_105 = window.TEUI?.StateManager?.getValue("ref_d_105");
      if (ref_d_105 !== null && ref_d_105 !== undefined) {
        this.values.d_151 = ref_d_105; // Volume (mirrors S12 ref_d_105)
      }

      // Sync other S19-specific reference fields normally
      const fieldIds = ["d_154", "d_158", "d_159", "h_155", "h_156", "h_157"];
      fieldIds.forEach(fieldId => {
        const value = window.TEUI?.StateManager?.getValue(`ref_${fieldId}`);
        if (value !== null && value !== undefined) {
          this.values[fieldId] = value;
        }
      });
    },
  };

  /**
   * ModeManager - Facade for dual-state operations
   * Handles mode-aware reading, writing, and StateManager publishing
   */
  const ModeManager = {
    currentMode: "target", // "target" or "reference"

    /**
     * Switch between Target and Reference modes (PASSIVE PATTERN - like S16)
     * IMPORTANT: Does NOT update input fields - FieldManager handles dual-state routing
     * Only re-renders the 3D visualization with the new mode's geometry
     */
    switchMode: function (mode) {
      if (mode !== "target" && mode !== "reference") {
        return;
      }

      if (this.currentMode === mode) {
        return; // No change needed
      }

      this.currentMode = mode;

      // Update visualization with new mode's geometry and color (passive redraw)
      // Per S16 pattern: Just re-render with current mode's data from StateManager
      if (isActivated) {
        updateVisualization(mode);
      }
    },

    /**
     * Refresh UI - Required by FileHandler Pattern A section sync
     * Called after import to update DOM with synced values
     */
    refreshUI: function () {
      this.updateCalculatedDisplayValues();
    },

    /**
     * Required by ReferenceToggle - but S19 is passive visualization like S16
     * Calculated fields are already published to StateManager by calculation engines
     * No need to manually update DOM - FieldManager handles display updates
     */
    updateCalculatedDisplayValues: function () {
      console.log(
        `[WOMBAT] updateCalculatedDisplayValues() called for mode="${this.currentMode}"`
      );

      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;

      // ✅ EXPANDED: Include mirror sync fields (d_150, d_151) that need DOM refresh
      // These are technically "input" fields, but when S12 changes them via mirror sync,
      // they BEHAVE like calculated fields and need DOM updates
      const fieldsToRefresh = [
        "h_155",
        "h_156",
        "h_157", // Geometry outputs (read-only)
        "d_150",
        "d_151", // Mirror sync inputs (editable) - NEW
      ];

      fieldsToRefresh.forEach(fieldId => {
        const value = currentState.getValue(fieldId);
        if (value === null || value === undefined) {
          return; // Skip if no value
        }

        // Try FieldManager first (for input fields like d_150/d_151)
        const fieldDef = window.TEUI?.FieldManager?.getField(fieldId);
        if (fieldDef && window.TEUI?.FieldManager?.updateFieldDisplay) {
          try {
            window.TEUI.FieldManager.updateFieldDisplay(
              fieldId,
              value,
              fieldDef
            );
          } catch (e) {
            // Silent failure - FieldManager will handle errors
          }
        } else {
          // Fallback for read-only calculated fields (h_155, h_156, h_157)
          const element = document.querySelector(
            `[data-field-id="${fieldId}"]`
          );
          if (
            element &&
            element.tagName !== "INPUT" &&
            !element.hasAttribute("contenteditable")
          ) {
            const formattedValue = parseFloat(value).toFixed(2);
            element.textContent = formattedValue;
          }
        }
      });
    },

    /**
     * Get value from current mode's state
     */
    getValue: function (fieldId) {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      return currentState.getValue(fieldId);
    },

    /**
     * Set value in current mode's state and publish to StateManager
     * MODE-AWARE PUBLISHING: Target publishes unprefixed, Reference publishes ref_ prefixed
     */
    setValue: function (fieldId, value, source = "user-modified") {
      const currentState =
        this.currentMode === "target" ? TargetState : ReferenceState;
      currentState.setValue(fieldId, value);

      // Mode-aware publishing to StateManager
      if (this.currentMode === "target") {
        // Target mode: publish unprefixed
        window.TEUI.StateManager.setValue(fieldId, value, source);
      } else {
        // Reference mode: publish with ref_ prefix
        window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
      }
    },
  };

  //==========================================================================
  // FIELD DEFINITIONS (Section 20 - 200 series)
  //==========================================================================

  const sectionRows = {
    header: {
      id: "S19-HEADER",
      rowId: "S19-HEADER",
      cells: {
        a: {},
        b: {},
        c: { content: "C", classes: ["section-subheader"] },
        d: {
          content: "Options related to Section12",
          classes: ["section-subheader"],
        },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
      },
    },

    // Stories dropdown (mirrored from S12 d_103)
    row150: {
      id: "19.0",
      rowId: "19.0",
      label: "Stories",
      cells: {
        a: {},
        b: {},
        c: { label: "Stories" },
        d: {
          fieldId: "d_150",
          type: "dropdown",
          dropdownId: "dd_d_150",
          value: "1",
          section: "wombat",
          tooltip: true,
          label: "Number of stories (mirrored from S12)",
          options: [
            { value: "1", name: "1" },
            { value: "1.5", name: "1.5" },
            { value: "2", name: "2" },
            { value: "3", name: "3" },
            { value: "4", name: "4" },
            { value: "5", name: "5" },
            { value: "6", name: "6" },
          ],
        },
        e: { content: "Stories", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // Floorplate Options dropdown (clarifies fractional story interpretation)
    row158: {
      id: "19.FP",
      rowId: "19.FP",
      label: "Floorplate Options",
      cells: {
        a: {},
        b: {},
        c: { label: "Floorplate Options" },
        d: {
          fieldId: "d_158",
          type: "dropdown",
          dropdownId: "dd_d_158",
          value: "mezzanine",
          section: "wombat",
          tooltip: true,
          label: "Geometry interpretation for fractional stories",
          options: [
            { value: "mezzanine", name: "Mezzanine" },
            { value: "equal", name: "Equal Floorplates" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // Roof Type dropdown (selects roof geometry type)
    row159: {
      id: "19.RT",
      rowId: "19.RT",
      label: "Roof Type",
      cells: {
        a: {},
        b: {},
        c: { label: "Roof Type" },
        d: {
          fieldId: "d_159",
          type: "dropdown",
          dropdownId: "dd_d_159",
          value: "biplanar",
          section: "wombat",
          tooltip: true,
          label:
            "Roof geometry type (multiplanar=pyramid, biplanar=gable, monoplane=shed, flat=no slope)",
          options: [
            { value: "multiplanar", name: "Pyramid/Hip" },
            { value: "biplanar", name: "Gable" },
            { value: "monoplane", name: "Shed" },
            { value: "flat", name: "Flat" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // Volume input (mirrored from S12 d_105)
    row151: {
      id: "19.V",
      rowId: "19.V",
      label: "Conditioned Volume",
      cells: {
        a: {},
        b: {},
        c: { label: "Conditioned Volume" },
        d: {
          fieldId: "d_151",
          type: "editable",
          value: "8319.50",
          classes: ["user-input"],
          tooltip: true,
          label: "Conditioned volume (mirrored from S12)",
        },
        e: { content: "m³", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
      },
    },

    // Display-only: Area Exposed to Air (mirrored from S12 d_101)
    row152: {
      id: "19.Ae",
      rowId: "19.Ae",
      label: "Area Exposed to Air (Ae)",
      cells: {
        a: {},
        b: {},
        c: { label: "Area Exposed to Air (Ae)" },
        d: {
          fieldId: "d_152",
          type: "calculated",
          value: "2476.62",
          classes: ["text-air-facing"],
          label: "Total area of building components exposed to air (from S12)",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ae", classes: ["label-main"] },
        g: {
          fieldId: "g_152",
          type: "calculated",
          value: "0.278",
          classes: ["text-air-facing"],
          label: "Aggregate U-value for air-facing surfaces (from S12)",
        },
        h: { content: "W/m²·K", classes: ["unit-label"] },
      },
    },

    // Display-only: Area Exposed to Ground (mirrored from S12 d_102)
    row153: {
      id: "19.Ag",
      rowId: "19.Ag",
      label: "Area Exposed to Ground (Ag)",
      cells: {
        a: {},
        b: {},
        c: { label: "Area Exposed to Ground (Ag)" },
        d: {
          fieldId: "d_153",
          type: "calculated",
          value: "1100.93",
          classes: ["text-ground-facing"],
          label:
            "Total area of building components exposed to ground (from S12)",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ag", classes: ["label-main"] },
        g: {
          fieldId: "g_153",
          type: "calculated",
          value: "0.324",
          classes: ["text-ground-facing"],
          label: "Aggregate U-value for ground-facing surfaces (from S12)",
        },
        h: { content: "W/m²·K", classes: ["unit-label"] },
      },
    },

    // User controls for topology solver
    row154: {
      id: "19.1",
      rowId: "19.1",
      label: "Footprint Aspect Ratio (L:W)",
      cells: {
        a: {},
        b: {},
        c: { label: "Footprint Aspect Ratio (L:W)" },
        d: {
          fieldId: "d_154",
          type: "coefficient_slider",
          value: "0.0",
          min: -4.0,
          max: 4.0,
          step: 0.1,
          section: "wombat",
          tooltip: true,
          label:
            "Aspect Ratio: 0 = square, negative = portrait (tall), positive = landscape (wide)",
        },
        e: { content: "(0 = square)", classes: ["text-left"] },
        f: {},
        g: {},
        h: {
          fieldId: "h_157",
          type: "calculated",
          value: "0.00",
          label: "Footprint Length (m)",
        },
      },
    },

    row155: {
      id: "19.2",
      rowId: "19.2",
      label: "Footprint Width",
      cells: {
        a: {},
        b: {},
        c: { label: "Footprint Width" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {
          fieldId: "h_155",
          type: "calculated",
          value: "0.00",
          label: "Footprint Width (m)",
        },
      },
    },

    row156: {
      id: "19.3",
      rowId: "19.3",
      label: "Building Height",
      cells: {
        a: {},
        b: {},
        c: { label: "Building Height" },
        d: {},
        e: {},
        f: {},
        g: {},
        h: {
          fieldId: "h_156",
          type: "calculated",
          value: "0.00",
          label: "Nominal Height (m)",
        },
      },
    },
  };

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      // Handle object-based cells (like Section12)
      Object.values(row.cells).forEach(cell => {
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || cell.content || row.label,
            defaultValue: cell.value || "",
            section: "section19",
          };
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
          if (cell.options !== undefined)
            fields[cell.fieldId].options = cell.options;
          if (cell.dropdownId !== undefined)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    return {
      dd_d_150: [
        { value: "1", name: "1" },
        { value: "1.5", name: "1.5" },
        { value: "2", name: "2" },
        { value: "3", name: "3" },
        { value: "4", name: "4" },
        { value: "5", name: "5" },
        { value: "6", name: "6" },
      ],
      dd_d_158: [
        { value: "mezzanine", name: "Mezzanine/Partial Floor" },
        { value: "equal", name: "Equal Floorplates" },
      ],
    };
  }

  /**
   * Convert object-based cells to array format for FieldManager
   * (Following Section12 pattern)
   */
  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] }; // Start with columns A, B (empty)
    const columns = ["c", "d", "e", "f", "g", "h"];

    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };

        // Handle column C (description) label conversion
        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Clean up internal properties not needed by FieldManager
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Empty cell or fallback to row label for column C
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  function getLayout() {
    const layoutRows = [];

    // Add header
    if (sectionRows.header) {
      layoutRows.push(createLayoutRow(sectionRows.header));
    }

    // Add data rows
    [
      "row150",
      "row158",
      "row159",
      "row151",
      "row152",
      "row153",
      "row154",
      "row155",
      "row156",
    ].forEach(key => {
      if (sectionRows[key]) {
        layoutRows.push(createLayoutRow(sectionRows[key]));
      }
    });

    return { rows: layoutRows };
  }

  //==========================================================================
  // GEOMETRY SOLVER (Constraint-Driven "Jello Cube")
  //==========================================================================

  /**
   * Get mode-aware value from StateManager (S16 pattern)
   * - Target mode: reads unprefixed values (h_15, d_85, d_86)
   * - Reference mode: reads ref_ prefixed values (ref_h_15, ref_d_85, ref_d_86)
   */
  function getModeAwareValue(fieldId, isReferenceCalculation) {
    if (!window.TEUI?.StateManager) return null;

    if (isReferenceCalculation) {
      // Reference mode: Read ONLY ref_ prefixed values for perfect state isolation
      return window.TEUI.StateManager.getValue(`ref_${fieldId}`);
    } else {
      // Target mode: Read unprefixed (standard) values
      return window.TEUI.StateManager.getValue(fieldId);
    }
  }

  //==========================================================================
  // RATIONAL TRIGONOMETRY - Pyramidal Roof Geometry (Wildberger Method)
  //==========================================================================

  /**
   * Calculate pyramidal roof height for square base using rational trigonometry
   * Avoids trig functions - uses quadrance (distance squared) instead
   * @param {number} side - Side length of square base
   * @param {number} areaRatio - Roof area / base area (R >= 1)
   * @returns {number} - Pyramid height (positive)
   */
  function pyramidHeightSquare(side, areaRatio) {
    if (areaRatio < 1) {
      console.warn("[WOMBAT] Roof area ratio < 1, returning 0 height");
      return 0;
    }

    // Work with quadrance (squared quantities) internally
    // Formula: h² = (a²/4)(R² - 1)
    const h2 = ((side * side) / 4) * (areaRatio * areaRatio - 1);

    // Defer sqrt until final step (only irrational operation)
    return Math.sqrt(h2);
  }

  /**
   * Calculate pyramidal roof height for rectangular base using rational trigonometry
   * @param {number} width - Width of rectangular base
   * @param {number} length - Length of rectangular base
   * @param {number} areaRatio - Roof area / base area (R >= 1)
   * @returns {number} - Pyramid height (minimum of two axes)
   */
  function pyramidHeightRectangle(width, length, areaRatio) {
    if (areaRatio < 1) {
      console.warn("[WOMBAT] Roof area ratio < 1, returning 0 height");
      return 0;
    }

    const baseArea = width * length;
    const roofArea = areaRatio * baseArea;
    const faceArea = roofArea / 4;

    // Slant heights from face areas (no trig functions!)
    const sW = (2 * faceArea) / width; // Width-face slant height
    const sL = (2 * faceArea) / length; // Length-face slant height

    // Height quadrance from each axis using Pythagorean theorem
    const h2w = sW * sW - (width * width) / 4;
    const h2l = sL * sL - (length * length) / 4;

    // Check for negative quadrance (mathematical impossibility - roof area too small for pyramid)
    if (h2w < 0 || h2l < 0) {
      console.error(
        "[WOMBAT] Invalid pyramid geometry - negative height quadrance"
      );
      console.error(
        `  Width: ${width.toFixed(2)}m, Length: ${length.toFixed(2)}m, R: ${areaRatio.toFixed(3)}`
      );
      console.error(
        `  h²_width = ${h2w.toFixed(4)}, h²_length = ${h2l.toFixed(4)}`
      );
      console.error("  Roof area too small for pyramidal roof - returning 0");
      return 0;
    }

    // Check for non-congruent faces (only exact for square or R=1)
    if (Math.abs(h2w - h2l) > 1e-6) {
      console.warn("[WOMBAT] Non-congruent pyramid faces detected");
      console.warn(
        `  h²_width = ${h2w.toFixed(4)}, h²_length = ${h2l.toFixed(4)}`
      );
    }

    // Conservative: use minimum height to ensure all faces fit
    const heightSquared = Math.max(0, Math.min(h2w, h2l)); // Ensure non-negative
    return Math.sqrt(heightSquared);
  }

  /**
   * Calculate pyramidal roof height using rational trigonometry
   * Automatically detects square vs rectangular base
   * @param {number} width - Building width
   * @param {number} length - Building length
   * @param {number} areaRatio - Roof area / base area
   * @returns {number} - Pyramid height
   */
  function calculatePyramidalHeight(width, length, areaRatio) {
    const tolerance = 1e-6;

    // Check if base is effectively square
    if (Math.abs(width - length) < tolerance) {
      return pyramidHeightSquare(width, areaRatio);
    } else {
      return pyramidHeightRectangle(width, length, areaRatio);
    }
  }

  /**
   * Calculate gable roof height using rational trigonometry
   * Ridge runs along the longer dimension
   * @param {number} width - Building width
   * @param {number} length - Building length
   * @param {number} roofArea - Total roof area (both slopes)
   * @returns {Object} - { height, ridgeOrientation, ridgeLength, span, gableEndArea }
   */
  function calculateGableHeight(width, length, roofArea) {
    // Ridge runs along the longer dimension
    const ridgeLength = Math.max(width, length);
    const span = Math.min(width, length);
    const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

    // Total roof area = 2 rectangular slopes
    // Each slope area = (ridgeLength × slopeLength)
    // Total area = 2 × ridgeLength × slopeLength
    // Therefore: slopeLength = roofArea / (2 × ridgeLength)
    const slopeLength = roofArea / (2 * ridgeLength);

    // Height from Pythagorean theorem (rational trigonometry)
    // slopeLength² = height² + (span/2)²
    // height² = slopeLength² - (span/2)²
    const h2 = slopeLength * slopeLength - (span * span) / 4;

    // Check for invalid geometry (roof area too small for gable)
    if (h2 < 0) {
      console.error(
        "[WOMBAT] Invalid gable geometry - negative height quadrance"
      );
      console.error(
        `  Width: ${width.toFixed(2)}m, Length: ${length.toFixed(2)}m`
      );
      console.error(
        `  Roof area: ${roofArea.toFixed(2)}m², Slope length: ${slopeLength.toFixed(2)}m`
      );
      console.error(
        `  h² = ${h2.toFixed(4)} (negative - roof area too small for gable)`
      );
      return {
        height: 0,
        ridgeOrientation,
        ridgeLength,
        span,
        gableEndArea: 0,
        isValid: false,
      };
    }

    const height = Math.sqrt(h2);

    // Gable end area (triangular) = (span × height) / 2
    const gableEndArea = (span * height) / 2;

    console.log(`[WOMBAT] Gable roof calculation:`);
    console.log(`  Ridge: ${ridgeOrientation} (${ridgeLength.toFixed(2)}m)`);
    console.log(`  Span: ${span.toFixed(2)}m`);
    console.log(`  Slope length: ${slopeLength.toFixed(2)}m`);
    console.log(`  Height: ${height.toFixed(2)}m`);
    console.log(`  Gable end area (each): ${gableEndArea.toFixed(2)}m²`);

    return {
      height,
      ridgeOrientation,
      ridgeLength,
      span,
      gableEndArea,
      isValid: true,
    };
  }

  /**
   * Calculate shed roof height from roof area using rational trigonometry
   * @param {number} width - Building width (m)
   * @param {number} length - Building length (m)
   * @param {number} roofArea - Total roof area from d_85 (m²)
   * @param {number} shortWallHeight - Height of short wall from g_106 (m)
   * @returns {Object} - Shed roof geometry
   */
  function calculateShedHeight(width, length, roofArea, shortWallHeight) {
    // Shed runs along longer dimension (like gable ridge)
    const ridgeLength = Math.max(width, length);
    const span = Math.min(width, length);
    const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

    // Roof area = ridge length × slope length
    const slopeLength = roofArea / ridgeLength;

    // Use Pythagorean theorem in squared form (rational trigonometry)
    // slope² = span² + height²
    // height² = slope² - span²
    const h2 = slopeLength * slopeLength - span * span;

    if (h2 <= 0) {
      console.warn(
        `[WOMBAT] Shed roof: Invalid geometry - slope length (${slopeLength.toFixed(2)}m) ` +
        `must be greater than span (${span.toFixed(2)}m)`
      );
      return { height: 0, ridgeOrientation, ridgeLength, span, shedEndArea: 0, isValid: false };
    }

    const height = Math.sqrt(h2);

    // Triangular end walls (two ends, like gable)
    // Each end has area = (span × height) / 2
    const shedEndArea = span * height; // Total for both ends

    // Calculate tall wall height
    const tallWallHeight = shortWallHeight + height;

    console.log(
      `[WOMBAT] Shed roof geometry:\n` +
      `  Ridge: ${ridgeOrientation}, length: ${ridgeLength.toFixed(2)}m\n` +
      `  Span: ${span.toFixed(2)}m\n` +
      `  Slope length: ${slopeLength.toFixed(2)}m\n` +
      `  Height rise: ${height.toFixed(2)}m\n` +
      `  Short wall: ${shortWallHeight.toFixed(2)}m\n` +
      `  Tall wall: ${tallWallHeight.toFixed(2)}m\n` +
      `  End wall area (both): ${shedEndArea.toFixed(2)}m²`
    );

    return {
      height,
      ridgeOrientation,
      ridgeLength,
      span,
      slopeLength,
      shedEndArea,
      shortWallHeight,
      tallWallHeight,
      avgWallHeight: (shortWallHeight + tallWallHeight) / 2,
      isValid: true,
    };
  }

  /**
   * Calculate hip roof geometry using two-phase planar-then-vertical approach
   * Phase 1: Ridge geometry determined by 45° hip rafters (planar, deterministic)
   * Phase 2: Height solved from area constraint (vertical, single-variable)
   * Uses rational trigonometry throughout (quadrance-based)
   * @param {number} width - Building width
   * @param {number} length - Building length
   * @param {number} targetRoofArea - Target total roof area
   * @returns {Object} - { height, ridgeOrientation, ridgeLength, span, hipData, isValid }
   */
  function calculateHipHeight(width, length, targetRoofArea) {
    // Ridge runs along the longer dimension
    const maxDimension = Math.max(width, length);
    const minDimension = Math.min(width, length);
    const ridgeOrientation = length >= width ? "longitudinal" : "transverse";
    const span = minDimension;

    console.log(`[WOMBAT] Hip roof calculation (two-phase):`);
    console.log(`  Building: ${width.toFixed(2)}m × ${length.toFixed(2)}m`);
    console.log(`  Target roof area: ${targetRoofArea.toFixed(2)}m²`);
    console.log(`  Ridge orientation: ${ridgeOrientation}`);

    // PHASE 1: Ridge geometry from 45° hip rafters (planar, deterministic)
    // Hip rafters at 45° travel equal distances perpendicular and parallel to ridge
    // Ridge length determined purely by footprint geometry
    const ridgeLength = maxDimension - span;
    const ridgeOffset = span / 2;

    console.log(`[WOMBAT] Phase 1 (planar ridge geometry):`);
    console.log(
      `  Ridge length: ${ridgeLength.toFixed(2)}m (deterministic from 45° hip rafters)`
    );
    console.log(`  Ridge offset: ${ridgeOffset.toFixed(2)}m`);

    // Check if square building (pure pyramid)
    if (ridgeLength < 0.01) {
      console.log(
        `[WOMBAT] Square building detected - ridge length ≈ 0, pure pyramid`
      );
      console.log(`[WOMBAT] Falling back to pyramidal height calculation`);

      // Use pyramidal solver for square buildings
      const pyramidHeight = pyramidHeightRectangle(
        width,
        length,
        targetRoofArea / (width * length)
      );

      return {
        height: pyramidHeight,
        ridgeOrientation,
        ridgeLength: 0,
        ridgeOffset: ridgeOffset,
        span,
        hipData: {
          ridgeLength: 0,
          ridgeOffset: ridgeOffset,
          ridgeOrientation,
          achievedArea: targetRoofArea,
        },
        isValid: pyramidHeight > 0,
      };
    }

    // PHASE 2: Solve for height from area constraint (single-variable)
    // Area = 2 × ridgeLength × slopeLength + 2 × span × hipRafterLength
    // Where:
    //   slopeLength² = h² + (span/2)²
    //   hipRafterLength² = h² + (span/2)² + ridgeOffset²

    console.log(`[WOMBAT] Phase 2 (height from area constraint):`);

    // Binary search on height only
    let hMin = 0;
    let hMax = span * 2; // Reasonable upper bound
    const tolerance = 0.01; // 1cm precision
    const maxIterations = 50;
    let iteration = 0;

    let bestHeight = 0;
    let bestArea = 0;

    while (hMax - hMin > tolerance && iteration < maxIterations) {
      const h = (hMin + hMax) / 2;

      // Calculate roof area with this height (using CORRECT formulas)

      // Main slope area: 2 rectangular slopes
      const slopeLength = Math.sqrt(h * h + (span / 2) * (span / 2));
      const mainSlopeArea = 2 * ridgeLength * slopeLength;

      // Hip end area: 4 triangular faces (2 at each end)
      // Each triangle has base = span and slant height = hip rafter length
      // Hip rafter from corner (±span/2, ±ridgeOffset, 0) to ridge endpoint (0, ±ridgeOffset, h)
      const hipRafterQuadrance =
        (span / 2) * (span / 2) + ridgeOffset * ridgeOffset + h * h;
      const hipRafterLength = Math.sqrt(hipRafterQuadrance);

      // Each triangular face area = (1/2) × span × hipRafterLength
      // Total for 4 triangular faces = 2 × span × hipRafterLength
      const hipEndArea = 2 * span * hipRafterLength;

      const calculatedArea = mainSlopeArea + hipEndArea;

      console.log(
        `  Iteration ${iteration}: h=${h.toFixed(2)}m, area=${calculatedArea.toFixed(2)}m²`
      );

      bestHeight = h;
      bestArea = calculatedArea;

      // Binary search adjustment
      if (Math.abs(calculatedArea - targetRoofArea) < tolerance) {
        break; // Found it!
      } else if (calculatedArea < targetRoofArea) {
        // Need more area - taller roof
        hMin = h;
      } else {
        // Too much area - flatter roof
        hMax = h;
      }

      iteration++;
    }

    if (iteration >= maxIterations) {
      console.warn(
        `[WOMBAT] Hip roof height search did not converge after ${maxIterations} iterations`
      );
    }

    console.log(`[WOMBAT] Hip roof solved:`);
    console.log(
      `  Ridge length: ${ridgeLength.toFixed(2)}m (offset: ${ridgeOffset.toFixed(2)}m)`
    );
    console.log(`  Ridge height: ${bestHeight.toFixed(2)}m`);
    console.log(
      `  Achieved area: ${bestArea.toFixed(2)}m² (target: ${targetRoofArea.toFixed(2)}m²)`
    );
    console.log(`  Error: ${Math.abs(bestArea - targetRoofArea).toFixed(2)}m²`);

    return {
      height: bestHeight,
      ridgeOrientation,
      ridgeLength: ridgeLength,
      ridgeOffset: ridgeOffset,
      span,
      hipData: {
        ridgeLength: ridgeLength,
        ridgeOffset: ridgeOffset,
        ridgeOrientation,
        achievedArea: bestArea,
      },
      isValid:
        bestHeight > 0 &&
        Math.abs(bestArea - targetRoofArea) < targetRoofArea * 0.05, // 5% tolerance
    };
  }

  //==========================================================================
  // GEOMETRY SOLVER
  //==========================================================================

  function solveGeometry(isReferenceCalculation = false) {
    const mode = isReferenceCalculation ? "Reference" : "Target";
    console.log(
      `[WOMBAT] Solving geometry from thermal constraints (${mode} mode)...`
    );

    // Read inputs from StateManager and Pattern A sections (MODE-AWARE per S16 pattern)
    // KISS: Use h_15 (Conditioned Area) instead of d_106 (Total Floor Area)
    // h_15 = thermal envelope area (heated space only)

    // SACRED INPUTS - No fallbacks, fail loudly if missing
    const conditionedArea = parseFloat(
      getModeAwareValue("h_15", isReferenceCalculation)
    );
    const roofArea = parseFloat(
      getModeAwareValue("d_85", isReferenceCalculation)
    );
    const opaqueWallArea = parseFloat(
      getModeAwareValue("d_86", isReferenceCalculation)
    );

    // Footprint area: Try d_95 (slab on grade) first, fallback to d_87 (raised floor)
    // Some buildings have only raised floor (no slab), some have both (e.g., bedroom over garage)
    let footprintArea = parseFloat(
      getModeAwareValue("d_95", isReferenceCalculation)
    );

    if (!footprintArea || footprintArea <= 0 || isNaN(footprintArea)) {
      // No slab - use raised floor area (d_87)
      footprintArea = parseFloat(
        getModeAwareValue("d_87", isReferenceCalculation)
      );
      console.log(
        `[WOMBAT] No slab on grade (d_95), using raised floor area (d_87): ${footprintArea?.toFixed(2)} m²`
      );
    }

    // ⚠️ DUAL-STATE: Read from appropriate state based on calculation mode
    // Mirror fields: d_151 (volume) ↔ S12 d_105, d_150 (stories) ↔ S12 d_103
    const currentState = isReferenceCalculation ? ReferenceState : TargetState;
    const volumeDeclared = parseFloat(
      window.TEUI.parseNumeric(currentState.getValue("d_151"))
    );
    const storiesDeclared = parseFloat(currentState.getValue("d_150"));

    // Validate SACRED inputs - fail loudly if missing or invalid
    if (!footprintArea || footprintArea <= 0 || isNaN(footprintArea)) {
      throw new Error(
        "[WOMBAT] Footprint area required: neither d_95 (slab) nor d_87 (raised floor) have valid values > 0"
      );
    }
    if (!conditionedArea || conditionedArea <= 0 || isNaN(conditionedArea)) {
      throw new Error(
        "[WOMBAT] Conditioned area (h_15) required and must be > 0"
      );
    }
    if (!roofArea || roofArea <= 0 || isNaN(roofArea)) {
      throw new Error("[WOMBAT] Roof area (d_85) required and must be > 0");
    }
    if (isNaN(opaqueWallArea) || opaqueWallArea < 0) {
      throw new Error(
        "[WOMBAT] Opaque wall area (d_86) required and must be >= 0"
      );
    }
    if (!storiesDeclared || storiesDeclared < 0.5 || isNaN(storiesDeclared)) {
      throw new Error(
        "[WOMBAT] Stories (d_150/d_103) required and must be >= 0.5"
      );
    }

    // Volume is LESS SACRED - used for verification, not constraint
    // Will be calculated from surfaces and compared to declared value

    // User preferences - aspect ratio slider
    // Aspect ratio slider: -4 to +4, centered at 0
    // 0 = square (1:1)
    // Positive = landscape (wider than tall): +1 = 2:1, +2 = 3:1, +4 = 5:1
    // Negative = portrait (taller than wide): -1 = 1:2, -2 = 1:3, -4 = 1:5
    const aspectRatioRaw = parseFloat(currentState.getValue("d_154") || 0);
    const aspectRatio =
      aspectRatioRaw >= 0 ? 1 + aspectRatioRaw : 1 / (1 - aspectRatioRaw);

    // ========================================================================
    // CORRECT CONSTRAINT FLOW (per user specification 2025-12-15)
    // ========================================================================
    // 1. Footprint (d_95) = SACRED touchstone
    // 2. Mezzanine = h_15 - d_95 (if Mezzanine/Partial Floor option selected)
    // 3. Total Wall Area = d_86 + all windows
    // 4. Solve ridge height from roof area (d_85) FIRST
    // 5. Extract gable end area from wall area
    // 6. Wall height = (walls - gables) / perimeter
    // 7. Volume (d_105) is verification check ONLY
    // ========================================================================

    // Phase 1: Footprint (X-Y plane) - SACRED TOUCHSTONE
    // Footprint area (d_95) is the foundation of all geometry
    const width = Math.sqrt(footprintArea / aspectRatio);
    const length = footprintArea / width;
    const perimeter = 2 * (length + width);

    console.log(
      `[WOMBAT] Footprint: ${footprintArea.toFixed(2)} m² (${width.toFixed(2)}m × ${length.toFixed(2)}m)`
    );

    // Phase 2: Mezzanine/Partial Floor Calculation
    // Read Floorplate Options (d_158): "mezzanine" or "equal"
    const floorplateOption = currentState.getValue("d_158") || "mezzanine";

    let mezzanineArea = 0;
    const fullStories = Math.floor(storiesDeclared);

    if (floorplateOption === "mezzanine" && storiesDeclared !== fullStories) {
      // User selected Mezzanine/Partial Floor option
      // Check for basement to account for its floorplate area
      const basementWallArea_mezzanine =
        parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;
      const hasBasement_mezzanine = basementWallArea_mezzanine > 0;

      // Mezzanine area = conditioned area - full story floorplates - basement floorplate (if present)
      // Example: 1.5 stories with basement = conditioned - (1 × footprint) - (1 × footprint for basement)
      const fullStoryArea = fullStories * footprintArea;
      const basementFloorplateArea = hasBasement_mezzanine ? footprintArea : 0;

      mezzanineArea = Math.max(
        0,
        conditionedArea - fullStoryArea - basementFloorplateArea
      );

      console.log(`[WOMBAT] Mezzanine/Partial floor calculation:`);
      console.log(`  Conditioned area: ${conditionedArea.toFixed(2)} m²`);
      console.log(
        `  Full stories: ${fullStories} × ${footprintArea.toFixed(2)} m² = ${fullStoryArea.toFixed(2)} m²`
      );
      console.log(
        `  Basement floorplate: ${basementFloorplateArea.toFixed(2)} m²`
      );
      console.log(`  Mezzanine area: ${mezzanineArea.toFixed(2)} m²`);
    } else {
      // Equal floorplates - distribute conditioned area across stories
      mezzanineArea = 0;
      console.log(`[WOMBAT] Equal floorplates - no mezzanine`);
    }

    // Phase 3: Total Wall Area (SACRED)
    // ✅ READ FROM S12 g_107: Total Wall Area checksum (D86+SUM(D88:D92))
    // This is the single source of truth for wall area, calculated in Section12.js
    const totalWallAreaGross =
      parseFloat(getModeAwareValue("g_107", isReferenceCalculation)) || 0;

    console.log(
      `[WOMBAT] Wall area: ${totalWallAreaGross.toFixed(2)} m² (from S12 g_107 checksum)`
    );

    // Phase 4: Roof Geometry - SOLVE FIRST (before wall height!)
    // ========================================================================
    // CRITICAL: Roof geometry must be solved BEFORE wall height calculation
    // because gable roofs contribute area to walls (triangular ends)
    // ========================================================================
    // User provides roof area (d_85) which determines ridge height
    // Roof type selection (d_159): multiplanar/biplanar/monoplane
    // Uses rational trigonometry (quadrance-based, no trig functions)

    const roofTypeSelection = currentState.getValue("d_159") || "biplanar";
    const areaRatio = roofArea / footprintArea;

    // Read g_106 early for shed roof calculations (short wall height)
    const g_106_raw = getModeAwareValue("g_106", isReferenceCalculation);
    const g_106 = parseFloat(g_106_raw) || 3.0; // Default to 3.0m if not set

    let roofType = "flat";
    let roofHeight = 0;
    let gableEndArea = 0; // Total area of both gable ends (for gable roofs)
    let shedEndArea = 0; // Total area of both shed end walls (for shed roofs)
    let roofGeometryData = null;

    console.log(
      `[WOMBAT] Roof area ratio: ${areaRatio.toFixed(3)} (roof/footprint)`
    );

    // Check if user explicitly selected flat roof
    if (roofTypeSelection === "flat") {
      // FLAT ROOF - User override, use declared roof area as-is
      console.log(
        "[WOMBAT] Flat roof selected (user override - no slope calculations)"
      );
      roofType = "flat";
      roofHeight = 0;
    } else if (areaRatio > 1.01) {
      // Pitched roof needed to achieve larger roof area
      if (roofTypeSelection === "biplanar") {
        // GABLE ROOF (biplanar)
        roofType = "gable";
        const gableData = calculateGableHeight(width, length, roofArea);

        if (gableData.isValid) {
          roofHeight = gableData.height;
          gableEndArea = 2 * gableData.gableEndArea; // Both triangular ends
          roofGeometryData = gableData;

          console.log(`[WOMBAT] Gable roof solved:`);
          console.log(`  Ridge height: ${roofHeight.toFixed(2)} m`);
          console.log(`  Gable end area (both): ${gableEndArea.toFixed(2)} m²`);
          console.log(`  Ridge orientation: ${gableData.ridgeOrientation}`);
        } else {
          console.warn(
            "[WOMBAT] Invalid gable geometry - falling back to flat roof"
          );
          roofType = "flat";
          roofHeight = 0;
        }
      } else if (roofTypeSelection === "multiplanar") {
        // HIP ROOF (multiplanar) - truncated gable approach
        roofType = "hip";
        const hipData = calculateHipHeight(width, length, roofArea);

        if (hipData.isValid) {
          roofHeight = hipData.height;
          roofGeometryData = hipData;

          console.log(`[WOMBAT] Hip roof solved:`);
          console.log(`  Ridge height: ${roofHeight.toFixed(2)} m`);
          console.log(`  Ridge length: ${hipData.ridgeLength.toFixed(2)} m`);
          console.log(`  Ridge orientation: ${hipData.ridgeOrientation}`);
        } else {
          console.warn(
            "[WOMBAT] Invalid hip geometry - falling back to flat roof"
          );
          roofType = "flat";
          roofHeight = 0;
        }
      } else {
        // MONOPLANE (shed roof)
        roofType = "monoplane";

        const shedGeometry = calculateShedHeight(width, length, roofArea, g_106);

        if (!shedGeometry.isValid) {
          console.warn(
            `[WOMBAT] Invalid shed roof geometry - roof area (${roofArea.toFixed(2)}m²) ` +
            `too small for footprint (${width.toFixed(2)}m × ${length.toFixed(2)}m)`
          );
          roofType = "flat";
          roofHeight = 0;
        } else {
          roofHeight = shedGeometry.height;
          shedEndArea = shedGeometry.shedEndArea; // Track end wall area for later subtraction

          console.log(`[WOMBAT] Shed roof solved:`);
          console.log(`  Ridge height: ${roofHeight.toFixed(2)} m`);
          console.log(`  Shed end area (both): ${shedEndArea.toFixed(2)} m²`);
          console.log(`  Ridge orientation: ${shedGeometry.ridgeOrientation}`);
          console.log(`  Short wall height: ${shedGeometry.shortWallHeight.toFixed(2)} m`);
          console.log(`  Tall wall height: ${shedGeometry.tallWallHeight.toFixed(2)} m`);

          // Store geometry for renderer
          roofGeometryData = {
            type: "shed",
            height: shedGeometry.height,
            ridgeOrientation: shedGeometry.ridgeOrientation,
            ridgeLength: shedGeometry.ridgeLength,
            span: shedGeometry.span,
            slopeLength: shedGeometry.slopeLength,
            shortWallHeight: shedGeometry.shortWallHeight,
            tallWallHeight: shedGeometry.tallWallHeight,
            avgWallHeight: shedGeometry.avgWallHeight,
            shedEndArea: shedEndArea,
            isValid: true,
          };
        }
      }
    } else if (areaRatio < 0.99) {
      // Inverted pyramid (roof smaller than floor - visual conflict indicator)
      roofType = "inverted";
      roofHeight = -calculatePyramidalHeight(width, length, 1.0 / areaRatio);

      console.warn(`[WOMBAT] Inverted roof: h=${roofHeight.toFixed(2)}m`);
    } else {
      console.log("[WOMBAT] Flat roof (area ratio ≈ 1.0)");
    }

    // Phase 5: Wall Height Calculation (AFTER roof geometry!)
    // ========================================================================
    // CONSTRAINT VALIDATION: Typical Floor-to-Floor Height (g_106)
    // ========================================================================
    // NEW (2025-12-18): Try using realistic F2F height from g_106 first
    // If volume is insufficient for g_106 × storeys, fall back to volume-derived wall height
    // Philosophy: "Absurd pancake is the best explanatory warning"

    // Read g_106 from Section 12 (typical floor-to-floor height per storey)
    // DEBUG: Track ref_g_106 lookup in Reference mode
    const modeLabel = isReferenceCalculation ? "Reference" : "Target";
    const rawG106 = getModeAwareValue("g_106", isReferenceCalculation);
    console.log(`[WOMBAT g_106 DEBUG] Mode: ${modeLabel}`);
    console.log(`[WOMBAT g_106 DEBUG] Raw g_106 value: ${rawG106}`);
    console.log(
      `[WOMBAT g_106 DEBUG] isReferenceCalculation: ${isReferenceCalculation}`
    );

    // Check StateManager directly for ref_g_106
    if (isReferenceCalculation && window.TEUI?.StateManager) {
      const directRefValue = window.TEUI.StateManager.getValue("ref_g_106");
      console.log(
        `[WOMBAT g_106 DEBUG] Direct StateManager lookup ref_g_106: ${directRefValue}`
      );
    }

    const typicalF2FHeight = parseFloat(rawG106);
    console.log(
      `[WOMBAT g_106 DEBUG] Parsed typicalF2FHeight: ${typicalF2FHeight}`
    );
    const hasTypicalHeight =
      typicalF2FHeight && typicalF2FHeight > 0 && !isNaN(typicalF2FHeight);
    console.log(`[WOMBAT g_106 DEBUG] hasTypicalHeight: ${hasTypicalHeight}`);

    // Get user's declared volume (SACRED constraint)
    const conditionedVolume =
      volumeDeclared && volumeDeclared > 0 && !isNaN(volumeDeclared)
        ? volumeDeclared
        : 0;

    // VALIDATION: Check if volume can accommodate intended wall height from g_106
    let useIntendedHeight = false;
    let intendedWallHeight = 0;

    if (hasTypicalHeight && conditionedVolume > 0) {
      // Calculate INTENDED wall height from g_106 × storeys
      intendedWallHeight = storiesDeclared * typicalF2FHeight;
      const requiredWallVolume = footprintArea * intendedWallHeight;

      console.log(`[WOMBAT] Constraint validation (g_106):`);
      console.log(
        `  Intended wall height: ${storiesDeclared} storeys × ${typicalF2FHeight}m = ${intendedWallHeight.toFixed(2)}m`
      );
      console.log(
        `  Required wall volume: ${requiredWallVolume.toFixed(2)} m³`
      );
      console.log(
        `  Total conditioned volume (d_105): ${conditionedVolume.toFixed(2)} m³`
      );

      // Check if volume can accommodate intended wall height
      if (conditionedVolume > requiredWallVolume) {
        // VALID: Volume sufficient for intended wall height
        useIntendedHeight = true;
        console.log(
          `  ✓ Volume sufficient for ${intendedWallHeight.toFixed(2)}m walls`
        );

        // Update console ticker
        if (showFeedback) {
          showFeedback("✓ Constraints valid", 3000);
        }
      } else {
        // INVALID: Volume insufficient - fall back to volume-derived wall height
        const deficit = requiredWallVolume - conditionedVolume;
        const percentShort = ((deficit / requiredWallVolume) * 100).toFixed(1);

        console.error(`[WOMBAT] ❌ VOLUME CONSTRAINT VIOLATED`);
        console.error(
          `  Building: ${storiesDeclared} storeys × ${typicalF2FHeight}m = ${intendedWallHeight.toFixed(2)}m`
        );
        console.error(
          `  Wall volume required: ${requiredWallVolume.toFixed(2)} m³`
        );
        console.error(
          `  Total volume (d_105): ${conditionedVolume.toFixed(2)} m³`
        );
        console.error(
          `  Deficit: ${deficit.toFixed(2)} m³ (${percentShort}% under-reported)`
        );
        console.error(`  `);
        console.error(
          `  → FALLBACK: Rendering with volume-derived wall height (ABSURD PANCAKE!)`
        );
        console.error(
          `  → Fix d_105 in Section 12 to at least ${requiredWallVolume.toFixed(0)} m³`
        );

        // Update console ticker
        if (showFeedback) {
          showFeedback(
            `❌ Volume ${percentShort}% too low (Fix d_105 in S12)`,
            15000
          );
        }

        // Will fall through to volume-derived solver below
        useIntendedHeight = false;
      }
    }

    // ========================================================================
    // CRITICAL: Use VOLUME as constraint to solve for wall height
    // This ensures the geometry satisfies the user's declared conditioned volume
    //
    // Process:
    // 1. Calculate roof volume from roof geometry
    // 2. Subtract roof volume from total volume to get rectangular volume
    // 3. Solve wall height from rectangular volume (OR use intended height if validated)
    // 4. Verify against wall area as a consistency check
    // ========================================================================

    let wallHeight = 0;
    let wallHeightFromVolume = 0;
    let wallHeightFromArea = 0;
    let effectiveWallArea = totalWallAreaGross;

    if (conditionedVolume > 0) {
      // Read basement data EARLY (before wall height calculation)
      // This prevents basement height from being divided across above-grade stories
      const basementWallArea_early =
        parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;
      const hasBasement_early = basementWallArea_early > 0;

      // Calculate basement volume (below-grade conditioned space)
      let basementVolume = 0;
      if (hasBasement_early && perimeter > 0) {
        const basementDepth_early = basementWallArea_early / perimeter;
        basementVolume = footprintArea * basementDepth_early;

        console.log(`[WOMBAT] Basement volume calculation:`);
        console.log(
          `  Basement wall area: ${basementWallArea_early.toFixed(2)} m²`
        );
        console.log(`  Basement depth: ${basementDepth_early.toFixed(2)} m`);
        console.log(`  Basement volume: ${basementVolume.toFixed(2)} m³`);
      }

      // Calculate roof volume
      let roofVolume = 0;
      if (roofType === "gable" && roofHeight > 0) {
        roofVolume = (footprintArea * roofHeight) / 2;
      } else if (roofType === "monoplane" && roofHeight > 0) {
        // Shed roof volume = footprint × (height / 2)
        // This is half of a gable roof volume (single slope instead of two)
        roofVolume = (footprintArea * roofHeight) / 2;
      } else if (roofType === "hip" && roofHeight > 0 && roofGeometryData) {
        // Hip roof volume = gable section + 2 pyramidal end caps
        const ridgeLength = roofGeometryData.ridgeLength;
        const ridgeOffset = roofGeometryData.ridgeOffset;
        const hipSpan = roofGeometryData.span; // Get span from hip geometry data

        // Gable section: rectangular prism with triangular cross-section
        const gableSectionVolume = (ridgeLength * hipSpan * roofHeight) / 2;

        // Each pyramidal end cap: 1/3 * base_area * height
        // Base area = ridgeOffset × span (rectangle at building edge)
        const endCapVolume = 2 * (1 / 3) * (ridgeOffset * hipSpan) * roofHeight;

        roofVolume = gableSectionVolume + endCapVolume;
      } else if (roofType === "pyramidal" && roofHeight > 0) {
        roofVolume = (1 / 3) * footprintArea * roofHeight;
      } else if (roofType === "inverted" && roofHeight < 0) {
        roofVolume = -(1 / 3) * footprintArea * Math.abs(roofHeight);
      }

      // CRITICAL: Subtract BOTH roof and basement from total conditioned volume
      // This gives us ONLY the above-grade rectangular volume
      const rectangularVolume = conditionedVolume - roofVolume - basementVolume;
      wallHeightFromVolume = rectangularVolume / footprintArea;

      console.log(`[WOMBAT] Volume-constrained wall height:`);
      console.log(
        `  Total conditioned volume (d_105): ${conditionedVolume.toFixed(2)} m³`
      );
      console.log(`  Roof volume: ${roofVolume.toFixed(2)} m³`);
      console.log(`  Basement volume: ${basementVolume.toFixed(2)} m³`);
      console.log(
        `  Above-grade rectangular volume: ${rectangularVolume.toFixed(2)} m³`
      );
      console.log(
        `  Above-grade wall height: ${wallHeightFromVolume.toFixed(3)} m`
      );

      // Check for impossible geometry (negative or tiny volume remaining)
      if (rectangularVolume < 100) {
        console.warn(
          `[WOMBAT] ⚠️  Above-grade volume very small (${rectangularVolume.toFixed(0)} m³)`
        );
        console.warn(`  This suggests inconsistent inputs:`);
        console.warn(`  - Total volume too small for roof + basement + walls`);
        console.warn(
          `  - OR roof area too large (check if cathedral ceiling intended)`
        );
        console.warn(`  - OR basement too deep for building volume`);
      }

      // DECISION: Use intended height (g_106) if validated, otherwise use volume-derived
      if (useIntendedHeight && intendedWallHeight > 0) {
        // VALID: Use realistic F2F height from g_106
        wallHeight = intendedWallHeight;
        console.log(
          `[WOMBAT] ✓ Using intended wall height from g_106: ${wallHeight.toFixed(2)}m`
        );

        // Log the difference for reference (how much volume is "wasted" vs perfect fit)
        const impliedVolume = footprintArea * wallHeight;
        const volumeDifference = rectangularVolume - impliedVolume;
        if (Math.abs(volumeDifference) > 1.0) {
          console.log(
            `[WOMBAT] Volume fit: ${volumeDifference > 0 ? "+" : ""}${volumeDifference.toFixed(2)} m³ ${volumeDifference > 0 ? "spare" : "deficit"}`
          );
        }
      } else {
        // FALLBACK: Use volume-derived wall height (old solver behavior)
        wallHeight = wallHeightFromVolume;

        if (hasTypicalHeight && !useIntendedHeight) {
          // Log fallback F2F for comparison
          const fallbackF2F = wallHeight / storiesDeclared;
          console.warn(
            `[WOMBAT] ⚠️ Using fallback wall height: ${wallHeight.toFixed(2)}m`
          );
          console.warn(
            `[WOMBAT] ⚠️ Fallback F2F: ${fallbackF2F.toFixed(2)}m per storey (pancake!)`
          );
        }
      }
    } else {
      // Fallback: No valid volume, use wall area method
      console.warn(
        `[WOMBAT] No valid volume - falling back to wall area method`
      );

      if (roofType === "gable" && gableEndArea > 0) {
        effectiveWallArea = totalWallAreaGross - gableEndArea;
      } else if (roofType === "monoplane" && shedEndArea > 0) {
        effectiveWallArea = totalWallAreaGross - shedEndArea;
      }

      wallHeightFromArea = effectiveWallArea / perimeter;
      wallHeight = wallHeightFromArea;
    }

    // SPECIAL CASE: Shed roof uses average wall height from geometry
    // Because shed roofs have asymmetric walls (short vs tall), the wall height
    // is determined by the roof geometry, not by dividing volume by footprint
    if (roofType === "monoplane" && roofGeometryData?.avgWallHeight) {
      const volumeDerivedHeight = wallHeight;
      wallHeight = roofGeometryData.avgWallHeight;
      console.log(
        `[WOMBAT] Using shed roof average wall height: ${wallHeight.toFixed(2)}m ` +
        `(short: ${roofGeometryData.shortWallHeight.toFixed(2)}m, ` +
        `tall: ${roofGeometryData.tallWallHeight.toFixed(2)}m)`
      );
      console.log(
        `[WOMBAT] Volume-derived height was: ${volumeDerivedHeight.toFixed(2)}m ` +
        `(overridden for shed roof asymmetry)`
      );
    }

    // Verify wall height against wall area (consistency check)
    if (roofType === "gable" && gableEndArea > 0) {
      effectiveWallArea = totalWallAreaGross - gableEndArea;
    } else if (roofType === "monoplane" && shedEndArea > 0) {
      // Shed roof also has triangular end walls that need to be subtracted
      effectiveWallArea = totalWallAreaGross - shedEndArea;
    }
    wallHeightFromArea = effectiveWallArea / perimeter;

    const heightDiscrepancy = Math.abs(wallHeight - wallHeightFromArea);
    const heightDiscrepancyPct = (heightDiscrepancy / wallHeight) * 100;

    console.log(`[WOMBAT] Wall height verification:`);
    console.log(`  From volume: ${wallHeight.toFixed(3)} m`);
    console.log(`  From wall area: ${wallHeightFromArea.toFixed(3)} m`);
    console.log(`  Discrepancy: ${heightDiscrepancyPct.toFixed(1)}%`);

    if (heightDiscrepancyPct > 5) {
      console.warn(
        `[WOMBAT] Wall height discrepancy > 5% - volume and wall area may be inconsistent`
      );
    }

    // Story height derived from wall height (for visualization)
    const storyHeight = wallHeight / storiesDeclared;

    // Per-floor metrics (footprint is SACRED - all full floors share this area)
    const areaPerFloor = footprintArea; // Each full floor = footprint area (d_95)

    // Store roof geometry (replaces old roofPitch field)
    const roof = {
      type: roofType,
      height: roofHeight,
      areaRatio: areaRatio,
      gableEndArea: gableEndArea,
      gableData: roofType === "gable" ? roofGeometryData : null, // Full gable geometry data
      hipData: roofType === "hip" ? roofGeometryData : null, // Full hip geometry data
      shedData: roofType === "monoplane" ? roofGeometryData : null, // Full shed geometry data
    };

    // Phase 4: Below-Grade Geometry (WOMBAT Phase 2)
    // Read S11 below-grade data
    const slabArea =
      parseFloat(getModeAwareValue("d_95", isReferenceCalculation)) || 0;
    const basementWallArea =
      parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;
    const floorExposedToAir =
      parseFloat(getModeAwareValue("d_87", isReferenceCalculation)) || 0;

    const hasBasement = basementWallArea > 0;
    const hasSlab = slabArea > 0;
    const hasRaisedFloor = floorExposedToAir > 0;

    // Calculate basement depth from wall area
    const basementDepth = hasBasement ? basementWallArea / perimeter : 0;

    // Determine foundation type
    function determineFoundationType(hasSlab, hasBasement, hasRaisedFloor) {
      if (hasBasement && hasSlab) return "full-basement";
      if (hasSlab && !hasBasement) return "slab-on-grade";
      if (!hasSlab && !hasBasement && hasRaisedFloor) return "raised-floor";
      if (hasBasement && !hasSlab) return "basement-no-slab";
      return "unknown";
    }

    const foundationType = determineFoundationType(
      hasSlab,
      hasBasement,
      hasRaisedFloor
    );

    // Calculate total building height (wall height + roof height)
    const totalBuildingHeight = wallHeight + Math.abs(roofHeight);

    // Store solved dimensions
    const solvedGeometry = {
      footprint: { length, width, area: footprintArea },
      height: wallHeight, // Wall height (volume-constrained)
      totalHeight: totalBuildingHeight, // Wall + roof height
      storyHeight: storyHeight,
      stories: storiesDeclared,
      areaPerFloor: areaPerFloor,
      mezzanineArea: mezzanineArea, // Adiabatic internal floor area
      walls: {
        north: { width: width, height: wallHeight },
        south: { width: width, height: wallHeight },
        east: { width: length, height: wallHeight },
        west: { width: length, height: wallHeight },
        totalGrossArea: totalWallAreaGross, // Total wall area (opaque + windows)
        effectiveArea: effectiveWallArea, // Wall area excluding gable ends
        heightFromVolume: wallHeightFromVolume, // Wall height from volume constraint
        heightFromArea: wallHeightFromArea, // Wall height from area (verification)
      },
      roof: roof, // Rational trigonometry roof object (type, height, areaRatio)
      volume: conditionedVolume, // User-declared conditioned volume (d_105/d_151) - CONSTRAINT
      belowGrade: {
        hasBasement: hasBasement,
        hasSlab: hasSlab,
        hasRaisedFloor: hasRaisedFloor,
        basementDepth: basementDepth,
        slabArea: slabArea,
        basementWallArea: basementWallArea,
        foundationType: foundationType,
      },
    };

    // DUAL-STATE: Store calculated values in appropriate state object
    // (Will be published to StateManager by calculateTargetModel/calculateReferenceModel)
    currentState.setValue("h_157", length.toFixed(2));
    currentState.setValue("h_155", width.toFixed(2));
    currentState.setValue("h_156", storyHeight.toFixed(2));

    console.log(`[WOMBAT] Geometry solved (${mode} mode):`, solvedGeometry);
    return solvedGeometry;
  }

  //==========================================================================
  // 3D RENDERING (Delegated to wombatRender.js)
  //==========================================================================

  function initializeSVG() {
    const svg = document.getElementById("wombat-svg");
    if (!svg) {
      console.error("[WOMBAT] SVG element not found");
      return;
    }

    console.log("[WOMBAT] SVG element initialized");
    // Placeholder: Draw simple message until activated
    drawPlaceholder();
  }

  function drawPlaceholder() {
    const svg = document.getElementById("wombat-svg");
    if (!svg) return;

    // Delegate to wombatRender.js
    window.TEUI.WombatRender.renderPlaceholder(svg);
  }

  function updateVisualization(mode = "target") {
    console.log(`🎨 [WOMBAT updateVisualization] Called with mode="${mode}"`);
    console.log(`🎨 [WOMBAT updateVisualization] isActivated = ${isActivated}`);
    if (!isActivated) {
      console.warn(
        `⚠️ [WOMBAT updateVisualization] Not activated, returning early`
      );
      return;
    }

    // Solve geometry for the requested mode
    const isReference = mode === "reference";
    console.log(`🎨 [WOMBAT updateVisualization] isReference = ${isReference}`);
    const geometry = solveGeometry(isReference);
    currentModel = geometry;

    // Get SVG element
    const svg = document.getElementById("wombat-svg");
    console.log(`🎨 [WOMBAT updateVisualization] SVG element found: ${!!svg}`);
    if (!svg) {
      console.error(`❌ [WOMBAT updateVisualization] SVG element not found!`);
      return;
    }

    // Delegate rendering to wombatRender.js
    console.log(`🎨 [WOMBAT] Delegating render to wombatRender.js`);
    window.TEUI.WombatRender.render(geometry, mode, svg, {
      showBelowGrade: false, // Phase 2: will enable when implemented
    });
  }

  //==========================================================================
  // ACTIVATION CONTROLS (Following S17 pattern)
  //==========================================================================

  function createActivationControls() {
    const container = document.querySelector(".wombat-controls-wrapper");
    if (!container) {
      console.error("[WOMBAT] Controls wrapper not found");
      return;
    }

    container.innerHTML = `
      <div class="wombat-controls">
        <!-- Activation button -->
        <button id="wombat-activate-btn" class="btn btn-primary btn-sm">
          🏗️ Activate Topology View
        </button>

        <!-- Description text (middle flex area) -->
        <span style="color: #6c757d; font-size: 13px;">
          Generate 3D thermal topology from envelope areas (Volume, Roof, Walls, Windows)
        </span>

        <!-- Control buttons (right side) -->
        <div>
          <button id="wombat-refresh-btn" class="btn btn-outline-secondary btn-sm"
                  title="Refresh Topology" disabled>
            <i class="bi bi-arrow-repeat"></i>
          </button>

          <button id="wombat-info-btn" class="btn btn-outline-secondary btn-sm"
                  title="What is WOMBAT?">
            <i class="bi bi-gear"></i>
          </button>

          <button id="wombat-fullscreen-btn" class="btn btn-outline-secondary btn-sm"
                  title="Toggle Fullscreen" disabled>
            <i class="bi bi-fullscreen"></i>
          </button>
        </div>
      </div>
    `;

    // Attach activation handler
    const activateBtn = document.getElementById("wombat-activate-btn");
    if (activateBtn) {
      activateBtn.addEventListener("click", toggleActivation);
    }

    // Attach refresh handler
    const refreshBtn = document.getElementById("wombat-refresh-btn");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", handleRefreshTopology);
    }

    // Attach info modal handler
    const infoBtn = document.getElementById("wombat-info-btn");
    if (infoBtn) {
      infoBtn.addEventListener("click", showInfoModal);
    }

    // Attach fullscreen handler
    const fullscreenBtn = document.getElementById("wombat-fullscreen-btn");
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener("click", toggleFullscreen);
    }

    // Inject feedback console into section header (following S18 pattern)
    createFeedbackConsole();
  }

  function createFeedbackConsole() {
    const feedbackConsole = document.createElement("span");
    feedbackConsole.id = "s19-feedback-console";

    const sectionHeader = document.querySelector("#wombat .section-header");
    if (
      sectionHeader &&
      !sectionHeader.querySelector("#s19-feedback-console")
    ) {
      sectionHeader.appendChild(feedbackConsole);
      console.log("[WOMBAT] Feedback console injected into section header");
    }
  }

  function showFeedback(message, duration = 5000) {
    const console = document.getElementById("s19-feedback-console");
    if (!console) return;

    console.textContent = message;
    console.style.opacity = "1";

    setTimeout(() => {
      console.style.transition = "opacity 1s";
      console.style.opacity = "0";
      setTimeout(() => {
        console.textContent = "";
        console.style.opacity = "1";
        console.style.transition = "";
      }, 1000);
    }, duration);
  }

  function showInfoModal() {
    const backdrop = document.createElement("div");
    backdrop.className = "pc-modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "pc-modal-dialog";
    modal.style.maxWidth = "600px";

    const header = document.createElement("h5");
    header.textContent = "💡 What is WOMBAT?";
    header.className = "pc-modal-header";
    header.style.color = "#007bff";

    const content = document.createElement("div");
    content.innerHTML = `
      <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.6;">
        WOMBAT shows how <strong>OBJECTIVE "sees" your building</strong> based on thermal areas you entered.
        This is NOT a 3D architectural model - it's a <strong>thermal topology</strong> where areas drive form. Why Wombat? Because Wombats poop little cubes, and that's what this section does with your geometry!
      </p>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;">
        <li><strong>Volume is sacred:</strong> Section12's volume parameter is always preserved exactly</li>
        <li><strong>Stories constrain height:</strong> Building height = volume ÷ (area ÷ stories)</li>
        <li><strong>Aspect ratio shapes footprint:</strong> 1.0 = square, 2.0 = 2:1 rectangle</li>
        <li><strong>Roof pitch emerges from roof area:</strong> Larger roof = steeper pitch, based on vector algebra and rational trigonometry</li>
        <li><strong>Walls deform to match area constraints:</strong> No validation errors</li>
        <li><strong>Below-grade geometry:</strong> Brown dashed lines = ground-facing (Ag), Blue/Red solid lines = air-facing (Ae)</li>
        <li><strong>Grade line at z=0:</strong> Shows separation between above and below grade. Dashed = hidden (below ground), Solid = visible (at grade)</li>
        <li style="color: #dc3545;"><strong>⚠ We know this 3D shape may look nothing like your building:</strong> Think of this like a graph, an abstract representation of the surface geometry OBJECTIVE uses for its calculations. Over time, these models will become more refined, but for now, we hope this gives you an idea of what OBJECTIVE is considering for its area calculations</li>
      </ul>
    `;

    const btnContainer = document.createElement("div");
    btnContainer.className = "pc-modal-actions";

    const closeBtn = document.createElement("button");
    closeBtn.className = "btn btn-primary";
    closeBtn.textContent = "Close";
    closeBtn.addEventListener("click", () => {
      document.body.removeChild(backdrop);
    });

    btnContainer.appendChild(closeBtn);

    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(btnContainer);

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Close on backdrop click
    backdrop.addEventListener("click", e => {
      if (e.target === backdrop) {
        document.body.removeChild(backdrop);
      }
    });
  }

  function handleRefreshTopology() {
    console.log("[WOMBAT] Refreshing topology from refresh button");

    // Sync values from StateManager before rendering
    syncFromStateManager();

    const mode = ModeManager?.currentMode || "target";
    updateVisualization(mode);
  }

  function toggleFullscreen() {
    const wombatSection = document.getElementById("wombat");
    const fullscreenBtn = document.getElementById("wombat-fullscreen-btn");

    if (!wombatSection || !fullscreenBtn) return;

    if (wombatSection.classList.contains("wombat-fullscreen")) {
      // Exit fullscreen
      wombatSection.classList.remove("wombat-fullscreen");
      fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen"></i>';
      fullscreenBtn.title = "Toggle Fullscreen";

      // Remove ESC key listener
      document.removeEventListener("keydown", handleFullscreenEscape);
    } else {
      // Enter fullscreen
      wombatSection.classList.add("wombat-fullscreen");
      fullscreenBtn.innerHTML = '<i class="bi bi-fullscreen-exit"></i>';
      fullscreenBtn.title = "Exit Fullscreen";

      // Add ESC key listener to exit fullscreen
      document.addEventListener("keydown", handleFullscreenEscape);
    }
  }

  function handleFullscreenEscape(event) {
    if (event.key === "Escape" || event.keyCode === 27) {
      const wombatSection = document.getElementById("wombat");
      if (
        wombatSection &&
        wombatSection.classList.contains("wombat-fullscreen")
      ) {
        toggleFullscreen();
      }
    }
  }

  /**
   * Sync S19 fields and state from StateManager (S12 values)
   * Call this on activation/refresh to ensure values are current after import
   */
  function syncFromStateManager() {
    console.log("[WOMBAT] Syncing values from StateManager...");

    // Read current values from StateManager (S12's d_105/d_103)
    const volumeFromS12 = window.TEUI.StateManager.getValue("d_105");
    const refVolumeFromS12 = window.TEUI.StateManager.getValue("ref_d_105");
    const storiesFromS12 = window.TEUI.StateManager.getValue("d_103");
    const refStoriesFromS12 = window.TEUI.StateManager.getValue("ref_d_103");

    // Update Target state
    if (volumeFromS12) {
      const currentValue = TargetState.getValue("d_151");
      if (currentValue !== volumeFromS12) {
        TargetState.setValue("d_151", volumeFromS12);
        console.log(
          `[WOMBAT] Synced d_151 = ${volumeFromS12} from StateManager (d_105)`
        );

        // Update DOM field
        const volumeField = document.querySelector(
          '#wombat [data-field-id="d_151"]'
        );
        if (volumeField) {
          volumeField.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(volumeFromS12),
            "number-2dp"
          );
        }
      }
    }

    if (storiesFromS12) {
      const currentValue = TargetState.getValue("d_150");
      if (currentValue !== storiesFromS12) {
        TargetState.setValue("d_150", storiesFromS12);
        console.log(
          `[WOMBAT] Synced d_150 = ${storiesFromS12} from StateManager (d_103)`
        );

        // Update DOM dropdown
        const storiesDropdown = document.querySelector(
          '#wombat [data-field-id="d_150"]'
        );
        if (storiesDropdown) {
          storiesDropdown.textContent = storiesFromS12;
        }
      }
    }

    // Update Reference state
    if (refVolumeFromS12) {
      const currentValue = ReferenceState.getValue("d_151");
      if (currentValue !== refVolumeFromS12) {
        ReferenceState.setValue("d_151", refVolumeFromS12);
        console.log(
          `[WOMBAT] Synced ref_d_151 = ${refVolumeFromS12} from StateManager (ref_d_105)`
        );

        // Update DOM field if Reference mode is active
        if (ModeManager?.currentMode === "reference") {
          const volumeField = document.querySelector(
            '#wombat [data-field-id="d_151"]'
          );
          if (volumeField) {
            volumeField.textContent = window.TEUI.formatNumber(
              window.TEUI.parseNumeric(refVolumeFromS12),
              "number-2dp"
            );
          }
        }
      }
    }

    if (refStoriesFromS12) {
      const currentValue = ReferenceState.getValue("d_150");
      if (currentValue !== refStoriesFromS12) {
        ReferenceState.setValue("d_150", refStoriesFromS12);
        console.log(
          `[WOMBAT] Synced ref_d_150 = ${refStoriesFromS12} from StateManager (ref_d_103)`
        );

        // Update DOM dropdown if Reference mode is active
        if (ModeManager?.currentMode === "reference") {
          const storiesDropdown = document.querySelector(
            '#wombat [data-field-id="d_150"]'
          );
          if (storiesDropdown) {
            storiesDropdown.textContent = refStoriesFromS12;
          }
        }
      }
    }
  }

  function toggleActivation() {
    const activateBtn = document.getElementById("wombat-activate-btn");
    const refreshBtn = document.getElementById("wombat-refresh-btn");
    const fullscreenBtn = document.getElementById("wombat-fullscreen-btn");

    if (!isActivated) {
      // First activation only
      isActivated = true;

      // Change button style to match S18 (outlined, not solid)
      activateBtn.classList.remove("btn-primary");
      activateBtn.classList.add("btn-outline-secondary");
      activateBtn.innerHTML =
        '<i class="bi bi-arrow-repeat"></i> Refresh Topology';

      // Enable refresh and fullscreen buttons
      if (refreshBtn) refreshBtn.disabled = false;
      if (fullscreenBtn) fullscreenBtn.disabled = false;

      console.log("[WOMBAT] Topology view activated");
    } else {
      // Already activated - this is a refresh
      console.log("[WOMBAT] Refreshing topology");
    }

    // Sync values from StateManager before rendering (handles post-import scenarios)
    syncFromStateManager();

    const mode = ModeManager?.currentMode || "target";
    updateVisualization(mode);
  }

  //==========================================================================
  // EVENT HANDLERS
  //==========================================================================

  function setupFieldListeners() {
    const sectionElement = document.getElementById("wombat");
    if (!sectionElement) {
      console.warn(
        "[WOMBAT] setupFieldListeners: Section element #wombat not found"
      );
      return;
    }

    // ⚠️ CRITICAL: WOMBAT owns d_151 and d_150 - must publish to StateManager on user edit
    // Per 4012-CHEATSHEET Anti-Pattern 6: Only listen to OWN input fields via DOM

    // ✅ ARCHITECTURAL COMPLIANCE: d_150 dropdown handled by FieldManager
    // FieldManager already has change listener that calls routeToSectionModeManager()
    // which routes through ModeManager.setValue() and calls calculateAll()
    // No custom listener needed (removed non-standard double listener)

    // ✅ STEP 3: d_151 volume field now uses standard "editable" type
    // Add blur and keydown handlers (matches S12 pattern for editable fields)
    const volumeField = sectionElement.querySelector('[data-field-id="d_151"]');
    if (volumeField && !volumeField.hasWombatListeners) {
      // Blur handler: Parse, format, and publish value (matches S12 handleFieldBlur)
      volumeField.addEventListener("blur", function (event) {
        const field = event.target;
        const fieldId = field.getAttribute("data-field-id");
        if (!fieldId) return;

        const numValue = window.TEUI.parseNumeric(field.textContent);
        if (!isNaN(numValue) && isFinite(numValue)) {
          const formattedValue = window.TEUI.formatNumber(
            numValue,
            "number-2dp"
          );
          field.textContent = formattedValue;

          // MODE-AWARE: Use ModeManager.setValue for dual-state publishing
          ModeManager.setValue(fieldId, String(numValue), "user-modified");
          if (isActivated) {
            calculateAll();
          }
        }
      });

      // Keydown handler: Prevent newlines on Enter (matches S12 handleFieldKeydown)
      volumeField.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          this.blur();
        }
      });

      volumeField.hasWombatListeners = true;
    }
  }

  function initializeEventHandlers() {
    console.log("[WOMBAT] Initializing event handlers");

    // Setup field blur handlers for WOMBAT's own input fields (d_151, d_150)
    // Per 4012-CHEATSHEET: Sections ONLY listen to their OWN input fields via DOM
    setupFieldListeners();

    // Aspect ratio slider
    const aspectSlider = document.querySelector(
      '[data-field-id="d_154"] input[type="range"]'
    );
    if (aspectSlider && !aspectSlider.hasSliderListener) {
      aspectSlider.addEventListener("input", e => {
        const rawValue = parseFloat(e.target.value);
        const displaySpan = document.querySelector(
          'span[data-display-for="d_154"]'
        );
        if (displaySpan) {
          // Convert slider value to aspect ratio display
          if (rawValue === 0) {
            displaySpan.textContent = "1:1 (square)";
          } else if (rawValue > 0) {
            // Landscape: +1 = 2:1, +2 = 3:1, etc.
            displaySpan.textContent = `${(1 + rawValue).toFixed(1)}:1 (landscape)`;
          } else {
            // Portrait: -1 = 1:2, -2 = 1:3, etc.
            displaySpan.textContent = `1:${(1 - rawValue).toFixed(1)} (portrait)`;
          }
        }
      });

      aspectSlider.addEventListener("change", e => {
        const value = e.target.value;
        console.log(`[WOMBAT] Aspect ratio slider changed: d_154 = ${value}`);

        // MODE-AWARE: Use ModeManager.setValue for dual-state publishing
        ModeManager.setValue("d_154", value, "user-modified");

        // Recalculate geometry with new aspect ratio (runs dual-engine + updates viz)
        calculateAll();
      });

      aspectSlider.hasSliderListener = true;
    }

    // Listen to geometry changes from other sections (external dependencies)
    // Per 4012-CHEATSHEET Anti-Pattern 7: Only listen to EXTERNAL dependencies
    if (window.TEUI?.StateManager) {
      const geometryFields = ["d_85", "d_86", "d_106"];
      geometryFields.forEach(fieldId => {
        window.TEUI.StateManager.addListener(fieldId, () => {
          if (isActivated) {
            console.log(
              `[WOMBAT] Geometry field ${fieldId} changed, recalculating`
            );
            calculateAll(); // Will update visualization with correct mode
          }
        });

        // Also listen to Reference versions for mode-aware visualization
        const refFieldId = `ref_${fieldId}`;
        window.TEUI.StateManager.addListener(refFieldId, () => {
          if (isActivated) {
            console.log(
              `[WOMBAT] Reference field ${refFieldId} changed, recalculating`
            );
            calculateAll(); // Will update visualization with correct mode
          }
        });
      });

      // ⚠️ MIRROR FIELD SYNC: Section 12 → WOMBAT (d_105→d_151, d_103→d_150)
      // When S12 volume/stories change, sync to WOMBAT mirror fields AND recalculate
      // NOTE: NO DOM updates here - FieldManager handles routing to correct state
      window.TEUI.StateManager.addListener("d_105", newValue => {
        const currentValue = TargetState.getValue("d_151");
        console.log(
          `[WOMBAT SYNC] d_105 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update TargetState only - NO re-publication to break circular loop
          TargetState.setValue("d_151", newValue);
          console.log(
            `[WOMBAT] ✅ Synced d_151 = ${newValue} from S12 (d_105)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      window.TEUI.StateManager.addListener("ref_d_105", newValue => {
        const currentValue = ReferenceState.getValue("d_151");
        console.log(
          `[WOMBAT SYNC] ref_d_105 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update ReferenceState
          ReferenceState.setValue("d_151", newValue);
          console.log(
            `[WOMBAT] ✅ Synced ref_d_151 = ${newValue} from S12 (ref_d_105)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      window.TEUI.StateManager.addListener("d_103", newValue => {
        const currentValue = TargetState.getValue("d_150");
        console.log(
          `[WOMBAT SYNC] d_103 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update TargetState only - NO re-publication to break circular loop
          TargetState.setValue("d_150", newValue);
          console.log(
            `[WOMBAT] ✅ Synced d_150 = ${newValue} from S12 (d_103)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      window.TEUI.StateManager.addListener("ref_d_103", newValue => {
        const currentValue = ReferenceState.getValue("d_150");
        console.log(
          `[WOMBAT SYNC] ref_d_103 changed: ${currentValue} → ${newValue}`
        );
        if (currentValue !== newValue) {
          // Update ReferenceState
          ReferenceState.setValue("d_150", newValue);
          console.log(
            `[WOMBAT] ✅ Synced ref_d_150 = ${newValue} from S12 (ref_d_103)`
          );
          // Recalculate (will run both engines and update visualization)
          calculateAll();
        }
      });

      // ✅ NEW (2025-12-18): Listen for g_106 (Typical F2F Height) from S12 - TARGET mode
      // Ensures both engines recalculate when Target value changes (dual-engine architecture)
      window.TEUI.StateManager.addListener("g_106", newValue => {
        console.log(`[WOMBAT SYNC] g_106 changed to: ${newValue}`);
        console.log(
          `[WOMBAT SYNC] Triggering calculateAll() for Target geometry recalculation...`
        );
        // No state to sync (g_106 is read directly via getModeAwareValue in solveGeometry)
        // But we need to recalculate both engines when this value changes
        calculateAll();
      });

      // ✅ NEW (2025-12-18): Listen for ref_g_106 (Typical F2F Height) from S12 - REFERENCE mode
      // Ensures both engines recalculate when Reference value changes (dual-engine architecture)
      window.TEUI.StateManager.addListener("ref_g_106", newValue => {
        console.log(`[WOMBAT SYNC] ref_g_106 changed to: ${newValue}`);
        console.log(
          `[WOMBAT SYNC] Triggering calculateAll() for Reference geometry recalculation...`
        );
        // No state to sync (g_106 is read directly via getModeAwareValue in solveGeometry)
        // But we need to recalculate both engines when this value changes
        calculateAll();
      });

      // ✅ CRITICAL: Check if ref_g_106 was already published before listener was added
      // Section12 publishes during initialization, but Section19 listeners are added later
      // This ensures we don't miss the initial value (same pattern as d_105/d_103)
      const existingRefG106 = window.TEUI.StateManager.getValue("ref_g_106");
      if (existingRefG106 !== null && existingRefG106 !== undefined) {
        console.log(
          `[WOMBAT SYNC] Found existing ref_g_106 = ${existingRefG106} in StateManager`
        );
        console.log(
          `[WOMBAT SYNC] Triggering initial calculateAll() for Reference pre-calculation`
        );
        calculateAll();
      }

      // ✅ ROBOT FINGERS 🤖👆: Ae and Ag display fields from S12
      // S12 publishes d_101/g_101/d_102/g_102 to StateManager
      // S19 listens and updates its own DOM elements (scoped to #wombat container)

      const wombatContainer = document.getElementById("wombat");

      // Area Exposed to Air (Ae) - Target mode
      window.TEUI.StateManager.addListener("d_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_152"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("g_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_152"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });

      // Area Exposed to Air (Ae) - Reference mode
      window.TEUI.StateManager.addListener("ref_d_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_152"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("ref_g_101", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_152"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });

      // Area Exposed to Ground (Ag) - Target mode
      window.TEUI.StateManager.addListener("d_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_153"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("g_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_153"]'
        );
        if (element && newValue !== null && newValue !== undefined) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });

      // Area Exposed to Ground (Ag) - Reference mode
      window.TEUI.StateManager.addListener("ref_d_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="d_153"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-2dp-comma"
          );
        }
      });

      window.TEUI.StateManager.addListener("ref_g_102", newValue => {
        if (!wombatContainer) return;
        const element = wombatContainer.querySelector(
          '[data-field-id="g_153"]'
        );
        if (
          element &&
          newValue !== null &&
          newValue !== undefined &&
          window.TEUI.ReferenceToggle?.isReferenceMode()
        ) {
          element.textContent = window.TEUI.formatNumber(
            window.TEUI.parseNumeric(newValue),
            "number-3dp"
          );
        }
      });
    }
  }

  //==========================================================================
  // LIFECYCLE
  //==========================================================================

  function onSectionRendered() {
    console.log("[WOMBAT] Section 19 rendered");

    // Initialize mirror fields from S12 on first load
    initializeMirrorFields();

    // ✅ CRITICAL: Initialize event handlers (listeners for S12 dependencies)
    // This registers listeners for d_105/ref_d_105, d_103/ref_d_103, g_106/ref_g_106
    initializeEventHandlers();

    // Initialize SVG
    setTimeout(() => {
      initializeSVG();
      createActivationControls();
    }, 100);
  }

  function initializeMirrorFields() {
    // ⚠️ CRITICAL: Initialize WOMBAT mirror fields from S12 on section load
    // This ensures d_151/d_150 are synced with d_105/d_103 from the start
    if (window.TEUI?.StateManager) {
      const d_105 = window.TEUI.StateManager.getValue("d_105");
      const d_103 = window.TEUI.StateManager.getValue("d_103");
      const ref_d_105 = window.TEUI.StateManager.getValue("ref_d_105");
      const ref_d_103 = window.TEUI.StateManager.getValue("ref_d_103");

      if (d_105) {
        window.TEUI.StateManager.setValue("d_151", d_105, "initial");
        console.log(`[WOMBAT] Initialized d_151 = ${d_105} from S12 (d_105)`);
      }

      if (d_103) {
        window.TEUI.StateManager.setValue("d_150", d_103, "initial");
        console.log(`[WOMBAT] Initialized d_150 = ${d_103} from S12 (d_103)`);
      }

      if (ref_d_105) {
        window.TEUI.StateManager.setValue("ref_d_151", ref_d_105, "initial");
        console.log(
          `[WOMBAT] Initialized ref_d_151 = ${ref_d_105} from S12 (ref_d_105)`
        );
      }

      if (ref_d_103) {
        window.TEUI.StateManager.setValue("ref_d_150", ref_d_103, "initial");
        console.log(
          `[WOMBAT] Initialized ref_d_150 = ${ref_d_103} from S12 (ref_d_103)`
        );
      }

      // ✅ NO INITIALIZATION for Ae/Ag display fields
      // Field definitions have defaults - FieldManager renders initial values
      // Robot fingers listeners handle live updates when S12 recalculates
    }
  }

  /**
   * DUAL-ENGINE CALCULATIONS
   * Per Pattern A architecture: ALWAYS run both Target and Reference calculations
   */

  function calculateTargetModel() {
    const geometry = solveGeometry(false); // isReferenceCalculation = false

    // Update TargetState (for refreshUI to read)
    TargetState.setValue("h_157", geometry.footprint.length.toFixed(2));
    TargetState.setValue("h_155", geometry.footprint.width.toFixed(2));
    TargetState.setValue("h_156", geometry.storyHeight.toFixed(2));

    // Publish calculated dimensions to StateManager (unprefixed for Target)
    window.TEUI.StateManager.setValue(
      "h_157",
      geometry.footprint.length.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "h_155",
      geometry.footprint.width.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "h_156",
      geometry.storyHeight.toFixed(2),
      "calculated"
    );

    return geometry;
  }

  function calculateReferenceModel() {
    const geometry = solveGeometry(true); // isReferenceCalculation = true

    // Update ReferenceState (for refreshUI to read)
    ReferenceState.setValue("h_157", geometry.footprint.length.toFixed(2));
    ReferenceState.setValue("h_155", geometry.footprint.width.toFixed(2));
    ReferenceState.setValue("h_156", geometry.storyHeight.toFixed(2));

    // Publish calculated dimensions to StateManager (ref_ prefixed for Reference)
    window.TEUI.StateManager.setValue(
      "ref_h_157",
      geometry.footprint.length.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "ref_h_155",
      geometry.footprint.width.toFixed(2),
      "calculated"
    );
    window.TEUI.StateManager.setValue(
      "ref_h_156",
      geometry.storyHeight.toFixed(2),
      "calculated"
    );

    return geometry;
  }

  function calculateAll() {
    console.log(
      `[WOMBAT calculateAll] Called - Current mode: ${ModeManager.currentMode}, isActivated: ${isActivated}`
    );

    // DUAL-ENGINE: ALWAYS run both Target and Reference calculations
    const targetGeometry = calculateTargetModel();
    const referenceGeometry = calculateReferenceModel();

    // Update visualization ONLY if activated
    if (isActivated) {
      // Show visualization for current mode
      const mode = ModeManager?.currentMode || "target";
      console.log(
        `[WOMBAT calculateAll] Updating visualization for mode: ${mode}`
      );
      updateVisualization(mode);
    }

    // Update calculated display values in DOM for current mode
    console.log(
      `[WOMBAT calculateAll] Calling updateCalculatedDisplayValues()`
    );
    ModeManager.updateCalculatedDisplayValues();
    console.log(`[WOMBAT calculateAll] Complete`);
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
    calculateAll,

    // WOMBAT-specific exports
    solveGeometry,
    isActivated: () => isActivated,
    getCurrentModel: () => currentModel,
    showFeedback, // Feedback console (S18 pattern)

    // Dual-state architecture exports (required by FieldManager and ReferenceToggle)
    ModeManager,
    TargetState,
    ReferenceState,
  };
})();

// Global namespace exposure
document.addEventListener("DOMContentLoaded", function () {
  const module = window.TEUI.SectionModules.sect19;
  if (module) {
    window.TEUI.sect19 = {
      calculateAll: module.calculateAll,
      solveGeometry: module.solveGeometry,
      ModeManager: module.ModeManager,
      modeManager: module.ModeManager, // Alias for ReferenceToggle (lowercase)
      TargetState: module.TargetState,
      ReferenceState: module.ReferenceState,
    };
  }
});
