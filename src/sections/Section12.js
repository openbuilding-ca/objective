/**
 * 4012-Section12.js
 * Volume and Surface Metrics (Section 12) module for TEUI Calculator 4.012. Note added 2025.12.15: Make sure skylights d_93, ref_d_93, do not form part of WWR calcs at d_107. Excel had this and we fixed it.
 */

window.TEUI = window.TEUI || {};
window.TEUI.SectionModules = window.TEUI.SectionModules || {};

window.TEUI.SectionModules.sect12 = (function () {
  let isInitialized = false;

  // TargetState/ReferenceState/ModeManager removed — graph + SM is the single source of truth.

  //==========================================================================
  // FIELD DEFINITIONS AND LAYOUT
  //==========================================================================

  const sectionRows = {
    header: {
      id: "12-ID",
      rowId: "12-ID",
      label: "Volume and Surface Metrics Units",
      cells: {
        c: {
          content: "SECTION 12. Volume and Surface Metrics",
          classes: ["section-header"],
          colspan: 4,
        },
        d: { content: "", classes: ["section-subheader"] },
        e: { content: "", classes: ["section-subheader"] },
        f: { content: "", classes: ["section-subheader"] },
        g: {
          content: "U-Value\nW/m²·K",
          classes: ["section-subheader", "align-right"],
        },
        h: {
          content: "Loss Rate\nkWh/m²",
          classes: ["section-subheader", "align-right"],
        },
        i: {
          content: "Heatloss\nkWh/Htg. Season",
          classes: ["section-subheader", "align-right"],
        },
        j: {
          content: "Gain Rate\nkWh/m²",
          classes: ["section-subheader", "align-right"],
        },
        k: {
          content: "Heatgain\nkWh/Cool Season",
          classes: ["section-subheader", "align-right"],
        },
        l: {
          content: "Heatloss %",
          classes: ["section-subheader", "align-right"],
        },
        m: {
          content: "Reference",
          classes: ["section-subheader", "align-right"],
        },
        n: { content: "N", classes: ["section-subheader", "align-center"] },
        o: {
          content: "MRT °C",
          classes: ["section-subheader", "align-right"],
        },
      },
    },
    101: {
      id: "B.16",
      rowId: "B.16",
      label: "Total Area Exposed to Air (Ae)",
      cells: {
        c: { label: "Total Area Exposed to Air (Ae)" },
        d: {
          fieldId: "d_101",
          semanticPath: "geometry.airFacing.area",
          type: "calculated",
          value: "2476.62",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "d_85",
            "d_86",
            "d_87",
            "d_88",
            "d_89",
            "d_90",
            "d_91",
            "d_92",
            "d_93",
          ],
          classes: ["text-air-facing"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ae", classes: ["label-main"] },
        g: {
          fieldId: "g_101",
          semanticPath: "geometry.airFacing.uValue",
          type: "calculated",
          value: "0.278",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "g_85",
            "h_85",
            "g_86",
            "h_86",
            "g_87",
            "h_87",
            "g_88",
            "h_88",
            "g_89",
            "h_89",
            "g_90",
            "h_90",
            "g_91",
            "h_91",
            "g_92",
            "h_92",
            "g_93",
            "h_93",
            "d_97",
          ],
          classes: ["text-air-facing"],
          label: "U-Value for Air-Exposed Envelope (Ae)",
        },
        h: {
          fieldId: "h_101",
          semanticPath: "geometry.airFacing.lossRate",
          type: "calculated",
          value: "30.73",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_20"],
          label: "Heat Loss Rate per m² (Ae Envelope): kWh/m²",
        },
        i: {
          fieldId: "i_101",
          semanticPath: "geometry.airFacing.heatLoss",
          type: "calculated",
          value: "76,103.69",
          section: "volumeSurfaceMetrics",
          dependencies: ["h_101", "d_101"],
          label: "Total Heat Loss (Ae Envelope): kWh/yr",
        },
        j: {
          fieldId: "j_101",
          semanticPath: "geometry.airFacing.gainRate",
          type: "calculated",
          value: "1.31",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_21"],
          label: "Heat Gain Rate per m² (Ae Envelope): kWh/m²",
        },
        k: {
          fieldId: "k_101",
          semanticPath: "geometry.airFacing.heatGain",
          type: "calculated",
          value: "3,242.68",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_101", "d_101"],
          label: "Total Heat Gain (Ae Envelope): kWh/yr",
        },
        l: {
          fieldId: "l_101",
          semanticPath: "geometry.airFacing.lossPercent",
          type: "calculated",
          value: "65.57%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_101", "i_104"],
          classes: ["percentage-value"],
          label: "Ae Heat Loss as % of Total",
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
        o: {
          fieldId: "o_101",
          semanticPath: "geometry.airFacing.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_101", "h_23", "d_25", "d_101"],
          label: "Air-facing Aggregate: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    102: {
      id: "B.17",
      rowId: "B.17",
      label: "Total Area Exposed to Ground (Ag)",
      cells: {
        c: { label: "Total Area Exposed to Ground (Ag)" },
        d: {
          fieldId: "d_102",
          semanticPath: "geometry.groundFacing.area",
          type: "calculated",
          value: "1100.93",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_94", "d_95"],
          classes: ["text-ground-facing"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "U-Val. for Ag", classes: ["label-main"] },
        g: {
          fieldId: "g_102",
          semanticPath: "geometry.groundFacing.uValue",
          type: "calculated",
          value: "0.324",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_94", "h_94", "g_95", "h_95", "d_97"],
          conditionalDeps: ["d_94", "d_95"],
          classes: ["text-ground-facing"],
          label: "U-Value for Ground-Exposed Envelope (Ag)",
        },
        h: {
          fieldId: "h_102",
          semanticPath: "geometry.groundFacing.lossRate",
          type: "calculated",
          value: "15.26",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_102", "d_22"],
          label: "Heat Loss Rate per m² (Ag Envelope): kWh/m²",
        },
        i: {
          fieldId: "i_102",
          semanticPath: "geometry.groundFacing.heatLoss",
          type: "calculated",
          value: "16,788.25",
          section: "volumeSurfaceMetrics",
          dependencies: ["h_102", "d_102"],
          label: "Total Heat Loss (Ag Envelope): kWh/yr",
        },
        j: {
          fieldId: "j_102",
          semanticPath: "geometry.groundFacing.gainRate",
          type: "calculated",
          value: "-13.08",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_102", "h_22"],
          label: "Heat Gain Rate per m² (Ag Envelope): kWh/m²",
        },
        k: {
          fieldId: "k_102",
          semanticPath: "geometry.groundFacing.heatGain",
          type: "calculated",
          value: "-14,389.92",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_102", "d_102"],
          label: "Total Heat Gain (Ag Envelope): kWh/yr",
        },
        l: {
          fieldId: "l_102",
          semanticPath: "geometry.groundFacing.lossPercent",
          type: "calculated",
          value: "14.46%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_102", "i_104"],
          label: "Ag Heat Loss as % of Total",
          classes: ["percentage-value"],
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
        o: {
          fieldId: "o_102",
          semanticPath: "geometry.groundFacing.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_102", "h_23", "d_102"],
          label: "Ground-facing Aggregate: Interior Surface Temperature °C",
          tooltip: true,
        },
      },
    },
    103: {
      id: "B.18.3",
      rowId: "B.18.3",
      label: "Heating Natural Air Leakage Heatloss",
      cells: {
        c: { label: "Heating Natural Air Leakage Heatloss" },
        d: {
          fieldId: "d_103",
          semanticPath: "airLeakage.stories",
          type: "dropdown",
          dropdownId: "dd_d_103",
          value: "1.5",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Select Stories
          options: [
            { value: "1", name: "1" },
            { value: "1.5", name: "1.5" },
            { value: "2", name: "2" },
            { value: "3", name: "3" },
            { value: "4", name: "4" },
            { value: "5", name: "5" },
            { value: "6", name: "6" },
          ],
        },
        e: { content: "Stories", classes: ["unit-label"] },
        f: { content: "B.18.3 Shielding", classes: ["label-main"] },
        g: {
          fieldId: "g_103",
          semanticPath: "airLeakage.shielding",
          type: "dropdown",
          dropdownId: "dd_g_103",
          value: "Normal",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Exposure (no tooltip in manager, but keeping for future)
          options: [
            { value: "Shielded", name: "Shielded" },
            { value: "Normal", name: "Normal" },
            { value: "Exposed", name: "Exposed" },
          ],
        },
        h: {},
        i: {
          fieldId: "i_103",
          semanticPath: "airLeakage.heatingHeatLoss",
          type: "calculated",
          value: "23,178.39",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "g_110", "d_101", "d_20"],
          label: "Air Leakage Heat Loss (Heating Season)",
        },
        j: {},
        k: {
          fieldId: "k_103",
          semanticPath: "airLeakage.coolingHeatGain",
          type: "calculated",
          value: "987.60",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "g_110", "d_101", "d_21"],
          label: "Air Leakage Heat Gain (Cooling Season)",
        },
        l: {
          fieldId: "l_103",
          semanticPath: "airLeakage.lossPercent",
          type: "calculated",
          value: "19.97%",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_103", "i_104"],
          classes: ["percentage-value"],
          label: "Air Leakage Heat Loss as % of Total",
        },
        m: { content: "", classes: ["reference-value"] },
        n: { content: "" },
      },
    },
    104: {
      id: "T.4",
      rowId: "T.4",
      label: "Building U-Value Combined Total & Transmission Losses & Gains",
      cells: {
        c: {
          label:
            "Building U-Value Combined Total & Transmission Losses & Gains",
          classes: ["total-row-text"],
        },
        d: {
          fieldId: "d_104",
          semanticPath: "envelope.total.area",
          type: "calculated",
          value: "3577.04",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_101", "d_102"],
          classes: ["total-row-text"],
          label: "Total Envelope Area (Air + Ground): m²",
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: {},
        g: {
          fieldId: "g_104",
          semanticPath: "envelope.total.uValue",
          type: "calculated",
          value: "0.292",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_101", "d_101", "g_102", "d_102"],
          classes: ["total-row-text"],
          label: "Area-Weighted Average U-Value (Building Envelope): W/m²·K",
        },
        h: {},
        i: {
          fieldId: "i_104",
          semanticPath: "envelope.total.heatLoss",
          type: "calculated",
          value: "116,070.33",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_101", "i_102", "i_103"],
          classes: ["total-row-text"],
          label: "Total Envelope Heat Loss (All Components): kWh/yr",
        },
        j: {},
        k: {
          fieldId: "k_104",
          semanticPath: "envelope.total.heatGain",
          type: "calculated",
          value: "-10,160.19",
          section: "volumeSurfaceMetrics",
          dependencies: ["k_101", "k_102"],
          conditionalDeps: ["h_21", "k_98"],
          classes: ["total-row-text"],
          label: "Total Envelope Heat Gain (Conditional)",
        },
        l: {
          fieldId: "l_104",
          semanticPath: "envelope.total.lossPercent",
          type: "calculated",
          value: "100%",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Total Excludes B.12 TB Penalty
          classes: ["percentage-value", "total-row-text"],
          dependencies: ["l_101", "l_102", "l_103"],
          label: "Total Heat Loss Percentage (Should Equal 100%)",
        },
        m: {
          fieldId: "m_104",
          semanticPath: "envelope.total.complianceRatio",
          type: "calculated",
          value: "N/A",
          section: "volumeSurfaceMetrics",
          classes: ["reference-value", "total-row-text"],
          label: "Passive House Compliance Percentage",
        },
        n: {
          fieldId: "n_104",
          semanticPath: "envelope.total.complianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          classes: ["total-row-text"],
          dependencies: ["m_104"],
          label: "Passive House Compliance Status",
        },
        o: {
          fieldId: "o_104",
          semanticPath: "envelope.total.surfaceTemp",
          type: "calculated",
          value: "0.00",
          dependencies: ["g_104", "h_23", "d_25", "d_101", "d_102"],
          label: "Total Building Aggregate: Interior Surface Temperature °C",
          tooltip: true,
          classes: ["total-row-text"],
        },
      },
    },
    105: {
      id: "B.13",
      rowId: "B.13",
      label: "Total Conditioned Volume",
      cells: {
        c: { label: "Total Conditioned Volume" },
        d: {
          fieldId: "d_105",
          semanticPath: "geometry.conditionedVolume",
          type: "editable",
          value: "8319.50", // Our only required Target default set here
          section: "volumeSurfaceMetrics",
          tooltip: true, // Conditioned Volume
          classes: ["user-input"],
        },
        e: { content: "m³", classes: ["unit-label"] },
        f: { content: "Volume/Area", classes: ["label-main"] },
        g: {
          fieldId: "g_105",
          semanticPath: "geometry.volumeToAreaRatio",
          type: "calculated",
          value: "3.23",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_105", "d_101"],
          label: "Volume to Area Ratio: m³/m²",
        },
        h: { content: "Area/Volume", classes: ["text-center"] },
        i: {
          fieldId: "i_105",
          semanticPath: "geometry.areaToVolumeRatio",
          type: "calculated",
          value: "0.31",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_101", "d_105"],
          label: "Area to Volume Ratio: m²/m³",
        },
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    106: {
      id: "B.14",
      rowId: "B.14",
      label: "Total Floor Area (Cond. + Uncond.)",
      cells: {
        c: { label: "Total Floor Area (Cond. + Uncond.)" },
        d: {
          fieldId: "d_106",
          semanticPath: "geometry.totalFloorArea",
          type: "calculated",
          value: "1130.12",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_87", "d_95", "d_96"],
        },
        e: { content: "m²", classes: ["unit-label"] },
        f: { content: "Typ. F2F Ht.", classes: ["label-main"] },
        g: {
          fieldId: "g_106",
          semanticPath: "geometry.floorToFloorHeight",
          type: "editable",
          value: "5.15",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Typical Floor-to-Floor Height
          classes: ["user-input"],
        },
        h: { content: "Ht. in Metres", classes: ["unit-label"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    107: {
      id: "B.15",
      rowId: "B.15",
      label: "Window:Wall Ratio (WWR)",
      cells: {
        c: { label: "Window:Wall Ratio (WWR)" },
        d: {
          fieldId: "d_107",
          semanticPath: "geometry.windowWallRatio",
          type: "calculated",
          value: "0.33",
          section: "volumeSurfaceMetrics",
          dependencies: [
            "d_88",
            "d_89",
            "d_90",
            "d_91",
            "d_92",
            "d_93",
            "d_86",
          ],
        },
        e: { content: "%", classes: ["unit-label"] },
        f: { content: "Total Wall Area", classes: ["label-main"] },
        g: {
          fieldId: "g_107",
          semanticPath: "geometry.totalWallArea",
          type: "calculated",
          value: "0.00",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_86", "d_88", "d_89", "d_90", "d_91", "d_92"],
          tooltip: true,
          label: "Total Wall Area (Opaque + Windows)",
        },
        h: { content: "m²", classes: ["unit-label"] },
        i: {
          fieldId: "i_107",
          semanticPath: "geometry.windowDoorHeatLoss",
          type: "calculated",
          value: "0.00",
          section: "volumeSurfaceMetrics",
          dependencies: ["i_88", "i_89", "i_90", "i_91", "i_92"],
          label: "Total Window & Door Heat Loss: kWh/yr",
        },
        j: { content: "kWh/yr", classes: ["unit-label"] },
        k: {},
        l: {},
        m: {
          fieldId: "m_107",
          semanticPath: "geometry.wwrComplianceRatio",
          type: "calculated",
          value: "61%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["d_107"],
          label: "WWR Ratio to Reference Standard",
        },
        n: {
          fieldId: "n_107",
          semanticPath: "geometry.wwrComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_107"],
          label: "WWR Compliance Status",
        },
      },
    },
    108: {
      id: "B.18.1",
      rowId: "B.18.1",
      label: "NRL₅₀ Target Method",
      cells: {
        c: { label: "NRL₅₀ Target Method" },
        d: {
          fieldId: "d_108",
          semanticPath: "airLeakage.nrl50Method",
          type: "dropdown",
          dropdownId: "dd_d_108",
          value: "AL-1B",
          section: "volumeSurfaceMetrics",
          tooltip: true, // A.2 NRL50 * Ae
          options: [
            { value: "MEASURED", name: "Measured" },
            { value: "PH_CLASSIC", name: "PH Classic" },
            { value: "PH_LOW", name: "PH Low" },
            { value: "PH_PLUS", name: "PH+" },
            { value: "AL-1A", name: "AL-1A" },
            { value: "AL-2A", name: "AL-2A" },
            { value: "AL-3A", name: "AL-3A" },
            { value: "AL-4A", name: "AL-4A" },
            { value: "AL-5A", name: "AL-5A" },
            { value: "AL-1B", name: "AL-1B" },
            { value: "AL-2B", name: "AL-2B" },
            { value: "AL-3B", name: "AL-3B" },
            { value: "AL-4B", name: "AL-4B" },
            { value: "AL-5B", name: "AL-5B" },
            { value: "AL-6B", name: "AL-6B" },
          ],
        },
        e: { content: "", classes: ["unit-label"] },
        f: { content: "B.18.1 Target", classes: ["label-main"] },
        g: {
          fieldId: "g_108",
          semanticPath: "airLeakage.nrl50Target",
          type: "calculated",
          value: "1.17",
          section: "volumeSurfaceMetrics",
          dependencies: ["d_108", "g_109", "d_105", "d_101"],
          label: "NRL₅₀ Target Value: L/s·m²",
        },
        h: { content: "L/s•m²", classes: ["unit-label"] },
        i: {},
        j: {},
        k: {},
        l: {},
        m: {},
        n: {},
      },
    },
    109: {
      id: "B.18.2",
      rowId: "B.18.2",
      label: "ACH₅₀ Target (Converts B.18.1)",
      cells: {
        c: { label: "ACH₅₀ Target (Converts B.18.1)" },
        d: {
          fieldId: "d_109",
          semanticPath: "airLeakage.ach50Target",
          type: "calculated",
          value: "1.30",
          section: "volumeSurfaceMetrics",
          dependencies: ["g_108", "d_101", "d_105"],
        },
        e: { content: "ACH", classes: ["unit-label"] },
        f: { content: "B.18.2 Measured", classes: ["label-main"] },
        g: {
          fieldId: "g_109",
          semanticPath: "airLeakage.ach50Measured",
          type: "editable",
          value: "1.30",
          section: "volumeSurfaceMetrics",
          tooltip: true, // Calculation Dependency
          classes: ["user-input"],
        },
        h: {},
        i: {},
        j: {},
        k: {},
        l: {},
        m: {
          fieldId: "m_109",
          semanticPath: "airLeakage.ach50ComplianceRatio",
          type: "calculated",
          value: "115%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["g_109", "d_109"],
          label: "ACH₅₀ Ratio (Measured/Target)",
        },
        n: {
          fieldId: "n_109",
          semanticPath: "airLeakage.ach50ComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_109"],
          label: "ACH₅₀ Compliance Status",
        },
      },
    },
    110: {
      id: "B.18.4",
      rowId: "B.18.4",
      label: "NLA₁₀ Normalized Leakage Area",
      cells: {
        c: { label: "NLA₁₀ Normalized Leakage Area" },
        d: {
          fieldId: "d_110",
          semanticPath: "airLeakage.nla10",
          type: "calculated",
          value: "0",
          section: "volumeSurfaceMetrics",
          tooltip: true,
          dependencies: ["d_109", "d_105"],
          label: "NLA₁₀: cm²/m²",
        },
        e: { content: "cm²/m²", classes: ["unit-label"] },
        f: { content: "B.18.5.1 n-Factor", classes: ["label-main"] },
        g: {
          fieldId: "g_110",
          semanticPath: "airLeakage.nFactor",
          type: "calculated",
          value: "16.7",
          section: "volumeSurfaceMetrics",
          tooltip: true, // n-Factor Description
          dependencies: ["j_19", "d_103", "g_103"],
          label: "n-Factor for Air Leakage Calculation",
        },
        h: { content: "B.18.3 Ae₁₀ Zone", classes: ["text-center"] },
        i: {
          fieldId: "i_110",
          semanticPath: "airLeakage.climateZone",
          type: "calculated",
          value: "2",
          section: "volumeSurfaceMetrics",
          dependencies: ["j_19"],
          label: "Air Leakage Climate Zone Number",
        },
        j: {},
        k: {},
        l: {},
        m: {
          fieldId: "m_110",
          semanticPath: "airLeakage.nla10ComplianceRatio",
          type: "calculated",
          value: "173%",
          section: "volumeSurfaceMetrics",
          classes: ["percentage-value"],
          dependencies: ["d_110"],
          label: "NLA₁₀ Ratio to the Airtightness Level (or the Reference)",
        },
        n: {
          fieldId: "n_110",
          semanticPath: "airLeakage.nla10ComplianceStatus",
          type: "calculated",
          value: "✓",
          section: "volumeSurfaceMetrics",
          dependencies: ["m_110"],
          label: "NLA₁₀ Compliance Status",
        },
      },
    },
  };

  // Rows 111-112f, B.19.1-B.19.14: the infiltration method and AIM-2's inputs (CSA F280-12 Cl. 5.2.3,
  // AIM2.xls; Andy 2026-11-19). Two label / value pairs a row (C-E, F-H); greyed unless AIM-2 (the house
  // rule). The node side: VolumeMetricsNodes (airTightness.aim2), F280ComplianceNodes.
  const AIM2_ROWS = (function () {
    const A = () => window.TEUI.Aim2Data || { terrain: [], shielding: [], tightness: [] };
    const indexed = list => list.map((t, i) => ({ value: String(i + 1), name: t.name }));
    const fixed = names => names.map(n => ({ value: n, name: n }));
    const field = (id, path, kind, value, extra = {}) => ({
      fieldId: id,
      semanticPath: path,
      type: kind,
      value,
      section: "volumeSurfaceMetrics",
      tooltip: true,
      ...(kind === "dropdown" ? { dropdownId: `dd_${id}` } : {}),
      ...(kind === "editable" ? { classes: ["user-input", "editable"] } : {}),
      ...extra,
    });
    const row = (key, [pre1, label1, f1, unit1], [pre2, label2, f2, unit2]) => [
      key,
      {
        id: pre1,
        rowId: pre1,
        label: label1,
        cells: {
          c: { label: label1 }, // column B shows the row id
          d: f1,
          e: { content: unit1 || "", classes: ["unit-label"] },
          f: { content: `${pre2} ${label2}`, classes: ["label-main"] },
          g: f2,
          h: { content: unit2 || "", classes: ["unit-label"] },
          i: {}, j: {}, k: {}, l: {}, m: {}, n: {},
        },
      },
    ];
    return Object.fromEntries([
      row(111,
        ["B.19.1", "Infiltration Method", field("d_111", "airLeakage.infiltrationMethod", "dropdown", "OBJECTIVE", {
          options: [{ value: "OBJECTIVE", name: "OBJECTIVE (N-factor)" }, { value: "AIM2", name: "AIM-2 (CSA F280)" }] })],
        ["B.19.2", "Air Tightness (AIM-2)", field("g_111", "aim2.tightness", "dropdown", "Custom", {
          getOptions: () => [...A().tightness.map(t => ({ value: t.name, name: `${t.name} (${t.ach50} ACH50)` })),
            { value: "Custom", name: "Custom: B.18.2's ACH50 + this ELA" }] })]),
      row(112,
        ["B.19.3", "ELA₁₀ for Custom", field("d_112", "aim2.ela", "editable", "0"), "cm²"],
        ["B.19.4", "Highest Ceiling Above Grade", field("g_112", "aim2.ceilingHeight", "editable", "0"), "m"]),
      row("112b",
        ["B.19.5", "Building Site Terrain", field("d_112b", "aim2.siteTerrain", "dropdown", "4", { getOptions: () => indexed(A().terrain) })],
        ["B.19.6", "Weather Station Terrain", field("g_112b", "aim2.stationTerrain", "dropdown", "3", { getOptions: () => indexed(A().terrain) })]),
      row("112c",
        ["B.19.7", "Wall Shielding", field("d_112c", "aim2.wallShielding", "dropdown", "2", { getOptions: () => indexed(A().shielding) })],
        ["B.19.8", "Flue Shielding", field("g_112c", "aim2.flueShielding", "dropdown", "2", { getOptions: () => indexed(A().shielding) })]),
      row("112d",
        ["B.19.9", "House Type", field("d_112d", "aim2.buildingType", "dropdown", "Detached", { options: fixed(["Detached", "Semi-Detached"]) })],
        ["B.19.10", "Foundation Type", field("g_112d", "aim2.foundation", "dropdown", "Full", {
          options: fixed(["Crawl Space", "Slab-on-Grade", "Shallow", "Full"]) })]),
      row("112e",
        ["B.19.11", "Ventilation Balance", field("d_112e", "aim2.ventilationBalance", "dropdown", "Balanced", {
          options: fixed(["Balanced", "Exhaust only", "Supply only"]) })],
        ["B.19.12", "Flue Diameter", field("g_112e", "aim2.flueDiameter", "editable", "0"), "mm"]),
      row("112f",
        ["B.19.13", "LRairh: Heating Design", field("d_112f", "aim2.heatingRate", "calculated", ""), "AC/H"],
        ["B.19.14", "LRairc: Cooling Design", field("g_112f", "aim2.coolingRate", "calculated", ""), "AC/H"]),
    ]);
  })();
  Object.assign(sectionRows, AIM2_ROWS);

  //==========================================================================
  // ACCESSOR METHODS
  //==========================================================================

  function getFields() {
    const fields = {};
    Object.entries(sectionRows).forEach(([rowKey, row]) => {
      if (rowKey === "header" || rowKey === "subheader") return;
      if (!row.cells) return;
      Object.entries(row.cells).forEach(([colKey, cell]) => {
        if (cell.fieldId && cell.type) {
          fields[cell.fieldId] = {
            type: cell.type,
            label: cell.label || row.label,
            defaultValue: cell.value || "",
            section: cell.section || "volumeSurfaceMetrics",
            dependencies: cell.dependencies || [],
          };
          if (cell.semanticPath)
            fields[cell.fieldId].semanticPath = cell.semanticPath;
          if (cell.dropdownId)
            fields[cell.fieldId].dropdownId = cell.dropdownId;
          if (cell.options) fields[cell.fieldId].options = cell.options;
          if (cell.getOptions)
            fields[cell.fieldId].getOptions = cell.getOptions;
          if (cell.min !== undefined) fields[cell.fieldId].min = cell.min;
          if (cell.max !== undefined) fields[cell.fieldId].max = cell.max;
          if (cell.step !== undefined) fields[cell.fieldId].step = cell.step;
        }
      });
    });
    return fields;
  }

  function getDropdownOptions() {
    const options = {};
    Object.values(sectionRows).forEach(row => {
      if (!row.cells) return;
      Object.values(row.cells).forEach(cell => {
        if (cell.dropdownId && cell.options) {
          options[cell.dropdownId] = cell.options;
        }
      });
    });
    return options;
  }

  function getLayout() {
    const layoutRows = [];
    if (sectionRows["header"]) {
      layoutRows.push(createLayoutRow(sectionRows["header"]));
    }
    if (sectionRows["subheader"]) {
      layoutRows.push(createLayoutRow(sectionRows["subheader"]));
    }
    Object.entries(sectionRows).forEach(([key, row]) => {
      if (key !== "header" && key !== "subheader") {
        layoutRows.push(createLayoutRow(row));
      }
    });
    return { rows: layoutRows };
  }

  function createLayoutRow(row) {
    const rowDef = { id: row.id, cells: [{}, {}] };
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
      "o", // MRT Surface Temperature (condensation risk feature)
    ];
    columns.forEach(col => {
      if (row.cells && row.cells[col]) {
        const cell = { ...row.cells[col] };
        if (col === "c") {
          if (cell.type === "label" && cell.content && !cell.label) {
            cell.label = cell.content;
            delete cell.type;
            delete cell.content;
          } else if (!cell.label && !cell.content && row.label) {
            cell.label = row.label;
          }
        }
        delete cell.getOptions;
        delete cell.section;
        delete cell.dependencies;
        rowDef.cells.push(cell);
      } else {
        if (col === "c" && !row.cells?.c && row.label) {
          rowDef.cells.push({ label: row.label });
        } else {
          rowDef.cells.push({});
        }
      }
    });
    return rowDef;
  }

  // Helper functions removed – graph handles all computation

  // Reference indicator configuration removed – graph handles compliance

  //==========================================================================
  // MODE-AWARE STATE HELPERS
  //==========================================================================

  function getModeValue(fieldId) {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    return window.TEUI.StateManager?.getValue(isRef ? `ref_${fieldId}` : fieldId);
  }

  function setModeValue(fieldId, value, source = "user-modified") {
    const isRef = window.TEUI.ReferenceToggle?.isReferenceMode();
    const key = isRef ? `ref_${fieldId}` : fieldId;
    if (window.TEUI.StateManager?.setValue) {
      window.TEUI.StateManager.setValue(key, value, source);
    }
  }

  //==========================================================================
  // EVENT HANDLING AND INITIALIZATION
  //==========================================================================

  function registerDependencies() {
    if (!window.TEUI?.StateManager) {
      return;
    }
    const fields = getFields();
    let count = 0;
    Object.entries(fields).forEach(([fieldId, fieldDef]) => {
      if (fieldDef.dependencies && Array.isArray(fieldDef.dependencies)) {
        fieldDef.dependencies.forEach(depId => {
          if (
            window.TEUI.StateManager.getValue(depId) !== null ||
            document.querySelector(`[data-field-id="${depId}"]`)
          ) {
            window.TEUI.StateManager.registerDependency(depId, fieldId);
            count++;
          }
        });
      }
    });
  }

  /**
   * B.19.1-B.19.14 for the current model: each dropdown shows its stored choice. AIM-2's inputs are never
   * greyed: shown only under F280 Mode (S21), where they always drive F280's sizing whatever B.19.1 chooses
   * for the annual figure (two streams, Andy 2026-11-19; they greyed unless B.19.1 was AIM-2). When AIM-2
   * cannot run, B.19.13 says why on hover.
   */
  const AIM2_FIELDS = ["g_111", "d_112", "g_112", "d_112b", "g_112b", "d_112c", "g_112c", "d_112d",
    "g_112d", "d_112e", "g_112e", "d_112f", "g_112f"];
  function updateAim2UI() {
    const sectionElement = document.getElementById("volumeSurfaceMetrics");
    if (!sectionElement) return;
    ["d_111", ...AIM2_FIELDS].forEach(id => {
      const select = sectionElement.querySelector(`select[data-field-id="${id}"]`);
      const v = getModeValue(id);
      if (select && v !== undefined && v !== null && v !== "" && select.value !== String(v)) select.value = String(v);
    });
    const out = sectionElement.querySelector('td[data-field-id="d_112f"]');
    const state = window.TEUI.ComputationIntegration?.getState?.();
    if (out && state) {
      const r = state.getValueForModel(state.getActiveModelId(), "airTightness.aim2");
      out.title = r?.error
        ? `AIM-2 cannot run: ${r.error}`
        : r?.design
          ? `n ${r.design.n.toFixed(3)}, ELA ${r.design.ela.toFixed(1)} cm2 @ 10 Pa; season mean ` +
            (r.seasonal ? `${r.seasonal.rate.toFixed(4)} AC/H` : "(station loading)") + `; F280 weather: ${r.weather.city}`
          : "";
    }
  }

  function initializeEventHandlers() {
    const sectionElement = document.getElementById("volumeSurfaceMetrics");
    if (!sectionElement) return;

    // ✅ S10 PROVEN PATTERN: Inline dropdown handlers (like working sections)
    const dropdowns = sectionElement.querySelectorAll("select");
    dropdowns.forEach(dropdown => {
      // Prevent attaching listeners multiple times
      if (dropdown.hasS12Listener) return;

      dropdown.addEventListener("change", function () {
        const fieldId = this.getAttribute("data-field-id");
        if (!fieldId) return;

        setModeValue(fieldId, this.value, "user-modified");

        // Handle conditional g_109 logic for d_108
        if (fieldId === "d_108") {
          handleConditionalEditability();
        }
      });
      dropdown.hasS12Listener = true;
    });

    const editableFields = sectionElement.querySelectorAll(
      '[contenteditable="true"].user-input'
    );
    editableFields.forEach(field => {
      // Prevent attaching listeners multiple times
      if (field.hasS12Listener) return;

      field.addEventListener("focus", handleFieldFocus);
      field.addEventListener("focusout", handleFieldFocusOut);
      // Blur and Keydown are attached globally now, but keeping local pattern for robustness
      field.addEventListener("blur", handleFieldBlur, true);
      field.addEventListener("keydown", handleFieldKeydown, true);
      field.hasS12Listener = true;
    });

    // Initialize conditional editability state
    handleConditionalEditability();

    // Legacy SM listeners removed — graph handles all computation
  }

  // ✅ REMOVED: Now using S10's inline dropdown handler pattern

  function handleFieldFocus(event) {
    event.target.classList.add("editing");
  }

  function handleFieldFocusOut(event) {
    event.target.classList.remove("editing");
  }

  function handleFieldBlur(event) {
    const field = event.target;
    const fieldId = field.getAttribute("data-field-id");
    if (!fieldId) return;

    const numValue = window.TEUI.parseNumeric(field.textContent);
    if (!isNaN(numValue) && isFinite(numValue)) {
      const formattedValue = window.TEUI.formatNumber(numValue, "number-2dp");
      field.textContent = formattedValue;

      setModeValue(fieldId, String(numValue), "user-modified");
    }
  }

  function handleFieldKeydown(event) {
    const field = event.target;
    if (
      field.hasAttribute("contenteditable") &&
      field.getAttribute("contenteditable") === "true"
    ) {
      if (event.key === "Enter") {
        event.preventDefault();
        field.blur();
      }
    }
  }

  function handleConditionalEditability() {
    const d108Dropdown = document.querySelector(
      'select[data-field-id="d_108"]'
    );
    const g109Cell = document.querySelector('[data-field-id="g_109"]');

    if (!d108Dropdown || !g109Cell) return;

    const currentD108Value =
      getModeValue("d_108") || d108Dropdown.value;
    const isMeasured = currentD108Value === "MEASURED";

    if (isMeasured) {
      g109Cell.setAttribute("contenteditable", "true");
      g109Cell.classList.add("user-input", "editable");
      g109Cell.classList.remove("disabled-input", "ghosted");
      g109Cell.style.backgroundColor = "#f0f8ff";
      g109Cell.style.color = "#000";

      const currentValue = getModeValue("g_109");

      // If the cell is empty or N/A when switching to Measured, restore from state or use hardcoded default
      if (
        !g109Cell.textContent.trim() ||
        g109Cell.textContent.trim() === "N/A"
      ) {
        // ✅ HARDCODED DEFAULT: Use 1.30 for both Target and Reference to match typical AL-1B calculation
        // This prevents calculations from changing when switching to MEASURED mode
        // User can manually override this value if needed
        const defaultValue = "1.30";
        const rawValue = currentValue || defaultValue;
        console.log(
          `[g_109 Default] currentValue="${currentValue}", using rawValue="${rawValue}"`
        );

        // ✅ FIX: Format to 2dp for consistency
        const numericValue = window.TEUI.parseNumeric(rawValue);
        const displayValue = window.TEUI.formatNumber(
          numericValue,
          "number-2dp"
        );
        g109Cell.textContent = displayValue;

        // Only setValue if we're using the default (not already in state)
        if (!currentValue) {
          setModeValue("g_109", defaultValue, "calculated");
        }
      } else {
        // ✅ FIX: Even if cell has content, ensure it's formatted to 2dp
        const numericValue = window.TEUI.parseNumeric(g109Cell.textContent);
        if (!isNaN(numericValue)) {
          g109Cell.textContent = window.TEUI.formatNumber(
            numericValue,
            "number-2dp"
          );
        }
      }
    } else {
      g109Cell.setAttribute("contenteditable", "false");
      g109Cell.classList.remove("user-input", "editable");
      g109Cell.classList.add("disabled-input", "ghosted");
      g109Cell.style.backgroundColor = "#f8f9fa";
      g109Cell.style.color = "#6c757d";
      g109Cell.textContent = "N/A";
      // ✅ DON'T set g_109 to "0" - preserve the value in state
      // This way, if user switches back to MEASURED, the value is still there
      // The N/A display is enough to show the field is not used
      console.log(`[g_109] Locked (not MEASURED mode), preserving state value`);
    }
  }

  function onSectionRendered() {
    if (isInitialized) return;

    console.log(
      "S12: Section rendered - initializing Pattern A Dual-State Module."
    );

    // 2. Setup the section-specific toggle switch in the header

    // 3. Initialize event handlers for this section
    initializeEventHandlers();

    // 4. Apply validation tooltips to fields
    if (window.TEUI.TooltipManager && window.TEUI.TooltipManager.initialized) {
      setTimeout(() => {
        window.TEUI.TooltipManager.applyTooltipsToSection(sectionRows);
      }, 300);
    }

    // 6. Register with StateManager and dependencies
    registerWithStateManager();
    registerDependencies();

    // 7. Initialize conditional field state
    handleConditionalEditability();

    // 10. Add section-specific styles
    addCheckmarkStyles();

    isInitialized = true;
    console.log("S12: Pattern A initialization complete.");
  }

  /**
   * Called by ReferenceToggle when mode switches.
   * Updates conditional editability based on current mode's values.
   */
  function onModeSwitch(mode) {
    handleConditionalEditability();
  }

  function registerWithStateManager() {
    if (!window.TEUI?.StateManager) return;
    const fields = getFields();
    Object.entries(fields).forEach(([fieldId, fieldDef]) => {
      const currentValue = window.TEUI.StateManager.getValue(fieldId);
      if (
        currentValue === null ||
        currentValue === undefined ||
        window.TEUI.StateManager.getDebugInfo(fieldId)?.state === "default"
      ) {
        if (
          fieldDef.defaultValue !== undefined &&
          fieldDef.defaultValue !== null &&
          fieldDef.defaultValue !== ""
        ) {
          window.TEUI.StateManager.setValue(
            fieldId,
            fieldDef.defaultValue,
            "default"
          );
        }
      }
    });
  }


  function addCheckmarkStyles() {
    let styleElement = document.getElementById("sect12-styles");
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "sect12-styles";
      styleElement.textContent = `
                .checkmark { color: green; font-weight: bold; }
                .warning { color: red; font-weight: bold; }
                .editable { background-color: #f0f8ff; cursor: text; }
                .editing { outline: 1px solid blue; background-color: #e6f2ff; }
                /* .calculated-value { background-color: #f8f9fa; } REMOVED - Style handled globally */
                .highlighted-result { font-weight: bold; background-color: #fff3cd; }
            `;
      document.head.appendChild(styleElement);
    }
  }

  //==========================================================================
  // PUBLIC API
  //==========================================================================

  return {
    getFields: getFields,
    getDropdownOptions: getDropdownOptions,
    getLayout: getLayout,
    initializeEventHandlers: initializeEventHandlers,
    onSectionRendered: onSectionRendered,
    postStamp: updateAim2UI,
    onModeSwitch: onModeSwitch,
    get isInitialized() {
      return isInitialized;
    },
    forceInitialization: onSectionRendered,
  };
})();
