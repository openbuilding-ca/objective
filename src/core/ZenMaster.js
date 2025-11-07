/**
 * ZenMaster.js - Runtime Dependency Discovery & Validation
 *
 * The ZenMaster observes the application during calculations to discover
 * the TRUE dependency graph based on actual getValue() calls, not manual
 * declarations. It validates manual dependencies and generates the "graph
 * of reality" that can be used to optimize Dependency.js.
 *
 * Philosophy: Truth over intention. What the code DOES, not what we THINK it does.
 *
 * DOCUMENTATION: Complete usage instructions available at:
 * docs/development/dependency-zen.md
 *
 * Includes:
 * - Human user guide (3-click workflow with 🧘 Zen button)
 * - AI agent integration instructions
 * - Workflow examples and validation checklists
 * - Common dependency patterns and anti-patterns
 *
 * INTEGRATION WITH CALCULATOR.JS:
 * - ZenMaster traces getValue() calls during Calculator.calculateAll()
 * - Discovers actual dependencies vs declared dependencies
 * - Works with section-ordered calculation flow
 * - Should observe Clock.js performance metrics to learn optimization impact
 * - Use traced dependencies to reorder Calculator sections for better performance
 *
 * INTEGRATION WITH CLOCK.JS:
 * - Clock.js measures calculation performance (timing metrics)
 * - ZenMaster discovers calculation dependencies (what depends on what)
 * - Together they enable:
 *   1. ZenMaster finds true dependency graph
 *   2. Clock.js measures current performance
 *   3. Reorder Calculator sections based on ZenMaster graph
 *   4. Clock.js validates performance improvement
 *   5. Iterate until optimal calculation flow achieved
 */

window.TEUI = window.TEUI || {};

window.TEUI.ZenMaster = class ZenMaster {
  constructor() {
    this.isTracing = false;
    this.isEnabled = false;
    this.currentCalculation = null; // Which field is currently being calculated
    this.calculationStack = []; // Stack for nested calculations
    this.dependencies = new Map(); // Map<fieldId, Set<dependencyFieldIds>>
    this.accessLog = []; // Detailed log of all getValue calls
    this.validationResults = null;

    // Mode tracking for Target/Reference state isolation
    this.currentMode = 'target'; // 'target' or 'reference'

    // Track original methods for restoration
    this.originalGetValue = null;
    this.originalSetValue = null;
  }

  /**
   * Enable the ZenMaster to start observing the application
   */
  enable() {
    if (this.isEnabled) {
      console.warn('[ZenMaster] Already enabled');
      return;
    }

    console.log('🧘 [ZenMaster] Enabling runtime dependency tracing...');

    // Intercept StateManager.getValue to track field accesses
    this.interceptStateManager();

    this.isEnabled = true;
    console.log('✅ [ZenMaster] Enabled. All getValue() calls will be traced.');
  }

  /**
   * Disable the ZenMaster and restore original methods
   */
  disable() {
    if (!this.isEnabled) {
      console.warn('[ZenMaster] Not currently enabled');
      return;
    }

    console.log('🧘 [ZenMaster] Disabling runtime dependency tracing...');

    // Restore original methods
    this.restoreStateManager();

    this.isEnabled = false;
    console.log('✅ [ZenMaster] Disabled. Original methods restored.');
  }

  /**
   * Intercept StateManager.getValue to track dependencies
   */
  interceptStateManager() {
    const stateManager = window.TEUI?.StateManager;
    if (!stateManager) {
      console.error('[ZenMaster] StateManager not found. Cannot enable tracing.');
      return;
    }

    // Store original methods
    this.originalGetValue = stateManager.getValue.bind(stateManager);
    this.originalSetValue = stateManager.setValue.bind(stateManager);

    // Replace getValue with tracing version
    const zenMaster = this;
    stateManager.getValue = function(fieldId) {
      // Call original method to get the value
      const value = zenMaster.originalGetValue(fieldId);

      // Record this access if we're tracing
      zenMaster.recordAccess(fieldId, value);

      return value;
    };

    // Replace setValue with tracing version
    stateManager.setValue = function(fieldId, value) {
      // Record that this field is being calculated/set
      zenMaster.recordSetValue(fieldId, value);

      // Call original method to set the value
      return zenMaster.originalSetValue(fieldId, value);
    };

    console.log('🔍 [ZenMaster] StateManager.getValue and setValue intercepted');
  }

  /**
   * Restore original StateManager methods
   */
  restoreStateManager() {
    const stateManager = window.TEUI?.StateManager;
    if (!stateManager || !this.originalGetValue) {
      return;
    }

    stateManager.getValue = this.originalGetValue;
    this.originalGetValue = null;

    if (this.originalSetValue) {
      stateManager.setValue = this.originalSetValue;
      this.originalSetValue = null;
    }

    console.log('🔄 [ZenMaster] StateManager.getValue and setValue restored');
  }

  /**
   * Start tracing dependencies for a specific field calculation
   * @param {string} fieldId - The field being calculated
   * @param {string} mode - 'target' or 'reference' calculation mode
   */
  startTrace(fieldId, mode = 'target') {
    this.isTracing = true;
    this.currentMode = mode;
    this.currentCalculation = fieldId;
    this.calculationStack.push({ fieldId, mode, dependencies: new Set() });

    console.log(`🎯 [ZenMaster] START trace: ${fieldId} (${mode} mode)`);
  }

  /**
   * Record a field access during calculation
   * @param {string} accessedFieldId - The field being read
   * @param {*} value - The value that was read
   */
  recordAccess(accessedFieldId, value) {
    if (!this.isEnabled) {
      return; // ZenMaster not enabled, skip recording
    }

    // Log all accesses when enabled (for general observation)
    this.accessLog.push({
      timestamp: Date.now(),
      calculatingField: this.currentCalculation || 'unknown',
      mode: this.currentMode,
      accessedField: accessedFieldId,
      value: value,
      stackDepth: this.calculationStack.length
    });

    // If we're in an active trace with calculation stack, record dependencies
    if (this.isTracing && this.calculationStack.length > 0) {
      const currentCalc = this.calculationStack[this.calculationStack.length - 1];

      // Don't record self-references
      if (accessedFieldId === currentCalc.fieldId) {
        return;
      }

      // Record the dependency
      currentCalc.dependencies.add(accessedFieldId);

      console.log(`  📖 [ZenMaster] ${currentCalc.fieldId} → reads → ${accessedFieldId} = ${value}`);
    }
  }

  /**
   * Record when a field value is being set (calculated field being updated)
   * This helps identify which field is currently being calculated
   * @param {string} fieldId - The field being set
   * @param {*} value - The value being set
   */
  recordSetValue(fieldId, value) {
    if (!this.isEnabled) {
      return; // ZenMaster not enabled, skip recording
    }

    // Update current calculation context
    // This tells recordAccess() which field is "consuming" dependencies
    this.currentCalculation = fieldId;

    // Log the setValue event
    this.accessLog.push({
      timestamp: Date.now(),
      type: 'setValue',
      calculatingField: fieldId,
      mode: this.currentMode,
      accessedField: fieldId,
      value: value,
      stackDepth: this.calculationStack.length
    });
  }

  /**
   * End tracing for the current field calculation
   * @returns {Set<string>} The discovered dependencies
   */
  endTrace() {
    if (!this.isTracing || this.calculationStack.length === 0) {
      console.warn('[ZenMaster] endTrace called but not currently tracing');
      return new Set();
    }

    const completed = this.calculationStack.pop();
    const { fieldId, mode, dependencies } = completed;

    // Store the discovered dependencies
    const key = mode === 'reference' ? `ref_${fieldId}` : fieldId;
    if (!this.dependencies.has(key)) {
      this.dependencies.set(key, new Set());
    }

    // Merge with existing dependencies (in case of multiple traces)
    const existing = this.dependencies.get(key);
    dependencies.forEach(dep => existing.add(dep));

    console.log(`✅ [ZenMaster] END trace: ${fieldId} (${mode}) → depends on [${Array.from(dependencies).join(', ')}]`);

    // If stack is empty, we're done tracing
    if (this.calculationStack.length === 0) {
      this.isTracing = false;
      this.currentCalculation = null;
    }

    return dependencies;
  }

  /**
   * Trace a section's calculateAll() function
   * @param {string} sectionId - Section identifier (e.g., 'sect10')
   * @param {Function} calculateFn - The calculation function to trace
   * @param {string} mode - 'target' or 'reference'
   */
  traceSection(sectionId, calculateFn, mode = 'target') {
    console.log(`\n🧘 [ZenMaster] ========== TRACING ${sectionId.toUpperCase()} (${mode} mode) ==========`);

    this.startTrace(`${sectionId}_calculateAll`, mode);

    try {
      calculateFn();
    } catch (error) {
      console.error(`[ZenMaster] Error during ${sectionId} calculation:`, error);
    } finally {
      this.endTrace();
    }

    console.log(`🧘 [ZenMaster] ========== END ${sectionId.toUpperCase()} ==========\n`);
  }

  /**
   * Build dependency map from access log (when no structured traces used)
   * Analyzes temporal patterns in access log to infer dependencies
   */
  buildDependenciesFromAccessLog() {
    if (this.accessLog.length === 0) {
      console.warn('[ZenMaster] No access events recorded. Enable ZenMaster and interact with the app.');
      return;
    }

    console.log(`🔍 [ZenMaster] Analyzing ${this.accessLog.length} access events...`);

    // Infer dependencies from access patterns:
    // When field X is set (setValue), any getValue calls immediately after are dependencies of X
    let currentField = null;
    let dependencyCount = 0;

    this.accessLog.forEach((event) => {
      // Check if this is a setValue event
      if (event.type === 'setValue') {
        currentField = event.calculatingField;

        // Initialize dependency set for this field
        if (!this.dependencies.has(currentField)) {
          this.dependencies.set(currentField, new Set());
        }
      }
      // If calculatingField changed, this is a new calculation context
      else if (event.calculatingField !== 'unknown' && event.calculatingField !== currentField) {
        currentField = event.calculatingField;

        // Initialize dependency set for this field
        if (!this.dependencies.has(currentField)) {
          this.dependencies.set(currentField, new Set());
        }
      }

      // Record getValue dependencies for current field
      if (currentField && event.type !== 'setValue' && event.accessedField !== currentField) {
        const deps = this.dependencies.get(currentField);
        if (deps && !deps.has(event.accessedField)) {
          deps.add(event.accessedField);
          dependencyCount++;
        }
      }
    });

    const fieldsWithDeps = Array.from(this.dependencies.entries()).filter(([_, deps]) => deps.size > 0);
    console.log(`✅ [ZenMaster] Discovered ${fieldsWithDeps.length} fields with ${dependencyCount} total dependencies`);
  }

  /**
   * Export the discovered dependency graph
   * @returns {Object} Dependency graph in Dependency.js compatible format
   */
  exportDependencyGraph() {
    // If dependencies map is empty but we have access log, try to build from log
    if (this.dependencies.size === 0 && this.accessLog.length > 0) {
      this.buildDependenciesFromAccessLog();
    }

    const graph = {
      nodes: [],
      links: []
    };

    // Build unique node set from access log (all fields that were accessed)
    const nodeSet = new Set();

    // Add all fields from structured dependencies
    this.dependencies.forEach((deps, fieldId) => {
      nodeSet.add(fieldId);
      deps.forEach(dep => nodeSet.add(dep));
    });

    // Also add all fields from access log
    this.accessLog.forEach(event => {
      nodeSet.add(event.accessedField);
    });

    // Create nodes
    graph.nodes = Array.from(nodeSet).map(id => ({
      id,
      label: this.getFieldLabel(id),
      group: this.getFieldSection(id)
    }));

    // Create links from structured dependencies
    this.dependencies.forEach((deps, fieldId) => {
      deps.forEach(dep => {
        graph.links.push({
          source: dep,
          target: fieldId
        });
      });
    });

    return graph;
  }

  /**
   * Get field label from FieldManager
   */
  getFieldLabel(fieldId) {
    const fieldManager = window.TEUI?.FieldManager;
    if (!fieldManager) return fieldId;

    const field = fieldManager.getField(fieldId);
    return field?.label || fieldId;
  }

  /**
   * Get field section from FieldManager
   */
  getFieldSection(fieldId) {
    const fieldManager = window.TEUI?.FieldManager;
    if (!fieldManager) return 'Other';

    const field = fieldManager.getField(fieldId);
    return field?.section || 'Other';
  }

  /**
   * Validate discovered dependencies against manual declarations
   *
   * ✅ ENHANCED: Now handles conditionalDeps and uiDeps metadata
   * - conditionalDeps: Dependencies used only in specific scenarios (not phantoms if unused)
   * - uiDeps: Dependencies for UI behavior (dropdown options, validation) - skip phantom check
   * - Also validates that dependency fields actually exist in FieldManager
   *
   * @returns {Object} Validation results with phantoms and missing deps categorized
   */
  validateDependencies() {
    console.log('\n🔍 [ZenMaster] ========== DEPENDENCY VALIDATION ==========');

    const results = {
      sections: {},
      summary: {
        totalFields: 0,
        fieldsWithPhantoms: 0,
        fieldsWithMissing: 0,
        totalPhantoms: 0,
        totalMissing: 0,
        totalConditional: 0,
        totalUIDeps: 0,
        totalNonExistent: 0
      }
    };

    const fieldManager = window.TEUI?.FieldManager;
    if (!fieldManager) {
      console.error('[ZenMaster] FieldManager not found');
      return results;
    }

    // Get all field definitions
    const allFields = fieldManager.getAllFields();

    // For each field with declared dependencies, compare to traced
    Object.entries(allFields).forEach(([fieldId, fieldDef]) => {
      const hasDeps = fieldDef.dependencies && fieldDef.dependencies.length > 0;
      const hasConditionalDeps = fieldDef.conditionalDeps && fieldDef.conditionalDeps.length > 0;
      const hasUIDeps = fieldDef.uiDeps && fieldDef.uiDeps.length > 0;

      if (!hasDeps && !hasConditionalDeps && !hasUIDeps) {
        return; // No declared dependencies to validate
      }

      // Combine all declared dependencies for comparison
      const declaredDeps = new Set([
        ...(fieldDef.dependencies || []),
        ...(fieldDef.conditionalDeps || []),
        ...(fieldDef.uiDeps || [])
      ]);

      const tracedDeps = this.dependencies.get(fieldId) || new Set();

      // Categorize phantom dependencies
      const phantoms = [];
      const conditionalPhantoms = [];
      const uiPhantoms = [];
      const nonExistentDeps = [];

      Array.from(declaredDeps).forEach(dep => {
        if (!tracedDeps.has(dep)) {
          // Check if dependency field exists
          if (!fieldManager.getField(dep)) {
            nonExistentDeps.push(dep);
            return;
          }

          // Check category
          if (fieldDef.uiDeps && fieldDef.uiDeps.includes(dep)) {
            uiPhantoms.push(dep); // UI dependency - expected to not show in trace
          } else if (fieldDef.conditionalDeps && fieldDef.conditionalDeps.includes(dep)) {
            conditionalPhantoms.push(dep); // Conditional - may not have been triggered
          } else {
            phantoms.push(dep); // True phantom - declared but never used
          }
        }
      });

      // Find missing (used but not declared in any category)
      const missing = Array.from(tracedDeps).filter(dep => !declaredDeps.has(dep));

      // Skip if no issues
      if (phantoms.length === 0 && missing.length === 0 && nonExistentDeps.length === 0) {
        // Log conditional/UI deps for awareness but don't flag as issues
        if (conditionalPhantoms.length > 0 || uiPhantoms.length > 0) {
          console.log(`\n✅ ${fieldId} (${fieldDef.label || 'unlabeled'})`);
          if (conditionalPhantoms.length > 0) {
            console.log(`  🔀 CONDITIONAL deps (not triggered): ${conditionalPhantoms.join(', ')}`);
          }
          if (uiPhantoms.length > 0) {
            console.log(`  🎨 UI deps (for dropdown/validation): ${uiPhantoms.join(', ')}`);
          }
        }
        return; // No true issues
      }

      // Record issues
      const section = fieldDef.section || 'unknown';
      if (!results.sections[section]) {
        results.sections[section] = [];
      }

      const issue = {
        fieldId,
        label: fieldDef.label || fieldId,
        type: fieldDef.type,
        declared: Array.from(declaredDeps).sort(),
        traced: Array.from(tracedDeps).sort(),
        phantoms,
        conditionalPhantoms,
        uiPhantoms,
        nonExistentDeps,
        missing
      };

      results.sections[section].push(issue);

      // Update summary
      results.summary.totalFields++;
      if (phantoms.length > 0) {
        results.summary.fieldsWithPhantoms++;
        results.summary.totalPhantoms += phantoms.length;
      }
      if (missing.length > 0) {
        results.summary.fieldsWithMissing++;
        results.summary.totalMissing += missing.length;
      }
      if (conditionalPhantoms.length > 0) {
        results.summary.totalConditional += conditionalPhantoms.length;
      }
      if (uiPhantoms.length > 0) {
        results.summary.totalUIDeps += uiPhantoms.length;
      }
      if (nonExistentDeps.length > 0) {
        results.summary.totalNonExistent += nonExistentDeps.length;
      }

      // Log the issue with categorization
      console.log(`\n⚠️ ${fieldId} (${fieldDef.label || 'unlabeled'}) [type: ${fieldDef.type || 'unknown'}]`);
      if (nonExistentDeps.length > 0) {
        console.log(`  🚫 NON-EXISTENT deps (field doesn't exist): ${nonExistentDeps.join(', ')}`);
      }
      if (phantoms.length > 0) {
        console.log(`  ❌ TRUE PHANTOM deps (declared but never used): ${phantoms.join(', ')}`);
      }
      if (conditionalPhantoms.length > 0) {
        console.log(`  🔀 CONDITIONAL deps (not triggered in this test): ${conditionalPhantoms.join(', ')}`);
      }
      if (uiPhantoms.length > 0) {
        console.log(`  🎨 UI deps (for dropdown/validation, not calculation): ${uiPhantoms.join(', ')}`);
      }
      if (missing.length > 0) {
        console.log(`  ➕ MISSING deps (used but not declared): ${missing.join(', ')}`);
      }
    });

    this.validationResults = results;

    console.log('\n📊 [ZenMaster] ========== VALIDATION SUMMARY ==========');
    console.log(`Total fields validated: ${results.summary.totalFields}`);
    console.log(`Fields with TRUE phantom deps: ${results.summary.fieldsWithPhantoms} (${results.summary.totalPhantoms} phantoms)`);
    console.log(`Fields with missing deps: ${results.summary.fieldsWithMissing} (${results.summary.totalMissing} missing)`);
    console.log(`Conditional deps not triggered: ${results.summary.totalConditional}`);
    console.log(`UI-only deps (expected): ${results.summary.totalUIDeps}`);
    console.log(`Non-existent dependency fields: ${results.summary.totalNonExistent} ⚠️`);
    console.log('==========================================================\n');

    return results;
  }

  /**
   * Generate a report of discovered dependencies
   * @returns {string} Formatted report
   */
  generateReport() {
    const lines = [];
    lines.push('');
    lines.push('🧘 ZenMaster Dependency Discovery Report');
    lines.push('========================================');
    lines.push('');
    lines.push(`Total fields traced: ${this.dependencies.size}`);
    lines.push(`Total access events: ${this.accessLog.length}`);
    lines.push('');
    lines.push('Discovered Dependencies:');
    lines.push('');

    // Sort by field ID
    const sorted = Array.from(this.dependencies.entries()).sort((a, b) => a[0].localeCompare(b[0]));

    sorted.forEach(([fieldId, deps]) => {
      const depsArray = Array.from(deps).sort();
      lines.push(`${fieldId}:`);
      lines.push(`  dependencies: [${depsArray.map(d => `"${d}"`).join(', ')}]`);
      lines.push('');
    });

    return lines.join('\n');
  }

  /**
   * Clear all traced data (useful for fresh traces)
   */
  reset() {
    this.dependencies.clear();
    this.accessLog = [];
    this.calculationStack = [];
    this.validationResults = null;
    console.log('🧹 [ZenMaster] Trace data cleared');
  }

  /**
   * Helper: Wrap a calculation function with automatic tracing
   * @param {string} fieldId - Field being calculated
   * @param {Function} calculationFn - The calculation function
   * @param {string} mode - 'target' or 'reference'
   * @returns {*} Result of the calculation
   */
  trace(fieldId, calculationFn, mode = 'target') {
    this.startTrace(fieldId, mode);
    try {
      const result = calculationFn();
      return result;
    } finally {
      this.endTrace();
    }
  }

  /**
   * Export discovered dependencies to JSON file for Dependency.js
   * Downloads a JSON file with the true dependency graph
   */
  exportToFile() {
    const graph = this.exportDependencyGraph();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `zen-dependencies-${timestamp}.json`;

    const dataStr = JSON.stringify(graph, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`📥 [ZenMaster] Exported ${graph.nodes.length} nodes and ${graph.links.length} links to ${filename}`);
  }

  /**
   * Export field dependencies in section definition format
   * Generates code snippets that can be copied into section files
   */
  exportForSections() {
    const lines = [];
    lines.push('// ZenMaster Discovered Dependencies');
    lines.push('// Copy these into your section field definitions\n');

    // Group by section
    const bySection = new Map();

    this.dependencies.forEach((deps, fieldId) => {
      const section = this.getFieldSection(fieldId);
      if (!bySection.has(section)) {
        bySection.set(section, []);
      }
      bySection.get(section).push({ fieldId, deps: Array.from(deps).sort() });
    });

    // Generate formatted output
    bySection.forEach((fields, section) => {
      lines.push(`\n// ${section}`);
      fields.forEach(({ fieldId, deps }) => {
        if (deps.length > 0) {
          lines.push(`  ${fieldId}: {`);
          lines.push(`    dependencies: [${deps.map(d => `"${d}"`).join(', ')}],`);
          lines.push(`  },`);
        }
      });
    });

    const output = lines.join('\n');
    console.log(output);
    return output;
  }

  /**
   * Get tracing status and statistics
   */
  getStatus() {
    return {
      enabled: this.isEnabled,
      tracing: this.isTracing,
      fieldsTracked: this.dependencies.size,
      accessEvents: this.accessLog.length,
      currentCalculation: this.currentCalculation,
      mode: this.currentMode
    };
  }
};

// Create global instance
window.TEUI.zenMaster = new window.TEUI.ZenMaster();

// Expose convenience methods globally
window.zenEnable = () => window.TEUI.zenMaster.enable();
window.zenDisable = () => window.TEUI.zenMaster.disable();
window.zenReset = () => window.TEUI.zenMaster.reset();
window.zenReport = () => console.log(window.TEUI.zenMaster.generateReport());
window.zenValidate = () => window.TEUI.zenMaster.validateDependencies();
window.zenExport = () => window.TEUI.zenMaster.exportDependencyGraph();
window.zenExportFile = () => window.TEUI.zenMaster.exportToFile();
window.zenExportSections = () => window.TEUI.zenMaster.exportForSections();
window.zenStatus = () => console.table(window.TEUI.zenMaster.getStatus());

console.log(`
🧘 ZenMaster loaded. Use these commands to discover true dependencies:

  zenEnable()         - Start tracing all getValue() calls
  zenDisable()        - Stop tracing and restore original methods
  zenReset()          - Clear all traced data
  zenReport()         - Print discovered dependencies
  zenValidate()       - Compare discovered vs declared dependencies
  zenExport()         - Export dependency graph JSON to console
  zenExportFile()     - Download dependency graph as JSON file
  zenExportSections() - Generate code snippets for section definitions
  zenStatus()         - Show current tracing status

Example workflow:
  1. zenEnable()
  2. Interact with the app (change values, trigger calculations)
  3. zenValidate()
  4. zenExportFile()    // Download for use in Dependency.js
  5. zenDisable()
`);
