/**
 * pcRendering.js
 * D3 visualization and interaction module for Section 18 Parallel Coordinates
 *
 * Refactored from ParallelCoordinates.js (Nov 30, 2025)
 * Handles all graph rendering, table generation, and interactive dragging
 *
 * This module provides:
 * - renderGraph(): D3.js parallel coordinates visualization
 * - renderTable(): Data table with financial calculations
 * - Interactive node dragging with state updates
 * - EDITABLE_AXES configuration for conditional axes (SHW%, HEAT%, nGains%, ACH50)
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.PCRendering = (function () {
  "use strict";

  // ══════════════════════════════════════════════════════════════════════
  // MODULE STATE
  // Cached references for performance
  // ══════════════════════════════════════════════════════════════════════

  let svgElement = null; // Cached SVG element for updates
  let currentData = null; // Current visualization data
  let CONFIG = null; // Configuration object (injected by ParallelCoordinates.js)

  // ══════════════════════════════════════════════════════════════════════
  // EDITABLE AXES CONFIGURATION
  // Defines which axes are interactive and their constraints
  // ══════════════════════════════════════════════════════════════════════

  const EDITABLE_AXES = {
    dwhr_efficiency: {
      targetField: "d_53", // Target DWHR% field
      refField: "ref_d_53", // Reference DWHR% field
      min: 0,
      max: 70, // DWHR domain is 0-70% (S07 slider max)
      step: 1, // 1% intervals
      unit: "%",
      label: "DWHR",
      owningSection: "sect07",
    },

    shw_efficiency: {
      // Conditional axis - config depends on system type (d_51)
      getDomain: function () {
        // Fixed domain to accommodate ALL fuel types
        // Gas/Oil: 50-98%, Electric: 90-100%, Heatpump: 100-450%
        return { min: 0, max: 450 };
      },

      getConfig: function (mode) {
        const systemTypeField = mode === "target" ? "d_51" : "ref_d_51";
        const systemType =
          window.TEUI?.StateManager?.getValue(systemTypeField) || "Heatpump";

        console.log(
          `[pcRendering] SHW% config: mode=${mode}, systemType=${systemType}`
        );

        if (systemType === "Heatpump") {
          return {
            targetField: "d_52",
            refField: "ref_d_52",
            min: 100,
            max: 450,
            step: 1,
            unit: "%",
            label: "SHW",
            owningSection: "sect07",
            isDecimal: false,
          };
        } else if (systemType === "Electric") {
          return {
            targetField: "d_52",
            refField: "ref_d_52",
            min: 90,
            max: 100,
            step: 1,
            unit: "%",
            label: "SHW",
            owningSection: "sect07",
            isDecimal: false,
          };
        } else {
          // Gas or Oil
          return {
            targetField: "k_52",
            refField: "ref_k_52",
            min: 50,
            max: 98,
            step: 1,
            unit: "%",
            label: "SHW AFUE",
            owningSection: "sect07",
            isDecimal: true,
            storageMultiplier: 0.01, // Convert display (90) to storage (0.90)
          };
        }
      },
      owningSection: "sect07",
    },

    net_gains: {
      // Discrete dropdown pattern
      targetField: "d_80",
      refField: "ref_d_80",
      min: 0,
      max: 100,
      step: 10,
      unit: "%",
      label: "nGains",
      owningSection: "sect10",
      isDiscrete: true,

      valueMap: {
        0: "NRC 0%",
        40: "NRC 40%",
        50: "NRC 50%",
        60: "NRC 60%",
        70: "PH Method",
        80: "PH Method",
        90: "PH Method",
        100: "PH Method",
      },

      snapValue: function (value) {
        if (value < 20) return 0;
        if (value < 45) return 40;
        if (value < 55) return 50;
        if (value < 61) return 60;
        return 70; // PHPP
      },
    },

    thermal_bridge: {
      targetField: "d_97",
      refField: "ref_d_97",
      min: 5,
      max: 100,
      step: 5,
      unit: "%",
      label: "TB",
      owningSection: "sect11",
    },

    ach50: {
      targetField: "g_109", // Measured value field
      refField: "ref_g_109",
      dropdownField: "d_108", // Blower door method selector
      refDropdownField: "ref_d_108",
      min: 0.1,
      max: 10.0,
      step: 0.1,
      isDecimal: true,
      unit: "",
      label: "ACH50",
      owningSection: "sect12",
    },

    mvhr_efficiency: {
      targetField: "d_118",
      refField: "ref_d_118",
      min: 0,
      max: 100,
      step: 0.5,
      unit: "%",
      label: "MVHR",
      owningSection: "sect13",
      isDecimal: true,
      decimalPlaces: 2,
    },

    heating_efficiency: {
      // Conditional axis based on fuel type
      getConfig: function (mode) {
        const stateManager = window.TEUI.StateManager;
        if (!stateManager) return null;

        const selectorField = mode === "target" ? "d_113" : "ref_d_113";
        const fuelType = stateManager.getValue(selectorField);

        if (fuelType === "Heatpump") {
          return {
            targetField: "f_113",
            refField: "ref_f_113",
            min: 100,
            max: 586,
            step: 5,
            unit: "%",
            label: "HEAT",
            owningSection: "sect13",
            isHeatpump: true,
            isDecimal: true,
          };
        } else if (fuelType === "Electric") {
          return null; // Not editable
        } else {
          // Gas or Oil
          return {
            targetField: "j_115",
            refField: "ref_j_115",
            min: 50,
            max: 586,
            step: 1,
            unit: "%",
            label: "HEAT",
            owningSection: "sect13",
            storageMultiplier: 0.01,
            autoSwitchToHeatpump: true,
            isDecimal: true,
          };
        }
      },
    },
  };

  // ══════════════════════════════════════════════════════════════════════
  // HELPER FUNCTIONS
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Get axis configuration (handles conditional axes)
   */
  function getAxisConfig(axisId, mode) {
    const axisEntry = EDITABLE_AXES[axisId];
    if (!axisEntry) return null;

    if (typeof axisEntry.getConfig === "function") {
      return axisEntry.getConfig(mode);
    }

    return axisEntry;
  }

  /**
   * Format currency value in CAD
   */
  const formatCurrency = value => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // ══════════════════════════════════════════════════════════════════════
  // GRAPH RENDERING
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Render the parallel coordinates graph using D3.js
   * @param {object} data - { axes, targetData, referenceData }
   * @param {object} config - Configuration object from ParallelCoordinates
   */
  function renderGraph(data, config) {
    CONFIG = config;
    currentData = data;

    const container = document.querySelector(CONFIG.containerSelector);
    if (!container) {
      console.error("[pcRendering] Container not found");
      return;
    }

    // Create tooltip (reuse if exists)
    let tooltip = d3.select("body").select(".pc-node-tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "pc-node-tooltip")
        .style("position", "absolute")
        .style("opacity", 0)
        .style("pointer-events", "none")
        .style("background", "white")
        .style("border", "1px solid #ddd")
        .style("border-radius", "4px")
        .style("padding", "8px 12px")
        .style("font-size", "12px")
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.15)")
        .style("z-index", "10000")
        .style("transition", "opacity 0.2s");
    }

    // Check if first render or update
    let isFirstRender = !svgElement;

    // Calculate dimensions
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight * CONFIG.graphHeightPercent;
    const width = containerWidth - CONFIG.margin.left - CONFIG.margin.right;
    const height = containerHeight - CONFIG.margin.top - CONFIG.margin.bottom;

    console.log("[pcRendering] Rendering graph:", width, "x", height);

    // Detect dimension changes and force full re-render
    if (!isFirstRender && svgElement) {
      const currentSvg = d3.select(container).select("svg");
      const currentWidth = parseFloat(currentSvg.attr("width"));
      const currentHeight = parseFloat(currentSvg.attr("height"));

      if (
        Math.abs(currentWidth - containerWidth) > 10 ||
        Math.abs(currentHeight - containerHeight) > 10
      ) {
        console.log(
          "[pcRendering] Dimension change detected - forcing full re-render"
        );
        isFirstRender = true;
        svgElement = null;
      }
    }

    // Create or select SVG
    let svg;
    if (isFirstRender) {
      container.innerHTML = "";
      svg = d3
        .select(container)
        .append("svg")
        .attr("width", containerWidth)
        .attr("height", containerHeight)
        .append("g")
        .attr(
          "transform",
          `translate(${CONFIG.margin.left},${CONFIG.margin.top})`
        );
      svgElement = svg;
    } else {
      svg = svgElement;
    }

    // Extract data
    const { axes, targetData, referenceData } = currentData;
    const numAxes = axes.length;

    // Horizontal spacing for axes
    const xScale = d3
      .scaleLinear()
      .domain([0, numAxes - 1])
      .range([0, width]);

    // Vertical scale for each axis with dynamic domains
    const yScales = axes.map((axis, i) => {
      const targetVal = targetData[i];
      const refVal = referenceData[i];
      const dataMin = Math.min(targetVal, refVal);
      const dataMax = Math.max(targetVal, refVal);

      const axisConfig = EDITABLE_AXES[axis.id];
      let [domainMin, domainMax] = axis.domain;

      if (axisConfig && typeof axisConfig.getDomain === "function") {
        const conditionalDomain = axisConfig.getDomain();
        domainMin = conditionalDomain.min;
        domainMax = conditionalDomain.max;
        console.log(
          `[pcRendering] Conditional domain for ${axis.id}: [${domainMin}, ${domainMax}]`
        );
      } else {
        // Dynamic scaling for output metrics (TEDI, TELI, GHGI, TEUI)
        const isDynamicAxis = ["tedi", "teli", "ghgi", "teui"].includes(
          axis.id
        );

        if (isDynamicAxis) {
          // Calculate dynamic domain with 15% margin
          const range = dataMax - dataMin;
          const margin = range * 0.15;

          // Always start at zero for output metrics
          domainMin = 0;

          // Round up maximum to maintain visual flow
          const maxWithMargin = dataMax + margin;
          if (axis.id === "ghgi") {
            // GHGI: Round up to nearest 10
            domainMax = Math.ceil(maxWithMargin / 10) * 10;
          } else {
            // TEDI, TELI, TEUI: Round up to nearest 100
            domainMax = Math.ceil(maxWithMargin / 100) * 100;
          }

          console.log(
            `[pcRendering] Dynamic domain for ${axis.id}: [0, ${domainMax}] (data: ${dataMin.toFixed(2)}-${dataMax.toFixed(2)})`
          );
        } else {
          // Fixed domains for editable axes - expand if data exceeds configured domain
          if (dataMin < domainMin) domainMin = dataMin * 0.9;
          if (dataMax > domainMax) domainMax = dataMax * 1.1;
        }
      }

      // Invert range for "higher is better" axes
      const range = axis.optimal === "higher" ? [0, height] : [height, 0];

      return d3.scaleLinear().domain([domainMin, domainMax]).range(range);
    });

    // Draw axes
    const axisGroup = svg
      .selectAll(".axis")
      .data(axes)
      .enter()
      .append("g")
      .attr("class", "axis")
      .attr("transform", (d, i) => `translate(${xScale(i)},0)`);

    // Vertical axis lines
    axisGroup
      .append("line")
      .attr("y1", 0)
      .attr("y2", height)
      .style("stroke", CONFIG.colors.axisLine)
      .style("stroke-width", 2);

    // Axis labels (top)
    axisGroup
      .append("text")
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .style("fill", CONFIG.colors.axisText)
      .style("font-weight", "600")
      .style("font-size", "12px")
      .text(d => d.label);

    // Axis units (below label)
    axisGroup
      .append("text")
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("fill", CONFIG.colors.axisText)
      .style("font-size", "10px")
      .text(d => d.unit);

    // Axis ticks (min/max)
    axisGroup.each(function (axis, i) {
      const axisG = d3.select(this);
      const scale = yScales[i];
      const [domainMin, domainMax] = scale.domain();
      const isInverted = axis.optimal === "higher";
      const bottomValue = isInverted ? domainMax : domainMin;
      const topValue = isInverted ? domainMin : domainMax;

      // Bottom label
      axisG
        .append("text")
        .attr("y", height + 15)
        .attr("text-anchor", "middle")
        .style("fill", CONFIG.colors.axisText)
        .style("font-size", "9px")
        .text(bottomValue.toFixed(1));

      // Top label
      axisG
        .append("text")
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .style("fill", CONFIG.colors.axisText)
        .style("font-size", "9px")
        .text(topValue.toFixed(1));
    });

    // Line path generator
    const line = d3
      .line()
      .x((d, i) => xScale(i))
      .y((d, i) => yScales[i](d))
      .curve(d3.curveMonotoneX);

    if (isFirstRender) {
      // First render: create lines
      svg
        .append("path")
        .datum(referenceData)
        .attr("class", "reference-line")
        .attr("d", line)
        .style("stroke", CONFIG.colors.reference)
        .style("stroke-width", CONFIG.lineWidth)
        .style("fill", "none")
        .style("opacity", CONFIG.lineOpacity)
        .on("mouseover", function () {
          d3.select(this)
            .style("stroke-width", CONFIG.lineWidthHover)
            .style("opacity", CONFIG.lineOpacityHover);
        })
        .on("mouseout", function () {
          d3.select(this)
            .style("stroke-width", CONFIG.lineWidth)
            .style("opacity", CONFIG.lineOpacity);
        });

      svg
        .append("path")
        .datum(targetData)
        .attr("class", "target-line")
        .attr("d", line)
        .style("stroke", CONFIG.colors.target)
        .style("stroke-width", CONFIG.lineWidth)
        .style("fill", "none")
        .style("opacity", CONFIG.lineOpacity)
        .on("mouseover", function () {
          d3.select(this)
            .style("stroke-width", CONFIG.lineWidthHover)
            .style("opacity", CONFIG.lineOpacityHover);
        })
        .on("mouseout", function () {
          d3.select(this)
            .style("stroke-width", CONFIG.lineWidth)
            .style("opacity", CONFIG.lineOpacity);
        });
    } else {
      // Update: animate with ghost trails
      const refLinePath = svg.select(".reference-line").attr("d");
      if (refLinePath) {
        svg
          .insert("path", ".reference-line")
          .attr("d", refLinePath)
          .attr("class", "ghost-line-ref")
          .style("stroke", CONFIG.colors.reference)
          .style("stroke-width", CONFIG.lineWidth)
          .style("fill", "none")
          .style("opacity", 0.3)
          .style("pointer-events", "none")
          .style("stroke-dasharray", "5,5")
          .transition()
          .duration(1500)
          .style("opacity", 0)
          .remove();
      }

      const targetLinePath = svg.select(".target-line").attr("d");
      if (targetLinePath) {
        svg
          .insert("path", ".target-line")
          .attr("d", targetLinePath)
          .attr("class", "ghost-line-target")
          .style("stroke", CONFIG.colors.target)
          .style("stroke-width", CONFIG.lineWidth)
          .style("fill", "none")
          .style("opacity", 0.3)
          .style("pointer-events", "none")
          .style("stroke-dasharray", "5,5")
          .transition()
          .duration(1500)
          .style("opacity", 0)
          .remove();
      }

      // Animate main lines
      svg
        .select(".reference-line")
        .datum(referenceData)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("d", line);

      svg
        .select(".target-line")
        .datum(targetData)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .attr("d", line);
    }

    // Helper function for tooltip handlers
    const attachTooltipHandlers = (selection, mode, data, axisIndex) => {
      const axis = axes[axisIndex];
      const axisConfig = EDITABLE_AXES[axis.id];
      const isEditable = !!axisConfig;
      const color =
        mode === "target" ? CONFIG.colors.target : CONFIG.colors.reference;
      const label = mode === "target" ? "Target" : "Reference";

      selection
        .on("mouseover", function (event) {
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip
            .html(
              `
              <div style="color: ${color}; font-weight: 600; margin-bottom: 4px;">
                ${axis.label} - ${label}
              </div>
              <div style="font-size: 14px; margin-bottom: 2px;">
                ${data[axisIndex].toFixed(2)} ${axis.unit}
              </div>
              ${isEditable ? '<div style="font-size: 10px; color: #666; font-style: italic;">Drag to edit</div>' : ""}
            `
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mousemove", function (event) {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });
    };

    if (isFirstRender) {
      // First render: create nodes
      axes.forEach((_axis, i) => {
        const refNode = svg
          .append("circle")
          .attr("class", `node-ref-${i}`)
          .attr("cx", xScale(i))
          .attr("cy", yScales[i](referenceData[i]))
          .attr("r", 4)
          .attr("data-mode", "reference")
          .style("fill", CONFIG.colors.reference)
          .style("stroke", "white")
          .style("stroke-width", 2);
        attachTooltipHandlers(refNode, "reference", referenceData, i);

        const targetNode = svg
          .append("circle")
          .attr("class", `node-target-${i}`)
          .attr("cx", xScale(i))
          .attr("cy", yScales[i](targetData[i]))
          .attr("r", 4)
          .attr("data-mode", "target")
          .style("fill", CONFIG.colors.target)
          .style("stroke", "white")
          .style("stroke-width", 2);
        attachTooltipHandlers(targetNode, "target", targetData, i);
      });
    } else {
      // Update: animate nodes
      axes.forEach((_axis, i) => {
        svg
          .select(`.node-ref-${i}`)
          .transition()
          .duration(1000)
          .ease(d3.easeCubicInOut)
          .attr("cy", yScales[i](referenceData[i]));

        svg
          .select(`.node-target-${i}`)
          .transition()
          .duration(1000)
          .ease(d3.easeCubicInOut)
          .attr("cy", yScales[i](targetData[i]));

        svg.select(`.node-ref-${i}`).each(function () {
          attachTooltipHandlers(d3.select(this), "reference", referenceData, i);
        });
        svg.select(`.node-target-${i}`).each(function () {
          attachTooltipHandlers(d3.select(this), "target", targetData, i);
        });
      });
    }

    // Initialize drag behavior (first render only)
    if (isFirstRender) {
      initializeDragBehavior(
        svg,
        axes,
        xScale,
        yScales,
        targetData,
        referenceData
      );
    }

    console.log("[pcRendering] Graph rendered successfully");
  }

  // ══════════════════════════════════════════════════════════════════════
  // DRAG INTERACTION
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Initialize D3 drag behavior for editable nodes
   */
  function initializeDragBehavior(
    svg,
    axes,
    xScale,
    yScales,
    targetData,
    referenceData
  ) {
    const drag = d3
      .drag()
      .on("start", dragStarted)
      .on("drag", dragging)
      .on("end", dragEnded);

    // Apply drag to Reference nodes (behind in z-order)
    axes.forEach((axis, i) => {
      if (EDITABLE_AXES[axis.id]) {
        const node = svg.selectAll("circle").filter(function () {
          const cx = parseFloat(d3.select(this).attr("cx"));
          const cy = parseFloat(d3.select(this).attr("cy"));
          const mode = d3.select(this).attr("data-mode");
          return (
            Math.abs(cx - xScale(i)) < 1 &&
            Math.abs(cy - yScales[i](referenceData[i])) < 1 &&
            mode === "reference"
          );
        });

        node
          .datum({
            axisId: axis.id,
            mode: "reference",
            axisIndex: i,
            value: referenceData[i],
          })
          .call(drag)
          .classed("pc-editable-node", true)
          .attr("r", 8);
      }
    });

    // Apply drag to Target nodes (on top in z-order)
    axes.forEach((axis, i) => {
      if (EDITABLE_AXES[axis.id]) {
        const node = svg.selectAll("circle").filter(function () {
          const cx = parseFloat(d3.select(this).attr("cx"));
          const cy = parseFloat(d3.select(this).attr("cy"));
          const mode = d3.select(this).attr("data-mode");
          return (
            Math.abs(cx - xScale(i)) < 1 &&
            Math.abs(cy - yScales[i](targetData[i])) < 1 &&
            mode === "target"
          );
        });

        node
          .datum({
            axisId: axis.id,
            mode: "target",
            axisIndex: i,
            value: targetData[i],
          })
          .call(drag)
          .classed("pc-editable-node", true)
          .attr("r", 8);
      }
    });

    // Store scales for drag functions
    initializeDragBehavior.xScale = xScale;
    initializeDragBehavior.yScales = yScales;
    initializeDragBehavior.svg = svg;
  }

  /**
   * Drag start handler - creates ghost trail
   */
  function dragStarted(event, d) {
    d3.select(this).classed("pc-dragging", true);

    const tooltip = d3.select(".pc-node-tooltip");
    tooltip.style("opacity", 1);

    const svg = initializeDragBehavior.svg;
    const lineClass = d.mode === "target" ? ".target-line" : ".reference-line";
    const ghostClass =
      d.mode === "target" ? "ghost-line-drag-target" : "ghost-line-drag-ref";
    const color =
      d.mode === "target" ? CONFIG.colors.target : CONFIG.colors.reference;

    const currentPath = svg.select(lineClass).attr("d");

    if (currentPath) {
      svg.selectAll(`.${ghostClass}`).remove();

      svg
        .insert("path", lineClass)
        .attr("d", currentPath)
        .attr("class", ghostClass)
        .style("stroke", color)
        .style("stroke-width", CONFIG.lineWidth)
        .style("fill", "none")
        .style("opacity", 0.3)
        .style("pointer-events", "none")
        .style("stroke-dasharray", "5,5");

      d.ghostLine = svg.select(`.${ghostClass}`);
    }
  }

  /**
   * Drag handler - updates visual position and tooltip
   */
  function dragging(event, d) {
    const axisConfig = getAxisConfig(d.axisId, d.mode);
    if (!axisConfig) return;

    const yScale = initializeDragBehavior.yScales[d.axisIndex];

    // Constrain drag to axis bounds
    const yRange = yScale.range();
    const minY = Math.min(...yRange);
    const maxY = Math.max(...yRange);
    const newY = Math.max(minY, Math.min(maxY, event.y));

    // Convert Y position to value
    let newValue = yScale.invert(newY);

    // Snap to step intervals
    newValue = Math.round(newValue / axisConfig.step) * axisConfig.step;

    // Clamp to min/max
    let clampedValue = Math.max(
      axisConfig.min,
      Math.min(axisConfig.max, newValue)
    );

    // Discrete snapping
    if (axisConfig.isDiscrete && typeof axisConfig.snapValue === "function") {
      clampedValue = axisConfig.snapValue(clampedValue);
    }

    // Update node position
    d3.select(this).attr("cy", yScale(clampedValue));

    // Update ghost line
    if (d.ghostLine && !d.ghostLine.empty()) {
      const svg = initializeDragBehavior.svg;
      const xScale = initializeDragBehavior.xScale;
      const yScales = initializeDragBehavior.yScales;
      const lineClass =
        d.mode === "target" ? ".target-line" : ".reference-line";
      const lineData = svg.select(lineClass).datum();

      if (lineData) {
        const updatedData = [...lineData];
        updatedData[d.axisIndex] = clampedValue;

        const line = d3
          .line()
          .x((_val, i) => xScale(i))
          .y((_val, i) => yScales[i](updatedData[i]))
          .curve(d3.curveMonotoneX);

        d.ghostLine.attr("d", line(updatedData));
      }
    }

    // Update tooltip
    const tooltip = d3.select(".pc-node-tooltip");
    const color =
      d.mode === "target" ? CONFIG.colors.target : CONFIG.colors.reference;
    const label = d.mode === "target" ? "Target" : "Reference";

    const decimals = d.axisId === "ach50" ? 2 : 1;
    let displayValue = clampedValue.toFixed(decimals);
    let displayUnit = axisConfig.unit;

    // Special case: nGains% PHPP
    if (d.axisId === "net_gains" && clampedValue >= 70) {
      displayValue = "PHPP";
      displayUnit = "";
    }

    // Special case: HEAT% Heatpump - show COP/HSPF
    let subtitle = null;
    if (d.axisId === "heating_efficiency" && clampedValue > 100) {
      const cop = clampedValue / 100;
      const hspf = cop * 3.412;
      subtitle = `COPh ${cop.toFixed(2)} | HSPF ${hspf.toFixed(1)}`;
    }

    tooltip
      .html(
        `
        <div style="color: ${color}; font-weight: 600; margin-bottom: 4px;">
          ${axisConfig.label} - ${label}
        </div>
        <div style="font-size: 16px; margin-bottom: 2px; font-weight: 700;">
          ${displayValue} ${displayUnit}
        </div>
        ${subtitle ? `<div style="font-size: 10px; color: #666; font-style: italic;">${subtitle}</div>` : ""}
      `
      )
      .style("left", event.pageX + 15 + "px")
      .style("top", event.pageY - 40 + "px")
      .style("opacity", 1);

    d.value = clampedValue;
  }

  /**
   * Drag end handler - updates state and triggers recalculation
   */
  function dragEnded(event, d) {
    d3.select(this).classed("pc-dragging", false);

    if (d.ghostLine && !d.ghostLine.empty()) {
      d.ghostLine.transition().duration(500).style("opacity", 0).remove();
      d.ghostLine = null;
    }

    const tooltip = d3.select(".pc-node-tooltip");
    tooltip.transition().delay(500).duration(300).style("opacity", 0);

    const axisConfig = getAxisConfig(d.axisId, d.mode);
    if (!axisConfig) return;

    const clampedValue = d.value;
    const isTarget = d.mode === "target";
    const baseFieldId = axisConfig.targetField;
    const fieldId = isTarget ? baseFieldId : axisConfig.refField;

    // Convert display value to storage value
    let storageValue = clampedValue;

    // HSPF inversion for heatpump
    if (
      axisConfig.isHeatpump ||
      (axisConfig.autoSwitchToHeatpump && clampedValue > 100)
    ) {
      const cop = clampedValue / 100;
      const hspf = cop * 3.412;
      storageValue = Math.round(hspf * 100) / 100;
      console.log(
        `[HEAT% Heatpump] COP ${cop.toFixed(2)} (${clampedValue}%) → HSPF ${storageValue}`
      );
    } else if (axisConfig.storageMultiplier) {
      storageValue = clampedValue * axisConfig.storageMultiplier;
    }

    // Discrete dropdown mapping
    if (axisConfig.isDiscrete && axisConfig.valueMap) {
      const snappedKey = clampedValue;
      storageValue = axisConfig.valueMap[snappedKey];

      if (!storageValue) {
        console.error(
          `[pcRendering] No valueMap entry for ${snappedKey} on axis ${d.axisId}`
        );
        return;
      }

      console.log(
        `[pcRendering] Discrete mapping: ${snappedKey}% → "${storageValue}"`
      );
    }

    // Format value for storage
    let valueToStore;
    if (axisConfig.isDiscrete) {
      valueToStore = storageValue;
    } else {
      if (axisConfig.isDecimal) {
        const decimals = axisConfig.decimalPlaces || 2;
        valueToStore = storageValue.toFixed(decimals);
      } else {
        valueToStore = Math.round(storageValue).toString();
      }
    }

    console.log(
      `[pcRendering] Drag ended: ${fieldId} = ${valueToStore} (mode: ${d.mode}, axis: ${d.axisId})`
    );

    // Get owning section
    const owningSection =
      window.TEUI?.SectionModules?.[axisConfig.owningSection];

    if (owningSection) {
      // ACH50 special case: Set dropdown to MEASURED
      if (axisConfig.dropdownField) {
        const dropdownFieldId = axisConfig.dropdownField;
        const dropdownFieldIdWithPrefix = isTarget
          ? dropdownFieldId
          : axisConfig.refDropdownField;
        const stateToUpdate = isTarget
          ? owningSection.TargetState
          : owningSection.ReferenceState;

        if (stateToUpdate) {
          stateToUpdate.setValue(dropdownFieldId, "MEASURED");
          console.log(
            `[pcRendering] Set ${isTarget ? "Target" : "Reference"}State.${dropdownFieldId} = "MEASURED"`
          );
        }

        if (window.TEUI?.StateManager) {
          window.TEUI.StateManager.setValue(
            dropdownFieldIdWithPrefix,
            "MEASURED",
            "user-modified"
          );
          console.log(
            `[pcRendering] Set StateManager.${dropdownFieldIdWithPrefix} = "MEASURED"`
          );
        }
      }

      // HEAT% auto fuel-type switching
      let fieldToWrite = baseFieldId;
      let fieldToWriteWithPrefix = fieldId;

      if (d.axisId === "heating_efficiency" && clampedValue > 100) {
        const selectorFieldId = "d_113";
        const selectorFieldIdWithPrefix = isTarget
          ? selectorFieldId
          : "ref_d_113";
        const currentFuelType = window.TEUI?.StateManager?.getValue(
          selectorFieldIdWithPrefix
        );

        if (currentFuelType === "Gas" || currentFuelType === "Oil") {
          const stateToUpdate = isTarget
            ? owningSection.TargetState
            : owningSection.ReferenceState;

          if (stateToUpdate) {
            stateToUpdate.setValue(selectorFieldId, "Heatpump");
            console.log(
              `[HEAT% Auto-Switch] ${currentFuelType} → Heatpump (${clampedValue}% > 100%)`
            );
          }

          if (window.TEUI?.StateManager) {
            window.TEUI.StateManager.setValue(
              selectorFieldIdWithPrefix,
              "Heatpump",
              "user-modified"
            );
            console.log(
              `[pcRendering] Set StateManager.${selectorFieldIdWithPrefix} = "Heatpump"`
            );
          }

          fieldToWrite = "f_113";
          fieldToWriteWithPrefix = isTarget ? "f_113" : "ref_f_113";
          console.log(
            `[HEAT% Auto-Switch] Field changed: ${baseFieldId} → ${fieldToWrite}`
          );
        }
      }

      // Update state
      const stateToUpdate = isTarget
        ? owningSection.TargetState
        : owningSection.ReferenceState;
      if (stateToUpdate) {
        stateToUpdate.setValue(fieldToWrite, valueToStore);
        console.log(
          `[pcRendering] Updated ${isTarget ? "Target" : "Reference"}State.${fieldToWrite} = ${valueToStore}`
        );
      }

      // Update StateManager
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          fieldToWriteWithPrefix,
          valueToStore,
          "user-modified"
        );
        console.log(
          `[pcRendering] Updated StateManager.${fieldToWriteWithPrefix} = ${valueToStore}`
        );
      }

      // Recalculate
      if (owningSection.calculateAll) {
        owningSection.calculateAll();
        console.log(
          `[pcRendering] Called ${axisConfig.owningSection}.calculateAll()`
        );
      }

      // Refresh UI
      if (owningSection.ModeManager) {
        owningSection.ModeManager.refreshUI();
        console.log(
          `[pcRendering] Called ${axisConfig.owningSection}.ModeManager.refreshUI()`
        );
      }
    }

    // Refresh S18 graph
    if (window.TEUI?.ParallelCoordinates?.refresh) {
      setTimeout(() => {
        window.TEUI.ParallelCoordinates.refresh();
      }, 100);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // TABLE RENDERING
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Render data table with financial calculations
   * @param {object} data - { axes, targetData, referenceData }
   * @param {object} config - Configuration object
   */
  function renderTable(data, config) {
    CONFIG = config;
    currentData = data;

    const container = document.querySelector(CONFIG.containerSelector);
    if (!container) {
      console.error("[pcRendering] Container not found for table");
      return;
    }

    // Remove existing table
    const existingTable = container.querySelector(".pc-data-table");
    if (existingTable) {
      existingTable.remove();
    }

    const tableWrapper = document.createElement("div");
    tableWrapper.className = "pc-data-table mt-3";

    const table = document.createElement("table");
    table.className = "table table-sm table-striped table-hover";

    const { axes, targetData, referenceData } = currentData;

    // Table header
    const thead = document.createElement("thead");
    let headerHTML = '<tr><th style="width: 60px;"></th>';
    axes.forEach(axis => {
      headerHTML += `<th class="text-center"><strong>${axis.label}</strong><br><small class="text-muted">${axis.unit}</small></th>`;
    });
    headerHTML += "</tr>";
    thead.innerHTML = headerHTML;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Reference row
    const referenceRow = document.createElement("tr");
    referenceRow.innerHTML = `<td class="pc-row-label pc-reference-cell"><strong>Reference</strong></td>`;
    referenceData.forEach(val => {
      referenceRow.innerHTML += `<td class="text-center pc-reference-cell">${val.toFixed(2)}</td>`;
    });
    tbody.appendChild(referenceRow);

    // Target row
    const targetRow = document.createElement("tr");
    targetRow.innerHTML = `<td class="pc-row-label pc-target-cell"><strong>Target</strong></td>`;
    targetData.forEach(val => {
      targetRow.innerHTML += `<td class="text-center pc-target-cell">${val.toFixed(2)}</td>`;
    });
    tbody.appendChild(targetRow);

    // Delta row
    const deltaRow = document.createElement("tr");
    deltaRow.innerHTML = `<td class="pc-row-label"><strong>Δ</strong></td>`;
    axes.forEach((axis, i) => {
      const delta = targetData[i] - referenceData[i];
      let deltaClass = "";
      if (axis.optimal === "higher") {
        deltaClass = delta > 0 ? "text-success" : "text-danger";
      } else if (axis.optimal === "lower") {
        deltaClass = delta < 0 ? "text-success" : "text-danger";
      }
      deltaRow.innerHTML += `<td class="text-center ${deltaClass}">${delta >= 0 ? "+" : ""}${delta.toFixed(2)}</td>`;
    });
    tbody.appendChild(deltaRow);

    // Percent Delta row
    const percentRow = document.createElement("tr");
    percentRow.innerHTML = `<td class="pc-row-label"><strong>%Δ</strong></td>`;
    axes.forEach((axis, i) => {
      const delta = targetData[i] - referenceData[i];
      const reference = referenceData[i];
      const percentDelta = reference !== 0 ? (delta / reference) * 100 : 0;
      let deltaClass = "";
      if (axis.optimal === "higher") {
        deltaClass = delta > 0 ? "text-success" : "text-danger";
      } else if (axis.optimal === "lower") {
        deltaClass = delta < 0 ? "text-success" : "text-danger";
      }
      percentRow.innerHTML += `<td class="text-center ${deltaClass}">${percentDelta >= 0 ? "+" : ""}${percentDelta.toFixed(1)}%</td>`;
    });
    tbody.appendChild(percentRow);

    // Financial rows
    const hasPro = window.TEUI?.pcFinancials?.calculateFinancials;
    const roiMultiplier = CONFIG.roiTerm || 1;

    // Reference Cost row
    const refCostRow = document.createElement("tr");
    refCostRow.innerHTML = `<td class="pc-row-label pc-reference-cell"><strong>Ref Cost</strong></td>`;
    axes.forEach(axis => {
      if (hasPro) {
        const result = window.TEUI.pcFinancials.calculateFinancials(
          axis.id,
          "reference"
        );
        const annualizedCost = result.cost * roiMultiplier;

        if (axis.id === "ghgi") {
          refCostRow.innerHTML += `<td class="text-center pc-reference-cell">${annualizedCost.toFixed(2)}</td>`;
        } else {
          refCostRow.innerHTML += `<td class="text-center pc-reference-cell">${formatCurrency(annualizedCost)}</td>`;
        }
      } else {
        refCostRow.innerHTML += `<td class="text-center pc-reference-cell">$0.00</td>`;
      }
    });
    tbody.appendChild(refCostRow);

    // Target Cost row
    const targetCostRow = document.createElement("tr");
    targetCostRow.innerHTML = `<td class="pc-row-label pc-target-cell"><strong>Target Cost</strong></td>`;
    axes.forEach(axis => {
      if (hasPro) {
        const result = window.TEUI.pcFinancials.calculateFinancials(
          axis.id,
          "target"
        );
        const annualizedCost = result.cost * roiMultiplier;

        if (axis.id === "ghgi") {
          targetCostRow.innerHTML += `<td class="text-center pc-target-cell">${annualizedCost.toFixed(2)}</td>`;
        } else {
          targetCostRow.innerHTML += `<td class="text-center pc-target-cell">${formatCurrency(annualizedCost)}</td>`;
        }
      } else {
        targetCostRow.innerHTML += `<td class="text-center pc-target-cell">$0.00</td>`;
      }
    });
    tbody.appendChild(targetCostRow);

    // Target Savings row
    const savingsRow = document.createElement("tr");
    savingsRow.innerHTML = `<td class="pc-row-label text-success"><strong>Target Savings</strong></td>`;
    axes.forEach(axis => {
      if (hasPro) {
        const result = window.TEUI.pcFinancials.calculateFinancials(
          axis.id,
          "savings"
        );
        const annualizedSavings = result.cost * roiMultiplier;

        if (axis.id === "ghgi") {
          savingsRow.innerHTML += `<td class="text-center text-success">${annualizedSavings.toFixed(2)}</td>`;
        } else {
          savingsRow.innerHTML += `<td class="text-center text-success">${formatCurrency(annualizedSavings)}</td>`;
        }
      } else {
        savingsRow.innerHTML += `<td class="text-center text-success">$0.00</td>`;
      }
    });
    tbody.appendChild(savingsRow);

    // Capital Budget row
    const capitalBudgetRow = document.createElement("tr");
    capitalBudgetRow.innerHTML = `<td class="pc-row-label"><strong>Capital Budget</strong></td>`;

    const defaultCapitalBudgets = {
      shw_efficiency: 10000,
      dwhr_efficiency: 5000,
      net_gains: 100000,
      thermal_bridge: 50000,
      aggregate_ground_uvalue: 20000,
      aggregate_air_uvalue: 100000,
      ach50: 30000,
      window_wall_ratio: 50000,
      heating_efficiency: 50000,
      mvhr_efficiency: 50000,
      tedi: 50000,
      teli: 100000,
      ghgi: 0,
      teui: 0,
    };

    axes.forEach(axis => {
      const savedValue = localStorage.getItem(`pc_capital_budget_${axis.id}`);
      const defaultValue = defaultCapitalBudgets[axis.id] || 0;
      const numValue =
        savedValue !== null ? parseFloat(savedValue) : defaultValue;
      const formattedValue = formatCurrency(numValue);

      if (savedValue === null) {
        localStorage.setItem(
          `pc_capital_budget_${axis.id}`,
          numValue.toString()
        );
      }

      capitalBudgetRow.innerHTML += `
        <td class="text-center">
          <input
            type="text"
            class="pc-capital-input"
            data-axis="${axis.id}"
            value="${formattedValue}"
            style="width: 80px; text-align: center;"
          />
        </td>
      `;
    });
    tbody.appendChild(capitalBudgetRow);

    // Target Simple ROI row
    const roiRow = document.createElement("tr");
    roiRow.innerHTML = `<td class="pc-row-label"><strong>Target Simple ROI</strong></td>`;
    roiRow.classList.add("pc-roi-row");

    axes.forEach(axis => {
      const capitalBudget = parseFloat(
        localStorage.getItem(`pc_capital_budget_${axis.id}`) || "0"
      );

      if (hasPro) {
        const annualSavingsResult =
          window.TEUI.pcFinancials.calculateFinancials(axis.id, "savings");
        const annualSavings = annualSavingsResult.cost;

        let roiDisplay;
        if (axis.id === "ghgi") {
          const carbonPricePerMT = capitalBudget;
          const emissionsReductionKg = annualSavings;
          const emissionsReductionMT = emissionsReductionKg / 1000;
          const carbonCostSavings = emissionsReductionMT * carbonPricePerMT;

          if (carbonPricePerMT === 0) {
            roiDisplay = "N/A";
          } else if (emissionsReductionKg <= 0) {
            roiDisplay = "N/A";
          } else {
            roiDisplay = formatCurrency(carbonCostSavings);
          }
        } else if (capitalBudget === 0) {
          roiDisplay = "-";
        } else if (annualSavings <= 0) {
          roiDisplay = "N/A";
        } else {
          const roiYears = capitalBudget / annualSavings;
          roiDisplay = `${roiYears.toFixed(1)} yrs`;
        }

        roiRow.innerHTML += `<td class="text-center">${roiDisplay}</td>`;
      } else {
        roiRow.innerHTML += `<td class="text-center">-</td>`;
      }
    });
    tbody.appendChild(roiRow);

    table.appendChild(tbody);
    tableWrapper.appendChild(table);
    container.appendChild(tableWrapper);

    // Attach event listeners to capital budget inputs
    setTimeout(() => {
      document.querySelectorAll(".pc-capital-input").forEach(input => {
        input.addEventListener("blur", e => {
          const axisId = e.target.dataset.axis;
          const rawValue = e.target.value.replace(/[^0-9.]/g, "");
          const numValue = parseFloat(rawValue) || 0;

          localStorage.setItem(
            `pc_capital_budget_${axisId}`,
            numValue.toString()
          );

          e.target.value = formatCurrency(numValue);
          updateROIRow(axes, hasPro);
        });

        input.addEventListener("keypress", e => {
          if (e.key === "Enter") {
            e.target.blur();
          }
        });
      });
    }, 0);

    console.log("[pcRendering] Table rendered with", axes.length, "columns");
  }

  /**
   * Update ROI row after capital budget changes
   */
  function updateROIRow(axes, hasPro) {
    const roiRow = document.querySelector(".pc-roi-row");
    if (!roiRow) return;

    const roiCells = roiRow.querySelectorAll("td:not(.pc-row-label)");

    axes.forEach((axis, index) => {
      const capitalBudget = parseFloat(
        localStorage.getItem(`pc_capital_budget_${axis.id}`) || "0"
      );

      if (hasPro) {
        const annualSavingsResult =
          window.TEUI.pcFinancials.calculateFinancials(axis.id, "savings");
        const annualSavings = annualSavingsResult.cost;

        let roiDisplay;
        if (axis.id === "ghgi") {
          const carbonPricePerMT = capitalBudget;
          const emissionsReductionKg = annualSavings;
          const emissionsReductionMT = emissionsReductionKg / 1000;
          const carbonCostSavings = emissionsReductionMT * carbonPricePerMT;

          if (carbonPricePerMT === 0) {
            roiDisplay = "N/A";
          } else if (emissionsReductionKg <= 0) {
            roiDisplay = "N/A";
          } else {
            roiDisplay = formatCurrency(carbonCostSavings);
          }
        } else if (capitalBudget === 0) {
          roiDisplay = "-";
        } else if (annualSavings <= 0) {
          roiDisplay = "N/A";
        } else {
          const roiYears = capitalBudget / annualSavings;
          roiDisplay = `${roiYears.toFixed(1)} yrs`;
        }

        if (roiCells[index]) {
          roiCells[index].textContent = roiDisplay;
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ══════════════════════════════════════════════════════════════════════

  return {
    renderGraph: renderGraph,
    renderTable: renderTable,
    resetCache: function () {
      svgElement = null;
      currentData = null;
    },
  };
})();

console.log("[pcRendering] Rendering module loaded");
