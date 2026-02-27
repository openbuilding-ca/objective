# 4012 PERFORMANCE OPTIMIZATION GUIDE

**Date**: August 29, 2024  
**Status**: **📊 ANALYSIS & OPTIMIZATION ROADMAP**  
**Issue**: 2000ms calculation delays, Reference-first completion pattern  
**Goal**: Optimize dual-state calculation performance while preserving Excel compliance

---

## 🚨 **CURRENT PERFORMANCE ISSUES**

### **Observed Behavior:**

- **2000ms calculation delays** when changing values
- **Reference completes before Target** (e_10 populates while h_10 shows 0)
- **Cascading calculation storms** from external dependency changes
- **Performance degradation** noted during dual-state implementation

### **Performance Timeline:**

- **Before Dual-State**: Faster but single-mode only
- **During Refactoring**: Progressive slowdown as dual-engine architecture added
- **Current State**: Functional but 2000ms delays unacceptable for user experience

---

## 🔍 **ROOT CAUSE ANALYSIS**

### **1. Code Bloat & Calculation Cascade Amplification**

**Issue**: Each external dependency change triggers multiple calculation engines:

```
S09 d_64 change → S10 (both engines) → S15 (both engines) → S04 (both engines) → S01
                     ↓                    ↓                    ↓              ↓
                2 calculations        2 calculations       2 calculations   1 calculation
```

**Result**: Single user change triggers **7+ calculation engines** running simultaneously

### **2. Excessive External Dependency Listeners**

**Current State**: Sections have 20-40+ listeners each

- **S15**: ~40 Target/Reference dependency pairs
- **S14**: ~20 dependency pairs
- **S04**: ~15 dependency pairs

**Problem**: Most listeners trigger `calculateAll()` which runs **both Target AND Reference engines**

**Amplification Effect**:

- 1 field change → 5 listeners fire → 10 calculation engines run → 2000ms delay

### **3. Unnecessary Timeout Usage (CTO Anti-Pattern)**

**Issue**: Suspected `setTimeout()` usage for race condition management  
**CTO Guidance**: Use `Dependency.js` for ordered calculations instead [[memory:5204274]]  
**Performance Impact**: Artificial delays that accumulate across calculation chain

### **4. Sub-Optimal Dependency Ordering**

**Issue**: Calculations may run before dependencies are ready  
**Result**: Multiple calculation rounds needed to settle values  
**Solution**: Implement proper dependency ordering via `Dependency.js`

---

## 🎯 **OPTIMIZATION STRATEGIES**

### **Strategy 1: Selective Listener Optimization (High Impact)**

**Current Problem**: Every possible dependency has a listener

```javascript
// ❌ PERFORMANCE KILLER: Everything triggers everything
const dependencies = [
  "h_15",
  "ref_h_15", // Building area (changes rarely)
  "d_28",
  "ref_d_28", // Gas consumption (only affects specific sections)
  "l_12",
  "ref_l_12", // Energy prices (only affects cost calculations)
  // ... 40+ more dependencies
];
```

**✅ OPTIMIZED: Only Essential Cross-Section Dependencies**

```javascript
// ✅ PERFORMANCE OPTIMIZED: Only critical calculation triggers
const criticalDependencies = [
  "i_80",
  "ref_i_80", // S10 → S15 (critical for TEUI)
  "d_136",
  "ref_d_136", // S15 → S04 (critical for energy totals)
  "j_32",
  "ref_j_32", // S04 → S01 (critical for dashboard)
];

const occasionalDependencies = [
  "h_15",
  "ref_h_15", // Building area (setup only)
  "d_19",
  "ref_d_19", // Province (setup only)
  // ... less frequent changes
];
```

**Implementation**:

- **Critical listeners**: Immediate `calculateAll()` trigger
- **Occasional listeners**: Debounced or batched calculation trigger

### **Strategy 2: Calculation Engine Optimization**

**Current**: Dual-engine always runs both Target AND Reference

```javascript
// ❌ ALWAYS RUNS BOTH (even when only one needed)
function calculateAll() {
  calculateTargetModel(); // Always runs
  calculateReferenceModel(); // Always runs
}
```

**✅ OPTIMIZED: Mode-Aware Calculation Triggering**

```javascript
// ✅ SMART: Only run necessary engine based on change source
function calculateAll(triggerSource = "unknown") {
  if (triggerSource.startsWith("ref_")) {
    // Reference dependency changed - prioritize Reference engine
    calculateReferenceModel();
    if (needsTargetRecalc()) calculateTargetModel();
  } else {
    // Target dependency changed - prioritize Target engine
    calculateTargetModel();
    if (needsReferenceRecalc()) calculateReferenceModel();
  }
}
```

### **Strategy 3: Timeout Audit & Elimination**

**Audit Required**: Find all `setTimeout()` usage in codebase

```bash
grep -r "setTimeout" sections/
```

**CTO-Approved Alternative**: Use `Dependency.js` for ordered calculations

```javascript
// ❌ ANTI-PATTERN: setTimeout for race conditions
setTimeout(() => calculateAll(), 100);

// ✅ CTO-APPROVED: Proper dependency ordering
window.TEUI.Dependency.register(
  "fieldId",
  ["dependency1", "dependency2"],
  calculateAll,
);
```

### **Strategy 4: Debounced External Dependencies**

**Issue**: Rapid external changes trigger calculation storms
**Solution**: Debounce non-critical external dependency listeners

```javascript
// ✅ DEBOUNCED: Batch rapid changes
const debouncedCalculateAll = debounce(() => calculateAll(), 50);

// Critical dependencies: Immediate
sm.addListener("i_80", () => calculateAll());

// Non-critical dependencies: Debounced
sm.addListener("h_15", debouncedCalculateAll);
```

---

## 📊 **PERFORMANCE MEASUREMENT TARGETS**

### **Current State (Unacceptable):**

- **Calculation Time**: 2000ms for single field change
- **Cascade Effect**: Reference completes before Target
- **User Experience**: Noticeable delay, values populate sequentially

### **Target Performance (Acceptable):**

- **Calculation Time**: <500ms for single field change
- **Simultaneous Completion**: Target and Reference update together
- **User Experience**: Near-instantaneous response

### **Optimal Performance (Goal):**

- **Calculation Time**: <200ms for single field change
- **Immediate Response**: Values update as user types/selects
- **Smooth Experience**: No visible calculation delays

---

## 🛠️ **IMPLEMENTATION ROADMAP**

### **Phase 0: Performance Clock Implementation (Foundation)** ✅ **COMPLETED**

1. **✅ Add S01 Performance Clock**: User-visible timing display in Key Values header
2. **✅ Baseline Measurement**: Clock.js tracks Init vs Current calculation times
3. **✅ Regression Detection**: Real-time monitoring of performance impact
4. **✅ Success Tracking**: Automatic feedback on optimization improvements

**✅ IMPLEMENTED**: 4011-Clock.js integrated into Calculator.calculateAll()  
**📍 LOCATION**: Key Values header feedback area (white monospace text)  
**🎯 BENEFIT**: Foundation for measuring all subsequent optimizations

### **Phase 1: Timeout Audit & Elimination (High Impact)**

1. **Audit**: `grep -r "setTimeout" sections/` - find all timeout usage
2. **Analyze**: Determine which timeouts are for race conditions vs legitimate delays
3. **Replace**: Convert race condition timeouts to `Dependency.js` ordering
4. **Test**: Measure performance improvement after timeout elimination

**Expected Impact**: 30-50% performance improvement

### **Phase 2: Listener Optimization (Medium Impact)**

1. **Audit Current Listeners**: Document all external dependency listeners per section
2. **Categorize Dependencies**:
   - **Critical** (affects calculations): Keep immediate triggering
   - **Setup** (geometry, location): Convert to debounced triggering
   - **Rare** (prices, status): Convert to manual/batched triggering
3. **Implement Selective Triggering**: Replace blanket `calculateAll()` with targeted calculations

**Expected Impact**: 40-60% reduction in unnecessary calculations

### **Phase 3: Calculation Engine Optimization (Medium Impact)**

1. **Mode-Aware Triggering**: Only run necessary calculation engine based on change source
2. **Dependency Analysis**: Determine when both engines actually need to run
3. **Smart Recalculation**: Avoid running Reference engine for Target-only changes

**Expected Impact**: 50% reduction in calculation engine runs

### **Phase 4: Dependency Ordering (High Impact)**

1. **Implement Dependency.js**: Replace ad-hoc calculation triggering with ordered system
2. **Calculation Sequencing**: Ensure upstream sections complete before downstream
3. **Batch Processing**: Group related calculations to run together

**Expected Impact**: 60-80% performance improvement, eliminates race conditions

---

## 🔍 **DIAGNOSTIC TOOLS**

### **S01 Runtime Performance Clock (User-Visible)** ✅ **IMPLEMENTED**

**✅ Implementation**: 4011-Clock.js integrated into Key Values header feedback area

```javascript
// Clock.js automatically tracks timing in Calculator.calculateAll():
function calculateAll() {
  if (window.TEUI?.Clock?.markCalculationStart) {
    window.TEUI.Clock.markCalculationStart(); // Start timing
  }

  // ... all section calculations ...

  if (window.TEUI?.Clock?.markCalculationEnd) {
    window.TEUI.Clock.markCalculationEnd(); // End timing & update display
  }
}
```

**✅ Display Location**: Key Values header `#feedback-area`

```html
<!-- Clock updates existing feedback area with white monospace text -->
<span id="feedback-area" style="color: white; font-family: monospace;">
  Initialization: 2,400ms<br />Current: 1,800ms
</span>
```

**✅ Benefits**:

- **Real-time feedback** on optimization improvements ✅
- **Init vs subsequent** timing comparison ✅
- **User-visible** performance metrics ✅
- **Regression detection** if changes slow things down ✅

### **Console Performance Measurement**

```javascript
// Add to key calculation functions:
function calculateAll() {
  const startTime = performance.now();

  calculateTargetModel();
  calculateReferenceModel();

  const endTime = performance.now();
  console.log(
    `[PERF] ${sectionId} calculateAll: ${(endTime - startTime).toFixed(1)}ms`,
  );
}
```

### **Listener Activity Monitoring**

```javascript
// Track listener firing frequency:
sm.addListener(dep, () => {
  console.log(`[PERF] ${sectionId} listener fired: ${dep} at ${Date.now()}`);
  calculateAll();
});
```

### **Cascade Analysis**

```javascript
// Track calculation cascade depth:
let calculationDepth = 0;
function calculateAll(source = "unknown") {
  calculationDepth++;
  console.log(
    `[PERF] Calculation depth: ${calculationDepth}, source: ${source}`,
  );

  // ... calculations ...

  calculationDepth--;
}
```

---

## 📋 **OPTIMIZATION CHECKLIST**

### **Immediate Actions (High ROI):**

- [ ] **Timeout Audit**: Find and eliminate unnecessary `setTimeout()` usage
- [ ] **Listener Reduction**: Remove non-essential external dependency listeners
- [ ] **Calculation Profiling**: Add performance timing to identify bottlenecks

### **Medium-Term Actions:**

- [ ] **Debounced Listeners**: Convert setup/rare dependencies to debounced triggering
- [ ] **Mode-Aware Engines**: Only run necessary calculation engine based on change type
- [ ] **Dependency.js Integration**: Replace ad-hoc triggering with ordered system

### **Long-Term Actions:**

- [ ] **Calculation Batching**: Group related calculations to run together
- [ ] **Lazy Loading**: Only calculate visible sections or on-demand calculations
- [ ] **Caching Strategy**: Cache expensive calculations that don't change frequently

---

## ⚠️ **OPTIMIZATION CONSTRAINTS**

### **Must Preserve:**

- ✅ **Excel Formula Compliance**: No changes to calculation methodology
- ✅ **Dual-State Architecture**: Both Target and Reference engines must work
- ✅ **State Isolation**: Perfect separation between Target and Reference
- ✅ **Cross-Section Communication**: Essential dependency chains must remain

### **CTO Requirements:**

- ✅ **No setTimeout() Anti-Pattern**: Use `Dependency.js` for ordering [[memory:5204274]]
- ✅ **StateManager Integration**: All values flow through StateManager [[memory:4164907]]
- ✅ **Incremental Testing**: Test performance after each optimization [[memory:4421052]]

---

## 🎯 **SUCCESS METRICS**

### **Performance Targets:**

- **Single Field Change**: <500ms total calculation time
- **Cross-Section Cascade**: <200ms per section in chain
- **Initial Load**: <1000ms for complete dual-engine initialization
- **Mode Switching**: <100ms for Target ↔ Reference toggle

### **User Experience Goals:**

- **Immediate Feedback**: Values update as user interacts
- **Smooth Transitions**: No visible calculation delays
- **Responsive Interface**: No freezing or lag during complex changes

### **Technical Metrics:**

- **Listener Efficiency**: <50% reduction in unnecessary listener firing
- **Calculation Efficiency**: <50% reduction in redundant engine runs
- **Memory Usage**: Stable memory profile during extended use
- **Browser Performance**: No performance warnings in dev tools

---

## 🏆 **PHASE 5: RUNLOOP ARCHITECTURE (PRODUCTION REFACTOR)**

### **🎯 CTO CONCEPT: Operating System Runloop Pattern**

**Current Problem**: Verbose, repetitive calculation triggering

```javascript
// CURRENT ANTI-PATTERN: Immediate execution cascade
registerDependency(field1);
calculateAll(); // 50 values processed
registerDependency(field2);
calculateAll(); // Same 50 values again
registerDependency(field3);
calculateAll(); // Same 50 values again
// Result: 3x unnecessary work, 150 total calculations
```

**Solution**: **Runloop with "Needs Update" Flags**

```javascript
// PROPOSED RUNLOOP PATTERN: Consolidation + Deferred Execution
registerDependency(field1);
setNeedsUpdate(); // Flag only
registerDependency(field2);
setNeedsUpdate(); // Flag only
registerDependency(field3);
setNeedsUpdate(); // Flag only
// Next runloop turn: calculateAll() once → 50 calculations total
```

### **🔧 Implementation Strategy**

**Core Runloop Manager**:

```javascript
window.TEUI.Runloop = {
  needsUpdate: false,
  scheduledUpdate: null,

  setNeedsUpdate() {
    if (!this.needsUpdate) {
      this.needsUpdate = true;
      this.scheduledUpdate = requestAnimationFrame(() => {
        this.processUpdate();
      });
    }
  },

  processUpdate() {
    if (this.needsUpdate) {
      window.TEUI.Calculator.calculateAll();
      this.needsUpdate = false;
      this.scheduledUpdate = null;
    }
  },
};
```

**Consolidated Registration Functions**:

```javascript
// BEFORE: Verbose repetition
function registerSection15Dependencies() {
  sm.addListener("i_80", () => calculateAll()); // 50 calcs
  sm.addListener("h_70", () => calculateAll()); // 50 calcs
  sm.addListener("d_117", () => calculateAll()); // 50 calcs
  // Total: 150 calculations for 3 dependencies
}

// AFTER: Runloop consolidation
function registerSection15Dependencies() {
  const deps = ["i_80", "h_70", "d_117"];
  deps.forEach((dep) => {
    sm.addListener(dep, () => TEUI.Runloop.setNeedsUpdate());
  });
  // Total: 50 calculations for all 3 dependencies combined
}
```

### **🎯 Benefits**

**Performance**: **60-80% reduction** in redundant calculations  
**Code Quality**: **90% reduction** in repetitive listener code  
**Maintainability**: Single source of truth for update scheduling  
**User Experience**: Smoother, more responsive interface

### **📋 Implementation Phases**

1. **Create Runloop Manager**: Central update scheduling system
2. **Consolidate Listeners**: Array-based dependency registration
3. **Replace calculateAll() Calls**: Use setNeedsUpdate() flags
4. **Test Performance**: Measure with Clock.js before/after
5. **Production Deploy**: Final architecture for optimal performance

**🎯 Expected Result**: **2000ms → 400ms** calculation time achieved through systematic consolidation

---

## 🚀 **NEXT STEPS**

### **Immediate Priority (Before Break):**

1. **Document Current State**: This performance analysis
2. **Plan Optimization**: Systematic approach for post-break work

### **Post-Break Priority (Performance Focus):**

1. **Timeout Audit**: Find and eliminate all unnecessary `setTimeout()` usage
2. **Listener Optimization**: Reduce S15/S14/S04 listeners to essential dependencies only
3. **Performance Measurement**: Add timing diagnostics to identify bottlenecks
4. **Incremental Testing**: Measure improvement after each optimization

### **Success Criteria:**

- **<500ms calculation time** for typical user interactions
- **Simultaneous Target/Reference completion** (no sequential population)
- **Smooth user experience** with no visible delays

---

**🎯 The dual-state architecture is functionally complete - now we optimize for performance!** 🚀

**End of Performance Optimization Guide**
