# Capacitance Import Debug Investigation

**Date**: 2025-12-19
**Status**: 🔴 ACTIVE INVESTIGATION
**Impact**: CRITICAL - Causes sign flip in k_104 and breaks cooling calculations

## Problem Statement

During Excel import, the Capacitance dropdown (h_21/i_21) is not being set properly, which causes:

1. **Immediate Issue**: k_104 (Total Envelope Heat Gain) shows incorrect sign
   - **Excel**: 14,152.68 kWh/yr (positive)
   - **App**: -12,676.99 kWh/yr (negative)
   - **Magnitude**: ~26,830 kWh/yr difference

2. **Cascade Effect**: Incorrect k_104 flows into d_129 calculation
   - d_129 = k_71 + k_79 + k_97 + k_104 + k_103 + d_122
   - d_129 affects m_129 (Heatpump Cool Elect. Load)
   - m_129 = MAX(0, d_129 - h_124 - d_123)

## Root Cause Hypothesis

The Capacitance dropdown is not being properly set during the **mute/quarantine process** in FileHandler:

1. FileHandler imports Excel values
2. Fields are muted during batch import
3. Capacitance dropdown value (h_21/i_21) is written to StateManager
4. **BUT**: Dropdown UI element is not updated during mute
5. When unmuted, calculateAll() runs with **wrong Capacitance value**
6. All downstream calculations use incorrect thermal capacitance

## File Locations

### Capacitance Field Definitions

**Field IDs**:
- `h_21`: Target mode Capacitance/Static toggle
- `i_21`: Target mode Capacitance slider position (0-100)
- `ref_h_21`: Reference mode Capacitance/Static toggle
- `ref_i_21`: Reference mode Capacitance slider position

**Section**: Section 03 (Climate Calculations)

**File**: `src/sections/Section03.js`

### Import Mapping

**File**: `src/core/ExcelMapper.js`

```javascript
// Line 62-63
H21: "h_21", // Capacitance/Static Toggle (Dropdown)
I21: "i_21", // Capacitance Slider Position (Number)
```

### Import Handler

**File**: `src/core/FileHandler.js`

Relevant functions:
- `importFromExcel()` - Main import orchestrator
- Mute/quarantine logic during batch import
- Dropdown update logic after unmute

## Expected Import Flow

### Excel Storage Format
- **Cell H21**: Dropdown value (e.g., "Capacitance", "Static")
- **Cell I21**: Slider position (0-100, numeric)

### Import Process (Expected)

1. **ExcelMapper reads**:
   - H21 → "Capacitance" (string)
   - I21 → 50 (number)

2. **FileHandler processes**:
   - Writes h_21 = "Capacitance" to StateManager
   - Writes i_21 = "50" to StateManager
   - **CRITICAL**: Updates dropdown UI element to "Capacitance"

3. **Unmute & Calculate**:
   - calculateAll() runs
   - Section 03 reads h_21 = "Capacitance"
   - Thermal calculations use correct capacitance mode

### Actual Behavior (Bug)

1. **ExcelMapper reads**: ✅ Values read correctly from Excel
2. **FileHandler processes**: ❓ StateManager updated, but dropdown UI not synced?
3. **Unmute & Calculate**: ❌ Dropdown shows wrong value, calculations break

## Thermal Capacitance Impact

### What is Capacitance?

Thermal capacitance represents building mass's ability to store/release heat:
- **Capacitance mode**: Building has thermal mass (concrete, masonry) - stores heat
- **Static mode**: Building has low mass (wood frame) - minimal heat storage

### Impact on k_104 (Envelope Heat Gain)

When Capacitance is wrong:
- Heat gain calculations use incorrect thermal lag
- Can flip sign of heat gain (positive ↔ negative)
- Affects all cooling season calculations

### Cascade to Cooling Calculations

```
k_104 (wrong)
  ↓
d_129 = k_71 + k_79 + k_97 + k_104 + k_103 + d_122 (wrong)
  ↓
m_129 = MAX(0, d_129 - h_124 - d_123) (wrong)
  ↓
Heatpump Cool Elect. Load (wrong)
  ↓
Total TEUI (wrong)
```

## Investigation Checklist

### Phase 1: Confirm the Bug

- [ ] Import test Excel file with known Capacitance value
- [ ] Check StateManager.getValue("h_21") after import
- [ ] Check dropdown DOM element value after import
- [ ] Compare StateManager vs DOM values

### Phase 2: Locate the Failure Point

- [ ] Add console logging to ExcelMapper h_21/i_21 import
- [ ] Add console logging to FileHandler dropdown update logic
- [ ] Identify where dropdown UI sync fails during mute

### Phase 3: Review Mute/Quarantine Logic

- [ ] Check if dropdowns are excluded from mute
- [ ] Verify dropdown update occurs before unmute
- [ ] Ensure Section03 refreshUI() is called after import

### Phase 4: Compare with Working Imports

- [ ] Check how other dropdowns (d_12, d_13) are handled
- [ ] Identify differences in h_21 handling
- [ ] Review conditional dropdown logic (h_21 controls i_21 visibility)

## Key Questions

1. **Is h_21 being written to StateManager during import?**
   - Expected: Yes
   - Actual: TBD

2. **Is the dropdown DOM element being updated?**
   - Expected: Yes, during or after import
   - Actual: TBD

3. **Does mute/quarantine affect dropdown updates?**
   - Expected: No, dropdowns should update during mute
   - Actual: TBD

4. **Is there a timing issue?**
   - Expected: Dropdown updates before calculateAll()
   - Actual: TBD

5. **Is Section03.refreshUI() being called?**
   - Expected: Yes, after import completes
   - Actual: TBD

## Related Issues

### Other Fields with Conditional Logic

Fields that might have similar import issues:
- `g_109` (Measured ACH50) - conditional on d_108
- `g_118` (Ventilation Method) - affects other fields
- `k_120` (Unoccupied Setback) - percentage dropdown

### Historical Context

- **ExcelMapper normalization**: Added for many percentage fields (d_59, d_53, d_52, etc.)
- **h_21/i_21 handling**: May need special normalization?

## Debug Logging Strategy

### Add to ExcelMapper.js

```javascript
// In mapExcelToReportModel(), around line 394
console.log(`🔍 [ExcelMapper] H21 cell:`, worksheet["H21"]);
console.log(`🔍 [ExcelMapper] I21 cell:`, worksheet["I21"]);
console.log(`🔍 [ExcelMapper] h_21 extracted:`, importedData["h_21"]);
console.log(`🔍 [ExcelMapper] i_21 extracted:`, importedData["i_21"]);
```

### Add to FileHandler.js

```javascript
// After importing h_21/i_21
console.log(`🔍 [FileHandler] h_21 StateManager:`, window.TEUI.StateManager.getValue("h_21"));
console.log(`🔍 [FileHandler] h_21 DOM dropdown:`, document.querySelector('[data-field-id="h_21"]')?.value);
```

### Add to Section03.js

```javascript
// In refreshUI() or similar
console.log(`🔍 [Section03] h_21 from StateManager:`, window.TEUI.StateManager.getValue("h_21"));
console.log(`🔍 [Section03] h_21 dropdown synced:`, dropdown?.value);
```

## Expected Values for Test

For a typical imported file:
- **h_21**: "Capacitance" or "Static"
- **i_21**: "0" to "100" (string representation of slider position)
- **k_104**: Positive value (~14,000 kWh/yr for test case)

## Success Criteria

✅ Import fixes confirmed when:
1. h_21 dropdown shows correct value after import
2. k_104 matches Excel value (positive sign, correct magnitude)
3. m_129 (Heatpump Cool Elect. Load) matches Excel
4. No manual intervention needed after import

## Next Steps

1. Add debug logging to ExcelMapper, FileHandler, Section03
2. Import test Excel file with known Capacitance setting
3. Trace h_21/i_21 values through entire import pipeline
4. Identify exact point where dropdown sync fails
5. Implement fix (likely in FileHandler mute/unmute logic)
6. Test with multiple Excel files
7. Verify k_104 and m_129 match Excel

## Notes

- Sign flip in k_104 is a **strong indicator** of Capacitance being wrong
- This affects ALL thermal mass calculations
- May also impact heating season calculations (not just cooling)
- High priority fix - blocks accurate TEUI calculations
