 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 S10: Target listener triggered by i_97, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 S10: Target listener triggered by i_98, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S11] Listener: ref_d_97 changed → recalculating (src=calculated)
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11 Area Sync] Sync completed successfully
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 S10: Target listener triggered by m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
onSectionRendered @ Section13.js:2164
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S14: Pattern A initialization complete.
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S18] Notes section rendered
 [S18] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 TEUI Calculator 4.011 initialization complete
 [CLOCK] Performance monitoring initialized
 [TooltipManager] Empty tooltip message for field: l_104
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=341.2, h_10=93.91920962886925, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=22.3 (ref), h_6=11.7 (target) → reduction should be 48%
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔍 [S01DB] UPDATING h_10: 93.9 (from j_32=134041.4959823222, area=1427.2)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔍 [S01] h_6 explanation: target=11.7, ref=22.3, reduction=0.4753363228699552, percent=48%
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 S10: Reference listener triggered by ref_i_103, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1933
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=60685.99 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1933
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1933
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=60685.99 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1933
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.278341, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 S10: Target listener triggered by i_103, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1956
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section14.js:418
calculateValues @ Section14.js:1183
calculateTargetModel @ Section14.js:1141
calculateAll @ Section14.js:950
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=16788.24544864865, i_103=23178.387012790416 → i_104=116070.32516166594
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1930
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section13.js:3058
calculateAll @ Section13.js:3056
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section13.js:3058
calculateAll @ Section13.js:3056
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section13.js:3058
calculateAll @ Section13.js:3056
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ Section13.js:1959
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
(anonymous) @ Section14.js:1438
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section13.js:3058
calculateAll @ Section13.js:3056
calculateAndRefresh @ Section13.js:2304
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
calculateAndRefresh @ Section13.js:1921
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:413
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:703Understand this warningAI
 [CLOCK] Starting initial load timing
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
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=16788.24544864865, i_103=23178.387012790416 → i_104=116070.32516166594
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
 [Section12] Calculated display values updated for target mode
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
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1716
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
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
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
setValue @ Section03.js:242
setFieldValue @ Section03.js:478
calculateGroundFacing @ Section03.js:1735
calculateReferenceModel @ Section03.js:1854
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
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
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2353
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
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
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Section13.js:2357
(anonymous) @ StateManager.js:563
notifyListeners @ StateManager.js:561
setValue @ StateManager.js:431
(anonymous) @ Section03.js:1906
storeReferenceResults @ Section03.js:1904
calculateReferenceModel @ Section03.js:1858
calculateAll @ Section03.js:1745
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
calculateFreeCooling @ Section13.js:3019Understand this warningAI
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
Section12.js:2046 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2198 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
Section12.js:2222 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
Section12.js:2225 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
Section12.js:2409 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section12.js:1667 [S12] U-agg TGT: TB%=20 → g_101=0.278341, g_102=0.324324
Section12.js:1948 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:2026 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2050 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
Section12.js:2053 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
Section12.js:2202 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
Section12.js:2229 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=16788.24544864865, i_103=23178.387012790416 → i_104=116070.32516166594
Section12.js:2232 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
Section12.js:327 [Section12] Calculated display values updated for target mode
Section07.js:929 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:966 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:929 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:966 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section13.js:2670 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3101
calculateAll @ Section13.js:3043
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.746
Section13.js:2838 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
Section13.js:2887 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3169
calculateAll @ Section13.js:3045
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3019 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3019Understand this warningAI
Section06.js:539 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0)
Section06.js:534 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0)
Dependency.js:2062 [DependencyGraph] Already initialized, skipping re-initialization
Section01.js:755 🔍 [S01DB] updateTEUIDisplay START: e_10=182.2, h_10=93.72003071129046, useType=Utility Bills
Section01.js:825 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
Section01.js:924 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133757.22783115375, area=1427.2)
Section01.js:511 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
Clock.js:59 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 219ms (all calculations finalized)
Section01.js:1249 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
zenReset(); zenEnable();
ZenMaster.js:616 🧹 [ZenMaster] Trace data cleared
ZenMaster.js:67 🧘 [ZenMaster] Enabling runtime dependency tracing...
ZenMaster.js:129 🔍 [ZenMaster] StateManager.getValue and setValue intercepted
ZenMaster.js:73 ✅ [ZenMaster] Enabled. All getValue() calls will be traced.
undefined
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section02.js:890 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section02.js:890 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section02.js:890 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S05→S02] Updated d_16 = 500 based on d_15 = TGS4
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S05→S02] Updated d_16 = 500 based on d_15 = TGS4
 [FieldManager] Routed d_15=TGS4 through sect02 ModeManager
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.7, h_10=93.72003071129046, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133757.22783115375, area=1427.2)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section01.js:511 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 0ms (subsequent update)
Clock.js:161 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 0ms (interaction → h_10 settlement)
Section01.js:1249 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:1211 [S05→S02] Updated d_16 = 345.82 based on d_15 = Self Reported
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section05.js:1211 [S05→S02] Updated d_16 = 345.82 based on d_15 = Self Reported
FieldManager.js:208 [FieldManager] Routed d_15=Self Reported through sect02 ModeManager
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section02.js:890 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.7, h_10=93.72003071129046, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133757.22783115375, area=1427.2)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section01.js:511 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 0ms (subsequent update)
Clock.js:161 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 0ms (interaction → h_10 settlement)
Section01.js:1249 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section05.js:285 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Alexandria
Section03.js:1187 Section03: Province selected: ON
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section03.js:1248 City dropdown updated for ON - selected: Alexandria
FieldManager.js:208 [FieldManager] Routed h_12=2025 through sect02 ModeManager
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔍 [S01DB] updateTEUIDisplay START: e_10=197.7, h_10=93.72003071129046, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=19.8 (target) → reduction should be 14%
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133757.22783115375, area=1427.2)
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Clock.js:146 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
Section01.js:511 🔍 [S01] h_6 explanation: target=19.8, ref=23.1, reduction=0.1428571428571429, percent=14%
Clock.js:65 🕐 [CLOCK] ⚡ CALCULATION COMPLETE: 0ms (subsequent update)
Clock.js:161 🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: 0ms (interaction → h_10 settlement)
Section01.js:1249 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
zenDisable()
ZenMaster.js:85 🧘 [ZenMaster] Disabling runtime dependency tracing...
ZenMaster.js:149 🔄 [ZenMaster] StateManager.getValue and setValue restored
ZenMaster.js:91 ✅ [ZenMaster] Disabled. Original methods restored.
undefined