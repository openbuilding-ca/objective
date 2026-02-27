# S12 k_104 Bug - Diagnostic Test Protocol

## Objective

Determine WHERE the wrong value `-4267.63` exists vs the correct value `-1895.40`

## Test Protocol (STRICT SEQUENCE)

### Phase 1: Fresh Initialization State

1. **Hard refresh** (Cmd+Shift+R)
2. **Click "Initialize"** button
3. **DO NOT navigate to any section yet**
4. **DO NOT toggle any modes**

Run in console:

```javascript
console.log(
  "=== PHASE 1: POST-INITIALIZATION (No navigation, Target mode) ===",
);
console.log(
  "StateManager ref_k_98:",
  window.TEUI.StateManager.getValue("ref_k_98"),
);
console.log(
  "StateManager ref_k_104:",
  window.TEUI.StateManager.getValue("ref_k_104"),
);
```

**Expected**: Both might be wrong, undefined, or one of each

---

### Phase 2: Navigate to S11 (Still in Target Mode)

5. **Navigate to Section 11** (click tab)
6. **Verify S11 is in TARGET mode** (toggle should show "Target")
7. **DO NOT switch modes yet**

Run in console:

```javascript
console.log("=== PHASE 2: S11 VISIBLE (Target mode) ===");
console.log(
  "S11 DOM k_98:",
  document.querySelector('[data-field-id="k_98"]')?.textContent,
);
console.log(
  "S11 ReferenceState k_98:",
  window.TEUI.SectionModules?.sect11?.ReferenceState?.getValue("k_98"),
);
console.log(
  "S11 TargetState k_98:",
  window.TEUI.SectionModules?.sect11?.TargetState?.getValue("k_98"),
);
console.log(
  "StateManager ref_k_98:",
  window.TEUI.StateManager.getValue("ref_k_98"),
);
```

**Expected**:

- DOM shows Target value
- TargetState has Target value
- ReferenceState has Reference value (correct `-1895.40`?)
- StateManager has ??? (this is the mystery)

---

### Phase 3: Switch S11 to Reference Mode

8. **Click S11 toggle to switch to REFERENCE mode**
9. **Verify toggle shows "Reference"**

Run in console:

```javascript
console.log("=== PHASE 3: S11 IN REFERENCE MODE ===");
console.log(
  "S11 DOM k_98:",
  document.querySelector('[data-field-id="k_98"]')?.textContent,
);
console.log(
  "S11 ReferenceState k_98:",
  window.TEUI.SectionModules?.sect11?.ReferenceState?.getValue("k_98"),
);
console.log(
  "StateManager ref_k_98:",
  window.TEUI.StateManager.getValue("ref_k_98"),
);
console.log(
  "S11 ModeManager.currentMode:",
  window.TEUI.SectionModules?.sect11?.ModeManager?.currentMode,
);
```

**Expected**:

- DOM shows `-1895.40` (you said this is correct)
- ReferenceState should match DOM
- StateManager should match... but does it?

---

### Phase 4: Navigate to S12 (S11 still in Reference mode)

10. **Keep S11 in Reference mode**
11. **Navigate to Section 12** (click tab)
12. **Verify S12 is in TARGET mode initially**

Run in console:

```javascript
console.log(
  "=== PHASE 4: S12 VISIBLE (Target mode, S11 still in Reference) ===",
);
console.log(
  "S12 DOM k_104:",
  document.querySelector('[data-field-id="k_104"]')?.textContent,
);
console.log(
  "S12 ReferenceState k_104:",
  window.TEUI.SectionModules?.sect12?.ReferenceState?.getValue("k_104"),
);
console.log(
  "S12 TargetState k_104:",
  window.TEUI.SectionModules?.sect12?.TargetState?.getValue("k_104"),
);
console.log(
  "StateManager ref_k_104:",
  window.TEUI.StateManager.getValue("ref_k_104"),
);
console.log(
  "StateManager ref_k_98 (S12 reads this):",
  window.TEUI.StateManager.getValue("ref_k_98"),
);
```

**Expected**:

- DOM shows Target value
- Check if StateManager still has correct `ref_k_98` from Phase 3

---

### Phase 5: Switch S12 to Reference Mode

13. **Click S12 toggle to switch to REFERENCE mode**
14. **Verify toggle shows "Reference"**

Run in console:

```javascript
console.log("=== PHASE 5: S12 IN REFERENCE MODE ===");
console.log(
  "S12 DOM k_104:",
  document.querySelector('[data-field-id="k_104"]')?.textContent,
);
console.log(
  "S12 ReferenceState k_104:",
  window.TEUI.SectionModules?.sect12?.ReferenceState?.getValue("k_104"),
);
console.log(
  "StateManager ref_k_104:",
  window.TEUI.StateManager.getValue("ref_k_104"),
);
console.log(
  "StateManager ref_k_98 (what S12 should read):",
  window.TEUI.StateManager.getValue("ref_k_98"),
);
console.log(
  "S12 ModeManager.currentMode:",
  window.TEUI.SectionModules?.sect12?.ModeManager?.currentMode,
);
```

**Expected**:

- DOM shows `-4267.63` ❌ (the bug!)
- Need to see if S12's ReferenceState has wrong value or correct value
- Need to see if StateManager `ref_k_98` is correct or wrong

---

### Phase 6: The "Priming" Test

15. **While S12 is in Reference mode**
16. **Change Stories slider** (d_103) from 1 to 1.5 and back to 1

Run in console:

```javascript
console.log("=== PHASE 6: AFTER PRIMING (Stories changed) ===");
console.log(
  "S12 DOM k_104:",
  document.querySelector('[data-field-id="k_104"]')?.textContent,
);
console.log(
  "S12 ReferenceState k_104:",
  window.TEUI.SectionModules?.sect12?.ReferenceState?.getValue("k_104"),
);
console.log(
  "StateManager ref_k_104:",
  window.TEUI.StateManager.getValue("ref_k_104"),
);
console.log(
  "StateManager ref_k_98:",
  window.TEUI.StateManager.getValue("ref_k_98"),
);
```

**Expected**:

- DOM now shows `-1895.40` ✅ (bug fixed by priming)
- Check if StateManager changed or S12 internal state changed

---

## Key Questions to Answer

1. **Does StateManager `ref_k_98` ever contain the correct value `-1895.40`?**

   - If YES: S12 is reading from wrong source or caching old value
   - If NO: S11 is publishing wrong value to StateManager

2. **Does S12's ReferenceState have the correct value internally?**

   - If YES: This is a DOM display bug
   - If NO: This is a calculation or reading bug

3. **When does the value change?**

   - After S11 switches to Reference mode?
   - After S12 switches to Reference mode?
   - Only after "priming"?

4. **What are the `undefined` values?**
   - If `SectionModules.sect11` is undefined: Module not registered correctly
   - If `ReferenceState` is undefined: State object not exposed
   - If `getValue()` returns undefined: Field not in state

---

## Copy-Paste Full Test Script

Run this ONCE after each phase:

```javascript
function diagnosticDump(phase) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`PHASE ${phase} DIAGNOSTICS`);
  console.log("=".repeat(60));

  // S11 checks
  console.log("\n--- S11 State ---");
  console.log(
    "S11.ModeManager.currentMode:",
    window.TEUI.SectionModules?.sect11?.ModeManager?.currentMode,
  );
  console.log(
    "S11 DOM k_98:",
    document.querySelector('[data-field-id="k_98"]')?.textContent,
  );
  console.log(
    "S11.TargetState.k_98:",
    window.TEUI.SectionModules?.sect11?.TargetState?.getValue("k_98"),
  );
  console.log(
    "S11.ReferenceState.k_98:",
    window.TEUI.SectionModules?.sect11?.ReferenceState?.getValue("k_98"),
  );

  // S12 checks
  console.log("\n--- S12 State ---");
  console.log(
    "S12.ModeManager.currentMode:",
    window.TEUI.SectionModules?.sect12?.ModeManager?.currentMode,
  );
  console.log(
    "S12 DOM k_104:",
    document.querySelector('[data-field-id="k_104"]')?.textContent,
  );
  console.log(
    "S12.TargetState.k_104:",
    window.TEUI.SectionModules?.sect12?.TargetState?.getValue("k_104"),
  );
  console.log(
    "S12.ReferenceState.k_104:",
    window.TEUI.SectionModules?.sect12?.ReferenceState?.getValue("k_104"),
  );

  // StateManager checks
  console.log("\n--- StateManager (Global Cross-Section) ---");
  console.log(
    "StateManager.ref_k_98:",
    window.TEUI.StateManager.getValue("ref_k_98"),
  );
  console.log(
    "StateManager.ref_k_104:",
    window.TEUI.StateManager.getValue("ref_k_104"),
  );

  console.log("=".repeat(60) + "\n");
}

// Call this after each phase:
// diagnosticDump("1: Post-Init");
// diagnosticDump("2: S11 Target");
// diagnosticDump("3: S11 Reference");
// diagnosticDump("4: S12 Target");
// diagnosticDump("5: S12 Reference");
// diagnosticDump("6: After Priming");
```

---

**Next Step**: Run this protocol and paste the complete output into Logs.md
