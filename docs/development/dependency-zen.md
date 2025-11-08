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

## Understanding Dependencies vs. Precedents

**Critical Distinction**: Dependencies and precedents represent opposite directions in the dependency graph. Understanding this difference is essential for correctly declaring field relationships.

### Dependencies (What This Field NEEDS)

**Direction**: FROM calculated field TO its inputs

**Definition**: The set of fields that a calculated field READS FROM to compute its value.

**Declaration**: Explicitly declared in field definitions using `dependencies`, `conditionalDeps`, or `uiDeps` arrays.

**Example**:
```javascript
// d_16 calculates embodied carbon target based on carbon standard selection
d_16: {
  fieldId: "d_16",
  type: "derived",
  label: "Embodied Carbon Target (kgCO₂e/m²)",
  section: "buildingInfo",
  dependencies: ["d_15"],           // Always reads d_15 (carbon standard selector)
  conditionalDeps: ["i_39", "i_41"], // Reads i_39 when TGS4, i_41 when Self Reported
}
```

**Graph Representation**: Arrows point FROM dependencies TO the calculated field
- `d_15` → `d_16` (d_16 depends on d_15)
- `i_39` → `d_16` (d_16 conditionally depends on i_39)
- `i_41` → `d_16` (d_16 conditionally depends on i_41)

### Precedents (What Fields USE This Field)

**Direction**: FROM this field TO fields that depend on it (reverse of dependencies)

**Definition**: The set of fields that READ this field when computing their values.

**Declaration**: NOT declared in field definitions. Discovered through graph analysis (reverse lookup of dependencies).

**Example**:
```javascript
// h_15 (Conditioned Area) is used by many fields but has NO dependencies
h_15: {
  fieldId: "h_15",
  type: "editable",
  label: "Conditioned Area",
  section: "buildingInfo",
  // NO dependencies array - this is a user input (SOURCE node)
}

// Precedents of h_15 (discovered via graph analysis):
// - h_10, k_10, e_10 (TEUI calculations divide energy by area)
// - h_8, k_8, e_8 (Annual carbon calculations divide by area)
// - i_39 (Typology carbon intensity calculation)
// - d_101, d_102, etc. (Volume calculations)
```

**Graph Representation**: Arrows point FROM this field TO its precedents
- `h_15` → `h_10` (h_10 uses h_15)
- `h_15` → `k_10` (k_10 uses h_15)
- `h_15` → `e_10` (e_10 uses h_15)

### Key Rule: Input Fields Have NO Dependencies

**User input fields** (dropdowns, sliders, editable text) are **SOURCE nodes** in the dependency graph:

✅ **Correct**: Input fields have NO dependencies (empty or omitted `dependencies` array)
```javascript
h_12: {
  fieldId: "h_12",
  type: "year_slider",
  label: "Reporting Period",
  // NO dependencies - user provides this value directly
}
```

❌ **Incorrect**: Adding dependencies to input fields
```javascript
h_12: {
  fieldId: "h_12",
  type: "year_slider",
  label: "Reporting Period",
  dependencies: [???],  // WRONG - input fields don't depend on anything
}
```

**Why**: Input fields don't NEED anything to compute their value - the user provides the value. They have many **precedents** (calculated fields that use them), but zero **dependencies**.

### Only Calculated Fields Declare Dependencies

**Calculated/derived fields** (type: `"calculated"`, `"derived"`) are the ONLY fields that should have `dependencies` arrays:

✅ **Correct**: Calculated field declares what it reads
```javascript
d_16: {
  fieldId: "d_16",
  type: "derived",
  label: "Embodied Carbon Target (kgCO₂e/m²)",
  dependencies: ["d_15"],           // Reads d_15 to compute value
  conditionalDeps: ["i_39", "i_41"], // Conditionally reads i_39/i_41
}
```

**Why**: Calculated fields COMPUTE their value by reading other fields. Their `dependencies` array declares which fields they read.

### Practical Implications

1. **When validating S02 dependencies**:
   - ✅ 14 input fields (dropdowns, sliders, editable) have NO dependencies → **CORRECT**
   - ✅ 1 calculated field (d_16) has dependencies → **CORRECT**
   - ❌ Adding dependencies to h_12, h_15, etc. → **WRONG** (they're inputs, not calculated)

2. **When a field "affects calculations"**:
   - If the field is used BY other calculations → It has **precedents** (not dependencies)
   - Don't add dependencies to input fields just because they're widely used
   - Example: h_15 (Conditioned Area) affects 50+ calculations, but has ZERO dependencies

3. **For topological sort**:
   - Dependencies determine calculation ORDER (must calculate inputs before outputs)
   - Input fields come first (no dependencies to wait for)
   - Calculated fields come after their dependencies are ready

### Summary Table

| Aspect | Dependencies | Precedents |
|--------|-------------|-----------|
| **Direction** | FROM calculated field TO inputs | FROM this field TO consumers |
| **Meaning** | What this field NEEDS | What fields USE this field |
| **Declaration** | Explicit in field definition | Discovered via graph analysis |
| **Graph arrows** | Point INTO this field | Point OUT OF this field |
| **Input fields** | None (empty array) | Many (widely used) |
| **Calculated fields** | One or more | Zero or more |
| **Used for** | Topological sort, calculation order | Impact analysis, change propagation |

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

## Implementation: Observer Pattern Architecture

**Status**: ✅ IMPLEMENTED

ZenMaster uses the **Observer Pattern** to track field accesses without modifying StateManager's internal implementation. This architectural approach provides:

### Key Benefits

✅ **Loose Coupling** - ZenMaster and StateManager are independent modules
✅ **Explicit Relationship** - Observer registration makes dependencies clear
✅ **Maintainability** - Changes to StateManager don't break ZenMaster
✅ **Testability** - Each component can be tested in isolation
✅ **Performance** - Fast-path check when no observers registered (zero overhead when disabled)

### Architecture Overview

```javascript
// StateManager provides observer interface
StateManager.addObserver(observer);    // Register an observer
StateManager.removeObserver(observer); // Unregister an observer

// Observers implement these methods:
observer.onGetValue(fieldId, value);         // Called when getValue() is invoked
observer.onSetValue(fieldId, value, state);  // Called when setValue() is invoked
```

### How It Works

1. **StateManager Enhancement**
   - Added `observers` Set to store registered observers
   - Added `addObserver()` and `removeObserver()` public methods
   - Notify observers from within `getValue()` and `setValue()` methods
   - Fast-path optimization: skip observer loop if no observers registered

2. **ZenMaster Integration**
   - Implements observer interface with `onGetValue()` and `onSetValue()` methods
   - `enable()` calls `StateManager.addObserver(this)` to start tracing
   - `disable()` calls `StateManager.removeObserver(this)` to stop tracing
   - No monkey-patching or method replacement required

### Example Usage

```javascript
// Create ZenMaster instance
const zenMaster = new TEUI.ZenMaster();

// Enable tracing (registers as observer)
zenMaster.enable();

// Interact with calculator - all field accesses are traced
TEUI.Calculator.calculateAll();

// Disable tracing (unregisters as observer)
zenMaster.disable();

// Validate dependencies
zenMaster.validateDependencies();
```

### Performance Characteristics

- **When disabled**: Zero overhead (observer list is empty, fast-path check)
- **When enabled**: ~0.007ms per getValue/setValue call (minimal impact)
- **Memory**: Circular buffer limits log to 10,000 entries

---

## Proposed Implementation Approaches (Historical)

### Approach 1: Runtime Tracing with Observer Pattern (✅ IMPLEMENTED)

**Concept**: Use StateManager's observer interface to track field accesses during calculations.

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
7. ✅ Add setValue() interception for accurate dependency link inference
8. ✅ Enhance buildDependenciesFromAccessLog() to create links from temporal patterns
9. ✅ Full dependency graph export (768 nodes, 2499 links)

### In Progress 🔄

10. 🔄 Distinguish true phantoms from conditional dependencies
11. 🔄 Update section field definitions with correct dependencies (removing true phantoms)
12. 🔄 Document conditional dependency patterns for future reference

### Planned 📋

13. 📋 Integrate ZenMaster hooks into StateManager for automatic detection
14. 📋 Add continuous validation warnings in development mode
15. 📋 Create calculation optimization based on true dependency graph
16. 📋 Enhance validation to distinguish user inputs from calculated fields
17. 📋 Add conditional dependency markers in field definitions

---

## How ZenMaster Works (Technical Details)

### setValue() and getValue() Interception

ZenMaster intercepts both `StateManager.setValue()` and `StateManager.getValue()` to capture the complete dependency graph:

**setValue Interception:**
```javascript
// When a calculated field is updated
StateManager.setValue(fieldId, value)
  ↓
ZenMaster.recordSetValue(fieldId, value)
  ↓
Sets currentCalculation = fieldId
  ↓
Subsequent getValue() calls are dependencies of this field
```

**getValue Interception:**
```javascript
// When a field value is read during calculation
StateManager.getValue(dependencyFieldId)
  ↓
ZenMaster.recordAccess(dependencyFieldId, value)
  ↓
If currentCalculation is set:
  Record: currentCalculation depends on dependencyFieldId
```

**Temporal Dependency Inference:**

The `buildDependenciesFromAccessLog()` method analyzes the access log to infer dependencies:

1. **setValue event** → Marks field X as "currently calculating"
2. **getValue events** → All fields read are dependencies of X
3. **Next setValue event** → Switch to new calculating field
4. **Result:** Complete dependency graph built from runtime behavior

**Example Flow:**
```
setValue(k_32)           // k_32 is being calculated
  getValue(k_27)         // k_32 depends on k_27
  getValue(k_28)         // k_32 depends on k_28
  getValue(k_29)         // k_32 depends on k_29
  getValue(k_30)         // k_32 depends on k_30
  getValue(k_31)         // k_32 depends on k_31
  getValue(d_60)         // k_32 depends on d_60
setValue(d_33)           // Switch: d_33 is now being calculated
  getValue(k_32)         // d_33 depends on k_32
  getValue(f_32)         // d_33 depends on f_32
```

This produces:
- Link: k_27 → k_32
- Link: k_28 → k_32
- Link: k_29 → k_32
- Link: k_30 → k_32
- Link: k_31 → k_32
- Link: d_60 → k_32
- Link: k_32 → d_33
- Link: f_32 → d_33

### Phantom Dependencies vs Conditional Dependencies

**Phantom Dependency**: Declared but NEVER used in any scenario
```javascript
// TRUE PHANTOM - should be removed
i_82: {
  dependencies: ["h_80", "k_80"],  // These fields don't even exist!
}
```

**Conditional Dependency**: Declared and used SOMETIMES based on conditions
```javascript
// CONDITIONAL - should be kept
h_19: {
  dependencies: ["d_19"],  // Only used when province selection changes
}

d_114: {
  dependencies: ["d_113", "d_127", "h_113"],  // Used based on heating system type
}
```

**How to Distinguish:**

1. **Check if field exists**: If dependency field isn't in FieldManager, it's a true phantom
2. **Check field type**: If dependency is user input (`type: "input"`), it may not trigger getValue() during normal calculations
3. **Test multiple scenarios**: Change user inputs to trigger conditional code paths
4. **Review calculation logic**: Read the actual calculation code to see if dependency is used conditionally

### User Input Fields vs Calculated Fields

**Key Insight**: User input fields (type: "input") are often declared as dependencies but don't appear in ZenMaster traces because they're read directly from the DOM, not via `getValue()`.

**Example:**
```javascript
// Section 10: Window calculations
i_73: {
  fieldId: "i_73",
  type: "calculated",
  dependencies: ["d_73", "e_73", "f_73", "g_73"],  // All user inputs
  // Calculation reads these values directly from input fields
  // getValue() is never called on them
  // ZenMaster sees them as "phantoms" but they're actually necessary
}
```

**Solution**: ZenMaster should check field types before flagging phantoms.

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

### Step 3a: Understanding Dependency Types

**IMPORTANT**: ZenMaster now supports three types of dependencies:

1. **`dependencies`** - Core calculation dependencies
   - Always accessed during calculation
   - Required for field to compute correctly
   - Example: `d_16` depends on `d_15` (carbon standard selection)

2. **`conditionalDeps`** - Conditional calculation dependencies
   - Used only in specific scenarios (if/switch logic)
   - Not phantoms if unused in a particular test
   - Example: `d_16` conditionally depends on `i_39` (when TGS4) or `i_41` (when Self Reported)

3. **`uiDeps`** - UI-only dependencies
   - Used for dropdown options, validation, DOM manipulation
   - Never accessed via `getValue()` during calculations
   - Example: `h_19` (Municipality) depends on `d_19` (Province) for dropdown filtering

**Field Definition Example**:

```javascript
d_16: {
  fieldId: "d_16",
  type: "derived",
  label: "Embodied Carbon Target",
  section: "buildingInfo",
  dependencies: ["d_15"],           // Always used
  conditionalDeps: ["i_39", "i_41"], // i_39 when TGS4, i_41 when Self Reported
  uiDeps: [],                        // None for this field
}
```

**When to Use Each Type:**

- **dependencies**: Field is ALWAYS accessed when calculating this field
- **conditionalDeps**: Field is accessed ONLY when certain conditions are true (if/switch branches, heating system type, province selection, etc.)
- **uiDeps**: Field is used for UI behavior but NOT for calculation (dropdown population, form validation, etc.)

**Validation Output Interpretation:**

ZenMaster now categorizes phantom dependencies:

```
⚠️ d_16 (Embodied Carbon Target) [type: derived]
  🔀 CONDITIONAL deps (not triggered): i_39

✅ This is EXPECTED! i_39 is only used when d_15="TGS4"
```

**Categories:**
- ❌ **TRUE PHANTOMS**: Remove these from dependencies array
- 🔀 **CONDITIONAL**: Keep in conditionalDeps array (working as designed)
- 🎨 **UI DEPS**: Keep in uiDeps array (UI behavior, not calculation)
- 🚫 **NON-EXISTENT**: Typos or deleted fields - remove immediately

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
❌ **Don't** use generic row labels as field labels - be specific!
   - **Bad**: `label: "Total Fossil Gas Use"` (row name, generic)
   - **Good**: `label: "Gas Price (gCO₂e/m³)"` (specific to field l_28)
   - Human users need to know what "l_28" means - is it volume, price, emissions?
   - Example: "Gas Cost" vs "Gas Price" - price is per unit, cost is total spent
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

## Integration with Calculator.js and Clock.js

### How ZenMaster Works with Calculator.js

**Calculator.js** defines the section calculation order in `calculateAll()`:

```javascript
const calcOrder = [
  "sect02", // Building Info
  "sect03", // Climate
  "sect08", // IAQ
  "sect09", // Internal Gains
  "sect10", // Radiant Gains (i80 for S15)
  "sect11", // Transmission Losses (writes ref_i_98 for S12)
  "sect12", // Volume Metrics (reads ref_i_98 from S11)
  // ... more sections
  "sect01", // Key Values (consumes S15, S05)
];
```

This order has been manually tuned multiple times for performance. **ZenMaster can validate and improve this ordering.**

### The Optimization Loop

**Phase 1: Discover True Dependencies**

1. Enable ZenMaster: `zenEnable()`
2. Trigger full calculation: `TEUI.Calculator.calculateAll()`
3. ZenMaster traces all getValue() calls during execution
4. Discovers which sections ACTUALLY depend on which fields
5. Validates against manual dependencies in field definitions

**Phase 2: Measure Current Performance**

Clock.js already measures:
- Total calculation time
- User interaction responsiveness
- Section-by-section timing (if instrumented)

**Phase 3: Analyze Dependencies**

1. Export ZenMaster graph: `zenExportFile()`
2. Perform topological sort on dependency graph
3. Identify sections that could run earlier (fewer deps)
4. Identify sections blocking others (many dependents)
5. Find unnecessary recalculations (phantom deps)

**Phase 4: Optimize Calculation Order**

Based on ZenMaster discoveries:

```javascript
// OLD ORDER (manual tuning)
const calcOrder = ["sect02", "sect03", ..., "sect01"];

// NEW ORDER (ZenMaster-optimized)
const calcOrder = [
  // Foundation: No dependencies, run first
  "sect02", // Building Info (defines h_15, h_12, h_13)
  "sect03", // Climate (defines d_20, d_21, climate data)

  // Mid-tier: Depend on foundation only
  "sect12", // Volume (depends on h_15)
  "sect08", // IAQ (depends on h_15, climate)

  // Calculations: Build on foundation + mid-tier
  "sect09", // Internal Gains
  "sect10", // Radiant Gains (depends on sect09)
  "sect11", // Transmission (depends on volumes)

  // Energy calculations: Need all physical calculations
  "sect13", // Mechanical Loads
  "sect07", // Water Use
  "sect06", // Renewables

  // Summaries: Consume everything
  "sect04", // Energy Totals
  "sect05", // Emissions
  "sect14", // TEDI Summary
  "sect15", // TEUI Summary

  // Display: Last (pure visualization)
  "sect01", // Key Values (dashboard)
  "sect16", // Sankey
  "sect17", // Dependency Graph
];
```

**Phase 5: Validate Performance Improvement**

1. Implement new calculation order
2. Run Clock.js benchmarks
3. Compare before/after performance metrics
4. If faster → keep new order
5. If slower → analyze why, adjust order
6. Iterate until optimal

### ZenMaster + Clock.js Integration

**Status:** Ready to implement

#### Method 1: Add Performance Metrics to exportDependencyGraph()

**Location:** ZenMaster.js line ~340

```javascript
exportDependencyGraph() {
  // Existing code...

  const graph = {
    nodes: [],
    links: [],
    // NEW: Add metadata section
    metadata: {
      captureTimestamp: new Date().toISOString(),
      totalAccessEvents: this.accessLog.length,
      nodesDiscovered: nodeSet.size,
      linksDiscovered: this.dependencies.size,
      // Capture Clock.js metrics if available
      clockMetrics: this.getClock MetricsIfAvailable()
    }
  };

  // ... rest of export logic
  return graph;
}

// NEW: Helper method to safely read Clock.js data
getClockMetricsIfAvailable() {
  if (!window.TEUI?.Clock) return null;

  return {
    totalCalculations: window.TEUI.Clock.calculationCount || 0,
    avgCalculationTime: window.TEUI.Clock.avgTime || 0,
    lastCalculationTime: window.TEUI.Clock.lastTime || 0,
    userInteractions: window.TEUI.Clock.interactionCount || 0
  };
}
```

#### Method 2: Add Calculator.js Section Timing

**Location:** ZenMaster.js - new method to intercept Calculator.calculateAll()

```javascript
// NEW: Track section-level performance
interceptCalculator() {
  const calculator = window.TEUI?.Calculator;
  if (!calculator) return;

  this.originalCalculateAll = calculator.calculateAll;
  this.sectionTimings = new Map();

  calculator.calculateAll = () => {
    if (!this.isEnabled) {
      return this.originalCalculateAll.call(calculator);
    }

    // Get calcOrder from Calculator
    const calcOrder = calculator.calcOrder || [];

    calcOrder.forEach(sectionId => {
      const startTime = performance.now();

      // Call section's calculateAll()
      const sectionModule = window.TEUI?.Sections?.[sectionId];
      if (sectionModule?.calculateAll) {
        sectionModule.calculateAll();
      }

      const duration = performance.now() - startTime;
      this.sectionTimings.set(sectionId, duration);
    });
  };
}

// Export section timings in graph metadata
exportDependencyGraph() {
  // ... existing code

  metadata: {
    // ... existing metadata
    sectionPerformance: Object.fromEntries(this.sectionTimings)
  }
}
```

#### Method 3: Benchmark Calculator.js Order Variations

**Location:** ZenMaster.js - new utility methods

```javascript
// NEW: Benchmark different calculation orders
async benchmarkCalculatorOrder(orderVariations) {
  const results = [];

  for (const orderConfig of orderVariations) {
    this.reset();
    this.enable();

    // Temporarily override Calculator.calcOrder
    const originalOrder = window.TEUI.Calculator.calcOrder;
    window.TEUI.Calculator.calcOrder = orderConfig.order;

    const startTime = performance.now();
    window.TEUI.Calculator.calculateAll();
    const duration = performance.now() - startTime;

    this.disable();

    results.push({
      name: orderConfig.name,
      order: orderConfig.order,
      duration: duration,
      accessEvents: this.accessLog.length,
      dependencies: this.exportDependencyGraph()
    });

    // Restore original order
    window.TEUI.Calculator.calcOrder = originalOrder;
  }

  return results;
}

// NEW: Suggest optimal order using topological sort
suggestCalculatorOrder() {
  // Build section dependency graph from field dependencies
  const sectionDeps = new Map();

  this.dependencies.forEach((fieldDeps, fieldId) => {
    const fieldSection = this.getFieldSection(fieldId);
    if (!sectionDeps.has(fieldSection)) {
      sectionDeps.set(fieldSection, new Set());
    }

    fieldDeps.forEach(depFieldId => {
      const depSection = this.getFieldSection(depFieldId);
      if (depSection !== fieldSection) {
        sectionDeps.get(fieldSection).add(depSection);
      }
    });
  });

  // Topological sort of sections
  return this.topologicalSort(sectionDeps);
}
```

#### Method 4: Real-time Performance Dashboard

**Location:** New console logging during tracing

```javascript
// NEW: Add to recordAccess() for real-time monitoring
recordAccess(accessedFieldId, value) {
  // ... existing code

  // Log performance warnings in real-time
  if (this.accessLog.length % 1000 === 0) {
    console.warn(`[ZenMaster] 🐌 ${this.accessLog.length} access events captured - potential performance issue`);

    // Check if Clock.js shows slowdown
    const clockMetrics = this.getClockMetricsIfAvailable();
    if (clockMetrics && clockMetrics.avgCalculationTime > 100) {
      console.error(`[ZenMaster] ⚠️ Avg calculation time: ${clockMetrics.avgCalculationTime}ms - SLOW!`);
    }
  }
}
```

### Workflow: Optimize Calculator.js Order

**Goal**: Find the fastest section calculation order

```javascript
// 1. Trace current order
zenEnable()
TEUI.Calculator.calculateAll()
const currentMetrics = zenMaster.endCalculationTrace()

// 2. Get ZenMaster's suggested order
const dependencies = zenExport()
const suggestedOrder = topologicalSort(dependencies)

// 3. Implement suggested order in Calculator.js
// Edit calcOrder array based on ZenMaster output

// 4. Benchmark new order
zenEnable()
TEUI.Calculator.calculateAll()
const newMetrics = zenMaster.endCalculationTrace()

// 5. Compare performance
console.log(`Old: ${currentMetrics.performance.totalTime}ms`)
console.log(`New: ${newMetrics.performance.totalTime}ms`)
console.log(`Improvement: ${((currentMetrics.performance.totalTime - newMetrics.performance.totalTime) / currentMetrics.performance.totalTime * 100).toFixed(1)}%`)
```

### What ZenMaster Reveals About Calculator Order

**Common Issues Discovered**:

1. **Section calculates too early**: Depends on fields not yet calculated
   - Causes recalculation overhead
   - ZenMaster shows missing dependencies

2. **Section calculates too late**: All dependencies ready but waiting
   - Wastes time, could run earlier
   - ZenMaster shows no blockers

3. **Circular section dependencies**: Sections depend on each other
   - Requires iterative calculation (expensive!)
   - ZenMaster flags circular paths

4. **Phantom cross-section reads**: Section reads field but doesn't declare dependency
   - Risk of stale data
   - ZenMaster catches as missing dependency

### Example Optimization Result

**Before** (manual ordering):
- Total calculation time: 450ms
- 3 recalculation passes needed
- Some sections read stale data

**After** (ZenMaster-optimized):
- Total calculation time: 280ms ✅ 38% faster
- 1 calculation pass (perfect topological order)
- No stale data reads
- Clock.js confirms improvement

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
