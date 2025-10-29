/**
 * 4011-init.js
 * Primary navigation script for TEUI 4.011 Calculator
 * Implements layout switching and section collapsing
 */

// --- UI Initialization ---

/**
 * Initializes general UI handlers like modals, tooltips, etc.
 */
function initializeUIHandlers() {
  // Initialize Bootstrap tooltips
  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]'),
  );
  var _tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Disclaimer Modal Button listener (already implicitly handled by Bootstrap attributes)

  // Add any other general UI setup here

  // << OBC: Event listener for Reset button >>
  const resetImportedBtn = document.getElementById("reset-imported-btn");
  if (resetImportedBtn) {
    resetImportedBtn.addEventListener("click", function () {
      if (
        window.OBC &&
        window.OBC.StateManager &&
        typeof window.OBC.StateManager.resetFields === "function"
      ) {
        if (
          confirm(
            "Are you sure you want to reset? This will clear user-modified values but keep imported data.",
          )
        ) {
          window.OBC.StateManager.resetFields();
          console.log("OBC Matrix: Fields reset successfully");
        }
      } else {
        console.error("OBCStateManager or resetFields function not found.");
        alert("Error: Reset function is not available.");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Ensure OBC namespace exists
  window.OBC = window.OBC || {};

  // Get DOM elements
  const body = document.body;
  const keyValuesSection =
    document.getElementById("keyValues") ||
    document.getElementById("buildingInfo"); // Support both section types
  const expandCollapseBtn = document.getElementById("expand-collapse-all");
  const layoutToggleButton = document.querySelector(".layout-toggle-btn");
  const sections = document.querySelectorAll(".section");
  const tabContainer = document.querySelector(".tab-container");

  // Bootstrap icons mapping - Updated for OBC Matrix sections
  const bootstrapIcons = {
    // OBC Matrix sections
    buildingInfo: "bi-info-circle",
    buildingOccupancy: "bi-building",
    buildingAreas: "bi-bounding-box",
    firefightingSystems: "bi-fire",
    structuralRequirements: "bi-building",
    occupantSafety: "bi-people",
    fireResistance: "bi-shield",
    plumbingFixtures: "bi-droplet",
    energySoundComply: "bi-check-circle",
    notes: "bi-card-text",

    // Legacy TEUI sections (for compatibility)
    climateCalculations: "bi-thermometer-half",
    actualTargetEnergy: "bi-bullseye",
    emissions: "bi-cloud-upload",
    onSiteEnergy: "bi-sun",
    waterUse: "bi-droplet",
    indoorAirQuality: "bi-lungs",
    occupantInternalGains: "bi-cup-hot",
    envelopeRadiantGains: "bi-box-arrow-in-down-right",
    envelopeTransmissionLosses: "bi-box-arrow-up-right",
    volumeSurfaceMetrics: "bi-box",
    mechanicalLoads: "bi-house-gear",
    tediSummary: "bi-fire",
    teuiSummary: "bi-outlet",
    sankeyDiagram: "bi-sliders2",
    dependencyDiagram: "bi-link-45deg",
    footer: "bi-info-square",
  };

  // Mapping of section IDs to short tab labels - Updated for OBC Matrix
  const tabLabels = {
    // OBC Matrix sections - Short mnemonics for tabs
    buildingInfo: "Info",
    buildingOccupancy: "Occupancy",
    buildingAreas: "Areas",
    firefightingSystems: "Fire",
    structuralRequirements: "Structure",
    occupantSafety: "Safety",
    fireResistance: "Resistance",
    plumbingFixtures: "Plumbing",
    energySoundComply: "Compliance",
    notes: "Notes",

    // Legacy TEUI sections (for compatibility)
    climateCalculations: "Climate",
    actualTargetEnergy: "Target",
    emissions: "GHGI",
    onSiteEnergy: "WWS",
    waterUse: "Water",
    indoorAirQuality: "IAQ",
    occupantInternalGains: "Internal G",
    envelopeRadiantGains: "Envelope G",
    envelopeTransmissionLosses: "Trans",
    volumeSurfaceMetrics: "Vol",
    mechanicalLoads: "Mech",
    tediSummary: "TEDI",
    teuiSummary: "TEUI",
    sankeyDiagram: "Sankey",
    dependencyDiagram: "Depend",
  };

  // Mapping of section IDs to full titles for tooltips - Updated for OBC Matrix
  const tabTooltips = {
    // OBC Matrix sections - Full descriptive names for tooltips
    buildingInfo: "Section 1. Building Information",
    buildingOccupancy: "Section 2. Building Occupancy",
    buildingAreas: "Section 3. Building Areas",
    firefightingSystems: "Section 4. Firefighting & Life Safety Systems",
    structuralRequirements: "Section 5. Structural Requirements",
    occupantSafety: "Section 6. Occupant Safety & Accessibility",
    fireResistance: "Section 7. Fire Resistance & Spatial Separation",
    plumbingFixtures: "Section 8. Plumbing Fixture Requirements",
    energySoundComply: "Section 9. Energy, Sound and Alternative Solutions",
    notes: "Section 10. Notes",

    // Legacy TEUI sections (for compatibility)
    climateCalculations: "Climate Calculations",
    actualTargetEnergy: "T.3 Actual vs. Target Energy & Carbon",
    emissions: "Emissions",
    onSiteEnergy: "Onsite Energy Production",
    waterUse: "Water Use (B7)",
    indoorAirQuality: "Indoor Air Quality",
    occupantInternalGains: "G. Occupant & Internal Gains",
    envelopeRadiantGains: "B. Envelope Radiant Gains",
    envelopeTransmissionLosses: "B. Envelope Transmission Losses",
    volumeSurfaceMetrics: "B.14 Volume and Surface Metrics",
    mechanicalLoads: "Mechanical Loads",
    tediSummary: "TEDI Summary",
    teuiSummary: "TEUI Summary",
    sankeyDiagram: "Energy Flow Diagram",
    dependencyDiagram: "Dependencies Graph",
  };

  // State variables
  let isVerticalLayout = true;
  let allExpanded = true;

  // Initialize with vertical layout
  body.classList.add("vertical-layout");

  // Add toggle icons to section headers if missing
  document.querySelectorAll(".section-header").forEach((header) => {
    // Skip if already has toggle icon
    if (!header.querySelector(".toggle-icon")) {
      const toggleIcon = document.createElement("span");
      toggleIcon.className = "toggle-icon";
      header.insertBefore(toggleIcon, header.firstChild);
    }
  });

  // Initialize tab container (for horizontal layout)
  function initializeTabs() {
    // Clear existing tabs
    tabContainer.innerHTML = "";

    // Create tabs for each section (except sticky header section)
    sections.forEach((section) => {
      if (section.id === "keyValues" || section.id === "buildingInfo") return;

      const sectionHeader = section.querySelector(".section-header");
      if (!sectionHeader) return;

      // Create tab
      const tab = document.createElement("button");
      tab.className = "tab";
      tab.setAttribute("data-section-id", section.id);

      // Set tooltip for the tab (for accessibility and small screen hover)
      const tooltip =
        tabTooltips[section.id] || sectionHeader.textContent.trim();
      tab.setAttribute("title", tooltip);
      tab.setAttribute("aria-label", tooltip);

      // Create icon element
      let iconClass = bootstrapIcons[section.id] || "bi-circle";
      const icon = document.createElement("i");
      icon.className = iconClass;
      icon.setAttribute("aria-hidden", "true");
      tab.appendChild(icon);

      // Add a space between icon and text for better readability
      tab.appendChild(document.createTextNode(" "));

      // Create short label with appropriate text
      const shortLabel = document.createElement("span");
      shortLabel.className = "tab-text";

      // Use the shortened label if available, otherwise extract from title
      if (tabLabels[section.id]) {
        shortLabel.textContent = tabLabels[section.id];

        // Add alternative class for mobile views
        shortLabel.classList.add("tab-text-short");
      } else {
        // Extract just the section name without the number
        let titleText = sectionHeader.textContent.trim();
        const sectionMatch = titleText.match(/SECTION \d+\.\s+(.*)/);
        if (sectionMatch && sectionMatch[1]) {
          shortLabel.textContent = sectionMatch[1];
        } else {
          shortLabel.textContent = titleText;
        }

        // Add class for potential hiding in smaller viewports
        shortLabel.classList.add("tab-text-full");
      }

      tab.appendChild(shortLabel);

      // Add tab to container
      tabContainer.appendChild(tab);

      // Add click handler
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        activateTab(section.id);

        // Scroll to position the matrix container at the top
        const matrixContainer = document.getElementById("matrix-container");
        if (
          matrixContainer &&
          document.body.classList.contains("horizontal-layout")
        ) {
          window.scrollTo({
            top: matrixContainer.offsetTop,
            behavior: "auto",
          });

          // Update heights to ensure proper spacing
          updateStickyElementHeights();
        }
      });
    });

    // Activate first tab by default (for horizontal layout)
    const firstTab = tabContainer.querySelector(".tab");
    if (firstTab) {
      const sectionId = firstTab.getAttribute("data-section-id");
      activateTab(sectionId);
    }

    // Set initial tab display mode based on viewport width
    updateTabDisplayMode();
  }

  // Function to activate a specific tab
  function activateTab(sectionId) {
    // Remove active class from all tabs and sections
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    sections.forEach((s) => {
      if (s.id !== "keyValues" && s.id !== "buildingInfo") {
        s.classList.remove("active");
      }
    });

    // Add active class to selected tab and section
    const selectedTab = document.querySelector(
      `.tab[data-section-id="${sectionId}"]`,
    );
    if (selectedTab) {
      selectedTab.classList.add("active");
    }

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) {
      selectedSection.classList.add("active");

      // If in horizontal layout, scroll to position sticky section at top of viewport
      if (document.body.classList.contains("horizontal-layout")) {
        // Get the matrix container or sticky header section
        const matrixContainer = document.getElementById("matrix-container");
        const _stickySection =
          document.getElementById("keyValues") ||
          document.getElementById("buildingInfo");

        if (matrixContainer) {
          // Scroll to position the matrix container at the top
          window.scrollTo({
            top: matrixContainer.offsetTop,
            behavior: "auto", // Use auto for immediate positioning
          });

          // Update heights to ensure proper spacing
          updateStickyElementHeights();
        }
      }
    }

    // Save active section to localStorage
    localStorage.setItem("activeSection", sectionId);
  }

  // Toggle section collapse/expand when header is clicked (vertical layout only)
  document.querySelectorAll(".section-header").forEach((header) => {
    header.addEventListener("click", function (event) {
      // Skip if clicking on buttons in the header
      if (
        event.target.closest(".btn") ||
        event.target.closest(".layout-toggle-btn")
      ) {
        return;
      }

      // Only toggle in vertical layout
      if (!isVerticalLayout) return;

      // Skip sticky header sections
      const sectionId = header.closest(".section").id;
      if (sectionId === "keyValues" || sectionId === "buildingInfo") return;

      // Toggle collapsed class
      header.classList.toggle("collapsed");

      // Add aria-expanded attribute for accessibility
      const isCollapsed = header.classList.contains("collapsed");
      header.setAttribute("aria-expanded", !isCollapsed);

      // Save collapse state to localStorage
      saveCollapsedState();
    });
  });

  // Expand/collapse all sections button
  expandCollapseBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    allExpanded = !allExpanded;

    // Update button icon
    if (allExpanded) {
      expandCollapseBtn.innerHTML = '<i class="bi bi-dash-circle"></i>';
      expandAllSections();
    } else {
      expandCollapseBtn.innerHTML = '<i class="bi bi-plus-circle"></i>';
      collapseAllSections();
    }

    // Save state to localStorage
    saveCollapsedState();
  });

  // Helper function to collapse all sections
  function collapseAllSections() {
    document.querySelectorAll(".section-header").forEach((header) => {
      // Skip sticky header sections
      const sectionId = header.closest(".section").id;
      if (sectionId === "keyValues" || sectionId === "buildingInfo") return;

      header.classList.add("collapsed");
      header.setAttribute("aria-expanded", "false");
    });
  }

  // Helper function to expand all sections
  function expandAllSections() {
    document.querySelectorAll(".section-header").forEach((header) => {
      // Skip sticky header sections
      const sectionId = header.closest(".section").id;
      if (sectionId === "keyValues" || sectionId === "buildingInfo") return;

      header.classList.remove("collapsed");
      header.setAttribute("aria-expanded", "true");
    });
  }

  // Very simple scroll function - just scroll matrix container to top when switching to horizontal layout
  function scrollMatrixContainerToTop() {
    const matrixContainer = document.getElementById("matrix-container");
    if (matrixContainer) {
      window.scrollTo({
        top: matrixContainer.offsetTop,
        behavior: "auto",
      });
    }
  }

  // Layout toggle button in Key Values header
  if (layoutToggleButton) {
    layoutToggleButton.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      isVerticalLayout = !isVerticalLayout;

      if (isVerticalLayout) {
        // Switch to vertical
        body.classList.add("vertical-layout");
        body.classList.remove("horizontal-layout");

        // Restore collapse state
        restoreCollapsedState();

        // Update icon
        this.innerHTML = '<i class="bi bi-arrow-right-circle"></i>';
      } else {
        // Switch to horizontal
        body.classList.add("horizontal-layout");
        body.classList.remove("vertical-layout");
        initializeTabs();

        // Update icon
        this.innerHTML = '<i class="bi bi-arrow-down-circle"></i>';

        // Restore active section if available
        const savedActiveSection = localStorage.getItem("activeSection");
        if (savedActiveSection) {
          activateTab(savedActiveSection);
        }

        // Update sticky element heights
        updateStickyElementHeights();

        // Scroll to top using requestAnimationFrame for better performance
        requestAnimationFrame(scrollMatrixContainerToTop);
      }

      // Save layout preference
      localStorage.setItem(
        "layoutMode",
        isVerticalLayout ? "vertical" : "horizontal",
      );
    });
  }

  // Function to save collapsed state of all sections
  function saveCollapsedState() {
    const collapsedSections = {};

    document.querySelectorAll(".section-header").forEach((header) => {
      const section = header.closest(".section");
      // Skip sticky header sections
      if (section.id === "keyValues" || section.id === "buildingInfo") return;

      collapsedSections[section.id] = header.classList.contains("collapsed");
    });

    localStorage.setItem(
      "collapsedSections",
      JSON.stringify(collapsedSections),
    );
  }

  // Function to restore collapsed state
  function restoreCollapsedState() {
    try {
      const collapsedSections =
        JSON.parse(localStorage.getItem("collapsedSections")) || {};

      document.querySelectorAll(".section-header").forEach((header) => {
        const section = header.closest(".section");
        // Skip sticky header sections
        if (section.id === "keyValues" || section.id === "buildingInfo") return;

        if (collapsedSections[section.id]) {
          header.classList.add("collapsed");
          header.setAttribute("aria-expanded", "false");
        } else {
          header.classList.remove("collapsed");
          header.setAttribute("aria-expanded", "true");
        }
      });
    } catch (_e) {
      // Ignore localStorage errors
    }
  }

  // Function to restore user preferences from localStorage
  function restoreUserPreferences() {
    // Restore layout mode
    const savedLayout = localStorage.getItem("layoutMode");

    if (savedLayout === "horizontal") {
      isVerticalLayout = false;
      body.classList.add("horizontal-layout");
      body.classList.remove("vertical-layout");
      layoutToggleButton.innerHTML = '<i class="bi bi-arrow-down-circle"></i>';
      initializeTabs();

      // Restore active section
      const savedActiveSection = localStorage.getItem("activeSection");
      if (savedActiveSection) {
        activateTab(savedActiveSection);
      }

      // Update sticky element heights
      updateStickyElementHeights();
    } else {
      // Default to vertical layout
      isVerticalLayout = true;
      restoreCollapsedState();
    }

    // Set initial expand/collapse all button state
    updateExpandCollapseButtonState();
  }

  // Function to update expand/collapse all button state based on current sections
  function updateExpandCollapseButtonState() {
    // Count collapsed sections
    let collapsedCount = 0;
    let totalSections = 0;

    document.querySelectorAll(".section-header").forEach((header) => {
      const section = header.closest(".section");
      // Skip sticky header sections
      if (section.id === "keyValues" || section.id === "buildingInfo") return;

      totalSections++;
      if (header.classList.contains("collapsed")) {
        collapsedCount++;
      }
    });

    // If all sections or majority are collapsed, set to collapsed state
    if (collapsedCount > totalSections / 2) {
      allExpanded = false;
      expandCollapseBtn.innerHTML = '<i class="bi bi-plus-circle"></i>';
    } else {
      allExpanded = true;
      expandCollapseBtn.innerHTML = '<i class="bi bi-dash-circle"></i>';
    }
  }

  // Helper function to calculate section heights
  function updateSectionHeights() {
    // Calculate height of keyValues section for sticky positioning
    if (keyValuesSection) {
      const keyValuesHeight = keyValuesSection.offsetHeight;
      document.documentElement.style.setProperty(
        "--key-values-height",
        `${keyValuesHeight}px`,
      );
    }
  }

  // Function to ensure tab container is properly positioned
  function positionTabContainer() {
    if (keyValuesSection && tabContainer) {
      // Ensure tab container is positioned correctly
      const keyValueRect = keyValuesSection.getBoundingClientRect();
      tabContainer.style.top = `${keyValueRect.height}px`;

      // Update CSS variable for other elements that need this value
      document.documentElement.style.setProperty(
        "--key-values-height",
        `${keyValueRect.height}px`,
      );
    }
  }

  // Make key values close button same size as layout toggle
  const headerButtons = document.querySelectorAll(
    ".section-header .btn, .layout-toggle-btn",
  );
  headerButtons.forEach((button) => {
    button.classList.add(
      "d-flex",
      "align-items-center",
      "justify-content-center",
    );
  });

  // Initialize tabs
  initializeTabs();

  // Position tab container
  positionTabContainer();

  // Restore user preferences
  restoreUserPreferences();

  // Function to update tab display mode based on container width
  function updateTabDisplayMode() {
    const tabContainerWidth = tabContainer.offsetWidth;
    const tabs = tabContainer.querySelectorAll(".tab");
    const totalTabs = tabs.length;

    if (!totalTabs) return;

    // Estimate available width per tab
    const availableWidthPerTab = tabContainerWidth / totalTabs;

    // Determine display mode based on available width
    let displayMode = "full"; // Default: show full text

    if (availableWidthPerTab < 100) {
      displayMode = "short"; // Show shortened text
    }

    if (availableWidthPerTab < 60) {
      displayMode = "icon-only"; // Show only icons
    }

    // Apply the appropriate display mode to all tabs
    tabs.forEach((tab) => {
      const textElement = tab.querySelector(".tab-text");

      if (displayMode === "icon-only") {
        // Hide all text, show only icons
        if (textElement) textElement.style.display = "none";
        tab.classList.add("icon-only");
      } else if (displayMode === "short") {
        // Show shortened text where available
        if (textElement) textElement.style.display = "";
        tab.classList.remove("icon-only");

        // Ensure the tab uses short text if available
        const shortText = tabLabels[tab.getAttribute("data-section-id")];
        if (shortText && textElement) {
          textElement.textContent = shortText;
        }
      } else {
        // Show full text
        if (textElement) textElement.style.display = "";
        tab.classList.remove("icon-only");
      }
    });
  }

  // Add CSS for icon-only tabs
  function addResponsiveTabStyles() {
    // Create style element if it doesn't exist
    let styleElement = document.getElementById("responsive-tab-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "responsive-tab-styles";
      document.head.appendChild(styleElement);
    }

    // Add styles for responsive tabs
    styleElement.textContent = `
            .tab.icon-only {
                min-width: 40px;
                padding: 8px 8px;
                justify-content: center;
            }
            
            .tab-container {
                overflow-x: auto;
                overflow-y: hidden;
                scrollbar-width: none; /* Firefox */
                -ms-overflow-style: none; /* IE/Edge */
            }
            
            .tab-container::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
            }
            
            @media (max-width: 768px) {
                .tab .tab-text-full {
                    display: none;
                }
                
                .tab {
                    min-width: 60px;
                    padding: 8px 6px;
                }
            }
            
            @media (max-width: 576px) {
                .tab .tab-text {
                    display: none;
                }
                
                .tab {
                    min-width: 40px;
                    padding: 8px 8px;
                    justify-content: center;
                }
            }
        `;
  }

  // Add responsive styles
  addResponsiveTabStyles();

  // Update tab display mode and section heights on window resize
  window.addEventListener("resize", function () {
    updateSectionHeights();
    positionTabContainer();
    updateTabDisplayMode();
    if (document.body.classList.contains("horizontal-layout")) {
      updateStickyElementHeights();
    }
  });

  // Check if disclaimer has been shown before
  if (!localStorage.getItem("disclaimerSeen")) {
    // Show the modal
    const disclaimerModal = new bootstrap.Modal(
      document.getElementById("disclaimerModal"),
    );
    disclaimerModal.show();

    // Set flag so it doesn't show again in this session
    localStorage.setItem("disclaimerSeen", "true");
  }

  // Event listener for disclaimer modal
  const disclaimerModal = document.getElementById("disclaimerModal");
  if (disclaimerModal) {
    disclaimerModal.addEventListener("hidden.bs.modal", function () {
      localStorage.setItem("disclaimerSeen", "true");
    });
  }

  // Setup download button actions with null checks
  const downloadReportBtn = document.getElementById("downloadReport");
  if (downloadReportBtn) {
    downloadReportBtn.addEventListener("click", function () {
      // This will be implemented later
    });
  }

  const obcFactsheetBtn = document.getElementById("obc-factsheet");
  if (obcFactsheetBtn) {
    obcFactsheetBtn.addEventListener("click", function () {
      // This will be implemented later
    });
  }

  const tediFactsheetBtn = document.getElementById("tedi-factsheet");
  if (tediFactsheetBtn) {
    tediFactsheetBtn.addEventListener("click", function () {
      // This will be implemented later
    });
  }

  // Note: ExcelLocationHandler functionality removed
  // OBC Matrix is a building code compliance form, not an energy calculator
  // Location/weather data handling is specific to TEUI Calculator

  // Helper function for dropdown initialization removed with ExcelLocationHandler

  // Replace the scroll event listener with a much simpler approach
  document.addEventListener(
    "scroll",
    function () {
      // Only apply in horizontal layout
      if (!document.body.classList.contains("horizontal-layout")) return;

      // Get the spacer element
      const spacer = document.getElementById("section-spacer");
      if (!spacer) return;

      // Ensure spacer is visible
      spacer.style.display = "block";
      spacer.style.height = "15px";
      spacer.style.minHeight = "15px";
    },
    { passive: true },
  );

  // Update sticky header height and tab container position
  function updateStickyElementHeights() {
    const stickySection =
      document.getElementById("keyValues") ||
      document.getElementById("buildingInfo");
    const tabContainer = document.querySelector(".tab-container");

    if (stickySection && tabContainer) {
      // Get the exact height of the sticky header section
      const stickyHeight = stickySection.offsetHeight;

      // Update CSS variable (keep legacy name for compatibility)
      document.documentElement.style.setProperty(
        "--key-values-height",
        stickyHeight + "px",
      );

      // Set tab container position exactly at bottom of sticky section
      tabContainer.style.top = stickyHeight + "px";
    }
  }

  // Use requestAnimationFrame for better performance and timing
  requestAnimationFrame(updateStickyElementHeights);

  // Initialize core components after DOM is loaded
  if (window.OBC && window.OBC.FieldManager) {
    // Initialize FieldManager (core requirement for OBC Matrix)
    window.OBC.FieldManager.renderAllSections(); // FieldManager handles initial rendering

    // Initialize global input handlers after sections are rendered
    // Note: StateManager auto-initializes via its own DOMContentLoaded listener
    if (window.OBC.StateManager) {
      // Use requestAnimationFrame instead of setTimeout for better performance
      requestAnimationFrame(() => {
        window.OBC.StateManager.initializeGlobalInputHandlers();
      });
    }

    // OBC Matrix doesn't use these TEUI-specific modules:
    // - StateManager (has its own OBC.StateManager)
    // - SectionIntegrator (form-based, no complex integrations)
    // - ReferenceValues/ReferenceManager/ReferenceToggle (building code matrix, not energy calculator)
    // Initialize other UI handlers
    initializeUIHandlers();
  } else {
    console.error("Core OBC modules (FieldManager) not found!");
  }
});
