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

  // << NEW: Event listener for Reset Imported button >>
  const resetImportedBtn = document.getElementById("reset-imported-btn");
  if (resetImportedBtn) {
    resetImportedBtn.addEventListener("click", function () {
      if (
        window.TEUI &&
        window.TEUI.StateManager &&
        typeof window.TEUI.StateManager.revertToLastImportedState === "function"
      ) {
        window.TEUI.StateManager.revertToLastImportedState();
      } else {
        console.error(
          "StateManager or revertToLastImportedState function not found.",
        );
        alert("Error: Reset function is not available.");
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Ensure TEUI namespace exists
  window.TEUI = window.TEUI || {};

  // Get DOM elements
  const body = document.body;
  const keyValuesSection = document.getElementById("keyValues");
  const expandCollapseBtn = document.getElementById("expand-collapse-all");
  const layoutToggleButton = document.querySelector(".layout-toggle-btn");
  const sections = document.querySelectorAll(".section");
  const tabContainer = document.querySelector(".tab-container");

  // Bootstrap icons mapping
  const bootstrapIcons = {
    keyValues: "bi-key-fill",
    buildingInfo: "bi-info-circle",
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
    notes: "bi-info-square",
  };

  // Mapping of section IDs to short tab labels
  const tabLabels = {
    buildingInfo: "Info",
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
    notes: "Notes",
  };

  // Mapping of section IDs to full titles for tooltips
  const tabTooltips = {
    buildingInfo: "Building Information",
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
    notes: "Project Notes",
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

    // Create tabs for each section (except Key Values)
    sections.forEach((section) => {
      if (section.id === "keyValues") return;

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

        // Scroll to position the app wrapper at the top
        const appWrapper = document.getElementById("app-wrapper");
        if (
          appWrapper &&
          document.body.classList.contains("horizontal-layout")
        ) {
          window.scrollTo({
            top: appWrapper.offsetTop,
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
      if (s.id !== "keyValues") {
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

      // If in horizontal layout, scroll to position Key Values at top of viewport
      if (document.body.classList.contains("horizontal-layout")) {
        // Get the app wrapper or key values section
        const appWrapper = document.getElementById("app-wrapper");
        const _keyValues = document.getElementById("keyValues");

        if (appWrapper) {
          // Scroll to position the app wrapper at the top
          window.scrollTo({
            top: appWrapper.offsetTop,
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

      // Skip Key Values section
      if (header.closest(".section").id === "keyValues") return;

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
      // Skip Key Values section
      if (header.closest(".section").id === "keyValues") return;

      header.classList.add("collapsed");
      header.setAttribute("aria-expanded", "false");
    });
  }

  // Helper function to expand all sections
  function expandAllSections() {
    document.querySelectorAll(".section-header").forEach((header) => {
      header.classList.remove("collapsed");
      header.setAttribute("aria-expanded", "true");
    });
  }

  // Very simple scroll function - just scroll app wrapper to top when switching to horizontal layout
  function scrollAppWrapperToTop() {
    const appWrapper = document.getElementById("app-wrapper");
    if (appWrapper) {
      window.scrollTo({
        top: appWrapper.offsetTop,
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

        // Simply scroll to top of app wrapper
        setTimeout(scrollAppWrapperToTop, 50);
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
      if (section.id === "keyValues") return;

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
        if (section.id === "keyValues") return;

        if (collapsedSections[section.id]) {
          header.classList.add("collapsed");
          header.setAttribute("aria-expanded", "false");
        } else {
          header.classList.remove("collapsed");
          header.setAttribute("aria-expanded", "true");
        }
      });
    } catch (_e) {
      // Silently ignore errors during header expansion - non-critical feature
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
      if (section.id === "keyValues") return;

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
  document
    .getElementById("disclaimerModal")
    .addEventListener("hidden.bs.modal", function () {
      localStorage.setItem("disclaimerSeen", "true");
    });

  // Setup download button actions
  document
    .getElementById("downloadReport")
    .addEventListener("click", function () {
      // This will be implemented later
    });

  document
    .getElementById("teui-factsheet")
    .addEventListener("click", function () {
      // This will be implemented later
    });

  document
    .getElementById("tedi-factsheet")
    .addEventListener("click", function () {
      // This will be implemented later
    });

  // Initialize ExcelLocationHandler if it exists
  if (TEUI.ExcelLocationHandler) {
    TEUI.ExcelLocationHandler.initialize();

    // Setup UI elements for Excel file input
    const selectExcelBtn = document.getElementById("selectExcelBtn");
    const applyExcelBtn = document.getElementById("applyExcelBtn");
    const debugExcelBtn = document.getElementById("debugExcelBtn");
    const feedbackArea = document.getElementById("feedback-area");

    if (selectExcelBtn) {
      selectExcelBtn.addEventListener("click", function () {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = ".xlsx, .xls";
        fileInput.style.display = "none";

        fileInput.addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (file) {
            feedbackArea.textContent = "Reading Excel file...";

            TEUI.ExcelLocationHandler.loadExcelFile(file)
              .then(() => {
                feedbackArea.textContent =
                  "Excel data loaded successfully! Click Apply to use the data.";
                applyExcelBtn.classList.remove("d-none");
              })
              .catch((error) => {
                feedbackArea.textContent = `Error loading Excel file: ${error.message}`;
              });
          }
        });

        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
      });
    }

    if (applyExcelBtn) {
      applyExcelBtn.addEventListener("click", function () {
        if (TEUI.ExcelLocationHandler.getLocationData()) {
          // Update province dropdown
          const provinceDropdown = document.getElementById("dd_d_19");
          if (provinceDropdown) {
            const provinceField = TEUI.getField("d_19");
            if (provinceField && provinceField.getOptions) {
              const options = provinceField.getOptions();
              initializeDropdown(provinceDropdown, provinceField, options);
            }
          }

          feedbackArea.textContent =
            "Location data applied. Choose a province and city to continue.";
          applyExcelBtn.classList.add("d-none");
        } else {
          feedbackArea.textContent =
            "No location data available. Please select an Excel file first.";
        }
      });
    }

    if (debugExcelBtn) {
      debugExcelBtn.addEventListener("click", function () {
        // Add ?qc=true to current URL and reload page
        const currentUrl = new URL(window.location.href);

        // Check if QC is already enabled
        if (currentUrl.searchParams.get("qc") === "true") {
          // QC already enabled - show info
          alert(
            "QC monitoring is already active! Check the QC Dashboard in the top-right corner.",
          );
          return;
        }

        // Add QC parameter to URL
        currentUrl.searchParams.set("qc", "true");

        // Show confirmation before reload
        const confirmed = confirm(
          "This will reload the page with QC monitoring enabled.\n\n" +
            "• QC Dashboard will appear in top-right\n" +
            "• Complete violation tracking from startup\n" +
            "• One-click report copy to clipboard\n\n" +
            "Continue?",
        );

        if (confirmed) {
          // Reload with QC parameter
          window.location.href = currentUrl.toString();
        }
      });
    }
  }

  // Helper function to initialize dropdown for the location handler
  function initializeDropdown(dropdownEl, config, options) {
    if (!dropdownEl) return;

    // Clear existing options
    dropdownEl.innerHTML = "";

    // Add options
    if (options && options.length) {
      options.forEach((option) => {
        const optionEl = document.createElement("option");

        if (typeof option === "object") {
          // Option is an object with 'value' and 'name' properties
          optionEl.value = option.value;
          optionEl.textContent = option.name || option.value;
        } else {
          // Option is a simple string or value
          optionEl.value = option;
          optionEl.textContent = option;
        }

        dropdownEl.appendChild(optionEl);
      });
    }

    // Set initial value if provided
    if (config && config.defaultValue) {
      dropdownEl.value = config.defaultValue;
    }
  }

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

  // Update key values height and tab container position
  function updateStickyElementHeights() {
    const keyValues = document.getElementById("keyValues");
    const tabContainer = document.querySelector(".tab-container");

    if (keyValues && tabContainer) {
      // Get the exact height of the Key Values section
      const keyValuesHeight = keyValues.offsetHeight;

      // Update CSS variable
      document.documentElement.style.setProperty(
        "--key-values-height",
        keyValuesHeight + "px",
      );

      // Set tab container position exactly at bottom of Key Values
      tabContainer.style.top = keyValuesHeight + "px";
    }
  }

  // Call updateStickyElementHeights after DOM is loaded
  setTimeout(updateStickyElementHeights, 300);

  // Initialize core components after DOM is loaded
  if (window.TEUI && window.TEUI.StateManager && window.TEUI.FieldManager) {
    window.TEUI.StateManager.initialize();
    window.TEUI.FieldManager.renderAllSections(); // FieldManager handles initial rendering
    window.TEUI.SectionIntegrator.initialize();
    // Initialize Reference components (Manager depends on Values, Toggle is independent UI)
    if (window.TEUI.ReferenceValues) {
      // Manager depends on this data
      if (window.TEUI.ReferenceManager) {
        window.TEUI.ReferenceManager.initialize();
      }
    }
    if (window.TEUI.ReferenceToggle) {
      window.TEUI.ReferenceToggle.initialize();
    }
    // Initialize other UI handlers
    initializeUIHandlers();

    // Initialize elegant user input behavior
    initializeElegantInputBehavior();
  } else {
    console.error("Core TEUI modules (StateManager, FieldManager) not found!");
  }

  // =============== ELEGANT USER INPUT BEHAVIOR ===============
  function initializeElegantInputBehavior() {
    // Event delegation catches ALL user inputs (including conditional ones)
    document.addEventListener(
      "focus",
      function (e) {
        const field = e.target;
        if (
          field.matches('[contenteditable="true"].user-input, input.user-input')
        ) {
          field.classList.add("editing-intent");
          field.dataset.originalValue = field.textContent || field.value || "";
        }
      },
      true,
    );

    document.addEventListener(
      "blur",
      function (e) {
        const field = e.target;
        if (
          field.matches('[contenteditable="true"].user-input, input.user-input')
        ) {
          field.classList.remove("editing-intent");

          const currentValue = field.textContent || field.value || "";
          const originalValue = field.dataset.originalValue || "";

          // If value changed, mark as user-modified
          if (currentValue !== originalValue && currentValue.trim() !== "") {
            field.classList.add("user-modified");
          } else if (currentValue.trim() === "") {
            // If cleared, remove user-modified (back to default grey italic)
            field.classList.remove("user-modified");
          }
        }
      },
      true,
    );

    // ROOT CAUSE FIX: No auto-marking on page load - clean slate
    // Fields start grey italic and only turn blue on actual interaction
  }
});
