/**
 * wombatWindows.js - WOMBAT Window Placement Module
 * TEUI 4.012 - Created 2025-12-22
 *
 * Phase 1: Vertical facade windows (N/E/S/W)
 * Phase 2: Skylights on roof surfaces (future)
 * Phase 3: Multi-storey division (future)
 *
 * Philosophy:
 * - Lightweight algebraic geometry (no iteration except square→rectangle conversion)
 * - Center-placed windows using diagonal bisection
 * - Square-first approach with rectangle fallback
 * - Facade-only placement between grade and eave line
 */

window.TEUI = window.TEUI || {};
window.TEUI.WombatWindows = (function () {
  "use strict";

  //==========================================================================
  // WINDOW DATA INTEGRATION
  //==========================================================================

  /**
   * Map window orientation to facade distribution (S10's orientation values).
   * Diagonal orientations split 50/50 between two facades; Average spreads over all four;
   * Skylight is not on a facade (Phase 2).
   */
  const ORIENTATION_MAP = {
    North: { north: 1.0 },
    East: { east: 1.0 },
    South: { south: 1.0 },
    West: { west: 1.0 },
    NorthEast: { north: 0.5, east: 0.5 },
    SouthEast: { south: 0.5, east: 0.5 },
    SouthWest: { south: 0.5, west: 0.5 },
    NorthWest: { north: 0.5, west: 0.5 },
    Average: { north: 0.25, east: 0.25, south: 0.25, west: 0.25 },
    Skylight: {},
  };

  /**
   * Read window areas from Section10 and map to facades: every window row (G.8.1 onward, Openings.js),
   * each with its own orientation, in the model being drawn. Doors are not drawn.
   * @param {boolean} isReference - read the Reference model's rows (ref_)
   * @returns {Object} windowsByFacade - Accumulated window area per facade
   */
  function mapWindowsToFacades(isReference = false) {
    const windowsByFacade = {
      north: 0,
      east: 0,
      south: 0,
      west: 0,
    };

    const SM = window.TEUI?.StateManager;
    const rows = (window.TEUI?.Openings?.ALL || []).filter(
      o => o.kind !== "door"
    );
    const prefix = isReference ? "ref_" : "";

    rows.forEach(o => {
      const area = parseFloat(
        String(SM?.getValue(`${prefix}d_${o.s10}`) ?? "0").replace(/,/g, "")
      );
      const orientation = SM?.getValue(`${prefix}e_${o.s10}`) || "Average";

      if (area > 0) {
        addWindowToFacade(windowsByFacade, area, orientation);
      }
    });

    return windowsByFacade;
  }

  /**
   * Add window area to facade(s) based on orientation
   * @param {Object} windowsByFacade - Accumulator object
   * @param {number} area - Window area in m²
   * @param {string} orientation - Cardinal or diagonal orientation
   */
  function addWindowToFacade(windowsByFacade, area, orientation) {
    const distribution =
      ORIENTATION_MAP[orientation] || ORIENTATION_MAP.Average;

    for (const [facade, ratio] of Object.entries(distribution)) {
      windowsByFacade[facade] += area * ratio;
    }
  }

  /**
   * Calculate facade dimensions and areas from geometry
   * @param {Object} geometry - Geometry object from Section19
   * @returns {Object} Facade areas and dimensions
   */
  function calculateFacadeAreas(geometry) {
    const width = geometry.width || 0;
    const length = geometry.length || 0;
    const wallHeight = geometry.wallHeight || 0;

    return {
      north: {
        width: width,
        height: wallHeight,
        area: width * wallHeight,
      },
      south: {
        width: width,
        height: wallHeight,
        area: width * wallHeight,
      },
      east: {
        width: length,
        height: wallHeight,
        area: length * wallHeight,
      },
      west: {
        width: length,
        height: wallHeight,
        area: length * wallHeight,
      },
    };
  }

  /**
   * Validate window areas against facade areas
   * @param {Object} windowsByFacade - Window areas per facade
   * @param {Object} facadeAreas - Available facade areas
   * @returns {Array} Array of warning messages
   */
  function validateWindowAreas(windowsByFacade, facadeAreas) {
    const warnings = [];

    for (const [facade, windowArea] of Object.entries(windowsByFacade)) {
      if (windowArea > 0 && windowArea > facadeAreas[facade].area) {
        const msg = `${
          facade.charAt(0).toUpperCase() + facade.slice(1)
        } windows (${windowArea.toFixed(2)}m²) exceed facade area (${facadeAreas[
          facade
        ].area.toFixed(2)}m²)`;
        warnings.push(msg);
        console.warn(`[WOMBAT Windows] ${msg}`);
      }
    }

    return warnings;
  }

  //==========================================================================
  // WINDOW GEOMETRY GENERATION
  //==========================================================================

  /**
   * Get facade center point using cardinal direction detection
   * Respects BIM convention: Y+=North, Y-=South, X+=East, X-=West
   * Works across all aspect ratios (-5 to +5) by finding edge positions
   * @param {string} facade - Facade name (north, east, south, west)
   * @param {Object} geometry - Geometry object from Section19
   * @returns {Object} Center point {x, y, z}
   */
  function getFacadeCenter(facade, geometry) {
    const wallHeight = geometry.wallHeight || 0;

    // If nodes3D available, use actual ground corners with cardinal detection
    if (geometry.nodes3D && geometry.nodes3D.ground) {
      const ground = geometry.nodes3D.ground;

      // Calculate edge midpoints for all 4 edges
      const edges = {
        edge01: {
          center: {
            x: (ground[0].x + ground[1].x) / 2,
            y: (ground[0].y + ground[1].y) / 2,
          },
          nodes: [0, 1],
        },
        edge12: {
          center: {
            x: (ground[1].x + ground[2].x) / 2,
            y: (ground[1].y + ground[2].y) / 2,
          },
          nodes: [1, 2],
        },
        edge23: {
          center: {
            x: (ground[2].x + ground[3].x) / 2,
            y: (ground[2].y + ground[3].y) / 2,
          },
          nodes: [2, 3],
        },
        edge30: {
          center: {
            x: (ground[3].x + ground[0].x) / 2,
            y: (ground[3].y + ground[0].y) / 2,
          },
          nodes: [3, 0],
        },
      };

      // Find which edge has the most extreme position in each cardinal direction
      let northEdge, southEdge, eastEdge, westEdge;
      let maxY = -Infinity,
        minY = Infinity,
        maxX = -Infinity,
        minX = Infinity;

      for (const [_edgeName, edge] of Object.entries(edges)) {
        if (edge.center.y > maxY) {
          maxY = edge.center.y;
          northEdge = edge; // Y+ = North
        }
        if (edge.center.y < minY) {
          minY = edge.center.y;
          southEdge = edge; // Y- = South
        }
        if (edge.center.x > maxX) {
          maxX = edge.center.x;
          eastEdge = edge; // X+ = East
        }
        if (edge.center.x < minX) {
          minX = edge.center.x;
          westEdge = edge; // X- = West
        }
      }

      // Return center of the requested cardinal facade
      const facadeMap = {
        north: northEdge,
        south: southEdge,
        east: eastEdge,
        west: westEdge,
      };

      const selectedEdge = facadeMap[facade];

      // Debug logging to verify cardinal detection
      console.log(
        `[WOMBAT Windows] Facade "${facade}": edge center (${selectedEdge.center.x.toFixed(2)}, ${selectedEdge.center.y.toFixed(2)})`
      );

      return {
        x: selectedEdge.center.x,
        y: selectedEdge.center.y,
        z: wallHeight / 2, // Center height between grade and eave
      };
    }

    // Fallback: Use simple width/length calculation (for backward compatibility)
    const width = geometry.width || 0;
    const length = geometry.length || 0;

    const centers = {
      north: {
        x: 0,
        y: length / 2,
        z: wallHeight / 2,
      },
      south: {
        x: 0,
        y: -length / 2,
        z: wallHeight / 2,
      },
      east: {
        x: width / 2,
        y: 0,
        z: wallHeight / 2,
      },
      west: {
        x: -width / 2,
        y: 0,
        z: wallHeight / 2,
      },
    };

    return centers[facade] || { x: 0, y: 0, z: 0 };
  }

  /**
   * Generate window geometry for a facade
   * @param {string} facade - Facade name
   * @param {number} windowArea - Total window area for this facade (m²)
   * @param {Object} center - Facade center point
   * @param {number} maxWidth - Facade width constraint
   * @param {number} maxHeight - Facade height constraint (eave line)
   * @returns {Object} Window geometry with 4 corner nodes
   */
  function generateWindowGeometry(
    facade,
    windowArea,
    center,
    maxWidth,
    maxHeight
  ) {
    // Step 1: Try square window first
    let squareSide = Math.sqrt(windowArea);
    let windowWidth, windowHeight;

    // Allow windows to fill 100% of facade (curtainwall support)
    const maxAllowedWidth = maxWidth;
    const maxAllowedHeight = maxHeight;

    if (squareSide <= maxAllowedWidth && squareSide <= maxAllowedHeight) {
      // Square fits
      windowWidth = squareSide;
      windowHeight = squareSide;
    } else {
      // Step 2: Convert to rectangle
      if (squareSide > maxAllowedHeight) {
        // Window hits eave line - make horizontal rectangle
        windowHeight = maxAllowedHeight;
        windowWidth = windowArea / windowHeight;

        // Check if width now exceeds facade
        if (windowWidth > maxAllowedWidth) {
          console.warn(
            `[WOMBAT Windows] ${facade} window area too large, clamping to facade dimensions`
          );
          windowWidth = maxAllowedWidth;
          windowHeight = windowArea / windowWidth;
        }
      } else {
        // Window hits facade edge - make vertical rectangle
        windowWidth = maxAllowedWidth;
        windowHeight = windowArea / windowWidth;

        // Check if height now exceeds eave
        if (windowHeight > maxAllowedHeight) {
          console.warn(
            `[WOMBAT Windows] ${facade} window area too large, clamping to facade dimensions`
          );
          windowHeight = maxAllowedHeight;
          windowWidth = windowArea / windowHeight;
        }
      }
    }

    // Step 3: Generate corner nodes
    // Inset slightly from wall plane (0.05m outward for visibility in isometric)
    const insetDepth = 0.05;
    const halfWidth = windowWidth / 2;
    const halfHeight = windowHeight / 2;

    let nodes;

    // Generate nodes based on facade orientation
    if (facade === "north") {
      // North facade: y = +length/2, offset outward (+y)
      const y = center.y + insetDepth;
      nodes = [
        { x: center.x - halfWidth, y: y, z: center.z - halfHeight },
        { x: center.x + halfWidth, y: y, z: center.z - halfHeight },
        { x: center.x + halfWidth, y: y, z: center.z + halfHeight },
        { x: center.x - halfWidth, y: y, z: center.z + halfHeight },
      ];
    } else if (facade === "south") {
      // South facade: y = -length/2, offset outward (-y)
      const y = center.y - insetDepth;
      nodes = [
        { x: center.x - halfWidth, y: y, z: center.z - halfHeight },
        { x: center.x + halfWidth, y: y, z: center.z - halfHeight },
        { x: center.x + halfWidth, y: y, z: center.z + halfHeight },
        { x: center.x - halfWidth, y: y, z: center.z + halfHeight },
      ];
    } else if (facade === "east") {
      // East facade: x = +width/2, offset outward (+x)
      const x = center.x + insetDepth;
      nodes = [
        { x: x, y: center.y - halfWidth, z: center.z - halfHeight },
        { x: x, y: center.y + halfWidth, z: center.z - halfHeight },
        { x: x, y: center.y + halfWidth, z: center.z + halfHeight },
        { x: x, y: center.y - halfWidth, z: center.z + halfHeight },
      ];
    } else {
      // West facade: x = -width/2, offset outward (-x)
      const x = center.x - insetDepth;
      nodes = [
        { x: x, y: center.y - halfWidth, z: center.z - halfHeight },
        { x: x, y: center.y + halfWidth, z: center.z - halfHeight },
        { x: x, y: center.y + halfWidth, z: center.z + halfHeight },
        { x: x, y: center.y - halfWidth, z: center.z + halfHeight },
      ];
    }

    return {
      facade: facade,
      area: windowArea,
      width: windowWidth,
      height: windowHeight,
      nodes: nodes,
    };
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  /**
   * Calculate window geometries for all facades
   * @param {Object} geometry - Geometry object from Section19
   * @returns {Object} { windows: Array, warnings: Array }
   */
  function calculateWindows(geometry, isReference = false) {
    // Skip if geometry is invalid
    if (
      !geometry ||
      !geometry.width ||
      !geometry.length ||
      !geometry.wallHeight
    ) {
      return { windows: [], warnings: [] };
    }

    // Step 1: Map window areas to facades
    const windowsByFacade = mapWindowsToFacades(isReference);

    // Step 2: Calculate facade areas
    const facadeAreas = calculateFacadeAreas(geometry);

    // Step 3: Validate window areas
    const warnings = validateWindowAreas(windowsByFacade, facadeAreas);

    // Step 4: Generate window geometries
    const windows = [];

    for (const [facade, area] of Object.entries(windowsByFacade)) {
      if (area > 0) {
        const center = getFacadeCenter(facade, geometry);
        const windowGeometry = generateWindowGeometry(
          facade,
          area,
          center,
          facadeAreas[facade].width,
          facadeAreas[facade].height
        );
        windows.push(windowGeometry);
      }
    }

    console.log(`[WOMBAT Windows] Generated ${windows.length} window(s)`);
    if (warnings.length > 0) {
      console.warn(`[WOMBAT Windows] ${warnings.length} warning(s) flagged`);
    }

    return {
      windows: windows,
      warnings: warnings,
    };
  }

  //==========================================================================
  // MODULE EXPORT
  //==========================================================================

  return {
    calculateWindows: calculateWindows,
    mapWindowsToFacades: mapWindowsToFacades,
  };
})();
