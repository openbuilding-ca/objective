/**
 * 4012-Section18.js
 * Notes & Quality Control Monitor Section for TEUI Calculator 4.012
 */

// Ensure namespace exists
window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

// Section 18: Notes & QC Module
window.TEUI.SectionModules.sect18 = (function () {
  // QC monitoring state
  let qcEnabled = false;
  let lastReport = null;
  let userNotes = "";

  /**
   * Initialize Section 18 with QC integration
   */
  function initialize() {
    console.log("[S18] Notes & QC Monitor section loaded");

    // Load saved notes
    const savedNotes = localStorage.getItem("S18_USER_NOTES");
    if (savedNotes) {
      userNotes = savedNotes;
    }

    // Check if QC should be auto-enabled from URL
    const urlParams = new URLSearchParams(window.location.search);
    qcEnabled = urlParams.get("qc") === "true";
  }

  /**
   * Get field definitions for Section 18
   */
  function getFields() {
    return {
      s18_notes: {
        fieldId: "s18_notes",
        type: "editable",
        label: "Project Notes",
        defaultValue: userNotes || "Enter project notes here...",
        section: "notes",
      },
      s18_qc_output: {
        fieldId: "s18_qc_output",
        type: "calculated",
        label: "QC Report Output",
        defaultValue: "",
        section: "notes",
      },
    };
  }

  /**
   * Get dropdown options (none for this section)
   */
  function getDropdownOptions() {
    return {};
  }

  /**
   * Get layout definition for Section 18 - Custom full-width layout
   */
  function getLayout() {
    return {
      customLayout: true, // Flag to use custom rendering
      rows: [], // Empty - we'll use custom HTML
    };
  }

  /**
   * Initialize event handlers including Debug toggle
   */
  function initializeEventHandlers() {
    // Add debug toggle to section header
    setTimeout(() => {
      addDebugToggleToHeader();
    }, 100);

    // Initialize notes input handler
    const notesInput = document.querySelector('[data-field-id="s18_notes"]');
    if (notesInput && !notesInput.hasEditableListeners) {
      // Prevent Enter key from creating newlines
      notesInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          this.blur();
        }
      });

      // Save notes on blur
      notesInput.addEventListener("blur", function () {
        const value = this.textContent.trim();
        userNotes = value;
        localStorage.setItem("S18_USER_NOTES", value);
        console.log("[S18] Notes saved");
      });

      notesInput.hasEditableListeners = true;
    }
  }

  /**
   * Add Debug toggle to section header (similar to Reference toggle pattern)
   */
  function addDebugToggleToHeader() {
    const sectionHeader = document.querySelector("#notes .section-header");
    if (!sectionHeader) {
      console.warn("[S18] Section header not found for debug toggle");
      return;
    }

    // Check if toggle already exists
    if (sectionHeader.querySelector(".debug-toggle")) {
      return;
    }

    // Create toggle container
    const toggleContainer = document.createElement("div");
    toggleContainer.style.cssText =
      "display: flex; align-items: center; gap: 20px; margin-left: auto;";

    // Create QC status indicator
    const statusIndicator = document.createElement("span");
    statusIndicator.className = "qc-status-indicator";
    statusIndicator.textContent = qcEnabled ? "QC ACTIVE" : "QC DISABLED";
    statusIndicator.style.cssText = `
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      background-color: ${qcEnabled ? "#e8f5e8" : "#f5f5f5"};
      color: ${qcEnabled ? "#2e7d32" : "#666"};
    `;

    // Create debug toggle
    const toggleDiv = document.createElement("div");
    toggleDiv.className = "debug-toggle";
    toggleDiv.style.cssText = "display: flex; align-items: center; gap: 10px;";

    const toggleLabel = document.createElement("label");
    toggleLabel.textContent = "Debug QC";
    toggleLabel.style.cssText = "font-weight: 500; color: #fff; margin: 0;";

    const toggleSwitch = document.createElement("div");
    toggleSwitch.className = "toggle-switch";
    if (qcEnabled) toggleSwitch.classList.add("active");
    toggleSwitch.style.cssText = `
      position: relative;
      width: 50px;
      height: 24px;
      background-color: ${qcEnabled ? "#4caf50" : "#ccc"};
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 0.3s;
    `;

    const toggleSlider = document.createElement("div");
    toggleSlider.className = "toggle-slider";
    toggleSlider.style.cssText = `
      position: absolute;
      top: 2px;
      left: ${qcEnabled ? "26px" : "2px"};
      width: 20px;
      height: 20px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.3s;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    `;

    // Create section filter dropdown
    const sectionFilter = document.createElement("select");
    sectionFilter.style.cssText = `
      padding: 4px 8px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 11px;
      margin-right: 10px;
    `;
    sectionFilter.innerHTML = `
      <option value="all">All Sections</option>
      <option value="S01">S01 - Key Values</option>
      <option value="S02">S02 - Building Info</option>
      <option value="S03">S03 - Climate</option>
      <option value="S04">S04 - Energy</option>
      <option value="S05">S05 - Emissions</option>
      <option value="S06">S06 - Renewable</option>
      <option value="S07">S07 - Water</option>
      <option value="S08">S08 - Air Quality</option>
      <option value="S09">S09 - Internal Gains</option>
      <option value="S10">S10 - Radiant Gains</option>
      <option value="S11">S11 - Transmission</option>
      <option value="S12">S12 - Volume</option>
      <option value="S13">S13 - Mechanical</option>
      <option value="S14">S14 - TEDI</option>
      <option value="S15">S15 - TEUI</option>
    `;

    // Create QC report button
    const reportButton = document.createElement("button");
    reportButton.textContent = "Generate QC Report";
    reportButton.style.cssText = `
      padding: 6px 12px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      font-size: 12px;
    `;

    // Create copy modal button
    const copyModalButton = document.createElement("button");
    copyModalButton.textContent = "📋 Copy Report";
    copyModalButton.style.cssText = `
      padding: 6px 12px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      font-weight: 500;
      cursor: pointer;
      font-size: 12px;
      margin-left: 8px;
    `;

    // Add toggle functionality
    toggleSwitch.addEventListener("click", function (event) {
      event.stopPropagation();
      const isActive = toggleSwitch.classList.contains("active");

      if (!isActive) {
        // Enable QC monitoring
        enableQCMonitoring();
        toggleSwitch.classList.add("active");
        toggleSwitch.style.backgroundColor = "#4caf50";
        toggleSlider.style.left = "26px";
        statusIndicator.textContent = "QC ACTIVE";
        statusIndicator.style.backgroundColor = "#e8f5e8";
        statusIndicator.style.color = "#2e7d32";
        console.log("[S18] QC monitoring enabled via toggle");
      } else {
        // Disable QC monitoring
        disableQCMonitoring();
        toggleSwitch.classList.remove("active");
        toggleSwitch.style.backgroundColor = "#ccc";
        toggleSlider.style.left = "2px";
        statusIndicator.textContent = "QC DISABLED";
        statusIndicator.style.backgroundColor = "#f5f5f5";
        statusIndicator.style.color = "#666";
        console.log("[S18] QC monitoring disabled via toggle");
      }
    });

    // Add report button functionality
    reportButton.addEventListener("click", function (event) {
      event.stopPropagation();
      const selectedSection = sectionFilter.value;
      generateAndDisplayQCReport(selectedSection);
    });

    // Add copy modal button functionality
    copyModalButton.addEventListener("click", function (event) {
      event.stopPropagation();
      const selectedSection = sectionFilter.value;
      showCopyModal(selectedSection);
    });

    // Assemble toggle
    toggleSwitch.appendChild(toggleSlider);
    toggleDiv.appendChild(toggleLabel);
    toggleDiv.appendChild(toggleSwitch);

    toggleContainer.appendChild(statusIndicator);
    toggleContainer.appendChild(toggleDiv);
    toggleContainer.appendChild(sectionFilter);
    toggleContainer.appendChild(reportButton);
    toggleContainer.appendChild(copyModalButton);

    sectionHeader.appendChild(toggleContainer);
  }

  /**
   * Enable QC monitoring
   */
  function enableQCMonitoring() {
    qcEnabled = true;

    // Force activate QC Monitor using direct method
    if (window.TEUI?.QCMonitor) {
      const activationResult = window.TEUI.QCMonitor.forceActivate();

      if (activationResult) {
        console.log("[S18] QC Monitor successfully activated");

        // Analyze current StateManager contents first
        setTimeout(() => {
          window.TEUI.QCMonitor.analyzeStateManagerContents();
        }, 500);

        // Initialize Mirror Target validation (may not work until S13 complete)
        setTimeout(() => {
          window.TEUI.QCMonitor.initializeMirrorTarget();
        }, 1000);

        // Start periodic monitoring
        setTimeout(() => {
          performPeriodicChecks();
        }, 2000);
      } else {
        console.error("[S18] QC Monitor failed to activate");
      }
    }
  }

  /**
   * Disable QC monitoring
   */
  function disableQCMonitoring() {
    qcEnabled = false;

    // Deactivate QC Monitor
    if (window.TEUI?.QCMonitor) {
      window.TEUI.QCMonitor.forceDeactivate();
    }

    // Remove QC dashboard if it exists
    const dashboard = document.getElementById("qc-dashboard");
    if (dashboard) {
      dashboard.remove();
    }

    // Clear QC output
    updateQCOutput("QC monitoring disabled.");
  }

  /**
   * Perform periodic QC checks (called from enableQCMonitoring)
   */
  function performPeriodicChecks() {
    if (!qcEnabled || !window.TEUI?.QCMonitor) return;

    // Generate fresh report every 5 seconds when QC is active
    generateAndDisplayQCReport();

    // Schedule next check
    setTimeout(performPeriodicChecks, 5000);
  }

  /**
   * Generate and display QC report in the section
   */
  function generateAndDisplayQCReport(sectionFilter = "all") {
    if (!qcEnabled || !window.TEUI?.QCMonitor) {
      updateQCOutput("QC Monitor not available. Enable QC monitoring first.");
      return;
    }

    console.log(`[S18] Generating QC report for: ${sectionFilter}`);

    // Generate comprehensive report
    const fullReport = window.TEUI.QCMonitor.generateQCReport();

    // Filter violations by section if specified
    let filteredReport = fullReport;
    if (sectionFilter !== "all") {
      filteredReport = filterReportBySection(fullReport, sectionFilter);
    }

    lastReport = filteredReport;

    // Format report as HTML for display
    const htmlReport = formatReportAsHTML(filteredReport, sectionFilter);

    // Display in QC output field
    updateQCOutput(htmlReport);

    // Also log to console for copy/paste
    console.log(
      `[S18] QC Report generated for ${sectionFilter} - see Notes section for formatted output`,
    );
  }

  /**
   * Filter QC report by section
   */
  function filterReportBySection(report, sectionFilter) {
    if (!report || sectionFilter === "all") return report;

    // Create section field pattern based on filter (fixed patterns)
    const sectionPatterns = {
      S01: /^[ehk]_[0-9]{1,2}$/,
      S02: /^[dh]_1[0-9]+$/,
      S03: /^[dhjlm]_2[0-9]+$/,
      S04: /^[dfgjk]_[23][0-9]+$/,
      S05: /^[ik]_[34][0-9]+$/,
      S06: /^[m]_4[0-9]+$/,
      S07: /^[jk]_[45][0-9]+$/,
      S08: /^[d]_5[0-9]+$/,
      S09: /^[dijk]_6[0-9]+$/,
      S10: /^[deim]_7[0-9]+$/,
      S11: /^[dfgi]_[89][0-9]+$/,
      S12: /^[di]_10[0-9]+$/,
      S13: /^[dfgjlm]_11[0-9]+$/,
      S14: /^[dhi]_12[0-9]+$/,
      S15: /^[dhl]_13[0-9]+$/,
    };

    console.log(
      `[S18] Filtering for ${sectionFilter}, pattern: ${sectionPatterns[sectionFilter]}`,
    );
    console.log(
      `[S18] Total violations before filter: ${report.violations.length}`,
    );

    const pattern = sectionPatterns[sectionFilter];
    if (!pattern) return report;

    // Filter violations by field pattern
    const filteredViolations = report.violations.filter((violation) => {
      const field = violation.field.replace("ref_", ""); // Remove ref_ prefix for pattern matching
      const matches = pattern.test(field);
      if (sectionFilter === "S03") {
        console.log(
          `[S18] Testing field: ${field}, matches S03 pattern: ${matches}`,
        );
      }
      return matches;
    });

    console.log(
      `[S18] Filtered violations for ${sectionFilter}: ${filteredViolations.length}`,
    );

    // Update violation counts
    const filteredByType = {};
    const filteredBySeverity = {};

    filteredViolations.forEach((v) => {
      filteredByType[v.type] = (filteredByType[v.type] || 0) + 1;
      const severity = v.severity || "info";
      filteredBySeverity[severity] = (filteredBySeverity[severity] || 0) + 1;
    });

    return {
      ...report,
      summary: {
        ...report.summary,
        total: filteredViolations.length,
        byType: filteredByType,
        bySeverity: filteredBySeverity,
      },
      violations: filteredViolations,
    };
  }

  /**
   * Format QC report as HTML for full-width display (no nested scrolling)
   */
  function formatReportAsHTML(report, sectionFilter = "all") {
    if (!report) return "No report data available.";

    const sectionTitle =
      sectionFilter === "all" ? "All Sections" : sectionFilter;

    // Create a clean, full-width layout
    let html = `
      <div style="padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        
        <!-- Report Header -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 3px solid #007bff;">
          <div>
            <h5 style="margin: 0; color: #007bff; font-weight: bold;">🔍 QC REPORT: ${sectionTitle}</h5>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Generated: ${new Date(report.timestamp).toLocaleString()}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 24px; font-weight: bold; color: ${report.summary.total > 0 ? "#dc3545" : "#28a745"};">
              ${report.summary.total}
            </div>
            <div style="font-size: 12px; color: #666;">Total Violations</div>
          </div>
        </div>
        
        <!-- Status Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div style="background: ${report.monitoring.active ? "#e8f5e8" : "#f5f5f5"}; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 14px; font-weight: bold; color: ${report.monitoring.active ? "#2e7d32" : "#666"};">
              ${report.monitoring.active ? "✅ ACTIVE" : "⭕ INACTIVE"}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Monitoring Status</div>
          </div>
          
          <div style="background: ${report.monitoring.mirrorTarget ? "#e3f2fd" : "#f5f5f5"}; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 14px; font-weight: bold; color: ${report.monitoring.mirrorTarget ? "#1976d2" : "#666"};">
              ${report.monitoring.mirrorTarget ? "🎯 ENABLED" : "⭕ DISABLED"}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Mirror Target</div>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; text-align: center;">
            <div style="font-size: 14px; font-weight: bold; color: #856404;">
              ${report.monitoring.overhead?.totalCalls || 0}
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">Monitor Calls</div>
          </div>
        </div>
    `;

    // Add violations by type (horizontal cards)
    if (Object.keys(report.summary.byType).length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h6 style="color: #495057; margin-bottom: 15px;">📋 Violations by Type</h6>
          <div style="display: flex; flex-wrap: wrap; gap: 15px;">
      `;

      Object.entries(report.summary.byType).forEach(([type, count]) => {
        const emoji =
          type.includes("MIXING") || type.includes("CONTAMINATION")
            ? "🚨"
            : type.includes("STALE")
              ? "⏰"
              : type.includes("MISSING")
                ? "❓"
                : "ℹ️";
        const color =
          type.includes("MIXING") || type.includes("CONTAMINATION")
            ? "#dc3545"
            : type.includes("STALE")
              ? "#fd7e14"
              : type.includes("MISSING")
                ? "#ffc107"
                : "#6c757d";

        html += `
          <div style="background: white; padding: 12px 16px; border-radius: 6px; border-left: 4px solid ${color}; min-width: 150px;">
            <div style="font-size: 16px; font-weight: bold; color: ${color};">${emoji} ${count}</div>
            <div style="font-size: 11px; color: #666; margin-top: 2px;">${type.replace(/_/g, " ")}</div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    // Add compact violations table (machine-readable)
    if (report.violations && report.violations.length > 0) {
      html += `
        <div style="margin-bottom: 25px;">
          <h6 style="color: #495057; margin-bottom: 10px;">🔍 Violations (${report.violations.length} total)</h6>
          <div style="font-family: monospace; font-size: 10px; background: white; border: 1px solid #dee2e6; border-radius: 4px; padding: 10px; max-height: 400px; overflow-y: auto;">
      `;

      // Group violations by type for compact display
      const grouped = {};
      report.violations.forEach((v) => {
        if (!grouped[v.type]) grouped[v.type] = [];
        grouped[v.type].push(v);
      });

      Object.entries(grouped).forEach(([type, violations]) => {
        const typeColor =
          violations[0].severity === "error" ? "#dc3545" : "#fd7e14";
        html += `<div style="margin: 8px 0; padding: 6px; background: #f8f9fa; border-left: 3px solid ${typeColor};">`;
        html += `<strong style="color: ${typeColor};">${type} (${violations.length})</strong><br>`;

        violations.slice(0, 50).forEach((v) => {
          const caller = v.caller ? `, ${v.caller}` : "";
          const category = v.analysis?.category
            ? `[${v.analysis.category}]`
            : "";
          html += `${v.field}${category}${caller}; `;
        });

        if (violations.length > 50) {
          html += `<br><em>+${violations.length - 50} more (see copy section below for complete list)...</em>`;
        }
        html += `</div>`;
      });

      html += `</div></div>`;
    }

    // Add copy-paste section for Logs.md (always visible at bottom) - FULL REPORT
    const logsContent = `## QC Report ${new Date(report.timestamp).toLocaleDateString()}

**Summary**: ${report.summary.total} violations detected
**Types**: ${Object.entries(report.summary.byType)
      .map(([type, count]) => `${type}(${count})`)
      .join(", ")}
**Sections**: ${sectionTitle}
**Status**: QC monitoring ${report.monitoring.active ? "active" : "inactive"}, Mirror Target ${report.monitoring.mirrorTarget ? "enabled" : "disabled"}

### Violation Categories:
${generateCategoryBreakdown(report.violations)}

### All Violations (${report.violations.length} total):
${formatViolationsByType(report.violations)}`;

    html += `</div>`;

    return html;
  }

  /**
   * Format violations by type for concise reporting
   */
  function formatViolationsByType(violations) {
    // Group violations by type
    const groupedByType = {};
    violations.forEach((v) => {
      if (!groupedByType[v.type]) {
        groupedByType[v.type] = [];
      }
      groupedByType[v.type].push(v);
    });

    // Define type ordering and formatting
    const typeOrder = [
      "UNDEFINED_FIELD",
      "ORPHANED_REF_FIELD",
      "CALCULATION_FAILURE",
      "RACE_CONDITION",
      "CRITICAL_STALE_VALUE",
      "HIGH_TRAFFIC_STALE_VALUE",
      "MIRROR_TARGET_DIVERGENCE",
      "UPSTREAM_STALE_VALUE",
      "NORMAL_STALE_VALUE",
      "UNREGISTERED_FIELD",
      "EARLY_READ",
      "MISSING_VALUE",
      "FALLBACK_READ",
    ];

    const typeIcons = {
      UNDEFINED_FIELD: "🚫",
      ORPHANED_REF_FIELD: "🔗",
      CALCULATION_FAILURE: "💥",
      RACE_CONDITION: "⏱️",
      CRITICAL_STALE_VALUE: "🔥",
      HIGH_TRAFFIC_STALE_VALUE: "⚠️",
      MIRROR_TARGET_DIVERGENCE: "🎯",
      UPSTREAM_STALE_VALUE: "📤",
      NORMAL_STALE_VALUE: "💤",
      UNREGISTERED_FIELD: "📝",
      EARLY_READ: "ℹ️",
      MISSING_VALUE: "❓",
      FALLBACK_READ: "🔍",
    };

    let output = "";

    // Process violations in priority order
    typeOrder.forEach((type) => {
      const violationsOfType = groupedByType[type];
      if (!violationsOfType || violationsOfType.length === 0) return;

      const icon = typeIcons[type] || "•";
      const typeTitle = type.replace(/_/g, " ");

      output += `\n#### ${icon} **${typeTitle}** (${violationsOfType.length} violations)\n`;

      if (type === "MIRROR_TARGET_DIVERGENCE") {
        // Special handling for mirror target divergence - show field pairs
        const grouped = {};
        violationsOfType.forEach((v) => {
          const baseField = v.field.replace("ref_", "");
          if (!grouped[baseField]) grouped[baseField] = [];
          grouped[baseField].push(v);
        });

        Object.entries(grouped).forEach(([baseField, violations]) => {
          const sections = [
            ...new Set(
              violations.map((v) => identifyViolationSection(v.field)),
            ),
          ];
          output += `- **[${sections.join(",")}]** \`${baseField}\`: Reference vs Target divergence (${violations.length} instances)\n`;
        });
      } else if (
        type === "CRITICAL_STALE_VALUE" ||
        type === "HIGH_TRAFFIC_STALE_VALUE"
      ) {
        // Group by section for stale values
        const bySectionAndReason = {};
        violationsOfType.forEach((v) => {
          const section = identifyViolationSection(v.field);
          const reason =
            v.analysis?.recommendations?.[0] || "Check dependencies";
          const key = `${section}|${reason}`;
          if (!bySectionAndReason[key]) bySectionAndReason[key] = [];
          bySectionAndReason[key].push(v.field);
        });

        Object.entries(bySectionAndReason).forEach(([key, fields]) => {
          const [section, reason] = key.split("|");
          output += `- **[${section}]** ${fields.map((f) => `\`${f}\``).join(", ")} - ${reason}\n`;
        });
      } else {
        // Group by section for other types
        const bySection = {};
        violationsOfType.forEach((v) => {
          const section = identifyViolationSection(v.field);
          if (!bySection[section]) bySection[section] = [];
          bySection[section].push(v.field);
        });

        Object.entries(bySection).forEach(([section, fields]) => {
          if (fields.length > 10) {
            // For long lists, show first 10 and count
            output += `- **[${section}]** ${fields
              .slice(0, 10)
              .map((f) => `\`${f}\``)
              .join(", ")} ... and ${fields.length - 10} more\n`;
          } else {
            output += `- **[${section}]** ${fields.map((f) => `\`${f}\``).join(", ")}\n`;
          }
        });
      }
    });

    return output;
  }

  /**
   * Generate category breakdown for violation analysis
   */
  function generateCategoryBreakdown(violations) {
    const categoryMap = {
      undefined_field: "🚫 Undefined Fields (not defined anywhere)",
      orphaned_ref_field: "🔗 Orphaned Reference Fields (ref_ without base)",
      calculation_failure: "💥 Calculation Failures (never computed)",
      timing_race_condition: "⏱️ Race Conditions (timing issues)",
      early_initialization: "ℹ️ Early Reads (initialization phase)",
      unregistered_field:
        "📝 Unregistered Fields (defined but not in StateManager)",
      standard_missing: "❓ Standard Missing Values",
      critical_integration_stale:
        "🔥 Critical Integration Stale (affects data flow)",
      high_traffic_stale: "⚠️ High Traffic Stale (calculation issues)",
      upstream_stale: "📤 Upstream Stale (normal for input fields)",
      normal_stale: "💤 Normal Stale (low priority)",
    };

    const categoryCounts = {};
    violations.forEach((v) => {
      const category = v.analysis?.category || "unknown";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([category, count]) => {
        const description =
          categoryMap[category] || `${category} (unknown category)`;
        return `- **${description}**: ${count} violations`;
      })
      .join("\n");
  }

  /**
   * Identify which section a violation field belongs to
   */
  function identifyViolationSection(fieldId) {
    // Remove ref_ prefix for pattern matching
    const field = fieldId.replace("ref_", "");

    const sectionPatterns = {
      S01: /^[ehk]_[0-9]{1,2}$/,
      S02: /^[dh]_1[0-9]+$/,
      S03: /^[dhjlm]_2[0-9]+$/,
      S04: /^[dfgjk]_[23][0-9]+$/,
      S05: /^[ik]_[34][0-9]+$/,
      S06: /^[m]_4[0-9]+$/,
      S07: /^[jk]_[45][0-9]+$/,
      S08: /^[d]_5[0-9]+$/,
      S09: /^[dijk]_6[0-9]+$/,
      S10: /^[deim]_7[0-9]+$/,
      S11: /^[dfgi]_[89][0-9]+$/,
      S12: /^[di]_10[0-9]+$/,
      S13: /^[dfgjlm]_11[0-9]+$/,
      S14: /^[dhi]_12[0-9]+$/,
      S15: /^[dhl]_13[0-9]+$/,
    };

    // Debug pattern matching
    console.log(
      `[S18] Testing e_10 against S01 pattern: ${sectionPatterns["S01"].test("e_10")}`,
    );
    console.log(
      `[S18] Testing h_10 against S01 pattern: ${sectionPatterns["S01"].test("h_10")}`,
    );
    console.log(
      `[S18] Testing d_20 against S03 pattern: ${sectionPatterns["S03"].test("d_20")}`,
    );

    for (const [section, pattern] of Object.entries(sectionPatterns)) {
      if (pattern.test(field)) {
        return section;
      }
    }

    // Special cases for non-standard field IDs
    if (field.includes("s18_")) return "S18";
    if (field.length < 4) return "SYS"; // System fields

    return "UNK"; // Unknown section
  }

  /**
   * Update QC output field with HTML content
   */
  function updateQCOutput(htmlContent) {
    const outputField = document.querySelector(
      '[data-field-id="s18_qc_output"]',
    );
    if (outputField) {
      outputField.innerHTML = htmlContent;

      // Also store in StateManager for consistency
      if (window.TEUI?.StateManager) {
        window.TEUI.StateManager.setValue(
          "s18_qc_output",
          htmlContent,
          "calculated",
        );
      }
    }
  }

  /**
   * Create custom full-width layout for Section 18
   */
  function createCustomLayout() {
    const sectionContent = document.querySelector("#notes .section-content");
    if (!sectionContent) return;

    // Clear existing content
    sectionContent.innerHTML = "";

    // Create expandable full-width container
    const container = document.createElement("div");
    container.style.cssText = `
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
      margin: 10px 0;
      min-height: 100vh;
      box-sizing: border-box;
    `;

    // Notes section
    const notesSection = document.createElement("div");
    notesSection.style.cssText = "margin-bottom: 30px;";
    notesSection.innerHTML = `
      <h6 style="color: #495057; margin-bottom: 15px; border-bottom: 2px solid #dee2e6; padding-bottom: 8px;">
        📝 Project Notes
      </h6>
      <div 
        data-field-id="s18_notes" 
        contenteditable="true" 
        class="user-input notes-input"
        style="
          width: 100%;
          min-height: 100px;
          padding: 15px;
          background: white;
          border: 1px solid #ced4da;
          border-radius: 6px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.5;
          outline: none;
          resize: vertical;
        "
        placeholder="Enter project notes, observations, and calculations here..."
      >${userNotes || "Enter project notes here..."}</div>
    `;

    // QC Output section (expandable)
    const qcSection = document.createElement("div");
    qcSection.innerHTML = `
      <h6 style="color: #495057; margin-bottom: 15px; border-bottom: 2px solid #dee2e6; padding-bottom: 8px;">
        🔍 Quality Control Report
      </h6>
      <div 
        data-field-id="s18_qc_output"
        class="qc-output"
        style="
          width: 100%;
          min-height: 200px;
          background: white;
          border: 1px solid #ced4da;
          border-radius: 6px;
          padding: 0;
          overflow: visible;
          margin-bottom: 20px;
        "
      >
        <div style="padding: 20px; color: #6c757d; text-align: center; font-style: italic;">
          Click "Generate QC Report" to analyze state mixing and dependency violations
        </div>
      </div>
    `;

    container.appendChild(notesSection);
    container.appendChild(qcSection);
    sectionContent.appendChild(container);
  }

  /**
   * Show copy modal with QC report for clipboard
   */
  function showCopyModal(sectionFilter = "all") {
    if (!qcEnabled || !window.TEUI?.QCMonitor) {
      alert("QC Monitor not available. Enable QC monitoring first.");
      return;
    }

    // Generate fresh report
    const fullReport = window.TEUI.QCMonitor.generateQCReport();

    // Filter violations by section if specified
    let filteredReport = fullReport;
    if (sectionFilter !== "all") {
      filteredReport = filterReportBySection(fullReport, sectionFilter);
    }

    const sectionTitle =
      sectionFilter === "all" ? "All Sections" : sectionFilter;

    // Generate the copy content
    const logsContent = `## QC Report ${new Date(filteredReport.timestamp).toLocaleDateString()}

**Summary**: ${filteredReport.summary.total} violations detected
**Types**: ${Object.entries(filteredReport.summary.byType)
      .map(([type, count]) => `${type}(${count})`)
      .join(", ")}
**Sections**: ${sectionTitle}
**Status**: QC monitoring ${filteredReport.monitoring.active ? "active" : "inactive"}, Mirror Target ${filteredReport.monitoring.mirrorTarget ? "enabled" : "disabled"}

### Violation Categories:
${generateCategoryBreakdown(filteredReport.violations)}

### All Violations (${filteredReport.violations.length} total):
${formatViolationsByType(filteredReport.violations)}`;

    // Create modal
    createCopyModal(logsContent, sectionTitle);
  }

  /**
   * Create and show the copy modal
   */
  function createCopyModal(content, sectionTitle) {
    // Remove any existing modal
    const existingModal = document.getElementById("qc-copy-modal");
    if (existingModal) {
      existingModal.remove();
    }

    // Create modal overlay
    const modal = document.createElement("div");
    modal.id = "qc-copy-modal";
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10001;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 25px;
      max-width: 900px;
      max-height: 90vh;
      width: 100%;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      display: flex;
      flex-direction: column;
    `;

    modalContent.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #007bff;">
        <h5 style="margin: 0; color: #007bff; font-weight: bold;">📋 Copy QC Report for Logs.md</h5>
        <button 
          id="modal-close-btn"
          style="
            background: none; 
            border: none; 
            font-size: 24px; 
            cursor: pointer; 
            color: #666;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
          "
          title="Close modal"
        >×</button>
      </div>
      
      <div style="margin-bottom: 15px;">
        <strong>Section Filter:</strong> ${sectionTitle} | 
        <strong>Generated:</strong> ${new Date().toLocaleString()}
      </div>
      
      <textarea 
        id="modal-qc-textarea"
        style="
          width: 100%; 
          height: 600px; 
          font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; 
          font-size: 11px; 
          padding: 15px; 
          border: 1px solid #ced4da; 
          border-radius: 6px; 
          background: #f8f9fa;
          resize: vertical;
          overflow-y: auto;
          margin-bottom: 15px;
          flex: 1;
          min-height: 600px;
        " 
        readonly
      >${content}</textarea>
      
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="font-size: 12px; color: #666;">
          Click Copy to add this report to your clipboard for pasting into Logs.md
        </div>
        <button 
          id="modal-copy-btn"
          style="
            display: flex; 
            align-items: center; 
            gap: 8px; 
            padding: 10px 20px; 
            background: #28a745; 
            color: white; 
            border: none; 
            border-radius: 6px; 
            cursor: pointer; 
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 2px 4px rgba(40, 167, 69, 0.3);
          "
          title="Copy QC report to clipboard"
        >
          <i class="bi bi-clipboard" style="font-size: 16px;"></i>
          Copy to Clipboard
        </button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    // Add event listeners
    modal
      .querySelector("#modal-close-btn")
      .addEventListener("click", () => modal.remove());
    modal
      .querySelector("#modal-copy-btn")
      .addEventListener("click", () => copyFromModal());

    // Close on overlay click
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Close on Escape key
    const escapeHandler = (e) => {
      if (e.key === "Escape") {
        modal.remove();
        document.removeEventListener("keydown", escapeHandler);
      }
    };
    document.addEventListener("keydown", escapeHandler);
  }

  /**
   * Copy content from modal to clipboard
   */
  function copyFromModal() {
    const textarea = document.getElementById("modal-qc-textarea");
    if (!textarea) {
      console.error("[S18] Modal textarea not found");
      return;
    }

    // Copy to clipboard using modern API
    navigator.clipboard
      .writeText(textarea.value)
      .then(() => {
        showModalCopyConfirmation();
      })
      .catch((err) => {
        console.error("[S18] Failed to copy to clipboard:", err);
        // Fallback method
        textarea.select();
        document.execCommand("copy");
        showModalCopyConfirmation();
      });
  }

  /**
   * Show copy confirmation for modal
   */
  function showModalCopyConfirmation() {
    const copyBtn = document.getElementById("modal-copy-btn");
    if (!copyBtn) return;

    // Temporarily change button appearance
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML =
      '<i class="bi bi-check-circle-fill" style="font-size: 16px;"></i> Copied!';
    copyBtn.style.background = "#28a745";
    copyBtn.disabled = true;

    // Restore button after 2 seconds
    setTimeout(() => {
      if (copyBtn.parentNode) {
        copyBtn.innerHTML = originalText;
        copyBtn.style.background = "#28a745";
        copyBtn.disabled = false;
      }
    }, 2000);

    // Also close modal after successful copy
    setTimeout(() => {
      const modal = document.getElementById("qc-copy-modal");
      if (modal) {
        modal.style.transition = "opacity 0.3s ease-out";
        modal.style.opacity = "0";
        setTimeout(() => modal.remove(), 300);
      }
    }, 1500);
  }

  /**
   * Copy QC report to clipboard with confirmation (legacy function for S18 section)
   */
  function copyQCReportToClipboard() {
    const textarea = document.getElementById("qc-logs-textarea");
    if (!textarea) {
      console.error("[S18] QC logs textarea not found");
      return;
    }

    // Copy to clipboard using modern API
    navigator.clipboard
      .writeText(textarea.value)
      .then(() => {
        showCopyConfirmation();
      })
      .catch((err) => {
        console.error("[S18] Failed to copy to clipboard:", err);
        // Fallback method
        textarea.select();
        document.execCommand("copy");
        showCopyConfirmation();
      });
  }

  /**
   * Show copy confirmation modal
   */
  function showCopyConfirmation() {
    // Remove any existing confirmation
    const existingModal = document.getElementById("qc-copy-confirmation");
    if (existingModal) {
      existingModal.remove();
    }

    // Create lightweight confirmation modal
    const modal = document.createElement("div");
    modal.id = "qc-copy-confirmation";
    modal.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(40, 167, 69, 0.95);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    modal.innerHTML = `
      <i class="bi bi-check-circle-fill" style="font-size: 18px;"></i>
      QC Report copied to clipboard!
    `;

    document.body.appendChild(modal);

    // Auto-remove after 2 seconds with fade out
    setTimeout(() => {
      modal.style.transition = "opacity 0.3s ease-out";
      modal.style.opacity = "0";
      setTimeout(() => {
        if (modal.parentNode) {
          modal.remove();
        }
      }, 300);
    }, 2000);
  }

  /**
   * Section rendered callback
   */
  function onSectionRendered() {
    console.log("[S18] Notes section rendered");
    initialize();

    // Override Section 18 CSS to allow infinite expansion
    const notesSection = document.getElementById("notes");
    if (notesSection) {
      notesSection.style.maxHeight = "none";
      notesSection.style.height = "auto";
      notesSection.style.overflow = "visible";

      const sectionContent = notesSection.querySelector(".section-content");
      if (sectionContent) {
        sectionContent.style.maxHeight = "none";
        sectionContent.style.height = "auto";
        sectionContent.style.overflow = "visible";
      }
    }

    // Create custom layout instead of using table structure
    createCustomLayout();

    // Make copy function globally available for onclick handler
    window.copyQCReportToClipboard = copyQCReportToClipboard;
  }

  /**
   * Calculate all (triggers QC report if enabled)
   */
  function calculateAll() {
    // No calculations needed for Notes section
    // But we can use this as a hook for periodic QC checks
    if (qcEnabled && window.TEUI?.QCMonitor) {
      // Trigger a fresh QC report if monitoring is active
      setTimeout(() => {
        generateAndDisplayQCReport();
      }, 100);
    }
  }

  // Public API
  return {
    getFields,
    getDropdownOptions,
    getLayout,
    initializeEventHandlers,
    onSectionRendered,
    calculateAll,

    // QC-specific methods
    generateQCReport: generateAndDisplayQCReport,
    getLastReport: () => lastReport,
    isQCEnabled: () => qcEnabled,
    enableQCMonitoring,
    disableQCMonitoring,
  };
})();
