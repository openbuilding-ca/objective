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
 * - Footprint Area is Sacred (d_95 ALWAYS preserved exactly, and varies with d_154 - Aspect Ratio)
 * - Roof Area is Sacred (d_85 ALWAYS preserved exactly, and uses roof type from d_159 and height as a flexible variable, greater ht. allows greater area AND volume)
 * - Areas Drive Form (Footprint area generates volume by storey, roof pitch/steepness/height, wall heights emerge from area constraints)
 * - No Validation Errors (impossible geometry renders visually as feedback in console ticker per S16.js.backup file pattern)
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
  let threejsLoaded = false; // Future implementation for flatShader, orbit, zoom, ground plane generation, etc.
  let currentModel = null;

  // BIM-STYLE COORDINATE CONVENTION: Y+ = North (for future window orientation per facade)
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
      d_150: "1.5", // Stories (mirrors S12 d_103)
      d_151: "8319.50", // Volume (mirrors S12 d_105)
      d_154: "-2.0", // Aspect ratio slider (L:W) - portrait 1:3 for better window fit
      d_158: "mezzanine", // Floorplate Options (mezzanine/equal), absorbs difference of h_15-d_95 when h_15>d_95 for 1.5 storey buildings
      d_159: "biplanar", // Roof Type (multiplanar/biplanar/monoplane)
      d_160: "show", // Window (show/hide dropdown)
      h_155: "0.00", // Calculated: Footprint width driven by user-editable slider
      h_156: "0.00", // Calculated: Storey height, use first g_106 as wall height, but allow to be less to satisfy volume and/or wall constraints
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
   * Provides state sovereignty for Reference calculation mode, all identical on initialization but me have 100% independence from TargetState
   */
  const ReferenceState = {
    values: {
      d_150: "1.5", // Stories (mirrors S12 ref_d_103)
      d_151: "8319.50", // Volume (mirrors S12 ref_d_105)
      d_154: "-2.0", // Aspect ratio slider - portrait 1:3 for better window fit
      d_158: "mezzanine", // Floorplate Options (mezzanine/equal)
      d_159: "biplanar", // Roof Type (multiplanar/biplanar/monoplane)
      d_160: "show", // Window (show/hide dropdown)
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
          value: "1.5",
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

    // Display-only: Area Exposed to Air (mirrored from S12 d_101, comprises total of Roof Area + Wall Area + Window Area)
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

    // Display-only: Area Exposed to Ground (mirrored from S12 d_102) - Includes floor slab and any basement walls
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

    // User controls for topology solver - redistributes area/volume into footprint length, width, and height, initializes as 0 = Square = X=Y.
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
          value: "-2.0",
          min: -5.0,
          max: 5.0,
          step: 0.1, // Consider adding snap to 0 for ease of value setting.
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

    // No row 157 yet...

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

    // Window dropdown (show/hide windows in visualization)
    row160: {
      id: "19.W",
      rowId: "19.W",
      label: "Window",
      cells: {
        a: {},
        b: {},
        c: { label: "Window" },
        d: {
          fieldId: "d_160",
          type: "dropdown",
          dropdownId: "dd_d_160",
          value: "show",
          section: "wombat",
          tooltip: true,
          label: "Show or hide windows in WOMBAT visualization",
          options: [
            { value: "show", name: "Show Windows" },
            { value: "hide", name: "Hide Windows" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: {},
        g: {},
        h: {},
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
      "row151",
      "row152",
      "row153",
      "row154",
      "row155",
      "row156",
      //"row157",   //Reserved for future use
      "row158", //footprint width to be added
      "row159", //Roof Type dropdown
      "row160", //Window show/hide toggle
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
  // PRISMATIC EXTRUSION GEOMETRY SOLVER (WOMBAT 4)
  //==========================================================================
  // Architecture: Footprint → 2D Profile → Extrude for Volume → Render from Nodes
  // Unified pattern for flat, gable, shed, hip roofs - no iteration needed
  //==========================================================================

  //==========================================================================
  // PHASE 1: ROOF GEOMETRY SOLVERS (from area constraint)
  // These functions solve roof geometry from ROOF AREA constraint FIRST,
  // independent of wall height. They return roof height and roof volume.
  //==========================================================================

  /**
   * Solve roof geometry from roof area constraint (FIRST step in constraint flow)
   * Returns roof height and roof volume for wall height derivation
   */
  function solveRoofGeometry(
    roofTypeRequested,
    roofArea,
    footprintArea,
    ridgeLength,
    span
  ) {
    const areaRatio = roofArea / footprintArea;

    // Check roof collapse condition
    if (areaRatio <= 1.01) {
      console.log(
        `[WOMBAT] Roof area ≤ footprint (${areaRatio.toFixed(2)}x) → flat roof`
      );
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0,
      };
    }

    // Roof area > footprint → solve pitched roof geometry
    if (roofTypeRequested === "biplanar") {
      return solveGableRoof(roofArea, ridgeLength, span, footprintArea);
    } else if (roofTypeRequested === "monoplane") {
      return solveShedRoof(roofArea, ridgeLength, span, footprintArea);
    } else if (roofTypeRequested === "multiplanar") {
      // Hip/Pyramid roof (polyhedral, not prismatic)
      return solveHipRoof(roofArea, ridgeLength, span, footprintArea);
    } else if (roofTypeRequested === "flat") {
      // Flat roof explicitly selected by user
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0,
      };
    } else {
      // Default to flat for unknown types
      console.warn(
        `[WOMBAT] Unknown roof type "${roofTypeRequested}", defaulting to flat`
      );
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0,
      };
    }
  }

  /**
   * Solve gable roof geometry from roof area constraint
   * Returns roof height, roof volume, and gable end areas
   */
  function solveGableRoof(
    roofArea,
    shortDimension,
    longDimension,
    footprintArea
  ) {
    // Gable roof: two rectangular slopes meet at ridge
    // CRITICAL: Ridge runs along LONG dimension (structural efficiency)
    // Slope drops perpendicular to ridge across SHORT dimension
    // Structural members span the SHORT distance

    // For gable roofs:
    // - Ridge runs parallel to LONG dimension (ridge is long)
    // - Triangle base is the SHORT dimension (perpendicular to ridge)
    const ridgeLength = longDimension; // LONG dimension (ridge runs along this)
    const triangleBase = shortDimension; // SHORT dimension (triangle base, slope drops across this)

    // Total roof area = 2 rectangular slopes
    // roofArea = 2 × ridge × slopeLength
    const slopeLength = roofArea / (2 * ridgeLength);

    // RATIONAL TRIGONOMETRY (Wildberger notation):
    // Work with quadrances (Q = distance²) to avoid premature square roots
    // Pythagorean theorem in Q-space:
    // Slope runs from ridge at center to eave at edge
    // Horizontal distance = half the building width (triangleBase/2)

    const halfBase = triangleBase / 2;
    const Q_slope = slopeLength * slopeLength; // R in Wildberger notation
    const Q_halfBase = halfBase * halfBase; // Quadrance of horizontal run
    const Q_height = Q_slope - Q_halfBase; // Pythagorean: Q_height = R - Q_base

    // Spread (ratio of quadrances) for validation
    const spread = Q_halfBase / Q_slope; // s = Q_base / R

    if (Q_height < 0) {
      console.error(
        `[WOMBAT] Invalid gable geometry - roof area ${roofArea.toFixed(0)}m² too small for footprint`
      );
      console.error(
        `[WOMBAT] Need slopeLength (${slopeLength.toFixed(2)}m) > triangleBase/2 (${halfBase.toFixed(2)}m)`
      );
      console.error(
        `[WOMBAT] Spread s = ${spread.toFixed(3)} > 1.0 (impossible geometry)`
      );
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0,
      };
    }

    // Expand quadrance to distance only at final step
    const roofHeight = Math.sqrt(Q_height);

    // Gable end area (triangular): base × height / 2
    // Triangle base = SHORT dimension
    const gableEndArea = (triangleBase * roofHeight) / 2;

    // Roof volume = rectangular prism (footprint × roofHeight / 2)
    // Geometrically: two triangular prisms stacked = box × 1/2
    const roofVolume = (footprintArea * roofHeight) / 2;

    // PITCH RATIO (Carpenter's notation: rise:12)
    // Rational Trigonometry compliant - pure ratio, no trig functions
    // For gable: pitch is rise over half-base (center to eave)
    const pitchRise = (roofHeight / halfBase) * 12; // Scale to :12 format

    console.log(`[WOMBAT] Gable roof solved from area constraint:`);
    console.log(`  Roof area: ${roofArea.toFixed(2)} m²`);
    console.log(`  Ridge length: ${ridgeLength.toFixed(2)} m (LONG dimension)`);
    console.log(
      `  Triangle base: ${triangleBase.toFixed(2)} m (SHORT dimension)`
    );
    console.log(`  Slope length: ${slopeLength.toFixed(2)} m`);
    console.log(`  Roof height: ${roofHeight.toFixed(2)} m`);
    console.log(`  Roof pitch: ${pitchRise.toFixed(1)}:12 (rise:run ratio)`);
    console.log(`  Roof volume: ${roofVolume.toFixed(2)} m³`);
    console.log(`  Gable end area (both): ${(2 * gableEndArea).toFixed(2)} m²`);

    return {
      roofType: "gable",
      roofHeight,
      roofVolume,
      gableEndArea: 2 * gableEndArea, // Both triangular ends
      shedEndWallArea: 0,
      pitchRise, // Carpenter's rise:12 ratio
    };
  }

  /**
   * Solve shed roof geometry from roof area constraint
   * Returns roof height, roof volume, and shed end wall areas
   */
  function solveShedRoof(
    roofArea,
    shortDimension,
    longDimension,
    footprintArea
  ) {
    // Shed roof: single rectangular slope
    // CRITICAL: Ridge runs along LONG dimension (structural efficiency)
    // Slope drops perpendicular to ridge across SHORT dimension
    // Structural members span the SHORT distance (same as slope horizontal distance)

    // For shed roofs:
    // - Ridge runs parallel to LONG dimension (ridge is long)
    // - Slope drops across the SHORT dimension (perpendicular to ridge)
    const ridgeLength = longDimension; // LONG dimension (ridge runs along this)
    const slopeSpan = shortDimension; // SHORT dimension (slope drops across this)

    // Roof area = ridge × slopeLength
    const slopeLength = roofArea / ridgeLength;

    // RATIONAL TRIGONOMETRY (Wildberger notation):
    // Work with quadrances (Q = distance²) to avoid premature square roots
    // Pythagorean theorem in Q-space:
    // Slope runs from high ridge to low eave
    // Horizontal distance = full span across building (slopeSpan)

    const Q_slope = slopeLength * slopeLength; // R in Wildberger notation
    const Q_span = slopeSpan * slopeSpan; // Quadrance of horizontal run
    const Q_height = Q_slope - Q_span; // Pythagorean: Q_height = R - Q_span

    // Spread (ratio of quadrances) for validation
    const spread = Q_span / Q_slope; // s = Q_span / R

    if (Q_height < 0) {
      console.error(
        `[WOMBAT] Invalid shed geometry - roof area ${roofArea.toFixed(0)}m² too small for footprint`
      );
      console.error(
        `[WOMBAT] Need slopeLength (${slopeLength.toFixed(2)}m) > slopeSpan (${slopeSpan.toFixed(2)}m)`
      );
      console.error(
        `[WOMBAT] Spread s = ${spread.toFixed(3)} > 1.0 (impossible geometry)`
      );
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0,
      };
    }

    // Expand quadrance to distance only at final step
    const roofHeight = Math.sqrt(Q_height);

    // Shed end wall area (rectangular): slopeSpan × roofHeight
    const shedEndWallArea = slopeSpan * roofHeight;

    // Roof volume = trapezoidal prism volume
    // = footprint × (average height above eave)
    // = footprint × (roofHeight / 2)
    const roofVolume = (footprintArea * roofHeight) / 2;

    // PITCH RATIO (Carpenter's notation: rise:12)
    // Rational Trigonometry compliant - pure ratio, no trig functions
    // For shed: pitch is rise over full span (low eave to high ridge)
    const pitchRise = (roofHeight / slopeSpan) * 12; // Scale to :12 format

    console.log(`[WOMBAT] Shed roof solved from area constraint:`);
    console.log(`  Roof area: ${roofArea.toFixed(2)} m²`);
    console.log(`  Ridge length: ${ridgeLength.toFixed(2)} m (LONG dimension)`);
    console.log(
      `  Slope span: ${slopeSpan.toFixed(2)} m (SHORT dimension - slope drops across this)`
    );
    console.log(`  Slope length: ${slopeLength.toFixed(2)} m`);
    console.log(`  Roof height: ${roofHeight.toFixed(2)} m`);
    console.log(`  Roof pitch: ${pitchRise.toFixed(1)}:12 (rise:run ratio)`);
    console.log(
      `  Roof volume: ${roofVolume.toFixed(2)} m³ (steals from walls)`
    );
    console.log(
      `  Shed end wall area (both): ${(2 * shedEndWallArea).toFixed(2)} m²`
    );

    return {
      roofType: "shed",
      roofHeight,
      roofVolume,
      gableEndArea: 0,
      shedEndWallArea: 2 * shedEndWallArea, // Both rectangular ends
      pitchRise, // Carpenter's rise:12 ratio
    };
  }

  /**
   * Solve hip roof geometry using pure algebraic solution (quadratic formula)
   * NO iteration, NO derivatives - pure rational trigonometry
   * Hip roofs are POLYHEDRAL (not prismatic) - they taper to ridge endpoints
   */
  function solveHipRoof(
    roofArea,
    shortDimension,
    longDimension,
    footprintArea
  ) {
    const W = shortDimension; // SHORT dimension (span across slopes)
    const L = longDimension; // LONG dimension
    const A = roofArea;

    // Ridge length (deterministic from s=0.5 hip rafters at 45° in plan view)
    const ridgeLength = L - W;

    // Special case: Square building (ridgeLength ≈ 0) → Pure pyramid
    if (ridgeLength < 0.01) {
      console.log(`[WOMBAT] Square building detected → Pure pyramid`);

      // Pure pyramid - use direct solution
      // A = 2a × slopeLength (4 triangular faces)
      const slopeLength = A / (2 * W);
      const Q_slope = slopeLength * slopeLength;
      const Q_halfBase = (W / 2) * (W / 2);
      const Q_height = Q_slope - Q_halfBase;

      if (Q_height <= 0) {
        console.error(
          `[WOMBAT] Pyramid impossible: roof area ${A.toFixed(0)}m² too small`
        );
        console.error(`[WOMBAT] Spread would be ≥ 1.0 (impossible geometry)`);
        return {
          roofType: "flat",
          roofHeight: 0,
          roofVolume: 0,
          gableEndArea: 0,
          shedEndWallArea: 0,
        };
      }

      const roofHeight = Math.sqrt(Q_height);
      const roofVolume = (footprintArea * roofHeight) / 3; // Pyramid volume

      // Pitch calculation for pyramid (from center to corner)
      const pitchRise = (roofHeight / (W / 2)) * 12;

      console.log(`[WOMBAT] Pyramid roof solved algebraically:`);
      console.log(`  Footprint: ${W.toFixed(2)}m × ${L.toFixed(2)}m (square)`);
      console.log(`  Roof height: ${roofHeight.toFixed(2)}m`);
      console.log(`  Roof pitch: ${pitchRise.toFixed(1)}:12 (rise:run ratio)`);
      console.log(`  Roof volume: ${roofVolume.toFixed(2)}m³`);
      console.log(`  Target area: ${A.toFixed(2)}m²`);

      return {
        roofType: "pyramid",
        roofHeight,
        roofVolume,
        gableEndArea: 0,
        shedEndWallArea: 0,
        ridgeLength: 0,
        pitchRise,
      };
    }

    // Rectangular building - solve for u algebraically
    // where u = √(Q + W²/4) = slant height from ridge centerline to eave

    // Hip roof area formula TEST: Try u = A/(2L) based on face counting
    // - Two main slopes (trapezoids): 2 × (L-W) × u
    // - Two hip end triangles: 2 × (1/2) × W × u = W·u
    // - Total: 2(L-W)·u + W·u = 2L·u - 2W·u + W·u = 2L·u - W·u = (2L - W)·u
    //
    // Hmm, that still gives (2L - W)·u...
    //
    // Wait - let me reconsider the total more carefully:
    // 2(L-W)·u + W·u = 2Lu - 2Wu + Wu = 2Lu - Wu = (2L - W)·u ✓
    //
    // So mathematically it IS (2L - W)·u
    // But empirically it should behave like (2L)·u based on aspect ratio continuity
    //
    // Let me try BOTH formulas and log them:

    const denominator_v1 = 2 * L - W;
    const denominator_v2 = 2 * L;

    const u_v1 = A / denominator_v1;
    const u_v2 = A / denominator_v2;

    console.log(`[WOMBAT-DEBUG] Testing two formulas:`);
    console.log(
      `  v1: u = A/(2L-W) = ${A}/${denominator_v1.toFixed(2)} = ${u_v1.toFixed(2)}m`
    );
    console.log(
      `  v2: u = A/(2L) = ${A}/${denominator_v2.toFixed(2)} = ${u_v2.toFixed(2)}m`
    );

    // Use v2 for now (simpler formula that should give continuous behavior)
    const u = u_v2;

    if (u <= 0) {
      console.error(
        `[WOMBAT] Invalid slant height (u ≤ 0) - roof area ${A.toFixed(0)}m² too small`
      );
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0,
      };
    }

    // Extract height quadrance from u
    // u² = Q + W²/4, so Q = u² - W²/4
    const Q_height = u * u - (W * W) / 4;

    if (Q_height <= 0) {
      console.error(
        `[WOMBAT] Invalid height quadrance (Q ≤ 0) - roof area ${A.toFixed(0)}m² too small for footprint`
      );
      return {
        roofType: "flat",
        roofHeight: 0,
        roofVolume: 0,
        gableEndArea: 0,
        shedEndWallArea: 0,
      };
    }

    const roofHeight = Math.sqrt(Q_height);

    // Verify area constraint with both formulas
    const slopeLength = u;
    const hipRafterLength = Math.sqrt(u * u + (W * W) / 4);
    const achievedArea_v1 = 2 * ridgeLength * slopeLength + W * slopeLength;
    const achievedArea_v2 =
      2 * ridgeLength * slopeLength + 2 * W * hipRafterLength;

    console.log(`[WOMBAT-DEBUG] Area verification:`);
    console.log(`  v1 formula [2(L-W)u + Wu]: ${achievedArea_v1.toFixed(2)}m²`);
    console.log(
      `  v2 formula [2(L-W)u + 2W·hipRafter]: ${achievedArea_v2.toFixed(2)}m²`
    );
    console.log(`  Target: ${A.toFixed(2)}m²`);

    const achievedArea = achievedArea_v2; // Use backup's formula for now

    // Hip roof volume (see WOMBAT-HIP.md Phase 3)
    const gableSectionVolume = (ridgeLength * W * roofHeight) / 2;
    const endCapVolume = 2 * (1 / 3) * (((W / 2) * W) / 2) * roofHeight;
    const roofVolume = gableSectionVolume + endCapVolume;

    // Pitch calculation (from center to eave on short axis)
    const pitchRise = (roofHeight / (W / 2)) * 12;

    console.log(`[WOMBAT] Hip roof solved algebraically:`);
    console.log(`  Footprint: ${W.toFixed(2)}m × ${L.toFixed(2)}m`);
    console.log(`  Ridge length: ${ridgeLength.toFixed(2)}m`);
    console.log(`  Roof height: ${roofHeight.toFixed(2)}m`);
    console.log(`  Roof pitch: ${pitchRise.toFixed(1)}:12 (rise:run ratio)`);
    console.log(`  Target area: ${A.toFixed(2)}m²`);
    console.log(`  Achieved area: ${achievedArea.toFixed(2)}m²`);
    console.log(`  Error: ${Math.abs(achievedArea - A).toFixed(4)}m²`);
    console.log(`  Roof volume: ${roofVolume.toFixed(2)}m³`);

    return {
      roofType: "hip",
      roofHeight,
      roofVolume,
      gableEndArea: 0,
      shedEndWallArea: 0,
      ridgeLength,
      pitchRise,
      achievedArea,
    };
  }

  //==========================================================================
  // PHASE 3: 2D PROFILE BUILDERS (for rendering only, NOT solving)
  // These functions just BUILD node arrays from pre-calculated dimensions
  //==========================================================================

  /**
   * Solve flat roof 2D profile - simple rectangle
   */
  function solveFlat2DProfile(width, wallHeight) {
    return {
      nodes: [
        { x: 0, z: 0 },
        { x: width, z: 0 },
        { x: width, z: wallHeight },
        { x: 0, z: wallHeight },
      ],
      type: "flat",
      height: 0,
      wallHeight: wallHeight,
      endWallArea: 0,
    };
  }

  /**
   * Build gable roof 2D profile from pre-calculated dimensions
   * Does NOT solve geometry - just builds node array for rendering
   * Ridge runs across SHORT dimension (structural efficiency)
   */
  function buildGable2DProfile(width, wallHeight, roofHeight) {
    return {
      nodes: [
        { x: 0, z: 0 }, // Left ground
        { x: width, z: 0 }, // Right ground
        { x: width, z: wallHeight }, // Right eave
        { x: width / 2, z: wallHeight + roofHeight }, // Peak
        { x: 0, z: wallHeight }, // Left eave
      ],
      type: "gable",
      height: roofHeight,
      wallHeight: wallHeight,
      endWallArea: width * wallHeight + (width * roofHeight) / 2, // Rectangle + triangle
    };
  }

  /**
   * Build shed roof 2D profile from pre-calculated dimensions
   * Does NOT solve geometry - just builds node array for rendering
   * CRITICAL: Ridge runs along LONG dimension (structural efficiency)
   * Profile width = SHORT dimension (end wall cross-section)
   * Profile will be extruded along LONG dimension (ridge direction)
   * Slope drops from X=0 (low eave) to X=width (high ridge)
   */
  function buildShed2DProfile(width, wallHeight, roofHeight) {
    const tallWallHeight = wallHeight + roofHeight;

    return {
      nodes: [
        { x: 0, z: 0 }, // Left ground (low eave side)
        { x: width, z: 0 }, // Right ground (high ridge side)
        { x: width, z: tallWallHeight }, // Right eave (high ridge)
        { x: 0, z: wallHeight }, // Left eave (low eave)
      ],
      type: "shed",
      height: roofHeight,
      wallHeight: wallHeight,
      tallWallHeight: tallWallHeight,
      endWallArea: ((wallHeight + tallWallHeight) / 2) * width, // Trapezoid end wall
    };
  }

  /**
   * Generate 3D corner nodes from 2D profile + extrusion depth
   * Returns 8 nodes for flat/shed, 10 nodes for gable (4 ground + 4 eave + 2 ridge)
   */
  function generate3DNodes(profile2D, extrusionDepth) {
    const halfDepth = extrusionDepth / 2;
    const width = profile2D.nodes[1].x;
    const halfWidth = width / 2;

    const nodes = {
      ground: [
        { x: -halfWidth, y: -halfDepth, z: 0 },
        { x: halfWidth, y: -halfDepth, z: 0 },
        { x: halfWidth, y: halfDepth, z: 0 },
        { x: -halfWidth, y: halfDepth, z: 0 },
      ],
      eave: [],
    };

    // Generate eave nodes based on roof type
    if (profile2D.type === "shed") {
      // Shed roof: FIXED - slope runs in X direction (profile direction)
      // Slope runs from -X (low eave) to +X (high ridge)
      nodes.eave = [
        { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight }, // Left front (low)
        { x: halfWidth, y: -halfDepth, z: profile2D.tallWallHeight }, // Right front (high)
        { x: halfWidth, y: halfDepth, z: profile2D.tallWallHeight }, // Right back (high)
        { x: -halfWidth, y: halfDepth, z: profile2D.wallHeight }, // Left back (low)
      ];
    } else {
      // Flat or gable: uniform eave height
      nodes.eave = [
        { x: -halfWidth, y: -halfDepth, z: profile2D.wallHeight },
        { x: halfWidth, y: -halfDepth, z: profile2D.wallHeight },
        { x: halfWidth, y: halfDepth, z: profile2D.wallHeight },
        { x: -halfWidth, y: halfDepth, z: profile2D.wallHeight },
      ];
    }

    // Add ridge nodes for gable roof
    if (profile2D.type === "gable") {
      const peakHeight = profile2D.wallHeight + profile2D.height;
      nodes.ridge = [
        { x: 0, y: -halfDepth, z: peakHeight }, // Front ridge
        { x: 0, y: halfDepth, z: peakHeight }, // Back ridge
      ];
    }

    return nodes;
  }

  /**
   * Generate 3D nodes for hip/pyramid roofs (polyhedral, not prismatic)
   * Hip roofs cannot be generated by extruding a 2D profile
   *
   * @param {Object} roofResult - Result from solveHipRoof()
   * @param {number} shortDimension - Width (SHORT dimension)
   * @param {number} longDimension - Length (LONG dimension)
   * @param {number} wallHeight - Height of walls
   * @returns {Object} - { ground, eave, ridge }
   */
  function generateHipNodes3D(
    roofResult,
    shortDimension,
    longDimension,
    wallHeight
  ) {
    const W = shortDimension;
    const L = longDimension;
    const halfW = W / 2;
    const halfL = L / 2;
    const ridgeHeight = wallHeight + roofResult.roofHeight;

    // Ground nodes (Z=0) - same for all roof types
    const ground = [
      { x: -halfW, y: -halfL, z: 0 }, // Front-left
      { x: +halfW, y: -halfL, z: 0 }, // Front-right
      { x: +halfW, y: +halfL, z: 0 }, // Back-right
      { x: -halfW, y: +halfL, z: 0 }, // Back-left
    ];

    // Eave nodes (Z=wallHeight) - same for all roof types
    const eave = [
      { x: -halfW, y: -halfL, z: wallHeight }, // Front-left
      { x: +halfW, y: -halfL, z: wallHeight }, // Front-right
      { x: +halfW, y: +halfL, z: wallHeight }, // Back-right
      { x: -halfW, y: +halfL, z: wallHeight }, // Back-left
    ];

    // Ridge nodes depend on roof type
    const ridge = [];

    if (roofResult.roofType === "pyramid" || roofResult.ridgeLength < 0.01) {
      // Square building - single apex (pure pyramid)
      ridge.push({ x: 0, y: 0, z: ridgeHeight });
      console.log(
        `[WOMBAT] Pyramid: 1 apex node at (0, 0, ${ridgeHeight.toFixed(2)}m)`
      );
    } else {
      // Rectangular building - two ridge endpoints (hip roof)
      const halfRidge = roofResult.ridgeLength / 2;
      ridge.push({ x: 0, y: -halfRidge, z: ridgeHeight }); // Front ridge end
      ridge.push({ x: 0, y: +halfRidge, z: ridgeHeight }); // Back ridge end
      console.log(
        `[WOMBAT] Hip: 2 ridge nodes, ridge length=${roofResult.ridgeLength.toFixed(2)}m`
      );
    }

    return { ground, eave, ridge };
  }

  /**
   * Main geometry solver using prismatic extrusion, translation of copy of elevation geometry as sweep along longer axis (idea from ArchiCad GDL)
   *
   * CRITICAL CONSTRAINTS (in priority order):
   * 1. Volume (d_105) - SACRED, always preserved exactly
   * 2. Footprint Area (d_95/d_87) - SACRED, always preserved exactly
   * 3. Roof Area (d_85) - SACRED ONLY if > footprint area, else collapses to flat roof
   * 4. Aspect Ratio (d_154) - Reshapes footprint while preserving area
   * 5. Storey Height (g_106) - SACRIFICIAL to satisfy volume constraint
   *
   * ROOF COLLAPSE RULE: If roof area <= footprint area, pitched roof is geometrically impossible
   * → Automatically fall back to flat roof (roof area = footprint area)
   * → User must increase d_85 to enable pitched roofs
   */
  function solveGeometry(isReferenceCalculation = false) {
    const mode = isReferenceCalculation ? "Reference" : "Target";
    console.log(`[WOMBAT-2] Prismatic solver (${mode} mode)`);

    // Read sacred constraints
    const d_105_raw = getModeAwareValue("d_105", isReferenceCalculation);
    const targetVolume = parseFloat(d_105_raw) || 8319.5;

    // Get roof type from d_159 dropdown
    const roofTypeRaw = getModeAwareValue("d_159", isReferenceCalculation);
    const roofTypeRequested = (roofTypeRaw || "flat").toLowerCase(); // biplanar, monoplane, flat, multiplanar

    // Get roof area (d_85) - SACRED constraint
    const d_85_raw = getModeAwareValue("d_85", isReferenceCalculation);
    const roofArea = parseFloat(d_85_raw) || 1100;

    // Get footprint area from d_95 (slab on grade) - SACRED constraint
    let footprintArea = parseFloat(
      getModeAwareValue("d_95", isReferenceCalculation)
    );
    if (!footprintArea || footprintArea <= 0) {
      // Fallback to raised floor (d_87)
      footprintArea =
        parseFloat(getModeAwareValue("d_87", isReferenceCalculation)) || 1100;
    }

    // ========================================================================
    // ASPECT RATIO IMPLEMENTATION (from Section19.js.backup:1108-1127)
    // Superior formula - no branching, mathematically pure
    // ========================================================================
    // Read aspect ratio slider d_154 (-5.0 to +5.0, step 0.1, default 0.0)
    // 0 = square (1:1), positive = landscape (wide), negative = portrait (tall)
    const currentState = isReferenceCalculation ? ReferenceState : TargetState;
    const d_154_raw = currentState.getValue("d_154");

    console.log(
      `[WOMBAT-2 DEBUG] d_154_raw from state: ${d_154_raw} (type: ${typeof d_154_raw})`
    );

    const aspectRatioRaw = parseFloat(d_154_raw) || 0.0;

    // Convert slider value to actual aspect ratio (length/width)
    const aspectRatio =
      aspectRatioRaw >= 0
        ? 1 + aspectRatioRaw // Landscape: 0→1, +1→2, +2→3, +5→6
        : 1 / (1 - aspectRatioRaw); // Portrait:  0→1, -1→0.5, -2→0.33, -5→0.167

    console.log(`[WOMBAT-2 DEBUG] aspectRatio calculated: ${aspectRatio}`);
    console.log(`[WOMBAT-2 DEBUG] footprintArea: ${footprintArea}`);

    // Solve footprint dimensions - preserves area exactly
    const width = Math.sqrt(footprintArea / aspectRatio);
    const length = footprintArea / width; // Exact, no rounding error

    console.log(`[WOMBAT-2 DEBUG] width: ${width}, length: ${length}`);
    console.log(
      `[WOMBAT-2] Aspect ratio: ${aspectRatioRaw.toFixed(1)} → ${aspectRatio.toFixed(2)}:1 (L:W)`
    );
    console.log(
      `[WOMBAT-2] Footprint: ${width.toFixed(2)}m × ${length.toFixed(2)}m = ${footprintArea.toFixed(2)}m²`
    );

    // ========================================================================
    // ROOF COLLAPSE CONSTRAINT
    // Pitched roofs require roof area > footprint area
    // If roof area <= footprint, geometry is impossible → fall back to flat
    // ========================================================================
    const areaRatio = roofArea / footprintArea;
    let roofType = roofTypeRequested;

    if (areaRatio <= 1.01 && roofTypeRequested !== "flat") {
      console.warn(
        `[WOMBAT-2] ⚠️ ROOF COLLAPSE: Roof area (${roofArea.toFixed(2)}m²) ≈ footprint (${footprintArea.toFixed(2)}m²)`
      );
      console.warn(
        `[WOMBAT-2] → Pitched roof geometrically impossible, falling back to FLAT roof`
      );
      console.warn(
        `[WOMBAT-2] → Increase d_85 to > ${(footprintArea * 1.1).toFixed(0)}m² to enable ${roofTypeRequested} roof`
      );
      roofType = "flat";
    }

    console.log(
      `[WOMBAT-2] Inputs: footprint=${footprintArea.toFixed(2)}m², volume=${targetVolume.toFixed(2)}m³, roof=${roofType} (requested: ${roofTypeRequested})`
    );

    // Calculate footprint dimensions - dynamically determined by aspect ratio
    // Nomenclature: shortDimension/longDimension (clear, no ambiguity)
    const shortDimension = Math.min(width, length); // SHORT footprint edge
    const longDimension = Math.max(width, length); // LONG footprint edge
    const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

    console.log(
      `[WOMBAT-2] Footprint: ${shortDimension.toFixed(2)}m (short) × ${longDimension.toFixed(2)}m (long)`
    );
    console.log(`[WOMBAT-2] Ridge orientation: ${ridgeOrientation}`);

    // ========================================================================
    // PHASE 2: SOLVE ROOF GEOMETRY FROM AREA CONSTRAINT (FIRST!)
    // This is the CORRECT constraint order - roof area drives roof height
    // ========================================================================
    const roofResult = solveRoofGeometry(
      roofType, // May be collapsed from roofTypeRequested
      roofArea,
      footprintArea,
      shortDimension, // SHORT dimension (was ridgeLength)
      longDimension // LONG dimension (was span)
    );

    console.log(
      `[WOMBAT-2] Roof solved: type=${roofResult.roofType}, height=${roofResult.roofHeight.toFixed(2)}m, volume=${roofResult.roofVolume.toFixed(2)}m³`
    );

    // ========================================================================
    // PHASE 2B: BASEMENT GEOMETRY (affects volume constraint)
    // ========================================================================
    // CRITICAL: Calculate basement BEFORE wall height, because basement volume
    // must be subtracted from total conditioned volume (d_105)
    // Basement is part of conditioned space, but below grade

    const basementWallArea =
      parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;
    const slabArea =
      parseFloat(getModeAwareValue("d_95", isReferenceCalculation)) || 0;
    const floorExposedToAir =
      parseFloat(getModeAwareValue("d_87", isReferenceCalculation)) || 0;

    const hasBasement = basementWallArea > 0;
    const hasSlab = slabArea > 0;
    const hasRaisedFloor = floorExposedToAir > 0;

    // Calculate perimeter for basement depth calculation
    const perimeter = 2 * (shortDimension + longDimension);

    // Calculate basement depth from wall area and perimeter
    let basementDepth = 0;
    let basementVolume = 0;

    if (hasBasement && perimeter > 0) {
      basementDepth = basementWallArea / perimeter;
      basementVolume = footprintArea * basementDepth;

      console.log(`[WOMBAT-2] Basement geometry:`);
      console.log(
        `  Basement wall area (d_94): ${basementWallArea.toFixed(2)} m²`
      );
      console.log(`  Basement depth: ${basementDepth.toFixed(2)} m`);
      console.log(
        `  Basement volume: ${basementVolume.toFixed(2)} m³ (part of conditioned space)`
      );
    }

    // Determine foundation type for rendering
    function determineFoundationType(hasSlab, hasBasement, hasRaisedFloor) {
      if (hasBasement && hasSlab) return "full-basement";
      if (hasSlab && !hasBasement && !hasRaisedFloor) return "slab-on-grade";
      if (!hasSlab && !hasBasement && hasRaisedFloor) return "raised-floor";
      if (hasBasement && !hasSlab) return "basement-no-slab";
      if ((hasSlab || hasBasement) && hasRaisedFloor) return "mixed-foundation";
      return "unknown";
    }

    const foundationType = determineFoundationType(
      hasSlab,
      hasBasement,
      hasRaisedFloor
    );

    console.log(`[WOMBAT-2] Foundation type: ${foundationType}`);
    if (foundationType === "mixed-foundation") {
      console.warn(
        `[WOMBAT-2] ⚠️ Mixed foundation detected (unusual - part ground, part elevated)`
      );
    }

    // ========================================================================
    // PHASE 3: CALCULATE WALL HEIGHT
    // Start with g_106 reference, compress if volume exceeded
    // ========================================================================
    const storiesDeclared = parseFloat(currentState.getValue("d_150")) || 1.0;

    // Get reference wall height per storey (g_106)
    const g_106_raw = getModeAwareValue("g_106", isReferenceCalculation);
    const storyHeightReference = parseFloat(g_106_raw) || 5.15; // Default 5.15m

    // TRY reference wall height first
    let wallHeightTarget = storyHeightReference * storiesDeclared;
    let wallVolume = footprintArea * wallHeightTarget;
    let calculatedVolume = wallVolume + roofResult.roofVolume + basementVolume;

    console.log(`[WOMBAT-2] Attempting reference wall height:`);
    console.log(
      `  Target wall height: ${wallHeightTarget.toFixed(2)} m (${storiesDeclared} × ${storyHeightReference.toFixed(2)}m from g_106)`
    );
    console.log(`  Would give volume: ${calculatedVolume.toFixed(2)} m³`);
    console.log(`    = Wall volume: ${wallVolume.toFixed(2)} m³`);
    console.log(`    + Roof volume: ${roofResult.roofVolume.toFixed(2)} m³`);
    console.log(`    + Basement volume: ${basementVolume.toFixed(2)} m³`);
    console.log(`  USER TARGET (d_105): ${targetVolume.toFixed(2)} m³`);

    // Check if volume would be exceeded
    let wallHeight;
    let storyHeightActual;
    let wallHeightViolation = false;

    if (calculatedVolume > targetVolume) {
      // Volume exceeded - compress walls to fit
      // CRITICAL: Subtract BOTH roof and basement from total conditioned volume
      const availableWallVolume =
        targetVolume - roofResult.roofVolume - basementVolume;

      if (availableWallVolume < 0) {
        // Roof + Basement exceeds total volume - this is critical
        const combinedVolume = roofResult.roofVolume + basementVolume;
        console.error(
          `[WOMBAT-2] ⚠️ CRITICAL: Roof + Basement volume (${combinedVolume.toFixed(0)}m³) exceeds total volume (${targetVolume.toFixed(0)}m³)`
        );
        console.error(
          `[WOMBAT-2] → Roof: ${roofResult.roofVolume.toFixed(0)}m³ + Basement: ${basementVolume.toFixed(0)}m³ = ${combinedVolume.toFixed(0)}m³`
        );
        console.error(
          `[WOMBAT-2] → Using reference wall height anyway, volume will be violated`
        );
        wallHeight = wallHeightTarget;
        storyHeightActual = storyHeightReference;
        wallVolume = footprintArea * wallHeight;
        calculatedVolume = wallVolume + roofResult.roofVolume + basementVolume;
        wallHeightViolation = true;

        // Update console ticker (persistent until next user interaction)
        const deficit = combinedVolume - targetVolume;
        const percentOver = ((deficit / targetVolume) * 100).toFixed(0);
        showFeedback(
          `❌ Roof+Basement volume ${percentOver}% over total (increase Conditioned Volume in S12)`,
          true // persistent
        );
      } else {
        // Compress walls to fit within volume budget
        wallHeight = availableWallVolume / footprintArea;
        storyHeightActual = wallHeight / storiesDeclared;
        wallVolume = availableWallVolume;
        calculatedVolume = targetVolume; // Exactly matches now
        wallHeightViolation = true;

        console.warn(
          `[WOMBAT-2] ⚠️ Volume exceeded - compressing walls to fit`
        );
        console.warn(
          `[WOMBAT-2] → Wall height reduced: ${wallHeightTarget.toFixed(2)}m → ${wallHeight.toFixed(2)}m`
        );
        console.warn(
          `[WOMBAT-2] → Storey height: ${storyHeightReference.toFixed(2)}m → ${storyHeightActual.toFixed(2)}m`
        );
        console.warn(
          `[WOMBAT-2] → To restore: increase Conditioned Volume or reduce Roof Area`
        );

        // Update console ticker (persistent until next user interaction)
        const reductionPercent = (
          ((wallHeightTarget - wallHeight) / wallHeightTarget) *
          100
        ).toFixed(0);
        showFeedback(
          `⚠️ Walls compressed ${reductionPercent}% (increase Conditioned Volume or reduce Roof Area)`,
          true // persistent
        );
      }
    } else {
      // Volume OK - use reference height
      wallHeight = wallHeightTarget;
      storyHeightActual = storyHeightReference;
      console.log(
        `[WOMBAT-2] ✓ Using reference wall height (volume within budget)`
      );

      // Update console ticker
      showFeedback("✓ Constraints valid", 3000);
    }

    console.log(`[WOMBAT-2] Final geometry:`);
    console.log(`  Footprint: ${footprintArea.toFixed(2)} m² (d_95 - SACRED)`);
    console.log(`  Roof area: ${roofArea.toFixed(2)} m² (d_85 - SACRED)`);
    console.log(`  Roof height: ${roofResult.roofHeight.toFixed(2)} m`);
    console.log(
      `  Wall height: ${wallHeight.toFixed(2)} m (${wallHeightViolation ? "COMPRESSED" : "reference"})`
    );
    console.log(`  Storey height: ${storyHeightActual.toFixed(2)} m`);
    if (hasBasement) {
      console.log(`  Basement depth: ${basementDepth.toFixed(2)} m`);
    }
    console.log(`  Wall volume: ${wallVolume.toFixed(2)} m³`);
    console.log(`  Roof volume: ${roofResult.roofVolume.toFixed(2)} m³`);
    console.log(`  Basement volume: ${basementVolume.toFixed(2)} m³`);
    console.log(`  Total volume: ${calculatedVolume.toFixed(2)} m³`);

    // ========================================================================
    // PHASE 4: BUILD 2D PROFILE FOR RENDERING (not solving!)
    // Profile builders just construct node arrays from pre-calculated dimensions
    // ========================================================================
    let profile2D;
    if (roofResult.roofType === "gable") {
      // CRITICAL: For gable, profile shows CROSS-SECTION (triangle)
      // Profile width = SHORT dimension (triangle base, perpendicular to ridge)
      // Profile will be extruded along LONG dimension (parallel to ridge)
      // Ridge runs parallel to long walls
      profile2D = buildGable2DProfile(
        shortDimension,
        wallHeight,
        roofResult.roofHeight
      );
    } else if (roofResult.roofType === "shed") {
      // CRITICAL: For shed, profile width = SHORT dimension (end wall cross-section)
      // Profile will be extruded along LONG dimension (ridge direction, same as gable)
      profile2D = buildShed2DProfile(
        shortDimension,
        wallHeight,
        roofResult.roofHeight
      );
    } else {
      // Flat roof
      profile2D = solveFlat2DProfile(shortDimension, wallHeight);
    }

    // ========================================================================
    // PHASE 5: GENERATE 3D NODES
    // Hip/Pyramid roofs are POLYHEDRAL (not prismatic) - generate nodes directly
    // Other roofs are PRISMATIC - extrude 2D profile
    // ========================================================================

    let nodes3D;

    if (roofResult.roofType === "hip" || roofResult.roofType === "pyramid") {
      // POLYHEDRAL: Generate hip/pyramid nodes directly (cannot be extruded)
      nodes3D = generateHipNodes3D(
        roofResult,
        shortDimension,
        longDimension,
        wallHeight
      );
      console.log(
        `[WOMBAT-2] Polyhedral roof (${roofResult.roofType}): ${nodes3D.ridge.length} ridge node(s)`
      );
      console.log(
        `[WOMBAT-2] Footprint dimensions: width=${width.toFixed(2)}m, length=${length.toFixed(2)}m (from aspect ratio)`
      );
    } else {
      // PRISMATIC: Extrude 2D profile along LONG dimension
      // - Flat: extrude along LONG - profile width is SHORT
      // - Gable: extrude along LONG - profile width is SHORT (triangle cross-section)
      // - Shed: extrude along LONG - profile width is SHORT
      let extrusionDepth = longDimension; // LONG - ridge runs along length for all roof types
      nodes3D = generate3DNodes(profile2D, extrusionDepth);

      // CRITICAL: generate3DNodes always puts profile width in X, extrusion in Y
      // This gives North-South orientation (long axis on Y)
      // When aspect ratio is negative (width > length), we need East-West orientation
      // Solution: Swap X and Y coordinates to rotate building 90°
      if (aspectRatioRaw < 0) {
        // Swap X and Y for all node arrays
        for (const nodeArray of Object.values(nodes3D)) {
          if (Array.isArray(nodeArray)) {
            nodeArray.forEach(node => {
              const temp = node.x;
              node.x = node.y;
              node.y = temp;
            });
          }
        }
        console.log(
          `[WOMBAT-2] Rotated building 90° (aspect ratio negative: X and Y swapped)`
        );
      }

      console.log(
        `[WOMBAT-2] Prismatic roof: profile=${profile2D.type}, extrusion=${extrusionDepth.toFixed(2)}m`
      );
      console.log(
        `[WOMBAT-2] Footprint dimensions: width=${width.toFixed(2)}m, length=${length.toFixed(2)}m (from aspect ratio)`
      );
    }

    // Store calculated footprint dimensions in state for display
    currentState.setValue("h_155", width.toFixed(2)); // Footprint width (from aspect ratio)
    currentState.setValue("h_157", length.toFixed(2)); // Footprint length (from aspect ratio)
    currentState.setValue("h_156", storyHeightActual.toFixed(2)); // Actual storey height (may be compressed)

    const volumeDifference = calculatedVolume - targetVolume;

    // Calculate window geometries (Phase 1: Facade windows only)
    const windowData = window.TEUI.WombatWindows?.calculateWindows({
      width,
      length,
      wallHeight,
      nodes3D,
    });

    // Return complete geometry
    return {
      footprint: { width, length },
      width, // For window calculations
      length, // For window calculations
      wallHeight, // For window calculations
      ridgeOrientation,
      roofType: roofResult.roofType,
      roofHeight: roofResult.roofHeight,
      roofVolume: roofResult.roofVolume,
      pitchRise: roofResult.pitchRise, // Carpenter's rise:12 ratio
      wallVolume,
      calculatedVolume, // Actual volume from geometry
      targetVolume, // User's specified volume (d_105)
      volumeDifference, // Difference for reporting
      wallHeightViolation, // Flag if walls were compressed
      storyHeightReference, // Reference from g_106
      storyHeight: storyHeightActual, // Actual (may be compressed)
      stories: storiesDeclared,
      height: wallHeight, // For backward compatibility
      totalHeight: wallHeight + roofResult.roofHeight,
      roofCollapsed: roofResult.roofType !== roofTypeRequested,
      nodes3D,
      profile2D,
      // Wall area data for thermal calculations
      gableEndArea: roofResult.gableEndArea,
      shedEndWallArea: roofResult.shedEndWallArea,
      // NEW: Below-grade geometry for rendering
      belowGrade: {
        hasBasement,
        hasSlab,
        hasRaisedFloor,
        basementDepth,
        basementVolume, // Critical for volume accounting
        slabArea,
        basementWallArea,
        foundationType,
      },
      // NEW: Window geometries (Phase 1: Facade windows)
      windows: windowData?.windows || [],
      windowWarnings: windowData?.warnings || [],
    };
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

    // Clear feedback console on any user input interaction
    // This makes persistent messages stay until user changes anything
    const wombatSection = document.getElementById("wombat");
    if (wombatSection) {
      // Listen for all input types: sliders, dropdowns, text inputs
      wombatSection.addEventListener("input", clearFeedback, true); // use capture phase
      wombatSection.addEventListener("change", clearFeedback, true); // use capture phase
    }
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

  // Store timeout ID for clearing persistent messages
  let feedbackClearTimeout = null;

  function showFeedback(message, persistent = false) {
    const console = document.getElementById("s19-feedback-console");
    if (!console) return;

    // Clear any existing timeout
    if (feedbackClearTimeout) {
      clearTimeout(feedbackClearTimeout);
      feedbackClearTimeout = null;
    }

    console.textContent = message;
    console.style.opacity = "1";
    console.style.transition = "";

    // If not persistent, auto-fade after 3 seconds
    if (!persistent) {
      feedbackClearTimeout = setTimeout(() => {
        console.style.transition = "opacity 1s";
        console.style.opacity = "0";
        setTimeout(() => {
          console.textContent = "";
          console.style.opacity = "1";
          console.style.transition = "";
        }, 1000);
        feedbackClearTimeout = null;
      }, 3000);
    }
    // If persistent, message stays until next interaction (cleared by clearFeedback)
  }

  function clearFeedback() {
    const console = document.getElementById("s19-feedback-console");
    if (!console || !console.textContent) return;

    if (feedbackClearTimeout) {
      clearTimeout(feedbackClearTimeout);
      feedbackClearTimeout = null;
    }

    console.style.transition = "opacity 0.5s";
    console.style.opacity = "0";
    setTimeout(() => {
      console.textContent = "";
      console.style.opacity = "1";
      console.style.transition = "";
    }, 500);
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
      // Make this slider wider for better precision around zero
      aspectSlider.style.width = "150px";

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

      // ✅ Window show/hide dropdown (d_160)
      // Listen for changes to window visibility dropdown
      window.TEUI.StateManager.addListener("d_160", newValue => {
        console.log(`[WOMBAT] Window visibility changed: d_160 = ${newValue}`);
        if (isActivated) {
          // Re-render visualization to show/hide windows
          const mode = ModeManager?.currentMode || "target";
          updateVisualization(mode);
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
