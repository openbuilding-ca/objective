# S17 Dependency Graph CSS Consolidation Workplan

**Date**: Nov 2, 2025
**Branch**: C-RF
**Goal**: Consolidate all S17 Dependency Graph styling into styles.css to eliminate conflicts and improve maintainability

---

## Problem Statement

Currently, S17 Dependency Graph styling is split across two locations:
1. **Inline JavaScript styles** in `src/core/Dependency.js` (~100+ inline style assignments)
2. **CSS classes** in `src/styles.css` (lines 1169-1809)

This causes:
- **Style conflicts** (inline styles override CSS, making CSS changes ineffective)
- **Difficult maintenance** (must edit both files to change styling)
- **Aggressive browser caching issues** (inline JS styles require hard refresh, CSS cache is more manageable)
- **Duplicated code** (same styles defined in both places)

---

## Current State Analysis

### Inline Styles in Dependency.js

**Graph Container** (lines 322-326):
```javascript
graphContainer.className = "dependency-graph-svg-wrapper";
graphContainer.style.width = "100%";
graphContainer.style.height = "650px";
graphContainer.style.border = "1px solid #ccc";
graphContainer.style.position = "relative";
```

**Controls Container** (lines 489-495):
```javascript
controlsContainer.className = "dependency-graph-controls";
controlsContainer.style.display = "flex";
controlsContainer.style.flexWrap = "wrap";
controlsContainer.style.gap = "10px";
controlsContainer.style.marginBottom = "10px";
controlsContainer.style.padding = "10px";
controlsContainer.style.borderBottom = "1px solid #eee";
```

**Info Panel** (lines 602-619):
```javascript
infoPanel.className = "dependency-info-panel alert alert-secondary";
infoPanel.style.marginBottom = "10px";
infoPanel.style.display = "none";
title.className = "info-title alert-heading";
title.style.marginBottom = "0.5rem";
value.className = "info-value mb-1";
dependencies.className = "info-dependencies mb-1";
dependents.className = "info-dependents mb-0";
```

**Floating Controls** (lines 1379-1388):
```javascript
floatingControls.className = "dependency-graph-floating-controls";
floatingControls.style.position = "absolute";
floatingControls.style.top = "20px";
floatingControls.style.right = "20px";
floatingControls.style.background = "rgba(255, 255, 255, 0.95)";
floatingControls.style.padding = "10px";
floatingControls.style.borderRadius = "5px";
floatingControls.style.boxShadow = "0 3px 6px rgba(0,0,0,0.2)";
floatingControls.style.zIndex = "9999";
floatingControls.style.display = "none";
```

**Floating Info Panel** (lines 1400-1411):
```javascript
floatingInfoPanel.className = "dependency-graph-floating-info";
floatingInfoPanel.style.position = "absolute";
floatingInfoPanel.style.top = "20px";
floatingInfoPanel.style.left = "20px";
floatingInfoPanel.style.background = "rgba(255, 255, 255, 0.98)";
floatingInfoPanel.style.padding = "15px";
floatingInfoPanel.style.borderRadius = "8px";
floatingInfoPanel.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
floatingInfoPanel.style.zIndex = "10000";
floatingInfoPanel.style.maxWidth = "350px";
floatingInfoPanel.style.display = "none";
```

**Legend** (lines 1628-1647):
```javascript
legend.className = "dependency-graph-legend";
legend.style.display = "none";
legend.style.position = "absolute";
legend.style.bottom = "30px";
legend.style.right = "30px";
legend.style.background = "rgba(255, 255, 255, 0.9)";
legend.style.padding = "10px";
legend.style.borderRadius = "5px";
legend.style.maxWidth = "250px";
legend.style.zIndex = "100";
legend.style.fontSize = "12px";
legend.style.fontFamily = "sans-serif";
// Plus 20+ more inline styles for legend children
```

**Legend Items** (lines 1645-1683):
```javascript
title.style.fontWeight = "bold";
title.style.marginBottom = "8px";
title.style.paddingBottom = "4px";
itemsContainer.style.display = "grid";
itemsContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
itemsContainer.style.gap = "8px";
item.style.display = "flex";
item.style.alignItems = "center";
colorBox.style.display = "inline-block";
colorBox.style.width = "12px";
colorBox.style.height = "12px";
colorBox.style.backgroundColor = color;
colorBox.style.marginRight = "6px";
colorBox.style.borderRadius = "3px";
label.style.whiteSpace = "nowrap";
label.style.overflow = "hidden";
label.style.textOverflow = "ellipsis";
```

**Architectural Layer Items** (lines 1695-1740):
```javascript
archTitle.style.fontWeight = "bold";
archTitle.style.marginTop = "12px";
archTitle.style.marginBottom = "8px";
archTitle.style.paddingBottom = "4px";
archTitle.style.borderTop = "1px solid #ccc";
archTitle.style.paddingTop = "8px";
itemDiv.style.display = "flex";
itemDiv.style.alignItems = "center";
itemDiv.style.marginBottom = "4px";
itemDiv.style.fontSize = "11px";
indicator.style.width = "16px";
indicator.style.height = "16px";
indicator.style.border = `3px solid ${item.color}`;
indicator.style.borderRadius = "50%";
indicator.style.backgroundColor = "#f0f0f0";
indicator.style.marginRight = "8px";
indicator.style.flexShrink = "0";
label.style.fontWeight = "500";
```

### CSS Classes in styles.css (lines 1169-1809)

Already has most of the necessary classes defined, but they're being overridden by inline styles.

---

## Consolidated CSS Solution

### Replace styles.css Section (lines 1169-1809)

```css
/* ======================================
   Dependency Graph Styles (Section 17)
   ====================================== */

/* Graph Container */
.dependency-graph-svg-wrapper {
  position: relative;
  width: 100%;
  height: 650px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background-color: #ffffff;
  overflow: hidden;
}

.dependency-graph-svg-wrapper svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Controls Wrapper */
.dependency-graph-controls-wrapper,
.dependency-graph-info-wrapper {
  padding-left: 1rem;
  padding-right: 1rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

/* Controls Container */
.dependency-graph-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  padding: 10px;
  border-bottom: 1px solid #eee;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.25rem;
}

.dependency-graph-controls .form-control-sm,
.dependency-graph-controls .form-select-sm,
.dependency-graph-controls .btn-sm {
  font-size: 0.875rem;
}

/* Search Container */
.dependency-graph-search-container {
  flex: 1;
  min-width: 200px;
}

.dependency-graph-search-container .form-control {
  width: 100%;
}

/* Group Filter Container */
.dependency-graph-group-filter {
  flex: 1;
  min-width: 200px;
}

.dependency-graph-group-filter .form-select {
  width: 100%;
}

/* Layout Buttons Container */
.dependency-graph-layout-container {
  display: flex;
  gap: 5px;
  align-items: center;
}

.layout-button.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

/* Fullscreen Button */
.dependency-graph-fullscreen-button {
  margin-left: auto;
}

/* Info Panel (Non-Fullscreen) */
.dependency-info-panel {
  font-size: 0.9rem;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #0d6efd;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: none;
}

.dependency-info-panel .info-title {
  color: #0d6efd;
  margin-bottom: 0.5rem;
}

.dependency-info-panel .info-value {
  margin-bottom: 0.25rem;
}

.dependency-info-panel .info-dependencies {
  margin-bottom: 0.25rem;
}

.dependency-info-panel .info-dependents {
  margin-bottom: 0;
}

.dependency-info-panel strong {
  font-weight: 600;
}

/* Floating Controls (Fullscreen Only) */
.dependency-graph-floating-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.98);
  padding: 14px;
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: none;
}

.dependency-graph-floating-controls .dependency-graph-controls {
  margin-bottom: 0;
  padding: 0;
  border: none;
  background: transparent;
}

.dependency-graph-floating-controls input,
.dependency-graph-floating-controls select {
  border: 1px solid #dee2e6 !important;
  background-color: #fff !important;
  padding: 6px 12px !important;
}

/* Floating Info Panel (Fullscreen Only) */
.dependency-graph-floating-info {
  position: absolute;
  top: 20px;
  left: 20px;
  max-width: 350px;
  background: rgba(255, 255, 255, 0.98);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 10000;
  transition: all 0.3s ease;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  display: none;
}

.dependency-graph-floating-info .dependency-info-panel {
  margin-bottom: 0;
  border-left: 3px solid #0d6efd;
  padding-left: 12px;
  display: block;
}

.dependency-graph-floating-info .info-title {
  color: #0d6efd;
  font-size: 16px;
  margin-bottom: 10px;
  font-weight: 600;
}

.dependency-graph-floating-info .info-value,
.dependency-graph-floating-info .info-dependencies,
.dependency-graph-floating-info .info-dependents {
  margin-bottom: 12px;
  line-height: 1.5;
}

.dependency-graph-floating-info .info-note {
  border-top: 1px solid #eee;
  padding-top: 10px;
  margin-top: 10px;
  font-size: 13px;
  font-style: italic;
  color: #666;
}

/* Legend */
.dependency-graph-legend {
  position: absolute;
  bottom: 30px;
  right: 30px;
  background: rgba(255, 255, 255, 0.95);
  padding: 12px;
  border-radius: 8px;
  max-width: 300px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 12px;
  z-index: 100;
  transition: opacity 0.2s ease-in-out;
  display: none;
}

.dependency-graph-legend-title {
  font-weight: bold;
  margin-bottom: 8px;
  padding-bottom: 4px;
  font-size: 14px;
}

.dependency-graph-legend-items {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.dependency-graph-legend-item {
  display: flex;
  align-items: center;
}

.dependency-graph-legend-color-box {
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-right: 6px;
  border-radius: 3px;
}

.dependency-graph-legend-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dependency-graph-legend-arch-title {
  font-weight: bold;
  margin-top: 12px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
}

.dependency-graph-legend-arch-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 11px;
}

.dependency-graph-legend-arch-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #f0f0f0;
  margin-right: 8px;
  flex-shrink: 0;
}

.dependency-graph-legend-arch-label {
  font-weight: 500;
}

/* Graph Elements */
.link {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1.5px;
  transition: stroke 0.3s, stroke-opacity 0.3s, stroke-width 0.3s;
}

.node circle {
  stroke: #fff;
  stroke-width: 2px;
  transition: r 0.3s, stroke-width 0.3s, filter 0.3s;
  filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2));
}

.node-background {
  fill: white;
  opacity: 0;
  transition: opacity 0.3s;
}

.node text {
  font-size: 12px;
  font-weight: 500;
  fill: #333;
  pointer-events: none;
  text-shadow: 0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white;
  transition: font-size 0.3s;
}

.node title {
  font-size: 14px;
  font-weight: bold;
}

.node.highlight circle {
  stroke: #333;
  stroke-width: 3px;
  filter: drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.3));
}

.link.highlight-source {
  stroke: #cc0000;
  stroke-opacity: 0.9;
  stroke-width: 2px;
}

.link.highlight-target {
  stroke: #0077cc;
  stroke-opacity: 0.9;
  stroke-width: 2px;
}

/* Fullscreen Styles */
.dependency-graph-svg-wrapper:fullscreen,
.dependency-graph-svg-wrapper:-webkit-full-screen,
.dependency-graph-svg-wrapper:-moz-full-screen,
.dependency-graph-svg-wrapper:-ms-fullscreen {
  background-color: white;
  width: 100%;
  height: 100%;
  border: none;
  padding: 20px;
}

.dependency-graph-svg-wrapper:fullscreen svg,
.dependency-graph-svg-wrapper:-webkit-full-screen svg,
.dependency-graph-svg-wrapper:-moz-full-screen svg,
.dependency-graph-svg-wrapper:-ms-fullscreen svg {
  width: calc(100% - 40px);
  height: calc(100% - 40px);
}

.dependency-graph-svg-wrapper:fullscreen .node text,
.dependency-graph-svg-wrapper:-webkit-full-screen .node text,
.dependency-graph-svg-wrapper:-moz-full-screen .node text,
.dependency-graph-svg-wrapper:-ms-fullscreen .node text {
  font-size: 14px;
  font-weight: 600;
  fill: #000;
}

.dependency-graph-svg-wrapper:fullscreen .node circle:not(.node-background),
.dependency-graph-svg-wrapper:-webkit-full-screen .node circle:not(.node-background),
.dependency-graph-svg-wrapper:-moz-full-screen .node circle:not(.node-background),
.dependency-graph-svg-wrapper:-ms-fullscreen .node circle:not(.node-background) {
  filter: drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.3));
  stroke-width: 2.5px;
}

.dependency-graph-svg-wrapper:fullscreen .link,
.dependency-graph-svg-wrapper:-webkit-full-screen .link,
.dependency-graph-svg-wrapper:-moz-full-screen .link,
.dependency-graph-svg-wrapper:-ms-fullscreen .link {
  stroke-width: 2px;
  stroke-opacity: 0.7;
}

.dependency-graph-svg-wrapper:fullscreen .dependency-graph-legend,
.dependency-graph-svg-wrapper:-webkit-full-screen .dependency-graph-legend,
.dependency-graph-svg-wrapper:-moz-full-screen .dependency-graph-legend,
.dependency-graph-svg-wrapper:-ms-fullscreen .dependency-graph-legend {
  padding: 15px;
  font-size: 14px;
}

.dependency-graph-svg-wrapper:fullscreen .dependency-graph-legend-title,
.dependency-graph-svg-wrapper:-webkit-full-screen .dependency-graph-legend-title,
.dependency-graph-svg-wrapper:-moz-full-screen .dependency-graph-legend-title,
.dependency-graph-svg-wrapper:-ms-fullscreen .dependency-graph-legend-title {
  font-size: 16px;
}

/* Influential nodes glow effect in fullscreen */
.dependency-graph-svg-wrapper:fullscreen .node circle[style*="drop-shadow(0px 0px"],
.dependency-graph-svg-wrapper:-webkit-full-screen .node circle[style*="drop-shadow(0px 0px"],
.dependency-graph-svg-wrapper:-moz-full-screen .node circle[style*="drop-shadow(0px 0px"],
.dependency-graph-svg-wrapper:-ms-fullscreen .node circle[style*="drop-shadow(0px 0px"] {
  filter: drop-shadow(0px 0px 20px rgba(255, 82, 82, 1)) !important;
}
```

---

## Dependency.js Changes

### What to Remove

Remove ALL inline style assignments. Keep only className assignments:

**Example BEFORE**:
```javascript
legend.className = "dependency-graph-legend";
legend.style.display = "none";
legend.style.position = "absolute";
legend.style.bottom = "30px";
legend.style.right = "30px";
legend.style.background = "rgba(255, 255, 255, 0.9)";
// ... 10 more inline styles
```

**Example AFTER**:
```javascript
legend.className = "dependency-graph-legend";
// All styling now in CSS
```

### What to Keep

Keep JavaScript for:
1. **Dynamic display toggling**: `element.style.display = "block"` / `"none"`
2. **Dynamic positioning**: Only if calculated at runtime
3. **Dynamic colors**: `colorBox.style.backgroundColor = color` (when color comes from data)
4. **Dynamic transitions/animations**: Temporary effects
5. **Computed values**: Values that depend on runtime calculations

### Specific Changes Needed in Dependency.js

**Line 322-326** - Graph Container:
```javascript
// BEFORE
graphContainer.className = "dependency-graph-svg-wrapper";
graphContainer.style.width = "100%";
graphContainer.style.height = "650px";
graphContainer.style.border = "1px solid #ccc";
graphContainer.style.position = "relative";

// AFTER
graphContainer.className = "dependency-graph-svg-wrapper";
// All styling in CSS
```

**Line 489-495** - Controls Container:
```javascript
// BEFORE
controlsContainer.className = "dependency-graph-controls";
controlsContainer.style.display = "flex";
controlsContainer.style.flexWrap = "wrap";
controlsContainer.style.gap = "10px";
controlsContainer.style.marginBottom = "10px";
controlsContainer.style.padding = "10px";
controlsContainer.style.borderBottom = "1px solid #eee";

// AFTER
controlsContainer.className = "dependency-graph-controls";
// All styling in CSS
```

**Line 499-506** - Search Container:
```javascript
// BEFORE
searchContainer.style.flex = "1";
searchContainer.style.minWidth = "200px";
searchInput.className = "form-control form-control-sm";
searchInput.style.width = "100%";

// AFTER
searchContainer.className = "dependency-graph-search-container";
searchInput.className = "form-control form-control-sm";
// All styling in CSS
```

**Line 514-519** - Group Filter:
```javascript
// BEFORE
groupFilterContainer.style.flex = "1";
groupFilterContainer.style.minWidth = "200px";
groupSelect.className = "form-select form-select-sm";
groupSelect.style.width = "100%";

// AFTER
groupFilterContainer.className = "dependency-graph-group-filter";
groupSelect.className = "form-select form-select-sm";
// All styling in CSS
```

**Line 535-537** - Layout Container:
```javascript
// BEFORE
layoutContainer.style.display = "flex";
layoutContainer.style.gap = "5px";
layoutContainer.style.alignItems = "center";

// AFTER
layoutContainer.className = "dependency-graph-layout-container";
// All styling in CSS
```

**Line 568** - Fullscreen Button:
```javascript
// BEFORE
fullscreenButton.style.marginLeft = "auto";

// AFTER
fullscreenButton.className = "btn btn-outline-secondary btn-sm dependency-graph-fullscreen-button";
// All styling in CSS
```

**Line 602-619** - Info Panel:
```javascript
// BEFORE
infoPanel.className = "dependency-info-panel alert alert-secondary";
infoPanel.style.marginBottom = "10px";
infoPanel.style.display = "none"; // ✅ KEEP - dynamic toggle
title.className = "info-title alert-heading";
title.style.marginBottom = "0.5rem";

// AFTER
infoPanel.className = "dependency-info-panel alert alert-secondary";
infoPanel.style.display = "none"; // ✅ KEEP - dynamic toggle
title.className = "info-title alert-heading";
// Other styling in CSS
```

**Line 1379-1388** - Floating Controls:
```javascript
// BEFORE
floatingControls.className = "dependency-graph-floating-controls";
floatingControls.style.position = "absolute";
floatingControls.style.top = "20px";
floatingControls.style.right = "20px";
floatingControls.style.background = "rgba(255, 255, 255, 0.95)";
floatingControls.style.padding = "10px";
floatingControls.style.borderRadius = "5px";
floatingControls.style.boxShadow = "0 3px 6px rgba(0,0,0,0.2)";
floatingControls.style.zIndex = "9999";
floatingControls.style.display = "none"; // ✅ KEEP

// AFTER
floatingControls.className = "dependency-graph-floating-controls";
floatingControls.style.display = "none"; // ✅ KEEP - dynamic toggle
// All other styling in CSS
```

**Line 1400-1411** - Floating Info Panel:
```javascript
// BEFORE
floatingInfoPanel.className = "dependency-graph-floating-info";
floatingInfoPanel.style.position = "absolute";
floatingInfoPanel.style.top = "20px";
floatingInfoPanel.style.left = "20px";
floatingInfoPanel.style.background = "rgba(255, 255, 255, 0.98)";
floatingInfoPanel.style.padding = "15px";
floatingInfoPanel.style.borderRadius = "8px";
floatingInfoPanel.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
floatingInfoPanel.style.zIndex = "10000";
floatingInfoPanel.style.maxWidth = "350px";
floatingInfoPanel.style.display = "none"; // ✅ KEEP

// AFTER
floatingInfoPanel.className = "dependency-graph-floating-info";
floatingInfoPanel.style.display = "none"; // ✅ KEEP - dynamic toggle
// All other styling in CSS
```

**Line 1628-1647** - Legend:
```javascript
// BEFORE
legend.className = "dependency-graph-legend";
legend.style.display = "none"; // ✅ KEEP
legend.style.position = "absolute";
legend.style.bottom = "30px";
legend.style.right = "30px";
legend.style.background = "rgba(255, 255, 255, 0.9)";
legend.style.padding = "10px";
legend.style.borderRadius = "5px";
legend.style.maxWidth = "250px";
legend.style.zIndex = "100";
legend.style.fontSize = "12px";
legend.style.fontFamily = "sans-serif";
title.style.fontWeight = "bold";
title.style.marginBottom = "8px";
title.style.paddingBottom = "4px";

// AFTER
legend.className = "dependency-graph-legend";
legend.style.display = "none"; // ✅ KEEP - dynamic toggle
title.className = "dependency-graph-legend-title";
// All other styling in CSS
```

**Line 1652-1654** - Legend Items Container:
```javascript
// BEFORE
itemsContainer.style.display = "grid";
itemsContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
itemsContainer.style.gap = "8px";

// AFTER
itemsContainer.className = "dependency-graph-legend-items";
// All styling in CSS
```

**Line 1668-1683** - Legend Item:
```javascript
// BEFORE
item.style.display = "flex";
item.style.alignItems = "center";
colorBox.style.display = "inline-block";
colorBox.style.width = "12px";
colorBox.style.height = "12px";
colorBox.style.backgroundColor = color; // ✅ KEEP - dynamic color
colorBox.style.marginRight = "6px";
colorBox.style.borderRadius = "3px";
label.style.whiteSpace = "nowrap";
label.style.overflow = "hidden";
label.style.textOverflow = "ellipsis";

// AFTER
item.className = "dependency-graph-legend-item";
colorBox.className = "dependency-graph-legend-color-box";
colorBox.style.backgroundColor = color; // ✅ KEEP - dynamic color from data
label.className = "dependency-graph-legend-label";
// All other styling in CSS
```

**Line 1695-1700** - Architectural Title:
```javascript
// BEFORE
archTitle.style.fontWeight = "bold";
archTitle.style.marginTop = "12px";
archTitle.style.marginBottom = "8px";
archTitle.style.paddingBottom = "4px";
archTitle.style.borderTop = "1px solid #ccc";
archTitle.style.paddingTop = "8px";

// AFTER
archTitle.className = "dependency-graph-legend-arch-title";
// All styling in CSS
```

**Line 1724-1740** - Architectural Item:
```javascript
// BEFORE
itemDiv.style.display = "flex";
itemDiv.style.alignItems = "center";
itemDiv.style.marginBottom = "4px";
itemDiv.style.fontSize = "11px";
indicator.style.width = "16px";
indicator.style.height = "16px";
indicator.style.border = `3px solid ${item.color}`; // ✅ KEEP - dynamic color
indicator.style.borderRadius = "50%";
indicator.style.backgroundColor = "#f0f0f0";
indicator.style.marginRight = "8px";
indicator.style.flexShrink = "0";
label.style.fontWeight = "500";

// AFTER
itemDiv.className = "dependency-graph-legend-arch-item";
indicator.className = "dependency-graph-legend-arch-indicator";
indicator.style.border = `3px solid ${item.color}`; // ✅ KEEP - dynamic color from data
label.className = "dependency-graph-legend-arch-label";
// All other styling in CSS
```

---

## Implementation Steps

### Phase 1: Update styles.css
1. ✅ **Backup current styles.css**
2. ✅ **Replace lines 1169-1809** with consolidated CSS above
3. ✅ **Test in browser** - verify CSS loads correctly

### Phase 2: Update Dependency.js
1. ✅ **Backup current Dependency.js**
2. ✅ **Find all instances of `.style.`** (search for this pattern)
3. ✅ **For each inline style**:
   - If it's static (not changing at runtime) → Remove, rely on CSS
   - If it's `display: none/block` → Keep for dynamic toggling
   - If it's a dynamic color from data → Keep
   - Add appropriate className instead
4. ✅ **Add new CSS classes** to elements that don't have them

### Phase 3: Testing
1. ✅ **Test normal view** (non-fullscreen)
   - Controls display correctly
   - Info panel toggles correctly
   - Legend toggles correctly
2. ✅ **Test fullscreen view**
   - Floating controls appear in correct position
   - Floating info panel appears in correct position
   - Legend appears in lower right (not clipped)
3. ✅ **Test interactions**
   - Node clicks show info
   - Legend items render correctly
   - Architectural layers render correctly
4. ✅ **Test browser caching**
   - Changes take effect without hard refresh
   - CSS caching works as expected

### Phase 4: Documentation
1. ✅ **Update code comments** in Dependency.js explaining CSS approach
2. ✅ **Document any remaining inline styles** and why they're necessary
3. ✅ **Add this workplan to history folder** once complete

---

## Expected Benefits

1. **No more style conflicts** - CSS has single source of truth
2. **Easier maintenance** - Change CSS file, not JavaScript
3. **Better caching** - Browser caches CSS properly
4. **Cleaner code** - Dependency.js focused on logic, not styling
5. **Easier debugging** - Use browser DevTools to modify CSS in real-time
6. **Better separation of concerns** - Presentation (CSS) vs. Behavior (JS)

---

## Notes

- **Keep display toggles in JS**: `element.style.display = "block"/"none"` for showing/hiding
- **Keep dynamic colors in JS**: `colorBox.style.backgroundColor = color` when color comes from data
- **Keep computed positioning in JS**: Only if calculated at runtime (rare)
- **Everything else goes to CSS**: All static styles, layouts, typography, spacing

---

## Completion Checklist

- [ ] Phase 1: styles.css updated with consolidated CSS
- [ ] Phase 2: Dependency.js updated to remove inline styles
- [ ] Phase 3: All testing scenarios pass
- [ ] Phase 4: Documentation updated
- [ ] Commit changes to C-RF branch
- [ ] Test in multiple browsers (Chrome, Safari, Firefox)
- [ ] Move this workplan to history folder
