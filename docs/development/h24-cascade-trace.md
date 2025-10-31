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
  e_10 = 182.2 (Reference total)
  h_10 = 93.72 (Target total)

USER EDITS l_24 in Target mode

AFTER edit:
  e_10 = 198 ← CHANGED! (Reference contaminated)
  h_10 = 90.91 ← Changed (expected)
  
Call stack for e_10 write:
  at updateTEUIDisplay (Section01.js:876)
```

## Key Observations

1. ✅ ref_cooling_h_124 stayed constant at 48381.43968
   - Our h_24 fix IS working for Cooling.js
   
2. ❌ But e_10 still changed
   - Contamination is happening DOWNSTREAM of Cooling.js
   - In the S13 → S14 → S15 → S04 → S01 cascade

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
