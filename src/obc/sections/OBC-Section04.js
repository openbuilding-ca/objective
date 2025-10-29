/**
 * OBC-Section04.js
 * Firefighting & Life Safety Systems (Section 4) module for OBC Matrix
 *
 * This file contains field definitions, layout templates, and rendering logic
 * specific to the Firefighting & Life Safety Systems section for the OBC Matrix application.
 *
 * Based on OBC Matrix Part 3 structure covering rows 39-52.
 */

// Create section-specific namespace for global references
window.OBC = window.OBC || {};
window.OBC.sect04 = window.OBC.sect04 || {};
window.OBC.sect04.initialized = false;
window.OBC.sect04.userInteracted = false;

// Section 4: Firefighting & Life Safety Systems Module
window.OBC.SectionModules.sect04 = (function () {
  //==========================================================================
  // SHARED DROPDOWN OPTIONS
  //==========================================================================

  // Building Classification Options (used by multiple dropdowns)
  // Show codes in dropdown, full description goes to linked field
  const buildingClassificationOptions = [
    { value: "-", name: "Select Building Classification", description: "" },
    // Group A Classifications
    {
      value: "3.2.2.20",
      name: "3.2.2.20",
      description: "Group A, Division 1, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.21",
      name: "3.2.2.21",
      description: "Group A, Division 1, 1 Storey, Limited Area, Sprinklered",
    },
    {
      value: "3.2.2.22",
      name: "3.2.2.22",
      description: "Group A, Division 1, 1 Storey, Sprinklered",
    },
    {
      value: "3.2.2.23",
      name: "3.2.2.23",
      description: "Group A, Division 2, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.24",
      name: "3.2.2.24",
      description:
        "Group A, Division 2, up to 6 Storeys, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.25",
      name: "3.2.2.25",
      description: "Group A, Division 2, up to 2 Storeys",
    },
    {
      value: "3.2.2.26",
      name: "3.2.2.26",
      description:
        "Group A, Division 2, up to 2 Storeys, Increased Area, Sprinklered",
    },
    {
      value: "3.2.2.27",
      name: "3.2.2.27",
      description: "Group A, Division 2, up to 2 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.28",
      name: "3.2.2.28",
      description: "Group A, Division 2, 1 Storey",
    },
    {
      value: "3.2.2.29",
      name: "3.2.2.29",
      description: "Group A, Division 3, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.30",
      name: "3.2.2.30",
      description: "Group A, Division 3, up to 2 Storeys",
    },
    {
      value: "3.2.2.31",
      name: "3.2.2.31",
      description: "Group A, Division 3, up to 2 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.32",
      name: "3.2.2.32",
      description: "Group A, Division 3, 1 Storey, Increased Area",
    },
    {
      value: "3.2.2.33",
      name: "3.2.2.33",
      description: "Group A, Division 3, 1 Storey, Sprinklered",
    },
    {
      value: "3.2.2.34",
      name: "3.2.2.34",
      description: "Group A, Division 3, 1 Storey",
    },
    { value: "3.2.2.35", name: "3.2.2.35", description: "Group A, Division 4" },
    // Group B Classifications
    {
      value: "3.2.2.36",
      name: "3.2.2.36",
      description: "Group B, Division 1, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.37",
      name: "3.2.2.37",
      description: "Group B, Division 1, up to 3 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.38",
      name: "3.2.2.38",
      description: "Group B, Division 2, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.39",
      name: "3.2.2.39",
      description: "Group B, Division 2, up to 3 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.40",
      name: "3.2.2.40",
      description: "Group B, Division 2, up to 2 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.41",
      name: "3.2.2.41",
      description: "Group B, Division 2, 1 Storey, Sprinklered",
    },
    {
      value: "3.2.2.42",
      name: "3.2.2.42",
      description: "Group B, Division 3, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.43",
      name: "3.2.2.43",
      description:
        "Group B, Division 3, up to 3 Storeys, (Noncombustible), Sprinklered",
    },
    {
      value: "3.2.2.44",
      name: "3.2.2.44",
      description: "Group B, Division 3, up to 3 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.45",
      name: "3.2.2.45",
      description: "Group B, Division 3, up to 2 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.46",
      name: "3.2.2.46",
      description: "Group B, Division 3, 1 Storey, Sprinklered",
    },
    // Group C Classifications
    {
      value: "3.2.2.47",
      name: "3.2.2.47",
      description: "Group C, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.48",
      name: "3.2.2.48",
      description: "Group C, up to 12 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.49",
      name: "3.2.2.49",
      description:
        "Group C, up to 6 Storeys, Sprinklered, Noncombustible Construction",
    },
    {
      value: "3.2.2.50",
      name: "3.2.2.50",
      description: "Group C, up to 4 Storeys, Noncombustible Construction",
    },
    {
      value: "3.2.2.51",
      name: "3.2.2.51",
      description:
        "Group C, up to 6 Storeys, Sprinklered, Combustible Construction",
    },
    {
      value: "3.2.2.52",
      name: "3.2.2.52",
      description: "Group C, up to 4 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.53",
      name: "3.2.2.53",
      description: "Group C, up to 3 Storeys, Increased Area",
    },
    {
      value: "3.2.2.54",
      name: "3.2.2.54",
      description: "Group C, up to 3 Storeys",
    },
    {
      value: "3.2.2.55",
      name: "3.2.2.55",
      description: "Group C, up to 3 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.55A",
      name: "3.2.2.55A",
      description:
        "Group C, Retirement Home, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.55B",
      name: "3.2.2.55B",
      description:
        "Group C, Retirement Home, up to 4 Storeys, Sprinklered, Increased Area",
    },
    {
      value: "3.2.2.55C",
      name: "3.2.2.55C",
      description: "Group C, Retirement Home, up to 4 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.55D",
      name: "3.2.2.55D",
      description:
        "Group C, Retirement Home, up to 3 Storeys, Sprinklered, Noncombustible Construction",
    },
    {
      value: "3.2.2.55E",
      name: "3.2.2.55E",
      description:
        "Group C, Retirement Home, up to 3 Storeys, Sprinklered, Combustible Construction",
    },
    // Group D Classifications
    {
      value: "3.2.2.56",
      name: "3.2.2.56",
      description: "Group D, Any Height, Any Area",
    },
    {
      value: "3.2.2.57",
      name: "3.2.2.57",
      description: "Group D, up to 12 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.58",
      name: "3.2.2.58",
      description: "Group D, up to 6 Storeys",
    },
    {
      value: "3.2.2.59",
      name: "3.2.2.59",
      description:
        "Group D, up to 6 Storeys, Sprinklered, Noncombustible Construction",
    },
    {
      value: "3.2.2.60",
      name: "3.2.2.60",
      description: "Group D, up to 6 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.61",
      name: "3.2.2.61",
      description: "Group D, up to 4 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.62",
      name: "3.2.2.62",
      description: "Group D, up to 3 Storeys",
    },
    {
      value: "3.2.2.63",
      name: "3.2.2.63",
      description: "Group D, up to 3 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.64",
      name: "3.2.2.64",
      description: "Group D, up to 2 Storeys",
    },
    {
      value: "3.2.2.65",
      name: "3.2.2.65",
      description: "Group D, up to 2 Storeys, Sprinklered",
    },
    // Group E Classifications
    {
      value: "3.2.2.66",
      name: "3.2.2.66",
      description: "Group E, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.67",
      name: "3.2.2.67",
      description: "Group E, up to 4 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.68",
      name: "3.2.2.68",
      description: "Group E, up to 3 Storeys",
    },
    {
      value: "3.2.2.69",
      name: "3.2.2.69",
      description: "Group E, up to 3 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.70",
      name: "3.2.2.70",
      description: "Group E, up to 2 Storeys",
    },
    {
      value: "3.2.2.71",
      name: "3.2.2.71",
      description: "Group E, up to 2 Storeys, Sprinklered",
    },
    // Group F Classifications
    {
      value: "3.2.2.72",
      name: "3.2.2.72",
      description: "Group F, Division 1, up to 4 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.73",
      name: "3.2.2.73",
      description: "Group F, Division 1, up to 3 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.74",
      name: "3.2.2.74",
      description: "Group F, Division 1, up to 2 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.75",
      name: "3.2.2.75",
      description: "Group F, Division 1, 1 Storey",
    },
    {
      value: "3.2.2.76",
      name: "3.2.2.76",
      description: "Group F, Division 2, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.77",
      name: "3.2.2.77",
      description:
        "Group F, Division 2, up to 4 Storeys, Increased Area, Sprinklered",
    },
    {
      value: "3.2.2.78",
      name: "3.2.2.78",
      description: "Group F, Division 2, up to 3 Storeys",
    },
    {
      value: "3.2.2.79",
      name: "3.2.2.79",
      description: "Group F, Division 2, up to 4 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.80",
      name: "3.2.2.80",
      description: "Group F, Division 2, up to 2 Storeys",
    },
    {
      value: "3.2.2.81",
      name: "3.2.2.81",
      description: "Group F, Division 2, up to 2 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.82",
      name: "3.2.2.82",
      description: "Group F, Division 3, Any Height, Any Area, Sprinklered",
    },
    {
      value: "3.2.2.83",
      name: "3.2.2.83",
      description: "Group F, Division 3, up to 6 Storeys",
    },
    {
      value: "3.2.2.84",
      name: "3.2.2.84",
      description: "Group F, Division 3, up to 6 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.85",
      name: "3.2.2.85",
      description: "Group F, Division 3, up to 4 Storeys",
    },
    {
      value: "3.2.2.86",
      name: "3.2.2.86",
      description: "Group F, Division 3, up to 4 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.87",
      name: "3.2.2.87",
      description: "Group F, Division 3, up to 2 Storeys",
    },
    {
      value: "3.2.2.88",
      name: "3.2.2.88",
      description: "Group F, Division 3, up to 2 Storeys, Sprinklered",
    },
    {
      value: "3.2.2.89",
      name: "3.2.2.89",
      description: "Group F, Division 3, 1 Storey",
    },
    {
      value: "3.2.2.90",
      name: "3.2.2.90",
      description: "Group F, Division 3, 1 Storey, Sprinklered",
    },
    {
      value: "3.2.2.91",
      name: "3.2.2.91",
      description:
        "Group F, Division 3, 1 Storey, Any Area, Low Fire Load Occupancy",
    },
    {
      value: "3.2.2.92",
      name: "3.2.2.92",
      description: "Group F, Division 3, Storage Garages up to 22 m High",
    },
    // Encapsulated Mass Timber (all groups)
    {
      value: "3.2.2.93",
      name: "3.2.2.93",
      description:
        "Encapsulated mass timber, Various Heights and Areas, Sprinklered",
    },
  ];

  //==========================================================================
  // SECTION 04 FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  // Define rows with integrated field definitions
  const sectionRows = {
    // HEADER ROW - 3.04 Building Area
    header: {
      id: "4h",
      rowId: "4h",
      label: "Fire Stuff",
      cells: {
        b: { label: "4h" },
        c: { label: "FIRE PROTECTION", classes: ["section-subheader"] },
        d: {
          content: "BUILDING CLASSIFICATION",
          classes: ["section-subheader"],
        },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: {
          content: "OBC 3.2.2.10. & 3.2.5.",
          classes: ["section-subheader"],
        },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 39: 3.09 Number of Streets/Firefighter Access
    4.39: {
      id: "4.39",
      rowId: "4.39",
      label: "Number of Streets/Firefighter Access",
      cells: {
        b: { label: "3.09" },
        c: { label: "Number of Streets/Firefighter Access" },
        d: {
          fieldId: "d_39",
          type: "dropdown",
          dropdownId: "dd_d_39",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "1", name: "1" },
            { value: "2", name: "2" },
            { value: "3", name: "3" },
          ],
        },
        e: { label: "STREET(S)" },
        l: { content: "3.2.2.10. & 3.2.5." },
      },
    },

    // Row 40: 3.10 Building Classification (First) - EXPANDABLE TRIGGER ROW
    "4.40": {
      id: "4.40",
      rowId: "4.40",
      label: "Building Classification",
      cells: {
        a: {
          content: "", // Will be populated by ExpandableRows utility
          classes: ["expandable-row-trigger"],
          attributes: {
            "data-expandable-group": "building-classifications",
            "data-expandable-rows": "4.41,4.42,4.43,4.44",
            "data-default-visible": "1", // Shows only the trigger row initially
          },
        },
        b: { label: "3.1" },
        c: { label: "Building Classification" },
        d: {
          fieldId: "d_40",
          type: "dropdown",
          dropdownId: "dd_d_40",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-lg"],
          options: buildingClassificationOptions,
          linkedField: "e_40", // Field that will show the description
        },
        e: {
          fieldId: "e_40",
          type: "text",
          value: "",
          section: "firefightingSystems",
          classes: ["classification-description"],
          readonly: true,
        },
        f: { content: "" },
        g: { content: "" },
        h: { content: "" },
        i: { content: "" },
        j: { content: "" },
        k: { content: "" },
        l: { content: "3.2.2.20-83." },
        m: { content: "" },
        n: { content: "" },
        o: {
          fieldId: "o_40",
          type: "editable",
          value: "enter notes here...",
          section: "firefightingSystems",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 41: Building Classification - Size and Construction
    4.41: {
      id: "4.41",
      rowId: "4.41",
      label: "Size and Construction Relative to Occupancy",
      cells: {
        b: { content: "41" },
        c: { content: "(SIZE AND CONSTRUCTION RELATIVE TO OCCUPANCY)" },
        d: {
          fieldId: "d_41",
          type: "dropdown",
          dropdownId: "dd_d_41",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-lg"],
          options: buildingClassificationOptions,
          linkedField: "e_41",
        },
        e: {
          fieldId: "e_41",
          type: "text",
          value: "",
          section: "firefightingSystems",
          classes: ["classification-description"],
          readonly: true,
        },
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
          fieldId: "o_41",
          type: "editable",
          value: "enter notes here...",
          section: "firefightingSystems",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 42: Building Classification (Additional)
    4.42: {
      id: "4.42",
      rowId: "4.42",
      label: "Building Classification Additional",
      cells: {
        b: { content: "42" },
        c: { content: "" },
        d: {
          fieldId: "d_42",
          type: "dropdown",
          dropdownId: "dd_d_42",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-lg"],
          options: buildingClassificationOptions,
          linkedField: "e_42",
        },
        e: {
          fieldId: "e_42",
          type: "text",
          value: "",
          section: "firefightingSystems",
          classes: ["classification-description"],
          readonly: true,
        },
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
          fieldId: "o_42",
          type: "editable",
          value: "enter notes here...",
          section: "firefightingSystems",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 43: Building Classification (Additional)
    4.43: {
      id: "4.43",
      rowId: "4.43",
      label: "Building Classification Additional",
      cells: {
        b: { content: "43" },
        c: { content: "" },
        d: {
          fieldId: "d_43",
          type: "dropdown",
          dropdownId: "dd_d_43",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-lg"],
          options: buildingClassificationOptions,
          linkedField: "e_43",
        },
        e: {
          fieldId: "e_43",
          type: "text",
          value: "",
          section: "firefightingSystems",
          classes: ["classification-description"],
          readonly: true,
        },
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
          fieldId: "o_43",
          type: "editable",
          value: "enter notes here...",
          section: "firefightingSystems",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // Row 44: Building Classification (Additional)
    4.44: {
      id: "4.44",
      rowId: "4.44",
      label: "Building Classification Additional",
      cells: {
        b: { content: "44" },
        c: { content: "" },
        d: {
          fieldId: "d_44",
          type: "dropdown",
          dropdownId: "dd_d_44",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-lg"],
          options: buildingClassificationOptions,
          linkedField: "e_44",
        },
        e: {
          fieldId: "e_44",
          type: "text",
          value: "",
          section: "firefightingSystems",
          classes: ["classification-description"],
          readonly: true,
        },
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
          fieldId: "o_44",
          type: "editable",
          value: "enter notes here...",
          section: "firefightingSystems",
          classes: ["no-wrap", "notes-column"],
        },
      },
    },

    // HEADER ROW - 3.04 Building Area
    "4.44h": {
      id: "4.44h",
      rowId: "4.44h",
      label: "Fire Stuff",
      cells: {
        b: { label: "4h" },
        c: { label: "SPRINKLER", classes: ["section-subheader"] },
        d: { content: "WATER SYSTEMS", classes: ["section-subheader"] },
        e: { content: "E", classes: ["section-subheader"] },
        f: { content: "F", classes: ["section-subheader"] },
        g: { content: "G", classes: ["section-subheader"] },
        h: { content: "H", classes: ["section-subheader"] },
        i: { content: "I", classes: ["section-subheader"] },
        j: { content: "J", classes: ["section-subheader"] },
        k: { content: "K", classes: ["section-subheader"] },
        l: { content: "OBC References", classes: ["section-subheader"] },
        m: { content: "M", classes: ["section-subheader"] },
        n: { content: "N", classes: ["section-subheader"] },
        o: {
          content: "Notes",
          classes: ["section-subheader", "notes-column"],
        },
      },
    },

    // Row 45: 3.11 Sprinkler System
    4.45: {
      id: "4.45",
      rowId: "4.45",
      label: "Sprinkler System",
      cells: {
        b: { label: "3.11" },
        c: { label: "Sprinkler System" },
        d: {
          fieldId: "d_45",
          type: "dropdown",
          dropdownId: "dd_d_45",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "Required", name: "Required" },
            { value: "Not Required", name: "Not Required" },
          ],
        },
        e: { content: "Provided for:" },
        f: { content: "F" },
        g: { content: "G" },
        h: {
          fieldId: "i_45",
          type: "dropdown",
          dropdownId: "dd_i_45",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "Entire Building", name: "Entire Building" },
            { value: "Selected Compartments", name: "Selected Compartments" },
            { value: "Selected Floor Areas", name: "Selected Floor Areas" },
            { value: "Basement", name: "Basement" },
            { value: "N/A", name: "N/A" },
            { value: "None", name: "None" },
          ],
        },
        l: { content: "3.2.1.5. &" },
      },
    },

    // Row 46: Sprinkler System Description
    4.46: {
      id: "4.46",
      rowId: "4.46",
      label: "Sprinkler System Description",
      cells: {
        c: { label: "Sprinkler System Description" },
        d: {
          fieldId: "e_46",
          type: "editable",
          value: "Enter description here...",
          section: "firefightingSystems",
          classes: ["no-wrap", "user-input"],
        },
        l: {
          content: "3.2.2.17., 3.2.2.18., 3.2.4.8. to 3.2.4.10. and 3.2.5.13.",
        },
      },
    },

    // Row 47: 3.12 Standpipe System
    4.47: {
      id: "4.47",
      rowId: "4.47",
      label: "Standpipe System",
      cells: {
        b: { label: "3.12" },
        c: { label: "Standpipe System" },
        d: {
          fieldId: "d_47",
          type: "dropdown",
          dropdownId: "dd_d_47",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "YES", name: "YES" },
            { value: "NO", name: "NO" },
            { value: "N/A", name: "N/A" },
          ],
        },
        l: { content: "3.2.9." },
      },
    },

    // Row 48: 3.13 Fire Alarm System
    4.48: {
      id: "4.48",
      rowId: "4.48",
      label: "Fire Alarm System",
      cells: {
        b: { label: "3.13" },
        c: { label: "Fire Alarm System" },
        d: {
          fieldId: "d_48",
          type: "dropdown",
          dropdownId: "dd_d_48",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "YES", name: "YES" },
            { value: "NO", name: "NO" },
            { value: "N/A", name: "N/A" },
          ],
        },
        e: { content: "Type Provided" },
        f: { content: "F" },
        g: { content: "G" },
        h: {
          fieldId: "j_48",
          type: "dropdown",
          dropdownId: "dd_j_48",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "Single stage", name: "Single stage" },
            { value: "Two stage", name: "Two stage" },
            { value: "Other", name: "Other" },
            { value: "None", name: "None" },
          ],
        },
        l: { content: "3.2.4." },
      },
    },

    // Row 49: 3.14 Water Service/Supply Adequacy
    4.49: {
      id: "4.49",
      rowId: "4.49",
      label: "Water Service/Supply Adequate",
      cells: {
        b: { label: "3.14" },
        c: { label: "Water Service/Supply Adequate" },
        d: {
          fieldId: "d_49",
          type: "dropdown",
          dropdownId: "dd_d_49",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "YES", name: "YES" },
            { value: "NO", name: "NO" },
            { value: "N/A", name: "N/A" },
          ],
        },
        h: { content: "" },
        l: { content: "3.2.5.7." },
      },
    },

    // Row 50: 3.15 Construction Type
    "4.50": {
      id: "4.50",
      rowId: "4.50",
      label: "Construction Type",
      cells: {
        b: { label: "3.15" },
        c: { label: "Construction Type" },
        d: { label: "BASED ON" },
        e: {
          fieldId: "e_50",
          type: "dropdown",
          dropdownId: "dd_e_50",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-lg"],
          options: buildingClassificationOptions,
          linkedField: "f_50", // Field that will show the description
        },
        f: {
          fieldId: "f_50",
          type: "text",
          value: "",
          section: "firefightingSystems",
          classes: ["classification-description"],
          readonly: true,
        },
        l: { content: "3.2.2.2.20.-83." },
      },
    },

    // Row 51: Construction Type Restrictions
    4.51: {
      id: "4.51",
      rowId: "4.51",
      label: "Construction Type Restrictions",
      cells: {
        d: { content: "Restrictions" },
        e: {
          fieldId: "e_51",
          type: "dropdown",
          dropdownId: "dd_e_51",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "Combustible Permitted", name: "Combustible Permitted" },
            {
              value: "Noncombustible Required",
              name: "Noncombustible Required",
            },
            {
              value: "Encapsulated Mass Timber Permitted",
              name: "Encapsulated Mass Timber Permitted",
            },
          ],
        },
      },
    },

    // Row 52: Actual Construction & Heavy Timber
    4.52: {
      id: "4.52",
      rowId: "4.52",
      label: "Actual Construction",
      cells: {
        d: { content: "Actual" },
        e: {
          fieldId: "e_52",
          type: "dropdown",
          dropdownId: "dd_e_52",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "Combustible", name: "Combustible" },
            { value: "Noncombustible", name: "Noncombustible" },
            {
              value: "Comb. & Noncomb. in Combination",
              name: "Comb. & Noncomb. in Combination",
            },
            {
              value: "Encapsulated Mass Timber",
              name: "Encapsulated Mass Timber",
            },
            {
              value: "EMT & Noncomb. in Combination",
              name: "EMT & Noncomb. in Combination",
            },
          ],
        },
        h: { content: "Heavy Timber Construction" },
        i: {
          fieldId: "k_52",
          type: "dropdown",
          dropdownId: "dd_k_52",
          value: "-",
          section: "firefightingSystems",
          classes: ["dropdown-sm"],
          options: [
            { value: "-", name: "Select..." },
            { value: "YES", name: "YES" },
            { value: "NO", name: "NO" },
            { value: "N/A", name: "N/A" },
          ],
        },
        l: { content: "3.2.1.4." },
      },
    },
  };

  //==========================================================================
  // HELPER FUNCTIONS (following Section 02 pattern)
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
            linkedField: cell.linkedField,
            readonly: cell.readonly,
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
    // Process rows in specific order
    const layoutRows = [];

    // Add all rows in their original order
    Object.entries(sectionRows).forEach(([_key, row]) => {
      layoutRows.push(createLayoutRow(row));
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

    // Handle column A if defined (for expandable rows)
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
        // Create a copy of the cell for the layout
        const cell = { ...row.cells[col] };

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

  // Helper function to update linked description fields (Excel-like behavior)
  function updateLinkedDescription(dropdownFieldId, selectedValue) {
    // Find the row and cell that contains this dropdown
    let linkedFieldId = null;
    Object.keys(sectionRows).forEach((rowKey) => {
      const row = sectionRows[rowKey];
      Object.keys(row.cells).forEach((cellKey) => {
        const cell = row.cells[cellKey];
        if (cell.fieldId === dropdownFieldId && cell.linkedField) {
          linkedFieldId = cell.linkedField;
        }
      });
    });

    if (linkedFieldId) {
      // Find the description from the dropdown options
      let description = "";
      buildingClassificationOptions.forEach((option) => {
        if (option.value === selectedValue) {
          description = option.description || option.name; // Use description property
        }
      });

      // Update the linked field with the description
      const linkedElement = document.querySelector(
        `[data-field-id="${linkedFieldId}"]`,
      );
      if (linkedElement) {
        linkedElement.textContent = description;
        linkedElement.classList.add("classification-description");
      }
    }
  }

  // Level 2→3 Filtering: E50 dropdown based on selected values in D40-D44
  function updateE50Filter() {
    // Get selected values from building classification dropdowns (D40-D44)
    const sourceFieldIds = ["d_40", "d_41", "d_42", "d_43", "d_44"];
    const selectedValues = [];

    sourceFieldIds.forEach((fieldId) => {
      const value = window.OBC?.StateManager?.getValue(fieldId);
      if (value && value !== "-") {
        selectedValues.push(value);
      }
    });

    // If no values selected in D40-D44, show all classification options
    if (selectedValues.length === 0) {
      if (window.OBC?.FieldManager?.updateDropdownOptions) {
        window.OBC.FieldManager.updateDropdownOptions(
          "e_50",
          buildingClassificationOptions,
        );
      }
      return;
    }

    // Create filtered options: "Select..." + only the classifications selected in D40-D44
    const filteredOptions = [
      { value: "-", name: "Select Building Classification", description: "" },
    ];

    // Add only the selected classification values from D40-D44
    buildingClassificationOptions.forEach((option) => {
      if (selectedValues.includes(option.value)) {
        filteredOptions.push(option);
      }
    });

    // Update E50 dropdown through proper OBC architecture
    if (window.OBC?.FieldManager?.updateDropdownOptions) {
      window.OBC.FieldManager.updateDropdownOptions("e_50", filteredOptions);

      // Reset E50 if current value is no longer valid
      const currentE50Value = window.OBC.StateManager.getValue("e_50") || "-";
      const isCurrentValueValid = filteredOptions.some(
        (option) => option.value === currentE50Value,
      );

      if (!isCurrentValueValid && currentE50Value !== "-") {
        window.OBC.StateManager.setValue("e_50", "-", "user-modified");
      }
    }
  }

  //==========================================================================
  // EVENT HANDLERS
  //==========================================================================

  function initializeEventHandlers() {
    // ✅ MANDATORY: Use global input handler for graceful behavior
    if (window.OBC?.StateManager?.initializeGlobalInputHandlers) {
      window.OBC.StateManager.initializeGlobalInputHandlers();
    }

    // Add event listeners for building classification dropdowns to update descriptions
    const classificationDropdowns = [
      "d_40",
      "d_41",
      "d_42",
      "d_43",
      "d_44",
      "e_50",
    ];
    classificationDropdowns.forEach((fieldId) => {
      const dropdown = document.querySelector(
        `select[data-field-id="${fieldId}"]`,
      );
      if (dropdown) {
        dropdown.addEventListener("change", function () {
          updateLinkedDescription(fieldId, this.value);

          // Filter E50 when any building classification dropdown changes (D40-D44)
          if (["d_40", "d_41", "d_42", "d_43", "d_44"].includes(fieldId)) {
            requestAnimationFrame(updateE50Filter); // Better performance than setTimeout
          }
        });
      }
    });

    // Set up StateManager listeners for E50 filtering (more reliable than DOM events)
    if (window.OBC?.StateManager) {
      const sourceFieldIds = ["d_40", "d_41", "d_42", "d_43", "d_44"];
      sourceFieldIds.forEach((fieldId) => {
        window.OBC.StateManager.addListener(fieldId, function () {
          requestAnimationFrame(updateE50Filter);
        });
      });
    }

    window.OBC.sect04.initialized = true;
  }

  function onSectionRendered() {
    // Initialize event handlers after rendering
    if (!window.OBC.sect04?.initialized) {
      initializeEventHandlers();
    }

    // Load and initialize classification filtering after Section 04 is fully rendered
    loadClassificationFilter();

    // Initialize E50 filtering using requestAnimationFrame for better timing
    requestAnimationFrame(() => {
      updateE50Filter();
    });
  }

  function loadClassificationFilter() {
    // Load ClassificationFilter script dynamically
    if (!window.OBC.ClassificationFilter) {
      const script = document.createElement("script");
      script.src = "OBC-ClassificationFilter.js";
      script.onload = function () {
        // Initialize after a brief delay to ensure DOM is ready
        setTimeout(() => {
          if (window.OBC.ClassificationFilter) {
            window.OBC.ClassificationFilter.initialize();
          }
        }, 100);
      };
      script.onerror = function () {
        console.error("❌ Failed to load ClassificationFilter script");
      };
      document.head.appendChild(script);
    } else {
      // Already loaded, just initialize
      setTimeout(() => {
        if (window.OBC.ClassificationFilter) {
          window.OBC.ClassificationFilter.initialize();
        }
      }, 100);
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
    initializeEventHandlers: initializeEventHandlers,
    updateLinkedDescription: updateLinkedDescription,
    updateE50Filter: updateE50Filter,
  };
})();

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    if (
      window.OBC &&
      window.OBC.SectionModules &&
      window.OBC.SectionModules.sect04
    ) {
      window.OBC.SectionModules.sect04.initializeEventHandlers();
    }
  });
} else {
  // DOM already loaded
  if (
    window.OBC &&
    window.OBC.SectionModules &&
    window.OBC.SectionModules.sect04
  ) {
    window.OBC.SectionModules.sect04.initializeEventHandlers();
  }
}

// Section 04 module loaded: Firefighting & Life Safety Systems
