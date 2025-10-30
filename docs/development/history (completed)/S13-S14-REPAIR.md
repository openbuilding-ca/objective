# S13-S14 Cross-Section Dependency Analysis

## Overview

This document analyzes the complex relationship between Section 13 (Mechanical Loads) and Section 14 (TEDI & TELI) regarding the `m_129` calculation and cross-section dependencies.

## Current Issue

- S13 calculates `m_129` but the field appears in S14's UI
- Missing `ref_m_129` listeners causing Reference mode issues
- Potential circular dependencies between S13 and S14
- App crash when attempting to move `m_129` calculation to S14

## Excel Formula Analysis

### m_129: CED Mitigated (kWh/yr)

**Excel Location**: Row 129, Column M (appears in S14 section)
**Formula**: `M129 = MAX(0, D129 - H124 - D123)`

**Components**:

- `D129`: CED Cooling Load Unmitigated (calculated by S14)
- `H124`: Free Cooling Limit (calculated by S13)
- `D123`: Outgoing Cooling Season Ventil. Energy (calculated by S13)

### d_117: Heatpump Cool Elect. Load

**Excel Location**: Row 117, Column D (S13 section)
**Formula**: `D117 = IF(D116="No Cooling", 0, IF(D113="Heatpump", M129/J113, IF(D116="Cooling", M129/J116)))`

**Dependencies**:

- `D116`: Cooling system type (S13)
- `D113`: Heating system type (S13)
- `M129`: CED Mitigated (currently calculated by S13, displayed in S14)
- `J113`: COPcool Heatpump (S13)
- `J116`: COPcool Dedicated (S13)

## Current Implementation Analysis

### S13 Current Behavior

```javascript
// S13 calculateMitigatedCED()
const d129 = window.TEUI.parseNumeric(getFieldValue("d_129")) || 0; // FROM S14
const h124 = window.TEUI.parseNumeric(getFieldValue("h_124")) || 0; // FROM S13
const d123 = window.TEUI.parseNumeric(getFieldValue("d_123")) || 0; // FROM S13
let m129_calculated = d129 - h124 - d123;
const m129 = Math.max(0, m129_calculated);
setFieldValue("m_129", m129, "number-2dp-comma"); // SETS S14's field
```

### S14 Current Behavior

```javascript
// S14 also calculates m_129 in calculateValues()
const cedMitigated_m129 = cedCoolingUnmitigated_d129 - h124 - d123;
setCalculatedValue("m_129", cedMitigated_m129);
```

**PROBLEM**: Both sections calculate the same field!

## Dependency Flow Analysis

### Current Dependency Chain

```
S14 calculates d_129 → S13 reads d_129 → S13 calculates m_129 → S13 uses m_129 for d_117
                                     ↘ S13 sets m_129 in S14's field
```

### Missing Reference Support

- S13 does NOT publish `ref_m_129` to StateManager
- S14 DOES calculate and publish `ref_m_129` in Reference model
- S13 needs `ref_m_129` for Reference mode d_117 calculation

## Architectural Options

### Option A: S13 Owns m_129 Calculation

**Pros**:

- S13 immediately has access for d_117 calculation
- No circular dependency issues
- Current implementation already works (mostly)
- Prevents timing issues between sections

**Cons**:

- S13 setting S14's field violates section ownership
- Confusing that field appears in S14 but calculated in S13
- Dual calculation with S14 creates conflicts

### Option B: S14 Owns m_129 Calculation

**Pros**:

- Clean field ownership (S14 owns its fields)
- Follows Excel layout (m_129 in S14 section)
- S14 already has proper Reference model support
- Eliminates dual calculation

**Cons**:

- Creates circular dependency (S14 → S13 → back to S14)
- Timing issues: S13 needs m_129 before S14 finishes
- More complex listener setup required
- Caused app crash in previous attempt

### Option C: Hybrid Approach

**Pros**:

- S13 calculates m_129 for immediate use
- S13 publishes m_129 to S14 for display only
- S14 doesn't calculate, just displays S13's result
- Clean separation of concerns

**Cons**:

- Still violates pure field ownership
- Need to ensure S14 doesn't override S13's calculation

## Missing Reference Support Analysis

### Current Gap

S13 listeners:

```javascript
sm.addListener("d_129", calculateMitigatedCED); // ✅ Has Target
sm.addListener("h_124", calculateMitigatedCED); // ✅ Has Target
sm.addListener("d_123", calculateMitigatedCED); // ✅ Has Target
// ❌ MISSING: ref_d_129, ref_h_124, ref_d_123 listeners
```

### Minimal Fix Needed

Add Reference listeners to S13:

```javascript
sm.addListener("ref_d_129", calculateMitigatedCED);
sm.addListener("ref_h_124", calculateMitigatedCED);
sm.addListener("ref_d_123", calculateMitigatedCED);
```

## Why S13 May Have Been Designed to Own m_129

### Timing Considerations

1. **Immediate Availability**: S13 calculates h_124 and d_123, so it has immediate access
2. **d_117 Dependency**: S13 needs m_129 for cooling load calculation in same cycle
3. **Circular Prevention**: Avoiding S14 → S13 → S14 calculation loops
4. **Performance**: Single calculation cycle vs multiple round-trips

### Excel vs App Architecture

- **Excel**: All formulas calculate simultaneously in dependency order
- **App**: Sequential section calculations with async StateManager updates
- **Challenge**: Mimicking Excel's simultaneous calculation in sequential app

## Recommended Approach

### Phase 1: Minimal Fix (Safe)

1. Add missing Reference listeners to S13 for `ref_d_129`, `ref_h_124`, `ref_d_123`
2. Ensure S13 publishes `ref_m_129` to StateManager
3. Test that Reference mode works properly
4. Document that S13 owns m_129 calculation, S14 displays it

### Phase 2: Clean Architecture (Future)

1. Investigate why app crashed with S14 ownership
2. Consider timing/ordering solutions
3. Implement proper calculation sequencing
4. Move m_129 to S14 with proper dependency management

## Current State Assessment

- **Target Mode**: Works (S13 calculates m_129, uses for d_117)
- **Reference Mode**: Broken (missing ref_m_129 listeners)
- **Architecture**: Functional but not ideal (cross-section field setting)

## Next Steps

1. Implement minimal fix for Reference mode support
2. Test thoroughly before any major changes
3. Document current behavior as "working but architectural debt"
4. Plan future refactoring with proper timing solutions
