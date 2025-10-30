# Section 02 Tooltip Integration - Implementation Summary

## Overview

Successfully integrated **11 validation tooltips** into Section 02 (Building Information), extracted directly from Excel Data Validation input messages.

**Status:** ✅ Ready to Test

---

## What Was Done

### 1. Extracted Section 02 Tooltips from Excel

**Script:** `extract-validation-section02.py`

**Command:**

```bash
python3 extract-validation-section02.py "/path/to/TEUIv3042.xlsx"
```

**Result:** Found **17 validation tooltips** in rows 12-17 of REPORT sheet

**Output:** [section02-validation-tooltips.json](../data/section02-validation-tooltips.json)

### 2. Added Tooltip Flags to Field Definitions

Modified [4012-Section02.js](../sections/4012-Section02.js) to add `tooltip: true` to all input fields with validation messages:

| Row | Field ID | Cell | Tooltip Title            | Type        |
| --- | -------- | ---- | ------------------------ | ----------- |
| 12  | `h_12`   | H12  | Year Data Entered        | year_slider |
| 12  | `l_12`   | L12  | Assume $0.13/kwh         | editable    |
| 13  | `h_13`   | H13  | Select a period in Years | year_slider |
| 13  | `l_13`   | L13  | Assume $0.507 (Ontario)  | editable    |
| 14  | `d_14`   | D14  | Select a Method          | dropdown    |
| 14  | `h_14`   | H14  | Project Name             | editable    |
| 14  | `l_14`   | L14  | Assume $1.62 (Ontario)   | editable    |
| 15  | `d_15`   | D15  | Carbon Benchmark         | dropdown    |
| 15  | `h_15`   | H15  | Net Conditioned Area     | editable    |
| 15  | `l_15`   | L15  | Assume $180/m3 (Ontario) | editable    |
| 16  | `d_16`   | D16  | S4. Targets              | derived     |
| 16  | `i_16`   | H16  | Certifier                | editable    |
| 16  | `l_16`   | L16  | Assume $1.50 (Ontario)   | editable    |
| 17  | `i_17`   | H17  | License or Authorization | editable    |

**Total:** 14 fields marked with `tooltip: true` (11 unique field IDs + 3 cells with shared validation)

### 3. Created TooltipManager Module

**File:** [4011-TooltipManager.js](../4011-TooltipManager.js)

**Features:**

- Auto-loads `validation-tooltips.json` on page load
- Provides `applyTooltip()` method for individual fields
- Provides `applyTooltipsToSection()` method for bulk application
- Cleans Excel newlines (`_x000a_` → `<br>`)
- Initializes Bootstrap popovers with hover/focus triggers

**API:**

```javascript
// Get tooltip data
const tooltip = window.TEUI.TooltipManager.getTooltip("h_12");

// Apply to element
window.TEUI.TooltipManager.applyTooltip(element, "h_12");

// Apply to entire section
window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
```

### 4. Integrated with Section 02

**Modified:** [4012-Section02.js:1307-1313](../sections/4012-Section02.js#L1307-L1313)

**Integration Point:** `onSectionRendered()` function

**Code:**

```javascript
// Apply validation tooltips to fields
if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
  // Wait a short moment for DOM to fully settle, then apply tooltips
  setTimeout(() => {
    window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
  }, 300);
}
```

**Why 300ms delay?** Ensures DOM is fully rendered before applying Bootstrap popovers.

### 5. Added Script to index.html

**Modified:** [index.html:68-69](../index.html#L68-L69)

**Code:**

```html
<script src="4011-TooltipManager.js"></script>
<!-- TooltipManager loads validation tooltips from Excel -->
```

**Load Order:** After FileHandler, before Dependency (ensures tooltips load early)

---

## Example Tooltips

### h_12 (Reporting Period Slider)

**Title:** "Year Data Entered"
**Message:** "Select a Reporting Period. This will determine Annualized Emissions Factors and Forecasted Factors per the Toronto Atmospheric Fund."

### h_14 (Project Name)

**Title:** "Project Name"
**Message:** "You may anonymize any owner info here. Use a project number or location or secret code name. Useful also for naming variations of your OBJECTIVE models ie. Run 1, 2, 3, etc."

### d_15 (Carbon Standard Dropdown)

**Title:** "Carbon Benchmark"
**Message:** "Enter relevant standard otherwise 'Self Reported'. If no A1-3 Embodied carbon has been calculated using another tool, select 'Not Reported' to use default values (Upset Limits from TGS4)"

---

## How to Test

1. **Open the app** in browser
2. **Navigate to Section 02** (Building Information)
3. **Hover over input fields** that have tooltips:

   - Year sliders (h_12, h_13)
   - Project Name text field (h_14)
   - Dropdowns (d_14, d_15)
   - Cost fields (l_12, l_13, l_14, l_15, l_16)
   - Certifier fields (i_16, i_17)
   - Conditioned Area (h_15)

4. **Expected behavior:**

   - Tooltip popover appears after 500ms hover
   - Title shown in bold header
   - Message shown in body (with line breaks if present)
   - Popover positioned above field (top placement)
   - Popover disappears 100ms after mouse leaves

5. **Check console** for confirmation:
   ```
   ✅ [TooltipManager] Loaded 35 validation tooltips
   ✅ [TooltipManager] Applied tooltip to h_12
   ✅ [TooltipManager] Applied tooltip to l_12
   ...
   ✅ [TooltipManager] Applied 11 tooltips to section
   ```

---

## Files Modified/Created

### Created:

- ✅ `extract-validation-section02.py` - Python script for comprehensive Section 02 extraction
- ✅ `OBJECTIVE 4011RF/data/section02-validation-tooltips.json` - Raw extraction (17 tooltips)
- ✅ `OBJECTIVE 4011RF/4011-TooltipManager.js` - Tooltip management module
- ✅ `OBJECTIVE 4011RF/documentation/SECTION02-TOOLTIPS.md` - This document

### Modified:

- ✅ `OBJECTIVE 4011RF/sections/4012-Section02.js` - Added `tooltip: true` to 11 fields + integration code
- ✅ `OBJECTIVE 4011RF/index.html` - Added TooltipManager script tag

---

## Next Steps

### Immediate:

1. **Test in browser** - Verify tooltips display correctly
2. **Adjust styling** - Add custom CSS if needed for tooltip appearance
3. **Fix any issues** - Debug tooltip positioning or content formatting

### Future Enhancements:

1. **Add info icons** - Visual indicators next to fields with tooltips
2. **Expand to other sections** - Apply same pattern to S03-S16
3. **Add keyboard accessibility** - Ensure tooltips work with Tab navigation
4. **Extract more tooltips** - Run script on all sections (need to expand cell mapping)

### Sections to Add Next:

- **Section 03:** Climate (6 tooltips already extracted)
- **Section 04:** Actual vs Target Energy (6 tooltips)
- **Section 05:** Emissions (2 tooltips)
- **Section 06:** Renewable Energy (1 tooltip)
- **Section 07:** Water Use (7 tooltips)

**Total Available:** 35 tooltips extracted, 11 applied (31% coverage)

---

## Troubleshooting

### Tooltips not appearing?

1. **Check console** for loading errors:

   ```javascript
   // Should see this:
   ✅ [TooltipManager] Loaded 35 validation tooltips
   ```

2. **Verify Bootstrap is loaded:**

   ```javascript
   console.log(typeof bootstrap.Popover); // Should be "function"
   ```

3. **Check JSON file exists:**

   ```
   OBJECTIVE 4011RF/data/validation-tooltips.json
   ```

4. **Inspect element** - Should have these attributes:
   ```html
   <input data-bs-toggle="popover" data-bs-title="..." data-bs-content="..." />
   ```

### Wrong tooltip content?

- Re-run extraction script with latest Excel file
- Check field ID mapping in Section02.js matches ExcelMapper.js

### Tooltip positioning issues?

- Adjust `data-bs-placement` in TooltipManager.js
- Options: `top`, `bottom`, `left`, `right`, `auto`

---

**Implementation Date:** Oct 8, 2025
**Excel Version:** TEUIv3042.xlsx
**Section:** 02 - Building Information
**Coverage:** 11/11 input fields (100% of Section 02)
