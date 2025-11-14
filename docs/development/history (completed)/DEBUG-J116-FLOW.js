/**
 * DEBUG SCRIPT: j_116 Update Flow Tracer
 *
 * Purpose: Trace exactly how j_116 DOM updates happen in Target vs Reference mode
 *
 * Instructions:
 * 1. Open browser console
 * 2. Load the app with default values
 * 3. Set d_113 to "Heatpump" in both modes
 * 4. Run this script to install tracers
 * 5. In TARGET mode: drag f_113 slider and observe console logs
 * 6. In REFERENCE mode: drag f_113 slider and observe console logs
 * 7. Compare the flow differences
 */

(function() {
  console.clear();
  console.log('🔍 Installing j_116 Flow Tracers...\n');

  // Store original functions
  const originalSetFieldValue = window.setFieldValue;
  const originalStateManagerSetValue = window.TEUI?.StateManager?.setValue;

  // Get references to Section 13 objects
  const S13 = window.TEUI?.SectionModules?.sect13;
  const ModeManager = S13?.ModeManager;
  const ReferenceState = S13?.ReferenceState;
  const TargetState = S13?.TargetState;

  if (!S13 || !ModeManager) {
    console.error('❌ Section 13 not found! Make sure app is loaded.');
    return;
  }

  // Trace StateManager setValue for j_116 and ref_j_116
  if (window.TEUI?.StateManager) {
    window.TEUI.StateManager.setValue = function(fieldId, value, source) {
      if (fieldId === 'j_116' || fieldId === 'ref_j_116') {
        console.log(`📝 StateManager.setValue: ${fieldId} = "${value}" (source: ${source})`);
        console.trace('Call stack:');
      }
      return originalStateManagerSetValue.call(this, fieldId, value, source);
    };
  }

  // Trace setFieldValue for j_116
  window.setFieldValue = function(fieldId, value, format) {
    if (fieldId === 'j_116') {
      const currentMode = ModeManager?.currentMode || 'unknown';
      console.log(`🎨 setFieldValue (DOM UPDATE): j_116 = "${value}", format: ${format}, mode: ${currentMode}`);
      console.trace('Call stack:');
    }
    return originalSetFieldValue.call(this, fieldId, value, format);
  };

  // Trace ReferenceState.getValue for j_116
  if (ReferenceState) {
    const originalRefGetValue = ReferenceState.getValue;
    ReferenceState.getValue = function(fieldId) {
      const result = originalRefGetValue.call(this, fieldId);
      if (fieldId === 'j_116') {
        console.log(`🔵 ReferenceState.getValue("j_116") = "${result}"`);
      }
      return result;
    };
  }

  // Trace TargetState.getValue for j_116
  if (TargetState) {
    const originalTargetGetValue = TargetState.getValue;
    TargetState.getValue = function(fieldId) {
      const result = originalTargetGetValue.call(this, fieldId);
      if (fieldId === 'j_116') {
        console.log(`🔴 TargetState.getValue("j_116") = "${result}"`);
      }
      return result;
    };
  }

  // Trace ModeManager.refreshUI
  if (ModeManager?.refreshUI) {
    const originalRefreshUI = ModeManager.refreshUI;
    ModeManager.refreshUI = function() {
      const currentMode = this.currentMode;
      console.log(`\n🔄 refreshUI called (mode: ${currentMode})`);
      const result = originalRefreshUI.call(this);
      console.log(`✅ refreshUI completed\n`);
      return result;
    };
  }

  // Trace ModeManager.updateCalculatedDisplayValues
  if (ModeManager?.updateCalculatedDisplayValues) {
    const originalUpdate = ModeManager.updateCalculatedDisplayValues;
    ModeManager.updateCalculatedDisplayValues = function() {
      const currentMode = this.currentMode;
      console.log(`\n📊 updateCalculatedDisplayValues called (mode: ${currentMode})`);
      const result = originalUpdate.call(this);
      console.log(`✅ updateCalculatedDisplayValues completed\n`);
      return result;
    };
  }

  console.log('✅ Tracers installed!\n');
  console.log('📋 Next steps:');
  console.log('1. In TARGET mode: Set d_113 to "Heatpump"');
  console.log('2. Drag f_113 slider and watch console logs');
  console.log('3. Switch to REFERENCE mode');
  console.log('4. Drag f_113 slider again and compare logs\n');
  console.log('🔍 Look for:');
  console.log('  - Does setFieldValue (DOM UPDATE) fire in both modes?');
  console.log('  - Does StateManager.setValue write j_116 vs ref_j_116?');
  console.log('  - Does refreshUI read the correct state values?');
  console.log('  - What\'s the difference in call stacks?\n');

  // Show current state
  console.log('📸 Current State Snapshot:');
  console.log(`  Mode: ${ModeManager.currentMode}`);
  console.log(`  d_113 (Target): ${TargetState?.getValue?.('d_113')}`);
  console.log(`  d_113 (Reference): ${ReferenceState?.getValue?.('d_113')}`);
  console.log(`  j_116 (Target): ${TargetState?.getValue?.('j_116')}`);
  console.log(`  j_116 (Reference): ${ReferenceState?.getValue?.('j_116')}`);
  console.log(`  j_116 (StateManager): ${window.TEUI?.StateManager?.getValue?.('j_116')}`);
  console.log(`  ref_j_116 (StateManager): ${window.TEUI?.StateManager?.getValue?.('ref_j_116')}`);

  // Get DOM value
  const j116Element = document.querySelector('[data-field-id="j_116"]');
  console.log(`  j_116 (DOM): ${j116Element?.textContent || 'not found'}`);
  console.log('\n');

})();

/**
 * HELPER FUNCTION: Check current j_116 values everywhere
 * Run this in console: checkJ116Values()
 */
window.checkJ116Values = function() {
  const S13 = window.TEUI?.SectionModules?.sect13;
  const ModeManager = S13?.ModeManager;
  const ReferenceState = S13?.ReferenceState;
  const TargetState = S13?.TargetState;
  const j116Element = document.querySelector('[data-field-id="j_116"]');

  console.log('\n📊 j_116 Values Across All Layers:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Current Mode: ${ModeManager?.currentMode}`);
  console.log(`\n🔴 Target State:`);
  console.log(`  TargetState.getValue("j_116"): ${TargetState?.getValue?.('j_116')}`);
  console.log(`  StateManager.getValue("j_116"): ${window.TEUI?.StateManager?.getValue?.('j_116')}`);
  console.log(`\n🔵 Reference State:`);
  console.log(`  ReferenceState.getValue("j_116"): ${ReferenceState?.getValue?.('j_116')}`);
  console.log(`  StateManager.getValue("ref_j_116"): ${window.TEUI?.StateManager?.getValue?.('ref_j_116')}`);
  console.log(`\n🎨 DOM:`);
  console.log(`  Element textContent: ${j116Element?.textContent || 'not found'}`);
  console.log(`  Element contenteditable: ${j116Element?.getAttribute?.('contenteditable')}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

/**
 * HELPER FUNCTION: Manually trigger refreshUI to test
 * Run this in console: testRefreshUI()
 */
window.testRefreshUI = function() {
  const S13 = window.TEUI?.SectionModules?.sect13;
  const ModeManager = S13?.ModeManager;

  console.log('\n🧪 Testing refreshUI...');
  window.checkJ116Values();
  console.log('Calling refreshUI()...');
  ModeManager?.refreshUI?.();
  console.log('After refreshUI:');
  window.checkJ116Values();
};
