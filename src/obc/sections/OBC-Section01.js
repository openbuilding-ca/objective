/**
 * 4011-Section01.js
 * Building Information (Section 1) module for OBC Matrix
 *
 * This file contains field definitions, layout templates, and rendering logic
 * specific to the Building Information section for the OBC Matrix application.
 *
 * Restructured to match the OBC Matrix Part 3 structure with proper Notes fields.
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect01 = window.OBC.sect01 || {};
window.OBC.sect01.initialized = false;
window.OBC.sect01.userInteracted = false;

// Section 1: Building Information Module
window.OBC.SectionModules.sect01 = (function () {
  //==========================================================================
  // OAA MODE MANAGEMENT
  //==========================================================================

  // Mode state management
  let oaaMode = localStorage.getItem("oaa_mode") || "smart"; // 'smart' or 'manual'

  function getOAAMode() {
    return oaaMode;
  }

  function setOAAMode(mode) {
    oaaMode = mode;
    localStorage.setItem("oaa_mode", mode);
    updateFieldsForMode(mode);
    updateModeToggleUI(mode);

    // Clear smart mode functionality when switching to manual
    if (mode === "manual") {
      clearSmartModeData();
    }
  }

  function clearSmartModeData() {
    // Reset fields to default placeholder text (like other editable fields)
    const fieldsToReset = [
      { fieldId: "c_10", defaultText: "Enter OAA directory URL manually" },
      { fieldId: "c_11", defaultText: "In Good Standing" },
      { fieldId: "c_12", defaultText: "Enter license number manually" },
    ];

    fieldsToReset.forEach(({ fieldId, defaultText }) => {
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element) {
        element.textContent = defaultText;
        // Remove all smart mode classes and let graceful input system take over
        element.classList.remove(
          "validation-success",
          "validation-error",
          "validation-warning",
          "validation-pending",
          "auto-populated-text",
          "auto-populated-url",
          "oaa-validation-status",
          "oaa-license-number",
        );
        element.classList.add("editable", "user-input");
        // Remove manual-entry class to use standard graceful input styling
        element.classList.remove("manual-entry");
      }

      // Reset in StateManager to default state (not user-modified)
      if (window.OBC?.StateManager?.setValue) {
        window.OBC.StateManager.setValue(fieldId, defaultText, "default");
      }
    });
  }

  function updateFieldsForMode(mode) {
    const smartFields = ["c_10", "c_11", "c_12"];

    smartFields.forEach((fieldId) => {
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element) {
        if (mode === "manual") {
          // Make fields editable with standard graceful input behavior
          element.contentEditable = true;
          element.classList.add("editable", "user-input");
          element.classList.remove(
            "auto-populated-text",
            "auto-populated-url",
            "oaa-validation-status",
            "oaa-license-number",
            "manual-entry",
          );
          element.title = "Click to edit - Manual entry mode";
        } else {
          // Make fields auto-populated in smart mode (text-based, not numeric calculations)
          element.contentEditable = false;
          element.classList.remove("editable", "user-input", "manual-entry");
          element.classList.add("auto-populated-text"); // Use text-based styling, not calculated-value
          element.title = "Auto-populated by OAA lookup system";
        }
      }
    });
  }

  function updateModeToggleUI(mode) {
    const toggle = document.querySelector(".oaa-mode-toggle");
    if (toggle) {
      const smartBtn = toggle.querySelector(".mode-smart");
      const manualBtn = toggle.querySelector(".mode-manual");
      const indicator = toggle.querySelector(".mode-indicator");

      if (smartBtn && manualBtn && indicator) {
        if (mode === "smart") {
          smartBtn.classList.add("active");
          manualBtn.classList.remove("active");
          indicator.textContent = "🤖 Auto-complete and validation enabled";
        } else {
          smartBtn.classList.remove("active");
          manualBtn.classList.add("active");
          indicator.textContent = "✏️ Simple text entry mode";
        }
      }
    }
  }

  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // HEADER ROW
    header: {
      id: "INFO",
      rowId: "01-INFO",
      label: "Building Information Header",
      cells: {
        c: { content: "Field Name", classes: ["section-subheader"] },
        d: { content: "User Edited Details", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: { content: "", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
      },
    },

    // Row 3: Practice Information
    3: {
      id: "1.03", // Excel Row 03
      rowId: "1.03",
      label: "Name of Practice",
      cells: {
        c: { label: "Name of Practice" },
        d: {
          fieldId: "c_3", // Maps to Excel Column C
          type: "editable",
          value: "Enter practice name",
          section: "buildingInfo",
          placeholder: "Enter practice name",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 4: Address 1
    4: {
      id: "1.04", // Excel Row 04
      rowId: "1.04",
      label: "Address 1",
      cells: {
        c: { label: "Address 1" },
        d: {
          fieldId: "c_4", // Maps to Excel Column C
          type: "editable",
          value: "Enter address line 1",
          section: "buildingInfo",
          placeholder: "Enter address line 1",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 5: Address 2
    5: {
      id: "1.05", // Excel Row 05
      rowId: "1.05",
      label: "Address 2",
      cells: {
        c: { label: "Address 2" },
        d: {
          fieldId: "c_5", // Maps to Excel Column C
          type: "editable",
          value: "Enter address line 2",
          section: "buildingInfo",
          placeholder: "Enter address line 2",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 6: Contact
    6: {
      id: "1.06", // Excel Row 06
      rowId: "1.06",
      label: "Contact",
      cells: {
        c: { label: "Contact" },
        d: {
          fieldId: "c_6", // Maps to Excel Column C
          type: "editable",
          value: "Enter contact information",
          section: "buildingInfo",
          placeholder: "Enter contact information",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 7: Name of Project
    7: {
      id: "1.07", // Excel Row 07
      rowId: "1.07",
      label: "Name of Project",
      cells: {
        c: { label: "Name of Project" },
        d: {
          fieldId: "c_7", // Maps to Excel Column C
          type: "editable",
          value: "Enter project name",
          section: "buildingInfo",
          placeholder: "Enter project name",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 8: Location/Address
    8: {
      id: "1.08", // Excel Row 08
      rowId: "1.08",
      label: "Location/Address",
      cells: {
        c: { label: "Location/Address" },
        d: {
          fieldId: "c_8", // Maps to Excel Column C
          type: "editable",
          value: "Enter project location",
          section: "buildingInfo",
          placeholder: "Enter project location",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 9: Date with Seal & Signature
    9: {
      id: "1.09", // Excel Row 09
      rowId: "1.09",
      label: "Date",
      cells: {
        c: { label: "Date" },
        d: {
          fieldId: "c_9", // Maps to Excel Column C
          type: "editable",
          value: "Enter date",
          section: "buildingInfo",
          placeholder: "Enter date",
          classes: ["no-wrap"],
          colspan: 3, // Span columns D-F for date field
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 10: OAA Member Registration
    10: {
      id: "1.10", // Excel Row 10
      rowId: "1.10",
      label: "OAA Member Registration",
      cells: {
        c: { label: "OAA Member Registration" },
        d: {
          fieldId: "c_10", // Maps to Excel Column C
          type: "editable", // Always editable - mode switching handled by updateFieldsForMode
          value: "Enter OAA directory URL manually",
          section: "buildingInfo",
          placeholder: "Enter OAA directory URL manually",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 11: OAA Member Status
    11: {
      id: "1.11",
      rowId: "1.11",
      label: "OAA Member Status",
      cells: {
        c: { label: "OAA Member Status" },
        d: {
          fieldId: "c_11",
          type: "editable", // Always editable - mode switching handled by updateFieldsForMode
          value: "In Good Standing",
          section: "buildingInfo",
          placeholder: "In Good Standing",
          classes: ["no-wrap"],
          colspan: 11, // Span columns D-N for full width status text
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },

    // Row 12: License Number
    12: {
      id: "1.12",
      rowId: "1.12",
      label: "OAA License Number",
      cells: {
        c: { label: "OAA License Number" },
        d: {
          fieldId: "c_12",
          type: "editable", // Always editable - mode switching handled by updateFieldsForMode
          value: "Enter license number manually",
          section: "buildingInfo",
          placeholder: "Enter license number manually",
          classes: ["no-wrap"],
          colspan: 6, // Span columns D-I for consistent alignment
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
      },
    },
  };

  //==========================================================================
  // UTILITY FUNCTIONS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.keys(sectionRows).forEach((rowKey) => {
      const row = sectionRows[rowKey];
      Object.keys(row.cells).forEach((cellKey) => {
        const cell = row.cells[cellKey];
        if (cell.fieldId) {
          fields[cell.fieldId] = {
            type: cell.type,
            value: cell.value,
            section: cell.section,
            min: cell.min,
            max: cell.max,
            step: cell.step,
            options: cell.options,
            dropdownId: cell.dropdownId,
            classes: cell.classes,
            placeholder: cell.placeholder,
            colspan: cell.colspan,
            span: cell.span,
          };
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const dropdowns = {};
    Object.keys(sectionRows).forEach((rowKey) => {
      const row = sectionRows[rowKey];
      Object.keys(row.cells).forEach((cellKey) => {
        const cell = row.cells[cellKey];
        if (cell.type === "dropdown" && cell.options) {
          dropdowns[cell.dropdownId || cell.fieldId] = cell.options;
        }
      });
    });
    return dropdowns;
  }

  function getLayout() {
    // IMPORTANT: To ensure the header appears first, we process the rows in
    // a specific order: header first, then all other rows

    // Start with an empty array for rows
    const layoutRows = [];

    // First add the header row if it exists
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }

    // Then add all other rows in their original order, excluding the header
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header") {
        layoutRows.push(createLayoutRow(row));
      }
    });

    return { rows: layoutRows };
  }

  function createLayoutRow(row) {
    // Create standard row structure (DOM positions for rendering)
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A for padding
        {}, // ID column B (auto-populated)
      ],
    };

    // Add cells C through O based on the row definition (DOM rendering order)
    // Skip "b" since Column B is auto-populated by FieldManager
    const columns = [
      "c", // DOM Label column (Excel Column B)
      "d", // DOM User input column (maps to Excel C via fieldId)
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
    ];

    // For each column, add the cell definition if it exists in the row
    columns.forEach((col) => {
      if (row.cells && row.cells[col]) {
        // Create a simplified cell definition for the renderer
        // without the extra field properties
        const cell = { ...row.cells[col] };

        // No special handling needed - direct Excel column mapping

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        rowDef.cells.push({});
      }
    });

    return rowDef;
  }

  //==========================================================================
  // OAA VALIDATION FUNCTIONALITY
  //==========================================================================

  /**
   * Validates OAA member registration URL with cross-reference to practice name
   * @param {string} url - The OAA directory URL to validate
   * @returns {Promise<Object>} Validation result with status and details
   */
  async function validateOAAMembership(url) {
    try {
      // Basic URL validation
      if (!url || !url.trim()) {
        return {
          valid: false,
          status: "No URL provided",
          indicator: "❌",
          class: "validation-error",
        };
      }

      // Check if it's an OAA directory URL
      if (!url.includes("oaa.on.ca/oaa-directory")) {
        return {
          valid: false,
          status: "Invalid OAA directory URL format",
          indicator: "❌",
          class: "validation-error",
        };
      }

      // Show validation in progress
      updateValidationStatus(
        "Checking OAA member status and cross-referencing practice name...",
        "⏳",
        "validation-pending",
      );

      // Get practice name from row 1.03 for cross-validation
      const practiceName = getPracticeName();

      // Simulate OAA validation with practice name cross-reference
      return await simulateOAAValidation(url, practiceName);
    } catch (error) {
      console.error("OAA validation error:", error);
      return {
        valid: false,
        status: "Unable to verify OAA membership (network error)",
        indicator: "⚠️",
        class: "validation-warning",
      };
    }
  }

  /**
   * Gets the practice name from row 1.03 for cross-validation
   */
  function getPracticeName() {
    const practiceField = document.querySelector('[data-field-id="c_3"]');
    if (practiceField) {
      const practiceName =
        practiceField.textContent || practiceField.value || "";
      return practiceName.trim();
    }
    return "";
  }

  /**
   * OAA Directory Auto-Complete System
   */
  const OAALookup = {
    // Real OAA directory entries (in production, this would be API calls)
    directory: [
      {
        name: "Andrew Ross Thomson",
        firm: "Thomson Architecture, Inc.",
        url: "https://oaa.on.ca/oaa-directory/search-architects/search-architects-detail/Andrew-RossThomson-2",
        license: "8154",
        status: "Active",
      },
      {
        name: "Lara McKendrick",
        firm: "Lara McKendrick Architecture Inc.",
        url: "https://oaa.on.ca/oaa-directory/search-architects/search-architects-detail/Lara-J-McKendrick-2",
        license: "5829",
        status: "Active",
      },
      {
        name: "David Vincent Thompson",
        firm: "Independent Practice", // Real firm name not publicly available
        url: "https://oaa.on.ca/oaa-directory/search-architects/search-architects-detail/David-VincentThompson-2",
        license: "License number not publicly available", // OAA doesn't show license numbers on public pages
        status: "Active",
      },
    ],

    /**
     * Searches OAA directory by practice name or architect name (more restrictive)
     */
    search: async function (query) {
      if (!query || query.length < 2) return [];

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const searchTerm = query.toLowerCase().trim();

      // PRECISION-FIRST filtering - prevent false positives like "Tardis" → "Thomson"
      const results = this.directory.filter((record) => {
        const firmLower = record.firm.toLowerCase();
        const nameLower = record.name.toLowerCase();

        // Tier 1: EXACT substring match (highest confidence)
        if (firmLower.includes(searchTerm) || nameLower.includes(searchTerm)) {
          return true;
        }

        // Tier 2: EXACT word matches (high confidence)
        const queryWords = searchTerm.split(/\s+/).filter((w) => w.length > 2); // Require min 3 chars
        if (queryWords.length === 0) return false; // Reject very short queries

        const firmWords = firmLower.split(/\s+/);
        const nameWords = nameLower.split(/\s+/);
        const allWords = [...firmWords, ...nameWords];

        if (queryWords.length === 1) {
          // Single word - must START with the query (prevent "tard" matching "thomson")
          return allWords.some((word) => word.startsWith(queryWords[0]));
        } else {
          // Multi-word - require EXACT word matches, not substring includes
          const exactMatches = queryWords.filter((queryWord) =>
            allWords.some(
              (recordWord) =>
                // Exact match OR legitimate architectural abbreviations
                recordWord === queryWord ||
                recordWord.startsWith(queryWord) ||
                this.isLegitimateVariation(queryWord, recordWord),
            ),
          );

          // Require at least 70% exact matches (stricter than previous 50%)
          return exactMatches.length / queryWords.length >= 0.7;
        }
      });

      // Sort by relevance (exact firm matches first, then name matches)
      return results
        .sort((a, b) => {
          const aFirmExact = a.firm.toLowerCase().includes(searchTerm);
          const bFirmExact = b.firm.toLowerCase().includes(searchTerm);
          const aNameExact = a.name.toLowerCase().includes(searchTerm);
          const bNameExact = b.name.toLowerCase().includes(searchTerm);

          if (aFirmExact && !bFirmExact) return -1;
          if (bFirmExact && !aFirmExact) return 1;
          if (aNameExact && !bNameExact) return -1;
          if (bNameExact && !aNameExact) return 1;
          return 0;
        })
        .slice(0, 3); // Return top 3 most relevant matches
    },

    /**
     * Checks for legitimate architectural name/firm variations ONLY
     * Very restrictive to prevent false positives like "Tardis" → "Thomson"
     */
    isLegitimateVariation: function (queryWord, recordWord) {
      // Known name variations (architect names)
      const nameVariations = {
        andrew: ["andy"],
        andy: ["andrew"],
        thomson: ["thompson"],
        thompson: ["thomson"],
        mike: ["michael"],
        michael: ["mike"],
        rob: ["robert"],
        robert: ["rob"],
        dave: ["david"],
        david: ["dave"],
      };

      // Known firm type abbreviations
      const firmAbbreviations = {
        architecture: ["arch", "architects"],
        architects: ["arch", "architecture"],
        inc: ["incorporated"],
        incorporated: ["inc"],
        ltd: ["limited"],
        limited: ["ltd"],
      };

      // Check name variations
      if (nameVariations[queryWord]) {
        return nameVariations[queryWord].includes(recordWord);
      }

      // Check firm abbreviations
      if (firmAbbreviations[queryWord]) {
        return firmAbbreviations[queryWord].includes(recordWord);
      }

      return false; // No legitimate variation found
    },

    /**
     * Legacy fuzzy matching - DEPRECATED in favor of precision-first approach
     */
    fuzzyMatch: function (_text, _query) {
      // This function is now deprecated - precision-first matching used instead
      return false;
    },
  };

  /**
   * Simulates OAA validation based on URL pattern with practice name cross-validation
   * In production, this would call a backend service or OAA API
   */
  async function simulateOAAValidation(url, practiceName = "") {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Extract member name from URL for demo purposes
    const memberMatch = url.match(/\/([^/]+)$/);
    const memberName = memberMatch
      ? memberMatch[1].replace(/-/g, " ")
      : "Unknown";

    // Cross-reference logic - check if practice name relates to member name
    const nameMatch = checkNameCrossReference(memberName, practiceName);

    // Check if this URL matches one of our known architects
    const matchingRecord = OAALookup.directory.find(
      (record) =>
        url.includes(record.url.split("/").pop()) ||
        record.name.toLowerCase().includes(memberName.toLowerCase()) ||
        url === record.url,
    );

    if (matchingRecord) {
      // Real architect found in our directory
      const baseResult = {
        valid: true,
        indicator: "✅",
        class: "validation-success",
        memberName: matchingRecord.name,
        licenseStatus: matchingRecord.status,
        disciplineHistory: "No Discipline History",
        licenseNumber: matchingRecord.license,
      };

      // Enhance status based on name cross-reference
      if (nameMatch.isMatch) {
        baseResult.status = `✅ OAA Member "${matchingRecord.name}" is ${matchingRecord.status} and in Good Standing${nameMatch.confidence > 0.8 ? " | Practice name verified" : " | Practice name likely match"}`;
      } else if (practiceName) {
        baseResult.status = `✅ OAA Member "${matchingRecord.name}" is ${matchingRecord.status} and in Good Standing | Practice name "${practiceName}" - verify alignment`;
        baseResult.class = "validation-warning"; // Yellow for name mismatch
        baseResult.indicator = "⚠️";
      } else {
        baseResult.status = `✅ OAA Member "${matchingRecord.name}" is ${matchingRecord.status} and in Good Standing`;
      }

      return baseResult;
    } else {
      // URL doesn't match our known architects - record not found
      return {
        valid: null, // null indicates indeterminate status
        status: "⚠️ Record Not Found - Unable to verify OAA membership status",
        indicator: "⚠️",
        class: "validation-warning",
        note: "Cannot verify - record not accessible or URL incorrect",
      };
    }
  }

  /**
   * Cross-references member name with practice name for validation
   */
  function checkNameCrossReference(memberName, practiceName) {
    if (!practiceName || !memberName) {
      return { isMatch: false, confidence: 0, reason: "Missing information" };
    }

    const memberWords = memberName
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((w) => w.length > 1);
    const practiceWords = practiceName
      .toLowerCase()
      .split(/[\s\-_]+/)
      .filter((w) => w.length > 1);

    // Check for direct name matches
    let matchCount = 0;
    let totalWords = memberWords.length;

    memberWords.forEach((memberWord) => {
      if (
        practiceWords.some(
          (practiceWord) =>
            practiceWord.includes(memberWord) ||
            memberWord.includes(practiceWord) ||
            // Handle common name variations
            (memberWord === "andrew" && practiceWord.includes("andy")) ||
            (memberWord === "andy" && practiceWord.includes("andrew")),
        )
      ) {
        matchCount++;
      }
    });

    const confidence = matchCount / totalWords;

    return {
      isMatch: confidence >= 0.5, // 50% of name words must match
      confidence: confidence,
      matchCount: matchCount,
      reason:
        confidence >= 0.5
          ? "Name components match"
          : "Insufficient name overlap",
    };
  }

  /**
   * Generates cross-referenced status message
   */
  function _generateCrossReferencedStatus(
    memberName,
    practiceName,
    nameMatch,
    validationType,
  ) {
    const baseStatus =
      validationType === "success"
        ? `✅ OAA Member "${memberName}" is Active and in Good Standing`
        : `❌ Member "${memberName}" shows issues`;

    if (!practiceName) {
      return baseStatus;
    }

    if (nameMatch.isMatch) {
      const confidenceText =
        nameMatch.confidence > 0.8 ? "verified" : "likely match";
      return `${baseStatus} | Practice name ${confidenceText}`;
    } else {
      return `${baseStatus} | Practice name "${practiceName}" - verify alignment`;
    }
  }

  /**
   * Updates the validation status display
   */
  function updateValidationStatus(
    statusText,
    indicator,
    cssClass,
    licenseNumber = null,
  ) {
    // Update status text (indicator icon is now embedded in statusText)
    const statusField = document.querySelector('[data-field-id="c_11"]');
    if (statusField) {
      statusField.textContent = statusText;
      statusField.className = `oaa-validation-status ${cssClass}`;
    }

    // Update license number if provided
    const licenseField = document.querySelector('[data-field-id="c_12"]');
    if (licenseField && licenseNumber) {
      licenseField.textContent = `License: ${licenseNumber}`;
    } else if (
      licenseField &&
      !licenseNumber &&
      cssClass === "validation-error"
    ) {
      licenseField.textContent = "License information unavailable";
    }

    // Update state manager (these are auto-populated text, not calculations)
    if (window.OBC?.StateManager?.setValue) {
      window.OBC.StateManager.setValue("c_11", statusText, "auto-populated");
      if (licenseNumber) {
        window.OBC.StateManager.setValue(
          "c_12",
          `License: ${licenseNumber}`,
          "auto-populated",
        );
      }
    }
  }

  /**
   * Performs OAA lookup based on practice/firm name and auto-populates fields
   */
  async function performOAALookup() {
    const practiceField = document.querySelector('[data-field-id="c_3"]');
    const urlField = document.querySelector('[data-field-id="c_10"]');
    const _statusField = document.querySelector('[data-field-id="c_11"]');
    const licenseField = document.querySelector('[data-field-id="c_12"]');

    if (!practiceField || !urlField) return;

    const query = practiceField.textContent.trim();
    if (!query || query.length < 2) {
      updateValidationStatus(
        "Enter practice or architect name to begin lookup",
        "⚪",
        "validation-empty",
      );
      return;
    }

    // Show lookup in progress
    updateValidationStatus(
      "🔍 Searching OAA directory...",
      "⏳",
      "validation-pending",
    );

    try {
      // Search OAA directory
      const results = await OAALookup.search(query);

      if (results.length === 0) {
        updateValidationStatus(
          "❌ No OAA member found matching this name/firm",
          "❌",
          "validation-error",
        );
        urlField.textContent = "No OAA record found";
        if (licenseField) {
          licenseField.textContent = "No license information available";
        }
        return;
      }

      // Take the best match (first result)
      const bestMatch = results[0];

      // Auto-populate the URL field
      urlField.textContent = bestMatch.url;

      // Auto-populate license field
      if (licenseField) {
        licenseField.textContent = `License: ${bestMatch.license}`;
      }

      // Update state manager
      if (window.OBC?.StateManager?.setValue) {
        window.OBC.StateManager.setValue(
          "c_10",
          bestMatch.url,
          "auto-populated",
        );
        window.OBC.StateManager.setValue(
          "c_12",
          `License: ${bestMatch.license}`,
          "auto-populated",
        );
      }

      // Now validate the found member
      const validationResult = await validateOAAMembership(bestMatch.url);

      // Add demo data disclaimer to the validation status
      let statusWithDisclaimer = validationResult.status;
      if (validationResult.valid) {
        statusWithDisclaimer +=
          " | ⚠️ Demo data - verify details with official OAA directory";
      }

      updateValidationStatus(
        statusWithDisclaimer,
        validationResult.indicator,
        validationResult.class,
        validationResult.licenseNumber,
      );
      updateClickableURL(urlField, validationResult.valid);
    } catch (error) {
      console.error("OAA lookup error:", error);
      updateValidationStatus(
        "⚠️ Error performing OAA lookup - please try again",
        "⚠️",
        "validation-warning",
      );
    }
  }

  /**
   * Auto-complete and validation system setup
   * Includes protection against multiple initializations
   */
  function setupOAAValidation() {
    // Only setup smart mode functionality if in smart mode
    if (getOAAMode() !== "smart") {
      return;
    }

    const urlField = document.querySelector('[data-field-id="c_10"]');
    const practiceField = document.querySelector('[data-field-id="c_3"]');

    // Prevent multiple initializations
    if (urlField && urlField._oaaValidationInitialized) {
      return; // Already initialized
    }

    if (!urlField) return;

    // Setup auto-complete for practice name field
    if (practiceField) {
      setupAutoComplete(practiceField, urlField);
    }

    // Setup clickable URL functionality
    setupClickableURL(urlField);

    // Practice name field event listeners - primary lookup trigger
    if (practiceField) {
      let lookupTimeout;

      // Trigger lookup on Enter key
      practiceField.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && getOAAMode() === "smart") {
          clearTimeout(lookupTimeout);
          setTimeout(() => {
            performOAALookup();
          }, 100);
        }
      });

      // Also trigger lookup on blur (when user leaves field)
      practiceField.addEventListener("blur", () => {
        if (getOAAMode() === "smart") {
          clearTimeout(lookupTimeout);
          lookupTimeout = setTimeout(() => {
            performOAALookup();
          }, 1000); // 1 second debounce
        }
      });
    }

    // URL field event listeners (for manual URL entry)
    urlField.addEventListener("blur", async () => {
      if (getOAAMode() === "smart") {
        const url = urlField.textContent || urlField.value || "";
        if (url.trim() && url.includes("oaa.on.ca")) {
          const result = await validateOAAMembership(url.trim());
          updateValidationStatus(
            result.status,
            result.indicator,
            result.class,
            result.licenseNumber,
          );
          updateClickableURL(urlField, result.valid);
        }
      }
    });

    // Initial validation - start clean with helpful instruction
    setTimeout(() => {
      if (getOAAMode() === "smart") {
        updateValidationStatus(
          "Enter practice name in row 1.03 and press Enter to search OAA directory and view auto-complete options",
          "⚪",
          "validation-empty",
        );
      }
    }, 500);

    // Mark as initialized to prevent duplicate setup
    if (urlField) {
      urlField._oaaValidationInitialized = true;
    }
  }

  function addModeToggleToHeader() {
    // Check if toggle already exists
    if (document.querySelector(".oaa-mode-toggle")) {
      return true; // Already exists
    }

    // Find the Section 01 title span
    const titleSpan = document.querySelector("#section-01-title");
    if (!titleSpan) {
      return false;
    }

    // Create the toggle container
    const toggleContainer = document.createElement("div");
    toggleContainer.className = "oaa-mode-toggle";
    toggleContainer.innerHTML = `
      <div class="toggle-wrapper">
        <span class="toggle-label">OAA Mode:</span>
        <button class="mode-btn mode-smart ${getOAAMode() === "smart" ? "active" : ""}" data-mode="smart">🤖 Smart</button>
        <button class="mode-btn mode-manual ${getOAAMode() === "manual" ? "active" : ""}" data-mode="manual">✏️ Manual</button>
        <div class="mode-indicator">${getOAAMode() === "smart" ? "🤖 Auto-complete and validation enabled" : "✏️ Simple text entry mode"}</div>
      </div>
    `;

    // Insert the toggle right after the title span
    titleSpan.insertAdjacentElement("afterend", toggleContainer);
    return true;
  }

  function setupModeToggle() {
    // Setup event listeners for mode toggle buttons
    document.addEventListener("click", function (e) {
      if (e.target.classList.contains("mode-btn")) {
        const newMode = e.target.getAttribute("data-mode");
        if (newMode && newMode !== getOAAMode()) {
          setOAAMode(newMode);

          // Re-initialize appropriate functionality
          if (newMode === "smart") {
            setupOAAValidation();
          }
        }
      }
    });
  }

  /**
   * Sets up auto-complete functionality for practice name field
   * Auto-complete dropdown now only triggers on Enter key press (not while typing)
   */
  function setupAutoComplete(practiceField, urlField) {
    let searchTimeout;
    let autocompleteContainer;

    // Create autocomplete dropdown container
    function createAutocompleteContainer() {
      if (autocompleteContainer) return autocompleteContainer;

      autocompleteContainer = document.createElement("div");
      autocompleteContainer.className = "oaa-autocomplete-dropdown";
      autocompleteContainer.style.display = "none";

      // Position relative to practice field - ensure proper containment
      const practiceCell = practiceField.closest("td");
      if (practiceCell) {
        practiceCell.style.position = "relative";
        practiceCell.style.overflow = "visible"; // Allow dropdown to show

        // Ensure dropdown appears OUTSIDE the practice field
        autocompleteContainer.style.position = "absolute";
        autocompleteContainer.style.top = "100%";
        autocompleteContainer.style.left = "0";
        autocompleteContainer.style.zIndex = "1001";

        practiceCell.appendChild(autocompleteContainer);
      }

      return autocompleteContainer;
    }

    // Show suggestions
    async function showSuggestions(query) {
      if (!query || query.length < 2) {
        hideAutocomplete();
        return;
      }

      const results = await OAALookup.search(query);
      const container = createAutocompleteContainer();

      if (results.length === 0) {
        hideAutocomplete();
        return;
      }

      // Build suggestions HTML - clean dropdown presentation with demo data warning
      const suggestionsHTML = results
        .map(
          (result) => `
         <div class="autocomplete-item" data-url="${result.url}" data-firm="${result.firm}" data-name="${result.name}" data-license="${result.license}">
           <div class="autocomplete-firm">${result.firm}</div>
           <div class="autocomplete-architect">${result.name} (License: ${result.license})</div>
           <div class="autocomplete-status ${result.status.toLowerCase()}">${result.status}</div>
         </div>
       `,
        )
        .join("");

      // Add demo data disclaimer
      container.innerHTML =
        suggestionsHTML +
        `<div class="autocomplete-disclaimer">⚠️ Demo data - verify with official OAA directory</div>`;

      // Add click handlers
      container.querySelectorAll(".autocomplete-item").forEach((item) => {
        item.addEventListener("click", () => {
          const selectedURL = item.dataset.url;
          const selectedFirm = item.dataset.firm;
          const selectedArchitect = item.querySelector(
            ".autocomplete-architect",
          ).textContent;

          // Extract license number from architect text (e.g., "John Smith (License: 1234)")
          const licenseMatch = selectedArchitect.match(/License:\s*(.+?)\)/);
          const licenseNumber = licenseMatch ? licenseMatch[1] : "Unknown";

          // Clean populate each field separately - ONLY the selected firm name
          practiceField.textContent = selectedFirm; // Only the clean firm name
          practiceField.innerHTML = ""; // Clear any HTML content
          practiceField.textContent = selectedFirm; // Set clean text again

          urlField.textContent = selectedURL;

          // Populate license number in new row 1.12
          const licenseField = document.querySelector('[data-field-id="c_12"]');
          if (licenseField) {
            licenseField.textContent = `License: ${licenseNumber}`;
          }

          // Update state manager with clean values - ONLY the firm name
          if (window.OBC?.StateManager?.setValue) {
            window.OBC.StateManager.setValue(
              "c_3",
              selectedFirm,
              "user-modified",
            );
            window.OBC.StateManager.setValue(
              "c_10",
              selectedURL,
              "user-modified",
            );
            window.OBC.StateManager.setValue(
              "c_12",
              `License: ${licenseNumber}`,
              "calculated",
            );
          }

          // Trigger validation
          validateOAAMembership(selectedURL).then((result) => {
            updateValidationStatus(
              result.status,
              result.indicator,
              result.class,
              result.licenseNumber,
            );
            updateClickableURL(urlField, result.valid);
          });

          hideAutocomplete();
        });
      });

      container.style.display = "block";
    }

    // Hide autocomplete
    function hideAutocomplete() {
      if (autocompleteContainer) {
        autocompleteContainer.style.display = "none";
      }
    }

    // Practice field event listeners - DISABLED auto-complete on typing
    // Auto-complete dropdown is now DISABLED - search only triggers on Enter key
    // (as configured in setupOAAValidation function)

    // Optional: Add keypress listener for auto-complete on Enter (same as OAA lookup)
    practiceField.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        clearTimeout(searchTimeout);
        const query = this.textContent.trim();
        if (query.length >= 2 && query.length <= 50) {
          showSuggestions(query);
        }
      }
    });

    // Ensure practice field stays clean - periodic cleanup
    setInterval(() => {
      const currentContent = practiceField.textContent.trim();
      // If content looks corrupted (too long or contains dropdown data), clean it
      if (
        currentContent.length > 100 ||
        currentContent.includes("License:") ||
        currentContent.includes("Active")
      ) {
        const firmNames = [
          "Thomson Architecture, Inc.",
          "Lara McKendrick Architecture Inc.",
          "Independent Practice",
        ];
        const matchedFirm = firmNames.find((firm) =>
          currentContent.includes(firm),
        );
        if (matchedFirm) {
          practiceField.textContent = matchedFirm; // Clean it up
        }
      }
    }, 1000); // Check every second for corruption

    // Hide autocomplete when clicking outside
    document.addEventListener("click", function (e) {
      if (
        !practiceField.contains(e.target) &&
        !autocompleteContainer?.contains(e.target)
      ) {
        hideAutocomplete();
      }
    });
  }

  /**
   * Makes URL field clickable when valid
   * Prevents multiple event listeners by removing existing ones first
   */
  function setupClickableURL(urlField) {
    // Remove any existing click listener to prevent multiple tabs
    if (urlField._oaaClickHandler) {
      urlField.removeEventListener("click", urlField._oaaClickHandler);
    }

    // Create the click handler function
    const clickHandler = function (e) {
      const url = this.textContent || this.value || "";
      if (
        url.trim() &&
        url.includes("oaa.on.ca") &&
        this.classList.contains("clickable-url")
      ) {
        e.preventDefault();
        window.open(url.trim(), "_blank", "noopener,noreferrer");
      }
    };

    // Store reference to handler for future removal
    urlField._oaaClickHandler = clickHandler;

    // Add the click listener
    urlField.addEventListener("click", clickHandler);
  }

  /**
   * Updates URL field clickable state based on validation
   */
  function updateClickableURL(urlField, isValid) {
    if (isValid) {
      urlField.classList.add("clickable-url");
      urlField.title = "Click to open OAA member page in new tab";
      urlField.style.cursor = "pointer";
    } else {
      urlField.classList.remove("clickable-url");
      urlField.title = "";
      urlField.style.cursor = "text";
    }
  }

  //==========================================================================
  // STATE MANAGEMENT
  //==========================================================================

  function getFieldValue(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return "";

    if (field.type === "checkbox") {
      return field.checked;
    } else if (field.type === "number" || field.type === "range") {
      return parseFloat(field.value) || 0;
    } else {
      return field.value || "";
    }
  }

  function getNumericValue(fieldId, defaultValue = 0) {
    const value = getFieldValue(fieldId);
    const numericValue = parseFloat(value);
    return isNaN(numericValue) ? defaultValue : numericValue;
  }

  function setCalculatedValue(fieldId, value) {
    const element = document.getElementById(fieldId);
    if (element) {
      if (typeof value === "number") {
        element.textContent = value.toLocaleString(undefined, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        });
      } else {
        element.textContent = value;
      }
    }
  }

  //==========================================================================
  // FLOATING STAMP UPLOAD FUNCTIONALITY
  //==========================================================================

  //==========================================================================
  // EVENT HANDLERS
  //==========================================================================

  function initializeEventHandlers() {
    // Initializing Section 01 event handlers

    // ✅ MANDATORY: Use global input handler for graceful behavior
    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }

    // Setup mode toggle functionality
    setupModeToggle();

    window.OBC.sect01.initialized = true;
  }

  function addFloatingStampUpload() {
    const sectionContent = document.querySelector(
      '[data-render-section="buildingInfo"]',
    );
    if (!sectionContent || document.getElementById("floating-stamp-upload"))
      return;

    // Create floating stamp upload container
    const stampContainer = document.createElement("div");
    stampContainer.id = "floating-stamp-upload";
    stampContainer.innerHTML = `
      <div class="stamp-upload-container">
        <div class="stamp-placeholder" id="floating-stamp-placeholder">
          <div class="stamp-title">Seal & Signature</div>
          <div class="stamp-instructions">Upload Seal Image Here</div>
          <div class="stamp-hint">200x200px recommended</div>
          <div class="stamp-oaa-note">The stamp image will be inspected for validity with the OAA</div>
        </div>
        <input type="file" id="floating-stamp-upload-input" accept="image/*" style="display: none;">
        <img id="floating-stamp-preview" class="stamp-preview" style="display: none;">
      </div>
    `;

    // Add CSS for floating positioning
    stampContainer.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      z-index: 10;
      background: white;
      width: 200px;
    `;

    // Position relative to section
    sectionContent.style.position = "relative";
    sectionContent.appendChild(stampContainer);

    // Initialize stamp upload functionality on the floating element
    initializeFloatingStampUpload();
  }

  function initializeFloatingStampUpload() {
    const placeholder = document.getElementById("floating-stamp-placeholder");
    const fileInput = document.getElementById("floating-stamp-upload-input");
    const preview = document.getElementById("floating-stamp-preview");

    if (!placeholder || !fileInput || !preview) return;

    placeholder.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          preview.src = e.target.result;
          preview.style.display = "block";
          placeholder.style.display = "none";
        };
        reader.readAsDataURL(file);
      }
    });

    // Allow reset by clicking on the preview
    preview.addEventListener("click", () => {
      preview.style.display = "none";
      placeholder.style.display = "flex";
      fileInput.value = "";
    });
  }

  function onSectionRendered() {
    // Initialize any section-specific functionality after rendering
    if (!window.OBC.sect01.initialized) {
      initializeEventHandlers();
    }

    // Add floating stamp upload after section renders
    addFloatingStampUpload();

    // Add mode toggle to header and setup fields based on current mode
    if (addModeToggleToHeader()) {
      updateFieldsForMode(getOAAMode());
      updateModeToggleUI(getOAAMode());

      // Only setup OAA validation in smart mode
      if (getOAAMode() === "smart") {
        setupOAAValidation();
      }
    }

    // Add custom CSS for stamp upload, Section 01 spacing, and OAA Mode Toggle
    if (!document.getElementById("stamp-upload-styles")) {
      const style = document.createElement("style");
      style.id = "stamp-upload-styles";
      style.textContent = `
        /* Section 01 specific row spacing for stamp panel breathing room */
        [data-render-section="buildingInfo"] .row {
          padding-top: 2px;
          padding-bottom: 2px;
        }

        /* OAA Mode Toggle Styling - Inline with Title */
        .oaa-mode-toggle {
          display: inline-flex;
          align-items: center;
          margin-left: 20px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          vertical-align: middle;
        }
        
        .toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: nowrap;
        }
        
        .toggle-label {
          font-size: 12px;
          font-weight: 600;
          color: white;
          margin-right: 6px;
          white-space: nowrap;
        }
        
        .mode-btn {
          padding: 3px 8px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          cursor: pointer;
          font-size: 10px;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .mode-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.5);
        }
        
        .mode-btn.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }
        
        .mode-indicator {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.8);
          font-style: italic;
          margin-left: 6px;
          white-space: nowrap;
        }
        
        /* Ensure section header has proper flex layout for inline toggle */
        #buildingInfo .section-header {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        /* Make sure title and toggle stay on same line */
        #section-01-title {
          flex-shrink: 0;
        }



        /* Auto-populated text styling (left-aligned, not numeric) */
        .auto-populated-text {
          font-weight: 500;
          color: var(--calculated-value-color);
          text-align: left !important; /* Override universal right-alignment for calculated values */
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 8px 12px;
        }

        /* Ensure OAA fields remain left-aligned even when auto-populated */
        [data-field-id="c_10"],
        [data-field-id="c_11"], 
        [data-field-id="c_12"] {
          text-align: left !important; /* Force left alignment for all OAA fields */
        }

        /* OAA Validation Status Styling */
        .oaa-validation-status {
          font-size: 14px;
          font-weight: 500;
          padding: 8px 12px;
          border-radius: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.4;
          min-height: 20px;
          display: flex;
          align-items: center;
        }

        /* Success State - Green */
        .validation-success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        /* Error State - Red */
        .validation-error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        /* Warning State - Yellow */
        .validation-warning {
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        /* Pending State - Blue */
        .validation-pending {
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        /* Empty State - Gray */
        .validation-empty {
          background-color: #f8f9fa;
          color: #6c757d;
          border: 1px solid #dee2e6;
        }

        /* Auto-complete Dropdown Styling */
        .oaa-autocomplete-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
        }

        .autocomplete-item {
          padding: 12px 16px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .autocomplete-item:hover {
          background-color: #f8f9fa;
        }

        .autocomplete-item:last-child {
          border-bottom: none;
        }

        .autocomplete-firm {
          font-weight: 600;
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }

        .autocomplete-architect {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }

        .autocomplete-status {
          font-size: 11px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 3px;
          display: inline-block;
        }

        .autocomplete-status.active {
          background-color: #d4edda;
          color: #155724;
        }

        .autocomplete-status.inactive {
          background-color: #f8d7da;
          color: #721c24;
        }

        .autocomplete-disclaimer {
          background-color: #fff3cd;
          color: #856404;
          font-size: 11px;
          padding: 8px 16px;
          text-align: center;
          border-top: 1px solid #ffeaa7;
          font-style: italic;
        }

        /* Clickable URL Styling */
        .clickable-url {
          color: #007bff !important;
          text-decoration: underline !important;
          cursor: pointer !important;
        }

        .clickable-url:hover {
          color: #0056b3 !important;
          background-color: #f8f9fa !important;
        }

        /* Practice field styling to indicate auto-complete availability */
        [data-field-id="c_3"] {
          position: relative;
        }

        [data-field-id="c_3"]:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        /* License number field styling */
        .oaa-license-number {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          padding: 8px 12px;
          background-color: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          text-align: left !important; /* Override calculated-value right alignment */
        }

        /* Auto-populated URL field styling */
        .auto-populated-url {
          text-align: left !important; /* Override calculated-value right alignment */
        }

        .stamp-upload-container {
          width: 200px;
          height: 200px;
          position: relative;
          margin: 0;
        }

        .stamp-placeholder {
          width: 200px;
          height: 200px;
          border: 2px dashed #ccc;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: border-color 0.3s ease;
          background-color: white;
          padding: 8px;
          box-sizing: border-box;
        }

        .stamp-placeholder:hover {
          border-color: #007bff;
          background-color: #f0f8ff;
        }

        .stamp-title {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          text-align: center;
          margin-bottom: 8px;
        }

        .stamp-instructions {
          font-size: 12px;
          color: #666;
          text-align: center;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .stamp-hint {
          font-size: 10px;
          color: #999;
          text-align: center;
          margin-bottom: 4px;
        }

        .stamp-oaa-note {
          font-size: 9px;
          color: #666;
          text-align: center;
          font-style: italic;
          line-height: 1.2;
        }

        .stamp-preview {
          width: 200px;
          height: 200px;
          object-fit: contain;
          border-radius: 8px;
          cursor: pointer;
          border: 2px solid #ddd;
          background-color: white;
        }

        #floating-stamp-upload {
          transition: opacity 0.3s ease;
        }

        body.notes-hidden #floating-stamp-upload {
          /* Keep stamp visible when notes are hidden */
        }
      `;
      document.head.appendChild(style);
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    onSectionRendered: onSectionRendered,

    // State management functions
    getFieldValue: getFieldValue,
    getNumericValue: getNumericValue,
    setCalculatedValue: setCalculatedValue,

    // OAA Mode management functions
    getOAAMode: getOAAMode,
    setOAAMode: setOAAMode,
  };
})();
