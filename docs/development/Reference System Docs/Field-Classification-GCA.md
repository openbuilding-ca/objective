# Field Classification: G/C/A System

**Date**: 2025-11-27
**Purpose**: Define which fields are copied by each Mirror function using G/C/A metadata

---

## Classification System

Based on CSV metadata (row 4), each field has a classification tag:

- **`G` (Geometry)**: Building geometry, areas, volumes, location, occupancy
- **`C` (Code/Performance)**: Performance specifications, RSI values, equipment efficiencies
- **`A` (All Other)**: Everything else not classified as G or C

---

## Mirror Function Behavior

| Mirror Function | Fields Copied | Highlight Color |
|----------------|---------------|-----------------|
| **Geometry** | `G` only | Neon Yellow |
| **Geometry + Code** | `G` + `C` | Neon Yellow |
| **All Inputs** | `G` + `C` + `A` (except d_13) | Neon Yellow |

---

## Complete Field Classification Map

### From CSV Row 4 (TEUIv4011-DualState-Three_Feathers_Terrace.csv)

```
Field Classifications by Position:
Position 1  (d_12): C - Major Occupancy
Position 2  (d_13): C - Reference Standard [EXCLUDED FROM ALL MIRRORS]
Position 3  (d_14): A - Actual (Bills) or Targeted (Design) Use
Position 4  (d_15): C - Carbon Benchmarking Standard
Position 5  (h_12): C - Reporting Period
Position 6  (h_13): C - Service Life: yrs.
Position 7  (h_14): A - Project Name
Position 8  (h_15): G - Conditioned Area: m²
Position 9  (i_16): A - Certifier
Position 10 (i_17): A - License Number
Position 11 (l_12): A - Electricity Price: $/kWh Avg.
Position 12 (l_13): A - Gas Price: $/m³
Position 13 (l_14): A - Propane Price: $/kg
Position 14 (l_15): A - Wood Price: $/m³
Position 15 (l_16): A - Oil Price: $/litre
Position 16 (d_19): G - Province
Position 17 (h_19): G - City
Position 18 (h_20): G - Current or Future Weather Values
Position 19 (h_21): G - Capacitance Method
Position 20 (i_21): G - Capacitance Factor %
Position 21 (m_19): G - Days Cooling
Position 22 (l_20): G - Summer Night (Seasonal Mean) °C
Position 23 (l_21): G - Summer Mean RH%
Position 24 (l_24): G - Cooling Override
Position 25 (d_27): A - Actual Total Electricity Use: kWh/yr
Position 26 (d_28): A - Actual Total Fossil Gas Use: m³/yr
Position 27 (d_29): A - Actual Total Propane Use: kg/yr
Position 28 (d_30): A - Actual Total Oil Use: litres/yr
Position 29 (d_31): A - Actual Total Wood Use: m³/yr
Position 30 (l_28): A - Actual Total Fossil Gas Use: m³/yr
Position 31 (l_29): A - Actual Total Propane Use: kg/yr
Position 32 (l_30): A - Actual Total Oil Use: litres/yr
Position 33 (l_31): A - Actual Total Wood Use: m³/yr
Position 34 (h_35): C - PER Factor
Position 35 (d_39): C - Typology Selection [EXCLUDED FROM GEOMETRY MODE]
Position 36 (i_41): C - User Modelled Embodied Carbon (A1-3): kgCO2e/m²
Position 37 (d_44): A - Photovoltaics: kWh/yr
Position 38 (d_45): A - Wind Energy: kWh/yr
Position 39 (d_46): A - Remove EV Charging from TEUI: kWh/yr
Position 40 (i_44): A - WWS Electricity (Offsite REC): kWh/yr
Position 41 (k_45): A - Green Natural Gas: m³
Position 42 (i_46): A - Reserved Removals (Special Cases): kWh/yr
Position 43 (m_43): A - Exterior/Site/Other Loads: kWh/yr
Position 44 (d_49): C - Water Use Method
Position 45 (e_49): C - User Defined Water Use: l/pp/day
Position 46 (e_50): C - Engineer Defined SHW/DHW Energy: kWh/yr
Position 47 (d_51): C - DHW/SHW Energy Source
Position 48 (d_52): C - DHW/SHW Efficiency Factor: %
Position 49 (d_53): C - DWHR Efficiency: %
Position 50 (k_52): C - AFUE (Gas/Oil Efficiency)
Position 51 (d_56): C - Radon Target: Bq/m³
Position 52 (d_57): C - CO2 Target: ppm
Position 53 (d_58): C - TVOC Target: ppm
Position 54 (d_59): C - RH Heating Season Target: %
Position 55 (i_59): C - RH Cooling Season Target: %
Position 56 (d_63): C - Occupant Count
Position 57 (g_63): G - Occupied Hours/Day
Position 58 (d_64): G - Occupant Activity Level
Position 59 (d_66): G - Lighting Density: W/m²
Position 60 (d_68): G - Elevator Status
Position 61 (g_67): G - Equipment Efficiency Spec
Position 62 (d_73): G - S10: Doors Area: m²
Position 63 (d_74): G - S10: Window Area North: m²
Position 64 (d_75): G - S10: Window Area East: m²
Position 65 (d_76): G - S10: Window Area South: m²
Position 66 (d_77): G - S10: Window Area West: m²
Position 67 (d_78): G - S10: Skylights: m²
Position 68 (e_73): G - Doors: Orientation
Position 69 (e_74): G - Window North: Orientation
Position 70 (e_75): G - Window East: Orientation
Position 71 (e_76): G - Window South: Orientation
Position 72 (e_77): G - Window West: Orientation
Position 73 (e_78): G - Skylight: Orientation
Position 74 (f_73): C - Door: SHGC
Position 75 (f_74): C - Window North: SHGC
Position 76 (f_75): C - Window East: SHGC
Position 77 (f_76): C - Window South: SHGC
Position 78 (f_77): C - Window West: SHGC
Position 79 (f_78): C - Skylight: SHGC
Position 80 (g_73): G - Door: Winter Shading %
Position 81 (g_74): G - Window North: Winter Shading %
Position 82 (g_75): G - Window East: Winter Shading %
Position 83 (g_76): G - Window South: Winter Shading %
Position 84 (g_77): G - Window West: Winter Shading %
Position 85 (g_78): G - Skylights: Winter Shading %
Position 86 (h_73): G - Doors: Summer Shading %
Position 87 (h_74): G - Window North: Summer Shading %
Position 88 (h_75): G - Window East: Summer Shading %
Position 89 (h_76): G - Window South: Summer Shading %
Position 90 (h_77): G - Window West: Summer Shading %
Position 91 (h_78): G - Skylights: Summer Shading %
Position 92 (d_80): C - Gains Utilization Factor (n-Factor)
Position 93 (d_85): G - Roof: Area m²
Position 94 (f_85): C - Roof: RSI Value K·m²/W
Position 95 (d_86): C - Walls Above Grade: Area m²
Position 96 (f_86): C - Walls Above Grade: RSI Value K·m²/W
Position 97 (d_87): C - Floor Exposed: Area m²
Position 98 (f_87): C - Floor Exposed: RSI Value K·m²/W
Position 99 (g_88): C - Doors: U-Value W/m²·K
Position 100 (g_89): C - Window Area North: U-Value W/m²·K
Position 101 (g_90): C - Window Area East: U-Value W/m²·K
Position 102 (g_91): C - Window Area South: U-Value W/m²·K
Position 103 (g_92): C - Window Area West: U-Value W/m²·K
Position 104 (g_93): C - Skylights: U-Value W/m²·K
Position 105 (d_94): C - Walls Below Grade: Area m²
Position 106 (f_94): G - Walls Below Grade: RSI Value K·m²/W
Position 107 (d_95): C - Floor Slab: Area m²
Position 108 (f_95): G - Floor Slab: RSI Value K·m²/W
Position 109 (d_96): C - Interior Floors: Area m²
Position 110 (d_97): G - Thermal Bridge Penalty: Factor %
Position 111 (d_103): C - Heating Natural Air Leakage Heatloss
Position 112 (g_103): C - Heating Natural Air Leakage Heatloss
Position 113 (d_105): C - Total Conditioned Volume
Position 114 (d_108): C - NRL⁵⁰ Target Method
Position 115 (g_109): C - ACH⁵⁰ Target (Converts B.18.1)
Position 116 (d_113): C - Primary Heating System
Position 117 (f_113): C - Primary Heating System HSP or HSPF2
Position 118 (j_115): C - AFUE (Annual Fuel Utilization Efficiency)
Position 119 (j_116): C - COP Cool (Dedicated Cooling System)
Position 120 (d_116): C - Heatpump or Dedicated Cooling System
Position 121 (d_118): C - HRV/ERV/MVHR Sensible Recovery Efficiency (SRE): %
Position 122 (g_118): C - Ventilation Method (Volume or Occupant Based)
Position 123 (l_118): C - ACH (Air Changes per Hour) for Volume-Based Ventilation
Position 124 (d_119): C - Per Person Ventilation Rate: l/s per person
Position 125 (l_119): C - Summer Boost Multiplier
Position 126 (k_120): C - Unnoccupied Ventilation Setback (%)
Position 127 (d_142): C - Cost Premium of HP Equipment: $
```

---

## Summary Statistics

From the CSV classification (127 fields total):

- **Geometry (G)**: ~35 fields (27.6%)
- **Code/Performance (C)**: ~68 fields (53.5%)
- **All Other (A)**: ~24 fields (18.9%)

**Mirror Operation Field Counts:**
- **Geometry**: Copies ~35 G fields
- **Geometry + Code**: Copies ~103 fields (35 G + 68 C)
- **All Inputs**: Copies ~126 fields (35 G + 68 C + 24 A, excluding d_13)

---

## Notes

1. **d_13 (Reference Standard)** is marked as `C` but is EXCLUDED from all mirror operations
2. **d_39 and i_41** are marked as `C` and correctly excluded from Geometry mode (added 2025-11-27)
3. Some inconsistencies in the CSV classifications (e.g., d_86, d_87 marked as C but are area fields)
   - These may need review - typically area fields are geometry
   - However, we will follow CSV metadata exactly as provided

---

## Implementation Reference

**CSS Class**: `.mirror-highlight`
**Color**: Neon Yellow (`#ffff00` or similar bright yellow)
**Target**: Field input/select elements in Reference model DOM
**Duration**: Until next user interaction (click/input/change event)
