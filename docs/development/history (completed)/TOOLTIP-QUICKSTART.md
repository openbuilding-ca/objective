# Tooltip Extraction - Quick Start Guide

## TL;DR

You now have **35 validation tooltips** extracted from Excel and ready to use in your app!

**File:** [data/validation-tooltips.json](../data/validation-tooltips.json)

---

## What Just Happened?

1. ✅ Created `extract-validation.py` - Python script to read Excel Data Validation
2. ✅ Installed `openpyxl` library (`pip3 install openpyxl`)
3. ✅ Ran script on `TEUIv3042.xlsx`
4. ✅ Generated `validation-tooltips.json` with 35 tooltips
5. ✅ Added `extractValidationTooltips()` method to ExcelMapper.js

---

## How to Run the Script Again

When your Excel file's validation messages change:

```bash
# Navigate to workspace root
cd "/path/to/OBJECTIVE_WORKSPACE"

# Run the extraction script
python3 extract-validation.py "/path/to/TEUIv3042.xlsx"

# Output is saved to: OBJECTIVE 4011RF/data/validation-tooltips.json
```

---

## Example Tooltip Data

```json
{
  "h_14": {
    "cell": "H14",
    "title": "Project Name",
    "message": "You may anonymize any owner info here. Use a project number or location or secret code name. Useful also for naming variations of your OBJECTIVE models ie. Run 1, 2, 3, etc."
  },
  "h_15": {
    "cell": "H15",
    "title": "Net Conditioned Area",
    "message": "Net Conditioned Area is measured from the interior face of any construction assembly..."
  }
}
```

---

## How to Use in Your App

### Step 1: Load the JSON (add to index.html)

```html
<script>
  // Load validation tooltips on page load
  window.TEUI = window.TEUI || {};

  fetch("data/validation-tooltips.json")
    .then((response) => response.json())
    .then((data) => {
      window.TEUI.ValidationTooltips = data;
      console.log(`✅ Loaded ${Object.keys(data).length} validation tooltips`);
    })
    .catch((err) => console.warn("Could not load tooltips:", err));
</script>
```

### Step 2: Apply to Input Fields

Add this helper function to your section files or FieldManager:

```javascript
function applyTooltip(inputElement, fieldId) {
  const tooltip = window.TEUI.ValidationTooltips?.[fieldId];

  if (tooltip) {
    // Clean up Excel newlines (_x000a_ → <br>)
    const cleanMessage = tooltip.message.replace(/_x000a_/g, "<br>");

    // Use Bootstrap popover for longer messages
    inputElement.setAttribute("data-bs-toggle", "popover");
    inputElement.setAttribute("data-bs-trigger", "hover focus");
    inputElement.setAttribute("data-bs-placement", "top");
    inputElement.setAttribute("data-bs-html", "true");
    inputElement.setAttribute("data-bs-title", tooltip.title);
    inputElement.setAttribute("data-bs-content", cleanMessage);

    // Initialize Bootstrap popover
    new bootstrap.Popover(inputElement);
  }
}

// Usage example:
const input = document.getElementById("h_14");
applyTooltip(input, "h_14");
```

### Step 3: Add Info Icons (Optional Enhancement)

```javascript
function createFieldWithTooltip(fieldId, labelText) {
  const container = document.createElement("div");
  container.className = "field-with-tooltip";

  const label = document.createElement("label");
  label.textContent = labelText;

  const input = document.createElement("input");
  input.id = fieldId;

  // Add info icon if tooltip exists
  const tooltip = window.TEUI.ValidationTooltips?.[fieldId];
  if (tooltip) {
    const icon = document.createElement("i");
    icon.className = "bi bi-info-circle-fill text-primary ms-1";
    icon.style.cursor = "pointer";
    icon.setAttribute("data-bs-toggle", "popover");
    icon.setAttribute("data-bs-html", "true");
    icon.setAttribute("data-bs-title", tooltip.title);
    icon.setAttribute(
      "data-bs-content",
      tooltip.message.replace(/_x000a_/g, "<br>"),
    );
    new bootstrap.Popover(icon);

    label.appendChild(icon);
  }

  container.appendChild(label);
  container.appendChild(input);
  return container;
}
```

---

## Current Coverage

✅ **35 fields** have tooltips extracted:

| Section                | Fields |
| ---------------------- | ------ |
| S02 - Building Info    | 8      |
| S03 - Climate          | 6      |
| S04 - Actual vs Target | 6      |
| S05 - Emissions        | 2      |
| S06 - Renewable Energy | 1      |
| S07 - Water Use        | 7      |

**To expand coverage:** Add more cell mappings to `CELL_TO_FIELD_MAPPING` in `extract-validation.py`

---

## Next Steps

1. **Load tooltips in app** - Add fetch() script to index.html
2. **Apply to fields** - Use `applyTooltip()` helper in section renderers
3. **Test UX** - Verify popover placement and readability
4. **Expand coverage** - Add more field mappings to Python script
5. **Commit to repo** - Track validation-tooltips.json in version control

---

## Files Modified/Created

- ✅ `extract-validation.py` - Python extraction script
- ✅ `OBJECTIVE 4011RF/data/validation-tooltips.json` - Generated tooltip data
- ✅ `OBJECTIVE 4011RF/4011-ExcelMapper.js` - Added `extractValidationTooltips()` method
- ✅ `OBJECTIVE 4011RF/documentation/TOOLTIP-SYSTEM.md` - Complete technical documentation
- ✅ `OBJECTIVE 4011RF/documentation/TOOLTIP-QUICKSTART.md` - This guide

---

**Questions?** See [TOOLTIP-SYSTEM.md](./TOOLTIP-SYSTEM.md) for full technical details.
