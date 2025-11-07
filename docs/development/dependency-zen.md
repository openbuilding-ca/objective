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

## Implementation Status

### Completed ✅

1. ✅ Fix phantom dependencies in Section 10 (h_80, k_80 → e_80, i_80)
2. ✅ Add missing labels to Section 04 row 32 (k_32, j_32, etc.)
3. ✅ Add dependencies to Section 04 row 32 calculations
4. ✅ Create ZenMaster.js - Runtime dependency discovery system
5. ✅ Add 🧘 Zen button to index.html for easy enable/disable
6. ✅ Export to file functionality (downloads JSON for Dependency.js)

### In Progress 🔄

7. 🔄 Run ZenMaster across all sections to discover true dependencies
8. 🔄 Validate discovered vs declared dependencies
9. 🔄 Update section field definitions with correct dependencies

### Planned 📋

10. 📋 Integrate ZenMaster hooks into StateManager for automatic detection
11. 📋 Add continuous validation warnings in development mode
12. 📋 Create calculation optimization based on true dependency graph

---

## How to Use ZenMaster (Integrated)

### Quick Start Guide (Human Users)

**Goal**: Discover which fields your calculations ACTUALLY use, not what you think they use.

**The 3-Click Workflow**:

1. **Click 🧘 Zen** button → Button turns green "🧘 Zen ON"
2. **Use the app normally** → Change values, interact with sections
3. **Click 🧘 Zen ON** → Validation results appear in browser console

**What You'll See**:
- ✅ Fields with correct dependencies (nothing to do!)
- ⚠️ Fields with phantom dependencies (declared but never used)
- ⚠️ Fields with missing dependencies (used but not declared)

**Next Steps**:
- Type `zenExportFile()` in console → Downloads JSON of true dependencies
- Give JSON to AI agent → "Fix dependencies using this ZenMaster output"
- Agent updates section files with correct dependencies
- Dependency graph in Section 17 now shows reality, not guesses!

### UI Button Method (Detailed)

1. **Click the 🧘 Zen button** in the top toolbar (next to Help and Weather buttons)
2. Button turns green: "🧘 Zen ON" - dependency tracing is now active
3. **Interact with the app**: Change values, trigger calculations, switch sections
4. **Click 🧘 Zen ON again** to disable and see validation results in console
5. Results automatically run `zenValidate()` showing phantoms and missing deps

### Console Commands Method (Advanced)

If you prefer console commands or need more control:

```javascript
// 1. Enable tracing
zenEnable()

// 2. Interact with app (change values, trigger calculations)

// 3. View discovered dependencies
zenReport()

// 4. Validate against manual declarations
zenValidate()

// 5. Export to JSON file for Dependency.js
zenExportFile()

// 6. Get code snippets for section definitions
zenExportSections()

// 7. Check current status
zenStatus()

// 8. Clear all data for fresh trace
zenReset()

// 9. Disable tracing
zenDisable()
```

### Workflow Example

**Goal**: Fix dependencies for Section 10 (Radiant Gains)

1. Click 🧘 Zen button (or run `zenEnable()`)
2. Open Section 10 in the app
3. Change orientation values (d_73-d_78)
4. Adjust building dimensions
5. Modify gains utilization settings
6. Click 🧘 Zen ON to disable tracing
7. Review console output - see what fields were ACTUALLY accessed
8. Run `zenExportSections()` to get code snippets
9. Copy corrected dependencies into Section10.js field definitions
10. Run `zenExportFile()` to save JSON for Dependency.js integration

### Integration with Dependency.js

The exported JSON from `zenExportFile()` can be used to update Dependency.js:

```javascript
// From ZenMaster export:
{
  "nodes": [
    { "id": "k_32", "label": "∑ Target Emissions", "group": "actualTargetEnergy" },
    { "id": "k_27", "label": "Electricity Emissions", "group": "actualTargetEnergy" },
    // ... more nodes
  ],
  "links": [
    { "source": "k_27", "target": "k_32" },
    { "source": "k_28", "target": "k_32" },
    // ... actual dependencies discovered
  ]
}
```

This replaces manual guesswork with **runtime truth**.

---

## AI Agent Integration Instructions

### When You See ZenMaster Output

If a human asks you to "use ZenMaster to fix dependencies" or provides ZenMaster validation output, follow these steps:

### Step 1: Understand the Validation Output

ZenMaster validation shows three types of issues:

```javascript
⚠️ i_82 (Net UN-usable Htg. Gains)
  ❌ PHANTOM deps (declared but never used): h_80, k_80
  ✅ MISSING deps (used but not declared): e_80, i_80
```

**Interpretation**:
- **PHANTOM**: Dependencies listed in field definition but never accessed during calculation
- **MISSING**: Fields accessed during calculation but not listed in dependencies array

### Step 2: Fix Field Definitions in Section Files

For each field with issues, update the section file (e.g., Section10.js):

**Before** (with phantoms):
```javascript
i: {
  fieldId: "i_82",
  type: "calculated",
  value: "68,819.02",
  section: "radiantGains",
  dependencies: ["h_80", "k_80"],  // ❌ PHANTOM - these don't exist!
},
```

**After** (with discovered deps):
```javascript
i: {
  fieldId: "i_82",
  type: "calculated",
  value: "68,819.02",
  label: "Net UN-usable Htg. Gains",  // ✅ Add unique label if missing
  section: "radiantGains",
  dependencies: ["e_80", "i_80"],  // ✅ CORRECTED - actual dependencies
},
```

### Step 3: Process ZenMaster Export Data

When human runs `zenExportSections()`, you'll see output like:

```javascript
// ZenMaster Discovered Dependencies
// Copy these into your section field definitions

// radiantGains
  e_80: {
    dependencies: ["h_79", "i_71"],
  },
  g_80: {
    dependencies: ["d_80"],
  },
  i_80: {
    dependencies: ["e_80", "g_80"],
  },
  i_82: {
    dependencies: ["e_80", "i_80"],  // ✅ Discovered, not guessed
  },
```

**Your Action**: Merge these into existing field definitions, preserving other properties (type, value, label, section, etc.)

### Step 4: Update Dependency.js Graph (If Requested)

If human provides JSON from `zenExportFile()`:

```javascript
{
  "nodes": [
    { "id": "k_32", "label": "∑ Target Emissions", "group": "actualTargetEnergy" },
    { "id": "k_27", "label": "Electricity Emissions", "group": "actualTargetEnergy" },
    // ...
  ],
  "links": [
    { "source": "k_27", "target": "k_32" },
    { "source": "k_28", "target": "k_32" },
    // ...
  ]
}
```

**Your Action**:
1. Read current Dependency.js to understand structure
2. Merge/replace nodes and links with ZenMaster-discovered data
3. Preserve any manual annotations or metadata
4. Test that graph renders correctly in Section 17

### Step 5: Verify No Orphans

After updating dependencies, check that:
1. All referenced field IDs actually exist in section definitions
2. No circular dependencies introduced (A → B → A)
3. Labels are unique and descriptive (not generic row labels)
4. Dependencies match actual calculation logic in calculateAll() functions

### Step 6: Commit Pattern

Use this commit message template:

```
Fix: Update [SectionXX] dependencies from ZenMaster discovery

Corrected dependencies based on runtime tracing:

**Phantom deps removed** (declared but never used):
- field_id: removed [phantom1, phantom2]

**Missing deps added** (used but not declared):
- field_id: added [missing1, missing2]

**Label improvements**:
- field_id: "Generic Label" → "Specific Label"

ZenMaster validation confirms accurate dependency graph.

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Example Workflow

**Human**: "I ran ZenMaster and it found issues in Section 10. Here's the output: [paste]"

**Agent Response**:
1. Parse validation output
2. Identify fields with phantom/missing deps
3. Read Section10.js
4. Update field definitions with correct dependencies
5. Add unique labels where missing
6. Verify changes against calculation logic
7. Commit with descriptive message
8. Summarize what was fixed

### Common Patterns

**Pattern 1: Sum calculations**
```javascript
// Field that sums other fields
k_32: {
  dependencies: ["k_27", "k_28", "k_29", "k_30", "k_31", "d_60"],
  // k_27-k_31 are summed, d_60 is offset
}
```

**Pattern 2: Ratio calculations**
```javascript
// Field that divides two fields
d_145: {
  dependencies: ["k_32", "ref_k_32"],
  // d_145 = 1 - (k_32 / ref_k_32)
}
```

**Pattern 3: Conditional dependencies**
```javascript
// Field that uses different deps based on mode
h_80: {
  dependencies: ["e_80", "g_80", "d_80"],
  // e_80 * g_80 when d_80 = "method1", else other calculation
}
```

### What NOT to Do

❌ **Don't** blindly copy dependencies without understanding the calculation
❌ **Don't** remove dependencies that make logical sense even if ZenMaster didn't catch them (might be conditionally used)
❌ **Don't** forget to add unique labels when fixing dependencies
❌ **Don't** introduce circular dependencies
❌ **Don't** skip verification that referenced fields actually exist

### Validation Checklist

After updating dependencies, verify:
- [ ] All field IDs in dependencies array exist in field definitions
- [ ] No phantom dependencies remain
- [ ] All accessed fields are declared
- [ ] Labels are unique and descriptive
- [ ] Commit message explains changes
- [ ] No circular dependency chains introduced

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
