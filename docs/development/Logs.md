 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 S10: Target listener triggered by m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
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
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
updateStateManagerStage1 @ Cooling.js:736
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.746
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
onSectionRendered @ Section13.js:2163
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
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
onSectionRendered @ Section13.js:2163
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1958
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
calculateReferenceModel @ Section14.js:1020
calculateAll @ Section14.js:949
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
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
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
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
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
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
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
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
onSectionRendered @ Section14.js:1496
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 S14: Pattern A initialization complete.
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
initializeEventHandlers @ Section15.js:2293
initializeSectionEventHandlers @ FieldManager.js:396
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
initializeEventHandlers @ Section15.js:2293
initializeSectionEventHandlers @ FieldManager.js:396
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:971
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1235
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1827
calculateTargetModel @ Section15.js:1677
calculateAll @ Section15.js:1307
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
initializeEventHandlers @ Section15.js:2293
initializeSectionEventHandlers @ FieldManager.js:396
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateValues @ Section15.js:1849
calculateTargetModel @ Section15.js:1677
calculateAll @ Section15.js:1307
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:971
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1235
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1827
calculateTargetModel @ Section15.js:1677
calculateAll @ Section15.js:1307
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
initializeEventHandlers @ Section15.js:2293
initializeSectionEventHandlers @ FieldManager.js:396
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
initializeEventHandlers @ Section15.js:2293
initializeSectionEventHandlers @ FieldManager.js:396
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:258
onSectionRendered @ Section15.js:2302
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:258
onSectionRendered @ Section15.js:2302
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
initializeEventHandlers @ Section15.js:2293
onSectionRendered @ Section15.js:2319
initializeSectionEventHandlers @ FieldManager.js:408
renderSection @ FieldManager.js:453
(anonymous) @ FieldManager.js:480
renderAllSections @ FieldManager.js:479
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S18] Notes section rendered
 [S18] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:484
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:484
initialize @ Calculator.js:66
(anonymous) @ index.html:1193Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 TEUI Calculator 4.011 initialization complete
 [CLOCK] Performance monitoring initialized
 [TooltipManager] Empty tooltip message for field: l_104
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section12.js:2657Understand this warningAI
 [QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
 🔍 [S01DB] updateTEUIDisplay START: e_10=341.2, h_10=93.91920962886925, useType=Utility Bills
 🔍 [S01] T.1 Calculation: e_6=22.3 (ref), h_6=11.7 (target) → reduction should be 48%
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:892
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:892
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔍 [S01DB] UPDATING h_10: 93.9 (from j_32=134041.4959823222, area=1427.2)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:949
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateValues @ Section15.js:1849
calculateTargetModel @ Section15.js:1677
calculateAll @ Section15.js:1307
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:949
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
calculateValues @ Section15.js:1849
calculateTargetModel @ Section15.js:1677
calculateAll @ Section15.js:1307
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:949
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:949
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:969
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateTEUIDisplay @ Section01.js:969
(anonymous) @ Section01.js:1252Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔍 [S01] h_6 explanation: target=11.7, ref=22.3, reduction=0.4753363228699552, percent=48%
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1483
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1483
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1483
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1483
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1489
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1489
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1489
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateVolumeMetrics @ Section12.js:1489
calculateReferenceModel @ Section12.js:2330
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1681
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1681
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1681
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1681
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1682
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1682
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1682
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1682
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1683
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1683
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1683
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateCombinedUValue @ Section12.js:1683
calculateReferenceModel @ Section12.js:2331
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 S10: Reference listener triggered by ref_i_103, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
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
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setFieldValue @ Section04.js:975
calculateRow32 @ Section04.js:1182
calculateAll @ Section04.js:1247
calculateAndRefresh @ Section04.js:1497
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1532
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1431
calculateAll @ Section15.js:1306
(anonymous) @ Section15.js:2138
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section13.js:3364
storeReferenceResults @ Section13.js:3362
calculateReferenceModel @ Section13.js:3122
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
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
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
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
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateReferenceModel @ Section12.js:2336
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1932
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateReferenceModel @ Section12.js:2347
calculateAll @ Section12.js:2283
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
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
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
setCalculatedValue @ Section12.js:1268
calculateAirLeakageHeatLoss @ Section12.js:1974
calculateTargetModel @ Section12.js:2429
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ Section13.js:1929
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2244
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setCalculatedValue @ Section12.js:1268
calculateEnvelopeTotals @ Section12.js:2250
calculateTargetModel @ Section12.js:2440
calculateAll @ Section12.js:2284
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S14 LISTENER] 🔥 ref_d_122 changed - triggering calculateAll() + UI update
 [S13] 🔗 Published ref_d_122=19327.71 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=78118.31 kWh/yr for Reference CED mitigated calc
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
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
(anonymous) @ Section13.js:3057
calculateAll @ Section13.js:3055
calculateAndRefresh @ Section13.js:2303
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
updateStateManagerStage1 @ Cooling.js:730
calculateStage1 @ Cooling.js:603
calculateAll @ Cooling.js:700
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S10: Reference listener triggered by ref_m_121, recalculating all.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
calculateAndRefresh @ Section13.js:1920
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:424
(anonymous) @ Section12.js:2307
calculateAll @ Section12.js:2304
(anonymous) @ SectionIntegrator.js:656Understand this warningAI
 [Section12] Calculated display values updated for target mode
TooltipManager.js:715 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
TooltipManager.js:715 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:715
(anonymous) @ TooltipManager.js:769
(anonymous) @ TooltipManager.js:761
applyTooltipsToSection @ TooltipManager.js:758
(anonymous) @ Section11.js:2452Understand this warningAI
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
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1775
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1775
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
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
calculateGroundFacing @ Section03.js:1775
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1775
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
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
calculateGroundFacing @ Section03.js:1794
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1794
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
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
calculateGroundFacing @ Section03.js:1794
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1794
calculateReferenceModel @ Section03.js:1917
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
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
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2352
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
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
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
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
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateReferenceModel @ Section13.js:3114
calculateAll @ Section13.js:3042
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
(anonymous) @ Section13.js:2356
(anonymous) @ StateManager.js:574
notifyListeners @ StateManager.js:572
setValue @ StateManager.js:442
(anonymous) @ Section03.js:1969
storeReferenceResults @ Section03.js:1967
calculateReferenceModel @ Section03.js:1921
calculateAll @ Section03.js:1804
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
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
Section13.js:2669 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:696 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:697
calculateReferenceModel @ Section13.js:3100
calculateAll @ Section13.js:3042
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
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
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
Cooling.js:696 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:697 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:697
calculateTargetModel @ Section13.js:3168
calculateAll @ Section13.js:3044
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200
Cooling.js:548 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:249 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:342 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:725 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:837 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:608 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.746
Section13.js:3018 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3018
calculateTargetModel @ Section13.js:3182
calculateAll @ Section13.js:3044
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1200Understand this warningAI
Section06.js:539 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0)
Section06.js:534 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0)
Dependency.js:2062 [DependencyGraph] Already initialized, skipping re-initialization
Section01.js:771 🔍 [S01DB] updateTEUIDisplay START: e_10=182.2, h_10=93.72003071129046, useType=Utility Bills
Section01.js:841 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
Section01.js:940 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133757.22783115375, area=1427.2)
Section01.js:527 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
Clock.js:59 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 223ms (all calculations finalized)
Section01.js:1265 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10