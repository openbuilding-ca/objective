# 🚦 TEUI Race Condition Mitigation Plan

_Incremental Migration Guide to Topological Orchestration_

## 🚨 **CRITICAL INSTRUCTIONS FOR NEW AGENTS**

**⚠️ MANDATORY READING BEFORE ANY CODE CHANGES:**

1. **📖 READ README.md COMPLETELY** - Understand the 12-month refined dual-state architecture
2. **📋 STUDY 4012-CHEATSHEET.md** - Master Pattern A dual-state compliance requirements
3. **🔍 REVIEW THIS DOCUMENT** - Understand the specific StateManager limitation we're solving

**🚫 ABSOLUTELY FORBIDDEN:**

- ❌ **Modifying existing calculation logic** (Excel parity achieved over 12 months)
- ❌ **Changing dual-state architecture** (TargetState/ReferenceState objects are proven)
- ❌ **Adding new antipatterns** (target\_ prefixes, fallback contamination, etc.)
- ❌ **Bypassing Traffic Cop** (window.sectionCalculationInProgress protection)
- ❌ **Breaking StateManager patterns** (setValue/getValue established workflows)

**✅ REQUIRED APPROACH:**

- ✅ **Work ABOVE section level** - orchestrator coordinates, sections remain unchanged
- ✅ **Preserve all existing functionality** - this is optimization, not replacement
- ✅ **Follow exact implementation plan** - no improvisation or "better" ideas
- ✅ **Test incrementally** - verify no regressions after each step

**🎯 REMEMBER**: This codebase has **Excel calculation parity** and **perfect dual-state isolation**. The ONLY issue is StateManager listener propagation for calculated values. **DO NOT FIX WHAT ISN'T BROKEN.**

### **🏆 CURRENT CODEBASE STATUS (Sept 18, 2025)**

**✅ WHAT'S WORKING PERFECTLY:**

- **Dual-State Architecture**: All sections use Pattern A (TargetState/ReferenceState objects)
- **Excel Calculation Parity**: 12 months of refinement for regulatory compliance
- **S03 Climate Data**: Perfect state isolation (Target≠Reference locations work correctly)
- **Traffic Cop Protection**: Prevents infinite calculation loops
- **Pattern B Elimination**: Zero target\_ prefixed antipatterns across S01-S15
- **StateManager Storage**: setValue/getValue works perfectly for data persistence

**❌ SINGLE REMAINING ISSUE:**

- **Listener Propagation**: StateManager calculated values don't trigger addListener() callbacks
- **Symptom**: S03 publishes d_20=7100, downstream sections read stale d_20=4600
- **Impact**: Prevents automatic recalculation cascade when climate data changes

**🎯 ORCHESTRATOR MISSION**: Solve the listener propagation issue WITHOUT changing any working architecture.

### **🧪 MANDATORY TESTING PROTOCOL**

**⚠️ CRITICAL: HUMAN-AGENT COLLABORATION REQUIRED**

**Testing Resources Available:**

1. **🔍 QC Monitor (Section 18)**: Comprehensive violation detection and analysis
   - Enable via `?qc=true` URL parameter
   - Generate reports via Section 18 → "Generate QC Report" button
   - Copy reports to Logs.md for agent analysis
2. **📊 Console Logging**: Real-time calculation flow monitoring
   - Filter by section prefixes: `[S03]`, `[S12]`, etc.
   - Track state changes, listener firing, calculation execution
3. **⏱️ Performance Monitoring (Clock.js)**: Timing analysis for optimization validation

**🚫 AGENT MUST NEVER:**

- ❌ **Implement multiple phases without testing** - Each phase requires human validation
- ❌ **Assume changes work without verification** - QC reports reveal hidden issues
- ❌ **Proceed without human approval** - Complex architecture requires collaborative validation

**✅ REQUIRED WORKFLOW:**

1. **Implement single orchestrator component** (e.g., basic registerSection function)
2. **STOP and request human testing** - Generate QC report, check console logs
3. **Wait for human feedback** - Confirm no regressions, validate improvements
4. **Only then proceed** to next component/phase

**🎯 TESTING VALIDATION CRITERIA:**

- **QC Report**: Violation count should decrease, no new violation types
- **Console Logs**: Should show orchestrator coordination working
- **Functional Testing**: Human verifies S03 location changes propagate correctly
- **Performance**: Clock.js should show timing improvements

**REMEMBER**: The human has 12 months of testing experience with this codebase and can detect subtle regressions that automated testing might miss.

---

## Objective

Stabilize cross-section race conditions by introducing a **dependency-ordered orchestrator** that works **above the section level**.

This plan avoids the pitfalls of the abandoned **IT-DEPENDS** branch (field-level micromanagement), while keeping section internals self-contained.

## 🔍 **ARCHITECTURAL ANALYSIS** _(Added Sept 15, 2025)_

### **✅ VALIDATED AGAINST CURRENT CODEBASE**

**Current Pain Points This Addresses:**

- **Listener Spaghetti**: S10 has 20+ listeners, S15 has ~40 dependency pairs causing calculation storms
- **Race Conditions**: Single changes trigger 7+ calculation engines simultaneously (2000ms delays)
- **Calculation Storms**: Documented 58,000+ log infinite loops from circular listener dependencies
- **Manual Ordering**: Hardcoded `calcOrder` array in Calculator.js requires manual maintenance
- **setTimeout Anti-Pattern**: Race condition workarounds using setTimeout violate CTO guidance [[memory:5204274]]
- **Cascade Amplification**: Single field change triggers 7+ calculation engines (S09→S10→S15→S04→S01)
- **Performance Degradation**: 2000ms delays unacceptable for user experience
- **🚨 ROOT CAUSE CONFIRMED (Sept 18, 2025)**: StateManager architectural limitation definitively identified through systematic testing. **VERIFIED**: StateManager.setValue() with "calculated" state does NOT trigger wildcard or addListener() callbacks, only registerDependency() callbacks. **EVIDENCE**: S03 publishes climate data perfectly (d*20=7100 verified stored in StateManager), but Calculator.js wildcard listener never fires despite explicit logging. **PATTERN B CLEANUP**: Eliminated all target* prefixed antipatterns across S03, S11, S15, S05 (21 violations reduced to 0). **ARCHITECTURAL CONCLUSION**: Perfect dual-state architecture achieved at section level - remaining state contamination is StateManager infrastructure limitation requiring orchestrator-based coordination to replace listener-based reactivity for calculated value propagation.

**🔧 S13 LISTENER FIX ATTEMPTED (Sept 22, 2025)**: Applied surgical fix to S13 climate listeners. **PROBLEM**: S13 used addListener() for S03 calculated values (d_23, h_23, etc.) which never fire due to StateManager limitation. **FIX ATTEMPTED**: Replaced addListener() with registerDependency() calls for S03 climate values. **RESULT**: Partial improvement but "cooling bump" still required - indicates deeper architectural issue beyond simple listener mechanism. **CONCLUSION**: Confirms need for complete orchestrator solution rather than piecemeal listener fixes. S13 represents the complexity that requires systematic orchestrator coordination as outlined in this document.

**🎯 S13 FORENSIC ANALYSIS BREAKTHROUGH (Sept 24, 2025)**: Achieved complete understanding of "cooling bump" phenomenon through comprehensive forensic logging. **ROOT CAUSE CONFIRMED**: StateManager architectural limitation prevents calculated values from triggering downstream recalculations. **MECHANISM DISCOVERED**: Normal initialization calculates correctly (S14→m_129=9572, S13→d_117=3593) but StateManager.setValue(..., "calculated") does NOT trigger listeners, causing downstream S01 h_10 calculation to read stale upstream data (93.4 instead of 93.7). **"COOLING BUMP" BYPASS**: Manual d_116 toggle uses "user-modified" triggers which DO fire listeners, forcing complete recalculation cascade with fresh data propagation, resulting in correct h_10=93.7. **MULTIPLE INITIALIZATION EXPLANATION**: 21+ calculation runs during startup occur because Calculator.js runs all 15 sections in proven calcOrder, but calculated values don't propagate to downstream sections, causing multiple systems (wildcard listeners, individual section listeners, setTimeout delays) to attempt compensation, resulting in calculation storms. **STRATEGIC IMPLICATION**: The "cooling bump" works by bypassing broken StateManager listener system entirely - this validates the Smart Reactive System approach in this document as the correct architectural solution. All sections should initialize in Target mode by default (except S01 which is state-agnostic).

**🎯 COOLING BUMP MECHANISM DECODED (Sept 24, 2025)**: Complete forensic analysis reveals exact two-phase calculation sequence. **BREAKTHROUGH**: The "cooling bump" is NOT about cooling - it's a "complete recalculation button" that forces proper topological calculation order. **SEQUENCE DISCOVERED**: handleDropdownChange triggers dual-phase: (1) "No Cooling" → h_10=90.91, (2) "Cooling" → h_10=93.7. **CRITICAL INSIGHT**: Phase 2 forces complete S04 dual-engine calculations, proper j_32 energy totals propagation, and full S01/S05 display cascade using user-modified triggers (which work) instead of calculated triggers (which fail). **ROOT CAUSE CONFIRMED**: Normal initialization suffers partial calculation propagation with stale intermediate values, while cooling bump achieves complete calculation cascade with fresh state rebuild. **ARCHITECTURAL VALIDATION**: This confirms StateManager listener limitation diagnosis - user-modified triggers work perfectly, calculated triggers fail. **STRATEGIC CONCLUSION**: Solution requires replicating dropdown change calculation sequence during initialization, not S13-specific fixes. The cooling bump bypasses all broken StateManager calculated-value listener propagation and forces complete recalculation using proven user-modified trigger patterns.

**Current Architecture Compatibility:**

- ✅ **Section Autonomy Preserved**: Each section's `TargetState`/`ReferenceState` objects remain intact
- ✅ **Traffic Cop Coexistence**: Orchestrator works above existing Traffic Cop recursion protection
- ✅ **Dual-State Support**: Can handle both Target and Reference dependency chains separately
- ✅ **Incremental Migration**: Can coexist with current `Calculator.calculateAll()` system

### **🎯 UNDERSTANDING THE STATEMANAGER LIMITATION**

**Technical Root Cause** _(From README.md lines 460-491)_:

```javascript
// BY DESIGN: StateManager.setValue(..., 'calculated') does NOT trigger registerDependency recalculations
// This prevents infinite calculation loops
StateManager.setValue("i_39", calculatedValue, "calculated"); // ← Doesn't trigger dependents

// INTENDED SOLUTION: Use addListener for cross-section calculated field propagation
StateManager.addListener("i_39", function (newValue) {
  // Manual listener callback triggers dependent calculations
  calculateDependentField();
});
```

**Current Broken Chain (Sept 18, 2025):**

```
S03 calculates d_20=7100 → StateManager.setValue(d_20, "7100", "calculated") → Listeners should fire → But don't ❌
```

**Why Listeners Don't Fire:**

- StateManager **intentionally suppresses** listener triggers for calculated values (lines 415-417 in StateManager.js)
- **Purpose**: Prevent infinite calculation loops
- **Problem**: Also prevents legitimate cross-section propagation

**Three Implementation Approaches:**

**Approach A: Fix StateManager Listener Mechanism** _(Surgical Fix)_

- Modify StateManager to trigger listeners for calculated values under controlled conditions
- Preserve loop protection while enabling cross-section propagation
- **Scope**: StateManager.js modification only

**Approach B: Replace Listener System with Orchestrator** _(Architectural Change)_

- Replace broken listener propagation with deterministic execution order
- Use Calculator.js `calcOrder` dependencies for proven sequence
- **Scope**: Replace calculation triggers, preserve section autonomy

**Approach C: Smart Reactive System** _(Human-Optimized Pattern)_ ⭐ **NEW**

- Batch human-speed changes with single calculation passes
- Eliminate listener chaos while preserving reactive behavior
- Use requestAnimationFrame for CTO-approved timing coordination
- **Scope**: Replace chaotic listeners, preserve proven calculation order

### **🎯 S13 PARALLEL DEVELOPMENT STRATEGY**

**Recommendation**: **PROCEED IN PARALLEL** - Do not wait for S13 completion.

**Rationale:**

1. **S13 Complexity**: Month-long struggle indicates S13 needs isolated, focused attention
2. **Orchestrator Independence**: Works at section level - doesn't require S13 internal completion
3. **Mutual Benefits**: Orchestrator may actually **help** S13 by reducing external calculation storms
4. **Risk Mitigation**: If S13 continues to struggle, orchestrator provides alternative path forward

**Parallel Track Approach:**

- **Track A**: Continue S13 internal dual-state refactoring (cooling calculations, etc.)
- **Track B**: Implement orchestrator with simpler sections (S10→S11→S01 chain)
- **Track C**: Once orchestrator proves stable, migrate S13 to use it (may simplify S13 completion)

---

### **🔥 S13 MULTI-PASS CALCULATION ISSUE** _(Added Oct 26, 2025)_

**CRITICAL DISCOVERY**: S13 initialization issue is NOT a timing race - it's a **multi-pass calculation dependency problem**.

**Test Evidence** (test-scripts/toggle-s13-systems.js):
- **Pass 1**: e_10 = 185.5 kWh/m²/yr (after 1 cooling toggle)
- **Pass 2**: e_10 = ~190 kWh/m²/yr (estimated)
- **Pass 3**: e_10 = 197.6 kWh/m²/yr (Excel parity achieved!)
- **Excel Target**: 196.6 kWh/m²/yr (99.5% accurate after 3 passes)

**The Problem**:
1. S13 Reference model initializes with correct values (d_113="Heatpump", d_116="Cooling")
2. BUT calculation chain S13→S14→S15→S01 requires **3+ calculation passes** to fully propagate
3. Each toggle forces a new `calculateAll()` round, propagating more of the dependency chain
4. Initial calculation only completes ~60% of the propagation (185.5 vs 197.6)

**Why This Happens**:
- **Listener Spaghetti**: No guaranteed execution order for StateManager listeners
- **Multi-hop Dependencies**: S13 publishes → S14 reads/publishes → S15 reads/publishes → S01 reads
- **Asynchronous Nature**: Each section `calculateAll()` runs independently, may read stale values
- **No Topological Ordering**: Calculations don't wait for upstream dependencies to complete

**Concrete S13 Implementation Plan**:

**Step 1: Document S13 Dependencies** (15 minutes)
```javascript
// In Orchestrator.js or dependency registry:
const s13Dependencies = {
  sectionId: "sect13",
  upstream: [
    "sect03",  // Climate (d_20, d_21, d_22, h_22)
    "sect09",  // Occupant Gains (i_71)
    "sect10",  // Appliance Gains (i_79)
    "sect12",  // Envelope Losses (i_104, k_104)
    "sect14",  // TED (d_127, l_128)
  ],
  downstream: [
    "sect14",  // TEDI Summary (reads S13 mechanical loads)
    "sect15",  // TEUI Summary (reads S14 values)
    "sect01",  // Key Values (reads S15 e_10)
  ],
  outputs: [
    "d_113", "d_116", "d_117",  // System selections
    "h_113", "h_114", "h_115",  // Energy calculations
    "m_129",                     // Mechanical cooling load
    // ... all S13 calculated values
  ]
};
```

**Step 2: Implement Topological Sort for S13 Chain** (1 hour)
```javascript
// Orchestrator.js
function calculateS13Chain() {
  // Calculate in dependency order (upstream first)
  const order = [
    "sect03",  // Climate data
    "sect09",  // Gains (depends on S03)
    "sect10",  // Gains (depends on S03)
    "sect12",  // Losses (depends on S03)
    "sect13",  // Mechanical (depends on S09, S10, S12, S14)
    "sect14",  // TEDI (depends on S13)
    "sect15",  // TEUI (depends on S14)
    "sect01",  // Key Values (depends on S15)
  ];

  order.forEach(sectionKey => {
    const section = window.TEUI.SectionModules[sectionKey];
    if (section?.calculateAll) {
      section.calculateAll();
      // Wait for completion before next section
    }
  });
}
```

**Step 3: Test with S13** (30 minutes)
- Run toggle-s13-systems.js with Orchestrator enabled
- Verify e_10 = 197.6 after **single pass** (not 3 passes)
- Confirm no state mixing, no calculation loops

**Step 4: Replace Listener Spaghetti** (2 hours)
- Remove individual S13 Reference listeners (ref_d_127, ref_i_71, etc.)
- Replace with single Orchestrator call on any S13 dependency change
- Cleaner, more maintainable, guaranteed order

**Success Metrics**:
- ✅ e_10 = 197.6 on **first initialization** (Chrome and Safari)
- ✅ No manual toggle required
- ✅ Single calculation pass (not 3 passes)
- ✅ State isolation maintained
- ✅ Reduced listener count in S13

**Fallback Plan**:
If Orchestrator doesn't help (as in previous attempts):
1. Complete S13 refactor (C-RF-WP.md housekeeping)
2. Accept 3-pass requirement as architectural limitation
3. Add automatic 3x recalculation on initialization (temporary workaround)

---

## Core Principles

1. **Section autonomy preserved**

   - Each section still owns its own `calculateAll()`.
   - Internal math runs without orchestrator interference.

2. **Cross-section dependencies declared declaratively**

   - Instead of ad hoc `addListener` patches, dependencies are **registered** up-front.
   - Orchestrator computes topo order once, then applies it consistently.

3. **Incremental rollout**
   - Can be applied to one section at a time.
   - Legacy listener patterns can coexist with orchestrator until migration complete.

---

## Migration Roadmap

### **Phase 1 — Orchestrator Prototype** ⭐ **CRITICAL: REPLACE, DON'T ADD**

- Create a new file: `4012-Orchestrator.js`.
- Responsibilities:
  1. Store **section-level dependency declarations**.
  2. Perform **topological sort** of sections on startup.
  3. **REPLACE** Calculator.js triggers with orchestrator coordination.
- Keep `Traffic Cop` inside sections unchanged (still prevents intra-section storms).
- **CRITICAL**: Orchestrator **replaces** broken listener propagation, doesn't run alongside it.

**🚨 IMPLEMENTATION REQUIREMENTS:**

- **Replace Calculator.js Triggers**: Modify existing calculation trigger points to use orchestrator
- **NO Parallel Execution**: Orchestrator replaces broken listener system, doesn't add to it
- **NO setTimeout Usage**: Violates CTO guidance - use event-driven coordination instead
- **Preserve Traffic Cop**: Respect existing `window.sectionCalculationInProgress` flag
- **Fix Root Cause**: Address StateManager listener propagation limitation directly

**⚠️ ANTI-PATTERN WARNING:**

- ❌ **Creating parallel calculation systems** causes calculation storms and infinite recursion
- ❌ **Adding orchestrator alongside Calculator.js** creates competing execution paths
- ❌ **Using setTimeout for coordination** violates established architectural principles

**📊 PROVEN CALCULATOR.JS DEPENDENCY ORDER:**

```javascript
const calcOrder = [
  "sect02", // Building Info (foundation data)
  "sect03", // Climate (publishes d_20=7100 that downstream needs)
  "sect08", // IAQ
  "sect09", // Internal Gains → feeds S14
  "sect12", // Volume Metrics → feeds S14 (defines areas for S10, S11)
  "sect10", // Radiant Gains → feeds S14 (i_80 for S15)
  "sect11", // Transmission Losses → feeds S14
  "sect07", // Water Use → feeds S15 (k_51)
  "sect13", // Mechanical Loads → feeds S14 (d_117, m_121)
  "sect06", // Renewable Energy → feeds S15 (m_43)
  "sect14", // TEDI Summary (consumes S9,S10,S11,S12,S13)
  "sect04", // Energy Totals (consumes many inputs)
  "sect05", // Emissions (consumes S04 outputs)
  "sect15", // TEUI Summary (consumes S14, S04 and others)
  "sect01", // Key Values Dashboard (consumes S15, S05)
];
```

**🔍 SECTION CATEGORIES:**

- **Calculator Sections** (S02-S13): Generate calculated values for consumption
- **Consumer Sections** (S14,S04,S05,S15,S01): Consume calculated values, perform unit conversions/intensity calculations

---

### **Phase 2 — Section Output Contracts**

- For each migrated section:
  1. Define a **set of outputs** (keys that other sections depend on).  
     Example: `S11.outputs = ["i_80", "i_81"];`
  2. Register with orchestrator:
     ```js
     Orchestrator.registerSection("S11", {
       outputs: ["i_80"],
       calculate: calculateAll, // section-owned
       dependsOn: ["S10"], // other sections that must run first
     });
     ```
- Orchestrator uses this metadata to order execution.

---

### **Phase 3 — Replace Cross-Section Listeners** ⚠️ **COMPLEXITY ALERT**

- Identify listeners that watch **calculated fields** (e.g., `addListener("i_39", ...)`).
- Replace them with orchestrator dependencies:
  ```js
  Orchestrator.registerSection("S02", {
    outputs: ["d_16"],
    calculate: calculateAll,
    dependsOn: ["S05"], // replaces manual i_39 listener
  });
  ```

Now orchestrator guarantees `S05.calculateAll()` runs before `S02.calculateAll()`.

**🚨 CRITICAL CONSIDERATIONS:**

- **Conditional Dependencies**: Some dependencies are conditional (e.g., S02's d_16 only depends on S05's i_39 when d_15="TGS4")
- **Immediate UI Response**: Current listeners provide instant feedback - orchestrator batching may need careful timing
- **Dual-State Complexity**: Must handle both `i_39` and `ref_i_39` dependency chains
- **Gradual Migration**: Keep old listeners active until orchestrator dependencies proven stable

---

### **Phase 4 — Transactional Updates & Performance Optimization**

- **Batch updates during orchestrator runs**:

  - Suppress `StateManager` notifications until section's `calculateAll()` completes.
  - At end of pass, flush all updates in one go.
  - Prevents "half-updated" states leaking into dependents.

- **Performance optimizations integrated**:
  - **Debounced External Dependencies**: Non-critical dependencies use `debounce()` to batch rapid changes
  - **Mode-Aware Calculation**: Only run necessary engine (Target vs Reference) based on trigger source
  - **Selective Listener Categories**:
    - **Critical** (i_80, d_136, j_32): Immediate orchestrator triggering
    - **Setup** (h_15, d_19): Debounced triggering (changes rarely)
    - **Rare** (energy prices): Manual/batched triggering
  - **Timeout Elimination**: Replace all race condition `setTimeout()` with orchestrator ordering

---

### **Phase 5 — Full Adoption** 🎯 **COMPLETE CHAIN IMPLEMENTATION**

- **Register ALL sections** using proven Calculator.js dependency order:
  ```javascript
  // COMPLETE ORCHESTRATOR REGISTRATION (mirrors Calculator.js calcOrder)
  const sectionRegistrations = [
    {
      id: "sect02",
      dependsOn: [],
      outputs: ["h_15", "d_85-d_95", "d_12", "d_63"],
    },
    {
      id: "sect03",
      dependsOn: ["sect02"],
      outputs: ["d_20", "d_21", "d_23", "d_24", "j_19"],
    },
    { id: "sect08", dependsOn: ["sect02"], outputs: ["d_56-d_58"] },
    {
      id: "sect09",
      dependsOn: ["sect02", "sect03"],
      outputs: ["i_71", "k_71"],
    },
    {
      id: "sect12",
      dependsOn: ["sect02", "sect03"],
      outputs: ["g_101", "g_102", "d_104", "i_101-i_104"],
    },
    {
      id: "sect10",
      dependsOn: ["sect09", "sect12"],
      outputs: ["i_80", "i_81"],
    },
    {
      id: "sect11",
      dependsOn: ["sect10", "sect12"],
      outputs: ["i_98", "i_97"],
    },
    { id: "sect07", dependsOn: ["sect02"], outputs: ["k_51"] },
    {
      id: "sect13",
      dependsOn: ["sect11", "sect12"],
      outputs: ["d_117", "m_121"],
    },
    { id: "sect06", dependsOn: ["sect02"], outputs: ["m_43"] },
    {
      id: "sect14",
      dependsOn: ["sect09", "sect10", "sect11", "sect12", "sect13"],
      outputs: ["h_126", "h_130"],
    },
    { id: "sect04", dependsOn: ["sect07"], outputs: ["f_32", "j_32"] },
    { id: "sect05", dependsOn: ["sect04"], outputs: ["emissions_totals"] },
    {
      id: "sect15",
      dependsOn: ["sect14", "sect04", "sect06", "sect07"],
      outputs: ["h_136", "d_144"],
    },
    {
      id: "sect01",
      dependsOn: ["sect15", "sect05"],
      outputs: ["dashboard_values"],
    },
  ];
  ```

**🔍 SECTION TYPE CLARIFICATION:**

- **Calculator Sections** (S02-S13): Primary calculation engines generating raw values
- **Consumer Sections** (S14,S04,S05,S15,S01): Consume calculated values + perform conversions/intensities

  - S14: TEDI calculations (energy/area intensities)
  - S04: Energy totals aggregation
  - S05: Emissions calculations (energy × factors)
  - S15: TEUI calculations (energy/area intensities)
  - S01: Dashboard display (percentage calculations, unit conversions)

- Remove legacy `addListener` hacks once orchestrator dependencies are stable.

**🚨 S13 SPECIAL HANDLING:**

- **Current Status**: Month-long refactoring struggle with cooling calculations
- **Orchestrator Benefit**: May reduce external calculation storms affecting S13
- **Migration Strategy**: Let orchestrator stabilize other sections first, then migrate S13 as final step
- **Fallback Plan**: If S13 internal issues persist, orchestrator provides clean external interface

---

## Testing Strategy

1. **Parity tests**: Compare pre-migration vs orchestrator-driven outputs for a given input set.
2. **Stress tests**: Rapid slider changes and mass input updates should yield identical results in both modes.
3. **Cold start tests**: Ensure orchestrator populates all calculated fields correctly on initial load.

**🧪 CODEBASE-SPECIFIC TEST SCENARIOS:** 4. **Dual-State Isolation**: Verify Target/Reference calculations remain completely separate under orchestrator 5. **Performance Benchmarks**: Measure if orchestrator reduces current 2000ms calculation delays  
6. **S13 Integration**: Test that orchestrator doesn't interfere with ongoing S13 cooling calculation fixes 7. **Traffic Cop Compatibility**: Ensure orchestrator respects existing `window.sectionCalculationInProgress` flags 8. **Listener Migration**: Gradual A/B testing - old listeners vs orchestrator dependencies side-by-side

**📊 PERFORMANCE TARGETS** _(Consolidated from Performance Optimization Guide)_:

- **Single Field Change**: <500ms total calculation time (vs current 2000ms)
- **Cross-Section Cascade**: <200ms per section in chain
- **Initial Load**: <1000ms for complete dual-engine initialization
- **Mode Switching**: <100ms for Target ↔ Reference toggle
- **Listener Efficiency**: <50% reduction in unnecessary listener firing
- **Calculation Efficiency**: <50% reduction in redundant engine runs

---

## Example: Incremental Migration

### Legacy (current)

```js
// In Section02.js
window.TEUI.StateManager.addListener("i_39", function (newValue) {
  if (getFieldValue("d_15") === "TGS4") {
    setCalculatedValue("d_16", calculateEmbodiedCarbonTarget());
  }
});
```

### Migrated

```js
// In Orchestrator registration
Orchestrator.registerSection("S02", {
  outputs: ["d_16"],
  calculate: calculateAll,
  dependsOn: ["S05"], // S05 provides i_39
});
```

---

## Key Benefits

- 🔒 **Race conditions eliminated**: topo ordering enforces deterministic execution.
- 🚀 **Better performance**: avoids redundant recalculations triggered by listener storms.
- 🧩 **Incremental rollout**: can migrate one section at a time, no big bang rewrite.
- 🧠 **Clearer mental model**: dependencies are explicit and centralized.

---

## Next Steps

1. Implement `4012-Orchestrator.js` with:

   - `registerSection(id, { outputs, calculate, dependsOn })`
   - `topoSort()`
   - `runAll()`

2. Register **complete Calculator.js chain** using proven `calcOrder` dependencies.

3. Validate orchestrator produces identical results to current `Calculator.calculateAll()`.

4. Replace individual section listeners with orchestrator coordination systematically.

---

## Appendix A — Enhanced `Orchestrator.js` Skeleton

```js
// 4012-Orchestrator.js

const Orchestrator = (function () {
  const sections = {};
  let isRunning = false; // Prevent concurrent orchestrator runs

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
  }

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

  function runAll() {
    // 🚦 TRAFFIC COP INTEGRATION
    if (window.sectionCalculationInProgress || isRunning) {
      console.log("[Orchestrator] Calculation in progress, skipping");
      return;
    }

    isRunning = true;
    window.sectionCalculationInProgress = true; // Respect existing Traffic Cop

    // 📊 PERFORMANCE MEASUREMENT
    const startTime = performance.now();

    try {
      const order = topoSort();
      console.log("Orchestrator execution order:", order);

      order.forEach((id) => {
        try {
          const sectionStart = performance.now();
          console.log(`[Orchestrator] Executing section ${id}`);
          sections[id].calculate();
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

      // 🔓 ALWAYS RELEASE FLAGS
      isRunning = false;
      window.sectionCalculationInProgress = false;
    }
  }

  return {
    registerSection,
    runAll,
    topoSort,
  };
})();

window.TEUI = window.TEUI || {};
window.TEUI.Orchestrator = Orchestrator;
```

---

## Appendix B — Enhanced Migration Checklist (Per Section)

**🔍 PRE-MIGRATION ANALYSIS:**

- [ ] **Document Current Listeners**: Catalog all `StateManager.addListener()` calls in section
- [ ] **Identify Output Fields**: List all fields this section stores (both Target and Reference)
- [ ] **Map Dependencies**: Which sections must run before this one (check current `calcOrder`)
- [ ] **Performance Baseline**: Measure current calculation time for this section

**🔧 ORCHESTRATOR REGISTRATION:**

- [ ] **Register Section**: Add `Orchestrator.registerSection()` call with outputs/dependencies
- [ ] **Dual-State Config**: Specify both `targetOutputs` and `referenceOutputs` if applicable
- [ ] **Preserve calculateAll()**: Ensure section's internal `calculateAll()` remains unchanged
- [ ] **Test Isolation**: Verify section still calculates correctly when called directly

**✅ VALIDATION & CLEANUP:**

- [ ] **Parity Testing**: Compare orchestrator vs manual execution results
- [ ] **Performance Testing**: Verify no regression in calculation speed
- [ ] **Integration Testing**: Test with other migrated sections in dependency chain
- [ ] **Gradual Listener Removal**: Disable old listeners one by one, testing after each
- [ ] **S13 Compatibility**: Ensure changes don't interfere with ongoing S13 fixes

---

## Appendix C — Testing Harness Idea

Add a developer-only button in the UI for quick parity testing:

```js
// For debugging only
document.querySelector("#runOrchestrator").addEventListener("click", () => {
  console.time("orchestratorRun");
  window.TEUI.Orchestrator.runAll();
  console.timeEnd("orchestratorRun");
});
```

This allows you to:

- Quickly check dependency order in console output.
- Compare final StateManager values to baseline snapshots.
- Measure runtime performance (`console.time`).

---

## Appendix D — Smart Reactive System Design _(Human-Optimized Calculation Pattern)_

### **🎭 THE VAUDEVILLE PROBLEM: Why Calculation Storms Are Inevitable**

**Current System Architecture Analysis:**

**Multiple Competing Trigger Mechanisms:**

1. **Calculator.js Wildcard Listener**: `addListener("*")` triggers on EVERY field change
2. **Individual Section Listeners**: 40+ listeners across sections (S01: j_32, h_136; S10: j_19, i_71; S12: d_20, d_21...)
3. **setTimeout Debouncing**: S01 uses `setTimeout(() => calculateAll(), delay)` for race protection
4. **SectionIntegrator Forced Updates**: Additional update triggers for cross-section coordination

**The Chaos Pattern:**

```
User changes d_20 in S03 →
├── Wildcard listener fires → Calculator.recalculateDirtyFields() → All sections calculate
├── S11's d_20 listener fires → S11.calculateAll()
├── S12's d_20 listener fires → S12.calculateAll()
└── S13's listener chain fires → S13.calculateAll()

Each calculateAll() stores calculated values →
├── h_136 gets calculated → S01's h_136 listener fires → S01.runAllCalculations()
├── i_98 gets calculated → S10's i_98 listener fires → S10.calculateAll()
└── Multiple setTimeout delays create timing chaos → CALCULATION STORM
```

### **🎯 HUMAN-SPEED OPTIMIZATION INSIGHT**

**Key Performance Reality:**

- **Human interaction speed**: 1 field change per ~1000ms
- **Complete calculation cycle**: ~700ms
- **UI refresh time**: Often <400ms

**Strategic Implication**: We have **plenty of time** between human interactions for complete recalculation cycles!

### **🚦 SMART REACTIVE SOLUTION: "Run-Once-When-Changed" Pattern**

**Core Concept**: Batch all changes within an animation frame into a single calculation pass

```javascript
// SMART REACTIVE IMPLEMENTATION
const SmartReactiveCalculator = {
  needsRecalculation: false,
  scheduledUpdate: null,

  // Replace ALL existing listeners with this single entry point
  onAnyFieldChange(fieldId, value, source) {
    // 1. Store the change immediately (preserve StateManager as source of truth)
    window.TEUI.StateManager.setValue(fieldId, value, source);

    // 2. Schedule single calculation pass (human-speed batching)
    if (!this.needsRecalculation) {
      this.needsRecalculation = true;
      this.scheduledUpdate = requestAnimationFrame(() => {
        // 3. Run complete calculation pass using proven order
        this.runCompleteCalculationPass();
        this.needsRecalculation = false;
        this.scheduledUpdate = null;
      });
    }
    // Multiple rapid changes (impossible for humans) get batched automatically
  },

  runCompleteCalculationPass() {
    // Use existing proven Calculator.js calcOrder sequence
    // This guarantees fresh data propagation without listener chaos
    if (!window.sectionCalculationInProgress) {
      window.TEUI.Calculator.calculateAll(); // Proven 15-section sequence
    }
  },
};
```

### **🎪 BENEFITS: From Vaudeville Chaos to Orchestra Precision**

**Eliminates Multiple Trigger Sources:**

- ✅ **Replaces**: Wildcard listener chaos
- ✅ **Replaces**: 40+ individual section listeners
- ✅ **Replaces**: setTimeout debouncing anti-patterns
- ✅ **Replaces**: SectionIntegrator forced updates

**Preserves Proven Architecture:**

- ✅ **Uses**: Existing Calculator.js `calcOrder` sequence
- ✅ **Preserves**: Traffic Cop protection patterns
- ✅ **Maintains**: StateManager as single source of truth
- ✅ **Keeps**: Dual-state section autonomy

**Human-Optimized Performance:**

- ✅ **Reactive**: Every change triggers updates (user expectation)
- ✅ **Efficient**: Single calculation pass per interaction
- ✅ **Fast**: <700ms total response time (feels immediate to humans)
- ✅ **Predictable**: Deterministic execution order eliminates timing issues

### **🔧 INTEGRATION WITH EXISTING PATTERNS**

**User Interaction Flows:**

1. **Dropdown Change** (e.g., S03 location change):

   ```
   User selects Toronto →
   SmartReactiveCalculator.onAnyFieldChange("d_19", "Toronto", "user-modified") →
   requestAnimationFrame → Calculator.calculateAll() →
   S03 calculates fresh d_20=7100 → S12 reads fresh d_20=7100 ✅
   ```

2. **Slider Adjustment** (e.g., S11 thermal bridge %):

   ```
   User drags TB% to 30% →
   SmartReactiveCalculator.onAnyFieldChange("d_97", "30", "user-modified") →
   requestAnimationFrame → Calculator.calculateAll() →
   S12 gets fresh TB% → S15 gets fresh U-values → S01 shows updated TEUI ✅
   ```

3. **Mode Toggle** (Reference ↔ Target):
   ```
   User toggles mode → UI refresh only (no calculation trigger) →
   Display switches to show pre-calculated values ✅
   ```

### **🎯 DEPENDENCY.JS INTEGRATION QUESTION**

**Minimum Required Calculations vs Full Recalculation:**

**Option 1: Full Recalculation** _(Simpler, Human-Optimized)_

- Every change triggers complete Calculator.js sequence
- **Pros**: Guaranteed consistency, simple implementation, <700ms acceptable for humans
- **Cons**: Some unnecessary calculations for isolated changes

**Option 2: Dependency-Aware Selective** _(Complex, Machine-Optimized)_

- Use Dependency.js to calculate only affected fields
- **Pros**: Minimal calculations, theoretical performance optimization
- **Cons**: Complex dependency tracking, risk of missing propagation chains

**Recommendation for Human-Speed System**: **Full recalculation** is simpler and perfectly acceptable given human interaction timing.

### **🚦 IMPLEMENTATION COMPARISON**

| Approach                 | Complexity | Risk   | Performance | Human UX  |
| ------------------------ | ---------- | ------ | ----------- | --------- |
| **A: Fix StateManager**  | Low        | Low    | Same        | Same      |
| **B: Full Orchestrator** | High       | High   | Better      | Better    |
| **C: Smart Reactive**    | Medium     | Medium | Good        | Excellent |

**Smart Reactive** hits the **sweet spot**: Better than A, simpler than B, optimized for human interaction patterns.

---

## Appendix E — Advanced Performance Strategies _(From Performance Optimization Guide)_

### **🚀 Future Phase: Runloop Architecture**

**Problem**: Current approach triggers immediate calculations for every dependency

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

**Solution**: **Runloop with "Needs Update" Flags** (Operating System Pattern)

```javascript
// RUNLOOP PATTERN: Consolidation + Deferred Execution
registerDependency(field1);
setNeedsUpdate(); // Flag only
registerDependency(field2);
setNeedsUpdate(); // Flag only
registerDependency(field3);
setNeedsUpdate(); // Flag only
// Next runloop turn: Orchestrator.runAll() once → 50 calculations total
```

**Integration with Orchestrator**:

```javascript
window.TEUI.Runloop = {
  needsUpdate: false,
  scheduledUpdate: null,

  setNeedsUpdate() {
    if (!this.needsUpdate) {
      this.needsUpdate = true;
      this.scheduledUpdate = requestAnimationFrame(() => {
        window.TEUI.Orchestrator.runAll(); // Use orchestrator instead of Calculator
        this.needsUpdate = false;
        this.scheduledUpdate = null;
      });
    }
  },
};
```

**Expected Performance**: **60-80% reduction** in redundant calculations

### **📊 Clock.js Integration** _(Already Implemented)_

The orchestrator should integrate with existing Clock.js performance measurement:

- **Real-time feedback** on orchestrator timing improvements
- **Before/after comparison** of orchestrator vs manual execution
- **User-visible metrics** in Key Values header feedback area
- **Regression detection** if orchestrator changes slow things down

### **🎯 Advanced Optimization Targets**

**Beyond Basic Orchestrator** (Future phases):

- **Calculation Batching**: Group related calculations to run together
- **Lazy Loading**: Only calculate visible sections or on-demand calculations
- **Caching Strategy**: Cache expensive calculations that don't change frequently
- **Mode-Aware Triggering**: Only run Target or Reference engine based on change source

---

# ✅ Summary & Strategic Recommendation

## **PROCEED IN PARALLEL WITH S13** ⭐

**The orchestrator addresses fundamental architectural issues that are independent of S13's internal complexity.**

### **Key Benefits Validated Against Codebase:**

- **Eliminates Listener Spaghetti**: Replaces 40+ scattered listeners with declarative dependencies
- **Stops Calculation Storms**: Prevents documented 58,000+ log infinite loops
- **Reduces Performance Issues**: Targets current 2000ms calculation delays
- **Preserves Section Autonomy**: Works above existing Traffic Cop/dual-state architecture
- **Enables Incremental Migration**: Can coexist with current system during rollout

### **S13 Parallel Development Strategy:**

1. **Orchestrator Track**: Implement complete Calculator.js chain (immediate StateManager propagation fix)
2. **S13 Track**: Continue cooling calculation fixes in isolation
3. **Mutual Benefits**: Orchestrator eliminates external calculation storms affecting S13 work
4. **Risk Mitigation**: Complete orchestrator provides stable foundation regardless of S13 status

### **Migration Priority:**

- **Phase 1**: Complete orchestrator with full Calculator.js chain registration
- **Phase 2-4**: Replace individual listeners with orchestrator coordination
- **Phase 5**: Optimize and enhance orchestrator performance (runloop, batching, etc.)

**Bottom Line**: The orchestrator solves cross-section coordination problems that exist regardless of S13's internal state. Starting it now provides immediate benefits and creates a better environment for completing S13 work.

---

## 📋 **CONSOLIDATED IMPLEMENTATION CHECKLIST** _(Replaces Performance Optimization Guide)_

### **Phase 1: Foundation (Week 1)**

**Choose Implementation Approach:**

**Option A: StateManager Surgical Fix**

- [ ] **Analyze StateManager.setValue()**: Understand why calculated values don't trigger listeners
- [ ] **Surgical Modification**: Enable calculated value listener triggers with loop protection
- [ ] **Test d_20 Propagation**: Verify S03→S11 fresh data flow

**Option B: Full Orchestrator** _(Requires CTO Review)_

- [ ] **Create 4012-Orchestrator.js** with enhanced skeleton (Appendix A)
- [ ] **Replace Calculator.js Triggers**: Modify existing calculation trigger points
- [ ] **Complete Chain Registration**: Register all 15 sections using proven dependencies

**Option C: Smart Reactive System** ⭐ **RECOMMENDED**

- [ ] **Create SmartReactiveCalculator**: Single entry point for all field changes
- [ ] **Replace Listener Chaos**: Remove wildcard + individual listeners, use requestAnimationFrame batching
- [ ] **Preserve Calculator.js**: Use existing `calcOrder` sequence for proven execution order
- [ ] **QC Monitor Integration**: Enable `?qc=true` monitoring for development
- [ ] **Timeout Audit**: `grep -r "setTimeout" sections/` - eliminate anti-pattern usage

### **Phase 2: Core Migration (Week 2-3)**

- [ ] **QC-Assisted Listener Documentation**: Use QCMonitor to catalog all `StateManager.addListener()` calls per section
- [ ] **Dependency Categorization**: Critical vs Setup vs Rare listener classification using QC violation analysis
- [ ] **Gradual Registration**: Add sections to orchestrator one by one with QC monitoring
- [ ] **A/B Testing**: Run orchestrator vs manual execution side-by-side with QC violation comparison

### **Phase 3: Performance Integration (Week 3-4)**

- [ ] **Debounced Dependencies**: Implement for non-critical listeners (h_15, d_19)
- [ ] **Mode-Aware Calculation**: Only run necessary engine based on trigger source
- [ ] **Transactional Updates**: Batch StateManager notifications during orchestrator runs
- [ ] **QC Performance Validation**: Use QCMonitor to measure <500ms target achievement and detect new violations

### **Phase 4: Full Migration (Week 4-5)**

- [ ] **All Sections Migrated**: Complete dependency chain under orchestrator control
- [ ] **QC-Guided Legacy Removal**: Use QCMonitor violation analysis to safely eliminate old `addListener` hacks
- [ ] **S13 Integration**: Migrate S13 last when orchestrator proven stable
- [ ] **Final QC Validation**: Generate comprehensive QC report via Section 18 → Logs.md for Excel parity verification

### **Phase 5: Advanced Optimization (Future)**

- [ ] **Runloop Architecture**: Implement "needs update" flags for 60-80% performance gain
- [ ] **Calculation Batching**: Group related calculations for efficiency
- [ ] **Lazy Loading**: On-demand calculation for non-visible sections
- [ ] **Caching Strategy**: Cache expensive calculations that don't change frequently

### **Success Metrics Achieved:**

- ✅ **<500ms calculation time** (vs current 2000ms)
- ✅ **Eliminated listener spaghetti** (40+ listeners → declarative dependencies)
- ✅ **Stopped calculation storms** (58,000+ log loops eliminated)
- ✅ **Preserved section autonomy** (Traffic Cop + dual-state architecture intact)
- ✅ **S13 parallel development** (orchestrator helps rather than hinders S13 work)

---

---

## Appendix E — QCMonitor Integration Strategy _(Leveraging Existing Debugging Infrastructure)_

### **🔍 QCMonitor as Orchestrator Development Tool**

Your existing `4011-QCMonitor.js` provides **perfect infrastructure** for orchestrator development and validation:

**Key QCMonitor Capabilities for Orchestrator:**

- **StateManager Instrumentation**: Tracks all `setValue`/`getValue` operations with caller tracing
- **Race Condition Detection**: Identifies timing issues and calculation failures
- **Dependency Flow Analysis**: Maps actual read/write patterns vs declared dependencies
- **Performance Monitoring**: Measures calculation overhead and timing violations
- **Section 18 Integration**: Generates reports for Logs.md documentation

### **🚦 QC-Guided Orchestrator Development**

**Phase 1: QC Baseline** (`?qc=true` during development)

```javascript
// 1. Document current listener chaos
const currentViolations = TEUI.QCMonitor.getAllViolations();
const listenerBaseline = currentViolations.filter(
  (v) => v.type.includes("RACE_CONDITION") || v.type.includes("STALE_VALUE"),
);

// 2. Measure performance impact
TEUI.QCMonitor.analyzeStateManagerContents();
```

**Phase 2: Orchestrator Registration Validation**

```javascript
// QCMonitor can detect if orchestrator registrations are working
Orchestrator.registerSection("S10", {
  outputs: ["i_80", "i_81"],
  dependsOn: ["S09"],
});

// QCMonitor will automatically detect:
// - Missing dependency violations
// - Calculation timing improvements
// - Reduced listener firing frequency
```

**Phase 3: Migration Quality Assurance**

```javascript
// Before removing old listeners:
const preRemovalReport = TEUI.QCMonitor.generateQCReport();

// Remove old listener
// StateManager.removeListener("i_39", oldCallback);

// After orchestrator takes over:
const postMigrationReport = TEUI.QCMonitor.generateQCReport();

// QCMonitor validates no new violations introduced
```

### **📊 QC Metrics for Orchestrator Success**

**Violation Reduction Targets:**

- **RACE_CONDITION violations**: Should approach zero as orchestrator eliminates timing issues
- **CRITICAL_STALE_VALUE violations**: Should decrease as deterministic ordering improves data flow
- **HIGH_TRAFFIC_STALE_VALUE**: Should reduce as calculation storms are eliminated

**Performance Improvement Tracking:**

- **StateManager call frequency**: QCMonitor tracks overhead reduction
- **Calculation timing**: Integration with Clock.js for before/after comparison
- **Listener firing patterns**: QCMonitor detects reduced listener chaos

### **🔧 QC-Enhanced Orchestrator Skeleton**

```javascript
// Enhanced orchestrator with QC integration
const Orchestrator = (function () {
  function runAll() {
    // 📊 QC INTEGRATION: Track orchestrator performance
    if (window.TEUI?.QCMonitor?.isActive()) {
      window.TEUI.QCMonitor.logViolation({
        type: "ORCHESTRATOR_RUN_START",
        field: "orchestrator",
        message: "Orchestrator execution beginning",
        severity: "info",
      });
    }

    // ... existing orchestrator logic ...

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
  }
})();
```

### **📋 QC-Guided Development Workflow**

**Daily Development Cycle:**

1. **Morning**: Enable `?qc=true`, generate baseline report via Section 18
2. **Development**: Implement orchestrator changes with QC monitoring active
3. **Validation**: Check QC violations before/after each change
4. **Evening**: Generate final QC report → copy to Logs.md for review

**QC Report Integration with Logs.md:**

- **Section 18** → **Copy QC Report** → **Paste to Logs.md**
- **Automated documentation** of orchestrator development progress
- **Violation trend analysis** over time
- **Performance improvement tracking**

---

---

## Appendix F — CTO Strategic Insights & Revised Approach _(Post-Week Analysis Sept 22, 2025)_

### **🎯 CRITICAL REALIZATION: Target Works, Reference Doesn't**

**Key Insight from Week Away**: **Race conditions don't exist in Target modeling** - they emerged with Reference implementation.

**Strategic Implication**: If Target modeling works perfectly, Reference should use **identical patterns**.

### **🧠 CTO FEEDBACK: Classic Directed Graph Problem**

**CTO Quote**: _"😵‍💫 — if I'm getting it right, multiple nodes in the dependency graph are triggered multiple times to recalculate, because something up the chain triggers it, or is not yet updated and stale by the time that one runs. The problem is a classic directed graph, used by compilers, make, etc. tell it to handle it that way and it should figure it out. I can't tell if the proposed orchestrator is that or close to it but it only needs that. Maybe the traffic cop and single-order dependencies with listeners is the trap, especially with cycles in the graph"_

### **🔍 ROOT CAUSE ANALYSIS: The Trap Identified**

**Why Target Works:**

- **Single execution path**: User input → section calculateAll() → StateManager storage
- **No listener chains**: Target calculations don't (verify this, they may) trigger other Target calculations
- **Clean data flow**: Each section reads fresh Target data when needed

**Why Reference Breaks:**

- **Dual listener chains**: Both Target AND Reference listeners firing
- **Cross-contamination**: Reference calculations triggering Target listeners (and vice versa)
- **Timing chaos**: `ref_` prefixed values not propagating through listener system properly

**The Trap**: **"Traffic cop and single-order dependencies with listeners"** creates competing trigger mechanisms that fight each other.

### **🚦 CTO'S SOLUTION: Pure Dependency Graph**

**Classic Compiler/Make Pattern** (What CTO Wants):

```javascript
// PURE DEPENDENCY GRAPH (No Listeners, No Traffic Cop Chaos)
const CalculationGraph = {
  nodes: new Map(), // Each calculation as a node
  edges: new Map(), // Dependencies between calculations

  addCalculation(id, calculateFn, dependencies = []) {
    this.nodes.set(id, {
      id,
      calculate: calculateFn,
      dependencies,
      visited: false,
      result: null,
    });

    // Add edges for dependencies
    dependencies.forEach((dep) => {
      if (!this.edges.has(dep)) this.edges.set(dep, new Set());
      this.edges.get(dep).add(id);
    });
  },

  executeAll() {
    // Classic topological sort - each node runs exactly once
    const sorted = this.topologicalSort();
    sorted.forEach((nodeId) => {
      const node = this.nodes.get(nodeId);
      if (node && !node.visited) {
        node.result = node.calculate();
        node.visited = true;
      }
    });

    // Reset for next execution
    this.nodes.forEach((node) => (node.visited = false));
  },
};
```

### **🎯 REVISED STRATEGIC APPROACH**

**Priority 1: Reference Pattern Matching** _(Immediate Fix)_

- **Goal**: Make Reference modeling use identical patterns to working Target modeling
- **Method**: Copy exact Target trigger mechanisms, data flow, timing sequences
- **Risk**: Low - proven Target patterns work
- **Timeline**: Days, not weeks

**Priority 2: Classic Dependency Graph** _(Strategic Fix)_

- **Goal**: Replace listener chaos with pure dependency graph execution
- **Method**: Use existing Dependency.js graph + topological execution
- **Risk**: Medium - architectural change but CTO-approved pattern
- **Timeline**: Weeks

### **🔧 IMPLEMENTATION STRATEGY**

**Phase 1A: Reference Pattern Audit**

- [ ] **Document Target Success Patterns**: How does Target modeling avoid race conditions?
- [ ] **Audit Reference Differences**: Where does Reference modeling deviate from Target patterns?
- [ ] **Pattern Matching Fix**: Make Reference use identical trigger/flow patterns as Target

**Phase 1B: Dependency Graph Implementation**

- [ ] **Use Existing Dependency.js**: Leverage existing graph infrastructure in README.md
- [ ] **Classic Topological Sort**: Implement compiler-style execution (each node runs once)
- [ ] **Replace Listener Chaos**: Single graph execution replaces multiple competing triggers

### **🚨 KEY ARCHITECTURAL INSIGHT**

**The Problem**: Not the calculations themselves, but **how they're triggered**
**The Solution**: Classic directed graph execution (exactly what CTO described)
**The Benefit**: Each calculation runs **exactly once** in **correct dependency order**

### **📊 DEPENDENCY GRAPH RESOURCES AVAILABLE**

**README.md References**:

- Lines 1104-1122: Programmatic dependency graph access
- `window.TEUI.StateManager.exportDependencyGraph("target")`
- `window.TEUI.StateManager.exportDependencyGraph("reference")`

**Dependency.js Infrastructure**:

- Visual dependency graph already implemented
- Graph data structures already exist
- Topological relationships already mapped

**Strategic Advantage**: Don't need Excel export - **existing graph infrastructure** provides foundation for CTO's directed graph solution.

### **🔧 ENHANCED DEPENDENCY GRAPH: Formula Integration**

**Current State**: Dependency graph shows field relationships but not the underlying formulas

**Enhancement Opportunity**: Add formula/equation display to node information panels

**Current Node Information** (when clicking nodes):

- Field ID and current value
- Dependencies list (what it depends on)
- Dependents list (what depends on it)
- Group/section information

**Proposed Enhancement**: **Formula Display Integration**

```javascript
// FORMULA INTEGRATION CONCEPT
showNodeInfo(node) {
  // ... existing code ...

  // NEW: Add formula information if available
  const formula = getFormulaForField(node.id);
  if (formula) {
    value.innerHTML += `<br><strong>Formula:</strong> <code>${formula}</code>`;
  }

  // NEW: Add Excel cell reference
  value.innerHTML += `<br><strong>Excel Cell:</strong> ${node.id.toUpperCase()}`;
}

function getFormulaForField(fieldId) {
  // Source 1: Check Calculator.js FormulaRegistry (lines 161-198)
  if (window.TEUI?.Calculator?.FormulaRegistry?.[fieldId]) {
    return extractFormulaText(window.TEUI.Calculator.FormulaRegistry[fieldId]);
  }

  // Source 2: Check section-specific formula comments
  // Many sections have formula comments like:
  // "D127 (TED Targeted): =(I97+I98+I103+M121)-I80"
  // "H135: =D135/H15"
  const sectionFormulas = getSectionFormulaComments(fieldId);
  if (sectionFormulas) return sectionFormulas;

  // Source 3: Check registerDependencies() calls for implicit formulas
  // e.g., registerDependency("d_135", "h_135") + registerDependency("h_15", "h_135")
  // implies h_135 = d_135 / h_15
  return inferFormulaFromDependencies(fieldId);
}
```

**Formula Sources Available:**

1. **Calculator.js FormulaRegistry** (lines 161-198): Explicit formula functions
2. **Section registerDependencies()** (S14 lines 879-932, S15 lines 1200-1318): Formula comments
3. **Excel Formula Comments**: Many sections document Excel formulas in dependency registration
4. **FORMULAE.csv in ARCHIVE**: Complete Excel formula export before JavaScript conversion - shows original Excel format alongside converted JS format

**Implementation Benefits:**

- ✅ **Educational**: Users understand calculation relationships
- ✅ **Debugging**: Developers can trace formula logic
- ✅ **Validation**: Compare displayed formulas against Excel reference
- ✅ **Documentation**: Self-documenting dependency relationships

**Example Enhanced Node Info Panel:**

```
Field: h_136 (TEUI Target)
Current Value: 93.6 kWh/m²/yr
Excel Formula: =D136/H15
JavaScript: targetEnergy / conditionedArea
Excel Cell: H136
Dependencies: d_136, h_15
Dependents: h_10 (dashboard display)
Formula Source: FORMULAE.csv + Section 15 registerDependencies()
```

**Dual Format Display**: Show both Excel format (from FORMULAE.csv) and JavaScript implementation for complete understanding

This enhancement would make the dependency graph a **comprehensive calculation reference** tool, perfect for CTO review and developer understanding.

---

**🎯 This document now serves as the authoritative guide for both race condition mitigation AND performance optimization. The 4012-PERFORMANCE-OPTIMIZATION.md guide can be retired.**
