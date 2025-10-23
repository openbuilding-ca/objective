/**
 * 4012-Orchestrator.js
 *
 * Dependency-Ordered Calculation Orchestrator for TEUI 4.011
 * Solves StateManager listener propagation limitation by ensuring deterministic execution order
 *
 * MISSION: Replace listener-based reactivity with execution-order-based coordination
 * PRESERVES: All existing section architecture, Traffic Cop patterns, dual-state isolation
 *
 * Implementation follows SEPT15-RACE-MITIGATION.md Phase 1A
 */

// Ensure TEUI namespace exists
window.TEUI = window.TEUI || {};

// Orchestrator Module
TEUI.Orchestrator = (function () {
  const sections = {};
  let isRunning = false; // Prevent concurrent orchestrator runs

  /**
   * Register a section with its dependencies and outputs
   * @param {string} id - Section ID (e.g., "sect03")
   * @param {Object} config - Section configuration
   * @param {Array} config.outputs - Fields this section produces
   * @param {Function} config.calculate - Section's calculateAll function
   * @param {Array} config.dependsOn - Sections that must run before this one
   */
  function registerSection(id, config) {
    sections[id] = {
      id,
      outputs: config.outputs || [],
      calculate: config.calculate || function () {},
      dependsOn: config.dependsOn || [],
      // 🆕 DUAL-STATE SUPPORT
      targetOutputs: config.targetOutputs || config.outputs || [],
      referenceOutputs:
        config.referenceOutputs || config.outputs?.map((o) => `ref_${o}`) || [],
    };

    console.log(
      `[Orchestrator] Registered section ${id} with dependencies: [${config.dependsOn.join(", ")}]`,
    );
  }

  /**
   * Perform topological sort of registered sections
   * @returns {Array} Sorted array of section IDs in dependency order
   */
  function topoSort() {
    const sorted = [];
    const visited = new Set();

    function visit(id, stack = new Set()) {
      if (stack.has(id)) {
        throw new Error(`Circular dependency detected at ${id}`);
      }
      if (!visited.has(id)) {
        stack.add(id);
        (sections[id].dependsOn || []).forEach((dep) => visit(dep, stack));
        stack.delete(id);
        visited.add(id);
        sorted.push(id);
      }
    }

    Object.keys(sections).forEach((id) => visit(id));
    return sorted;
  }

  /**
   * Execute all registered sections in dependency order
   * Replaces Calculator.calculateAll() with deterministic orchestration
   */
  function runAll() {
    // 🚦 TRAFFIC COP INTEGRATION - Respect existing protection
    if (window.sectionCalculationInProgress || isRunning) {
      console.log("[Orchestrator] Calculation in progress, skipping");
      return;
    }

    isRunning = true;
    window.sectionCalculationInProgress = true; // Respect existing Traffic Cop

    // 📊 QC INTEGRATION: Track orchestrator performance
    if (window.TEUI?.QCMonitor?.isActive()) {
      window.TEUI.QCMonitor.logViolation({
        type: "ORCHESTRATOR_RUN_START",
        field: "orchestrator",
        message: "Orchestrator execution beginning",
        severity: "info",
      });
    }

    // 📊 PERFORMANCE MEASUREMENT
    const startTime = performance.now();

    try {
      const order = topoSort();
      console.log("[Orchestrator] Execution order:", order);

      order.forEach((id) => {
        try {
          const sectionStart = performance.now();
          console.log(`[Orchestrator] Executing section ${id}`);

          // Call section's calculateAll method
          const sectionModule = window.TEUI.SectionModules?.[id];
          if (
            sectionModule &&
            typeof sectionModule.calculateAll === "function"
          ) {
            sectionModule.calculateAll();
          } else {
            console.warn(
              `[Orchestrator] Section ${id} not found or missing calculateAll method`,
            );
          }

          const sectionEnd = performance.now();
          console.log(
            `[Orchestrator] ${id} completed in ${(sectionEnd - sectionStart).toFixed(1)}ms`,
          );
        } catch (err) {
          console.error(`[${id}] Orchestrator error:`, err);
        }
      });
    } finally {
      // 📊 TOTAL PERFORMANCE LOGGING
      const totalTime = performance.now() - startTime;
      console.log(
        `[Orchestrator] Total execution time: ${totalTime.toFixed(1)}ms`,
      );

      // 📊 QC INTEGRATION: Validate post-execution state
      if (window.TEUI?.QCMonitor?.isActive()) {
        const violations = window.TEUI.QCMonitor.detectStateContamination();
        if (violations.length > 0) {
          console.warn(
            "[Orchestrator] QC detected violations after execution:",
            violations,
          );
        }
      }

      // 🔓 ALWAYS RELEASE FLAGS
      isRunning = false;
      window.sectionCalculationInProgress = false;
    }
  }

  /**
   * Initialize orchestrator with complete Calculator.js chain
   * Uses proven calcOrder dependencies from Calculator.js
   */
  function initialize() {
    console.log(
      "[Orchestrator] Initializing with Calculator.js dependency chain...",
    );

    // Register all sections using proven Calculator.js calcOrder
    // Based on Calculator.js lines 488-506
    const sectionRegistrations = [
      {
        id: "sect02",
        dependsOn: [],
        outputs: [
          "h_15",
          "d_85",
          "d_86",
          "d_89",
          "d_90",
          "d_91",
          "d_92",
          "d_95",
          "d_12",
          "d_63",
        ],
        calculate: () => window.TEUI.SectionModules?.sect02?.calculateAll?.(),
      },
      {
        id: "sect03",
        dependsOn: ["sect02"],
        outputs: ["d_20", "d_21", "d_23", "d_24", "j_19"],
        calculate: () => window.TEUI.SectionModules?.sect03?.calculateAll?.(),
      },
      {
        id: "sect08",
        dependsOn: ["sect02"],
        outputs: ["d_56", "d_57", "d_58"],
        calculate: () => window.TEUI.SectionModules?.sect08?.calculateAll?.(),
      },
      {
        id: "sect09",
        dependsOn: ["sect02", "sect03"],
        outputs: ["i_71", "k_71"],
        calculate: () => window.TEUI.SectionModules?.sect09?.calculateAll?.(),
      },
      {
        id: "sect12",
        dependsOn: ["sect02", "sect03"],
        outputs: [
          "g_101",
          "g_102",
          "d_104",
          "i_101",
          "i_102",
          "i_103",
          "i_104",
        ],
        calculate: () => window.TEUI.SectionModules?.sect12?.calculateAll?.(),
      },
      {
        id: "sect10",
        dependsOn: ["sect09", "sect12"],
        outputs: ["i_80", "i_81"],
        calculate: () => window.TEUI.SectionModules?.sect10?.calculateAll?.(),
      },
      {
        id: "sect11",
        dependsOn: ["sect10", "sect12"],
        outputs: ["i_98", "i_97"],
        calculate: () => window.TEUI.SectionModules?.sect11?.calculateAll?.(),
      },
      {
        id: "sect07",
        dependsOn: ["sect02"],
        outputs: ["k_51"],
        calculate: () => window.TEUI.SectionModules?.sect07?.calculateAll?.(),
      },
      {
        id: "sect13",
        dependsOn: ["sect11", "sect12"],
        outputs: ["d_117", "m_121"],
        calculate: () => window.TEUI.SectionModules?.sect13?.calculateAll?.(),
      },
      {
        id: "sect06",
        dependsOn: ["sect02"],
        outputs: ["m_43"],
        calculate: () => window.TEUI.SectionModules?.sect06?.calculateAll?.(),
      },
      {
        id: "sect14",
        dependsOn: ["sect09", "sect10", "sect11", "sect12", "sect13"],
        outputs: ["h_126", "h_130"],
        calculate: () => window.TEUI.SectionModules?.sect14?.calculateAll?.(),
      },
      {
        id: "sect04",
        dependsOn: ["sect07"],
        outputs: ["f_32", "j_32"],
        calculate: () => window.TEUI.SectionModules?.sect04?.calculateAll?.(),
      },
      {
        id: "sect05",
        dependsOn: ["sect04"],
        outputs: ["emissions_totals"],
        calculate: () => window.TEUI.SectionModules?.sect05?.calculateAll?.(),
      },
      {
        id: "sect15",
        dependsOn: ["sect14", "sect04", "sect06", "sect07"],
        outputs: ["h_136", "d_144"],
        calculate: () => window.TEUI.SectionModules?.sect15?.calculateAll?.(),
      },
      {
        id: "sect01",
        dependsOn: ["sect15", "sect05"],
        outputs: ["dashboard_values"],
        calculate: () =>
          window.TEUI.SectionModules?.sect01?.runAllCalculations?.(),
      },
    ];

    // Register all sections
    sectionRegistrations.forEach((section) => {
      registerSection(section.id, section);
    });

    console.log(
      `[Orchestrator] Initialized with ${Object.keys(sections).length} sections`,
    );
    console.log("[Orchestrator] Dependency order:", topoSort());
  }

  /**
   * Get registered sections (for debugging)
   */
  function getSections() {
    return { ...sections };
  }

  /**
   * Get dependency order (for debugging)
   */
  function getDependencyOrder() {
    return topoSort();
  }

  // Public API
  return {
    registerSection,
    runAll,
    topoSort,
    initialize,
    getSections,
    getDependencyOrder,
    isRunning: () => isRunning,
  };
})();

// Initialize orchestrator when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Small delay to ensure other modules are loaded
  setTimeout(() => {
    if (window.TEUI?.Orchestrator) {
      window.TEUI.Orchestrator.initialize();
      console.log(
        "[Orchestrator] Ready for testing. Use TEUI.Orchestrator.runAll() to test execution.",
      );
    }
  }, 1000);
});

// Export for global access
window.TEUI.Orchestrator = TEUI.Orchestrator;

console.log(
  "[4012-Orchestrator.js] Module loaded - Phase 1A implementation complete",
);
