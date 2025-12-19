# Section 19: WOMBAT - 3D Thermal Topology Visualization

**Status**: ✅ Pre-Production (Phase 3 Complete - Gable Roofs)
**Created**: 2025-12-08
**Last Updated**: 2025-12-15
**Target Release**: 4.013

---

## Executive Summary

WOMBAT generates a **3D thermal topology model** from OBJECTIVE's envelope geometry data. Like wombats creating cubic output from inputs, we transform thermal area-based abstractions into volumetric spatial representations. **This is not an architectural model** — it's a visual representation of thermal attributes. The key to objective is simplified geometric inputs - areas, vs. explicit element level definitions like LxWxH for each wall element comprising stories and in aggregate an entire building, a single area for all walls can be entered, facilitating early stage analysis with the fewest possible inputs. But then to extract a semblance of the 3D tehrmal model, we need the wombat geometric solver to determine element-level details from the simple area. 

**Current Features**:
- ✅ Constraint-driven 3D wireframe visualization (SVG-based)
- ✅ Pattern A dual-state architecture (Target/Reference modes)
- ✅ Bidirectional sync with Section 12 (Volume & Stories)
- ✅ Display of Ae (Area Exposed to Air) and Ag (Area Exposed to Ground)
- ✅ Interactive aspect ratio control
- ✅ Multi-story visualization with per-floor area labels
- ✅ **Fractional story rendering** - Proportional height hairline storey indicators for partial floors (e.g., 1.5 stories)
- ✅ **Floorplate Options dropdown** - Clarifies mezzanine vs equal floorplates
- ✅ **Correct floor area display** - Shows footprint (d_95 SACRED), not averaged
- ✅ Mode-aware color coding (Blue=Target, Red=Reference)
- ✅ **Below-grade geometry visualization** (Phase 2 - Complete)
  - Brown dashed vectors for below grade basement walls (hidden line effect)
  - Brown nodes for basement and/or slab floor corners
  - Brown solid vectors for slab-on-grade perimeter
  - Dashed hairline grade line indicator with label
  - Basement depth annotation
  - Total Ag area label with foundation type
  - Mixed foundation warning indicator
- ✅ **Refresh button sync** - User-controlled StateManager sync after import
- ✅ **Label readability** - Semi-transparent backgrounds, z-order optimized
- ✅ **Field ID renumbering** - Sequential d_150-d_159 range for maintainability
- ✅ **Gable Roof Geometry** (Phase 3 - Complete)
  - Biplanar roof rendering with triangular gable ends and prominent ridge line
  - Roof Type Selector (d_159) - Dropdown for multiplanar/biplanar/monoplane
  - Gable wall area extraction - Triangular ends properly extracted from opaque wall area
  - Rational trigonometry - Height calculation using quadrance (no trig functions)
  - Ridge orientation - Automatically runs along longer building dimension
  - Correct volume calculation - Gable roof volume = (footprint × height) / 2

**Planned Enhancements**:
- Window areas in walls (orientation-specific placement)
- Shade plane projections (0-100%)
- Three.js migration for 3D interaction
- Monoplane (shed) roof implementation

---

## Table of Contents

1. [Architecture: Pattern A Dual-State](#architecture-pattern-a-dual-state)
2. [Field Definitions](#field-definitions)
3. [Bidirectional Sync with Section 12](#bidirectional-sync-with-section-12)
4. [Geometry Solver: Constraint-Driven](#geometry-solver-constraint-driven)
5. [3D Visualization: SVG Wireframe](#3d-visualization-svg-wireframe)
6. [Display Fields: Ae and Ag](#display-fields-ae-and-ag)
7. [Future Enhancements](#future-enhancements)
8. [References](#references)

---

## Architecture: Pattern A Dual-State

Section 19 implements TEUI's Pattern A dual-state architecture, maintaining separate state objects for Target and Reference modes with 100% isolation.

### State Objects

```javascript
// TargetState: Holds Target mode values
const TargetState = {
  values: {
    d_150: "1.5",           // Stories (mirrors S12 d_103)
    d_151: "8000.00",       // Volume (mirrors S12 d_105)
    d_154: "0.0",           // Aspect ratio slider (L:W)
    d_158: "mezzanine",     // Floorplate Options (mezzanine/equal)
    h_155: "0.00",          // Calculated: Footprint width
    h_156: "0.00",          // Calculated: Story height
    h_157: "0.00",          // Calculated: Footprint length
  }
};

// ReferenceState: Identical structure for Reference mode but can vary with 100% independence
```

### ModeManager

The ModeManager facade provides mode-aware publishing to StateManager:

- **Target mode**: Publishes unprefixed field IDs (`d_150`, `h_155`)
- **Reference mode**: Publishes with `ref_` prefix (`ref_d_150`, `ref_h_155`)
- **Passive pattern**: Mode switching only re-renders visualization; FieldManager handles table updates
- **Dual-engine**: `calculateAll()` always runs both Target and Reference calculations

**Location**: [Section19.js:130-242](../../src/sections/Section19.js#L130-L242)

---

## Field Definitions

Section 19 owns the following fields (renumbered to d_150-d_159 range):

| Field ID | Row | Type | Description | Mirrors |
|----------|-----|------|-------------|---------|
| `d_150` | 19.0 | dropdown | Number of Stories (1, 1.5, 2, 3, 4, 5, 6) | S12 `d_103` |
| `d_158` | 19.FP | dropdown | Floorplate Options (Mezzanine/Equal) | - |
| `d_159` | 19.RT | dropdown | Roof Type (Multiplanar/Biplanar/Monoplane) | - |
| `d_151` | 19.V | editable | Conditioned Volume (m³) | S12 `d_105` |
| `d_152` | 19.Ae | calculated | Ae - Total Area Exposed to Air (m²) | S12 `d_101` |
| `d_153` | 19.Ag | calculated | Ag - Total Area Exposed to Ground (m²) | S12 `d_102` |
| `d_154` | 19.1 | slider | Footprint Aspect Ratio L:W (-4 to +4) | - |
| `h_155` | 19.2 | calculated | Footprint Width (m) | - | //needs work, is hard to set to 0, consider snap
| `h_156` | 19.3 | calculated | Building Height (m) | - |
| `h_157` | (inline) | calculated | Footprint Length (m) | - |

### Display-Only Fields (from S12)

Section 19 displayonly aggregate U-values owned by Section 12 (Note: *Robot Fingers):

| Field ID | Description | Owner |
|----------|-------------|-------|
| `g_152` | U-value for Ae (W/m²·K) | S12 `g_101` |
| `g_153` | U-value for Ag (W/m²·K) | S12 `g_102` |

**Location**: [Section19.js:248-455](../../src/sections/Section19.js#L248-L455)

---

## Bidirectional Sync with Section 12

Section 19 maintains bidirectional synchronization with Section 12 for Volume and Stories fields using StateManager listeners.

### Mirror Fields

| S12 Field | S19 Field | Description | Sync Status |
|-----------|-----------|-------------|-------------|
| `d_105` / `ref_d_105` | `d_151` / `ref_d_151` | Conditioned Volume (m³) | ✅ Both directions |
| `d_103` / `ref_d_103` | `d_150` / `ref_d_150` | Number of Stories | ✅ Both directions |

### How It Works

**S12 → S19**: StateManager listeners in S19 respond to changes from S12
**S19 → S12**: ModeManager publishes field changes to StateManager, which S12 listens for

Both sections have listeners with proper guards against circular updates (`source="external"` flag).

**S12 Listeners** (Section12.js:3087-3190): Listen for d_150/d_151 changes from S19
**S19 State Sync** (Section19.js): Publishes via ModeManager.setValue()

**Location**: Section12.js listeners updated in commit `ce74cd7` (2025-12-15)

---

## Geometry Solver: Constraint-Driven

WOMBAT's geometry solver transforms thermal area data into 3D geometry using a constraint satisfaction approach where **footprint area (d_95) is the sacred touchstone** and **volume (d_105/d_151) is a sacred constraint** used to solve for wall height.

**CRITICAL**: Volume is used to **derive wall height**, ensuring the geometry satisfies the user's declared conditioned volume including space under the roof. //PENDING: Basement wall height needs NOT to participate in above grade wall ht. calculations, solution needs work. 

### Input Dependencies

**SACRED Inputs** (from StateManager):
- `d_95` / `ref_d_95` - **Footprint Area (m²)** - SACRED TOUCHSTONE from S11
- `h_15` / `ref_h_15` - Conditioned Area (m²) from S12
- `d_85` / `ref_d_85` - Roof Area (m²) from S11
- `d_86` / `ref_d_86` - Opaque Wall Area (m²) from S11
- `d_88-d_92` / `ref_d_88-d_92` - Window Areas (North, East, South, West, Other) from S11

**Internal** (from TargetState/ReferenceState):
- `d_151` - Volume (m³) - **SACRED CONSTRAINT** (used to solve wall height!)
- `d_150` - Stories (1, 1.5, 2, 3, 4, 5, 6)
- `d_158` - Floorplate Options (mezzanine/equal)
- `d_159` - Roof Type (multiplanar/biplanar/monoplane) //Monoplane not yet working, multiplanar fragile in rectangular aspect ratios
- `d_154` - Aspect Ratio Slider (-4 to +4, 0 = square) //consider adding snap to -4, -3, -2, 0, 1, 2, 4.

### Correct Constraint Flow (Refactored 2025-12-15)

The solver follows this **exact sequence**:

**Phase 1: Footprint** (X-Y plane) - SACRED TOUCHSTONE
```javascript
// Footprint area (d_95) is SACRED - read directly, never calculate
footprintArea = d_95  // From S11, already known
aspectRatio = slider >= 0 ? (1 + slider) : 1 / (1 - slider)
width = sqrt(footprintArea / aspectRatio)
length = footprintArea / width
perimeter = 2 * (length + width)
```

**Phase 2: Mezzanine/Partial Floor Calculation**
```javascript
// Controlled by Floorplate Options dropdown (d_158)
floorplateOption = d_158  // "mezzanine" or "equal"
fullStories = floor(d_150)

if (floorplateOption === "mezzanine" && d_150 !== fullStories) {
  mezzanineArea = max(0, h_15 - footprintArea) //for when conditioned area total exceeds footprint but building is 1.5 storeys, assign difference to Mezzanine
} else {
  mezzanineArea = 0  // Equal floorplates
}
```

**Phase 3: Total Wall Area**
```javascript
// Aggregate all window areas for Total Transparent Wall Elements
totalWindowArea = d_88 + d_89 + d_90 + d_91 + d_92

// Total wall area (gross) = opaque + windows
totalWallAreaGross = d_86 + totalWindowArea
```

**Phase 4: Roof Geometry** - SOLVE FIRST (before wall height!)
```javascript
// CRITICAL: Roof geometry must be solved BEFORE wall height
// because gable roofs contribute area to end-walls (triangular ends)

roofTypeSelection = d_159  // "multiplanar" / "biplanar" / "monoplane"
areaRatio = d_85 / footprintArea

if (areaRatio > 1.01 && roofTypeSelection === "biplanar") {
  // GABLE ROOF - Use rational trigonometry
  ridgeLength = max(width, length)
  span = min(width, length) // where span = base of triangle
  ridgeOrientation = length >= width ? "longitudinal" : "transverse"

  slopeLength = d_85 / (2 * ridgeLength)
  h² = slopeLength² - (span/2)² // where h = height of ridge
  roofHeight = sqrt(h²)

  gableEndArea = 2 * (span * roofHeight / 2)  // Both triangular ends 0.5*b*h

} else if (areaRatio > 1.01 && roofTypeSelection === "multiplanar") {
  // PYRAMIDAL ROOF - remains buggy w. rectangular forms, collapses with long buildings due to insufficient decimal carriage
  roofHeight = calculatePyramidalHeight(width, length, areaRatio)
  gableEndArea = 0
}
```

**Phase 5: Wall Height** - VOLUME-CONSTRAINED (AFTER roof geometry!)
```javascript
// CRITICAL: Use VOLUME as constraint to solve for wall height
// This ensures geometry satisfies user's declared conditioned volume

// 1. Calculate roof volume from roof geometry
let roofVolume = 0
if (roofType === "gable") {
  roofVolume = (footprintArea * roofHeight) / 2
} else if (roofType === "pyramidal") {
  roofVolume = (footprintArea * roofHeight) / 3
}

// 2. Solve wall height from volume constraint
rectangularVolume = conditionedVolume - roofVolume // d_105-calculated roofVolume when available, need to omit/subtract basement volume here when present
wallHeight = rectangularVolume / footprintArea // solves for above grade walls only

// 3. Verify against wall area (consistency check)
if (roofType === "gable" && gableEndArea > 0) {
  effectiveWallArea = totalWallAreaGross - gableEndArea
} else {
  effectiveWallArea = totalWallAreaGross
}
wallHeightFromArea = effectiveWallArea / perimeter

// 4. Flag discrepancy if wall area and volume are inconsistent
heightDiscrepancy = abs(wallHeight - wallHeightFromArea) / wallHeight * 100
if (heightDiscrepancy > 5) {
  console.warn("Wall height discrepancy > 5% - volume and wall area inconsistent")
}

storyHeight = wallHeight / d_150  // For visualization only
```

### Outputs

Calculated fields published to StateManager:
- `h_157` / `ref_h_157` - Footprint Length (m)
- `h_155` / `ref_h_155` - Footprint Width (m)
- `h_156` / `ref_h_156` - Building Height (m) - wall + roof

Geometry object also includes:
- `footprint.area` - Footprint area (d_95 SACRED)
- `mezzanineArea` - Partial floor area (h_15 - footprint when mezzanine option selected)
- `walls.totalGrossArea` - Total wall area (opaque + windows)
- `walls.effectiveArea` - Wall area excluding gable ends
- `walls.heightFromVolume` - Wall height from volume constraint (primary)
- `walls.heightFromArea` - Wall height from wall area (verification)
- `roof.gableEndArea` - Triangular gable end area (for biplanar roofs)
- `volume` - User-declared conditioned volume (d_105/d_151) - CONSTRAINT

**Location**: [Section19.js:813-1150](../../src/sections/Section19.js#L813-L1150)

---

## 3D Visualization: SVG Wireframe

WOMBAT uses SVG-based isometric projection to render the constraint-driven geometry as a 3D wireframe.

### Coordinate System

**Right-handed coordinate system (Z-up convention)**:
- **X+ = East** (horizontal)
- **Y+ = North** (horizontal)
- **Z+ = Up** (vertical)
- **X-Y plane** = Ground plane (footprint)
- **Z-axis** = Building height

This matches standard architectural/BIM conventions and enables proper cardinal orientation for future window placement and solar calculations.

### Why SVG?
- DOM-based manipulation (easier debugging than Canvas)
- Resolution independence
- Better integration with web standards
- Matches Section 18's graph visualization pattern

### Rendering Features

- **Isometric projection**: 3D coordinates → 2D using standard isometric angles (Z-up)
- **Multi-story stacking**: Each story rendered with floor/ceiling edges and vertical posts
- **Mode-aware colors**: Blue (#007bff) for Target, Red (#dc3545) for Reference
- **Dimension annotations**: X/East and Y/North dimension labels on building edges
- **Per-floor area labels**: Shows conditioned area for each story
- **Geometry info overlay**: Summary with diagnostic calculations (see below)
- **Coordinate axes indicator**: X/East (red), Y/North (green), Z/Up (blue) at bottom-left
- **Dynamic scaling**: Auto-scales to fit canvas while maintaining proportions

### Diagnostic Labels (Added 2025-12-15)

The info overlay (top-left) shows intermediate geometry calculations for verification:

1. **Stories calculation**: `Stories: 2 × 1100.4 m² = 2200.8 m²`
2. **Mezzanine area** (if present): `Show: 'Mezzanine Area: 327 m²'`
3. **Footprint dimensions**: `Footprint: 21.0m × 52.5m`
4. **Story height**: `Story Height: 3.02m`
5. **Total volume**: `Total Volume: 8000 m³ (4000 m³/floor)` (user-declared, not calculated)
6. **Roof area**: `Roof Area: 1411.52 m² (ridge ht. determined from this)`
7. **Gable area** (for biplanar roofs): `Show: 'Gable Area: 176.80 m²'`
8. **Effective wall area**: `Show: 'Ae Walls: 888.30 m²'` (excluding gable ends)

These labels allow verification that the geometry solver is deriving dimensions correctly from thermal constraints.

**Location**: [wombatRender.js:980-1077](../../src/core/wombatRender.js#L980-L1077)

### Activation Controls

Users must click "Activate Topology View" to generate the 3D model. This prevents unnecessary calculations on page load. Button switches to 'Refresh Topology' after Activated.

- **Inactive state**: Shows placeholder message
- **Active state**: Generates and displays wireframe, updates on any geometry change
- **Info modal**: Explains thermal topology concept and constraints

**Location**: [Section19.js:769-1024](../../src/sections/Section19.js#L769-L1024)

---

## Display Fields: Ae and Ag

Section 19 displays aggregate envelope area fields from Section 12 using the "Robot Fingers" pattern—StateManager listeners scoped to the `#wombat` container.

### Implementation

**Ae (Area Exposed to Air)**:
- `d_101` / `ref_d_101` - Total air-facing area (m²)
- `g_101` / `ref_g_101` - Aggregate U-value for air-facing surfaces (W/m²·K)
- Color: Powder blue (`text-air-facing` class)

**Ag (Area Exposed to Ground)**:
- `d_102` / `ref_d_102` - Total ground-facing area (m²)
- `g_102` / `ref_g_102` - Aggregate U-value for ground-facing surfaces (W/m²·K)
- Color: Brown (`text-ground-facing` class)

### How It Works

1. **Ownership**: S12 calculates and publishes these values to StateManager
2. **Display**: S19 uses scoped StateManager listeners to update its DOM elements
3. **No initialization needed**: Field definitions contain defaults; robot fingers handle live updates
4. **DOM scoping**: `wombatContainer.querySelector('[data-field-id="d_101"]')` prevents collision with S12's elements

**Location**: Section19.js scoped listeners

---

## Recent Refactoring (2025-12-15)

### Field ID Renumbering ✅ COMPLETE

**Goal**: Reorganize field IDs from scattered 198-203 range to sequential 150-158 range.

**Commits**:
- `ce74cd7` - Refactor: Rename S19 field IDs to sequential d_150-d_157 range
- `0e8c181` - Improve: Fractional story rendering and add Floorplate Options
- `72264ce` - Fix: Correct floor area display to use footprint (d_95), not averaged

**Changes**:
| Old ID | New ID | Description |
|--------|--------|-------------|
| d_199 | d_150 | Stories |
| d_198 | d_151 | Volume |
| d_101 | d_152 | Ae (display) |
| d_102 | d_153 | Ag (display) |
| d_202 | d_154 | Aspect Ratio |
| h_201 | h_155 | Footprint Width |
| h_203 | h_156 | Building Height |
| h_200 | h_157 | Footprint Length |
| (new) | d_158 | Floorplate Options |

**S12 Listener Updates**: Section12.js listeners updated to listen for d_150/d_151 instead of d_198/d_199 (8 total listeners updated)

### Fractional Story Visualization ✅ COMPLETE

**Problem**: 1.5 stories rendered as two identical full-height boxes (misleading).

**Solution**: Render fractional stories at proportional height.
- Full stories: Full-height boxes
- Fractional story: Partial-height box (e.g., 0.5 × storyHeight for 1.5 stories)
- Hairline at correct position (e.g., 2/3rds wall height for 1.5 stories)

**File**: [wombatRender.js:207-342](../../src/core/wombatRender.js#L207-L342)

### Floor Area Math Correction ✅ COMPLETE

**Problem**: Showed 951 m² per floor (conditioned ÷ stories) instead of footprint 1100.42 m².

**Root Cause**: `areaPerFloor = conditionedArea / storiesDeclared` gave averaged value.

**Fix**:
1. `areaPerFloor = footprintArea` (d_95 is SACRED)
2. Mezzanine calculation: `conditionedArea - (footprint × fullStories)` = 326.78 m²
3. Renderer uses actual `geometry.mezzanineArea` instead of calculated value

**Result**:
- Full story label: 1100.42 m² (footprint - SACRED)
- Mezzanine label: 326.78 m² (actual adiabatic floor area)

**Files**:
- [Section19.js:800-808](../../src/sections/Section19.js#L800-L808) - Calculation
- [wombatRender.js:306](../../src/core/wombatRender.js#L306) - Rendering

### Floorplate Options Dropdown ✅ COMPLETE

**Goal**: Clarify geometric interpretation for fractional stories.

**Implementation**: Added d_158 dropdown with two options:
- "Mezzanine/Partial Floor" (default) - Adiabatic internal floor
- "Equal Floorplates" - Stacked floors at proportional heights

**Usage**: Buildings can have BOTH mezzanine AND conditioned volume under roof. The dropdown clarifies floorplate interpretation while roof area > footprint automatically implies conditioned space under roof slope.

**File**: [Section19.js:302-329](../../src/sections/Section19.js#L302-L329)

---

## Recent Enhancements

### Phase 2: Below-Grade Geometry Visualization ✅ COMPLETE (Testing)

**Goal**: Visualize basement/below-grade components using brown nodes and vectors to distinguish ground-facing surfaces (Ag) from air-facing surfaces (Ae).

**Status**: ✅ **Implemented - In Testing** (2025-12-14)

**Commits**:
- `722b624` - Docs: Update below-grade workplan with hidden line visual design
- `3a19421` - Refactor: Extract S19 rendering to wombatRender.js module
- `9809ae8` - Docs: Revise S19-WOMBAT-3.md to reflect production state
- `fbad071` - Docs: Add Phase 2 below-grade geometry workplan to S19-WOMBAT-3
- `2ecdc00` - Improve: Add color classes to Ae/Ag U-value fields in S19
- `975163c` - Fix: WOMBAT refresh button sync and UI improvements
- `d221df2` - Improve: Add semi-transparent backgrounds to WOMBAT labels
- `b0b2388` - Fix: Ensure WOMBAT labels render on top of geometry
- `cdfcdee` - Fix: Correct label background rendering timing

**Data Sources** (from S11):
- `d_95` / `ref_d_95` - Slab Area (m²) - Brown (ground-facing)
- `d_94` / `ref_d_94` - Below-Grade Wall Area (m²) - Brown (ground-facing)
- `d_87` / `ref_d_87` - Floor Exposed to Air (m²) - For mixed foundation detection

**Visual Design**:
```
Above Grade (Blue):          Below Grade (Brown):
      ┌────┐                      ═══════  ← Grade line (dashed)
     ╱│    │╲                     ┌────┐
    ╱ │    │ ╲                    ┊    ┊   ← Basement walls (dashed)
   ●──●────●──●                   ┊    ┊
   │  │    │  │                   ●──●─●──● ← Basement floor nodes
   │  │    │  │
   ●──●────●──●                  Ag: 306.4 m²
   ═══════════  ← Grade line    Full Basement
```

**Implementation Highlights**:
1. ✅ Foundation type detection (full-basement, slab-on-grade, raised-floor, basement-no-slab)
2. ✅ Basement depth calculation: `depth = basementWallArea / perimeter`
3. ✅ Grade line (dashed brown, italic "Grade" label) at z=0
4. ✅ Basement walls (dashed brown vectors, hidden line effect)
5. ✅ Basement floor nodes (brown circles)
6. ✅ Ground floor perimeter detection (brown when ground contact, blue/red when raised)
7. ✅ Depth annotation label (left side)
8. ✅ Total Ag area label with foundation type subtitle
9. ✅ Mixed foundation warning (when both raised floor and ground contact exist)
10. ✅ 3-phase rendering for proper z-order (geometry → labels → backgrounds)
11. ✅ Semi-transparent label backgrounds for legibility

**Location**:
- Geometry solver: [Section19.js:652-711](../../src/sections/Section19.js#L652-L711)
- Rendering: [wombatRender.js:328-554](../../src/core/wombatRender.js#L328-L554)

**Testing Required**:
- [ ] Full basement scenario (d_94 > 0, d_95 > 0, d_87 = 0)
- [ ] Slab-on-grade scenario (d_94 = 0, d_95 > 0, d_87 = 0)
- [ ] Raised floor scenario (d_94 = 0, d_95 = 0, d_87 > 0)
- [ ] Mixed foundation scenario (combination of above)
- [ ] Basement-no-slab scenario (d_94 > 0, d_95 = 0)
- [ ] Import/export with below-grade data
- [ ] Target/Reference mode switching
- [ ] Label legibility over all geometry types

## Recent Enhancements (Continued)

### Phase 3: Gable Roof Geometry ✅ COMPLETE (2025-12-15)

**Goal**: Implement biplanar (gable) roof rendering with proper geometric calculations.

**Status**: ✅ **Complete and Production Ready**

**Implementation Completed**:
1. ✅ **Added Roof Type dropdown (d_159)** - multiplanar/biplanar/monoplane
   - Default: "biplanar" for all buildings
   - User-selectable roof geometry type
   - Location: [Section19.js:332-359](../../src/sections/Section19.js#L332-L359)
2. ✅ **Gable height calculation** using rational trigonometry
   - Ridge automatically runs along longer axis (longitudinal or transverse)
   - Calculates triangular gable end area: `gableEndArea = (span × height) / 2`
   - Pure quadrance-based approach (no trig functions)
   - Location: [Section19.js:750-811](../../src/sections/Section19.js#L750-L811)
3. ✅ **Wall area accounting** - Gable end extraction from total opaque wall area
   - Gable ends correctly identified as OPAQUE WALL AREA (d_86), not roof area
   - Wall plate height = `(totalWallArea - 2×gableEndArea) / perimeter`
   - Location: [Section19.js:943-970](../../src/sections/Section19.js#L943-L970)
4. ✅ **Gable roof renderer** in wombatRender.js
   - Two rectangular slopes rendered with edge vectors
   - Two triangular gable ends (north/south or east/west)
   - Prominent ridge line visualization (3px stroke)
   - Ridge endpoint nodes
   - Gable-specific height label
   - Location: [wombatRender.js:449-585](../../src/core/wombatRender.js#L449-L585)
5. ✅ **Volume calculation** - Correct gable roof volume
   - Formula: `gableVolume = (footprint × height) / 2`
   - Triangular prism geometry
   - Location: [Section19.js:1000-1005](../../src/sections/Section19.js#L1000-L1005)

**Mathematical Foundation** (Implemented):
```javascript
// Gable roof: ridge along longer dimension
const ridgeLength = Math.max(width, length);
const span = Math.min(width, length);
const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

// Slope length from total roof area (rational approach)
const slopeLength = roofArea / (2 * ridgeLength);

// Height from Pythagorean theorem (quadrance)
const h2 = slopeLength² - (span/2)²;
const roofHeight = Math.sqrt(h2);

// Gable end area (each triangular end)
const gableEndArea = (span × roofHeight) / 2;

// Wall plate height (extract gable ends from wall area)
const wallPlateHeight = (totalWallArea - 2 × gableEndArea) / perimeter;
```

**Key Achievements**:
- ✅ No NaN errors in height calculations
- ✅ Gable end area properly extracted from wall area
- ✅ Ridge line visible at apex with correct orientation
- ✅ Default rectangular model (1.5 stories) renders correctly
- ✅ Roof type selection (multiplanar/biplanar/monoplane) functional
- ✅ All calculations use rational trigonometry (algebraically stable)

**References**:
- Mathematical derivation: [S19-RT.md](S19-RT.md) (rational trigonometry approach)
- Commit: TBD (2025-12-15)

## Phase 3.5: Shed Roof (Monoplane) Implementation

**Status**: 🎯 **READY TO IMPLEMENT** (2025-12-19)
**Priority**: HIGH - Next logical roof type after gable completion
**Branch**: Create `WOMBAT-SHED` from current main

### Overview

Implement monoplane (shed) roof geometry solver using rational trigonometry. Shed roofs are single-slope roofs running along the longer building dimension, creating asymmetric wall heights (tall wall at high eave, short wall at low eave).

### User Constraints (Confirmed 2025-12-19)

1. **g_106 correlation**: `g_106` represents the **short wall** height (lower eave)
2. **Wall area subtraction**: Same pattern as gable - triangular end walls extract from `d_86`
3. **Shed orientation**: Runs along **longer dimension** (like gable ridge orientation)
4. **Volume constraint**: Same as gable - preserved exactly, dimensions solve from volume
5. **Basement volume**: Already fixed (see lines 1037-1121 in Section19.js)

### Mathematical Approach

#### 1. Geometry Setup

```
Shed roof profile (side view):

    Tall wall              Short wall
    |                           |
    |     /|                    |
    |    / |                    |
    |   /  | height (h)         |
    |  /   |                    |
    | /    |                    |
    |/_____|____________________|
         span (perpendicular to ridge)
```

**Givens**:
- `d_85` = Roof area (m²) - user input from S11
- `g_106` = Short wall height (m) - eave height at low side
- `d_105` = Conditioned volume (m³) - sacred constraint
- `width`, `length` = Footprint dimensions from volume solve
- `stories` = Number of stories from `d_103`

**Unknowns**:
- Roof height (`h`) - vertical rise from low eave to high eave
- Tall wall height - derived from `g_106 + h`
- Slope length - hypotenuse of roof triangle
- Triangular end wall area - to subtract from `d_86`

#### 2. Rational Trigonometry Solution

**Step 1: Determine ridge orientation and span**
```javascript
const ridgeLength = Math.max(width, length); // Shed runs along longer dimension
const span = Math.min(width, length);         // Perpendicular to ridge
const ridgeOrientation = length >= width ? "longitudinal" : "transverse";
```

**Step 2: Solve for slope length using roof area**
```javascript
// Roof area = ridge length × slope length
const slopeLength = roofArea / ridgeLength;
```

**Step 3: Solve for roof height using Pythagorean theorem (squared form)**
```javascript
// slope² = span² + height²
// Rearrange: height² = slope² - span²
const h2 = slopeLength * slopeLength - span * span;
const height = Math.sqrt(h2);
```

**Step 4: Calculate triangular end wall area**
```javascript
// Two triangular ends (like gable), each with area = (span × height) / 2
const shedEndArea = span * height; // Total for both ends
```

**Step 5: Validate geometry**
```javascript
const isValid = h2 > 0 && height > 0 && slopeLength > span;
```

#### 3. Wall Height Calculation

Unlike flat/gable roofs (symmetric walls), shed roofs have **asymmetric walls**:

```javascript
// Short wall height (at low eave)
const shortWallHeight = g_106;

// Tall wall height (at high eave)
const tallWallHeight = g_106 + height;

// Average wall height for volume calculation
const avgWallHeight = (shortWallHeight + tallWallHeight) / 2;
```

#### 4. Volume Constraint Verification

```javascript
// For shed roof, volume = footprint × average wall height
const calculatedVolume = (width * length) * avgWallHeight;

// Should match d_105 (with basement volume already subtracted)
const volumeError = Math.abs(calculatedVolume - targetVolume);
```

**Note**: Unlike gable roofs where volume = footprint × wallHeight (uniform), shed roofs use average wall height because of the slope.

### Implementation Checklist

#### File: `/src/sections/Section19.js`

**Location**: Replace placeholder at lines 1256-1262

##### Step 1: Add shed roof calculation function (after `calculateGableHeight`)

```javascript
/**
 * Calculate shed roof height from roof area using rational trigonometry
 * @param {number} width - Building width (m)
 * @param {number} length - Building length (m)
 * @param {number} roofArea - Total roof area from d_85 (m²)
 * @param {number} shortWallHeight - Height of short wall from g_106 (m)
 * @returns {Object} - Shed roof geometry
 */
function calculateShedHeight(width, length, roofArea, shortWallHeight) {
  // Shed runs along longer dimension (like gable ridge)
  const ridgeLength = Math.max(width, length);
  const span = Math.min(width, length);
  const ridgeOrientation = length >= width ? "longitudinal" : "transverse";

  // Roof area = ridge length × slope length
  const slopeLength = roofArea / ridgeLength;

  // Use Pythagorean theorem in squared form (rational trigonometry)
  // slope² = span² + height²
  // height² = slope² - span²
  const h2 = slopeLength * slopeLength - span * span;

  if (h2 <= 0) {
    console.warn(
      `[WOMBAT] Shed roof: Invalid geometry - slope length (${slopeLength.toFixed(2)}m) ` +
      `must be greater than span (${span.toFixed(2)}m)`
    );
    return { height: 0, ridgeOrientation, ridgeLength, span, shedEndArea: 0, isValid: false };
  }

  const height = Math.sqrt(h2);

  // Triangular end walls (two ends, like gable)
  // Each end has area = (span × height) / 2
  const shedEndArea = span * height; // Total for both ends

  // Calculate tall wall height
  const tallWallHeight = shortWallHeight + height;

  console.log(
    `[WOMBAT] Shed roof geometry:\n` +
    `  Ridge: ${ridgeOrientation}, length: ${ridgeLength.toFixed(2)}m\n` +
    `  Span: ${span.toFixed(2)}m\n` +
    `  Slope length: ${slopeLength.toFixed(2)}m\n` +
    `  Height rise: ${height.toFixed(2)}m\n` +
    `  Short wall: ${shortWallHeight.toFixed(2)}m\n` +
    `  Tall wall: ${tallWallHeight.toFixed(2)}m\n` +
    `  End wall area (both): ${shedEndArea.toFixed(2)}m²`
  );

  return {
    height,
    ridgeOrientation,
    ridgeLength,
    span,
    slopeLength,
    shedEndArea,
    shortWallHeight,
    tallWallHeight,
    avgWallHeight: (shortWallHeight + tallWallHeight) / 2,
    isValid: true,
  };
}
```

##### Step 2: Replace monoplane placeholder in WOMBAT solver

**Find** (lines 1256-1262):
```javascript
} else {
  // MONOPLANE (shed roof) - future implementation
  console.warn(
    "[WOMBAT] Monoplane roof type not yet implemented - using flat roof"
  );
  roofType = "flat";
  roofHeight = 0;
}
```

**Replace with**:
```javascript
} else {
  // MONOPLANE (shed roof)
  roofType = "monoplane";

  const shedGeometry = calculateShedHeight(width, length, d_85, g_106);

  if (!shedGeometry.isValid) {
    console.warn(
      `[WOMBAT] Invalid shed roof geometry - roof area (${d_85.toFixed(2)}m²) ` +
      `too small for footprint (${width.toFixed(2)}m × ${length.toFixed(2)}m)`
    );
    roofType = "flat";
    roofHeight = 0;
    wallArea = d_86; // No end wall extraction
  } else {
    roofHeight = shedGeometry.height;

    // Extract triangular end walls from total wall area (like gable)
    wallArea = Math.max(0, d_86 - shedGeometry.shedEndArea);

    console.log(
      `[WOMBAT] Shed roof applied:\n` +
      `  d_86 (total wall): ${d_86.toFixed(2)}m²\n` +
      `  End walls: ${shedGeometry.shedEndArea.toFixed(2)}m²\n` +
      `  Remaining wall: ${wallArea.toFixed(2)}m²\n` +
      `  Short wall height: ${shedGeometry.shortWallHeight.toFixed(2)}m\n` +
      `  Tall wall height: ${shedGeometry.tallWallHeight.toFixed(2)}m\n` +
      `  Average wall height: ${shedGeometry.avgWallHeight.toFixed(2)}m`
    );

    // Store geometry for renderer
    roofGeometry = {
      type: "shed",
      height: shedGeometry.height,
      ridgeOrientation: shedGeometry.ridgeOrientation,
      ridgeLength: shedGeometry.ridgeLength,
      span: shedGeometry.span,
      slopeLength: shedGeometry.slopeLength,
      shortWallHeight: shedGeometry.shortWallHeight,
      tallWallHeight: shedGeometry.tallWallHeight,
      avgWallHeight: shedGeometry.avgWallHeight,
    };
  }
}
```

##### Step 3: Update wall height calculation for shed roofs

**Find** wall height calculation section (around line 1300):
```javascript
// Calculate wall height from remaining wall area
const wallHeight = wallArea / wallPerimeter;
```

**Add shed roof special case BEFORE this**:
```javascript
// For shed roofs, use average wall height from geometry
let wallHeight;
if (roofType === "monoplane" && roofGeometry?.avgWallHeight) {
  wallHeight = roofGeometry.avgWallHeight;
  console.log(
    `[WOMBAT] Using shed roof average wall height: ${wallHeight.toFixed(2)}m ` +
    `(short: ${roofGeometry.shortWallHeight.toFixed(2)}m, ` +
    `tall: ${roofGeometry.tallWallHeight.toFixed(2)}m)`
  );
} else {
  // Calculate wall height from remaining wall area for flat/gable
  wallHeight = wallArea / wallPerimeter;
}
```

##### Step 4: Volume verification for shed roofs

**Add after wall height calculation**:
```javascript
// Verify volume constraint
const calculatedVolume = footprintArea * wallHeight;
const volumeError = Math.abs(calculatedVolume - targetVolume);

if (volumeError > 0.01) {
  console.warn(
    `[WOMBAT] Volume mismatch for ${roofType} roof:\n` +
    `  Target: ${targetVolume.toFixed(2)}m³\n` +
    `  Calculated: ${calculatedVolume.toFixed(2)}m³\n` +
    `  Error: ${volumeError.toFixed(2)}m³`
  );
}
```

### Renderer Updates

#### File: `/src/utils/wombatRender.js`

##### Add shed roof geometry to renderer (after gable implementation)

```javascript
// Shed roof (monoplane)
if (roofType === "monoplane" && geom.roofGeometry) {
  const { ridgeOrientation, shortWallHeight, tallWallHeight, height } = geom.roofGeometry;

  // Determine which walls are short vs tall based on orientation
  if (ridgeOrientation === "longitudinal") {
    // Ridge runs along length (X-axis)
    // Front wall (Y=0) is short, back wall (Y=length) is tall
    const frontZ = baseZ + shortWallHeight;
    const backZ = baseZ + tallWallHeight;

    // Shed roof plane (4 corners)
    const roofPath = `
      M ${-halfWidth},0,${frontZ}
      L ${halfWidth},0,${frontZ}
      L ${halfWidth},${length},${backZ}
      L ${-halfWidth},${length},${backZ}
      Z
    `;

    elements.push(
      createSVGElement("path", {
        d: roofPath,
        fill: colors.roof,
        stroke: colors.roofEdge,
        "stroke-width": "0.5",
      })
    );

    // Triangular end walls (left and right)
    const leftEndPath = `
      M ${-halfWidth},0,${baseZ}
      L ${-halfWidth},0,${frontZ}
      L ${-halfWidth},${length},${backZ}
      L ${-halfWidth},${length},${baseZ}
      Z
    `;
    const rightEndPath = `
      M ${halfWidth},0,${baseZ}
      L ${halfWidth},0,${frontZ}
      L ${halfWidth},${length},${backZ}
      L ${halfWidth},${length},${baseZ}
      Z
    `;

    elements.push(
      createSVGElement("path", {
        d: leftEndPath,
        fill: colors.wall,
        stroke: colors.wallEdge,
        "stroke-width": "0.5",
      })
    );
    elements.push(
      createSVGElement("path", {
        d: rightEndPath,
        fill: colors.wall,
        stroke: colors.wallEdge,
        "stroke-width": "0.5",
      })
    );

  } else {
    // Ridge runs along width (Y-axis)
    // Left wall (X=-halfWidth) is short, right wall (X=halfWidth) is tall
    const leftZ = baseZ + shortWallHeight;
    const rightZ = baseZ + tallWallHeight;

    // Shed roof plane
    const roofPath = `
      M ${-halfWidth},0,${leftZ}
      L ${-halfWidth},${length},${leftZ}
      L ${halfWidth},${length},${rightZ}
      L ${halfWidth},0,${rightZ}
      Z
    `;

    elements.push(
      createSVGElement("path", {
        d: roofPath,
        fill: colors.roof,
        stroke: colors.roofEdge,
        "stroke-width": "0.5",
      })
    );

    // Triangular end walls (front and back)
    const frontEndPath = `
      M ${-halfWidth},0,${baseZ}
      L ${-halfWidth},0,${leftZ}
      L ${halfWidth},0,${rightZ}
      L ${halfWidth},0,${baseZ}
      Z
    `;
    const backEndPath = `
      M ${-halfWidth},${length},${baseZ}
      L ${-halfWidth},${length},${leftZ}
      L ${halfWidth},${length},${rightZ}
      L ${halfWidth},${length},${baseZ}
      Z
    `;

    elements.push(
      createSVGElement("path", {
        d: frontEndPath,
        fill: colors.wall,
        stroke: colors.wallEdge,
        "stroke-width": "0.5",
      })
    );
    elements.push(
      createSVGElement("path", {
        d: backEndPath,
        fill: colors.wall,
        stroke: colors.wallEdge,
        "stroke-width": "0.5",
      })
    );
  }
}
```

### Testing Scenarios

#### Test Case 1: Basic Shed Roof
**Inputs**:
- `d_85` = 200 m² (roof area)
- `g_106` = 3.0 m (short wall height)
- Footprint = 10m × 15m (ridge along 15m length)
- `d_86` = 200 m² (wall area, includes triangular ends)

**Expected Results**:
- Ridge orientation: "longitudinal"
- Slope length ≈ 13.33 m (200 / 15)
- Height ≈ 13.14 m (from √(13.33² - 10²))
- Tall wall ≈ 16.14 m (3.0 + 13.14)
- End wall area ≈ 131.4 m² (10 × 13.14)
- Remaining wall ≈ 68.6 m² (200 - 131.4)

#### Test Case 2: Low-Slope Shed
**Inputs**:
- `d_85` = 160 m² (roof area)
- `g_106` = 3.0 m (short wall height)
- Footprint = 10m × 15m
- `d_86` = 150 m²

**Expected Results**:
- Slope length ≈ 10.67 m (160 / 15)
- Height ≈ 3.33 m (from √(10.67² - 10²))
- Tall wall ≈ 6.33 m
- End wall area ≈ 33.3 m²
- Remaining wall ≈ 116.7 m²

#### Test Case 3: Invalid Geometry (roof too small)
**Inputs**:
- `d_85` = 100 m² (roof area TOO SMALL)
- `g_106` = 3.0 m
- Footprint = 10m × 15m

**Expected Results**:
- Slope length ≈ 6.67 m (100 / 15)
- h² < 0 (6.67² - 10² = negative)
- Fallback to flat roof
- Console warning about invalid geometry

#### Test Case 4: Transverse Ridge Orientation
**Inputs**:
- `d_85` = 200 m²
- `g_106` = 3.0 m
- Footprint = 15m × 10m (width > length)

**Expected Results**:
- Ridge orientation: "transverse" (ridge along 15m width)
- Same calculations as Test Case 1, but orientation flipped

### Implementation Steps

1. **Create branch**: `git checkout -b WOMBAT-SHED` from current main
2. **Add `calculateShedHeight()` function** to Section19.js after `calculateGableHeight()`
3. **Replace monoplane placeholder** with shed roof logic (lines 1256-1262)
4. **Update wall height calculation** to handle shed roof asymmetry
5. **Add volume verification** logging
6. **Update wombatRender.js** with shed roof geometry
7. **Test with all 4 test cases** above
8. **Verify visual output** in WOMBAT renderer
9. **Commit per `.clinerules`**: "Feat: Implement shed roof (monoplane) geometry solver"
10. **Create PR** to main with test results

### Success Criteria

✅ Shed roof implementation complete when:
1. `calculateShedHeight()` returns valid geometry for normal cases
2. Invalid geometry (roof too small) falls back to flat roof gracefully
3. Triangular end walls correctly subtracted from `d_86`
4. Volume constraint preserved (calculated volume ≈ d_105)
5. Renderer displays asymmetric walls (short vs tall) correctly
6. Both longitudinal and transverse orientations render properly
7. All 4 test cases pass with expected values
8. Console logging provides clear geometry breakdown

### Known Constraints

- **g_106 usage**: Represents short wall height (low eave), NOT total building height
- **Average wall height**: Used for volume calculation due to slope asymmetry
- **End wall extraction**: Same pattern as gable (triangular ends from d_86)
- **Ridge orientation**: Always along longer dimension (matches gable behavior)
- **No trig functions**: Pure rational trigonometry (Pythagorean theorem only)

---

## Future Enhancements

### Phase 4: Three.js Migration

**Goal**: Migrate from SVG to Three.js for true 3D interaction and export/import capabilities.

**Benefits**:
- Real-time rotation via OrbitControls
- Raycasting for interactive element selection
- glTF/OBJ export for CAD tool integration
- GPU-accelerated rendering
- Directional lights for solar shading visualization

**Status**: Planned for future release

### Phase 5: Window Distribution

**Goal**: Show window placement on facades based on S11 orientation data.

**Data Sources**:
- `d_88-d_92` - Window areas by cardinal direction (N, E, S, W, Other)
- `d_93` - Skylight area
- Start with simplified offset geometry on walls, windows inset from perimeter matching ration of wall
**Status**: Planned for future release

### Phase 6: Solar Radiation Overlay

**Goal**: Visualize solar gains on building surfaces with color-coded irradiance.

**Features**:
- Hourly/seasonal sun position calculation
- Surface-specific irradiance based on orientation
- Color gradient (blue → yellow → red) for heat gain intensity
- Integration with Section 10 for annual solar gains

**Status**: Planned for future release

---

## Core Principles

### 1. Volume is Sacred
`d_105`/`d_198` (Volume) is ALWAYS preserved exactly. All dimensions emerge from volume constraints.

### 2. Areas Drive Form
Roof pitch, wall heights, and building proportions emerge from area constraints, not pre-defined geometry.

### 3. No Validation Errors
Impossible geometry (e.g., roof area < floor area) renders visually as feedback rather than throwing errors.

### 4. Constraint Satisfaction Feedback
Visual conflicts (inverted pyramids, stretched walls) indicate when entered areas don't match typical building proportions.

### 5. Topology First, Realism Second
This is a **thermal topology model**, not an architectural model. Strange-looking geometry is feedback about thermal data, not a rendering bug.

---

## References

### Section Dependencies

**Upstream** (S19 reads from):
- Section 11 (Envelope Components) - `d_85`, `d_86` (roof/wall areas)
- Section 12 (Volume Metrics) - `h_15` (Conditioned Area), `d_101`, `d_102` (Ae/Ag)

**Bidirectional** (S19 mirrors):
- Section 12 - `d_105`/`d_151` (Volume), `d_103`/`d_150` (Stories)

**Downstream** (S19 publishes to):
- Section 12 - Geometry dimensions `h_155`, `h_156`, `h_157`

### Related Documents

- [4012-CHEATSHEET.md](./4012-CHEATSHEET.md) - Pattern A architecture guidelines
- [TECHNICAL2.md](../TECHNICAL2.md) - Core architecture reference

### Graphics Libraries (Future)

**Three.js** (Phase 3+ target):
- Official site: https://threejs.org/
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls
- GLTFExporter: https://threejs.org/docs/#examples/en/exporters/GLTFExporter
- glTF 2.0 spec: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

**Solar Calculations** (Phase 5):
- SunCalc.js: https://github.com/mourner/suncalc

---

## TODO: Basement Volume Subtraction Fix

**Status**: 🎯 **READY TO IMPLEMENT** (2025-12-16)
**Priority**: HIGH - Fixes story height collapse when basement present
**Reference**: [The Great Basement Caper - SOLVED.md](../The%20Great%20Basement%20Caper%20-%20SOLVED.md)

### The Bug
Currently, basement volume is NOT subtracted from conditioned volume (d_105), causing basement height to be included in above-grade wall height calculation, which then gets divided across stories.

**Current code** (Section19.js:1037-1059):
```javascript
const rectangularVolume = conditionedVolume - roofVolume;  // ❌ Missing basement!
```

**Result**: Story heights collapse when basement walls added (e.g., 0.22m for 1.5 stories)

### The Fix
Read basement data early, calculate basement volume, subtract from conditioned volume:

```javascript
// Read basement data EARLY (before wall height calc)
const basementWallArea_early = parseFloat(getModeAwareValue("d_94", isReferenceCalculation)) || 0;
const hasBasement_early = basementWallArea_early > 0;

// Calculate basement volume
let basementVolume = 0;
if (hasBasement_early && perimeter > 0) {
  const basementDepth_early = basementWallArea_early / perimeter;
  basementVolume = footprintArea * basementDepth_early;
}

// Subtract BOTH roof and basement from conditioned volume
const rectangularVolume = conditionedVolume - roofVolume - basementVolume;  // ✅ FIXED!
```

### Implementation Checklist
- [ ] Add basement data early-read (before line 1037)
- [ ] Calculate basement volume from basement depth
- [ ] Subtract basement volume from rectangular volume calculation
- [ ] Add diagnostic logging for volume breakdown
- [ ] Add validation warning when rectangularVolume < 100 m³
- [ ] Test with basement (d_94 > 0) and without (d_94 = 0)
- [ ] Test both Target and Reference modes
- [ ] Verify no "basement getting bigger" bug from previous attempt

### Expected Results
**With basement** (d_94 = 498 m², 3.2m depth):
- Basement volume correctly subtracted from d_105
- Above-grade wall height excludes basement height
- Story heights realistic (not collapsed)

**Without basement** (d_94 = 0):
- No change to current behavior
- basementVolume = 0

### Code Location
**File**: [Section19.js:1037-1071](../../src/sections/Section19.js#L1037-L1071)
**Function**: `solveGeometry()` - Phase 5: Wall Height Calculation

---

**Document Status**: ACTIVE - Production documentation
**Last Updated**: 2025-12-16
**Next Review**: After basement volume fix implementation
