/**
 * FOCUSED Diagnostic script to trace l_24 contamination path
 *
 * GOAL: Find why editing l_24 in Target mode causes BOTH h_10 and e_10 to change
 * Expected: Only h_10 should change (Target total)
 * Bug: e_10 also changes (Reference total should be unaffected)
 *
 * USAGE:
 * 1. Open browser console
 * 2. Paste this entire script
 * 3. Edit l_24 in Target mode (e.g., change from 24 to 26)
 * 4. Look for "🚨 CONTAMINATION DETECTED" warnings
 */

(function() {
  console.log('🔍 [DIAGNOSTIC] Installing FOCUSED l_24 contamination tracer...');
  console.log('📊 Focus: Track why e_10 (Reference) changes when only h_10 (Target) should change');
  console.log('');

  const originalSetValue = window.TEUI.StateManager.setValue.bind(window.TEUI.StateManager);

  // Track ONLY the final outputs and key intermediate values
  window.TEUI.StateManager.setValue = function(fieldId, value, source) {

    // CRITICAL: Track when Reference total (e_10) is written
    if (fieldId === 'e_10' || fieldId === 'ref_e_10') {
      const stack = new Error().stack.split('\n').slice(2, 8).map(line => line.trim()).join('\n      ');
      console.log(`\n📌 [CRITICAL] ${fieldId} = ${value}`);
      console.log(`   Source: ${source}`);
      console.log(`   Call stack:\n      ${stack}`);
    }

    // Track when Target total (h_10) is written
    if (fieldId === 'h_10') {
      console.log(`\n📌 [TARGET] h_10 = ${value} (source: ${source})`);
    }

    // Track Reference cooling values being written
    if (fieldId.startsWith('ref_') && fieldId.includes('cooling')) {
      console.log(`   🔵 [REF COOLING] ${fieldId} = ${value}`);
    }

    // CONTAMINATION CHECK: If unprefixed cooling values are written during what should be Reference-only updates
    if (fieldId === 'cooling_h_124' || fieldId === 'cooling_m_124' || fieldId === 'm_129') {
      console.log(`   🟡 [TARGET COOLING] ${fieldId} = ${value}`);
    }

    return originalSetValue(fieldId, value, source);
  };

  console.log('✅ [DIAGNOSTIC] Tracer installed.');
  console.log('');
  console.log('🎯 ACTION: Now edit l_24 in S03 (Target mode) and watch for:');
  console.log('   - h_10 changes (expected ✅)');
  console.log('   - e_10 changes (BUG if this happens! 🚨)');
  console.log('');
  console.log('To remove tracer: location.reload()');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
})();