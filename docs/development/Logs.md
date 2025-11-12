VM1227:12 Console was cleared
VM1227:13 === Testing for Duplicate g_63 Handlers ===

VM1227:38 ✅ Monitor active. Change g_63 dropdown now...

VM1227:39 Expected: calculateAll called ONCE
VM1227:40 Bug Present: calculateAll called TWICE (duplicate handlers)

undefined
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
FieldManager.js:208 [FieldManager] Routed g_63=10 through sect09 ModeManager
VM1227:33 🔥 calculateAll called (count: 1)
VM1227:34 console.trace
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:34
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Section09.js:1991 [S09] 🔗 Published ref_i_63=4380 for S13
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
 S10: Target listener triggered by m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=3.344 kg/s, ΔT=3.6°C → 287.98 kWh/day → 34558.17 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Section13.js:2669 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
Section13.js:2837 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
Section13.js:2886 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:541 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
Section14.js:1434 [S14 LISTENER] 🔥 d_122 changed - triggering calculateAll() + UI update
Section13.js:2669 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
Section13.js:2837 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
Section13.js:2886 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:541 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
Section05.js:286 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:286 🔄 [S05] updateCalculatedDisplayValues: mode=target
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
setFieldValue @ Section13.js:660
calculateCoolingVentilation @ Section13.js:2826
calculateTargetModel @ Section13.js:3172
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S14 LISTENER] 🔥 d_122 changed - triggering calculateAll() + UI update
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=34558.17 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=3.344 kg/s, ΔT=3.6°C → 287.98 kWh/day → 34558.17 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=34558.17 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
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
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ unknown
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
Section13.js:2837 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
Section13.js:2886 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=3.344 kg/s, ΔT=3.6°C → 287.98 kWh/day → 34558.17 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=34558.17 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
Section13.js:2669 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
Section13.js:2837 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
Section13.js:2886 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=3.344 kg/s, ΔT=3.6°C → 287.98 kWh/day → 34558.17 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=34558.17 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1944
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section09.js:727
(anonymous) @ Section09.js:2049
calculateTargetModel @ Section09.js:2048
calculateAll @ Section09.js:2223
window.TEUI.SectionModules.sect09.calculateAll @ VM1227:35
routeToSectionModeManager @ FieldManager.js:216
(anonymous) @ FieldManager.js:1186Understand this warningAI
FieldManager.js:217 [FieldManager] Called sect09.calculateAll() after g_63 change
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section09.js:1991 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:456 [S09] Updated calculated display values for target mode
Section01.js:771 🔍 [S01DB] updateTEUIDisplay START: e_10=197.7, h_10=85.06956352650778, useType=Utility Bills
Section01.js:841 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.2 (target) → reduction should be 52%
Section01.js:940 🔍 [S01DB] UPDATING h_10: 85.1 (from j_32=121411.2810650319, area=1427.2)
Section01.js:527 🔍 [S01] h_6 explanation: target=11.2, ref=23.1, reduction=0.5151515151515151, percent=52%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 44ms (subsequent update)
Clock.js:161 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 44ms (interaction → h_10 settlement)
Section01.js:1265 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
VM1227:47 
=== RESULTS ===
VM1227:48 calculateAll was called 1 times
VM1227:51 ✅ NO BUG: Single handler (correct behavior)