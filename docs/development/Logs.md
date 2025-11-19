MobileDetect.js:113 Desktop device detected
ZenMaster.js:1001 
🧘 ZenMaster loaded. Use these commands to discover true dependencies:

  zenEnable()         - Start tracing all getValue() calls
  zenDisable()        - Stop tracing and restore original methods
  zenReset()          - Clear all traced data
  zenReport()         - Print discovered dependencies
  zenValidate()       - Compare discovered vs declared dependencies
  zenLabels()         - Find fields missing labels (for graph viz & debugging)
  zenTypos()          - Detect potential typos in dependency declarations
  zenExport()         - Export dependency graph JSON to console
  zenExportFile()     - Download dependency graph as JSON file
  zenExportSections() - Generate code snippets for section definitions
  zenStatus()         - Show current tracing status

Example workflow:
  1. zenEnable()
  2. Interact with the app (change values, trigger calculations)
  3. zenValidate()      // Find MISSING deps & conditional patterns
  4. zenLabels()        // Find unlabeled fields for graph viz
  5. zenTypos()         // Find likely typos in dependency declarations
  6. zenExportFile()    // Download for use in Dependency.js
  7. zenDisable()

Section02.js:714 [S02] Registered dependencies from field metadata
Section02.js:1131 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Reference defaults set from field definitions - single source of truth with mode overrides
 [StateManager DEBUG] ref_h_15 setValue: "1427.20" (state: calculated, prev: undefined)
 [StateManager] ref_h_15 setValue stack trace:
setValue @ StateManager.js:366
(anonymous) @ Section02.js:1950
initialize @ Section02.js:1942
onSectionRendered @ Section02.js:1356
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 ✅ S02: Header controls injected successfully
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Refreshing UI for TARGET mode
 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
 [S02] Updated h_13 (service life) slider = "50" (target mode)
 [S02] Updated h_15 = "1,427.20" (target mode)
 [S02] Updated i_17 = "8154" (target mode)
 [S02] Updated l_12 = "$0.1300" (target mode)
 [S02] Updated l_13 = "$0.5070" (target mode)
 [S02] Updated l_14 = "$1.6200" (target mode)
 [S02] Updated l_15 = "$180.00" (target mode)
 [S02] Updated l_16 = "$1.5000" (target mode)
 S03: Sliders initialized via FieldManager
 S03: Section rendered - initializing Self-Contained State Module.
 S03: Target defaults set from field definitions - single source of truth
 S03: Reference defaults set from field definitions - single source of truth
 S03: Header controls setup complete
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 S12: Section rendered - initializing Pattern A Dual-State Module.
 S12: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [S12] ✅ CLIMATE LISTENERS ADDED - Ready for d_20/d_21 changes
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=0, d_21=0
 [S12DB] REF CLIMATE: d_20=0, d_21=0, d_22=0, h_22=0
 [S12DB] REF h_101 calc: (0*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_102
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1538
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_106
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1544
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: g_101
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1730
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_102
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1731
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_104
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1732
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_107
setCalculatedValue @ Section12.js:1360
calculateWWR @ Section12.js:1758
calculateTargetModel @ Section12.js:2542
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_107
setCalculatedValue @ Section12.js:1360
calculateWWR @ Section12.js:1765
calculateTargetModel @ Section12.js:2542
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1853
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 DOM element not found for calculated field: h_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2188
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2194
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: j_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2200
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2206
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: h_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2212
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2218
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: j_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2224
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2230
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2385
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2386
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_103
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2387
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2388
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
onSectionRendered @ Section12.js:2783
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 S12: Pattern A initialization complete.
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=0, d_21=0
 [S12DB] REF CLIMATE: d_20=0, d_21=0, d_22=1960, h_22=0
 [S12DB] REF h_101 calc: (0*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=0, d_21=0
 [S12DB] REF CLIMATE: d_20=0, d_21=0, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (0*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=0
 [S12DB] REF CLIMATE: d_20=4600, d_21=0, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
Section12.js:2343 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
Section12.js:2346 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
Section12.js:2526 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section12.js:1716 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
Section12.js:2069 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:2147 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2171 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
Section12.js:2174 [S12DB] TGT i_101 result: 0 * 0 = 0
Section12.js:2323 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
Section12.js:2350 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
Section12.js:2353 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
Section12.js:347 [Section12] Calculated display values updated for target mode
Section03.js:2713 S03: Self-Contained State Module initialization complete
Section05.js:125 S05: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section06.js:814 S06: Pattern A initialization starting...
Section06.js:121 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section06.js:592 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:587 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:278 🔄 [S06] updateCalculatedDisplayValues: mode=target
Section06.js:841 S06: Pattern A initialization complete.
Section07.js:1840 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
Section07.js:48 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
Section07.js:53 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
Section07.js:61 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_49
 ✅ [S07] getFieldDefault: Found default for e_49 = "40.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_50
 ✅ [S07] getFieldDefault: Found default for e_50 = "10,000.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
 ✅ [S07] ReferenceState.setDefaults: All 7 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 7 Reference defaults with ref_ prefix
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
 [S08] S04 listeners setup complete
 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:50 S09: Target defaults loaded from field definitions
Section09.js:162 S09: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6, lighting: 2.0
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:578 S09: Header controls injected successfully
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_107
setCalculatedValue @ Section12.js:1360
calculateWWR @ Section12.js:1758
calculateTargetModel @ Section12.js:2542
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_107
setCalculatedValue @ Section12.js:1360
calculateWWR @ Section12.js:1765
calculateTargetModel @ Section12.js:2542
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1853
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 7.5 = 0
 [S12DB] TGT g_104 calc: (0*7.5 + 0*1e-7)/7.5000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=70.19159281437125 → i_104=70.19159281437125
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_103
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2387
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2388
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 88.64 = 0
 [S12DB] TGT g_104 calc: (0*88.64 + 0*1e-7)/88.64000109999999 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=829.571038275449 → i_104=829.571038275449
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 92.47 = 0
 [S12DB] TGT g_104 calc: (0*92.47 + 0*1e-7)/92.47000109999999 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=865.415545005988 → i_104=865.415545005988
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 251.47 = 0
 [S12DB] TGT g_104 calc: (0*251.47 + 0*1e-7)/251.4700011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=2353.477312670659 → i_104=2353.477312670659
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section10.js:2431
storeTargetResults @ Section10.js:2427
calculateTargetModel @ Section10.js:2082
calculateAll @ Section10.js:2053
onSectionRendered @ Section10.js:3055
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 0 = 0
 [S12DB] REF g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=0 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11 REF DEFAULTS] Published ref_d_85=1411.52 to StateManager
 [S11 REF DEFAULTS] Published ref_d_86=712.97 to StateManager
 [S11 REF DEFAULTS] Published ref_d_87=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_94=0.00 to StateManager
 [S11 REF DEFAULTS] Published ref_d_95=1100.42 to StateManager
 [S11 REF DEFAULTS] Published ref_d_96=29.70 to StateManager
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S12] U-agg REF: TB%=50 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 2476.6199999999994 = 0
 [S12DB] REF g_104 calc: (0*2476.6199999999994 + 0*1100.42)/3577.0400009999994 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=25727.28888888889 → i_104=25727.28888888889
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.000000, g_102=0.000000
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] REF i_101 result: 0 * 2476.6199999999994 = 0
 [S12DB] REF g_104 calc: (0*2476.6199999999994 + 0*1100.42)/3577.0400009999994 = 0
 [S12DB] REF ROW104: i_101=0, i_102=0, i_103=25727.28888888889 → i_104=25727.28888888889
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 REF DEFAULTS] Published ref_d_97=50 to StateManager
 [S11 REF DEFAULTS] Published ref_f_85=5.30 to StateManager
 [S11 REF DEFAULTS] Published ref_f_86=4.10 to StateManager
 [S11 REF DEFAULTS] Published ref_f_87=6.60 to StateManager
 [S11 REF DEFAULTS] Published ref_f_94=1.80 to StateManager
 [S11 REF DEFAULTS] Published ref_f_95=3.50 to StateManager
 [S12] U-agg REF: TB%=50 → g_101=0.275665, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.2756648074309582*24)/1000 = 30.433394740377786
 [S12DB] REF i_101 result: 30.433394740377786 * 2476.6199999999994 = 75371.95408191442
 [S12DB] REF g_104 calc: (0.2756648074309582*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.3227041203021289
 [S12DB] REF ROW104: i_101=75371.95408191442, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=123283.7101708033
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 REF DEFAULTS] Published ref_g_88=1.990 to StateManager
 [S12] U-agg REF: TB%=50 → g_101=0.345449, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.3454487064546276*24)/1000 = 38.137537192590884
 [S12DB] REF i_101 result: 38.137537192590884 * 2476.6199999999994 = 94452.18736191442
 [S12DB] REF g_104 calc: (0.3454487064546276*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.3710201022178145
 [S12DB] REF ROW104: i_101=94452.18736191442, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=142363.94345080332
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 REF DEFAULTS] Published ref_g_89=1.420 to StateManager
 [S12] U-agg REF: TB%=50 → g_101=0.348743, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.34874267161682443*24)/1000 = 38.50119094649742
 [S12DB] REF i_101 result: 38.50119094649742 * 2476.6199999999994 = 95352.81952191441
 [S12DB] REF g_104 calc: (0.34874267161682443*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.3733007308934008
 [S12DB] REF ROW104: i_101=95352.81952191441, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=143264.5756108033
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 REF DEFAULTS] Published ref_g_90=1.420 to StateManager
 [S12] U-agg REF: TB%=50 → g_101=0.485490, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.4854895282197753*24)/1000 = 53.59804391546319
 [S12DB] REF i_101 result: 53.59804391546319 * 2476.6199999999994 = 132741.98752191442
 [S12DB] REF g_104 calc: (0.4854895282197753*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.4679795714725728
 [S12DB] REF ROW104: i_101=132741.98752191442, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=180653.74361080333
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 REF DEFAULTS] Published ref_g_91=1.420 to StateManager
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 REF DEFAULTS] Published ref_g_92=1.420 to StateManager
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 352.13 = 0
 [S12DB] TGT g_104 calc: (0*352.13 + 0*1e-7)/352.1300011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3295.54207702994 → i_104=3295.54207702994
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 REF DEFAULTS] Published ref_g_93=1.420 to StateManager
 S11: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
 [S11 Area Sync] DUAL-STATE SYNC - populating BOTH Target and Reference states
 [S11 Area Sync] Reason: d_88=undefined, ref_d_73 in StateManager=7.50
 [S11 Area Sync] d_88 REFERENCE = 7.50
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
Section12.js:2167 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2319 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
Section12.js:2343 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
Section12.js:2346 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
Section12.js:2526 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section12.js:1360 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1716 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
Section12.js:1360 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:2069 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:1360 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:2147 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2171 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
Section12.js:2174 [S12DB] TGT i_101 result: 0 * 344.63 = 0
Section12.js:2323 [S12DB] TGT g_104 calc: (0*344.63 + 0*1e-7)/344.6300011 = 0
Section12.js:2350 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=3225.3504842155694 → i_104=3225.3504842155694
Section12.js:2353 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
Section12.js:1360 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:347 [Section12] Calculated display values updated for target mode
Section11.js:2072 [S11 Area Sync] d_89 REFERENCE = 81.14
Section12.js:1716 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
Section12.js:2062 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
Section12.js:2136 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2164 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
Section12.js:2167 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2319 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
Section12.js:2343 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
Section12.js:2346 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
Section12.js:2526 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section12.js:1360 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1716 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
Section12.js:1360 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 263.49 = 0
 [S12DB] TGT g_104 calc: (0*263.49 + 0*1e-7)/263.49000110000003 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=2465.9710387544906 → i_104=2465.9710387544906
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S11 Area Sync] d_90 REFERENCE = 3.83
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 259.65999999999997 = 0
 [S12DB] TGT g_104 calc: (0*259.65999999999997 + 0*1e-7)/259.6600011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=2430.1265320239518 → i_104=2430.1265320239518
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S11 Area Sync] d_91 REFERENCE = 159.00
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 100.66 = 0
 [S12DB] TGT g_104 calc: (0*100.66 + 0*1e-7)/100.66000109999999 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=942.0647643592814 → i_104=942.0647643592814
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S11 Area Sync] d_92 REFERENCE = 100.66
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 DOM element not found for calculated field: d_107
setCalculatedValue @ Section12.js:1360
calculateWWR @ Section12.js:1758
calculateTargetModel @ Section12.js:2542
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_107
setCalculatedValue @ Section12.js:1360
calculateWWR @ Section12.js:1765
calculateTargetModel @ Section12.js:2542
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1853
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_103
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2387
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2388
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section11.js:468
setCalculatedValue @ Section11.js:1887
(anonymous) @ Section11.js:2076
syncAreasFromS10 @ Section11.js:2051
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S11 Area Sync] d_93 REFERENCE = 0.00
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering recalculation...
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2164 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
Section12.js:2167 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2319 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
Section12.js:2343 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
Section12.js:2346 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
Section12.js:2526 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section12.js:1716 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
Section12.js:2069 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:2147 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2171 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
Section12.js:2174 [S12DB] TGT i_101 result: 0 * 0 = 0
Section12.js:2323 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
Section12.js:2350 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
Section12.js:2353 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
Section12.js:347 [Section12] Calculated display values updated for target mode
Section12.js:1716 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
Section12.js:2062 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
Section12.js:2136 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2164 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
Section12.js:2167 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2319 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
Section12.js:2343 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
Section12.js:2346 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
Section12.js:2526 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section12.js:1716 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
Section12.js:2069 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:2147 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2171 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
Section12.js:2174 [S12DB] TGT i_101 result: 0 * 0 = 0
Section12.js:2323 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
Section12.js:2350 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
Section12.js:2353 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
Section12.js:347 [Section12] Calculated display values updated for target mode
Section12.js:1716 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
Section12.js:2062 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
Section12.js:2136 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2164 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
Section12.js:2167 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2319 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
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
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.000000, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0*24)/1000 = 0
 [S12DB] TGT i_101 result: 0 * 0 = 0
 [S12DB] TGT g_104 calc: (0*0 + 0*1e-7)/0.0000011 = 0
 [S12DB] TGT ROW104: i_101=0, i_102=0, i_103=0 → i_104=0
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-1895.4 → k_104=0
 [Section12] Calculated display values updated for target mode
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
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=20 → g_101=0.128342, g_102=0.000000
 DOM element not found for calculated field: g_101
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1730
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_104
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1732
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1853
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.1283422459893048*24)/1000 = 14.168983957219249
 [S12DB] TGT i_101 result: 14.168983957219249 * 1411.52 = 19999.804235294112
 DOM element not found for calculated field: h_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2188
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2194
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: j_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2200
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2206
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT g_104 calc: (0.1283422459893048*1411.52 + 0*1e-7)/1411.5200011000002 = 0.12834224588928744
 [S12DB] TGT ROW104: i_101=19999.804235294112, i_102=0, i_103=13210.244945245508 → i_104=33210.049180539616
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-4784.346947053833 → k_104=852.1655717647056
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2385
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_103
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2387
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2388
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_101
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1532
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1550
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_105
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1556
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.000000
 DOM element not found for calculated field: g_101
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1730
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_104
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1732
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_109
setCalculatedValue @ Section12.js:1360
calculateACH50Target @ Section12.js:1839
calculateTargetModel @ Section12.js:2544
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: d_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1880
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_110
setCalculatedValue @ Section12.js:1360
calculateAe10 @ Section12.js:1887
calculateTargetModel @ Section12.js:2545
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 DOM element not found for calculated field: i_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2095
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_103
setCalculatedValue @ Section12.js:1360
calculateAirLeakageHeatLoss @ Section12.js:2101
calculateTargetModel @ Section12.js:2546
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
 DOM element not found for calculated field: h_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2188
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2194
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: j_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2200
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2206
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0*1e-7)/2124.4900010999995 = 0.14546768514537806
 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=0, i_103=19882.844935760477 → i_104=54001.37347598733
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-4784.346947053833 → k_104=1453.7459986705355
 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2385
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: l_103
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2387
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0*1e-7)/2124.4900010999995 = 0.14546768514537806
 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=0, i_103=19882.844935760477 → i_104=54001.37347598733
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-4784.346947053833 → k_104=1453.7459986705355
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.000000
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0*1e-7)/2124.4900010999995 = 0.14546768514537806
 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=0, i_103=19882.844935760477 → i_104=54001.37347598733
 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-4784.346947053833 → k_104=1453.7459986705355
 [Section12] Calculated display values updated for target mode
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 DOM element not found for calculated field: d_102
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1538
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 DOM element not found for calculated field: d_106
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1544
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.324324
 DOM element not found for calculated field: g_102
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1731
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: g_104
setCalculatedValue @ Section12.js:1360
calculateCombinedUValue @ Section12.js:1732
calculateTargetModel @ Section12.js:2541
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
 DOM element not found for calculated field: h_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2212
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: i_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2218
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: j_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2224
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 DOM element not found for calculated field: k_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeHeatLossGain @ Section12.js:2230
calculateTargetModel @ Section12.js:2552
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:2323 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0.3243243243243243*1100.42)/3224.9100009999997 = 0.20649804656284781
Section12.js:2350 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=16788.24544864865, i_103=19882.844935760477 → i_104=70789.61892463599
Section12.js:2353 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-4784.346947053833 → k_104=-12936.178671599733
Section12.js:1360 DOM element not found for calculated field: i_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: k_104
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: l_101
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2385
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: l_102
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2386
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1360 DOM element not found for calculated field: l_103
setCalculatedValue @ Section12.js:1360
calculateEnvelopeTotals @ Section12.js:2387
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:347 [Section12] Calculated display values updated for target mode
Section12.js:1716 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
Section12.js:2062 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
Section12.js:2136 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2164 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
Section12.js:2167 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2319 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
Section12.js:2343 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
Section12.js:2346 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
Section12.js:2526 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section12.js:1360 DOM element not found for calculated field: d_106
setCalculatedValue @ Section12.js:1360
calculateVolumeMetrics @ Section12.js:1544
calculateTargetModel @ Section12.js:2540
calculateAll @ Section12.js:2405
(anonymous) @ Section12.js:2900
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section11.js:2874
calculateTargetModel @ Section11.js:2871
calculateAll @ Section11.js:2901
syncAreasFromS10 @ Section11.js:2111
onSectionRendered @ Section11.js:3240
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section12.js:1716 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.324324
Section12.js:2069 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:2147 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2171 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
Section12.js:2174 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
Section12.js:2323 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0.3243243243243243*1100.42)/3224.9100009999997 = 0.20649804656284781
Section12.js:2350 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=16788.24544864865, i_103=19882.844935760477 → i_104=70789.61892463599
Section12.js:2353 [S12DB] TGT ROW104: h_21="StaticCapacitance", k_98=-4784.346947053833 → k_104=-12936.178671599733
Section12.js:347 [Section12] Calculated display values updated for target mode
Section11.js:2113 [S11 Area Sync] Sync completed successfully
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:3249 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [S13] 🔗 Published ref_d_120=3333.33 L/s for Reference ventilation energy calc
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=11067.47 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=69858.06 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=11067.47 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=69858.06 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=11067.47 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=69858.06 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Section13.js:2846 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
Section13.js:3030 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 S14: Pattern A initialization complete.
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 ✅ S15: Header controls injected successfully
 ✅ S16: Header controls injected successfully
 [S18] Notes section rendered
 [S18] Notes & QC Monitor section loaded
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
Section02.js:1759 S02: Target defaults set from field definitions - single source of truth
Section02.js:1711 S02: Loaded and merged Target state from localStorage
Section02.js:1868 S02: Reference defaults set from field definitions - single source of truth with mode overrides
StateManager.js:363 [StateManager DEBUG] ref_h_15 setValue: "1427.20" (state: calculated, prev: undefined)
StateManager.js:366 [StateManager] ref_h_15 setValue stack trace:
setValue @ StateManager.js:366
(anonymous) @ Section02.js:1950
initialize @ Section02.js:1942
onSectionRendered @ Section02.js:1356
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
Section02.js:714 [S02] Registered dependencies from field metadata
Section02.js:1131 [S02] "Set Values" button wired successfully
Section02.js:1545 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:2012 [S02] Refreshing UI for TARGET mode
Section02.js:2070 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
Section02.js:2087 [S02] Updated h_13 (service life) slider = "50" (target mode)
Section02.js:2137 [S02] Updated h_15 = "1,427.20" (target mode)
Section02.js:2137 [S02] Updated i_17 = "8154" (target mode)
Section02.js:2137 [S02] Updated l_12 = "$0.1300" (target mode)
Section02.js:2137 [S02] Updated l_13 = "$0.5070" (target mode)
Section02.js:2137 [S02] Updated l_14 = "$1.6200" (target mode)
Section02.js:2137 [S02] Updated l_15 = "$180.00" (target mode)
Section02.js:2137 [S02] Updated l_16 = "$1.5000" (target mode)
Section03.js:2482 S03: Sliders initialized via FieldManager
Section03.js:2640 S03: Section rendered - initializing Self-Contained State Module.
Section03.js:2654 S03: ModeManager exposed globally for cross-section integration.
Section03.js:518 S03: Checking climate data availability (attempt 1/10)
Section03.js:526 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
Section03.js:2626 S03: Synced province "ON" to StateManager for cross-section communication
Section03.js:1313 City dropdown updated for ON - selected: Alexandria
Section03.js:2482 S03: Sliders initialized via FieldManager
Section03.js:1252 Section03: Province selected: ON
Section03.js:1313 City dropdown updated for ON - selected: Alexandria
Section12.js:1716 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.324324
Section12.js:2069 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:2147 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2171 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
Section12.js:2174 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
Section12.js:2323 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0.3243243243243243*1100.42)/3224.9100009999997 = 0.20649804656284781
Section12.js:2350 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=16788.24544864865, i_103=19882.844935760477 → i_104=70789.61892463599
Section12.js:2353 [S12DB] TGT ROW104: h_21="Capacitance", k_98=0 → k_104=0
Section12.js:347 [Section12] Calculated display values updated for target mode
Section03.js:2713 S03: Self-Contained State Module initialization complete
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_49
 ✅ [S07] getFieldDefault: Found default for e_49 = "40.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_50
 ✅ [S07] getFieldDefault: Found default for e_50 = "10,000.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
 ✅ [S07] ReferenceState.setDefaults: All 7 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 7 Reference defaults with ref_ prefix
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section08.js:859 [S08] S04 listeners setup complete
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2048 [S11 Area Sync] Starting sync in target mode
Section11.js:2094 [S11 Area Sync] d_88 = 7.50 (from d_73)
Section11.js:2094 [S11 Area Sync] d_89 = 81.14 (from d_74)
Section11.js:2094 [S11 Area Sync] d_90 = 3.83 (from d_75)
Section11.js:2094 [S11 Area Sync] d_91 = 159.00 (from d_76)
Section11.js:2094 [S11 Area Sync] d_92 = 100.66 (from d_77)
Section11.js:2094 [S11 Area Sync] d_93 = 0.00 (from d_78)
Section11.js:2106 [S11 Area Sync] Refreshing UI...
Section11.js:2110 [S11 Area Sync] Triggering recalculation...
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2113 [S11 Area Sync] Sync completed successfully
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:3249 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section14.js:1501 S14: Pattern A initialization complete.
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateValues @ Section15.js:1879
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
onSectionRendered @ Section15.js:2351
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section18.js:1242 [S18] Notes section rendered
Section18.js:21 [S18] Notes & QC Monitor section loaded
Section03.js:1252 Section03: Province selected: ON
Section03.js:1313 City dropdown updated for ON - selected: Alexandria
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Clock.js:28 [CLOCK] Performance monitoring initialized
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Loaded and merged Target state from localStorage
 S02: Reference defaults set from field definitions - single source of truth with mode overrides
 [StateManager DEBUG] ref_h_15 setValue: "1427.20" (state: calculated, prev: undefined)
 [StateManager] ref_h_15 setValue stack trace:
setValue @ StateManager.js:366
(anonymous) @ Section02.js:1950
initialize @ Section02.js:1942
onSectionRendered @ Section02.js:1356
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Refreshing UI for TARGET mode
 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
 [S02] Updated h_13 (service life) slider = "50" (target mode)
 [S02] Updated h_15 = "1,427.20" (target mode)
 [S02] Updated i_17 = "8154" (target mode)
 [S02] Updated l_12 = "$0.1300" (target mode)
 [S02] Updated l_13 = "$0.5070" (target mode)
 [S02] Updated l_14 = "$1.6200" (target mode)
 [S02] Updated l_15 = "$180.00" (target mode)
 [S02] Updated l_16 = "$1.5000" (target mode)
 S03: Sliders initialized via FieldManager
 S03: Section rendered - initializing Self-Contained State Module.
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0.3243243243243243*1100.42)/3224.9100009999997 = 0.20649804656284781
 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=16788.24544864865, i_103=19882.844935760477 → i_104=70789.61892463599
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 S03: Self-Contained State Module initialization complete
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_49
Section07.js:339 ✅ [S07] getFieldDefault: Found default for e_49 = "40.00"
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_50
Section07.js:339 ✅ [S07] getFieldDefault: Found default for e_50 = "10,000.00"
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
Section07.js:339 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
Section07.js:116 ✅ [S07] ReferenceState.setDefaults: All 7 field defaults loaded
Section07.js:157 🔗 [S07] ReferenceState.setDefaults: Published all 7 Reference defaults with ref_ prefix
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section08.js:859 [S08] S04 listeners setup complete
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
 [S09] Updated calculated display values for target mode
 [S09] 🔗 Published ref_i_63=4380 for S13
 [S09] Updated calculated display values for target mode
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
 [S09] 🔗 Published initial ref_d_63=126 for S07
 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
 S09: UI refreshed for target mode
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section10.js:3025 S10: Section rendered - initializing Self-Contained State Module.
Section10.js:3000 S10: Simplified global StateManager listeners added
Section10.js:3049 S10: ModeManager exposed globally for cross-section integration.
Section10.js:2048 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
Section10.js:2056 [S10 DEBUG] Dual-engine calculations complete in target mode
Section11.js:2143 [S11] Setting up S10 area listeners...
Section11.js:2178 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3202 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:2143 [S11] Setting up S10 area listeners...
Section11.js:2178 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3224 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3232 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2048 [S11 Area Sync] Starting sync in target mode
Section11.js:2094 [S11 Area Sync] d_88 = 7.50 (from d_73)
Section11.js:2094 [S11 Area Sync] d_89 = 81.14 (from d_74)
Section11.js:2094 [S11 Area Sync] d_90 = 3.83 (from d_75)
Section11.js:2094 [S11 Area Sync] d_91 = 159.00 (from d_76)
Section11.js:2094 [S11 Area Sync] d_92 = 100.66 (from d_77)
Section11.js:2094 [S11 Area Sync] d_93 = 0.00 (from d_78)
Section11.js:2106 [S11 Area Sync] Refreshing UI...
Section11.js:2110 [S11 Area Sync] Triggering recalculation...
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2113 [S11 Area Sync] Sync completed successfully
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 S14: Pattern A initialization complete.
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateValues @ Section15.js:1879
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
onSectionRendered @ Section15.js:2351
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S18] Notes section rendered
 [S18] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
(anonymous) @ init.js:863Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [ReferenceToggle] Master Reference Toggle initialization complete
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Loaded and merged Target state from localStorage
 S02: Reference defaults set from field definitions - single source of truth with mode overrides
 [StateManager DEBUG] ref_h_15 setValue: "1427.20" (state: calculated, prev: undefined)
 [StateManager] ref_h_15 setValue stack trace:
setValue @ StateManager.js:366
(anonymous) @ Section02.js:1950
initialize @ Section02.js:1942
onSectionRendered @ Section02.js:1356
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Refreshing UI for TARGET mode
 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
 [S02] Updated h_13 (service life) slider = "50" (target mode)
Section02.js:2137 [S02] Updated h_15 = "1,427.20" (target mode)
Section02.js:2137 [S02] Updated i_17 = "8154" (target mode)
Section02.js:2137 [S02] Updated l_12 = "$0.1300" (target mode)
Section02.js:2137 [S02] Updated l_13 = "$0.5070" (target mode)
Section02.js:2137 [S02] Updated l_14 = "$1.6200" (target mode)
Section02.js:2137 [S02] Updated l_15 = "$180.00" (target mode)
Section02.js:2137 [S02] Updated l_16 = "$1.5000" (target mode)
Section03.js:2482 S03: Sliders initialized via FieldManager
Section03.js:2640 S03: Section rendered - initializing Self-Contained State Module.
Section03.js:2654 S03: ModeManager exposed globally for cross-section integration.
Section03.js:518 S03: Checking climate data availability (attempt 1/10)
Section03.js:526 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
Section03.js:2626 S03: Synced province "ON" to StateManager for cross-section communication
Section03.js:1313 City dropdown updated for ON - selected: Alexandria
Section03.js:2482 S03: Sliders initialized via FieldManager
Section03.js:1252 Section03: Province selected: ON
Section03.js:1313 City dropdown updated for ON - selected: Alexandria
Section12.js:1716 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.324324
Section12.js:2069 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
Section12.js:2147 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2171 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
Section12.js:2174 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
Section12.js:2323 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0.3243243243243243*1100.42)/3224.9100009999997 = 0.20649804656284781
Section12.js:2350 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=16788.24544864865, i_103=19882.844935760477 → i_104=70789.61892463599
Section12.js:2353 [S12DB] TGT ROW104: h_21="Capacitance", k_98=0 → k_104=0
Section12.js:347 [Section12] Calculated display values updated for target mode
Section03.js:2713 S03: Self-Contained State Module initialization complete
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section02.js:906 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section06.js:814 S06: Pattern A initialization starting...
Section06.js:121 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section06.js:592 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
Section06.js:587 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_49
 ✅ [S07] getFieldDefault: Found default for e_49 = "40.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_50
 ✅ [S07] getFieldDefault: Found default for e_50 = "10,000.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
 ✅ [S07] ReferenceState.setDefaults: All 7 field defaults loaded
 🔗 [S07] ReferenceState.setDefaults: Published all 7 Reference defaults with ref_ prefix
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section08.js:859 [S08] S04 listeners setup complete
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
 S10: Section rendered - initializing Self-Contained State Module.
 S10: Simplified global StateManager listeners added
 S10: ModeManager exposed globally for cross-section integration.
 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
 [S10 DEBUG] Dual-engine calculations complete in target mode
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: Section rendered - initializing Self-Contained State Module.
 [S11] Setting up S10 area listeners...
 [S11] ✅ S10 area listeners registered for both modes
 S11: ModeManager exposed globally for cross-section integration.
 [S11 Area Sync] S11 initialization complete - sync functions now enabled
 [S11 Area Sync] Starting sync in target mode
 [S11 Area Sync] d_88 = 7.50 (from d_73)
 [S11 Area Sync] d_89 = 81.14 (from d_74)
 [S11 Area Sync] d_90 = 3.83 (from d_75)
 [S11 Area Sync] d_91 = 159.00 (from d_76)
 [S11 Area Sync] d_92 = 100.66 (from d_77)
 [S11 Area Sync] d_93 = 0.00 (from d_78)
 [S11 Area Sync] Refreshing UI...
 [S11 Area Sync] Triggering recalculation...
 [S11] calculateAll TRIGGERED. isReferenceMode: false
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] 🔵 REF CLIMATE READ: h_22=-1680
 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S11 Area Sync] Sync completed successfully
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:3249 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 S14: Section rendered - initializing Pattern A Dual-State Module.
 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section14.js:1501 S14: Pattern A initialization complete.
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateValues @ Section15.js:1879
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
onSectionRendered @ Section15.js:2351
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S18] Notes section rendered
 [S18] Notes & QC Monitor section loaded
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
(anonymous) @ index.html:1209Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
(anonymous) @ index.html:1209Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 S02: Target defaults set from field definitions - single source of truth
 S02: Loaded and merged Target state from localStorage
 S02: Reference defaults set from field definitions - single source of truth with mode overrides
 [StateManager DEBUG] ref_h_15 setValue: "1427.20" (state: calculated, prev: undefined)
 [StateManager] ref_h_15 setValue stack trace:
setValue @ StateManager.js:366
(anonymous) @ Section02.js:1950
initialize @ Section02.js:1942
onSectionRendered @ Section02.js:1356
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [S02] Registered dependencies from field metadata
 [S02] "Set Values" button wired successfully
 [S02] Area updated to 1427.2 - letting downstream sections handle calculations
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Refreshing UI for TARGET mode
 [S02] Updated h_12 (reporting year) slider = "2022" (target mode)
 [S02] Updated h_13 (service life) slider = "50" (target mode)
 [S02] Updated h_15 = "1,427.20" (target mode)
 [S02] Updated i_17 = "8154" (target mode)
 [S02] Updated l_12 = "$0.1300" (target mode)
 [S02] Updated l_13 = "$0.5070" (target mode)
 [S02] Updated l_14 = "$1.6200" (target mode)
 [S02] Updated l_15 = "$180.00" (target mode)
 [S02] Updated l_16 = "$1.5000" (target mode)
 S03: Sliders initialized via FieldManager
 S03: Section rendered - initializing Self-Contained State Module.
 S03: ModeManager exposed globally for cross-section integration.
 S03: Checking climate data availability (attempt 1/10)
 S03: Climate data available (13) ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
 S03: Synced province "ON" to StateManager for cross-section communication
 City dropdown updated for ON - selected: Alexandria
 S03: Sliders initialized via FieldManager
 Section03: Province selected: ON
 City dropdown updated for ON - selected: Alexandria
 [S12] U-agg TGT: TB%=20 → g_101=0.145468, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.14546768522069703*24)/1000 = 16.059632448364955
 [S12DB] TGT i_101 result: 16.059632448364955 * 2124.49 = 34118.52854022686
 [S12DB] TGT g_104 calc: (0.14546768522069703*2124.49 + 0.3243243243243243*1100.42)/3224.9100009999997 = 0.20649804656284781
 [S12DB] TGT ROW104: i_101=34118.52854022686, i_102=16788.24544864865, i_103=19882.844935760477 → i_104=70789.61892463599
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=0 → k_104=0
 [Section12] Calculated display values updated for target mode
 S03: Self-Contained State Module initialization complete
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 [S02] Reference CALCULATED results stored (d_16 only - INPUT fields excluded)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization starting...
 S06: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔄 [S06] updateCalculatedDisplayValues: mode=target
 S06: Pattern A initialization complete.
 🚀 [S07] onSectionRendered: Initializing state defaults from FieldDefinitions
 🔧 [S07] TargetState.setDefaults: Initializing from FieldDefinitions
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
 ✅ [S07] TargetState.setDefaults: d_49="User Defined", d_51="Heatpump"
 🌐 [S07] TargetState.setDefaults: Published to StateManager
 🔧 [S07] ReferenceState.setDefaults: Initializing Reference-specific defaults
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_49
 ✅ [S07] getFieldDefault: Found default for e_49 = "40.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=e_50
 ✅ [S07] getFieldDefault: Found default for e_50 = "10,000.00"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_53
 ✅ [S07] getFieldDefault: Found default for d_53 = "0"
 🔍 [S07] getFieldDefault: Looking for default for fieldId=k_52
 ✅ [S07] getFieldDefault: Found default for k_52 = "0.90"
Section07.js:116 ✅ [S07] ReferenceState.setDefaults: All 7 field defaults loaded
Section07.js:157 🔗 [S07] ReferenceState.setDefaults: Published all 7 Reference defaults with ref_ prefix
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_49
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_49 = "User Defined"
Section07.js:330 🔍 [S07] getFieldDefault: Looking for default for fieldId=d_51
Section07.js:339 ✅ [S07] getFieldDefault: Found default for d_51 = "Heatpump"
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section08.js:859 [S08] S04 listeners setup complete
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
Section09.js:408 S09: UI refreshed for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
Section07.js:1118 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
Section07.js:1155 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
Section09.js:2661 [S09] 🔗 Published initial ref_d_63=126 for S07
Section09.js:2664 [S09] 🔗 Published j_63=8760 and ref_j_63=8760 for S13
Section09.js:2462 [S09] ✅ Pattern A dual-engine listeners registered (5 Target/Reference pairs)
 S09: UI refreshed for target mode
 [S07] calculateEmissionsAndLosses: systemType="Heatpump" (TGT)
 [S07] ⚡ Non-fossil fuel: Heatpump → e_51=0, k_54=0 (both cleared)
 [S07] calculateEmissionsAndLosses: systemType="Electric" (REF)
 [S07] ⚡ Non-fossil fuel: Electric → e_51=0, k_54=0 (both cleared)
 [S09] 🔗 Published ref_i_63=4380 for S13
 [S09] Updated calculated display values for target mode
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section09.js:483 [S09] Updated calculated display values for target mode
Section10.js:3025 S10: Section rendered - initializing Self-Contained State Module.
Section10.js:3000 S10: Simplified global StateManager listeners added
Section10.js:3049 S10: ModeManager exposed globally for cross-section integration.
Section10.js:2048 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
Section10.js:2056 [S10 DEBUG] Dual-engine calculations complete in target mode
Section11.js:2143 [S11] Setting up S10 area listeners...
Section11.js:2178 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3202 S11: Section rendered - initializing Self-Contained State Module.
Section11.js:2143 [S11] Setting up S10 area listeners...
Section11.js:2178 [S11] ✅ S10 area listeners registered for both modes
Section11.js:3224 S11: ModeManager exposed globally for cross-section integration.
Section11.js:3232 [S11 Area Sync] S11 initialization complete - sync functions now enabled
Section11.js:2048 [S11 Area Sync] Starting sync in target mode
Section11.js:2094 [S11 Area Sync] d_88 = 7.50 (from d_73)
Section11.js:2094 [S11 Area Sync] d_89 = 81.14 (from d_74)
Section11.js:2094 [S11 Area Sync] d_90 = 3.83 (from d_75)
Section11.js:2094 [S11 Area Sync] d_91 = 159.00 (from d_76)
Section11.js:2094 [S11 Area Sync] d_92 = 100.66 (from d_77)
Section11.js:2094 [S11 Area Sync] d_93 = 0.00 (from d_78)
Section11.js:2106 [S11 Area Sync] Refreshing UI...
Section11.js:2110 [S11 Area Sync] Triggering recalculation...
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2113 [S11 Area Sync] Sync completed successfully
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:3249 [S11 Area Sync] Initialization phase complete - DUAL-STATE SYNC disabled
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] ⚠️ Already calculating (mode=target) - skipping to prevent recursion
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
updateStateManagerStage1 @ Cooling.js:737
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=reference
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
onSectionRendered @ Section13.js:2329
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="true", isGhosted=false, mode=target
Section13.js:401 [S13 updateCalc] ⏭️ Skipping j_116 (not ghosted)
Section14.js:1464 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section14.js:1473 S14: Section rendered - initializing Pattern A Dual-State Module.
Section14.js:79 S14: Reference defaults loaded from standard: OBC SB10 5.5-6 Z6
Section14.js:1464 [Section14] ✅ Added comprehensive listeners for 26 dependencies + 8 climate fields
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=59589.79 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
onSectionRendered @ Section14.js:1499
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section14.js:1501 S14: Pattern A initialization complete.
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateValues @ Section15.js:1879
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
publishToStateManager @ Section15.js:242
setDefaults @ Section15.js:237
initialize @ Section15.js:262
onSectionRendered @ Section15.js:2334
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
onSectionRendered @ Section15.js:2351
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section18.js:1242 [S18] Notes section rendered
Section18.js:21 [S18] Notes & QC Monitor section loaded
Section03.js:1252 Section03: Province selected: ON
Section03.js:1313 City dropdown updated for ON - selected: Alexandria
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section03.js:1252 Section03: Province selected: ON
Section03.js:1313 City dropdown updated for ON - selected: Alexandria
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
forceTEDITELIUpdate @ SectionIntegrator.js:305
initializeTEDITELIIntegration @ SectionIntegrator.js:241
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
index.html:1241 TEUI Calculator 4.011 initialization complete
Clock.js:28 [CLOCK] Performance monitoring initialized
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: l_104
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section12.js:2774
setTimeout
onSectionRendered @ Section12.js:2773
calculateTargetModel @ Section03.js:1870
calculateAll @ Section03.js:1809
(anonymous) @ Section03.js:2701
checkData @ Section03.js:530
ensureAvailable @ Section03.js:546
onSectionRendered @ Section03.js:2660
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
QCMonitor.js:40 [QCMonitor] QC monitoring disabled. Add ?qc=true to URL to activate.
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ FieldManager.js:1559Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ Calculator.js:990Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ init.js:863Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
(anonymous) @ index.html:1209Understand this warningAI
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=341.2, h_10=93.88345196516993, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=22.3 (ref), h_6=11.7 (target) → reduction should be 48%
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:894
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:894
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔍 [S01DB] UPDATING h_10: 93.9 (from j_32=133990.46264469053, area=1427.2)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:951
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateValues @ Section15.js:1879
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:951
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateValues @ Section15.js:1879
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:951
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:951
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:971
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_d_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateTEUIDisplay @ Section01.js:971
(anonymous) @ Section01.js:1254
setTimeout
runAllCalculations @ Section01.js:1225
(anonymous) @ Section01.js:1348
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1024
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1300
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setTargetValue @ Section15.js:104
calculateValues @ Section15.js:1857
calculateTargetModel @ Section15.js:1707
calculateAll @ Section15.js:1337
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setFieldValue @ Section04.js:1028
calculateRow32 @ Section04.js:1247
calculateAll @ Section04.js:1312
calculateAndRefresh @ Section04.js:1567
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setReferenceValue @ Section15.js:122
calculateReferenceModel @ Section15.js:1562
calculateAll @ Section15.js:1336
initializeEventHandlers @ Section15.js:2325
initializeSectionEventHandlers @ FieldManager.js:399
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔍 [S01] h_6 explanation: target=11.7, ref=22.3, reduction=0.4753363228699552, percent=48%
 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1532
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1532
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1532
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1532
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1538
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1538
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1538
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_g_101, ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateVolumeMetrics @ Section12.js:1538
calculateReferenceModel @ Section12.js:2447
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S12] U-agg REF: TB%=50 → g_101=0.572061, g_102=0.428571
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1730
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1730
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1730
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1730
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1731
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1731
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1731
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1731
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1732
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1732
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1732
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section15.js:1461 [S15] Missing critical upstream Reference values: ref_i_104
calculateReferenceModel @ Section15.js:1461
calculateAll @ Section15.js:1336
(anonymous) @ Section15.js:2168
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateCombinedUValue @ Section12.js:1732
calculateReferenceModel @ Section12.js:2448
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section15.js:1465 [S15] Using fallback values for missing upstream dependencies (initialization timing)
Section12.js:2062 [S12] 🔵 REF CLIMATE READ: d_20=4600, d_21=196
Section12.js:2136 [S12DB] REF CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
Section12.js:2164 [S12DB] REF h_101 calc: (4600*0.5720614690100458*24)/1000 = 63.15558617870907
Section12.js:2167 [S12DB] REF i_101 result: 63.15558617870907 * 2476.6199999999994 = 156412.38784191443
Section12.js:2319 [S12DB] REF g_104 calc: (0.5720614690100458*2476.6199999999994 + 0.42857142857142855*1100.42)/3577.0400009999994 = 0.5279190185964686
Section12.js:2343 [S12DB] REF ROW104: i_101=156412.38784191443, i_102=22184.467200000003, i_103=25727.28888888889 → i_104=204324.14393080334
Section12.js:2346 [S12DB] REF ROW104: h_21="Capacitance", k_98=-1895.4006468093894 → k_104=-1895.4006468093894
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=60685.99 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=60685.99 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2082
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateReferenceModel @ Section12.js:2464
calculateAll @ Section12.js:2404
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [Section12] Reference results cached. Publishing will occur at the end of calculateAll.
 [S12] U-agg TGT: TB%=20 → g_101=0.278341, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=16788.24544864865, i_103=23178.387012790416 → i_104=116070.32516166594
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2079
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2365
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section13.js:2846 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=0.00 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=0.000 kg/s, ΔT=3.6°C → 0.00 kWh/day → 0.00 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=0.00 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=0.00 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=58790.59 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section12.js:1317
calculateEnvelopeTotals @ Section12.js:2371
calculateTargetModel @ Section12.js:2557
calculateAll @ Section12.js:2405
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section13.js:2846 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Section13.js:2846 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:542 [Cooling Stage 1] ⚠️ Already calculating (mode=reference) - skipping to prevent recursion
Section13.js:3030 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2469
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
updateStateManagerStage1 @ Cooling.js:731
calculateStage1 @ Cooling.js:604
calculateAll @ Cooling.js:701
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=reference
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:421
(anonymous) @ Section12.js:2428
calculateAll @ Section12.js:2425
(anonymous) @ SectionIntegrator.js:656
setTimeout
forceVolumeMetricsUpdate @ SectionIntegrator.js:650
initializeVolumeMetricsIntegration @ SectionIntegrator.js:589
(anonymous) @ SectionIntegrator.js:187
initializeAllIntegrations @ SectionIntegrator.js:184
(anonymous) @ SectionIntegrator.js:106
renderAllSections @ FieldManager.js:487
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section12.js:347 [Section12] Calculated display values updated for target mode
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: j_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
TooltipManager.js:744 [TooltipManager] Empty tooltip message for field: l_98
applyTooltip @ TooltipManager.js:744
(anonymous) @ TooltipManager.js:798
(anonymous) @ TooltipManager.js:790
applyTooltipsToSection @ TooltipManager.js:787
(anonymous) @ Section11.js:3256
setTimeout
onSectionRendered @ Section11.js:3255
initializeSectionEventHandlers @ FieldManager.js:411
renderSection @ FieldManager.js:456
(anonymous) @ FieldManager.js:483
renderAllSections @ FieldManager.js:482
initialize @ Calculator.js:66
(anonymous) @ index.html:1229Understand this warningAI
Clock.js:41 [CLOCK] Starting initial load timing
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
 [S12] U-agg TGT: TB%=20 → g_101=0.278341, g_102=0.324324
 [S12] 🎯 TGT CLIMATE READ: d_20=4600, d_21=196
 [S12DB] TGT CLIMATE: d_20=4600, d_21=196, d_22=1960, h_22=-1680
 [S12DB] TGT h_101 calc: (4600*0.2783410626476887*24)/1000 = 30.728853316304836
 [S12DB] TGT i_101 result: 30.728853316304836 * 2476.6199999999994 = 76103.69270022686
 [S12DB] TGT g_104 calc: (0.2783410626476887*2476.6199999999994 + 0.3243243243243243*1100.42)/3577.0400009999994 = 0.2924870885578592
 [S12DB] TGT ROW104: i_101=76103.69270022686, i_102=16788.24544864865, i_103=23178.387012790416 → i_104=116070.32516166594
 [S12DB] TGT ROW104: h_21="Capacitance", k_98=-3293.5693790538335 → k_104=-3293.5693790538335
 [Section12] Calculated display values updated for target mode
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1781
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1781
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1781
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1781
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1800
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1800
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1800
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setValue @ Section03.js:242
setFieldValue @ Section03.js:480
calculateGroundFacing @ Section03.js:1800
calculateReferenceModel @ Section03.js:1933
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2517
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section13.js:2846 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
(anonymous) @ Section13.js:2521
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
(anonymous) @ Section03.js:1985
storeReferenceResults @ Section03.js:1983
calculateReferenceModel @ Section03.js:1937
calculateAll @ Section03.js:1810
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section09.js:2019 [S09] 🔗 Published ref_i_63=4380 for S13
Section10.js:2048 [S10 DEBUG] calculateAll() triggered in target mode - running both engines
Section10.js:2056 [S10 DEBUG] Dual-engine calculations complete in target mode
Section11.js:2895 [S11] calculateAll TRIGGERED. isReferenceMode: false
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2334 [S11] 🔵 REF CLIMATE READ: h_22=-1680
Section11.js:2406 [S11] REF TB%=50% → ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2590 [S11] Writing ref penalty: ref_i_97=59532.29, ref_k_97=-947.70
Section11.js:2339 [S11] 🎯 TGT CLIMATE READ: h_22=-1680
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
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 🟢 [S06-TAR] Storing d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 🔵 [S06-REF] Storing ref_d_43 = 0 (from d_44=0, d_45=0, d_46=0, i_46=0)
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 🔄 [S05] updateCalculatedDisplayValues: mode=target
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2108
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
calculateReferenceModel @ Section14.js:1031
calculateAll @ Section14.js:960
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
 [S13 updateCalc] ✅ Added j_116 to fieldFormats
 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section05.js:314 🔄 [S05] updateCalculatedDisplayValues: mode=target
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Section13.js:2846 [S13] 🔗 Published ref_d_120=3888.89 L/s for Reference ventilation energy calc
Cooling.js:697 [Cooling] 🚀 calculateAll("reference") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("reference")?
calculateAll @ Cooling.js:698
calculateReferenceModel @ Section13.js:3305
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=reference)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=reference, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (reference): massFlow=4.682 kg/s, ΔT=3.6°C → 403.18 kWh/day → 48381.44 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="ref_" (mode=reference)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=reference)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (reference): h_124=48381.44 kWh/yr, latentLoadFactor=1.616
Section13.js:3030 [S13] 🔗 Published ref_d_122=17886.04 kWh/yr for Reference CED calc
Section13.js:3086 [S13] 🔗 Published ref_d_129=76676.63 kWh/yr for Reference CED mitigated calc
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateReferenceModel @ Section13.js:3319
calculateAll @ Section13.js:3247
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
Cooling.js:697 [Cooling] 🚀 calculateAll("target") → Running Stage 1 only
Cooling.js:698 [Cooling] 🔍 TRACE: Who called calculateAll("target")?
calculateAll @ Cooling.js:698
calculateTargetModel @ Section13.js:3373
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234
Cooling.js:549 [Cooling Stage 1] 🚀 Starting ventilation & free cooling calculations (mode=target)...
Cooling.js:250 [Cooling] 🔍 i_59 READ: mode=target, i_59_value=45, will use indoorRH=0.45
Cooling.js:343 [Cooling] Free cooling calc (target): massFlow=4.013 kg/s, ΔT=3.6°C → 345.58 kWh/day → 41469.81 kWh/yr
Cooling.js:726 [Cooling Stage 1] 📊 Publishing results with prefix="" (mode=target)
Cooling.js:840 [Cooling] 📢 Dispatched event: cooling-calculations-stage1 (mode=target)
Cooling.js:609 [Cooling Stage 1] ✅ Complete (target): h_124=41469.81 kWh/yr, latentLoadFactor=1.616
Section13.js:3220 [S13] cooling_m_124 not available, using m_19 fallback: 120
calculateFreeCooling @ Section13.js:3220
calculateTargetModel @ Section13.js:3387
calculateAll @ Section13.js:3249
calculateAndRefresh @ Section13.js:2070
(anonymous) @ Section13.js:2105
(anonymous) @ StateManager.js:571
notifyListeners @ StateManager.js:569
setValue @ StateManager.js:439
setCalculatedValue @ Section14.js:416
calculateValues @ Section14.js:1194
calculateTargetModel @ Section14.js:1152
calculateAll @ Section14.js:961
(anonymous) @ Calculator.js:531
calculateAll @ Calculator.js:510
(anonymous) @ index.html:1236
setTimeout
(anonymous) @ index.html:1234Understand this warningAI
Section13.js:392 [S13 updateCalc] j_116 check: element=true, contenteditable="false", isGhosted=true, mode=target
Section13.js:399 [S13 updateCalc] ✅ Added j_116 to fieldFormats
Dependency.js:2091 [DependencyGraph] Already initialized, skipping re-initialization
Section01.js:773 🔍 [S01DB] updateTEUIDisplay START: e_10=182.2, h_10=93.68427304759112, useType=Utility Bills
Section01.js:843 🔍 [S01] T.1 Calculation: e_6=23.1 (ref), h_6=11.7 (target) → reduction should be 49%
Section01.js:942 🔍 [S01DB] UPDATING h_10: 93.7 (from j_32=133706.19449352205, area=1427.2)
Section01.js:529 🔍 [S01] h_6 explanation: target=11.7, ref=23.1, reduction=0.49350649350649356, percent=49%
Clock.js:59 🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: 296ms (all calculations finalized)
Section01.js:1267 ✅ [S01] CALCULATION CHAIN COMPLETE - All values finalized including h_10