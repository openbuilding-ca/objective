// sections/4012-Section16.js
// Sankey Diagram Visualization Section

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Initialize section-specific namespace with better defaults
window.TEUI.sect16 = {
  sankeyInstance: null, // Will hold the main Sankey instance
  fullscreenSankeyInstance: null, // Will hold the fullscreen Sankey instance
  defaultNodeWidth: 20,
  nodeWidthMultiplier: 1,
  nodePadding: 15,
  showEmissions: false,
  initialized: false, // Flag for idempotent initialization
  isActive: false,
  currentMode: "heating", // Current season mode: "heating" or "cooling"
  MODES: {
    SANKEY: "sankey",
    ENERGY_BALANCE: "energy-balance",
  },
};

window.TEUI.SectionModules.sect16 = (function () {
  "use strict";

  // --- Ported from SANKEY3035.html ---
  const NodeReferenceHandler = {
    convertToIndices(links, nodes) {
      return links.map((link) => ({
        source:
          typeof link.source === "object"
            ? nodes.indexOf(link.source)
            : link.source,
        target:
          typeof link.target === "object"
            ? nodes.indexOf(link.target)
            : link.target,
        value: link.value,
        isEmissions: link.isEmissions,
      }));
    },
    convertToObjects(links, nodes) {
      return links.map((link) => ({
        source:
          typeof link.source === "number" ? nodes[link.source] : link.source,
        target:
          typeof link.target === "number" ? nodes[link.target] : link.target,
        value: link.value,
        isEmissions: link.isEmissions,
      }));
    },
    validateNodeReferences(links, nodes) {
      return links.every((link) => {
        const sourceValid =
          typeof link.source === "number"
            ? link.source >= 0 && link.source < nodes.length
            : nodes.includes(link.source);
        const targetValid =
          typeof link.target === "number"
            ? link.target >= 0 && link.target < nodes.length
            : nodes.includes(link.target);
        return sourceValid && targetValid;
      });
    },
  };

  const SANKEY_STRUCTURE_TEMPLATE = {
    nodes: [
      { name: "Building", color: "#4A96BA" }, // [0]
      { name: "G.1.2 Occupant Gains", color: "#FF8C00" }, // [1]
      { name: "G.2 Plug Light Equipment", color: "#A5D3ED" }, // [2]
      { name: "W.5.2 SHW Net Demand", color: "#BE343D" }, // [3]
      { name: "G.8.1 Windows N", color: "#F9DF4B" }, // [4]
      { name: "G.8.2 Windows E", color: "#F9DF4B" }, // [5]
      { name: "G.8.3 Windows S", color: "#F9DF4B" }, // [6]
      { name: "G.8.4 Windows W", color: "#F9DF4B" }, // [7]
      { name: "G.7.0 Doors", color: "#F9DF4B" }, // [8]
      { name: "M.2.1.S Sink (Air/Ground)", color: "#D4B26F" }, // [9]
      { name: "M.2.1.D Energy Input", color: "#A9D7F2" }, // [10]
      { name: "Thermal Energy Demand", color: "#BFA586" }, // [11]
      { name: "B.4 Roof", color: "#8FAFA6" }, // [12]
      { name: "B.5 Walls Above Grade", color: "#8FAFA6" }, // [13]
      { name: "B.6 Floor Exposed", color: "#8FAFA6" }, // [14]
      { name: "B.7.0 Doors", color: "#8FAFA6" }, // [15]
      { name: "B.8.1 Windows N", color: "#F9DF4B" }, // [16]
      { name: "B.8.2 Windows E", color: "#F9DF4B" }, // [17]
      { name: "B.8.3 Windows S", color: "#F9DF4B" }, // [18]
      { name: "B.8.4 Windows W", color: "#F9DF4B" }, // [19]
      { name: "B.9 Walls Below Grade", color: "#8FAFA6" }, // [20] // i_94, for future cooling mode, value might be negative from K column
      { name: "B.10 Floor Slab", color: "#8FAFA6" }, // [21] // i_95, for future cooling mode, value might be negative from K column
      { name: "B.12 TB Penalty", color: "#8FAFA6" }, // [22]
      { name: "B.18.3 Air Leakage", color: "#A4D3ED" }, // [23]
      { name: "V.2.3 Unrecovered Ventilation", color: "#A5D3ED" }, // [24]
      { name: "W.2.W SHW Wasted", color: "#BE343D" }, // [25]
      { name: "G.5 Unusable Gains", color: "#FFA500" }, // [26]
      { name: "GasExhaust", color: "#BE343D", hidden: true }, // [27]
      { name: "Total Envelope Losses", color: "#8FAFA6" }, // [28]
      { name: "E1 Scope 1 Emissions", color: "#808080" }, // [29]
      { name: "E2 Scope 2 Emissions", color: "#808080" }, // [30]
      { name: "B.8.5 Skylights", color: "#F9DF4B" }, // [31]
      { name: "G.8.5 Skylights", color: "#F9DF4B" }, // [32]
    ],
    links: [
      { source: 1, target: 0, value: 0.0001, id: "OccupantGains" },
      { source: 2, target: 0, value: 0.0001, id: "EquipmentGains" },
      { source: 3, target: 0, value: 0.0001, id: "SHWNetDemand" },
      { source: 4, target: 0, value: 0.0001, id: "WinNorthGains" },
      { source: 5, target: 0, value: 0.0001, id: "WinEastGains" },
      { source: 6, target: 0, value: 0.0001, id: "WinSouthGains" },
      { source: 7, target: 0, value: 0.0001, id: "WinWestGains" },
      { source: 8, target: 0, value: 0.0001, id: "DoorGains" },
      { source: 32, target: 0, value: 0.0001, id: "SkylightGains" },
      { source: 9, target: 11, value: 0.0001, id: "HeatPumpSourceToTED" },
      { source: 10, target: 11, value: 0.0001, id: "HeatPumpElecToTED" },
      { source: 11, target: 0, value: 0.0001, id: "TEDToBuilding" },
      { source: 28, target: 12, value: 0.0001, id: "TELToRoof" },
      { source: 28, target: 13, value: 0.0001, id: "TELToWallAG" },
      { source: 28, target: 14, value: 0.0001, id: "TELToFloorExp" },
      { source: 28, target: 15, value: 0.0001, id: "TELToDoor" },
      { source: 28, target: 16, value: 0.0001, id: "TELToWinN" },
      { source: 28, target: 17, value: 0.0001, id: "TELToWinE" },
      { source: 28, target: 18, value: 0.0001, id: "TELToWinS" },
      { source: 28, target: 19, value: 0.0001, id: "TELToWinW" },
      { source: 28, target: 31, value: 0.0001, id: "TELToSkylight" },
      { source: 28, target: 20, value: 0.0001, id: "TELToWallBG" },
      { source: 28, target: 21, value: 0.0001, id: "TELToSlab" },
      { source: 28, target: 22, value: 0.0001, id: "TELToTB" },
      { source: 28, target: 23, value: 0.0001, id: "TELToAirLeak" },
      { source: 0, target: 24, value: 0.0001, id: "BuildingToVentLoss" },
      { source: 0, target: 25, value: 0.0001, id: "BuildingToSHWWaste" },
      { source: 0, target: 26, value: 0.0001, id: "BuildingToUnusableGains" },
      { source: 0, target: 27, value: 0.0001, id: "BuildingToGasExhaust" },
      { source: 0, target: 28, value: 0.0001, id: "BuildingToTEL" },
      { source: 11, target: 27, value: 0.0001, id: "TEDToGasExhaust" },
      { source: 3, target: 27, value: 0.0001, id: "SHWToGasExhaust" },
    ],
  };

  class TEUI_SankeyDiagram {
    constructor(options) {
      this.containerId = options.containerId;
      this.width = options.width || 1600;
      this.height = options.height || 500;
      this.svg = null;
      this.tooltip = null;
      this.sankey = null;
      this.nodeWidth = options.nodeWidth || 20;
      this.nodePadding = options.nodePadding || 10;
      this.showEmissions = options.showEmissions || false;
      this.nodeGroup = null;
      this.linkGroup = null;
      this.labelGroup = null;
      this._cleanDataInput = null;
      this.widthMultiplier = 1;
      this.isFullscreen = options.isFullscreen || false;
    }

    init() {
      try {
        // Clear any existing content
        const containerEl = document.getElementById(this.containerId);
        if (!containerEl) {
          // console.error("TEUI_SankeyDiagram Error: Container element not found", this.containerId);
          return false;
        }

        // Set up D3 elements
        this.svg = d3.select(`#${this.containerId}`);

        // Make sure tooltip exists and is attached to body
        let tooltipEl = document.getElementById("sankeySection16Tooltip");
        if (!tooltipEl) {
          tooltipEl = document.createElement("div");
          tooltipEl.id = "sankeySection16Tooltip";
          document.body.appendChild(tooltipEl);
        }
        this.tooltip = d3.select("#sankeySection16Tooltip");

        if (!this.svg) {
          // console.error("TEUI_SankeyDiagram Error: SVG element not initialized");
          return false;
        }

        // Define margins for the SVG
        this.margin = {
          top: 20,
          right: 30,
          bottom: 20,
          left: 30,
        };

        // Set SVG dimensions
        this.svg.attr("width", this.width).attr("height", this.height);

        // Create main group with margin offset
        const g = this.svg
          .append("g")
          .attr(
            "transform",
            `translate(${this.margin.left},${this.margin.top})`,
          );

        // Create layers for different parts of the diagram
        this.linkGroup = g.append("g").attr("class", "links");
        this.nodeGroup = g.append("g").attr("class", "nodes");
        this.labelGroup = g.append("g").attr("class", "labels");

        // Initialize D3 Sankey layout
        this.sankey = d3
          .sankey()
          .nodeWidth(this.nodeWidth)
          .nodePadding(this.nodePadding)
          .extent([
            [0, 0],
            [
              this.width - this.margin.left - this.margin.right,
              this.height - this.margin.top - this.margin.bottom,
            ],
          ]);

        // Define element resize observer
        if (typeof ResizeObserver !== "undefined") {
          const ro = new ResizeObserver((entries) => {
            if (entries.length > 0 && entries[0].target === containerEl) {
              const { width, height } = entries[0].contentRect;
              if (width > 0 && height > 0) {
                this.resize(width, height);
              }
            }
          });
          ro.observe(containerEl);
        }

        return true;
      } catch (error) {
        // console.error("TEUI_SankeyDiagram Error: Initialization failed", error);
        return false;
      }
    }

    render(freshSankeyData, isInitialLoad = false) {
      if (
        !freshSankeyData ||
        !freshSankeyData.nodes ||
        !freshSankeyData.links
      ) {
        // console.error("TEUI_SankeyDiagram Error: Invalid data structure for rendering", freshSankeyData);
        return;
      }

      // Store a deep copy of the fresh input data
      this._cleanDataInput = JSON.parse(JSON.stringify(freshSankeyData));

      // Create new objects for D3 to modify (prevents issues with object references)
      const d3Data = {
        nodes: JSON.parse(JSON.stringify(freshSankeyData.nodes)),
        links: JSON.parse(JSON.stringify(freshSankeyData.links)),
      };

      // Pre-process links to ensure consistent references - CRITICAL to prevent disappearing links
      d3Data.links = d3Data.links.map((link) => {
        if (typeof link.source === "number") {
          link.source = d3Data.nodes[link.source];
        }
        if (typeof link.target === "number") {
          link.target = d3Data.nodes[link.target];
        }
        return link;
      });

      // Apply node width to the sankey layout based on multiplier
      if (this.widthMultiplier) {
        // Set the base node width (multiplied by slider value)
        this.sankey.nodeWidth(this.nodeWidth * this.widthMultiplier);
      }

      try {
        // Compute the sankey diagram: assign coordinates to nodes, calculate link paths
        const { nodes, links } = this.sankey(d3Data);

        // Add display color property for consistency
        nodes.forEach((node) => {
          node.displayColor = d3.color(node.color || "#999").darker(0.3);
        });

        // Calculate maxX for animation sequencing
        const maxX = nodes.length > 0 ? d3.max(nodes, (d) => d.x0) : 0;

        if (isInitialLoad) {
          // TWO-PHASE APPROACH FOR INITIAL ACTIVATION

          // Phase 1: Pre-render everything invisibly
          this._preRenderInvisible(nodes, links);

          // Phase 2: After a brief delay to ensure DOM updates, animate with flowing effect
          setTimeout(() => {
            this._animateFlowingEffect(nodes, links, maxX);
          }, 50); // Small delay to ensure DOM has updated
        } else {
          // For refresh, use the same flowing animation but without the pre-render step
          this.renderLinks(links, true, maxX, nodes); // Pass isInitialLoad=true to get the same animation
          this.renderNodes(nodes, true, maxX);
          this.renderLabels(nodes, true, maxX);
        }
      } catch (error) {
        console.error("Error rendering Sankey diagram:", error);
        // Fallback: Ensure elements are visible even if rendering fails
        this.linkGroup
          .selectAll(".link")
          .style("stroke-opacity", 0.6)
          .style("stroke-width", (d) => Math.max(1, d.width || 1)); // CHANGED FROM attr TO style

        this.nodeGroup
          .selectAll(".node")
          .style("opacity", 1)
          .attr("width", (d) =>
            Math.max(1, (d.x1 - d.x0) * this.widthMultiplier),
          );

        this.labelGroup.selectAll(".node-label").style("opacity", 1);
      }
    }

    // New helper method to pre-render everything invisibly
    _preRenderInvisible(nodes, links) {
      // Clear any existing elements first
      this.nodeGroup.selectAll(".node").remove();
      this.linkGroup.selectAll(".link").remove();
      this.labelGroup.selectAll(".node-label").remove();

      // Render nodes at final positions but invisible
      this.nodeGroup
        .selectAll(".node")
        .data(nodes, (d) => d.name)
        .enter()
        .append("rect")
        .attr("class", "node s16-sankey-node")
        .style("fill", (d) => d.displayColor)
        .style("stroke", (d) => d3.color(d.color || "#999").darker(0.5))
        .style("stroke-width", 2)
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("height", (d) => Math.max(1, d.y1 - d.y0))
        .attr("width", (d) => Math.max(1, (d.x1 - d.x0) * this.widthMultiplier))
        .style("opacity", 0) // Invisible
        .on("mouseover", (event, d) => {
          d3.select(event.target).style("fill-opacity", 0.8);
          this.showNodeTooltip(event, d);
        })
        .on("mouseout", (event) => {
          d3.select(event.target).style("fill-opacity", 1);
          this.hideTooltip();
        });

      // Render links at final positions but invisible
      const linkSelection = this.linkGroup
        .selectAll(".link")
        .data(links, (d) => {
          const source =
            typeof d.source === "object" ? d.source.index : d.source;
          const target =
            typeof d.target === "object" ? d.target.index : d.target;
          return `${source}-${target}`;
        })
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .style("stroke", (d) => this.getLinkColor(d))
        .style("fill", "none")
        .style("stroke-width", (d) => Math.max(1, d.width || 1))
        .style("stroke-opacity", 0) // Invisible
        .on("mouseover", (event, d) => {
          d3.select(event.target).style("stroke-opacity", 0.9);
          this.showLinkTooltip(event, d);
        })
        .on("mouseout", (event) => {
          d3.select(event.target).style("stroke-opacity", 0.6);
          this.hideTooltip();
        });

      // CRITICAL: Calculate and store the path length for each link
      linkSelection.each(function () {
        // Use getTotalLength if available, or fallback to estimate
        this._pathLength = this.getTotalLength ? this.getTotalLength() : 500;
      });

      // Render labels at final positions but invisible
      this.labelGroup
        .selectAll(".node-label")
        .data(nodes, (d) => d.name)
        .enter()
        .append("text")
        .attr("class", "node-label")
        .attr("text-anchor", (d) => (d.x0 < this.width / 2 ? "start" : "end"))
        .attr("x", (d) => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", (d) => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .text((d) => this.formatNodeLabel(d))
        .style("opacity", 0); // Invisible
    }

    // New helper method to animate the pre-rendered elements with flowing effect
    _animateFlowingEffect(nodes, links, maxX) {
      // 1. Animate nodes appearance with nice ease-in
      this.nodeGroup
        .selectAll(".node")
        .transition("appear")
        .duration(300)
        .delay((d) => (d.x0 / maxX) * 600)
        .ease(d3.easeCubicInOut)
        .style("opacity", 1)
        .transition("expand")
        .duration(600)
        .ease(d3.easeBackOut.overshoot(1.2)) // Spring effect
        .attr("width", (d) =>
          Math.max(1, (d.x1 - d.x0) * this.widthMultiplier),
        );

      // 2. Animate links with dash array flowing effect
      const linkSelection = this.linkGroup.selectAll(".link");

      // Setup dash array for animation and make links visible
      linkSelection
        .style("stroke-opacity", 0.6) // Make visible
        .attr("stroke-dasharray", function () {
          return `${this._pathLength} ${this._pathLength}`;
        })
        .attr("stroke-dashoffset", function () {
          return this._pathLength;
        });

      // Animate the dash offset for flowing effect
      linkSelection
        .transition()
        .duration(1500)
        .delay((d) => 300 + (d.source.x0 / maxX) * 800)
        .ease(d3.easeQuadInOut)
        .attr("stroke-dashoffset", 0)
        .on("end", function () {
          // Remove dash array/offset after animation completes
          d3.select(this)
            .attr("stroke-dasharray", null)
            .attr("stroke-dashoffset", null);
        });

      // 3. Fade in labels last
      this.labelGroup
        .selectAll(".node-label")
        .transition("fade")
        .duration(300)
        .delay((d) => 900 + (d.x0 / maxX) * 300)
        .style("opacity", 1);

      // Safety measure - ensure everything is visible after all animations
      setTimeout(() => {
        this.nodeGroup.selectAll(".node").style("opacity", 1);
        this.linkGroup
          .selectAll(".link")
          .style("stroke-opacity", 0.6)
          .attr("stroke-dasharray", null)
          .attr("stroke-dashoffset", null);
        this.labelGroup.selectAll(".node-label").style("opacity", 1);
      }, 2500);
    }

    renderNodes(nodes, isInitialLoad, maxX) {
      // Select all existing nodes and bind data
      const node = this.nodeGroup.selectAll(".node").data(nodes, (d) => d.name);

      // Remove any old nodes that are no longer in the data
      node
        .exit()
        .transition()
        .duration(500)
        .attr("width", 0)
        .style("opacity", 0)
        .remove();

      // Create new nodes
      const nodeEnter = node
        .enter()
        .append("rect")
        .attr("class", "node s16-sankey-node")
        .style(
          "fill",
          (d) => d.displayColor || d3.color(d.color || "#999").darker(0.3),
        )
        .style("stroke", (d) => d3.color(d.color || "#999").darker(0.5))
        .style("fill-opacity", 1)
        .on("mouseover", (event, d) => {
          d3.select(event.target).style("fill-opacity", 0.8);
          this.showNodeTooltip(event, d);
        })
        .on("mouseout", (event) => {
          d3.select(event.target).style("fill-opacity", 1);
          this.hideTooltip();
        });

      // Merge new and existing nodes for updates
      const nodeUpdate = node.merge(nodeEnter);

      // IMPROVED ANIMATION SEQUENCE FOR NODES
      if (isInitialLoad) {
        // Initial state - invisible but positioned
        nodeUpdate
          .attr("x", (d) => d.x0)
          .attr("y", (d) => d.y0)
          .attr("height", (d) => Math.max(1, d.y1 - d.y0))
          .attr("width", 0)
          .style("opacity", 0);

        // Two-stage animated entrance with improved timing and easing
        nodeUpdate
          .transition()
          .duration(900) // Longer duration for smoother appearance
          .ease(d3.easeCubicInOut) // Add easing function
          .delay((d) => (d.x0 / maxX) * 1200) // Slightly shorter delay to avoid feeling slow
          .style("opacity", 1) // First show node
          .transition()
          .duration(600) // Smoother width expansion
          .ease(d3.easeCubicOut) // Add easing function
          .attr("width", (d) =>
            Math.max(1, (d.x1 - d.x0) * this.widthMultiplier),
          ); // Then expand width
      } else {
        // More gentle transition for updates
        nodeUpdate
          .transition()
          .duration(750)
          .ease(d3.easeCubicOut)
          .attr("x", (d) => d.x0)
          .attr("y", (d) => d.y0)
          .attr("height", (d) => Math.max(1, d.y1 - d.y0))
          .attr("width", (d) =>
            Math.max(1, (d.x1 - d.x0) * this.widthMultiplier),
          )
          .style("opacity", 1);
      }

      return nodeUpdate;
    }

    renderLinks(links, isInitialLoad, maxX, nodes) {
      // Generate link paths
      const linkGenerator = d3.sankeyLinkHorizontal();

      // Pre-processing to ensure consistent link formatting
      // CRITICAL: Convert all links to have object references to ensure consistent handling
      const processedLinks = links.map((link) => ({
        source:
          typeof link.source === "number"
            ? nodes
              ? nodes[link.source]
              : this._cleanDataInput.nodes[link.source]
            : link.source,
        target:
          typeof link.target === "number"
            ? nodes
              ? nodes[link.target]
              : this._cleanDataInput.nodes[link.target]
            : link.target,
        value: link.value,
        width: link.width,
        y0: link.y0,
        y1: link.y1,
        isEmissions: link.isEmissions,
      }));

      // Debug checks (commented out to reduce log spam)
      // console.log("Rendering Sankey links, count:", links.length);

      // Check a sample link to verify data
      // if (links.length > 0) {
      //   const sampleLink = links[0];
      //   console.log("Sample link:", {
      //     source:
      //       typeof sampleLink.source === "object"
      //         ? sampleLink.source.name
      //         : "index:" + sampleLink.source,
      //     target:
      //       typeof sampleLink.target === "object"
      //         ? sampleLink.target.name
      //         : "index:" + sampleLink.target,
      //     value: sampleLink.value,
      //     width: sampleLink.width || "not set",
      //   });
      // }

      // Select and bind links with consistent key function
      const link = this.linkGroup
        .selectAll(".link")
        .data(processedLinks, (d) => {
          const sourceIndex = d.source.index;
          const targetIndex = d.target.index;
          return `${sourceIndex}-${targetIndex}`;
        });

      // Remove old links
      link.exit().remove();

      // Create new links with consistent properties
      const linkEnter = link
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", linkGenerator)
        .style("stroke", (d) => this.getLinkColor(d) || "#999")
        .style("fill", "none")
        .style("stroke-opacity", 0)
        .style("stroke-width", 0); // Always use style() for stroke width

      // Create event handlers
      linkEnter
        .on("mouseover", (event, d) => {
          d3.select(event.target).style("stroke-opacity", 0.9);
          this.showLinkTooltip(event, d);
        })
        .on("mouseout", (event) => {
          d3.select(event.target).style("stroke-opacity", 0.6);
          this.hideTooltip();
        });

      // Merge new and existing links for updates
      const linkUpdate = link.merge(linkEnter).attr("d", linkGenerator);

      // Calculate path length for all links
      linkUpdate.each(function () {
        this._pathLength = this.getTotalLength ? this.getTotalLength() : 500;
      });

      // Set up dash array for animation
      linkUpdate
        .style("stroke-opacity", 0.6)
        .style("stroke-width", (d) => Math.max(1, d.width || 1))
        .attr("stroke-dasharray", function () {
          return `${this._pathLength} ${this._pathLength}`;
        })
        .attr("stroke-dashoffset", function () {
          return this._pathLength;
        });

      // Animate the dash offset for flowing effect
      linkUpdate
        .transition()
        .duration(1500)
        .delay((d) => (d.source.x0 / maxX) * 800)
        .ease(d3.easeQuadInOut)
        .attr("stroke-dashoffset", 0)
        .on("end", function () {
          // Remove dash array/offset after animation completes
          d3.select(this)
            .attr("stroke-dasharray", null)
            .attr("stroke-dashoffset", null);
        });

      // Safety measure - ensure links are visible after animation completes
      setTimeout(() => {
        this.linkGroup
          .selectAll(".link")
          .style("stroke-opacity", 0.6)
          .style("stroke-width", (d) => Math.max(1, d.width || 1))
          .attr("stroke-dasharray", null)
          .attr("stroke-dashoffset", null);
      }, 2500);

      // Final check - count links actually displayed (commented out to reduce log spam)
      // console.log(
      //   "Links after rendering:",
      //   this.linkGroup.selectAll(".link").size(),
      // );

      return linkUpdate;
    }

    renderLabels(nodes, isInitialLoad, maxX) {
      // Select and bind labels
      const text = this.labelGroup
        .selectAll(".node-label")
        .data(nodes, (d) => d.name);

      // Remove old labels
      text.exit().remove();

      // Create new labels
      const textEnter = text
        .enter()
        .append("text")
        .attr("class", "node-label")
        .attr("text-anchor", (d) => (d.x0 < this.width / 2 ? "start" : "end"))
        .attr("x", (d) => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", (d) => (d.y1 + d.y0) / 2)
        .attr("dy", "0.35em")
        .text((d) => d.name)
        .style("opacity", 0); // Start invisible

      // Merge new and existing labels for updates
      const textUpdate = text
        .merge(textEnter)
        .attr("text-anchor", (d) => (d.x0 < this.width / 2 ? "start" : "end"))
        .attr("x", (d) => (d.x0 < this.width / 2 ? d.x1 + 6 : d.x0 - 6))
        .attr("y", (d) => (d.y1 + d.y0) / 2);

      // EXACT SANKEY3035ORIGINAL ANIMATION PATTERN FOR LABELS
      if (isInitialLoad) {
        textUpdate
          .transition()
          .duration(500)
          .delay((d) => (d.x0 / maxX) * 1500 + 500) // Slightly after nodes appear
          .style("opacity", 1);
      } else {
        textUpdate.transition().duration(750).style("opacity", 1);
      }

      return textUpdate;
    }

    showNodeTooltip(event, d) {
      const nodeName = d.name;
      const incoming = d.targetLinks || [];
      const outgoing = d.sourceLinks || [];
      const totalValue =
        d.value || incoming.reduce((sum, link) => sum + link.value, 0);

      let content = `<div class="tooltip-title">${nodeName}</div>`;

      if (nodeName && nodeName.toLowerCase().includes("emissions")) {
        const kgValue = totalValue / 1000;
        content += `<div>Total Flow: ${window.TEUI.formatNumber(kgValue, "number-2dp-comma")} kg CO2e/yr</div>`;
      } else {
        content += `<div>Total Flow: ${window.TEUI.formatNumber(totalValue, "number-2dp-comma")} kWh</div>`;
      }

      if (incoming.length > 0) {
        content += `<div style="margin-top:8px;"><strong>Incoming:</strong></div>`;
        incoming.forEach((link) => {
          const sourceNodeName =
            typeof link.source === "object" ? link.source.name : "";
          const targetNodeName =
            typeof link.target === "object" ? link.target.name : "";
          let linkValueStr;
          if (
            link.isEmissions ||
            (targetNodeName &&
              targetNodeName.toLowerCase().includes("emissions")) ||
            (sourceNodeName &&
              sourceNodeName.toLowerCase().includes("emissions"))
          ) {
            linkValueStr = `${window.TEUI.formatNumber(link.value / 1000, "number-2dp-comma")} kg CO2e/yr`;
          } else {
            linkValueStr = `${window.TEUI.formatNumber(link.value, "number-2dp-comma")} kWh`;
          }
          content += `<div>From ${sourceNodeName}: ${linkValueStr}</div>`;
        });
      }

      if (outgoing.length > 0) {
        content += `<div style="margin-top:8px;"><strong>Outgoing:</strong></div>`;
        outgoing.forEach((link) => {
          const sourceNodeName =
            typeof link.source === "object" ? link.source.name : "";
          const targetNodeName =
            typeof link.target === "object" ? link.target.name : "";
          let linkValueStr;
          if (
            link.isEmissions ||
            (targetNodeName &&
              targetNodeName.toLowerCase().includes("emissions")) ||
            (sourceNodeName &&
              sourceNodeName.toLowerCase().includes("emissions"))
          ) {
            linkValueStr = `${window.TEUI.formatNumber(link.value / 1000, "number-2dp-comma")} kg CO2e/yr`;
          } else {
            linkValueStr = `${window.TEUI.formatNumber(link.value, "number-2dp-comma")} kWh`;
          }
          content += `<div>To ${targetNodeName}: ${linkValueStr}</div>`;
        });
      }

      this.showTooltip(content, event);
    }

    showLinkTooltip(event, d) {
      const sourceName = typeof d.source === "object" ? d.source.name : "";
      const targetName = typeof d.target === "object" ? d.target.name : "";
      const valueInGrams = d.value;

      let formattedDisplayValue;
      let unitLabel;

      if (
        d.isEmissions ||
        (targetName && targetName.toLowerCase().includes("emissions")) ||
        (sourceName && sourceName.toLowerCase().includes("emissions"))
      ) {
        const valueInKg = valueInGrams / 1000;
        formattedDisplayValue = window.TEUI.formatNumber(
          valueInKg,
          "number-2dp-comma",
        );
        unitLabel = "kg CO2e/yr";
      } else {
        formattedDisplayValue = window.TEUI.formatNumber(
          valueInGrams,
          "number-2dp-comma",
        );
        unitLabel = "kWh";
      }

      const content = `
                <div class="tooltip-title">${sourceName} → ${targetName}</div>
                <div>Flow: ${formattedDisplayValue} ${unitLabel}</div>
            `;

      this.showTooltip(content, event);
    }

    createNodeTooltip(d) {
      const originalNodeName = d.name;
      let html = `<div class="tooltip-title">${originalNodeName}</div>`;
      let totalNodeValue = d.value;
      const incoming = d.targetLinks || [];
      const outgoing = d.sourceLinks || [];
      if (originalNodeName.includes("Emissions")) {
        const totalEmissionsInGrams = incoming.reduce(
          (sum, link) => sum + link.value,
          0,
        );
        const kgValue = totalEmissionsInGrams / 1000;
        const formattedKgValue = window.TEUI.formatNumber(
          kgValue,
          "number-2dp-comma",
        );
        const scope = originalNodeName.includes("1")
          ? "Direct emissions from gas combustion"
          : "Indirect emissions from electricity use";
        html += `<div class="tooltip-value">Total: ${formattedKgValue} kg CO2e/yr<br><small>${scope}</small></div>`;
      } else {
        const formattedNodeValue = window.TEUI.formatNumber(
          totalNodeValue,
          "number-2dp-comma",
        );
        html += `<div class="tooltip-value">Total Value: ${formattedNodeValue} kWh</div>`;
      }
      if (incoming.length > 0)
        html += this.buildFlowSectionTooltip("Incoming", incoming, true, true);
      if (outgoing.length > 0)
        html += this.buildFlowSectionTooltip("Outgoing", outgoing, false, true);
      return html;
    }

    createLinkTooltip(d) {
      const sourceName = d.source.name;
      const targetName = d.target.name;
      const valueInGrams = d.value;
      const isEmissionsLink =
        d.isEmissions || (targetName && targetName.includes("Emissions"));

      let formattedDisplayValue;
      let unitLabel;

      if (isEmissionsLink) {
        const valueInKg = valueInGrams / 1000;
        formattedDisplayValue = window.TEUI.formatNumber(
          valueInKg,
          "number-2dp-comma",
        );
        unitLabel = "kg CO2e/yr";
      } else {
        formattedDisplayValue = window.TEUI.formatNumber(
          valueInGrams,
          "number-2dp-comma",
        ); // Assuming non-emission links are kWh
        unitLabel = "kWh";
      }

      return `<div class="tooltip-title">Flow Details</div><div class="tooltip-flow"><span>From: ${sourceName}</span></div><div class="tooltip-flow"><span>To: ${targetName}</span></div><div class="tooltip-flow"><span>Value: ${formattedDisplayValue} ${unitLabel}</span></div>`;
    }

    buildFlowSectionTooltip(title, flows, isIncoming, isD3Node = false) {
      let html = `<div style="margin-top: 8px;"><strong>${title}:</strong></div>`;
      flows.forEach((flow) => {
        const nodeName = isIncoming
          ? isD3Node
            ? flow.source.name
            : typeof flow.source === "number"
              ? this._cleanDataInput.nodes[flow.source].name
              : flow.source.name
          : isD3Node
            ? flow.target.name
            : typeof flow.target === "number"
              ? this._cleanDataInput.nodes[flow.target].name
              : flow.target.name;
        const valueInGrams = flow.value;
        const targetNodeForEmissionCheck = isD3Node
          ? flow.target.name
          : typeof flow.target === "number"
            ? this._cleanDataInput.nodes[flow.target].name
            : flow.target.name;
        const isEmissionsLink =
          flow.isEmissions ||
          (targetNodeForEmissionCheck &&
            targetNodeForEmissionCheck.includes("Emissions"));

        let formattedDisplayValue;
        let unitLabel;

        if (isEmissionsLink) {
          const valueInKg = valueInGrams / 1000;
          formattedDisplayValue = window.TEUI.formatNumber(
            valueInKg,
            "number-2dp-comma",
          );
          unitLabel = "kg CO2e/yr";
        } else {
          formattedDisplayValue = window.TEUI.formatNumber(
            valueInGrams,
            "number-2dp-comma",
          );
          unitLabel = "kWh";
        }
        html += `<div class="tooltip-flow"><span style="width: 160px;">${nodeName}</span><span>${formattedDisplayValue} ${unitLabel}</span></div>`;
      });
      return html;
    }

    formatNodeLabel(node) {
      if (node.name && node.name.toLowerCase().includes("emissions")) {
        const totalEmissionsInGrams =
          node.targetLinks?.reduce((sum, link) => sum + link.value, 0) || 0;
        const kgValue = totalEmissionsInGrams / 1000;
        const formattedKgValue = window.TEUI.formatNumber(
          kgValue,
          "number-2dp-comma",
        );
        return `${node.name} (${formattedKgValue} kg CO2e/yr)`;
      }
      return node.name;
    }

    showTooltip(content, event) {
      if (!this.tooltip || this.tooltip.empty()) {
        // console.error("TEUI_SankeyDiagram Error: Tooltip element not found");
        return;
      }

      // First, make sure tooltip is part of document body
      if (this.tooltip.node().parentNode !== document.body) {
        d3.select(this.tooltip.node()).remove();
        this.tooltip = d3
          .select("body")
          .append("div")
          .attr("id", "sankeySection16Tooltip");
      }

      // Get mouse coordinates relative to viewport
      const mouseX = event.clientX || event.pageX - window.scrollX;
      const mouseY = event.clientY || event.pageY - window.scrollY;

      // Debug log
      // console.warn("S16 SANKEY LOG: Showing tooltip at", mouseX, mouseY, "with content:", content.substring(0, 50) + "...");

      // Set tooltip content and make it visible
      this.tooltip
        .html(content)
        .style("display", "block")
        .style("left", mouseX + 15 + "px")
        .style("top", mouseY + 15 + "px")
        .style("opacity", 0)
        .style("z-index", "10000")
        .transition()
        .duration(200)
        .style("opacity", 1);

      // Get tooltip dimensions
      const tooltipWidth = this.tooltip.node().offsetWidth;
      const tooltipHeight = this.tooltip.node().offsetHeight;

      // Check if tooltip goes off screen and adjust if needed
      const viewportWidth =
        window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;

      let left = mouseX + 15;
      let top = mouseY + 15;

      if (left + tooltipWidth > viewportWidth - 10) {
        left = mouseX - tooltipWidth - 15;
      }

      if (top + tooltipHeight > viewportHeight - 10) {
        top = mouseY - tooltipHeight - 15;
      }

      // Update position if needed
      this.tooltip.style("left", left + "px").style("top", top + "px");
    }

    hideTooltip() {
      if (this.tooltip && !this.tooltip.empty()) {
        this.tooltip
          .transition()
          .duration(200)
          .style("opacity", 0)
          .on("end", function () {
            d3.select(this).style("display", "none");
          });
      }
    }

    getLinkColor(d) {
      // Handle gas exhaust links
      if (d.target.name === "GasExhaust") return "#BE343D";

      // Handle emissions links - differentiate between Scope 1 and Scope 2
      if (
        d.isEmissions ||
        (d.target && d.target.name && d.target.name.includes("Emissions"))
      ) {
        // Scope 1 emissions (direct from gas/oil) - reddish/brown color
        if (d.target && d.target.name && d.target.name.includes("Scope 1")) {
          return "#BE343D"; // Red/brown for Scope 1 (dirtier)
        }
        // Scope 2 emissions (indirect from electricity) - bluish color
        else if (
          d.target &&
          d.target.name &&
          d.target.name.includes("Scope 2")
        ) {
          return "#4A96BA"; // Blue for Scope 2
        }
      }

      // Default link color handling for non-emission links
      if (d.source.name === "Building" || d.target.name === "Building")
        return d.source.name === "Building"
          ? d3.color(d.target.color).brighter(0.2)
          : d3.color(d.source.color);

      return d3.interpolateRgb(d.source.color, d.target.color)(0.5);
    }

    updateEmissionsFlows(dataObjectToModify) {
      const scope1NodeIndex = dataObjectToModify.nodes.findIndex(
        (n) => n.name === "E1 Scope 1 Emissions",
      );
      const scope2NodeIndex = dataObjectToModify.nodes.findIndex(
        (n) => n.name === "E2 Scope 2 Emissions",
      );
      const buildingNodeIndex = dataObjectToModify.nodes.findIndex(
        (n) => n.name === "Building",
      );

      if (
        scope1NodeIndex === -1 ||
        scope2NodeIndex === -1 ||
        buildingNodeIndex === -1
      ) {
        // console.warn("Section 16: Emission sink nodes (E1/E2) or Building node not found in Sankey data.");
        return;
      }

      // Remove existing emission links going to emission nodes
      dataObjectToModify.links = dataObjectToModify.links.filter((link) => {
        // Check target based on original node reference or index if already processed
        let targetNodeToCheck =
          typeof link.target === "object"
            ? link.target
            : dataObjectToModify.nodes[link.target];
        if (!targetNodeToCheck) return true; // Should not happen if data is consistent
        const targetIdx = dataObjectToModify.nodes.indexOf(targetNodeToCheck);

        // Keep link if it's not going to an emissions node
        return !(
          targetIdx === scope1NodeIndex || targetIdx === scope2NodeIndex
        );
      });

      if (
        this.showEmissions &&
        window.TEUI &&
        window.TEUI.StateManager &&
        window.TEUI.StateManager.getValue
      ) {
        const teuiState = window.TEUI.StateManager;

        // Get information about the heating systems
        const primaryHeatingSystem = teuiState.getValue("d_113"); // M.1.0 Primary Heating System
        const dhwSystem = teuiState.getValue("d_51"); // DHW System
        const isHeatingGasOrOil =
          primaryHeatingSystem === "Gas" || primaryHeatingSystem === "Oil";
        const isDhwGasOrOil = dhwSystem === "Gas" || dhwSystem === "Oil";

        const energyInputNodeIndex = dataObjectToModify.nodes.findIndex(
          (n) => n.name === "M.2.1.D Energy Input",
        );
        const tedNodeIndex = dataObjectToModify.nodes.findIndex(
          (n) => n.name === "Thermal Energy Demand",
        );
        const shwNetDemandIndex = dataObjectToModify.nodes.findIndex(
          (n) => n.name === "W.5.2 SHW Net Demand",
        );

        if (energyInputNodeIndex === -1) {
          // console.warn("S16: 'M.2.1.D Energy Input' node not found for emissions linking.");
          return;
        }

        // Track total Scope 1 emissions for Building→Scope1 link
        let totalScope1EmissionsGrams = 0;

        // Handle electricity emissions (Scope 2) - direct path to emissions node
        const elecEmissionsKg = parseFloat(teuiState.getValue("k_27") || 0);
        if (elecEmissionsKg > 0) {
          const elecEmissionsGrams = elecEmissionsKg * 1000;
          if (elecEmissionsGrams > 0.0001) {
            dataObjectToModify.links.push({
              source: energyInputNodeIndex,
              target: scope2NodeIndex,
              value: elecEmissionsGrams,
              isEmissions: true,
              id: "ElectricityToScope2Emissions",
            });
          }
        }

        // Handle Space Heating emissions (Scope 1) using dedicated field f_114
        const spaceHeatingEmissionsKg = parseFloat(
          teuiState.getValue("f_114") || 0,
        );
        if (spaceHeatingEmissionsKg > 0 && isHeatingGasOrOil) {
          const spaceHeatingEmissionsGrams = spaceHeatingEmissionsKg * 1000;
          if (spaceHeatingEmissionsGrams > 0.0001) {
            // For gas/oil heating, emissions flow through building

            // 1. First, TED emissions go to the building
            if (tedNodeIndex !== -1) {
              // Add TED → Building emissions flow
              dataObjectToModify.links.push({
                source: tedNodeIndex,
                target: buildingNodeIndex,
                value: spaceHeatingEmissionsGrams,
                isEmissions: true,
                id: "TEDEmissionsToBuilding",
              });
            } else {
              // Fallback if TED node not found: direct flow from energy input to building
              dataObjectToModify.links.push({
                source: energyInputNodeIndex,
                target: buildingNodeIndex,
                value: spaceHeatingEmissionsGrams,
                isEmissions: true,
                id: "EnergyInputEmissionsToBuilding",
              });
            }

            // Add to total Scope 1 emissions
            totalScope1EmissionsGrams += spaceHeatingEmissionsGrams;
          }
        }

        // Handle DHW/SHW emissions (Scope 1) using dedicated field k_49
        const dhwEmissionsKg = parseFloat(teuiState.getValue("k_49") || 0);
        if (dhwEmissionsKg > 0 && isDhwGasOrOil && shwNetDemandIndex !== -1) {
          const dhwEmissionsGrams = dhwEmissionsKg * 1000;
          if (dhwEmissionsGrams > 0.0001) {
            // 1. SHW emissions to building
            dataObjectToModify.links.push({
              source: shwNetDemandIndex,
              target: buildingNodeIndex,
              value: dhwEmissionsGrams,
              isEmissions: true,
              id: "SHWEmissionsToBuilding",
            });

            // Add to total Scope 1 emissions
            totalScope1EmissionsGrams += dhwEmissionsGrams;
          }
        }

        // Final step: Create the link from Building to Scope 1 Emissions
        // only if we have actual Scope 1 emissions
        if (totalScope1EmissionsGrams > 0.0001) {
          dataObjectToModify.links.push({
            source: buildingNodeIndex,
            target: scope1NodeIndex,
            value: totalScope1EmissionsGrams,
            isEmissions: true,
            id: "BuildingToScope1Emissions",
          });
        }
      }
    }

    _getLinkValueByName(sourceName, targetName) {
      // This function now searches within this._cleanDataInput if it needs pre-D3 values,
      // or it can search within the D3 processed data if appropriate for its use case.
      // For now, assuming it's used by emissions calculation *before* D3 processing, so check dataForD3Processing if available.
      // However, the emissions calculation was simplified to not need this for energy values.
      // If other parts need it, they should operate on this._cleanDataInput.
      if (!this._cleanDataInput) return 0;
      const sourceNode = this._cleanDataInput.nodes.find(
        (n) => n.name === sourceName,
      );
      const targetNode = this._cleanDataInput.nodes.find(
        (n) => n.name === targetName,
      );
      if (!sourceNode || !targetNode) return 0;
      const sourceIdx = this._cleanDataInput.nodes.indexOf(sourceNode);
      const targetIdx = this._cleanDataInput.nodes.indexOf(targetNode);
      const link = this._cleanDataInput.links.find((l) => {
        const lSourceIdx =
          typeof l.source === "number"
            ? l.source
            : this._cleanDataInput.nodes.indexOf(l.source);
        const lTargetIdx =
          typeof l.target === "number"
            ? l.target
            : this._cleanDataInput.nodes.indexOf(l.target);
        return (
          lSourceIdx === sourceIdx && lTargetIdx === targetIdx && !l.isEmissions
        );
      });
      return link ? link.value : 0;
    }

    resize(newWidth, newHeight) {
      // console.warn("S16 SANKEY LOG: Resize called. New Width:", newWidth, "New Height:", newHeight);

      // Update dimensions
      if (newWidth && newHeight) {
        this.width = newWidth;
        this.height = newHeight;
      }

      // Calculate inner dimensions (accounting for margins)
      const innerWidth = this.width - this.margin.left - this.margin.right;
      const innerHeight = this.height - this.margin.top - this.margin.bottom;

      // console.warn("S16 SANKEY LOG: Resize called. New Width:", newWidth, "New Height:", newHeight, "Inner W/H:", innerWidth, innerHeight);

      // Update SVG dimensions, ensuring they are at least 1px
      this.svg
        .attr("width", Math.max(1, this.width))
        .attr("height", Math.max(1, this.height));

      // Update the sankey layout extent, ensuring non-negative dimensions for the layout
      this.sankey.extent([
        [0, 0],
        [Math.max(0, innerWidth), Math.max(0, innerHeight)],
      ]);

      // Re-render with existing data if available
      if (this._cleanDataInput) {
        this.render(this._cleanDataInput, false);
      }
    }

    debugLinks(links) {
      if (!links || links.length === 0) {
        // console.warn("S16 SANKEY DEBUG: No links to debug");
        return;
      }

      // Log some sample links with their values and paths
      // console.warn("S16 SANKEY DEBUG: Examining D3 link rendering...");

      // Take at most 5 links to examine
      const samplesToExamine = Math.min(5, links.length);
      for (let i = 0; i < samplesToExamine; i++) {
        const link = links[i];

        // console.warn(`S16 SANKEY DEBUG: Link ${i+1}/${samplesToExamine}:`, {
        //    source: link.source.name,
        //    target: link.target.name,
        //    value: link.value,
        //    width: link.width, // D3 sankey sets this during layout
        //    y0: link.y0, // Source y-position
        //    y1: link.y1, // Target y-position
        //    path: d3.sankeyLinkHorizontal()(link) // The actual SVG path
        // });
      }
    }
  }

  // --- Private Variables (Section16 specific) ---
  let sankeyInstance = TEUI_SankeyDiagram;

  // --- Section Structure & Layout ---
  function getFields() {
    return {};
  }

  function getDropdownOptions() {
    return {};
  }

  function getLayout() {
    return {
      rows: [
        {
          id: "", // Placeholder row for future use - blank name
          cells: [
            {},
            {},
            {
              content: "", // Reserved for future stats/financial reporting
              colspan: 12,
            },
          ],
          hidden: true, // Hide placeholder row text for now
        },
      ],
    };
  }

  function getFullscreenWidthValueText() {
    return document.querySelector("#s16FullscreenWidthToggle span");
  }

  function setupSection16DOM() {
    const targetArea = document.getElementById("section16ContentTarget");
    if (!targetArea) {
      // console.error("Section 16 Critical Error: The target div #section16ContentTarget was not found in index.html. Cannot setup DOM.");
      return false;
    }

    // Initialize currentMode if not set
    if (!window.TEUI.sect16.currentMode) {
      window.TEUI.sect16.currentMode = window.TEUI.sect16.MODES.SANKEY;
    }

    // Helper function to create consistently styled buttons
    function createStyledButton(
      id,
      iconClass,
      text,
      initialDisplay = "inline-flex",
    ) {
      const button = document.createElement("button");
      button.id = id;
      button.className = "sankey-control-button"; // Consistent class for all buttons

      // Apply Section 17 styling directly
      button.style.cssText =
        "display: flex; align-items: center; gap: 6px; padding: 6px 12px; background-color: #f5f5f5; border: 1px solid #dee2e6; border-radius: 4px; font-size: 0.875rem; height: 30px; cursor: pointer; white-space: nowrap;";

      // Set initial display
      button.style.display = initialDisplay;

      // Add icon if provided
      if (iconClass) {
        const icon = document.createElement("i");
        icon.className = iconClass;
        button.appendChild(icon);
      }

      // Add text
      const textSpan = document.createElement("span");
      textSpan.textContent = text;
      button.appendChild(textSpan);

      return button;
    }

    // Clear the target area
    targetArea.innerHTML = "";

    // Create the controls container
    const controlsContainer = document.createElement("div");
    controlsContainer.id = "s16ControlsContainer";
    controlsContainer.className = "sankey-controls-wrapper";
    controlsContainer.style.cssText =
      "display: flex; flex-wrap: wrap; gap: 10px; padding: 10px; margin-bottom: 12px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;";

    // Create the activate button
    const activateBtn = createStyledButton(
      "s16ActivateBtn",
      "bi bi-arrow-clockwise",
      "Activate Sankey",
    );
    controlsContainer.appendChild(activateBtn);

    // Create mode toggle button (heating/cooling) - initially hidden
    const modeToggleBtn = createStyledButton(
      "s16ModeToggleBtn",
      "bi bi-snow",
      "Cooling",
      "none",
    );
    // Set initial blue background for cooling option
    modeToggleBtn.style.backgroundColor = "#4A96BA";
    modeToggleBtn.style.color = "#ffffff";
    controlsContainer.appendChild(modeToggleBtn);

    // Create emissions toggle button (initially hidden)
    const emissionsBtn = createStyledButton(
      "s16ToggleEmissionsBtn",
      "bi bi-cloud",
      "Show Emissions",
      "none",
    );
    controlsContainer.appendChild(emissionsBtn);

    // Create spacing toggle button (initially hidden)
    const spacingBtn = createStyledButton(
      "s16ToggleSpacingBtn",
      "bi bi-arrows-angle-contract",
      "Energy Balance",
      "none",
    );
    controlsContainer.appendChild(spacingBtn);

    // Create fullscreen button (initially hidden)
    const fullscreenBtn = createStyledButton(
      "s16FullscreenBtn",
      "bi bi-arrows-fullscreen",
      "Fullscreen",
      "none",
    );
    controlsContainer.appendChild(fullscreenBtn);

    // Create width multiplier slider container (initially hidden)
    const widthToggleContainer = document.createElement("div");
    widthToggleContainer.id = "s16WidthToggleContainer";
    widthToggleContainer.style.cssText =
      "display: none; align-items: center; gap: 8px; padding: 3px 10px; background-color: #f5f5f5; border: 1px solid #dee2e6; border-radius: 4px; height: 30px;";
    widthToggleContainer.innerHTML = `
            <label for="s16WidthMultiplierSlider" style="font-size: 0.875rem; white-space: nowrap;">Width:</label>
            <input type="range" id="s16WidthMultiplierSlider" min="25" max="300" value="100" step="5" style="width: 100px;">
            <span style="font-size: 0.875rem; min-width: 40px; text-align: right;">100%</span>
        `;
    controlsContainer.appendChild(widthToggleContainer);

    // Add the controls to the target area
    targetArea.appendChild(controlsContainer);

    // Create the diagram wrapper div
    const diagramWrapper = document.createElement("div");
    diagramWrapper.id = "s16DiagramWrapper";
    diagramWrapper.style.cssText =
      "width: 100%; height: 600px; position: relative; display: none;";

    // Create the SVG element for the Sankey diagram
    const svgElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    svgElement.id = "sankeySection16Svg";
    svgElement.style.cssText = "width: 100%; height: 100%; display: block;";
    diagramWrapper.appendChild(svgElement);

    // Create loading placeholder
    const loadingPlaceholder = document.createElement("div");
    loadingPlaceholder.id = "s16LoadingPlaceholder";
    loadingPlaceholder.className = "teui-loading-placeholder";
    loadingPlaceholder.innerHTML =
      "<p>Activate the Sankey diagram to visualize energy flows.</p>";
    loadingPlaceholder.style.cssText =
      "padding: 20px; text-align: center; background: #f9f9f9; border-radius: 4px;";

    // Add diagram wrapper and loading placeholder to target area
    targetArea.appendChild(diagramWrapper);
    targetArea.appendChild(loadingPlaceholder);

    // Create the fullscreen container
    const fullscreenContainer = document.createElement("div");
    fullscreenContainer.id = "s16FullscreenContainer";
    fullscreenContainer.style.cssText =
      "display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 9999; padding: 20px; overflow: hidden;";

    // Create fullscreen controls
    const fullscreenControlsContainer = document.createElement("div");
    fullscreenControlsContainer.style.cssText =
      "display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px;";

    // Create fullscreen title
    const fullscreenTitle = document.createElement("h2");
    fullscreenTitle.textContent = "Energy Flow Diagram (Sankey)";
    fullscreenTitle.style.cssText = "margin: 0; font-size: 1.25rem;";
    fullscreenControlsContainer.appendChild(fullscreenTitle);

    // Create fullscreen controls right side
    const fullscreenControlsRight = document.createElement("div");
    fullscreenControlsRight.style.cssText =
      "display: flex; align-items: center; gap: 10px;";

    // Create fullscreen width slider
    const fullscreenWidthToggle = document.createElement("div");
    fullscreenWidthToggle.id = "s16FullscreenWidthToggle";
    fullscreenWidthToggle.style.cssText =
      "display: flex; align-items: center; gap: 8px; padding: 3px 10px; background-color: #f5f5f5; border: 1px solid #dee2e6; border-radius: 4px; height: 30px;";
    fullscreenWidthToggle.innerHTML = `
            <label for="s16FullscreenWidthSlider" style="font-size: 0.875rem; white-space: nowrap;">Width:</label>
            <input type="range" id="s16FullscreenWidthSlider" min="25" max="300" value="100" step="5" style="width: 100px;">
            <span style="font-size: 0.875rem; min-width: 40px; text-align: right;">100%</span>
        `;
    fullscreenControlsRight.appendChild(fullscreenWidthToggle);

    // Create fullscreen close button
    const fullscreenCloseBtn = createStyledButton(
      "s16FullscreenCloseBtn",
      "bi bi-x-lg",
      "Close",
    );
    fullscreenControlsRight.appendChild(fullscreenCloseBtn);

    fullscreenControlsContainer.appendChild(fullscreenControlsRight);
    fullscreenContainer.appendChild(fullscreenControlsContainer);

    // Create the fullscreen SVG
    const fullscreenSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    fullscreenSvg.id = "sankeySection16FullscreenSvg";
    fullscreenSvg.style.cssText =
      "width: 100%; height: calc(100% - 50px); display: block;";
    fullscreenContainer.appendChild(fullscreenSvg);

    // Add the fullscreen container to the body
    document.body.appendChild(fullscreenContainer);

    // Make sure tooltip container exists
    if (!document.getElementById("sankeySection16Tooltip")) {
      const tooltipDiv = document.createElement("div");
      tooltipDiv.id = "sankeySection16Tooltip";
      document.body.appendChild(tooltipDiv);
    }

    // console.log("Section 16: DOM setup complete");
    return true;
  }

  function initializeEventHandlers() {
    // This function now assumes setupSection16DOM() has been called and elements exist.
    // The idempotency is handled by onSectionRendered.
    // console.warn("S16 LOG: initializeEventHandlers CALLED.");

    const activateBtn = document.getElementById("s16ActivateBtn");
    // console.warn("S16 LOG: #s16ActivateBtn in initializeEventHandlers (result of getElementById):", activateBtn);

    const emissionsBtn = document.getElementById("s16ToggleEmissionsBtn");
    const spacingBtn = document.getElementById("s16ToggleSpacingBtn");
    const widthSlider = document.getElementById("s16WidthMultiplierSlider");
    const widthToggleContainer = document.getElementById(
      "s16WidthToggleContainer",
    );
    const loadingPlaceholder = document.getElementById("s16LoadingPlaceholder");
    const fullscreenBtn = document.getElementById("s16FullscreenBtn");

    // Add button state handlers
    function addButtonStateHandlers() {
      // Get all buttons
      const buttons = document.querySelectorAll(".sankey-control-button");

      // Add hover effect (but exclude mode toggle button which has custom colors)
      buttons.forEach((button) => {
        // Skip mode toggle button - it has custom blue/red colors
        if (button.id === "s16ModeToggleBtn") return;

        button.addEventListener("mouseenter", () => {
          button.style.backgroundColor = "#e5e5e5";
        });

        button.addEventListener("mouseleave", () => {
          if (!button.classList.contains("active")) {
            button.style.backgroundColor = "#f5f5f5";
          }
        });
      });
    }

    // Call this function to initialize button states
    addButtonStateHandlers();

    if (activateBtn) {
      activateBtn.addEventListener("click", function () {
        // console.warn("S16 LOG: Activate button CLICKED.");
        // Simply call the activateSankey function
        activateSankey();
      });
    } else {
      // console.warn("S16 LOG: Activate button NOT FOUND when trying to attach listener in initializeEventHandlers.");
    }

    // Mode toggle button handler (heating/cooling)
    const modeToggleBtn = document.getElementById("s16ModeToggleBtn");
    if (modeToggleBtn) {
      // Custom hover effects that preserve blue/red colors
      modeToggleBtn.addEventListener("mouseenter", function () {
        const isHeating = window.TEUI.sect16.currentMode === "heating";
        if (isHeating) {
          // Lighter blue on hover
          this.style.backgroundColor = "#6BB0D0";
        } else {
          // Lighter red on hover
          this.style.backgroundColor = "#D85662";
        }
      });

      modeToggleBtn.addEventListener("mouseleave", function () {
        const isHeating = window.TEUI.sect16.currentMode === "heating";
        if (isHeating) {
          // Return to blue
          this.style.backgroundColor = "#4A96BA";
        } else {
          // Return to red
          this.style.backgroundColor = "#BE343D";
        }
      });

      modeToggleBtn.addEventListener("click", function () {
        // Toggle mode
        window.TEUI.sect16.currentMode =
          window.TEUI.sect16.currentMode === "heating" ? "cooling" : "heating";

        const isHeating = window.TEUI.sect16.currentMode === "heating";

        // Update button text and icon
        const icon = this.querySelector("i");
        const textSpan = this.querySelector("span");

        if (icon) {
          icon.className = isHeating ? "bi bi-snow" : "bi bi-fire";
        }

        if (textSpan) {
          textSpan.textContent = isHeating ? "Cooling" : "Heating";
        }

        // Update button color
        if (isHeating) {
          // In heating mode, show blue "Cooling" button
          this.style.backgroundColor = "#4A96BA";
          this.style.color = "#ffffff";
        } else {
          // In cooling mode, show red "Heating" button
          this.style.backgroundColor = "#BE343D";
          this.style.color = "#ffffff";
        }

        // Re-render Sankey with new mode data
        console.log("Mode toggled to:", window.TEUI.sect16.currentMode);
        fetchDataAndRenderSankey(false); // false = not initial load, use refresh animation
      });
    }

    if (emissionsBtn) {
      emissionsBtn.addEventListener("click", function () {
        window.TEUI.sect16.showEmissions = !window.TEUI.sect16.showEmissions;

        // Update button text and style
        const textSpan = this.querySelector("span");
        if (textSpan) {
          textSpan.textContent = window.TEUI.sect16.showEmissions
            ? "Hide Emissions"
            : "Show Emissions";
        }

        // Update button styling based on state
        if (window.TEUI.sect16.showEmissions) {
          this.classList.add("active");
          this.style.backgroundColor = "#0d6efd";
          this.style.color = "white";
          this.style.borderColor = "#0d6efd";
        } else {
          this.classList.remove("active");
          this.style.backgroundColor = "#f5f5f5";
          this.style.color = "";
          this.style.borderColor = "#dee2e6";
        }

        if (window.TEUI.sect16.isActive) fetchDataAndRenderSankey(false);
      });
    }
    if (spacingBtn) {
      spacingBtn.addEventListener("click", function () {
        window.TEUI.sect16.nodePadding =
          window.TEUI.sect16.nodePadding === 15 ? 2 : 15;

        // Update button text
        const textSpan = this.querySelector("span");
        if (textSpan) {
          textSpan.textContent =
            window.TEUI.sect16.nodePadding === 15
              ? "Energy Balance"
              : "Sankey Diagram";
        }

        // Toggle active state styling
        if (window.TEUI.sect16.nodePadding === 2) {
          // Energy Balance mode is active
          this.classList.add("active");
          this.style.backgroundColor = "#0d6efd";
          this.style.color = "white";
          this.style.borderColor = "#0d6efd";
        } else {
          // Sankey mode is active
          this.classList.remove("active");
          this.style.backgroundColor = "#f5f5f5";
          this.style.color = "";
          this.style.borderColor = "#dee2e6";
        }

        if (window.TEUI.sect16.isActive) fetchDataAndRenderSankey(false);
      });
    }
    if (widthSlider) {
      const widthValueText = document.querySelector(
        "#s16WidthToggleContainer span",
      );

      widthSlider.addEventListener("input", function () {
        const value = Math.min(3.0, parseFloat(this.value) / 100);
        if (widthValueText) {
          widthValueText.textContent = `${Math.round(value * 100)}%`;
        }

        // Update the node width multiplier
        window.TEUI.sect16.nodeWidthMultiplier = value;

        // Apply to the active instance
        if (window.TEUI.sect16.sankeyInstance) {
          window.TEUI.sect16.sankeyInstance.widthMultiplier = value;

          // Trigger re-render with the current data
          if (window.TEUI.sect16.sankeyInstance._cleanDataInput) {
            window.TEUI.sect16.sankeyInstance.render(
              window.TEUI.sect16.sankeyInstance._cleanDataInput,
              false,
            );
          }
        }
      });
    }

    // Add fullscreen functionality
    if (fullscreenBtn) {
      const fullscreenContainer = document.getElementById(
        "s16FullscreenContainer",
      );
      const fullscreenCloseBtn = document.getElementById(
        "s16FullscreenCloseBtn",
      );

      // Fullscreen Sankey instance
      window.TEUI.sect16.fullscreenSankeyInstance = null;

      fullscreenBtn.addEventListener("click", function () {
        if (!fullscreenContainer) return;

        fullscreenContainer.style.display = "block";
        document.body.style.overflow = "hidden"; // Prevent scrolling behind fullscreen

        const fullscreenSvg = document.getElementById(
          "sankeySection16FullscreenSvg",
        );
        if (!fullscreenSvg) return;

        // Create a separate Sankey instance for fullscreen
        if (!window.TEUI.sect16.fullscreenSankeyInstance) {
          window.TEUI.sect16.fullscreenSankeyInstance = new TEUI_SankeyDiagram({
            containerId: "sankeySection16FullscreenSvg",
            width: fullscreenContainer.clientWidth - 40, // account for padding
            height: fullscreenContainer.clientHeight - 100, // account for controls and padding
            nodeWidth: window.TEUI.sect16.defaultNodeWidth,
            nodePadding: window.TEUI.sect16.nodePadding,
            linkShape: window.TEUI.sect16.currentMode.linkShape,
            nodeAlignment: window.TEUI.sect16.currentMode.nodeAlignment,
            showEmissions: window.TEUI.sect16.showEmissions,
            isFullscreen: true,
          });

          window.TEUI.sect16.fullscreenSankeyInstance.widthMultiplier =
            window.TEUI.sect16.nodeWidthMultiplier;

          window.TEUI.sect16.fullscreenSankeyInstance.init();
        }

        // Get current data from main instance if available
        if (
          window.TEUI.sect16.sankeyInstance &&
          window.TEUI.sect16.sankeyInstance._cleanDataInput
        ) {
          // Render with the same data as the main view
          window.TEUI.sect16.fullscreenSankeyInstance.render(
            window.TEUI.sect16.sankeyInstance._cleanDataInput,
            true,
          );
        } else {
          // Fallback to fetch new data
          const sankeyData = buildSankeyDataFromStateManager();
          window.TEUI.sect16.fullscreenSankeyInstance.render(sankeyData, true);
        }

        // Create an update timer to handle window resize
        let resizeTimer;
        const handleResize = function () {
          if (window.TEUI.sect16.fullscreenSankeyInstance) {
            window.TEUI.sect16.fullscreenSankeyInstance.resize(
              fullscreenContainer.clientWidth - 40,
              fullscreenContainer.clientHeight - 100,
            );
          }
        };

        // Handle window resize events
        window.addEventListener("resize", function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(handleResize, 100);
        });

        // Add fullscreen width slider functionality
        const fullscreenWidthSlider = document.getElementById(
          "s16FullscreenWidthSlider",
        );
        if (fullscreenWidthSlider) {
          const fullscreenWidthValueText = getFullscreenWidthValueText(); // document.querySelector('#s16FullscreenWidthToggle span');

          // Set initial value
          fullscreenWidthSlider.value =
            window.TEUI.sect16.nodeWidthMultiplier * 100;
          if (fullscreenWidthValueText) {
            fullscreenWidthValueText.textContent = `${Math.round(window.TEUI.sect16.nodeWidthMultiplier * 100)}%`;
          }

          fullscreenWidthSlider.addEventListener("input", function () {
            const value = Math.min(3.0, parseFloat(this.value) / 100);
            if (fullscreenWidthValueText) {
              fullscreenWidthValueText.textContent = `${Math.round(value * 100)}%`;
            }

            if (window.TEUI.sect16.fullscreenSankeyInstance) {
              window.TEUI.sect16.fullscreenSankeyInstance.widthMultiplier =
                value;

              // Trigger re-render with current data
              if (window.TEUI.sect16.fullscreenSankeyInstance._cleanDataInput) {
                window.TEUI.sect16.fullscreenSankeyInstance.render(
                  window.TEUI.sect16.fullscreenSankeyInstance._cleanDataInput,
                  false,
                );
              }
            }
          });
        }
      });

      // Add close button functionality
      if (fullscreenCloseBtn) {
        fullscreenCloseBtn.addEventListener("click", function () {
          if (fullscreenContainer) {
            fullscreenContainer.style.display = "none";
            document.body.style.overflow = "";
          }
        });
      }
    }

    window.addEventListener("resize", function () {
      if (window.TEUI.sect16.isActive && window.TEUI.sect16.sankeyInstance) {
        // Get the current diagram wrapper
        const wrapper = document.getElementById("s16DiagramWrapper");
        if (wrapper && window.TEUI.sect16.sankeyInstance.resize) {
          window.TEUI.sect16.sankeyInstance.resize(
            wrapper.clientWidth,
            wrapper.clientHeight,
          );
        }

        // Also update fullscreen if active
        const fullscreenContainer = document.getElementById(
          "s16FullscreenContainer",
        );
        if (
          fullscreenContainer &&
          fullscreenContainer.style.display !== "none" &&
          window.TEUI.sect16.fullscreenSankeyInstance &&
          window.TEUI.sect16.fullscreenSankeyInstance.resize
        ) {
          const fullscreenWidth = fullscreenContainer.clientWidth - 40;
          const fullscreenHeight = fullscreenContainer.clientHeight - 70;
          window.TEUI.sect16.fullscreenSankeyInstance.resize(
            fullscreenWidth,
            fullscreenHeight,
          );
        }
      }
    });

    // console.warn("S16 LOG: Event handler attachments attempted.");
  }

  function activateSankey() {
    // console.log("Section 16: Activating Sankey diagram");

    // Get DOM elements
    const diagramWrapper = document.getElementById("s16DiagramWrapper");
    const loadingPlaceholder = document.getElementById("s16LoadingPlaceholder");

    if (!diagramWrapper) {
      // console.error("Section 16 Error: Diagram wrapper not found. Cannot activate Sankey.");
      return;
    }

    // Show diagram, hide placeholder
    diagramWrapper.style.display = "block";
    if (loadingPlaceholder) loadingPlaceholder.style.display = "none";

    // Update button text
    const activateBtn = document.getElementById("s16ActivateBtn");
    if (activateBtn) activateBtn.textContent = "Refresh Sankey";

    // Show other controls
    const controls = [
      "s16ModeToggleBtn",
      "s16ToggleEmissionsBtn",
      "s16ToggleSpacingBtn",
      "s16WidthToggleContainer",
      "s16FullscreenBtn",
    ];
    controls.forEach((id) => {
      const el = document.getElementById(id);
      if (el)
        el.style.display =
          id === "s16WidthToggleContainer" ? "flex" : "inline-flex";
    });

    // Initialize Sankey diagram
    if (!window.TEUI.sect16.sankeyInstance) {
      window.TEUI.sect16.sankeyInstance = new TEUI_SankeyDiagram({
        containerId: "sankeySection16Svg",
        width: diagramWrapper.clientWidth,
        height: diagramWrapper.clientHeight,
        nodeWidth: window.TEUI.sect16.defaultNodeWidth,
        nodePadding: window.TEUI.sect16.nodePadding,
      });

      if (!window.TEUI.sect16.sankeyInstance.init()) {
        // console.error("Section 16 Error: Failed to initialize Sankey diagram.");
        return;
      }
    }

    // Set active flag
    window.TEUI.sect16.isActive = true;

    // Render the Sankey diagram with data from StateManager
    fetchDataAndRenderSankey(true);
  }

  function onSectionRendered() {
    // console.log("Section 16: onSectionRendered called. Initialized flag:", window.TEUI.sect16.initialized);

    if (window.TEUI.sect16.initialized) {
      // console.log("Section 16: Already initialized, skipping setup.");
      return;
    }

    // Setup DOM first
    if (!setupSection16DOM()) {
      // console.error("Section 16: DOM setup failed in onSectionRendered. Aborting setup.");
      return;
    }
    // console.log("Section 16: DOM setup complete");

    // Setup event handlers after DOM is ready
    initializeEventHandlers();

    // Set the placeholder text
    const loadingPlaceholder = document.getElementById("s16LoadingPlaceholder");
    if (loadingPlaceholder) {
      loadingPlaceholder.style.display = "flex";
      loadingPlaceholder.textContent =
        "Click 'Activate Sankey' to load the diagram";
    }

    // Mark as initialized to prevent duplicate setup
    window.TEUI.sect16.initialized = true;
  }

  function handleStateChange(newValue) {
    // Sankey now only refreshes manually via refresh button
    // No automatic re-rendering on state changes for better performance
    if (window.TEUI.sect16.isActive) {
      // console.log("Section 16: State changed, but Sankey will only refresh manually via button.");
    }
  }

  // Add this function before fetchDataAndRenderSankey
  function debugSankeyLinkValues() {
    // console.warn("S16 DEBUG: Validating all link values...");

    if (!sankeyInstance || !sankeyInstance._cleanDataInput) {
      // console.warn("S16 DEBUG: No Sankey data available to validate.");
      return;
    }

    // Log all link values from the current data
    sankeyInstance._cleanDataInput.links.forEach((link) => {
      let linkId = link.id || "Unknown";
      let sourceNode =
        typeof link.source === "object"
          ? link.source.name
          : sankeyInstance._cleanDataInput.nodes[link.source]?.name ||
            "Unknown";
      let targetNode =
        typeof link.target === "object"
          ? link.target.name
          : sankeyInstance._cleanDataInput.nodes[link.target]?.name ||
            "Unknown";

      // console.warn(`S16 DEBUG: Link "${linkId}" (${sourceNode} → ${targetNode}) Value: ${link.value}`);
    });

    // Check specific envelope losses (TEL components) directly from StateManager
    if (window.TEUI && window.TEUI.StateManager) {
      const teuiState = window.TEUI.StateManager;
      // console.warn("S16 DEBUG: Checking TEL component values from StateManager:");

      const telFields = [
        "i_85",
        "i_86",
        "i_87",
        "i_88",
        "i_89",
        "i_90",
        "i_91",
        "i_92",
        "i_93",
        "i_94",
        "i_95",
        "i_97",
        "i_103",
      ];
      telFields.forEach((fieldId) => {
        const value = teuiState.getValue(fieldId);
        // console.warn(`S16 DEBUG: TEL Field: ${fieldId}, StateManager Value: ${value}`);
      });

      // Check Energy Interface fields
      // console.warn("S16 DEBUG: Checking Energy Interface fields:");
      ["d_114", "d_115", "d_127", "d_131", "l_113", "l_115"].forEach(
        (fieldId) => {
          const value = teuiState.getValue(fieldId);
          // console.warn(`S16 DEBUG: Energy Interface Field: ${fieldId}, StateManager Value: ${value}`);
        },
      );
    }
  }

  function buildSankeyDataFromStateManager() {
    // Start with the template structure
    let sankeyData = JSON.parse(JSON.stringify(SANKEY_STRUCTURE_TEMPLATE));

    // Get StateManager instance
    const teuiState = window.TEUI.StateManager;
    if (!teuiState || typeof teuiState.getValue !== "function") {
      // console.warn("Section 16: TEUI.StateManager not available for data fetching. Using template defaults.");
      return sankeyData;
    }

    // Get system configurations
    const primaryHeatingSystem = teuiState.getValue("d_113");
    const dhwSystem = teuiState.getValue("d_51");
    const isPrimaryGasOrOil =
      primaryHeatingSystem === "Gas" || primaryHeatingSystem === "Oil";
    const isDhwGasOrOil = dhwSystem === "Gas" || dhwSystem === "Oil";

    // Configure the GasExhaust node visibility
    const gasExhaustNode = sankeyData.nodes.find(
      (n) => n.name === "GasExhaust",
    );
    if (gasExhaustNode) {
      gasExhaustNode.hidden = !(isPrimaryGasOrOil || isDhwGasOrOil);
    }

    // Map link IDs to TEUI StateManager field IDs
    const linkIdToTeuiField = {
      OccupantGains: "i_64",
      EquipmentGains: "i_70",
      SHWNetDemand: "j_52",
      WinNorthGains: "i_74",
      WinEastGains: "i_75",
      WinSouthGains: "i_76",
      WinWestGains: "i_77",
      DoorGains: "i_73",
      SkylightGains: "i_78",
      HeatPumpSourceToTED: "l_113",
      HeatPumpElecToTED: "d_114",
      TEDToBuilding: "d_127",
      TELToRoof: "i_85",
      TELToWallAG: "i_86",
      TELToFloorExp: "i_87",
      TELToDoor: "i_88",
      TELToWinN: "i_89",
      TELToWinE: "i_90",
      TELToWinS: "i_91",
      TELToWinW: "i_92",
      TELToSkylight: "i_93",
      TELToWallBG: "i_94",
      TELToSlab: "i_95",
      TELToTB: "i_97",
      TELToAirLeak: "i_103",
      BuildingToVentLoss: "m_121",
      BuildingToSHWWaste: "j_53",
      BuildingToUnusableGains: "i_82",
      BuildingToTEL: "d_131",
      TEDToGasExhaust: "l_115",
      SHWToGasExhaust: "j_54",
      BuildingToGasExhaust: null,
    };

    // Process each link to get values from StateManager
    sankeyData.links.forEach((link) => {
      if (!link.id) return; // Skip links without IDs

      let teuiFieldId = linkIdToTeuiField[link.id];
      let valueToAssign = 0.0001; // Default minimum value
      let rawValueFromState = null; // For logging

      // Special case handling for specific links
      if (link.id === "HeatPumpSourceToTED") {
        if (isPrimaryGasOrOil) {
          valueToAssign = 0.0001; // Minimal value in gas mode
        } else {
          rawValueFromState = teuiState.getValue(teuiFieldId);
          valueToAssign = parseFloat(rawValueFromState) || 0.0001;
        }
      } else if (link.id === "HeatPumpElecToTED") {
        if (isPrimaryGasOrOil) {
          teuiFieldId = "d_115"; // Use gas input instead
        }
        rawValueFromState = teuiState.getValue(teuiFieldId);
        valueToAssign = parseFloat(rawValueFromState) || 0.0001;
      } else if (link.id === "TEDToGasExhaust") {
        if (isPrimaryGasOrOil) {
          rawValueFromState = teuiState.getValue(teuiFieldId);
          valueToAssign = parseFloat(rawValueFromState) || 0.0001;
        } else {
          valueToAssign = 0.0001; // Minimal value in non-gas mode
        }
      } else if (link.id === "SHWToGasExhaust") {
        if (isDhwGasOrOil) {
          rawValueFromState = teuiState.getValue(teuiFieldId);
          valueToAssign = parseFloat(rawValueFromState) || 0.0001;
        } else {
          valueToAssign = 0.0001; // Minimal value in non-gas mode
        }
      } else if (link.id === "BuildingToGasExhaust") {
        valueToAssign = 0.0001; // Always minimal for this link
      } else if (teuiFieldId) {
        // Standard processing for most links
        rawValueFromState = teuiState.getValue(teuiFieldId);
        if (rawValueFromState !== null && rawValueFromState !== undefined) {
          valueToAssign = parseFloat(rawValueFromState) || 0.0001;
        }
      }

      // Set the link value
      link.value = Math.max(0.0001, valueToAssign);

      // Log for debugging
      // console.warn(`S16 LINK LOG: ID: ${link.id}, TEUI Field: ${teuiFieldId || 'N/A'}, Raw State Value: '${rawValueFromState}', Assigned Link Value: ${link.value}`);
    });

    // Now ensure all nodes and links have the correct structure
    // This converts node references to indexes for D3 to process properly
    sankeyData.links = sankeyData.links.map((link) => {
      if (typeof link.source === "number" && typeof link.target === "number") {
        // Keep direct numeric indices
        return link;
      } else {
        // Convert node references to indices
        return {
          source:
            typeof link.source === "number"
              ? link.source
              : sankeyData.nodes.findIndex((n) => n.name === link.source.name),
          target:
            typeof link.target === "number"
              ? link.target
              : sankeyData.nodes.findIndex((n) => n.name === link.target.name),
          value: link.value,
          id: link.id,
          isEmissions: link.isEmissions,
        };
      }
    });

    return sankeyData;
  }

  function fetchDataAndRenderSankey(isInitialLoad = true) {
    // console.log("Section 16: Fetching data and rendering Sankey...");

    // Make sure the Sankey instance exists
    if (!window.TEUI.sect16.sankeyInstance) {
      // console.error("Section 16: Sankey instance not found. Cannot render.");
      return;
    }

    // Get data based on current mode (heating or cooling)
    let sankeyData;
    if (window.TEUI.sect16.currentMode === "cooling") {
      // Use cooling module data
      if (window.TEUI.CoolingSankey) {
        sankeyData = window.TEUI.CoolingSankey.getCoolingSankeyData();
      } else {
        console.error(
          "Section 16: Cooling module not loaded. Falling back to heating.",
        );
        sankeyData = buildSankeyDataFromStateManager();
      }
    } else {
      // Use heating data (default)
      sankeyData = buildSankeyDataFromStateManager();
    }

    // Update emissions if enabled
    if (window.TEUI.sect16.showEmissions) {
      window.TEUI.sect16.sankeyInstance.showEmissions = true;
      window.TEUI.sect16.sankeyInstance.updateEmissionsFlows(sankeyData);
    } else {
      window.TEUI.sect16.sankeyInstance.showEmissions = false;
    }

    // Apply any custom options
    const nodePadding = window.TEUI.sect16.nodePadding || 15;
    const nodeWidthMultiplier = window.TEUI.sect16.nodeWidthMultiplier || 1;

    // Set options directly on sankey instance
    if (window.TEUI.sect16.sankeyInstance.sankey) {
      window.TEUI.sect16.sankeyInstance.sankey.nodePadding(nodePadding);
      window.TEUI.sect16.sankeyInstance.nodeWidth = 20 * nodeWidthMultiplier;
      window.TEUI.sect16.sankeyInstance.widthMultiplier = nodeWidthMultiplier;
    }

    // Debug the data
    debugSankeyData(sankeyData);

    // Render the Sankey diagram
    window.TEUI.sect16.sankeyInstance.render(sankeyData, isInitialLoad);

    // console.log("Section 16: Sankey render call complete.");
  }

  // Debug helper for Sankey data
  function debugSankeyData(sankeyData) {
    if (!sankeyData || !sankeyData.links || !sankeyData.nodes) {
      // console.warn("S16 DEBUG: No valid Sankey data to debug");
      return;
    }

    // console.warn("S16 DEBUG: Checking link values in Sankey data");

    // Log important links for debugging
    for (let i = 0; i < Math.min(5, sankeyData.links.length); i++) {
      const link = sankeyData.links[i];
      if (!link || !link.id) continue;

      // Get source and target node names
      const sourceNodeIdx =
        typeof link.source === "number"
          ? link.source
          : sankeyData.nodes.indexOf(link.source);
      const targetNodeIdx =
        typeof link.target === "number"
          ? link.target
          : sankeyData.nodes.indexOf(link.target);

      const sourceName =
        sourceNodeIdx >= 0 && sourceNodeIdx < sankeyData.nodes.length
          ? sankeyData.nodes[sourceNodeIdx].name
          : "Unknown";
      const targetName =
        targetNodeIdx >= 0 && targetNodeIdx < sankeyData.nodes.length
          ? sankeyData.nodes[targetNodeIdx].name
          : "Unknown";

      // console.warn(`S16 DEBUG: Link "${link.id}" (${sourceName} → ${targetName}) Value: ${link.value}`);
    }
  }

  function calculateAll() {
    // Sankey now only refreshes manually via refresh button
    // No automatic re-rendering on calculations for better performance
    // console.log("[sect16] calculateAll called. Sankey will only refresh manually via button.");
  }

  // --- Public API ---
  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,
    calculateAll: calculateAll,
    activateAndRender: function () {
      if (!document.getElementById("s16ControlsContainer")) {
        if (!setupSection16DOM()) return;
        if (!window.TEUI.sect16.handlersInitialized) {
          initializeEventHandlers();
        }
      }
      window.TEUI.sect16.isActive = true;
      const activateBtn = document.getElementById("s16ActivateBtn");
      const modeToggleBtn = document.getElementById("s16ModeToggleBtn");
      const emissionsBtn = document.getElementById("s16ToggleEmissionsBtn");
      const spacingBtn = document.getElementById("s16ToggleSpacingBtn");
      const widthToggleContainer = document.getElementById(
        "s16WidthToggleContainer",
      );
      const loadingPlaceholder = document.getElementById(
        "s16LoadingPlaceholder",
      );
      if (loadingPlaceholder) loadingPlaceholder.style.display = "none";
      if (modeToggleBtn) modeToggleBtn.style.display = "inline-flex";
      if (emissionsBtn) emissionsBtn.style.display = "inline-flex";
      if (spacingBtn) spacingBtn.style.display = "inline-flex";
      if (widthToggleContainer)
        widthToggleContainer.style.display = "inline-flex";
      fetchDataAndRenderSankey(false);
    },
    activateSankey: activateSankey,
  };
})();

// Remove the custom teui-section-rendered listener for Section 16
// document.addEventListener('teui-section-rendered', function(event) { ... });

// The teui-rendering-complete listener is also likely not needed for S16 specific logic.
// document.addEventListener('teui-rendering-complete', function() { ... });
