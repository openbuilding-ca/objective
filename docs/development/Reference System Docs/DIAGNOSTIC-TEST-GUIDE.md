# Diagnostic Test Guide - Post-Import Contamination Bug

**Branch**: REF-MODE-UNITY
**Diagnostic Commit**: ef842bc
**Safe Restore Point**: 0d7b7bfe1f7e190a73dc91e74817cfcfb01a71ec
**Date**: 2025-12-10

## Purpose

Trace where `f_85`, `f_86`, `f_87` contamination occurs when clicking "Set Values" in Reference mode after importing data from external file.

## Test Sequence

### Step 1: Import External File

Import a CSV/Excel file with:
- **Target model** (row 2): d_13 = "OBC SB10 5.5-6 Z5 (2010)"
  - f_85 = "5.30", f_86 = "4.10", f_87 = "6.60"
- **Reference model** (row 3): ref_d_13 = "PH Classic"
  - ref_f_85 = "4.87", ref_f_86 = "4.21", ref_f_87 = "5.64"

### Step 2: Verify Import Success

Open browser console and run:

```javascript
console.log('===== POST-IMPORT BASELINE =====');
console.log('Target f_85:', window.TEUI.StateManager.getValue('f_85'));
console.log('Target f_86:', window.TEUI.StateManager.getValue('f_86'));
console.log('Target f_87:', window.TEUI.StateManager.getValue('f_87'));
console.log('Ref ref_f_85:', window.TEUI.StateManager.getValue('ref_f_85'));
console.log('Ref ref_f_86:', window.TEUI.StateManager.getValue('ref_f_86'));
console.log('Ref ref_f_87:', window.TEUI.StateManager.getValue('ref_f_87'));
```

**Expected Output:**
```
Target f_85: "5.30"
Target f_86: "4.10"
Target f_87: "6.60"
Ref ref_f_85: "4.87"
Ref ref_f_86: "4.21"
Ref ref_f_87: "5.64"
```

### Step 3: Switch to Reference Mode

Click Reference mode toggle. Watch console for any callbacks firing.

### Step 4: Baseline Before d_13 Change

Run in console:

```javascript
console.log('===== BEFORE d_13 CHANGE =====');
console.log('Current ref_d_13:', window.TEUI.StateManager.getValue('ref_d_13'));
console.log('Target f_85:', window.TEUI.StateManager.getValue('f_85'));
console.log('Ref ref_f_85:', window.TEUI.StateManager.getValue('ref_f_85'));
```

**Expected:**
```
Current ref_d_13: "PH Classic"
Target f_85: "5.30" (unchanged)
Ref ref_f_85: "4.87" (unchanged)
```

### Step 5: Change ref_d_13 Dropdown

Change dropdown from "PH Classic" to "OBC SB10 5.5-6 Z6"

**Watch console for**:
- Any `onReferenceStandardChange()` callback messages
- Any `setValue()` calls for `f_85` or `ref_f_85`

### Step 6: Check State After Dropdown Change

Run in console:

```javascript
console.log('===== AFTER d_13 CHANGE, BEFORE "Set Values" =====');
console.log('Current ref_d_13:', window.TEUI.StateManager.getValue('ref_d_13'));
console.log('Target f_85:', window.TEUI.StateManager.getValue('f_85'));
console.log('Ref ref_f_85:', window.TEUI.StateManager.getValue('ref_f_85'));
```

**Expected:**
```
Current ref_d_13: "OBC SB10 5.5-6 Z6"
Target f_85: "5.30" (STILL UNCHANGED!)
Ref ref_f_85: "4.87" (STILL UNCHANGED!)
```

If Target or Reference values CHANGED here, d_13 dropdown change is triggering contamination!

### Step 7: Click "Set Values" Button

**Watch console output carefully:**

1. **FileHandler Diagnostic Output:**
   ```
   [FileHandler] ===== REFERENCE VALUES OVERLAY DEBUG =====
   [FileHandler] Standard: "OBC SB10 5.5-6 Z6"
   [FileHandler] Target Mode: "reference"
   [FileHandler] ReferenceValues (unprefixed source): ["d_52", "k_52", "d_53", ...]
   [FileHandler] Built importedData (after prefix logic): ["ref_d_52", "ref_k_52", ...]
   [FileHandler] Sample insulation fields: {
     f_85: undefined,        // ✅ CORRECT - should be undefined
     ref_f_85: "5.30",      // ✅ CORRECT - Z6 value
     f_86: undefined,       // ✅ CORRECT
     ref_f_86: "4.10",      // ✅ CORRECT - Z6 value
     f_87: undefined,       // ✅ CORRECT
     ref_f_87: "6.60"       // ✅ CORRECT - Z6 value
   }
   ```

2. **StateManager setValue() Calls:**
   - Look for magenta-colored logs with stack traces
   - Count how many writes to each field

### Step 8: Verify Final State

Run in console:

```javascript
console.log('===== AFTER "Set Values" =====');
console.log('Target f_85:', window.TEUI.StateManager.getValue('f_85'));
console.log('Target f_86:', window.TEUI.StateManager.getValue('f_86'));
console.log('Target f_87:', window.TEUI.StateManager.getValue('f_87'));
console.log('Ref ref_f_85:', window.TEUI.StateManager.getValue('ref_f_85'));
console.log('Ref ref_f_86:', window.TEUI.StateManager.getValue('ref_f_86'));
console.log('Ref ref_f_87:', window.TEUI.StateManager.getValue('ref_f_87'));
```

**Expected (CORRECT behavior):**
```
Target f_85: "5.30" (UNCHANGED from Z5 2010 import!)
Target f_86: "4.10" (UNCHANGED)
Target f_87: "6.60" (UNCHANGED)
Ref ref_f_85: "5.30" (CHANGED to Z6 value)
Ref ref_f_86: "4.10" (CHANGED to Z6 value)
Ref ref_f_87: "6.60" (CHANGED to Z6 value)
```

**Actual (BUG behavior):**
```
Target f_85: "5.30" (CONTAMINATED with Z6 value!)
Target f_86: "4.10" (CONTAMINATED)
Target f_87: "6.60" (CONTAMINATED)
Ref ref_f_85: "5.30" (Changed to Z6)
Ref ref_f_86: "4.10" (Changed to Z6)
Ref ref_f_87: "6.60" (Changed to Z6)
```

## Analysis Checklist

### ✅ Check 1: importedData Structure

**Look at FileHandler diagnostic output:**

- ✅ **PASS**: Only `ref_*` fields in importedData
  ```
  { f_85: undefined, ref_f_85: "5.30", ... }
  ```

- ❌ **FAIL**: Both unprefixed AND prefixed fields
  ```
  { f_85: "5.30", ref_f_85: "5.30", ... }
  ```
  **Diagnosis**: Prefix logic in FileHandler.js:1003-1004 is broken

### ✅ Check 2: setValue() Call Count

**Count magenta logs in console:**

- ✅ **PASS**: Only 3 setValue() calls
  - `ref_f_85`, `ref_f_86`, `ref_f_87`

- ❌ **FAIL**: 6 setValue() calls
  - `f_85`, `ref_f_85`, `f_86`, `ref_f_86`, `f_87`, `ref_f_87`
  **Diagnosis**: updateStateFromImportData or syncPatternASections writing both

### ✅ Check 3: Stack Traces

**Examine stack traces for unprefixed writes:**

Look for these patterns in the call stack:

1. **Callback contamination:**
   ```
   onReferenceStandardChange
   → setDefaults
   → ReferenceState.setValue
   → StateManager.setValue
   ```

2. **Sync contamination:**
   ```
   syncPatternASections
   → section.TargetState.syncFromGlobalState
   → StateManager.setValue
   ```

3. **Calculation writeback:**
   ```
   calculateAll
   → calculateTargetModel
   → StateManager.setValue
   ```

### ✅ Check 4: Timing

**When do contaminating writes occur?**

- **Before "Set Values"**: d_13 dropdown change triggers callbacks
- **During "Set Values"**: updateStateFromImportData writes both
- **After "Set Values"**: calculateAll writes back contaminated values

## Restore Point

If you need to revert the diagnostic logging:

```bash
git reset --hard 0d7b7bfe1f7e190a73dc91e74817cfcfb01a71ec
```

## Next Steps After Testing

1. **Document findings** in REF-MODE-UNITY2.md
2. **Identify exact contamination point** from stack traces
3. **Design surgical fix** targeting specific contamination source
4. **Remove diagnostic logging** before final fix commit
