/**
 * FieldRegistry.js - Maps Legacy Cell References to Semantic Paths
 *
 * Part of the Multi-Model Architecture refactoring (Phase 1, Task 1.4)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module enables gradual migration from d_135 style IDs to semantic
 * paths like 'envelope.roof.rsiValue'. It provides bidirectional mapping
 * and field metadata including G/C/A classification.
 *
 * G = Geometry (shared across models) - e.g., floor area, volume
 * C = Code/Performance (model-specific) - e.g., RSI values, efficiency
 * A = All other (model-specific) - e.g., labels, metadata
 */
(function () {
  "use strict";

  // Ensure TEUI namespace exists
  window.TEUI = window.TEUI || {};

  // ============================================================================
  // PRIVATE STATE
  // ============================================================================

  /** @type {Map<string, string>} Legacy ID to semantic path */
  const legacyToSemantic = new Map();

  /** @type {Map<string, string>} Semantic path to legacy ID */
  const semanticToLegacy = new Map();

  /** @type {Map<string, FieldDefinition>} Field metadata by semantic path */
  const fieldMetadata = new Map();

  // ============================================================================
  // FIELD REGISTRY API
  // ============================================================================

  const FieldRegistry = {
    // ========================================================================
    // REGISTRATION
    // ========================================================================

    /**
     * Register a field mapping
     * @param {FieldDefinition} field
     */
    register(field) {
      if (!field.legacyId || !field.semanticPath) {
        console.warn("[FieldRegistry] Invalid field definition:", field);
        return;
      }

      legacyToSemantic.set(field.legacyId, field.semanticPath);
      semanticToLegacy.set(field.semanticPath, field.legacyId);
      fieldMetadata.set(field.semanticPath, field);

      // Also register ref_ variant for C-fields (model-specific)
      if (field.classification === "C") {
        const refLegacy = `ref_${field.legacyId}`;
        legacyToSemantic.set(refLegacy, field.semanticPath);
      }
    },

    /**
     * Register multiple fields at once
     * @param {FieldDefinition[]} fields
     */
    registerAll(fields) {
      for (const field of fields) {
        this.register(field);
      }
    },

    /**
     * Unregister a field
     * @param {string} semanticPath
     */
    unregister(semanticPath) {
      const field = fieldMetadata.get(semanticPath);
      if (field) {
        legacyToSemantic.delete(field.legacyId);
        if (field.classification === "C") {
          legacyToSemantic.delete(`ref_${field.legacyId}`);
        }
        semanticToLegacy.delete(semanticPath);
        fieldMetadata.delete(semanticPath);
      }
    },

    // ========================================================================
    // LOOKUP
    // ========================================================================

    /**
     * Get semantic path from legacy ID
     * @param {string} legacyId - e.g., 'd_85' or 'ref_d_85'
     * @returns {string | undefined}
     */
    toSemantic(legacyId) {
      return legacyToSemantic.get(legacyId);
    },

    /**
     * Get legacy ID from semantic path
     * @param {string} semanticPath
     * @returns {string | undefined}
     */
    toLegacy(semanticPath) {
      return semanticToLegacy.get(semanticPath);
    },

    /**
     * Get field metadata by either path or legacy ID
     * @param {string} pathOrId - Either format
     * @returns {FieldDefinition | undefined}
     */
    getMetadata(pathOrId) {
      // Try as semantic path first
      if (fieldMetadata.has(pathOrId)) {
        return fieldMetadata.get(pathOrId);
      }
      // Try converting from legacy
      const semantic = legacyToSemantic.get(pathOrId);
      if (semantic) {
        return fieldMetadata.get(semantic);
      }
      // Handle ref_ prefix
      if (pathOrId.startsWith("ref_")) {
        const baseId = pathOrId.slice(4);
        const baseSemantic = legacyToSemantic.get(baseId);
        if (baseSemantic) {
          return fieldMetadata.get(baseSemantic);
        }
      }
      return undefined;
    },

    /**
     * Get field classification
     * @param {string} pathOrId
     * @returns {'G' | 'C' | 'A' | undefined}
     */
    getClassification(pathOrId) {
      const meta = this.getMetadata(pathOrId);
      return meta?.classification;
    },

    /**
     * Check if field is shared (G-classification)
     * @param {string} pathOrId
     * @returns {boolean}
     */
    isShared(pathOrId) {
      return this.getClassification(pathOrId) === "G";
    },

    /**
     * Check if field is model-specific (C or A classification)
     * @param {string} pathOrId
     * @returns {boolean}
     */
    isModelSpecific(pathOrId) {
      const classification = this.getClassification(pathOrId);
      return classification === "C" || classification === "A";
    },

    /**
     * Check if a legacy ID is registered
     * @param {string} legacyId
     * @returns {boolean}
     */
    hasLegacy(legacyId) {
      return legacyToSemantic.has(legacyId);
    },

    /**
     * Check if a semantic path is registered
     * @param {string} semanticPath
     * @returns {boolean}
     */
    hasSemantic(semanticPath) {
      return semanticToLegacy.has(semanticPath);
    },

    // ========================================================================
    // QUERIES
    // ========================================================================

    /**
     * Get all fields for a section
     * @param {string} sectionId - e.g., 'S03', 'S13'
     * @returns {FieldDefinition[]}
     */
    getFieldsBySection(sectionId) {
      return Array.from(fieldMetadata.values()).filter(
        (f) => f.section === sectionId
      );
    },

    /**
     * Get all G-fields (shared geometry)
     * @returns {FieldDefinition[]}
     */
    getSharedFields() {
      return Array.from(fieldMetadata.values()).filter(
        (f) => f.classification === "G"
      );
    },

    /**
     * Get all C-fields (code/performance)
     * @returns {FieldDefinition[]}
     */
    getCodeFields() {
      return Array.from(fieldMetadata.values()).filter(
        (f) => f.classification === "C"
      );
    },

    /**
     * Get all A-fields (other)
     * @returns {FieldDefinition[]}
     */
    getOtherFields() {
      return Array.from(fieldMetadata.values()).filter(
        (f) => f.classification === "A"
      );
    },

    /**
     * Get all registered fields
     * @returns {FieldDefinition[]}
     */
    getAllFields() {
      return Array.from(fieldMetadata.values());
    },

    /**
     * Get all semantic paths
     * @returns {string[]}
     */
    getAllSemanticPaths() {
      return Array.from(semanticToLegacy.keys());
    },

    /**
     * Get all legacy IDs
     * @returns {string[]}
     */
    getAllLegacyIds() {
      return Array.from(legacyToSemantic.keys());
    },

    /**
     * Search fields by label (case-insensitive)
     * @param {string} query
     * @returns {FieldDefinition[]}
     */
    searchByLabel(query) {
      const lowerQuery = query.toLowerCase();
      return Array.from(fieldMetadata.values()).filter(
        (f) => f.label && f.label.toLowerCase().includes(lowerQuery)
      );
    },

    // ========================================================================
    // UTILITIES
    // ========================================================================

    /**
     * Normalize a field ID (handles ref_ prefix and both ID styles)
     * @param {string} fieldId
     * @returns {{baseId: string, isRef: boolean, semanticPath: string | undefined}}
     */
    normalize(fieldId) {
      const isRef = fieldId.startsWith("ref_");
      const baseId = isRef ? fieldId.slice(4) : fieldId;

      let semanticPath = undefined;
      if (this.hasSemantic(baseId)) {
        semanticPath = baseId;
      } else if (this.hasLegacy(baseId)) {
        semanticPath = this.toSemantic(baseId);
      }

      return { baseId, isRef, semanticPath };
    },

    /**
     * Export all mappings (for debugging or persistence)
     * @returns {Object}
     */
    exportMappings() {
      return {
        legacyToSemantic: Object.fromEntries(legacyToSemantic),
        semanticToLegacy: Object.fromEntries(semanticToLegacy),
        fieldCount: fieldMetadata.size,
        byClassification: {
          G: this.getSharedFields().length,
          C: this.getCodeFields().length,
          A: this.getOtherFields().length
        }
      };
    },

    /**
     * Clear all registrations
     */
    clear() {
      legacyToSemantic.clear();
      semanticToLegacy.clear();
      fieldMetadata.clear();
    },

    /**
     * Debug: Print registry stats
     */
    debug() {
      console.group("[FieldRegistry] Debug Info");
      console.log("Total fields:", fieldMetadata.size);
      console.log("G-fields (shared):", this.getSharedFields().length);
      console.log("C-fields (code):", this.getCodeFields().length);
      console.log("A-fields (other):", this.getOtherFields().length);

      const sections = new Set();
      for (const field of fieldMetadata.values()) {
        if (field.section) sections.add(field.section);
      }
      console.log("Sections:", Array.from(sections).sort());

      console.groupEnd();
    }
  };

  // ============================================================================
  // INITIAL FIELD DEFINITIONS
  // ============================================================================

  /**
   * Core fields that are commonly used across the calculator
   * Additional fields will be registered by section modules during Phase 2
   */
  const INITIAL_FIELDS = [
    // ========================================================================
    // Section 02: Building Information (mostly G-fields)
    // ========================================================================
    {
      legacyId: "d_12",
      semanticPath: "metadata.buildingType",
      classification: "A",
      section: "S02",
      label: "Building Type"
    },
    {
      legacyId: "h_15",
      semanticPath: "geometry.conditionedFloorArea",
      classification: "G",
      section: "S02",
      label: "Conditioned Floor Area",
      unit: "m²",
      defaultValue: 5000
    },
    {
      legacyId: "d_16",
      semanticPath: "geometry.numStoreys",
      classification: "G",
      section: "S02",
      label: "Number of Storeys",
      defaultValue: 1
    },
    {
      legacyId: "h_17",
      semanticPath: "geometry.ceilingHeight",
      classification: "G",
      section: "S02",
      label: "Average Ceiling Height",
      unit: "m",
      defaultValue: 3.0
    },
    {
      legacyId: "d_105",
      semanticPath: "geometry.totalVolume",
      classification: "G",
      section: "S02",
      label: "Total Building Volume",
      unit: "m³"
    },

    // ========================================================================
    // Section 03: Climate (G-fields for location, C-fields for setpoints)
    // ========================================================================
    {
      legacyId: "d_19",
      semanticPath: "climate.location.province",
      classification: "G",
      section: "S03",
      label: "Province"
    },
    {
      legacyId: "h_19",
      semanticPath: "climate.location.city",
      classification: "G",
      section: "S03",
      label: "City"
    },
    {
      legacyId: "j_19",
      semanticPath: "climate.zone",
      classification: "G",
      section: "S03",
      label: "Climate Zone"
    },
    {
      legacyId: "d_20",
      semanticPath: "climate.heating.degreedays",
      classification: "G",
      section: "S03",
      label: "Heating Degree Days",
      unit: "HDD"
    },
    {
      legacyId: "d_21",
      semanticPath: "climate.cooling.degreedays",
      classification: "G",
      section: "S03",
      label: "Cooling Degree Days",
      unit: "CDD"
    },
    {
      legacyId: "i_21",
      semanticPath: "building.capacitance.percentage",
      classification: "C",
      section: "S03",
      label: "Capacitance Percentage",
      unit: "%"
    },
    {
      legacyId: "h_23",
      semanticPath: "climate.heating.setpoint",
      classification: "C",
      section: "S03",
      label: "Heating Setpoint",
      unit: "°C",
      defaultValue: 21
    },
    {
      legacyId: "h_24",
      semanticPath: "climate.cooling.setpoint",
      classification: "C",
      section: "S03",
      label: "Cooling Setpoint",
      unit: "°C",
      defaultValue: 24
    },
    {
      legacyId: "j_21",
      semanticPath: "climate.groundTemperature",
      classification: "G",
      section: "S03",
      label: "Ground Temperature",
      unit: "°C"
    },

    // ========================================================================
    // Section 11: Envelope (C-fields - model-specific performance)
    // ========================================================================
    {
      legacyId: "d_85",
      semanticPath: "envelope.roof.rsiValue",
      classification: "C",
      section: "S11",
      label: "Roof RSI",
      unit: "m²·K/W",
      defaultValue: 5.0
    },
    {
      legacyId: "d_87",
      semanticPath: "envelope.walls.rsiValue",
      classification: "C",
      section: "S11",
      label: "Wall RSI",
      unit: "m²·K/W",
      defaultValue: 4.0
    },
    {
      legacyId: "d_88",
      semanticPath: "envelope.windows.uFactor",
      classification: "C",
      section: "S11",
      label: "Window U-Factor",
      unit: "W/m²·K",
      defaultValue: 1.4
    },
    {
      legacyId: "d_89",
      semanticPath: "envelope.windows.shgc",
      classification: "C",
      section: "S11",
      label: "Window SHGC",
      defaultValue: 0.25
    },
    {
      legacyId: "d_90",
      semanticPath: "envelope.foundation.rsiValue",
      classification: "C",
      section: "S11",
      label: "Foundation RSI",
      unit: "m²·K/W",
      defaultValue: 2.0
    },

    // ========================================================================
    // Section 12: Volume and Surface (G-fields - geometry)
    // ========================================================================
    {
      legacyId: "d_103",
      semanticPath: "geometry.surfaceArea.roof",
      classification: "G",
      section: "S12",
      label: "Roof Area",
      unit: "m²"
    },
    {
      legacyId: "d_104",
      semanticPath: "geometry.surfaceArea.walls",
      classification: "G",
      section: "S12",
      label: "Wall Area",
      unit: "m²"
    },
    {
      legacyId: "d_106",
      semanticPath: "geometry.surfaceArea.windows",
      classification: "G",
      section: "S12",
      label: "Window Area",
      unit: "m²"
    },

    // ========================================================================
    // Section 07: Water Heating (C-fields)
    // ========================================================================
    {
      legacyId: "d_52",
      semanticPath: "mechanical.dhw.efficiency",
      classification: "C",
      section: "S07",
      label: "DHW Efficiency",
      unit: "%",
      defaultValue: 90
    },
    {
      legacyId: "d_53",
      semanticPath: "mechanical.dhw.dwhrEfficiency",
      classification: "C",
      section: "S07",
      label: "DWHR Efficiency",
      unit: "%",
      defaultValue: 42
    },

    // ========================================================================
    // Section 13: Mechanical Systems (C-fields)
    // ========================================================================
    {
      legacyId: "d_113",
      semanticPath: "mechanical.heating.systemType",
      classification: "C",
      section: "S13",
      label: "Heating System Type"
    },
    {
      legacyId: "f_113",
      semanticPath: "mechanical.heating.efficiency",
      classification: "C",
      section: "S13",
      label: "Heating Efficiency (HSPF/AFUE)",
      defaultValue: 7.1
    },
    {
      legacyId: "j_115",
      semanticPath: "mechanical.heating.afue",
      classification: "C",
      section: "S13",
      label: "AFUE",
      unit: "%",
      defaultValue: 0.9
    },
    {
      legacyId: "j_116",
      // The graph's input (MechanicalNodes); "mechanical.cooling.cop" named
      // nothing, and this static entry wins over the graph's in populateFromGraph.
      semanticPath: "mechanical.cooling.copDedicated",
      classification: "C",
      section: "S13",
      label: "Cooling COP (Separate Cooling)",
      defaultValue: 2.66
    },
    {
      legacyId: "d_118",
      semanticPath: "mechanical.ventilation.heatRecoveryEfficiency",
      classification: "C",
      section: "S13",
      label: "ERV/HRV Efficiency",
      unit: "%",
      defaultValue: 55
    },

    // ========================================================================
    // Section 04/14/15: Energy Results (C-fields - calculated)
    // ========================================================================
    {
      legacyId: "f_32",
      semanticPath: "intensities.teui",
      classification: "C",
      section: "S04",
      label: "TEUI",
      unit: "kWh/m²"
    },
    {
      legacyId: "j_32",
      semanticPath: "intensities.teuiTarget",
      classification: "C",
      section: "S04",
      label: "TEUI Target",
      unit: "kWh/m²"
    },
    {
      legacyId: "h_126",
      semanticPath: "intensities.tedi",
      classification: "C",
      section: "S14",
      label: "TEDI",
      unit: "kWh/m²"
    },
    {
      legacyId: "h_136",
      semanticPath: "intensities.teuiSummary",
      classification: "C",
      section: "S15",
      label: "TEUI Summary",
      unit: "kWh/m²"
    },

    // ========================================================================
    // Section 01: Key Values Dashboard (C-fields - calculated summaries)
    // ========================================================================
    // Reference values (e_ prefix)
    {
      legacyId: "e_6",
      semanticPath: "keyValues.reference.lifetimeCarbon",
      classification: "C",
      section: "S01",
      label: "Reference Lifetime Carbon",
      unit: "kgCO2e/m²"
    },
    {
      legacyId: "e_8",
      semanticPath: "keyValues.reference.annualCarbon",
      classification: "C",
      section: "S01",
      label: "Reference Annual Carbon",
      unit: "kgCO2e/m²/yr"
    },
    {
      legacyId: "e_10",
      semanticPath: "keyValues.reference.teui",
      classification: "C",
      section: "S01",
      label: "Reference TEUI",
      unit: "kWh/m²/yr"
    },
    // Target values (h_ prefix)
    {
      legacyId: "h_6",
      semanticPath: "keyValues.target.lifetimeCarbon",
      classification: "C",
      section: "S01",
      label: "Target Lifetime Carbon",
      unit: "kgCO2e/m²"
    },
    {
      legacyId: "h_8",
      semanticPath: "keyValues.target.annualCarbon",
      classification: "C",
      section: "S01",
      label: "Target Annual Carbon",
      unit: "kgCO2e/m²/yr"
    },
    {
      legacyId: "h_10",
      semanticPath: "keyValues.target.teui",
      classification: "C",
      section: "S01",
      label: "Target TEUI",
      unit: "kWh/m²/yr"
    },
    // Actual values (k_ prefix)
    {
      legacyId: "k_6",
      semanticPath: "keyValues.actual.lifetimeCarbon",
      classification: "C",
      section: "S01",
      label: "Actual Lifetime Carbon",
      unit: "kgCO2e/m²"
    },
    {
      legacyId: "k_8",
      semanticPath: "keyValues.actual.annualCarbon",
      classification: "C",
      section: "S01",
      label: "Actual Annual Carbon",
      unit: "kgCO2e/m²/yr"
    },
    {
      legacyId: "k_10",
      semanticPath: "keyValues.actual.teui",
      classification: "C",
      section: "S01",
      label: "Actual TEUI",
      unit: "kWh/m²/yr"
    },
    // Percent reduction values (j_ and m_ prefix)
    {
      legacyId: "j_8",
      semanticPath: "keyValues.annualCarbon.reductionPercent",
      classification: "C",
      section: "S01",
      label: "Annual Carbon Reduction %"
    },
    {
      legacyId: "j_10",
      semanticPath: "keyValues.teui.reductionPercent",
      classification: "C",
      section: "S01",
      label: "TEUI Reduction %"
    },
    {
      legacyId: "m_6",
      semanticPath: "keyValues.lifetimeCarbon.percent",
      classification: "C",
      section: "S01",
      label: "Lifetime Carbon Remaining %"
    },
    {
      legacyId: "m_8",
      semanticPath: "keyValues.annualCarbon.remainingPercent",
      classification: "C",
      section: "S01",
      label: "Annual Carbon Remaining %"
    },
    {
      legacyId: "m_10",
      semanticPath: "keyValues.teui.remainingPercent",
      classification: "C",
      section: "S01",
      label: "TEUI Remaining %"
    }
  ];

  // ============================================================================
  // GRAPH POPULATION
  // ============================================================================

  /**
   * Populate FieldRegistry from ComputationGraph nodes
   * This auto-registers all fields that have legacyId defined
   * @param {Object} graph - ComputationGraph instance
   * @returns {number} Number of fields registered
   */
  FieldRegistry.populateFromGraph = function(graph) {
    if (!graph) {
      console.warn("[FieldRegistry] No graph provided for population");
      return 0;
    }

    let count = 0;

    // Register input nodes
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    for (const semanticPath of inputIds) {
      const node = graph.getInput(semanticPath);
      if (node?.legacyId && !legacyToSemantic.has(node.legacyId)) {
        this.register({
          legacyId: node.legacyId,
          semanticPath: semanticPath,
          classification: node.classification || "C",
          section: node.section || "",
          label: node.label || semanticPath,
          unit: node.unit || "",
          defaultValue: node.defaultValue
        });
        count++;
      }
    }

    // Register computed nodes
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];
    for (const semanticPath of nodeIds) {
      const node = graph.getNode(semanticPath);
      if (node?.legacyId && !legacyToSemantic.has(node.legacyId)) {
        this.register({
          legacyId: node.legacyId,
          semanticPath: semanticPath,
          classification: node.classification || "C",
          section: node.section || "",
          label: node.label || semanticPath,
          unit: node.unit || ""
        });
        count++;
      }
    }

    console.log(`[FieldRegistry] Populated ${count} fields from ComputationGraph`);
    return count;
  };

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  // Register initial fields (core fields always available)
  FieldRegistry.registerAll(INITIAL_FIELDS);

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.FieldRegistry = FieldRegistry;

  // Log initialization
  console.log(
    `[FieldRegistry] Loaded with ${INITIAL_FIELDS.length} initial field mappings`
  );
})();
