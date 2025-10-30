# Tooltip Integration - Field Definition Pattern

## Overview

Add tooltip metadata directly to your field definitions in section files, then render them automatically in your field rendering functions.

---

## Step 1: Load Tooltip Data on Page Load

Add to `index.html` (after TEUI namespace is initialized):

```html
<script>
  // Load validation tooltips from extracted JSON
  window.TEUI = window.TEUI || {};

  fetch("data/validation-tooltips.json")
    .then((response) => response.json())
    .then((data) => {
      window.TEUI.ValidationTooltips = data;
      console.log(`✅ Loaded ${Object.keys(data).length} validation tooltips`);
    })
    .catch((err) =>
      console.warn("⚠️ Could not load validation tooltips:", err),
    );
</script>
```

---

## Step 2: Add Tooltip Property to Field Definitions

In your section files (e.g., `4012-Section02.js`), add `tooltip: true` flag to fields that should display tooltips:

### Before:

```javascript
d: {
  fieldId: "d_12",
  type: "dropdown",
  dropdownId: "dd_d_12",
  value: "A-Assembly",
  section: "buildingInfo",
  options: [...]
},
```

### After:

```javascript
d: {
  fieldId: "d_12",
  type: "dropdown",
  dropdownId: "dd_d_12",
  value: "A-Assembly",
  section: "buildingInfo",
  tooltip: true,  // ✅ Add this flag
  options: [...]
},
```

**Or** specify custom tooltip text:

```javascript
h: {
  fieldId: "h_14",
  type: "text",
  value: "",
  section: "buildingInfo",
  tooltip: {
    title: "Project Name",
    message: "Custom tooltip message here..."
  }
},
```

---

## Step 3: Update Field Rendering Functions

Modify your field rendering functions to automatically apply tooltips when the `tooltip` property is present.

### Example: Dropdown Rendering

```javascript
function createDropdownField(cellConfig) {
  const select = document.createElement("select");
  select.id = cellConfig.fieldId;
  select.className = "form-select";

  // ... add options ...

  // Apply tooltip if flagged
  if (cellConfig.tooltip) {
    applyTooltipToElement(select, cellConfig.fieldId, cellConfig.tooltip);
  }

  return select;
}
```

### Example: Text Input Rendering

```javascript
function createTextInput(cellConfig) {
  const input = document.createElement("input");
  input.type = "text";
  input.id = cellConfig.fieldId;
  input.className = "form-control";

  // Apply tooltip if flagged
  if (cellConfig.tooltip) {
    applyTooltipToElement(input, cellConfig.fieldId, cellConfig.tooltip);
  }

  return input;
}
```

---

## Step 4: Create Tooltip Helper Function

Add this utility function (to a utils file or each section module):

```javascript
/**
 * Apply validation tooltip to an input element
 * @param {HTMLElement} element - The input/select element
 * @param {string} fieldId - Field ID (e.g., "d_12", "h_14")
 * @param {boolean|object} tooltipConfig - True to use JSON data, or custom object
 */
function applyTooltipToElement(element, fieldId, tooltipConfig) {
  let tooltipData;

  // Use custom tooltip or load from JSON
  if (tooltipConfig === true) {
    tooltipData = window.TEUI.ValidationTooltips?.[fieldId];
  } else if (typeof tooltipConfig === "object") {
    tooltipData = tooltipConfig;
  }

  if (!tooltipData) {
    console.warn(`No tooltip data found for field: ${fieldId}`);
    return;
  }

  // Clean Excel newlines (_x000a_ → <br>)
  const cleanMessage = (tooltipData.message || "")
    .replace(/_x000a_/g, "<br>")
    .trim();

  if (!cleanMessage) return;

  // Apply Bootstrap popover
  element.setAttribute("data-bs-toggle", "popover");
  element.setAttribute("data-bs-trigger", "hover focus");
  element.setAttribute("data-bs-placement", "top");
  element.setAttribute("data-bs-html", "true");
  element.setAttribute("data-bs-title", tooltipData.title || "Info");
  element.setAttribute("data-bs-content", cleanMessage);

  // Initialize Bootstrap popover
  new bootstrap.Popover(element, {
    delay: { show: 500, hide: 100 },
    container: "body",
  });
}
```

---

## Step 5: Initialize Popovers After DOM Rendering

In each section's initialization function, after rendering fields:

```javascript
function initializeSection02() {
  renderSection02Fields();

  // Initialize all Bootstrap popovers
  const popoverTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="popover"]'),
  );
  popoverTriggerList.map((popoverTriggerEl) => {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}
```

---

## Complete Example: Section 02 Integration

### Field Definition (4012-Section02.js)

```javascript
const sectionRows = {
  12: {
    id: "B.1",
    rowId: "B.1",
    label: "Major Occupancy",
    cells: {
      c: { label: "Major Occupancy" },
      d: {
        fieldId: "d_12",
        type: "dropdown",
        dropdownId: "dd_d_12",
        value: "A-Assembly",
        section: "buildingInfo",
        tooltip: true,  // ✅ Enable tooltip from JSON
        options: [...]
      },
      // ... other cells ...
      h: {
        fieldId: "h_12",
        type: "year_slider",
        value: "2022",
        tooltip: true,  // ✅ Enable tooltip from JSON
        min: 2015,
        max: 2041,
        section: "buildingInfo",
      },
      // ... more cells ...
    }
  },

  13: {
    id: "B.2",
    cells: {
      // ...
      h: {
        fieldId: "h_14",
        type: "text",
        value: "",
        tooltip: {  // ✅ Custom tooltip (override JSON)
          title: "Project Name",
          message: "Enter a unique identifier for this project"
        },
        section: "buildingInfo",
      }
    }
  }
};
```

### Field Rendering (in same file or FieldRenderer.js)

```javascript
function renderCell(cellConfig, columnKey) {
  let cellElement;

  switch (cellConfig.type) {
    case "dropdown":
      cellElement = createDropdownField(cellConfig);
      break;
    case "text":
      cellElement = createTextInput(cellConfig);
      break;
    case "year_slider":
      cellElement = createSlider(cellConfig);
      break;
    // ... other types ...
  }

  // Apply tooltip if configured
  if (cellConfig.tooltip && cellElement) {
    applyTooltipToElement(cellElement, cellConfig.fieldId, cellConfig.tooltip);
  }

  return cellElement;
}
```

---

## Styling Tooltips (Optional CSS Enhancement)

Add to your CSS file for better tooltip appearance:

```css
/* Tooltip/Popover styling */
.popover {
  max-width: 400px;
  font-size: 0.9rem;
}

.popover-header {
  background-color: #4a96ba;
  color: white;
  font-weight: 600;
}

.popover-body {
  line-height: 1.5;
}

/* Add subtle indicator that field has tooltip */
[data-bs-toggle="popover"] {
  cursor: help;
}

[data-bs-toggle="popover"]:hover {
  background-color: #f8f9fa;
}
```

---

## Alternative: Info Icon Approach

For fields where hover on the input isn't intuitive, add an info icon:

```javascript
function createFieldWithInfoIcon(cellConfig) {
  const container = document.createElement("div");
  container.className = "d-flex align-items-center gap-1";

  // Create the input field
  const input = createInputField(cellConfig);
  container.appendChild(input);

  // Add info icon if tooltip exists
  if (cellConfig.tooltip) {
    const tooltipData =
      cellConfig.tooltip === true
        ? window.TEUI.ValidationTooltips?.[cellConfig.fieldId]
        : cellConfig.tooltip;

    if (tooltipData) {
      const icon = document.createElement("i");
      icon.className = "bi bi-info-circle-fill text-primary";
      icon.style.cursor = "pointer";
      icon.setAttribute("data-bs-toggle", "popover");
      icon.setAttribute("data-bs-html", "true");
      icon.setAttribute("data-bs-title", tooltipData.title);
      icon.setAttribute(
        "data-bs-content",
        tooltipData.message.replace(/_x000a_/g, "<br>"),
      );

      new bootstrap.Popover(icon);
      container.appendChild(icon);
    }
  }

  return container;
}
```

---

## Summary: Integration Checklist

- [ ] Load `validation-tooltips.json` in index.html
- [ ] Add `tooltip: true` to field definitions in section files
- [ ] Create `applyTooltipToElement()` helper function
- [ ] Update field rendering functions to check for `tooltip` property
- [ ] Initialize Bootstrap popovers after DOM rendering
- [ ] (Optional) Add CSS styling for tooltips
- [ ] (Optional) Add info icons for visual indicators

---

## Current Coverage (35 fields)

Fields ready for `tooltip: true` flag:

**Section 02:**

- `d_12` - Major Occupancy
- `d_13` - Reference Standard
- `d_14` - Actual/Target Use
- `d_15` - Carbon Standard
- `h_12` - Reporting Period
- `h_13` - Service Life
- `h_14` - Project Name
- `h_15` - Conditioned Area
- `i_16` - Certifier
- `i_17` - License No
- `l_12`, `l_13`, `l_14`, `l_15`, `l_16` - Energy costs

**Section 03:**

- `d_19`, `h_19`, `h_20`, `h_21`, `i_21`, `m_19` - Climate fields

**Section 04-07:**

- See [validation-tooltips.json](../data/validation-tooltips.json) for complete list

---

**Next:** Add `tooltip: true` to Section 02 field definitions and test the integration!
