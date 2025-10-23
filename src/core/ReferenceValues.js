/**
 * 4011-ReferenceValues.js
 *
 * A structured representation of the reference values.
 * Each standard is an object where keys are application fieldIds and
 * values are the strings defined by that standard for those user-editable fields.
 * This data is primarily sourced from 'sources of truth 3037/CODE-VALUES.csv'.
 *
 * Note: Values for fieldId 'j_27' (Total Electricity Use from CODE-VALUES.csv T.3.1),
 * which were previously formula-based, have been intentionally omitted from this structure.
 * A revised calculation method for dependent cells (e.g., M10) no longer requires
 * these complex lookups to be resolved here.
 */

window.TEUI = window.TEUI || {};

TEUI.ReferenceValues = {
  "OBC SB12 3.1.1.2.C4": {
    //"h_13": "OBC Prescriptive Path for HP"
    //"h_14": "Same as Application State B.2 Project Name Field Value" - should we show this in reference import/exports?
    d_52: "90", // DWH System Efficiency when Electric
    k_52: "90", // DWH AFUE when Gas or Oil
    d_53: "42", // DWHR Efficiency if OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "4.87", // Min. Permissible RSI
    f_86: "4.21", // Min. Permissible RSI
    f_87: "5.64", // Min. Permissible RSI
    g_88: "1.600", // Min. Permissible U-Value
    g_89: "1.600", // Min. Permissible U-Value
    g_90: "1.600", // Min. Permissible U-Value
    g_91: "1.600", // Min. Permissible U-Value
    g_92: "1.600", // Min. Permissible U-Value
    g_93: "1.600", // Min. Permissible U-Value
    f_94: "3.72", // Min. Permissible RSI
    f_95: "1.96", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "55", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "OBC SB12 3.1.1.2.C1": {
    //"h_13": "OBC Prescriptive Path for Elect."
    d_52: "90", // DWH System Efficiency when Electric
    k_52: "90", // DWH AFUE when Gas or Oil
    d_53: "42", // DWHR Efficiency if OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "4.87", // Min. Permissible RSI
    f_86: "4.46", // Min. Permissible RSI
    f_87: "5.25", // Min. Permissible RSI
    g_88: "1.400", // Min. Permissible U-Value
    g_89: "1.400", // Min. Permissible U-Value
    g_90: "1.400", // Min. Permissible U-Value
    g_91: "1.400", // Min. Permissible U-Value
    g_92: "1.400", // Min. Permissible U-Value
    g_93: "1.400", // Min. Permissible U-Value
    f_94: "3.72", // Min. Permissible RSI
    f_95: "1.96", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "81", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "OBC SB12 3.1.1.2.A3": {
    //"h_13": "OBC Prescriptive Path for AFUE >92%"
    d_52: "92", // DWH System Efficiency when Electric
    k_52: "92", // DWH AFUE when Gas or Oil
    d_53: "42", // DWHR Efficiency if OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "4.87", // Min. Permissible RSI
    f_86: "3.77", // Min. Permissible RSI
    f_87: "5.64", // Min. Permissible RSI
    g_88: "1.400", // Min. Permissible U-Value
    g_89: "1.400", // Min. Permissible U-Value
    g_90: "1.400", // Min. Permissible U-Value
    g_91: "1.400", // Min. Permissible U-Value
    g_92: "1.400", // Min. Permissible U-Value
    g_93: "1.400", // Min. Permissible U-Value
    f_94: "3.72", // Min. Permissible RSI
    f_95: "1.96", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.92", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "81", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "OBC SB10 5.5-6 Z6": {
    //"h_13": "OBC Prescriptive Path Part 3"
    d_52: "90", // DWH System Efficiency when Electric
    k_52: "90", // DWH AFUE when Gas or Oil
    d_53: "0", // DWHR Efficiency 0 when SB10
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    i_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "7.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "5.30", // Min. Permissible RSI
    f_86: "4.10", // Min. Permissible RSI
    f_87: "6.60", // Min. Permissible RSI
    g_88: "1.990", // Min. Permissible U-Value
    g_89: "1.420", // Min. Permissible U-Value
    g_90: "1.420", // Min. Permissible U-Value
    g_91: "1.420", // Min. Permissible U-Value
    g_92: "1.420", // Min. Permissible U-Value
    g_93: "1.420", // Min. Permissible U-Value
    f_94: "1.80", // Min. Permissible RSI
    f_95: "3.50", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Canadian Building Codes - *NECB 2020 3.1.1.7. Calculation of Overall Thermal Transmittance)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "81", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "3.50", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "OBC SB10 5.5-6 Z5 (2010)": {
    //"h_13": "OBC Prescriptive Path Part 3"
    d_52: "90", // DWH System Efficiency when Electric
    k_52: "90", // DWH AFUE when Gas or Oil
    d_53: "0", // DWHR Efficiency 0 when SB10
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "7.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "5.30", // Min. Permissible RSI
    f_86: "4.10", // Min. Permissible RSI
    f_87: "6.60", // Min. Permissible RSI
    g_88: "1.990", // Min. Permissible U-Value
    g_89: "2.560", // Min. Permissible U-Value
    g_90: "2.560", // Min. Permissible U-Value
    g_91: "2.560", // Min. Permissible U-Value
    g_92: "2.560", // Min. Permissible U-Value
    g_93: "2.560", // Min. Permissible U-Value
    f_94: "1.80", // Min. Permissible RSI
    f_95: "3.50", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "0", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "3.50", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "ADD YOUR OWN HERE": {
    //"h_13": "User Defined"
    d_52: "90", // DWH System Efficiency when Electric
    k_52: "90", // DWH AFUE when Gas or Oil
    d_53: "0.42", // DWHR Efficiency if OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "7.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "4.87", // Min. Permissible RSI
    f_86: "4.46", // Min. Permissible RSI
    f_87: "5.25", // Min. Permissible RSI
    g_88: "1.400", // Min. Permissible U-Value
    g_89: "1.400", // Min. Permissible U-Value
    g_90: "1.400", // Min. Permissible U-Value
    g_91: "1.400", // Min. Permissible U-Value
    g_92: "1.400", // Min. Permissible U-Value
    g_93: "1.400", // Min. Permissible U-Value
    f_94: "3.72", // Min. Permissible RSI
    f_95: "1.96", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "81", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "NBC T1": {
    //"h_13": "NBC 9.36 Prescriptive Path" with any possible measure - serves as a baseline
    d_52: "92", // DWH System Efficiency when Electric
    k_52: "92", // DWH AFUE when Gas or Oil
    d_53: "0.42", // DWHR Efficiency if OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "7.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "6.41", // Min. Permissible RSI
    f_86: "2.97", // Min. Permissible RSI
    f_87: "5.64", // Min. Permissible RSI
    g_88: "1.800", // Min. Permissible U-Value
    g_89: "1.800", // Min. Permissible U-Value
    g_90: "1.800", // Min. Permissible U-Value
    g_91: "1.800", // Min. Permissible U-Value
    g_92: "1.800", // Min. Permissible U-Value
    g_93: "1.800", // Min. Permissible U-Value
    f_94: "2.98", // Min. Permissible RSI
    f_95: "1.96", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.92", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "60", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "NECB T1 (Z6)": {
    //"h_13": "Replacing SB10"
    d_52: "90", // DWH System Efficiency when Electric
    k_52: "90", // DWH AFUE when Gas or Oil
    d_53: "0", // DWHR Efficiency 0 when SB10
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "7.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "7.246", // Min. Permissible RSI
    f_86: "4.166", // Min. Permissible RSI
    f_87: "6.410", // Min. Permissible RSI
    g_88: "1.900", // Min. Permissible U-Value
    g_89: "1.730", // Min. Permissible U-Value
    g_90: "1.730", // Min. Permissible U-Value
    g_91: "1.730", // Min. Permissible U-Value
    g_92: "1.730", // Min. Permissible U-Value
    g_93: "1.730", // Min. Permissible U-Value
    f_94: "3.52", // Min. Permissible RSI
    f_95: "1.32", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "6.4", // Min. HSPF if Heatpump
    d_118: "65", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "3.50", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "CaGBC ZCB": {
    //"h_13": "Replacing SB10"
    d_52: "90", // DWH System Efficiency when Electric
    k_52: "90", // DWH AFUE when Gas or Oil
    d_53: "0", // DWHR Efficiency 0 when SB10
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    g_67: "Regular", // Required Eppt Efficienct Spec.
    t_65: "7.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²) - OBC baseline
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "NRC 40%", // NRC 50% as default n.Gains Factor
    f_85: "5.30", // Min. Permissible RSI
    f_86: "4.10", // Min. Permissible RSI
    f_87: "6.60", // Min. Permissible RSI
    g_88: "1.990", // Min. Permissible U-Value
    g_89: "1.420", // Min. Permissible U-Value
    g_90: "1.420", // Min. Permissible U-Value
    g_91: "1.420", // Min. Permissible U-Value
    g_92: "1.420", // Min. Permissible U-Value
    g_93: "1.420", // Min. Permissible U-Value
    f_94: "1.80", // Min. Permissible RSI
    f_95: "3.50", // Min. Permissible RSI Slab
    d_97: "50", // Default Thermal Bridge Penatly (Not Defined in Codes)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "81", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "3.50", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "PH Classic": {
    //"h_13": "90% less than NBC"
    d_52: "100", // DWH System Efficiency when Electric
    k_52: "92", // DWH AFUE when Gas or Oil
    d_53: "0.42", // DWHR Efficiency 0 when OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    d_66: "1.1", // Max. Permissible Lighting Load
    g_67: "Efficient", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "1.1", // Reference Lighting Load (W/m²)
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "PH Method", // PH Method used for PHI models
    f_85: "4.87", // Min. Permissible Roof RSI by NBC/OBC
    f_86: "4.21", // Min. Permissible Wall RSI by NBC/OBC
    f_87: "5.64", // Min. Permissible Floor RSI by NBC/OBC
    g_88: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_89: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_90: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_91: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_92: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_93: "1.600", // Min. Permissible U-Value by NBC/OBC
    f_94: "3.72", // Min. Permissible RSI by NBC/OBC
    f_95: "1.96", // Min. Permissible RSI Slab by NBC/OBC
    d_97: "5", // Default Thermal Bridge Penatly (Not Defined in Codes)
    d_108: "PH Classic", // Airtightness Method (check this is in correct position per DOM and not in 109)
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "75", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "PH Plus": {
    //"h_13": "90% less than NBC"
    d_52: "100", // DWH System Efficiency when Electric
    k_52: "92", // DWH AFUE when Gas or Oil
    d_53: "0.42", // DWHR Efficiency 0 when OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    d_66: "1.1", // Max. Permissible Lighting Load
    g_67: "Efficient", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "1.1", // Reference Lighting Load (W/m²)
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "PH Method", // PH Method used for PHI models
    f_85: "4.87", // Min. Permissible Roof RSI by NBC/OBC
    f_86: "4.21", // Min. Permissible Wall RSI by NBC/OBC
    f_87: "5.64", // Min. Permissible Floor RSI by NBC/OBC
    g_88: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_89: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_90: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_91: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_92: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_93: "1.600", // Min. Permissible U-Value by NBC/OBC
    f_94: "3.72", // Min. Permissible RSI by NBC/OBC
    f_95: "1.96", // Min. Permissible RSI Slab by NBC/OBC
    d_97: "5", // Default Thermal Bridge Penatly (Not Defined in Codes)
    d_108: "PH Classic", // Airtightness Method
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "75", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "PH Premium": {
    //"h_13": "90% less than NBC"
    d_52: "100", // DWH System Efficiency when Electric
    k_52: "92", // DWH AFUE when Gas or Oil
    d_53: "0.42", // DWHR Efficiency 0 when OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    d_66: "1.1", // Max. Permissible Lighting Load
    g_67: "Efficient", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "1.1", // Reference Lighting Load (W/m²)
    t_67: "5.0", // Reference Equipment Load (W/m²)
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "PH Method", // PH Method used for PHI models
    f_85: "4.87", // Min. Permissible Roof RSI by NBC/OBC
    f_86: "4.21", // Min. Permissible Wall RSI by NBC/OBC
    f_87: "5.64", // Min. Permissible Floor RSI by NBC/OBC
    g_88: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_89: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_90: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_91: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_92: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_93: "1.600", // Min. Permissible U-Value by NBC/OBC
    f_94: "3.72", // Min. Permissible RSI by NBC/OBC
    f_95: "1.96", // Min. Permissible RSI Slab by NBC/OBC
    d_97: "5", // Default Thermal Bridge Penatly (Not Defined in Codes)
    d_108: "PH Classic", // Airtightness Method
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "75", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  EnerPHit: {
    //"h_13": "PH Renovations"
    d_52: "100", // DWH System Efficiency when Electric
    k_52: "92", // DWH AFUE when Gas or Oil
    d_53: "0.42", // DWHR Efficiency 0 when OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    d_66: "2.0", // Max. Permissible Lighting Load
    g_67: "Efficient", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²)
    t_67: "2.0", // Reference Equipment Load (W/m²)
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "PH Method", // PH Method used for PHI models
    f_85: "4.87", // Min. Permissible Roof RSI by NBC/OBC
    f_86: "4.21", // Min. Permissible Wall RSI by NBC/OBC
    f_87: "5.64", // Min. Permissible Floor RSI by NBC/OBC
    g_88: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_89: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_90: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_91: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_92: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_93: "1.600", // Min. Permissible U-Value by NBC/OBC
    f_94: "3.72", // Min. Permissible RSI by NBC/OBC
    f_95: "1.96", // Min. Permissible RSI Slab by NBC/OBC
    d_97: "5", // Default Thermal Bridge Penatly (Not Defined in Codes)
    d_108: "PH Low", // Airtightness Method
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "75", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
  "PH Low Energy": {
    //"h_13": "80% less than NBC"
    d_52: "100", // DWH System Efficiency when Electric
    k_52: "92", // DWH AFUE when Gas or Oil
    d_53: "0.42", // DWHR Efficiency 0 when OBC
    d_56: "150", // Max. Radon per Health Canada Bq/m3
    d_57: "1000", // Max. CO2 per Health Canada ppm
    d_58: "150", // Max. CO2 per Health Canada ppm
    d_59: "45", // Ideal RH% averaged annually
    d_66: "2.0", // Max. Permissible Lighting Load
    g_67: "Efficient", // Required Eppt Efficienct Spec.
    t_65: "5.0", // Reference Occupant Load (W/m²)
    t_66: "2.0", // Reference Lighting Load (W/m²)
    t_67: "2.0", // Reference Equipment Load (W/m²)
    f_73: "0.50", // SHGC of Glazing Max.
    f_74: "0.50", // SHGC of Glazing Max.
    f_75: "0.50", // SHGC of Glazing Max.
    f_76: "0.50", // SHGC of Glazing Max.
    f_77: "0.50", // SHGC of Glazing Max.
    f_78: "0.50", // SHGC of Glazing Max.
    d_80: "PH Method", // PH Method used for PHI models
    f_85: "4.87", // Min. Permissible Roof RSI by NBC/OBC
    f_86: "4.21", // Min. Permissible Wall RSI by NBC/OBC
    f_87: "5.64", // Min. Permissible Floor RSI by NBC/OBC
    g_88: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_89: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_90: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_91: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_92: "1.600", // Min. Permissible U-Value by NBC/OBC
    g_93: "1.600", // Min. Permissible U-Value by NBC/OBC
    f_94: "3.72", // Min. Permissible RSI by NBC/OBC
    f_95: "1.96", // Min. Permissible RSI Slab by NBC/OBC
    d_97: "5", // Default Thermal Bridge Penatly (Not Defined in Codes)
    d_108: "PH Low", // Airtightness Method
    j_115: "0.90", // Min. AFUE if Gas or Oil
    j_116: "3.3", // Min. COPc if Dedicated Cooling
    f_113: "7.1", // Min. HSPF if Heatpump
    d_118: "75", // Min. Permissible ERV/HRV SRE Efficiency%
    l_118: "0.45", // Min. Volumetric Ventilation Rate if by Volume Method
    d_119: "8.33", // Min. Permissible Vent. Rate Per Person in l/sec
  },
};

// Public API (original getter functions are no longer needed with the new simple structure)
// However, keeping a way to get all standard names or a specific standard's data
// might be useful for populating dropdowns or for StateManager.

function getStandardData(standardName) {
  return TEUI.ReferenceValues[standardName] || null;
}

function getAllStandardNames() {
  return Object.keys(TEUI.ReferenceValues);
}

// Expose the new simplified accessors and the raw data for TEUI.ReferenceToggle or other modules.
// The old, more complex getter functions (getValue, getSection, getTargetCell, etc.) are
// deprecated by this new structure because one can directly access:
// TEUI.ReferenceValues["STANDARD_NAME"]["application_field_id"]
// However, TEUI.ReferenceToggle might still use getStandardFields and getStandards.

const _data = TEUI.ReferenceValues; // Keep direct access for modules that might need it.

function getStandardFields(standardName) {
  // Wrapper for backward compatibility if needed
  return _data[standardName] || null;
}

function getStandards() {
  // Wrapper for backward compatibility
  return Object.keys(_data);
}

// Functions like getFieldByTargetCell, getSectionFields, hasValue are no longer
// directly applicable or as useful due to the structural change.
// StateManager will directly use the new structure.

// export { _data as referenceStandardsData, getStandardData, getAllStandardNames, getStandardFields, getStandards }; // << COMMENT OUT or REMOVE this line

// The following is the original IIFE structure's return object.
// We will replace it with the export statement above for modern JS module compatibility
// if the build system supports it. Otherwise, we would re-attach to window.TEUI.
/*
                return {
    getValue, // Deprecated by new structure
    getSection, // Deprecated by new structure
    getTargetCell, // Deprecated by new structure
    getStandardFields, // Retained via wrapper for now
    getStandards, // Retained via wrapper for now
    getSectionFields, // Deprecated
    getFieldByTargetCell, // Deprecated
    hasValue, // Deprecated
    _data: referenceStandards // Retained
};
*/
// For now, to ensure no immediate breakage if other parts of the app use the old IIFE style:
const referenceStandardsData = TEUI.ReferenceValues; // Save the actual data

// Add helper functions to the existing object without overwriting it
TEUI.ReferenceValues.getStandardFields = getStandardFields;
TEUI.ReferenceValues.getStandards = getStandards;
TEUI.ReferenceValues._data = referenceStandardsData; // Backup reference to data
TEUI.ReferenceValues.getStandardData = getStandardData;
TEUI.ReferenceValues.getAllStandardNames = getAllStandardNames;
