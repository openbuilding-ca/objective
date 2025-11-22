# TEUI 4.0 Localization Architecture v2

**Version**: 2.0 (FieldManager-Based)
**Date**: November 22, 2025
**Status**: Architecture Decision Document

---

## Executive Summary

This document outlines the **FieldManager-Based Localization Architecture** for TEUI 4.0 internationalization. This approach:

- **Localizes data structures** (FieldManager) - not rendering logic (Sections)
- **Shares ALL section files** (Section01-18) - zero duplication
- **Localizes only 4 dropdowns** - minimal surface area for country-specific code
- **Translates UI text** via lightweight JSON - no heavy i18n libraries
- **Maintains** Canadian version as primary codebase
- **Enables** partner-friendly localization without breaking core logic

---

## Problem Solved

### What We Abandoned: Dynamic Country Switching

**Previous Attempt** (reverted):
- Conditional logic scattered across Section02.js and Section03.js
- Runtime country detection via `LocalizationManager`
- Dynamic script loading causing race conditions
- State mixing: German labels + Canadian provinces in same dropdown
- Complex initialization sequences
- Performance overhead even for Canadian users

**Critical Issue**: Screenshot showed "Bundesland wählen" (German) but Canadian provinces (Alberta, BC) in dropdown - race condition between label loading and data initialization.

**Decision**: Revert to clean commit, pursue file separation instead.

---

## Solution: FieldManager-Based Localization

### Core Insight

> **Sections are rendering engines. FieldManager defines the data structure. Localize the structure, not the renderer.**

**Key Realization**: Only **4 dropdowns** across the entire app need country-specific options:

| Section | Field ID | What Changes | Example |
|---------|----------|--------------|---------|
| S02 | `d_12` | Building type | Somewhat universal, but varies enough by name should be localized, equipmt loads in S09 remapped based on more generic meta-naming |
| S02 | `d_13` | Reference standards | **NBC/OBC vs DIN/GEG** |
| S03 | `d_19` | Region/Province | **Ontario vs Berlin** |
| S03 | `h_19` | City | **Toronto vs Berlin** |

Optional (minor localization):
- **S07 `d_49`**: DHW method (NBC 9.36 vs DIN 18599)
- **S12 `d_108`**: Airtightness test (NBC ACH50 vs GEG n50)

**Everything else** (Section01, Section04-18) is universal physics/math that works identically globally.

---

## Architecture Overview

### File Structure

```
SHARED (All countries use identical files):
├── src/core/
│   ├── StateManager.js          ← Shared (no changes)
│   └── utilities/               ← Shared helpers
├── src/sections/
│   ├── Section01.js             ← SHARED
│   ├── Section02.js             ← SHARED
│   ├── Section03.js             ← SHARED
│   ├── Section04-18.js          ← ALL SHARED
│   └── ...

COUNTRY-SPECIFIC (Minimal duplication):
├── src/core/
│   ├── FieldManager.js          ← Canadian (default)
│   └── FieldManager-DE.js       ← German (~50 lines different)
│
├── src/core/
│   ├── ReferenceValues.js       ← Canadian standards data
│   └── ClimateValues.js         ← Canadian climate data
│
└── localizations/Germany/
    ├── FieldManager-DE.js       ← German field definitions
    ├── 4012-ReferenzWerten-DE.js   ← German standards data
    ├── KlimaWerten.js              ← German climate data
    └── index-de.html               ← Entry point

UI TRANSLATION (Lightweight - Phase 2):
├── localizations/Canada/
│   └── ui-labels-en.json        ← English UI strings
├── localizations/Germany/
│   └── ui-labels-de.json        ← German UI strings
└── src/core/i18n.js             ← Simple translation layer (~50 lines)
```

### What Gets Separated vs Shared

| Component | Status | Reason |
|-----------|--------|--------|
| **FieldManager** | ONE per country | Defines dropdown options & defaults |
| **Section01-18** | SHARED | Rendering logic is universal |
| **StateManager.js** | SHARED | Core application logic |
| **ReferenceValues** | DATA per country | Building codes differ by country |
| **ClimateValues** | DATA per country | Weather data differs by country |
| **UI Labels** | i18n per language | String translations only |

---

## How FieldManager Localization Works

### Current Structure (Canadian FieldManager.js)

```javascript
// src/core/FieldManager.js
const fields = {
  d_13: {
    fieldId: "d_13",
    type: "dropdown",
    value: "OBC SB10 5.5-6 Z6",  // Canadian default
    options: [
      { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10 Zone 6" },
      { value: "NBC 9.36", name: "NBC 9.36" },
      { value: "NECB 2020", name: "NECB 2020" },
      // ... Canadian standards
    ]
  },

  d_19: {
    fieldId: "d_19",
    type: "dropdown",
    value: "ON",  // Ontario default
    label: "Province",
    placeholder: "Select Province",
    options: []  // Populated from ClimateData
  },

  h_19: {
    fieldId: "h_19",
    type: "dropdown",
    value: "Toronto",
    label: "City",
    placeholder: "Select City",
    options: []  // Populated dynamically
  }
};
```

### German Version (FieldManager-DE.js)

```javascript
// localizations/Germany/FieldManager-DE.js
const fields = {
  d_13: {
    fieldId: "d_13",
    type: "dropdown",
    value: "DIN V 18599 Neubau",  // German default
    options: [
      { value: "DIN18599_Klimazone_1", name: "DIN 18599 Klimazone 1 (Küste)" },
      { value: "DIN18599_Klimazone_2", name: "DIN 18599 Klimazone 2 (Zentral)" },
      { value: "DIN18599_Klimazone_3", name: "DIN 18599 Klimazone 3 (Alpen)" },
      { value: "DIN V 18599 Neubau", name: "GEG Neubau (DIN 18599)" },
      { value: "PHI_DE", name: "Passivhaus Institut (PHI)" },
      // ... German standards ONLY
    ]
  },

  d_19: {
    fieldId: "d_19",
    type: "dropdown",
    value: "Berlin",  // German default
    label: "Bundesland",
    placeholder: "Bundesland wählen",
    options: []  // Populated from KlimaWerten.js
  },

  h_19: {
    fieldId: "h_19",
    type: "dropdown",
    value: "Berlin",
    label: "Stadt",
    placeholder: "Stadt wählen",
    options: []
  }
};
```

**Key Points**:
- Only ~50 lines change between FieldManager.js and FieldManager-DE.js
- Everything else (thousands of lines) identical
- No conditional logic - each file is pure
- Sections don't know/care which FieldManager loaded

---

## Implementation Phases

### Phase 0: Architecture Assessment & Preparation 🔍 CURRENT

**Goal**: Assess current FieldManager and Section file structure to determine if the existing architecture is ready for FieldManager-based localization, or if refactoring is needed first.

#### Current Architecture Analysis

**Question**: How do FieldManager vs Section files currently define dropdowns, options, calls, dependencies, labels, and defaults?

**Findings from [FieldManager.js](../src/core/FieldManager.js:1) and [Section02.js](../src/sections/Section02.js:1), [Section03.js](../src/sections/Section03.js:1)**:

##### 1. **Dropdown Definition Flow** (Current Architecture)

```
Section File (e.g., Section02.js)
    ↓
  Defines field configuration in sectionRows object
    ↓
  Field config includes: fieldId, type, dropdownId, value, options[], label
    ↓
FieldManager.js (Collector/Renderer)
    ↓
  Calls section.getFields() to collect all field configs
    ↓
  Stores in allFields registry (lines 41-43)
    ↓
  Calls section.getDropdownOptions() if available
    ↓
  Renders dropdowns using initializeDropdownsFromFields() (lines 1122-1204)
```

**Key Insight**: **Sections define the data structure**, FieldManager **collects and renders** it.

##### 2. **Where Dropdown Options Are Defined**

**Current Pattern** (Section02.js lines 50-80):
```javascript
// Section02.js - Row 12: d_12 Major Occupancy
cells: {
  d: {
    fieldId: "d_12",
    type: "dropdown",
    dropdownId: "dd_d_12",
    value: "A-Assembly",          // ← Default value
    section: "buildingInfo",
    tooltip: true,
    options: [                      // ← Options array IN SECTION
      { value: "A-Assembly", name: "A-Assembly" },
      { value: "B1-Detention", name: "B1-Detention" },
      { value: "B2-Care and Treatment", name: "B2-Care and Treatment" },
      // ... more options
    ]
  }
}
```

**Current Pattern** (Section02.js lines 117-150):
```javascript
// Section02.js - Row 13: d_13 Reference Standard
d: {
  fieldId: "d_13",
  type: "dropdown",
  dropdownId: "dd_d_13",
  value: "OBC SB10 5.5-6 Z6",     // ← Default value
  section: "buildingInfo",
  tooltip: true,
  options: [                       // ← HARDCODED Canadian standards
    { value: "OBC SB12 3.1.1.2.C4", name: "OBC SB12 3.1.1.2.C4" },
    { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10 5.5-6 Z6" },
    { value: "NBC T1", name: "NBC T1" },
    { value: "NECB T1 (Z6)", name: "NECB T1 (Z6)" },
    { value: "CaGBC ZCB", name: "CaGBC ZCB" },
    { value: "PH Classic", name: "PH Classic" },
    // ... Canadian-specific standards
  ]
}
```

**Critical Finding**: Options are **hardcoded in Section files**, NOT in FieldManager.

##### 3. **Dependencies** (How They Work)

**Current Pattern** (Section03.js - Province/City cascade):
```javascript
// Parent dropdown (Province)
d_19: {
  fieldId: "d_19",
  type: "dropdown",
  dropdownId: "dd_d_19",
  value: "ON",                    // Default province
  options: []                     // Populated from ClimateData
}

// Child dropdown (City) - depends on d_19
h_19: {
  fieldId: "h_19",
  type: "dropdown",
  dropdownId: "dd_h_19",
  value: "Alexandria",            // Default city
  dependencies: ["d_19"],         // ← Depends on province selection
  getOptions: function(province) { // ← Dynamic options based on parent
    return window.TEUI.ClimateData[province]
      ? Object.keys(window.TEUI.ClimateData[province])
      : [];
  }
}
```

**FieldManager.js handles dependencies** (lines 1210-1271):
- `updateDependentDropdowns(fieldId)` finds fields with `dependencies: [fieldId]`
- Calls field's `getOptions(parentValue)` to get new options
- Re-populates child dropdown when parent changes

**Finding**: Dependencies are **declared in Section files** (`dependencies: []`), **managed by FieldManager**.

##### 4. **Labels** (Static Text)

**Current Pattern**:
```javascript
// Section row labels (column C)
cells: {
  c: { label: "Reference Standard" }  // ← Row label
}

// Field labels (for tooltips/accessibility)
d: {
  fieldId: "d_13",
  label: "Reference Standard",         // ← Field label
  tooltip: true
}
```

**Finding**: Labels are **static strings in Section files**. For localization, these would need to be:
- Option A: Converted to i18n keys (`label: "section02.reference_standard"`)
- Option B: Overridden in FieldManager-XX.js with localized getters

##### 5. **Defaults** (Initial Values)

**Current Pattern**:
```javascript
d_13: {
  fieldId: "d_13",
  type: "dropdown",
  value: "OBC SB10 5.5-6 Z6",    // ← Hardcoded Canadian default
  options: [ /* Canadian options */ ]
}
```

**Finding**: Defaults are **hardcoded in Section files**, country-specific.

---

#### Gap Analysis: What Needs Refactoring?

| Component | Current State | Ideal for Localization | Refactor Needed? |
|-----------|---------------|------------------------|------------------|
| **Dropdown options** | Defined in Section files | Defined in FieldManager | ✅ **YES** |
| **Default values** | Hardcoded in Sections | Defined in FieldManager | ✅ **YES** |
| **Labels (row/field)** | Static strings in Sections | i18n keys or FieldManager getters | ⚠️ **MAYBE** |
| **Dependencies** | Declared in Sections, managed by FieldManager | Same (works as-is) | ❌ **NO** |
| **FieldManager role** | Collector/Renderer only | Data structure owner | ✅ **YES** |

---

#### Refactoring Strategy

##### Option 1: Move Dropdown Definitions to FieldManager (Recommended)

**Change**: Extract dropdown options and defaults from Section files into FieldManager.

**Before** (Section02.js):
```javascript
cells: {
  d: {
    fieldId: "d_13",
    type: "dropdown",
    dropdownId: "dd_d_13",
    value: "OBC SB10 5.5-6 Z6",        // ← Remove
    options: [                          // ← Remove
      { value: "OBC SB10", name: "..." },
      // ...
    ]
  }
}
```

**After** (Section02.js - becomes universal):
```javascript
cells: {
  d: {
    fieldId: "d_13",
    type: "dropdown",
    dropdownId: "dd_d_13"
    // No value, no options - fetched from FieldManager
  }
}
```

**After** (FieldManager.js - Canadian):
```javascript
TEUI.FieldManager = (function () {
  const fields = {
    d_13: {
      fieldId: "d_13",
      type: "dropdown",
      value: "OBC SB10 5.5-6 Z6",      // ← Canadian default
      options: [
        { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10 Zone 6" },
        { value: "NBC 9.36", name: "NBC 9.36" },
        // ... Canadian standards
      ]
    }
  };

  function getFieldsBySection(sectionId) {
    // Merge Section layout with FieldManager data
    const sectionFields = TEUI.SectionModules[sectionId].getFields();
    Object.keys(sectionFields).forEach(fieldId => {
      if (fields[fieldId]) {
        // Override with FieldManager data (country-specific)
        Object.assign(sectionFields[fieldId], fields[fieldId]);
      }
    });
    return sectionFields;
  }
});
```

**After** (FieldManager-DE.js - German):
```javascript
const fields = {
  d_13: {
    fieldId: "d_13",
    type: "dropdown",
    value: "DIN V 18599 Neubau",       // ← German default
    options: [
      { value: "DIN18599_Klimazone_1", name: "DIN 18599 Klimazone 1" },
      { value: "DIN V 18599 Neubau", name: "GEG Neubau" },
      // ... German standards
    ]
  }
};
```

**Benefits**:
- ✅ Sections become 100% shared (no country-specific data)
- ✅ FieldManager becomes single source of truth for data structure
- ✅ German version: just replace FieldManager, ALL sections work
- ✅ Clean separation: layout (Section) vs data (FieldManager)

**Drawbacks**:
- ⚠️ Requires refactoring all 4 dropdown definitions (d_12, d_13, d_19, h_19)
- ⚠️ Changes FieldManager from collector to data owner (architectural shift)
- ⚠️ Need to ensure backward compatibility during transition

##### Option 2: Use Dynamic Getters (Minimal Refactor)

**Change**: Keep options in Sections, but use getters that reference FieldManager.

**Section02.js**:
```javascript
d: {
  fieldId: "d_13",
  type: "dropdown",
  dropdownId: "dd_d_13",
  get value() {
    return TEUI.FieldManager.getFieldDefault?.("d_13") || "OBC SB10 5.5-6 Z6";
  },
  get options() {
    return TEUI.FieldManager.getFieldOptions?.("d_13") || [
      { value: "OBC SB10 5.5-6 Z6", name: "OBC SB10" },
      // ... fallback Canadian options
    ];
  }
}
```

**FieldManager.js** (Canadian):
```javascript
const fieldData = {
  d_13: {
    value: "OBC SB10 5.5-6 Z6",
    options: [ /* Canadian */ ]
  }
};

function getFieldDefault(fieldId) {
  return fieldData[fieldId]?.value;
}

function getFieldOptions(fieldId) {
  return fieldData[fieldId]?.options;
}
```

**Benefits**:
- ✅ Minimal Section file changes (just add getters)
- ✅ Backward compatible (fallbacks to hardcoded values)
- ✅ Easier to implement incrementally

**Drawbacks**:
- ⚠️ Sections still contain fallback data (not 100% shared)
- ⚠️ Getters execute on every access (tiny performance cost)

---

#### Recommended Approach: **Option 1 + Incremental Migration**

**Phase 0.1**: Implement FieldManager data override system
1. Add `fieldDefinitions` object to FieldManager.js
2. Add `getFieldsBySection()` override logic
3. Test with ONE field (d_13) first

**Phase 0.2**: Migrate critical fields
1. Move d_13 options to FieldManager (Reference Standards)
2. Move d_19/h_19 options to FieldManager (Province/City)
3. Test Canadian version (no regression)

**Phase 0.3**: Create FieldManager-DE.js
1. Copy FieldManager.js → FieldManager-DE.js
2. Replace only `fieldDefinitions` object (~50 lines)
3. Test German version

**Phase 0.4**: Clean up Section files
1. Remove hardcoded options from d_13, d_19, h_19
2. Keep layout definitions only
3. Verify all tests pass

---

#### Deliverables for Phase 0

- [ ] **Document current architecture** (this section) ✅
- [ ] **Prototype FieldManager data override** (proof of concept)
  - [ ] Add `fieldDefinitions` registry to FieldManager.js
  - [ ] Add override logic in `getFieldsBySection()`
  - [ ] Test with d_13 only (Canadian standards)
- [ ] **Test backwards compatibility**
  - [ ] Ensure existing fields still work
  - [ ] Verify dropdowns populate correctly
  - [ ] Check dependency cascade (d_19 → h_19)
- [ ] **Performance benchmark**
  - [ ] Measure initialization time before refactor
  - [ ] Measure after adding override system
  - [ ] Ensure <5ms overhead
- [ ] **Decision point**: Proceed with Option 1 or Option 2
  - [ ] Review prototype results
  - [ ] Assess migration effort vs benefits
  - [ ] Get user approval before proceeding

---

#### Success Criteria for Phase 0

✅ **Architecture documented** with clear understanding of current state
✅ **Prototype working** demonstrating FieldManager data override
✅ **No regressions** in existing functionality
✅ **Performance maintained** (<220ms initialization)
✅ **Path forward clear** with user approval on approach

---

### Phase 1: Create German FieldManager ⏳ NEXT

**Goal**: Create FieldManager-DE.js and test German version

#### 1.1 Copy and Modify FieldManager
- [ ] Copy `src/core/FieldManager.js` → `localizations/Germany/FieldManager-DE.js`
- [ ] Update `d_13` dropdown:
  - Change `value` to `"DIN V 18599 Neubau"`
  - Replace `options` array with German standards
- [ ] Update `d_19` dropdown:
  - Change `value` to `"Berlin"`
  - Change `label` to `"Bundesland"`
  - Change `placeholder` to `"Bundesland wählen"`
- [ ] Update `h_19` dropdown:
  - Change `value` to `"Berlin"`
  - Change `label` to `"Stadt"`
  - Change `placeholder` to `"Stadt wählen"`
- [ ] Optional: Update `d_49` (DHW method) if needed
- [ ] Optional: Update `d_108` (airtightness) if needed
- [ ] Verify all other fields remain unchanged

#### 1.2 Create German Entry Point
- [ ] Copy `index.html` → `localizations/Germany/index-de.html`
- [ ] Update script loading order:
  ```html
  <!-- German Data Files -->
  <script src="4012-ReferenzWerten-DE.js"></script>
  <script src="KlimaWerten.js"></script>

  <!-- German FieldManager -->
  <script src="FieldManager-DE.js"></script>

  <!-- Shared Core (no changes) -->
  <script src="../../src/core/StateManager.js"></script>
  <script src="../../src/core/CalculationEngine.js"></script>
  <!-- ... all other core files -->

  <!-- Shared Sections (ALL shared - no changes) -->
  <script src="../../src/sections/Section01.js"></script>
  <script src="../../src/sections/Section02.js"></script>
  <script src="../../src/sections/Section03.js"></script>
  <script src="../../src/sections/Section04-18.js"></script>
  <!-- ... -->
  ```
- [ ] Update header subtitle: "für deutsche Projekte"

#### 1.3 Test German Version
- [ ] Load `localizations/Germany/index-de.html`
- [ ] Verify d_13 shows German standards (DIN/GEG)
- [ ] Verify d_19 shows German Bundesländer (Berlin, Baden-Württemberg)
- [ ] Verify h_19 shows German cities
- [ ] Verify default values: "DIN V 18599 Neubau", "Berlin", "Berlin"
- [ ] Verify calculations work correctly
- [ ] Run Clock.js - verify <300ms initialization

#### 1.4 Test Canadian Version (No Regression)
- [ ] Load `index.html` (root)
- [ ] Verify d_13 shows Canadian standards (OBC/NBC)
- [ ] Verify d_19 shows Canadian provinces
- [ ] Verify defaults unchanged
- [ ] Verify 220ms baseline maintained

#### 1.5 Wire Country Selector
- [ ] Update country selector menu to navigate:
  ```javascript
  // Canadian index.html
  if (text.includes('Germany')) {
    window.location.href = '/de/';
  }

  // German index-de.html
  if (text.includes('Canada')) {
    window.location.href = '/';
  }
  ```

**Success Criteria**:
- ✅ German version loads with German data only
- ✅ Canadian version unchanged (zero regression)
- ✅ All 18 section files shared (no duplication)
- ✅ Only FieldManager differs between countries
- ✅ No conditional logic in any section
- ✅ Performance maintained (<220ms CA, <300ms DE)

---

### Phase 2: Add Lightweight i18n Layer 🔜 NEXT

**Goal**: Enable UI language switching for text labels

#### 2.1 Create i18n System
Create `src/core/i18n.js` (~50 lines):
```javascript
window.TEUI = window.TEUI || {};
window.TEUI.i18n = {
  currentLang: 'en',
  translations: {},

  async loadLanguage(lang) {
    const path = `localizations/${lang === 'de' ? 'Germany' : 'Canada'}/ui-labels-${lang}.json`;
    const response = await fetch(path);
    this.translations[lang] = await response.json();
    this.currentLang = lang;
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key; // Fallback to key
  },

  translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = this.t(el.dataset.i18n);
    });
  }
};
```

#### 2.2 Extract English Strings
Create `localizations/Canada/ui-labels-en.json`:
```json
{
  "header": {
    "title": "Simple Energy and Carbon Modelling",
    "subtitle": "for Canadian Projects"
  },
  "section01": {
    "title": "Project Information",
    "building_name": "Building Name"
  },
  "buttons": {
    "save": "Save",
    "reset": "Reset",
    "calculate": "Calculate"
  }
}
```

#### 2.3 Create German Translations
Create `localizations/Germany/ui-labels-de.json`:
```json
{
  "header": {
    "title": "Einfache Energie- und Kohlenstoffmodellierung",
    "subtitle": "für deutsche Projekte"
  },
  "section01": {
    "title": "Projektinformationen",
    "building_name": "Gebäudename"
  },
  "buttons": {
    "save": "Speichern",
    "reset": "Zurücksetzen",
    "calculate": "Berechnen"
  }
}
```

#### 2.4 Apply to Sections
Update Section01-18 to use translation keys where appropriate (field labels, section titles).

**Success Criteria**:
- ✅ English UI displays correctly
- ✅ German UI displays correctly
- ✅ <50 lines of i18n code
- ✅ <5ms performance overhead

---

### Phase 3: French Localization (Future) 📅

**Goal**: Add French market (same pattern)

- [ ] Create `localizations/France/FieldManager-FR.js`
- [ ] Modify only d_13, d_19, h_19 for French standards/regions
- [ ] Create French data files
- [ ] Create `ui-labels-fr.json`
- [ ] Create `index-fr.html`
- [ ] Test French version
- [ ] Deploy to `/fr/`

**Estimated Time**: <1 day (just copy FieldManager, modify ~50 lines)

---

## Update Flow (How Maintenance Works)

### Scenario 1: Bug Fix in Calculation Engine

**Example**: Fix error in Section07.js (DHW/SHW calculations)

```
1. Fix bug in src/sections/Section07.js
   ↓
2. Test in Canadian version
   ↓
3. Test in German version
   ↓
4. Both countries automatically benefit
   ✓ No FieldManager changes needed
   ✓ Fix applied once, works everywhere
```

### Scenario 2: Add New Standard to Dropdown

**Example**: Add "Passivhaus Classic" to standards

```
1. Update Canadian FieldManager.js
   ├─ Add to d_13 options array
   └─ Test Canadian version

2. Update German FieldManager-DE.js
   ├─ Add to d_13 options array (German name)
   └─ Test German version

✓ Parallel work - partners can do their own
✓ No conflict with shared sections
```

### Scenario 3: UI Text Change

**Example**: Rename "Building Name" to "Project Name"

```
1. Update ui-labels-en.json
   "building_name": "Project Name"

2. Update ui-labels-de.json
   "building_name": "Projektname"

✓ No code changes required
✓ Just edit JSON files
```

---

## Deployment Strategy

### Development URLs (Local)
```
http://localhost:8080/                              # Canadian
http://localhost:8080/localizations/Germany/index-de.html  # German
```

### Production URLs
```
https://teui.ca/                  # Canadian (root)
https://teui.ca/de/               # German
https://teui.ca/fr/               # French (future)
```

### Country Selector Behavior

Navigate to separate URLs (not localStorage switching):

```javascript
// In both index.html and index-de.html
countryDropdown.addEventListener('click', (e) => {
  const text = e.target.textContent;
  if (text.includes('Germany')) {
    window.location.href = '/de/';
  } else if (text.includes('Canada')) {
    window.location.href = '/';
  }
});
```

---

## Performance Targets

### Baseline (Must Maintain)
- ✅ **Canadian initialization**: 220ms (current)
- ✅ **Calculations**: <100ms per field change
- ✅ **Section rendering**: <50ms

### New Targets
- 🎯 **German initialization**: <250ms (22.8KB data vs Canada 858KB)
- 🎯 **i18n overhead**: <5ms
- 🎯 **French initialization**: <300ms

---

## File Naming Conventions

### Shared Files (No Suffix)
```
src/core/StateManager.js
src/sections/Section01.js
src/sections/Section02.js  ← Still shared!
src/sections/Section03.js  ← Still shared!
```

### Country-Specific Files
```
src/core/FieldManager.js          # Canadian (default)
localizations/Germany/FieldManager-DE.js
localizations/France/FieldManager-FR.js (future)
```

### Data Files
```
src/core/ReferenceValues.js                      # Canadian
src/core/ClimateValues.js                        # Canadian

localizations/Germany/4012-ReferenzWerten-DE.js  # German
localizations/Germany/KlimaWerten.js             # German
```

---

## Benefits of FieldManager Approach

### vs Section Duplication (Previous Plan)
- ✅ **18 section files** stay shared (vs 36 files for 2 countries)
- ✅ **Bug fix once**, works everywhere
- ✅ **Zero conditional logic** in sections
- ✅ **Minimal duplication**: ~50 lines vs ~10,000 lines

### vs Dynamic Switching (Reverted)
- ✅ **No race conditions**: FieldManager loaded before sections init
- ✅ **No state mixing**: Each country loads its own FieldManager
- ✅ **No conditional logic**: No `if (country === 'DE')`
- ✅ **Clean separation**: Data structure vs rendering

### Partner-Friendly
- ✅ Partners only edit FieldManager-XX.js
- ✅ Can't accidentally break shared sections
- ✅ Easy to add new dropdown options
- ✅ Clear where to make changes

---

## Current Status

### Completed ✅
- [x] German ReferenceValues file (4012-ReferenzWerten-DE.js)
- [x] German ClimateData file (KlimaWerten.js)
- [x] Country selector UI component (unwired)
- [x] Architecture decision documented
- [x] FieldManager-based approach designed

### In Progress ⏳
- [ ] Phase 1: Create FieldManager-DE.js
- [ ] Create index-de.html
- [ ] Test German version

### Next Steps 🔜
- [ ] Wire country selector menu
- [ ] Phase 2: Create i18n system
- [ ] Phase 3: French localization

---

## Success Metrics

### Must Have ✓
- Zero regression in Canadian version
- German version works without Canadian data
- No conditional logic anywhere
- All 18 sections shared
- Only FieldManager differs per country
- Performance maintained (<220ms CA, <300ms DE)

### Nice to Have ⭐
- Easy for partners (just edit FieldManager-XX.js)
- Simple maintenance (fix once, benefits all)
- Scalable (add France in <4 hours)
- Clean codebase (no "if country" checks)

---

## Migration Checklist

### Phase 1 Tasks
- [ ] Create FieldManager-DE.js (~50 lines different)
- [ ] Create index-de.html
- [ ] Test German version (isolation)
- [ ] Test Canadian version (no regression)
- [ ] Wire country selector menu
- [ ] Commit and document

### Phase 2 Tasks
- [ ] Create i18n.js (~50 lines)
- [ ] Extract ui-labels-en.json
- [ ] Create ui-labels-de.json
- [ ] Apply i18n to sections
- [ ] Test language switching
- [ ] Measure performance

---

**Document Version**: 2.0 (FieldManager-Based)
**Last Updated**: November 22, 2025
**Author**: Andrew Thomson with Claude Code
**Status**: Ready for Implementation
