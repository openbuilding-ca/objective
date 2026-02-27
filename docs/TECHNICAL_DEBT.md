# Technical Debt Notes

## Computation Node Validation Mismatches (Dec 2024)

Based on validation testing comparing new computation nodes to legacy StateManager values.

### Validated and Fixed ✅

1. **Thermal Bridge Penalty (d_97)**
   - Fixed legacyId from d_96 to d_97
   - Added interior floor area input (d_96)
   - Added thermal bridge factor `(1 + d_97/100)` to weighted U-values (g_101, g_102)

2. **Ventilation Heat Loss Coefficient**
   - Fixed formula to use `(1.21 × ventRate × HDD × 24) / 1000`
   - 1.21 is volumetric heat capacity of air (kJ/m³·K)

3. **Ventilation Schedule Factor**
   - Added schedule factor `(occupiedHours / totalHours)` for "Volume by Schedule" and "Occupant by Schedule" methods

### Remaining Mismatches - TODO

1. **Air Leakage Heat Loss (i_103)** - 52% difference
   - Legacy uses NRL50 (Normalized Leakage Rate): `(1.21 × NRL50 × area / N_factor × HDD × 24) / 1000`
   - New uses ACH-based: `(ACH_natural × volume × 0.34 × HDD × 24) / 1000`
   - Need to add NRL50 input (g_108) and use legacy formula

2. **Ventilation Rate (d_120)** - 76% difference
   - Method is synced as "Occupant Constant" but legacy calculates as "Volume by Schedule"
   - May be a legacy bug where dropdown doesn't control calculation
   - Need to investigate Section13.js ventilation calculation

3. **Radiant Gains Utilization Factor (g_80)** - 75% difference
   - Legacy: 0.228 (dynamic calculation)
   - New: 0.4 (static "NRC 40%" default)
   - Need to implement dynamic utilization factor calculation

4. **Ground-Facing CDD (h_22)** - Intentional difference
   - Legacy: -1680 (negative CDD)
   - New: 0 (negative CDD clamped to 0)
   - Physically, negative CDD doesn't make sense - new behavior is correct

5. **Mechanical COP Values (h_113, j_113)** - ~26-36% difference
   - Need to verify HSPF-to-COP conversion formula
   - Check if heating system type detection is correct

6. **Various percentage fields** - Cascade from above errors
   - Heat loss percentages (j_85, j_86, etc.) differ by ~5%
   - Heat gain percentages have larger errors due to ground-facing issues

### Files to Update
- `VolumeMetricsNodes.js` - Air leakage formula
- `VentilationNodes.js` - Method detection / formula selection
- `RadiantGainsNodes.js` - Dynamic utilization factor
- `MechanicalNodes.js` - COP calculation verification

---

## Remove 666 magic number kludge (undefined/null indicator)

The codebase uses `666` as a magic number to represent undefined/null values, particularly for climate data. This should be cleaned up to use proper `null` values instead.

### Files affected:
- `src/core/ClimateValues.js` - source data uses 666 for unavailable values
- `src/sections/nodes/ClimateNodes.js` - checks for 666
- `src/sections/Section03.js` - likely checks for 666
- `src/sections/Section20.js` - checks for 666
- `src/core/ui/ModelSelector.js` - checks for 666
- `src/core/ui/ComparisonView.js` - checks for 666
- `src/core/wombatRender.js` - checks for 666
- `src/core/pcRendering.js` - checks for 666
- `src/core/ParallelCoordinates.js` - checks for 666
- `src/core/QCMonitor.js` - checks for 666
- `src/core/Dependency.js` - checks for 666
- `src/obc/sections/OBC-Section01.js` - checks for 666

### Action required:
1. Replace all `666` values with `null` in ClimateValues.js
2. Update all consumers to only check for `null` (remove `=== 666` checks)
3. Ensure "Unavailable" is displayed appropriately in UI when values are null

---

## Remove parseNum silent default substitution [FIXED]

The `parseNum(value, default)` pattern was silently substituting made-up values when data was unavailable. This hid data availability issues and caused incorrect calculations.

### Problem examples (now fixed):
```javascript
// These made-up defaults have been removed:
// parseNum(inputs["climate.heating.degreedays"], 4000)
// parseNum(inputs["climate.heating.degreedays"], 4600)
// parseNum(inputs["climate.cooling.degreedays"], 300)
// parseNum(inputs["climate.cooling.degreedays"], 196)
```

### Files fixed:
- `src/sections/nodes/VolumeMetricsNodes.js` - FIXED
- `src/sections/nodes/EnvelopeNodes.js` - FIXED
- `src/sections/nodes/ClimateNodes.js` - FIXED
- `src/sections/nodes/TransmissionLossNodes.js` - FIXED
- `src/sections/nodes/RadiantGainsNodes.js` - FIXED
- `src/sections/nodes/VentilationNodes.js` - FIXED
- `src/sections/nodes/MechanicalNodes.js` - FIXED
- `src/sections/nodes/EmissionsNodes.js` - N/A (no direct climate parseNum calls)
- `src/sections/nodes/EnergyNodes.js` - N/A (no direct climate parseNum calls)

### Pattern applied:
1. Added `isUnavailable(value)` helper to each file
2. Updated `parseNum()` to propagate "Unavailable" string
3. Climate-dependent compute functions now check: `if (isUnavailable(hdd)) return "Unavailable";`
4. Made-up default values removed from climate data access
