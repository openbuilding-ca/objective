Clock.js:163 [CLOCK] 🎯 User interaction started - timing to h_10 settlement
FieldManager.js:210 [FieldManager] Routed d_159=monoplane through sect19 ModeManager
Section19.js:2646 [WOMBAT calculateAll] Called - Current mode: target, isActivated: true
Section19.js:1096 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
Section19.js:1194 [WOMBAT] Footprint: 1100.92 m² (33.18m × 33.18m)
Section19.js:1234 [WOMBAT] Equal floorplates - no mezzanine
Section19.js:1243 [WOMBAT] Wall area: 1057.40 m² (from S12 g_107 checksum)
Section19.js:1269 [WOMBAT] Roof area ratio: 1.282 (roof/footprint)
Section19.js:906 [WOMBAT] Shed roof geometry:
  Ridge: transverse, length: 33.18m
  Span: 33.18m
  Slope length: 42.54m
  Height rise: 26.62m
  Short wall: 5.15m
  Tall wall: 31.77m
  End wall area (both): 883.38m²
Section19.js:1341 [WOMBAT] Shed roof solved:
Section19.js:1342   Ridge height: 26.62 m
Section19.js:1343   Shed end area (both): 883.38 m²
Section19.js:1344   Ridge orientation: transverse
Section19.js:1345   Short wall height: 5.15 m
   Tall wall height: 31.77 m
 [WOMBAT g_106 DEBUG] Mode: Target
 [WOMBAT g_106 DEBUG] Raw g_106 value: 5.15
 [WOMBAT g_106 DEBUG] isReferenceCalculation: false
 [WOMBAT g_106 DEBUG] Parsed typicalF2FHeight: 5.15
 [WOMBAT g_106 DEBUG] hasTypicalHeight: true
 [WOMBAT] Constraint validation (g_106):
   Intended wall height: 1 storeys × 5.15m = 5.15m
   Required wall volume: 5669.74 m³
   Total conditioned volume (d_105): 8319.50 m³
   ✓ Volume sufficient for 5.15m walls
 [WOMBAT] Volume-constrained wall height:
   Total conditioned volume (d_105): 8319.50 m³
   Roof volume: 14655.36 m³
   Basement volume: 0.00 m³
   Above-grade rectangular volume: -6335.86 m³
   Above-grade wall height: -5.755 m
 [WOMBAT] ⚠️  Above-grade volume very small (-6336 m³)
solveGeometry @ Section19.js:1569
calculateTargetModel @ Section19.js:2590
calculateAll @ Section19.js:2651
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
   This suggests inconsistent inputs:
solveGeometry @ Section19.js:1572
calculateTargetModel @ Section19.js:2590
calculateAll @ Section19.js:2651
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
   - Total volume too small for roof + basement + walls
solveGeometry @ Section19.js:1573
calculateTargetModel @ Section19.js:2590
calculateAll @ Section19.js:2651
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
   - OR roof area too large (check if cathedral ceiling intended)
solveGeometry @ Section19.js:1574
calculateTargetModel @ Section19.js:2590
calculateAll @ Section19.js:2651
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
   - OR basement too deep for building volume
solveGeometry @ Section19.js:1577
calculateTargetModel @ Section19.js:2590
calculateAll @ Section19.js:2651
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT] ✓ Using intended wall height from g_106: 5.15m
 [WOMBAT] Volume fit: -12005.60 m³ deficit
 [WOMBAT] Using shed roof average wall height: 18.46m (short: 5.15m, tall: 31.77m)
 [WOMBAT] Volume-derived height was: 5.15m (overridden for shed roof asymmetry)
 [WOMBAT] Wall height verification:
   From volume: 18.462 m
   From wall area: 1.311 m
   Discrepancy: 92.9%
 [WOMBAT] Wall height discrepancy > 5% - volume and wall area may be inconsistent
solveGeometry @ Section19.js:1662
calculateTargetModel @ Section19.js:2590
calculateAll @ Section19.js:2651
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 18.461919995496547, totalHeight: 45.08575998648964, storyHeight: 18.461919995496547, stories: 1, …}
 [WOMBAT] Solving geometry from thermal constraints (Reference mode)...
 [WOMBAT] Footprint: 1100.92 m² (33.18m × 33.18m)
 [WOMBAT] Equal floorplates - no mezzanine
 [WOMBAT] Wall area: 1057.40 m² (from S12 g_107 checksum)
 [WOMBAT] Roof area ratio: 1.282 (roof/footprint)
 [WOMBAT] Gable roof calculation:
   Ridge: transverse (33.18m)
   Span: 33.18m
   Slope length: 21.27m
   Height: 13.31m
   Gable end area (each): 220.85m²
 [WOMBAT] Gable roof solved:
   Ridge height: 13.31 m
   Gable end area (both): 441.69 m²
   Ridge orientation: transverse
 [WOMBAT g_106 DEBUG] Mode: Reference
 [WOMBAT g_106 DEBUG] Raw g_106 value: null
 [WOMBAT g_106 DEBUG] isReferenceCalculation: true
 [WOMBAT g_106 DEBUG] Direct StateManager lookup ref_g_106: null
 [WOMBAT g_106 DEBUG] Parsed typicalF2FHeight: NaN
 [WOMBAT g_106 DEBUG] hasTypicalHeight: NaN
 [WOMBAT] Volume-constrained wall height:
   Total conditioned volume (d_105): 8319.50 m³
   Roof volume: 7327.68 m³
   Basement volume: 0.00 m³
   Above-grade rectangular volume: 991.82 m³
   Above-grade wall height: 0.901 m
 [WOMBAT] Wall height verification:
   From volume: 0.901 m
   From wall area: 4.639 m
   Discrepancy: 414.9%
 [WOMBAT] Wall height discrepancy > 5% - volume and wall area may be inconsistent
solveGeometry @ Section19.js:1662
calculateReferenceModel @ Section19.js:2618
calculateAll @ Section19.js:2652
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
 [WOMBAT] Geometry solved (Reference mode): {footprint: {…}, height: 0.9009015362414798, totalHeight: 14.212821531738026, storyHeight: 0.9009015362414798, stories: 1, …}
 [WOMBAT calculateAll] Updating visualization for mode: target
 🎨 [WOMBAT updateVisualization] Called with mode="target"
 🎨 [WOMBAT updateVisualization] isActivated = true
 🎨 [WOMBAT updateVisualization] isReference = false
 [WOMBAT] Solving geometry from thermal constraints (Target mode)...
 [WOMBAT] Footprint: 1100.92 m² (33.18m × 33.18m)
 [WOMBAT] Equal floorplates - no mezzanine
 [WOMBAT] Wall area: 1057.40 m² (from S12 g_107 checksum)
 [WOMBAT] Roof area ratio: 1.282 (roof/footprint)
 [WOMBAT] Shed roof geometry:
  Ridge: transverse, length: 33.18m
  Span: 33.18m
  Slope length: 42.54m
  Height rise: 26.62m
  Short wall: 5.15m
  Tall wall: 31.77m
  End wall area (both): 883.38m²
 [WOMBAT] Shed roof solved:
   Ridge height: 26.62 m
   Shed end area (both): 883.38 m²
   Ridge orientation: transverse
   Short wall height: 5.15 m
   Tall wall height: 31.77 m
 [WOMBAT g_106 DEBUG] Mode: Target
 [WOMBAT g_106 DEBUG] Raw g_106 value: 5.15
 [WOMBAT g_106 DEBUG] isReferenceCalculation: false
 [WOMBAT g_106 DEBUG] Parsed typicalF2FHeight: 5.15
 [WOMBAT g_106 DEBUG] hasTypicalHeight: true
 [WOMBAT] Constraint validation (g_106):
   Intended wall height: 1 storeys × 5.15m = 5.15m
   Required wall volume: 5669.74 m³
   Total conditioned volume (d_105): 8319.50 m³
   ✓ Volume sufficient for 5.15m walls
 [WOMBAT] Volume-constrained wall height:
   Total conditioned volume (d_105): 8319.50 m³
   Roof volume: 14655.36 m³
   Basement volume: 0.00 m³
   Above-grade rectangular volume: -6335.86 m³
   Above-grade wall height: -5.755 m
 [WOMBAT] ⚠️  Above-grade volume very small (-6336 m³)
solveGeometry @ Section19.js:1569
updateVisualization @ Section19.js:1797
calculateAll @ Section19.js:2661
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
   This suggests inconsistent inputs:
solveGeometry @ Section19.js:1572
updateVisualization @ Section19.js:1797
calculateAll @ Section19.js:2661
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
   - Total volume too small for roof + basement + walls
solveGeometry @ Section19.js:1573
updateVisualization @ Section19.js:1797
calculateAll @ Section19.js:2661
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1574   - OR roof area too large (check if cathedral ceiling intended)
solveGeometry @ Section19.js:1574
updateVisualization @ Section19.js:1797
calculateAll @ Section19.js:2661
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1577   - OR basement too deep for building volume
solveGeometry @ Section19.js:1577
updateVisualization @ Section19.js:1797
calculateAll @ Section19.js:2661
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1584 [WOMBAT] ✓ Using intended wall height from g_106: 5.15m
Section19.js:1592 [WOMBAT] Volume fit: -12005.60 m³ deficit
Section19.js:1633 [WOMBAT] Using shed roof average wall height: 18.46m (short: 5.15m, tall: 31.77m)
Section19.js:1638 [WOMBAT] Volume-derived height was: 5.15m (overridden for shed roof asymmetry)
Section19.js:1656 [WOMBAT] Wall height verification:
Section19.js:1657   From volume: 18.462 m
Section19.js:1658   From wall area: 1.311 m
Section19.js:1659   Discrepancy: 92.9%
Section19.js:1662 [WOMBAT] Wall height discrepancy > 5% - volume and wall area may be inconsistent
solveGeometry @ Section19.js:1662
updateVisualization @ Section19.js:1797
calculateAll @ Section19.js:2661
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this warningAI
Section19.js:1756 [WOMBAT] Geometry solved (Target mode): {footprint: {…}, height: 18.461919995496547, totalHeight: 45.08575998648964, storyHeight: 18.461919995496547, stories: 1, …}
Section19.js:1802 🎨 [WOMBAT updateVisualization] SVG element found: true
Section19.js:1809 🎨 [WOMBAT] Delegating render to wombatRender.js
wombatRender.js:1288 [WombatRender] renderShedRoof called with:
wombatRender.js:1289   width: 33.18011452662574 length: 33.18011452662573 wallHeight: 18.461919995496547 roofHeight: 26.623839990993094
wombatRender.js:1290   shedData: {type: 'shed', height: 26.623839990993094, ridgeOrientation: 'transverse', ridgeLength: 33.18011452662574, span: 33.18011452662573, …}
wombatRender.js:1294 [WombatRender] Invalid shed roof data
renderShedRoof @ wombatRender.js:1294
render @ wombatRender.js:2062
updateVisualization @ Section19.js:1810
calculateAll @ Section19.js:2661
routeToSectionModeManager @ FieldManager.js:221
(anonymous) @ FieldManager.js:1200Understand this errorAI
Section19.js:2665 [WOMBAT calculateAll] Calling updateCalculatedDisplayValues()
Section19.js:202 [WOMBAT] updateCalculatedDisplayValues() called for mode="target"
Section19.js:2669 [WOMBAT calculateAll] Complete
FieldManager.js:222 [FieldManager] Called sect19.calculateAll() after d_159 change