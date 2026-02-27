# TEUI Cost Calculation Analysis & Enhancement Plan

**Date**: 2025-11-30
**Current Location**: S18 Parallel Coordinates Table ([ParallelCoordinates.js:1150-1285](../../src/core/ParallelCoordinates.js#L1150-L1285))
**Financial Engine**: [src/core/pcFinancials.js](../../src/core/pcFinancials.js)

---

## 📋 Executive Summary

### ✅ TEUI: COMPLETED
**Issue**: TEUI cost calculation only used electricity pricing (d_136 × l_12), failing for mixed-fuel buildings.

**Fix Applied**: Updated to sum all fuel costs from Section 04:
```javascript
Target Cost = (h_27 × l_12) + (h_28 × l_13) + (h_29 × l_14) + (h_30 × l_16) + (h_31 × l_15)
Reference Cost = Same formula using ref_ prefixed fields
```

**Result**: TEUI row in S18 now shows accurate total annual operating costs for all fuel types.

---

### ✅ TEDI: FIXED - Double Counting Resolved!
**Issue Discovered & Fixed**: Previous implementation double-counted heating costs for Gas/Oil systems.

**The Problem (OLD CODE)**:
```javascript
// WRONG - Summed all three values
return (
  d_114 * electricRate +  // ❌ d_114 is ALWAYS calculated (thermal kWh demand)
  h_115 * gasRate +        // ⚠️ h_115 = 0 if not Gas
  f_115 * oilRate          // ⚠️ f_115 = 0 if not Oil
);
```

**Why It Was WRONG**:
- `d_114` (thermal demand in kWh) is **ALWAYS calculated**, regardless of fuel type at `d_113`
- `h_115` and `f_115` are conditionally set to 0 based on fuel type
- **For Gas system**: `d_114 ≠ 0` AND `h_115 ≠ 0` → **DOUBLE COUNTED** cost!
- **For Oil system**: `d_114 ≠ 0` AND `f_115 ≠ 0` → **DOUBLE COUNTED** cost!

**Example of Double Counting (Gas System)**:
- Thermal demand: 50,000 kWh/yr → `d_114 = 50,000`
- Gas volume needed: 5,000 m³ → `h_115 = 5,000`
- Electric rate: $0.13/kWh, Gas rate: $0.51/m³
- **WRONG**: (50,000 × $0.13) + (5,000 × $0.51) = $6,500 + $2,550 = **$9,050**
- **CORRECT**: 5,000 × $0.51 = **$2,550**

**Fix Applied**:
```javascript
// ✅ CORRECT - Conditional logic to use only ONE fuel volume
if (gasHeating > 0) {
  return gasHeating * gasRate;  // Gas system only
} else if (oilHeating > 0) {
  return oilHeating * oilRate;  // Oil system only
} else {
  return electricHeating * electricRate;  // Electric/Heatpump only
}
```

---

### ✅ TELI: COMPLETED - Pro-Rating Approach Implemented
**Issue**: Only used electricity rate, needed to handle all fuel types (Gas, Oil, Electric/Heatpump).

**Solution**: Pro-rating based on TELI/TEDI ratio
- TELI = envelope losses only (walls, roof, floor, windows)
- TEDI = total heating demand (envelope + ventilation + system losses)
- TELI/TEDI ratio captures the proportion of heating costs attributable to envelope

**Implementation**:
1. Added new field `m_131` to Section 14 (row 131):
   - Label: "TELI/TEDI Ratio (used for costs)"
   - ID: "T.5.2a"
   - Formula: `m_131 = h_131 / h_127` (TELI ÷ TEDI)
   - Calculated for both Target and Reference models

2. Updated pcFinancials.js TELI calculation:
```javascript
// TELI cost = TEDI cost × TELI/TEDI ratio
target: () => {
  const tediCost = calculations.tedi.target(); // Already handles all fuel types
  const teliTediRatio = getValue("m_131") || 0;
  return tediCost * teliTediRatio;
}
```

**Benefits**:
- Automatically handles all fuel types by leveraging TEDI's conditional fuel logic
- Accurately represents envelope-specific costs as a proportion of total heating costs
- Simple, maintainable calculation with clear semantic meaning

**Status**: ✅ COMPLETED

### Scope
- **Primary**: ✅ COMPLETED - Fix TEUI row in S18 Parallel Coordinates table
- **Secondary**: ✅ COMPLETED - Clarify TEDI implementation (fixed double-counting bug)
- **Tertiary**: ✅ COMPLETED - TELI enhancement (pro-rating approach implemented)
- **Files Modified**:
  - [src/core/pcFinancials.js](../../src/core/pcFinancials.js) - Updated TEUI, TEDI, and TELI calculations
  - [src/sections/Section14.js](../../src/sections/Section14.js) - Added m_131 field and calculations
- **Total Time**: ~90 minutes (all three metrics complete)

### Key Insight: Implicit Fuel Conditioning
✅ **Summing all fuel types is inherently conditional** because:
- Only ONE fuel type is active per building (no multi-fuel systems)
- If Gas volume = 0, gas cost = 0 (no contribution)
- If Oil volume = 0, oil cost = 0 (no contribution)
- Therefore: `electricCost + gasCost + oilCost` always equals the cost of the active fuel

---

## 🏗️ Architecture: How Heating Fuel Costs Work

### Section 13: Mechanical Loads (Primary Heating Fuel Source)

**Heating System Type** (`d_113` / `ref_d_113`): Dropdown selector
- Options: "Gas", "Oil", "Heatpump", "Electric"
- **Critical**: Only ONE fuel type is active per building (no multi-fuel systems)

**Heating Fuel Volumes** (calculated by Section 13):
- `d_114` / `ref_d_114`: **Thermal Demand** (kWh) - **⚠️ ALWAYS CALCULATED for all system types!**
  - Shows thermal energy needed regardless of fuel type
  - For Electric/Heatpump: This IS the electricity consumed
  - For Gas/Oil: This is thermal demand, NOT the fuel volume
- `h_115` / `ref_h_115`: **Gas Volume** (m³) - Only non-zero when system type = "Gas"
- `f_115` / `ref_f_115`: **Oil Volume** (litres) - Only non-zero when system type = "Oil"
- **Note**: Propane and Wood are NOT calculated by S13 (supplemental only, not primary heating)

**CRITICAL**: For cost calculations:
- Electric/Heatpump: Use `d_114 × l_12` (kWh × $/kWh)
- Gas: Use `h_115 × l_13` (m³ × $/m³) - **IGNORE d_114**
- Oil: Use `f_115 × l_16` (litres × $/litre) - **IGNORE d_114**

### Section 04: Energy Totals (All End Uses)

**Total Fuel Volumes** (Target model):
- `h_27`: Total Electricity (kWh/yr) - All electricity uses (lights, plugs, heating, cooling, etc.)
- `h_28`: Total Gas (m³/yr) - Heating + water heating
- `h_29`: Total Propane (kg/yr) - Supplemental only
- `h_30`: Total Oil (litres/yr) - Heating + water heating
- `h_31`: Total Wood (m³/yr) - Supplemental only

**Key Relationship**:
- For heating-only fuel (Gas/Oil): `h_28 ≈ h_115` (gas) or `h_30 ≈ f_115` (oil) if no DHW gas/oil use
- For electric: `h_27` includes heating (`d_114`) + all other electric loads

---

## 🔍 Current Implementation Analysis

### What The Numbers Mean (From Screenshot) - ✅ CORRECTED

| Row | Value | Description |
|-----|-------|-------------|
| **TEUI (Target)** | 147.28 kWh/m²/yr | Target model Total Energy Use Intensity |
| **TEUI (Reference)** | 838.15 kWh/m²/yr | Reference model Total Energy Use Intensity |
| **TEUI Delta** | -690.87 kWh/m²/yr | Target - Reference (improvement) |
| **TEUI % Delta** | -82.4% | Percentage improvement |
| **Reference Cost** | $240,574.75 | Reference model total annual energy cost (all fuels) |
| **Target Cost** | $213,810.62 | Target model total annual energy cost (all fuels) |
| **Cost Savings** | $26,764.12 | Annual savings (Reference - Target) |
| **Capital Budget** | $1,000,000.00 | User-entered capital cost premium |
| **Simple ROI** | 37.4 yrs | Payback period ($1M ÷ $26,764.12/yr) ✅ |

### 🐛 The Problem - ✅ CORRECTED UNDERSTANDING

The current TEUI cost calculation in [pcFinancials.js:686-703](../../src/core/pcFinancials.js#L686-L703) **only uses electricity pricing**:

```javascript
teui: {
  target: () => {
    const teuiEnergy = getValue("d_136"); // TEUI (kWh/yr) - TARGET
    const electricRate = getValue("l_12"); // $/kWh - TARGET
    return teuiEnergy * electricRate;
  }
}
```

**This is incomplete because:**
1. ✅ Uses total energy (d_136) which is correct
2. ❌ Only multiplies by electricity rate (l_12)
3. ❌ Ignores that buildings use mixed fuels (gas, oil, propane, wood)
4. ❌ Each fuel has different pricing ($/kWh, $/m³, $/litre, etc.)

**The fix:** Use Section 04 fuel-specific volumes (h_27 to h_31) with their respective prices (l_12 to l_17)

---

## 📐 Current Architecture

### Data Flow
```
Section 04 (S04) → Energy Totals
   ├─ h_27 to h_31: Target fuel volumes (kWh, m³, litres)
   ├─ ref_h_27 to ref_h_31: Reference fuel volumes
   └─ Section 01 (S01): Energy Prices
      ├─ l_12: Electricity price ($/kWh)
      ├─ l_13: Gas price ($/m³)
      ├─ l_16: Oil price ($/litre)
      └─ ref_l_12, ref_l_13, ref_l_16: Reference prices

pcFinancials.js (per-axis calculations)
   ├─ TEUI axis: Uses d_136 (kWh/yr total) × l_12 ($/kWh)
   └─ Other axes: Various fuel-specific calculations
```

### TEUI Cost Calculation (lines 686-703)

**Current Code**:
```javascript
teui: {
  target: () => {
    const teuiEnergy = getValue("d_136"); // TEUI (kWh/yr) - TARGET
    const electricRate = getValue("l_12"); // $/kWh - TARGET
    return teuiEnergy * electricRate;
  },
  reference: () => {
    const teuiEnergy = getValue("ref_d_136");
    const electricRate = getValue("ref_l_12");
    return teuiEnergy * electricRate;
  },
  savings: function () {
    const delta = this.reference() - this.target();
    return delta > 0 ? delta : 0;
  },
}
```

**Problem**: This only uses electricity price, ignoring gas/oil costs!

---

## ✅ Correct Formula (Excel-Compliant)

### What We Should Calculate

**Total Annual Operating Cost = Sum of all fuel costs**

```javascript
// Target Cost
Target Cost = (h_27 × l_12)  // Electricity: kWh × $/kWh
            + (h_28 × l_13)  // Gas: m³ × $/m³
            + (h_29 × l_14)  // Propane: kg × $/kg
            + (h_30 × l_16)  // Oil: litres × $/litre
            + (h_31 × l_15)  // Wood: m³ × $/m³

// Reference Cost (same pattern with ref_ prefix)
Reference Cost = (ref_h_27 × ref_l_12)
               + (ref_h_28 × ref_l_13)
               + (ref_h_29 × ref_l_14)
               + (ref_h_30 × ref_l_16)
               + (ref_h_31 × ref_l_15)

// Savings
Savings = Reference Cost - Target Cost
```

### Where To Get Data ###
- these values are published to StateManager, our single source of truth, so never read DOM directly, get ref_ prefixed values for Reference model values and unprefixed values for Target model from there. 

**Where the values are calculated: Section 04 Fields** (Target fuel volumes):
- `h_27`: Total Electricity (kWh/yr) from [Section04.js:99](../../src/sections/Section04.js#L99)
- `h_28`: Total Gas (m³/yr) from [Section04.js:169](../../src/sections/Section04.js#L169)
- `h_29`: Total Propane (kg/yr) from [Section04.js:242](../../src/sections/Section04.js#L242)
- `h_30`: Total Oil (litres/yr) from [Section04.js:310](../../src/sections/Section04.js#L310)
- `h_31`: Total Wood (m³/yr) from [Section04.js:380](../../src/sections/Section04.js#L380)

**Section 01 Fields** (Energy prices)
- `l_12`: Electricity price ($/kWh) default: $0.1300/kWh
- `l_13`: Gas price ($/m³) default: $0.5070/m³
- `l_14`: Propane price ($/kg) default: $1.6200/kg
- `l_15`: Wood price ($/m³) default: $180.00/m³
- `l_16`: Oil price ($/litre) default: $1.500/litre

---

## 🚨 Critical Questions

### 1. Energy Price Fields in S01
**Question**: What are the actual field IDs for energy prices in Section 01? - Human just corrected these for you above. 

The current code references:
- `l_12` (electricity $/kWh) ✅
- `l_13` (gas price) $/m³ 
- `l_16` (oil $/litre) ✅
- `l_14`, `l_15` for propane/wood

**Action**: Need to read Section01.js to confirm energy price field definitions

### 2. Gas Price Units make corrections
**Question**:  `l_13` is in $/m³ 

Looking at pcFinancials.js:
- Line 54: `const gasRate = getValue("l_13"); // $/kWh - TARGET`
- Line 505: `const gasRate = getValue("l_13"); // $/m³ - TARGET`

**Contradiction!** Some calculations use $/kWh, others use $/m³

**Action**: Verify S01 field definition and Excel source - verified

### 3. TEUI vs Total Energy
**Question**: Should TEUI cost use:
- A) `d_136` (TEUI kWh/yr total from S15)? NO!! Use h_27 for Target model, ref_h_27 for Reference model
- B) `h_27` to `h_31` (individual fuel volumes from S04)? - YES!!

**Current approach (A)** assumes all-electric, which is wrong for mixed-fuel buildings. Need to enhance/complete using S04 published data.

**Correct approach (B)** uses actual fuel volumes from S04, which already account for:
- Water heating (S07)
- Space heating (S13)
- All other end uses
- Correct fuel mix per building

---

## 📋 Enhancement Plan

### Option 1: Fix TEUI Cost Calculation (Recommended - Quick Fix)
**Scope**: Update `pcFinancials.js` TEUI calculation to use all fuel types
**Changes**: 1 file ([pcFinancials.js:686-703](../../src/core/pcFinancials.js#L686-L703))
**Time**: 30 minutes
**Impact**: Fixes Reference Cost and Target Cost to include all fuel types (gas, oil, propane, wood)

```javascript
teui: {
  target: () => {
    // Sum all fuel costs from S04 Target columns
    const electricEnergy = getValue("h_27") || 0;
    const gasVolume = getValue("h_28") || 0;
    const propaneVolume = getValue("h_29") || 0;
    const oilVolume = getValue("h_30") || 0;
    const woodVolume = getValue("h_31") || 0;

    // Get energy prices from S01
    const electricRate = getValue("l_12") || 0;  // $/kWh
    const gasRate = getValue("l_13") || 0;       // $/m³
    const propaneRate = getValue("l_14") || 0;   // $/kg
    const oilRate = getValue("l_16") || 0;       // $/litre
    const woodRate = getValue("l_15") || 0;      // $/m³

    return (
      electricEnergy * electricRate +
      gasVolume * gasRate +
      propaneVolume * propaneRate +
      oilVolume * oilRate +
      woodVolume * woodRate
    );
  },
  reference: () => {
    // Same pattern with ref_ prefix
  },
  savings: function () {
    const delta = this.reference() - this.target();
    return delta > 0 ? delta : 0;
  },
}
```

### Option 2: Add Dedicated Cost Row to S04 (Comprehensive)
**Scope**: Add cost calculations to Section 04
**Changes**: 2 files (Section04.js + pcFinancials.js)
**Time**: 2-3 hours

**Advantages**:
- Costs calculated once in S04, reused everywhere
- Excel-compliant (S04 already has row-by-row fuel totals)
- Easy to display costs in S04 table (but space is tight)
- Can add M column "% Compliance" for costs

**New Fields**:
- `f_27_cost` to `f_31_cost`: Actual fuel costs
- `h_27_cost` to `h_31_cost`: Target fuel costs
- `f_32_cost`: Actual total cost (sum)
- `h_32_cost`: Target total cost (sum)

**Formula Example** (Row 27 - Electricity):
```javascript
// d_27 = User actual kWh
// h_27 = Target kWh (from d_136)
// l_12 = Electric rate ($/kWh)

f_27_cost = d_27 × l_12  // Actual electricity cost
h_27_cost = h_27 × l_12  // Target electricity cost
```

---

## 🎯 Recommended Approach

### Step 1: Investigate (30 min)
1. Read Section01.js to find energy price field IDs
2. Verify gas price units ($/m³ vs $/kWh)
3. Check if propane/wood price fields exist
4. Review Excel source (FORMULAE-3039.csv) for cost formulas

### Step 2: Choose Option
- **Option 1** if we only care about S18 table display
- **Option 2** if we want costs throughout the calculator

### Step 3: Implement (1-3 hours depending on option)
- Update pcFinancials.js calculations
- Test with different fuel mixes (electric, gas, oil)
- Verify Reference mode shows correct ref_ values

### Step 4: Test Scenarios
- All-electric building
- Gas heating + electric everything else
- Oil heating + gas water heating
- Reference vs Target cost comparison

---

## 📝 Notes

### Current S04 Space Constraints
Section 04 table is already dense with columns C-N:
- C: Labels
- D-G: Actual values + emissions
- H-K: Target values + emissions
- L-M: Emission factors
- N: Notes

**Adding cost columns would require**:
- Either: Expanding table width (UI challenge)
- Or: Showing costs only in tooltip/hover
- Or: Accepting that costs live only in S18 table

### Why Not Use TEUI Field?
The `d_136` (TEUI kWh/yr) field is useful for energy intensity, but:
- It assumes all-electric building (multiplies by electric rate only)
- Real buildings use mixed fuels (gas heating, electric appliances)
- S04 h_27 to h_31 already have correct fuel breakdown

**Example**:
- Building uses 50,000 kWh/yr total (d_136)
- But 30,000 kWh is gas @ $0.03/kWh
- And 20,000 kWh is electric @ $0.13/kWh
- TEUI × electric rate = $6,500 (WRONG)
- Correct = (30k × $0.03) + (20k × $0.13) = $3,500

---

## 🔗 Related Files

- [src/core/pcFinancials.js](../../src/core/pcFinancials.js) - Current cost engine
- [src/core/ParallelCoordinates.js](../../src/core/ParallelCoordinates.js) - Table display
- [src/sections/Section04.js](../../src/sections/Section04.js) - Energy totals
- [src/sections/Section01.js](../../src/sections/Section01.js) - Energy prices (TO BE INVESTIGATED)

---

---

## 🔬 Detailed Analysis: TEDI, TELI, and Heating Costs

### Current TEDI Implementation ([pcFinancials.js:598-633](../../src/core/pcFinancials.js#L598-L633))

**Status**: 🚨 **BROKEN** - **DOUBLE COUNTS** heating costs for Gas/Oil systems!

```javascript
// CURRENT CODE (WRONG!)
tedi: {
  target: () => {
    const heatingDemand = getValue("d_114"); // ❌ ALWAYS has value (thermal demand kWh)
    const gasVolume = getValue("h_115");     // Gas heating (m³) - TARGET
    const oilVolume = getValue("f_115");     // Oil heating (litres) - TARGET
    const electricRate = getValue("l_12");   // $/kWh
    const gasRate = getValue("l_13");        // $/m³
    const oilRate = getValue("l_16");        // $/litre

    return (
      heatingDemand * electricRate +  // ❌ NOT $0 for Gas/Oil! Always calculated!
      gasVolume * gasRate +            // ✅ $0 if not Gas
      oilVolume * oilRate              // ✅ $0 if not Oil
    );
  }
}
```

**Why This Is BROKEN**:
- **Electric/Heatpump**: `d_114 = 5000 kWh`, `h_115 = 0`, `f_115 = 0` → Cost = `5000 × $0.13 = $650` ✅ CORRECT
- **Gas**: `d_114 = 5000 kWh`, `h_115 = 500 m³`, `f_115 = 0` → Cost = `(5000 × $0.13) + (500 × $0.51) = $905` ❌ WRONG (should be $255)
- **Oil**: `d_114 = 5000 kWh`, `h_115 = 0`, `f_115 = 300 L` → Cost = `(5000 × $0.13) + (300 × $1.50) = $1,100` ❌ WRONG (should be $450)
- **Double counting** occurs because `d_114` is not conditionally zero!

### Current TELI Implementation ([pcFinancials.js:639-656](../../src/core/pcFinancials.js#L639-L656))

**Status**: ❌ **Incomplete** - Only uses electricity rate

```javascript
teli: {
  target: () => {
    const teliEnergy = getValue("d_131"); // TELI (ekWh/yr) - TARGET
    const electricRate = getValue("l_12"); // $/kWh - TARGET
    return teliEnergy * electricRate;
  }
}
```

**Problem**: TELI represents **thermal envelope loss** (in kWh equivalent), which must be:
1. Heated by the building's heating system
2. Converted to fuel cost based on the active heating fuel type

**What TELI Represents**:
- `d_131` = Thermal envelope loss intensity (ekWh/m²/yr) - the heat escaping through walls/roof/floor
- This heat loss must be replaced by the heating system
- Cost depends on which fuel replaces that heat (electric @ $0.13/kWh vs gas @ $0.51/m³)

### Recommended TELI Fix Pattern

Follow the **thermal loss → fuel cost** pattern used by TB%, Ag, Ae, WWR, ACH50, MVHR%:

```javascript
teli: {
  target: () => {
    const teliEnergy = getValue("d_131");     // TELI thermal loss (ekWh/yr)
    const heatingDemand = getValue("d_114");  // Total heating demand (kWh)

    if (heatingDemand === 0) return 0; // No heating system

    // Get Section 13 heating fuel volumes
    const oilHeatingL = getValue("f_115");    // Oil heating (litres)

    // Get fuel rates
    const electricRate = getValue("l_12");    // $/kWh
    const gasRate = getValue("l_13");         // $/m³ (or $/kWh thermal equivalent?)
    const oilRate = getValue("l_16");         // $/litre

    // Calculate cost for each fuel type
    const electricCost = teliEnergy * electricRate;
    const gasCost = teliEnergy * gasRate;

    // For oil: convert thermal kWh to litres, then apply rate
    const oilLitresPerKWh = heatingDemand > 0 ? oilHeatingL / heatingDemand : 0;
    const oilLitres = teliEnergy * oilLitresPerKWh;
    const oilCost = oilLitres * oilRate;

    // Sum all three (only one will be non-zero)
    return electricCost + gasCost + oilCost;
  }
}
```

### Critical Question: Gas Rate Units

**Current Inconsistency** in pcFinancials.js:
- Some axes use: `const gasRate = getValue("l_13"); // $/kWh`
- Other axes use: `const gasRate = getValue("l_13"); // $/m³`

**For thermal kWh → gas cost conversion**:
- Option A: If `l_13` is $/m³, need to convert thermal kWh to m³ first (like oil does)
- Option B: If `l_13` is $/kWh thermal equivalent, can multiply directly

**Question for Human**: What is the actual unit of `l_13` in Section 01?
- Is it $/m³ (volumetric pricing)?
- Or is it $/kWh thermal equivalent (already normalized)?

### TELI vs TEDI Relationship

**TEDI** (Thermal Energy Demand Intensity):
- Represents total heating energy DELIVERED to the building
- Already accounts for system efficiency losses
- Source: Section 13 calculations (`d_114`, `h_115`, `f_115`)

**TELI** (Thermal Envelope Loss Intensity):
- Represents heat LOST through building envelope only
- Subset of total heating demand
- Does not include ventilation losses, DHW recovery, etc.
- Source: Section 15 calculation (`d_131`)

**Cost Relationship**:
- TELI cost = portion of TEDI cost attributable to envelope losses
- TELI ≤ TEDI (envelope loss is part of total heating demand)

---

## ✅ Implementation Status Summary - UPDATED

| Metric | Current Status | Issue | Next Steps |
|--------|---------------|-------|------------|
| **TEUI** | ✅ Fixed | None | Test with mixed-fuel buildings |
| **TEDI** | ✅ Fixed | None | Test with Gas/Oil systems |
| **TELI** | ⚠️ Future | Electric-only | Awaiting S14 data explanation |

---

## 🔧 Required Fix for TEDI

### Correct Implementation

```javascript
tedi: {
  target: () => {
    // Get all fuel volumes
    const electricHeating = getValue("d_114") || 0; // Thermal demand (kWh)
    const gasHeating = getValue("h_115") || 0;       // Gas volume (m³)
    const oilHeating = getValue("f_115") || 0;       // Oil volume (litres)

    // Get fuel rates
    const electricRate = getValue("l_12") || 0; // $/kWh
    const gasRate = getValue("l_13") || 0;      // $/m³
    const oilRate = getValue("l_16") || 0;      // $/litre

    // ✅ CORRECT: Only use the non-zero fuel volume
    // Gas and Oil systems: h_115 or f_115 will be non-zero, use those ONLY
    // Electric systems: h_115 and f_115 are zero, use d_114

    if (gasHeating > 0) {
      return gasHeating * gasRate;  // Gas system: use m³ × $/m³
    } else if (oilHeating > 0) {
      return oilHeating * oilRate;  // Oil system: use litres × $/litre
    } else {
      return electricHeating * electricRate;  // Electric/Heatpump: use kWh × $/kWh
    }
  },
  reference: () => {
    // Same pattern with ref_ prefix
    const electricHeating = getValue("ref_d_114") || 0;
    const gasHeating = getValue("ref_h_115") || 0;
    const oilHeating = getValue("ref_f_115") || 0;

    const electricRate = getValue("ref_l_12") || 0;
    const gasRate = getValue("ref_l_13") || 0;
    const oilRate = getValue("ref_l_16") || 0;

    if (gasHeating > 0) {
      return gasHeating * gasRate;
    } else if (oilHeating > 0) {
      return oilHeating * oilRate;
    } else {
      return electricHeating * electricRate;
    }
  },
  savings: function () {
    const delta = this.reference() - this.target();
    return delta > 0 ? delta : 0;
  },
}
```

---

## 🎯 What Was Fixed

### Changes Made to [pcFinancials.js](../../src/core/pcFinancials.js)

1. **TEUI (lines 685-736)** - ✅ Fixed & Complete
   - **Before**: Only used electricity rate (`d_136 × l_12`)
   - **After**: Sums all 5 fuel costs from S04 (`h_27` to `h_31`)
   - **Impact**: Accurate total operating costs for all fuel types
   - **Status**: ✅ Ready for testing

2. **TEDI (lines 600-641)** - ✅ Fixed & Complete
   - **Before**: Double-counted costs by summing `d_114 + h_115 + f_115`
   - **Problem**: `d_114` is NOT zero for Gas/Oil systems
   - **Fix Applied**: Conditional logic to use only ONE fuel volume
   - **Status**: ✅ Ready for testing

3. **TELI (lines 643-656)** - ⚠️ Future Enhancement
   - **Current**: Electric-only
   - **Proposed**: Pro-rate TEDI cost by TELI/TEDI ratio
   - **Status**: Awaiting Section 14 data explanation

---

**Confirmed Gas Price Unit**: `l_13` = $/m³ (volumetric pricing, NOT $/kWh thermal)

**Action Items**:
1. ✅ **TEUI** - Fixed and ready for testing
2. ✅ **TEDI** - Fixed with conditional logic
3. 🔄 **Commit** changes locally
4. 🧪 **TEST** TEUI with all-electric building
5. 🧪 **TEST** TEDI with Gas system (verify no double-counting)
6. 🧪 **TEST** TEDI with Oil system (verify no double-counting)
7. 💡 **TELI** - Review Section 14 data for implementation approach
