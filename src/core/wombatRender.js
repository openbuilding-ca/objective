/**
 * wombatRender-2.js - WOMBAT Prismatic Rendering (WOMBAT 4)
 * TEUI 4.012
 *
 * Minimal stub renderer for prismatic extrusion approach
 * Will render from 8-node geometry (4 ground + 4 eave corners)
 */

window.TEUI = window.TEUI || {};
window.TEUI.WombatRender = (function () {
  "use strict";

  //==========================================================================
  // CONFIGURATION
  //==========================================================================

  const config = {
    canvasWidth: 900,
    canvasHeight: 600,
    colors: {
      target: "#007bff", // Blue for Target mode
      reference: "#dc3545", // Red for Reference mode
      ground: "#8b4513", // Brown for ground-facing (Ag)
      air: "#b0e0e6", // Powder blue for air-facing (Ae)
    },
  };

  //==========================================================================
  // ISOMETRIC PROJECTION
  //==========================================================================

  /**
   * Convert 3D coordinates to 2D isometric projection
   * Uses Z-up convention: X+=East, Y+=North, Z+=Up
   */
  function toIsometric(x, y, z, scale, centerX, centerY) {
    const isoX = Math.cos(Math.PI / 6); // 0.866
    const isoY = Math.sin(Math.PI / 6); // 0.5

    return {
      x: centerX + (x - y) * isoX * scale,
      y: centerY - (x + y) * isoY * scale - z * scale,
    };
  }

  //==========================================================================
  // SVG HELPERS
  //==========================================================================

  /**
   * Create SVG line element
   */
  function createLine(p1, p2, stroke, strokeWidth = 3) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
    line.setAttribute("stroke", stroke);
    line.setAttribute("stroke-width", strokeWidth);
    line.setAttribute("stroke-linecap", "round");
    return line;
  }

  /**
   * Create SVG circle node
   */
  function createNode(point, fill, radius = 5) {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", fill);
    circle.setAttribute("stroke", "#000");
    circle.setAttribute("stroke-width", "1");
    return circle;
  }

  /**
   * Create SVG text element
   */
  function createText(x, y, text, color, fontSize = 11, options = {}) {
    const textEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textEl.setAttribute("x", x);
    textEl.setAttribute("y", y);
    textEl.setAttribute("fill", color);
    textEl.setAttribute("font-size", fontSize);

    if (options.anchor) {
      textEl.setAttribute("text-anchor", options.anchor);
    }

    textEl.textContent = text;
    return textEl;
  }

  //==========================================================================
  // PLACEHOLDER RENDERING
  //==========================================================================

  /**
   * Draw placeholder message when visualization is inactive
   */
  function renderPlaceholder(svg) {
    const centerX = config.canvasWidth / 2;
    const centerY = config.canvasHeight / 2;

    // Title text
    const titleText = createText(
      centerX,
      centerY - 40,
      "WOMBAT 4 - Prismatic 3D Thermal Topology",
      "#6c757d",
      16,
      { anchor: "middle" }
    );
    svg.appendChild(titleText);

    // Instruction text
    const instructionText = createText(
      centerX,
      centerY,
      "Click 'Activate Topology View' to generate 3D model",
      "#6c757d",
      14,
      { anchor: "middle" }
    );
    svg.appendChild(instructionText);

    // Subtitle text
    const subtitleText = createText(
      centerX,
      centerY + 30,
      "Constraint-driven thermal visualization (areas → form)",
      "#999",
      12,
      { anchor: "middle" }
    );
    svg.appendChild(subtitleText);
  }

  //==========================================================================
  // MAIN RENDER FUNCTION
  //==========================================================================

  /**
   * Main render function - draws 8-node prismatic geometry
   * @param {Object} geometry - Geometry data with nodes3D
   * @param {String} mode - "target" or "reference"
   * @param {SVGElement} svg - SVG container element
   * @param {Object} options - Additional render options
   */
  function render(geometry, mode, svg, options = {}) {
    console.log("[WombatRender-4] Prismatic render called");
    console.log("  Geometry:", geometry);
    console.log("  Mode:", mode);
    console.log("  Options:", options);

    const isReference = mode === "reference";

    // Clear SVG
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    // Validate geometry
    if (!geometry || !geometry.nodes3D) {
      console.error("[WombatRender-4] Invalid geometry - missing nodes3D");
      const errorText = createText(
        config.canvasWidth / 2,
        config.canvasHeight / 2,
        "Error: Invalid geometry",
        "#dc3545",
        16,
        { anchor: "middle" }
      );
      svg.appendChild(errorText);
      return;
    }

    const { ground, eave, ridge } = geometry.nodes3D;

    // Calculate bounding box from extremes: basement bottom, ground corners, ridge/eave top
    const basementDepth = geometry.belowGrade?.hasBasement
      ? geometry.belowGrade.basementDepth || 0
      : 0;
    const minZ = -basementDepth; // Bottom of basement (or 0 if no basement)
    // For shed roofs, eave heights vary - find the maximum z across all eave nodes
    const maxZ = ridge ? ridge[0].z : Math.max(...eave.map(node => node.z));

    const boundingWidth = geometry.footprint.width;
    const boundingLength = geometry.footprint.length;
    const boundingHeight = maxZ - minZ;

    // Calculate scale to fit entire model in canvas with padding
    const maxDim = Math.max(boundingWidth, boundingLength, boundingHeight);
    const scale =
      Math.min(config.canvasWidth, config.canvasHeight) / (maxDim * 1.8);

    const centerX = config.canvasWidth / 2;
    // Shift view up when basement is present to keep model centered in visible space
    const centerY =
      config.canvasHeight / 2 + (minZ < 0 ? minZ * scale * 0.3 : 0);

    // Choose color based on mode
    const color = isReference ? config.colors.reference : config.colors.target;

    // Project ground and eave nodes to isometric
    const groundProj = ground.map(node =>
      toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
    );
    const eaveProj = eave.map(node =>
      toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
    );

    // Project ridge nodes if present (gable roof)
    const ridgeProj = ridge
      ? ridge.map(node =>
          toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
        )
      : null;

    // Draw ground rectangle (4 edges)
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      const line = createLine(groundProj[i], groundProj[next], color, 2);
      svg.appendChild(line);
    }

    // Draw eave rectangle (4 edges)
    for (let i = 0; i < 4; i++) {
      const next = (i + 1) % 4;
      const line = createLine(eaveProj[i], eaveProj[next], color, 2);
      svg.appendChild(line);
    }

    // Draw vertical edges (4 edges connecting ground to eave)
    for (let i = 0; i < 4; i++) {
      const line = createLine(groundProj[i], eaveProj[i], color, 2);
      svg.appendChild(line);
    }

    // Draw roof edges based on type
    if (ridgeProj) {
      if (geometry.roofType === "hip" || geometry.roofType === "pyramid") {
        // HIP/PYRAMID ROOF (polyhedral)
        if (ridgeProj.length === 1) {
          // PYRAMID: 4 hip rafters from corners to single apex
          const apex = ridgeProj[0];
          for (let i = 0; i < 4; i++) {
            const hipRafter = createLine(eaveProj[i], apex, color, 2);
            svg.appendChild(hipRafter);
          }
        } else if (ridgeProj.length === 2) {
          // HIP: 4 hip rafters + ridge line + optional main slope edges
          // Ridge line (connecting two ridge endpoints)
          const ridgeLine = createLine(ridgeProj[0], ridgeProj[1], color, 2);
          svg.appendChild(ridgeLine);

          // 4 Hip rafters (from eave corners to ridge endpoints)
          // Front corners to front ridge endpoint
          const frontLeftHip = createLine(eaveProj[0], ridgeProj[0], color, 2);
          const frontRightHip = createLine(eaveProj[1], ridgeProj[0], color, 2);
          svg.appendChild(frontLeftHip);
          svg.appendChild(frontRightHip);

          // Back corners to back ridge endpoint
          const backLeftHip = createLine(eaveProj[3], ridgeProj[1], color, 2);
          const backRightHip = createLine(eaveProj[2], ridgeProj[1], color, 2);
          svg.appendChild(backLeftHip);
          svg.appendChild(backRightHip);
        }
      } else {
        // GABLE ROOF (prismatic)
        // Ridge line (front to back)
        const ridgeLine = createLine(ridgeProj[0], ridgeProj[1], color, 2);
        svg.appendChild(ridgeLine);

        // Front gable (eave corners to front ridge)
        const frontLeft = createLine(eaveProj[0], ridgeProj[0], color, 2);
        const frontRight = createLine(eaveProj[1], ridgeProj[0], color, 2);
        svg.appendChild(frontLeft);
        svg.appendChild(frontRight);

        // Back gable (eave corners to back ridge)
        const backLeft = createLine(eaveProj[3], ridgeProj[1], color, 2);
        const backRight = createLine(eaveProj[2], ridgeProj[1], color, 2);
        svg.appendChild(backLeft);
        svg.appendChild(backRight);
      }
    }

    // Draw nodes (circles)
    ground.forEach((node, i) => {
      const circle = createNode(groundProj[i], config.colors.ground, 4);
      svg.appendChild(circle);
    });
    eave.forEach((node, i) => {
      const circle = createNode(eaveProj[i], config.colors.air, 4);
      svg.appendChild(circle);
    });
    if (ridgeProj) {
      ridge.forEach((node, i) => {
        const circle = createNode(ridgeProj[i], "#ff6b6b", 5); // Red for ridge peaks
        svg.appendChild(circle);
      });
    }

    // Render intermediate floor planes for multi-storey buildings
    renderFloorPlanes(svg, geometry, ground, scale, centerX, centerY);

    // Render below-grade geometry (basement, slab, grade line)
    if (geometry.belowGrade) {
      renderBelowGradeGeometry(svg, geometry, color, scale, centerX, centerY);
    }

    // Render windows (Phase 1: Facade windows)
    if (geometry.windows && geometry.windows.length > 0) {
      renderWindows(svg, geometry, scale, centerX, centerY);
    }

    // Add title annotation
    const title = createText(
      20,
      14,
      `WOMBAT 4 - ${geometry.roofType} roof (${isReference ? "Reference" : "Target"})`,
      color,
      14
    );
    svg.appendChild(title);

    // Add dimensions annotation
    const dims = createText(
      20,
      32,
      `${geometry.footprint.width.toFixed(1)}m × ${geometry.footprint.length.toFixed(1)}m × ${geometry.totalHeight.toFixed(1)}m`,
      "#666",
      12
    );
    svg.appendChild(dims);

    // Add legend annotations
    renderLegend(svg, geometry, mode);

    // Add coordinate axes indicator (bottom-right corner)
    // Pass aspect ratio SIGN to determine orientation (180° rotation at aspect=0)
    const aspectRatio = geometry.footprint.length / geometry.footprint.width;
    renderCoordinateAxes(svg, aspectRatio);

    console.log("[WombatRender-4] Rendered successfully");
  }

  //==========================================================================
  // FLOOR PLANES RENDERING (Multi-Storey)
  //==========================================================================

  /**
   * Render horizontal floor planes for multi-storey buildings
   * Shows intermediate floor levels as gray hairlines
   *
   * @param {SVGElement} svg - SVG container
   * @param {Object} geometry - Geometry object with stories, storyHeight
   * @param {Array} ground - Ground corner nodes (3D coordinates)
   * @param {number} scale - Isometric scale factor
   * @param {number} centerX - Canvas center X
   * @param {number} centerY - Canvas center Y
   */
  function renderFloorPlanes(svg, geometry, ground, scale, centerX, centerY) {
    const stories = geometry.stories || 1;
    const storyHeight = geometry.storyHeight || geometry.height;

    if (stories <= 1) {
      return; // No intermediate floors for single-storey
    }

    // Draw horizontal floor planes at each storey boundary
    // Iterate from 1 to stories-1 (intermediate floors only, not ground or eave)
    for (let i = 1; i < stories; i++) {
      const floorZ = i * storyHeight;

      // Create 4 corner points at this floor level
      // Use ground footprint corners, just elevated to floor height
      const floorCorners = [
        { x: ground[0].x, y: ground[0].y, z: floorZ },
        { x: ground[1].x, y: ground[1].y, z: floorZ },
        { x: ground[2].x, y: ground[2].y, z: floorZ },
        { x: ground[3].x, y: ground[3].y, z: floorZ },
      ];

      // Draw floor plane as rectangular perimeter (4 edges)
      for (let j = 0; j < 4; j++) {
        const p1 = toIsometric(
          floorCorners[j].x,
          floorCorners[j].y,
          floorCorners[j].z,
          scale,
          centerX,
          centerY
        );
        const p2 = toIsometric(
          floorCorners[(j + 1) % 4].x,
          floorCorners[(j + 1) % 4].y,
          floorCorners[(j + 1) % 4].z,
          scale,
          centerX,
          centerY
        );

        // Gray hairline (solid, thin, visible but subtle)
        const line = createLine(p1, p2, "#666666", 0.5);
        line.setAttribute("opacity", "0.6");
        svg.appendChild(line);
      }

      // Add corner nodes at each floor level
      for (let j = 0; j < 4; j++) {
        const pt = toIsometric(
          floorCorners[j].x,
          floorCorners[j].y,
          floorCorners[j].z,
          scale,
          centerX,
          centerY
        );
        const node = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        node.setAttribute("cx", pt.x);
        node.setAttribute("cy", pt.y);
        node.setAttribute("r", 2); // Smaller than structural nodes
        node.setAttribute("fill", "#666666");
        node.setAttribute("opacity", "0.6");
        svg.appendChild(node);
      }
    }
  }

  //==========================================================================
  // BELOW-GRADE GEOMETRY RENDERING (Basement, Slab, Grade Line)
  //==========================================================================

  /**
   * Render below-grade geometry including basement walls, slab-on-grade, raised floor, and grade line
   * @param {SVGElement} svg - SVG container
   * @param {Object} geometry - Geometry object with belowGrade data
   * @param {String} color - Mode color (blue for target, red for reference)
   * @param {number} scale - Isometric scale factor
   * @param {number} centerX - Canvas center X
   * @param {number} centerY - Canvas center Y
   */
  function renderBelowGradeGeometry(
    svg,
    geometry,
    color,
    scale,
    centerX,
    centerY
  ) {
    const { belowGrade, footprint, nodes3D } = geometry;
    const {
      hasBasement,
      hasSlab,
      hasRaisedFloor,
      basementDepth,
      foundationType,
    } = belowGrade;

    const gradeColor = "#8b4513"; // Brown (matches .text-ground-facing)

    // CRITICAL: Use the SAME coordinates as the building's ground nodes
    // This ensures basement aligns perfectly regardless of aspect ratio
    // Don't use footprint.width/length - those are logical dimensions, not 3D coordinates
    const gradeCorners = nodes3D.ground.map(node => ({ ...node, z: 0 }));

    // ========================================================================
    // GRADE LINE (appears when ground-facing components exist)
    // ========================================================================
    if (hasBasement || hasSlab) {
      // CRITICAL: Use building's ground nodes to define grade line
      // This ensures perfect alignment regardless of aspect ratio
      // Grade line runs from front-left corner to front-right corner (across the front edge)
      const frontLeft = gradeCorners[0]; // nodes3D.ground[0]
      const frontRight = gradeCorners[1]; // nodes3D.ground[1]

      // Calculate direction vector for grade line extension
      const dx = frontRight.x - frontLeft.x;
      const dy = frontRight.y - frontLeft.y;
      const lineLength = Math.sqrt(dx * dx + dy * dy);

      // Extend 40 pixels in 2D space (convert back to 3D space based on scale)
      const extension3D = 40 / scale;
      const extensionX = (dx / lineLength) * extension3D;
      const extensionY = (dy / lineLength) * extension3D;

      const gradeStart = toIsometric(
        frontLeft.x - extensionX,
        frontLeft.y - extensionY,
        0,
        scale,
        centerX,
        centerY
      );
      const gradeEnd = toIsometric(
        frontRight.x + extensionX,
        frontRight.y + extensionY,
        0,
        scale,
        centerX,
        centerY
      );

      // Dashed line at z=0
      const gradeLine = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line"
      );
      gradeLine.setAttribute("x1", gradeStart.x);
      gradeLine.setAttribute("y1", gradeStart.y);
      gradeLine.setAttribute("x2", gradeEnd.x);
      gradeLine.setAttribute("y2", gradeEnd.y);
      gradeLine.setAttribute("stroke", gradeColor);
      gradeLine.setAttribute("stroke-width", "2");
      gradeLine.setAttribute("stroke-dasharray", "8,4");
      gradeLine.setAttribute("opacity", "0.7");
      svg.appendChild(gradeLine);

      // Label
      const gradeLabel = createText(
        gradeEnd.x + 10,
        gradeEnd.y + 5,
        "Grade",
        gradeColor,
        10
      );
      gradeLabel.setAttribute("font-style", "italic");
      svg.appendChild(gradeLabel);
    }

    // ========================================================================
    // BASEMENT WALLS (brown dashed verticals from z=0 to z=-depth)
    // ========================================================================
    if (hasBasement) {
      // Basement floor corners (z=-depth)
      const basementCorners = gradeCorners.map(c => ({
        ...c,
        z: -basementDepth,
      }));

      // Draw vertical edges (basement walls) - DASHED (hidden line effect)
      gradeCorners.forEach((top, i) => {
        const bottom = basementCorners[i];
        const p1 = toIsometric(top.x, top.y, top.z, scale, centerX, centerY);
        const p2 = toIsometric(
          bottom.x,
          bottom.y,
          bottom.z,
          scale,
          centerX,
          centerY
        );

        const edge = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        edge.setAttribute("x1", p1.x);
        edge.setAttribute("y1", p1.y);
        edge.setAttribute("x2", p2.x);
        edge.setAttribute("y2", p2.y);
        edge.setAttribute("stroke", gradeColor);
        edge.setAttribute("stroke-width", "2"); // Match above-grade line weight
        edge.setAttribute("stroke-dasharray", "8,4"); // Hidden line (below ground)
        svg.appendChild(edge);
      });

      // Draw basement floor perimeter - DASHED
      basementCorners.forEach((corner, i) => {
        const next = basementCorners[(i + 1) % 4];
        const p1 = toIsometric(
          corner.x,
          corner.y,
          corner.z,
          scale,
          centerX,
          centerY
        );
        const p2 = toIsometric(next.x, next.y, next.z, scale, centerX, centerY);

        const edge = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        edge.setAttribute("x1", p1.x);
        edge.setAttribute("y1", p1.y);
        edge.setAttribute("x2", p2.x);
        edge.setAttribute("y2", p2.y);
        edge.setAttribute("stroke", gradeColor);
        edge.setAttribute("stroke-width", "2"); // Match above-grade line weight
        edge.setAttribute("stroke-dasharray", "8,4");
        svg.appendChild(edge);
      });

      // Draw basement corner nodes (brown circles)
      basementCorners.forEach(corner => {
        const p = toIsometric(
          corner.x,
          corner.y,
          corner.z,
          scale,
          centerX,
          centerY
        );
        const node = createNode(p, gradeColor, 4); // Match other node sizes
        svg.appendChild(node);
      });

      // Depth annotation - calculate dimensions from gradeCorners
      const frontLeft = gradeCorners[0];
      const backLeft = gradeCorners[3];
      const actualWidth = Math.abs(frontLeft.x - gradeCorners[1].x);
      const actualLength = Math.abs(frontLeft.y - backLeft.y);

      const depthMidpoint = toIsometric(
        -actualWidth / 2 - 8,
        actualLength / 2,
        -basementDepth / 2,
        scale,
        centerX,
        centerY
      );
      const depthLabel = createText(
        depthMidpoint.x - 30,
        depthMidpoint.y,
        `${basementDepth.toFixed(1)}m`,
        gradeColor,
        11
      );
      depthLabel.setAttribute("text-anchor", "middle");
      svg.appendChild(depthLabel);
    }

    // ========================================================================
    // SLAB-ON-GRADE (brown SOLID perimeter at z=0, only if no basement)
    // ========================================================================
    if (hasSlab && !hasBasement) {
      // Draw slab perimeter - SOLID (at grade, visible)
      gradeCorners.forEach((corner, i) => {
        const next = gradeCorners[(i + 1) % 4];
        const p1 = toIsometric(
          corner.x,
          corner.y,
          corner.z,
          scale,
          centerX,
          centerY
        );
        const p2 = toIsometric(next.x, next.y, next.z, scale, centerX, centerY);

        const edge = createLine(p1, p2, gradeColor, 2); // Match above-grade line weight
        // NO stroke-dasharray - solid line for at-grade component
        svg.appendChild(edge);
      });

      // Draw corner nodes
      gradeCorners.forEach(corner => {
        const p = toIsometric(
          corner.x,
          corner.y,
          corner.z,
          scale,
          centerX,
          centerY
        );
        const node = createNode(p, gradeColor, 4); // Match other node sizes
        svg.appendChild(node);
      });
    }

    // ========================================================================
    // RAISED FLOOR (BLUE/RED perimeter - AIR-FACING, not brown!)
    // ========================================================================
    if (hasRaisedFloor && !hasSlab) {
      // CRITICAL: Raised floor is AIR-FACING, render in mode color (blue/red), NOT brown
      const floorColor = color; // Use mode color (blue for target, red for reference)

      // Draw floor perimeter - SOLID in mode color (air-facing surface)
      gradeCorners.forEach((corner, i) => {
        const next = gradeCorners[(i + 1) % 4];
        const p1 = toIsometric(
          corner.x,
          corner.y,
          corner.z,
          scale,
          centerX,
          centerY
        );
        const p2 = toIsometric(next.x, next.y, next.z, scale, centerX, centerY);

        const edge = createLine(p1, p2, floorColor, 2); // Match above-grade line weight
        // Solid line - it's visible (air-facing)
        svg.appendChild(edge);
      });

      // Draw corner nodes in mode color
      gradeCorners.forEach(corner => {
        const p = toIsometric(
          corner.x,
          corner.y,
          corner.z,
          scale,
          centerX,
          centerY
        );
        const node = createNode(p, floorColor, 4); // Match other node sizes
        svg.appendChild(node);
      });

      // Add "Raised Floor" label
      const labelPos = toIsometric(
        0,
        -length / 2 - 8,
        0,
        scale,
        centerX,
        centerY
      );
      const label = createText(
        labelPos.x,
        labelPos.y,
        "Raised Floor (Air-Facing)",
        floorColor,
        10
      );
      label.setAttribute("font-style", "italic");
      label.setAttribute("text-anchor", "middle");
      svg.appendChild(label);
    }

    // ========================================================================
    // MIXED FOUNDATION WARNING
    // ========================================================================
    if (foundationType === "mixed-foundation") {
      const warningPos = toIsometric(
        0,
        length / 2 + 8,
        0,
        scale,
        centerX,
        centerY
      );
      const warning = createText(
        warningPos.x,
        warningPos.y,
        "⚠️ Mixed Foundation",
        "#ff6600",
        11
      );
      warning.setAttribute("font-weight", "bold");
      warning.setAttribute("text-anchor", "middle");
      svg.appendChild(warning);
    }
  }

  //==========================================================================
  // WINDOW RENDERING (Phase 1: Facade Windows)
  //==========================================================================

  /**
   * Render window geometries on facades
   * @param {SVGElement} svg - SVG container
   * @param {Object} geometry - Geometry object with windows array
   * @param {number} scale - Isometric scale factor
   * @param {number} centerX - Canvas center X
   * @param {number} centerY - Canvas center Y
   */
  function renderWindows(svg, geometry, scale, centerX, centerY) {
    // Check if windows should be shown (d_160 dropdown)
    const windowVisibility =
      window.TEUI?.StateManager?.getValue("d_160") || "show";
    if (windowVisibility === "hide") {
      return; // Skip rendering if hidden
    }

    if (!geometry.windows || geometry.windows.length === 0) {
      return;
    }

    console.log(
      `[WombatRender] Rendering ${geometry.windows.length} window(s)`
    );

    geometry.windows.forEach(window => {
      // Project window corner nodes to isometric
      const nodesProj = window.nodes.map(node =>
        toIsometric(node.x, node.y, node.z, scale, centerX, centerY)
      );

      // Create window plane (yellow fill)
      const windowPath = `
        M ${nodesProj[0].x} ${nodesProj[0].y}
        L ${nodesProj[1].x} ${nodesProj[1].y}
        L ${nodesProj[2].x} ${nodesProj[2].y}
        L ${nodesProj[3].x} ${nodesProj[3].y}
        Z
      `;

      const windowPlane = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      windowPlane.setAttribute("d", windowPath);
      windowPlane.setAttribute("fill", "#FFFF00"); // Yellow
      windowPlane.setAttribute("fill-opacity", "0.4");
      windowPlane.setAttribute("stroke", "#0066CC"); // Blue
      windowPlane.setAttribute("stroke-width", "2");
      svg.appendChild(windowPlane);

      // Add corner nodes (blue circles, slightly smaller than wall nodes)
      nodesProj.forEach(corner => {
        const node = createNode(corner, "#0066CC", 3);
        svg.appendChild(node);
      });

      // Add cardinal direction label in center of window
      const centerX_window =
        (nodesProj[0].x + nodesProj[1].x + nodesProj[2].x + nodesProj[3].x) / 4;
      const centerY_window =
        (nodesProj[0].y + nodesProj[1].y + nodesProj[2].y + nodesProj[3].y) / 4;

      const label = window.facade.charAt(0).toUpperCase(); // "N", "E", "S", or "W"
      const labelText = createText(
        centerX_window,
        centerY_window,
        label,
        "#000000", // Black
        12 // Large font size
      );
      labelText.setAttribute("font-weight", "bold");
      labelText.setAttribute("text-anchor", "middle");
      labelText.setAttribute("dominant-baseline", "middle");
      svg.appendChild(labelText);
    });
  }

  //==========================================================================
  // LEGEND RENDERING
  //==========================================================================

  /**
   * Render legend with key metrics in upper-left area
   * @param {SVGElement} svg - SVG container
   * @param {Object} geometry - Geometry data
   * @param {String} mode - "target" or "reference"
   */
  function renderLegend(svg, geometry, mode) {
    const isReference = mode === "reference";
    let yOffset = 50; // Start below title and dimensions (moved up to align with table)
    const xOffset = 20;
    const lineHeight = 16; // Reduced from 18 to prevent overflow with basement fields
    const labelColor = "#666";
    const valueColor = "#333";

    // Helper to get values from StateManager with mode awareness
    function getValue(fieldId) {
      if (!window.TEUI?.StateManager) return null;
      const fullFieldId = isReference ? `ref_${fieldId}` : fieldId;
      return window.TEUI.StateManager.getValue(fullFieldId);
    }

    // Helper to format number with 2dp
    function format2dp(value) {
      const num = parseFloat(value);
      return isNaN(num) ? "0.00" : num.toFixed(2);
    }

    // 1. Footprint dimensions (Width × Length)
    const widthText = createText(
      xOffset,
      yOffset,
      `Width (X): ${geometry.footprint.width.toFixed(2)} m`,
      labelColor,
      11
    );
    svg.appendChild(widthText);
    yOffset += lineHeight;

    const lengthText = createText(
      xOffset,
      yOffset,
      `Length (Y): ${geometry.footprint.length.toFixed(2)} m`,
      labelColor,
      11
    );
    svg.appendChild(lengthText);
    yOffset += lineHeight;

    // 2. Storey Height
    const storeyHeight = getValue("h_156") || geometry.storyHeight.toFixed(2);
    const storeyText = createText(
      xOffset,
      yOffset,
      `Storey Height: ${format2dp(storeyHeight)} m`,
      labelColor,
      11
    );
    svg.appendChild(storeyText);
    yOffset += lineHeight;

    // 3. Floorplate Area: the slabs' type sum, or the exposed floors' (every S11 row of the type)
    const floorplateArea =
      parseFloat(getValue("transmissionLoss.slabOnGrade.area")) ||
      parseFloat(getValue("transmissionLoss.exposedFloor.area")) ||
      "0.00";
    const floorplateText = createText(
      xOffset,
      yOffset,
      `Floorplate Area: ${format2dp(floorplateArea)} m²`,
      labelColor,
      11
    );
    svg.appendChild(floorplateText);
    yOffset += lineHeight;

    // 4. Roof Area: the roofs' type sum
    const roofArea = getValue("transmissionLoss.roof.area") || "0.00";
    const roofText = createText(
      xOffset,
      yOffset,
      `Roof Area: ${format2dp(roofArea)} m²`,
      labelColor,
      11
    );
    svg.appendChild(roofText);
    yOffset += lineHeight;

    // 5. Roof Height (Q dimension)
    const roofHeight = geometry.roofHeight || 0;
    const roofHeightText = createText(
      xOffset,
      yOffset,
      `Roof Ht. (Q): ${roofHeight.toFixed(2)} m`,
      labelColor,
      11
    );
    svg.appendChild(roofHeightText);
    yOffset += lineHeight;

    // 5b. Roof Pitch (rise:12 ratio for all pitched roofs)
    if (
      geometry.roofType === "gable" ||
      geometry.roofType === "shed" ||
      geometry.roofType === "hip" ||
      geometry.roofType === "pyramid"
    ) {
      const pitchRise = geometry.pitchRise || 0;
      if (pitchRise > 0) {
        const pitchText = createText(
          xOffset,
          yOffset,
          `Roof Pitch: ${pitchRise.toFixed(1)}:12`,
          labelColor,
          11
        );
        svg.appendChild(pitchText);
        yOffset += lineHeight;
      }
    }

    // 6. End Wall Area (gable or shed specific)
    if (geometry.roofType === "gable" || geometry.roofType === "shed") {
      const endWallArea = geometry.profile2D?.endWallArea || 0;
      const endWallLabel =
        geometry.roofType === "gable"
          ? "Gable End Wall Area"
          : "Shed End Wall Area";
      const endWallText = createText(
        xOffset,
        yOffset,
        `${endWallLabel}: ${endWallArea.toFixed(2)} m²`,
        labelColor,
        11
      );
      svg.appendChild(endWallText);
      yOffset += lineHeight;
    }

    // 7. Ae Wall Area (air-facing longitudinal walls - calculated from geometry)
    // For prismatic geometry: 2 longitudinal walls × length × wall height
    const longitudinalWallArea =
      2 * geometry.footprint.length * geometry.height;
    const aeWallText = createText(
      xOffset,
      yOffset,
      `Ae Wall Area: ${longitudinalWallArea.toFixed(2)} m²`,
      labelColor,
      11
    );
    svg.appendChild(aeWallText);
    yOffset += lineHeight;

    // 7b. Ag (Area exposed to Ground) - if basement or slab present
    if (
      geometry.belowGrade &&
      (geometry.belowGrade.hasBasement || geometry.belowGrade.hasSlab)
    ) {
      const basementWallArea = geometry.belowGrade.basementWallArea || 0;
      const slabArea = geometry.belowGrade.slabArea || 0;
      const agTotal = basementWallArea + slabArea;

      const agText = createText(
        xOffset,
        yOffset,
        `Ag (Ground): ${agTotal.toFixed(2)} m²`,
        "#8b4513", // Brown
        11
      );
      svg.appendChild(agText);
      yOffset += lineHeight;

      // Foundation type subtitle
      const typeNames = {
        "full-basement": "Full Basement",
        "slab-on-grade": "Slab-on-Grade",
        "raised-floor": "Raised Floor",
        "basement-no-slab": "Basement (no slab)",
        "mixed-foundation": "Mixed Foundation",
      };

      const typeText = createText(
        xOffset + 10,
        yOffset,
        typeNames[geometry.belowGrade.foundationType] || "Unknown",
        "#8b4513",
        9
      );
      typeText.setAttribute("font-style", "italic");
      svg.appendChild(typeText);
      yOffset += lineHeight;
    }

    // 8. Volume (from d_105) - for verification
    const volume = getValue("d_105") || "0.00";
    const volumeText = createText(
      xOffset,
      yOffset,
      `Volume: ${format2dp(volume)} m³`,
      valueColor,
      11,
      { fontWeight: "bold" }
    );
    svg.appendChild(volumeText);
    yOffset += lineHeight;

    // 9. Window Area (Phase 1: Total window area across all facades)
    if (geometry.windows && geometry.windows.length > 0) {
      const totalWindowArea = geometry.windows.reduce(
        (sum, win) => sum + win.area,
        0
      );
      const windowText = createText(
        xOffset,
        yOffset,
        `Total Window Area: ${totalWindowArea.toFixed(2)} m²`,
        "#0066CC", // Blue to match window rendering
        11
      );
      svg.appendChild(windowText);
      yOffset += lineHeight;
    }

    // 10. Window warnings (if any)
    if (geometry.windowWarnings && geometry.windowWarnings.length > 0) {
      geometry.windowWarnings.forEach(warning => {
        const warningText = createText(
          xOffset,
          yOffset,
          `⚠️ ${warning}`,
          "#CC0000", // Red
          10,
          { fontWeight: "bold" }
        );
        svg.appendChild(warningText);
        yOffset += lineHeight;
      });
    }
  }

  //==========================================================================
  // COORDINATE AXES INDICATOR
  //==========================================================================

  /**
   * Render coordinate axes indicator
   * Positioned in bottom-right corner
   * Shows BIM convention: Y+=North (green), X+=East (red), Z+=Up (blue)
   * NOTE: Axes always show true BIM orientation regardless of building rotation
   */
  function renderCoordinateAxes(svg, _aspectRatio) {
    const x0 = config.canvasWidth - 100; // Bottom-right corner
    const y0 = config.canvasHeight - 80;
    const axisLength = 40;

    // Z-axis (Up) - blue (always vertical)
    const zLine = createLine(
      { x: x0, y: y0 },
      { x: x0, y: y0 - axisLength },
      "#0066cc",
      2
    );
    svg.appendChild(zLine);

    // Y-axis (North) - green, isometric pointing up-left (Y+ direction)
    const yEndIso = toIsometric(0, axisLength, 0, 1, x0, y0);
    const yLine = createLine({ x: x0, y: y0 }, yEndIso, "#00cc66", 2);
    svg.appendChild(yLine);

    // X-axis (East) - red, isometric pointing down-right (X+ direction)
    const xEndIso = toIsometric(axisLength, 0, 0, 1, x0, y0);
    const xLine = createLine({ x: x0, y: y0 }, xEndIso, "#cc0000", 2);
    svg.appendChild(xLine);

    // Note: Text labels removed - window labels (N/E/S/W) make orientation clear
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    render: render,
    renderPlaceholder: renderPlaceholder,
  };
})();
