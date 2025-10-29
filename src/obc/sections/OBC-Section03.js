/**
 * 4011-Section03.js
 * Building Areas (Section 3) module for OBC Matrix
 *
 * This file contains field definitions, layout templates, and rendering logic
 * specific to the Building Areas section for the OBC Matrix application.
 *
 * Based on OBC Matrix Part 3 structure covering rows 21-39 with user inputs in column D.
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect03 = window.OBC.sect03 || {};
window.OBC.sect03.initialized = false;
window.OBC.sect03.userInteracted = false;

// Section 3: Building Areas Module
window.OBC.SectionModules.sect03 = (function () {
  //==========================================================================
  // CONSOLIDATED FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define shared mezzanine type options
  const mezzanineOptions = [
    { value: "Select applicable", name: "Select applicable" },
    { value: "N/A", name: "N/A" },
    { value: "≤10% Mezzanine", name: "≤10% Mezzanine" },
    { value: "≤40% Mezzanine", name: "≤40% Mezzanine" },
  ];

  // Define rows with integrated field definitions
  const sectionRows = {
    // HEADER ROW - 3.04 Building Area
    header: {
      id: "3.04",
      rowId: "3.04",
      label: "Building Areas Header",
      cells: {
        b: { label: "3.04" },
        c: { label: "BUILDING AREA (m²)", classes: ["section-subheader"] },
        d: { content: "BUILDING AREA (m²)", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "EXISTING", classes: ["section-subheader"] },
        j: { content: "NEW", classes: ["section-subheader"] },
        k: { content: "TOTAL", classes: ["section-subheader"] },
        l: { content: "OBC [A] 1.4.1.2.", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 3.22: Building Area Row 1
    3.22: {
      id: "3.22",
      rowId: "3.22",
      label: "",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "building-areas",
            "data-expandable-rows": "3.23,3.24",
            "data-default-visible": "1",
          },
        },
        b: { content: "22" },
        c: { content: "" },
        d: {
          fieldId: "d_22",
          type: "editable",
          value: "Enter area description",
          section: "buildingAreas",
          classes: ["no-wrap", "user-input"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_22",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_22",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_22",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_22",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column", "user-input"],
        },
      },
    },

    // Row 3.23: Building Area Row 2
    3.23: {
      id: "3.23",
      rowId: "3.23",
      label: "",
      cells: {
        b: { content: "23" },
        c: { content: "" },
        d: {
          fieldId: "d_23",
          type: "editable",
          value: "Enter area description",
          section: "buildingAreas",
          classes: ["no-wrap", "user-input"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_23",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_23",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_23",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_23",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column", "user-input"],
        },
      },
    },

    // Row 3.24: Building Area Row 3
    3.24: {
      id: "3.24",
      rowId: "3.24",
      label: "",
      cells: {
        b: { content: "24" },
        c: { content: "" },
        d: {
          fieldId: "d_24",
          type: "editable",
          value: "Enter area description",
          section: "buildingAreas",
          classes: ["no-wrap", "user-input"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_24",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_24",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_24",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_24",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column", "user-input"],
        },
      },
    },

    // Row 3.25: Building Area Total
    3.25: {
      id: "3.25",
      rowId: "3.25",
      label: "",
      cells: {
        b: { content: "25" },
        c: { content: "" },
        d: { content: "TOTAL" },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_25",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        j: {
          fieldId: "j_25",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        k: {
          fieldId: "k_25",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_25",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column", "user-input"],
        },
      },
    },

    // Row 3.26: Gross Area Header
    3.26: {
      id: "3.26",
      rowId: "3.26",
      label: "GROSS AREA (m²)",
      cells: {
        b: { label: "3.05" },
        c: { content: "GROSS AREA (m²)", classes: ["section-subheader"] },
        d: { content: "GROSS AREA (m²)", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "EXISTING", classes: ["section-subheader"] },
        j: { content: "NEW", classes: ["section-subheader"] },
        k: { content: "TOTAL", classes: ["section-subheader"] },
        l: { content: "OBC [A] 1.4.1.2.", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 3.27: Gross Area Row 1
    3.27: {
      id: "3.27",
      rowId: "3.27",
      label: "",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "gross-areas",
            "data-expandable-rows": "3.28,3.29",
            "data-default-visible": "1",
          },
        },
        b: { content: "27" },
        c: { content: "" },
        d: {
          fieldId: "d_27",
          type: "editable",
          value: "Enter gross area description",
          section: "buildingAreas",
          classes: ["no-wrap"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_27",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_27",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_27",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_27",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.28: Gross Area Row 2
    3.28: {
      id: "3.28",
      rowId: "3.28",
      label: "",
      cells: {
        b: { content: "28" },
        c: { content: "" },
        d: {
          fieldId: "d_28",
          type: "editable",
          value: "Enter gross area description",
          section: "buildingAreas",
          classes: ["no-wrap"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_28",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_28",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_28",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_28",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.29: Gross Area Row 3
    3.29: {
      id: "3.29",
      rowId: "3.29",
      label: "",
      cells: {
        b: { content: "29" },
        c: { content: "" },
        d: {
          fieldId: "d_29",
          type: "editable",
          value: "Enter gross area description",
          section: "buildingAreas",
          classes: ["no-wrap"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_29",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_29",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_29",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_29",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.30: Gross Area Total
    "3.30": {
      id: "3.30",
      rowId: "3.30",
      label: "",
      cells: {
        b: { content: "30" },
        c: { content: "" },
        d: { content: "TOTAL" },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: {
          fieldId: "i_30",
          type: "calculated",
          value: "-",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        j: {
          fieldId: "j_30",
          type: "calculated",
          value: "-",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        k: {
          fieldId: "k_30",
          type: "calculated",
          value: "-",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_30",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.31: Mezzanine Area Header
    3.31: {
      id: "3.31",
      rowId: "3.31",
      label: "MEZZANINE AREA (m²)",
      cells: {
        b: { label: "3.06", classes: ["section-subheader"] },
        c: { content: "", classes: ["section-subheader"] },
        d: { content: "MEZZANINE AREA (m²)", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "MEZZANINE TYPE", classes: ["section-subheader"] },
        i: { content: "EXISTING", classes: ["section-subheader"] },
        j: { content: "NEW", classes: ["section-subheader"] },
        k: { content: "TOTAL", classes: ["section-subheader"] },
        l: { content: "3.2.1.1.", classes: ["section-subheader"] },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 3.32: Mezzanine Area Row 1
    3.32: {
      id: "3.32",
      rowId: "3.32",
      label: "",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "mezzanine-areas",
            "data-expandable-rows": "3.33,3.34",
            "data-default-visible": "1",
          },
        },
        b: { content: "32" },
        c: { content: "" },
        d: {
          fieldId: "d_32",
          type: "editable",
          value: "Enter mezzanine description",
          section: "buildingAreas",
          classes: ["no-wrap"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: {
          fieldId: "h_32",
          type: "dropdown",
          dropdownId: "dd_h_32",
          value: "Select applicable",
          section: "buildingAreas",
          classes: ["dropdown-sm"],
          options: mezzanineOptions,
        },
        i: {
          fieldId: "i_32",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_32",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_32",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_32",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.33: Mezzanine Area Row 2
    3.33: {
      id: "3.33",
      rowId: "3.33",
      label: "",
      cells: {
        b: { content: "33" },
        c: { content: "" },
        d: {
          fieldId: "d_33",
          type: "editable",
          value: "Enter mezzanine description",
          section: "buildingAreas",
          classes: ["no-wrap"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: {
          fieldId: "h_33",
          type: "dropdown",
          dropdownId: "dd_h_33",
          value: "Select applicable",
          section: "buildingAreas",
          classes: ["dropdown-sm"],
          options: mezzanineOptions,
        },
        i: {
          fieldId: "i_33",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_33",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_33",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_33",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.34: Mezzanine Area Row 3
    3.34: {
      id: "3.34",
      rowId: "3.34",
      label: "",
      cells: {
        b: { content: "34" },
        c: { content: "" },
        d: {
          fieldId: "d_34",
          type: "editable",
          value: "Enter mezzanine description",
          section: "buildingAreas",
          classes: ["no-wrap"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: {
          fieldId: "h_34",
          type: "dropdown",
          dropdownId: "dd_h_34",
          value: "Select applicable",
          section: "buildingAreas",
          classes: ["dropdown-sm"],
          options: mezzanineOptions,
        },
        i: {
          fieldId: "i_34",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        j: {
          fieldId: "j_34",
          type: "num-editable",
          value: "0.00",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: {
          fieldId: "k_34",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_34",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.35: Mezzanine Area Total
    3.35: {
      id: "3.35",
      rowId: "3.35",
      label: "",
      cells: {
        b: { content: "35" },
        c: { content: "" },
        d: { content: "TOTAL" },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" }, // No total for MEZZ TYPE column
        i: {
          fieldId: "i_35",
          type: "calculated",
          value: "-",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        j: {
          fieldId: "j_35",
          type: "calculated",
          value: "-",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        k: {
          fieldId: "k_35",
          type: "calculated",
          value: "0.00",
          section: "buildingAreas",
          classes: ["calculated-value"],
        },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_35",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 3.35h: Building Height Section Header (visual separator)
    "3.35h": {
      id: "3.35h",
      rowId: "3.35h",
      label: "BUILDING HEIGHT & HIGH BUILDING",
      cells: {
        b: { label: "3.07" },
        c: { label: "BUILDING HEIGHT", classes: ["section-subheader"] },
        d: { content: "", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: { content: "", classes: ["section-subheader"] },
        h: { content: "", classes: ["section-subheader"] },
        i: { content: "", classes: ["section-subheader"] },
        j: { content: "", classes: ["section-subheader"] },
        k: { content: "", classes: ["section-subheader"] },
        l: {
          content: "OBC [A] 1.4.1.2. & 3.2.1.1.",
          classes: ["section-subheader"],
        },
        m: { content: "", classes: ["section-subheader"] },
        n: { content: "", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 3.36: Building Height
    3.36: {
      id: "3.36",
      rowId: "3.36",
      label: "",
      cells: {
        b: { label: "3.07" },
        c: { label: "STOREYS ABOVE GRADE" },
        d: {
          fieldId: "d_36",
          type: "num-editable",
          value: "2",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "(m) ABOVE GRADE" },
        j: {
          fieldId: "j_36",
          type: "num-editable",
          value: "6.20",
          section: "buildingAreas",
          classes: ["user-input"],
        },
        k: { content: "" },
        l: { content: "" },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_36",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column", "user-input"],
        },
      },
    },

    // Row 3.37: Building Height Below Grade
    3.37: {
      id: "3.37",
      rowId: "3.37",
      label: "",
      cells: {
        b: { content: "37" },
        c: { label: "STOREYS BELOW GRADE" },
        d: {
          fieldId: "d_37",
          type: "num-editable",
          value: "1",
          section: "buildingAreas",
          classes: ["user-input"],
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
        o: {
          fieldId: "o_37",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column", "user-input"],
        },
      },
    },

    // Row 3.38: High Building
    3.38: {
      id: "3.38",
      rowId: "3.38",
      label: "HIGH BUILDING",
      cells: {
        b: { label: "3.08" },
        c: { label: "HIGH BUILDING" },
        d: {
          fieldId: "d_38",
          type: "dropdown",
          dropdownId: "dd_d_38",
          value: "No",
          section: "buildingAreas",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "Yes", name: "Yes" },
            { value: "No", name: "No" },
          ],
        },
        e: { content: "" },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "3.2.6." },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_38",
          type: "editable",
          value: "enter notes here...",
          section: "buildingAreas",
          classes: ["no-wrap", "notes-column", "user-input"],
        },
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
    // Create standard row structure
    const rowDef = {
      id: row.id,
      cells: [
        {}, // Empty column A (will be populated if row has 'a' cell)
        {}, // ID column B (auto-populated)
      ],
    };

    // Handle column A if defined
    if (row.cells && row.cells.a) {
      rowDef.cells[0] = { ...row.cells.a };
    }

    // Add cells C through O based on the row definition (matching Excel structure)
    // Skip "b" since Column B is auto-populated by FieldManager
    const columns = [
      "c",
      "d",
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

        // Special handling for column C to support both label patterns
        if (col === "c") {
          // If using content+type pattern, convert to label pattern
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type; // Not needed for rendering
            delete cell.content; // Not needed once we have label
          }
          // If neither label nor content exists, use row's label as fallback
          else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }

        // Remove field-specific properties that aren't needed for rendering
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;

        rowDef.cells.push(cell);
      } else {
        // Add empty cell if not defined
        // Special handling for column C - use row's label if available
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          // Otherwise add empty cell
          rowDef.cells.push({});
        }
      }
    });

    return rowDef;
  }

  //==========================================================================
  // STATE MANAGEMENT
  //==========================================================================

  function getFieldValue(fieldId) {
    const field = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (!field) return "";

    if (field.type === "checkbox") {
      return field.checked;
    } else if (field.tagName === "INPUT") {
      return field.value || "";
    } else if (field.contentEditable === "true") {
      return field.textContent || "";
    } else {
      return field.textContent || "";
    }
  }

  function getNumericValue(fieldId, defaultValue = 0) {
    // Try StateManager first, then fallback to DOM
    if (window.OBC?.StateManager?.getValue) {
      const stateValue = window.OBC.StateManager.getValue(fieldId);
      if (stateValue !== null && stateValue !== undefined) {
        const numericValue = window.OBC.parseNumeric
          ? window.OBC.parseNumeric(stateValue, defaultValue)
          : parseFloat(stateValue.toString().replace(/,/g, ""));
        return isNaN(numericValue) ? defaultValue : numericValue;
      }
    }

    // Fallback to DOM
    const value = getFieldValue(fieldId);
    const cleanValue = value
      .toString()
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "");
    const numericValue = parseFloat(cleanValue);
    return isNaN(numericValue) ? defaultValue : numericValue;
  }

  function setCalculatedValue(
    fieldId,
    rawValue,
    formatType = "number-2dp-comma",
  ) {
    const element = document.querySelector(`[data-field-id="${fieldId}"]`);
    if (element) {
      // Use TEUI formatNumber if available, otherwise fallback with proper thousands separators
      let formattedValue;
      if (typeof rawValue === "number") {
        if (window.OBC?.formatNumber) {
          formattedValue = window.OBC.formatNumber(rawValue, formatType);
        } else {
          // Ensure thousands separators are included in fallback
          formattedValue = rawValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true, // Explicitly enable thousands separators
          });
        }
      } else {
        formattedValue = rawValue;
      }

      element.textContent = formattedValue;

      // Add calculated value styling and remove user input styling
      element.classList.add("calculated-value");
      element.classList.remove("user-input", "user-modified", "editing-intent");
      element.removeAttribute("contenteditable");

      // Register value with StateManager
      if (window.OBC?.StateManager?.setValue) {
        window.OBC.StateManager.setValue(
          fieldId,
          rawValue.toString(),
          "calculated",
        );
      }
    }
  }

  //==========================================================================
  // CALCULATION FUNCTIONS
  //==========================================================================

  function calculateAreaTotals() {
    // Row 22 horizontal total (k_22 = i_22 + j_22)
    const i22 = getNumericValue("i_22");
    const j22 = getNumericValue("j_22");
    const k22Total = i22 + j22;
    setCalculatedValue("k_22", k22Total);

    // Row 23 horizontal total (k_23 = i_23 + j_23)
    const i23 = getNumericValue("i_23");
    const j23 = getNumericValue("j_23");
    const k23Total = i23 + j23;
    setCalculatedValue("k_23", k23Total);

    // Row 24 horizontal total (k_24 = i_24 + j_24)
    const i24 = getNumericValue("i_24");
    const j24 = getNumericValue("j_24");
    const k24Total = i24 + j24;
    setCalculatedValue("k_24", k24Total);

    // Row 25 vertical totals (sum of all area rows)
    const i25Total = i22 + i23 + i24; // Sum of EXISTING column
    const j25Total = j22 + j23 + j24; // Sum of NEW column
    const k25Total = k22Total + k23Total + k24Total; // Sum of TOTAL column

    setCalculatedValue("i_25", i25Total);
    setCalculatedValue("j_25", j25Total);
    setCalculatedValue("k_25", k25Total);
  }

  function calculateGrossAreaTotals() {
    // Individual row calculations (k = i + j for each row)
    const i27 = getNumericValue("i_27", 0);
    const j27 = getNumericValue("j_27", 0);
    const k27Total = i27 + j27;
    setCalculatedValue("k_27", k27Total);

    const i28 = getNumericValue("i_28", 0);
    const j28 = getNumericValue("j_28", 0);
    const k28Total = i28 + j28;
    setCalculatedValue("k_28", k28Total);

    const i29 = getNumericValue("i_29", 0);
    const j29 = getNumericValue("j_29", 0);
    const k29Total = i29 + j29;
    setCalculatedValue("k_29", k29Total);

    // Row 30 gross area totals (sum of rows 27, 28, 29)
    const i30Total = i27 + i28 + i29;
    const j30Total = j27 + j28 + j29;
    const k30Total = k27Total + k28Total + k29Total;

    setCalculatedValue("i_30", i30Total);
    setCalculatedValue("j_30", j30Total);
    setCalculatedValue("k_30", k30Total);
  }

  function calculateMezzanineAreaTotals() {
    // Individual mezzanine row calculations (k = i + j for each row)
    const i32 = getNumericValue("i_32", 0);
    const j32 = getNumericValue("j_32", 0);
    const k32Total = i32 + j32;
    setCalculatedValue("k_32", k32Total);

    const i33 = getNumericValue("i_33", 0);
    const j33 = getNumericValue("j_33", 0);
    const k33Total = i33 + j33;
    setCalculatedValue("k_33", k33Total);

    const i34 = getNumericValue("i_34", 0);
    const j34 = getNumericValue("j_34", 0);
    const k34Total = i34 + j34;
    setCalculatedValue("k_34", k34Total);

    // Row 35 mezzanine area totals (sum of rows 32, 33, 34)
    const i35Total = i32 + i33 + i34;
    const j35Total = j32 + j33 + j34;
    const k35Total = k32Total + k33Total + k34Total;

    setCalculatedValue("i_35", i35Total);
    setCalculatedValue("j_35", j35Total);
    setCalculatedValue("k_35", k35Total);
  }

  function performAllCalculations() {
    // Add recursion protection
    if (window.sectionCalculationInProgress) {
      return;
    }

    window.sectionCalculationInProgress = true;

    try {
      calculateAreaTotals();
      calculateGrossAreaTotals();
      calculateMezzanineAreaTotals();
    } finally {
      window.sectionCalculationInProgress = false;
    }
  }

  //==========================================================================
  // DIAGNOSTIC FUNCTIONS
  //==========================================================================

  function checkS03State() {
    console.log("=== S03 STATE CHECK ===");
    console.log(
      "Section 03 module loaded:",
      !!window.OBC?.SectionModules?.sect03,
    );
    console.log("StateManager available:", !!window.OBC?.StateManager);

    const testFields = [
      "e_22",
      "g_22",
      "e_23",
      "g_23",
      "i_22",
      "i_23",
      "e_24",
      "g_24",
      "i_24",
    ];
    testFields.forEach((fieldId) => {
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      const stateValue = window.OBC?.StateManager?.getValue(fieldId);
      const numericValue = getNumericValue(fieldId);

      console.log(`${fieldId}:`);
      console.log(`  DOM: "${element?.textContent || "ELEMENT NOT FOUND"}"`);
      console.log(`  State: ${stateValue || "UNDEFINED"}`);
      console.log(`  Numeric: ${numericValue}`);
    });

    console.log("=== END S03 CHECK ===");
    return true;
  }

  //==========================================================================
  // EVENT HANDLERS
  //==========================================================================

  // Removed handleFieldBlur - now using global handler from OBC-StateManager.js
  // Custom numeric formatting for Section 03 fields (if needed)
  function formatSection03Field(fieldId, value) {
    // Determine decimal places for different field types
    const heightStoriesFields = ["d_36", "d_37"]; // 1 decimal place
    const heightMetresFields = ["j_36"]; // 2 decimal places
    const areaFields = [
      "i_22",
      "j_22",
      "i_23",
      "j_23",
      "i_24",
      "j_24",
      "i_27",
      "j_27",
      "k_27",
      "i_28",
      "j_28",
      "k_28",
      "i_29",
      "j_29",
      "k_29",
      "i_32",
      "j_32",
      "i_33",
      "j_33",
      "i_34",
      "j_34",
    ];

    const numValue = window.OBC?.parseNumeric
      ? window.OBC.parseNumeric(value, NaN)
      : parseFloat(value);

    if (isNaN(numValue)) return value;

    // Apply formatting based on field type
    if (heightStoriesFields.includes(fieldId)) {
      // Stories (1 decimal place, no commas)
      return window.OBC?.formatNumber
        ? window.OBC.formatNumber(numValue, "number-1dp")
        : numValue.toFixed(1);
    } else if (heightMetresFields.includes(fieldId)) {
      // Metres (2 decimal places, no commas for small numbers)
      return window.OBC?.formatNumber
        ? window.OBC.formatNumber(numValue, "number-2dp")
        : numValue.toFixed(2);
    } else if (areaFields.includes(fieldId)) {
      // Area fields (2 decimal places with commas)
      return window.OBC?.formatNumber
        ? window.OBC.formatNumber(numValue, "number-2dp-comma")
        : numValue.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
          });
    } else {
      // Default formatting
      return window.OBC?.formatNumber
        ? window.OBC.formatNumber(numValue, "number-2dp")
        : numValue.toFixed(2);
    }
  }

  function initializeEventHandlers() {
    // Use the global input handler from OBC-StateManager.js instead of section-specific handlers
    // This provides proper "graceful" behavior where accidental clicks are forgiven
    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }

    // Register StateManager listeners for calculation triggers
    if (window.OBC?.StateManager?.addListener) {
      const calculationTriggers = [
        "i_22",
        "j_22",
        "i_23",
        "j_23",
        "i_24",
        "j_24",
        "i_27",
        "j_27",
        "i_28",
        "j_28",
        "i_29",
        "j_29",
        "i_32",
        "j_32",
        "i_33",
        "j_33",
        "i_34",
        "j_34",
      ];

      calculationTriggers.forEach((fieldId) => {
        window.OBC.StateManager.addListener(fieldId, () => {
          if (!window.sectionCalculationInProgress) {
            performAllCalculations();
          }
        });
      });
    }

    // ALSO add direct DOM event listeners as backup for immediate responsiveness
    const triggerFields = [
      "i_22",
      "j_22",
      "i_23",
      "j_23",
      "i_24",
      "j_24",
      "i_27",
      "j_27",
      "i_28",
      "j_28",
      "i_29",
      "j_29",
      "i_32",
      "j_32",
      "i_33",
      "j_33",
      "i_34",
      "j_34",
    ];

    triggerFields.forEach((fieldId) => {
      const element = document.querySelector(`[data-field-id="${fieldId}"]`);
      if (element) {
        // Add input event listeners for immediate calculation updates
        ["blur", "input", "change"].forEach((eventType) => {
          element.addEventListener(eventType, () => {
            // Small delay to allow StateManager to update first
            setTimeout(() => {
              if (!window.sectionCalculationInProgress) {
                performAllCalculations();
              }
            }, 50);
          });
        });
      }
    });

    window.OBC.sect03.initialized = true;
  }

  function onSectionRendered() {
    // StateManager will auto-initialize from field definitions - no redundant defaults needed

    // Initialize event handlers
    if (!window.OBC.sect03.initialized) {
      initializeEventHandlers();
    }

    // Perform initial calculations after a brief delay to ensure full initialization
    setTimeout(() => {
      performAllCalculations();
    }, 100);
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

    // Calculation functions
    calculateAreaTotals: calculateAreaTotals,
    calculateGrossAreaTotals: calculateGrossAreaTotals,
    calculateMezzanineAreaTotals: calculateMezzanineAreaTotals,
    performAllCalculations: performAllCalculations,

    // Event handling functions
    initializeEventHandlers: initializeEventHandlers,
    formatSection03Field: formatSection03Field,

    // Diagnostic functions
    checkS03State: checkS03State,
  };
})();
