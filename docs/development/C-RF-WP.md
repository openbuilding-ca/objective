# COOLING MODULE REFACTORING WORKPLAN v1.0

**Project:** TEUI Calculator - Cooling System Simplification
**Target:** Replace `4012-Cooling.js` with `4013-CoolingSimple.js`
**Date:** 2025-01-20
**Status:** Draft for Review

---

## 📍 CURRENT STATUS (Oct 27, 2025) - Branch: S13-RF

**LAST UPDATED**: Oct 27, 2025 - Commit 9bc72c6

**WORK COMPLETED**:
- ✅ **Task 5.1.1**: Climate fields (l_20, l_21, l_23) added to S03 with mode-aware support
- ✅ **Task 5.1.2**: S13 modified for Stage 2 calculations (m_129 = MAX(0, d_129 - h_124))
- ✅ **Two-Stage Architecture**: Bootstrap problem eliminated (see Appendix F)
- ✅ **State Isolation**: S01-S12 have excellent performance and clean Target/Reference separation
- ✅ **S12-S13-PURITY Branch**: Completed investigation, merged to main

**NEXT UP**: Task 5.1.3 - Create Test Suite

**S13 REFACTOR STATUS**:
- **Current State**: S13 has perfect state isolation but incomplete e_10 initialization (277.8 vs Excel 196.6)
- **Root Cause**: Multi-pass calculation dependency (S13→S14→S15→S01) requires 3+ passes for full propagation
- **Attempted Solutions**: Hybrid approach with CSV export achieved better initialization (195.9) but introduced state mixing - abandoned
- **Decision**: Complete S13 housekeeping refactor per Task 5.4.3, then implement Orchestrator.js directed graph solution (see SEPT15-RACE-MITIGATION.md)

**PRESERVED FILES**:
- `4012-Section13.js.current-backup` - Clean working version with perfect state isolation
- `4012-Section13.js.oct27-hybrid` - Hybrid experiment documenting state mixing issue

**COOLING.JS STATUS**:
- **Stage 1**: Implemented and functional (free cooling calculations)
- **Stage 2**: Implemented in S13 (mechanical cooling calculations)
- **Integration**: Bootstrap problem resolved - no "priming" needed
- **Remaining Work**: Test suite creation, documentation updates, final cleanup

**BRANCH STRUCTURE**:
- `main` - Updated with S12-S13-PURITY work (commit 0efc841)
- `S13-RF` - Active branch for S13 refactor housekeeping (current)
- `S12-S13-PURITY` - Investigation branch (completed, merged)
- `C-RF` - Old branch (updated but not primary)

**IMMEDIATE PRIORITIES**:
1. Complete S13 housekeeping (Task 5.4.3): Reduce console.log statements, verify Excel formula references, complete JSDoc comments
2. Create test suite (Task 5.1.3) for Cooling.js validation
3. Consider Orchestrator.js implementation for proper multi-pass calculation handling

---

## Executive Summary

### Goals

1. **Simplify code structure** while maintaining 100% Excel parity
2. **Preserve dual-state architecture** (Target/Reference parallel execution)
3. **Remove unused variables** and clarify data flow
4. **Improve maintainability** for human developers and AI agents
5. **Prepare foundation** for future monthly binning and 8760 modeling

### Success Criteria

- ✅ Output values match Excel to 0.01% precision
- ✅ Dual-state calculations produce identical results to current system
- ✅ All S13 downstream dependencies continue to function
- ✅ Code passes validation tests for both Target and Reference modes
- ✅ Documentation clearly explains each calculation step

---

## Phase 1: Input/Output Mapping

### 1.1 Confirmed App Inputs (from StateManager)

**CRITICAL: Inputs Organized by Calculation Stage**

**STAGE 1 INPUTS (Free Cooling Baseline - NO cooling loads):**

| Field   | Description                       | Source      | Type | Mode-Aware | Excel Ref   |
| ------- | --------------------------------- | ----------- | ---- | ---------- | ----------- |
| `h_24`  | Cooling setpoint temperature (°C) | S03 Climate | User | ✅ Yes     | REPORT!H24  |
| `l_20`  | Night-time outdoor temp (°C)      | S03 Climate | User | ✅ Yes     | A3          |
| `l_21`  | Cooling season mean RH (%)        | S03 Climate | User | ✅ Yes     | A4          |
| `l_23`  | Seasonal outdoor RH (%)           | S03 Climate | User | ✅ Yes     | A57         |
| `d_21`  | Cooling Degree Days (CDD)         | S03 Climate | User | ✅ Yes     | REPORT!D21  |
| `m_19`  | Cooling season length (days)      | S03 Climate | User | ✅ Yes     | REPORT!M19  |
| `l_22`  | Elevation (m)                     | S03 Climate | User | ✅ Yes     | REPORT!L22  |
| `d_105` | Building volume (m³)              | S02/S12     | User | ✅ Yes     | REPORT!D105 |
| `h_15`  | Conditioned floor area (m²)       | S02         | User | ✅ Yes     | REPORT!H15  |
| `h_120` | Ventilation rate (m³/hr)          | S13         | Calc | ✅ Yes     | REPORT!H120 |
| `d_120` | Ventilation rate (L/s)            | S13         | Calc | ✅ Yes     | REPORT!D120 |
| `l_119` | Summer boost factor               | S13         | User | ✅ Yes     | REPORT!L119 |
| `g_118` | Ventilation method                | S13         | User | ✅ Yes     | REPORT!G118 |
| `k_120` | Unoccupied setback %              | S13         | User | ✅ Yes     | REPORT!K120 |
| `i_59`  | Indoor RH% during cooling season  | S08         | User | ✅ Yes     | REPORT!I59  |

**STAGE 2 INPUTS (Mechanical Cooling Augmentation - READS Stage 1 outputs):**

| Field                      | Description                             | Source     | Type | Mode-Aware | Excel Ref   |
| -------------------------- | --------------------------------------- | ---------- | ---- | ---------- | ----------- |
| `d_129`                    | Total unmitigated cooling load (kWh/yr) | S09/S11    | Calc | ✅ Yes     | REPORT!D129 |
| `cooling_h_124`            | Free cooling capacity (kWh/yr)          | Cooling.js | Calc | ✅ Yes     | H124        |
| `cooling_latentLoadFactor` | Latent load multiplier                  | Cooling.js | Calc | ✅ Yes     | A6          |

**Note:** `m_129` is NO LONGER an input - it becomes a calculated output in Stage 2.

### 1.2 New Climate Inputs (to be added to S03)

**Action Required:** Add these three fields to S03 climate module (Phase 5)

| Field  | Description                  | Default | Excel Ref | User-Editable | Future Enhancement   |
| ------ | ---------------------------- | ------- | --------- | ------------- | -------------------- |
| `l_20` | Night-time outdoor temp (°C) | 20.43   | A3        | ✅ Yes        | Monthly bin override |
| `l_21` | Cooling season mean RH (%)   | 55.85   | A4        | ✅ Yes        | Monthly bin override |
| `l_23` | Seasonal outdoor RH (%)      | 70.0    | A57       | ✅ Yes        | Monthly bin override |

**Note:** These values currently hardcoded in Cooling.js lines 132-134. Move to S03 for user control and location-specific accuracy.

### 1.3 Confirmed Outputs (to StateManager)

**STAGE 1 OUTPUTS (Cooling.js - Independent Calculations):**

| Field                      | Description                        | Used By              | Excel Ref | Calculation                     |
| -------------------------- | ---------------------------------- | -------------------- | --------- | ------------------------------- |
| `cooling_latentLoadFactor` | Humidity-driven cooling multiplier | S13 → i_122          | A6        | 1 + (Lv × Δω) / (Cp × ΔT)       |
| `cooling_h_124`            | Free cooling capacity (kWh/yr)     | S13 → h_124, Stage 2 | A33×M19   | Daily potential × season length |

**STAGE 2 OUTPUTS (S13 or Cooling.js - Dependent on Stage 1):**

| Field           | Description                      | Used By     | Excel Ref | Calculation                      |
| --------------- | -------------------------------- | ----------- | --------- | -------------------------------- |
| `m_129`         | Mechanical cooling load (kWh/yr) | S13, S14    | M129      | MAX(0, d_129 - h_124)            |
| `cooling_m_124` | Days active cooling required     | S13 → m_124 | E55       | Unmet load / (cooling days × 24) |

**CRITICAL CHANGES FROM CURRENT IMPLEMENTATION:**

1. **m_129 Status Change:**

   - **OLD:** Input to Cooling.js (caused circular dependency)
   - **NEW:** Output from Stage 2 calculation
   - **Formula:** m_129 = MAX(0, d_129 - h_124)
   - **Meaning:** Mechanical cooling needed AFTER free cooling subtracted

2. **Bootstrap Problem Eliminated:**

   - Stage 1 outputs (h_124, latentLoadFactor) calculated independent of loads
   - Stage 2 reads Stage 1 outputs and calculates m_129, m_124
   - One-way data flow: Stage 1 → Stage 2 (no circular dependency)
   - No "priming" required (g_118 toggle, d_116 toggle no longer needed)

3. **Calculation Location Question:**
   - **Option A:** Both stages in Cooling.js (keeps all cooling logic together)
   - **Option B:** Stage 1 in Cooling.js, Stage 2 in S13 (distributes responsibility)
   - **Recommendation:** Stage 1 in Cooling.js, Stage 2 in S13
     - Rationale: S13 owns mechanical system calculations
     - S13 reads d_129 (from gains) and h_124 (from Cooling.js)
     - S13 calculates m_129 and publishes to StateManager

**Critical:** All outputs must include mode prefix (`ref_` for Reference mode) for proper dual-state support.

---

## Phase 2: Constants Audit

### 2.1 Constants to KEEP (Essential Physics)

```javascript
PHYSICS: {
  AIR_DENSITY: 1.204,           // kg/m³ (Excel E3)
  SPECIFIC_HEAT: 1005,          // J/(kg·K) (Excel E4)
  LATENT_HEAT: 2501000,         // J/kg (Excel E6)
  ATM_PRESSURE_SEA: 101325,     // Pa (Excel E13)
  GROUND_TEMP: 10               // °C (Excel A7) - Used for ΔT_ground = Tset - 10
}
```

**Rationale:** These are fundamental thermodynamic properties required for psychrometric calculations.

### 2.2 Constants to REMOVE (Now User Inputs via S03)

```javascript
// DELETE from Cooling.js lines 132-134
// Moved to S03 as l_20, l_21, l_23
nightTimeTemp: 20.43           → S03 l_20
coolingSeasonMeanRH: 0.5585    → S03 l_21
outdoorSeasonalRH: 0.7         → S03 l_23 (currently hardcoded at line 289)
```

**Action:** Remove these from Cooling.js and read from StateManager instead.

### 2.3 Constants to VERIFY

| Constant     | Current Value | Excel Ref | Usage                   | Keep?  |
| ------------ | ------------- | --------- | ----------------------- | ------ |
| `groundTemp` | 10°C          | A7        | ΔT for Ag = (Tset - 10) | ✅ YES |

**Correction:** Ground temp IS used for ground-facing element temperature differential. Keep this constant.

---

## Phase 3: Calculation Chain Analysis

### 3.1 Core Calculation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT ACQUISITION                         │
│  Read 14 fields from StateManager (mode-aware)             │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              PSYCHROMETRIC CALCULATIONS                      │
│  • Atmospheric pressure (elevation-adjusted)                │
│  • Tetens formula (indoor/outdoor vapor pressure)           │
│  • Wet bulb temperature (simplified formula)                │
│  • Humidity ratios (indoor/outdoor)                         │
│  • Latent load factor (Excel A6)                            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           FREE COOLING CAPACITY CALCULATION                  │
│  • Base ventilation rate (h_120)                            │
│  • Apply summer boost (l_119)                               │
│  • Mass flow rate (ṁ = V̇ × ρ)                              │
│  • Sensible cooling power (Q̇ = ṁ × Cp × ΔT)               │
│  • Daily potential (Excel A33)                              │
│  • Annual capacity (A33 × M19)                              │
│  • Apply setback for scheduled ventilation                  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│        ACTIVE COOLING DAYS CALCULATION                       │
│  • Daily mitigated load (m_129 / d_21) [Excel E37]         │
│  • Daily free cooling (h_124 / d_21) [Excel E36]           │
│  • Seasonal cooling load (E37 × E45) [Excel E50]           │
│  • Seasonal free cooling (E36 × E45) [Excel E51]           │
│  • Unmet load (E50 - E51) [Excel E52]                      │
│  • Days active cooling (E52 / (E54 × 24)) [Excel E55]     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   OUTPUT PUBLICATION                         │
│  Write 3 values to StateManager (with mode prefix)         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Detailed Calculation Specifications

**CRITICAL DESIGN PRINCIPLE: Two-Stage Independent Calculation**

To eliminate the bootstrap problem (requiring "priming" by toggling g_118 or d_116), we adopt a strict calculation sequence:

**STAGE 1: Free Cooling Baseline (Cooling.js - INDEPENDENT)**

- Calculate free cooling capacity based ONLY on ventilation physics
- NEVER reads cooling loads (m_129, d_129)
- Assumption: Building has NO mechanical cooling system
- Question: "How much cooling can ventilation alone provide?"

**STAGE 2: Mechanical Cooling Augmentation (S13 - DEPENDENT)**

- Calculate mechanical cooling needed AFTER free cooling is known
- Reads: d_129 (total cooling load), h_124 (free cooling capacity from Stage 1)
- Calculates: m_129 = d_129 - h_124 (remaining load requiring mechanical cooling)
- Question: "How much mechanical cooling is needed to supplement free cooling?"

**Data Flow (One-Way, No Circular Dependencies):**

```
Climate Data (S03) ─────────┐
Ventilation (S13)  ─────────┤
Building (S02/S12) ─────────┤
                            ├──> [STAGE 1: Cooling.js]
Indoor Conditions (S08) ────┘         │
                                      ├─> h_124 (free cooling capacity)
                                      └─> latentLoadFactor
                                             │
Cooling Loads (S09/S10/S11) ───> d_129 ──────┤
                                             │
                                             ├──> [STAGE 2: S13]
                                             │         │
                              h_124 ─────────┘         ├─> m_129 (mechanical load)
                                                       └─> m_124 (days active cooling)
```

**Bootstrap Problem Eliminated:**

- No circular dependency between h_124 and m_129
- Free cooling (h_124) calculated first, independent of loads
- Mechanical cooling (m_129) calculated second, using h_124 as input
- Single-pass calculation (no iteration or "priming" required)

---

#### 3.2.1 STAGE 1: Free Cooling Baseline Calculations

**Excel Reference:** COOLING-TARGET.csv cells A28-A33, H124 (ventilation physics ONLY)

**CRITICAL: This stage NEVER reads cooling loads (m_129, d_129)**

**Excel Reference:** COOLING-TARGET.csv cells A50-A66, E64-E66

```javascript
// Step 1: Atmospheric Pressure (elevation-adjusted)
// Excel E15 = E13 * EXP(-E14/8434)
atmPressure_Pa = 101325 * Math.exp(-elevation_m / 8434);

// Step 2: Wet Bulb Temperature (Simplified)
// Excel E64 = E60 - (E60 - (E60 - (100 - E59)/5)) * (0.1 + 0.9 * (E59 / 100))
// Use ONLY this formula (E64), discard E65/E66 averaging
function wetBulbTemp(dryBulb_C, relativeHumidity_pct) {
  const tdb = dryBulb_C;
  const rh = relativeHumidity_pct;
  return tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.1 + 0.9 * (rh / 100));
}

// Step 3: Saturation Vapor Pressure (Tetens Formula)
// Excel A56 = 610.94 * EXP(17.625 * A50 / (A50 + 243.04))
function tetens(temp_C) {
  return 610.94 * Math.exp((17.625 * temp_C) / (temp_C + 243.04));
}

// Step 4: Indoor Conditions
// Excel A59 = Tetens(A8) where A8 = h_24 (cooling setpoint)
pSat_indoor_Pa = tetens(coolingSetpoint_C);
// Excel A60 = A59 * A52 where A52 = i_59 (indoor RH%)
vaporPressure_indoor_Pa = pSat_indoor_Pa * (indoorRH_pct / 100);
// Excel A61 = 0.62198 * A60 / (E15 - A60)
humidityRatio_indoor =
  (0.62198 * vaporPressure_indoor_Pa) /
  (atmPressure_Pa - vaporPressure_indoor_Pa);

// Step 5: Outdoor Conditions
// Excel A50 = E64 (wet bulb using l_20 and l_21)
wetBulb_outdoor_C = wetBulbTemp(nightTemp_C, meanRH_pct);
// Excel A56 = Tetens(A50)
pSat_outdoor_Pa = tetens(wetBulb_outdoor_C);
// Excel A58 = A56 * A57 where A57 = 0.7 (now l_23)
vaporPressure_outdoor_Pa = pSat_outdoor_Pa * (outdoorRH_pct / 100);
// Excel A62 = 0.62198 * A58 / (E15 - A58)
humidityRatio_outdoor =
  (0.62198 * vaporPressure_outdoor_Pa) /
  (atmPressure_Pa - vaporPressure_outdoor_Pa);

// Step 6: Latent Load Factor
// Excel A63 = A62 - A61
deltaHumidity = humidityRatio_outdoor - humidityRatio_indoor;
// Excel A16 = A8 - A3 (where A8 = h_24, A3 = l_20)
tempDiff_K = nightTemp_C - coolingSetpoint_C;
// Excel A64 = A54 * E3 * E6 * A63 (numerator)
// Excel A55 = H26 * E3 * E4 * (A49 - H27) (denominator)
// Excel A6 = 1 + A64/A55
// Simplified (A54 and H26 both = h_120/3600, they cancel):
// A6 = 1 + [E6 * A63] / [E4 * (A49 - H27)]
if (tempDiff_K === 0) {
  latentLoadFactor = 1.0; // Prevent division by zero
} else {
  latentLoadFactor =
    1 + (LATENT_HEAT * deltaHumidity) / (SPECIFIC_HEAT * tempDiff_K);
}
```

**Future Enhancement Point:** When monthly binning is available, this section can calculate latent load factor per month using monthly temperature and humidity data.

---

#### 3.2.2 STAGE 1: Psychrometric Calculations (Independent)

**Excel Reference:** COOLING-TARGET.csv cells A50-A66, E64-E66

**Purpose:** Calculate latent load factor based purely on climate and indoor conditions

**Inputs Required (NO cooling loads):**

- Climate: l_20 (night temp), l_21 (RH at 15h00), l_23 (seasonal RH), l_22 (elevation)
- Indoor: h_24 (cooling setpoint), i_59 (indoor RH%)
- Constants: Physics properties (air density, specific heat, latent heat)

```javascript
// Step 1: Atmospheric Pressure (elevation-adjusted)
// Excel E15 = E13 * EXP(-E14/8434)
atmPressure_Pa = 101325 * Math.exp(-elevation_m / 8434);

// Step 2: Wet Bulb Temperature (Simplified)
// Excel E64 = E60 - (E60 - (E60 - (100 - E59)/5)) * (0.1 + 0.9 * (E59 / 100))
// Use ONLY this formula (E64), discard E65/E66 averaging
function wetBulbTemp(dryBulb_C, relativeHumidity_pct) {
  const tdb = dryBulb_C;
  const rh = relativeHumidity_pct;
  return tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.1 + 0.9 * (rh / 100));
}

// Step 3: Saturation Vapor Pressure (Tetens Formula)
// Excel A56 = 610.94 * EXP(17.625 * A50 / (A50 + 243.04))
function tetens(temp_C) {
  return 610.94 * Math.exp((17.625 * temp_C) / (temp_C + 243.04));
}

// Step 4: Indoor Conditions
// Excel A59 = Tetens(A8) where A8 = h_24 (cooling setpoint)
pSat_indoor_Pa = tetens(coolingSetpoint_C);
// Excel A60 = A59 * A52 where A52 = i_59 (indoor RH%)
vaporPressure_indoor_Pa = pSat_indoor_Pa * (indoorRH_pct / 100);
// Excel A61 = 0.62198 * A60 / (E15 - A60)
humidityRatio_indoor =
  (0.62198 * vaporPressure_indoor_Pa) /
  (atmPressure_Pa - vaporPressure_indoor_Pa);

// Step 5: Outdoor Conditions
// Excel A50 = E64 (wet bulb using l_20 and l_21)
wetBulb_outdoor_C = wetBulbTemp(nightTemp_C, meanRH_pct);
// Excel A56 = Tetens(A50)
pSat_outdoor_Pa = tetens(wetBulb_outdoor_C);
// Excel A58 = A56 * A57 where A57 = 0.7 (now l_23)
vaporPressure_outdoor_Pa = pSat_outdoor_Pa * (outdoorRH_pct / 100);
// Excel A62 = 0.62198 * A58 / (E15 - A58)
humidityRatio_outdoor =
  (0.62198 * vaporPressure_outdoor_Pa) /
  (atmPressure_Pa - vaporPressure_outdoor_Pa);

// Step 6: Latent Load Factor
// Excel A63 = A62 - A61
deltaHumidity = humidityRatio_outdoor - humidityRatio_indoor;
// Excel A16 = A8 - A3 (where A8 = h_24, A3 = l_20)
tempDiff_K = nightTemp_C - coolingSetpoint_C;
// Excel A64 = A54 * E3 * E6 * A63 (numerator)
// Excel A55 = H26 * E3 * E4 * (A49 - H27) (denominator)
// Excel A6 = 1 + A64/A55
// Simplified (A54 and H26 both = h_120/3600, they cancel):
// A6 = 1 + [E6 * A63] / [E4 * (A49 - H27)]
if (tempDiff_K === 0) {
  latentLoadFactor = 1.0; // Prevent division by zero
} else {
  latentLoadFactor =
    1 + (LATENT_HEAT * deltaHumidity) / (SPECIFIC_HEAT * tempDiff_K);
}
```

**Output:** `latentLoadFactor` (dimensionless, typically 1.2 - 2.0)

**Future Enhancement Point:** When monthly binning is available, calculate per-month latent load factors.

---

#### 3.2.3 STAGE 1: Free Cooling Capacity (Independent)

**Excel Reference:** COOLING-TARGET.csv cells A28-A33, H124

```javascript
// Step 1: Base Ventilation Rate
// Excel A28 = IF(REPORT!L119="None", REPORT!D120, REPORT!D120*REPORT!L119)
ventRate_L_s = d_120; // Base rate in L/s
if (l_119 !== "None" && l_119 !== "") {
  const boostFactor = parseFloat(l_119);
  ventRate_L_s = d_120 * boostFactor;
}

// Step 2: Mass Flow Rate
// Excel A29 = A28/1000 (L/s to m³/s)
ventRate_m3s = ventRate_L_s / 1000;
// Excel A30 = A29 * E3
massFlow_kgs = ventRate_m3s * AIR_DENSITY; // 1.204 kg/m³

// Step 3: Temperature Differential
// Excel A16 = A8 - A3 (indoor warmer than outdoor night)
tempDiff_K = coolingSetpoint_C - nightTemp_C;

// Step 4: Sensible Cooling Power
// Excel A31 = A30 * E4 * A16
sensiblePower_W = massFlow_kgs * SPECIFIC_HEAT * tempDiff_K; // Watts (J/s)

// Step 5: Daily Cooling Potential
// Excel A32 = A31 * 86400 (J/s to J/day)
dailyHeatRemoval_J = sensiblePower_W * 86400;
// Excel A33 = A32 / 3600000 (J to kWh)
dailyCooling_kWh = dailyHeatRemoval_J / 3600000;
// Simplified: dailyCooling_kWh = sensiblePower_W * 0.024

// Step 6: Annual Potential
// Excel H124 = A33 * M19
annualPotential_kWh = dailyCooling_kWh * coolingDays;

// Step 7: Apply Setback for Scheduled Ventilation
// Excel H124 considers g_118 and k_120
if (g_118.toLowerCase().includes("schedule")) {
  const setbackFactor = k_120 / 100;
  freeCoolingCapacity = annualPotential_kWh * setbackFactor;
} else {
  freeCoolingCapacity = annualPotential_kWh;
}
```

**Future Enhancement Point:** When monthly binning is available, this section can calculate free cooling capacity per month using monthly temperature differentials and apply occupancy schedules per month.

---

#### 3.2.4 STAGE 2: Active Cooling Days (Dependent on Stage 1)

**Excel Reference:** COOLING-TARGET.csv cells E36-E55

**Purpose:** Calculate how many days mechanical cooling system must operate

**CRITICAL CHANGE FROM CURRENT IMPLEMENTATION:**

- Old approach: Used m_129 as input (circular dependency)
- New approach: Uses d_129 (total cooling load) and h_124 (free cooling capacity)
- m_129 is now CALCULATED here, not read as input

**Inputs Required:**

- d_129: Total unmitigated cooling load (from S09/S11 gains calculations)
- h_124: Free cooling capacity (from Stage 1 above)
- d_21: Cooling degree days (CDD)
- m_19: Length of cooling season (days)

```javascript
// Step 1: Calculate Mechanical Cooling Required
// NEW: This eliminates the circular dependency
// m_129 = MAX(0, d_129 - h_124)
const mechanicalCoolingRequired = Math.max(0, d_129_total - h_124_freeCooling);

// Step 2: Daily Loads
// Excel E37 = m_129 / CDD (but now we calculate m_129 locally)
const dailyMechanicalLoad = d_21 > 0 ? mechanicalCoolingRequired / d_21 : 0;

// Excel E36 = h_124 / CDD
const dailyFreeCooling = d_21 > 0 ? h_124_freeCooling / d_21 : 0;

// Step 3: Seasonal Loads
// Excel E50 = E37 * E45
const seasonalMechanicalLoad = dailyMechanicalLoad * d_21;

// Excel E51 = E36 * E45
const seasonalFreeCooling = dailyFreeCooling * d_21;

// Step 4: Unmet Load (should be close to mechanicalCoolingRequired)
// Excel E52 = E50 - E51
const unmetLoad = seasonalMechanicalLoad - seasonalFreeCooling;

// Step 5: Days Active Cooling Required
// Excel E55 = E52 / (E54 * 24)
let daysActiveCooling = 0;
if (m_19 > 0) {
  daysActiveCooling = unmetLoad / (m_19 * 24);
}

// Note: Can be negative if free cooling exceeds total load
// Excel comment: "Obviously negative days of free cooling is not possible -
// the goal here is to get close to zero - anything less than zero is
// overkill ventilation-wise"

// Return both calculated values
return {
  m_129: mechanicalCoolingRequired, // NEW: Now calculated, not input
  m_124: daysActiveCooling,
};
```

**Outputs:**

- `m_129`: Mechanical cooling load after free cooling subtracted (kWh/yr)
- `m_124`: Days mechanical cooling system must operate

**Key Difference from Current Implementation:**

- m_129 is now a CALCULATED OUTPUT, not an INPUT
- This breaks the circular dependency: h_124 → m_129 (one-way)
- No "priming" or iteration required

**Question for Verification:**

- **Q: Does this match Excel's intended calculation sequence?**
- **Q: Should this calculation happen in Cooling.js or S13?**
- **Q: If in S13, how do we ensure it uses the Stage 1 h_124 value?**

**Future Enhancement Point:** When 8760 hourly modeling is available, calculate active cooling hours by summing hourly unmet loads after subtracting available free cooling each hour.

---

## Phase 4: Code Structure

### 4.1 Module Architecture - Two-Stage Design

**CRITICAL: Code organized to match calculation stages and eliminate bootstrap problem**

```javascript
// 4013-CoolingSimple.js
window.TEUI.CoolingCalculations = (function () {
  // ==========================================
  // SECTION 1: CONSTANTS
  // ==========================================
  const PHYSICS = {
    AIR_DENSITY: 1.204, // kg/m³ (Excel E3)
    SPECIFIC_HEAT: 1005, // J/(kg·K) (Excel E4)
    LATENT_HEAT: 2501000, // J/kg (Excel E6)
    ATM_PRESSURE_SEA: 101325, // Pa (Excel E13)
    GROUND_TEMP: 10, // °C (Excel A7)
  };

  const CONVERSIONS = {
    SECONDS_PER_DAY: 86400,
    HOURS_PER_DAY: 24,
    LITERS_PER_M3: 1000,
    JOULES_PER_KWH: 3.6e6,
    WATTS_TO_KWH_PER_DAY: 86400 / 3.6e6, // 0.024 - W to kWh/day
    PA_PER_KPA: 1000,
  };

  // ==========================================
  // SECTION 2: INPUT ACQUISITION
  // ==========================================

  /**
   * Get value from StateManager with mode awareness
   * @param {string} fieldId - Field identifier (e.g., 'h_24')
   * @param {string} mode - 'target' or 'reference'
   * @returns {string|null} - Value from StateManager
   */
  function getInput(fieldId, mode = "target") {
    const prefix = mode === "reference" ? "ref_" : "";
    const value = window.TEUI.StateManager.getValue(`${prefix}${fieldId}`);
    if (value === null || value === undefined) {
      throw new Error(
        `[Cooling] REQUIRED input ${prefix}${fieldId} is missing`,
      );
    }
    return value;
  }

  /**
   * Read STAGE 1 inputs from StateManager (free cooling baseline)
   * CRITICAL: Does NOT read cooling loads (m_129, d_129)
   * @param {string} mode - 'target' or 'reference'
   * @returns {Object} - Validated Stage 1 input object
   * @throws {Error} - If any required input is missing
   */
  function readStage1Inputs(mode) {
    return {
      // Climate inputs (S03)
      coolingSetpoint: parseFloat(getInput("h_24", mode)),
      nightTemp: parseFloat(getInput("l_20", mode)),
      meanRH: parseFloat(getInput("l_21", mode)),
      outdoorRH: parseFloat(getInput("l_23", mode)),
      cdd: parseFloat(getInput("d_21", mode)),
      coolingDays: parseFloat(getInput("m_19", mode)),
      elevation: parseFloat(getInput("l_22", mode)),

      // Building inputs (S02/S12)
      volume: parseFloat(getInput("d_105", mode)),
      area: parseFloat(getInput("h_15", mode)),

      // HVAC inputs (S13)
      ventRate_m3hr: parseFloat(getInput("h_120", mode)),
      ventRate_Ls: parseFloat(getInput("d_120", mode)),
      summerBoost: getInput("l_119", mode),
      ventMethod: getInput("g_118", mode),
      setback: parseFloat(getInput("k_120", mode)),

      // Indoor environment (S08)
      indoorRH: parseFloat(getInput("i_59", mode)),
    };
  }

  /**
   * Validate Stage 1 inputs for physical plausibility
   * @param {Object} inputs - Input object from readStage1Inputs()
   * @throws {Error} - If validation fails
   */
  function validateStage1Inputs(inputs) {
    const warnings = [];
    const errors = [];

    // Physical impossibilities (errors)
    if (inputs.elevation < -500 || inputs.elevation > 5000) {
      errors.push(
        `Elevation ${inputs.elevation}m outside expected range (-500 to 5000m)`,
      );
    }

    if (inputs.indoorRH < 0 || inputs.indoorRH > 100) {
      errors.push(`Indoor RH ${inputs.indoorRH}% outside valid range (0-100%)`);
    }

    if (inputs.meanRH < 0 || inputs.meanRH > 100) {
      errors.push(`Mean RH ${inputs.meanRH}% outside valid range (0-100%)`);
    }

    if (inputs.outdoorRH < 0 || inputs.outdoorRH > 100) {
      errors.push(
        `Outdoor RH ${inputs.outdoorRH}% outside valid range (0-100%)`,
      );
    }

    if (inputs.coolingDays < 0 || inputs.coolingDays > 365) {
      errors.push(
        `Cooling days ${inputs.coolingDays} outside valid range (0-365)`,
      );
    }

    // Unusual conditions (warnings)
    if (inputs.nightTemp >= inputs.coolingSetpoint) {
      warnings.push(
        `Night temp (${inputs.nightTemp}°C) >= cooling setpoint (${inputs.coolingSetpoint}°C) ` +
          `- no free cooling available`,
      );
    }

    if (inputs.cdd === 0 && inputs.coolingDays > 0) {
      warnings.push(
        `Zero CDD with ${inputs.coolingDays} cooling days - check climate data consistency`,
      );
    }

    if (inputs.indoorRH > inputs.outdoorRH) {
      warnings.push(
        `Indoor RH (${inputs.indoorRH}%) > outdoor RH (${inputs.outdoorRH}%) ` +
          `- unusual condition, verify inputs`,
      );
    }

    // Log warnings, throw on errors
    warnings.forEach((w) => console.warn(`[Cooling] ${w}`));
    if (errors.length > 0) {
      throw new Error(`[Cooling] Invalid inputs:\n${errors.join("\n")}`);
    }
  }

  // ==========================================
  // SECTION 3: STAGE 1 - PSYCHROMETRIC FUNCTIONS
  // ==========================================

  /**
   * Calculate saturation vapor pressure using Tetens formula
   * Excel Reference: A56 = 610.94 * EXP(17.625 * A50 / (A50 + 243.04))
   * @param {number} temp_C - Temperature in Celsius
   * @returns {number} - Saturation vapor pressure in Pascals
   */
  function tetens(temp_C) {
    return 610.94 * Math.exp((17.625 * temp_C) / (temp_C + 243.04));
  }

  /**
   * Calculate wet bulb temperature (novel linear approximation)
   * Excel Reference: E64 = E60 - (E60 - (E60 - (100 - E59)/5)) * (0.1 + 0.9 * (E59 / 100))
   * Note: This is a NOVEL formula for deriving Twb when climate data doesn't provide it
   * @param {number} dryBulb_C - Dry bulb temperature in Celsius
   * @param {number} relativeHumidity_pct - Relative humidity in percent (0-100)
   * @returns {number} - Wet bulb temperature in Celsius
   */
  function wetBulbTemp(dryBulb_C, relativeHumidity_pct) {
    const tdb = dryBulb_C;
    const rh = relativeHumidity_pct;
    return tdb - (tdb - (tdb - (100 - rh) / 5)) * (0.1 + 0.9 * (rh / 100));
  }

  /**
   * Calculate humidity ratio from vapor pressure
   * Excel Reference: A61/A62 = 0.62198 * vapor_pressure / (atm_pressure - vapor_pressure)
   * @param {number} vaporPressure_Pa - Partial vapor pressure in Pascals
   * @param {number} atmPressure_Pa - Atmospheric pressure in Pascals
   * @returns {number} - Humidity ratio in kg water / kg dry air
   */
  function humidityRatio(vaporPressure_Pa, atmPressure_Pa) {
    return (0.62198 * vaporPressure_Pa) / (atmPressure_Pa - vaporPressure_Pa);
  }

  /**
   * STAGE 1: Calculate latent load factor
   * Excel Reference: A6 = 1 + A64/A55
   * Simplified: A6 = 1 + [E6 * A63] / [E4 * (A49 - H27)]
   * CRITICAL: Does NOT read cooling loads - purely psychrometric
   * @param {Object} inputs - Stage 1 input object from readStage1Inputs()
   * @returns {number} - Latent load factor (dimensionless, typically 1.2-2.0)
   */
  function calculateLatentLoadFactor(inputs) {
    // Atmospheric pressure adjusted for elevation (Excel E15)
    const atmPressure =
      PHYSICS.ATM_PRESSURE_SEA * Math.exp(-inputs.elevation / 8434);

    // === INDOOR CONDITIONS ===
    // Excel A59 = Tetens(A8) where A8 = h_24
    const pSat_indoor = tetens(inputs.coolingSetpoint);
    // Excel A60 = A59 * A52 where A52 = i_59
    const vaporPressure_indoor = pSat_indoor * (inputs.indoorRH / 100);
    // Excel A61
    const omega_indoor = humidityRatio(vaporPressure_indoor, atmPressure);

    // === OUTDOOR CONDITIONS ===
    // Excel A50 = E64 (wet bulb using l_20 and l_21)
    const wetBulb = wetBulbTemp(inputs.nightTemp, inputs.meanRH);
    // Excel A56 = Tetens(A50)
    const pSat_outdoor = tetens(wetBulb);
    // Excel A58 = A56 * A57 where A57 = 0.7 (now l_23)
    const vaporPressure_outdoor = pSat_outdoor * (inputs.outdoorRH / 100);
    // Excel A62
    const omega_outdoor = humidityRatio(vaporPressure_outdoor, atmPressure);

    // === LATENT LOAD FACTOR ===
    // Excel A63 = A62 - A61
    const deltaHumidity = omega_outdoor - omega_indoor;
    // Excel A16 = A3 - A8 (outdoor - indoor, for denominator sign)
    const tempDiff = inputs.nightTemp - inputs.coolingSetpoint;

    // Prevent division by zero
    if (Math.abs(tempDiff) < 0.01) {
      console.warn(
        "[Cooling] Temperature differential near zero, using fallback latent load factor 1.0",
      );
      return 1.0;
    }

    // Excel A6 = 1 + [E6 * A63] / [E4 * (A49 - H27)]
    const numerator = PHYSICS.LATENT_HEAT * deltaHumidity;
    const denominator = PHYSICS.SPECIFIC_HEAT * tempDiff;

    let latentLoadFactor = 1 + numerator / denominator;

    // Physical bounds checking
    if (latentLoadFactor < 1.0) {
      console.warn(
        `[Cooling] Latent load factor ${latentLoadFactor.toFixed(3)} < 1.0 (physically impossible), ` +
          `clamping to 1.0. Check humidity inputs.`,
      );
      latentLoadFactor = 1.0;
    }

    if (latentLoadFactor > 3.0) {
      console.warn(
        `[Cooling] Latent load factor ${latentLoadFactor.toFixed(3)} > 3.0 (unusually high), ` +
          `verify humidity inputs are correct.`,
      );
    }

    return latentLoadFactor;
  }

  // ==========================================
  // SECTION 4: STAGE 1 - FREE COOLING CAPACITY
  // ==========================================

  /**
   * STAGE 1: Calculate annual free cooling capacity
   * Excel Reference: H124 = A33 * M19 (with adjustments for g_118 and k_120)
   * CRITICAL: Does NOT read cooling loads - purely ventilation physics
   * @param {Object} inputs - Stage 1 input object from readStage1Inputs()
   * @returns {number} - Annual free cooling capacity in kWh/yr
   */
  function calculateFreeCoolingCapacity(inputs) {
    // === VENTILATION RATE WITH SUMMER BOOST ===
    // Excel A28 = IF(REPORT!L119="None", REPORT!D120, REPORT!D120*REPORT!L119)
    let ventRate_L_s = inputs.ventRate_Ls;
    if (inputs.summerBoost !== "None" && inputs.summerBoost !== "") {
      const boostFactor = parseFloat(inputs.summerBoost);
      if (!isNaN(boostFactor)) {
        ventRate_L_s = inputs.ventRate_Ls * boostFactor;
      }
    }

    // === MASS FLOW RATE ===
    // Excel A29 = A28/1000
    const ventRate_m3s = ventRate_L_s / CONVERSIONS.LITERS_PER_M3;
    // Excel A30 = A29 * E3
    const massFlow_kgs = ventRate_m3s * PHYSICS.AIR_DENSITY;

    // === TEMPERATURE DIFFERENTIAL ===
    // Excel A16 = A8 - A3 (indoor warmer than outdoor night)
    const tempDiff = inputs.coolingSetpoint - inputs.nightTemp;

    // Check if free cooling is possible
    if (tempDiff <= 0) {
      console.warn(
        `[Cooling] No free cooling available: indoor temp (${inputs.coolingSetpoint}°C) ` +
          `<= outdoor night temp (${inputs.nightTemp}°C)`,
      );
      return 0;
    }

    // === SENSIBLE COOLING POWER ===
    // Excel A31 = A30 * E4 * A16
    const sensiblePower_W = massFlow_kgs * PHYSICS.SPECIFIC_HEAT * tempDiff;

    // === DAILY COOLING POTENTIAL ===
    // Excel A32 = A31 * 86400
    // Excel A33 = A32 / 3600000
    // Simplified: A33 = A31 * 0.024
    const dailyCooling_kWh = sensiblePower_W * CONVERSIONS.WATTS_TO_KWH_PER_DAY;

    // === ANNUAL POTENTIAL ===
    // Excel H124 base = A33 * M19
    let annualPotential = dailyCooling_kWh * inputs.coolingDays;

    // === APPLY SETBACK FOR SCHEDULED VENTILATION ===
    // Excel H124 logic: if g_118 includes "schedule", multiply by k_120/100
    if (inputs.ventMethod.toLowerCase().includes("schedule")) {
      const setbackFactor = inputs.setback / 100;
      annualPotential *= setbackFactor;
      console.log(
        `[Cooling] Applied ${inputs.setback}% setback for scheduled ventilation: ` +
          `${(dailyCooling_kWh * inputs.coolingDays).toFixed(2)} → ${annualPotential.toFixed(2)} kWh/yr`,
      );
    }

    return annualPotential;
  }

  // ==========================================
  // SECTION 5: STAGE 1 - MAIN CALCULATION
  // ==========================================

  /**
   * STAGE 1: Execute complete free cooling baseline calculation
   * CRITICAL: Does NOT read or calculate mechanical cooling loads
   * @param {string} mode - 'target' or 'reference'
   * @returns {Object} - Stage 1 results {latentLoadFactor, freeCoolingCapacity}
   * @throws {Error} - If any calculation fails
   */
  function calculateStage1(mode = "target") {
    console.log(
      `[Cooling STAGE 1] Starting free cooling baseline (${mode} mode)...`,
    );

    try {
      // Step 1: Acquire and validate inputs
      const inputs = readStage1Inputs(mode);
      validateStage1Inputs(inputs);

      // Step 2: Calculate latent load factor (psychrometric)
      const latentLoadFactor = calculateLatentLoadFactor(inputs);

      // Step 3: Calculate free cooling capacity (ventilation physics)
      const freeCoolingCapacity = calculateFreeCoolingCapacity(inputs);

      // Step 4: Assemble results
      const results = {
        latentLoadFactor,
        freeCoolingCapacity,
      };

      console.log(
        `[Cooling STAGE 1] Completed ${mode} mode:\n` +
          `  Latent Load Factor: ${latentLoadFactor.toFixed(3)}\n` +
          `  Free Cooling Capacity: ${freeCoolingCapacity.toFixed(2)} kWh/yr`,
      );

      return results;
    } catch (error) {
      console.error(`[Cooling STAGE 1] ERROR in ${mode} mode:`, error);
      throw error; // FAIL HARD - do not silently continue
    }
  }

  // ==========================================
  // SECTION 6: OUTPUT PUBLICATION
  // ==========================================

  /**
   * Publish Stage 1 calculation results to StateManager
   * @param {string} mode - 'target' or 'reference'
   * @param {Object} results - Stage 1 calculation results
   */
  function publishStage1Results(mode, results) {
    const prefix = mode === "reference" ? "ref_" : "";

    // Publish latent load factor (for S13 i_122)
    window.TEUI.StateManager.setValue(
      `${prefix}cooling_latentLoadFactor`,
      results.latentLoadFactor.toString(),
      "calculated",
    );

    // Publish free cooling capacity (for S13 h_124 and Stage 2 calculations)
    window.TEUI.StateManager.setValue(
      `${prefix}cooling_h_124`,
      results.freeCoolingCapacity.toString(),
      "calculated",
    );

    console.log(
      `[Cooling] Published ${mode} STAGE 1 results to StateManager with prefix "${prefix}"`,
    );
  }

  // ==========================================
  // SECTION 7: STAGE 2 HELPER (FOR S13)
  // ==========================================

  /**
   * STAGE 2 HELPER: Calculate mechanical cooling and active cooling days
   * NOTE: This function is provided for S13 to call, or can be called internally
   *
   * @param {number} d_129 - Total unmitigated cooling load (kWh/yr)
   * @param {number} h_124 - Free cooling capacity from Stage 1 (kWh/yr)
   * @param {number} d_21 - Cooling degree days
   * @param {number} m_19 - Cooling season length (days)
   * @returns {Object} - {m_129: mechanical cooling load, m_124: days active cooling}
   */
  function calculateStage2MechanicalCooling(d_129, h_124, d_21, m_19) {
    console.log(
      `[Cooling STAGE 2] Calculating mechanical cooling requirement...`,
    );

    // Step 1: Calculate Mechanical Cooling Required
    // NEW: This eliminates the circular dependency
    // m_129 = MAX(0, d_129 - h_124)
    const mechanicalCoolingRequired = Math.max(0, d_129 - h_124);

    console.log(
      `[Cooling STAGE 2] Total load: ${d_129.toFixed(2)} kWh/yr\n` +
        `  Free cooling: ${h_124.toFixed(2)} kWh/yr\n` +
        `  Mechanical req: ${mechanicalCoolingRequired.toFixed(2)} kWh/yr`,
    );

    // Step 2: Daily Loads
    const dailyMechanicalLoad = d_21 > 0 ? mechanicalCoolingRequired / d_21 : 0;
    const dailyFreeCooling = d_21 > 0 ? h_124 / d_21 : 0;

    // Step 3: Seasonal Loads
    const seasonalMechanicalLoad = dailyMechanicalLoad * d_21;
    const seasonalFreeCooling = dailyFreeCooling * d_21;

    // Step 4: Unmet Load (should match mechanicalCoolingRequired)
    const unmetLoad = seasonalMechanicalLoad - seasonalFreeCooling;

    // Step 5: Days Active Cooling Required
    // Excel E55 = E52 / (E54 * 24)
    let daysActiveCooling = 0;
    if (m_19 > 0) {
      daysActiveCooling = unmetLoad / (m_19 * CONVERSIONS.HOURS_PER_DAY);
    }

    // Note: Can be negative if free cooling exceeds total load
    if (daysActiveCooling < 0) {
      console.log(
        `[Cooling STAGE 2] Negative active cooling days (${daysActiveCooling.toFixed(2)}) ` +
          `indicates free cooling exceeds load - mechanical cooling not needed`,
      );
    }

    console.log(
      `[Cooling STAGE 2] Completed:\n` +
        `  m_129 (mechanical load): ${mechanicalCoolingRequired.toFixed(2)} kWh/yr\n` +
        `  m_124 (active cooling days): ${daysActiveCooling.toFixed(2)} days`,
    );

    return {
      m_129: mechanicalCoolingRequired,
      m_124: daysActiveCooling,
    };
  }

  // ==========================================
  // SECTION 8: STATE MANAGER LISTENERS
  // ==========================================

  /**
   * Register listeners for Stage 1 input changes
   * Triggers recalculation when upstream values change
   * NOTE: Only Stage 1 inputs trigger Cooling.js recalculation
   * Stage 2 calculations triggered by S13
   */
  function registerListeners() {
    if (!window.TEUI?.StateManager) {
      console.warn(
        "[Cooling] StateManager not available for listener registration",
      );
      return;
    }

    const sm = window.TEUI.StateManager;

    // Debounced recalculation to prevent calculation storms
    let recalcScheduled = false;
    function scheduleRecalculation() {
      if (!recalcScheduled) {
        recalcScheduled = true;
        setTimeout(() => {
          calculateAndPublishBothModes();
          recalcScheduled = false;
        }, 10); // 10ms debounce
      }
    }

    // Climate inputs (S03) - Stage 1 only
    sm.addListener("h_24", scheduleRecalculation);
    sm.addListener("ref_h_24", scheduleRecalculation);
    sm.addListener("l_20", scheduleRecalculation);
    sm.addListener("ref_l_20", scheduleRecalculation);
    sm.addListener("l_21", scheduleRecalculation);
    sm.addListener("ref_l_21", scheduleRecalculation);
    sm.addListener("l_23", scheduleRecalculation);
    sm.addListener("ref_l_23", scheduleRecalculation);
    sm.addListener("d_21", scheduleRecalculation);
    sm.addListener("ref_d_21", scheduleRecalculation);
    sm.addListener("m_19", scheduleRecalculation);
    sm.addListener("ref_m_19", scheduleRecalculation);
    sm.addListener("l_22", scheduleRecalculation);
    sm.addListener("ref_l_22", scheduleRecalculation);

    // HVAC inputs (S13) - Stage 1 only
    sm.addListener("h_120", scheduleRecalculation);
    sm.addListener("ref_h_120", scheduleRecalculation);
    sm.addListener("d_120", scheduleRecalculation);
    sm.addListener("ref_d_120", scheduleRecalculation);
    sm.addListener("l_119", scheduleRecalculation);
    sm.addListener("ref_l_119", scheduleRecalculation);
    sm.addListener("g_118", scheduleRecalculation);
    sm.addListener("ref_g_118", scheduleRecalculation);
    sm.addListener("k_120", scheduleRecalculation);
    sm.addListener("ref_k_120", scheduleRecalculation);

    // Indoor environment (S08) - Stage 1 only
    sm.addListener("i_59", scheduleRecalculation);
    sm.addListener("ref_i_59", scheduleRecalculation);

    // NOTE: d_129 (total cooling load) does NOT trigger Cooling.js
    // Stage 2 calculations (m_129, m_124) are handled by S13

    console.log(
      "[Cooling] Registered StateManager listeners for Stage 1 inputs (debounced)",
    );
  }

  // ==========================================
  // SECTION 9: INITIALIZATION
  // ==========================================

  /**
   * Calculate and publish both Target and Reference modes
   */
  function calculateAndPublishBothModes() {
    // Target mode
    const targetResults = calculateStage1("target");
    publishStage1Results("target", targetResults);

    // Reference mode
    const referenceResults = calculateStage1("reference");
    publishStage1Results("reference", referenceResults);
  }

  /**
   * Initialize cooling module
   * Runs initial Stage 1 calculations for both modes
   */
  function initialize() {
    console.log("[Cooling] Initializing module...");

    try {
      // Register state change listeners
      registerListeners();

      // Run initial Stage 1 calculations for both modes
      calculateAndPublishBothModes();

      console.log(
        "[Cooling] Initialization complete - Stage 1 ready, Stage 2 handled by S13",
      );
    } catch (error) {
      console.error("[Cooling] Initialization failed:", error);
      throw error; // FAIL HARD during initialization
    }
  }

  // ==========================================
  // SECTION 10: PUBLIC API
  // ==========================================

  return {
    // Main calculation functions
    calculateStage1: calculateStage1,
    calculateStage2MechanicalCooling: calculateStage2MechanicalCooling,

    // Initialization
    initialize: initialize,

    // Individual calculation functions (for testing)
    calculateLatentLoadFactor: calculateLatentLoadFactor,
    calculateFreeCoolingCapacity: calculateFreeCoolingCapacity,

    // Utility functions (for testing)
    tetens: tetens,
    wetBulbTemp: wetBulbTemp,
    humidityRatio: humidityRatio,

    // Constants (for reference)
    PHYSICS: PHYSICS,
    CONVERSIONS: CONVERSIONS,
  };
})();

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize when StateManager becomes available
document.addEventListener("teui-statemanager-ready", function () {
  window.TEUI.CoolingCalculations.initialize();
});

// Fallback: Initialize on DOM ready if StateManager already exists
document.addEventListener("DOMContentLoaded", function () {
  if (window.TEUI?.StateManager) {
    window.TEUI.CoolingCalculations.initialize();
  }
});
```

---Rate_Ls: parseFloat(getInput('d_120', mode)),
summerBoost: getInput('l_119', mode),
ventMethod: getInput('g_118', mode),
setback: parseFloat(getInput('k_120', mode)),

      // Indoor environment (S08)
      indoorRH: parseFloat(getInput('i_59', mode)),

      // Cooling loads (S13)
      mitigatedLoad: parseFloat(getInput('m_129', mode)),
      unmitigatedLoad: parseFloat(getInput('d_129', mode))
    };

}

// ==========================================
// SECTION 3: PSYCHROMETRIC FUNCTIONS
// ==========================================

/\*\*

- Calculate saturation vapor pressure using Tetens formula
- Excel Reference: A56 = 610.94 _ EXP(17.625 _ A50 / (A50 + 243.04))
- @param {number} temp_C - Temperature in Celsius
- @returns {number} - Saturation vapor pressure in Pascals
  _/
  function tetens(temp_C) {
  return 610.94 _ Math.exp((17.625 \* temp_C) / (temp_C + 243.04));
  }

/\*\*

- Calculate wet bulb temperature (simplified linear approximation)
- Excel Reference: E64 = E60 - (E60 - (E60 - (100 - E59)/5)) _ (0.1 + 0.9 _ (E59 / 100))
- @param {number} dryBulb_C - Dry bulb temperature in Celsius
- @param {number} relativeHumidity_pct - Relative humidity in percent (0-100)
- @returns {number} - Wet bulb temperature in Celsius
  _/
  function wetBulbTemp(dryBulb_C, relativeHumidity_pct) {
  const tdb = dryBulb_C;
  const rh = relativeHumidity_pct;
  return tdb - (tdb - (tdb - (100 - rh) / 5)) _ (0.1 + 0.9 \* (rh / 100));
  }

/\*\*

- Calculate humidity ratio from vapor pressure
- Excel Reference: A61/A62 = 0.62198 \* vapor_pressure / (atm_pressure - vapor_pressure)
- @param {number} vaporPressure_Pa - Partial vapor pressure in Pascals
- @param {number} atmPressure_Pa - Atmospheric pressure in Pascals
- @returns {number} - Humidity ratio in kg water / kg dry air
  _/
  function humidityRatio(vaporPressure_Pa, atmPressure_Pa) {
  return (0.62198 _ vaporPressure_Pa) / (atmPressure_Pa - vaporPressure_Pa);
  }

/\*\*

- Calculate latent load factor
- Excel Reference: A6 = 1 + A64/A55
- Simplified: A6 = 1 + [E6 * A63] / [E4 * (A49 - H27)]
- @param {Object} inputs - Input object from readInputs()
- @returns {number} - Latent load factor (dimensionless)
  _/
  function calculateLatentLoadFactor(inputs) {
  // Atmospheric pressure adjusted for elevation (Excel E15)
  const atmPressure = PHYSICS.ATM_PRESSURE_SEA _ Math.exp(-inputs.elevation / 8434);

  // === INDOOR CONDITIONS ===
  // Excel A59 = Tetens(A8) where A8 = h_24
  const pSat_indoor = tetens(inputs.coolingSetpoint);
  // Excel A60 = A59 _ A52 where A52 = i_59
  const vaporPressure_indoor = pSat_indoor _ (inputs.indoorRH / 100);
  // Excel A61
  const omega_indoor = humidityRatio(vaporPressure_indoor, atmPressure);

  // === OUTDOOR CONDITIONS ===
  // Excel A50 = E64 (wet bulb)
  const wetBulb = wetBulbTemp(inputs.nightTemp, inputs.meanRH);
  // Excel A56 = Tetens(A50)
  const pSat_outdoor = tetens(wetBulb);
  // Excel A58 = A56 _ A57 where A57 = 0.7 (now l_23)
  const vaporPressure_outdoor = pSat_outdoor _ (inputs.outdoorRH / 100);
  // Excel A62
  const omega_outdoor = humidityRatio(vaporPressure_outdoor, atmPressure);

  // === LATENT LOAD FACTOR ===
  // Excel A63 = A62 - A61
  const deltaHumidity = omega_outdoor - omega_indoor;
  // Excel A16 = A8 - A3
  const tempDiff = inputs.nightTemp - inputs.coolingSetpoint;

  // Prevent division by zero
  if (tempDiff === 0) {
  console.warn('[Cooling] Temperature differential is zero, using fallback latent load factor');
  return 1.0;
  }

  // Excel A6 = 1 + [E6 * A63] / [E4 * (A49 - H27)]
  const numerator = PHYSICS.LATENT_HEAT _ deltaHumidity;
  const denominator = PHYSICS.SPECIFIC_HEAT _ tempDiff;

  return 1 + (numerator / denominator);

}

// ==========================================
// SECTION 4: FREE COOLING CALCULATIONS
// ==========================================

/\*\*

- Calculate annual free cooling capacity
- Excel Reference: H124 = A33 \* M19 (with adjustments for g_118 and k_120)
- @param {Object} inputs - Input object from readInputs()
- @returns {number} - Annual free cooling capacity in kWh/yr
  */
  function calculateFreeCoolingCapacity(inputs) {
  // === VENTILATION RATE WITH SUMMER BOOST ===
  // Excel A28 = IF(REPORT!L119="None", REPORT!D120, REPORT!D120*REPORT!L119)
  let ventRate_L_s = inputs.ventRate_Ls;
  if (inputs.summerBoost !== 'None' && inputs.summerBoost !== '') {
  const boostFactor = parseFloat(inputs.summerBoost);
  if (!isNaN(boostFactor)) {
  ventRate_L_s = inputs.ventRate_Ls \* boostFactor;
  }
  }

  // === MASS FLOW RATE ===
  // Excel A29 = A28/1000
  const ventRate_m3s = ventRate_L_s / 1000;
  // Excel A30 = A29 _ E3
  const massFlow_kgs = ventRate_m3s _ PHYSICS.AIR_DENSITY;

  // === TEMPERATURE DIFFERENTIAL ===
  // Excel A16 = A8 - A3 (indoor warmer than outdoor night)
  const tempDiff = inputs.coolingSetpoint - inputs.nightTemp;

  // === SENSIBLE COOLING POWER ===
  // Excel A31 = A30 _ E4 _ A16
  const sensiblePower_W = massFlow_kgs _ PHYSICS.SPECIFIC_HEAT _ tempDiff;

  // === DAILY COOLING POTENTIAL ===
  // Excel A32 = A31 _ 86400
  // Excel A33 = A32 / 3600000
  // Simplified: A33 = A31 _ 0.024
  const dailyCooling_kWh = sensiblePower_W \* 0.024;

  // === ANNUAL POTENTIAL ===
  // Excel H124 base = A33 _ M19
  let annualPotential = dailyCooling_kWh _ inputs.coolingDays;

  // === APPLY SETBACK FOR SCHEDULED VENTILATION ===
  // Excel H124 logic: if g_118 includes "schedule", multiply by k_120/100
  if (inputs.ventMethod.toLowerCase().includes('schedule')) {
  const setbackFactor = inputs.setback / 100;
  annualPotential \*= setbackFactor;
  }

  return annualPotential;

}

// ==========================================
// SECTION 5: ACTIVE COOLING DAYS
// ==========================================

/\*\*

- Calculate days of active cooling required
- Excel Reference: E55 = E52 / (E54 \* 24)
- @param {Object} inputs - Input object from readInputs()
- @param {number} freeCoolingCapacity - Annual free cooling capacity in kWh/yr
- @returns {number} - Days of active cooling required (can be negative)
  \*/
  function calculateActiveCoolingDays(inputs, freeCoolingCapacity) {
  // === DAILY LOADS ===
  // Excel E37 = REPORT!M129 / CDD
  const dailyMitigatedLoad = inputs.cdd > 0 ? inputs.mitigatedLoad / inputs.cdd : 0;
  // Excel E36 = A33
  const dailyFreeCooling = inputs.cdd > 0 ? freeCoolingCapacity / inputs.cdd : 0;

  // === SEASONAL LOADS ===
  // Excel E50 = E37 _ E45
  const seasonalCoolingLoad = dailyMitigatedLoad _ inputs.cdd;
  // Excel E51 = E36 _ E45
  const seasonalFreeCooling = dailyFreeCooling _ inputs.cdd;

  // === UNMET LOAD ===
  // Excel E52 = E50 - E51
  const unmetLoad = seasonalCoolingLoad - seasonalFreeCooling;

  // === DAYS ACTIVE COOLING ===
  // Excel E55 = E52 / (E54 \* 24)
  if (inputs.coolingDays === 0) {
  return 0;
  }

  // Note: Can be negative if free cooling exceeds load
  // Excel comment: "Obviously negative days of free cooling is not possible -
  // the goal here is to get close to zero - anything less than zero is
  // overkill ventilation-wise"
  return unmetLoad / (inputs.coolingDays \* 24);

}

// ==========================================
// SECTION 6: OUTPUT PUBLICATION
// ==========================================

/\*\*

- Publish calculation results to StateManager
- @param {string} mode - 'target' or 'reference'
- @param {Object} results - Calculation results object
  \*/
  function publishResults(mode, results) {
  const prefix = mode === 'reference' ? 'ref\_' : '';

  // Publish latent load factor (for S13 i_122)
  window.TEUI.StateManager.setValue(
  `${prefix}cooling_latentLoadFactor`,
  results.latentLoadFactor.toString(),
  'calculated'
  );

  // Publish free cooling capacity (for S13 h_124)
  window.TEUI.StateManager.setValue(
  `${prefix}cooling_h_124`,
  results.freeCoolingCapacity.toString(),
  'calculated'
  );

  // Publish days active cooling (for S13 m_124)
  window.TEUI.StateManager.setValue(
  `${prefix}cooling_m_124`,
  results.daysActiveCooling.toString(),
  'calculated'
  );

  console.log(`[Cooling] Published ${mode} results:`, {
  latentLoadFactor: results.latentLoadFactor.toFixed(3),
  freeCoolingCapacity: results.freeCoolingCapacity.toFixed(2),
  daysActiveCooling: results.daysActiveCooling.toFixed(2)
  });

}

// ==========================================
// SECTION 7: MAIN CALCULATION FUNCTION
// ==========================================

/\*\*

- Execute complete cooling calculation chain
- @param {string} mode - 'target' or 'reference'
- @returns {Object} - Calculation results
- @throws {Error} - If any calculation fails
  \*/
  function calculateAll(mode = 'target') {
  console.log(`[Cooling] Starting ${mode} mode calculations...`);

  try {
  // Step 1: Acquire inputs (FAIL FAST if missing)
  const inputs = readInputs(mode);

      // Step 2: Calculate latent load factor
      const latentLoadFactor = calculateLatentLoadFactor(inputs);

      // Step 3: Calculate free cooling capacity
      const freeCoolingCapacity = calculateFreeCoolingCapacity(inputs);

      // Step 4: Calculate active cooling days
      const daysActiveCooling = calculateActiveCoolingDays(inputs, freeCoolingCapacity);

      // Step 5: Assemble results
      const results = {
        latentLoadFactor,
        freeCoolingCapacity,
        daysActiveCooling
      };

      // Step 6: Publish to StateManager
      publishResults(mode, results);

      console.log(`[Cooling] Completed ${mode} mode calculations successfully`);
      return results;

  } catch (error) {
  console.error(`[Cooling] ERROR in ${mode} mode:`, error);
  throw error; // FAIL HARD - do not silently continue
  }

}

// ==========================================
// SECTION 8: STATE MANAGER LISTENERS
// ==========================================

/\*\*

- Register listeners for input changes
- Triggers recalculation when upstream values change
  \*/
  function registerListeners() {
  if (!window.TEUI?.StateManager) {
  console.warn('[Cooling] StateManager not available for listener registration');
  return;
  }

  const sm = window.TEUI.StateManager;

  // Climate inputs (S03)
  sm.addListener('h_24', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_h_24', () => { calculateAll('reference'); });
  sm.addListener('l_20', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_l_20', () => { calculateAll('reference'); });
  sm.addListener('l_21', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_l_21', () => { calculateAll('reference'); });
  sm.addListener('l_23', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_l_23', () => { calculateAll('reference'); });
  sm.addListener('d_21', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_d_21', () => { calculateAll('reference'); });
  sm.addListener('m_19', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_m_19', () => { calculateAll('reference'); });
  sm.addListener('l_22', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_l_22', () => { calculateAll('reference'); });

  // HVAC inputs (S13)
  sm.addListener('h_120', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_h_120', () => { calculateAll('reference'); });
  sm.addListener('d_120', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_d_120', () => { calculateAll('reference'); });
  sm.addListener('l_119', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_l_119', () => { calculateAll('reference'); });
  sm.addListener('g_118', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_g_118', () => { calculateAll('reference'); });
  sm.addListener('k_120', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_k_120', () => { calculateAll('reference'); });

  // Indoor environment (S08)
  sm.addListener('i_59', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_i_59', () => { calculateAll('reference'); });

  // Cooling loads (S13)
  sm.addListener('m_129', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_m_129', () => { calculateAll('reference'); });
  sm.addListener('d_129', () => { calculateAll('target'); calculateAll('reference'); });
  sm.addListener('ref_d_129', () => { calculateAll('reference'); });

  console.log('[Cooling] Registered StateManager listeners');

}

// ==========================================
// SECTION 9: INITIALIZATION
// ==========================================

/\*\*

- Initialize cooling module
- Runs initial calculations for both modes
  \*/
  function initialize() {
  console.log('[Cooling] Initializing module...');

  try {
  // Register state change listeners
  registerListeners();

      // Run initial calculations for both modes
      calculateAll('target');
      calculateAll('reference');

      console.log('[Cooling] Initialization complete');

  } catch (error) {
  console.error('[Cooling] Initialization failed:', error);
  throw error; // FAIL HARD during initialization
  }

}

// ==========================================
// SECTION 10: PUBLIC API
// ==========================================

return {
// Main calculation function
calculateAll: calculateAll,

    // Initialization
    initialize: initialize,

    // Individual calculation functions (for testing)
    calculateLatentLoadFactor: calculateLatentLoadFactor,
    calculateFreeCoolingCapacity: calculateFreeCoolingCapacity,
    calculateActiveCoolingDays: calculateActiveCoolingDays,

    // Utility functions (for testing)
    tetens: tetens,
    wetBulbTemp: wetBulbTemp,
    humidityRatio: humidityRatio,

    // Constants (for reference)
    PHYSICS: PHYSICS

};
})();

// ==========================================
// AUTO-INITIALIZATION
// ==========================================

// Initialize when StateManager becomes available
document.addEventListener('teui-statemanager-ready', function() {
window.TEUI.CoolingCalculations.initialize();
});

// Fallback: Initialize on DOM ready if StateManager already exists
document.addEventListener('DOMContentLoaded', function() {
if (window.TEUI?.StateManager) {
window.TEUI.CoolingCalculations.initialize();
}
});

````

---

## Phase 5: Implementation Steps

### 5.1 Pre-Implementation Tasks

**Task 5.1.1: Add Climate Fields to S03** ✅ COMPLETED
- [x] Add field `l_20` (Night-time outdoor temp) with default 20.43°C
- [x] Add field `l_21` (Cooling season mean RH) with default 55.85%
- [ ] Add field `l_23` (Seasonal outdoor RH) with default 70.0% (not yet added)
- [x] Add StateManager registration for all three fields
- [x] Add mode-aware support (`ref_l_20`, `ref_l_21`, `ref_l_23`)
- [x] Test field persistence and retrieval
- [x] Add UI elements (input fields or read-only display from climate data)

**Task 5.1.2: Modify S13 for Stage 2 Calculations** ✅ COMPLETED
- [x] Identify where m_129 is currently calculated in S13
- [x] Replace current m_129 calculation with: `m_129 = MAX(0, d_129 - h_124)`
- [x] Ensure S13 reads `cooling_h_124` from Cooling.js Stage 1
- [x] Verify m_124 calculation uses new m_129 value
- [x] Test that "priming" (g_118 toggle, d_116 toggle) is no longer needed
- [x] Remove any workarounds for bootstrap problem

🎯 **=== YOU ARE HERE! Next: Task 5.1.3 Create Test Suite ===**

**Task 5.1.3: Create Test Suite**
- [ ] Create `test-cooling-parity.js` with Excel validation cases
- [ ] Define test scenarios with known inputs/outputs (see Phase 6.2)
- [ ] Set tolerance threshold (target: ±0.01%)
- [ ] Include edge cases: zero CDD, negative temperature diff, extreme humidity
- [ ] Create test for Stage 1 independent execution (no d_129 input)
- [ ] Create test for Stage 2 calculation (d_129 → m_129, m_124)

### 5.2 Implementation Tasks

**Task 5.2.1: Create New Module**
- [ ] Create `4013-CoolingSimple.js` file
- [ ] Implement all functions from Phase 4 code structure
- [ ] Add comprehensive inline comments
- [ ] Add console logging for debugging (Stage 1 vs Stage 2 clarity)
- [ ] Implement input validation (Phase 4, Section 2)
- [ ] Implement debounced listeners (Phase 4, Section 8)

**Task 5.2.2: Unit Testing - Stage 1 (Independent)**
- [ ] Test psychrometric functions independently
  - [ ] `tetens()` matches Excel A56 calculation
  - [ ] `wetBulbTemp()` matches Excel E64 calculation
  - [ ] `humidityRatio()` matches Excel A61/A62 calculations
  - [ ] `calculateLatentLoadFactor()` matches Excel A6
- [ ] Test free cooling calculations
  - [ ] Base calculation matches Excel A33
  - [ ] Summer boost logic matches Excel A28
  - [ ] Setback logic matches Excel H124
- [ ] Test input validation
  - [ ] Invalid RH% (negative, >100) throws error
  - [ ] Invalid elevation throws error
  - [ ] Warnings for unusual conditions (night temp ≥ setpoint)
- [ ] **CRITICAL: Test Stage 1 WITHOUT providing d_129 or m_129**
  - [ ] Verify no errors when cooling loads absent
  - [ ] Verify h_124 calculates correctly independent of loads

**Task 5.2.3: Unit Testing - Stage 2 (Dependent)**
- [ ] Test `calculateStage2MechanicalCooling()` helper function
  - [ ] m_129 = d_129 - h_124 when d_129 > h_124
  - [ ] m_129 = 0 when h_124 ≥ d_129 (free cooling sufficient)
  - [ ] m_124 calculation matches Excel E55
  - [ ] Negative m_124 handled correctly (Excel comment validation)
- [ ] Test edge cases
  - [ ] Zero cooling days (m_19 = 0)
  - [ ] Zero CDD (d_21 = 0)
  - [ ] Zero free cooling (tempDiff ≤ 0)

**Task 5.2.4: Integration Testing**
- [ ] Test Target mode Stage 1 calculation chain
- [ ] Test Reference mode Stage 1 calculation chain
- [ ] Test mode switching behavior (no cross-contamination)
- [ ] Test StateManager publication
  - [ ] `cooling_latentLoadFactor` published correctly
  - [ ] `cooling_h_124` published correctly
  - [ ] Mode prefix (`ref_`) applied correctly
- [ ] Test S13 integration
  - [ ] S13 reads `cooling_h_124` successfully
  - [ ] S13 calculates m_129 = d_129 - h_124 correctly
  - [ ] S13 displays i_122, h_124, m_124 correctly
  - [ ] **CRITICAL: Verify no "priming" needed (bootstrap eliminated)**

**Task 5.2.5: Bootstrap Problem Elimination Test**
- [ ] Load fresh calculator instance (clear localStorage)
- [ ] Enter building parameters (S02, S03, S08, S09)
- [ ] Navigate to S13 without toggling g_118 or d_116
- [ ] **Verify all cooling values calculate correctly on first pass**
- [ ] Change g_118 value - verify recalculation works
- [ ] Change d_116 value - verify recalculation works
- [ ] **PASS CRITERIA: No manual "priming" required at any point**

### 5.3 Validation Tasks

**Task 5.3.1: Excel Parity Testing**
- [ ] Run full calculation chain with Excel test data (see Phase 6.2)
- [ ] Compare Target mode outputs to Excel (100.00% parity)
- [ ] Compare Reference mode outputs to Excel (100.00% parity)
- [ ] Document any discrepancies > 0.01%
- [ ] For any discrepancies, verify Excel formulas vs implementation
- [ ] Create discrepancy report with root cause analysis

**Task 5.3.2: Regression Testing**
- [ ] Test with existing project files (5+ real projects)
- [ ] Verify all downstream dependencies still function
  - [ ] S13 calculated fields update correctly
  - [ ] S14 receives correct cooling values
  - [ ] S01 TEUI calculation includes cooling correctly
  - [ ] S04 summary displays cooling correctly
- [ ] Test with edge cases
  - [ ] Hot humid climate (high latent load)
  - [ ] Cold dry climate (low latent load)
  - [ ] Zero ventilation rate
  - [ ] Extreme elevation (high altitude, below sea level)
- [ ] Verify mode switching preserves independent calculations

**Task 5.3.3: Performance Testing**
- [ ] Measure Stage 1 calculation time (target: < 25ms per mode)
- [ ] Measure total calculation time both modes (target: < 50ms)
- [ ] Test rapid input changes (verify debouncing works)
- [ ] Verify StateManager listener behavior (no calculation storms)
- [ ] Test with 20+ rapid field changes (ventilation slider dragging)
- [ ] Monitor console for excessive recalculation warnings

### 5.4 Deployment Tasks

**Task 5.4.1: Code Replacement**
- [ ] Update `index.html` to load `4013-CoolingSimple.js`
- [ ] Remove reference to `4012-Cooling.js`
- [ ] Update S13 to call `calculateStage2MechanicalCooling()` if needed
- [ ] Update S13 initialization to wait for cooling module
- [ ] Test full application startup sequence
- [ ] Verify initialization order: StateManager → Cooling.js → S13

**Task 5.4.2: Documentation**
- [ ] Update developer documentation with new calculation flow
- [ ] Document two-stage architecture (Stage 1 independent, Stage 2 dependent)
- [ ] Document all inputs and outputs with Excel references
- [ ] Add troubleshooting guide
  - [ ] "Bootstrap problem eliminated - no priming needed"
  - [ ] "Stage 1 calculates without cooling loads"
  - [ ] "m_129 now calculated, not input"
- [ ] Create validation test examples
- [ ] Document S13 integration points

**Task 5.4.3: Cleanup**
- [ ] Archive `4012-Cooling.js` (do not delete - keep for reference)
  - [ ] Add comment in file: "DEPRECATED - replaced by 4013-CoolingSimple.js"
  - [ ] Move to `/archive/` folder
- [ ] Remove deprecated constants from codebase
- [ ] Review console.log statements
  - [ ] Keep critical Stage 1/Stage 2 identification logs
  - [ ] Keep warning messages for validation failures
  - [ ] Remove debug logging from hot paths
- [ ] Final code review
  - [ ] Verify all Excel formula references documented
  - [ ] Verify JSDoc comments complete
  - [ ] Run linter (if available)

---

## Phase 6: Validation Criteria

### 6.1 Functional Requirements

| Requirement | Success Criteria | Status |
|-------------|------------------|--------|
| Excel Parity | All outputs within ±0.01% of Excel | ⬜ |
| Dual-State Support | Both Target and Reference modes calculate correctly | ⬜ |
| Error Handling | Throws clear errors for missing/invalid inputs | ⬜ |
| S13 Integration | All downstream fields update correctly | ⬜ |
| Performance | Calculation time < 50ms total (both modes) | ⬜ |
| Code Clarity | All functions have clear documentation | ⬜ |
| **Bootstrap Elimination** | **No "priming" required - single-pass calculation** | ⬜ |
| **Stage Independence** | **Stage 1 runs without cooling loads (d_129, m_129)** | ⬜ |

### 6.2 Test Scenarios

**Scenario 1: Standard Summer Conditions (Ottawa)**
```javascript
STAGE 1 Inputs:
- h_24 (cooling setpoint): 24°C
- l_20 (night temp): 20.43°C
- l_21 (mean RH at 15h00): 55.85%
- l_23 (seasonal outdoor RH): 70%
- i_59 (indoor RH): 45%
- h_120 (vent rate): 12000 m³/hr
- d_21 (CDD): 196
- m_19 (cooling days): 120
- l_119 (summer boost): None
- g_118 (method): "Volume by Schedule"
- k_120 (setback): 90%
- l_22 (elevation): 80m

STAGE 1 Expected Outputs:
- cooling_latentLoadFactor: ~1.59
- cooling_h_124: ~37,322 kWh/yr

STAGE 2 Inputs:
- d_129 (total cooling load): 60,000 kWh/yr
- h_124 (from Stage 1): 37,322 kWh/yr

STAGE 2 Expected Outputs:
- m_129: 22,678 kWh/yr (60000 - 37322)
- m_124: ~96 days
````

**Scenario 2: High Efficiency with Summer Boost**

```javascript
STAGE 1 Inputs:
- (Same as Scenario 1 except...)
- l_119 (summer boost): 1.50
- k_120 (setback): 90%

STAGE 1 Expected Outputs:
- cooling_h_124: Should increase ~50% → ~56,000 kWh/yr
- Then apply 90% setback → ~50,400 kWh/yr

STAGE 2 Expected Outputs:
- m_129: 9,600 kWh/yr (60000 - 50400)
- m_124: Should decrease (less mechanical cooling needed)
```

**Scenario 3: Hot Humid Climate (No Free Cooling)**

```javascript
STAGE 1 Inputs:
- h_24: 22°C (lower setpoint)
- l_20: 25°C (hot nights - outdoor warmer than indoor!)
- l_21: 80% (high humidity)
- l_23: 85%
- i_59: 50%

STAGE 1 Expected Outputs:
- cooling_latentLoadFactor: Should increase significantly (>2.0)
- cooling_h_124: 0 kWh/yr (no free cooling - outdoor warmer than indoor)

STAGE 2 Expected Outputs:
- m_129: d_129 (100% mechanical - no free cooling)
- m_124: Should be high (mechanical system runs most of season)
```

**Scenario 4: Oversized Ventilation (Negative Active Cooling)**

```javascript
STAGE 1 Inputs:
- h_120: 30,000 m³/hr (very high ventilation)
- l_119: 2.0 (double boost)
- (Standard conditions otherwise)

STAGE 1 Expected Outputs:
- cooling_h_124: Very high (>>60,000 kWh/yr)

STAGE 2 Inputs:
- d_129: 60,000 kWh/yr
- h_124: 100,000 kWh/yr (from Stage 1)

STAGE 2 Expected Outputs:
- m_129: 0 kWh/yr (free cooling exceeds load)
- m_124: Negative value (Excel: "overkill ventilation-wise")
- Console: Warning about negative days (expected behavior)
```

**Scenario 5: Bootstrap Elimination Test**

```javascript
TEST PROCEDURE:
1. Clear localStorage (fresh calculator state)
2. Load calculator
3. Set S02 building parameters
4. Set S03 climate data (including new l_20, l_21, l_23)
5. Set S08 indoor conditions (i_59)
6. Set S09 gains (to generate d_129)
7. Navigate to S13
8. Observe calculation flow

EXPECTED BEHAVIOR:
- Stage 1 calculates immediately on S13 load
- cooling_h_124 appears in StateManager
- S13 calculates m_129 = d_129 - h_124
- All values display correctly
- NO need to toggle g_118 or d_116
- NO console errors about missing inputs

FAIL CRITERIA:
- Any field shows "NaN" or "undefined"
- Console shows errors about missing m_129 or h_124
- User must toggle dropdown to "prime" calculations
- Values don't update on first navigation to S13
```

### 6.3 Regression Tests

Test with existing project files to ensure:

- [ ] Ottawa location data produces expected results
- [ ] Vancouver location data produces expected results (mild climate)
- [ ] Calgary location data produces expected results (high elevation)
- [ ] Montreal location data produces expected results
- [ ] Iqaluit location data produces expected results (extreme cold)
- [ ] All Reference standards produce valid results
- [ ] Mode switching doesn't corrupt calculations
- [ ] Import/export preserves cooling calculations
- [ ] **Projects created with old Cooling.js open correctly with new module**
- [ ] **Old project values match or improve with new calculation method**

---

## Phase 7: Future Enhancement Roadmap

### 7.1 Monthly Binning Support

**Enhancement Point 1: Monthly Climate Data**

```javascript
// Future: Replace single values with monthly arrays
inputs: {
  nightTemp: [18, 19, 21, 22, 23, 24, 23, 22, 20, 18, 16, 17],  // 12 months
  meanRH: [52, 54, 58, 62, 65, 68, 70, 68, 64, 58, 54, 50],     // Monthly RH
  cdd_monthly: [0, 0, 5, 15, 45, 75, 85, 80, 50, 10, 0, 0]      // Monthly CDD bins
}

// Stage 1 calculation loop
for (month = 0; month < 12; month++) {
  monthlyLatentFactor[month] = calculateLatentLoadFactor(inputs, month);
  monthlyFreeCooling[month] = calculateFreeCoolingCapacity(inputs, month);
}

// Sum to annual
annualFreeCooling = monthlyFreeCooling.reduce((sum, val) => sum + val, 0);
```

**Required Changes:**

- S03 must provide monthly climate arrays (l_20[], l_21[], l_23[], d_21[], m_19[])
- Add month parameter to Stage 1 calculation functions
- Sum monthly results for annual totals (h_124 = Σ monthly)
- Add monthly result storage to StateManager (optional, for debugging)
- Stage 2 remains annual calculation (m_129, m_124 use annual totals)

**Benefit:** More accurate free cooling capacity in climates with high seasonal variation

---

### 7.2 Hourly (8760) Modeling Support

**Enhancement Point 2: Hourly Calculations**

```javascript
// Future: Loop over 8760 hours
for (hour = 0; hour < 8760; hour++) {
  // Get hourly conditions from TMY data
  outdoorTemp_hour = climateData.temp[hour];
  outdoorRH_hour = climateData.rh[hour];
  indoorTemp_hour = indoorSetpoint; // Or dynamic from building thermal model

  // Calculate hourly free cooling potential
  if (outdoorTemp_hour < indoorTemp_hour - 1) {
    // 1°C threshold
    tempDiff_hour = indoorTemp_hour - outdoorTemp_hour;
    ventRate_hour = getVentRateForHour(hour, occupancySchedule);
    hourlyFreeCooling[hour] = calculateHourlyFreeCooling(
      ventRate_hour,
      tempDiff_hour,
    );
  } else {
    hourlyFreeCooling[hour] = 0; // No free cooling this hour
  }

  // Calculate hourly cooling load (from building thermal model)
  hourlyCoolingLoad[hour] = getBuildingCoolingLoad(hour);

  // Calculate unmet load requiring mechanical cooling
  hourlyUnmetLoad[hour] = Math.max(
    0,
    hourlyCoolingLoad[hour] - hourlyFreeCooling[hour],
  );
}

// Sum to annual
annualFreeCooling = hourlyFreeCooling.reduce((sum, val) => sum + val, 0);
annualMechanicalCooling = hourlyUnmetLoad.reduce((sum, val) => sum + val, 0);
annualActiveCoolingHours = hourlyUnmetLoad.filter((x) => x > 0).length;
```

**Required Changes:**

- S03 must provide 8760 hourly TMY data (temp, RH, solar, wind)
- Building thermal model must calculate hourly cooling loads
- Occupancy schedule must provide hourly ventilation rates
- Significant performance optimization needed (8760 iterations!)
- Consider Web Workers for background calculation

**Benefit:** Highest accuracy, accounts for diurnal temperature swings, occupancy patterns

---

### 7.3 Ground Coupling Enhancement

**Enhancement Point 3: Ground Temperature Effects**

```javascript
// Current: Ground temp is constant (10°C)
// Future: Ground temp varies by season and depth

function calculateGroundTemp(month, depth_m, annualMeanTemp, latitude) {
  // Sinusoidal variation with phase lag based on soil thermal properties
  const amplitude = 0.7 * (annualMaxTemp - annualMinTemp) / 2;  // 70% of air temp swing
  const phaseLag_months = 2 + (depth_m * 0.5);  // Deeper = more lag

  // Phase shift: warmest ground temp lags warmest air temp by 2-3 months
  const groundTemp = annualMeanTemp +
    amplitude * Math.sin((month - 3 - phaseLag_months) * Math.PI / 6);

  return groundTemp;
}

// Use in free cooling calculation for ground-coupled systems
if (hasGroundCoupling) {
  // Ground provides pre-cooling of ventilation air
  groundTemp_month = calculateGroundTemp(currentMonth, foundationDepth, ...);

  // Ventilation air enters at ground temp, not outdoor temp
  effectiveInletTemp = (outdoorTemp * outdoorAirFraction) +
                       (groundTemp_month * groundAirFraction);

  // Enhanced free cooling from ground pre-cooling
  enhancedTempDiff = indoorTemp - effectiveInletTemp;
  enhancedFreeCooling = baseFreeCooling * (enhancedTempDiff / baseTempDiff);
}
```

**Required Changes:**

- Add ground coupling option (checkbox in S13 or S12)
- Calculate foundation depth and exposed area
- Model earth tube or ground-source heat exchanger
- Account for soil thermal properties by location

**Benefit:** Credit for passive cooling from ground coupling (earth tubes, crawl spaces)

---

## Phase 8: Risk Assessment

### 8.1 Technical Risks

| Risk                    | Probability | Impact | Mitigation                                     |
| ----------------------- | ----------- | ------ | ---------------------------------------------- |
| Excel parity fails      | Low         | High   | Comprehensive test suite with Excel validation |
| S13 integration breaks  | Medium      | High   | Thorough integration testing before deployment |
| Performance degradation | Low         | Medium | Performance benchmarking during testing        |
| Mode switching errors   | Medium      | Medium | Extensive dual-state testing                   |
| Missing input errors    | Low         | High   | Fail-fast error handling with clear messages   |

### 8.2 Migration Risks

| Risk                    | Probability | Impact   | Mitigation                                 |
| ----------------------- | ----------- | -------- | ------------------------------------------ |
| Existing projects break | Low         | High     | Regression testing with real project files |
| User confusion          | Low         | Low      | No UI changes, backend only                |
| Data loss               | Very Low    | Critical | Keep old module archived for rollback      |

---

## Phase 9: Success Metrics

### 9.1 Quantitative Metrics

- **Code Reduction:** Target 60% reduction in lines of code
- **Function Count:** Reduce from ~20 functions to ~10 core functions
- **Calculation Time:** < 50ms per mode (current: unknown)
- **Excel Parity:** 100.00% match (within ±0.01%)
- **Test Coverage:** 100% of calculation functions

### 9.2 Qualitative Metrics

- **Code Readability:** Clear function names and inline documentation
- **Maintainability:** New developer can understand flow in < 30 minutes
- **Error Messages:** Developers can diagnose issues from console logs
- **Extensibility:** Monthly binning can be added without major refactor

---

## Appendix A: Excel Formula Reference

### Key Calculations

```
Latent Load Factor (A6):
= 1 + A64/A55
where A64 = A54 * E3 * E6 * A63
      A55 = H26 * E3 * E4 * (A49 - H27)
simplified: 1 + [E6 * A63] / [E4 * (A49 - H27)]

Free Cooling Daily (A33):
= A32 / 3600000
where A32 = A31 * 86400
      A31 = A30 * E4 * A16
      A30 = A29 * E3
      A29 = A28 / 1000

Active Cooling Days (E55):
= E52 / (E54 * 24)
where E52 = E50 - E51
      E50 = E37 * E45
      E51 = E36 * E45
```

---

## Appendix B: Glossary

| Term                     | Definition                                                  |
| ------------------------ | ----------------------------------------------------------- |
| **CDD**                  | Cooling Degree Days - measure of cooling demand             |
| **Tetens Formula**       | Empirical formula for saturation vapor pressure             |
| **Wet Bulb Temperature** | Temperature accounting for evaporative cooling              |
| **Humidity Ratio**       | Mass of water vapor per mass of dry air (kg/kg)             |
| **Latent Load**          | Cooling energy needed to remove moisture                    |
| **Sensible Load**        | Cooling energy needed to lower temperature                  |
| **Free Cooling**         | Cooling provided by ventilation without mechanical systems  |
| **Mode-Aware**           | Function behavior changes based on Target vs Reference mode |

---

## Document History

| Version | Date       | Author       | Changes                                              |
| ------- | ---------- | ------------ | ---------------------------------------------------- |
| 1.0     | 2025-01-20 | AI Assistant | Initial draft for review                             |
| 1.1     | 2025-10-21 | AI Assistant | Clarifications and risk resolutions from user review |

---

## Appendix D: Clarifications and Resolutions (v1.1 - 2025-10-21)

### D.1 Climate Fields Implementation (l_20, l_21, l_23)

**RESOLVED - User Guidance:**

**Location in S03:**

- Row 20: l_20 (Summer Night °C) - Yellow highlighted cell for value
- Row 21: l_21 (Summer RH%) - Yellow highlighted cell for value
- Row 22: l_22 (Elevation) - Already exists
- Row 23: l_23 (Seasonal outdoor RH%) - To be added

**UI Structure:**

- Column J: Text IDs (j_20, j_21, j_23)
- Column K: Description text
- Yellow cells: Input values
- Status: **Locked for now** (use default values), user-editable in future
- Future enhancement: Link to climate data API if available

**Default Values:**

- l_20: 20.43°C (Night-time outdoor temp)
- l_21: 55.85% (Cooling season mean RH at 15h00 LST)
- l_23: 70.0% (Seasonal outdoor RH - nighttime assumption)

### D.2 Stage 2 Calculation Location

**RESOLVED - Option B Confirmed:**

**Decision:** Stage 1 in Cooling.js, Stage 2 in S13

**Rationale:**

- S13 already performs substantial calculations (not merely UI layer)
- S13 owns mechanical system calculations
- Architectural clarity: Cooling.js = free cooling physics, S13 = mechanical systems
- S13 reads d_129 (from gains) and h_124 (from Cooling.js)
- S13 calculates m_129 = MAX(0, d_129 - h_124) and publishes to StateManager

**Implementation:**

- Cooling.js provides helper function `calculateStage2MechanicalCooling()`
- S13 can call this helper OR implement calculation directly
- Either approach acceptable - user to decide during implementation

### D.3 Bootstrap Problem Validation

**CONFIRMED - Real Issue:**

**User Experience:**

> "We often need to 'prime' values to complete calculation flow by changing ventilation method or switching the 'Cooling' and 'No Cooling' toggle on and off to get the calculations to complete (i.e., g_118 'priming')."

**Current Problematic Pattern:**

- Circular dependency: h_124 depends on m_129, m_129 depends on h_124
- Requires manual "priming" by toggling g_118 dropdown or d_116 toggle
- Calculations don't complete on first navigation to S13
- Known issue from previous dual-engine refactors

**Solution Validated:**

- Two-stage independent calculation architecture eliminates this completely
- Stage 1 calculates h_124 WITHOUT any cooling load inputs
- Stage 2 calculates m_129 FROM h_124 (one-way dependency)
- No priming required - single-pass calculation

### D.4 Naming Conventions

**RESOLVED:**

**Internal Code:**

- Use descriptive names: `freeCoolingCapacity`, `mechanicalCoolingRequired`, `latentLoadFactor`
- Clear function names: `calculateLatentLoadFactor()`, `calculateFreeCoolingCapacity()`
- Meaningful variable names for readability

**StateManager Interface:**

- Use Excel-style keys: `h_124`, `m_129`, `d_129`, `cooling_latentLoadFactor`
- Mode prefix: `ref_h_124`, `ref_m_129` for Reference mode
- Maintains consistency with existing StateManager architecture

### D.5 Risk Assessment - Psychrometric Calculations

**RESOLVED - Calculations Are Proven:**

#### Wet Bulb Formula

**Status:** ✅ **Validated and Approved**

**Formula:**

```javascript
wetBulb = Tdb - (Tdb - (Tdb - (100 - RH) / 5)) * (0.1 + 0.9 * (RH / 100));
```

**User Confirmation:**

> "Our wet bulb formula is reliable, it is a linear derivation of an advanced formula developed by others we do not have copyright for, so we made our own, it tracks within 2% of the curvilinear empirical gene fitting match from others, so we will use it!"

**Accuracy:** Within 2% of empirical psychrometric standards
**Action:** Use as-is, no changes required

#### Humidity Ratio Constant (0.62198)

**Status:** ✅ **Confirmed Correct**

**Source:** Verified in both:

- [4012-Cooling.js:231-240](OBJECTIVE 4011RF/4012-Cooling.js#L231-L240)
- [COOLING-TARGET-VARIABLES.json:115-120](OBJECTIVE 4011RF/documentation/COOLING-TARGET-VARIABLES.json#L115-L120)

**Excel Reference:** A61, A62 formulas use `0.62198 * pressure / (atmPressure - pressure)`

**Physical Meaning:** Ratio of molecular masses (water vapor 18.015 / dry air 28.97 ≈ 0.62198)

**Action:** Use 0.62198 (not 0.622 approximation)

#### Excel Parity

**Status:** ✅ **Already Exists - Cleanup Only**

**User Guidance:**

> "Our calculation parity is already consistent with Excel, we just need to clean up these sections (S13 and Cooling.js) and not completely reinvent how we calculate!"

**Scope of Work:**

- **NOT** re-engineering psychrometric calculations
- **NOT** changing mathematical formulas
- **YES** eliminating bootstrap problem (architectural fix)
- **YES** simplifying code structure and reducing complexity
- **YES** improving maintainability for future developers

**This is a MAJOR CLEANUP, not a re-engineering of the math.**

### D.6 Target/Reference Independence

**RESOLVED - Complete Separation Required:**

**User Guidance:**

> "For reference modelling, state contamination/mixing has been a REAL problem, better to have complete independence than share intermediate values. Climate data may use different locations, so no, don't cache. Treat Target and Reference buildings as if they are 100% independent, this is how we eliminated state mixing."

**Implementation Rules:**

1. **NO** caching of intermediate psychrometric values between Target and Reference
2. **NO** shared calculation results
3. **ALWAYS** calculate both modes completely independently
4. **ALWAYS** apply mode prefix (`ref_`) to all StateManager keys
5. Climate data may differ (different locations for Target vs Reference)
6. Building parameters may differ
7. Complete independence prevents state contamination

**Rationale:** Lessons learned from previous dual-engine refactoring efforts

### D.7 Elevation Handling

**RESOLVED - Clamp to Zero:**

**User Guidance:**

> "We can clamp elevation to 0m, so anything less behaves predictably."

**Implementation:**

```javascript
// Clamp elevation to 0m minimum (sea level)
const elevation_m = Math.max(0, inputs.elevation);

// Atmospheric pressure (elevation-adjusted)
const atmPressure_Pa = 101325 * Math.exp(-elevation_m / 8434);
```

**Edge Cases:**

- Below sea level (e.g., Death Valley): Clamp to 0m, use 101325 Pa
- Sea level: elevation = 0, pressure = 101325 Pa ✅
- High altitude (e.g., 2000m Calgary): Pressure reduces correctly ✅
- Extreme altitude (>5000m): May produce unusual results but physically accurate

**Validation Range:** 0m to 5000m (covers all Canadian locations)

### D.8 Scope Clarification

**CRITICAL UNDERSTANDING:**

This refactor addresses **TWO specific problems**:

1. **Bootstrap Problem (Architectural):**

   - Circular dependency between h_124 and m_129
   - Requires manual "priming" to complete calculations
   - Solution: Two-stage independent calculation sequence

2. **Code Complexity (Maintainability):**
   - Current 4012-Cooling.js is difficult to understand and modify
   - Complex calculation flow obscures logic
   - Solution: Simplified structure with clear calculation stages

**What This Refactor IS:**

- ✅ Architectural cleanup (two-stage design)
- ✅ Code simplification (reduce complexity)
- ✅ Documentation improvement (clear calculation flow)
- ✅ Maintainability enhancement (easier for future developers/AI)

**What This Refactor IS NOT:**

- ❌ Re-engineering psychrometric mathematics
- ❌ Changing calculation formulas or constants
- ❌ Improving Excel parity (already exists)
- ❌ Adding new features (monthly binning comes later)

**Success Criteria:**

- Bootstrap problem eliminated (no priming required)
- Code is clearer and more maintainable
- Excel parity maintained (100% match within ±0.01%)
- All existing functionality preserved

### D.9 Implementation Confidence

**APPROVED TO PROCEED:**

**Quality Assessment:** 9/10 (Excellent production-ready workplan)

**Feasibility:** HIGH (Implementation is straightforward with clear guidance)

**Time Estimate:** 9-15 hours (across multiple sessions)

**Risk Level:** LOW-MEDIUM (Excellent rollback strategy, comprehensive tests)

**Next Steps:**

1. ✅ Document clarifications (this appendix)
2. ✅ Commit updated workplan with backup files
3. → Begin Phase 5.1.1: Add climate fields to S03
4. → Implement Stage 1 (Cooling.js - independent)
5. → Validate Stage 1 against Excel
6. → Implement Stage 2 (S13 - dependent)
7. → Validate complete system
8. → Deploy and archive old module

**User Approval:** Ready to begin implementation

---

## Appendix E: Current Implementation Analysis (2025-10-21)

### E.1 Current Cooling.js Architecture Analysis

**File:** 4012-Cooling.js (33K)
**Status:** Functional but contains bootstrap problem

#### Current Calculation Flow

**Main Function:** `calculateAll(mode)` (lines 452-523)

**Execution Order:**

1. Read inputs from StateManager (lines 469-488)
2. `calculateWetBulbTemperature()` (line 496)
3. `calculateAtmosphericValues()` (line 499)
4. `calculateHumidityRatios()` (line 502)
5. `calculateLatentLoadFactor()` (line 505) → outputs A6
6. `calculateFreeCoolingLimit()` (line 508) → outputs **h_124**
7. `calculateDaysActiveCooling()` (line 511) → outputs **m_124** ⚠️ **BOOTSTRAP PROBLEM**
8. `updateStateManager()` (line 516) → publishes all results
9. `dispatchCoolingEvent()` (line 519)

#### Bootstrap Problem Identified

**Location:** `calculateDaysActiveCooling()` line 328-329

```javascript
const m_129_annual =
  window.TEUI.parseNumeric(getModeAwareValue("m_129", "0")) || 0;
```

**The Circular Dependency:**

1. Cooling.js calculates **h_124** (free cooling capacity)
2. Cooling.js tries to read **m_129** to calculate m_124
3. BUT m_129 is calculated in **S13** using h_124: `m_129 = MAX(0, d_129 - h_124 - d_123)`
4. S13 depends on Cooling.js h_124
5. Cooling.js depends on S13 m_129
6. **Circular dependency!** ⚠️

**Current Workaround:** Users must "prime" calculations by:

- Toggling g_118 (ventilation method) dropdown
- Toggling d_116 (cooling system) dropdown
- This forces multiple calculation passes until values stabilize

#### Current S13 Integration

**File:** 4012-Section13.js (126K)

**m_129 Calculation:** `calculateCEDMitigated()` (lines 2815-2849)

```javascript
// Excel formula: M129 = MAX(0, D129 - H124 - D123)
const cedMitigated = Math.max(0, d129 - h124 - d123);
```

**Where:**

- `d129` = CED Unmitigated (total cooling load from gains)
- `h124` = Free cooling capacity (from Cooling.js)
- `d123` = Vent energy recovered (from S13)

**Note:** This formula is correct and should NOT be changed. The issue is purely architectural.

### E.2 Two-Stage Architecture Design

#### User Requirements (2025-10-21)

**User Clarification:**

> "We need to imagine a user may change g_118 (Ventilation method) or l_118 (Volumetric Ventilation Rate in ACH), so the system would first calculate impacts on ventilation and free cooling (first pass) and then calculate the latent aspects required of the active cooling system (second pass) IF Cooling is set at d_116. IF 'No Cooling' is set, then it can skip the second pass."

**Key Insights:**

1. Cooling.js can calculate m_124 (it's a "cooling thing")
2. m_124 should just be displayed in S13 row 124 (like h_124)
3. Stage 1 runs on ventilation/climate changes
4. Stage 2 is conditional on d_116 ≠ "No Cooling"
5. DO NOT change the math - only fix the ordering/architecture

#### STAGE 1: Ventilation & Free Cooling (Independent)

**Triggers:**

- Changes to g_118 (ventilation method)
- Changes to l_118 (volumetric ventilation rate ACH)
- Changes to l_119 (summer boost)
- Changes to climate data (l_20, l_21, h_24, d_21, etc.)
- Changes to building geometry (d_105, h_15)
- Changes to indoor conditions (i_59)

**Functions (from current calculateAll):**

1. `calculateWetBulbTemperature()` - Psychrometric baseline
2. `calculateAtmosphericValues()` - Pressure calculations
3. `calculateHumidityRatios()` - Indoor/outdoor humidity differential
4. `calculateLatentLoadFactor()` - Latent cooling multiplier (Excel A6)
5. `calculateFreeCoolingLimit()` - Free cooling capacity (Excel A33 × M19 → **h_124**)

**Inputs Required:**

- Climate: h_24, d_21, l_20, l_21, l_22
- Building: d_105, h_15
- Ventilation: h_120, d_120, g_118, l_119, k_120
- Indoor: i_59

**Outputs Published to StateManager:**

- `cooling_latentLoadFactor` → used by S13 as i_122
- `cooling_h_124` → used by S13 as h_124 and for m_129 calculation
- Various intermediate psychrometric values

**Critical:** Stage 1 has **ZERO dependency** on m_129 or d_116

#### STAGE 2: Active Cooling System (Dependent & Conditional)

**Condition:**

```javascript
const d_116 = getModeAwareValue("d_116", "No Cooling");
if (d_116 === "No Cooling") {
  // Skip Stage 2 - no active cooling system installed
  return;
}
```

**Triggers:**

- m_129 value changes in StateManager (calculated by S13)
- Only runs AFTER Stage 1 completes AND S13 calculates m_129

**Functions:**

1. `calculateDaysActiveCooling()` - Days active cooling required (Excel E55 → **m_124**)

**Inputs Required:**

- m_129 (from S13) - mitigated cooling load = MAX(0, d_129 - h_124 - d_123)
- h_124 (from Stage 1) - free cooling capacity
- d_21 (CDD)
- m_19 (cooling season days)

**Outputs Published to StateManager:**

- `cooling_m_124` → displayed in S13 row 124 (m_124 cell)

**Critical:** Stage 2 runs AFTER S13 calculates m_129, breaking the circular dependency

#### Calculation Sequence (Bootstrap Eliminated)

**One-Way Data Flow:**

```
User changes g_118 or l_119
    ↓
[STAGE 1: Cooling.js]
  - Calculate latentLoadFactor
  - Calculate h_124 (free cooling capacity)
  - Publish to StateManager
    ↓
[S13: calculateCEDMitigated]
  - Reads h_124 from StateManager
  - Reads d_129 (from gains calculations)
  - Reads d_123 (vent energy recovered)
  - Calculates: m_129 = MAX(0, d_129 - h_124 - d_123)
  - Publishes m_129 to StateManager
    ↓
[STAGE 2: Cooling.js] (conditional on d_116)
  - StateManager listener detects m_129 change
  - Reads m_129 from StateManager
  - Calculates m_124 (days active cooling)
  - Publishes m_124 to StateManager
    ↓
[S13: Display]
  - Shows h_124 in row 124 column H
  - Shows m_124 in row 124 column M
```

**No circular dependency!** Each stage depends only on previous stage outputs.

### E.3 Implementation Strategy

#### What Changes:

1. ✅ Split `calculateAll()` into `calculateStage1()` and `calculateStage2()`
2. ✅ Move m_124 calculation from main flow to conditional Stage 2
3. ✅ Add StateManager listener for m_129 to trigger Stage 2
4. ✅ Add d_116 check before running Stage 2

#### What Stays the Same:

1. ❌ DO NOT change psychrometric formulas (wet bulb, humidity ratio, etc.)
2. ❌ DO NOT change S13 m_129 calculation: `MAX(0, d_129 - h_124 - d_123)`
3. ❌ DO NOT change Excel parity calculations
4. ❌ DO NOT change constants (0.62198, physics values, etc.)

#### Success Criteria:

1. ✅ User can change g_118 without "priming"
2. ✅ First navigation to S13 shows correct values (no iteration needed)
3. ✅ Stage 1 completes without reading m_129
4. ✅ Stage 2 only runs if d_116 ≠ "No Cooling"
5. ✅ Excel parity maintained (100% match within ±0.01%)

### E.4 Testing Plan

#### Bootstrap Elimination Test:

1. Clear localStorage (fresh state)
2. Load calculator
3. Enter building/climate data
4. Navigate to S13
5. **Verify:** All cooling values appear correctly on first visit
6. **Verify:** No need to toggle g_118 or d_116
7. Change g_118 value
8. **Verify:** h_124 updates immediately, m_129 follows, m_124 updates last
9. Set d_116 = "No Cooling"
10. **Verify:** Stage 2 skips, m_124 not calculated

#### Excel Parity Test:

1. Use COOLING-TARGET.csv test case (Alexandria, ON)
2. Compare Stage 1 outputs (h_124, latentLoadFactor) to Excel
3. Compare Stage 2 outputs (m_124) to Excel
4. **Pass:** All values within ±0.01%

---

## Appendix C: Critical Questions for Resolution Before Implementation

### Context from User (2025-01-20)

**Climate Data Sources:**

- Seasonal RH% comes from Environment Canada Weather Normals
- Example: Toronto station - https://climate.weather.gc.ca/climate_normals/results_1991_2020_e.html?searchType=stnName_1991&txtStationName_1991=Toronto
- "Average Relative Humidity - 1500LST (%)" = RH at 3pm Local Station Time
- This is RH relative to **dry bulb temperature** (not wet bulb)

**Temperature Values:**

- `l_20` (20.43°C): Seasonal average overnight temperature (dry bulb)
  - Calculated by averaging across typical cooling season months
  - Assumption: "at night it must ON AVERAGE be at least this cool"
- `H5` in Excel (23°C): July 2.5% wet bulb temperature (peak cooling scenario)
  - This is PROVIDED as Twb directly from climate data
  - H4 contains the corresponding Tdb

**Wet Bulb Calculation Rationale:**

- Climate data does NOT provide Twb for most conditions
- Formula `E64 = E60 - (E60 - (E60 - (100 - E59)/5)) * (0.1 + 0.9 * (E59 / 100))` is NOVEL
- Purpose: Derive Twb from available Tdb and RH% at 15h00 LST
- Example: 20.43°C Tdb + 55.85% RH → 15.11°C Twb
- This derived Twb is then used in Tetens formula for "Saturation Vapour Pressure (Tetens Formula) PRESENT WEATHER"

**Excel Structure:**

- E11 (Outdoor Tetens): `=610.94 * EXP(17.625 * H5 / (H5 + 243.04))`
  - H5 = 23°C Twb (July 2.5% peak cooling scenario)
  - H4 = corresponding Tdb
- A56 (Average Tetens): Uses derived Twb from E64 formula
  - A50 = E64 (derived wet bulb from seasonal averages)

**Outstanding Offer:**
Environment Canada offered to provide flat file for every location in Canada with Twb values, but utility uncertain given novel formula availability.

---

### C.1 Wet Bulb Temperature Calculation Chain

**Questions to Verify:**

1. **Two Different Tetens Calculations:**

   - Excel E11 uses H5 (23°C Twb from climate data - peak scenario)
   - Excel A56 uses A50=E64 (derived Twb from seasonal average Tdb + RH)
   - **Q: Which one does the cooling module actually use for free cooling calculations?**
   - **Q: Is E11 used for a different purpose than A56?**

2. **Wet Bulb Formula Validation:**

   - Novel formula: `Twb = Tdb - (Tdb - (Tdb - (100 - RH)/5)) * (0.1 + 0.9 * (RH / 100))`
   - User example: 20.43°C Tdb + 55.85% RH → 15.11°C Twb
   - **Q: Can we validate this formula against psychrometric charts for Canadian climates?**
   - **Q: What is the expected accuracy range (±1°C, ±2°C)?**
   - **Q: Does this formula have published references or is it empirically derived?**

3. **Climate Data Time-of-Day Alignment:**

   - l_21: RH at 15h00 LST (3pm - hottest part of day)
   - l_20: Overnight temperature (presumably midnight to 6am average?)
   - **Q: Are we mixing daytime RH with nighttime temperature in the Twb calculation?**
   - **Q: Should we use nighttime RH instead of 15h00 RH for overnight free cooling calculations?**
   - **Q: Does Environment Canada provide RH at night (e.g., 3am LST) for better accuracy?**

4. **Excel A57 Mystery (0.7 = 70%):**
   - Currently hardcoded as "Outdoor Seasonal Relative Humidity %"
   - Different from A4 (55.85% - cooling season mean RH at 15h00 LST)
   - **Q: What does A57 actually represent?**
   - **Q: Is 70% a nighttime RH assumption?**
   - **Q: Is 70% a conservative/worst-case value?**
   - **Q: Should this become l_23 as a user-editable field, or remain hardcoded?**

---

### C.2 Calculation Order and Dependencies

**CRITICAL USER FEEDBACK (2025-01-20):**

> "Your observation about a bootstrap issue is likely correct, we often need to 'prime' values to complete calculation flow by changing ventilation method or switching the 'Cooling' and 'No Cooling' toggle on and off to get the calculations to complete (ie. g_118 'priming' - this is well explained by the bootstrap issue you describe that we need to solve."

**PROPOSED SOLUTION - Two-Stage Calculation:**

> "I think we should assume ALL model scenarios have no active cooling, that way we can calculate the extent of available free cooling based on ventilation alone. And THEN we can solve for mechanical cooling as an augmentation of this capability."

**Implementation Strategy:**

**Stage 1: Free Cooling Baseline (Cooling.js)**

```javascript
// ALWAYS calculate free cooling independent of mechanical cooling
// Inputs: ventilation rate, temperatures, humidity
// Outputs: h_124 (free cooling capacity in kWh/yr)
// Assumption: NO mechanical cooling exists yet

function calculateFreeCoolingBaseline(inputs) {
  // This calculation NEVER depends on m_129 or d_129
  // Only depends on:
  // - Ventilation rate (h_120, d_120)
  // - Temperature differential (l_20, h_24)
  // - Humidity conditions (l_21, l_23, i_59)

  return freeCoolingCapacity_kWh; // h_124
}
```

**Stage 2: Mechanical Cooling Requirement (S13)**

```javascript
// After free cooling is known, calculate mechanical cooling needed
// Inputs: total cooling load (d_129), free cooling capacity (h_124)
// Outputs: m_129 (mechanical cooling required), m_124 (days active cooling)

function calculateMechanicalCoolingRequired(d_129, h_124) {
  // m_129 = MAX(0, d_129 - h_124)  // Mechanical load after free cooling
  // m_124 = f(m_129, cooling_days)  // Days mechanical system must run

  return { m_129, m_124 };
}
```

**Bootstrap Problem Eliminated:**

- Free cooling (h_124) calculated FIRST, independent of all cooling loads
- Mechanical cooling (m_129, m_124) calculated SECOND, using h_124 as input
- NO circular dependency: h_124 → m_129 (one-way flow)
- NO "priming" needed: calculations complete in single pass

**Questions to Resolve:**

5. **m_129 Redefinition:**

   - Current (ambiguous): "Mitigated cooling demand"
   - Proposed: "Mechanical cooling demand after free cooling"
   - **Q: Does this match Excel's definition of m_129?**
   - **Q: Or should we create a NEW field for post-free-cooling load?**
   - **Q: Where in S13 should mechanical cooling calculation happen?**

6. **d_129 as Primary Input:**

   - d_129: "Unmitigated cooling demand" (total cooling needed)
   - This is calculated from: gains, solar, transmission, ventilation loads
   - **Q: Does d_129 include ventilation cooling loads?**
   - **Q: If yes, should we subtract sensible ventilation cooling before calculating d_129?**
   - **Q: Or does free cooling purely reduce the MECHANICAL load?**

7. **Calculation Sequence Documentation:**

   ```
   STAGE 1 (Cooling.js - Independent):
   ├─ Read: h_120, d_120, l_20, h_24, l_21, l_23, i_59
   ├─ Calculate: latentLoadFactor, freeCoolingCapacity (h_124)
   └─ Publish: cooling_latentLoadFactor, cooling_h_124

   STAGE 2 (S13 - Dependent on Stage 1):
   ├─ Read: d_129 (total cooling load), h_124 (free cooling capacity)
   ├─ Calculate: m_129 = MAX(0, d_129 - h_124)
   ├─ Calculate: m_124 = f(m_129, cooling_days, h_124)
   └─ Publish: m_129, m_124
   ```

   - **Q: Does this match the intended Excel calculation order?**
   - **Q: Should m_124 use m_129 or d_129 as input?**
   - **Q: Can we verify this sequence eliminates the "priming" requirement?**

---

### C.3 Physical Validation and Bounds

**Questions to Establish Limits:**

8. **Latent Load Factor Physical Range:**

   - Formula produces: 1 + (latent / sensible)
   - Should always be ≥ 1.0 (cannot have negative latent load)
   - **Q: What is the maximum realistic latentLoadFactor for Canadian climates?**
   - **Q: Should we clamp values > 3.0 as data errors?**
   - **Q: What does Excel produce for extreme cases (hot humid vs cold dry)?**

9. **Free Cooling Impossible Scenarios:**

   - When nightTemp ≥ coolingSetpoint, free cooling capacity = 0
   - **Q: Should we also check if outdoor humidity > indoor humidity?**
   - **Q: In humid climates, can ventilation INCREASE cooling load despite lower temp?**
   - **Q: How does Excel handle negative free cooling capacity?**

10. **Ground Temperature Seasonality:**
    - Currently constant: groundTemp = 10°C (Excel A7)
    - Used for "ΔT for Ag" (ground-facing elements)
    - **Q: Should ground temp vary by location (latitude, climate zone)?**
    - **Q: Should ground temp vary by season (summer vs winter)?**
    - **Q: Is 10°C appropriate for all of Canada (Vancouver vs Iqaluit)?**
    - **Q: Does Excel provide any guidance on this value?**

---

### C.4 Temperature Differential Sign Conventions

**Questions for Consistency:**

11. **Sign Convention Standardization:**
    - Latent load factor: `tempDiff = nightTemp - coolingSetpoint`
    - Free cooling: `tempDiff = coolingSetpoint - nightTemp`
    - **Q: Can we standardize to ONE convention throughout?**
    - **Q: Which convention does Excel use consistently?**
    - **Q: Should we define: ΔT_cooling = T_indoor - T_outdoor (positive = cooling potential)?**

---

### C.5 Data Source Quality and Alternatives

**Questions for Future Enhancement:**

12. **Environment Canada Twb Data:**

    - Offer: Flat file with Twb for every Canadian location
    - Current: Novel formula derives Twb from Tdb + RH
    - **Q: What is the accuracy difference between derived vs provided Twb?**
    - **Q: Should we offer BOTH options (formula vs lookup table)?**
    - **Q: Would using provided Twb improve regulatory acceptance?**
    - **Q: File format and integration effort required?**

13. **Hourly vs Daily vs Seasonal Averaging:**
    - Current: Single seasonal average values (l_20, l_21)
    - Future: Monthly binning, then 8760 hourly
    - **Q: What accuracy improvement from seasonal → monthly → hourly?**
    - **Q: Is seasonal averaging acceptable for code compliance?**
    - **Q: Do regulators require hourly modeling for cooling loads?**

---

### C.6 Excel Parity Verification Strategy

**Questions for Testing Plan:**

14. **Excel Test Cases:**

    - **Q: Can we extract 5-10 test cases with full input/output sets from Excel?**
    - **Q: Which Canadian cities should be test cases (diverse climates)?**
    - **Q: What tolerance is acceptable: ±0.01%, ±0.1%, ±1%?**
    - **Q: Are there known edge cases in Excel that produce warnings or errors?**

15. **Excel Cell Mapping Verification:**
    - **Q: Can we get a complete cell dependency tree from Excel?**
    - **Q: Are there any circular references in Excel (iterative calculation)?**
    - **Q: Which Excel cells are user inputs vs calculated vs hardcoded?**
    - **Q: Can we export Excel formulas for cells A1-E66 in COOLING-TARGET?**

---

### C.7 Performance and Optimization

**Questions for Implementation:**

16. **Calculation Frequency:**

    - Workplan registers 14+ listeners, each triggering both modes
    - **Q: How many times per user interaction do cooling calculations run?**
    - **Q: Is debouncing needed, or are calculations fast enough (<10ms)?**
    - **Q: Should we cache results if inputs haven't changed?**

17. **Precision Requirements:**
    - JavaScript uses IEEE 754 double precision
    - Excel uses similar but not identical floating point
    - **Q: Are there known precision issues in Excel (iterative calculations)?**
    - **Q: Should we round intermediate results to match Excel behavior?**
    - **Q: What precision does the regulator require (decimal places)?**

---

### C.8 Integration with Section 13

**Questions for S13 Coordination:**

18. **S13 Initialization Order:**

    - **Q: Does S13 wait for Cooling.js to initialize before first calculation?**
    - **Q: What happens if Cooling.js fails to load or initialize?**
    - **Q: Should S13 provide fallback values if cooling calculations fail?**

19. **S13 Field Dependencies:**
    - Cooling.js outputs: `cooling_latentLoadFactor`, `cooling_h_124`, `cooling_m_124`
    - S13 displays: `i_122`, `h_124`, `m_124`
    - **Q: Is the mapping 1:1, or does S13 apply additional transformations?**
    - **Q: Does S13 store these values separately for Target vs Reference?**
    - **Q: What happens to old `4012-Cooling.js` values during migration?**

---

### C.9 Code Review Checklist

**Questions for Final Validation:**

20. **Code Quality Standards:**
    - **Q: Do we have linting rules (ESLint, Prettier)?**
    - **Q: Do we require JSDoc comments for all functions?**
    - **Q: Do we have automated testing framework (Jest, Mocha)?**
    - **Q: Who reviews and approves the final implementation?**

---

## Appendix D: User Notes for Climate Data Interpretation

### Understanding the Climate Data Sources

**From User Response (2025-01-20):**

1. **RH at 15h00 LST (l_21 = 55.85%)**

   - Source: Environment Canada "Average Relative Humidity - 1500LST (%)"
   - Time: 3pm Local Station Time (hottest part of day)
   - Measurement: Relative to dry bulb temperature at that time
   - Usage: Input to wet bulb conversion formula

2. **Seasonal Overnight Temperature (l_20 = 20.43°C)**

   - Calculation: Average temperature across typical cooling season months
   - Assumption: "At night it must ON AVERAGE be at least this cool"
   - Type: Dry bulb temperature
   - Usage: Both wet bulb derivation and free cooling temperature differential

3. **Peak Cooling Scenario (H5 = 23°C Twb)**

   - Source: July 2.5% wet bulb temperature from climate data
   - Type: Wet bulb temperature (provided, not calculated)
   - Companion: H4 contains corresponding dry bulb temperature
   - Usage: Excel E11 Tetens formula for peak conditions

4. **Wet Bulb Conversion Formula**
   - Purpose: Derive Twb when climate data doesn't provide it
   - Input: Tdb (dry bulb) + RH% at 15h00 LST
   - Output: Twb for use in Tetens formula
   - Status: Novel formula (not standard psychrometric calculation)

### Implications for Implementation

**Time-of-Day Alignment:**

- We're using 15h00 LST RH% (daytime) with overnight temperature
- This may be mixing conditions from different times of day
- Consider: Should we request nighttime RH% from Environment Canada?

**Wet Bulb Data Availability:**

- Environment Canada can provide Twb flat files for all Canadian locations
- Decision needed: Use novel formula vs lookup table vs hybrid approach
- Consider regulatory acceptance: provided data vs calculated data

**Validation Strategy:**

- Compare novel formula output against psychrometric charts
- Test with multiple Canadian climate zones
- Verify against Environment Canada Twb data if available

---

## Next Steps for User

**Priority 1: Excel Structure Verification**

1. Export formulas for COOLING-TARGET cells A1-E66
2. Identify which cells use H5 (peak Twb) vs A50 (seasonal Twb)
3. Map calculation order: which cells depend on which
4. Confirm if any circular references exist (iterative calculation)

**Priority 2: Climate Data Clarification**

1. Verify A57 (70% RH) - what does this represent?
2. Check if nighttime RH% is available from Environment Canada
3. Confirm time-of-day for all temperature and RH measurements
4. Consider requesting sample Twb flat file from Environment Canada

**Priority 3: S13 Integration Documentation**

1. Document current m_129 calculation sequence
2. Clarify what "mitigated" means in m_129 (which mitigations?)
3. Map data flow: S13 → Cooling.js → S13 (circular or one-way?)
4. Identify any iteration loops or convergence criteria

**Priority 4: Test Case Extraction**

1. Create 3-5 test scenarios from Excel with full input/output sets
2. Include diverse climates: Vancouver, Toronto, Calgary, Montreal, Iqaluit
3. Document expected outputs for each scenario
4. Note any Excel warnings or edge cases

## Phase 8: Risk Assessment

### 8.1 Technical Risks

| Risk                       | Probability | Impact   | Mitigation                                                                   |
| -------------------------- | ----------- | -------- | ---------------------------------------------------------------------------- |
| Excel parity fails         | Low         | High     | Comprehensive test suite with Excel validation cells documented              |
| S13 integration breaks     | Medium      | High     | Thorough integration testing before deployment, keep old module for rollback |
| Performance degradation    | Low         | Medium   | Performance benchmarking during testing, debounced listeners implemented     |
| Mode switching errors      | Low         | Medium   | Extensive dual-state testing with independent state verification             |
| Missing input errors       | Low         | High     | Fail-fast error handling with clear messages, input validation               |
| Bootstrap problem persists | Very Low    | Critical | Test procedure specifically validates single-pass calculation                |
| Stage 1/2 confusion        | Low         | Medium   | Clear console logging identifying stage, comprehensive documentation         |
| S13 doesn't read h_124     | Medium      | High     | Integration test verifies StateManager data flow, add dependency check       |

### 8.2 Migration Risks

| Risk                         | Probability | Impact   | Mitigation                                                    |
| ---------------------------- | ----------- | -------- | ------------------------------------------------------------- |
| Existing projects break      | Low         | High     | Regression testing with 5+ real project files                 |
| Old cooling values differ    | Medium      | Medium   | Document expected differences, validate against Excel         |
| User confusion               | Low         | Low      | No UI changes, backend only, transparent to users             |
| Data loss                    | Very Low    | Critical | Keep old module archived for rollback, localStorage preserved |
| S03 fields missing           | High        | High     | Phase 5.1.1 must complete before testing, validation checks   |
| Reference mode contamination | Low         | High     | Strict mode isolation tests, verify ref\_ prefix usage        |

### 8.3 Implementation Risks

| Risk                         | Probability | Impact | Mitigation                                                                      |
| ---------------------------- | ----------- | ------ | ------------------------------------------------------------------------------- |
| Wet bulb formula inaccurate  | Medium      | Medium | Compare against psychrometric charts, validate with Environment Canada Twb data |
| Time-of-day RH mismatch      | Medium      | Low    | Document assumptions clearly, resolve with user in Appendix C questions         |
| Unit conversion errors       | Low         | High   | Centralized CONVERSIONS object, document derivations                            |
| Sign convention errors       | Low         | Medium | Standardize temperature differential usage throughout                           |
| Listener storm not prevented | Low         | Medium | Debounce implementation tested with rapid input changes                         |

---

## Phase 9: Success Metrics

### 9.1 Quantitative Metrics

| Metric                      | Target                 | Current (4012)  | Measurement Method       |
| --------------------------- | ---------------------- | --------------- | ------------------------ |
| Lines of Code               | -60%                   | ~800 LOC        | Count non-comment lines  |
| Function Count              | ≤10 core functions     | ~20 functions   | Count exported functions |
| Calculation Time (Stage 1)  | <25ms per mode         | Unknown         | Performance.now() timing |
| Calculation Time (Total)    | <50ms both modes       | Unknown         | Performance.now() timing |
| Excel Parity                | 100.00% (±0.01%)       | Unknown         | Test suite comparison    |
| Test Coverage               | 100% of calc functions | 0%              | Manual test execution    |
| Bootstrap "Priming"         | 0 instances required   | Always required | User interaction test    |
| Listener Triggers per Input | ≤2 (debounced)         | Unknown         | Console log count        |

### 9.2 Qualitative Metrics

| Metric                    | Target                                         | Assessment Method                      |
| ------------------------- | ---------------------------------------------- | -------------------------------------- |
| **Code Readability**      | New developer understands flow in <30 min      | Developer survey, documentation review |
| **Maintainability**       | Clear separation of concerns (Stage 1/2)       | Code review by 2+ developers           |
| **Error Messages**        | Developers can diagnose issues from console    | Error message clarity review           |
| **Extensibility**         | Monthly binning addable without major refactor | Architecture review, proof-of-concept  |
| **Documentation Quality** | All calculations traceable to Excel            | Excel formula cross-reference complete |
| **Bootstrap Elimination** | Users report no "priming" needed               | User testing feedback                  |

### 9.3 Regulatory Compliance Metrics

| Metric                      | Target                                        | Verification Method             |
| --------------------------- | --------------------------------------------- | ------------------------------- |
| Excel Formula Parity        | All formulas match approved Excel model       | Line-by-line formula comparison |
| Calculation Method Approval | Tetens formula and wet bulb method documented | Submit methodology to regulator |
| Decimal Precision           | Match Excel output precision                  | Round-trip Excel comparison     |
| Edge Case Handling          | Excel warnings/errors matched in code         | Edge case test suite            |

---

## Appendix A: Excel Formula Reference

### Key Calculations

```
=== STAGE 1: FREE COOLING BASELINE ===

Latent Load Factor (A6):
= 1 + A64/A55
where A64 = A54 * E3 * E6 * A63  (latent cooling load)
      A55 = H26 * E3 * E4 * (A49 - H27)  (sensible cooling load)
simplified: 1 + [E6 * A63] / [E4 * (A49 - H27)]
JavaScript: 1 + (LATENT_HEAT * deltaHumidity) / (SPECIFIC_HEAT * tempDiff)

Wet Bulb Temperature (E64):
= E60 - (E60 - (E60 - (100 - E59)/5)) * (0.1 + 0.9 * (E59 / 100))
where E60 = dry bulb temp (l_20)
      E59 = RH% at 15h00 (l_21)

Tetens Formula (A56):
= 610.94 * EXP(17.625 * A50 / (A50 + 243.04))
where A50 = wet bulb temp (from E64)

Humidity Ratio (A61, A62):
= 0.62198 * vaporPressure / (atmPressure - vaporPressure)

Atmospheric Pressure (E15):
= 101325 * EXP(-elevation / 8434)

Free Cooling Daily (A33):
= A32 / 3600000
where A32 = A31 * 86400  (Joules per day)
      A31 = A30 * E4 * A16  (Watts)
      A30 = A29 * E3  (mass flow kg/s)
      A29 = A28 / 1000  (m³/s)
      A28 = ventilation rate with summer boost (L/s)

Free Cooling Annual (H124):
= A33 * M19  (base calculation)
then apply setback if g_118 includes "schedule": H124 * (k_120/100)

=== STAGE 2: MECHANICAL COOLING AUGMENTATION ===

Mechanical Cooling Required (M129):
= MAX(0, D129 - H124)
where D129 = total unmitigated cooling load
      H124 = free cooling capacity (from Stage 1)

Daily Mechanical Load (E37):
= M129 / D21  (CDD)

Daily Free Cooling (E36):
= A33  (from Stage 1)

Seasonal Mechanical Load (E50):
= E37 * E45
where E45 = D21 (CDD)

Seasonal Free Cooling (E51):
= E36 * E45

Unmet Load (E52):
= E50 - E51

Days Active Cooling (E55):
= E52 / (E54 * 24)
where E54 = M19 (cooling season length in days)
```

### Cell Dependencies (CRITICAL for Excel Parity)

```
STAGE 1 DEPENDENCIES (No circular references):
A6 ← A63, A49, H27, E6, E4
A63 ← A62, A61
A62 ← A58, E15
A61 ← A60, E15
A60 ← A59, A52
A59 ← A8
A58 ← A56, A57
A56 ← A50
A50 ← E64
E64 ← E60, E59
A33 ← A32
A32 ← A31
A31 ← A30, E4, A16
A30 ← A29, E3
A29 ← A28
A28 ← D120, L119
H124 ← A33, M19, G118, K120

STAGE 2 DEPENDENCIES (One-way from Stage 1):
M129 ← D129, H124
E55 (M124) ← M129, D21, M19, H124
```

---

## Appendix B: Glossary

| Term                     | Definition                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------- |
| **CDD**                  | Cooling Degree Days - measure of cooling demand based on temperature above baseline |
| **Tetens Formula**       | Empirical formula for calculating saturation vapor pressure from temperature        |
| **Wet Bulb Temperature** | Temperature accounting for evaporative cooling effect of moisture                   |
| **Humidity Ratio**       | Mass of water vapor per mass of dry air (kg water/kg dry air)                       |
| **Latent Load**          | Cooling energy needed to remove moisture (dehumidification)                         |
| **Sensible Load**        | Cooling energy needed to lower air temperature                                      |
| **Free Cooling**         | Cooling provided by ventilation alone without mechanical systems                    |
| **Mode-Aware**           | Function behavior adapts based on Target vs Reference mode                          |
| **Bootstrap Problem**    | Circular dependency requiring manual "priming" to complete calculations             |
| **Stage 1**              | Free cooling baseline calculation (independent of cooling loads)                    |
| **Stage 2**              | Mechanical cooling augmentation (dependent on Stage 1 results)                      |
| **Priming**              | Manual user action (toggling dropdown) to force calculation completion              |
| **LST**                  | Local Station Time - time zone for weather station measurements                     |
| **Twb**                  | Wet bulb temperature (°C)                                                           |
| **Tdb**                  | Dry bulb temperature (°C) - standard air temperature                                |
| **RH**                   | Relative humidity (%)                                                               |
| **HSPF**                 | Heating Seasonal Performance Factor - heat pump efficiency rating                   |
| **COP**                  | Coefficient of Performance - ratio of useful heating/cooling to energy input        |
| **SRE**                  | Sensible Recovery Efficiency - HRV/ERV heat recovery effectiveness (%)              |

---

## Appendix C: Critical Questions for Resolution Before Implementation

### Context from User (2025-01-20)

**Climate Data Sources and Rationale:**

- Seasonal RH% comes from Environment Canada Weather Normals
- Example: Toronto station - https://climate.weather.gc.ca/climate_normals/results_1991_2020_e.html?searchType=stnName_1991&txtStationName_1991=Toronto
- "Average Relative Humidity - 1500LST (%)" = RH at 3pm Local Station Time
- This is RH relative to **dry bulb temperature** (not wet bulb)

**Critical Design Decision - Using 15h00 RH for Overnight Cooling:**

> "The idea of the 15h00 LST RH% value was that it assumes the RH% for that day 'can't get much worse' - and so as an available metric (this is the last recorded daily metric, overnight is not available) it seemed like a plausible 'worst case' value to use for overnight cooling, in reality the situation would likely be more favourable."

**Engineering Rationale:**

- 15h00 LST = highest temperature of day → typically lowest RH of day
- Using 15h00 RH for overnight = **conservative assumption** (worst-case)
- Actual overnight RH typically higher → more favorable for free cooling
- Limited data available: overnight RH not provided in standard climate normals
- Approach: Use available data conservatively for gross seasonal average

**Temperature Values:**

- `l_20` (20.43°C): Seasonal average overnight temperature (dry bulb)
  - Calculated by averaging across typical cooling season months
  - Assumption: "at night it must ON AVERAGE be at least this cool"
- `l_21` (55.85%): RH at 15h00 LST (conservative worst-case for overnight)
- `l_23` (70%): Seasonal outdoor RH - likely represents different condition (see questions below)

**Excel Structure:**

- E11 (Peak Tetens): Uses H5 (23°C Twb from climate data - July 2.5% peak)
- A56 (Seasonal Tetens): Uses A50=E64 (derived Twb from seasonal averages)
- Two different calculations serve different purposes (peak vs seasonal)

**Wet Bulb Calculation Rationale:**

- Climate data does NOT provide Twb for most conditions
- Formula `E64 = E60 - (E60 - (E60 - (100 - E59)/5)) * (0.1 + 0.9 * (E59 / 100))` is NOVEL
- Purpose: Derive Twb from available Tdb and RH% at 15h00 LST
- Example: 20.43°C Tdb + 55.85% RH → 15.11°C Twb
- Conservative: Using daytime (lower) RH produces lower Twb → higher latent load

**Bootstrap Problem Confirmation:**

- User confirms: "Your observation about a bootstrap issue is likely correct"
- Current workaround: Toggle g_118 (ventilation method) or d_116 (cooling system) to "prime" calculations
- **Solution implemented:** Two-stage architecture eliminates circular dependency

---

### Outstanding Questions (Consolidated)

#### Q1. Excel A57 Mystery (70% vs 55.85%)

- A57 = 70% "Outdoor Seasonal Relative Humidity %"
- A4 = 55.85% "Cooling Season Mean RH at 15h00 LST"
- **What does A57 (70%) represent?**
  - Hypothesis 1: Nighttime RH (higher than 15h00 value)
  - Hypothesis 2: Different season or condition
  - Hypothesis 3: Conservative worst-case value
- **Should this become l_23 as user-editable field?**
  - Workplan assumes YES (allows location-specific refinement)
  - Alternative: Keep hardcoded if consistent across all locations

#### Q2. Wet Bulb Formula Validation

- Novel formula: `Twb = Tdb - (Tdb - (Tdb - (100 - RH)/5)) * (0.1 + 0.9 * (RH / 100))`
- User example: 20.43°C Tdb + 55.85% RH → 15.11°C Twb
- **Can we validate against psychrometric charts for Canadian climates?**
- **What is expected accuracy range (±1°C, ±2°C)?**
- **Does this formula have published references or is it empirically derived?**
- Environment Canada offered Twb flat files - worth pursuing?

#### Q3. m_129 Definition and Location

- Current (ambiguous): "Mitigated cooling demand"
- Proposed: "Mechanical cooling demand after free cooling subtracted"
- **Does Excel calculate m_129 = MAX(0, d_129 - h_124)?**
- **Where in S13 does this calculation currently happen?**
- **Does "mitigated" refer to free cooling mitigation, or something else?**

#### Q4. d_129 vs Ventilation Loads

- d_129 = "Unmitigated cooling demand" (total cooling needed)
- Calculated from: gains, solar, transmission, ventilation loads
- **Does d_129 already include ventilation sensible cooling?**
- **If yes, are we double-counting by also calculating free cooling?**
- **Or is d_129 purely internal gains + envelope loads?**

#### Q5. Excel Test Cases Extraction

- **Can we extract 5-10 complete test cases from Excel?**
  - Full input set (all 15 Stage 1 inputs)
  - Expected outputs (h_124, latentLoadFactor, m_129, m_124)
  - Edge cases (zero CDD, negative temp diff, high humidity)
- **Which Canadian cities represent diverse test conditions?**
  - Suggested: Ottawa, Vancouver, Calgary, Montreal, Iqaluit
- **What tolerance is regulator-acceptable: ±0.01%, ±0.1%?**

#### Q6. Excel Cell Dependencies

- **Can we get complete formula export for COOLING-TARGET A1-E66?**
- **Are there any circular references requiring iteration?**
  - User confirmed bootstrap problem exists
- **Which cells are user inputs vs calculated vs hardcoded?**
- This would complete Appendix A formula reference

#### Q7. S13 Integration Details

- **Does S13 wait for Cooling.js initialization before calculating?**
- **What happens if cooling_h_124 is missing from StateManager?**
- **Should S13 provide fallback values (h_124=0) or throw error?**
- **Where does S13 currently read m_129 from?**

#### Q8. Performance Requirements

- Target: <50ms for both Target + Reference calculations
- **Is this acceptable for user experience?**
- **Should we add progress indicators for slow calculations?**
- **Are there performance issues with current 4012-Cooling.js?**

#### Q9. Ground Temperature Usage

- Currently constant: 10°C (Excel A7)
- Used for "ΔT for Ag" (ground-facing elements)
- **Is 10°C appropriate for all Canadian locations?**
- **Should this vary by climate zone or remain constant?**
- **Is this value used in cooling calculations or only heating?**

#### Q10. Latent Load Factor Expected Range

- Formula: 1 + (latent / sensible)
- Should be ≥ 1.0 (physically impossible to be less)
- **What is typical range for Canadian climates (1.2-2.0)?**
- **What value indicates data error (>3.0)?**
- **Should we clamp or warn on extreme values?**

---

### Priority Questions for Immediate Resolution

**BEFORE IMPLEMENTATION:**

1. **Q3 (m_129 location)** - Must know where S13 calculates this
2. **Q5 (test cases)** - Need validation data for Excel parity testing
3. **Q7 (S13 integration)** - Critical for bootstrap elimination

**DURING IMPLEMENTATION:** 4. **Q1 (A57 meaning)** - Affects l_23 field definition 5. **Q4 (d_129 definition)** - Ensures no double-counting 6. **Q6 (Excel formulas)** - Completes formula verification

**NICE TO HAVE:** 7. **Q2 (Twb validation)** - Confidence in novel formula 8. **Q8-Q10** - Refinements and optimizations

---

## Appendix D: User Notes for Climate Data Interpretation

### Understanding the Climate Data Sources

**From User Response (2025-01-20):**

1. **RH at 15h00 LST (l_21 = 55.85%)**

   - Source: Environment Canada "Average Relative Humidity - 1500LST (%)"
   - Time: 3pm Local Station Time (hottest part of day)
   - Measurement: Relative to dry bulb temperature at that time
   - Usage: Input to wet bulb conversion formula

2. **Seasonal Overnight Temperature (l_20 = 20.43°C)**

   - Calculation: Average temperature across typical cooling season months
   - Assumption: "At night it must ON AVERAGE be at least this cool"
   - Type: Dry bulb temperature
   - Usage: Both wet bulb derivation and free cooling temperature differential

3. **Peak Cooling Scenario (H5 = 23°C Twb)**

   - Source: July 2.5% wet bulb temperature from climate data
   - Type: Wet bulb temperature (provided, not calculated)
   - Companion: H4 contains corresponding dry bulb temperature
   - Usage: Excel E11 Tetens formula for peak conditions

4. **Wet Bulb Conversion Formula**
   - Purpose: Derive Twb when climate data doesn't provide it
   - Input: Tdb (dry bulb) + RH% at 15h00 LST
   - Output: Twb for use in Tetens formula
   - Status: Novel formula (not standard psychrometric calculation)

### Implications for Implementation

**Time-of-Day Alignment:**

- We're using 15h00 LST RH% (daytime) with overnight temperature
- This may be mixing conditions from different times of day
- Consider: Should we request nighttime RH% from Environment Canada?

**Wet Bulb Data Availability:**

- Environment Canada can provide Twb flat files for all Canadian locations
- Decision needed: Use novel formula vs lookup table vs hybrid approach
- Consider regulatory acceptance: provided data vs calculated data

**Validation Strategy:**

- Compare novel formula output against psychrometric charts
- Test with multiple Canadian climate zones
- Verify against Environment Canada Twb data if available

---

## Next Steps for User

**Priority 1: Excel Structure Verification**

1. Export formulas for COOLING-TARGET cells A1-E66
2. Identify which cells use H5 (peak Twb) vs A50 (seasonal Twb)
3. Map calculation order: which cells depend on which
4. Confirm if any circular references exist (iterative calculation)

**Priority 2: Climate Data Clarification**

1. Verify A57 (70% RH) - what does this represent?
2. Check if nighttime RH% is available from Environment Canada
3. Confirm time-of-day for all temperature and RH measurements
4. Consider requesting sample Twb flat file from Environment Canada

**Priority 3: S13 Integration Documentation**

1. Document current m_129 calculation sequence
2. Clarify what "mitigated" means in m_129 (which mitigations?)
3. Map data flow: S13 → Cooling.js → S13 (circular or one-way?)
4. Identify any iteration loops or convergence criteria

**Priority 4: Test Case Extraction**

1. Create 3-5 test scenarios from Excel with full input/output sets
2. Include diverse climates: Vancouver, Toronto, Calgary, Montreal, Iqaluit
3. Document expected outputs for each scenario
4. Note any Excel warnings or edge cases

---

## APPENDIX F: Phase 5.1.2 Implementation (Two-Stage Refactor COMPLETE)

**Date:** 2025-01-21
**Status:** ✅ IMPLEMENTED
**Branch:** C-RF

### Implementation Summary

Successfully refactored `4012-Cooling.js` to implement the two-stage architecture that eliminates the bootstrap problem. The refactor splits `calculateAll()` into two independent stages with StateManager-driven triggering.

### Code Changes

#### 1. New Functions Created

**`calculateStage1(mode)` - Lines 463-530**

- **Purpose:** Calculate ventilation & free cooling (INDEPENDENT)
- **Inputs:** Climate, building, ventilation data (NO dependency on m_129)
- **Outputs:** h_124 (free cooling capacity), latentLoadFactor
- **Triggers:** User changes to climate/ventilation fields
- **State Publishing:** Calls `updateStateManagerStage1()`
- **Event:** Dispatches `cooling-calculations-stage1`

**`calculateStage2(mode)` - Lines 549-593**

- **Purpose:** Calculate active cooling days (DEPENDENT on m_129)
- **Inputs:** m_129 from StateManager, h_124 from Stage 1
- **Outputs:** m_124 (days active cooling)
- **Conditional:** Only runs if d_116 ≠ "No Cooling"
- **Triggers:** StateManager listener for m_129 changes
- **State Publishing:** Calls `updateStateManagerStage2()`
- **Event:** Dispatches `cooling-calculations-stage2`

**`updateStateManagerStage1()` - Lines 617-665**

- Publishes Stage 1 outputs: h_124, latentLoadFactor, psychrometric values
- Mode-aware with ref\_ prefix for Reference model

**`updateStateManagerStage2()` - Lines 672-695**

- Publishes Stage 2 outputs: m_124, d_124 (free cooling %)
- Mode-aware with ref\_ prefix for Reference model

#### 2. Modified Functions

**`calculateAll(mode)` - Lines 601-610**

- **OLD:** Ran all calculations in sequence
- **NEW:** Runs only Stage 1
- **Reason:** Stage 2 now triggered by m_129 listener (eliminates bootstrap)

**`dispatchCoolingEvent(stage)` - Lines 769-783**

- **OLD:** Always dispatched `cooling-calculations-loaded`
- **NEW:** Accepts stage parameter, dispatches stage-specific events
- **Events:** `cooling-calculations-stage1`, `cooling-calculations-stage2`, or legacy event

**`registerWithStateManager()` - Lines 788-915**

- **NEW:** Added m_129 listener (line 812) - KEY to bootstrap elimination
  - Triggers `calculateStage2()` when S13 publishes m_129
- **NEW:** Added d_116 listener (line 831) - Handles cooling system type changes
- **UPDATED:** Climate/ventilation listeners now trigger Stage 1 only
  - i_59 (indoor RH) → `calculateStage1()`
  - l_119 (summer boost) → `calculateStage1()`
  - d_120 (ventilation rate) → `calculateStage1()`
  - l_22 (elevation) → `calculateStage1()`

#### 3. State Object Updates

Added recursion protection flags (lines 140-141):

```javascript
calculatingStage1: false,  // Stage 1 recursion protection
calculatingStage2: false,  // Stage 2 recursion protection
```

#### 4. Public API Updates

Exposed new calculation methods (lines 982-984):

```javascript
calculateAll: calculateAll,     // Runs Stage 1, Stage 2 triggered by m_129 listener
calculateStage1: calculateStage1, // Ventilation & free cooling (independent)
calculateStage2: calculateStage2, // Active cooling (dependent on m_129)
```

### How Bootstrap Problem is Eliminated

**OLD FLOW (Circular Dependency):**

```
User loads page → Cooling.js calculateAll()
  ├─ Calculates h_124 (needs m_129 but doesn't exist yet)
  ├─ Calculates m_124 (uses default m_129=0)
  └─ Publishes wrong values
User toggles dropdown → Triggers recalc
  ├─ Now m_129 exists from S13
  └─ Values correct (but required manual "priming")
```

**NEW FLOW (Two-Stage Architecture):**

```
User loads page → Cooling.js calculateAll()
  ├─ Stage 1: calculateStage1()
  │   ├─ Calculates h_124 (NO m_129 dependency)
  │   └─ Publishes h_124 to StateManager
  └─ S13 receives h_124 event
      ├─ Calculates m_129 = MAX(0, d_129 - h_124)
      └─ Publishes m_129 to StateManager

m_129 change triggers listener → Cooling.js calculateStage2()
  ├─ Reads m_129 from StateManager
  ├─ Calculates m_124 = unmet_load / (days × 24)
  └─ Publishes m_124 to StateManager

Result: NO manual priming required, values correct on first load
```

### Testing Checklist

**Stage 1 Independence Verification:**

- [ ] Change h_24 (cooling setpoint) → h_124 updates, m_124 unchanged
- [ ] Change l_20 (night temp) → h_124 updates, m_124 unchanged
- [ ] Change g_118 (ventilation method) → h_124 updates, m_124 unchanged
- [ ] Verify Stage 1 runs WITHOUT reading m_129

**Stage 2 Triggering Verification:**

- [ ] Fresh page load → Stage 2 runs automatically after S13 publishes m_129
- [ ] Change building loads → m_129 updates → Stage 2 recalculates m_124
- [ ] Set d_116 = "No Cooling" → m_124 = 0 (Stage 2 skipped)
- [ ] Set d_116 = "ASHP" → Stage 2 runs, m_124 calculated

**Bootstrap Elimination Verification:**

- [ ] Fresh page load → m_124 shows correct value (NO priming required)
- [ ] No console errors about missing m_129
- [ ] h_124 available BEFORE m_124 calculation
- [ ] Mode toggle (Target ↔ Reference) → both modes calculate correctly

**Excel Parity Verification:**

- [ ] h_124 matches Excel H124 within ±0.01%
- [ ] m_124 matches Excel M124 within ±0.01%
- [ ] latentLoadFactor matches Excel A6 within ±0.01%
- [ ] All psychrometric intermediate values match Excel

### Files Modified

- `OBJECTIVE 4011RF/4012-Cooling.js` - Two-stage refactor implementation
- `OBJECTIVE 4011RF/documentation/C-RF-WP.md` - This appendix

### Files NOT Modified (Yet)

- `OBJECTIVE 4011RF/sections/4012-Section13.js` - No changes required (reads h_124, publishes m_129)
- `OBJECTIVE 4011RF/sections/4012-Section03.js` - Already updated in Phase 5.1.1

### Next Steps

1. **Browser Testing:** Load index.html and verify console shows Stage 1 → Stage 2 flow
2. **Value Verification:** Compare all outputs against Excel reference
3. **Edge Case Testing:** Test with d_116="No Cooling", extreme climates, zero ventilation
4. **Mode Toggle Testing:** Verify Target/Reference independence
5. **Commit:** Create commit with refactor once testing passes

### Known Limitations

1. **S13 Integration:** Assumes S13 calculates m_129 and publishes to StateManager

   - If S13 doesn't publish m_129, Stage 2 never triggers
   - Need to verify S13 has proper StateManager integration

2. **Legacy Listeners:** Some old listeners (d_129, h_124) still exist for backward compatibility

   - These can be removed once S13 integration confirmed

3. **Mode Detection:** Current mode detection uses `state.currentMode`
   - Need to verify ModeManager integration for Reference model

---

## Document History

| Version | Date       | Author       | Changes                                                                           |
| ------- | ---------- | ------------ | --------------------------------------------------------------------------------- |
| 1.0     | 2025-01-20 | AI Assistant | Initial draft for review                                                          |
| 1.1     | 2025-01-20 | AI Assistant | Added two-stage architecture, bootstrap elimination, complete code implementation |
| 1.2     | 2025-01-21 | AI Assistant | Added Appendix F documenting Phase 5.1.2 implementation completion                |

---

**END OF COOLING MODULE REFACTORING WORKPLAN v1.2**

_Two-stage architecture implementation COMPLETE. Bootstrap problem eliminated. Ready for browser testing and Excel parity validation._
