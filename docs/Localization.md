# Localization Strategy & Implementation Plan

## Overview

This document outlines the comprehensive strategy for internationalizing the TEUI 4.0 application to support multiple countries, languages, and regional building standards. The initial implementation focuses on Germany (DE) as a pilot, with a scalable structure for future expansions.

## Guiding Principles

1. **Separation of Concerns**: Localization data is isolated from core application logic
2. **Scalability**: Structure supports easy addition of new countries/regions
3. **Minimal Code Changes**: Core application code remains language-agnostic
4. **Progressive Enhancement**: Features can be added incrementally without breaking existing functionality
5. **Developer Experience**: Clear organization makes it easy for international partners to contribute

---

## Architecture Components

### A. Directory Structure

```
localizations/
├── Germany/
│   ├── 4012-ReferenzWerten-DE.js    # Building standards data
│   ├── KlimaWerten.js                # Climate/weather data
│   ├── ui-labels-de.json             # UI text translations
│   ├── regions-de.json               # German states/regions
│   └── assets/
│       └── flag-de.svg               # Country flag icon
├── Canada/
│   ├── ReferenceValues.js            # Canadian standards (existing)
│   ├── ClimateValues.js              # Canadian climate data (existing)
│   ├── ui-labels-en.json             # English UI labels
│   ├── regions-en.json               # Canadian provinces
│   └── assets/
│       └── flag-ca.svg
└── [Future Countries]/
```

### B. Country-Level Weather/Climate Files

**Purpose**: Provide region-specific climate data for energy calculations

**Implementation**:
- Each country has a `KlimaWerten.js` (or equivalent) file
- Structure mirrors existing `ClimateValues.js` format
- Contains nested hierarchy: Country → Region/State → City
- All field IDs remain consistent across countries for calculation compatibility

**Example Structure** (Germany):
```javascript
window.TEUI.ClimateData = {
  "Baden-Württemberg": {
    Stuttgart: { /* climate data */ },
    Freiburg: { /* climate data */ }
  },
  Berlin: {
    Berlin: { /* climate data */ }
  }
}
```

**Status**: ✅ Completed for Germany (Stuttgart, Berlin)

---

### C. Country-Level Reference Values

**Purpose**: Define building code standards and requirements per country

**Implementation**:
- Each country has a reference values file (e.g., `4012-ReferenzWerten-DE.js`)
- Contains multiple standards within each country (e.g., DIN18599, GEG, PHI for Germany)
- Field IDs match the application's DOM structure
- Comments are in the local language for partner review
- Helper functions provide consistent API

**Example Standards** (Germany):
```javascript
TEUI.ReferenceValues = {
  "DIN18599_Klimazone_1": { /* standards */ },
  "DIN18599_Klimazone_2": { /* standards */ },
  "DIN18599_Klimazone_3": { /* standards */ },
  "DIN V 18599 Neubau": { /* standards */ },
  "DIN V 18599 Sanierung_Bestand": { /* standards */ },
  "PHI_DE": { /* standards */ }
}
```

**Status**: ✅ Completed for Germany with comprehensive German comments

---

### D. Index.html Module Loading Strategy

**Current State**: `index.html` loads core Canadian files:
```html
<script src="src/core/ReferenceValues.js"></script>
<script src="src/core/ClimateValues.js"></script>
```

**Proposed Strategy**: Dynamic loading based on selected country

**Option 1: Conditional Script Loading**
```html
<!-- Country detection/selection -->
<script src="src/core/LocalizationManager.js"></script>

<!-- Dynamically loaded based on country -->
<script id="reference-values-script"></script>
<script id="climate-values-script"></script>
```

**Option 2: Module Bundler Approach**
- Create a `LocalizationLoader.js` that imports appropriate modules
- Use ES6 dynamic imports: `import('./localizations/Germany/KlimaWerten.js')`

**Option 3: Country Configuration Object** (Recommended)
```javascript
// src/core/CountryConfig.js
window.TEUI.Countries = {
  CA: {
    name: "Canada",
    referenceValuesPath: "src/core/ReferenceValues.js",
    climateValuesPath: "src/core/ClimateValues.js",
    uiLabelsPath: "localizations/Canada/ui-labels-en.json",
    regionsPath: "localizations/Canada/regions-en.json",
    flagPath: "localizations/Canada/assets/flag-ca.svg",
    defaultLanguage: "en"
  },
  DE: {
    name: "Deutschland",
    referenceValuesPath: "localizations/Germany/4012-ReferenzWerten-DE.js",
    climateValuesPath: "localizations/Germany/KlimaWerten.js",
    uiLabelsPath: "localizations/Germany/ui-labels-de.json",
    regionsPath: "localizations/Germany/regions-de.json",
    flagPath: "localizations/Germany/assets/flag-de.svg",
    defaultLanguage: "de"
  }
}
```

**Status**: 🔲 To be implemented

---

### E. Country Selection UI

**Location**: Header/Navigation area of `index.html`

**Design**:
```html
<div id="country-selector" class="country-selector">
  <button class="country-flag-btn active" data-country="CA">
    <img src="localizations/Canada/assets/flag-ca.svg" alt="Canada" />
  </button>
  <button class="country-flag-btn" data-country="DE">
    <img src="localizations/Germany/assets/flag-de.svg" alt="Germany" />
  </button>
  <!-- Future countries -->
</div>
```

**Behavior**:
1. User clicks country flag
2. LocalizationManager loads appropriate files
3. Application reinitializes with new data
4. Selection persisted in localStorage
5. Page shows appropriate language/standards

**Integration with Section03.js**:
- Country selection triggers update of region/province dropdown
- City dropdown populates based on selected country's regions
- Existing dropdown logic remains, but data source changes

**Status**: 🔲 To be implemented

---

### F. UI Language Translation System

**Scope**:
- ✅ Labels, tooltips, help text
- ✅ Dropdown options (where appropriate)
- ✅ Error messages
- ✅ Button text
- ❌ Code/logic (remains English)
- ❌ Comments in ReferenceValues/ClimateValues (local language for partners)

**File Structure**: JSON-based translation files
```json
// localizations/Germany/ui-labels-de.json
{
  "nav": {
    "project": "Projekt",
    "envelope": "Gebäudehülle",
    "systems": "Systeme",
    "performance": "Leistung"
  },
  "section03": {
    "climate": {
      "title": "Klimastandort",
      "region_label": "Bundesland",
      "region_placeholder": "Bundesland auswählen...",
      "city_label": "Stadt",
      "city_placeholder": "Stadt auswählen...",
      "hdd_label": "Heizgradtage (HDD18)",
      "design_temp_label": "Auslegungstemperatur"
    }
  },
  "tooltips": {
    "hdd18": "Heizgradtage Basis 18°C für Heizlastberechnungen"
  },
  "buttons": {
    "save": "Speichern",
    "cancel": "Abbrechen",
    "reset": "Zurücksetzen"
  },
  "errors": {
    "required_field": "Dieses Feld ist erforderlich",
    "invalid_value": "Ungültiger Wert"
  }
}
```

**Implementation Approach**:

**Option 1: Simple Lookup Function**
```javascript
// src/core/i18n.js
const i18n = {
  currentLanguage: 'en',
  translations: {},

  async loadLanguage(lang) {
    const response = await fetch(`localizations/${lang}/ui-labels-${lang}.json`);
    this.translations[lang] = await response.json();
    this.currentLanguage = lang;
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLanguage];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  }
};

// Usage
document.getElementById('saveBtn').textContent = i18n.t('buttons.save');
```

**Option 2: Data Attributes** (Recommended for HTML-heavy sections)
```html
<label data-i18n="section03.climate.region_label">Region</label>
<button data-i18n="buttons.save">Save</button>

<script>
function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = i18n.t(el.dataset.i18n);
  });
}
</script>
```

**Status**: 🔲 To be implemented

---

### G. Region/Province and City Dropdown Integration

**Current Implementation** (Section03.js):
- Hardcoded Canadian provinces
- City dropdown populated from ClimateValues.js

**New Implementation**:

**1. Regions Configuration File**
```json
// localizations/Germany/regions-de.json
{
  "regions": [
    {
      "id": "BW",
      "name": "Baden-Württemberg",
      "cities": ["Stuttgart", "Freiburg", "Heidelberg"]
    },
    {
      "id": "BY",
      "name": "Bayern",
      "cities": ["München", "Nürnberg", "Augsburg"]
    },
    {
      "id": "BE",
      "name": "Berlin",
      "cities": ["Berlin"]
    }
  ]
}
```

**2. Updated Section03.js Logic**
```javascript
class ClimateSelector {
  constructor() {
    this.currentCountry = 'CA';
    this.regions = [];
  }

  async loadCountryData(countryCode) {
    this.currentCountry = countryCode;
    const config = window.TEUI.Countries[countryCode];

    // Load regions
    const response = await fetch(config.regionsPath);
    this.regions = await response.json();

    // Rebuild region dropdown
    this.populateRegionDropdown();
  }

  populateRegionDropdown() {
    const regionSelect = document.getElementById('region-select');
    regionSelect.innerHTML = '<option value="">Select Region...</option>';

    this.regions.regions.forEach(region => {
      const option = document.createElement('option');
      option.value = region.id;
      option.textContent = region.name;
      regionSelect.appendChild(option);
    });
  }

  populateCityDropdown(regionId) {
    const region = this.regions.regions.find(r => r.id === regionId);
    const citySelect = document.getElementById('city-select');
    citySelect.innerHTML = '<option value="">Select City...</option>';

    if (region) {
      region.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    }
  }

  getClimateData(regionName, cityName) {
    // Access the currently loaded climate data
    return window.TEUI.ClimateData[regionName]?.[cityName];
  }
}
```

**Benefits**:
- Existing Section03.js dropdown logic mostly preserved
- Data source becomes dynamic based on country
- Easy to add new countries by adding region configuration files

**Status**: 🔲 To be implemented

---

## Implementation Phases

### Phase 1: Foundation (Germany Pilot) ✅ COMPLETED
- [x] Create localization folder structure
- [x] Develop Germany reference values with German comments
- [x] Create German climate data file (Stuttgart, Berlin)
- [x] Establish file naming conventions
- [x] Document structure in this workplan

### Phase 2: Core Infrastructure 🔄 IN PROGRESS
**Priority**: High
**Timeline**: 2-3 weeks

Breaking this into two sub-phases for clarity:

#### Phase 2a: Country Switching Infrastructure (Current Sprint)
**Goal**: Enable functional country switching between Canada and Germany

**Status**: ✅ CORE FUNCTIONALITY COMPLETE - 🐛 BUGS IDENTIFIED

- [x] Create country flag dropdown UI component in index.html
- [x] Create `src/core/CountryConfig.js`
  - [x] Define CA country configuration object
  - [x] Define DE country configuration object
  - [x] Add helper functions (getCountry, getAllCountries, etc.)
- [x] Create `src/core/LocalizationManager.js`
  - [x] Initialize with default country (CA)
  - [x] Implement getCurrentCountry() function
  - [x] Implement setCountry(countryCode) function
  - [x] Build dynamic script loading for ReferenceValues
  - [x] Build dynamic script loading for ClimateValues
  - [x] Add localStorage persistence for country selection
  - [x] Add error handling for failed script loads
  - [x] Implement country switching with state reset
- [x] Wire country dropdown to LocalizationManager
  - [x] Add click handlers to dropdown items
  - [x] Update button text/flag when country changes
  - [x] Show loading state during switch
  - [x] Handle errors gracefully with user feedback
- [x] Update index.html script loading
  - [x] Load CountryConfig.js before other core files
  - [x] Load LocalizationManager.js after CountryConfig
  - [x] Initialize LocalizationManager on DOMContentLoaded
  - [x] Remove hardcoded ReferenceValues.js script tag
  - [x] Remove hardcoded ClimateValues.js script tag
  - [x] Implement dynamic loader using document.write()
- [x] Test country switching functionality
  - [x] Test CA → DE switch - ✅ WORKS
  - [x] Test DE → CA switch - ✅ WORKS
  - [x] Verify ReferenceValues loaded correctly - ✅ VERIFIED
  - [x] Verify ClimateValues loaded correctly - ✅ VERIFIED
  - [x] Verify state persists across page refresh - ✅ WORKS

**Bugs Resolved**:
- ✅ **Infinite spinner on country switch**: Fixed by removing hardcoded script tags and implementing dynamic loader
- ✅ **German data not loading**: Fixed by dynamic document.write() loader reading from localStorage
- ✅ **Page reload loop**: Resolved by proper script loading sequence

**Known Issues & Performance Problems**:
1. ⚡ **Initialization Speed Issue** (RESOLVED - Root Cause Identified)
   - **Observed**: 500ms+ initialization time with localization system
   - **Root Cause**: NOT the localization system - Canadian ClimateValues.js is 827KB (vs Germany 6.8KB)
   - **Analysis**:
     - Canada: ReferenceValues.js (31KB) + ClimateValues.js (827KB) = 858KB
     - Germany: ReferenzWerten-DE.js (16KB) + KlimaWerten.js (6.8KB) = 22.8KB
     - Germany loads **40x faster** than Canada due to smaller data files
   - **Fix Applied**: Optimized loader to minimal 8-line IIFE (lines 71-83 in index.html)
   - **Real Issue**: Canadian ClimateValues.js needs optimization (out of scope for Phase 2a)
   - **Status**: ✅ Localization system optimized; Canadian data file size is separate issue
   - **Priority**: LOW for localization system; MEDIUM for Canadian data optimization (future work)

2. ✅ **Section 03 Dropdown Labels Localized** (RESOLVED)
   - **Issue**: Province/City dropdown labels showed "Province" and "City" instead of German equivalents
   - **Expected**: When DE selected, should show "Bundesland" and "Stadt"
   - **Fix Applied**:
     - Added `getLocalizedLabels()` helper function in Section03.js (lines 20-40)
     - Converts static strings to dynamic getters based on country
     - Germany: "Bundesland" / "Stadt" / "Bundesland wählen" / "Stadt wählen"
     - Canada: "Province" / "City" / "Select Province" / "Select City"
     - Updated row 19 cell definitions to use getters (lines 726-763)
     - Updated `updateCityDropdown()` to use localized placeholder (line 1305)
   - **Status**: ✅ RESOLVED - Lightweight localization without full i18n system
   - **Note**: This is "Germany/English" mode - German region/city names with English UI elsewhere

3. ✅ **Performance Optimization - Lazy Loading** (IMPLEMENTED)
   - **Issue**: Loading localization system scripts on every page load for 99% Canada users
   - **Optimization Applied**:
     - CountryConfig.js and LocalizationManager.js now lazy-loaded only when non-CA country selected
     - Canada users: Zero localization overhead (static script paths)
     - Germany users: Minimal overhead (2 small scripts loaded conditionally)
   - **Implementation**: index.html lines 67-97
   - **Result**: Canada page load performance restored to original speed

4. ✅ **Section 03 Dropdown Pollution Fixed** (RESOLVED)
   - **Issue**: Helper functions (getAllRegions, getClimateData, etc.) appearing as region options
   - **Root Cause**: Functions attached to ClimateData object were enumerable
   - **Fix**: Used Object.defineProperty with enumerable:false for all helper functions
   - **File**: localizations/Germany/KlimaWerten.js lines 138-161
   - **Result**: Only actual regions (Baden-Württemberg, Berlin) appear in dropdown

5. ✅ **Section 02 Reference Standards Localized** (IMPLEMENTED)
   - **Issue**: German users saw Canadian building codes (OBC, NBC) instead of German standards
   - **Expected**: When DE selected, show DIN 18599, GEG, PHI standards
   - **Implementation**:
     - Added `getReferenceStandardOptions()` helper in Section02.js (lines 17-54)
     - Dynamic options based on country:
       - **Germany**: DIN 18599 Klimazonen 1-3, GEG Neubau/Sanierung, PHI, Passivhaus standards
       - **Canada**: OBC, NBC, NECB, CaGBC, Passivhaus standards
     - Default value changes: DE = "DIN V 18599 Neubau", CA = "OBC SB10 5.5-6 Z6"
   - **Status**: ✅ COMPLETE - German standards properly displayed

**Testing Results**:
- ✅ Section 03 dropdown pollution: FIXED (only Baden-Württemberg, Berlin appear)
- ✅ Reference Standards dropdown: WORKS (German standards appear correctly)
- ✅ Province/City labels: WORKS ("Bundesland"/"Stadt" in German)
- ⚠️ **CRITICAL PERFORMANCE REGRESSION IDENTIFIED**:
  - Load time: 750ms-1s (was 200ms before localization)
  - Palpable lag between UI interactions
  - Root cause: `document.write()` blocking + multiple conditional script loads
  - **Impact**: Will worsen as we add more translations/features
- 🐛 **Default value blank for d_13 on fresh Germany load** (see screenshot)

**Optimizations Summary**:
- ✅ Lazy-loaded localization system (99% Canada users see zero overhead)
- ✅ Fixed dropdown pollution (non-enumerable helper functions)
- ✅ Localized Reference Standards dropdown (d_13)
- ✅ Localized Province/City labels (Section 03)
- ⚠️ Simplified country switcher (works but causes performance regression)

**CRITICAL: Performance Regression Fix** ✅ RESOLVED:
- [x] **REVERT index.html to last known good commit** (before localization script loading changes)
- [x] **Re-architect loading strategy**:
  - ✅ Implemented ultra-minimal inline loaders (1 line each)
  - ✅ Minified country detector to single-line IIFE
  - ✅ Lazy-load localization system only for DE users
  - ✅ Country switcher uses direct localStorage (no dependencies)
  - ✅ Zero overhead for 99% Canada users
- [x] **Measure performance** after fixes: ✅ **220ms initialization time restored** (Clock.js verified)
- [ ] **Fix d_13 default value** - ensure it initializes properly on Germany fresh load

**Performance Verification** (Clock.js):
- ✅ Canada/English: **220ms** initialization (baseline maintained)
- ⚠️ Germany/English: **Needs measurement** (expected <300ms with 22.8KB data files)
- 🎯 Target for all calculations: **<100ms** per change (intermittent calculations)

---

## Architecture for Future Development

### Core Architectural Principles

#### 1. Meta-Level vs Model-Level Separation

**CRITICAL DISTINCTION** (Updated Nov 21, 2025):

**Meta-Level** (Global, above Reference/Target):
- ✅ **Country selection ONLY** (CA, DE, etc.) - Constrains which climate data is available
- Unit system preferences (future)
- Currency settings (future)

**Model-Level** (Dual-State, Reference vs Target):
- ✅ **Location selection** (Province/City for Target, separate Province/City for Reference)
- Building geometry (areas, volumes)
- Building components (walls, windows, HVAC)
- Performance targets
- Calculated results

**Key Architectural Rule**:
- **Country is meta-level**: Both Target and Reference MUST use locations from the SAME country
- **Location is model-level**: Target and Reference CAN use DIFFERENT locations within that country

**Why This Matters**:
1. **Country consistency**: Cannot compare Canadian building vs German building (different codes, standards, regulations)
2. **Location flexibility**: CAN compare "my building in Halifax" vs "code-compliant building in Toronto" (both in Canadian context)
3. **Performance**: Location dropdowns shouldn't re-render when toggling Reference/Target view (but currently do - this is the bug)

**Valid Examples**:
```
✅ Meta-Level: Country = Canada
├── Target Model: Nova Scotia/Halifax climate data
└── Reference Model: Ontario/Toronto climate data
Both using Canadian building standards in different Canadian climates

✅ Meta-Level: Country = Germany
├── Target Model: Berlin/Berlin climate data
└── Reference Model: Baden-Württemberg/Stuttgart climate data
Both using German building standards in different German climates
```

**Invalid Examples**:
```
❌ Mixed Countries (IMPOSSIBLE with correct architecture):
├── Target Model: Nova Scotia/Halifax (Canada)
└── Reference Model: Berlin/Berlin (Germany)
Cannot compare across different regulatory/climate frameworks
```

#### 2. Performance-First Development

**CRITICAL**: The application must remain fast and responsive for the 99% use case (Canada/English). All localization features must be implemented with zero overhead for default users.

**Performance Targets** (enforced via Clock.js monitoring):
- ✅ **Initialization**: ~220ms (baseline, must never exceed 300ms)
- ✅ **Calculations**: <100ms per change (intermittent recalculations)
- ✅ **Country Switching**: <1000ms (acceptable with load indicator)

**Testing Protocol**:
- Always run Clock.js after any change
- Compare initialization time against 220ms baseline
- Monitor calculation times during field changes
- Regression beyond 10% requires investigation and fix

### Ultra-Light Loading Architecture

**Current Implementation** (GOLD STANDARD):
```html
<!-- Country Data Files - Ultra-light conditional loading -->
<script id="country-loader">
  (function(){try{var c=localStorage.getItem('TEUI_SELECTED_COUNTRY');if(c==='DE'){document.write('<script src="localizations/Germany/4012-ReferenzWerten-DE.js"><\/script><script src="localizations/Germany/KlimaWerten.js"><\/script>');return}}catch(e){}document.write('<script src="src/core/ReferenceValues.js"><\/script><script src="src/core/ClimateValues.js"><\/script>')})();
</script>

<!-- Localization System (lazy-loaded after data) -->
<script id="localization-loader">
  (function(){try{if(localStorage.getItem('TEUI_SELECTED_COUNTRY')==='DE'){document.write('<script src="src/core/CountryConfig.js"><\/script><script src="src/core/LocalizationManager.js"><\/script>')}}catch(e){}})();
</script>
```

**Why This Works**:
1. **Single localStorage read** - Minimal overhead (1-2ms)
2. **Inline IIFE** - No function definition overhead, executes immediately
3. **Minified** - No whitespace, minimal characters
4. **Fail-safe** - try-catch prevents localStorage errors from breaking app
5. **Conditional script injection** - Only loads what's needed
6. **Zero overhead for CA** - Canada users never execute localization code

**Rules for Adding Countries**:
- Add conditional branches to country-loader script (e.g., `if(c==='FR')` for France)
- Keep inline loaders minified (use online minifier)
- Each country adds ~10-15ms overhead ONLY for users of that country
- Canada users always get 220ms baseline (no additional code execution)

### Localization Without i18n Overhead

**Current Approach** (MAINTAIN THIS):
- No translation libraries
- No JSON parsing overhead
- No translation key lookups
- Use JavaScript getters for dynamic values
- Use helper functions that return appropriate data structure

**Example Pattern** (Section02.js):
```javascript
function getReferenceStandardOptions() {
  const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';

  if (country === 'DE') {
    return [ /* German standards */ ];
  }

  return [ /* Canadian standards */ ]; // Default
}

// Use in field definition
{
  get options() {
    return getReferenceStandardOptions();
  }
}
```

**Why This Works**:
- Function only executes when dropdown is accessed
- No overhead during initialization
- Clean separation of country-specific data
- Easy to add new countries (add new if block)

**Rules for Adding Localized Content**:
1. Create helper function that returns country-specific structure
2. Use dynamic getter (`get options()`) in field definition
3. Always provide CA default as fallback
4. Keep helper functions small and focused
5. Use optional chaining (`?.`) for safety

### Dropdown Pollution Prevention

**Problem**: Helper functions appear as options in dropdowns when attached to data objects.

**Solution**: Use Object.defineProperty with enumerable:false

**Example** (KlimaWerten.js):
```javascript
Object.defineProperty(window.TEUI.ClimateData, 'getClimateData', {
  value: getClimateData,
  enumerable: false,   // ← KEY: Prevents Object.keys() from seeing it
  writable: false,
  configurable: false
});
```

**Rules**:
- ALL helper functions must be non-enumerable
- Apply to any object used for dropdown population
- Verify dropdowns only show data entries (not functions)

### Country Switcher Pattern

**Current Implementation** (index.html lines 1455-1488):
```javascript
// Ultra-light localStorage-based switcher
const countryDropdown = document.querySelector('.btn-group .dropdown-menu');
const countryButton = document.querySelector('.btn-group button[data-bs-toggle="dropdown"]')?.previousElementSibling;

if (countryDropdown && countryButton) {
  countryDropdown.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      const text = this.textContent.trim();
      let code = text.includes('Germany') || text.includes('Deutschland') ? 'DE' : 'CA';

      if (code) {
        countryButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Loading...';
        countryButton.disabled = true;
        try {
          localStorage.setItem('TEUI_SELECTED_COUNTRY', code);
          setTimeout(() => window.location.reload(), 100);
        } catch (e) {
          alert('Error switching country: ' + e.message);
          countryButton.disabled = false;
        }
      }
    });
  });

  // Set initial button state
  try {
    const saved = localStorage.getItem('TEUI_SELECTED_COUNTRY');
    countryButton.innerHTML = saved === 'DE' ? '🇩🇪 Germany' : '🇨🇦 Canada';
  } catch (e) {
    countryButton.innerHTML = '🇨🇦 Canada';
  }
}
```

**Why This Works**:
- No dependency on LocalizationManager
- Simple text matching for country detection
- Immediate visual feedback (spinner)
- Page reload ensures clean state
- Fail-safe error handling

**Rules for Adding Countries**:
1. Add new country option to HTML dropdown
2. Add detection logic to text matching (`text.includes('France')`)
3. Add country code mapping (`code = 'FR'`)
4. Add button state update with flag emoji
5. Keep logic simple - avoid complex string parsing

### Outstanding Issues & Solutions

#### Issue 1: CRITICAL - Location Dropdowns Re-Render on Reference/Target Toggle 🚨

**Discovery** (Nov 21, 2025): Province/City dropdowns (d_19, h_19) are within Section03, which switches between Reference and Target models. This causes:
- ⚠️ **Performance lag**: Dropdowns re-render every time user toggles Reference/Target view
- ⚠️ **User experience**: Visible flicker/re-layout when toggling views
- ⚠️ **Architectural issue**: Location selection is model-level (correct) but shouldn't trigger re-render on view toggle

**Correct Architecture** (CONFIRMED):
```
Meta-Level:
└── Country Selection (CA or DE) - Constrains available climate data

Model-Level (Dual-State):
├── Target Model: d_19/h_19 (Province/City) + climate values
└── Reference Model: d_19_r/h_19_r (Province/City) + climate values

VALID: Target=Halifax, Reference=Toronto (both Canada)
VALID: Target=Berlin, Reference=Stuttgart (both Germany)
INVALID: Target=Halifax (CA), Reference=Berlin (DE) ← Country mismatch
```

**Current Problem**:
Section03 dual-state system re-renders ALL fields (including dropdowns) when toggling Reference/Target. The d_19/h_19 dropdowns should:
1. ✅ Remain model-level (separate for Target vs Reference)
2. ❌ NOT re-render when toggling view (current behavior - BUG)
3. ✅ Only update when user explicitly changes location in current model

**Root Cause**:
- ReferenceToggle.js calls `ModeManager.switchMode()` which triggers full section re-render
- Section03 re-renders ALL dropdowns including d_19/h_19
- This is unnecessary - location dropdowns should be persistent in DOM, only swap values

**Proposed Solution** (Implementation for Nov 22, 2025):

**Option A: Optimize Section03 ModeManager** (Preferred - minimal changes)
```javascript
// In Section03.js ModeManager
switchMode(mode) {
  this.currentMode = mode;

  // NEW: Update field VALUES without re-rendering dropdowns
  this.updateFieldValues(mode);

  // OLD: Full re-render (causes flicker)
  // this.renderSection();
}

updateFieldValues(mode) {
  const suffix = mode === 'reference' ? '_r' : '';

  // Update location dropdown selections (no DOM rebuild)
  const regionDropdown = document.getElementById('dd_d_19' + suffix);
  const cityDropdown = document.getElementById('dd_h_19' + suffix);

  if (regionDropdown) regionDropdown.value = this.data['d_19' + suffix].value;
  if (cityDropdown) cityDropdown.value = this.data['h_19' + suffix].value;

  // Update climate VALUE fields (d_20, d_21, etc.)
  this.updateCalculatedDisplayValues();
}
```

**Option B: Extract Location to Persistent Component** (More invasive)
- Move d_19/h_19 dropdowns OUTSIDE Section03's dual-state rendering
- Keep them in Section03 visually, but manage separately
- Similar to how Reference/Target toggle button doesn't re-render

**Implementation Steps** (Tomorrow):

1. **Profile current performance** (5 min)
   - Open app, toggle Reference/Target 10 times
   - Record Clock.js times for each toggle
   - Identify which renders are slow

2. **Implement Option A** (30 min)
   - Modify Section03.js `ModeManager.switchMode()`
   - Separate value updates from DOM re-rendering
   - Test that location dropdowns don't flicker

3. **Test performance** (10 min)
   - Toggle Reference/Target 10 times
   - Verify <50ms per toggle (target)
   - Verify dropdowns don't flicker
   - Verify values update correctly

4. **Test functionality** (15 min)
   - Change Target location, toggle to Reference, verify Target location persists
   - Change Reference location, toggle to Target, verify Reference location persists
   - Verify climate values update correctly for each location
   - Test Canada AND Germany

**Success Criteria**:
- ✅ Reference/Target toggle: <50ms (currently ~200-500ms with re-render)
- ✅ No visible dropdown flicker when toggling
- ✅ Location values persist correctly for each model
- ✅ Climate data populates correctly from selected locations
- ✅ Works in both CA and DE countries

**Benefits**:
- 4-10x performance improvement for view toggle
- Cleaner user experience (no flicker)
- Maintains correct architecture (location remains model-level)
- Foundation for future dual-state optimizations

#### Issue 2: d_13 Default Value Blank on Fresh Germany Load ⚠️

**Symptoms**:
- Reference Standards dropdown shows blank when Germany loaded fresh
- Value should default to "DIN V 18599 Neubau"
- Works after manual selection

**Root Cause** (hypothesis):
- Dynamic getter may not execute during initial render
- LocalizationManager may not be available when Section02 initializes
- Timing issue between script loading and field initialization

**Proposed Fix**:
```javascript
// In Section02.js field definition
d: {
  fieldId: "d_13",
  type: "dropdown",
  dropdownId: "dd_d_13",
  get value() {
    const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';
    const defaultValue = country === 'DE' ? 'DIN V 18599 Neubau' : 'OBC SB10 5.5-6 Z6';

    // Check if value already set in field
    const field = document.getElementById('d_13');
    if (field && field.value) {
      return field.value;
    }

    return defaultValue;
  },
  section: "buildingInfo",
  tooltip: true,
  get options() {
    return getReferenceStandardOptions();
  },
},
```

**Alternative Fix**: Add explicit initialization in Section02.js initialization code:
```javascript
// After dropdown is populated
const dropdown = document.getElementById('dd_d_13');
if (dropdown && !dropdown.value) {
  const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';
  dropdown.value = country === 'DE' ? 'DIN V 18599 Neubau' : 'OBC SB10 5.5-6 Z6';
  dropdown.dispatchEvent(new Event('change', { bubbles: true }));
}
```

**Testing Protocol**:
1. Clear localStorage
2. Set localStorage: `localStorage.setItem('TEUI_SELECTED_COUNTRY', 'DE')`
3. Hard reload page (Cmd+Shift+R)
4. Check d_13 dropdown shows "DIN V 18599 Neubau"
5. Verify Clock.js shows <100ms for field initialization

#### Issue 3: CRITICAL - State Mixing Between Countries 🚨🚨🚨

**Discovery** (Nov 21, 2025 - Evening): Screenshot shows "Bundesland wählen" (German label) but Canadian provinces (Alberta, British Columbia, etc.) in dropdown options.

**Root Cause**: Race condition in script loading sequence
- German labels load via `getLocalizedLabels()` helper
- Canadian ClimateData still active in `window.TEUI.ClimateData`
- Section03 initializes before German ClimateData fully overwrites Canadian data

**Architectural Problem**: Attempting to serve both countries from single codebase creates timing dependencies and state contamination risks.

**Decision**: Pause and revert localization integration. Will pursue **File Separation Architecture** instead.

---

## ARCHITECTURAL DECISION: File Separation Strategy (Nov 21, 2025)

### The Problem

**Attempted Approach**: Dynamic country switching using:
- Conditional script loading (`document.write` based on localStorage)
- Single Section02.js and Section03.js files with country-aware helpers
- Runtime detection of country to populate dropdowns/defaults

**Issues Encountered**:
1. ⚠️ **State Mixing**: German labels + Canadian data in screenshot
2. ⚠️ **Race Conditions**: Script load order not deterministic
3. ⚠️ **Complexity**: Country detection scattered across multiple files
4. ⚠️ **Fragility**: Single point of failure in initialization sequence
5. ⚠️ **Maintenance**: Complex conditional logic in every section file

### The Solution: Parallel Section Files

**New Architecture**: Complete file separation per country

```
src/sections/
├── Section01.js          # Canadian (default)
├── Section02.js          # Canadian
├── Section03.js          # Canadian
├── ...
└── /de/                  # German market (future)
    ├── Sektion01.js
    ├── Sektion02.js
    ├── Sektion03.js
    └── ...
```

**Benefits**:
- ✅ **Zero state mixing**: Each file has hardcoded country-specific defaults
- ✅ **No race conditions**: No dynamic script loading during initialization
- ✅ **Simple maintenance**: Edit German file for German changes, Canadian for Canadian
- ✅ **Performance**: No runtime country detection overhead
- ✅ **Clarity**: No conditional logic - each file is pure
- ✅ **Scalability**: Add new countries by copying `/de/` to `/fr/`, `/uk/`, etc.

### Implementation Plan

**Phase 1: Create German Section Files**
1. Copy Section02.js → localizations/Germany/Sektion02.js
2. Copy Section03.js → localizations/Germany/Sektion03.js
3. Hardcode German defaults in Sektion files:
   - `d_19` default: `"Berlin"` (not `"ON"`)
   - `h_19` default: `"Berlin"` (not `"Alexandria"`)
   - Labels: "Bundesland", "Stadt" (not dynamic getters)
   - Reference standards: Only German options

**Phase 2: Create German index.html**
1. Copy index.html → localizations/Germany/index-de.html
2. Update script paths:
   ```html
   <script src="../../src/core/ReferenceValues.js"></script>  <!-- Remove -->
   <script src="../../src/core/ClimateValues.js"></script>    <!-- Remove -->

   <script src="4012-ReferenzWerten-DE.js"></script>          <!-- Add -->
   <script src="KlimaWerten.js"></script>                      <!-- Add -->

   <script src="../../src/sections/Section01.js"></script>    <!-- Remove -->
   <script src="../../src/sections/Section02.js"></script>    <!-- Remove -->
   <script src="../../src/sections/Section03.js"></script>    <!-- Remove -->

   <script src="Sektion01.js"></script>                       <!-- Add -->
   <script src="Sektion02.js"></script>                       <!-- Add -->
   <script src="Sektion03.js"></script>                       <!-- Add -->
   ```

**Phase 3: Clean Canadian Files**
1. Remove all country-aware helpers from Section02.js
2. Remove all country-aware helpers from Section03.js
3. Remove LocalizationManager.js (not needed)
4. Remove CountryConfig.js (not needed)
5. Hardcode Canadian defaults (already done)

**Phase 4: Deployment Strategy**
```
Production URLs:
- https://teui.ca/                    → Canadian version (index.html)
- https://teui.ca/de/                 → German version (index-de.html)
- https://teui.ca/fr/                 → French version (future)
```

### Transition Steps (Immediate Actions)

1. ✅ **Document current state** (this section)
2. ✅ **Commit current work**: "Docs: Document state mixing issue and file separation architecture decision"
3. 🔄 **Revert to stable commit**: Before LocalizationManager/CountryConfig were created
4. 🔄 **Retrieve documentation**: Pull Localization.md from commit we just made
5. 🔄 **Create Sektion02.js**: Copy Section02.js, rename, hardcode German defaults
6. 🔄 **Create Sektion03.js**: Copy Section03.js, rename, hardcode German defaults
7. 🔄 **Test German version**: Verify in isolation (no Canadian code loaded)
8. 🔄 **Test Canadian version**: Verify unchanged from before localization work

### Why This Is Better

**Before** (Dynamic Switching):
```javascript
// Section03.js - Complex conditional logic everywhere
function getLocalizedLabels() {
  const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';
  if (country === 'DE') {
    return { regionLabel: 'Bundesland', ... };
  }
  return { regionLabel: 'Province', ... };
}

d_19: {
  get value() {
    const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';
    return country === 'DE' ? 'Berlin' : 'ON';
  }
}
```

**After** (File Separation):
```javascript
// Sektion03.js - Clean, simple, German-only
const labels = { regionLabel: 'Bundesland', cityLabel: 'Stadt' };

d_19: {
  value: 'Berlin',  // Hardcoded German default
  options: [
    { value: 'Baden-Württemberg', name: 'Baden-Württemberg' },
    { value: 'Berlin', name: 'Berlin' }
  ]
}
```

### File Naming Convention

**Canadian** (default, existing):
- `Section01.js`, `Section02.js`, etc.
- No country suffix (these are the originals)

**German**:
- `Sektion01.js`, `Sektion02.js`, etc.
- German word "Sektion" clearly distinguishes from Canadian files

**Future Countries**:
- French: `Section01-FR.js` or `/fr/Section01.js`
- UK: `Section01-UK.js` or `/uk/Section01.js`

### Migration Checklist

**Completed**:
- [x] German ReferenceValues file (4012-ReferenzWerten-DE.js)
- [x] German ClimateData file (KlimaWerten.js)
- [x] Architecture decision documented

**Next Steps**:
- [ ] Revert to commit before LocalizationManager integration
- [ ] Create Sektion02.js with hardcoded German defaults
- [ ] Create Sektion03.js with hardcoded German defaults
- [ ] Create index-de.html with correct script paths
- [ ] Remove country-aware code from Canadian Section files
- [ ] Test both versions independently
- [ ] Document deployment strategy for teui.ca/de/

#### Issue 2: Germany/English Performance Not Measured

**Task**: Measure initialization time for Germany/English mode

**Expected Result**: <300ms (Germany data files are 22.8KB vs Canada 858KB = 40x smaller)

**Test Steps**:
1. Switch to Germany via dropdown
2. Page reloads
3. Check Clock.js console output
4. Record initialization time
5. Compare to 220ms baseline

**Success Criteria**: Germany initialization ≤ 250ms (allows 30ms overhead for LocalizationManager)

**Status**: ⚠️ DEPRECATED - File separation architecture eliminates need for this test

### Guidelines for Adding New Countries

**File Size Budget**:
- **Critical**: Data files must remain small (target: <50KB combined per country)
- **Rationale**: Each country adds to page weight for those users
- **Example**: Germany (22.8KB) vs Canada (858KB) - Germany optimized correctly
- **Test**: Measure initialization time with Clock.js, must be <300ms

**Step-by-Step Process**:

1. **Create Country Directory**
   ```
   localizations/NewCountry/
   ├── ReferenceValues-XX.js   (building standards)
   ├── ClimateData-XX.js        (weather/climate data)
   ├── ui-labels-xx.json        (future: translations)
   └── regions-xx.json          (future: region names)
   ```

2. **Add Country to CountryConfig.js**
   ```javascript
   XX: {
     code: "XX",
     name: "Country Name",
     nameLocal: "Native Name",
     flag: "🏳️",
     referenceValuesPath: "localizations/NewCountry/ReferenceValues-XX.js",
     climateValuesPath: "localizations/NewCountry/ClimateData-XX.js",
     defaultLanguage: "xx",
     availableLanguages: ["xx", "en"],
     defaultRegion: "Default Region",
     defaultCity: "Default City",
     unitSystem: "metric",
     currencyCode: "XXX",
     subtitle: "for Country Projects"
   }
   ```

3. **Update Ultra-Light Loader** (index.html)
   ```javascript
   // Add to country-loader script
   (function(){try{var c=localStorage.getItem('TEUI_SELECTED_COUNTRY');
   if(c==='XX'){document.write('<script src="localizations/NewCountry/ReferenceValues-XX.js"><\/script><script src="localizations/NewCountry/ClimateData-XX.js"><\/script>');return}
   if(c==='DE'){document.write('<script src="localizations/Germany/4012-ReferenzWerten-DE.js"><\/script><script src="localizations/Germany/KlimaWerten.js"><\/script>');return}
   }catch(e){}document.write('<script src="src/core/ReferenceValues.js"><\/script><script src="src/core/ClimateValues.js"><\/script>')})();
   ```

4. **Update Country Switcher** (index.html)
   ```javascript
   // Add detection logic
   let code = text.includes('Country Name') ? 'XX' :
              text.includes('Germany') ? 'DE' : 'CA';

   // Add button state
   const saved = localStorage.getItem('TEUI_SELECTED_COUNTRY');
   countryButton.innerHTML = saved === 'XX' ? '🏳️ Country Name' :
                             saved === 'DE' ? '🇩🇪 Germany' : '🇨🇦 Canada';
   ```

5. **Add Localized Content** (if needed)
   - Create helper functions for country-specific dropdowns
   - Use dynamic getters in field definitions
   - Follow Section02/Section03 patterns

6. **Test & Measure**
   - Clock.js initialization time (must be <300ms)
   - All dropdowns populate correctly
   - Default values set properly
   - Country switching works
   - Calculation performance <100ms

### Code Patterns Reference

**Pattern 1: Country-Aware Helper Function**
```javascript
function getLocalizedOptions() {
  const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';

  if (country === 'XX') {
    return [ /* Country XX data */ ];
  }

  if (country === 'DE') {
    return [ /* Germany data */ ];
  }

  return [ /* Canada default */ ];
}
```

**Pattern 2: Dynamic Getter with Fallback**
```javascript
{
  fieldId: "field_id",
  get value() {
    const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';
    return country === 'DE' ? 'German Default' : 'Canadian Default';
  },
  get options() {
    return getLocalizedOptions();
  }
}
```

**Pattern 3: Non-Enumerable Helpers**
```javascript
// After defining data object
Object.defineProperty(window.TEUI.DataObject, 'helperFunction', {
  value: helperFunction,
  enumerable: false,
  writable: false,
  configurable: false
});
```

**Pattern 4: Safe Country Detection**
```javascript
// Always use optional chaining and fallback
const country = window.TEUI?.LocalizationManager?.getCurrentCountry() || 'CA';

// Alternative: Direct localStorage read (if LocalizationManager not available)
const country = (function() {
  try {
    return localStorage.getItem('TEUI_SELECTED_COUNTRY') || 'CA';
  } catch(e) {
    return 'CA';
  }
})();
```

### Performance Monitoring Checklist

Before every commit:
- [ ] Run Clock.js and check initialization time
- [ ] Verify <220ms for Canada/English
- [ ] Verify <300ms for other countries
- [ ] Test 5-10 field changes and verify <100ms each
- [ ] Check browser console for errors
- [ ] Test country switching (should reload within 1s)

After major changes:
- [ ] Clear localStorage completely
- [ ] Test fresh load for each country
- [ ] Verify all default values populate
- [ ] Check all dropdowns show correct options
- [ ] Measure peak memory usage (DevTools → Memory)
- [ ] Test on slower device/network if available

### Documentation Requirements

When adding a country:
- Update this document with new country code
- Document any new helper functions
- Note any performance considerations
- Add example data structure
- Include testing steps

When modifying core system:
- Document performance impact (Clock.js before/after)
- Explain why change was necessary
- Note any breaking changes
- Update code patterns if new pattern introduced

### Future Optimization Opportunities

**If performance ever degrades**:

1. **Pre-compile country loaders** - Generate minified loaders programmatically
2. **Service Worker caching** - Cache country data files for instant switching
3. **WebAssembly parsing** - Use WASM for large data file parsing (if files grow)
4. **Virtual scrolling** - For dropdowns with >100 options
5. **Web Workers** - Move calculation engine to background thread
6. **Code splitting** - Lazy-load sections on demand

**Current Status**: None of these needed. Current architecture meets all performance targets.

### Success Metrics

**Current Achievement** ✅:
- Canada/English: 220ms initialization (baseline)
- Germany/English: TBD (expected <250ms)
- Country switching: ~600ms (page reload + localStorage)
- Zero overhead for 99% users (Canada)
- Clean dropdown UX (no function pollution)
- Working localization for Standards and Weather

**Ongoing Targets** 🎯:
- Maintain 220ms baseline for Canada
- All new countries <300ms initialization
- All calculations <100ms per change
- Zero regression in core functionality
- Clean, maintainable code patterns

**Final Implementation** (Commit 33ade82):
```html
<!-- Ultra-light country data loader (1 line) -->
<script id="country-loader">
  (function(){try{var c=localStorage.getItem('TEUI_SELECTED_COUNTRY');if(c==='DE'){document.write('<script src="localizations/Germany/4012-ReferenzWerten-DE.js"><\/script><script src="localizations/Germany/KlimaWerten.js"><\/script>');return}}catch(e){}document.write('<script src="src/core/ReferenceValues.js"><\/script><script src="src/core/ClimateValues.js"><\/script>')})();
</script>

<!-- Lazy localization system (1 line, DE only) -->
<script id="localization-loader">
  (function(){try{if(localStorage.getItem('TEUI_SELECTED_COUNTRY')==='DE'){document.write('<script src="src/core/CountryConfig.js"><\/script><script src="src/core/LocalizationManager.js"><\/script>')}}catch(e){}})();
</script>
```

**Key Optimizations**:
- Minified to 2 one-line scripts (vs previous multi-line with conditionals)
- No variable overhead, immediate execution
- Fail-safe with try-catch
- Only loads what's needed (DE users get extra scripts, CA users get zero overhead)

**Deliverables**:
- Working country switcher dropdown
- CountryConfig.js with CA and DE configurations
- LocalizationManager.js handling dynamic script loading
- Successful switching between Canadian and German data
- State persistence via localStorage

#### Phase 2b: UI Translation Foundation
**Goal**: Establish translation system and apply to critical sections

- [ ] Create i18n translation system (`src/core/i18n.js`)
  - [ ] Implement translation lookup function t(key)
  - [ ] Implement loadLanguage(lang) function
  - [ ] Add fallback to English for missing translations
  - [ ] Add caching for loaded translations
- [ ] Extract English baseline translations
  - [ ] Create master translation key structure
  - [ ] Extract Section 01 labels to `ui-labels-en.json`
  - [ ] Extract Section 03 labels to `ui-labels-en.json`
  - [ ] Extract common UI elements (buttons, etc.)
- [ ] Create German translations
  - [ ] Translate Section 01 labels to `ui-labels-de.json`
  - [ ] Translate Section 03 labels to `ui-labels-de.json`
  - [ ] Translate common UI elements
- [ ] Apply translations to UI
  - [ ] Add data-i18n attributes to Section 01
  - [ ] Add data-i18n attributes to Section 03
  - [ ] Add data-i18n attributes to common elements
  - [ ] Implement translatePage() function
- [ ] Integrate with LocalizationManager
  - [ ] Load appropriate language when country switches
  - [ ] Re-translate page after country change
- [ ] Test translation system
  - [ ] Verify English displays correctly (baseline)
  - [ ] Verify German displays correctly
  - [ ] Test missing translation fallback
  - [ ] Test language persistence

**Deliverables**:
- i18n.js translation system
- ui-labels-en.json (English baseline)
- ui-labels-de.json (German translations)
- Section 01 and Section 03 fully translated
- Automatic language switching with country selection

### Phase 3: Complete UI Translation Coverage
**Priority**: Medium
**Timeline**: 1-2 weeks

**Goal**: Extend translation system to all remaining sections

- [ ] Translate remaining sections (Section 02, 04-18)
  - [ ] Extract labels for each section to ui-labels-en.json
  - [ ] Translate all labels to ui-labels-de.json
  - [ ] Add data-i18n attributes to section HTML
- [ ] Translate modal dialogs and alerts
  - [ ] Disclaimer modal
  - [ ] Weather data modal
  - [ ] Confirm dialogs (reset, factory reset, etc.)
  - [ ] Error messages
- [ ] Translate button row and navigation
  - [ ] All button labels
  - [ ] Dropdown menu items
  - [ ] Tooltips
- [ ] Create translation guide for contributors
  - [ ] Document translation file structure
  - [ ] Provide examples of adding new translations
  - [ ] Define translation style guidelines
  - [ ] Create pull request template for translations

**Deliverables**:
- Complete English and German UI translations (100% coverage)
- All sections, modals, and UI elements translated
- Contributor documentation for adding new languages

### Phase 4: Region/City Dropdown Integration
**Priority**: High
**Timeline**: 1 week

- [ ] Create region configuration files (CA, DE)
- [ ] Refactor Section03.js dropdown logic
- [ ] Implement dynamic region/city loading
- [ ] Connect to climate data properly
- [ ] Add error handling for missing data
- [ ] Test region → city → climate data flow

**Deliverables**:
- Dynamic dropdowns working for both countries
- Climate data properly loaded based on selections
- Smooth switching between countries

### Phase 5: Testing & Refinement
**Priority**: High
**Timeline**: 1 week

- [ ] End-to-end testing with both countries
- [ ] Performance optimization (lazy loading)
- [ ] Browser compatibility testing
- [ ] Accessibility audit (WCAG compliance)
- [ ] User testing with German partners
- [ ] Documentation updates

**Deliverables**:
- Tested, production-ready localization system
- Performance benchmarks
- Partner feedback incorporated

### Phase 6: Additional Countries (Future)
**Priority**: Low
**Timeline**: Per-country basis

Template for adding new countries:
1. Create country folder in `localizations/`
2. Add reference values file
3. Add climate values file
4. Create regions configuration
5. Translate UI labels
6. Add flag asset
7. Update `CountryConfig.js`
8. Test integration

---

## Data Standards

### Field ID Consistency
All localization files must use the same field IDs to ensure calculations work across countries:

```javascript
// These IDs must match across all countries
{
  h_23: "20",      // Heating setpoint temperature
  d_52: "100",     // DHW system efficiency electric
  k_52: "92",      // DHW AFUE gas/oil
  f_85: "5.000",   // Roof RSI value
  // ... etc
}
```

### Comment Language Policy
- **Code/Logic**: English only (universal)
- **ReferenceValues comments**: Local language (for partner review/validation)
- **ClimateValues comments**: Local language (for partner review/validation)
- **UI Labels**: Local language (for end users)

### Climate Data Requirements
Each city entry must include at minimum:
- Location name
- Elevation (m)
- Design temperatures (heating/cooling)
- Heating degree days (HDD18, HDD15)
- Cooling degree days (CDD24)
- Precipitation data
- Wind data
- Average temperatures

---

## Technical Considerations

### Performance
- **Lazy Loading**: Only load data for selected country
- **Caching**: Use localStorage to cache loaded translations
- **Minification**: Compress localization files for production
- **CDN**: Consider CDN hosting for flag assets

### Browser Support
- ES6 modules for dynamic imports
- Fallback for older browsers (polyfills)
- Test on IE11 if required (consider graceful degradation)

### State Management
- Track current country in application state
- Persist country selection across sessions
- Handle country switching without full page reload
- Clear/reset calculation state when switching countries

### Error Handling
- Graceful fallback to English if translation missing
- Error messages if country data fails to load
- Validation that required fields exist in loaded data
- Console warnings for development/debugging

---

## Migration Path from Current System

### Existing Canadian Data
1. Move `src/core/ReferenceValues.js` → `localizations/Canada/ReferenceValues.js`
2. Move `src/core/ClimateValues.js` → `localizations/Canada/ClimateValues.js`
3. Create `ui-labels-en.json` from existing English text
4. Create `regions-en.json` from hardcoded province data
5. Update `index.html` to use LocalizationManager
6. Test that existing functionality unchanged

### Backward Compatibility
- Default to Canada if no country selected
- Maintain all existing Canadian functionality
- Ensure calculations produce identical results
- Keep existing URL structure/routing

---

## Collaboration with International Partners

### Contribution Workflow
1. Partner receives localization template folder
2. Partner populates reference values (in local language)
3. Partner provides climate data for major cities
4. Partner translates UI labels
5. Partner reviews and validates integration
6. Pull request submitted to Localization-[COUNTRY] branch
7. Testing and QA
8. Merge to main when approved

### Documentation for Partners
Provide partners with:
- This workplan document
- Field ID reference guide
- Climate data requirements specification
- UI translation template
- Example (Germany) as reference
- Setup instructions for local testing

---

## Future Enhancements

### Advanced Features (Post-MVP)
- [ ] Multi-language support within single country (e.g., EN and FR for Canada)
- [ ] User-preferred language separate from country
- [ ] Regional standards within countries (e.g., California Title 24 for US)
- [ ] Automatic currency conversion for cost calculations
- [ ] Unit system switching (Imperial/Metric) separate from country
- [ ] Climate zone auto-detection based on geolocation
- [ ] Crowdsourced climate data contributions
- [ ] API for third-party integrations

### Potential Integrations
- Weather API services for real-time data
- Building code databases (ICC, BSI, etc.)
- Energy modeling tools (EnergyPlus, PHPP)
- Government data portals (DWD, NOAA, etc.)

---

## Success Metrics

### Phase 2 Completion Criteria
- [ ] User can switch between Canada and Germany
- [ ] All dropdowns populate correctly
- [ ] Calculations use correct country data
- [ ] UI text displays in appropriate language
- [ ] No breaking changes to existing Canadian functionality

### Long-term Goals
- Support 5+ countries within 12 months
- Partner-contributed localization files
- Community translation contributions
- 95%+ translation coverage for major languages
- <200ms country switching time

---

## Maintenance & Support

### Ongoing Responsibilities
- Keep reference values updated with code changes
- Add new cities/regions as requested
- Update translations when UI changes
- Monitor for data quality issues
- Review and merge partner contributions

### Version Control
- Localization files versioned with application
- Breaking changes documented in changelog
- Migration guides for major updates
- Backward compatibility for at least 2 major versions

---

## Appendix

### A. Germany Climate Zones (DIN 18599)
- **Klimazone 1**: Mild coastal and Rhine-Main region (Hamburg, Bremen, Düsseldorf, Köln)
- **Klimazone 2**: Moderate continental (Berlin, Frankfurt, Leipzig, Nürnberg)
- **Klimazone 3**: Cold upland/alpine (Oberpfalz, Schwarzwald, Alps)

### B. Germany Building Standards
- **GEG** (Gebäudeenergiegesetz): National building energy law
- **DIN V 18599**: Energy efficiency calculation standard
  - Neubau: New construction
  - Sanierung: Renovation/existing buildings
- **PHI**: Passivhaus Institut standards
  - Classic, Plus, Premium tiers

### C. Useful Resources
- DWD (Deutscher Wetterdienst): https://www.dwd.de/
- PHI Climate Data: https://passiv.de/
- GEG Text: https://www.gesetze-im-internet.de/geg/
- DIN Standards: https://www.din.de/

---

**Document Version**: 1.0
**Last Updated**: 2025-01-21
**Author**: Andrew Thomson with Claude Code
**Status**: Living Document - Update as implementation progresses
