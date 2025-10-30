# Excel Validation Tooltip Extraction System

## Overview

This system extracts Data Validation input messages from Excel and makes them available as tooltips in the TEUI web app.

## Components

### 1. Python Extraction Script

**Location:** `extract-validation.py` (workspace root)

**Purpose:** Extracts data validation tooltips from the REPORT sheet in Excel files

**Usage:**

```bash
python3 extract-validation.py "/path/to/TEUIv3042.xlsx"
```

**Output:**

- Prints JSON to stdout
- Saves to `OBJECTIVE 4011RF/data/validation-tooltips.json`

**Dependencies:**

```bash
pip3 install openpyxl
```

### 2. ExcelMapper.js Method

**Location:** [4011-ExcelMapper.js:973-1004](../4011-ExcelMapper.js#L973-L1004)

**Method:** `extractValidationTooltips(workbook)`

**Purpose:** Attempts to extract cell comments from Excel using XLSX.js (Note: XLSX.js has limited data validation support)

**Usage:**

```javascript
const tooltips = window.TEUI.ExcelMapper.extractValidationTooltips(workbook);
// Returns: { field_id: { cell: "D12", comment: "..." }, ... }
```

**Limitation:** XLSX.js cannot read Data Validation input messages directly. Use Python script for full extraction.

### 3. Generated Tooltip Data

**Location:** [data/validation-tooltips.json](../data/validation-tooltips.json)

**Format:**

```json
{
  "field_id": {
    "cell": "D12",
    "title": "Title shown in Excel",
    "message": "Message text with _x000a_ for newlines"
  }
}
```

**Note:** `_x000a_` represents newline characters from Excel. Replace with `\n` or `<br>` when displaying.

---

## How to Use Tooltips in the App

### Option 1: Load JSON Statically

Add to `index.html`:

```html
<script>
  // Load validation tooltips
  fetch("data/validation-tooltips.json")
    .then((response) => response.json())
    .then((data) => {
      window.TEUI.ValidationTooltips = data;
      console.log("Loaded validation tooltips:", Object.keys(data).length);
    });
</script>
```

### Option 2: Integrate with FileHandler

Modify [4011-FileHandler.js](../4011-FileHandler.js) to load tooltips when importing Excel:

```javascript
processImportedExcel(workbook) {
  // ... existing import logic ...

  // Extract tooltips from Excel
  const tooltips = this.excelMapper.extractValidationTooltips(workbook);

  // OR load from pre-generated JSON
  fetch('data/validation-tooltips.json')
    .then(response => response.json())
    .then(data => {
      window.TEUI.ValidationTooltips = data;
      this.applyTooltipsToFields(data);
    });
}
```

### Option 3: Apply to Field Rendering

In section files or FieldManager, add tooltips to input fields:

```javascript
function createInputField(fieldId, value) {
  const input = document.createElement("input");
  input.id = fieldId;
  input.value = value;

  // Apply tooltip if available
  const tooltip = window.TEUI.ValidationTooltips?.[fieldId];
  if (tooltip) {
    input.setAttribute("data-bs-toggle", "tooltip");
    input.setAttribute("data-bs-placement", "top");
    input.setAttribute("title", tooltip.title);
    input.setAttribute(
      "data-bs-content",
      tooltip.message.replace(/_x000a_/g, "\n"),
    );

    // Initialize Bootstrap tooltip
    new bootstrap.Tooltip(input);
  }

  return input;
}
```

---

## Workflow: Updating Tooltips from Excel

When Excel file validation messages change:

1. **Run Python script** on updated Excel file:

   ```bash
   python3 extract-validation.py "/path/to/updated-excel.xlsx"
   ```

2. **Verify output** in `OBJECTIVE 4011RF/data/validation-tooltips.json`

3. **Commit changes:**

   ```bash
   git add "OBJECTIVE 4011RF/data/validation-tooltips.json"
   git commit -m "📝 UPDATE: Refresh validation tooltips from Excel v3042"
   ```

4. **Deploy** to gh-pages (tooltips automatically included)

---

## Current Coverage

**Total Tooltips Extracted:** 35 (as of Oct 2025)

**Sections Covered:**

- Section 02: Building Information (8 fields)
- Section 03: Climate (6 fields)
- Section 04: Actual vs Target Energy (6 fields)
- Section 05: Emissions (2 fields)
- Section 06: Renewable Energy (1 field)
- Section 07: Water Use (7 fields)

**Missing Coverage:**

- Sections 08-16 (envelope, ventilation, mechanical, etc.)
- Need to expand `CELL_TO_FIELD_MAPPING` in Python script

---

## Future Enhancements

1. **Expand cell mapping** to cover all 300+ input fields in ExcelMapper.js
2. **Add tooltip UI component** in FieldManager for consistent rendering
3. **Implement hover tooltips** with Bootstrap Popover for longer messages
4. **Add "?" info icons** next to field labels that trigger tooltips
5. **Extract validation dropdowns** (list of valid options) for better UX
6. **Internationalization** support for multi-language tooltips

---

## Technical Notes

### Why Python instead of JavaScript?

- **XLSX.js limitation:** The SheetJS library used in FileHandler cannot read Data Validation input messages
- **openpyxl support:** Python's openpyxl library has full access to Excel's validation metadata
- **One-time extraction:** Tooltips don't change frequently, so runtime extraction isn't needed

### Excel Data Validation Structure

Excel stores validation in `worksheet.data_validations.dataValidation` with:

- `promptTitle` - Short title shown in validation popup
- `prompt` - Longer help message
- `cells` - Range of cells this validation applies to

### Newline Handling

Excel uses `_x000a_` to represent newlines in XML. When displaying:

- Web: Replace with `<br>` for HTML or `\n` for text
- Bootstrap tooltips: Use `data-bs-html="true"` to render `<br>` tags

---

**Last Updated:** Oct 8, 2025
**Excel Version:** TEUIv3042.xlsx
**Extraction Date:** 2025-10-08
