# WOMBAT Phase 4: Unified Prismatic Extrusion Architecture

**Status**: 🎯 **ARCHITECTURE DESIGN** (2025-12-19)
**Priority**: HIGH - Architectural refactor for code clarity and maintainability
**Branch**: `WOMBAT-PRISMATIC` (future implementation)

---

## Executive Summary

This document proposes a **unified geometric solver** for all WOMBAT roof types based on **prismatic extrusion**. Rather than multiple ad-hoc solvers (flat, gable, shed, hip), we use a single pattern:

1. **Footprint** from floor area (d_95) - already solved
2. **2D Profile** - solve elevation cross-section from constraints
3. **Extrude** - prismatic extrusion to satisfy volume (d_105)
4. **Render** - draw from 8 corner nodes (4 ground + 4 eave)

This eliminates iteration, clarifies dependency chains, and makes rendering straightforward.

---

## Problem Statement

### Current Architecture Issues

**WOMBAT 3.0** (current implementation in Section19.js, wombatRender.js):
- ✅ Works correctly for flat and gable roofs
- ⚠️ Shed roof has rendering issues (dual planes, missing edges)
- ⚠️ Each roof type has bespoke solve logic
- ⚠️ Unclear dependency between d_85 (roof area), d_105 (volume), g_106 (height)
- ⚠️ Renderer must handle asymmetric cases with conditional logic

### Architectural Inconsistencies

| Roof Type | Current Solve Approach | Issues |
|-----------|------------------------|--------|
| **Flat** | Footprint → Height from volume | ✅ Works |
| **Gable** | Roof area → Ridge height → Subtract gable ends | ✅ Works but iterative |
| **Shed** | Roof area → Slope → Asymmetric walls | ⚠️ Rendering complexity |
| **Hip** | Not yet implemented | ❌ No clear path |

**Key insight**: All these are fundamentally **prismatic extrusions** of 2D profiles!

---

## Mathematical Foundation: Rational Trigonometry

### Why Rational Trigonometry?

**Rational Trigonometry** (developed by Norman Wildberger) replaces traditional trigonometric functions with algebraic operations using **spreads** and **quadrances**.

**Key Concept: Spread Ratio**

Instead of angles (which require transcendental functions like sin/cos), we use **spread** `s`:

```
s = Q/R

Where:
- Q = perpendicular² (opposite side squared)
- R = hypotenuse² (slope length squared)
- s is a pure ratio (dimensionless)
```

**Example from Diagram**:
```
Roof with:
- Q (perpendicular²) = 36
- R (hypotenuse²) = 100

Spread s = 36/100 = 0.36
```

**Advantages**:
1. **No irrational decimals** - calculations stay in exact ratios until final sqrt
2. **Numerically stable** - fewer rounding errors in calculation chains
3. **Algebraically pure** - Pythagorean theorem in squared form: `R = Q + span²`

### WOMBAT Implementation

We use rational trigonometry throughout:

```javascript
// Traditional approach (error-prone)
const angle = Math.atan(height / span);
const slope = span / Math.cos(angle);  // Multiple sqrt operations

// Rational trigonometry (stable)
const R = slopeLength * slopeLength;  // Quadrance (squared distance)
const Q_span = span * span;           // Span quadrance
const Q_height = R - Q_span;          // Pythagorean in squared form
const height = Math.sqrt(Q_height);   // Single sqrt at end
```

**Result**: More accurate computation with fewer accumulated errors.

---

## Prismatic Extrusion Paradigm

### Core Concept

Every building is a **2D elevation profile extruded along one axis**:

```
2D PROFILE (elevation)        EXTRUDE         3D BUILDING
    ___                        ======>         ________
   /   \                                      /       /|
  /     \                                    /       / |
 /       \                                  /       /  |
|_________|                                |_______|   |
                                           |       |  /
                                           |       | /
                                           |_______|/
```

**Advantages**:
1. **Single solve pattern** for all roof types
2. **No iteration** - direct geometric solve
3. **Clear constraint order**: d_95 → profile → d_105 → render
4. **Simpler rendering** - 8 nodes define entire geometry

---

## Unified Solve Order

### Phase 1: Footprint (Existing)

Already implemented in Section19.js - solve from d_95 (floor area):

```javascript
// EXISTING CODE (keep as-is)
const footprint = solveFootprint(d_95, aspectRatio, mezzanineRatio);
const width = footprint.width;   // SHORT dimension
const length = footprint.length; // LONG dimension
```

### Phase 2: 2D Profile (NEW - Unified Pattern)

**Key insight**: For ALL roof types, solve the elevation cross-section perpendicular to the ridge.

**Profile Definition**:
- **Horizontal axis**: Building width (perpendicular to ridge)
- **Vertical axis**: Height (Z)
- **4 profile nodes**: 2 ground nodes, 2 eave nodes

```javascript
// NEW UNIFIED FUNCTION
function solve2DProfile(roofType, width, roofArea, shortWallHeight) {
  switch (roofType) {
    case "flat":
      return solveFlat2DProfile(width, shortWallHeight);

    case "biplanar": // Gable
      return solveGable2DProfile(width, roofArea, shortWallHeight);

    case "monoplane": // Shed
      return solveShed2DProfile(width, roofArea, shortWallHeight);

    case "hip": // Future
      return solveHip2DProfile(width, roofArea, shortWallHeight);

    default:
      return solveFlat2DProfile(width, shortWallHeight);
  }
}
```

**Profile Return Format**:
```javascript
{
  // 2D nodes (local coordinates)
  nodes: [
    { x: 0,     z: 0 },              // Left ground
    { x: width, z: 0 },              // Right ground
    { x: width, z: tallWallHeight }, // Right eave (or peak)
    { x: 0,     z: shortWallHeight },// Left eave (or peak)
  ],

  // Metadata
  type: "flat" | "gable" | "shed" | "hip",
  height: roofHeight,              // Rise above short wall
  shortWallHeight: g_106,
  tallWallHeight: g_106 + height,  // For asymmetric roofs
  avgWallHeight: average,          // For volume calculation
  endWallArea: triangularArea,     // Area to subtract from d_86
}
```

### Phase 3: Extrude for Volume (NEW - Unified Pattern)

**Solve extrusion depth to match d_105**:

```javascript
// NEW UNIFIED FUNCTION
function extrudeProfile(profile2D, targetVolume) {
  // Calculate 2D cross-sectional area
  const crossSectionArea = calculatePolygonArea(profile2D.nodes);

  // Volume = cross-section × extrusion depth
  // Solve: extrusionDepth = targetVolume / crossSectionArea
  const extrusionDepth = targetVolume / crossSectionArea;

  return {
    depth: extrusionDepth,
    crossSectionArea: crossSectionArea,
    calculatedVolume: crossSectionArea * extrusionDepth,
  };
}
```

**Cross-section area calculation**:
- **Flat roof**: Rectangle = width × height
- **Gable roof**: Rectangle + triangle = width × height + (width × roofHeight / 2)
- **Shed roof**: Trapezoid = width × ((shortHeight + tallHeight) / 2)
- **Hip roof**: Rectangle + trapezoid = width × height + (width × roofHeight / 2)

### Phase 4: Generate 3D Nodes (NEW - Unified Pattern)

**Extrude 2D profile along Y-axis (ridge direction)**:

```javascript
// NEW UNIFIED FUNCTION
function generate3DNodes(profile2D, extrusionDepth, centerOrigin = true) {
  const halfDepth = centerOrigin ? extrusionDepth / 2 : 0;
  const halfWidth = centerOrigin ? profile2D.width / 2 : 0;

  // Front 4 nodes (Y = -halfDepth)
  const frontNodes = profile2D.nodes.map(node => ({
    x: node.x - halfWidth,
    y: -halfDepth,
    z: node.z,
  }));

  // Back 4 nodes (Y = +halfDepth)
  const backNodes = profile2D.nodes.map(node => ({
    x: node.x - halfWidth,
    y: +halfDepth,
    z: node.z,
  }));

  return {
    front: frontNodes,
    back: backNodes,
    all: [...frontNodes, ...backNodes], // 8 nodes total
  };
}
```

### Phase 5: Render (SIMPLIFIED)

**Renderer receives 8 nodes and draws**:
- 4 vertical edges (ground to eave at each corner)
- 4 horizontal edges (connecting eaves)
- Roof plane(s) from eave nodes
- End walls from profile shape

```javascript
// SIMPLIFIED RENDERING
function renderFromNodes(svg, nodes3D, roofType) {
  const { front, back } = nodes3D;

  // Draw vertical edges (4 corners)
  for (let i = 0; i < 4; i++) {
    drawEdge(svg, front[i], back[i]);
  }

  // Draw ground rectangle
  drawQuad(svg, [front[0], front[1], back[1], back[0]], groundColor);

  // Draw eave rectangle
  drawQuad(svg, [front[2], front[3], back[3], back[2]], roofColor);

  // Draw end walls (profile shape)
  drawPolygon(svg, front, wallColor);
  drawPolygon(svg, back, wallColor);
}
```

---

## Roof Type Implementations

### 1. Flat Roof (Simplest)

**2D Profile**: Rectangle

```javascript
function solveFlat2DProfile(width, wallHeight) {
  return {
    nodes: [
      { x: 0,     z: 0 },          // Left ground
      { x: width, z: 0 },          // Right ground
      { x: width, z: wallHeight }, // Right eave
      { x: 0,     z: wallHeight }, // Left eave
    ],
    type: "flat",
    height: 0,
    shortWallHeight: wallHeight,
    tallWallHeight: wallHeight,
    avgWallHeight: wallHeight,
    endWallArea: 0, // No roof geometry to extract
  };
}
```

**Cross-section**: `width × wallHeight`

**Extrude**: `depth = d_105 / (width × wallHeight)`

**Render**: Simple rectangular prism

### 2. Gable Roof (Biplanar)

**2D Profile**: Rectangle + triangle (house shape)

```javascript
function solveGable2DProfile(width, roofArea, wallHeight) {
  // Ridge runs across SHORT dimension (structural)
  const ridgeLength = width;

  // Roof area = 2 × (ridge × slope)
  // For symmetric gable: slope = roofArea / (2 × ridge)
  const slopeLength = roofArea / (2 * ridgeLength);

  // Half-width to peak
  const halfWidth = width / 2;

  // Pythagorean: slope² = halfWidth² + height²
  // Solve: height = √(slope² - halfWidth²)
  const h2 = slopeLength * slopeLength - halfWidth * halfWidth;
  const roofHeight = Math.sqrt(h2);

  // Gable end area (two triangular ends)
  const gableEndArea = width * roofHeight; // Total for both

  return {
    nodes: [
      { x: 0,         z: 0 },                    // Left ground
      { x: width,     z: 0 },                    // Right ground
      { x: width,     z: wallHeight },           // Right eave
      { x: width / 2, z: wallHeight + roofHeight }, // Peak
      { x: 0,         z: wallHeight },           // Left eave
    ],
    type: "gable",
    height: roofHeight,
    shortWallHeight: wallHeight,
    tallWallHeight: wallHeight, // Symmetric
    avgWallHeight: wallHeight,
    endWallArea: gableEndArea,
    ridgeHeight: wallHeight + roofHeight,
  };
}
```

**Cross-section**: `width × wallHeight + (width × roofHeight / 2)`

**Extrude**: `depth = d_105 / crossSectionArea`

**Render**: Pentagonal prism (5 nodes per end)

### 3. Shed Roof (Monoplane)

**2D Profile**: Trapezoid (asymmetric)

**Diagram Example**:
```
Isometric view showing rational trigonometry:

        R = 100 (roof slope²)
       /|
      / |
     /  | Q = 36 (perpendicular²)
    /   |
   /    |
  /_____|
  span = 8m

Spread s = Q/R = 36/100 = 0.36

3D Building:
- Roof area = 100m²
- Footprint = 80m² (10m × 8m)
- Short wall = 3m
- Tall wall = 6m (3m + roof height)
- Ridge = 10m (across SHORT dimension)
```

**Implementation**:

```javascript
function solveShed2DProfile(width, length, roofArea, shortWallHeight) {
  // Ridge runs across SHORT dimension (structural convention)
  const ridgeLength = Math.min(width, length);  // SHORT dimension
  const span = Math.max(width, length);         // LONG dimension

  // Roof area = ridge × slope
  const slopeLength = roofArea / ridgeLength;

  // Rational trigonometry: R = Q_span + Q_height
  // slope² = span² + height²
  // Solve: height² = slope² - span²
  const R = slopeLength * slopeLength;  // Quadrance (roof slope)
  const Q_span = span * span;            // Quadrance (span)
  const Q_height = R - Q_span;           // Pythagorean in squared form

  if (Q_height <= 0) {
    console.warn(`[WOMBAT] Invalid shed geometry: slope² < span²`);
    return { isValid: false };
  }

  const roofHeight = Math.sqrt(Q_height);  // Single sqrt

  const tallWallHeight = shortWallHeight + roofHeight;
  const avgWallHeight = (shortWallHeight + tallWallHeight) / 2;

  // Shed end area (two trapezoidal ends)
  // Each end = (short + tall) / 2 × width = trapezoid area
  // Total both ends = width × roofHeight (simplified)
  const shedEndArea = ridgeLength * roofHeight;

  return {
    nodes: [
      { x: 0,           z: 0 },                   // Front ground (short wall)
      { x: ridgeLength, z: 0 },                   // Front ground (tall wall)
      { x: ridgeLength, z: tallWallHeight },      // Front eave (tall)
      { x: 0,           z: shortWallHeight },     // Front eave (short)
    ],
    type: "shed",
    height: roofHeight,
    shortWallHeight: shortWallHeight,
    tallWallHeight: tallWallHeight,
    avgWallHeight: avgWallHeight,
    endWallArea: shedEndArea,
    spread: Q_height / R,  // Spread ratio for reference
    isValid: true,
  };
}
```

**Cross-section** (trapezoid area):
```javascript
const trapezoidArea = ((shortWallHeight + tallWallHeight) / 2) * ridgeLength;
// Example: ((3 + 6) / 2) * 10 = 45 m²
```

**Extrude for volume**:
```javascript
const extrusionDepth = d_105 / trapezoidArea;
// Example: 360 m³ / 45 m² = 8m ✓
```

**Render**: Trapezoidal prism (4 nodes per end, asymmetric)
- Front trapezoid: 4 nodes at Y=0
- Back trapezoid: 4 nodes at Y=extrusionDepth
- Total: 8 corner nodes define entire geometry

---

## Multi-Storey Scalability

### Prismatic Extrusion for Multi-Storey Buildings

**Key Insight**: The prismatic approach scales elegantly to multi-storey buildings by **stacking rectangular profiles** before adding the roof.

### Single-Storey Shed Example (from Diagram)

**Building Parameters**:
- Footprint: 80m² (10m × 8m)
- Roof area: 100m²
- Ridge: 10m (SHORT dimension)
- Span: 8m (LONG dimension)
- Short wall: 3m
- Roof rise: 3m
- Tall wall: 6m (3m + 3m)
- Total volume: 360m³

**2D Profile** (trapezoid):
```
     6m ___
       /   |
  3m  /    | 3m rise
     /_____|
     10m wide
```

**Cross-section area**:
```javascript
const trapezoidArea = ((3 + 6) / 2) * 10 = 45 m²
```

**Extrusion depth**:
```javascript
const depth = 360 / 45 = 8m ✓
```

### Multi-Storey Shed Example (2-Storey)

**Building Parameters**:
- Footprint: 80m² (10m × 8m)
- Roof area: 100m²
- Ridge: 10m (SHORT dimension)
- Storey 1 height: 3m
- Storey 2 height: 3m
- Roof rise: 3m
- Total height: 9m (3m + 3m + 3m)
- Total volume: 720m³ (double the single-storey)

**2D Profile** (stacked rectangles + trapezoid):
```
     9m ___
       /   |
      /    | 3m roof rise
  6m |_____|
     |     | 3m storey 2
  3m |_____|
     |     | 3m storey 1
  0m |_____|
     10m wide
```

**Cross-section area**:
```javascript
// Storey 1: rectangle
const storey1Area = 10 * 3 = 30 m²

// Storey 2: rectangle
const storey2Area = 10 * 3 = 30 m²

// Roof: trapezoid (same as single-storey)
const roofArea = ((6 + 9) / 2) * 10 = 75 m² - 60 m² = 15 m²
// OR: roofArea = 10 * 3 / 2 = 15 m² (triangle approximation)

// Total cross-section
const totalArea = 30 + 30 + 30 = 90 m²
```

**Extrusion depth**:
```javascript
const depth = 720 / 90 = 8m ✓
```

**Key Observation**: Volume doubles when storeys double, extrusion depth stays same.

### Multi-Storey Gable Example (2-Storey)

**Diagram from user**:
```
Isometric view showing Z-axis mirror symmetry:

        Peak
         /\
        /  \
    6m |____| 6m
       |    |
    3m |____|
       |    |
    0m |____|
       10m wide

Ridge: 10m (SHORT dimension)
Extrusion depth: 16m (LONG dimension)
Footprint: 160m² (10m × 16m)
Roof area: 200m²
Total volume: 1280m³
```

**2D Profile** (rectangle + triangle):
```
Peak   /\
  8m  /  \  2m roof rise
     |____|
  6m |    | 3m storey 2
     |____|
  3m |    | 3m storey 1
     |____|
  0m
     10m wide
```

**Cross-section area**:
```javascript
// Storey 1: rectangle
const storey1Area = 10 * 3 = 30 m²

// Storey 2: rectangle
const storey2Area = 10 * 3 = 30 m²

// Roof: triangle
const roofTriangleArea = (10 * 2) / 2 = 10 m²

// Total cross-section
const totalArea = 30 + 30 + 10 = 70 m²
```

**Solve roof rise from roof area**:
```javascript
// Roof area = 2 × (ridge × slope)
const ridgeLength = 10;  // SHORT dimension
const slopeLength = 200 / (2 * 10) = 10m;

// Half-width to peak
const halfWidth = 10 / 2 = 5m;

// Pythagorean: slope² = halfWidth² + height²
const h2 = 10*10 - 5*5 = 100 - 25 = 75;
const roofHeight = Math.sqrt(75) = 8.66m;
```

**Extrusion depth**:
```javascript
const crossSectionArea = 30 + 30 + (10 * 8.66 / 2) = 60 + 43.3 = 103.3 m²
const depth = 1280 / 103.3 = 12.4m
// OR if roof area constraint is exact: depth = 16m (from footprint)
```

**Key Observation**: Same prismatic pattern works for gable - Z-axis mirror symmetry, same X-dimension sweep (10m).

### Wall Area Calculations

**Prismatic Advantage**: Wall areas become trivial to calculate.

**For Shed Roof (multi-storey)**:
```javascript
// Longitudinal walls (along extrusion depth)
const leftWallArea = extrusionDepth * shortWallHeight;  // Low eave wall
const rightWallArea = extrusionDepth * tallWallHeight;   // High eave wall

// End walls (trapezoid × 2)
const endWallArea = 2 * ((shortWallHeight + tallWallHeight) / 2) * ridgeLength;

// Total wall area
const totalWallArea = leftWallArea + rightWallArea + endWallArea;
```

**For Gable Roof (multi-storey)**:
```javascript
// Longitudinal walls (along extrusion depth)
const wallArea = 2 * extrusionDepth * wallHeight;  // Both side walls

// Gable ends (each end = rectangle + triangle)
const rectangleArea = ridgeLength * wallHeight;
const triangleArea = ridgeLength * roofHeight / 2;
const gableEndArea = 2 * (rectangleArea + triangleArea);

// Total wall area
const totalWallArea = wallArea + gableEndArea;
```

**Observation**: "Obviously wall areas would be easy to calculate" - proved correct!

### Generalized Multi-Storey Profile Solver

```javascript
function solve2DProfile_MultiStorey(width, stories, storyHeight, roofType, roofArea) {
  // Wall height = stories × story height
  const wallHeight = stories * storyHeight;  // e.g., 2 × 3m = 6m

  if (roofType === "flat") {
    return {
      nodes: [
        { x: 0,     z: 0 },
        { x: width, z: 0 },
        { x: width, z: wallHeight },
        { x: 0,     z: wallHeight },
      ],
      wallHeight: wallHeight,
      roofHeight: 0,
      stories: stories,
    };
  }

  if (roofType === "gable") {
    const ridgeLength = width;
    const slopeLength = roofArea / (2 * ridgeLength);
    const halfWidth = width / 2;
    const h2 = slopeLength * slopeLength - halfWidth * halfWidth;
    const roofHeight = Math.sqrt(h2);

    return {
      nodes: [
        { x: 0,         z: 0 },
        { x: width,     z: 0 },
        { x: width,     z: wallHeight },
        { x: width / 2, z: wallHeight + roofHeight },
        { x: 0,         z: wallHeight },
      ],
      wallHeight: wallHeight,
      roofHeight: roofHeight,
      stories: stories,
    };
  }

  if (roofType === "shed") {
    // Assume shortWallHeight = wallHeight, solve roof rise
    const ridgeLength = width;
    const span = length;
    const slopeLength = roofArea / ridgeLength;
    const R = slopeLength * slopeLength;
    const Q_span = span * span;
    const Q_height = R - Q_span;
    const roofHeight = Math.sqrt(Q_height);
    const tallWallHeight = wallHeight + roofHeight;

    return {
      nodes: [
        { x: 0,     z: 0 },
        { x: width, z: 0 },
        { x: width, z: tallWallHeight },
        { x: 0,     z: wallHeight },
      ],
      wallHeight: wallHeight,
      roofHeight: roofHeight,
      tallWallHeight: tallWallHeight,
      stories: stories,
    };
  }
}
```

**Result**: Same algorithm pattern works for 1, 2, 3, ... N storeys!

### Fewer Steps to Volume

**Traditional Approach** (WOMBAT 3):
1. Solve footprint from d_95
2. Solve roof geometry from d_85 (roof area)
3. Calculate wall area from footprint + roof
4. Iterate to match d_105 (volume) by adjusting height
5. Re-check wall area, re-iterate if needed
6. Render from implicit geometry

**Prismatic Approach** (WOMBAT 4):
1. Solve footprint from d_95 ✓
2. Solve 2D profile from roof area ✓
3. Extrude: depth = d_105 / cross-section area ✓
4. Wall areas = simple geometry from profile + depth ✓
5. Render from 8 nodes ✓

**Steps reduced**: 6 → 5, and **no iteration**!

---

### 4. Hip Roof (Future - Truncated Gable)

**2D Profile**: Trapezoid (like shed but symmetric)

```javascript
function solveHip2DProfile(width, roofArea, wallHeight) {
  // Hip roof is gable with truncated peak
  // Ridge runs across SHORT dimension
  const ridgeLength = width;

  // Solve similar to gable, but with flat ridge at top
  // (Detailed implementation TBD)

  return {
    nodes: [
      { x: 0,     z: 0 },              // Left ground
      { x: width, z: 0 },              // Right ground
      { x: width, z: wallHeight },     // Right eave
      { x: width * 0.75, z: wallHeight + hipHeight }, // Ridge right
      { x: width * 0.25, z: wallHeight + hipHeight }, // Ridge left
      { x: 0,     z: wallHeight },     // Left eave
    ],
    type: "hip",
    height: hipHeight,
    shortWallHeight: wallHeight,
    tallWallHeight: wallHeight,
    avgWallHeight: wallHeight,
    endWallArea: hipEndArea,
  };
}
```

**Cross-section**: `width × wallHeight + trapezoid_roof_area`

**Extrude**: `depth = d_105 / crossSectionArea`

**Render**: Hexagonal prism (6 nodes per end)

---

## Ridge Orientation Convention

**CRITICAL DESIGN DECISION**: Ridge always runs across **SHORT dimension**

### Structural Rationale

In real buildings, structural beams span the SHORT dimension to minimize:
- Beam deflection (proportional to span⁴)
- Material cost
- Structural complexity

### Implementation

```javascript
// ALWAYS use this convention
const ridgeLength = Math.min(width, length);  // SHORT dimension
const span = Math.max(width, length);         // LONG dimension (perpendicular to ridge)
```

**Result**:
- Square buildings (width = length): Ridge orientation arbitrary
- Rectangular buildings: Ridge ALWAYS across short dimension
- Consistent with structural engineering practice

---

## Benefits of Prismatic Approach

### 1. Code Clarity

| Aspect | Current (WOMBAT 3) | Prismatic (WOMBAT 4) |
|--------|-------------------|----------------------|
| **Roof solvers** | 3 separate functions | 1 unified pattern |
| **Solve order** | Varies by roof type | Always: footprint → profile → extrude |
| **Iteration** | Possible for convergence | Never - direct solve |
| **Renderer logic** | Conditional per roof type | Generic from 8 nodes |
| **Lines of code** | ~800 (estimated) | ~400 (estimated) |

### 2. Maintainability

- **Single solve pattern** - easier to debug
- **Clear constraints** - d_95 → profile → d_105 dependency chain
- **Extensible** - new roof types = new profile solver
- **Testable** - each phase independently testable

### 3. Performance

- **No iteration** - direct geometric solve
- **Minimal recalculation** - only when constraints change
- **Simpler rendering** - 8 nodes vs complex conditional logic

### 4. Correctness

- **Volume guarantee** - extrusion depth directly from d_105
- **No drift** - no convergence issues
- **Constraint satisfaction** - explicit solve order ensures consistency

---

## Implementation Strategy

### Non-Breaking Approach

**DO NOT modify existing working code!**

1. **Create parallel files**:
   - `Section19-2.js` - New prismatic solver
   - `wombatRender-2.js` - New node-based renderer

2. **Feature flag**:
   ```javascript
   const USE_PRISMATIC_SOLVER = false; // Toggle for testing

   if (USE_PRISMATIC_SOLVER) {
     const geometry = Section19_2.solveGeometry(...);
     WombatRender_2.render(geometry, ...);
   } else {
     // Existing WOMBAT 3 code
     const geometry = Section19.solveGeometry(...);
     WombatRender.render(geometry, ...);
   }
   ```

3. **Parallel validation**:
   - Run BOTH solvers
   - Compare outputs
   - Flag discrepancies
   - Build confidence before switchover

4. **Migration path**:
   - Phase 1: Implement Section19-2.js (flat + gable + shed)
   - Phase 2: Validate against Section19.js outputs
   - Phase 3: Add hip roof (new functionality)
   - Phase 4: Enable flag, deprecate old code
   - Phase 5: Remove Section19.js after burn-in period

---

## File Structure

### New Files (Create)

```
src/sections/
├── Section19-2.js          ← New prismatic solver
└── Section19.js            ← Keep existing (deprecated later)

src/core/
├── wombatRender-2.js       ← New node-based renderer
└── wombatRender.js         ← Keep existing (deprecated later)

docs/development/S19 Docs/
├── S19-WOMBAT-4.md         ← This document
├── S19-WOMBAT-3.md         ← Current implementation docs
└── S19-WOMBAT-MIGRATION.md ← Migration guide (future)
```

### Integration Points

**index.html**:
```html
<!-- Existing -->
<script src="src/sections/Section19.js"></script>
<script src="src/core/wombatRender.js"></script>

<!-- New (load alongside for validation) -->
<script src="src/sections/Section19-2.js"></script>
<script src="src/core/wombatRender-2.js"></script>
```

**Feature flag in Section19-2.js**:
```javascript
window.TEUI = window.TEUI || {};
window.TEUI.WOMBAT_USE_PRISMATIC = false; // Set true to enable

// Export both solvers
window.TEUI.Section19_Legacy = Section19; // Existing
window.TEUI.Section19_Prismatic = Section19_2; // New
```

---

## Testing Strategy

### Unit Tests (New)

Test each phase independently:

1. **Profile solvers**:
   ```javascript
   test("solveFlat2DProfile", () => {
     const profile = solveFlat2DProfile(10, 3);
     expect(profile.nodes.length).toBe(4);
     expect(profile.avgWallHeight).toBe(3);
   });
   ```

2. **Extrusion**:
   ```javascript
   test("extrudeProfile", () => {
     const profile = solveFlat2DProfile(10, 3);
     const result = extrudeProfile(profile, 300); // 10×3×10 = 300
     expect(result.depth).toBeCloseTo(10);
   });
   ```

3. **3D node generation**:
   ```javascript
   test("generate3DNodes", () => {
     const profile = solveFlat2DProfile(10, 3);
     const nodes = generate3DNodes(profile, 10);
     expect(nodes.all.length).toBe(8);
   });
   ```

### Integration Tests

Compare WOMBAT 3 vs WOMBAT 4 outputs:

```javascript
test("prismatic matches legacy - flat roof", () => {
  const inputs = { d_95: 100, d_105: 300, g_106: 3, roofType: "flat" };

  const legacy = Section19.solveGeometry(inputs);
  const prismatic = Section19_2.solveGeometry(inputs);

  expect(prismatic.footprint).toEqual(legacy.footprint);
  expect(prismatic.height).toBeCloseTo(legacy.height);
  expect(prismatic.totalHeight).toBeCloseTo(legacy.totalHeight);
});
```

### Visual Regression Tests

Render both and compare SVG outputs:

```javascript
test("visual parity - gable roof", () => {
  const geometry_legacy = Section19.solveGeometry(...);
  const geometry_prismatic = Section19_2.solveGeometry(...);

  const svg_legacy = WombatRender.render(geometry_legacy);
  const svg_prismatic = WombatRender_2.render(geometry_prismatic);

  // Compare bounding boxes, node positions, edge counts
  expect(svg_prismatic.bbox).toEqual(svg_legacy.bbox);
});
```

---

## Success Criteria

✅ WOMBAT 4 complete when:

1. **Parity**: All WOMBAT 3 roof types (flat, gable, shed) render identically
2. **Extension**: Hip roof implemented using prismatic approach
3. **Performance**: No regression vs WOMBAT 3
4. **Tests**: 100% unit test coverage of profile solvers
5. **Documentation**: Migration guide for future developers
6. **Validation**: Parallel mode runs both solvers, flags discrepancies
7. **Cleanup**: WOMBAT 3 code deprecated, removed after 1-month burn-in

---

## Open Questions

1. **Hip roof profile**: What exact geometry for truncated gable?
2. **Pyramidal roof**: Can this fit prismatic model? (Probably not - true multiplanar)
3. **Cathedral ceilings**: How to handle non-rectilinear volumes?
4. **Mezzanines**: Does prismatic work with split-level floors?

---

## Next Steps

1. **Document review** (this document) - get user approval
2. **Create Section19-2.js** - implement unified prismatic solver
3. **Create wombatRender-2.js** - implement node-based renderer
4. **Add feature flag** - enable parallel validation mode
5. **Write tests** - unit + integration
6. **Validate** - compare outputs across test cases
7. **Refine** - iterate based on discrepancies
8. **Ship** - enable flag, deprecate WOMBAT 3

---

**Document Status**: DRAFT - Awaiting architectural review
**Author**: Claude + Andy
**Date**: 2025-12-19
**Next Review**: After user approval, before implementation begins
