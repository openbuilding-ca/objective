# Basis Vector Systems - Technical Reference

## Overview

The ART Explorer has **4 distinct basis vector systems** serving different purposes:

1. **Symbolic Quadray Basis (WXYZ)** - Tetrahedral coordinate reference
2. **Symbolic Cartesian Basis (XYZ)** - Orthogonal coordinate reference
3. **Editing Quadray Basis (WXYZ)** - Interactive gumball handles
4. **Editing Cartesian Basis (XYZ)** - Interactive gumball handles

## System Comparison

| System | File | Purpose | Interactive | Visibility | Visual Style |
|--------|------|---------|-------------|------------|--------------|
| Symbolic WXYZ | rt-rendering.js | Coordinate reference | No | Toggle via UI checkbox | Tetrahedral arrowheads |
| Symbolic XYZ | rt-rendering.js | Coordinate reference | No | Toggle via UI checkbox | Conical arrowheads (THREE.ArrowHelper) |
| Editing WXYZ | rt-init.js | Transform handles | Yes | Appears when Form selected | Conical arrowheads + hexagonal rotation handles |
| Editing XYZ | rt-init.js | Transform handles | Yes | Appears when Form selected | Conical arrowheads + circular rotation handles |

## ✅ FINAL SOLUTION - Dynamic Regeneration

### The Problem
Initially tried to pre-calculate a base length that would reach the correct grid intervals after scaling. This approach failed because:
1. The tetEdge value changes with slider input
2. Pre-calculated base lengths couldn't adapt to runtime changes
3. Complex scaling math was error-prone and hard to reason about

### The Solution ✓
**Regenerate the basis vectors in `updateGeometry()` with the exact target length**

Instead of:
- Create arrows once with base length
- Scale the entire group in updateGeometry()

We now:
- Clear and recreate arrows in updateGeometry()
- Calculate exact length: `(tetEdge + 1) × QUADRAY_GRID_INTERVAL`
- No scaling applied - arrows are exact length needed

### Implementation (rt-rendering.js ~line 1824)

```javascript
// Quadray basis vectors: Recreate with correct length
// REQUIREMENT: tetEdge measured in grid intervals, basis = (tetEdge + 1) grid intervals
// tetEdge=2 → basis reaches 3 grid intervals (3 × 0.612 = 1.837)
// tetEdge=3 → basis reaches 4 grid intervals (4 × 0.612 = 2.448)
if (quadrayBasis) {
  // Clear existing basis
  while (quadrayBasis.children.length > 0) {
    quadrayBasis.remove(quadrayBasis.children[0]);
  }

  // Recreate with current tetEdge value
  const gridInterval = RT.PureRadicals.QUADRAY_GRID_INTERVAL; // √6/4 ≈ 0.612
  const targetLength = (tetEdge + 1) * gridInterval;
  const headSize = 0.15;
  const headTipExtension = headSize * Math.sqrt(3);
  const shaftLength = targetLength - headTipExtension;

  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

  Quadray.basisVectors.forEach((vec, i) => {
    const arrow = createTetrahedralArrow(vec, shaftLength, headSize, colors[i]);
    quadrayBasis.add(arrow);
  });
}
```

### Why This Works

1. **Direct calculation**: No complex scaling math - just calculate the exact length needed
2. **Always accurate**: Length is calculated fresh each time with current tetEdge value
3. **Simple to understand**: `targetLength = (tetEdge + 1) × gridInterval`
4. **Performance**: Negligible - only 4 arrows recreated per update

### Key Formula

```javascript
targetLength = (tetEdge + 1) × QUADRAY_GRID_INTERVAL
```

**Examples:**
- tetEdge = 2.0: `(2 + 1) × 0.612 = 1.836` (exactly 3 grid intervals) ✓
- tetEdge = 3.0: `(3 + 1) × 0.612 = 2.448` (exactly 4 grid intervals) ✓
- tetEdge = 2.828: `(2.828 + 1) × 0.612 = 2.343` (exactly 3.828 grid intervals) ✓

The basis vectors now **always extend exactly one grid interval beyond the tetrahedron edge** at any scale.

## Tetrahedral Arrowhead Geometry

### Success: Tip Extension Math ✓

Dual tetrahedron vertices at `(±s, ±s, ±s)` where s = headSize:
- Distance from center to tip: `s × √3`
- Shaft must be shortened by this amount

```javascript
const headSize = 0.15;
const headTipExtension = headSize * Math.sqrt(3); // ≈ 0.260
const shaftLength = totalLength - headTipExtension;
// Arrow tip reaches exactly: shaftLength + headTipExtension = totalLength ✓
```

This calculation is **geometrically correct** and preserved throughout.

## Grid Interval Mathematics

### Quadray Grid Interval (WXYZ)
```javascript
RT.PureRadicals.QUADRAY_GRID_INTERVAL = Math.sqrt(6) / 4; // ≈ 0.612
```

For a unit tetrahedron (halfSize = 1):
- Edge length: `2√2`
- Centroid-to-vertex distance: `√6/4` ✓

This is the **fundamental unit** for tetrahedral grid spacing.

### Cartesian Grid Interval (XYZ)
```javascript
// Cube edge length defines grid spacing
// Default: cubeEdge = 2.0
// Grid lines at integer intervals
```

Cartesian basis uses unit length (1.0) which scales by cubeEdge in updateGeometry().

## Code Locations

### Symbolic Basis Creation
**File:** `src/geometry/modules/rt-rendering.js`

**Quadray (WXYZ):**
- Initial creation: `createQuadrayBasis()` (lines ~462-507)
- Dynamic regeneration: `updateGeometry()` (lines ~1824-1845)
- Arrowheads: Custom tetrahedral via `createTetrahedralArrow()` (lines ~353-427)
- Length: `(tetEdge + 1) × QUADRAY_GRID_INTERVAL` (regenerated each update)

**Cartesian (XYZ):**
- Creation: Inline in `initScene()` (lines ~295-340)
- Length: Unit length (1.0) scaled by cubeEdge
- Arrowheads: THREE.ArrowHelper (conical)
- Scaling: `cartesianBasis.scale.set(cubeEdge, ...)` in updateGeometry()

### Editing Basis Creation
**File:** `src/geometry/modules/rt-init.js`

**Function:** `createEditingBasis(position, selectedObject)` (lines ~1507-1860)

Creates interactive gumball handles that scale with tetEdge for optimal interaction.

## Lessons Learned

### ❌ What Didn't Work
1. **Pre-calculated base length with scaling**: Too complex, error-prone
2. **Fixed 3x grid intervals**: Didn't scale with geometry
3. **Complex scaling formulas**: Hard to debug when wrong

### ✅ What Worked
1. **Dynamic regeneration**: Simple, direct, always correct
2. **Clear formula**: `(tetEdge + 1) × gridInterval`
3. **Separation of concerns**: Creation vs. scaling handled separately

### 🎯 Key Insight

**When the relationship between values is dynamic, recalculate rather than pre-calculate.**

The performance cost of recreating 4 arrows per update is negligible compared to the clarity and correctness gained.

## Testing Checklist

- [x] tetEdge = 2.0 → arrows reach 3rd grid interval exactly
- [x] tetEdge = 3.0 → arrows reach 4th grid interval exactly
- [x] tetEdge = 2.828 → arrows reach 3.828 grid intervals
- [x] Tetrahedral arrowheads distinguish WXYZ from XYZ
- [x] Basis vectors scale smoothly with slider
- [x] Grid intervals remain fixed (not scaled)
- [x] Editing basis (gumball) still functional

## References

- **rt-math.js**: PureRadicals constants (`QUADRAY_GRID_INTERVAL`)
- **rt-polyhedra.js**: Dual tetrahedron geometry (line 141)
- **rt-rendering.js**: Symbolic basis creation & updateGeometry()
- **rt-init.js**: Editing basis (gumball) creation

---

*Solution finalized 2026-01-13: Dynamic regeneration with direct length calculation.*
