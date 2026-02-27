# Field Classification for Mirror Functions

**Date**: 2025-11-27
**Source**: TEUIv4011-DualState-Sherwood_CC.csv export analysis
**Purpose**: Categorize all user-editable fields for three mirror functions

---

## All User-Editable Fields from CSV Export

### Section 01 - Key Values
- `d_12` - Major Occupancy
- `d_13` - Reference Standard ❌ **EXCLUDE from Geometry**
- `d_14` - Actual (Bills) or Targeted (Design) Use
- `d_15` - Carbon Benchmarking Standard
- `h_12` - Reporting Period
- `h_13` - Service Life: yrs.
- `h_14` - Project Name
- `h_15` - Conditioned Area: m² ✅ **GEOMETRY**
- `i_16` - Certifier
- `i_17` - License Number

### Section 04 - Energy Costs
- `l_12` - Electricity Price: $/kWh Avg. ✅ **GEOMETRY** (per user decision)
- `l_13` - Gas Price: $/m³ ✅ **GEOMETRY** (per user decision)
- `l_14` - Propane Price: $/kg ✅ **GEOMETRY** (per user decision)
- `l_15` - Wood Price: $/m³ ✅ **GEOMETRY** (per user decision)
- `l_16` - Oil Price: $/litre ✅ **GEOMETRY** (per user decision)

### Section 03 - Climate
- `d_19` - Province ✅ **GEOMETRY**
- `h_19` - City ✅ **GEOMETRY**
- `h_20` - Current or Future Weather Values ✅ **GEOMETRY**
- `h_21` - Capacitance Method ✅ **GEOMETRY**
- `i_21` - Capacitance Factor % ✅ **GEOMETRY**
- `m_19` - Days Cooling ✅ **GEOMETRY**
- `l_20` - Summer Night (Seasonal Mean) °C ✅ **GEOMETRY**
- `l_21` - Summer Mean RH% ✅ **GEOMETRY**
- `l_24` - Cooling Override ✅ **GEOMETRY**

### Section 04 - Actual Energy Use (Bills)
- `d_27` - Actual Total Electricity Use: kWh/yr ✅ **GEOMETRY**
- `d_28` - Actual Total Fossil Gas Use: m³/yr ✅ **GEOMETRY**
- `d_29` - Actual Total Propane Use: kg/yr ✅ **GEOMETRY**
- `d_30` - Actual Total Oil Use: litres/yr ✅ **GEOMETRY**
- `d_31` - Actual Total Wood Use: m³/yr ✅ **GEOMETRY**
- `l_28` - Actual Total Fossil Gas Use: m³/yr ✅ **GEOMETRY**
- `l_29` - Actual Total Propane Use: kg/yr ✅ **GEOMETRY**
- `l_30` - Actual Total Oil Use: litres/yr ✅ **GEOMETRY**
- `l_31` - Actual Total Wood Use: m³/yr ✅ **GEOMETRY**
- `h_35` - PER Factor ✅ **GEOMETRY**

### Section 05 - Embodied Carbon
- `d_39` - Typology Selection ✅ **GEOMETRY**
- `i_41` - User Modelled Embodied Carbon (A1-3): kgCO2e/m² ✅ **GEOMETRY**

### Section 06 - Renewable Energy
- `d_44` - Photovoltaics: kWh/yr ✅ **GEOMETRY**
- `d_45` - Wind Energy: kWh/yr ✅ **GEOMETRY**
- `d_46` - Remove EV Charging from TEUI: kWh/yr ✅ **GEOMETRY**
- `i_44` - WWS Electricity (Offsite REC): kWh/yr ✅ **GEOMETRY**
- `k_45` - Green Natural Gas: m³ ✅ **GEOMETRY**
- `i_46` - Reserved Removals (Special Cases): kWh/yr ✅ **GEOMETRY**
- `m_43` - Exterior/Site/Other Loads: kWh/yr ✅ **GEOMETRY**

### Section 07 - Water Use
- `d_49` - Water Use Method ✅ **GEOMETRY**
- `e_49` - User Defined Water Use: l/pp/day ✅ **GEOMETRY**
- `e_50` - Engineer Defined SHW/DHW Energy: kWh/yr ✅ **GEOMETRY**
- `d_51` - DHW/SHW Energy Source ❌ **PERFORMANCE**
- `d_52` - DHW/SHW Efficiency Factor: % ❌ **PERFORMANCE**
- `d_53` - DWHR Efficiency: % ❌ **PERFORMANCE**
- `k_52` - AFUE (Gas/Oil Efficiency) ❌ **PERFORMANCE**

### Section 08 - Indoor Air Quality
- `d_56` - Radon Target: Bq/m³ ✅ **GEOMETRY**
- `d_57` - CO2 Target: ppm ✅ **GEOMETRY**
- `d_58` - TVOC Target: ppm ✅ **GEOMETRY**
- `d_59` - RH Heating Season Target: % ✅ **GEOMETRY**
- `i_59` - RH Cooling Season Target: % ✅ **GEOMETRY**

### Section 09 - Occupant + Internal Gains
- `d_63` - Occupant Count ✅ **GEOMETRY** (per user decision)
- `g_63` - Occupied Hours/Day ✅ **GEOMETRY** (per user decision)
- `d_64` - Occupant Activity Level ✅ **GEOMETRY**
- `d_66` - Lighting Density: W/m² ❌ **PERFORMANCE**
- `d_68` - Elevator Status ✅ **GEOMETRY**
- `g_67` - Equipment Efficiency Spec ❌ **PERFORMANCE**

### Section 10 - Radiant Gains (Window/Door Areas)
#### Areas ✅ **GEOMETRY**
- `d_73` - S10: Doors Area: m²
- `d_74` - S10: Window Area North: m²
- `d_75` - S10: Window Area East: m²
- `d_76` - S10: Window Area South: m²
- `d_77` - S10: Window Area West: m²
- `d_78` - S10: Skylights: m²

#### Orientations ✅ **GEOMETRY**
- `e_73` - Doors: Orientation
- `e_74` - Window North: Orientation
- `e_75` - Window East: Orientation
- `e_76` - Window South: Orientation
- `e_77` - Window West: Orientation
- `e_78` - Skylight: Orientation

#### Performance ❌ **PERFORMANCE**
- `f_73` - Door: SHGC
- `f_74` - Window North: SHGC
- `f_75` - Window East: SHGC
- `f_76` - Window South: SHGC
- `f_77` - Window West: SHGC
- `f_78` - Skylight: SHGC

#### Shading ✅ **GEOMETRY** (building context)
- `g_73` - Door: Winter Shading %
- `g_74` - Window North: Winter Shading %
- `g_75` - Window East: Winter Shading %
- `g_76` - Window South: Winter Shading %
- `g_77` - Window West: Winter Shading %
- `g_78` - Skylights: Winter Shading %
- `h_73` - Doors: Summer Shading %
- `h_74` - Window North: Summer Shading %
- `h_75` - Window East: Summer Shading %
- `h_76` - Window South: Summer Shading %
- `h_77` - Window West: Summer Shading %
- `h_78` - Skylights: Summer Shading %

#### Utilization ❌ **PERFORMANCE** (could argue either way, but ReferenceValues sets this)
- `d_80` - Gains Utilization Factor (n-Factor)

### Section 11 - Transmission Losses (Opaque Surfaces)
#### Areas ✅ **GEOMETRY**
- `d_85` - Roof: Area m²
- `d_86` - Walls Above Grade: Area m²
- `d_87` - Floor Exposed: Area m²
- `d_94` - Walls Below Grade: Area m²
- `d_95` - Floor Slab: Area m²
- `d_96` - Interior Floors: Area m²

#### Performance (RSI Values) ❌ **PERFORMANCE**
- `f_85` - Roof: RSI Value K·m²/W
- `f_86` - Walls Above Grade: RSI Value K·m²/W
- `f_87` - Floor Exposed: RSI Value K·m²/W
- `f_94` - Walls Below Grade: RSI Value K·m²/W
- `f_95` - Floor Slab: RSI Value K·m²/W

#### Performance (U-Values) ❌ **PERFORMANCE**
- `g_88` - Doors: U-Value W/m²·K
- `g_89` - Window Area North: U-Value W/m²·K
- `g_90` - Window Area East: U-Value W/m²·K
- `g_91` - Window Area South: U-Value W/m²·K
- `g_92` - Window Area West: U-Value W/m²·K
- `g_93` - Skylights: U-Value W/m²·K

#### Thermal Bridging ❌ **PERFORMANCE**
- `d_97` - Thermal Bridge Penalty: Factor %

### Section 12 - Volume and Surface Metrics
#### Volumes ✅ **GEOMETRY**
- `d_103` - Heating Natural Air Leakage Heatloss
- `g_103` - Heating Natural Air Leakage Heatloss
- `d_105` - Total Conditioned Volume

### Section 13 - Mechanical Loads
#### Air Tightness Method ✅ **GEOMETRY** (building physical property)
- `d_108` - NRL₅₀ Target Method
- `g_109` - ACH₅₀ Target (Converts B.18.1)

#### Equipment Types ❌ **PERFORMANCE**
- `d_113` - Primary Heating System
- `d_116` - Heatpump or Dedicated Cooling System

#### Equipment Performance ❌ **PERFORMANCE**
- `f_113` - Primary Heating System HSP or HSPF2
- `j_115` - AFUE (Annual Fuel Utilization Efficiency)
- `j_116` - COP Cool (Dedicated Cooling System)

#### Ventilation System ❌ **PERFORMANCE**
- `d_118` - HRV/ERV/MVHR Sensible Recovery Efficiency (SRE): %
- `g_118` - Ventilation Method (Volume or Occupant Based)
- `l_118` - ACH (Air Changes per Hour) for Volume-Based Ventilation
- `d_119` - Per Person Ventilation Rate: l/s per person
- `l_119` - Summer Boost Multiplier
- `k_120` - Unnoccupied Ventilation Setback (%)

### Section 14/15 - Other
- `d_142` - Cost Premium of HP Equipment: $ ✅ **GEOMETRY** (financial context)

---

## Field Classification Summary

### Category 1: GEOMETRY (Copy in "Geometry" and "Geometry + Code")

**Total: ~120 fields**

**Pattern-based inclusion:**
- All fields with `_12`, `_13` (except `d_13`), `_14`, `_15`, `_16`, `_17`, `_19`, `_20`, `_21` (location, dates, project info)
- All fields with `_27`, `_28`, `_29`, `_30`, `_31`, `_35` (actual energy use, PER)
- All fields with `_39`, `_41`, `_43`, `_44`, `_45`, `_46` (embodied carbon, renewables)
- All fields with `_49`, `_56`, `_57`, `_58`, `_59`, `_63`, `_64`, `_68` (water, IAQ, occupancy)
- All fields with `_73`, `_74`, `_75`, `_76`, `_77`, `_78` if prefix is `d_`, `e_`, `g_`, `h_` (window/door areas, orientations, shading)
- All fields with `_85`, `_86`, `_87`, `_94`, `_95`, `_96` if prefix is `d_` (opaque surface areas)
- All fields with `_103`, `_105`, `_108`, `_109`, `_142` (volumes, airtightness method, costs)

**Explicit exclusions:**
- `d_13` - Building Standard (user sets independently)

### Category 2: PERFORMANCE (Exclude in "Geometry", include in "All Inputs")

**Total: ~40 fields**

**Pattern-based exclusion:**
- All fields with `_51`, `_52`, `_53` (DHW system type, efficiency)
- All fields with `_66`, `_67` (lighting density, equipment efficiency)
- All fields with `_73`, `_74`, `_75`, `_76`, `_77`, `_78` if prefix is `f_` (SHGC values)
- All fields with `_80` (utilization factor)
- All fields with `_85`, `_86`, `_87`, `_94`, `_95` if prefix is `f_` (RSI values)
- All fields with `_88`, `_89`, `_90`, `_91`, `_92`, `_93` (U-values)
- All fields with `_97` (thermal bridging)
- All fields with `_113`, `_115`, `_116`, `_118`, `_119`, `_120` (equipment types and performance)

---

## Implementation Pattern

### Helper Function: `shouldCopyFieldForMode(fieldId, mode)`

```javascript
function shouldCopyFieldForMode(fieldId, mode) {
  // Mode: 'geometry', 'geometry-plus-code', 'all'

  // Explicit exclusions for ALL modes
  if (fieldId === 'd_13') return false; // Building standard

  // Mode: 'all' - copy everything except d_13
  if (mode === 'all') return true;

  // Mode: 'geometry' or 'geometry-plus-code' - exclude performance fields
  // Performance field patterns (Category 2)
  const performancePatterns = [
    /^[a-z]_(51|52|53)$/, // DHW system, efficiency
    /^[a-z]_(66|67)$/,    // Lighting, equipment efficiency
    /^f_(73|74|75|76|77|78)$/, // SHGC values
    /^[a-z]_80$/,         // Utilization factor
    /^f_(85|86|87|94|95)$/, // RSI values
    /^g_(88|89|90|91|92|93)$/, // U-values
    /^[a-z]_97$/,         // Thermal bridging
    /^[a-z]_(113|115|116|118|119|120)$/ // Equipment
  ];

  // Check if field matches any performance pattern
  for (const pattern of performancePatterns) {
    if (pattern.test(fieldId)) {
      return false; // Exclude from geometry modes
    }
  }

  // Default: include in geometry modes
  return true;
}
```

---

## Testing Checklist

After implementation, verify:

1. ✅ **"Geometry" button**:
   - Copies `h_15` (area), `d_74` (window area), `d_85` (roof area)
   - Does NOT copy `f_85` (roof RSI), `d_113` (heating system), `d_13` (standard)

2. ✅ **"Geometry + Code" button**:
   - Copies same as Geometry
   - Then overlays ReferenceValues.js (f_85, f_94, etc.) based on Reference d_13

3. ✅ **"All Inputs" button**:
   - Copies everything including `f_85`, `d_113`, etc.
   - Does NOT copy `d_13` (still excluded)

---

## Total Field Counts

- **User-Editable Fields**: ~160 total
- **Category 1 (Geometry)**: ~120 fields
- **Category 2 (Performance)**: ~40 fields
- **Explicit Exclusions**: 1 field (`d_13`)
