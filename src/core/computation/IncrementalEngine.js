/**
 * IncrementalEngine.js - Core Incremental Computation Engine
 *
 * Part of the Multi-Model Architecture refactoring (Phase 1, Task 1.3)
 * See: docs/REFACTORING_PLAN.md
 *
 * This module performs incremental computation on the dependency graph.
 * Key principle: Only recompute nodes affected by a change, not the entire model.
 *
 * When a value changes:
 * 1. Find all downstream (affected) nodes
 * 2. Sort them in topological order
 * 3. Recompute only those nodes
 * 4. Handle convergence loops if needed
 */
(function () {
  "use strict";

  // Ensure TEUI namespace exists
  window.TEUI = window.TEUI || {};

  /**
   * Create an incremental computation engine
   * @param {ComputationGraph} graph - The computation graph
   * @returns {IncrementalEngine}
   */
  function createIncrementalEngine(graph) {
    /** @type {Map<string, *>} Current state (values of all nodes) */
    let currentState = new Map();

    /** @type {number} Count of nodes computed in last operation */
    let lastComputeCount = 0;

    /** @type {number} Time taken for last computation in ms */
    let lastComputeTime = 0;

    /** @type {number} Total computations since initialization */
    let totalComputations = 0;

    /** @type {Object} Default convergence settings */
    const convergenceDefaults = {
      maxIterations: 10,
      tolerance: 0.001
    };

    return {
      // ========================================================================
      // STATE ACCESS
      // ========================================================================

      /**
       * Get current value of a node
       * @param {string} nodeId
       * @returns {*}
       */
      getValue(nodeId) {
        return currentState.get(nodeId);
      },

      /**
       * Get all current values as a new Map
       * @returns {Map<string, *>}
       */
      getState() {
        return new Map(currentState);
      },

      /**
       * Set the entire state (for initialization or import)
       * @param {Map<string, *>} state
       */
      setState(state) {
        currentState = new Map(state);
      },

      /**
       * Check if a node has a value
       * @param {string} nodeId
       * @returns {boolean}
       */
      hasValue(nodeId) {
        return currentState.has(nodeId);
      },

      /**
       * Get multiple values at once
       * @param {string[]} nodeIds
       * @returns {Object<string, *>}
       */
      getValues(nodeIds) {
        const result = {};
        for (const id of nodeIds) {
          result[id] = currentState.get(id);
        }
        return result;
      },

      // ========================================================================
      // CORE COMPUTATION
      // ========================================================================

      /**
       * Recompute affected nodes when a value changes
       * This is the core incremental update method
       * @param {string} changedNodeId - The node that changed
       * @param {*} newValue - The new value
       * @returns {RecomputeResult}
       */
      recompute(changedNodeId, newValue) {
        const startTime = performance.now();
        lastComputeCount = 0;

        // 1. Update the changed value
        currentState.set(changedNodeId, newValue);

        // 2. Find all affected downstream nodes
        const affected = graph.getDownstream(changedNodeId);

        if (affected.length === 0) {
          // No downstream dependencies - nothing to recompute
          lastComputeTime = performance.now() - startTime;
          return {
            state: currentState,
            computed: [],
            iterations: 0,
            timeMs: lastComputeTime
          };
        }

        // 3. Sort affected nodes in dependency order
        const computeOrder = graph.topologicalSort(affected);

        // 4. Check for convergence groups
        const convergenceGroups = graph
          .findConvergenceGroups()
          .filter((group) => group.some((id) => affected.includes(id)));

        // 5. Identify convergent vs non-convergent nodes
        const convergentIds = new Set(convergenceGroups.flat());
        const nonConvergent = computeOrder.filter((id) => !convergentIds.has(id));

        // 6. Compute non-convergent nodes first
        for (const nodeId of nonConvergent) {
          this._computeNode(nodeId);
        }

        // 7. Handle convergent groups with iteration
        let totalIterations = 0;
        for (const group of convergenceGroups) {
          const iterations = this._computeConvergentGroup(group);
          totalIterations = Math.max(totalIterations, iterations);
        }

        lastComputeTime = performance.now() - startTime;
        totalComputations += lastComputeCount;

        return {
          state: currentState,
          computed: computeOrder,
          iterations: totalIterations,
          timeMs: lastComputeTime
        };
      },

      /**
       * Recompute when multiple values change at once
       * More efficient than calling recompute() multiple times
       * @param {Object<string, *>} changes - Map of nodeId → newValue
       * @returns {RecomputeResult}
       */
      recomputeBatch(changes) {
        const startTime = performance.now();
        lastComputeCount = 0;

        // 1. Apply all changes
        const changedIds = [];
        for (const [nodeId, value] of Object.entries(changes)) {
          currentState.set(nodeId, value);
          changedIds.push(nodeId);
        }

        // 2. Find union of all affected nodes
        const affectedSet = new Set();
        for (const nodeId of changedIds) {
          for (const affected of graph.getDownstream(nodeId)) {
            affectedSet.add(affected);
          }
        }

        const affected = Array.from(affectedSet);

        if (affected.length === 0) {
          lastComputeTime = performance.now() - startTime;
          return {
            state: currentState,
            computed: [],
            iterations: 0,
            timeMs: lastComputeTime
          };
        }

        // 3. Sort and compute
        const computeOrder = graph.topologicalSort(affected);

        // 4. Handle convergence groups
        const convergenceGroups = graph
          .findConvergenceGroups()
          .filter((group) => group.some((id) => affected.includes(id)));

        const convergentIds = new Set(convergenceGroups.flat());
        const nonConvergent = computeOrder.filter((id) => !convergentIds.has(id));

        // 5. Compute non-convergent nodes
        for (const nodeId of nonConvergent) {
          this._computeNode(nodeId);
        }

        // 6. Handle convergent groups
        let totalIterations = 0;
        for (const group of convergenceGroups) {
          const iterations = this._computeConvergentGroup(group);
          totalIterations = Math.max(totalIterations, iterations);
        }

        lastComputeTime = performance.now() - startTime;
        totalComputations += lastComputeCount;

        return {
          state: currentState,
          computed: computeOrder,
          iterations: totalIterations,
          timeMs: lastComputeTime
        };
      },

      /**
       * Compute a single node
       * @private
       * @param {string} nodeId
       */
      _computeNode(nodeId) {
        const node = graph.getNode(nodeId);
        if (!node) {
          console.warn(`[IncrementalEngine] No computation node found for: ${nodeId}`);
          return;
        }

        // Gather inputs from current state
        const inputs = {};
        for (const dep of node.dependencies) {
          inputs[dep] = currentState.get(dep);
        }

        // An Unavailable input makes the node Unavailable (as MultiModelEngine.computeNode: never a 0
        // passed on as a figure), unless the node declares acceptsUnavailable
        if (!node.acceptsUnavailable && node.dependencies.some(d => inputs[d] === "Unavailable")) {
          currentState.set(nodeId, "Unavailable");
          lastComputeCount++;
          return;
        }

        // Compute new value
        try {
          const result = node.compute(inputs);
          currentState.set(nodeId, result);
          lastComputeCount++;
        } catch (error) {
          console.error(`[IncrementalEngine] Error computing ${nodeId}:`, error);
          // Keep previous value on error
        }
      },

      /**
       * Compute a convergent group with iteration until stable
       * @private
       * @param {string[]} group - Node IDs in the convergence group
       * @returns {number} - Number of iterations taken
       */
      _computeConvergentGroup(group) {
        // Get convergence settings from first convergent node
        const firstNode = graph.getNode(group[0]);
        const maxIterations =
          firstNode?.maxIterations || convergenceDefaults.maxIterations;
        const tolerance = firstNode?.tolerance || convergenceDefaults.tolerance;

        let iterations = 0;
        let converged = false;

        while (!converged && iterations < maxIterations) {
          const prevValues = new Map();

          // Store previous values
          for (const nodeId of group) {
            prevValues.set(nodeId, currentState.get(nodeId));
          }

          // Compute all nodes in group
          for (const nodeId of group) {
            this._computeNode(nodeId);
          }

          // Check convergence
          converged = true;
          for (const nodeId of group) {
            const prev = prevValues.get(nodeId);
            const curr = currentState.get(nodeId);

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

          iterations++;
        }

        if (!converged) {
          console.warn(
            `[IncrementalEngine] Convergence group did not converge after ${maxIterations} iterations:`,
            group
          );
        }

        return iterations;
      },

      // ========================================================================
      // FULL COMPUTATION
      // ========================================================================

      /**
       * Compute all nodes from scratch (for initialization)
       * @returns {RecomputeResult}
       */
      computeAll() {
        const startTime = performance.now();
        lastComputeCount = 0;

        const computeOrder = graph.getFullComputationOrder();

        for (const nodeId of computeOrder) {
          this._computeNode(nodeId);
        }

        lastComputeTime = performance.now() - startTime;
        totalComputations += lastComputeCount;

        return {
          state: currentState,
          computed: computeOrder,
          iterations: 0,
          timeMs: lastComputeTime
        };
      },

      /**
       * Initialize state with default values from input nodes
       */
      initializeDefaults() {
        const inputIds = graph.getAllInputIds();

        for (const inputId of inputIds) {
          const input = graph.getInput(inputId);
          if (input && input.defaultValue !== undefined) {
            currentState.set(inputId, input.defaultValue);
          }
        }
      },

      /**
       * Recompute a specific set of nodes (regardless of what changed)
       * Useful for forced recalculation
       * @param {string[]} nodeIds
       * @returns {RecomputeResult}
       */
      recomputeNodes(nodeIds) {
        const startTime = performance.now();
        lastComputeCount = 0;

        const computeOrder = graph.topologicalSort(nodeIds);

        for (const nodeId of computeOrder) {
          if (graph.isComputationNode(nodeId)) {
            this._computeNode(nodeId);
          }
        }

        lastComputeTime = performance.now() - startTime;
        totalComputations += lastComputeCount;

        return {
          state: currentState,
          computed: computeOrder,
          iterations: 0,
          timeMs: lastComputeTime
        };
      },

      // ========================================================================
      // DIAGNOSTICS
      // ========================================================================

      /**
       * Get computation statistics
       * @returns {Object}
       */
      getStats() {
        return {
          lastComputeCount,
          lastComputeTimeMs: lastComputeTime.toFixed(2),
          totalComputations,
          totalNodes: graph.getAllNodeIds().length,
          totalInputs: graph.getAllInputIds().length,
          stateSize: currentState.size
        };
      },

      /**
       * Validate that all dependencies are satisfied
       * @returns {string[]} - List of validation errors
       */
      validate() {
        const errors = [];

        for (const nodeId of graph.getAllNodeIds()) {
          const node = graph.getNode(nodeId);

          for (const dep of node.dependencies) {
            // Check if dependency exists in graph
            if (!graph.hasNode(dep)) {
              errors.push(`Node "${nodeId}" depends on unknown node "${dep}"`);
            }
          }
        }

        // Check for cycles
        const cycles = graph.detectCycles();
        for (const cycle of cycles) {
          errors.push(`Circular dependency detected: ${cycle.join(" -> ")}`);
        }

        return errors;
      },

      /**
       * Debug trace for a specific node
       * @param {string} nodeId - Node to trace
       */
      debugTrace(nodeId) {
        console.group(`[IncrementalEngine] Trace for: ${nodeId}`);

        const upstream = graph.getUpstream(nodeId);
        console.log("Upstream dependencies:", upstream);

        const downstream = graph.getDownstream(nodeId);
        console.log("Downstream dependents:", downstream);

        const node = graph.getNode(nodeId);
        if (node) {
          console.log("Direct dependencies:", node.dependencies);
          console.log("Current value:", currentState.get(nodeId));

          const inputs = {};
          for (const dep of node.dependencies) {
            inputs[dep] = currentState.get(dep);
          }
          console.log("Current inputs:", inputs);
        } else if (graph.getInput(nodeId)) {
          console.log("This is an input node");
          console.log("Current value:", currentState.get(nodeId));
        } else {
          console.log("Node not found in graph");
        }

        console.groupEnd();
      },

      /**
       * Simulate what would be affected by a change without actually computing
       * @param {string} nodeId - Node that would change
       * @returns {Object} Analysis of what would be affected
       */
      analyzeImpact(nodeId) {
        const affected = graph.getDownstream(nodeId);
        const computeOrder = graph.topologicalSort(affected);

        // Group by section
        const bySection = {};
        for (const id of affected) {
          const node = graph.getNode(id);
          const section = node?.section || "unknown";
          if (!bySection[section]) bySection[section] = [];
          bySection[section].push(id);
        }

        return {
          changedNode: nodeId,
          affectedCount: affected.length,
          computeOrder,
          bySection,
          estimatedSavings: `${((1 - affected.length / graph.getAllNodeIds().length) * 100).toFixed(1)}% fewer calculations vs full recompute`
        };
      },

      /**
       * Clear all state
       */
      clear() {
        currentState.clear();
        lastComputeCount = 0;
        lastComputeTime = 0;
      },

      /**
       * Reset statistics
       */
      resetStats() {
        totalComputations = 0;
        lastComputeCount = 0;
        lastComputeTime = 0;
      }
    };
  }

  // ============================================================================
  // EXPORT
  // ============================================================================

  window.TEUI.createIncrementalEngine = createIncrementalEngine;

  // Log initialization
  console.log("[IncrementalEngine] Module loaded");
})();
