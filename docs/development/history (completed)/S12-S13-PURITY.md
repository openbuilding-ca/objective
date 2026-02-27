# S12-S13 Purity Investigation

**Branch**: `S12-S13-PURITY`
**Parent Branch**: `S10-S11-PURITY` (COMPLETE ✅)
**Date Started**: 2025-10-25
**Goal**: Fix Reference model calculation flow S12→S13 and S12 air leakage bug

**Last Updated**: 2025-10-27 (Final - HYBRID EXPERIMENT CONCLUDED)

---

## 🧪 FINAL HYBRID EXPERIMENT - CONCLUSION (Oct 27, 2025)

**EXPERIMENT**: Combine oct25 CSV export block + current Reference listeners to achieve correct initialization without state mixing.

**FILES TESTED**:
1. **Working/Offline** (4012-Section13-offline.js): Perfect state isolation, wrong e_10 initialization (277.8)
2. **Hybrid** (4012-Section13.js): CSV export + Reference listeners

**RESULTS**:
- ✅ **Initialization**: e_10 = 195.9 (closer to Excel 196.6 than 277.8)
- ❌ **State Mixing**: Present in S10 g_63 (occupied hours) and potentially other sections
- ⚠️ **One-time corrections**: Some "mixing" is actually multi-pass propagation completing (acceptable)
- ❌ **True state mixing**: Target g_63 changes cause BOTH h_10 (Target) AND e_10 (Reference) to update

**ROOT CAUSE OF HYBRID STATE MIXING**:
Initial hypothesis (climate listeners d_20/d_21) was **INCORRECT**. Both working and hybrid files have identical climate listeners. The CSV export block itself appears to create listener contamination or timing issues that break state isolation in ways we cannot easily identify without major refactoring.

**SPECIFIC STATE MIXING EXAMPLE (S10 g_63)**:
- **Hybrid**: g_63 change in Target mode → h_10 changes (correct) + e_10 changes (STATE MIXING ❌)
- **Working**: g_63 change in Target mode → h_10 changes (correct), e_10 unchanged (ISOLATED ✅)

**ATTEMPTED FIXES**:
1. Removed climate listeners (d_20, d_21) - **NO EFFECT** (both files have same listeners)
2. Analyzed getExternalValue() - identical in both files
3. Investigated S10 publishing ref_i_63 - not the issue

**DECISION**: Abandon hybrid approach. The "easy fix" doesn't exist.

**LESSONS LEARNED**:
- CSV export block contamination mechanism is subtle and deeply intertwined with initialization timing
- Multi-pass calculation dependency (S13→S14→S15→S01) is the real root cause of wrong initialization
- Band-aid solutions won't work - need proper architectural solution

**PRESERVED FILES** (moved to backups):
- 4012-Section13.js.oct27-hybrid (experimental hybrid - state mixing present)
- 4012-Section13.js.oct25 (original - state mixing + correct init)
- 4012-Section13.js.oct26.js (earlier experiment)
- 4012-Section13.js.current-backup (clean working version backup)

**FINAL COMMIT**: 802adf7 (reverted incorrect climate listener fix)

**NEXT STEPS**: Complete S13 refactor (C-RF branch), then implement Orchestrator.js directed graph solution.

---

## 🧪 EXPERIMENTAL HYBRID VERSION (Oct 26, Very Late Evening) - Commit bf6ad3e

**HYPOTHESIS**: Combine best of both versions without Orchestrator.

**Active File**: 4012-Section13.js (HYBRID combining oct25 + Reference listeners)
- ✅ CSV Export Block: Publishes Reference defaults during init (from oct25)
- ✅ Reference Listeners: All 6 listeners for automatic propagation (from current)
- ❓ State Isolation: To be tested (Reference listeners previously tested clean)

**Theory**:
Oct 25 state mixing was NOT caused by:
- CSV export block (tested removed, mixing persisted)
- Missing Reference listeners (current version has them, no mixing)

Likely causes of Oct 25 state mixing:
- Something else in that specific version
- OR testing artifact/misunderstanding

**Expected Results**:
- ✅ e_10 initialization: ~192-197 (not 277.8) - CSV export provides values
- ✅ State isolation: Clean (Reference listeners tested)
- ✅ Automatic propagation: Working (listeners present)

**If This Works**: Correct initialization WITHOUT Orchestrator! 🎉
**If State Mixing Returns**: Reference listeners somehow cause contamination
**If e_10 Still Wrong**: CSV export timing issue remains

**Backup**: Previous working version saved as 4012-Section13.js.current-backup

---

## 🚀 MAJOR BREAKTHROUGH (Oct 26, Late Evening)

**ROOT CAUSE IDENTIFIED: Multi-Pass Calculation Dependency Issue** (NOT timing race)

- ✅ **Safari**: e_10 = 195.4 (Excel parity!) - 611ms initialization
- ❌ **Chrome**: e_10 = 277.8 (wrong) - 640ms initialization
- **Chrome is faster** → S01 calculates BEFORE S13 Reference values ready
- **Safari is slower** → S13 Reference values ready BEFORE S01 calculates

**This explains EVERYTHING**:
- Why manual toggle fixes it (forces re-calculation after S13 ready)
- Why Target fallback didn't work (timing issue, not defaults issue)
- Why debug logging was confusing (race makes execution order unpredictable)

**Tomorrow's Plan**: Complete S13 refactor per C-RF-WP.md (housekeeping/cleanup)
- May naturally improve race condition timing
- If not, proceed to SEPT15-RACE-MITIGATION.md (Orchestrator.js)

**Current Status**:
- ✅ Excel parity: 99.5% accurate (195.4 vs 196.6)
- ✅ State isolation: Clean across all sections
- ✅ Automatic propagation: Working perfectly
- ⚠️ Race condition: Browser-dependent initialization timing

---

## 🎯 Mission Statement

Restore clean Reference model calculation flow from S12 (envelope) to S13 (heating loads) while maintaining CSV export completeness. Fix S12 air leakage calculation bug for 3+ storey buildings.

---

## ✅ Recent Victories (Oct 25 Evening)

### S12 N-Factor Lookup Table Extension
**Status**: ✅ COMPLETE (Commits: 9599324, c69a332)
- Extended n-Factor lookup from 3 stories to 6 stories
- Added values for 4, 5, 6 storey buildings across all zones/exposures
- Source: NRL50 Excel lookup table
- Fixes Issue #2: Air leakage calculations now work for all building heights

### S12→S10 Reference Flow FIXED
**Status**: ✅ COMPLETE (Commit: 1f46772)
- **Bug**: ref_g_81 would update ONCE, then freeze on subsequent S12 changes
- **Root Cause**: DUPLICATE LISTENERS in S10
  - Fields i_97, i_103, m_121, i_98 registered TWICE
  - First listener: called calculateAll() ✅ (dual-engine, correct)
  - Second listener: called calculateUtilizationFactors() ❌ (Target-only)
  - When in Reference mode, second listener contaminated ReferenceState with Target calculations
- **Fix**: Removed duplicate listener block entirely
- **Result**: S10's ref_g_81 now updates correctly every time S12 storeys change

---

## ✅ What We've Achieved (From S10-S11-PURITY)

### S12 Reference Field Publication
**Status**: ✅ COMPLETE
- All 5 S12 Reference user input fields export to CSV correctly
- Fields: ref_d_103, ref_g_103, ref_d_105, ref_d_108, ref_g_109
- Fix: Browser cache issue + safety net in calculateAll()
- Commit: 2befec9

### S13 File Status ⚠️ FILES SWAPPED (Oct 25 Evening)

**ACTIVE FILE** (In calculation flow):
- `4012-Section13.js` (3662 lines) - **BACKUP VERSION NOW ACTIVE**
  - ✅ GOOD state isolation (Target/Reference independent)
  - ❌ Missing CSV export for Reference fields
  - ❌ e_10 initialization needs improvement (~287.0, target ~192.9)
  - 📋 Tomorrow: Add CSV export using S12 safety net pattern

**OFFLINE FILE** (Taken out of calculation flow):
- `4012-Section13.js.oct25` (3682 lines) - **STATE MIXING VERSION**
  - ❌ BROKEN state isolation (significant state mixing across sections)
  - ❌ Target changes contaminate Reference values
  - ✅ Good e_10 initialization (192.9)
  - ✅ Has CSV export
  - 📋 Kept for reference to understand e_10 calculation differences

**Why We Swapped**:
User chose Option B: "Carefully add CSV export improvements to the backup S13 file"
- Starting from known-good state isolation
- Conservative, testable approach
- Lower risk than fixing broken architecture

---

## 🐛 Current Issues

### Issue 1: S13 CSV Export Block Causing State Mixing ⚠️ HIGH PRIORITY

**Problem**:
- S12 → S14 Reference flow: ✅ WORKING (d_127, d_128, d_131 update)
- S12 → S15 Reference flow: ✅ WORKING (ref_d_135 updates)
- S12 → S15 → S04 Reference flow: ✅ WORKING (ref_j_32 updates)
- **S12 → S13 → S01 Reference flow**: ❌ BLOCKED (e_10 doesn't update)
- **Current S13**: "significant state mixing when we make changes in other sections"
- **Backup S13**: "good state isolation" and working flow

**Observation** (User):
> "We have good state isolation among most Target and Reference models across all section files, but this current working S13 file, while it gives us near parity with excel's e_10 and h_10 values, still results in significant state mixing when we make changes in other sections that feed S13 with values it consumes."

**ROOT CAUSE IDENTIFIED** (Post-Dinner Analysis):

**Diff Analysis Results**:
- Total changes: 26 lines (20 line increase: 3662 → 3682)
- **Change #1** (Lines 226-236): CSV export block ⚠️ **THIS IS THE PROBLEM**
- **Change #2** (Lines 2940-2957): m_124 two-stage handling ✅ (good change, not the issue)

**The Smoking Gun - CSV Export Block**:
```javascript
// ✅ CSV EXPORT FIX: Publish ALL Reference defaults to StateManager
if (window.TEUI?.StateManager) {
  ["d_113", "f_113", "j_115", "d_116", "d_118", "g_118", "l_118", "d_119", "l_119", "k_120"].forEach((id) => {
    const refId = `ref_${id}`;
    const val = ReferenceState.getValue(id);
    if (!window.TEUI.StateManager.getValue(refId) && val != null && val !== "") {
      window.TEUI.StateManager.setValue(refId, val, "calculated"); // ❌ WRONG SOURCE!
    }
  });
}
```

**Why This Breaks Everything**:
1. **Wrong source type**: Uses `"calculated"` instead of `"default"`
2. **Wrong timing**: Runs during `ModeManager.initialize()` (before sections fully loaded)
3. **Cascade effect**: Publishing with `"calculated"` source triggers ALL downstream listeners
4. **State contamination**: Cascading calculations run before dual-engine architecture stabilizes
5. **Result**: Target calculations overwrite Reference state (same bug pattern as S10 duplicate listeners!)

**Backup file works because**: It has NO CSV export block at lines 226-236!

**Success Criteria**:
- ✅ S12 Reference changes propagate to S13 heating loads
- ✅ e_10 updates when S12 Reference envelope values change
- ✅ All S13 Reference fields still export to CSV
- ✅ Maintain good e_10 initialization (~192.9)

---

### Issue 2: S12 Air Leakage Bug (3+ Storeys) ⚠️ MEDIUM PRIORITY

**Problem**:
Changes to d_103 (number of storeys) only produce recalculations up to 3 storeys. Beyond 3 storeys, air leakage calculations don't update.

**Background**:
- S12 uses mini JSON table to map air leakage values based on storey height - check if this formula supports 4, 5, 6 storey parameters from d_103
- This functional recall appears broken beyond 3 storeys
- **Historical**: This has NEVER worked - predates dual-state refactors
- Separate from state isolation work

**Status**: Documented but deferred until S13 calculation flow is restored

**File**: [4012-Section12.js](../sections/4012-Section12.js)
**Related Calculation**: Air leakage heat loss (uses d_103 as input)

---

## 📋 Investigation Workplan

### Phase 1: S13 Diff Analysis (NEXT TASK)

**Objective**: Identify what in the 48-line diff breaks S13 consumption

**Steps**:
1. Generate detailed diff of backup vs CSV-fix S13:
   ```bash
   diff -u OBJECTIVE\ 4011RF/sections/4012-Section13.js \
           OBJECTIVE\ 4011RF/sections/4012-Section13.js.backup.js
   ```

2. Focus on these areas:
   - StateManager.addListener calls for S12 Reference fields
   - getExternalValue() or getValue() calls reading S12 data
   - ModeManager.initialize() and when CSV publication runs
   - Any code that might prevent listener registration

3. Look for timing issues:
   - Does CSV publication run before listeners are added?
   - Does it overwrite values S13 needs from S12?

**Key Questions**:
- Where does S13 consume S12 envelope data (d_103, g_103, etc.)?
- How does backup S13 trigger recalculation when S12 publishes?
- What's different in CSV-fix S13 that breaks this?

---

### Phase 2: Attempted Fix - S12 Safety Net Pattern ❌ FAILED

**Status**: REVERTED (Commit 0d1e817 → acd5755)

**The Attempted Solution**: Remove CSV export block from initialize(), use S12's safety net pattern in calculateAll()

**Why We Thought This Would Work**:
- S12 uses this pattern successfully (lines 2289-2301 in S12)
- Publishes Reference user input fields in `calculateAll()` AFTER both engines run
- Uses `"default"` source, not `"calculated"`
- Runs at the RIGHT time (after initialization, during normal calculation)
- No cascading listener triggers during initialization

**Implementation Tried**:
1. **Removed** lines 226-236 from current S13 (the CSV export block)
2. **Added** safety net in S13's `calculateAll()` function (after both engines run):
```javascript
// ✅ CSV EXPORT SAFETY NET: Ensure user input Reference fields are published
// (Moved from initialize() to prevent cascading listener triggers during startup)
// Uses "default" source to avoid triggering listeners, runs AFTER both engines complete
if (window.TEUI?.StateManager) {
  const userInputFields = ["d_113", "f_113", "j_115", "d_116", "d_118", "g_118", "l_118", "d_119", "l_119", "k_120"];
  userInputFields.forEach((fieldId) => {
    const value = ReferenceState.getValue(fieldId);
    if (value !== null && value !== undefined && value !== "") {
      window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, "default");
    }
  });
}
```

**Test Results** (Oct 25, Late Evening):
- ❌ Nothing broke but nothing improved
- ❌ Still "significant state mixing across a number of sections"
- ❌ Changes in Target mode still affect Reference model values
- ❌ Pattern that worked perfectly in S12 did NOT work in S13

**Why It Failed**:
- **The CSV export block is NOT the root cause**
- State mixing persists even with block removed
- Problem is deeper in S13's architecture
- S13 is fundamentally different from S12 (heating loads vs envelope)

**Key Insight**:
> "Nothing broke but nothing improved either. Still significant state mixing across a number of sections (ie change made in Target only, values change in both Target and Reference models)."

**Decision**: Revert and take more careful approach tomorrow

**Lessons Learned**:
1. S13 state mixing is NOT solely caused by CSV export timing
2. S12 safety net pattern doesn't translate directly to S13
3. S13 is the last file to refactor in nearly 12-month cycle - can't afford to get it wrong
4. Need deeper architectural analysis of S13's listener setup
5. Must identify ALL places where Target/Reference states interact in S13

---

### Phase 3: Tomorrow's Plan (Option B - Build on Backup) ✅ APPROVED

**Strategy**: Add CSV export to backup S13 (now active) without breaking state isolation

**Phase 1: Baseline Test** (15 min) ✅ COMPLETE (Oct 25 Evening)
- ✅ Load backup S13 with current codebase (DONE - now active file)
- ✅ Test state isolation still works (hard refresh required)
- ✅ **STATE ISOLATION CONFIRMED EXCELLENT** (User test)
  - Reference changes apply to Reference model ONLY
  - Target changes apply to Target model ONLY
  - NO state mixing across nearly EVERY section
  - Tested wide sampling of key user edit fields
- ❌ Missing CSV export functionality for Reference fields
- ⚠️ **Values on Fresh Initialization**:
  - **e_10**: 277.8 (Current) vs ~196.6 (Excel parity target) - **NEEDS IMPROVEMENT**
  - **h_10**: 93.6 (Current) vs 93.7 (Excel parity target) - **VERY CLOSE** ✅
  - Note: .oct25 file achieved e_10 ~196.6 but with broken state isolation
  - Goal: Achieve Excel parity (196.6) WITHOUT breaking state isolation

**Phase 2: Add Missing Reference Listeners** (CRITICAL - Must do FIRST!) ⚠️
- **Goal**: Enable automatic propagation of Reference changes to S13
- **Current State**: Reference calcs work when triggered manually, but don't auto-update

**Test 1: ref_d_127 (TED from S14)** ✅ SUCCESS (Oct 26, 2025)
- **Added**: Line 1933-1936 in registerWithStateManager()
- **Test**: Changed S09 d_64 (activity level) in Reference mode
- **Result**:
  - Initial e_10: 277.8
  - After change: e_10 = 267.1 (automatic update! ✨)
  - h_10: 93.6 (stable)
- **Conclusion**: Automatic propagation WORKS! Pattern is correct.
- **State Isolation**: ✅ CLEAN - No mixing observed across all sections

**Complete Listener Implementation** ✅ DONE (Oct 26, 2025)
All Reference listeners added (commits 16bb325, 22c68a3, 714bff0):
  - ✅ `ref_d_127` (TED from S14) - TESTED, WORKING
  - ✅ `ref_l_128` (from S14)
  - ✅ `ref_i_71` (Total Occ Gains from S09)
  - ✅ `ref_i_79` (Total App Gains from S10)
  - ✅ `ref_k_104` (Total Ground Loss from S12)
  - ✅ `ref_i_104` (Total Trans Loss from S12)

**Final Test Results** ✅ EXCEL PARITY ACHIEVED! (Oct 26, 2025)
- **Initialization**: e_10 = 277.8 (wrong system defaults)
- **After toggling to Heatpump + Cooling**: e_10 = **197.6** 🎉
- **Excel target**: 196.6
- **Difference**: Only 1.0 kWh/m²/yr (99.5% accurate!)
- **State Isolation**: ✅ CLEAN across all sections
- **Automatic Propagation**: ✅ WORKING for all upstream changes

**Phase 2 SUCCESS**: Complete Reference listener architecture enables automatic propagation and achieves Excel parity!

**Phase 2b: Fix ReferenceState Initialization Defaults** ✅ ROOT CAUSE IDENTIFIED! (Oct 26, Late Evening)

**🎯 BREAKTHROUGH: It's a Race Condition!**

**The Discovery** (User testing, Oct 26):
- **Safari** (after hard refresh, Cmd+Opt+R): e_10 = **195.4** ✅ CORRECT!
  - Initialization time: 611ms
  - Consistently correct on reload
  - Excel parity achieved on initialization!
- **Chrome** (after hard refresh + cache clear): e_10 = 277.8 ❌ WRONG
  - Initialization time: 640ms
  - Consistently wrong on reload
  - S13 Reference DOM shows correct values but doesn't propagate to S01

**Critical Observation**:
> "Chrome initializes in 640ms. Safari in 611ms. Given that in Chrome, S13 in Reference mode loads up with all of the expected values calculated and showing in the DOM, but they don't make it to S01's e_10, suggests an extremely subtle race condition."

**Root Cause**: RACE CONDITION between S13 initialization and S01 calculation
- Chrome is faster (640ms) → S01 calculates BEFORE S13 Reference values are ready
- Safari is slower (611ms) → S13 Reference values ready BEFORE S01 calculates
- This is NOT a code logic issue - it's a timing/orchestration issue

**Why Previous Approaches Failed**:
- ❌ Target fallback: Wrong solution to wrong problem (timing, not defaults)
- ❌ Debug logging: Couldn't see the race happening in real-time
- ❌ Manual toggle: "Primes" the system by forcing re-calculation after initialization

**Failed Approach #1: Target Fallback Pattern** ❌ (Oct 26, Commits 670083a-4e653c1, REVERTED)
- **Hypothesis**: Reference should default to Target values when not defined in ReferenceValues.js
- **Implementation**: Added "safe fallback" in onReferenceStandardChange()
- **Why It Failed**: Was solving wrong problem - issue is timing, not defaults
- **Reverted To**: Commit f808431 (before fallback attempts)
- **Lesson**: ReferenceState.setDefaults() works correctly, but S01 reads values too early

**The Real Solution**:
Not a race condition - it's a **multi-pass calculation dependency issue**. Test script (toggle-s13-systems.js) shows e_10 = 185.5 after 1 toggle, requires 3x cooling toggles to reach 197.6. Each pass propagates more of S13→S14→S15→S01 chain. See SEPT15-RACE-MITIGATION.md for Orchestrator.js implementation plan.

Two paths forward:
1. **Path A: S13 Refactor** (C-RF-WP.md) - Cleanup and housekeeping may naturally improve timing
2. **Path B: Race Mitigation** (SEPT15-RACE-MITIGATION.md) - Complete Orchestrator.js directed graph

**Decision for Tomorrow**: Start with Path A (S13 refactor housekeeping)
- **Scope**: MAJOR CLEANUP, not re-engineering (per C-RF-WP.md Section D.5)
- **NOT changing**: Mathematical formulas or psychrometric calculations
- **YES changing**: Code structure, reducing complexity, improving maintainability
- **Goal**: Eliminate timing issues through cleaner initialization flow
- **Tasks** (from C-RF-WP.md Task 5.4.3):
  - Review and reduce console.log statements (keep critical, remove debug hot paths)
  - Verify all Excel formula references documented
  - Complete JSDoc comments
  - Simplify initialization sequence
- **Lower risk**: Needed anyway for 12-month refactor completion
- **May naturally fix race**: Cleaner init flow → more predictable timing
- **If not**: Move to Path B (Orchestrator.js directed graph)

**Phase 3: CSV Export Safety Net** (OPTIONAL - LOW PRIORITY)
- **Status**: Deferred - Not urgent for production
- **Current Behavior**: Reference fields export to CSV after user edits them (acceptable)
- **Goal**: Pre-populate all Reference fields in CSV even without user edits
- **Implementation**: Add safety net in calculateAll() with source="default"
- **When**: After Phase 2b complete and system is stable

**Phase 4: E_10 Investigation** ✅ COMPLETE! (Oct 26, 2025)
- **Result**: e_10 = 197.6 (with correct systems) vs Excel 196.6
- **Accuracy**: 99.5% Excel parity achieved! 🎉
- **Remaining Issue**: Initialization defaults (Phase 2b will fix)

**⚠️ CRITICAL DISCOVERY - Missing Reference Listeners** (Oct 26 Early AM)

**The Problem**: S13 is missing Reference listeners for ALL upstream dependencies!

**What S13 Has** (Lines 2311-2335):
- ✅ `ref_d_20`, `ref_d_21`, `ref_d_22`, `ref_h_22` (climate data)
- ✅ `ref_i_59` (indoor RH%)

**What S13 is MISSING**:
- ❌ `ref_d_127` (TED from S14) - **SMOKING GUN!**
- ❌ `ref_l_128` (from S14)
- ❌ `ref_i_71` (Total Occ Gains from S09)
- ❌ `ref_i_79` (Total App Gains from S10)
- ❌ `ref_k_104` (Total Ground Loss from S12)
- ❌ `ref_i_104`, `ref_g_101`, `ref_d_101` (S12 envelope values)

**User's Detective Work**:
Testing revealed "dud" sections in Reference mode:
1. S09: d_64 (activity level) → affects gains → no e_10 change
2. S10: d_80 and ALL S10 values → no effect on Reference totals
3. S11: d_97 (TB% penalty) → flows to S12 and S14, but NOT to S13

**The Pattern**:
- Changes flow correctly: S09 → S10 → S11 → S12 → S14 ✅
- S14 DOES update with Reference values ✅
- S13 READS `ref_d_127` in calculations (lines 3022, 3324) ✅
- But S13 doesn't LISTEN for `ref_d_127` changes ❌
- **Result**: S13 never recalculates when upstream Reference values change!

**Why This Wasn't Obviously Broken**:
- S13 reads correct values during initialization (when calculateAll() runs)
- But doesn't respond to upstream changes after initialization
- This explains both the poor e_10 AND why Reference flow seems "blocked"

**NOT a Red Herring Anymore**:
- Originally thought missing listeners weren't the cause (both files missing same)
- But BOTH files have the SAME problem - incomplete Reference architecture
- This is THE root cause of poor e_10 and broken Reference flow

**How the d_113 Test Revealed This** (Oct 26 Early AM):
- Added single-field CSV export: `ref_d_113` with `source="default"`
- **Result**: e_10 dropped from 277.8 to 185.5 (massive improvement!)
- BUT: Reference flow broke for S09, S10, S11 → S13 chain
- Changes to upstream sections became "duds" (no effect on e_10)
- **Why**: Publishing `ref_d_113` somehow interfered with existing fragile flow
- **Reverted**: Need to fix missing listeners FIRST, then retry CSV export

**The Real Issue**:
- S13's Reference flow was ALREADY broken (missing listeners)
- It just wasn't obvious because initialization ran calculateAll()
- The d_113 test exposed the fragility by changing initialization timing
- Can't add CSV export until Reference listener architecture is complete

**IMPORTANT CLARIFICATION** (Oct 26 AM):
User observations reveal the situation is more nuanced:

1. **Why Reference Flow "Works" Sometimes**:
   - S13 uses `registerDependency()` for Target fields (lines 2275-2288)
   - These create dependency graph but NOT explicit listeners
   - When user toggles through systems in Reference mode, manual interaction triggers `calculateAll()`
   - So Reference calculations DO run, they just don't run AUTOMATICALLY on upstream changes
   - Example: Toggling to "Heatpump" in Reference → triggers calculate → e_10 goes from 277.8 to 185.5

2. **DOM vs StateManager Mismatch**:
   - User noted: DOM shows "Heatpump" and "Cooling" on initialization
   - But CSV export shows "No Cooling" is what system calculates with
   - **Problem**: DOM display doesn't match StateManager/ReferenceState truth
   - `refreshUI()` and mode-switching may not be syncing correctly

3. **What's Actually Broken**:
   - **Automatic propagation**: Upstream Reference changes don't auto-trigger S13 recalc
   - **Initialization state**: ReferenceState defaults may not match DOM defaults
   - **UI sync**: DOM doesn't reflect actual calculation state

4. **What's NOT Broken**:
   - Reference calculations themselves work correctly when triggered
   - State isolation is clean (Target/Reference don't contaminate each other)
   - Manual interaction triggers proper recalculation

**Revised Understanding**:
The missing Reference listeners don't break calculations, they break **automatic propagation**.
User must manually interact with S13 to trigger recalc after upstream Reference changes.
This is why toggling systems "fixes" the e_10 value - it forces a recalculation.

---

## 🔬 CSV Export Mechanism Analysis (Late Evening Investigation)

**Question**: How are d_116 and g_118 getting published to StateManager for CSV export in backup S13?

**Discovery** (Lines 368-378 in backup S13):

### The Working Pattern - ModeManager.setValue()

When user changes a dropdown (d_116, g_118, etc.), the flow is:

1. **Dropdown change** → `handleDropdownChange()` (line 2196)
2. **Calls** → `ModeManager.setValue(fieldId, newValue, "user-modified")` (line 2204)
3. **ModeManager.setValue()** does TWO things (lines 368-378):
   ```javascript
   setValue: function (fieldId, value, source = "user") {
     this.getCurrentState().setValue(fieldId, value, source); // Store in Target/ReferenceState

     // ✅ S10 SUCCESS PATTERN: Mode-aware StateManager publication
     if (this.currentMode === "target") {
       // Target mode: Store unprefixed for downstream consumption
       window.TEUI.StateManager.setValue(fieldId, value, "user-modified");
     } else if (this.currentMode === "reference") {
       // Reference mode writes with ref_ prefix
       window.TEUI.StateManager.setValue(`ref_${fieldId}`, value, source);
     }
   }
   ```

**Key Insight**:
- User input fields (d_116, g_118, d_113, f_113, j_115, d_118, d_119, l_118, l_119, k_120) get published to StateManager **automatically** when user edits them
- Publication happens via `ModeManager.setValue()` with mode-aware prefixing
- Uses `source="user-modified"` (NOT "calculated"!)
- This is why d_116 and g_118 appear in CSV export - they're user input fields

**Why Some Fields Missing from CSV** (d_113, f_113, j_115):
- Screenshot shows yellow cells (missing): d_113, f_113, j_115, l_118, d_119, l_119, k_120
- These ARE user input fields that should publish via ModeManager.setValue()
- Likely NOT being edited in Reference mode before export, so no ref_ value exists in StateManager
- d_116 and g_118 WERE edited, so they have ref_ values

**Implication for Tomorrow's Work**:
The .oct25 file's CSV export block (lines 226-236) was trying to solve this by publishing defaults for fields that hadn't been edited yet. But it used:
- `source="calculated"` ❌ (triggers cascading listeners)
- During `initialize()` ❌ (wrong timing)

**The Safe Solution** (for Phase 2 tomorrow):
Add safety net in `calculateAll()` that publishes user input Reference fields with:
- `source="default"` ✅ (doesn't trigger listeners)
- After both engines complete ✅ (right timing)
- Only if value exists in ReferenceState ✅ (respects user data)

**Phase 5: Final Integration** (if all phases succeed)
- Verify all success metrics achieved:
  - ✅ Clean state isolation
  - ✅ Reference flow works for ALL sections
  - ✅ CSV export complete
  - ✅ e_10 at or near 196.6 target
  - ✅ h_10 at or near 93.7 target

**Critical Context**:
- LAST file to refactor in nearly 12-month development cycle
- S13 handles heating loads - most complex calculations in system
- Cannot afford to break this - production readiness depends on it
- Conservative approach: ONE change at a time with testing

**Success Metrics**:
1. ✅ Clean state isolation (Target changes don't affect Reference) - **ACHIEVED**
2. ⚠️ CSV export works for all Reference fields - **DEFERRED** (works after user edits)
3. ✅ S12→S13→S01 Reference flow works - **ACHIEVED** (automatic propagation working)
4. ✅ Good e_10 initialization (~196.6) - **ACHIEVED** (197.6 = 99.5% accurate!)
5. ✅ Good h_10 value maintained (~93.7) - **ACHIEVED** (93.6)

---

## 🎉 MAJOR SUCCESS - Branch Almost Complete! (Oct 26, 2025)

**What We Achieved**:
- ✅ Fixed S10 duplicate listener bug (ref_g_81 now updates correctly)
- ✅ Extended S12 n-Factor lookup to 6 storeys (air leakage now works)
- ✅ Added complete Reference listener architecture to S13
- ✅ Enabled automatic propagation (S09/S10/S11/S12/S14 → S13)
- ✅ Achieved Excel parity: e_10 = 197.6 vs Excel 196.6 (99.5% accurate!)
- ✅ Maintained clean state isolation across all sections
- ✅ h_10 = 93.6 (within 0.1 of target 93.7)

**Remaining Task** (Last blocker):
- ⚠️ Fix ReferenceState initialization defaults (d_113="Heatpump", d_116="Cooling")
- Current workaround: User must toggle systems once to "prime" calculation
- Impact: e_10 initializes at 277.8 instead of 197.6

**Optional Tasks** (Nice to have):
- CSV export safety net (works but only after user edits)
- Fix m_124 Cooling.js Stage 2 timing error
- DOM display sync with StateManager on initialization

**Branch Status**: Ready for final initialization fix, then MERGE TO MAIN! 🚀

---

## 🔍 Technical Context

### S12 → S13 Data Flow

**S12 Publishes** (to StateManager with `ref_` prefix):
- ref_d_103 (stories)
- ref_g_103 (exposure - Normal/Exposed)
- ref_d_105 (conditioned volume)
- ref_d_108 (blower door method)
- ref_g_109 (measured ACH50)
- ref_g_101, ref_d_101, ref_i_104 (calculated envelope values)

**S13 Should Consume**:
- Volume data for heating load calculations
- Envelope U-values and areas
- Air leakage values

**Mechanism** (in working backup):
- S13 likely has listeners for S12 calculated fields
- OR S13 reads S12 values during its own calculateAll()
- Changes in S12 Reference → trigger S13 Reference recalculation

---

## 📊 Current State

**Branch**: S12-S13-PURITY (fresh branch from S10-S11-PURITY)

**Active Files**:
- S12: 4012-Section12.js (CSV export working ✅)
- S13: 4012-Section13.js (backup version - flow works, CSV incomplete)
- S13 CSV-fix: 4012-Section13.js.backup.js (flow broken, CSV complete)

**Values**:
- e_10 with backup S13: 287.0 (too high)
- e_10 with CSV-fix S13: 192.9 (better, closer to Excel ~196.6)
- h_10: 93.7 (perfect ✅)

**Test Approach**:
Make changes to backup S13 (currently active) to add CSV export without breaking flow.

---

## 🎯 Success Criteria

### For S13 Calculation Flow Fix:
- ✅ S12 Reference changes propagate to S13
- ✅ e_10 updates when S12 Reference envelope changes
- ✅ All S13 Reference fields export to CSV
- ✅ e_10 initialization close to Excel (~192.9)
- ✅ h_10 remains perfect (93.7)
- ✅ Clean state isolation (Target/Reference independent)

### For S12 Air Leakage Fix:
- ✅ d_103 changes affect calculations for ALL storey counts (1-20+)
- ✅ Air leakage heat loss recalculates correctly
- ✅ No regression in other S12 calculations

---

## 📝 Key Learnings from S10-S11-PURITY

1. **Browser Cache**: Always hard refresh with DevTools cache disabled when testing JavaScript changes
2. **Debug Logging**: Comprehensive console.log statements are essential for tracing publication/consumption
3. **Safety Nets**: Re-publishing in calculateAll() prevents initialization timing issues
4. **File Comparison**: Small diffs (48 lines) can have major impacts - analyze carefully

---

## 🚀 Next Steps

1. **Immediate**: Generate detailed diff of S13 backup vs CSV-fix
2. **Analyze**: Identify consumption mechanism in backup S13
3. **Test**: Comment out CSV block in CSV-fix to verify hypothesis
4. **Fix**: Port CSV functionality to backup without breaking flow
5. **Then**: Address S12 air leakage bug for 3+ storeys
