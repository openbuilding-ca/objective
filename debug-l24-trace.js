/**
 * Diagnostic script to trace l_24 → h_24 → cooling cascade and identify state mixing
 *
 * USAGE:
 * 1. Open browser console
 * 2. Paste this entire script
 * 3. Edit l_24 in Target mode
 * 4. Review the trace output to see where contamination occurs
 */

(function() {
  console.log('🔍 [DIAGNOSTIC] Installing l_24 cascade tracer...');

  const originalSetValue = window.TEUI.StateManager.setValue.bind(window.TEUI.StateManager);
  const originalGetValue = window.TEUI.StateManager.getValue.bind(window.TEUI.StateManager);

  // Track all setValue calls
  window.TEUI.StateManager.setValue = function(fieldId, value, source) {
    // Only trace relevant fields in the cascade
    const traceFields = ['l_24', 'ref_l_24', 'h_24', 'ref_h_24', 'cooling_h_124', 'ref_cooling_h_124',
                         'm_129', 'ref_m_129', 'cooling_m_124', 'ref_cooling_m_124', 'h_10', 'e_10'];

    if (traceFields.includes(fieldId)) {
      const stack = new Error().stack.split('\n').slice(2, 5).join('\n    ');
      console.log(`📝 [WRITE] ${fieldId} = ${value} (source: ${source})`);
      console.log(`    ModeManager.currentMode = ${window.TEUI.ModeManager?.currentMode || 'undefined'}`);
      console.log(`    Called from:\n    ${stack}`);
    }

    return originalSetValue(fieldId, value, source);
  };

  // Track all getValue calls for Reference fields
  window.TEUI.StateManager.getValue = function(fieldId) {
    const result = originalGetValue(fieldId);

    // Track if Reference calculations are reading unprefixed values (BUG!)
    if (fieldId.startsWith('ref_') && window.TEUI.ModeManager?.currentMode === 'reference') {
      console.log(`📖 [READ] ${fieldId} = ${result} (mode: reference) ✅`);
    } else if (!fieldId.startsWith('ref_') && window.TEUI.ModeManager?.currentMode === 'reference') {
      // Reference mode reading unprefixed value - potential contamination!
      const traceFields = ['h_24', 'cooling_h_124', 'm_129', 'cooling_m_124'];
      if (traceFields.includes(fieldId)) {
        const stack = new Error().stack.split('\n').slice(2, 4).join('\n    ');
        console.warn(`⚠️ [CONTAMINATION?] Reference mode reading unprefixed value: ${fieldId}`);
        console.log(`    ModeManager.currentMode = ${window.TEUI.ModeManager?.currentMode}`);
        console.log(`    Value = ${result}`);
        console.log(`    Called from:\n    ${stack}`);
      }
    }

    return result;
  };

  console.log('✅ [DIAGNOSTIC] Tracer installed. Now edit l_24 in Target mode and watch the trace.');
  console.log('');
  console.log('Legend:');
  console.log('  📝 [WRITE] - StateManager.setValue() call');
  console.log('  📖 [READ]  - StateManager.getValue() call (Reference mode)');
  console.log('  ⚠️ [CONTAMINATION?] - Reference mode reading unprefixed Target value');
  console.log('');
  console.log('To remove tracer: location.reload()');
})();