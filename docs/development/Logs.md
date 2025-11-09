 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
 [S09] 🔗 Published ref_i_63=4380 for S13
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.278341, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=16788.24544864865, i_103=23178.387012790416 → i_104=116070.32516166594
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
 [Section12] Calculated display values updated for target mode
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0)
 [DependencyGraph] Already initialized, skipping re-initialization
 🔍 [S01DB] updateTEUIDisplay START: e_10=182.2, h_10=93.72003071129046, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133757.22783115375, area=1427.2)
 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 218ms (all calculations finalized)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 S10: Target listener triggered by i_97, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateThermalBridgePenalty @ Section11.js:1608
calculateTargetModel @ Section11.js:1938
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 S10: Target listener triggered by i_98, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section11.js:447
setCalculatedValue @ Section11.js:1102
calculateTargetModel @ Section11.js:1950
calculateAll @ Section11.js:2091
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:240
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateTargetModel @ Section03.js:1828
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)
 [S12] U-agg TGT: TB%=20 → g_101=0.278341, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=2940, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=25182.368172972972, i_103=23178.387012790416 → i_104=124464.44788599026
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1847
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1847
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1847
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateTargetModel @ Section03.js:1847
calculateAll @ Section03.js:1786
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1777
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1777
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S03] Target CALCULATED results stored (setpoints + derived values only - climate data already published)
 [S12] U-agg TGT: TB%=20 → g_101=0.278341, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=2940, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=25182.368172972972, i_103=23178.387012790416 → i_104=124464.44788599026
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
 [Section12] Calculated display values updated for target mode
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1758
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1777
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1777
calculateReferenceModel @ Section03.js:1898
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1950
storeReferenceResults @ Section03.js:1948
calculateReferenceModel @ Section03.js:1902
calculateAll @ Section03.js:1787
(anonymous) @ Section03.js:2413
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S03] Reference CALCULATED results stored (climate data + setpoints - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Target listener triggered by i_71, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2333
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section02.js:1938
routeToSectionModeManager @ FieldManager.js:207
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S09] Updated calculated display values for target mode
 [S09] Updated calculated display values for target mode
 [S09] Updated calculated display values for target mode
 [FieldManager] Routed d_12=C-Residential through sect02 ModeManager
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.7, h_10=79.08945757457492, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=10.9 (target) → reduction should be 53%
 🔍 [S01DB] UPDATING h_10: 79.1 (from j_32=112876.47385043334, area=1427.2)
 🔍 [S01] h_6 explanation: target=10.9, ref=23.1, reduction=0.5281385281385281, percent=53%
 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 31ms (subsequent update)
 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 31ms (interaction → h_10 settlement)
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [FieldManager] Section sect01 has no ModeManager - using direct write for d_13
routeToSectionModeManager @ FieldManager.js:223Understand this warningAI
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 S05: Reference standard changed, reloading defaults
 S05: Reference defaults loaded from standard: PH Classic
 S06: Reference standard changed, reloading defaults
 S06: Reference defaults loaded from standard: PH Classic
 S09: Reference values updated for standard: PH Classic, lighting: 1.1
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Target listener triggered by i_71, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1955
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section10.js:646
calculateUtilizationFactors @ Section10.js:2621
calculateTargetModel @ Section10.js:1986
calculateAll @ Section10.js:1960
(anonymous) @ Section10.js:2891
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:1990
calculateTargetModel @ Section09.js:1989
(anonymous) @ Section09.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S09] Updated calculated display values for target mode
 S09: Reference values updated for standard: PH Classic, lighting: 1.1
 [S09] Updated calculated display values for target mode
 S09: Reference values updated for standard: PH Classic, lighting: 1.1
 [S09] Updated calculated display values for target mode
 S11: Reference standard changed, reloading defaults
 [S11 REF DEFAULTS] Published ref_d_85=1411.52 to StateManager
 [S11 REF DEFAULTS] Published ref_d_86=712.97 to StateManager
 [S11 REF DEFAULTS] Published ref_d_87=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_94=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_95=1100.42 to StateManager
 [S11 REF DEFAULTS] Published ref_d_96=29.70 to StateManager
 [S11] Listener: ref_d_97 changed → recalculating (src=default)
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=5% → ref_i_97=3855.24, ref_k_97=-457.93
 S10: Reference listener triggered by ref_i_98, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1768
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S11] Writing ref penalty: ref_i_97=3855.24, ref_k_97=-457.93
 S10: Reference listener triggered by ref_i_97, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateReferenceModel @ Section11.js:1785
calculateAll @ Section11.js:2090
(anonymous) @ Section11.js:2310
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section11.js:267
setDefaults @ Section11.js:264
onReferenceStandardChange @ Section11.js:304
(anonymous) @ Section11.js:389
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
routeToSectionModeManager @ FieldManager.js:227
(anonymous) @ FieldManager.js:1144
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018Understand this warningAI
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=5% → ref_i_97=3855.24, ref_k_97=-457.93
 [S11] Writing ref penalty: ref_i_97=3855.24, ref_k_97=-457.93
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=5% → ref_i_97=3855.24, ref_k_97=-457.93
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=3855.24, ref_k_97=-457.93
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2307 [S11] Listener: ref_d_97 changed → recalculating (src=default)
Section11.js:2085 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1524 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:1596 [S11] REF TB%=5% → ref_i_97=3855.24, ref_k_97=-457.93
Section11.js:1780 [S11] Writing ref penalty: ref_i_97=3855.24, ref_k_97=-457.93
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:1529 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:272 [S11 REF DEFAULTS] Published ref_d_97=5 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_85=4.87 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_86=4.21 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_87=5.64 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_94=3.72 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_f_95=1.96 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_88=1.6 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_89=1.6 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_90=1.6 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_91=1.6 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_92=1.6 to StateManager
Section11.js:272 [S11 REF DEFAULTS] Published ref_g_93=1.6 to StateManager
Section11.js:279 S11: Reference defaults loaded from standard: PH Classic
Section11.js:310 S11: Reference standard updated, areas preserved, performance values updated
Section14.js:1457 [Section14] d_13 changed - updating reference indicators
Section14.js:85 S14: Reference standard changed, reloading defaults
Section14.js:79 S14: Reference defaults loaded from standard: PH Classic
Section14.js:1457 [Section14] d_13 changed - updating reference indicators
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section02.js:896 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section01.js:771 🔍 [S01DB] updateTEUIDisplay START: e_10=197.7, h_10=64.50888522719947, useType=Utility Bills
Section01.js:841 🔍 [S01] T.1 Calculation: e_6=21.4 (ref), h_6=10.2 (target) → reduction should be 52%
Section01.js:940 🔍 [S01DB] UPDATING h_10: 64.5 (from j_32=92067.08099625909, area=1427.2)
Section01.js:527 🔍 [S01] h_6 explanation: target=10.2, ref=21.4, reduction=0.5233644859813085, percent=52%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 22ms (subsequent update)
Clock.js:161 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 22ms (interaction → h_10 settlement)
Section01.js:1265 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10