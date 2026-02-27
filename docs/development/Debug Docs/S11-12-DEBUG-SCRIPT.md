# S11-S12 Reference Mode Performance Debug Script

Run this in the browser console to trace the exact timing of Reference mode updates:

```javascript
// Debug script for S11→S12 Reference mode update timing
(function() {
  console.clear();
  console.log("%c[DEBUG] S11-S12 Reference Mode Timing Tracer Active", "color: #0f0; font-weight: bold; font-size: 14px;");

  // Trace S11 blur events
  const s11Section = document.getElementById("envelopeTransmissionLosses");
  if (s11Section) {
    const editableFields = s11Section.querySelectorAll('[contenteditable="true"]');
    editableFields.forEach(field => {
      const fieldId = field.getAttribute("data-field-id");
      if (fieldId && fieldId.startsWith("d_")) { // Focus on area fields
        field.addEventListener("blur", function() {
          const value = this.textContent.trim();
          console.log(`%c[S11 BLUR] ${fieldId} = ${value}`, "color: #ff0; font-weight: bold;");
          console.time(`${fieldId} → S12 update`);
        });
      }
    });
  }

  // Trace StateManager writes
  const originalSetValue = window.TEUI.StateManager.setValue;
  window.TEUI.StateManager.setValue = function(fieldId, value, source) {
    if (fieldId.startsWith("ref_d_8") || fieldId.startsWith("ref_d_9") ||
        fieldId === "ref_d_101" || fieldId === "ref_d_102" || fieldId === "ref_d_104") {
      console.log(`%c[StateManager] ${fieldId} = ${value} (source: ${source})`, "color: #0ff;");
    }
    return originalSetValue.call(this, fieldId, value, source);
  };

  // Trace S12 calculations
  const s12 = window.TEUI.SectionModules.sect12;
  if (s12) {
    const originalCalcRef = s12.calculateReferenceModel;
    s12.calculateReferenceModel = function() {
      console.log("%c[S12] calculateReferenceModel() START", "color: #f0f; font-weight: bold;");
      const result = originalCalcRef.call(this);
      console.log("%c[S12] calculateReferenceModel() END", "color: #f0f; font-weight: bold;");
      return result;
    };

    const originalUpdateDisplay = s12.ModeManager.updateCalculatedDisplayValues;
    s12.ModeManager.updateCalculatedDisplayValues = function() {
      console.log("%c[S12] updateCalculatedDisplayValues() START", "color: #0f0; font-weight: bold;");

      // Log current Reference toggle state
      const isRef = window.TEUI?.ReferenceToggle?.isReferenceMode?.() || false;
      console.log(`  Reference mode: ${isRef}`);

      // Log what values S12 will read
      const d101 = window.TEUI.StateManager.getValue("ref_d_101");
      const d102 = window.TEUI.StateManager.getValue("ref_d_102");
      console.log(`  Reading: ref_d_101=${d101}, ref_d_102=${d102}`);

      const result = originalUpdateDisplay.call(this);
      console.log("%c[S12] updateCalculatedDisplayValues() END", "color: #0f0; font-weight: bold;");

      // End timing
      console.timeEnd("d_86 → S12 update");
      console.timeEnd("d_85 → S12 update");
      console.timeEnd("d_87 → S12 update");

      return result;
    };
  }

  console.log("%c[DEBUG] Tracer ready! Edit an area field in S11 Reference mode.", "color: #0f0; font-size: 12px;");
  console.log("%cExpected flow:", "font-weight: bold;");
  console.log("1. [S11 BLUR] d_86 = <value>");
  console.log("2. [StateManager] ref_d_86 = <value> (source: user-modified)");
  console.log("3. [S12] calculateReferenceModel() START");
  console.log("4. [StateManager] ref_d_101 = <calculated> (source: calculated)");
  console.log("5. [S12] calculateReferenceModel() END");
  console.log("6. [S12] updateCalculatedDisplayValues() START");
  console.log("7. [S12] updateCalculatedDisplayValues() END");
  console.log("8. Time measurement: d_86 → S12 update: <milliseconds>");
})();
```

## Expected Output (After Fix)

With robot fingers working, you should see:

```
[S11 BLUR] d_86 = 350
[StateManager] ref_d_86 = 350 (source: user-modified)
[S12] calculateReferenceModel() START
[StateManager] ref_d_101 = 2476.62 (source: calculated)
[StateManager] ref_d_102 = 150.00 (source: calculated)
[S12] calculateReferenceModel() END
[S12] updateCalculatedDisplayValues() START
  Reference mode: true
  Reading: ref_d_101=2476.62, ref_d_102=150.00
[S12] updateCalculatedDisplayValues() END
d_86 → S12 update: 12.5ms  ← Should be <50ms for instant feel
```

## Problem Indicators

**Before robot fingers fix:**
- Time > 100ms = Lag noticeable
- Multiple listener cycles visible
- Updates don't appear until next blur event

**After robot fingers fix:**
- Time < 50ms = Instant
- Single direct call path
- Updates appear immediately

## Testing Steps

1. Load page in browser
2. Switch to Reference mode
3. Paste debug script in console
4. Edit S11 area field (e.g., d_86 Walls AG)
5. Blur the field (click away)
6. Check console timing

Target: <50ms for Reference mode to match Target mode performance
