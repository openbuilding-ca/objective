/**
 * ComputationIntegration.js - Wire New Computation System into Calculator
 *
 * Part of the Multi-Model Architecture refactoring (Phase 4)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module integrates the new incremental computation system
 * with the existing calculator, running both systems in parallel
 * for validation before full migration.
 *
 * Usage:
 *   // After existing init completes:
 *   TEUI.ComputationIntegration.initialize();
 *
 *   // To enable LegacyAdapter (intercept StateManager):
 *   TEUI.ComputationIntegration.enableAdapter();
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // STATE
  // ============================================================================

  let initialized = false;
  let graph = null;
  let state = null;
  let engine = null;
  let adapter = null;

  // Configuration
  const config = {
    enableLogging: true,
    runInParallel: true,      // Run both old and new systems
    validateResults: false,   // Compare old vs new (expensive)
    autoSync: true            // Auto-sync from StateManager on init
  };

  // ============================================================================
  // LOGGING
  // ============================================================================

  function log(msg, ...args) {
    if (config.enableLogging) {
      console.log(`[ComputationIntegration] ${msg}`, ...args);
    }
  }

  function warn(msg, ...args) {
    console.warn(`[ComputationIntegration] ${msg}`, ...args);
  }

  function error(msg, ...args) {
    console.error(`[ComputationIntegration] ${msg}`, ...args);
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  /**
   * Initialize the new computation system
   * @param {Object} options - Configuration options
   * @returns {boolean} - Success status
   */
  function initialize(options = {}) {
    if (initialized) {
      warn("Already initialized");
      return true;
    }

    Object.assign(config, options);

    log("Initializing new computation system...");

    try {
      // Step 1: Create computation graph
      graph = createGraph();
      if (!graph) {
        error("Failed to create computation graph");
        return false;
      }

      // Step 1.5: Populate FieldRegistry from graph (enables semantic path lookups)
      const FieldRegistry = window.TEUI.FieldRegistry;
      if (FieldRegistry?.populateFromGraph) {
        const fieldCount = FieldRegistry.populateFromGraph(graph);
        log(`FieldRegistry populated with ${fieldCount} additional fields from graph`);
      }

      // Step 2: Create multi-model state
      state = createState();
      if (!state) {
        error("Failed to create multi-model state");
        return false;
      }

      // Step 3: Create computation engine
      engine = createEngine();
      if (!engine) {
        error("Failed to create computation engine");
        return false;
      }

      // Skip initial sync + compute — the first calculateAll() (after CSV
      // import or page-level recalc) will populate the graph from scratch.
      // Pre-loading defaults here just creates stale state that survives
      // into sample project imports.

      initialized = true;
      log("Initialization complete");

      // Expose for debugging
      window.TEUI.ComputationSystem = {
        graph,
        state,
        engine,
        getAdapter: () => adapter
      };

      return true;
    } catch (e) {
      error("Initialization failed:", e);
      return false;
    }
  }

  /**
   * Create and configure the computation graph
   */
  function createGraph() {
    const ComputationGraph = window.TEUI.ComputationGraph;
    if (!ComputationGraph) {
      error("ComputationGraph module not loaded");
      return null;
    }

    const g = ComputationGraph.create();

    // Register all section nodes
    const nodes = window.TEUI.ComputationNodes || {};

    // Core infrastructure nodes
    if (nodes.Climate) {
      nodes.Climate.register(g);
      log("Registered ClimateNodes");
    }

    if (nodes.BuildingInfo) {
      nodes.BuildingInfo.register(g);
      log("Registered BuildingInfoNodes");
    }

    // EnvelopeNodes removed - consolidated into TransmissionLossNodes + VolumeMetricsNodes

    if (nodes.Mechanical) {
      nodes.Mechanical.register(g);
      log("Registered MechanicalNodes");
    }

    // Energy system nodes
    if (nodes.SpaceHeating) {
      nodes.SpaceHeating.register(g);
      log("Registered SpaceHeatingNodes");
    }

    if (nodes.WaterHeating) {
      nodes.WaterHeating.register(g);
      log("Registered WaterHeatingNodes");
    }

    if (nodes.Renewable) {
      nodes.Renewable.register(g);
      log("Registered RenewableNodes");
    }

    if (nodes.Energy) {
      nodes.Energy.register(g);
      log("Registered EnergyNodes");
    }

    // Air quality nodes (S08)
    if (nodes.AirQuality) {
      nodes.AirQuality.register(g);
      log("Registered AirQualityNodes");
    }

    // Emissions and carbon nodes
    if (nodes.Forestry) {
      nodes.Forestry.register(g);
      log("Registered ForestryNodes");
    }

    if (nodes.Emissions) {
      nodes.Emissions.register(g);
      log("Registered EmissionsNodes");
    }

    // Building use nodes
    if (nodes.Occupancy) {
      nodes.Occupancy.register(g);
      log("Registered OccupancyNodes");
    }

    if (nodes.InternalGains) {
      nodes.InternalGains.register(g);
      log("Registered InternalGainsNodes");
    }

    // Envelope gains and losses (S10, S11)
    if (nodes.RadiantGains) {
      nodes.RadiantGains.register(g);
      log("Registered RadiantGainsNodes");
    }

    if (nodes.TransmissionLoss) {
      nodes.TransmissionLoss.register(g);
      log("Registered TransmissionLossNodes");
    }

    // Volume metrics and air leakage (S12)
    if (nodes.VolumeMetrics) {
      nodes.VolumeMetrics.register(g);
      log("Registered VolumeMetricsNodes");
    }

    // Cooling calculations (psychrometric, free cooling - formerly Cooling.js)
    // Must register BEFORE VentilationNodes because ventilation.heatGain depends on cooling.latentLoadFactor
    if (nodes.Cooling) {
      nodes.Cooling.register(g);
      log("Registered CoolingNodes");
    }

    // Ventilation and mechanical (S13)
    if (nodes.Ventilation) {
      nodes.Ventilation.register(g);
      log("Registered VentilationNodes");
    }

    // Dashboard consumer node (depends on all others)
    if (nodes.KeyValues) {
      nodes.KeyValues.register(g);
      log("Registered KeyValuesNodes");
    }

    // Cross-model compliance ratio nodes (depends on mechanical values)
    if (nodes.Compliance) {
      nodes.Compliance.register(g);
      log("Registered ComplianceNodes");
    }

    // Section-level compliance display nodes (S07, S09, S12, S15)
    if (nodes.SectionCompliance) {
      nodes.SectionCompliance.register(g);
      log("Registered SectionComplianceNodes");
    }

    // F280 peak load & equipment sizing compliance (builds on Section15 peak loads)
    if (nodes.F280Compliance) {
      nodes.F280Compliance.register(g);
      log("Registered F280ComplianceNodes");
    }

    const stats = g.getStats();
    log(`Graph created: ${stats.nodeCount} nodes, ${stats.inputCount} inputs`);

    return g;
  }

  /**
   * Create multi-model state with Target and Reference models
   */
  function createState() {
    const MultiModelState = window.TEUI.MultiModelState;
    const ModelMetadata = window.TEUI.ModelMetadata;

    if (!MultiModelState || !ModelMetadata) {
      error("MultiModelState or ModelMetadata not loaded");
      return null;
    }

    const s = MultiModelState.create();

    // Create Target model (active by default)
    const targetMeta = ModelMetadata.createTarget("Target Building");
    s.addModel(targetMeta);

    // Create Reference model
    const refMeta = ModelMetadata.createReference("Reference Building");
    s.addModel(refMeta);

    log("Created Target and Reference models");

    return s;
  }

  /**
   * Create computation engine
   */
  function createEngine() {
    const MultiModelEngine = window.TEUI.MultiModelEngine;

    if (!MultiModelEngine) {
      error("MultiModelEngine not loaded");
      return null;
    }

    return MultiModelEngine.create({ state, graph });
  }

  /**
   * Sync values from existing StateManager to new state
   */
  function syncFromStateManager() {
    const StateManager = window.TEUI.StateManager;

    if (!StateManager) {
      warn("StateManager not available for sync");
      return;
    }

    log("Syncing from StateManager...");

    const targetId = state.getActiveModelId();
    let syncCount = 0;

    // Clear stale state before re-syncing. Without this, values from a
    // previous CSV load remain in the graph state when the new CSV doesn't
    // set them, causing downstream computations to use stale inputs.
    state.clearSharedState();
    state.clearModelState(targetId);

    // Get all registered input IDs and use their legacyId property
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];

    for (const semanticPath of inputIds) {
      // Get the input node to access its legacyId
      const inputNode = graph.getInput(semanticPath);
      const legacyId = inputNode?.legacyId;

      if (legacyId) {
        const value = StateManager.getValue(legacyId);
        if (value !== undefined && value !== null && value !== "") {
          state.setValueForModel(targetId, semanticPath, value);
          syncCount++;
        }
      }
    }

    // Also sync Reference model
    const refModelId = getRefModelId();
    if (refModelId) {
      state.clearModelState(refModelId);
      let refSyncCount = 0;
      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        const legacyId = inputNode?.legacyId;

        if (legacyId) {
          // Reference values use ref_ prefix
          // Don't add ref_ prefix if legacyId already starts with ref_
          const refLegacyId = legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId;
          const value = StateManager.getValue(refLegacyId);
          if (value !== undefined && value !== null && value !== "") {
            state.setValueForModel(refModelId, semanticPath, value);
            refSyncCount++;
          }
        }
      }
      if (refSyncCount > 0) {
        log(`Synced ${refSyncCount} reference values`);
      }
    }

    log(`Synced ${syncCount} values from StateManager`);
  }

  /**
   * Sync computed values FROM ComputationGraph back TO StateManager
   * This keeps StateManager in sync when bypassing legacy calculations
   */
  function syncToStateManager() {
    const StateManager = window.TEUI.StateManager;
    const FieldRegistry = window.TEUI.FieldRegistry;

    if (!StateManager) {
      warn("StateManager not available for sync");
      return;
    }

    // NOTE: Caller (Calculator.calculateAll) is responsible for muting SM listeners.
    // Do NOT mute/unmute here — nested boolean mute breaks the caller's mute scope.

    const targetId = state.getActiveModelId();
    let syncCount = 0;

    // Get all computed node IDs and sync their values to StateManager
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];

    for (const semanticPath of nodeIds) {
      const node = graph.getNode(semanticPath);
      const legacyId = node?.legacyId;

      if (legacyId) {
        const value = state.getValue(semanticPath);
        if (value !== undefined && value !== null) {
          // Don't trigger recalculation - just set the value
          StateManager.setValue(legacyId, value, "calculated");
          syncCount++;
        }
      }
    }

    // Inputs are NOT synced here — they are already in StateManager from the
    // user's setValue call (or file load). Only computed outputs need syncing.

    log(`Synced ${syncCount} computed values to StateManager`);
  }

  /**
   * Get Reference model ID
   */
  function getRefModelId() {
    if (!state) return null;
    const models = state.getAllModels();
    const refModel = models.find(m => m.modelType === "reference");
    return refModel?.id || null;
  }

  // ============================================================================
  // LEGACY ADAPTER
  // ============================================================================

  /**
   * Enable LegacyAdapter to intercept StateManager calls
   * This makes the new system the primary computation engine
   */
  function enableAdapter() {
    if (!initialized) {
      error("Must initialize before enabling adapter");
      return false;
    }

    if (adapter) {
      warn("Adapter already enabled");
      return true;
    }

    const LegacyAdapter = window.TEUI.LegacyAdapter;
    if (!LegacyAdapter) {
      error("LegacyAdapter module not loaded");
      return false;
    }

    try {
      adapter = LegacyAdapter.create({ state, engine, graph });
      adapter.install();
      log("LegacyAdapter installed - intercepting StateManager");
      return true;
    } catch (e) {
      error("Failed to enable adapter:", e);
      return false;
    }
  }

  /**
   * Disable LegacyAdapter and restore original StateManager
   */
  function disableAdapter() {
    if (adapter) {
      adapter.uninstall();
      adapter = null;
      log("LegacyAdapter uninstalled - StateManager restored");
    }
  }

  // ============================================================================
  // VALUE CHANGE HANDLING
  // ============================================================================

  /**
   * Handle a value change from the old system
   * Used when running in parallel mode
   * @param {string} legacyId - Legacy field ID (e.g., "d_12")
   * @param {*} value - New value
   */
  function onLegacyValueChange(legacyId, value) {
    if (!initialized || !config.runInParallel) return;

    const FieldRegistry = window.TEUI.FieldRegistry;
    const semanticPath = FieldRegistry?.toSemantic(legacyId);

    if (semanticPath) {
      // Update new system
      const result = engine.onValueChange(semanticPath, value);

      if (config.validateResults) {
        validateAgainstOldSystem(result.computedNodes);
      }
    }
  }

  /**
   * Validate new system results against old system
   * @param {string[]} computedPaths - Paths that were computed
   */
  function validateAgainstOldSystem(computedPaths) {
    const StateManager = window.TEUI.StateManager;
    const FieldRegistry = window.TEUI.FieldRegistry;

    if (!StateManager || !FieldRegistry) return;

    const mismatches = [];

    for (const path of computedPaths) {
      const newValue = state.getValue(path);
      const legacyId = FieldRegistry.toLegacy(path);

      if (legacyId) {
        const oldValue = StateManager.getValue(legacyId);

        if (oldValue !== undefined && oldValue !== null) {
          const oldNum = parseFloat(oldValue);
          const newNum = parseFloat(newValue);

          if (!isNaN(oldNum) && !isNaN(newNum)) {
            const diff = Math.abs(oldNum - newNum);
            if (diff > 0.01 && diff / Math.abs(oldNum) > 0.01) {
              mismatches.push({ path, legacyId, oldValue, newValue });
            }
          }
        }
      }
    }

    if (mismatches.length > 0) {
      warn("Validation mismatches:", mismatches);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  /**
   * Get the computation graph
   */
  function getGraph() {
    return graph;
  }

  /**
   * Get the multi-model state
   */
  function getState() {
    return state;
  }

  /**
   * Get the computation engine
   */
  function getEngine() {
    return engine;
  }

  /**
   * Check if initialized
   */
  function isInitialized() {
    return initialized;
  }

  /**
   * Get configuration
   */
  function getConfig() {
    return { ...config };
  }

  /**
   * Update configuration
   */
  function setConfig(newConfig) {
    Object.assign(config, newConfig);
  }

  /**
   * Manually trigger computation for all models
   */
  function computeAll() {
    if (!initialized) {
      error("Not initialized");
      return null;
    }
    return engine.computeAll();
  }

  /**
   * Get statistics
   */
  function getStats() {
    if (!initialized) return null;

    return {
      graph: graph.getStats(),
      state: state.getStats(),
      engine: engine.getStats()
    };
  }

  /**
   * Reset graph state for both Target and Reference models.
   * Call before CSV import so stale inputs don't survive.
   */
  function resetGraphState() {
    if (!initialized) return;

    const targetId = state.getActiveModelId();
    const refModelId = getRefModelId();

    state.clearSharedState();
    if (targetId) state.clearModelState(targetId);
    if (refModelId) state.clearModelState(refModelId);

    // Seed default values from graph input definitions so fields
    // not overwritten by CSV import still have sensible values.
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    let seeded = 0;
    for (const sp of inputIds) {
      const input = graph.getInput(sp);
      if (input?.defaultValue !== undefined && input.defaultValue !== "") {
        if (targetId) state.setValueForModel(targetId, sp, input.defaultValue);
        seeded++;
      }
    }

    log(`Graph state reset: cleared + seeded ${seeded} defaults`);
  }

  /**
   * Clear editable-computed overrides so batch operations (CSV import,
   * mode switch) use fresh climate-lookup values.
   */
  function clearEditableComputedOverrides() {
    if (!initialized) return;
    const overrides = ["climate.cooling.degreedays.userOverride"];
    const targetId = state.getActiveModelId();
    const refModelId = getRefModelId();
    for (const path of overrides) {
      state.setValueForModel(targetId, path, null);
      if (refModelId) state.setValueForModel(refModelId, path, null);
    }
  }

  /**
   * Debug output
   */
  function debug() {
    if (!initialized) {
      console.log("[ComputationIntegration] Not initialized");
      return;
    }

    console.group("[ComputationIntegration] Debug");
    console.log("Config:", config);
    console.log("Graph:", graph.getStats());
    console.log("State:", state.getStats());
    console.log("Engine:", engine.getStats());
    console.log("Adapter:", adapter ? "installed" : "not installed");
    console.groupEnd();
  }

  // ============================================================================
  // REFERENCE MODEL POPULATION
  // ============================================================================

  /**
   * Populate Reference model inputs from ReferenceValues.js
   * This eliminates dependency on legacy Section calculations for Reference model
   *
   * Strategy:
   * 1. G-fields (geometry/climate): Copy from Target model
   * 2. C-fields (code/performance): Load from ReferenceValues.js based on selected standard
   */
  function populateReferenceModel() {
    const StateManager = window.TEUI.StateManager;
    const ReferenceValues = window.TEUI.ReferenceValues;

    if (!StateManager || !ReferenceValues) {
      warn("StateManager or ReferenceValues not available for Reference population");
      return { gFieldsCopied: 0, cFieldsLoaded: 0, computedCopied: 0, debug: null };
    }

    const refModelId = getRefModelId();
    if (!refModelId) {
      warn("No Reference model found");
      return { gFieldsCopied: 0, cFieldsLoaded: 0, computedCopied: 0, debug: null };
    }

    const targetId = state.getActiveModelId();

    // Get selected reference standard (d_13 contains the standard name)
    const standardName = StateManager.getValue("d_13") || "OBC SB12 3.1.1.2.C4";
    const standardValues = ReferenceValues[standardName] || ReferenceValues["OBC SB12 3.1.1.2.C4"];

    if (!standardValues) {
      warn(`Reference standard "${standardName}" not found, using OBC SB12 default`);
    }

    log(`Populating Reference model from standard: ${standardName}`);

    let gFieldsCopied = 0;
    let cFieldsLoaded = 0;
    let computedCopied = 0;

    // Debug tracking
    const debug = {
      standardName,
      gFields: [],
      cFieldsFromStandard: [],
      cFieldsFromStateManager: [],
      cFieldsCopiedFromTarget: [],
      cFieldsMissing: [],
      computedFromTarget: []
    };

    // STEP 1: Copy ALL computed values from Target to Reference as baseline
    // This ensures the Reference model has all intermediate values needed
    // to compute the full chain (envelope → energy → emissions)
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];
    for (const semanticPath of nodeIds) {
      const targetValue = state.getValueForModel(targetId, semanticPath);
      if (targetValue !== undefined && targetValue !== null) {
        state.setValueForModel(refModelId, semanticPath, targetValue);
        computedCopied++;
        debug.computedFromTarget.push({ semanticPath, value: targetValue });
      }
    }
    log(`  - Computed values copied from Target: ${computedCopied}`);

    // STEP 2: Populate inputs - G-fields from Target, C-fields from ReferenceValues.js
    // This overrides the baseline with Reference-specific input values
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];

    for (const semanticPath of inputIds) {
      const inputNode = graph.getInput(semanticPath);
      if (!inputNode) continue;

      const legacyId = inputNode.legacyId;
      const classification = inputNode.classification || "C";

      if (classification === "G") {
        // G-field: prefer ref_ value from SM (CSV import / user edit), fall back to Target
        const refLegacyId = legacyId
          ? (legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId)
          : null;
        const refValue = refLegacyId ? StateManager.getValue(refLegacyId) : undefined;

        if (refValue !== undefined && refValue !== null && refValue !== "") {
          state.setValueForModel(refModelId, semanticPath, refValue);
        } else {
          const targetValue = state.getValueForModel(targetId, semanticPath);
          if (targetValue !== undefined && targetValue !== null) {
            state.setValueForModel(refModelId, semanticPath, targetValue);
          }
        }
        gFieldsCopied++;
        debug.gFields.push({ legacyId, semanticPath, value: state.getValueForModel(refModelId, semanticPath) });
      } else {
        // C-field priority: StateManager ref_ (CSV import) > ReferenceValues.js > Target
        // CSV ref_ values represent the actual Reference model state for the project,
        // so they take precedence over ReferenceValues.js standard defaults.
        // ReferenceValues.js provides defaults for new projects without CSV data.

        const refLegacyId = legacyId
          ? (legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId)
          : null;
        const refValue = refLegacyId ? StateManager.getValue(refLegacyId) : undefined;

        if (refValue !== undefined && refValue !== null && refValue !== "") {
          // Priority 1: CSV-imported ref_ value from StateManager
          state.setValueForModel(refModelId, semanticPath, refValue);
          debug.cFieldsFromStateManager.push({ legacyId, semanticPath, value: refValue });
        } else if (legacyId && standardValues && standardValues[legacyId] !== undefined) {
          // Priority 2: Standard default from ReferenceValues.js
          const stdValue = standardValues[legacyId];
          state.setValueForModel(refModelId, semanticPath, stdValue);
          cFieldsLoaded++;
          debug.cFieldsFromStandard.push({ legacyId, semanticPath, value: stdValue });
        } else if ((!legacyId || inputNode.copyToReference === false) && inputNode.defaultValue !== undefined) {
          // No legacyId means no CSV/standard path — use declared default; nor for an input that
          // must never take the Target's (copyToReference: false - the CDD user override, d_21o)
          state.setValueForModel(refModelId, semanticPath, inputNode.defaultValue);
        } else {
          // Priority 3: Copy from Target (shared input)
          const targetValue = state.getValueForModel(targetId, semanticPath);
          if (targetValue !== undefined && targetValue !== null) {
            state.setValueForModel(refModelId, semanticPath, targetValue);
            debug.cFieldsCopiedFromTarget.push({ legacyId, semanticPath, value: targetValue });
          } else {
            debug.cFieldsMissing.push({ legacyId, semanticPath });
          }
        }
      }
    }

    // The Reference model knows it is one, and its standard's minimum COPc
    // (MechanicalNodes: a reference heat pump cools at that minimum)
    state.setValueForModel(refModelId, "model.isReference", true);
    state.setValueForModel(targetId, "model.isReference", false);
    state.setValueForModel(refModelId, "model.referenceCopCool", standardValues?.j_116 ?? null);

    log(`Reference model populated: ${gFieldsCopied} G-fields copied, ${cFieldsLoaded} C-fields from standard`);
    log(`  - C-fields from StateManager: ${debug.cFieldsFromStateManager.length}`);
    log(`  - C-fields copied from Target: ${debug.cFieldsCopiedFromTarget.length}`);
    log(`  - C-fields missing: ${debug.cFieldsMissing.length}`);

    // CRITICAL: Copy reference.* inputs to Target model state
    // This allows nodes like keyValues.reference.teui to access Reference inputs
    // when computing in the Target model context
    let refInputsCopiedToTarget = 0;
    for (const semanticPath of inputIds) {
      if (semanticPath.startsWith("reference.")) {
        const refValue = state.getValueForModel(refModelId, semanticPath);
        if (refValue !== undefined && refValue !== null) {
          state.setValueForModel(targetId, semanticPath, refValue);
          refInputsCopiedToTarget++;
        }
      }
    }
    log(`  - reference.* inputs copied to Target: ${refInputsCopiedToTarget}`);

    return { gFieldsCopied, cFieldsLoaded, computedCopied, refInputsCopiedToTarget, debug };
  }

  /**
   * Compute both Target and Reference models
   * Returns combined results
   */
  /**
   * Mapping from Reference model computed outputs to Target model reference.* inputs.
   * After computing the Reference model, these computed values are copied to the
   * Target model so that Key Values nodes can use them.
   *
   * The CSV stores these as saved outputs but they must be freshly computed
   * from Reference envelope values to be accurate.
   */
  const REF_OUTPUT_TO_TARGET_INPUT = {
    // Energy and emissions (Key Values dashboard)
    "energy.target.total":           "reference.energy.total",
    "emissions.target.subtotal":     "reference.emissions.subtotal",
    "building.conditionedFloorArea": "reference.building.conditionedFloorArea",
    "building.serviceLife":          "reference.building.serviceLife",
    "building.typologyEmbodiedCarbon": "reference.emissions.embodied",

    // S05 compliance ratio reference values
    "emissions.operational.mt":      "reference.emissions.operational.mt",
    "emissions.ghgi.annual":         "reference.emissions.ghgi.annual",
    "emissions.embodied.total":      "reference.emissions.embodied.total",
    "building.userModelledEmbodiedCarbon": "reference.emissions.userModelled",
  };

  /**
   * Get merged REF_OUTPUT_TO_TARGET_INPUT including ComplianceNodes mappings
   * This allows cross-model compliance ratio calculations
   */
  function getMergedRefOutputMapping() {
    const nodes = window.TEUI.ComputationNodes || {};
    const merged = { ...REF_OUTPUT_TO_TARGET_INPUT };

    // Merge ComplianceNodes mapping if available
    if (nodes.Compliance?.REF_OUTPUT_TO_TARGET_INPUT) {
      Object.assign(merged, nodes.Compliance.REF_OUTPUT_TO_TARGET_INPUT);
    }

    // Merge SectionComplianceNodes mapping (S07, S09, S12, S15)
    if (nodes.SectionCompliance?.REF_OUTPUT_TO_TARGET_INPUT) {
      Object.assign(merged, nodes.SectionCompliance.REF_OUTPUT_TO_TARGET_INPUT);
    }

    return merged;
  }

  function computeAllWithReference() {
    if (!initialized) {
      error("Not initialized");
      return null;
    }

    const targetId = state.getActiveModelId();
    const refModelId = getRefModelId();

    // Step 1: Compute Target model
    const targetResult = engine.computeAllForModel(targetId);

    // Step 2: Compute Reference model if it exists
    let refResult = null;
    let syncResult = null;
    if (refModelId) {
      refResult = engine.computeAllForModel(refModelId);

      // Step 2.5: Force wood offset = 0 for Reference model and recompute emissions
      // Reference building gets wood emissions but NO wood carbon credit.
      // This matches main branch behavior where Reference has full emissions impact.
      state.setValueForModel(refModelId, "forestry.annualOffset", 0);
      // Recompute emissions.target.subtotal with the forced forestry.annualOffset = 0
      const emissionsResult = engine.onValueChange("forestry.annualOffset", 0, refModelId);
      log(`  - Forced forestry.annualOffset = 0 for Reference, recomputed ${emissionsResult.computedNodes.length} nodes`);

      // Steps 3+4: Copy Reference outputs → Target reference.* inputs and
      // incrementally recompute only the downstream nodes that depend on them
      // (replaces a full 158-node Target recompute with ~16 node incremental)
      syncResult = syncCrossModelValues();
      log(`Incremental cross-model sync: ${syncResult.synced} values, ${syncResult.recomputed.length} nodes recomputed`);
    }

    return {
      target: targetResult,
      reference: refResult,
      totalComputed: (targetResult?.computedNodes || 0) + (refResult?.computedNodes || 0),
      totalDuration: (targetResult?.duration || 0) + (refResult?.duration || 0) + (syncResult?.duration || 0)
    };
  }

  /**
   * Sync cross-model values after Reference model changes
   * This is the incremental version of computeAllWithReference() Steps 3-4
   * Call this after any Reference model value change to keep compliance ratios current
   *
   * @returns {Object} - Result with sync and recompute details
   */
  function syncCrossModelValues() {
    if (!initialized) {
      error("Not initialized");
      return null;
    }

    const targetId = state.getActiveModelId();
    const refModelId = getRefModelId();

    if (!refModelId) {
      return { synced: 0, recomputed: [] };
    }

    // Step 1: Copy Reference outputs to Target's reference.* inputs
    const refMapping = getMergedRefOutputMapping();
    const changedInputs = {};
    let syncedCount = 0;

    for (const [refPath, targetInputPath] of Object.entries(refMapping)) {
      const refValue = state.getValueForModel(refModelId, refPath);
      const currentValue = state.getValueForModel(targetId, targetInputPath);

      // Only update if value changed
      if (refValue !== undefined && refValue !== null && refValue !== currentValue) {
        changedInputs[targetInputPath] = refValue;
        syncedCount++;
      }
    }

    if (syncedCount === 0) {
      return { synced: 0, recomputed: [] };
    }

    // Step 2: Use batch change to update and recompute affected nodes
    const result = engine.onBatchChange(changedInputs, targetId);

    log(`Cross-model sync: ${syncedCount} values synced, ${result.computedNodes.length} nodes recomputed`);

    return {
      synced: syncedCount,
      recomputed: result.computedNodes,
      duration: result.duration
    };
  }

  /**
   * Handle Reference model value change with automatic cross-model sync
   * Use this instead of engine.onValueChange() when changing Reference model values
   *
   * @param {string} fieldPath - The field that changed
   * @param {*} newValue - The new value
   * @returns {Object} - Combined result of Reference compute and Target sync
   */
  function onReferenceValueChange(fieldPath, newValue) {
    if (!initialized) {
      error("Not initialized");
      return null;
    }

    const refModelId = getRefModelId();
    if (!refModelId) {
      warn("No Reference model available");
      return null;
    }

    // Step 1: Update Reference model and recompute its downstream nodes
    const refResult = engine.onValueChange(fieldPath, newValue, refModelId);

    // Step 2: Sync cross-model values to Target
    const syncResult = syncCrossModelValues();

    return {
      referenceUpdate: refResult,
      crossModelSync: syncResult,
      totalRecomputed: (refResult?.computedNodes?.length || 0) + (syncResult?.recomputed?.length || 0)
    };
  }

  // ============================================================================
  // TARGETED RECOMPUTE (replaces calculateAll for user input changes)
  // ============================================================================

  /**
   * Lazy-cached map from legacy field IDs to semantic paths.
   * Built once from graph input nodes.
   */
  let _legacyToSemanticCache = null;

  function getLegacyToSemanticMap() {
    if (_legacyToSemanticCache) return _legacyToSemanticCache;
    _legacyToSemanticCache = new Map();
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    for (const semanticPath of inputIds) {
      const inputNode = graph.getInput(semanticPath);
      if (inputNode?.legacyId) {
        _legacyToSemanticCache.set(inputNode.legacyId, semanticPath);
      }
    }
    // Include computed nodes so editable-computed fields (e.g., CDD d_21) resolve
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];
    for (const semanticPath of nodeIds) {
      const node = graph.getNode(semanticPath);
      if (node?.legacyId && !_legacyToSemanticCache.has(node.legacyId)) {
        _legacyToSemanticCache.set(node.legacyId, semanticPath);
      }
    }
    return _legacyToSemanticCache;
  }

  /**
   * Targeted recompute for a single user input change.
   *
   * Unlike Calculator.calculateAll(), this does NOT call populateReferenceModel(),
   * which prevents cross-model contamination (target values leaking to reference
   * for non-G inputs that aren't in ReferenceValues.js).
   *
   * Routing:
   * - G-fields (geometry/climate): copies value to Reference model, computes BOTH
   * - Target C/A-fields: computes Target only
   * - Reference C/A-fields: computes Reference only
   * Always syncs cross-model values for compliance ratios, syncs to SM, stamps DOM.
   *
   * @param {string} legacyFieldId - SM field key (e.g., "d_59" or "ref_d_59")
   */
  function recomputeForInput(legacyFieldId) {
    if (!initialized) return;

    // Performance timing
    if (window.TEUI?.Clock?.markCalculationStart) {
      window.TEUI.Clock.markCalculationStart();
    }

    const SM = window.TEUI.StateManager;
    if (SM?.muteListeners) SM.muteListeners();

    try {
      // Determine which model was changed
      const isRef = legacyFieldId.startsWith("ref_");
      const baseId = isRef ? legacyFieldId.slice(4) : legacyFieldId;

      // Find the graph input
      const lookupMap = getLegacyToSemanticMap();
      const semanticPath = lookupMap.get(baseId);
      const inputNode = semanticPath ? graph.getInput(semanticPath) : null;

      const targetId = state.getActiveModelId();
      const refModelId = getRefModelId();

      // Editable-computed fields: user can type into a field whose value is
      // normally graph-computed (e.g., CDD is computed from province/city but
      // many cities have CDD=unavailable so users need to enter it manually).
      // Route the SM value to the graph override input before recomputation.
      const EDITABLE_COMPUTED = {
        "climate.cooling.degreedays": "climate.cooling.degreedays.userOverride"
      };

      // Location/timeframe changes clear CDD overrides (fresh lookup for new city)
      const CLEARS_OVERRIDES = {
        "climate.location.province": ["climate.cooling.degreedays.userOverride"],
        "climate.location.city": ["climate.cooling.degreedays.userOverride"],
        "climate.timeframe": ["climate.cooling.degreedays.userOverride"]
      };

      // The overrides' own StateManager keys (d_21o), written past the adapter so they do not
      // re-enter this handler
      const setOverrideKey = (key, value) => {
        if (SM?._original_setValue) SM._original_setValue.call(SM, key, value, "user-modified");
        else SM?.setValue(key, value, "user-modified");
      };
      const OVERRIDE_KEYS = { "climate.cooling.degreedays.userOverride": "d_21o" };

      if (semanticPath && CLEARS_OVERRIDES[semanticPath]) {
        for (const path of CLEARS_OVERRIDES[semanticPath]) {
          if (OVERRIDE_KEYS[path]) {
            setOverrideKey(OVERRIDE_KEYS[path], "");
            setOverrideKey("ref_" + OVERRIDE_KEYS[path], "");
          }
          state.setValueForModel(targetId, path, null);
          if (refModelId) state.setValueForModel(refModelId, path, null);
        }
      }

      if (semanticPath && EDITABLE_COMPUTED[semanticPath]) {
        const overridePath = EDITABLE_COMPUTED[semanticPath];
        const rawValue = SM?._original_getValue
          ? SM._original_getValue.call(SM, legacyFieldId)
          : SM?.getValue(legacyFieldId);
        // Empty/null means "clear override, use computed default"
        const overrideValue = (rawValue === "" || rawValue === null || rawValue === undefined) ? null : rawValue;
        // C-field: write override to the edited model only
        const editModelId = isRef ? refModelId : targetId;
        if (editModelId) {
          state.setValueForModel(editModelId, overridePath, overrideValue);
        }
        if (OVERRIDE_KEYS[overridePath]) setOverrideKey((isRef ? "ref_" : "") + OVERRIDE_KEYS[overridePath], overrideValue ?? "");
      }

      // Editable-computed overrides are C-class (per-model)
      const classification = EDITABLE_COMPUTED[semanticPath]
        ? "C"
        : (inputNode?.classification || "C");

      if (classification === "G" && refModelId) {
        // G-field: recompute both models (each keeps its own input values)
        engine.computeAllForModel(targetId);
        engine.computeAllForModel(refModelId);
        // Force wood offset = 0 for Reference model
        state.setValueForModel(refModelId, "forestry.annualOffset", 0);
        engine.onValueChange("forestry.annualOffset", 0, refModelId);
        syncCrossModelValues();
      } else if (isRef && refModelId) {
        // Reference C/A-field: recompute Reference only
        engine.computeAllForModel(refModelId);
        state.setValueForModel(refModelId, "forestry.annualOffset", 0);
        engine.onValueChange("forestry.annualOffset", 0, refModelId);
        syncCrossModelValues();
      } else {
        // Target C/A-field: recompute Target only + cross-model sync
        engine.computeAllForModel(targetId);
        if (refModelId) {
          syncCrossModelValues();
        }
      }

      if (window.TEUI?.Clock?.markCalculationEnd) {
        window.TEUI.Clock.markCalculationEnd();
      }

      // Sync to StateManager and stamp DOM
      syncToStateManager();
      if (refModelId) {
        syncReferenceToStateManager();
      }

      if (window.TEUI.DOMBridge?.stampAll) {
        window.TEUI.DOMBridge.stampAll();
      }

      // Section supplementary display stamps
      const modules = window.TEUI.SectionModules || {};
      for (const key of ["sect01", "sect03", "sect12", "sect13", "sect16", "sect21"]) {
        if (modules[key]?.postStamp) modules[key].postStamp();
      }

      // Diagnostic: log S01 key values to trace n=1 vs n=2 staleness
      const h10 = state.getValueForModel(targetId, "keyValues.target.teui");
      const e6 = state.getValueForModel(targetId, "keyValues.reference.teui");
      const m10 = state.getValueForModel(targetId, "keyValues.teui.percent");
      console.log(`[recomputeForInput] ${legacyFieldId} (class=${classification}) → h_10=${h10}, e_6=${e6}, m_10=${m10}`);
    } finally {
      if (SM?.unmuteListeners) SM.unmuteListeners();
    }
  }

  /**
   * Sync Reference computed values back to StateManager
   */
  function syncReferenceToStateManager() {
    const StateManager = window.TEUI.StateManager;

    if (!StateManager) {
      warn("StateManager not available for Reference sync");
      return 0;
    }

    // NOTE: Caller (Calculator.calculateAll) is responsible for muting SM listeners.
    // Do NOT mute/unmute here — nested boolean mute breaks the caller's mute scope.

    const refModelId = getRefModelId();
    if (!refModelId) {
      return 0;
    }

    let syncCount = 0;

    // Sync computed nodes
    const nodeIds = graph.getAllNodeIds ? graph.getAllNodeIds() : [];

    for (const semanticPath of nodeIds) {
      const node = graph.getNode(semanticPath);
      const legacyId = node?.legacyId;

      if (legacyId) {
        const value = state.getValueForModel(refModelId, semanticPath);
        if (value !== undefined && value !== null) {
          // Don't add ref_ prefix if legacyId already starts with ref_
          const refLegacyId = legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId;
          StateManager.setValue(refLegacyId, value, "calculated");
          syncCount++;
        }
      }
    }

    // Sync input values (skip reference.* bridge inputs — those are Target model
    // concepts whose computed equivalents were already synced in the computed nodes loop).
    // Unlike syncToStateManager(), ref_ inputs DO need syncing because they may not
    // already be in StateManager (reference model inputs come from CSV, not user setValue).
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];

    for (const semanticPath of inputIds) {
      // Skip reference.* inputs — they bridge Reference outputs to Target inputs
      // and would overwrite freshly computed values with stale CSV data
      if (semanticPath.startsWith("reference.")) continue;

      const inputNode = graph.getInput(semanticPath);
      const legacyId = inputNode?.legacyId;

      if (legacyId) {
        const value = state.getValueForModel(refModelId, semanticPath);
        if (value !== undefined && value !== null) {
          // Don't add ref_ prefix if legacyId already starts with ref_
          const refLegacyId = legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId;
          StateManager.setValue(refLegacyId, value, "calculated");
          syncCount++;
        }
      }
    }

    log(`Synced ${syncCount} Reference values to StateManager`);

    return syncCount;
  }

  // ============================================================================
  // DIAGNOSTICS
  // ============================================================================

  /**
   * Validate that SM input values match graph state values.
   * Call from browser console: TEUI.ComputationIntegration.validateGraphInputs()
   *
   * Reports mismatches where SM has a value but graph state differs.
   * This catches issues where the LegacyAdapter fails to dual-write,
   * or where values are written to the wrong model.
   */
  function validateGraphInputs() {
    if (!initialized) { error("Not initialized"); return; }
    const SM = window.TEUI.StateManager;
    if (!SM) { error("No StateManager"); return; }

    const targetId = state.getActiveModelId();
    const refModelId = getRefModelId();
    const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
    const mismatches = [];

    for (const semanticPath of inputIds) {
      const inputNode = graph.getInput(semanticPath);
      const legacyId = inputNode?.legacyId;
      if (!legacyId) continue;

      // Target model
      const smVal = SM.getValue(legacyId);
      const graphVal = state.getValueForModel(targetId, semanticPath);
      if (smVal !== undefined && smVal !== null && smVal !== "" && String(smVal) !== String(graphVal)) {
        mismatches.push({ legacyId, semanticPath, smVal, graphVal, model: "target" });
      }

      // Reference model — skip reference.* paths since those are target-model
      // compliance inputs, not reference-model values. The reference model stores
      // values under base paths (e.g. transmissionLoss.roof.rsi, not reference.transmissionLoss.roof.rsi).
      if (refModelId && !semanticPath.startsWith("reference.")) {
        const refLegacyId = legacyId.startsWith("ref_") ? legacyId : "ref_" + legacyId;
        const refSmVal = SM.getValue(refLegacyId);
        const refGraphVal = state.getValueForModel(refModelId, semanticPath);
        if (refSmVal !== undefined && refSmVal !== null && refSmVal !== "" && String(refSmVal) !== String(refGraphVal)) {
          mismatches.push({ legacyId: refLegacyId, semanticPath, smVal: refSmVal, graphVal: refGraphVal, model: "reference" });
        }
      }
    }

    if (mismatches.length === 0) {
      console.log("%c[Validate] All SM inputs match graph state", "color: green; font-weight: bold");
    } else {
      console.warn(`[Validate] ${mismatches.length} SM↔Graph mismatches:`);
      console.table(mismatches);
    }
    return mismatches;
  }

  /**
   * Trace the full h_10 (Target TEUI) dependency chain.
   * Call from browser console: TEUI.ComputationIntegration.traceH10()
   *
   * Shows the current value of every node in the chain from h_15 → h_10,
   * reading from both graph state and SM for comparison.
   */
  function traceH10() {
    if (!initialized) { error("Not initialized"); return; }
    const SM = window.TEUI.StateManager;
    const targetId = state.getActiveModelId();

    // Key fields in the h_10 dependency chain
    const chain = [
      // Inputs
      { id: "building.conditionedFloorArea", legacy: "h_15", type: "INPUT" },
      { id: "internal.plugLoadDensity", legacy: "d_65", type: "COMPUTED" },
      { id: "internal.lightingDensity", legacy: "d_66", type: "INPUT" },
      { id: "internal.equipmentDensity", legacy: "d_67", type: "COMPUTED" },
      { id: "mechanical.heating.systemType", legacy: "d_113", type: "INPUT" },
      // Computed: internal gains
      { id: "internal.plugLoads.annual", legacy: "h_65", type: "COMPUTED" },
      { id: "internal.lighting.annual", legacy: "h_66", type: "COMPUTED" },
      { id: "internal.equipment.annual", legacy: "h_67", type: "COMPUTED" },
      { id: "energy.plugLoads.subtotal", legacy: "h_70", type: "COMPUTED" },
      // Computed: energy chain
      { id: "energy.total.targeted", legacy: "d_135", type: "COMPUTED" },
      { id: "energy.total.all", legacy: "d_136", type: "COMPUTED" },
      { id: "energy.teui", legacy: "h_136", type: "COMPUTED" },
      // Computed: emissions chain
      { id: "energy.target.electricity", legacy: "j_27", type: "COMPUTED" },
      { id: "energy.target.total", legacy: "j_32", type: "COMPUTED" },
      // Final: key value
      { id: "keyValues.target.teui", legacy: "h_10", type: "COMPUTED" },
      { id: "keyValues.reference.teui", legacy: "e_10", type: "COMPUTED" },
    ];

    const rows = chain.map(item => {
      const graphVal = state.getValueForModel(targetId, item.id);
      const smVal = SM?.getValue(item.legacy);
      const match = String(graphVal) === String(smVal) ? "✓" : "✗";
      return {
        field: item.legacy,
        semantic: item.id,
        type: item.type,
        graphValue: graphVal,
        smValue: smVal,
        match
      };
    });

    console.log("%c[TraceH10] h_10 dependency chain:", "color: #0af; font-weight: bold");
    console.table(rows);

    // Also compute h_10 manually for verification
    const j32 = parseFloat(state.getValueForModel(targetId, "energy.target.total")) || 0;
    const h15raw = state.getValueForModel(targetId, "building.conditionedFloorArea");
    const h15 = parseFloat(String(h15raw).replace(/,/g, "")) || 1;
    const expected = h15 > 0 ? Math.round((j32 / h15) * 10) / 10 : 0;
    const actual = state.getValueForModel(targetId, "keyValues.target.teui");
    console.log(`[TraceH10] Manual: ${j32} / ${h15} = ${expected}, graph says: ${actual}`);

    return rows;
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.ComputationIntegration = {
    initialize,
    isInitialized,

    // Core access
    getGraph,
    getState,
    getEngine,

    // Adapter control
    enableAdapter,
    disableAdapter,

    // Parallel mode
    onLegacyValueChange,

    // State management
    syncFromStateManager,
    resetGraphState,
    clearEditableComputedOverrides,

    // Sync TO StateManager (call after computeAll when bypassing legacy)
    syncToStateManager,

    // Reference model support
    getRefModelId,
    populateReferenceModel,
    syncReferenceToStateManager,

    // Cross-model sync (for incremental Reference model changes)
    syncCrossModelValues,
    onReferenceValueChange,

    // Targeted recompute (replaces calculateAll for user input changes)
    recomputeForInput,

    // Computation
    computeAll,
    computeAllWithReference,

    // Configuration
    getConfig,
    setConfig,

    // Debug
    getStats,
    debug,
    validateGraphInputs,
    traceH10
  };

  log("Module loaded");
})();
