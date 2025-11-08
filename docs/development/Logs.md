zenValidate()  // Find MISSING, NON-SM-UKN, CHECK-SRC
zenLabels()    // Find unlabeled/poorly-labeled fields
ZenMaster.js:412 
🔍 [ZenMaster] ========== DEPENDENCY VALIDATION ==========
ZenMaster.js:543 
⚠️ d_16 (Embodied Carbon Target (kgCO₂e/m²)) [type: derived]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_15
ZenMaster.js:551   🔀 CONDITIONAL deps (not triggered in this test): i_39, i_41
ZenMaster.js:543 
⚠️ h_19 (Province) [type: dropdown]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_19
ZenMaster.js:543 
⚠️ j_19 (Province) [type: derived]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_20
ZenMaster.js:543 
⚠️ d_20 (Heating Degree Days (HDD)) [type: derived]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_19, h_19
ZenMaster.js:543 
⚠️ d_22 (Ground Facing GF HDD) [type: derived]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_20
ZenMaster.js:543 
⚠️ h_22 (Ground Facing GF HDD) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_21
ZenMaster.js:543 
⚠️ d_23 (Coldest Days (Location Specific)) [type: derived]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_19, h_19, d_12
ZenMaster.js:543 
⚠️ e_23 (Coldest Days (Location Specific)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_23
ZenMaster.js:543 
⚠️ h_23 (Coldest Days (Location Specific)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_12
ZenMaster.js:543 
⚠️ i_23 (Coldest Days (Location Specific)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_23
ZenMaster.js:543 
⚠️ d_24 (Hottest Days (Location Specific)) [type: derived]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_19, h_19
ZenMaster.js:543 
⚠️ e_24 (Hottest Days (Location Specific)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_24
ZenMaster.js:543 
⚠️ h_24 (Hottest Days (Location Specific)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_12
ZenMaster.js:543 
⚠️ i_24 (Hottest Days (Location Specific)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_24, l_24
ZenMaster.js:543 
⚠️ m_24 (Hottest Days (Location Specific)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_24, l_24
ZenMaster.js:543 
⚠️ i_39 (Typology-Based Carbon Intensity (A1-3)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_39, i_41
ZenMaster.js:557   ➕ MISSING deps (traced via StateManager but not declared): h_15, d_14, g_32, k_32
ZenMaster.js:543 
⚠️ l_39 (Typology-Based Carbon Intensity (A1-3)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_39, i_40, d_40, i_41
ZenMaster.js:543 
⚠️ n_39 (Typology-Based Carbon Intensity (A1-3)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): l_39
ZenMaster.js:543 
⚠️ d_40 (Total Embedded Carbon Emitted (A1-3)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_41, d_106
ZenMaster.js:557   ➕ MISSING deps (traced via StateManager but not declared): d_38, ref_d_38, h_13
ZenMaster.js:543 
⚠️ i_40 (Total Embedded Carbon Emitted (A1-3)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_16
ZenMaster.js:557   ➕ MISSING deps (traced via StateManager but not declared): d_106
ZenMaster.js:543 
⚠️ l_40 (Total Embedded Carbon Emitted (A1-3)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_39, i_40, d_40, i_41
ZenMaster.js:543 
⚠️ n_40 (Total Embedded Carbon Emitted (A1-3)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): l_40
ZenMaster.js:543 
⚠️ d_41 (Lifetime Avoided (B6) Emissions) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): ref_d_38
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_38, h_13
ZenMaster.js:557   ➕ MISSING deps (traced via StateManager but not declared): i_39, i_40, d_40
ZenMaster.js:543 
⚠️ l_41 (Lifetime Avoided (B6) Emissions) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_39, i_40, d_40, i_41
ZenMaster.js:543 
⚠️ n_41 (Lifetime Avoided (B6) Emissions) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): l_41
ZenMaster.js:543 
⚠️ i_63 (Occupants per Building (declared)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_63
ZenMaster.js:543 
⚠️ f_64 (Occupant Activity) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_64
ZenMaster.js:543 
⚠️ h_64 (Occupant Activity) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): f_64, d_63, g_63
ZenMaster.js:543 
⚠️ i_64 (Occupant Activity) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_64
ZenMaster.js:543 
⚠️ j_64 (Occupant Activity) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_64, i_71
ZenMaster.js:543 
⚠️ k_64 (Occupant Activity) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_64
ZenMaster.js:543 
⚠️ l_64 (Occupant Activity) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_64, k_71
ZenMaster.js:543 
⚠️ h_65 (Plug Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_65, h_15
ZenMaster.js:543 
⚠️ i_65 (Plug Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_65
ZenMaster.js:543 
⚠️ j_65 (Plug Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_65, i_71
ZenMaster.js:543 
⚠️ k_65 (Plug Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_65
ZenMaster.js:543 
⚠️ l_65 (Plug Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_65, k_71
ZenMaster.js:543 
⚠️ h_66 (Lighting Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_66, h_15
ZenMaster.js:543 
⚠️ i_66 (Lighting Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_66
ZenMaster.js:543 
⚠️ j_66 (Lighting Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_66, i_71
ZenMaster.js:543 
⚠️ k_66 (Lighting Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_66
ZenMaster.js:543 
⚠️ l_66 (Lighting Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_66, k_71
ZenMaster.js:543 
⚠️ h_67 (Equipment Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_67, g_67, h_15
ZenMaster.js:543 
⚠️ i_67 (Equipment Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_67
ZenMaster.js:543 
⚠️ j_67 (Equipment Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_67, i_71
ZenMaster.js:543 
⚠️ k_67 (Equipment Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_67
ZenMaster.js:543 
⚠️ l_67 (Equipment Loads) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_67, k_71
ZenMaster.js:543 
⚠️ h_69 (DHW System Losses) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_54
ZenMaster.js:543 
⚠️ i_69 (DHW System Losses) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_69
ZenMaster.js:543 
⚠️ j_69 (DHW System Losses) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_69, i_71
ZenMaster.js:543 
⚠️ k_69 (DHW System Losses) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_69
ZenMaster.js:543 
⚠️ l_69 (DHW System Losses) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_69, k_71
ZenMaster.js:543 
⚠️ h_70 (Plug/Light/Eqpt. Subtotals) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_65, h_66, h_67, h_69
ZenMaster.js:543 
⚠️ i_70 (Plug/Light/Eqpt. Subtotals) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_65, i_66, i_67, i_69
ZenMaster.js:543 
⚠️ k_70 (Plug/Light/Eqpt. Subtotals) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_65, k_66, k_67, k_69
ZenMaster.js:543 
⚠️ h_71 (Internal Gains Totals) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_64, h_70
ZenMaster.js:543 
⚠️ i_71 (Internal Gains Totals) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_64, i_70
ZenMaster.js:543 
⚠️ k_71 (Internal Gains Totals) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_64, k_70
ZenMaster.js:543 
⚠️ i_73 (Doors) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_73, e_73, f_73, g_73
ZenMaster.js:543 
⚠️ j_73 (Doors) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_73, i_79
ZenMaster.js:543 
⚠️ k_73 (Doors) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_73, e_73, f_73, h_73
ZenMaster.js:543 
⚠️ l_73 (Doors) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_73, j_79
ZenMaster.js:543 
⚠️ m_73 (Doors) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_73
ZenMaster.js:543 
⚠️ p_73 (Doors) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): l_12, k_73, i_73
ZenMaster.js:543 
⚠️ i_74 (Window Area North) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_74, e_74, f_74, g_74
ZenMaster.js:543 
⚠️ j_74 (Window Area North) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_79
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_74
ZenMaster.js:543 
⚠️ k_74 (Window Area North) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_74, e_74, f_74, h_74
ZenMaster.js:543 
⚠️ l_74 (Window Area North) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_74, j_79
ZenMaster.js:543 
⚠️ m_74 (Window Area North) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_74
ZenMaster.js:543 
⚠️ i_75 (Window Area East) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_75, e_75, f_75, g_75
ZenMaster.js:543 
⚠️ j_75 (Window Area East) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_79
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_75
ZenMaster.js:543 
⚠️ k_75 (Window Area East) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_75, e_75, f_75, h_75
ZenMaster.js:543 
⚠️ l_75 (Window Area East) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_75, j_79
ZenMaster.js:543 
⚠️ m_75 (Window Area East) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_75
ZenMaster.js:543 
⚠️ i_76 (Window Area South) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_76, e_76, f_76, g_76
ZenMaster.js:543 
⚠️ j_76 (Window Area South) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_79
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_76
ZenMaster.js:543 
⚠️ k_76 (Window Area South) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_76, e_76, f_76, h_76
ZenMaster.js:543 
⚠️ l_76 (Window Area South) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_76, j_79
ZenMaster.js:543 
⚠️ m_76 (Window Area South) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_76
ZenMaster.js:543 
⚠️ i_77 (Window Area West) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_77, e_77, f_77, g_77
ZenMaster.js:543 
⚠️ j_77 (Window Area West) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_79
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_77
ZenMaster.js:543 
⚠️ k_77 (Window Area West) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_77, e_77, f_77, h_77
ZenMaster.js:543 
⚠️ l_77 (Window Area West) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_77, j_79
ZenMaster.js:543 
⚠️ m_77 (Window Area West) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_77
ZenMaster.js:543 
⚠️ i_78 (Skylights) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_78, e_78, f_78, g_78
ZenMaster.js:543 
⚠️ j_78 (Skylights) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_79
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_78
ZenMaster.js:543 
⚠️ k_78 (Skylights) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_78, e_78, f_78, h_78
ZenMaster.js:543 
⚠️ l_78 (Skylights) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_78, j_79
ZenMaster.js:543 
⚠️ m_78 (Skylights) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_78
ZenMaster.js:543 
⚠️ i_79 (Subtotal Solar Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_73, i_74, i_75, i_76, i_77, i_78
ZenMaster.js:543 
⚠️ k_79 (Subtotal Solar Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_73, k_74, k_75, k_76, k_77, k_78
ZenMaster.js:543 
⚠️ m_79 (Subtotal Solar Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_79, j_79, k_79, l_79
ZenMaster.js:543 
⚠️ p_79 (Subtotal Solar Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_79, j_79, k_79, l_79
ZenMaster.js:543 
⚠️ e_80 (Gains Utilization Factor (n-Factor)) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_79
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_71
ZenMaster.js:543 
⚠️ g_80 (Gains Utilization Factor (n-Factor)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_80
ZenMaster.js:543 
⚠️ i_80 (Gains Utilization Factor (n-Factor)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_80, g_80
ZenMaster.js:543 
⚠️ e_81 (Net Usable Heating Season Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_80
ZenMaster.js:543 
⚠️ i_81 (Net Usable Heating Season Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_81, g_81
ZenMaster.js:543 
⚠️ i_82 (Net UN-usable Htg. Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): e_80, i_80
ZenMaster.js:543 
⚠️ d_101 (Total Area Exposed to Air (Ae)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_85, d_86, d_87, d_88, d_89, d_90, d_91, d_92, d_93
ZenMaster.js:543 
⚠️ g_101 (Total Area Exposed to Air (Ae)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_85, h_85, d_86, h_86, d_87, h_87, d_88, h_88, d_89, h_89, d_90, h_90, d_91, h_91, d_92, h_92, d_93, h_93, d_101, d_97
ZenMaster.js:543 
⚠️ h_101 (Total Area Exposed to Air (Ae)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_101, d_20
ZenMaster.js:543 
⚠️ i_101 (Total Area Exposed to Air (Ae)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_101, d_101
ZenMaster.js:543 
⚠️ j_101 (Total Area Exposed to Air (Ae)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_101, d_21
ZenMaster.js:543 
⚠️ k_101 (Total Area Exposed to Air (Ae)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_101, d_101
ZenMaster.js:543 
⚠️ l_101 (Total Area Exposed to Air (Ae)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_101, i_104
ZenMaster.js:543 
⚠️ d_102 (Total Area Exposed to Ground (Ag)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_94, d_95
ZenMaster.js:543 
⚠️ g_102 (Total Area Exposed to Ground (Ag)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_94, h_94, d_95, h_95, d_102, d_97
ZenMaster.js:543 
⚠️ h_102 (Total Area Exposed to Ground (Ag)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_102, d_22
ZenMaster.js:543 
⚠️ i_102 (Total Area Exposed to Ground (Ag)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_102, d_102
ZenMaster.js:543 
⚠️ j_102 (Total Area Exposed to Ground (Ag)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_102, h_22
ZenMaster.js:543 
⚠️ k_102 (Total Area Exposed to Ground (Ag)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_102, d_102
ZenMaster.js:543 
⚠️ l_102 (Total Area Exposed to Ground (Ag)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_102, i_104
ZenMaster.js:543 
⚠️ i_103 (Heating Natural Air Leakage Heatloss) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_109, g_110, d_105, d_20
ZenMaster.js:543 
⚠️ k_103 (Heating Natural Air Leakage Heatloss) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_109, g_110, d_105, d_21
ZenMaster.js:543 
⚠️ l_103 (Heating Natural Air Leakage Heatloss) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_103, i_104
ZenMaster.js:543 
⚠️ g_104 (Building U-Value Combined Total & Transmission Losses & Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_101, d_101, g_102, d_102
ZenMaster.js:543 
⚠️ i_104 (Building U-Value Combined Total & Transmission Losses & Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): i_101, i_102, i_103
ZenMaster.js:543 
⚠️ k_104 (Building U-Value Combined Total & Transmission Losses & Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): k_101, k_102, k_103
ZenMaster.js:543 
⚠️ l_104 (Building U-Value Combined Total & Transmission Losses & Gains) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): l_101, l_102, l_103
ZenMaster.js:543 
⚠️ g_105 (Total Conditioned Volume) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_105, d_101
ZenMaster.js:543 
⚠️ i_105 (Total Conditioned Volume) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_101, d_105
ZenMaster.js:543 
⚠️ d_106 (Total Floor Area (Cond. + Uncond.)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_87, d_95, d_96
ZenMaster.js:543 
⚠️ d_107 (Window:Wall Ratio (WWR)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_88, d_89, d_90, d_91, d_92, d_93, d_86
ZenMaster.js:543 
⚠️ l_107 (Window:Wall Ratio (WWR)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_107
ZenMaster.js:543 
⚠️ g_108 (NRL₅₀ Target Method) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_108, g_109, d_105, d_101
ZenMaster.js:543 
⚠️ d_109 (ACH₅₀ Target (Converts B.18.1)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_108, d_101, d_105
ZenMaster.js:543 
⚠️ l_109 (ACH₅₀ Target (Converts B.18.1)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): g_109, d_109
ZenMaster.js:543 
⚠️ d_110 (Ae₁₀ or ELA₁₀ (m²)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_109, d_105
ZenMaster.js:543 
⚠️ g_110 (Ae₁₀ or ELA₁₀ (m²)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_19, d_103, g_103
ZenMaster.js:543 
⚠️ i_110 (Ae₁₀ or ELA₁₀ (m²)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_19
ZenMaster.js:543 
⚠️ l_110 (Ae₁₀ or ELA₁₀ (m²)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_110
ZenMaster.js:543 
⚠️ h_113 (Primary Heating System) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_113, f_113
ZenMaster.js:543 
⚠️ j_113 (Primary Heating System) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_113
ZenMaster.js:543 
⚠️ l_113 (Primary Heating System) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_113, d_114, h_113
ZenMaster.js:543 
⚠️ m_113 (Primary Heating System) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): f_113
ZenMaster.js:543 
⚠️ d_114 (Heating System Demand) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_113, d_127, h_113
ZenMaster.js:543 
⚠️ f_114 (Heating System Demand) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_113, f_115, l_30, h_115, l_28
ZenMaster.js:543 
⚠️ j_114 (Heating System Demand) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_113
ZenMaster.js:543 
⚠️ l_114 (Heating System Demand) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_113, d_116, d_117, j_113
ZenMaster.js:543 
⚠️ d_115 (Heating Fuel Impact (ekWh/yr)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_113, d_127, j_115
ZenMaster.js:543 
⚠️ f_115 (Heating Fuel Impact (ekWh/yr)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_115
ZenMaster.js:543 
⚠️ h_115 (Heating Fuel Impact (ekWh/yr)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_115
ZenMaster.js:543 
⚠️ l_115 (Heating Fuel Impact (ekWh/yr)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_113, d_115, d_114
ZenMaster.js:543 
⚠️ m_115 (Heating Fuel Impact (ekWh/yr)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_115
ZenMaster.js:543 
⚠️ l_116 (Heatpump or Dedicated Cooling System) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_116, d_117, j_116
ZenMaster.js:543 
⚠️ m_116 (Heatpump or Dedicated Cooling System) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_116
ZenMaster.js:543 
⚠️ d_117 (Heatpump Cool Elect. Load) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_116, d_113, m_129, j_113, j_116
ZenMaster.js:543 
⚠️ f_117 (Heatpump Cool Elect. Load) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_117, h_15
ZenMaster.js:543 
⚠️ j_117 (Heatpump Cool Elect. Load) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): j_116
ZenMaster.js:543 
⚠️ m_117 (Heatpump Cool Elect. Load) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): f_117
ZenMaster.js:543 
⚠️ m_118 (HRV/ERV/MVHR Efficiency (SRE)) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_118
ZenMaster.js:543 
⚠️ f_119 (Per Person Ventilation Rate) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_119
ZenMaster.js:543 
⚠️ h_119 (Per Person Ventilation Rate) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_119
ZenMaster.js:543 
⚠️ m_119 (Per Person Ventilation Rate) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_119
ZenMaster.js:543 
⚠️ d_120 (Volumetric Ventilation Rate) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_118, j_63
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_63, d_119, i_63, l_118, d_105
ZenMaster.js:543 
⚠️ f_120 (Volumetric Ventilation Rate) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_120
ZenMaster.js:543 
⚠️ h_120 (Volumetric Ventilation Rate) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_120
ZenMaster.js:543 
⚠️ d_121 (Heating Season Ventil. Energy) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_120, d_20
ZenMaster.js:543 
⚠️ i_121 (Heating Season Ventil. Energy) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_121, d_118
ZenMaster.js:543 
⚠️ m_121 (Heating Season Ventil. Energy) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_121, i_121
ZenMaster.js:543 
⚠️ d_122 (Incoming Cooling Season Ventil. Energy) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): h_118, j_63
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): l_119, d_120, d_21, i_63, i_122
ZenMaster.js:543 
⚠️ i_122 (Incoming Cooling Season Ventil. Energy) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): cooling_latentLoadFactor
ZenMaster.js:543 
⚠️ d_123 (Outgoing Cooling Season Ventil. Energy) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): d_118, d_122
ZenMaster.js:543 
⚠️ d_124 (Ventilation Free Cooling/Vent Capacity) [type: calculated]
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_124, d_129
ZenMaster.js:543 
⚠️ h_124 (Ventilation Free Cooling/Vent Capacity) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): cooling_freeCoolingLimit
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): m_19, g_118, k_120
ZenMaster.js:543 
⚠️ m_124 (Ventilation Free Cooling/Vent Capacity) [type: calculated]
ZenMaster.js:545   🔍 CHECK-SRC deps (not found in FieldManager - verify source code): cooling_daysActiveCooling
ZenMaster.js:548   🤔 NON-SM-UKN deps (not traced via StateManager - may use dual-state/DOM/local storage): h_124
ZenMaster.js:563 
📊 [ZenMaster] ========== VALIDATION SUMMARY ==========
ZenMaster.js:564 ⚠️  WARNING: ZenMaster only traces StateManager.getValue() calls!
ZenMaster.js:565 ⚠️  Dependencies via dual-state/DOM/local storage are NOT visible.
ZenMaster.js:566 ⚠️  ALWAYS verify findings against source code before changes!
ZenMaster.js:567 ==========================================================
ZenMaster.js:568 Total fields validated: 167
ZenMaster.js:569 Fields with NON-SM-UKN deps: 166 (392 deps)
ZenMaster.js:570 Fields with MISSING deps: 4 (11 missing)
ZenMaster.js:571 Conditional deps not triggered: 2
ZenMaster.js:572 UI-only deps (expected): 0
ZenMaster.js:573 CHECK-SRC dependency fields: 14 🔍
ZenMaster.js:574 ==========================================================

ZenMaster.js:591 
🏷️  [ZenMaster] ========== LABEL VALIDATION ==========
ZenMaster.js:613   ❌ i_17 [buildingInfo] - NO LABEL
ZenMaster.js:613   ❌ d_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_85 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_86 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_87 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_88 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_89 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_90 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_91 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_92 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_93 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_94 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ f_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ g_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_95 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_96 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_97 [envelope] - NO LABEL
ZenMaster.js:613   ❌ e_97 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_97 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_97 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_97 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_97 [unknown] - NO LABEL
ZenMaster.js:613   ❌ m_97 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_97 [unknown] - NO LABEL
ZenMaster.js:613   ❌ d_98 [unknown] - NO LABEL
ZenMaster.js:613   ❌ e_98 [unknown] - NO LABEL
ZenMaster.js:613   ❌ h_98 [unknown] - NO LABEL
ZenMaster.js:613   ❌ i_98 [unknown] - NO LABEL
ZenMaster.js:613   ❌ j_98 [unknown] - NO LABEL
ZenMaster.js:613   ❌ k_98 [unknown] - NO LABEL
ZenMaster.js:613   ❌ l_98 [unknown] - NO LABEL
ZenMaster.js:613   ❌ n_98 [unknown] - NO LABEL
ZenMaster.js:627 
📊 [ZenMaster] Label Validation Summary:
ZenMaster.js:628 Fields without labels: 139
ZenMaster.js:629 Fields with poor labels: 0
ZenMaster.js:630 ==========================================================