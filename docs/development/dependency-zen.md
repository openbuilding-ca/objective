# Dependency Zen: Automatic Dependency Discovery & Graph Optimization

**Status**: Conceptual Framework
**Date**: January 2025
**Goal**: Replace manual dependency registration with automatic runtime discovery to create an accurate, maintainable dependency graph that can drive calculation optimization.

---

## The Problem: "Listener Spaghetti" & Stale Dependencies

### Current State Issues

1. **Manual dependency registration is error-prone**
   - Example: `i_82` listed dependencies as `["h_80", "k_80"]` but those fields don't exist
   - Phantom nodes appear in dependency graph (h_80, k_80)
   - Should have been `["e_80", "i_80"]` (Total Gains - Usable Gains)

2. **Dependencies become stale as calculations evolve**
   - Code changes but dependency arrays aren't updated
   - Graph shows incorrect relationships
   - Impossible to trust for optimization

3. **Incomplete dependency coverage**
   - Section 04's row 32 fields (k_32, j_32, f_32, g_32) had NO dependencies registered
   - These are critical summary calculations but were invisible to the graph
   - Manually added: k_32 depends on k_27-k_31 + d_60 (wood offset)

4. **"Listener spaghetti"**
   - Cross-section listeners trigger cascading calculations
   - No clear execution order
   - Redundant recalculations
   - Performance bottlenecks
   - Difficult to debug

---

## The Vision: Truth Over Intention

Instead of **declaring** what fields depend on what, we **discover** the actual runtime dependencies by:

1. **Tracing every `getValue()` call** during calculation execution
2. **Recording which fields are READ** when computing each calculated field
3. **Auto-generating a dependency JSON** that reflects REAL calculation flow
4. **Comparing against manual registrations** to find discrepancies

### Benefits

✅ **Accuracy** - Graph shows ACTUAL dependencies, not guesses
✅ **Maintainability** - Dependencies self-update as code evolves
✅ **Optimization** - Topological sort for optimal execution order
✅ **Debugging** - Instantly see what triggered a recalculation
✅ **Pruning** - Eliminate unnecessary listeners and phantom deps
✅ **Validation** - Catch circular dependencies automatically

---

## Proposed Implementation Approaches

### Approach 1: Runtime Tracing with Proxy Pattern

**Concept**: Wrap StateManager's `getValue()` method to track field accesses during calculations.

```javascript
class DependencyTracer {
  constructor() {
    this.isTracing = false;
    this.currentCalculation = null; // Which field is being calculated
    this.dependencies = {}; // Map: calculatedField -> [dependencies]
  }

  startTrace(fieldId) {
    this.isTracing = true;
    this.currentCalculation = fieldId;
    this.dependencies[fieldId] = new Set();
  }

  recordAccess(accessedFieldId) {
    if (this.isTracing && this.currentCalculation) {
      // Don't record self-references
      if (accessedFieldId !== this.currentCalculation) {
        this.dependencies[this.currentCalculation].add(accessedFieldId);
      }
    }
  }

  endTrace() {
    this.isTracing = false;
    this.currentCalculation = null;
  }

  exportDependencyGraph() {
    const graph = {};
    for (const [fieldId, deps] of Object.entries(this.dependencies)) {
      graph[fieldId] = Array.from(deps).sort();
    }
    return graph;
  }
}

// Integration with StateManager
const tracer = new DependencyTracer();

// Modified getValue to record accesses
StateManager.getValue = function(fieldId) {
  const value = this.state[fieldId];

  // Record this access for dependency tracking
  tracer.recordAccess(fieldId);

  return value;
};

// Wrap calculation functions
function traceCalculation(fieldId, calculationFn) {
  tracer.startTrace(fieldId);
  try {
    const result = calculationFn();
    return result;
  } finally {
    tracer.endTrace();
  }
}

// Example usage in Section 10
function calculateGainsUtilization() {
  return traceCalculation('i_80', () => {
    const totalGains = getNumericValue('e_80'); // Traced!
    const utilizationFactor = getNumericValue('g_80'); // Traced!
    return totalGains * utilizationFactor;
  });
}
```

**Pros**:
- Non-invasive - wraps existing code
- Accurate - tracks REAL accesses
- Can run in production for validation

**Cons**:
- Requires wrapping all calculation functions
- Performance overhead during tracing
- Doesn't capture mode-aware reads (target vs reference)

---

### Approach 2: Static Analysis of Calculation Code

**Concept**: Parse JavaScript calculation functions to extract `getValue()`, `getNumericValue()`, etc. calls.

```javascript
// Pseudo-code for static analysis
function analyzeCalculationFunction(fnSource) {
  const ast = parseJavaScript(fnSource);
  const dependencies = [];

  // Find all getValue/getNumericValue calls
  traverse(ast, {
    CallExpression(path) {
      if (path.node.callee.name.includes('getValue')) {
        const fieldId = path.node.arguments[0].value;
        if (fieldId) dependencies.push(fieldId);
      }
    }
  });

  return dependencies;
}

// Extract from Section 10 code
const i_82_source = `
  function calculateUnusableGains() {
    const totalGains = getNumericValue('e_80');
    const usableGains = getNumericValue('i_80');
    return totalGains - usableGains;
  }
`;

const deps = analyzeCalculationFunction(i_82_source);
// Returns: ['e_80', 'i_80'] ✓ Correct!
```

**Pros**:
- No runtime overhead
- Can analyze entire codebase offline
- Finds all potential dependencies

**Cons**:
- Can't handle dynamic field IDs (e.g., computed strings)
- Requires access to source code
- Complex to implement correctly

---

### Approach 3: Hybrid - Declaration with Runtime Validation

**Concept**: Keep manual declarations but validate them against runtime traces, flagging discrepancies.

```javascript
class DependencyValidator {
  validateSection(sectionId) {
    const declared = this.getDeclaredDependencies(sectionId);
    const traced = this.getTracedDependencies(sectionId);
    const issues = [];

    for (const [fieldId, declaredDeps] of Object.entries(declared)) {
      const actualDeps = traced[fieldId] || [];

      // Find phantom dependencies (declared but never accessed)
      const phantoms = declaredDeps.filter(d => !actualDeps.includes(d));
      if (phantoms.length > 0) {
        issues.push({
          type: 'phantom',
          field: fieldId,
          deps: phantoms,
          message: `${fieldId} declares dependencies on ${phantoms.join(', ')} but never accesses them`
        });
      }

      // Find missing dependencies (accessed but not declared)
      const missing = actualDeps.filter(d => !declaredDeps.includes(d));
      if (missing.length > 0) {
        issues.push({
          type: 'missing',
          field: fieldId,
          deps: missing,
          message: `${fieldId} accesses ${missing.join(', ')} but doesn't declare them as dependencies`
        });
      }
    }

    return issues;
  }
}
```

**Example Output**:
```
⚠️ Dependency Issues Found:

Section 10:
  i_82 (Net UN-usable Htg. Gains):
    ❌ PHANTOM: h_80, k_80 (declared but never accessed)
    ✅ MISSING: e_80, i_80 (accessed but not declared)

Section 04:
  k_32 (∑ Target Emissions):
    ✅ MISSING: k_27, k_28, k_29, k_30, k_31, d_60 (no dependencies declared!)
```

**Pros**:
- Best of both worlds - manual control + automatic validation
- Catches errors immediately
- Easy to integrate into existing workflow

**Cons**:
- Still requires manual declarations
- Needs both systems running

---

## Recommended Approach: Phased Implementation

### Phase 1: Runtime Tracing Infrastructure (Immediate)

1. Add `DependencyTracer` class to StateManager
2. Instrument all `getValue()` calls to record accesses
3. Create dev-mode tracing for one section (e.g., Section 10)
4. Generate dependency report comparing declared vs traced

**Deliverable**: JSON file showing actual dependencies for validation

### Phase 2: Validation & Correction (Short-term)

1. Run tracer across all sections
2. Identify and fix phantom dependencies (like h_80/k_80)
3. Add missing dependencies (like k_32 → k_27-k_31)
4. Update all field definitions with correct `dependencies` arrays

**Deliverable**: Corrected dependency declarations across all sections

### Phase 3: Graph-Driven Optimization (Medium-term)

1. Use corrected dependency graph to:
   - Generate optimal calculation order (topological sort)
   - Replace listener spaghetti with sequential execution
   - Eliminate redundant recalculations
   - Create calculation "batches" for parallel execution

**Deliverable**: Optimized calculation engine based on true dependency graph

### Phase 4: Continuous Validation (Long-term)

1. Integrate validator into development workflow
2. Run on every calculation change
3. Auto-update dependency arrays in field definitions
4. CI/CD check for dependency drift

**Deliverable**: Self-maintaining dependency system

---

## Immediate Action Items

1. ✅ Fix phantom dependencies in Section 10 (h_80, k_80 → e_80, i_80)
2. ✅ Add missing labels to Section 04 row 32 (k_32, j_32, etc.)
3. ✅ Add dependencies to Section 04 row 32 calculations
4. 🔄 Create runtime tracer prototype for Section 10
5. 🔄 Generate baseline dependency report
6. 🔄 Identify all sections missing dependency declarations

---

## Success Criteria

A successful dependency system should:

1. **Reflect Reality**: Graph shows ACTUAL calculation flow, not assumptions
2. **Enable Optimization**: Can topologically sort for minimal recalculation
3. **Self-Maintain**: Updates automatically as code evolves
4. **Flag Errors**: Catches circular deps, phantoms, and missing declarations
5. **Improve Performance**: Eliminates unnecessary listener spaghetti
6. **Aid Debugging**: Instantly see "why did this recalculate?"

---

## References

- [Topological Sorting for DAGs](https://en.wikipedia.org/wiki/Topological_sorting)
- [Proxy Pattern for Method Interception](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [AST-based Static Analysis](https://github.com/babel/babel/tree/main/packages/babel-parser)
- [Dependency Injection Patterns](https://martinfowler.com/articles/injection.html)

---

**Next Steps**: Implement Phase 1 runtime tracer for Section 10 to validate the approach with a concrete example.
