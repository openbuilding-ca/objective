/**
 * MultiModelEngine.js - Incremental Computation Across Multiple Models
 *
 * Part of the Multi-Model Architecture refactoring (Phase 3, Task 3.3)
 * See: docs/REFACTORING_PLAN.md
 *
 * Coordinates incremental computation across multiple models:
 * - G-field changes: Recompute affected nodes in ALL models
 * - C/A-field changes: Recompute affected nodes in ONE model only
 *
 * Integrates:
 * - MultiModelState for state management
 * - ComputationGraph for dependency tracking
 * - IncrementalEngine for efficient recomputation
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // ============================================================================
  // MULTI-MODEL ENGINE FACTORY
  // ============================================================================

  /**
   * Create a multi-model computation engine
   * @param {Object} options
   * @param {Object} options.state - MultiModelState instance
   * @param {Object} options.graph - ComputationGraph instance
   * @returns {MultiModelEngine}
   */
  function createMultiModelEngine(options = {}) {
    const state = options.state;
    const graph = options.graph;

    if (!state) {
      throw new Error("MultiModelState required");
    }

    if (!graph) {
      throw new Error("ComputationGraph required");
    }

    // Track computation statistics
    let stats = {
      totalComputations: 0,
      computationsByModel: new Map(),
      lastComputeTime: 0
    };

    // ========================================================================
    // HELPER FUNCTIONS
    // ========================================================================

    /**
     * Gather inputs for a compute function from state
     * @param {string[]} dependencies
     * @param {string} modelId
     * @returns {Object}
     */
    function gatherInputs(dependencies, modelId) {
      const inputs = {};
      for (const dep of dependencies) {
        inputs[dep] = state.getValueForModel(modelId, dep);
      }
      return inputs;
    }

    /**
     * Compute a single node for a specific model
     * @param {string} nodeId
     * @param {string} modelId
     * @returns {*} - Computed value
     */
    function computeNode(nodeId, modelId) {
      const node = graph.getNode(nodeId);
      if (!node || !node.compute) {
        console.warn(`[MultiModelEngine] Node not found or not computable: ${nodeId}`);
        return undefined;
      }

      const inputs = gatherInputs(node.dependencies, modelId);
      // An input a method could not give (BASESIMP, AIM-2, a city without climate data) makes every node
      // that reads it Unavailable too: never a 0 passed on as a figure (Andy 2026-11-19: Hemmingford's
      // TEUI fell 53.8 -> 1.6 when BASESIMP could not run, read as zero ground loss by 24 nodes down to
      // S01). A node that handles the state itself says so with acceptsUnavailable: the BASESIMP and AIM-2 method nodes,
      // whose readers outside F280 Mode never look at them (Mark, #134), return an { error } instead.
      if (!node.acceptsUnavailable && node.dependencies.some(d => inputs[d] === "Unavailable")) {
        return "Unavailable";
      }
      try {
        return node.compute(inputs);
      } catch (e) {
        console.error(`[MultiModelEngine] Error computing ${nodeId}:`, e);
        return undefined;
      }
    }

    /**
     * Update statistics
     * @param {string} modelId
     * @param {number} nodeCount
     */
    function updateStats(modelId, nodeCount) {
      stats.totalComputations += nodeCount;
      const current = stats.computationsByModel.get(modelId) || 0;
      stats.computationsByModel.set(modelId, current + nodeCount);
    }

    // ========================================================================
    // PUBLIC API
    // ========================================================================

    return {
      // ======================================================================
      // SINGLE VALUE CHANGE
      // ======================================================================

      /**
       * Handle a value change and recompute affected nodes
       * @param {string} fieldPath - The field that changed
       * @param {*} newValue - The new value
       * @param {string} [modelId] - Model ID (defaults to active model)
       * @returns {Object} - Result with affected models and computed values
       */
      onValueChange(fieldPath, newValue, modelId) {
        const startTime = performance.now();
        const targetModelId = modelId || state.getActiveModelId();

        // Set the value and get affected models
        const affectedModels = state.setValueForModel(targetModelId, fieldPath, newValue);

        // Get downstream nodes that need recomputation
        const downstream = graph.getDownstream(fieldPath);

        if (downstream.length === 0) {
          return {
            fieldPath,
            affectedModels,
            computedNodes: [],
            duration: performance.now() - startTime
          };
        }

        // Get topologically sorted order for computation
        const computeOrder = graph.topologicalSort(downstream);

        // Track computed values
        const computedValues = new Map();

        // Recompute for each affected model
        for (const affectedModelId of affectedModels) {
          for (const nodeId of computeOrder) {
            const value = computeNode(nodeId, affectedModelId);
            if (value !== undefined) {
              state.setValueForModel(affectedModelId, nodeId, value);

              if (!computedValues.has(nodeId)) {
                computedValues.set(nodeId, new Map());
              }
              computedValues.get(nodeId).set(affectedModelId, value);
            }
          }
          updateStats(affectedModelId, computeOrder.length);
        }

        stats.lastComputeTime = performance.now() - startTime;

        return {
          fieldPath,
          affectedModels,
          computedNodes: computeOrder,
          computedValues,
          duration: stats.lastComputeTime
        };
      },

      // ======================================================================
      // BATCH CHANGES
      // ======================================================================

      /**
       * Handle multiple value changes at once
       * @param {Object|Map} changes - Map of fieldPath -> newValue
       * @param {string} [modelId] - Model ID (defaults to active model)
       * @returns {Object} - Result with affected models and computed values
       */
      onBatchChange(changes, modelId) {
        const startTime = performance.now();
        const targetModelId = modelId || state.getActiveModelId();

        // Collect all affected models and downstream nodes
        const allAffected = new Set();
        const allDownstream = new Set();

        const entries = changes instanceof Map
          ? Array.from(changes.entries())
          : Object.entries(changes);

        // Set all values and collect affected info
        for (const [fieldPath, value] of entries) {
          const affected = state.setValueForModel(targetModelId, fieldPath, value);
          affected.forEach(id => allAffected.add(id));

          const downstream = graph.getDownstream(fieldPath);
          downstream.forEach(id => allDownstream.add(id));
        }

        if (allDownstream.size === 0) {
          return {
            changedFields: entries.length,
            affectedModels: Array.from(allAffected),
            computedNodes: [],
            duration: performance.now() - startTime
          };
        }

        // Get topologically sorted order
        const computeOrder = graph.topologicalSort(Array.from(allDownstream));

        // Recompute for each affected model
        const computedValues = new Map();

        for (const affectedModelId of allAffected) {
          for (const nodeId of computeOrder) {
            const value = computeNode(nodeId, affectedModelId);
            if (value !== undefined) {
              state.setValueForModel(affectedModelId, nodeId, value);

              if (!computedValues.has(nodeId)) {
                computedValues.set(nodeId, new Map());
              }
              computedValues.get(nodeId).set(affectedModelId, value);
            }
          }
          updateStats(affectedModelId, computeOrder.length);
        }

        stats.lastComputeTime = performance.now() - startTime;

        return {
          changedFields: entries.length,
          affectedModels: Array.from(allAffected),
          computedNodes: computeOrder,
          computedValues,
          duration: stats.lastComputeTime
        };
      },

      // ======================================================================
      // FULL COMPUTATION
      // ======================================================================

      /**
       * Compute all nodes for a specific model
       * Uses cached topological order for efficiency
       * @param {string} modelId
       * @returns {Object} - Result with computed values
       */
      computeAllForModel(modelId) {
        const startTime = performance.now();

        // Use cached topological order (avoids DFS on every call)
        const computeOrder = graph.getFullComputationOrder();

        const computedValues = new Map();

        for (const nodeId of computeOrder) {
          const value = computeNode(nodeId, modelId);
          if (value !== undefined) {
            state.setValueForModel(modelId, nodeId, value);
            computedValues.set(nodeId, value);
          }
        }

        updateStats(modelId, computeOrder.length);
        stats.lastComputeTime = performance.now() - startTime;

        return {
          modelId,
          computedNodes: computeOrder.length,
          computedValues,
          duration: stats.lastComputeTime
        };
      },

      /**
       * Compute all nodes for all models
       * @returns {Object} - Result with per-model computed values
       */
      computeAll() {
        const startTime = performance.now();
        const modelIds = state.getModelIds();
        const results = new Map();

        for (const modelId of modelIds) {
          results.set(modelId, this.computeAllForModel(modelId));
        }

        return {
          modelsComputed: modelIds.length,
          results,
          totalDuration: performance.now() - startTime
        };
      },

      // ======================================================================
      // CONVERGENCE HANDLING
      // ======================================================================

      /**
       * Run convergence iterations for nodes that require it
       * @param {string} modelId
       * @param {number} [maxIterations=5]
       * @param {number} [tolerance=0.001]
       * @returns {Object} - Convergence result
       */
      runConvergence(modelId, maxIterations = 5, tolerance = 0.001) {
        const startTime = performance.now();
        const convergenceGroups = graph.findConvergenceGroups();

        if (convergenceGroups.length === 0) {
          return {
            modelId,
            converged: true,
            iterations: 0,
            duration: performance.now() - startTime
          };
        }

        let iterations = 0;
        let converged = false;

        while (iterations < maxIterations && !converged) {
          const prevValues = new Map();

          // Store current values
          for (const group of convergenceGroups) {
            for (const nodeId of group) {
              prevValues.set(nodeId, state.getValueForModel(modelId, nodeId));
            }
          }

          // Recompute convergence groups
          for (const group of convergenceGroups) {
            const computeOrder = graph.topologicalSort(group);
            for (const nodeId of computeOrder) {
              const value = computeNode(nodeId, modelId);
              if (value !== undefined) {
                state.setValueForModel(modelId, nodeId, value);
              }
            }
          }

          // Check convergence
          converged = true;
          for (const group of convergenceGroups) {
            for (const nodeId of group) {
              const prev = prevValues.get(nodeId);
              const curr = state.getValueForModel(modelId, nodeId);

              if (typeof prev === "number" && typeof curr === "number") {
                if (Math.abs(prev - curr) > tolerance) {
                  converged = false;
                  break;
                }
              } else if (prev !== curr) {
                converged = false;
                break;
              }
            }
            if (!converged) break;
          }

          iterations++;
        }

        return {
          modelId,
          converged,
          iterations,
          duration: performance.now() - startTime
        };
      },

      // ======================================================================
      // ANALYSIS
      // ======================================================================

      /**
       * Analyze impact of a potential change
       * @param {string} fieldPath
       * @returns {Object} - Impact analysis
       */
      analyzeImpact(fieldPath) {
        const isShared = state.isSharedField(fieldPath);
        const downstream = graph.getDownstream(fieldPath);
        const affectedModels = isShared
          ? state.getModelIds()
          : [state.getActiveModelId()];

        return {
          fieldPath,
          isShared,
          affectedModels,
          downstreamNodes: downstream,
          estimatedComputations: downstream.length * affectedModels.length
        };
      },

      /**
       * Compare values between two models
       * @param {string} modelId1
       * @param {string} modelId2
       * @param {string[]} [fieldPaths] - Specific fields to compare (all if not specified)
       * @returns {Object} - Comparison result
       */
      compareModels(modelId1, modelId2, fieldPaths) {
        const fields = fieldPaths || graph.getAllNodeIds();
        const differences = [];
        const same = [];

        for (const fieldPath of fields) {
          const val1 = state.getValueForModel(modelId1, fieldPath);
          const val2 = state.getValueForModel(modelId2, fieldPath);

          if (val1 !== val2) {
            differences.push({
              fieldPath,
              model1: val1,
              model2: val2
            });
          } else {
            same.push(fieldPath);
          }
        }

        return {
          modelId1,
          modelId2,
          totalFields: fields.length,
          differences,
          sameCount: same.length,
          diffCount: differences.length
        };
      },

      // ======================================================================
      // STATISTICS
      // ======================================================================

      /**
       * Get computation statistics
       * @returns {Object}
       */
      getStats() {
        return {
          ...stats,
          computationsByModel: Object.fromEntries(stats.computationsByModel)
        };
      },

      /**
       * Reset statistics
       */
      resetStats() {
        stats = {
          totalComputations: 0,
          computationsByModel: new Map(),
          lastComputeTime: 0
        };
      },

      // ======================================================================
      // DEBUG
      // ======================================================================

      /**
       * Debug output
       */
      debug() {
        console.group("[MultiModelEngine] Debug");
        console.log("Stats:", this.getStats());
        console.log("State:", state.getStats());
        console.log("Graph:", graph.getStats());
        console.groupEnd();
      }
    };
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.MultiModelEngine = {
    create: createMultiModelEngine
  };

  console.log("[MultiModelEngine] Module loaded");
})();
