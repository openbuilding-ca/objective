/**
 * LegacyAdapter.js - Bridge Between Legacy StateManager and New MultiModelEngine
 *
 * Part of the Multi-Model Architecture refactoring (Phase 4, Task 4.1)
 * See: docs/REFACTORING_PLAN.md
 *
 * Allows gradual migration by making the new computation system accessible
 * via the existing StateManager API. Existing code continues to work while
 * gaining incremental computation benefits.
 *
 * Key translations:
 * - Legacy field IDs (d_85, ref_d_85) ↔ Semantic paths (envelope.roof.rsi)
 * - ref_ prefix → Reference model access
 * - StateManager.getValue/setValue → MultiModelState/Engine
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // LEGACY ADAPTER FACTORY
  // ============================================================================

  /**
   * Create a legacy adapter that bridges old API to new system
   * @param {Object} options
   * @param {Object} options.state - MultiModelState instance
   * @param {Object} options.engine - MultiModelEngine instance
   * @param {Object} [options.graph] - ComputationGraph for ID translation
   * @param {Object} [options.registry] - FieldRegistry for ID translation (fallback)
   * @returns {LegacyAdapter}
   */
  function createLegacyAdapter(options = {}) {
    const state = options.state;
    const engine = options.engine;
    const graph = options.graph;
    const registry = options.registry || window.TEUI.FieldRegistry;

    if (!state) {
      throw new Error("MultiModelState required");
    }

    if (!engine) {
      throw new Error("MultiModelEngine required");
    }

    // Build lookup maps from graph input nodes
    const legacyToSemantic = new Map();
    const semanticToLegacy = new Map();

    if (graph) {
      const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        if (inputNode?.legacyId) {
          legacyToSemantic.set(inputNode.legacyId, semanticPath);
          semanticToLegacy.set(semanticPath, inputNode.legacyId);
        }
      }
      console.log(`[LegacyAdapter] Built translation maps: ${legacyToSemantic.size} mappings`);
    }

    // Store original StateManager for restoration
    let originalStateManager = null;
    let isInstalled = false;

    // Track value changes for batching
    let pendingChanges = new Map();
    let batchTimeout = null;
    const BATCH_DELAY = 10; // ms to wait for batching

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * Parse a field ID to extract ref prefix and base ID
     * @param {string} fieldId
     * @returns {{isRef: boolean, baseId: string}}
     */
    function parseFieldId(fieldId) {
      const isRef = fieldId.startsWith("ref_");
      const baseId = isRef ? fieldId.slice(4) : fieldId;
      return { isRef, baseId };
    }

    /**
     * Convert legacy field ID to semantic path
     * @param {string} fieldId - Legacy ID (d_85) or semantic path
     * @returns {string|null}
     */
    function toSemanticPath(fieldId) {
      if (!fieldId) return null;

      // Already a semantic path?
      if (fieldId.includes(".")) {
        return fieldId;
      }

      // Use graph-based translation (don't use registry - causes recursion)
      if (legacyToSemantic.has(fieldId)) {
        return legacyToSemantic.get(fieldId);
      }

      // Return null if not found (will trigger fallback to original StateManager)
      return null;
    }

    /**
     * Convert semantic path to legacy field ID
     * @param {string} semanticPath
     * @returns {string|null}
     */
    function toLegacyId(semanticPath) {
      if (!semanticPath) return null;

      // Already a legacy ID?
      if (!semanticPath.includes(".")) {
        return semanticPath;
      }

      // Use graph-based translation (don't use registry - causes recursion)
      if (semanticToLegacy.has(semanticPath)) {
        return semanticToLegacy.get(semanticPath);
      }

      return null;
    }

    /**
     * Get the reference model ID
     * @returns {string|null}
     */
    function getReferenceModelId() {
      const models = state.getAllModels();
      const refModel = models.find(m => m.modelType === "reference");
      return refModel?.id || null;
    }

    /**
     * Get the target (active) model ID
     * @returns {string|null}
     */
    function getTargetModelId() {
      return state.getActiveModelId();
    }

    /**
     * Flush pending changes through the engine
     */
    function flushPendingChanges() {
      if (pendingChanges.size === 0) return;

      const changes = pendingChanges;
      pendingChanges = new Map();
      batchTimeout = null;

      // Group by model
      const targetChanges = {};
      const refChanges = {};

      for (const [key, value] of changes) {
        const { isRef, semanticPath } = key;
        if (isRef) {
          refChanges[semanticPath] = value;
        } else {
          targetChanges[semanticPath] = value;
        }
      }

      // Apply target changes
      if (Object.keys(targetChanges).length > 0) {
        engine.onBatchChange(targetChanges, getTargetModelId());
      }

      // Apply reference changes
      const refModelId = getReferenceModelId();
      if (refModelId && Object.keys(refChanges).length > 0) {
        engine.onBatchChange(refChanges, refModelId);
      }
    }

    /**
     * Schedule a change for batching
     * @param {boolean} isRef
     * @param {string} semanticPath
     * @param {*} value
     */
    function scheduleChange(isRef, semanticPath, value) {
      const key = { isRef, semanticPath };
      pendingChanges.set(JSON.stringify(key), { isRef, semanticPath, value });

      // Reset batch timer
      if (batchTimeout) {
        clearTimeout(batchTimeout);
      }
      batchTimeout = setTimeout(flushPendingChanges, BATCH_DELAY);
    }

    // ========================================================================
    // PUBLIC API (StateManager-compatible)
    // ========================================================================

    const adapter = {
      // ======================================================================
      // VALUE ACCESS (StateManager.getValue compatible)
      // ======================================================================

      /**
       * Get value for a field
       * Compatible with StateManager.getValue(fieldId)
       * @param {string} fieldId - Legacy ID (d_85, ref_d_85) or semantic path
       * @returns {*}
       */
      getValue(fieldId) {
        const { isRef, baseId } = parseFieldId(fieldId);
        const semanticPath = toSemanticPath(baseId);

        // Try new system first for known semantic paths
        let value;
        if (semanticPath && semanticPath.includes(".")) {
          if (isRef) {
            const refModelId = getReferenceModelId();
            if (refModelId) {
              value = state.getValueForModel(refModelId, semanticPath);
            }
          } else {
            value = state.getValue(semanticPath);
          }
        }

        // Fall back to original StateManager if new system returns undefined/null
        if (value === undefined || value === null) {
          if (originalStateManager?._original_getValue) {
            return originalStateManager._original_getValue.call(originalStateManager, fieldId);
          }
        }

        return value;
      },

      /**
       * Get values for multiple fields
       * @param {string[]} fieldIds
       * @returns {Object}
       */
      getValues(fieldIds) {
        const result = {};
        for (const fieldId of fieldIds) {
          result[fieldId] = this.getValue(fieldId);
        }
        return result;
      },

      // ======================================================================
      // VALUE UPDATES (StateManager.setValue compatible)
      // ======================================================================

      /**
       * Set value for a field
       * Compatible with StateManager.setValue(fieldId, value, state)
       * @param {string} fieldId - Legacy ID or semantic path
       * @param {*} value
       * @param {string} [valueState] - Ignored (legacy parameter)
       */
      setValue(fieldId, value, valueState) {
        const { isRef, baseId } = parseFieldId(fieldId);
        const semanticPath = toSemanticPath(baseId);

        if (!semanticPath) {
          // Fall back to original StateManager if available
          if (originalStateManager?._original_setValue) {
            return originalStateManager._original_setValue.call(originalStateManager, fieldId, value, valueState);
          }
          console.warn(`[LegacyAdapter] Unknown field: ${fieldId}`);
          return;
        }

        // DUAL-WRITE: Write to MultiModelState (primary) via batching
        scheduleChange(isRef, semanticPath, value);

        // DUAL-WRITE: Also write to original StateManager (for backward compatibility)
        // This ensures code reading from StateManager gets updated values during transition
        if (originalStateManager?._original_setValue) {
          originalStateManager._original_setValue.call(originalStateManager, fieldId, value, valueState);
        }
      },

      /**
       * Set value immediately without batching
       * @param {string} fieldId
       * @param {*} value
       */
      setValueImmediate(fieldId, value) {
        const { isRef, baseId } = parseFieldId(fieldId);
        const semanticPath = toSemanticPath(baseId);

        if (!semanticPath) {
          // Fall back to original StateManager if available
          if (originalStateManager?._original_setValue) {
            return originalStateManager._original_setValue.call(originalStateManager, fieldId, value);
          }
          console.warn(`[LegacyAdapter] Unknown field: ${fieldId}`);
          return;
        }

        // DUAL-WRITE: Write to MultiModelState (primary)
        const modelId = isRef ? getReferenceModelId() : getTargetModelId();
        if (modelId) {
          engine.onValueChange(semanticPath, value, modelId);
        }

        // DUAL-WRITE: Also write to original StateManager (for backward compatibility)
        if (originalStateManager?._original_setValue) {
          originalStateManager._original_setValue.call(originalStateManager, fieldId, value);
        }
      },

      /**
       * Set multiple values at once
       * @param {Object} values - Map of fieldId -> value
       */
      setValues(values) {
        for (const [fieldId, value] of Object.entries(values)) {
          this.setValue(fieldId, value);
        }
        // Flush immediately for batch operations
        flushPendingChanges();
      },

      // ======================================================================
      // MODEL ACCESS
      // ======================================================================

      /**
       * Get active model ID
       * @returns {string}
       */
      getActiveModelId() {
        return state.getActiveModelId();
      },

      /**
       * Get reference model ID
       * @returns {string|null}
       */
      getReferenceModelId() {
        return getReferenceModelId();
      },

      /**
       * Check if in reference mode
       * @returns {boolean}
       */
      isReferenceMode() {
        const activeModel = state.getActiveModel();
        return activeModel?.modelType === "reference";
      },

      // ======================================================================
      // FIELD TRANSLATION
      // ======================================================================

      /**
       * Convert legacy ID to semantic path
       * @param {string} legacyId
       * @returns {string|null}
       */
      toSemanticPath,

      /**
       * Convert semantic path to legacy ID
       * @param {string} semanticPath
       * @returns {string|null}
       */
      toLegacyId,

      // ======================================================================
      // INSTALLATION
      // ======================================================================

      /**
       * Install adapter, replacing StateManager methods
       */
      install() {
        if (isInstalled) {
          console.warn("[LegacyAdapter] Already installed");
          return;
        }

        originalStateManager = window.TEUI?.StateManager;

        if (originalStateManager) {
          // Store original methods
          originalStateManager._original_getValue = originalStateManager.getValue;
          originalStateManager._original_setValue = originalStateManager.setValue;

          // Replace with adapter methods
          originalStateManager.getValue = this.getValue.bind(this);
          originalStateManager.setValue = this.setValue.bind(this);

          isInstalled = true;
          console.log("[LegacyAdapter] Installed - StateManager methods replaced");
        } else {
          console.warn("[LegacyAdapter] StateManager not found, creating standalone");
          window.TEUI = window.TEUI || {};
          window.TEUI.StateManager = {
            getValue: this.getValue.bind(this),
            setValue: this.setValue.bind(this)
          };
          isInstalled = true;
        }
      },

      /**
       * Uninstall adapter, restoring original StateManager
       */
      uninstall() {
        if (!isInstalled) {
          console.warn("[LegacyAdapter] Not installed");
          return;
        }

        if (originalStateManager) {
          // Restore original methods
          if (originalStateManager._original_getValue) {
            originalStateManager.getValue = originalStateManager._original_getValue;
            delete originalStateManager._original_getValue;
          }
          if (originalStateManager._original_setValue) {
            originalStateManager.setValue = originalStateManager._original_setValue;
            delete originalStateManager._original_setValue;
          }
        }

        isInstalled = false;
        console.log("[LegacyAdapter] Uninstalled - Original StateManager restored");
      },

      /**
       * Check if adapter is installed
       * @returns {boolean}
       */
      isInstalled() {
        return isInstalled;
      },

      // ======================================================================
      // DEBUGGING
      // ======================================================================

      /**
       * Debug output
       */
      debug() {
        console.group("[LegacyAdapter] Debug");
        console.log("Installed:", isInstalled);
        console.log("Pending changes:", pendingChanges.size);
        console.log("Target model:", getTargetModelId());
        console.log("Reference model:", getReferenceModelId());
        console.log("State stats:", state.getStats());
        console.groupEnd();
      },

      // ======================================================================
      // DIRECT ACCESS (for advanced usage)
      // ======================================================================

      /**
       * Get direct access to MultiModelState
       * @returns {MultiModelState}
       */
      getState() {
        return state;
      },

      /**
       * Get direct access to MultiModelEngine
       * @returns {MultiModelEngine}
       */
      getEngine() {
        return engine;
      },

      /**
       * Get direct access to FieldRegistry
       * @returns {FieldRegistry}
       */
      getRegistry() {
        return registry;
      }
    };

    return adapter;
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.LegacyAdapter = {
    create: createLegacyAdapter
  };

  console.log("[LegacyAdapter] Module loaded");
})();
