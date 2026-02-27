# Mirror Target Feature - Field Analysis & Implementation Plan

**Date**: 2025-11-27
**Status**: Analysis & Planning Phase
**Goal**: Determine which fields should copy from Target to Reference model to save users time

---

## Executive Summary

The "Mirror Target" feature will copy **geometric and building configuration inputs** from the Target model to the Reference model, eliminating duplicate data entry. This allows users to:

1. **Mirror Target**: Start with identical building geometry, then customize specific performance parameters
2. **Mirror Target + Reference**: Copy geometry + apply building code standards from ReferenceValues.js
3. **Independent Models**: Complete freedom (already exists, no change needed)

---

## Current Implementation Status

### ✅ What Exists (As of 2025-11-27)

1. **ReferenceToggle.js** ([src/core/ReferenceToggle.js](../../../src/core/ReferenceToggle.js)):
   - `mirrorTarget()` function implemented (~70 lines)
   - `mirrorTargetWithReference()` function implemented (~60 lines)
   - Uses proper ModeManager facade pattern
   - Copies ALL fields from each section's Target state to Reference state

2. **Button UI** ([index.html](../../../index.html#L198-L220)):
   - Three buttons in Reference dropdown (currently commented out)
   - "Mirror Target" (line 200)
   - "Mirror Target + Reference" (line 208)
   - "Reference Independence" (line 216)

3. **Architecture Support**:
   - Dual-state sections (S02-S15) all have ModeManager
   - `section.modeManager.getValue(fieldId)` - reads Target/Reference values
   - `section.modeManager.setValue(fieldId, value, "mirrored")` - writes to Reference state
   - Field discovery via `getFieldIdsForSection(sectionId)` helper

### 🚨 Current Limitation

The existing `mirrorTarget()` copies **ALL** fields from Target to Reference. This includes:
- ✅ Geometric inputs (h_15 conditioned area, window areas, etc.) - **SHOULD copy**
- ❌ Performance values (f_85 wall RSI, equipment efficiencies, etc.) - **SHOULD NOT copy** (these should come from ReferenceValues.js or user customization)

---

## Field Categories for Mirror Target

### Category 1: ALWAYS COPY (Geometric/Configuration)
**Rationale**: Building size, location, and basic configuration are typically identical between Target and Reference models
**Maps to**: "Geometry" and "Geometry + Code" buttons

#### S01 - Key Values
- `h_12` - Reporting year
- `d_19` - Province/Territory
- `j_19` - City/Location
- `h_15` - Conditioned Area (m²)
- `h_16` - Conditioned Volume (m³)
- ❌ **EXCLUDE**: `d_13` - Building Standard (user sets independently)

#### S02 - Building Information
- All fields (building name, address, project info)

#### S03 - Climate Calculations
- `d_19` - Province (drives climate data)
- `j_19` - City (drives climate data)
- All climate calculation outputs (HDD, CDD, etc.) - these are calculated based on location

#### S04/S05 - Energy Costs & Emissions
- ✅ **INCLUDE**: Electricity rates, gas rates, carbon intensity
- **Rationale**: Users seldom change these, same location = same rates

#### S09 - Occupant + Internal Gains
- ✅ **INCLUDE**: `j_71` - Number of occupants
- ✅ **INCLUDE**: `k_71` - Occupancy hours
- ✅ **INCLUDE**: Appliance/equipment counts (represent same building usage)

#### S10 - Radiant Gains (Window/Door Areas)
- `d_80` - Total window area (m²)
- `f_80` - Total door area (m²)
- All window orientations (N/S/E/W areas)
- All door orientations (N/S/E/W areas)

#### S11 - Transmission Losses (Opaque Surface Areas)
- `d_88` - Total wall area (m²)
- `f_88` - Total roof area (m²)
- `h_88` - Total slab area (m²)
- `j_88` - Total basement wall area (m²)
- All orientation-specific areas

#### S12 - Volume and Surface Metrics
- All geometric calculations (derived from h_15, h_16, and S10/S11 areas)

### Category 2: NEVER COPY in "Geometry" (Performance Parameters)
**Rationale**: These should come from ReferenceValues.js (building code minimums) or user customization
**Maps to**: "Geometry" button excludes these, "All Inputs" button includes these

#### S10 - Radiant Gains (Performance)
- `f_85` - Window U-value / RSI
- `h_85` - Door U-value / RSI
- `j_85` - SHGC (Solar Heat Gain Coefficient)
- Utilization factors

#### S11 - Transmission Losses (Performance)
- `f_94` - Wall RSI value
- `h_94` - Roof RSI value
- `j_94` - Slab RSI value
- `l_94` - Basement wall RSI value
- All thermal performance values

#### S13 - Mechanical Loads
- `d_113` - Primary heating system type
- `d_114` - Heating system efficiency
- `d_115` - Ventilation system type
- `d_116` - Ventilation efficiency/HRV effectiveness
- All equipment performance parameters

#### S08 - Indoor Air Quality
- Ventilation rates
- Air change rates
- Filter efficiencies

### Category 3: USER DECISIONS (Resolved 2025-11-27)

#### Energy Costs (S04/S05)
- Electricity rates
- Gas rates
- Carbon intensity factors
- **DECISION**: ✅ **COPY** - Users seldom change these, defaults already match, same location = same rates

#### Occupancy (S09)
- `j_71` - Number of occupants
- `k_71` - Occupancy hours
- **DECISION**: ✅ **COPY** - Seldom different between Target & Reference models

#### Building Standard Selector (S01/S02)
- `d_13` - Building Standard (e.g., "OBC SB12 3.1.1.2.C1")
- **DECISION**: ❌ **DO NOT COPY** - Let user set this themselves
- **Rationale**: If user presses "Set Values" button, it will apply ReferenceValues.js code minimums based on Reference model's d_13, allowing independent standard selection per model

---

## Comparison: Mirror Target vs FileHandler Import

### FileHandler Pattern (Quarantine Approach)
The FileHandler uses a "quarantine" pattern for importing values:
1. Load external file data into temporary storage
2. Present to user for review
3. User explicitly applies changes
4. Values get `"imported"` state in StateManager

**Location**: [src/core/FileHandler.js](../../../src/core/FileHandler.js)

### S18 Pattern (Direct Application)
ParallelCoordinates (S18) directly sets values without quarantine:
```javascript
window.TEUI.StateManager.setValue(
  fieldIdWithPrefix,
  valueToStore,
  "user-modified"
);
```
**Location**: [src/core/ParallelCoordinates.js:2871-2875](../../../src/core/ParallelCoordinates.js#L2871-L2875)

### ReferenceToggle Current Pattern
Currently uses ModeManager facade (similar to S18):
```javascript
section.modeManager.setValue(fieldId, value, "mirrored");
```
**Location**: [src/core/ReferenceToggle.js:547](../../../src/core/ReferenceToggle.js#L547)

---

## Final Implementation Approach (2025-11-27)

### 1. **Three Button Functions**

#### Button 1: "Geometry"
- Copies Category 1 fields only (geometric/configuration)
- **Excludes** Category 2 (performance parameters)
- **Excludes** `d_13` (building standard)
- Use case: "Same building shape, different performance specs"

#### Button 2: "Geometry + Code"
- Copies Category 1 fields (geometric/configuration)
- Then overlays ReferenceValues.js based on Reference model's `d_13`
- **Excludes** Category 2 from copying
- Use case: "Compare my design vs building code minimums" (most common)

#### Button 3: "All Inputs"
- Copies everything (Category 1 + 2)
- Perfect clone of Target → Reference
- Use case: "Start identical, then tweak one specific parameter"

### 2. **Use S18 Direct Application Pattern**
**Rationale**:
- Mirror functions are deliberate user actions (they clicked the button)
- No need for quarantine/review - user can always undo or edit afterward
- Simpler implementation, consistent with S18 scenario application
- Values get `"mirrored"` state in StateManager for tracking

### 3. **Create Field Classification Helper**
Add new helper function with exclusion lists:
```javascript
function getFieldCategoryForMirroring(sectionId) {
  // Define excluded fields by pattern and explicit list
  const excludePatterns = {
    performance: ['_85', '_94'], // Performance suffixes
    explicitExclude: ['d_13'], // Building standard
  };

  // Define sections with special handling
  const sectionRules = {
    'sect01': { exclude: ['d_13'] }, // Key Values: exclude building standard
    'sect02': { copyAll: true }, // Building Info: copy everything
    'sect10': { exclude: ['f_85', 'h_85', 'j_85'] }, // Radiant: exclude performance
    'sect11': { exclude: ['f_94', 'h_94', 'j_94', 'l_94'] }, // Transmission: exclude RSI
    'sect13': { exclude: 'all' }, // Mechanical: exclude all (equipment specs)
  };

  return sectionRules[sectionId] || { copyAll: true };
}
```

### 4. **Exclude Performance Fields in "Geometry" Mode**
Fields to explicitly NEVER copy in "Geometry" button:
- Any field ending in `_85` (window/door performance: RSI, U-value, SHGC)
- Any field ending in `_94` (wall/roof RSI values)
- All fields in S13 (equipment types and efficiencies)
- Field `d_13` (building standard selector)

---

## Implementation Steps

### Phase 1: Field Classification (1-2 hours)
1. Review all sections (S01-S15) to identify geometric vs performance fields
2. Create `getGeometricFields()` mapping
3. Add documentation explaining classification logic

### Phase 2: Update mirrorTarget() (1 hour)
1. Add field filtering logic to `mirrorTarget()` function
2. Only copy fields from Category 1 (geometric/configuration)
3. Log which fields were copied vs skipped for debugging

### Phase 3: Testing (1 hour)
1. Test Mirror Target with sample data
2. Verify geometric fields copied correctly
3. Verify performance fields NOT copied (remain at ReferenceValues defaults)
4. Test Mirror Target + Reference overlay behavior

### Phase 4: Documentation & Uncommenting (30 min)
1. Update [Master-Reference-Roadmap.md](./history (completed)/Master-Reference-Roadmap.md) with final field list
2. Uncomment Mirror Target buttons in [index.html](../../../index.html#L198-L220)
3. Add user-facing help text explaining what Mirror Target copies

---

## User Decisions (Resolved 2025-11-27)

1. **Energy Costs**: ✅ **YES** - Copy utility rates (users seldom change these anyway)
2. **Occupancy**: ✅ **YES** - Copy occupancy (seldom different between models)
3. **Building Standard (d_13)**: ❌ **NO** - Let user set independently per model
4. **Menu Structure**: Three buttons only - "Geometry", "Geometry + Code", "All Inputs"
   - Remove "Independent Models" / "Clear Reference" (destructive, unnecessary)
   - Independent editing is the default state - users can edit any field anytime

---

## Success Criteria

After implementation:
1. ✅ User clicks "Mirror Target" → Geometric fields copy from Target to Reference
2. ✅ Performance fields remain at Reference defaults (or ReferenceValues.js minimums)
3. ✅ User can then edit specific Reference fields to create custom comparison
4. ✅ "Mirror Target + Reference" overlays building code minimums on top of copied geometry
5. ✅ Clear logging shows which fields were copied vs skipped
6. ✅ User experience is smooth and saves time vs manual data entry

---

## Related Documentation

- [Master-Reference-Roadmap.md](./history (completed)/Master-Reference-Roadmap.md) - Overall Reference toggle architecture
- [DUAL-STATE-CHEATSHEET.md](./DUAL-STATE-CHEATSHEET.md) - Pattern A dual-state implementation
- [ReferenceToggle.js](../../../src/core/ReferenceToggle.js) - Current implementation
- [index.html](../../../index.html#L198-L220) - Mirror Target button UI
