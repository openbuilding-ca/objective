/**
 * 4011-QCMonitor.js
 *
 * Quality Control Monitor for TEUI 4.011 Calculator
 * Systematic detection of state mixing violations and dependency issues
 *
 * Implements the QC framework from 4012-QC.md for automated debugging
 * of dual-state architecture compliance across all 15 sections.
 */

// Ensure TEUI namespace exists
window.TEUI = window.TEUI || {};

TEUI.QCMonitor = (function () {
  // QC Monitor state
  let isActive = false;
  let baseline = new Map();
  let violations = [];
  let staleDetector = new Map();
  let pathwayTracker = new Map();
  let mirrorTargetMode = false;

  // Performance tracking
  let monitoringOverhead = {
    startTime: 0,
    totalCalls: 0,
    totalTime: 0,
  };

  /**
   * Initialize the QC Monitor
   * Only activates when ?qc=true in URL for zero production overhead
   */
  function initialize() {
    // Check if QC monitoring is requested
    const urlParams = new URLSearchParams(window.location.search);
    isActive = urlParams.get("qc") === "true";

    if (!isActive) {
      console.log(
        "[QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.",
      );
      return false;
    }

    console.log("[QCMonitor] 🔍 Quality Control monitoring ACTIVATED");
    console.log("[QCMonitor] Systematic state mixing detection enabled");

    // Initialize tracking structures
    baseline.clear();
    violations = [];
    staleDetector.clear();
    pathwayTracker.clear();

    // Hook into StateManager if available
    if (window.TEUI?.StateManager) {
      instrumentStateManager();
    } else {
      console.warn(
        "[QCMonitor] StateManager not available for instrumentation",
      );
    }

    // Set up periodic violation checking
    setInterval(performPeriodicChecks, 1000); // Every second

    // Initialize Mirror Target baseline if requested
    const mirrorTarget = urlParams.get("mirror") === "true";
    if (mirrorTarget) {
      initializeMirrorTarget();
    }

    return true;
  }

  /**
   * Initialize Mirror Target baseline validation
   * Reference defaults = Target defaults for identical model comparison
   */
  function initializeMirrorTarget() {
    mirrorTargetMode = true;
    console.log("[QCMonitor] 🎯 Mirror Target baseline validation enabled");

    // Wait for StateManager to be fully initialized
    setTimeout(() => {
      if (!window.TEUI?.StateManager) {
        console.error(
          "[QCMonitor] StateManager not available for Mirror Target init",
        );
        return;
      }

      // Get all current Target values as baseline
      const stateManager = window.TEUI.StateManager;
      const targetBaseline = new Map();
      const referenceBaseline = new Map();

      // Collect current state
      if (typeof stateManager.getAllValues === "function") {
        const allValues = stateManager.getAllValues();

        Object.entries(allValues).forEach(([key, value]) => {
          if (key.startsWith("ref_")) {
            // Reference value
            const baseKey = key.substring(4); // Remove 'ref_' prefix
            referenceBaseline.set(baseKey, value);
          } else {
            // Target value
            targetBaseline.set(key, value);
          }
        });
      }

      // Store baselines
      baseline.set("Target", targetBaseline);
      baseline.set("Reference", referenceBaseline);

      console.log(
        `[QCMonitor] Mirror Target baseline captured: ${targetBaseline.size} Target, ${referenceBaseline.size} Reference values`,
      );

      // Immediate baseline comparison
      detectStateMixing();
    }, 2000); // Allow time for initialization
  }

  /**
   * Instrument StateManager to monitor setValue/getValue operations
   */
  function instrumentStateManager() {
    const stateManager = window.TEUI.StateManager;

    // Store original methods
    const originalSetValue = stateManager.setValue;
    const originalGetValue = stateManager.getValue;

    // Instrument setValue
    stateManager.setValue = function (fieldId, value, source) {
      const startTime = performance.now();

      // Track the write operation
      trackWrite(fieldId, value, source, startTime);

      // Call original method
      const result = originalSetValue.call(this, fieldId, value, source);

      // Update performance metrics
      updatePerformanceMetrics(startTime);

      return result;
    };

    // Instrument getValue
    stateManager.getValue = function (fieldId) {
      const startTime = performance.now();

      // Call original method
      const result = originalGetValue.call(this, fieldId);

      // Track the read operation
      trackRead(fieldId, result, startTime);

      // Update performance metrics
      updatePerformanceMetrics(startTime);

      return result;
    };

    console.log("[QCMonitor] StateManager instrumentation complete");
  }

  /**
   * Track write operations (setValue calls)
   */
  function trackWrite(fieldId, value, source, timestamp) {
    if (!isActive) return;

    // Detect potential state mixing violations
    if (mirrorTargetMode) {
      checkMirrorTargetViolation(fieldId, value, source);
    }

    // Track staleness
    staleDetector.set(fieldId, {
      lastWrite: timestamp,
      value: value,
      source: source,
    });

    // Track pathway - mark as written
    updatePathwayTracker(fieldId, "written", { value, source, timestamp });

    // Log significant writes for debugging
    if (shouldLogWrite(fieldId, source)) {
      console.log(
        `[QCMonitor] 📝 Write: ${fieldId}="${value}" (${source}) at ${timestamp.toFixed(2)}ms`,
      );
    }
  }

  /**
   * Track read operations (getValue calls) with caller tracing
   */
  function trackRead(fieldId, value, timestamp) {
    if (!isActive) return;

    // Get caller information for debugging
    const caller = getCaller();

    // Track pathway - mark as read
    updatePathwayTracker(fieldId, "read", { value, timestamp, caller });

    // Detect fallback usage (indicates missing values) - but gracefully handle legitimate nulls
    if (value === null || value === undefined) {
      // Check if this is a legitimate null/zero field that shouldn't be flagged
      if (shouldReportNullValue(fieldId, caller)) {
        // Analyze the type of missing value to distinguish definition vs timing issues
        const missingValueAnalysis = analyzeMissingValue(
          fieldId,
          caller,
          timestamp,
        );

        logViolation({
          type: missingValueAnalysis.violationType,
          field: fieldId,
          message: missingValueAnalysis.message,
          timestamp: timestamp,
          severity: missingValueAnalysis.severity,
          caller: caller,
          analysis: missingValueAnalysis,
        });
      }
    }
  }

  /**
   * Analyze missing value to distinguish between definition vs timing issues
   * Returns detailed analysis of why a field is null/undefined
   */
  function analyzeMissingValue(fieldId, caller, timestamp) {
    const analysis = {
      fieldId: fieldId,
      caller: caller,
      timestamp: timestamp,
      violationType: "MISSING_VALUE", // Default
      severity: "warning", // Default
      message: "",
      category: "unknown",
      recommendations: [],
    };

    // Check if field exists in StateManager at all
    const fieldExistsInStateManager =
      window.TEUI?.StateManager &&
      window.TEUI.StateManager.getAllKeys &&
      window.TEUI.StateManager.getAllKeys().includes(fieldId);

    // Check if field is defined in FieldManager
    const fieldDefinition = window.TEUI?.FieldManager?.getField(fieldId);
    const fieldExistsInFieldManager = !!fieldDefinition;

    // Check if this is a ref_ field and if the base field exists
    let baseFieldExists = true;
    let isRefField = fieldId.startsWith("ref_");
    if (isRefField) {
      const baseFieldId = fieldId.substring(4);
      baseFieldExists =
        window.TEUI?.FieldManager?.getField(baseFieldId) ||
        window.TEUI?.StateManager?.getAllKeys()?.includes(baseFieldId);
    }

    // Check timing - has this field been accessed multiple times?
    const fieldTracker = pathwayTracker.get(fieldId);
    const readCount = fieldTracker
      ? fieldTracker.operations.filter((op) => op.operation === "read").length
      : 0;
    const hasBeenWritten = fieldTracker ? fieldTracker.written : false;

    // Check if field was ever successfully written (not null)
    const wasEverNonNull = fieldTracker
      ? fieldTracker.operations.some(
          (op) =>
            op.operation === "read" &&
            op.value !== null &&
            op.value !== undefined,
        )
      : false;

    // Analysis logic
    if (!fieldExistsInFieldManager && !fieldExistsInStateManager) {
      // Field doesn't exist anywhere - completely undefined
      analysis.category = "undefined_field";
      analysis.violationType = "UNDEFINED_FIELD";
      analysis.severity = "error";
      analysis.message = `${fieldId} is not defined in FieldManager or StateManager`;
      analysis.recommendations = [
        "Add field definition to appropriate section module",
        "Check field naming convention",
        "Verify field is needed for calculations",
      ];
    } else if (isRefField && !baseFieldExists) {
      // Reference field exists but base field doesn't
      analysis.category = "orphaned_ref_field";
      analysis.violationType = "ORPHANED_REF_FIELD";
      analysis.severity = "error";
      analysis.message = `${fieldId} references non-existent base field ${fieldId.substring(4)}`;
      analysis.recommendations = [
        "Define base field in appropriate section",
        "Remove orphaned reference field if not needed",
        "Check dual-state architecture compliance",
      ];
    } else if (readCount > 10 && !hasBeenWritten && !wasEverNonNull) {
      // Field exists but has never been successfully calculated/written after many reads
      analysis.category = "calculation_failure";
      analysis.violationType = "CALCULATION_FAILURE";
      analysis.severity = "error";
      analysis.message = `${fieldId} never calculated after ${readCount} read attempts`;
      analysis.recommendations = [
        "Check calculation dependencies",
        "Verify calculation function exists and runs",
        "Check for circular dependencies",
        "Review dependency registration",
      ];
    } else if (readCount > 3 && wasEverNonNull && !hasBeenWritten) {
      // Field was calculated before but now returning null - timing/race condition
      analysis.category = "timing_race_condition";
      analysis.violationType = "RACE_CONDITION";
      analysis.severity = "warning";
      analysis.message = `${fieldId} timing issue - was non-null before, now null after ${readCount} reads`;
      analysis.recommendations = [
        "Check calculation order in dependency chain",
        "Add explicit dependency registration",
        "Review StateManager setValue timing",
        "Consider using Dependency.js for ordered execution",
      ];
    } else if (readCount <= 3 && !hasBeenWritten) {
      // Early in calculation cycle - may be normal initialization
      analysis.category = "early_initialization";
      analysis.violationType = "EARLY_READ";
      analysis.severity = "info";
      analysis.message = `${fieldId} read during early initialization (${readCount} reads)`;
      analysis.recommendations = [
        "May be normal during app startup",
        "Monitor if persists after full initialization",
        "Check if field should have default value",
      ];
    } else if (fieldExistsInFieldManager && !fieldExistsInStateManager) {
      // Defined but never registered in StateManager
      analysis.category = "unregistered_field";
      analysis.violationType = "UNREGISTERED_FIELD";
      analysis.severity = "warning";
      analysis.message = `${fieldId} defined in FieldManager but not registered in StateManager`;
      analysis.recommendations = [
        "Ensure field is registered during section initialization",
        "Check setValue calls in section calculateAll",
        "Verify field is included in section getFields()",
      ];
    } else {
      // Default case - standard missing value
      analysis.category = "standard_missing";
      analysis.violationType = "MISSING_VALUE";
      analysis.severity = "warning";
      analysis.message = `${fieldId}=null, caller=${caller}`;
      analysis.recommendations = [
        "Check field initialization",
        "Verify calculation dependencies",
        "Review field default values",
      ];
    }

    return analysis;
  }

  /**
   * Determine if a null value should be reported as a violation
   * Many energy model fields can legitimately be null/zero (e.g., PV contributions, optional equipment)
   */
  function shouldReportNullValue(fieldId, caller) {
    // Fields that can legitimately be null/zero and shouldn't trigger violations
    const legitimateNullFields = [
      // Renewable energy fields (PV, wind, etc.) - often zero in many projects
      "m_43",
      "m_44",
      "m_45",
      "m_46",
      "m_47",
      "m_48",
      "m_49",

      // Optional equipment fields
      "d_70",
      "d_71",
      "d_72",
      "d_73",
      "d_74",
      "d_75",
      "d_76",

      // Additional energy sources (often zero)
      "f_33",
      "f_34",
      "f_35",
      "f_36",
      "f_37",
      "f_38",
      "f_39",
      "j_33",
      "j_34",
      "j_35",
      "j_36",
      "j_37",
      "j_38",
      "j_39",

      // Optional cooling/heating systems
      "d_77",
      "d_78",
      "d_79",
      "d_80",
      "d_81",
      "d_82",

      // Optional water features
      "j_50",
      "j_51",
      "j_52",
      "k_50",
      "k_51",
      "k_52",

      // Calculated fields that may be zero in early stages
      "i_98",
      "i_99",
      "i_100",
      "i_101",
      "i_102",
      "i_103",
      "i_104",

      // Reference prefixed versions of the above
      "ref_m_43",
      "ref_m_44",
      "ref_m_45",
      "ref_m_46",
      "ref_m_47",
      "ref_m_48",
      "ref_m_49",
      "ref_d_70",
      "ref_d_71",
      "ref_d_72",
      "ref_d_73",
      "ref_d_74",
      "ref_d_75",
      "ref_d_76",
      "ref_f_33",
      "ref_f_34",
      "ref_f_35",
      "ref_f_36",
      "ref_f_37",
      "ref_f_38",
      "ref_f_39",
      "ref_j_33",
      "ref_j_34",
      "ref_j_35",
      "ref_j_36",
      "ref_j_37",
      "ref_j_38",
      "ref_j_39",
      "ref_d_77",
      "ref_d_78",
      "ref_d_79",
      "ref_d_80",
      "ref_d_81",
      "ref_d_82",
      "ref_j_50",
      "ref_j_51",
      "ref_j_52",
      "ref_k_50",
      "ref_k_51",
      "ref_k_52",
      "ref_i_98",
      "ref_i_99",
      "ref_i_100",
      "ref_i_101",
      "ref_i_102",
      "ref_i_103",
      "ref_i_104",
    ];

    // Check if this field is in the legitimate null list
    if (legitimateNullFields.includes(fieldId)) {
      return false; // Don't report as violation
    }

    // Pattern-based checks for optional fields
    // Optional sub-components (often have null values)
    if (fieldId.match(/^[a-z]_[4-9][0-9]$/)) {
      // Fields like d_40-d_99, m_40-m_99 etc.
      return false; // Many optional fields in higher ranges
    }

    // Calculated display fields that may be null during initialization
    if (fieldId.startsWith("cf_") || fieldId.startsWith("calc_")) {
      return false; // Calculated fields can be null during setup
    }

    // Critical core fields that should never be null
    const criticalFields = [
      "h_15",
      "d_85",
      "d_86",
      "d_89",
      "d_90",
      "d_91",
      "d_92",
      "d_95", // Building geometry
      "d_20",
      "d_21",
      "d_23",
      "d_24", // Climate data
      "d_63",
      "d_12", // Occupancy
      "h_10",
      "k_10",
      "e_10", // Key TEUI values (S01 is state agnostic: h_10=Target, e_10=Reference)
      "j_32",
      "f_32", // Energy totals
      "ref_h_15",
      "ref_d_85",
      "ref_d_86",
      "ref_d_89",
      "ref_d_90",
      "ref_d_91",
      "ref_d_92",
      "ref_d_95",
      "ref_d_20",
      "ref_d_21",
      "ref_d_23",
      "ref_d_24",
      "ref_d_63",
      "ref_d_12",
      "ref_j_32",
      "ref_f_32",
    ];

    // Only report violations for critical fields
    return criticalFields.includes(fieldId);
  }

  /**
   * Get detailed caller information from stack trace
   */
  function getCaller() {
    try {
      const stack = new Error().stack;
      const lines = stack.split("\n");

      // Find first meaningful caller (skip QCMonitor internals)
      for (let i = 3; i < lines.length; i++) {
        const line = lines[i];
        if (
          line &&
          !line.includes("QCMonitor") &&
          !line.includes("trackRead") &&
          !line.includes("trackWrite")
        ) {
          // Enhanced pattern matching for better caller identification
          const match = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
          if (match) {
            const func = match[1] || "anonymous";
            const file = match[2].split("/").pop() || "unknown";
            const lineNum = match[3];
            const colNum = match[4];
            return `${func}@${file}:${lineNum}:${colNum}`;
          }

          // Try alternative pattern for different browsers
          const altMatch = line.match(/(\w+)@(.+?):(\d+):(\d+)/);
          if (altMatch) {
            const func = altMatch[1];
            const file = altMatch[2].split("/").pop();
            const lineNum = altMatch[3];
            return `${func}@${file}:${lineNum}`;
          }

          // Fallback: return more of the line for manual inspection
          return line.trim().substring(0, 60).replace(/\s+/g, " ");
        }
      }
      return "no-meaningful-caller";
    } catch (e) {
      return `trace-error: ${e.message}`;
    }
  }

  /**
   * Check for Mirror Target violations
   */
  function checkMirrorTargetViolation(fieldId, value, source) {
    if (!mirrorTargetMode) return;

    const targetBaseline = baseline.get("Target");
    const referenceBaseline = baseline.get("Reference");

    if (!targetBaseline || !referenceBaseline) return;

    // Check if this is a field that should match between Target and Reference
    if (fieldId.startsWith("ref_")) {
      // Reference field - compare with Target equivalent
      const baseField = fieldId.substring(4);
      const targetValue = targetBaseline.get(baseField);

      if (shouldMatch(baseField) && targetValue !== value) {
        logViolation({
          type: "MIRROR_TARGET_DIVERGENCE",
          field: fieldId,
          message: `Reference ${fieldId}="${value}" diverges from Target ${baseField}="${targetValue}"`,
          expected: targetValue,
          actual: value,
          severity: "error",
        });
      }
    } else {
      // Target field - compare with Reference equivalent
      const refField = `ref_${fieldId}`;
      const referenceValue = referenceBaseline.get(fieldId);

      if (shouldMatch(fieldId) && referenceValue !== value) {
        logViolation({
          type: "MIRROR_TARGET_DIVERGENCE",
          field: fieldId,
          message: `Target ${fieldId}="${value}" diverges from Reference ref_${fieldId}="${referenceValue}"`,
          expected: referenceValue,
          actual: value,
          severity: "error",
        });
      }
    }
  }

  /**
   * Determine if a field should match between Target and Reference in Mirror Target mode
   */
  function shouldMatch(fieldId) {
    // Fields that should be identical in Mirror Target mode
    const mirrorFields = [
      // Building geometry (should be same for both models)
      "h_15",
      "d_85",
      "d_86",
      "d_89",
      "d_90",
      "d_91",
      "d_92",
      "d_95",

      // Climate data (same location for both models)
      "d_20",
      "d_21",
      "d_23",
      "d_24",

      // Occupancy (same building use for both models)
      "d_63",
      "d_12",

      // Areas and volumes (same building for both models)
      "d_105",
      "i_101",
      "i_102",
      "i_103",
      "i_104",
    ];

    return mirrorFields.includes(fieldId);
  }

  /**
   * Update pathway tracking for a field
   */
  function updatePathwayTracker(fieldId, operation, metadata) {
    if (!pathwayTracker.has(fieldId)) {
      pathwayTracker.set(fieldId, {
        read: false,
        calculated: false,
        written: false,
        operations: [],
      });
    }

    const tracker = pathwayTracker.get(fieldId);
    tracker[operation] = true;
    tracker.operations.push({
      operation,
      timestamp: performance.now(),
      ...metadata,
    });

    // Check for pathway violations
    if (operation === "calculated" && !tracker.written) {
      // Calculated but not written - potential violation
      setTimeout(() => {
        const updatedTracker = pathwayTracker.get(fieldId);
        if (
          updatedTracker &&
          updatedTracker.calculated &&
          !updatedTracker.written
        ) {
          logViolation({
            type: "CALCULATED_NOT_WRITTEN",
            field: fieldId,
            message: `Field ${fieldId} was calculated but never written to StateManager`,
            severity: "error",
          });
        }
      }, 100); // Give some time for write to occur
    }
  }

  /**
   * Detect state mixing violations
   */
  function detectStateMixing() {
    if (!mirrorTargetMode) return [];

    const violations = [];
    const targetBaseline = baseline.get("Target");
    const referenceBaseline = baseline.get("Reference");

    if (!targetBaseline || !referenceBaseline) return violations;

    // Check for divergence in fields that should match
    for (const [fieldId, targetValue] of targetBaseline) {
      if (shouldMatch(fieldId)) {
        const referenceValue = referenceBaseline.get(fieldId);

        if (referenceValue !== targetValue) {
          violations.push({
            type: "BASELINE_DIVERGENCE",
            field: fieldId,
            reference: referenceValue,
            target: targetValue,
            message: `Field ${fieldId} diverged: Target="${targetValue}", Reference="${referenceValue}"`,
          });
        }
      }
    }

    return violations;
  }

  /**
   * Detect stale values with intelligent flow-aware categorization
   * Uses actual calculation order from Calculator.js to determine if stale values matter
   */
  function detectStaleValues() {
    const staleThreshold = 5000; // 5 seconds
    const currentTime = performance.now();
    const violations = [];

    // Actual calculation flow order from Calculator.js (lines 488-506)
    const calculationOrder = [
      "sect02",
      "sect03",
      "sect08",
      "sect09",
      "sect12",
      "sect10",
      "sect11",
      "sect07",
      "sect13",
      "sect06",
      "sect14",
      "sect04",
      "sect05",
      "sect15",
      "sect01",
    ];

    // Critical integration points - these fields flow data between sections
    const criticalIntegrationFields = {
      // S15 → S01 (Key Values dashboard) - S01 is state agnostic
      h_136: { priority: "error", reason: "TEUI Summary feeds dashboard" },
      d_144: { priority: "error", reason: "Reduction % feeds dashboard" },
      h_10: {
        priority: "error",
        reason: "Target TEUI for dashboard (state agnostic)",
      },
      k_10: { priority: "error", reason: "Actual TEUI for dashboard" },
      e_10: {
        priority: "error",
        reason: "Reference TEUI for dashboard (state agnostic)",
      },

      // S04 → S05, S15 (Energy flows to Emissions and Summary)
      f_32: { priority: "error", reason: "Actual energy total for emissions" },
      j_32: { priority: "error", reason: "Target energy total for TEUI calc" },

      // S14 → S15 (TEDI flows to TEUI Summary)
      h_126: { priority: "warning", reason: "TEDI feeds TEUI Summary" },
      h_130: { priority: "warning", reason: "TELI feeds TEUI Summary" },

      // S10, S11, S12, S13 → S14 (Building performance feeds TEDI)
      i_80: { priority: "warning", reason: "Radiant gains feed TEDI" },
      d_117: { priority: "warning", reason: "Mechanical loads feed TEDI" },
      m_121: { priority: "warning", reason: "Mechanical totals feed TEDI" },

      // S07 → S15 (Water use feeds summary)
      k_51: { priority: "warning", reason: "Water use feeds TEUI Summary" },

      // S06 → S15 (Renewable energy feeds summary)
      m_43: {
        priority: "warning",
        reason: "PV contribution feeds TEUI Summary",
      },

      // Reference equivalents of critical fields
      ref_h_136: {
        priority: "error",
        reason: "Reference TEUI Summary feeds dashboard",
      },
      ref_d_144: {
        priority: "error",
        reason: "Reference reduction % feeds dashboard",
      },
      ref_f_32: { priority: "error", reason: "Reference actual energy total" },
      ref_j_32: { priority: "error", reason: "Reference target energy total" },
    };

    // Fields that are legitimately upstream and being stale is normal
    const upstreamFields = {
      // S02 Building Info - rarely changes once set
      d_85: true,
      d_86: true,
      d_89: true,
      d_90: true,
      d_91: true,
      d_92: true,
      d_95: true,
      h_15: true, // Conditioned area
      d_12: true,
      d_63: true, // Occupancy type

      // S03 Climate - set once per location
      d_20: true,
      d_21: true,
      d_23: true,
      d_24: true, // Weather data
      h_23: true,
      h_24: true, // Setpoints

      // S08 IAQ - often not modified
      d_56: true,
      d_57: true,
      d_58: true,

      // Reference versions
      ref_d_85: true,
      ref_d_86: true,
      ref_d_89: true,
      ref_d_90: true,
      ref_d_91: true,
      ref_d_92: true,
      ref_d_95: true,
      ref_h_15: true,
      ref_d_12: true,
      ref_d_63: true,
      ref_d_20: true,
      ref_d_21: true,
      ref_d_23: true,
      ref_d_24: true,
      ref_h_23: true,
    };

    for (const [fieldId, metadata] of staleDetector) {
      if (currentTime - metadata.lastWrite > staleThreshold) {
        const age = currentTime - metadata.lastWrite;
        const ageSeconds = (age / 1000).toFixed(1);

        // Determine violation type and severity based on field importance
        let violationType = "STALE_VALUE";
        let severity = "info";
        let message = `Field ${fieldId} hasn't been updated in ${ageSeconds}s`;

        if (criticalIntegrationFields[fieldId]) {
          const critical = criticalIntegrationFields[fieldId];
          violationType = "CRITICAL_STALE_VALUE";
          severity = critical.priority;
          message = `Critical integration field ${fieldId} stale for ${ageSeconds}s - ${critical.reason}`;
        } else if (upstreamFields[fieldId]) {
          // Upstream fields being stale is usually normal
          violationType = "UPSTREAM_STALE_VALUE";
          severity = "info";
          message = `Upstream field ${fieldId} stale for ${ageSeconds}s (normal for input fields)`;
        } else {
          // Check if this is a calculated field that should be updating
          const fieldTracker = pathwayTracker.get(fieldId);
          const readCount = fieldTracker
            ? fieldTracker.operations.filter((op) => op.operation === "read")
                .length
            : 0;

          if (readCount > 5) {
            // High-traffic field that's stale might indicate calculation issues
            violationType = "HIGH_TRAFFIC_STALE_VALUE";
            severity = "warning";
            message = `High-traffic field ${fieldId} stale for ${ageSeconds}s (${readCount} reads) - may indicate calculation issue`;
          } else {
            // Regular stale value - probably not important
            violationType = "NORMAL_STALE_VALUE";
            severity = "info";
            message = `Field ${fieldId} stale for ${ageSeconds}s (low traffic, likely unimportant)`;
          }
        }

        violations.push({
          type: violationType,
          field: fieldId,
          age: age,
          lastValue: metadata.value,
          message: message,
          severity: severity,
          analysis: {
            category:
              severity === "error"
                ? "critical_integration_stale"
                : severity === "warning"
                  ? "high_traffic_stale"
                  : upstreamFields[fieldId]
                    ? "upstream_stale"
                    : "normal_stale",
            recommendations:
              severity === "error"
                ? [
                    "Check calculation chain",
                    "Verify section dependencies",
                    "Review Calculator.js order",
                  ]
                : severity === "warning"
                  ? [
                      "Monitor calculation performance",
                      "Check if field should be updating",
                    ]
                  : [
                      "Normal behavior for input fields",
                      "No action needed unless actively editing",
                    ],
          },
        });
      }
    }

    return violations;
  }

  /**
   * Detect pathway violations (calculated but not written, etc.)
   */
  function detectPathwayViolations() {
    const violations = [];

    for (const [fieldId, tracker] of pathwayTracker) {
      // Check for calculated but not written
      if (tracker.calculated && !tracker.written) {
        violations.push({
          type: "CALCULATED_NOT_WRITTEN",
          field: fieldId,
          message: `Field ${fieldId} was calculated but never written to StateManager`,
        });
      }

      // Check for reads from missing sources
      const readOps = tracker.operations.filter(
        (op) => op.operation === "read",
      );
      const nullReads = readOps.filter(
        (op) => op.value === null || op.value === undefined,
      );

      if (nullReads.length > 0) {
        violations.push({
          type: "FALLBACK_READ",
          field: fieldId,
          count: nullReads.length,
          message: `Field ${fieldId} returned null/undefined ${nullReads.length} times`,
        });
      }
    }

    return violations;
  }

  /**
   * Get all current violations
   */
  function getAllViolations() {
    let allViolations = [...violations]; // Current logged violations

    // Add fresh detection results
    allViolations = allViolations.concat(detectStateMixing());
    allViolations = allViolations.concat(detectStaleValues());
    allViolations = allViolations.concat(detectPathwayViolations());

    return allViolations;
  }

  /**
   * Generate and copy QC report to clipboard (for modal dashboard button)
   */
  function generateAndCopyQCReport() {
    console.log("[QCMonitor] Generating and copying QC report to clipboard...");

    // Generate the full report
    const report = generateQCReport();

    if (!report) {
      console.error("[QCMonitor] Failed to generate report");
      showCopyNotification("Failed to generate QC report", "error");
      return;
    }

    // Format report for Logs.md (using S18's formatting function if available)
    let formattedReport;
    if (window.TEUI?.SectionModules?.sect18?.formatReportForLogs) {
      formattedReport =
        window.TEUI.SectionModules.sect18.formatReportForLogs(report);
    } else {
      // Fallback formatting
      formattedReport = formatReportForClipboard(report);
    }

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(formattedReport)
        .then(() => {
          showCopyNotification("QC Report copied to clipboard!", "success");
          console.log("[QCMonitor] Report copied to clipboard successfully");
        })
        .catch((err) => {
          console.error("[QCMonitor] Failed to copy to clipboard:", err);
          showCopyNotification("Failed to copy to clipboard", "error");
        });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = formattedReport;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      showCopyNotification("QC Report copied to clipboard!", "success");
    }
  }

  /**
   * Format QC report for clipboard (fallback if S18 formatter not available)
   */
  function formatReportForClipboard(report) {
    const timestamp = new Date(report.timestamp).toLocaleDateString();

    let content = `## QC Report ${timestamp}\n\n`;
    content += `**Summary**: ${report.summary.total} violations detected\n`;
    content += `**Types**: ${Object.entries(report.summary.byType)
      .map(([type, count]) => `${type}(${count})`)
      .join(", ")}\n`;
    content += `**Sections**: All Sections\n`;
    content += `**Status**: QC monitoring ${report.monitoring.active ? "active" : "inactive"}, Mirror Target ${report.monitoring.mirrorTarget ? "enabled" : "disabled"}\n\n`;

    // Add violation categories
    const categoryCounts = {};
    report.violations.forEach((v) => {
      const category = v.analysis?.category || "unknown";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    content += `### Violation Categories:\n`;
    Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([category, count]) => {
        const categoryMap = {
          critical_integration_stale:
            "🔥 Critical Integration Stale (affects data flow)",
          high_traffic_stale: "⚠️ High Traffic Stale (calculation issues)",
          upstream_stale: "📤 Upstream Stale (normal for input fields)",
          normal_stale: "💤 Normal Stale (low priority)",
          undefined_field: "🚫 Undefined Fields (not defined anywhere)",
          orphaned_ref_field:
            "🔗 Orphaned Reference Fields (ref_ without base)",
          calculation_failure: "💥 Calculation Failures (never computed)",
          timing_race_condition: "⏱️ Race Conditions (timing issues)",
          early_initialization: "ℹ️ Early Reads (initialization phase)",
          unregistered_field:
            "📝 Unregistered Fields (defined but not in StateManager)",
          standard_missing: "❓ Standard Missing Values",
        };
        const description =
          categoryMap[category] || `${category} (unknown category)`;
        content += `- **${description}**: ${count} violations\n`;
      });

    content += `\n### Top Priority Violations:\n`;

    // Show only critical violations in the quick copy version
    const criticalViolations = report.violations.filter(
      (v) => v.severity === "error",
    );
    const warningViolations = report.violations
      .filter((v) => v.severity === "warning")
      .slice(0, 10);

    if (criticalViolations.length > 0) {
      content += `#### 🔥 Critical Issues (${criticalViolations.length}):\n`;
      criticalViolations.forEach((v) => {
        content += `- **${v.type}**: \`${v.field}\` - ${v.message}\n`;
      });
    }

    if (warningViolations.length > 0) {
      content += `\n#### ⚠️ Top Warnings (${warningViolations.length} shown):\n`;
      warningViolations.forEach((v) => {
        content += `- **${v.type}**: \`${v.field}\` - ${v.message}\n`;
      });
    }

    content += `\n*For complete detailed report, visit S18 Notes section*`;

    return content;
  }

  /**
   * Show copy notification modal
   */
  function showCopyNotification(message, type = "success") {
    // Remove any existing notification
    const existing = document.getElementById("qc-copy-notification");
    if (existing) {
      existing.remove();
    }

    // Create notification modal
    const notification = document.createElement("div");
    notification.id = "qc-copy-notification";
    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === "success" ? "rgba(40, 167, 69, 0.95)" : "rgba(220, 53, 69, 0.95)"};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10002;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            max-width: 400px;
            text-align: center;
        `;

    const icon = type === "success" ? "✅" : "❌";
    notification.innerHTML = `${icon} ${message}`;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds with fade out
    setTimeout(() => {
      notification.style.transition = "opacity 0.3s ease-out";
      notification.style.opacity = "0";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  /**
   * Generate comprehensive QC report
   */
  function generateQCReport() {
    const allViolations = getAllViolations();

    const report = {
      timestamp: new Date().toISOString(),
      monitoring: {
        active: isActive,
        mirrorTarget: mirrorTargetMode,
        overhead: {
          totalCalls: monitoringOverhead.totalCalls,
          avgTime:
            monitoringOverhead.totalCalls > 0
              ? (
                  monitoringOverhead.totalTime / monitoringOverhead.totalCalls
                ).toFixed(3) + "ms"
              : "0ms",
          totalTime: monitoringOverhead.totalTime.toFixed(3) + "ms",
        },
      },
      summary: {
        total: allViolations.length,
        byType: allViolations.reduce((acc, v) => {
          acc[v.type] = (acc[v.type] || 0) + 1;
          return acc;
        }, {}),
        bySeverity: allViolations.reduce((acc, v) => {
          const severity = v.severity || "info";
          acc[severity] = (acc[severity] || 0) + 1;
          return acc;
        }, {}),
      },
      violations: allViolations.sort((a, b) => {
        // Sort by severity (error > warning > info)
        const severityOrder = { error: 3, warning: 2, info: 1 };
        return (
          (severityOrder[b.severity] || 1) - (severityOrder[a.severity] || 1)
        );
      }),
    };

    // Console output
    if (allViolations.length > 0) {
      console.group("[QCMonitor] 🚨 QUALITY CONTROL REPORT");
      console.log(`Total violations: ${report.summary.total}`);
      console.table(report.summary.byType);

      if (report.violations.length > 0) {
        console.group("Violations by severity:");
        report.violations.forEach((violation) => {
          const emoji =
            violation.severity === "error"
              ? "❌"
              : violation.severity === "warning"
                ? "⚠️"
                : "ℹ️";
          console.log(`${emoji} ${violation.type}: ${violation.message}`);
        });
        console.groupEnd();
      }

      console.groupEnd();
    } else {
      console.log("[QCMonitor] ✅ No violations detected");
    }

    return report;
  }

  /**
   * Perform periodic checks (called every second)
   */
  function performPeriodicChecks() {
    if (!isActive) return;

    // Check for new violations
    const newViolations = detectStateMixing()
      .concat(detectStaleValues())
      .concat(detectStateContamination())
      .concat(detectMissingRefValues());

    // Log any new critical violations immediately
    newViolations.forEach((violation) => {
      if (violation.severity === "error") {
        console.error(`[QCMonitor] 🚨 ${violation.type}: ${violation.message}`);
      }
    });
  }

  /**
   * Detect state contamination by checking for suspicious value patterns
   */
  function detectStateContamination() {
    if (!window.TEUI?.StateManager) return [];

    const violations = [];
    const stateManager = window.TEUI.StateManager;

    // Check for known contamination patterns
    const criticalFields = ["h_10", "e_10", "j_32", "k_32"];

    criticalFields.forEach((fieldId) => {
      const targetValue = stateManager.getValue(fieldId);
      const refValue = stateManager.getValue(`ref_${fieldId}`);

      // If both exist and are identical, might be contamination
      if (targetValue && refValue && targetValue === refValue) {
        violations.push({
          type: "POTENTIAL_STATE_CONTAMINATION",
          field: fieldId,
          message: `Target and Reference values are identical: ${targetValue}`,
          severity: "warning",
          target: targetValue,
          reference: refValue,
        });
      }
    });

    return violations;
  }

  /**
   * Detect missing Reference values that should exist
   */
  function detectMissingRefValues() {
    if (!window.TEUI?.StateManager) return [];

    const violations = [];
    const stateManager = window.TEUI.StateManager;

    // Check for missing ref_ values where Target values exist
    // NOTE: Excludes h_10 and e_10 since S01 is state agnostic (h_10=Target, e_10=Reference)
    const expectedRefFields = ["d_20", "d_21", "h_15", "j_32", "k_32", "i_98"];

    expectedRefFields.forEach((fieldId) => {
      const targetValue = stateManager.getValue(fieldId);
      const refValue = stateManager.getValue(`ref_${fieldId}`);

      if (targetValue && !refValue) {
        violations.push({
          type: "MISSING_REFERENCE_VALUE",
          field: `ref_${fieldId}`,
          message: `Target ${fieldId} exists but ref_${fieldId} is missing`,
          severity: "error",
          targetValue: targetValue,
        });
      }
    });

    return violations;
  }

  /**
   * Analyze current StateManager contents for debugging
   */
  function analyzeStateManagerContents() {
    if (!window.TEUI?.StateManager) return null;

    const stateManager = window.TEUI.StateManager;
    const analysis = {
      totalFields: 0,
      targetFields: 0,
      referenceFields: 0,
      suspiciousPatterns: [],
      sampleFields: {},
    };

    // Try to get all values if method exists
    if (typeof stateManager.getAllValues === "function") {
      const allValues = stateManager.getAllValues();

      Object.entries(allValues).forEach(([key, value]) => {
        analysis.totalFields++;
        analysis.sampleFields[key] = value;

        if (key.startsWith("ref_")) {
          analysis.referenceFields++;
        } else {
          analysis.targetFields++;
        }
      });
    } else {
      // Fallback: check specific known fields
      const knownFields = [
        "h_10",
        "e_10",
        "j_32",
        "k_32",
        "d_20",
        "d_21",
        "h_15",
      ];

      knownFields.forEach((fieldId) => {
        const targetValue = stateManager.getValue(fieldId);

        // EXCLUDE S01 REFERENCE FIELDS: S01 is state agnostic (h_10=Target, e_10=Reference)
        if (fieldId !== "h_10" && fieldId !== "e_10") {
          const refValue = stateManager.getValue(`ref_${fieldId}`);
          if (refValue !== null) {
            analysis.referenceFields++;
            analysis.sampleFields[`ref_${fieldId}`] = refValue;
          }
        }

        if (targetValue !== null) {
          analysis.targetFields++;
          analysis.sampleFields[fieldId] = targetValue;
        }
      });
    }

    console.group("[QCMonitor] 📊 StateManager Analysis");
    console.log(`Total fields: ${analysis.totalFields}`);
    console.log(`Target fields: ${analysis.targetFields}`);
    console.log(`Reference fields: ${analysis.referenceFields}`);
    console.log("Sample fields:", analysis.sampleFields);
    console.groupEnd();

    return analysis;
  }

  /**
   * Log a violation
   */
  function logViolation(violation) {
    violation.timestamp = violation.timestamp || performance.now();
    violation.id = `${violation.type}_${violation.field}_${Date.now()}`;

    violations.push(violation);

    // Immediate console output for critical violations
    if (violation.severity === "error") {
      console.error(`[QCMonitor] 🚨 ${violation.type}: ${violation.message}`);
    } else if (violation.severity === "warning") {
      console.warn(`[QCMonitor] ⚠️ ${violation.type}: ${violation.message}`);
    }
  }

  /**
   * Determine if a write operation should be logged
   */
  function shouldLogWrite(fieldId, source) {
    // Log critical fields and state mixing indicators
    const criticalFields = [
      "h_10",
      "e_10",
      "j_32",
      "k_32",
      "ref_j_32",
      "ref_k_32",
    ];
    const criticalSources = ["calculated", "user-modified"];

    return criticalFields.includes(fieldId) || criticalSources.includes(source);
  }

  /**
   * Update performance metrics
   */
  function updatePerformanceMetrics(startTime) {
    const duration = performance.now() - startTime;
    monitoringOverhead.totalCalls++;
    monitoringOverhead.totalTime += duration;
  }

  /**
   * Create QC Dashboard UI (basic implementation)
   */
  function createQCDashboard() {
    if (!isActive) return;

    // Create dashboard container
    const dashboard = document.createElement("div");
    dashboard.id = "qc-dashboard";
    dashboard.style.cssText = `
            position: fixed;
            top: 110px;
            right: 10px;
            width: 300px;
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            font-size: 12px;
        `;

    // Dashboard content
    dashboard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h6 style="margin: 0; color: #333;">QC Monitor</h6>
                <button id="qc-close" style="border: none; background: none; font-size: 16px; cursor: pointer;">×</button>
            </div>
            <div id="qc-status">
                <div>Status: <span style="color: green;">Active</span></div>
                <div>Mirror Target: <span>${mirrorTargetMode ? "Enabled" : "Disabled"}</span></div>
            </div>
            <div id="qc-violations" style="margin-top: 10px;">
                <div>Violations: <span id="violation-count">0</span></div>
                <div style="font-size: 10px; color: #666; margin-top: 5px;">
                    <span id="error-count">0 errors</span> | 
                    <span id="warning-count">0 warnings</span>
                </div>
            </div>
            <button id="qc-report" style="width: 100%; margin-top: 10px; padding: 5px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                📋 Copy Report to Clipboard
            </button>
        `;

    // Add event listeners
    dashboard.querySelector("#qc-close").onclick = () => dashboard.remove();
    dashboard.querySelector("#qc-report").onclick = () =>
      generateAndCopyQCReport();

    // Append to body
    document.body.appendChild(dashboard);

    // Update dashboard every 2 seconds
    setInterval(updateQCDashboard, 2000);

    console.log("[QCMonitor] QC Dashboard created");
  }

  /**
   * Update QC Dashboard with current violation counts
   */
  function updateQCDashboard() {
    const dashboard = document.getElementById("qc-dashboard");
    if (!dashboard) return;

    const allViolations = getAllViolations();
    const errorCount = allViolations.filter(
      (v) => v.severity === "error",
    ).length;
    const warningCount = allViolations.filter(
      (v) => v.severity === "warning",
    ).length;

    const violationCountEl = dashboard.querySelector("#violation-count");
    const errorCountEl = dashboard.querySelector("#error-count");
    const warningCountEl = dashboard.querySelector("#warning-count");

    if (violationCountEl) violationCountEl.textContent = allViolations.length;
    if (errorCountEl) errorCountEl.textContent = `${errorCount} errors`;
    if (warningCountEl) warningCountEl.textContent = `${warningCount} warnings`;

    // Update colors based on violation severity
    if (errorCount > 0) {
      violationCountEl.style.color = "red";
    } else if (warningCount > 0) {
      violationCountEl.style.color = "orange";
    } else {
      violationCountEl.style.color = "green";
    }
  }

  /**
   * Force activate QC monitoring (for Section 18 toggle)
   */
  function forceActivate() {
    isActive = true;
    console.log("[QCMonitor] 🔍 Force activated by Section 18");

    // Initialize tracking structures
    baseline.clear();
    violations = [];
    staleDetector.clear();
    pathwayTracker.clear();

    // Hook into StateManager if available
    if (window.TEUI?.StateManager) {
      instrumentStateManager();
    }

    return true;
  }

  /**
   * Force deactivate QC monitoring
   */
  function forceDeactivate() {
    isActive = false;
    console.log("[QCMonitor] QC monitoring deactivated");
    return false;
  }

  // Public API
  return {
    initialize,
    isActive: () => isActive,
    generateQCReport,
    getAllViolations,
    detectStateMixing,
    detectStaleValues,
    detectPathwayViolations,
    detectStateContamination,
    detectMissingRefValues,
    analyzeStateManagerContents,
    initializeMirrorTarget,
    createQCDashboard,
    logViolation,
    forceActivate,
    forceDeactivate,
  };
})();

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  // Small delay to ensure other modules are loaded
  setTimeout(() => {
    if (TEUI.QCMonitor.initialize()) {
      // Create dashboard if QC is active
      setTimeout(() => {
        TEUI.QCMonitor.createQCDashboard();
      }, 1000);
    }
  }, 500);
});

// Export for global access
window.TEUI.QCMonitor = TEUI.QCMonitor;
