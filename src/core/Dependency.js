// 4011-Dependency.js
// Dependency graph visualization using D3.js for TEUI Calculator v4.011
// Based on structure from 4007-dependency-graph.js
//
// This module provides interactive visualization of field dependencies and architectural
// relationships to help AI agents understand the application's execution flow and data dependencies.
//
// TODO - LOW PRIORITY UI/UX IMPROVEMENTS:
// - Fix architectural module borders (green=Foundation, blue=Coordination, red=Application)
// - Implement reset view button functionality (currently disabled)
// - Add focusOnNode implementation for better navigation
// - Optimize color mappings and legend organization
// - Performance improvements for large dependency graphs
// - Enhanced tooltip formatting and architectural module descriptions
// - Improve mobile responsiveness and touch interactions
//
// NOTE: Core functionality (field dependencies + architectural framework) is working.
// These improvements are aesthetic/UX enhancements, not mission-critical features.
//
// === AI AGENT USAGE EXAMPLES ===
// For programmatic access to dual-state dependencies (without UI visualization):
//
// // Get Target state dependencies (current visualization)
// const targetGraph = window.TEUI.StateManager.exportDependencyGraph("target");
//
// // Get Reference state dependencies (compliance calculations)
// const refGraph = window.TEUI.StateManager.exportDependencyGraph("reference");
//
// // Get complete dual-state analysis
// const analysis = window.TEUI.StateManager.getDualStateDependencyAnalysis();
// console.log(`Coverage: ${analysis.analysis.coverageRatio}, Total deps: ${analysis.analysis.totalDependencies}`);
//
// // Query specific dependency paths
// const climateToEnergy = refGraph.links.filter(l => l.source.includes("d_20"));

// Ensure TEUI namespace exists
window.TEUI = window.TEUI || {};

// DependencyGraph class for rendering dependency visualizations
window.TEUI.DependencyGraph = class DependencyGraph {
  constructor(
    containerSelector = "#dependencyDiagram .section-content .dependency-graph-container",
  ) {
    // Target specific container
    this.containerSelector = containerSelector;
    this.data = null;
    this.svg = null;
    this.simulation = null;
    this.width = 0;
    this.height = 0;

    // Visualization settings (Enhanced for architectural + field dependencies)
    this.settings = {
      nodeRadius: 15, // Base node size
      moduleNodeRadius: 25, // Larger size for architectural modules
      linkDistance: 150, // Increased link distance to give nodes more space
      chargeStrength: -600, // Stronger repulsion to prevent node overlap
      colorScheme: {
        // === ARCHITECTURAL MODULE GROUPS (AI Agent Framework) ===
        "🏗️ Foundation": "#2E8B57", // Sea Green - Core foundation modules
        "🧮 Coordination": "#4169E1", // Royal Blue - Coordination layer
        "🎯 Application": "#DC143C", // Crimson - Application layer sections

        // === ACTUAL SECTION GROUPS (from codebase analysis) ===
        keyValues: "#b07aa1", // Purple - Section 01 Key Values
        buildingInfo: "#4e79a7", // Blue - Section 02 Building Information
        climateCalculations: "#f28e2c", // Orange - Section 03 Climate
        actualTargetEnergy: "#e15759", // Red - Section 04 Energy Input/Target
        co2eEmissions: "#59a14f", // Green - Section 05 CO2e Emissions
        renewableEnergy: "#59a14f", // Green - Section 06 Renewable Energy
        waterUse: "#1170aa", // Dark Blue - Section 07 Water Use
        indoorAirQuality: "#66c2a5", // Teal - Section 08 Indoor Air Quality
        occupantInternalGains: "#ff9d9a", // Light Orange - Section 09 Occupant + Internal Gains
        radiantGains: "#fdae6b", // Light Orange - Section 10 Radiant Gains
        transmissionLosses: "#76b7b2", // Teal/Green - Section 11 Transmission Losses
        volumeSurfaceMetrics: "#9c755f", // Brown - Section 12 Volume and Surface Metrics
        mechanicalLoads: "#af7aa1", // Purple - Section 13 Mechanical Loads
        tediSummary: "#bab0ab", // Grey - Section 14 TEDI & TELI
        teuiSummary: "#b3b3cc", // Light Gray/Blue - Section 15 TEUI Summary
        Other: "#8da0cb", // Light Blue/Grey Fallback
      },
      labelFontSize: 12, // Increased font size for better readability
      tooltipDelay: 500,
      defaultLayout: "dagre", // Set hierarchical layout as default
    };

    // TODO: Consider moving colorScheme to a shared config?
  }

  /**
   * Initialize the graph from state manager data
   */
  initialize() {
    const stateManager = window.TEUI?.StateManager;
    const fieldManager = window.TEUI?.FieldManager;

    if (!stateManager || !fieldManager) {
      console.error(
        "[DependencyGraph] StateManager or FieldManager is required.",
      );
      this.showErrorMessage("Initialization failed: Core modules not found.");
      return false; // Indicate failure
    }

    // Get dependency data FIRST
    try {
      if (typeof stateManager.exportDependencyGraph !== "function") {
        throw new Error(
          "StateManager does not have exportDependencyGraph method.",
        );
      }
      this.data = stateManager.exportDependencyGraph();
      if (!this.data || !this.data.nodes || !this.data.links) {
        throw new Error("Invalid data format from exportDependencyGraph.");
      }
      console.log(
        "[DependencyGraph] Data loaded:",
        this.data.nodes.length,
        "nodes,",
        this.data.links.length,
        "links",
      );

      // Add group/type info to nodes
      this.enhanceNodeData(fieldManager);
    } catch (error) {
      console.error(
        "[DependencyGraph] Failed to get or process dependency data:",
        error,
      );
      this.showErrorMessage(`Data loading failed: ${error.message}`);
      return false; // Indicate failure
    }

    // Data is loaded, now safe to setup UI that might depend on it
    return true; // Indicate success
  }

  /** Helper to add group/type info */
  enhanceNodeData(fieldManager) {
    this.data.nodes.forEach((node) => {
      const fieldDef = fieldManager.getField(node.id);
      node.type = fieldDef?.type || "unknown";
      // Basic grouping (can be refined)
      if (!node.group) {
        node.group = this.getNodeGroup(node.id, fieldDef); // Use internal helper
      }
    });
  }

  /** Helper to determine node group */
  getNodeGroup(nodeId, fieldDef) {
    // Prioritize section info if available - now returns camelCase to match colorScheme
    if (fieldDef?.section) {
      // Return the section as-is since it's already in camelCase
      return fieldDef.section;
    }

    // Fallback to prefix-based section identification (camelCase)
    if (
      nodeId.startsWith("d_11") ||
      nodeId.startsWith("h_11") ||
      nodeId.startsWith("i_11")
    )
      return "transmissionLosses";
    if (nodeId.startsWith("d_13") || nodeId.startsWith("h_13"))
      return "mechanicalLoads";
    if (nodeId.startsWith("g_6")) return "mechanicalLoads"; // Equipment loads
    if (nodeId.startsWith("h_6")) return "mechanicalLoads"; // Equipment-related

    return "Other";
  }

  // Add this method to enhance node labels based on their values
  enhanceNodeLabel(node) {
    const stateManager = window.TEUI?.StateManager;
    if (!stateManager) return node.id;

    // Get the current value from StateManager
    const value = stateManager.getValue(node.id);

    // Create a more descriptive label
    let label = node.label || node.id;

    // Handle special cases for specific nodes or patterns
    if (node.id.startsWith("g_67") || node.id.startsWith("h_67")) {
      // Equipment nodes
      if (value !== null && value !== undefined && value !== "") {
        // Format using the standard global method
        const formattedValue = this.formatNodeValue(node.id, value);
        return `${label} (${formattedValue})`;
      }
      return label;
    }

    if (value !== null && value !== undefined && value !== "") {
      // For short values, append to the label
      if (value.toString().length < 20) {
        // Format using the standard global method
        const formattedValue = this.formatNodeValue(node.id, value);
        return `${label}: ${formattedValue}`;
      }
      // For longer values, just use the label
    }

    return label;
  }

  /**
   * Format a node value using the standard StateManager formatNumber method
   * @param {string} nodeId - The node ID
   * @param {any} value - The value to format
   * @returns {string} The formatted value
   */
  formatNodeValue(nodeId, value) {
    // Determine format type based on node ID patterns
    let formatType = "number-2dp";

    // Determine format based on nodeId conventions similar to how other sections do it
    if (nodeId.startsWith("g_") && !nodeId.startsWith("g_6")) {
      formatType = "number-3dp"; // U-Values typically have 3 decimal places
    } else if (nodeId.startsWith("f_") && !nodeId.startsWith("f_32")) {
      formatType = "number-2dp"; // RSI values typically have 2 decimal places
    } else if (nodeId.startsWith("d_1") && nodeId.endsWith("7")) {
      formatType = "percent-2dp"; // Things like WWR are percentages
    } else if (
      nodeId.startsWith("h_") &&
      parseFloat(value) <= 1 &&
      parseFloat(value) > 0
    ) {
      formatType = "percent-1dp"; // Small values in h_ are often percentages
    } else if (nodeId.includes("_14") || nodeId.includes("_15")) {
      // TEDI/TELI/TEUI sections typically have specific formats
      if (nodeId.endsWith("_144") || nodeId.endsWith("_145")) {
        formatType = "percent-0dp"; // Reduction percentages
      } else if (nodeId.endsWith("_141") || nodeId.endsWith("_142")) {
        formatType = "currency-2dp"; // Cost metrics
      }
    } else if (
      [
        "d_101",
        "d_102",
        "d_106",
        "i_101",
        "i_102",
        "i_103",
        "i_104",
        "k_101",
        "k_102",
        "k_103",
        "k_104",
      ].includes(nodeId)
    ) {
      formatType = "number-2dp-comma"; // Areas and kWh values with commas
    }

    // Use the global formatNumber function if available
    if (typeof window.TEUI?.formatNumber === "function") {
      return window.TEUI.formatNumber(value, formatType);
    }

    // Fallback to basic formatting if the global function isn't available
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;

    if (formatType.includes("percent")) {
      // Handle percentage formatting
      const decimals = formatType.includes("0dp")
        ? 0
        : formatType.includes("1dp")
          ? 1
          : 2;
      return (
        (numValue * 100).toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) + "%"
      );
    } else if (formatType.includes("currency")) {
      // Handle currency formatting
      const decimals = formatType.includes("0dp")
        ? 0
        : formatType.includes("3dp")
          ? 3
          : 2;
      return (
        "$" +
        numValue.toLocaleString(undefined, {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        })
      );
    } else {
      // Handle regular number formatting
      const decimals = formatType.includes("3dp") ? 3 : 2;
      const useCommas = formatType.includes("comma");
      return numValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: useCommas,
      });
    }
  }

  /**
   * Setup the SVG container
   */
  setupSvg() {
    const container = document.querySelector(this.containerSelector);
    if (!container) {
      console.error(
        `[DependencyGraph] Container not found: ${this.containerSelector}`,
      );
      return;
    }

    // Clear any existing content (e.g., previous error message)
    container.innerHTML = "";

    // Create main container for the graph itself (ensure it's added)
    const graphContainer = document.createElement("div");
    graphContainer.className = "dependency-graph-svg-wrapper"; // More specific class
    graphContainer.style.width = "100%";
    graphContainer.style.height = "650px"; // Increased height for better visibility
    graphContainer.style.border = "1px solid #ccc";
    graphContainer.style.position = "relative"; // Needed for absolute positioning of legend/tooltip
    container.appendChild(graphContainer);

    // Check dimensions AFTER adding to DOM
    this.width = graphContainer.clientWidth;
    this.height = graphContainer.clientHeight;

    if (this.width === 0 || this.height === 0) {
      console.warn(
        "[DependencyGraph] Container has zero dimensions. Graph might not be visible.",
      );
      // Provide a fallback size if needed, though ideally CSS should handle this.
      this.width = container.clientWidth || 800;
      this.height = 650;
    }

    // Create SVG
    this.svg = d3
      .select(graphContainer)
      .append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`) // Use calculated dimensions
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("cursor", "pointer"); // Set pointer cursor to indicate it's clickable

    // Add a click overlay for zoom activation message
    const activationOverlay = this.svg
      .append("g")
      .attr("class", "zoom-activation-overlay")
      .style("pointer-events", "all");

    activationOverlay
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height)
      .attr("fill", "rgba(0,0,0,0.03)") // Very subtle background
      .attr("rx", 8) // Rounded corners
      .attr("ry", 8); // Rounded corners

    activationOverlay
      .append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "-1em")
      .attr("fill", "#666")
      .style("font-size", "16px")
      .style("font-weight", "500")
      .text("Click to enable zoom & pan");

    activationOverlay
      .append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2)
      .attr("text-anchor", "middle")
      .attr("dy", "1em")
      .attr("fill", "#999")
      .style("font-size", "14px")
      .text("(Page scrolling will be paused within graph area)");

    // Create a group for the graph content (nodes and links)
    this.svg.append("g").attr("class", "graph-content");

    // Add arrow marker definition for the links
    this.svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 35) // Increased to place arrows further from nodes
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8) // Larger arrowhead
      .attr("markerHeight", 8)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#666") // Darker gray for better visibility
      .style("stroke", "none");

    // Create zoom behavior but don't apply it yet
    const zoom = d3
      .zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        this.svg
          .select("g.graph-content") // Target the correct group
          .attr("transform", event.transform);
      });

    // Zoom activation logic - only enable after click
    activationOverlay.on("click", () => {
      // Remove the overlay
      activationOverlay.transition().duration(300).style("opacity", 0).remove();

      // Apply zoom behavior to SVG
      this.svg
        .call(zoom)
        .style("cursor", "grab") // Change cursor to indicate grab/pan is available
        .on("mousedown.cursor", function () {
          d3.select(this).style("cursor", "grabbing"); // Active grabbing cursor
        })
        .on("mouseup.cursor", function () {
          d3.select(this).style("cursor", "grab"); // Back to grab cursor
        });

      // Add a small message showing zoom is active
      const zoomIndicator = this.svg
        .append("text")
        .attr("class", "zoom-indicator")
        .attr("x", 10)
        .attr("y", 20)
        .attr("fill", "#666")
        .style("font-size", "12px")
        .style("opacity", 0)
        .text("Zoom & pan activated");

      zoomIndicator
        .transition()
        .duration(500)
        .style("opacity", 1)
        .transition()
        .delay(2000)
        .duration(1000)
        .style("opacity", 0)
        .remove();

      console.log("[DependencyGraph] Zoom behavior activated");
    });

    // Listen for fullscreen changes to reapply zoom behavior
    document.addEventListener("fullscreenchange", () => {
      if (
        document.fullscreenElement &&
        document.fullscreenElement.classList.contains(
          "dependency-graph-svg-wrapper",
        )
      ) {
        // Re-enable zoom in fullscreen mode without overlay
        this.svg.on(".zoom", null); // Remove existing zoom first
        this.svg.call(zoom).style("cursor", "grab");
      }
    });
  }

  // --- Methods copied from 4007 (render, createFilterControls, etc.) ---
  // --- Need review and potential adaptation for TEUI 4.011 ---

  /**
   * Create filter controls (Adapted from 4007)
   * @param {Element} container - The parent container element (outside the SVG wrapper)
   */
  createFilterControls(parentElement) {
    // DUPLICATE FIX: Clear any existing controls first to prevent double headers
    const existingControls = parentElement.querySelector(
      ".dependency-graph-controls",
    );
    if (existingControls) {
      existingControls.remove();
    }

    const controlsContainer = document.createElement("div");
    controlsContainer.className = "dependency-graph-controls";
    controlsContainer.style.display = "flex";
    controlsContainer.style.flexWrap = "wrap";
    controlsContainer.style.gap = "10px";
    controlsContainer.style.marginBottom = "10px";
    controlsContainer.style.padding = "10px";
    controlsContainer.style.borderBottom = "1px solid #eee";

    // Create a search box
    const searchContainer = document.createElement("div");
    searchContainer.style.flex = "1";
    searchContainer.style.minWidth = "200px";

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search fields (e.g., d_119)";
    searchInput.className = "form-control form-control-sm"; // Use Bootstrap classes
    searchInput.style.width = "100%";
    this.searchInput = searchInput; // Store reference

    searchContainer.appendChild(searchInput);
    controlsContainer.appendChild(searchContainer);

    // Create group filter
    const groupFilterContainer = document.createElement("div");
    groupFilterContainer.style.flex = "1";
    groupFilterContainer.style.minWidth = "200px";

    const groupSelect = document.createElement("select");
    groupSelect.className = "form-select form-select-sm"; // Use Bootstrap classes
    groupSelect.style.width = "100%";
    this.groupSelect = groupSelect; // Store reference

    // Add "All Groups" option
    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.text = "All Groups";
    groupSelect.appendChild(allOption);

    // Group options will be populated AFTER data is loaded

    groupFilterContainer.appendChild(groupSelect);
    controlsContainer.appendChild(groupFilterContainer);

    // Add layout controls
    const layoutContainer = document.createElement("div");
    layoutContainer.style.display = "flex";
    layoutContainer.style.gap = "5px";
    layoutContainer.style.alignItems = "center";

    // Force directed button
    const forceButton = document.createElement("button");
    forceButton.textContent = "Force Layout";
    forceButton.className = "btn btn-outline-secondary btn-sm layout-button"; // Start with force not active
    forceButton.onclick = () => this.switchLayout("force");
    this.forceButton = forceButton; // Store ref

    // Dagre (hierarchical) button - active by default
    const dagreButton = document.createElement("button");
    dagreButton.textContent = "Hierarchical";
    dagreButton.className =
      "btn btn-outline-secondary btn-sm layout-button active"; // Activate by default
    dagreButton.onclick = () => this.switchLayout("dagre");
    this.dagreButton = dagreButton; // Store ref

    // TODO: Reset button - RAINY DAY PROJECT
    // Reset should: rebuild the entire graph AND fit it to view
    // Button visible but functionality disabled to maintain layout
    const resetButton = document.createElement("button");
    resetButton.textContent = "Reset View";
    resetButton.className = "btn btn-outline-secondary btn-sm";
    // resetButton.onclick = () => this.resetView(); // DISABLED - broken functionality
    this.resetButton = resetButton;

    // Fullscreen button
    const fullscreenButton = document.createElement("button");
    fullscreenButton.innerHTML = '<i class="bi bi-arrows-fullscreen"></i>'; // Bootstrap icon
    fullscreenButton.title = "Toggle Fullscreen";
    fullscreenButton.className = "btn btn-outline-secondary btn-sm";
    fullscreenButton.style.marginLeft = "auto"; // Push to the right
    this.fullscreenButton = fullscreenButton; // Store ref

    // Toggle legend button
    const legendToggleButton = document.createElement("button");
    legendToggleButton.textContent = "Show Legend";
    legendToggleButton.title = "Show/Hide Legend";
    legendToggleButton.className = "btn btn-outline-secondary btn-sm";
    legendToggleButton.onclick = () => this.toggleLegend();
    this.legendToggleButton = legendToggleButton; // Store ref

    layoutContainer.appendChild(forceButton);
    layoutContainer.appendChild(dagreButton);
    layoutContainer.appendChild(resetButton); // Button visible but non-functional
    layoutContainer.appendChild(legendToggleButton);
    layoutContainer.appendChild(fullscreenButton);
    controlsContainer.appendChild(layoutContainer);

    // Prepend controls to the parent element
    parentElement.prepend(controlsContainer);
  }

  /**
   * Create info panel for node details (Adapted from 4007)
   * @param {Element} container - The parent container element
   */
  createInfoPanel(parentElement) {
    // DUPLICATE FIX: Clear any existing info panel first to prevent duplicates
    const existingPanel = parentElement.querySelector(".dependency-info-panel");
    if (existingPanel) {
      existingPanel.remove();
    }

    const infoPanel = document.createElement("div");
    infoPanel.className = "dependency-info-panel alert alert-secondary"; // Use Bootstrap alert
    infoPanel.style.marginBottom = "10px";
    infoPanel.style.display = "none";
    infoPanel.setAttribute("role", "alert");

    const title = document.createElement("h6"); // Use h6 for less emphasis
    title.className = "info-title alert-heading";
    title.style.marginBottom = "0.5rem";
    title.textContent = "Field Information";

    const value = document.createElement("p");
    value.className = "info-value mb-1";

    const dependencies = document.createElement("p");
    dependencies.className = "info-dependencies mb-1";

    const dependents = document.createElement("p");
    dependents.className = "info-dependents mb-0"; // No margin bottom on last item

    infoPanel.appendChild(title);
    infoPanel.appendChild(value);
    infoPanel.appendChild(dependencies);
    infoPanel.appendChild(dependents);

    // Prepend info panel
    parentElement.prepend(infoPanel);
    this.infoPanel = infoPanel; // Store reference
  }

  /**
   * Setup event listeners for controls and graph elements (Adapted from 4007)
   */
  setupEvents() {
    // Filter events
    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.filterGraph(
          this.searchInput.value,
          this.groupSelect?.value || "all",
        );
      });
    }
    if (this.groupSelect) {
      this.groupSelect.addEventListener("change", () => {
        this.filterGraph(this.searchInput?.value || "", this.groupSelect.value);
      });
    }

    // Reset button event - disabled functionality but button remains visible
    if (this.resetButton) {
      // this.resetButton.onclick = () => this.resetView(); // DISABLED - broken functionality
    }

    // Fullscreen button event
    if (this.fullscreenButton) {
      this.fullscreenButton.onclick = () => this.toggleFullscreen();
    }

    // Node hover/click events (add after nodes are created in render)
    if (this.nodeGroups) {
      this.nodeGroups
        .on("mouseover", (event, _d) => {
          d3.select(event.currentTarget).select("text").style("display", null);
          // Optional: Add tooltip display logic here if needed
        })
        .on("mouseout", (event, d) => {
          // Hide label only if not the currently selected node
          if (!this.selectedNode || this.selectedNode.id !== d.id) {
            d3.select(event.currentTarget)
              .select("text")
              .style("display", "none");
          }
          // Optional: Hide tooltip here
        })
        .on("click", (event, d) => {
          this.selectedNode = d; // Track selected node
          this.showNodeInfo(d);
          event.stopPropagation(); // Prevent background click
        });
    }

    // Click on SVG background to clear selection
    if (this.svg) {
      this.svg.on("click", () => {
        this.selectedNode = null; // Clear selection
        this.hideNodeInfo();
        this.resetHighlighting();
      });
    }
  }

  /**
   * Render the graph (Adapted from 4007)
   */
  render() {
    if (!this.data || !this.svg) return;

    // Check if container exists
    const graphContent = this.svg.select("g.graph-content");
    if (graphContent.empty()) {
      console.error("[DependencyGraph] Graph content group not found.");
      return;
    }

    const { nodes, links } = this.data;

    // Pre-process nodes to enhance labels and handle duplicates
    nodes.forEach((node) => {
      node.enhancedLabel = this.enhanceNodeLabel(node);
    });

    // Calculate node sizes only if not already assigned
    // This ensures sizes don't get recalculated when rerendering
    if (
      !nodes.some((node) => Object.prototype.hasOwnProperty.call(node, "size"))
    ) {
      console.log("[DependencyGraph] Calculating node sizes...");
      // Calculate in-degree (dependencies) and out-degree (dependents) for each node
      const counts = {};
      nodes.forEach((node) => {
        counts[node.id] = { dependencies: 0, dependents: 0, total: 0 };
      });

      links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;

        if (counts[sourceId]) counts[sourceId].dependents += 1;
        if (counts[targetId]) counts[targetId].dependencies += 1;
      });

      // Calculate total connections and assign node sizes
      nodes.forEach((node) => {
        // Architectural modules get special sizing and styling
        if (node.type === "module") {
          node.size = this.settings.moduleNodeRadius;
          node.isArchitectural = true;
          node.isInfluential = true; // All architectural modules are influential
        } else if (counts[node.id]) {
          counts[node.id].total =
            counts[node.id].dependencies + counts[node.id].dependents;
          // Set a node size based on connections: base size + scaled by connections
          node.size =
            this.settings.nodeRadius *
            (1 + 0.4 * Math.sqrt(counts[node.id].total));

          // Identify high-influence field nodes
          node.isInfluential = false;
          const influentialNodes = ["d_113", "d_51", "d_118", "d_53", "g_67"];
          if (influentialNodes.includes(node.id)) {
            node.isInfluential = true;
            // Make influential nodes even bigger
            node.size = Math.max(node.size, this.settings.nodeRadius * 2.5);
          }
        } else {
          node.size = this.settings.nodeRadius;
        }
      });
    }

    // Create a force simulation
    this.simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(this.settings.linkDistance),
      )
      .force(
        "charge",
        d3.forceManyBody().strength(this.settings.chargeStrength),
      )
      .force("center", d3.forceCenter(this.width / 2, this.height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d) => d.size * 2.5),
      ) // Use dynamic collision radius
      .on("tick", () => this.ticked());

    // --- Links --- Use curved paths instead of straight lines
    this.links = graphContent
      .selectAll("path.link")
      .data(
        links,
        (d) => `${d.source.id || d.source}-${d.target.id || d.target}`,
      ) // Key function for object constancy
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "link")
            .style("stroke", "#999")
            .style("stroke-opacity", 0.6)
            .style("stroke-width", 1.5)
            .style("fill", "none")
            .attr("marker-end", "url(#arrowhead)"),
        (update) => update, // No update needed for static properties
        (exit) => exit.remove(),
      );

    // --- Nodes ---
    this.nodeGroups = graphContent
      .selectAll("g.node")
      .data(nodes, (d) => d.id) // Key function for object constancy
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "node");

          // Add a white background circle for node labels
          g.append("circle")
            .attr("class", "node-background")
            .attr("r", (d) => d.size + 10) // Slightly larger than the node
            .style("fill", "white")
            .style("opacity", 0) // Hidden by default
            .style("pointer-events", "none"); // Don't interfere with clicks

          // Add main circle for node
          g.append("circle")
            .attr("r", (d) => d.size) // Use dynamic size
            .style("stroke", "#fff")
            .style("stroke-width", 2) // Thicker stroke for better definition
            .style("cursor", "pointer");

          g.append("text")
            .attr("dx", (d) => d.size + 5) // Dynamic offset based on node size
            .attr("dy", ".35em")
            .style("font-size", `${this.settings.labelFontSize}px`)
            .style("fill", "#000") // Black text for better contrast
            .style("font-weight", "500") // Semi-bold text
            .style("pointer-events", "none") // Labels don't block clicks on circle
            .style("display", "none"); // Hide labels initially

          // Add styled tooltip element
          g.append("title")
            .style("font-weight", "bold")
            .style("font-size", "14px"); // Larger tooltip text

          g.call(
            d3
              .drag()
              .on("start", (event, d) => this.dragstarted(event, d))
              .on("drag", (event, d) => this.dragged(event, d))
              .on("end", (event, d) => this.dragended(event, d)),
          );

          return g;
        },
        (update) => update, // Most updates handled by ticked()
        (exit) => exit.remove(),
      );

    // --- Update Node Appearance (for enter and update selections) ---
    this.nodeGroups
      .select("circle:not(.node-background)")
      .attr("r", (d) => d.size) // Update radius for existing nodes
      .style("fill", (d) => {
        // Architectural modules use their group color with special styling
        if (d.isArchitectural) {
          const color =
            this.settings.colorScheme[d.group] ||
            this.settings.colorScheme.Other;
          return color;
        }
        // High-influence field nodes get bright red
        if (d.isInfluential) {
          return "#ff5252"; // Bright red for influential field nodes
        }
        const color =
          this.settings.colorScheme[d.group] || this.settings.colorScheme.Other;
        return color;
      })
      .style("stroke", (d) => {
        if (d.isArchitectural) {
          // Use colored borders to indicate architectural layer
          return d.architecturalLayer === "Foundation"
            ? "#2E7D32" // Dark green border for Foundation
            : d.architecturalLayer === "Coordination"
              ? "#1565C0" // Dark blue border for Coordination
              : "#C62828"; // Dark red border for Application
        }
        return "#fff"; // White border for regular nodes
      })
      .style("stroke-width", (d) => (d.isArchitectural ? 4 : 2)) // Thicker border for modules
      .style("filter", (d) => {
        if (d.isArchitectural) {
          return "drop-shadow(0px 0px 16px rgba(0,0,0,0.8))"; // Strong shadow for architectural modules
        } else if (d.isInfluential) {
          return "drop-shadow(0px 0px 12px rgba(255,82,82,0.9))"; // Enhanced glow for influential field nodes
        } else {
          return "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))"; // Regular shadow for other nodes
        }
      });

    // Update the background circle size to match node size
    this.nodeGroups.select(".node-background").attr("r", (d) => d.size + 10);

    this.nodeGroups
      .select("text")
      .attr("dx", (d) => d.size + 5) // Update text position
      .text((d) => d.enhancedLabel || d.label || d.id) // Use enhanced label
      .style(
        "text-shadow",
        "0 0 3px white, 0 0 3px white, 0 0 3px white, 0 0 3px white",
      ); // Add text shadow for better readability

    this.nodeGroups.select("title").text((d) => {
      let tooltip = `${d.enhancedLabel || d.label || d.id}`;
      tooltip += `\nID: ${d.id}`;
      tooltip += `\nGroup: ${d.group}`;
      tooltip += `\nType: ${d.type}`;

      // Enhanced tooltip for architectural modules
      if (d.isArchitectural) {
        tooltip += `\n━━━ ARCHITECTURAL MODULE ━━━`;
        if (d.description) {
          tooltip += `\nFunction: ${d.description}`;
        }
        tooltip += `\n★ AI AGENT FRAMEWORK NODE ★`;
        tooltip += `\nPurpose: Shows execution flow & dependencies`;
      } else {
        // Add the value to tooltip for field nodes
        const stateManager = window.TEUI?.StateManager;
        if (stateManager) {
          const value = stateManager.getValue(d.id);
          if (value !== null && value !== undefined && value !== "") {
            // Format the value using our formatting helper
            const formattedValue = this.formatNodeValue(d.id, value);
            tooltip += `\nValue: ${formattedValue}`;
          }
        }

        if (d.isInfluential) tooltip += "\n★ HIGH INFLUENCE FIELD ★";
      }

      return tooltip;
    });
  }

  // --- Other methods copied from 4007 (ticked, drag handlers, filtering, layout, info panel, highlighting) ---
  // --- Review for adaptation needed ---

  ticked() {
    if (!this.links || !this.nodeGroups) return;

    // Update links as curved paths
    this.links.attr("d", (d) => {
      const sourceX = d.source.x;
      const sourceY = d.source.y;
      const targetX = d.target.x;
      const targetY = d.target.y;

      // Get node radius for arrow positioning
      const nodeRadius = d.target.size || this.settings.nodeRadius;

      // Calculate direction vector
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const len = Math.sqrt(dx * dx + dy * dy);

      // If nodes are very close, draw a straight line
      if (len < nodeRadius * 4) {
        // Calculate endpoint to account for node radius and arrow
        const endX = len === 0 ? targetX : targetX - (dx * nodeRadius) / len;
        const endY = len === 0 ? targetY : targetY - (dy * nodeRadius) / len;
        return `M${sourceX},${sourceY}L${endX},${endY}`;
      }

      // For distant nodes, create a curved path
      // Calculate control point for quadratic curve
      // Offset depends on the vector between points
      const offset = Math.min(40, len / 4);
      const midX = (sourceX + targetX) / 2;
      const midY = (sourceY + targetY) / 2;

      // Calculate perpendicular offset for control point
      // This creates a curve perpendicular to the direct line
      const perpX = (-dy / len) * offset;
      const perpY = (dx / len) * offset;

      // Control point
      const cpX = midX + perpX;
      const cpY = midY + perpY;

      // Calculate endpoint to account for node radius and arrow
      const endX = len === 0 ? targetX : targetX - (dx * nodeRadius) / len;
      const endY = len === 0 ? targetY : targetY - (dy * nodeRadius) / len;

      // Create a quadratic Bezier curve path
      return `M${sourceX},${sourceY}Q${cpX},${cpY},${endX},${endY}`;
    });

    this.nodeGroups.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
  }

  dragstarted(event, d) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragended(event, _d) {
    if (!event.active) this.simulation.alphaTarget(0);
    // Keep node fixed after dragging? Optional.
    // d.fx = null;
    // d.fy = null;
  }

  filterGraph(searchText, group) {
    if (!this.nodeGroups || !this.links) return;

    const searchLower = searchText.toLowerCase();

    this.nodeGroups.style("opacity", (d) => {
      const matchesSearch =
        searchLower === "" || d.id.toLowerCase().includes(searchLower);
      const matchesGroup = group === "all" || d.group === group;
      return matchesSearch && matchesGroup ? 1 : 0.1;
    });

    this.links.style("opacity", (d) => {
      const sourceVisible = this.isNodeVisible(d.source, searchLower, group);
      const targetVisible = this.isNodeVisible(d.target, searchLower, group);
      return sourceVisible && targetVisible ? 0.6 : 0.05;
    });

    // Hide info panel if current selection is filtered out
    if (
      this.selectedNode &&
      !this.isNodeVisible(this.selectedNode, searchLower, group)
    ) {
      this.hideNodeInfo();
    }
  }

  isNodeVisible(node, searchLower, group) {
    // Need to handle cases where source/target might just be IDs during filtering
    const nodeId = typeof node === "object" ? node.id : node;
    const nodeObj = this.getNodeById(nodeId);
    if (!nodeObj) return false;

    const matchesSearch =
      searchLower === "" || nodeObj.id.toLowerCase().includes(searchLower);
    const matchesGroup = group === "all" || nodeObj.group === group;
    return matchesSearch && matchesGroup;
  }

  // TODO: Implement switchLayout and applyDagreLayout if hierarchical view is desired.
  switchLayout(layout) {
    // Update button states
    document
      .querySelectorAll(".layout-button")
      .forEach((button) => button.classList.remove("active"));
    if (layout === "force" && this.forceButton)
      this.forceButton.classList.add("active");
    if (layout === "dagre" && this.dagreButton)
      this.dagreButton.classList.add("active");

    if (layout === "force") {
      // Restore forces and restart simulation
      if (!this.simulation) return; // Should not happen if rendered
      this.simulation
        .force(
          "link",
          d3
            .forceLink(this.data.links)
            .id((d) => d.id)
            .distance(this.settings.linkDistance),
        )
        .force(
          "charge",
          d3.forceManyBody().strength(this.settings.chargeStrength),
        )
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
        .force(
          "collision",
          d3.forceCollide().radius(this.settings.nodeRadius * 2),
        )
        .alpha(1) // Reheat the simulation
        .restart();
      console.log("[DependencyGraph] Switched to Force layout.");
    } else if (layout === "dagre") {
      // Stop force simulation before applying Dagre
      if (this.simulation) this.simulation.stop();

      // Check if dagre library is loaded
      if (typeof dagre === "undefined") {
        console.error(
          "Dagre library not loaded. Cannot apply hierarchical layout.",
        );
        alert(
          "Hierarchical layout library (Dagre) is not loaded. Please ensure it is included.",
        );
        this.switchLayout("force"); // Revert to force layout
        return;
      }
      this.applyDagreLayout();
      console.log("[DependencyGraph] Switched to Dagre layout.");
    }
  }

  /** Apply dagre hierarchical layout */
  applyDagreLayout() {
    if (!this.data || !this.nodeGroups || !this.links) return;

    // Create a new directed graph
    const g = new dagre.graphlib.Graph();

    // Set an object for the graph label
    g.setGraph({});

    // Default to assigning a new object as a label for each edge.
    g.setDefaultEdgeLabel(function () {
      return {};
    });

    // Add nodes to the graph. The first argument is the node id.
    // We link the node object from our data to the graph node.
    this.data.nodes.forEach((node) => {
      // Use node-specific sizes for layout calculation
      const nodeSize = node.size || this.settings.nodeRadius;
      g.setNode(node.id, {
        label: node.id,
        width: nodeSize * 2,
        height: nodeSize * 2,
      });
    });

    // Add edges to the graph.
    this.data.links.forEach((link) => {
      // Ensure source and target are IDs
      const sourceId = link.source.id || link.source;
      const targetId = link.target.id || link.target;
      g.setEdge(sourceId, targetId);
    });

    // Run the layout algorithm
    dagre.layout(g);

    // Apply the calculated positions with a transition
    this.nodeGroups
      .transition()
      .duration(750)
      .attr("transform", (d) => {
        const nodeInfo = g.node(d.id);
        if (nodeInfo) {
          d.x = nodeInfo.x; // Update data positions
          d.y = nodeInfo.y;
          return `translate(${nodeInfo.x}, ${nodeInfo.y})`;
        }
        return `translate(${d.x || 0}, ${d.y || 0})`; // Fallback
      });

    // Update link positions after transition (or immediately)
    // Using a delay might look smoother if nodes transition
    setTimeout(() => {
      // Update links with the new node positions
      this.ticked(); // This will update our curved paths
    }, 750);
  }

  resetView() {
    if (!this.svg) return;
    // Also reset filters
    if (this.searchInput) this.searchInput.value = "";
    if (this.groupSelect) this.groupSelect.value = "all";
    this.filterGraph("", "all");

    // Reset zoom/pan
    this.svg
      .transition()
      .duration(750)
      .call(d3.zoom().transform, d3.zoomIdentity);
  }

  showNodeInfo(node) {
    if (!node) return;

    const stateManager = window.TEUI?.StateManager;
    if (!stateManager) return;

    this.highlightNode(node);
    this.selectedNode = node; // Store reference to selected node

    // Update regular info panel
    if (this.infoPanel) {
      const title = this.infoPanel.querySelector(".info-title");
      const value = this.infoPanel.querySelector(".info-value");
      const dependencies = this.infoPanel.querySelector(".info-dependencies");
      const dependents = this.infoPanel.querySelector(".info-dependents");

      if (title)
        title.textContent =
          node.enhancedLabel || `${node.label || node.id} (${node.id})`;

      const currentValue = stateManager.getValue(node.id);
      if (value) {
        // Format the value using our formatting helper
        const formattedValue =
          currentValue !== null && currentValue !== undefined
            ? this.formatNodeValue(node.id, currentValue)
            : "N/A";

        value.innerHTML = `<strong>Current Value:</strong> ${formattedValue}`;
        value.innerHTML += `<br><strong>ID:</strong> ${node.id}`;
      }

      // Use the already processed links data for connections
      const fieldDependencies = this.data.links
        .filter((link) => (link.target.id || link.target) === node.id)
        .map((link) => link.source.id || link.source);

      if (dependencies) {
        dependencies.innerHTML = `<strong>Depends on:</strong> ${fieldDependencies.length > 0 ? fieldDependencies.join(", ") : "None"}`;
        dependencies.style.fontWeight =
          fieldDependencies.length > 0 ? "400" : "normal";
      }

      const fieldDependents = this.data.links
        .filter((link) => (link.source.id || link.source) === node.id)
        .map((link) => link.target.id || link.target);

      if (dependents) {
        dependents.innerHTML = `<strong>Influences:</strong> ${fieldDependents.length > 0 ? fieldDependents.join(", ") : "None"}`;
        dependents.style.fontWeight =
          fieldDependents.length > 0 ? "400" : "normal";
      }

      this.infoPanel.style.display = "block";
    }

    // Also update floating info panel if in fullscreen mode
    // Check if we're in fullscreen mode
    if (document.fullscreenElement && this.floatingInfoPanel) {
      this.updateFullscreenInfoPanel(node);
    }
  }

  hideNodeInfo() {
    // Hide regular info panel
    if (this.infoPanel) {
      this.infoPanel.style.display = "none";
    }

    // Also hide floating info panel if in fullscreen mode
    if (this.floatingInfoPanel) {
      this.floatingInfoPanel.style.display = "none";
    }

    // Don't reset highlighting here, only on background click or new selection
  }

  resetHighlighting() {
    if (!this.nodeGroups || !this.links) return;
    this.nodeGroups
      .style("opacity", 1)
      .select("circle:not(.node-background)")
      .style("stroke", "#fff")
      .style("stroke-width", 2)
      .attr("r", (d) => d.size); // Use the node's stored size instead of this.settings.nodeRadius

    this.nodeGroups.select(".node-background").style("opacity", 0); // Hide backgrounds

    this.nodeGroups.select("text").style("display", "none"); // Hide all labels

    this.links
      .style("opacity", 0.6)
      .style("stroke", "#999")
      .style("stroke-width", 1.5);

    this.selectedNode = null; // Clear selected node reference
  }

  highlightNode(node) {
    if (!this.nodeGroups || !this.links || !node) return;

    this.resetHighlighting(); // Clear previous highlights

    this.nodeGroups.style("opacity", 0.2); // More faded for better contrast
    this.links.style("opacity", 0.1); // More faded for better contrast

    const connectedLinks = this.data.links.filter(
      (l) =>
        (l.source.id || l.source) === node.id ||
        (l.target.id || l.target) === node.id,
    );

    const connectedNodeIds = new Set([node.id]);
    connectedLinks.forEach((l) => {
      connectedNodeIds.add(l.source.id || l.source);
      connectedNodeIds.add(l.target.id || l.target);
    });

    // Highlight connected nodes
    this.nodeGroups
      .filter((d) => connectedNodeIds.has(d.id))
      .style("opacity", 1)
      .select("text")
      .style("display", null); // Show labels for highlighted

    // Highlight background for connected nodes
    this.nodeGroups
      .filter((d) => connectedNodeIds.has(d.id))
      .select(".node-background")
      .style("opacity", 0.7); // Show background for text readability

    // Bold stroke for the selected node but keep its original size
    this.nodeGroups
      .filter((d) => d.id === node.id)
      .select("circle:not(.node-background)")
      .style("stroke", "#333")
      .style("stroke-width", 3)
      .attr("r", (d) => d.size * 1.4); // Increase from 1.2 to 1.4 for more emphasis

    // Highlight connected links
    this.links
      .filter(
        (l) =>
          (l.source.id || l.source) === node.id ||
          (l.target.id || l.target) === node.id,
      )
      .style("opacity", 0.8)
      .style("stroke-width", 2)
      .style("stroke", (l) =>
        (l.source.id || l.source) === node.id ? "#cc0000" : "#0077cc",
      ); // Red outgoing, Blue incoming
  }

  getNodeById(id) {
    return this.data?.nodes.find((node) => node.id === id);
  }

  focusOnNode(nodeId) {
    // TODO: Implement focus logic if needed
    console.warn("focusOnNode not fully implemented");
    const node = this.getNodeById(nodeId);
    if (node) {
      this.showNodeInfo(node);
    }
  }

  showErrorMessage(message) {
    const container = document.querySelector(this.containerSelector);
    if (container) {
      container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
    }
  }

  /** Toggle fullscreen mode with controls and info panel */
  toggleFullscreen() {
    // Target the SVG wrapper directly for fullscreen
    const graphWrapper = document.querySelector(
      "#dependencyDiagram .dependency-graph-svg-wrapper",
    );
    if (!graphWrapper) return;

    const controlsContainer = document.querySelector(
      "#dependencyDiagram .dependency-graph-controls-wrapper",
    );
    const _infoPanel = document.querySelector(
      "#dependencyDiagram .dependency-graph-info-wrapper",
    );

    // Create or get our floating controls container for fullscreen mode
    let floatingControls = graphWrapper.querySelector(
      ".dependency-graph-floating-controls",
    );
    if (!floatingControls) {
      floatingControls = document.createElement("div");
      floatingControls.className = "dependency-graph-floating-controls";
      floatingControls.style.position = "absolute";
      floatingControls.style.top = "20px";
      floatingControls.style.right = "20px";
      floatingControls.style.background = "rgba(255, 255, 255, 0.95)";
      floatingControls.style.padding = "10px";
      floatingControls.style.borderRadius = "5px";
      floatingControls.style.boxShadow = "0 3px 6px rgba(0,0,0,0.2)";
      floatingControls.style.zIndex = "9999";
      floatingControls.style.display = "none"; // Hidden by default
      // Append to graphWrapper instead of document.body
      graphWrapper.appendChild(floatingControls);
    }

    // Create a visible floating info panel for fullscreen mode
    // IMPORTANT: Create and append to the graph wrapper, not document.body
    let floatingInfoPanel = graphWrapper.querySelector(
      ".dependency-graph-floating-info",
    );
    if (!floatingInfoPanel) {
      floatingInfoPanel = document.createElement("div");
      floatingInfoPanel.className = "dependency-graph-floating-info";
      floatingInfoPanel.style.position = "absolute";
      floatingInfoPanel.style.top = "20px";
      floatingInfoPanel.style.left = "20px";
      floatingInfoPanel.style.background = "rgba(255, 255, 255, 0.98)";
      floatingInfoPanel.style.padding = "15px";
      floatingInfoPanel.style.borderRadius = "8px";
      floatingInfoPanel.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
      floatingInfoPanel.style.zIndex = "10000"; // Ensure it's on top
      floatingInfoPanel.style.maxWidth = "350px";
      floatingInfoPanel.style.maxHeight = "300px";
      floatingInfoPanel.style.overflowY = "auto";
      floatingInfoPanel.style.display = "none"; // Start hidden initially

      // Create an always-visible info panel structure in fullscreen
      floatingInfoPanel.innerHTML = `
                <div class="dependency-info-panel">
                    <h6 class="info-title">Node Information</h6>
                    <p class="info-value">Click on a node to see details</p>
                    <p class="info-dependencies"></p>
                    <p class="info-dependents"></p>
                    <p class="info-note" style="font-style: italic; font-size: 90%; margin-top: 10px; color: #666;">
                        <strong>Note:</strong> Red nodes with glow effect have high influence on building performance.
                    </p>
                </div>
            `;
      // Important change: append to graphWrapper instead of document.body
      graphWrapper.appendChild(floatingInfoPanel);
    }

    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (graphWrapper.requestFullscreen) {
        graphWrapper.requestFullscreen();
      } else if (graphWrapper.mozRequestFullScreen) {
        /* Firefox */
        graphWrapper.mozRequestFullScreen();
      } else if (graphWrapper.webkitRequestFullscreen) {
        /* Chrome, Safari & Opera */
        graphWrapper.webkitRequestFullscreen();
      } else if (graphWrapper.msRequestFullscreen) {
        /* IE/Edge */
        graphWrapper.msRequestFullscreen();
      }

      // Change icon
      if (this.fullscreenButton)
        this.fullscreenButton.innerHTML =
          '<i class="bi bi-fullscreen-exit"></i>';

      // Show floating controls and info in fullscreen
      document.addEventListener(
        "fullscreenchange",
        () => {
          if (document.fullscreenElement) {
            // Clone the controls into the floating panel
            if (controlsContainer) {
              floatingControls.innerHTML = ""; // Clear previous content
              const controlsClone = controlsContainer.cloneNode(true);

              // Extract just the inner controls (not the wrapper)
              const innerControls = controlsClone.querySelector(
                ".dependency-graph-controls",
              );
              if (innerControls) {
                floatingControls.appendChild(innerControls);

                // Re-attach event handlers to cloned controls
                const searchInput =
                  floatingControls.querySelector('input[type="text"]');
                if (searchInput) {
                  searchInput.addEventListener("input", () => {
                    this.filterGraph(
                      searchInput.value,
                      floatingControls.querySelector("select")?.value || "all",
                    );
                  });
                }

                const groupSelect = floatingControls.querySelector("select");
                if (groupSelect) {
                  groupSelect.addEventListener("change", () => {
                    this.filterGraph(
                      floatingControls.querySelector('input[type="text"]')
                        ?.value || "",
                      groupSelect.value,
                    );
                  });
                }

                // Re-attach layout buttons
                const forceButton = floatingControls.querySelector(
                  "button:nth-child(1)",
                );
                if (forceButton) {
                  forceButton.onclick = () => this.switchLayout("force");
                }

                const dagreButton = floatingControls.querySelector(
                  "button:nth-child(2)",
                );
                if (dagreButton) {
                  dagreButton.onclick = () => this.switchLayout("dagre");
                }

                // Reset button in fullscreen - visible but non-functional
                const resetButton = floatingControls.querySelector(
                  "button:nth-child(3)",
                );
                if (resetButton) {
                  // resetButton.onclick = () => this.resetView(); // DISABLED - broken functionality
                }

                const legendButton = floatingControls.querySelector(
                  "button:nth-child(4)",
                );
                if (legendButton) {
                  legendButton.onclick = () => this.toggleLegend();
                }

                // Replace fullscreen button with exit button
                const fullscreenButton = floatingControls.querySelector(
                  "button:nth-child(5)",
                );
                if (fullscreenButton) {
                  fullscreenButton.innerHTML =
                    '<i class="bi bi-fullscreen-exit"></i>';
                  fullscreenButton.onclick = () => this.toggleFullscreen();
                }
              }

              floatingControls.style.display = "block";
            }

            // Show and store the floating info panel in fullscreen
            this.floatingInfoPanel = floatingInfoPanel; // Store reference
            this.floatingInfoPanel.style.display = "block"; // Explicitly show it

            // Add stronger box shadow for visibility against any background
            this.floatingInfoPanel.style.boxShadow =
              "0 6px 16px rgba(0,0,0,0.3)";
            this.floatingInfoPanel.style.border = "1px solid #ddd";

            // If there's a selected node already, update the info panel with its info
            if (this.selectedNode) {
              this.updateFullscreenInfoPanel(this.selectedNode);
            } else {
              // Update with default message if no node selected
              const panel = this.floatingInfoPanel.querySelector(
                ".dependency-info-panel",
              );
              if (panel) {
                const title = panel.querySelector(".info-title");
                const value = panel.querySelector(".info-value");
                if (title) title.textContent = "Dependency Graph";
                if (value)
                  value.innerHTML =
                    "<strong>Click on a node to see details</strong>";
              }
            }

            // Show legend in fullscreen too
            if (this.legendElement) {
              this.legendElement.style.display = "block";
            }
          }
        },
        { once: true },
      );
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        /* Firefox */
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        /* IE/Edge */
        document.msExitFullscreen();
      }

      // Change icon back
      if (this.fullscreenButton)
        this.fullscreenButton.innerHTML =
          '<i class="bi bi-arrows-fullscreen"></i>';

      // Hide floating elements
      if (floatingControls) floatingControls.style.display = "none";
      if (floatingInfoPanel) floatingInfoPanel.style.display = "none";
      if (this.legendElement) this.legendElement.style.display = "none";

      this.floatingInfoPanel = null;
    }
  }

  /** Populate the group filter dropdown based on node data */
  populateGroupFilter() {
    if (!this.groupSelect || !this.data?.nodes) return;

    // Clear existing options except 'All Groups'
    while (this.groupSelect.options.length > 1) {
      this.groupSelect.remove(1);
    }

    // Get unique, sorted groups from the enhanced node data
    const groupsInData = [
      ...new Set(this.data.nodes.map((n) => n.group).filter((g) => g)),
    ].sort();
    groupsInData.forEach((group) => {
      const option = document.createElement("option");
      option.value = group;
      option.text = group; // Use the full section name now
      this.groupSelect.appendChild(option);
    });
  }

  /**
   * Create color legend
   */
  createLegend() {
    // Check if the SVG container exists
    const container = document.querySelector(this.containerSelector);
    if (!container) return;

    // Create the legend container
    const legend = document.createElement("div");
    legend.className = "dependency-graph-legend";
    legend.style.display = "none"; // Hidden by default
    legend.style.position = "absolute";
    legend.style.bottom = "15px";
    legend.style.left = "15px";
    legend.style.background = "rgba(255, 255, 255, 0.9)";
    legend.style.padding = "10px";
    legend.style.borderRadius = "5px";
    // Remove the box shadow for frameless appearance
    legend.style.maxWidth = "250px";
    legend.style.zIndex = "100";
    legend.style.fontSize = "12px";
    legend.style.fontFamily = "sans-serif";

    // Create legend title
    const title = document.createElement("div");
    title.textContent = "Section Groups";
    title.style.fontWeight = "bold";
    title.style.marginBottom = "8px";
    title.style.paddingBottom = "4px";
    legend.appendChild(title);

    // Add legend items
    const itemsContainer = document.createElement("div");
    itemsContainer.style.display = "grid";
    itemsContainer.style.gridTemplateColumns = "repeat(2, 1fr)";
    itemsContainer.style.gap = "8px";

    // Sort color scheme entries for consistent display
    const entries = Object.entries(this.settings.colorScheme);
    entries.sort((a, b) => {
      // Try to extract numbers from the beginning of group names for sorting
      const numA = parseInt(a[0].match(/^(\d+)\./)?.[1] || "999");
      const numB = parseInt(b[0].match(/^(\d+)\./)?.[1] || "999");
      return numA - numB;
    });

    // Create legend items
    entries.forEach(([group, color]) => {
      const item = document.createElement("div");
      item.style.display = "flex";
      item.style.alignItems = "center";

      const colorBox = document.createElement("span");
      colorBox.style.display = "inline-block";
      colorBox.style.width = "12px";
      colorBox.style.height = "12px";
      colorBox.style.backgroundColor = color;
      colorBox.style.marginRight = "6px";
      colorBox.style.borderRadius = "3px";

      const label = document.createElement("span");
      label.textContent = group;
      label.style.whiteSpace = "nowrap";
      label.style.overflow = "hidden";
      label.style.textOverflow = "ellipsis";

      item.appendChild(colorBox);
      item.appendChild(label);
      itemsContainer.appendChild(item);
    });

    legend.appendChild(itemsContainer);

    // Add architectural layer legend section
    const archTitle = document.createElement("div");
    archTitle.textContent = "Architectural Layers";
    archTitle.style.fontWeight = "bold";
    archTitle.style.marginTop = "12px";
    archTitle.style.marginBottom = "8px";
    archTitle.style.paddingBottom = "4px";
    archTitle.style.borderTop = "1px solid #ccc";
    archTitle.style.paddingTop = "8px";
    legend.appendChild(archTitle);

    // Add architectural layer items
    const archItems = [
      {
        name: "🏗️ Foundation",
        color: "#2E7D32",
        description: "Core infrastructure (StateManager, FieldManager)",
      },
      {
        name: "🧮 Coordination",
        color: "#1565C0",
        description: "Orchestration layer (Calculator, Reference System)",
      },
      {
        name: "🎯 Application",
        color: "#C62828",
        description: "Section modules (S01-S18)",
      },
    ];

    archItems.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.style.display = "flex";
      itemDiv.style.alignItems = "center";
      itemDiv.style.marginBottom = "4px";
      itemDiv.style.fontSize = "11px";

      const indicator = document.createElement("div");
      indicator.style.width = "16px";
      indicator.style.height = "16px";
      indicator.style.border = `3px solid ${item.color}`;
      indicator.style.borderRadius = "50%";
      indicator.style.backgroundColor = "#f0f0f0";
      indicator.style.marginRight = "8px";
      indicator.style.flexShrink = "0";

      const label = document.createElement("span");
      label.textContent = item.name;
      label.style.fontWeight = "500";

      itemDiv.appendChild(indicator);
      itemDiv.appendChild(label);
      legend.appendChild(itemDiv);
    });

    // Add to the graph container (which should be a relatively positioned parent)
    const graphContainer = document.querySelector(
      `${this.containerSelector} .dependency-graph-svg-wrapper`,
    );
    if (graphContainer) {
      graphContainer.appendChild(legend);
      this.legendElement = legend;
    }
  }

  toggleLegend() {
    if (!this.legendElement) {
      this.createLegend();
    }

    if (this.legendElement) {
      const isVisible = this.legendElement.style.display !== "none";
      this.legendElement.style.display = isVisible ? "none" : "block";

      // Update button text
      if (this.legendToggleButton) {
        this.legendToggleButton.textContent = isVisible
          ? "Show Legend"
          : "Hide Legend";
      }
    }
  }

  /**
   * Fit the graph to fill the container
   * Uses D3's zoom transform to scale the graph appropriately
   */
  fitGraphToContainer() {
    if (
      !this.svg ||
      !this.data ||
      !this.data.nodes ||
      this.data.nodes.length === 0
    )
      return;

    // PERFORMANCE FIX: Split heavy operation across multiple frames to avoid violations
    // Step 1: Calculate bounds in first frame (lightweight)
    requestAnimationFrame(() => {
      try {
        // Get the current bounds of the nodes
        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;

        this.data.nodes.forEach((node) => {
          if (node.x < minX) minX = node.x;
          if (node.x > maxX) maxX = node.x;
          if (node.y < minY) minY = node.y;
          if (node.y > maxY) maxY = node.y;
        });

        // Step 2: Calculate dimensions and scale in second frame
        requestAnimationFrame(() => {
          try {
            // Add some padding
            const padding = 50;
            minX -= padding;
            minY -= padding;
            maxX += padding;
            maxY += padding;

            // Calculate the scale needed to fit the graph
            const graphWidth = maxX - minX;
            const graphHeight = maxY - minY;
            const containerWidth = this.width;
            const containerHeight = this.height;

            if (
              graphWidth <= 0 ||
              graphHeight <= 0 ||
              containerWidth <= 0 ||
              containerHeight <= 0
            ) {
              console.warn(
                "[DependencyGraph] Invalid dimensions for fitting graph",
                {
                  graph: { width: graphWidth, height: graphHeight },
                  container: { width: containerWidth, height: containerHeight },
                },
              );
              return;
            }

            const scaleX = containerWidth / graphWidth;
            const scaleY = containerHeight / graphHeight;
            const scale = Math.min(scaleX, scaleY, 1.5); // Cap at 1.5x to avoid excessive scaling

            // Calculate the translation needed to center the graph
            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;

            const translateX = containerWidth / 2 - centerX * scale;
            const translateY = containerHeight / 2 - centerY * scale;

            // Step 3: Apply transform in third frame (allows D3 to optimize)
            requestAnimationFrame(() => {
              try {
                this.svg
                  .transition()
                  .duration(750)
                  .call(
                    d3.zoom().transform,
                    d3.zoomIdentity
                      .translate(translateX, translateY)
                      .scale(scale),
                  );

                // console.log(
                //   "[DependencyGraph] Fitted graph to container with scale",
                //   scale,
                // );
              } catch (error) {
                console.error(
                  "[DependencyGraph] Error applying graph transform",
                  error,
                );
              }
            });
          } catch (error) {
            console.error(
              "[DependencyGraph] Error calculating graph dimensions",
              error,
            );
          }
        });
      } catch (error) {
        console.error(
          "[DependencyGraph] Error calculating graph bounds",
          error,
        );
      }
    });
  }

  // Update fullscreen info panel method
  updateFullscreenInfoPanel(node) {
    if (!this.floatingInfoPanel || !node) return;

    const stateManager = window.TEUI?.StateManager;
    if (!stateManager) return;

    const panel = this.floatingInfoPanel.querySelector(
      ".dependency-info-panel",
    );
    if (!panel) return;

    // Ensure floating panel is visible
    this.floatingInfoPanel.style.display = "block";

    // Add animation to draw attention to the update
    this.floatingInfoPanel.style.transition = "box-shadow 0.3s ease-in-out";
    this.floatingInfoPanel.style.boxShadow = "0 8px 20px rgba(0,0,0,0.4)";

    // Reset shadow after animation
    setTimeout(() => {
      this.floatingInfoPanel.style.boxShadow = "0 6px 16px rgba(0,0,0,0.3)";
    }, 300);

    const title = panel.querySelector(".info-title");
    const value = panel.querySelector(".info-value");
    const dependencies = panel.querySelector(".info-dependencies");
    const dependents = panel.querySelector(".info-dependents");

    if (title)
      title.textContent =
        node.enhancedLabel || `${node.label || node.id} (${node.id})`;

    const currentValue = stateManager.getValue(node.id);
    if (value) {
      // Format the value using our formatting helper
      const formattedValue =
        currentValue !== null && currentValue !== undefined
          ? this.formatNodeValue(node.id, currentValue)
          : "N/A";

      value.innerHTML = `<strong>Current Value:</strong> ${formattedValue}`;
      value.innerHTML += `<br><strong>ID:</strong> ${node.id}`;

      // If it's an influential node, add a note with stronger styling
      if (node.isInfluential) {
        value.innerHTML += `<br><strong style="color:#ff5252; display: inline-block; margin-top: 5px; padding: 3px 6px; border-radius: 4px; background: rgba(255,82,82,0.1);">★ HIGH INFLUENCE NODE ★</strong>`;
      }
    }

    // Use the already processed links data for connections
    const fieldDependencies = this.data.links
      .filter((link) => (link.target.id || link.target) === node.id)
      .map((link) => {
        // Try to get enhanced labels for dependencies
        const sourceNode = this.data.nodes.find(
          (n) => n.id === (link.source.id || link.source),
        );
        return sourceNode?.enhancedLabel || link.source.id || link.source;
      });

    if (dependencies) {
      // Format dependencies list with better styling
      if (fieldDependencies.length > 0) {
        const depList = fieldDependencies
          .map(
            (dep) =>
              `<span style="display: inline-block; margin: 2px; padding: 2px 6px; background: #f1f8ff; border-radius: 4px; border: 1px solid #cfe4ff;">${dep}</span>`,
          )
          .join(" ");
        dependencies.innerHTML = `<strong>Depends on:</strong><div style="margin-top: 4px;">${depList}</div>`;
      } else {
        dependencies.innerHTML = `<strong>Depends on:</strong> None`;
      }
    }

    const fieldDependents = this.data.links
      .filter((link) => (link.source.id || link.source) === node.id)
      .map((link) => {
        // Try to get enhanced labels for dependents
        const targetNode = this.data.nodes.find(
          (n) => n.id === (link.target.id || link.target),
        );
        return targetNode?.enhancedLabel || link.target.id || link.target;
      });

    if (dependents) {
      // Format dependents list with better styling
      if (fieldDependents.length > 0) {
        const depList = fieldDependents
          .map(
            (dep) =>
              `<span style="display: inline-block; margin: 2px; padding: 2px 6px; background: #fff8f1; border-radius: 4px; border: 1px solid #ffe6cf;">${dep}</span>`,
          )
          .join(" ");
        dependents.innerHTML = `<strong>Influences:</strong><div style="margin-top: 4px;">${depList}</div>`;
      } else {
        dependents.innerHTML = `<strong>Influences:</strong> None`;
      }
    }
  }
};

// --- Initialization Logic (Adapted from 4007) ---

// Global instance variable
let teuiDependencyGraphInstance = null;

/**
 * Initialize the dependency graph visualization
 */
function initializeDependencyGraph() {
  // Prevent double initialization
  if (teuiDependencyGraphInstance) {
    // console.log('[DependencyGraph] Already initialized.');
    return;
  }

  // Assume D3 is loaded globally via index.html
  if (typeof d3 === "undefined") {
    console.error("D3.js not found. Ensure it is included in index.html.");
    const container = document.querySelector(
      "#dependencyDiagram .section-content",
    );
    if (container)
      container.innerHTML =
        '<div class="alert alert-danger">Error: D3.js library not loaded.</div>';
    return;
  }

  // Proceed with initialization now that D3 is assumed available
  initializeGraphInstanceAndUI();
}

/**
 * Creates the graph instance, loads data, creates UI elements, and renders.
 */
function initializeGraphInstanceAndUI() {
  // console.log("[DependencyGraph] Initializing graph instance and UI...");
  const graphContainer = document.querySelector(
    "#dependencyDiagram .section-content .dependency-graph-container",
  );
  const controlsContainer = document.querySelector(
    "#dependencyDiagram .dependency-graph-controls-wrapper",
  ); // Separate container for controls
  const infoPanelContainer = document.querySelector(
    "#dependencyDiagram .dependency-graph-info-wrapper",
  ); // Separate container for info

  if (!graphContainer || !controlsContainer || !infoPanelContainer) {
    console.warn(
      "[DependencyGraph] Required containers not found. Initialization deferred.",
    );
    return;
  }

  // Create the graph instance
  teuiDependencyGraphInstance = new window.TEUI.DependencyGraph();

  // Call initialize which gets data
  if (teuiDependencyGraphInstance.initialize()) {
    // initialize now returns true on success
    // If data loaded successfully, THEN create UI and render
    teuiDependencyGraphInstance.createInfoPanel(infoPanelContainer);
    teuiDependencyGraphInstance.createFilterControls(controlsContainer); // Creates structure
    teuiDependencyGraphInstance.populateGroupFilter(); // Populate dropdown NOW
    teuiDependencyGraphInstance.setupSvg(); // Setup SVG container
    if (teuiDependencyGraphInstance.svg) {
      // Render the graph first (create nodes/links)
      teuiDependencyGraphInstance.render();

      // Apply the default layout - prefer dagre (hierarchical)
      const defaultLayout =
        teuiDependencyGraphInstance.settings.defaultLayout || "dagre";

      // Force fit the graph to fill the container
      teuiDependencyGraphInstance.fitGraphToContainer();

      if (defaultLayout === "dagre" && typeof dagre !== "undefined") {
        // Apply dagre layout
        teuiDependencyGraphInstance.applyDagreLayout();
        // Update button states
        if (teuiDependencyGraphInstance.dagreButton)
          teuiDependencyGraphInstance.dagreButton.classList.add("active");
        if (teuiDependencyGraphInstance.forceButton)
          teuiDependencyGraphInstance.forceButton.classList.remove("active");
        // console.log("[DependencyGraph] Applied Dagre layout on init.");
      } else {
        // Fallback to force layout
        if (teuiDependencyGraphInstance.forceButton)
          teuiDependencyGraphInstance.forceButton.classList.add("active");
        if (teuiDependencyGraphInstance.dagreButton)
          teuiDependencyGraphInstance.dagreButton.classList.remove("active");
        // console.log("[DependencyGraph] Using Force layout on init.");
      }

      // Create the legend but keep it hidden
      teuiDependencyGraphInstance.createLegend();

      // Setup event handlers
      teuiDependencyGraphInstance.setupEvents();
    } else {
      console.error("[DependencyGraph] SVG setup failed after data load.");
      teuiDependencyGraphInstance.showErrorMessage(
        "Graph rendering failed (SVG setup).",
      );
    }
  } else {
    console.error("[DependencyGraph] Initialization failed (data loading).");
    // Error message is shown within initialize()
  }
}

// --- Trigger Initialization ---

// Attempt initialization when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // PERFORMANCE FIX: Use immediate execution with readiness check instead of arbitrary delay
  // console.log(
  //   "[DependencyGraph] DOMContentLoaded, attempting initialization...",
  // );
  // Check if the specific container exists, which implies the tab might be visible
  if (document.querySelector("#dependencyDiagram .section-content")) {
    // PERFORMANCE FIX: Defer dependency graph initialization to prevent setTimeout violations (542ms)
    // Heavy graph initialization needs significant delay to avoid blocking
    setTimeout(() => {
      initializeDependencyGraph();
    }, 800); // Longer delay prevents setTimeout performance violations
  }
});

// Also listen for tab visibility changes (assuming Bootstrap tabs)
document.addEventListener("shown.bs.tab", function (event) {
  if (event.target.getAttribute("data-bs-target") === "#dependencyDiagram") {
    // console.log("[DependencyGraph] Tab shown, ensuring initialization...");
    if (!teuiDependencyGraphInstance) {
      // Initialize if not already done
      initializeDependencyGraph();
    } else {
      // Optional: Refresh or resize graph if needed when tab becomes visible
      // teuiDependencyGraphInstance.resize();
    }
  }
});

// Export utility functions for global access if needed
window.TEUI.DependencyGraphUtils = {
  initialize: initializeDependencyGraph,
  focusOnNode: (nodeId) => {
    teuiDependencyGraphInstance?.focusOnNode(nodeId);
  },
  getInstance: () => teuiDependencyGraphInstance,
};

// SECTION17 FIX: Expose the main initialization functions to global TEUI namespace
// These are the exact functions Section17 is looking for
window.TEUI.initializeDependencyGraph = initializeDependencyGraph;
window.TEUI.initializeGraphInstanceAndUI = initializeGraphInstanceAndUI;

// console.log("[4011-Dependency.js] Module loaded.");
