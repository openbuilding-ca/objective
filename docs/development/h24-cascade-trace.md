# h_24 Cascade Trace - State Mixing Investigation

## The Question
**Why does editing l_24 in Target mode cause BOTH h_10 and e_10 to change?**
- Expected: Only h_10 (Target total) should change
- Bug: e_10 (Reference total) also changes (182.2 → 198)

## h_24 Value Change Cascade (Target Mode)

### Step 1: User Edit
```
User edits l_24 in S03 (Target mode)
↓
S03 ModeManager.setValue("l_24", newValue)
↓
S03 calculateTargetModel()
  ↓ calculateCoolingSetpoint_h24()
    ↓ h_24 = IF(l_24 > 24, l_24, 24)
    ↓ setFieldValue("h_24", h_24)
      ↓ StateManager.setValue("h_24", value)  [UNPREFIXED - Target value]
```

### Step 2: h_24 Listener Cascade
```
StateManager.setValue("h_24") triggers listeners:
  ↓
  Cooling.js listener fires
    ↓ calculateStage1("target")
      ↓ Publishes cooling_h_124, latentLoadFactor, etc.
```

### Step 3: Pattern A Dual-Engine Execution
**THIS IS WHERE THE PROBLEM LIKELY OCCURS**

Both engines run (correct per Pattern A):
```
calculateAll() runs in multiple sections:
  ↓
  S13.calculateAll()
    ├─ calculateTargetModel() → Uses Target values ✅
    └─ calculateReferenceModel() → Should use Reference values ❌
       ↓
       Calls: Cooling.calculateAll("reference")
       ↓
       Question: Does this contaminate Reference with Target data?
```

### Step 4: Cascade to S01
```
S13 publishes values → S14 → S15 → S04 → S01
                                         ↓
                                    updateTEUIDisplay()
                                         ↓
                                    Calculates e_10 from upstream totals
                                         ↓
                                    ❌ BUG: e_10 = 198 (changed from 182.2)
```

## Debug Log Evidence

From improved debug script (3,030 lines):

```
BEFORE edit:
  e_10 = 182.2 (Reference total - from debug logs)
  h_10 = 93.72 (Target total)

USER EDITS l_24 in Target mode

AFTER edit (from debug logs):
  e_10 = 198 ← CHANGED! (Reference contaminated)
  h_10 = 90.91 ← Changed (expected)

Call stack for e_10 write:
  at updateTEUIDisplay (Section01.js:876)
```

**⚠️ ACTUAL BUG BEHAVIOR (Oct 31, 12:05am)**:
- Debug logs incomplete/misleading (show large jumps 182.2 → 198)
- **ACTUAL UI behavior**: e_10 increases by ~0.1 when h_24 increases
- Excel parity: e_10 should be ~196.6 (relatively stable)
- **This is ILLOGICAL**: Higher h_24 (cooling setpoint) should REDUCE cooling load, not increase it
- **Even tiny changes are WRONG**: Reference (e_10) must NEVER change from Target edits

**THE BUG**:
1. When user increases h_24 in Target mode (e.g., 24°C → 26°C)
2. e_10 (Reference total) increases by small amounts (~0.1 kWh/m²/yr)
3. This is backwards logic: tolerating higher temperature = LESS cooling needed
4. Small increments suggest calculation glitch/contamination, not major corruption
5. **Zero tolerance**: ANY change to e_10 from Target edits is a bug

## Key Observations

1. ✅ ref_cooling_h_124 stayed constant at 48381.43968
   - Our h_24 fix IS working for Cooling.js

2. ❌ e_10 changes by ~0.1 each time h_24 increases (SHOULD NOT CHANGE AT ALL)
   - Small but persistent contamination
   - Backwards logic: higher setpoint = more cooling (should be less!)
   - Contamination happening in S13 → S14 → S15 → S04 → S01 cascade
   - Debug logs misleading/incomplete (show large jumps vs actual tiny increments)

3. 🔍 **FOCUS**: Find where Reference calculations read unprefixed Target values
   - Small increments suggest subtle read contamination, not major logic error
   - Similar to h_24 bug we found in Cooling.js, but elsewhere in cascade
   - Check S13, S14, S15 for non-mode-aware StateManager.getValue() calls

## Hypothesis: Contamination Source

The contamination is likely in **one of these sections**:
- **S13**: Calculates energy values, passes to S14/S15
- **S14**: TEDI calculations
- **S15**: Energy summary
- **S04**: Energy/emissions totals
- **S01**: Display (reads from upstream)

**Most likely**: S13, S14, or S15 have a non-mode-aware read similar to what we found in Cooling.js

## Next Investigation Steps

1. Search for ALL `StateManager.getValue()` calls in S13, S14, S15, S04
2. Check if any read unprefixed values when they should read ref_ prefixed
3. Focus on cooling-related fields: m_129, d_129, cooling_m_124, h_124
4. Check if Reference calculations in these sections use mode-aware reads

## Files to Check Tomorrow
- src/sections/Section13.js - Energy calculations
- src/sections/Section14.js - TEDI
- src/sections/Section15.js - Summary
- src/sections/Section04.js - Totals
