# Section 11: Transmission Losses - Dependency Mapping

**File**: TEUIv3043.csv
**Rows**: 84-99
**Section**: SECTION 11. Transmission Losses
**Analysis Date**: 2025-11-14

---

## Overview

Section 11 calculates transmission heat losses and gains through the building envelope. It includes individual envelope components (roof, walls, floors, openings) plus a thermal bridge penalty. The section heavily depends on:
- **Section 2 (Climate)**: HDD/CDD values (d_20, d_21, d_22)
- **Section 10 (Solar Gains)**: Window/door areas (d_73-d_78) and solar gains (i_73-i_78)
- **Section 12**: Energy cost (l_12), building volume (d_105)

---

## Row 84: Section Header
**Purpose**: Header row - no calculations

---

## Row 85: Roof

### e_85 (Rimp ft²F•hr/Btu)
- **Formula**: `=F85*5.678`
- **Dependencies**:
  - f_85 (RSI K•m2/W)
- **Type**: Unit conversion (RSI to Rimp)

### f_85 (RSI K•m2/W)
- **Value**: 9.35
- **Type**: User input

### g_85 (U-Value W/m2•K)
- **Formula**: `=1/F85`
- **Dependencies**:
  - f_85 (RSI)
- **Type**: Thermal resistance to U-value conversion

### h_85 (% of Ae & Ag)
- **Formula**: `=D85/D$101`
- **Dependencies**:
  - d_85 (Area)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Type**: Percentage calculation
- **Cross-section**: S12

### i_85 (Heatloss kWh/yr)
- **Formula**: `=D85*(D$20*24)/(F85*1000)`
- **Dependencies**:
  - d_85 (Area m2)
  - d_20 (HDD) - **S02**
  - f_85 (RSI)
- **Type**: Annual heating transmission loss
- **Cross-section**: S02

### j_85 (Heatloss %)
- **Formula**: `=I85/I$98`
- **Dependencies**:
  - i_85 (Heatloss kWh/yr)
  - i_98 (Envelope Totals Heatloss) - **S11 Row 98**
- **Type**: Percentage of total

### k_85 (Heatgain kWh/Cool Season)
- **Formula**: `=D85*(D$21*24)/(F85*1000)`
- **Dependencies**:
  - d_85 (Area m2)
  - d_21 (CDD) - **S02**
  - f_85 (RSI)
- **Type**: Annual cooling transmission gain
- **Cross-section**: S02

### l_85 (Heatgain %)
- **Formula**: `=-K85/K$98`
- **Dependencies**:
  - k_85 (Heatgain kWh)
  - k_98 (Envelope Totals Heatgain) - **S11 Row 98**
- **Type**: Percentage of total (negative)

### m_85 (Reference)
- **Formula**: `=F85/T85`
- **Dependencies**:
  - f_85 (RSI actual)
  - t_85 (RSI reference standard)
- **Type**: Ratio to reference standard

### p_85 (Heating Costs Net $/yr)
- **Formula**: `=I85*L$12`
- **Dependencies**:
  - i_85 (Heatloss kWh/yr)
  - l_12 (Energy cost $/kWh) - **S02**
- **Type**: Annual heating cost
- **Cross-section**: S02

### q_85 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D85 > 0, G85 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G85 * D85 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_85 (Area m2)
  - g_85 (U-Value)
  - d_105 (Building Volume m3) - **S12**
  - h_23 (Tset Heating) - **S02**
  - l_23 (Survival Temp) - **S02**
  - d_23 (Coldest Days) - **S02**
- **Type**: Thermal resilience metric
- **Cross-section**: S02, S12

### r_85 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q85), ISNUMBER(Q$98), Q85>0, Q$98>0), Q85/Q$98, "")`
- **Dependencies**:
  - q_85 (Phase Lag Hours)
  - q_98 (Average Phase Lag) - **S11 Row 98**
- **Type**: Percentage of average

---

## Row 86: Walls Above Grade (Exclude Openings!)

### e_86 (Rimp ft²F•hr/Btu)
- **Formula**: `=F86*5.678`
- **Dependencies**:
  - f_86 (RSI)

### f_86 (RSI K•m2/W)
- **Value**: 6.69
- **Type**: User input

### g_86 (U-Value W/m2•K)
- **Formula**: `=1/F86`
- **Dependencies**:
  - f_86 (RSI)

### h_86 (% of Ae & Ag)
- **Formula**: `=D86/D$101`
- **Dependencies**:
  - d_86 (Area)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S12

### i_86 (Heatloss kWh/yr)
- **Formula**: `=D86*(D$20*24)/(F86*1000)`
- **Dependencies**:
  - d_86 (Area m2)
  - d_20 (HDD) - **S02**
  - f_86 (RSI)
- **Cross-section**: S02

### j_86 (Heatloss %)
- **Formula**: `=I86/I$98`
- **Dependencies**:
  - i_86 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_86 (Heatgain kWh/Cool Season)
- **Formula**: `=D86*(D$21*24)/(F86*1000)`
- **Dependencies**:
  - d_86 (Area m2)
  - d_21 (CDD) - **S02**
  - f_86 (RSI)
- **Cross-section**: S02

### l_86 (Heatgain %)
- **Formula**: `=-K86/K$98`
- **Dependencies**:
  - k_86 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_86 (Reference)
- **Formula**: `=F86/T86`
- **Dependencies**:
  - f_86 (RSI actual)
  - t_86 (RSI reference)

### p_86 (Heating Costs Net $/yr)
- **Formula**: `=I86*L$12`
- **Dependencies**:
  - i_86 (Heatloss kWh/yr)
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02

### q_86 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D86 > 0, G86 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G86 * D86 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_86, g_86, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S12

### r_86 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q86), ISNUMBER(Q$98), Q86>0, Q$98>0), Q86/Q$98, "")`
- **Dependencies**:
  - q_86, q_98 - **S11 Row 98**

---

## Row 87: Floor Exposed

### e_87 (Rimp ft²F•hr/Btu)
- **Formula**: `=F87*5.678`
- **Dependencies**:
  - f_87 (RSI)

### f_87 (RSI K•m2/W)
- **Value**: 9.52
- **Type**: User input

### g_87 (U-Value W/m2•K)
- **Formula**: `=1/F87`
- **Dependencies**:
  - f_87 (RSI)

### h_87 (% of Ae & Ag)
- **Formula**: `=D87/D$101`
- **Dependencies**:
  - d_87 (Area)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S12

### i_87 (Heatloss kWh/yr)
- **Formula**: `=D87*(D$20*24)/(F87*1000)`
- **Dependencies**:
  - d_87 (Area m2)
  - d_20 (HDD) - **S02**
  - f_87 (RSI)
- **Cross-section**: S02

### j_87 (Heatloss %)
- **Formula**: `=I87/I$98`
- **Dependencies**:
  - i_87 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_87 (Heatgain kWh/Cool Season)
- **Formula**: `=D87*(D$21*24)/(F87*1000)`
- **Dependencies**:
  - d_87 (Area m2)
  - d_21 (CDD) - **S02**
  - f_87 (RSI)
- **Cross-section**: S02

### l_87 (Heatgain %)
- **Formula**: `=-K87/K$98`
- **Dependencies**:
  - k_87 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_87 (Reference)
- **Formula**: `=F87/T87`
- **Dependencies**:
  - f_87 (RSI actual)
  - t_87 (RSI reference)

### p_87 (Heating Costs Net $/yr)
- **Formula**: `=I87*L$12`
- **Dependencies**:
  - i_87 (Heatloss kWh/yr)
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02

### q_87 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D87 > 0, G87 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G87 * D87 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_87, g_87, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S12

### r_87 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q87), ISNUMBER(Q$98), Q87>0, Q$98>0), Q87/Q$98, "")`
- **Dependencies**:
  - q_87, q_98 - **S11 Row 98**

---

## Row 88: Doors (B.7.0)

### d_88 (Areas m2)
- **Formula**: `=D73`
- **Dependencies**:
  - d_73 (Door area from S10) - **S10**
- **Type**: Reference to S10
- **Cross-section**: S10

### e_88 (Rimp ft²F•hr/Btu)
- **Formula**: `=F88*5.678`
- **Dependencies**:
  - f_88 (RSI)

### f_88 (RSI K•m2/W)
- **Formula**: `=1/G88`
- **Dependencies**:
  - g_88 (U-Value)
- **Type**: U-value to RSI conversion

### g_88 (U-Value W/m2•K)
- **Value**: 0.9
- **Type**: User input

### h_88 (% of Ae & Ag)
- **Formula**: `=D88/D$101`
- **Dependencies**:
  - d_88 (Area = d_73 from S10)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S10, S12

### i_88 (Heatloss kWh/yr)
- **Formula**: `=D88*(D$20*24)/(F88*1000)`
- **Dependencies**:
  - d_88 (Area = d_73 from S10)
  - d_20 (HDD) - **S02**
  - f_88 (RSI)
- **Cross-section**: S02, S10

### j_88 (Heatloss %)
- **Formula**: `=I88/I$98`
- **Dependencies**:
  - i_88 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_88 (Heatgain kWh/Cool Season)
- **Formula**: `=D88*(D$21*24)/(F88*1000)`
- **Dependencies**:
  - d_88 (Area = d_73 from S10)
  - d_21 (CDD) - **S02**
  - f_88 (RSI)
- **Cross-section**: S02, S10

### l_88 (Heatgain %)
- **Formula**: `=-K88/K$98`
- **Dependencies**:
  - k_88 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_88 (Reference)
- **Formula**: `=T88/G88`
- **Dependencies**:
  - t_88 (Reference U-value)
  - g_88 (Actual U-value)

### p_88 (Heating Costs Net $/yr)
- **Formula**: `=(I88-I73)*L$12`
- **Dependencies**:
  - i_88 (Door transmission loss)
  - i_73 (Door solar gain from S10) - **S10**
  - l_12 (Energy cost) - **S02**
- **Type**: Net cost (transmission loss minus solar gain)
- **Cross-section**: S02, S10

### q_88 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D88 > 0, G88 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G88 * D88 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_88 (= d_73 from S10), g_88, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S10, S12

### r_88 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q88), ISNUMBER(Q$98), Q88>0, Q$98>0), Q88/Q$98, "")`
- **Dependencies**:
  - q_88, q_98 - **S11 Row 98**

---

## Row 89: Window Area North (B.8.1)

### d_89 (Areas m2)
- **Formula**: `=D74`
- **Dependencies**:
  - d_74 (North window area from S10) - **S10**
- **Cross-section**: S10

### e_89 (Rimp ft²F•hr/Btu)
- **Formula**: `=F89*5.678`
- **Dependencies**:
  - f_89 (RSI)

### f_89 (RSI K•m2/W)
- **Formula**: `=1/G89`
- **Dependencies**:
  - g_89 (U-Value)

### g_89 (U-Value W/m2•K)
- **Value**: 0.9
- **Type**: User input

### h_89 (% of Ae & Ag)
- **Formula**: `=D89/D$101`
- **Dependencies**:
  - d_89 (= d_74 from S10)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S10, S12

### i_89 (Heatloss kWh/yr)
- **Formula**: `=D89*(D$20*24)/(F89*1000)`
- **Dependencies**:
  - d_89 (= d_74 from S10)
  - d_20 (HDD) - **S02**
  - f_89 (RSI)
- **Cross-section**: S02, S10

### j_89 (Heatloss %)
- **Formula**: `=I89/I$98`
- **Dependencies**:
  - i_89 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_89 (Heatgain kWh/Cool Season)
- **Formula**: `=D89*(D$21*24)/(F89*1000)`
- **Dependencies**:
  - d_89 (= d_74 from S10)
  - d_21 (CDD) - **S02**
  - f_89 (RSI)
- **Cross-section**: S02, S10

### l_89 (Heatgain %)
- **Formula**: `=-K89/K$98`
- **Dependencies**:
  - k_89 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_89 (Reference)
- **Formula**: `=T89/G89`
- **Dependencies**:
  - t_89 (Reference U-value)
  - g_89 (Actual U-value)

### p_89 (Heating Costs Net $/yr)
- **Formula**: `=(I89-I74)*L$12`
- **Dependencies**:
  - i_89 (Window transmission loss)
  - i_74 (North window solar gain from S10) - **S10**
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02, S10

### q_89 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D89 > 0, G89 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G89 * D89 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_89 (= d_74 from S10), g_89, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S10, S12

### r_89 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q89), ISNUMBER(Q$98), Q89>0, Q$98>0), Q89/Q$98, "")`
- **Dependencies**:
  - q_89, q_98 - **S11 Row 98**

---

## Row 90: Window Area East (B.8.2)

### d_90 (Areas m2)
- **Formula**: `=D75`
- **Dependencies**:
  - d_75 (East window area from S10) - **S10**
- **Cross-section**: S10

### e_90 (Rimp ft²F•hr/Btu)
- **Formula**: `=F90*5.678`
- **Dependencies**:
  - f_90 (RSI)

### f_90 (RSI K•m2/W)
- **Formula**: `=1/G90`
- **Dependencies**:
  - g_90 (U-Value)

### g_90 (U-Value W/m2•K)
- **Value**: 0.9
- **Type**: User input

### h_90 (% of Ae & Ag)
- **Formula**: `=D90/D$101`
- **Dependencies**:
  - d_90 (= d_75 from S10)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S10, S12

### i_90 (Heatloss kWh/yr)
- **Formula**: `=D90*(D$20*24)/(F90*1000)`
- **Dependencies**:
  - d_90 (= d_75 from S10)
  - d_20 (HDD) - **S02**
  - f_90 (RSI)
- **Cross-section**: S02, S10

### j_90 (Heatloss %)
- **Formula**: `=I90/I$98`
- **Dependencies**:
  - i_90 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_90 (Heatgain kWh/Cool Season)
- **Formula**: `=D90*(D$21*24)/(F90*1000)`
- **Dependencies**:
  - d_90 (= d_75 from S10)
  - d_21 (CDD) - **S02**
  - f_90 (RSI)
- **Cross-section**: S02, S10

### l_90 (Heatgain %)
- **Formula**: `=-K90/K$98`
- **Dependencies**:
  - k_90 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_90 (Reference)
- **Formula**: `=T90/G90`
- **Dependencies**:
  - t_90 (Reference U-value)
  - g_90 (Actual U-value)

### p_90 (Heating Costs Net $/yr)
- **Formula**: `=(I90-I75)*L$12`
- **Dependencies**:
  - i_90 (Window transmission loss)
  - i_75 (East window solar gain from S10) - **S10**
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02, S10

### q_90 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D90 > 0, G90 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G90 * D90 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_90 (= d_75 from S10), g_90, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S10, S12

### r_90 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q90), ISNUMBER(Q$98), Q90>0, Q$98>0), Q90/Q$98, "")`
- **Dependencies**:
  - q_90, q_98 - **S11 Row 98**

---

## Row 91: Window Area South (B.8.3)

### d_91 (Areas m2)
- **Formula**: `=D76`
- **Dependencies**:
  - d_76 (South window area from S10) - **S10**
- **Cross-section**: S10

### e_91 (Rimp ft²F•hr/Btu)
- **Formula**: `=F91*5.678`
- **Dependencies**:
  - f_91 (RSI)

### f_91 (RSI K•m2/W)
- **Formula**: `=1/G91`
- **Dependencies**:
  - g_91 (U-Value)

### g_91 (U-Value W/m2•K)
- **Value**: 0.9
- **Type**: User input

### h_91 (% of Ae & Ag)
- **Formula**: `=D91/D$101`
- **Dependencies**:
  - d_91 (= d_76 from S10)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S10, S12

### i_91 (Heatloss kWh/yr)
- **Formula**: `=D91*(D$20*24)/(F91*1000)`
- **Dependencies**:
  - d_91 (= d_76 from S10)
  - d_20 (HDD) - **S02**
  - f_91 (RSI)
- **Cross-section**: S02, S10

### j_91 (Heatloss %)
- **Formula**: `=I91/I$98`
- **Dependencies**:
  - i_91 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_91 (Heatgain kWh/Cool Season)
- **Formula**: `=D91*(D$21*24)/(F91*1000)`
- **Dependencies**:
  - d_91 (= d_76 from S10)
  - d_21 (CDD) - **S02**
  - f_91 (RSI)
- **Cross-section**: S02, S10

### l_91 (Heatgain %)
- **Formula**: `=-K91/K$98`
- **Dependencies**:
  - k_91 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_91 (Reference)
- **Formula**: `=T91/G91`
- **Dependencies**:
  - t_91 (Reference U-value)
  - g_91 (Actual U-value)

### p_91 (Heating Costs Net $/yr)
- **Formula**: `=(I91-I76)*L$12`
- **Dependencies**:
  - i_91 (Window transmission loss)
  - i_76 (South window solar gain from S10) - **S10**
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02, S10

### q_91 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D91 > 0, G91 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G91 * D91 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_91 (= d_76 from S10), g_91, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S10, S12

### r_91 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q91), ISNUMBER(Q$98), Q91>0, Q$98>0), Q91/Q$98, "")`
- **Dependencies**:
  - q_91, q_98 - **S11 Row 98**

---

## Row 92: Window Area West (B.8.4)

### d_92 (Areas m2)
- **Formula**: `=D77`
- **Dependencies**:
  - d_77 (West window area from S10) - **S10**
- **Cross-section**: S10

### e_92 (Rimp ft²F•hr/Btu)
- **Formula**: `=F92*5.678`
- **Dependencies**:
  - f_92 (RSI)

### f_92 (RSI K•m2/W)
- **Formula**: `=1/G92`
- **Dependencies**:
  - g_92 (U-Value)

### g_92 (U-Value W/m2•K)
- **Value**: 0.9
- **Type**: User input

### h_92 (% of Ae & Ag)
- **Formula**: `=D92/D$101`
- **Dependencies**:
  - d_92 (= d_77 from S10)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S10, S12

### i_92 (Heatloss kWh/yr)
- **Formula**: `=D92*(D$20*24)/(F92*1000)`
- **Dependencies**:
  - d_92 (= d_77 from S10)
  - d_20 (HDD) - **S02**
  - f_92 (RSI)
- **Cross-section**: S02, S10

### j_92 (Heatloss %)
- **Formula**: `=I92/I$98`
- **Dependencies**:
  - i_92 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_92 (Heatgain kWh/Cool Season)
- **Formula**: `=D92*(D$21*24)/(F92*1000)`
- **Dependencies**:
  - d_92 (= d_77 from S10)
  - d_21 (CDD) - **S02**
  - f_92 (RSI)
- **Cross-section**: S02, S10

### l_92 (Heatgain %)
- **Formula**: `=-K92/K$98`
- **Dependencies**:
  - k_92 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_92 (Reference)
- **Formula**: `=T92/G92`
- **Dependencies**:
  - t_92 (Reference U-value)
  - g_92 (Actual U-value)

### p_92 (Heating Costs Net $/yr)
- **Formula**: `=(I92-I77)*L$12`
- **Dependencies**:
  - i_92 (Window transmission loss)
  - i_77 (West window solar gain from S10) - **S10**
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02, S10

### q_92 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D92 > 0, G92 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G92 * D92 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_92 (= d_77 from S10), g_92, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S10, S12

### r_92 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q92), ISNUMBER(Q$98), Q92>0, Q$98>0), Q92/Q$98, "")`
- **Dependencies**:
  - q_92, q_98 - **S11 Row 98**

---

## Row 93: Skylights (B.8.5)

### d_93 (Areas m2)
- **Formula**: `=D78`
- **Dependencies**:
  - d_78 (Skylight area from S10) - **S10**
- **Cross-section**: S10

### e_93 (Rimp ft²F•hr/Btu)
- **Formula**: `=F93*5.678`
- **Dependencies**:
  - f_93 (RSI)

### f_93 (RSI K•m2/W)
- **Formula**: `=1/G93`
- **Dependencies**:
  - g_93 (U-Value)

### g_93 (U-Value W/m2•K)
- **Value**: 0.9
- **Type**: User input

### h_93 (% of Ae & Ag)
- **Formula**: `=D93/D$101`
- **Dependencies**:
  - d_93 (= d_78 from S10)
  - d_101 (Total Area Exposed to Air) - **S12**
- **Cross-section**: S10, S12

### i_93 (Heatloss kWh/yr)
- **Formula**: `=D93*(D$20*24)/(F93*1000)`
- **Dependencies**:
  - d_93 (= d_78 from S10)
  - d_20 (HDD) - **S02**
  - f_93 (RSI)
- **Cross-section**: S02, S10

### j_93 (Heatloss %)
- **Formula**: `=I93/I$98`
- **Dependencies**:
  - i_93 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_93 (Heatgain kWh/Cool Season)
- **Formula**: `=D93*(D$21*24)/(F93*1000)`
- **Dependencies**:
  - d_93 (= d_78 from S10)
  - d_21 (CDD) - **S02**
  - f_93 (RSI)
- **Cross-section**: S02, S10

### l_93 (Heatgain %)
- **Formula**: `=-K93/K$98`
- **Dependencies**:
  - k_93 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_93 (Reference)
- **Formula**: `=T93/G93`
- **Dependencies**:
  - t_93 (Reference U-value)
  - g_93 (Actual U-value)

### p_93 (Heating Costs Net $/yr)
- **Formula**: `=(I93-I78)*L$12`
- **Dependencies**:
  - i_93 (Skylight transmission loss)
  - i_78 (Skylight solar gain from S10) - **S10**
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02, S10

### q_93 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D93 > 0, G93 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G93 * D93 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_93 (= d_78 from S10), g_93, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S10, S12

### r_93 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q93), ISNUMBER(Q$98), Q93>0, Q$98>0), Q93/Q$98, "")`
- **Dependencies**:
  - q_93, q_98 - **S11 Row 98**

---

## Row 94: Walls Below Grade (B.9)

### e_94 (Rimp ft²F•hr/Btu)
- **Formula**: `=F94*5.678`
- **Dependencies**:
  - f_94 (RSI)

### f_94 (RSI K•m2/W)
- **Value**: 4
- **Type**: User input

### g_94 (U-Value W/m2•K)
- **Formula**: `=1/F94`
- **Dependencies**:
  - f_94 (RSI)

### h_94 (% of Ae & Ag)
- **Formula**: `=D94/D$102`
- **Dependencies**:
  - d_94 (Area)
  - d_102 (Total Area Exposed to Ground) - **S12**
- **Type**: Percentage of ground-facing area
- **Cross-section**: S12

### i_94 (Heatloss kWh/yr)
- **Formula**: `=D94*(D$22*24)/(F94*1000)`
- **Dependencies**:
  - d_94 (Area m2)
  - d_22 (Ground Facing GF HDD) - **S02**
  - f_94 (RSI)
- **Type**: Uses ground-facing HDD (not standard HDD)
- **Cross-section**: S02

### j_94 (Heatloss %)
- **Formula**: `=I94/I$98`
- **Dependencies**:
  - i_94 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_94 (Heatgain kWh/Cool Season)
- **Formula**: `=I$21*D94*H$22*24/(F94*1000)`
- **Dependencies**:
  - i_21 (GF CDD factor) - **S02**
  - d_94 (Area m2)
  - h_22 (GF CDD value) - **S02**
  - f_94 (RSI)
- **Type**: Ground-facing cooling calculation
- **Cross-section**: S02

### l_94 (Heatgain %)
- **Formula**: `=-K94/K$98`
- **Dependencies**:
  - k_94 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_94 (Reference)
- **Formula**: `=F94/T94`
- **Dependencies**:
  - f_94 (RSI actual)
  - t_94 (RSI reference)

### p_94 (Heating Costs Net $/yr)
- **Formula**: `=I94*L$12`
- **Dependencies**:
  - i_94 (Heatloss kWh/yr)
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02

### q_94 (Thermal Phase Lag Hours)
- **Formula**: `=IF(AND(D94 > 0, G94 > 0), (1.2 * D$105 * 1005 * (H$23 - L$23)) / (G94 * D94 * (H$23 - D$23)) / 3600, "")`
- **Dependencies**:
  - d_94, g_94, d_105 - **S12**, h_23, l_23, d_23 - **S02**
- **Cross-section**: S02, S12

### r_94 (Phase Lag Averages %)
- **Formula**: `=IF(AND(ISNUMBER(Q94), ISNUMBER(Q$98), Q94>0, Q$98>0), Q94/Q$98, "")`
- **Dependencies**:
  - q_94, q_98 - **S11 Row 98**

---

## Row 95: Floor Slab (B.10)

### e_95 (Rimp ft²F•hr/Btu)
- **Formula**: `=F95*5.678`
- **Dependencies**:
  - f_95 (RSI)

### f_95 (RSI K•m2/W)
- **Value**: 3.7
- **Type**: User input

### g_95 (U-Value W/m2•K)
- **Formula**: `=1/F95`
- **Dependencies**:
  - f_95 (RSI)

### h_95 (% of Ae & Ag)
- **Formula**: `=D95/D$102`
- **Dependencies**:
  - d_95 (Area)
  - d_102 (Total Area Exposed to Ground) - **S12**
- **Cross-section**: S12

### i_95 (Heatloss kWh/yr)
- **Formula**: `=D95*(D$22*24)/(F95*1000)`
- **Dependencies**:
  - d_95 (Area m2)
  - d_22 (Ground Facing GF HDD) - **S02**
  - f_95 (RSI)
- **Cross-section**: S02

### j_95 (Heatloss %)
- **Formula**: `=I95/I$98`
- **Dependencies**:
  - i_95 (Heatloss kWh/yr)
  - i_98 (Envelope Totals) - **S11 Row 98**

### k_95 (Heatgain kWh/Cool Season)
- **Formula**: `=I$21*D95*H$22*24/(F95*1000)`
- **Dependencies**:
  - i_21 (GF CDD factor) - **S02**
  - d_95 (Area m2)
  - h_22 (GF CDD value) - **S02**
  - f_95 (RSI)
- **Cross-section**: S02

### l_95 (Heatgain %)
- **Formula**: `=-K95/K$98`
- **Dependencies**:
  - k_95 (Heatgain kWh)
  - k_98 (Envelope Totals) - **S11 Row 98**

### m_95 (Reference)
- **Formula**: `=F95/T95`
- **Dependencies**:
  - f_95 (RSI actual)
  - t_95 (RSI reference)

### p_95 (Heating Costs Net $/yr)
- **Formula**: `=I95*L$12`
- **Dependencies**:
  - i_95 (Heatloss kWh/yr)
  - l_12 (Energy cost) - **S02**
- **Cross-section**: S02

### q_95 (Thermal Phase Lag Hours)
- **Value**: "-" (literal value, slab excluded)
- **Type**: Not calculated for slabs

### r_95 (Phase Lag Averages %)
- **Value**: "slab excl. as not facing air" (literal text)
- **Type**: Excluded from calculation

---

## Row 96: Interior Floors (B.11)

**Note**: This row does not form part of heatloss and cooling calculations but will be used in embodied carbon calculations.

No calculated fields for transmission losses.

---

## Row 97: Thermal Bridge Penalty (B.12)

### d_97 (Penalty Factor)
- **Value**: 0.2 (20%)
- **Type**: User input
- **Range**: 5-70%
- **Note**: PH = 5%, Conventional = 50%

### i_97 (Heatloss kWh/yr)
- **Formula**: `=I98*D97`
- **Dependencies**:
  - i_98 (Envelope Totals before penalty) - **S11 Row 98**
  - d_97 (Penalty factor)
- **Type**: Thermal bridge penalty on heating

### j_97 (Heatloss %)
- **Formula**: `=I97/I$98`
- **Dependencies**:
  - i_97 (Penalty heatloss)
  - i_98 (Total with penalty) - **S11 Row 98**
- **Type**: Percentage of total

### k_97 (Heatgain kWh/Cool Season)
- **Formula**: `=IF(H21="Static", 0, K98*D97)`
- **Dependencies**:
  - h_21 (Current or Future Values) - **S02**
  - k_98 (Envelope Totals before penalty) - **S11 Row 98**
  - d_97 (Penalty factor)
- **Type**: Conditional - only applies if not static climate
- **Cross-section**: S02

### l_97 (Heatgain %)
- **Formula**: `=-K97/K$98`
- **Dependencies**:
  - k_97 (Penalty heatgain)
  - k_98 (Total with penalty) - **S11 Row 98**

### p_97 (Heating Costs Net $/yr)
- **Formula**: `=(I97*L$12)+(K97*L$12)`
- **Dependencies**:
  - i_97 (Penalty heatloss)
  - k_97 (Penalty heatgain)
  - l_12 (Energy cost) - **S02**
- **Type**: Combined heating and cooling penalty cost
- **Cross-section**: S02

### q_97 (Thermal Phase Lag Hours)
- **Value**: "-" (literal)
- **Type**: Not applicable to penalty

### r_97 (Phase Lag Averages %)
- **Value**: "-" (literal)
- **Type**: Not applicable to penalty

---

## Row 98: Envelope Totals

### d_98 (Total Areas m2)
- **Formula**: `=SUM(D85:D95)`
- **Dependencies**:
  - d_85 through d_95 (all component areas)
- **Type**: Sum of all envelope areas

### e_98 (Rimp ft²F•hr/Btu)
- **Formula**: `=IF(D94+D95=0, 1/G101*5.678, 1/G102*5.678)`
- **Dependencies**:
  - d_94 (Walls below grade area)
  - d_95 (Floor slab area)
  - g_101 (U-Value for Ae) - **S12**
  - g_102 (U-Value for Ag) - **S12**
- **Type**: Conditional - uses Ae U-value if no ground-facing, else Ag U-value
- **Cross-section**: S12

### h_98 (% of Ae & Ag)
- **Formula**: `=SUM(H85:H93)`
- **Dependencies**:
  - h_85 through h_93 (percentages for air-exposed components)
- **Type**: Sum of air-exposed percentages only (excludes ground-facing)

### i_98 (Heatloss kWh/yr)
- **Formula**: `=SUM(I85:I95)`
- **Dependencies**:
  - i_85 through i_95 (individual component losses)
- **Type**: Total before thermal bridge penalty

### j_98 (Heatloss %)
- **Formula**: `=SUM(J85:J95)`
- **Dependencies**:
  - j_85 through j_95 (individual percentages)
- **Type**: Should equal 100% before penalty

### k_98 (Heatgain kWh/Cool Season)
- **Formula**: `=SUM(K85:K95)`
- **Dependencies**:
  - k_85 through k_95 (individual component gains)
- **Type**: Total before thermal bridge penalty

### l_98 (Heatgain %)
- **Formula**: `=ABS(SUM(L85:L95))`
- **Dependencies**:
  - l_85 through l_95 (individual percentages)
- **Type**: Absolute value of sum

### p_98 (Heating Costs Net $/yr)
- **Formula**: `=SUM(P85:P97)`
- **Dependencies**:
  - p_85 through p_97 (all component costs including penalty)
- **Type**: Total annual heating costs including thermal bridges

### q_98 (Phase Lag Average Hours)
- **Formula**: `=AVERAGE(Q85:Q95)`
- **Dependencies**:
  - q_85 through q_95 (individual phase lag values)
- **Type**: Average thermal phase lag

### r_98 (Phase Lag Averages %)
- **Formula**: `=AVERAGE(R85:R94)`
- **Dependencies**:
  - r_85 through r_94 (individual percentages, excludes r_95 slab)
- **Type**: Average percentage

---

## Row 99: Extended Metrics

### q_99 (Thermal Resilience Days)
- **Formula**: `= Q98 * (1 + I21 * ((L39 * 1000) / (1.2 * D105 * 1005)))/24`
- **Dependencies**:
  - q_98 (Average phase lag hours) - **S11 Row 98**
  - i_21 (GF CDD factor) - **S02**
  - l_39 (Thermal Mass Factor kJ/K) - **S03**
  - d_105 (Building Volume m3) - **S12**
- **Type**: Converts phase lag to days with thermal mass adjustment
- **Cross-section**: S02, S03, S12

### r_99 (Label)
- **Value**: "days (Heating Season)" (literal text)
- **Type**: Unit label

---

## Cross-Section Dependency Summary

### From Section 2 (Climate):
- **d_20**: Heating Degree Days (HDD) - used in all air-exposed component heatloss calculations (rows 85-93)
- **d_21**: Cooling Degree Days (CDD) - used in all air-exposed component heatgain calculations (rows 85-93)
- **d_22**: Ground Facing GF HDD - used in ground-facing calculations (rows 94-95)
- **h_21**: Current or Future Values - controls thermal bridge penalty for cooling (row 97)
- **h_22**: GF CDD - used in ground-facing heatgain (rows 94-95)
- **i_21**: GF CDD factor - used in ground-facing heatgain and thermal resilience (rows 94-95, 99)
- **d_23**: Coldest Days temperature - used in phase lag calculations (all rows)
- **h_23**: Tset Heating - used in phase lag calculations (all rows)
- **l_23**: Survival Temp - used in phase lag calculations (all rows)
- **l_12**: Energy cost $/kWh - used in all heating cost calculations (column P)

### From Section 10 (Solar Gains):
- **d_73**: Door area - referenced by d_88
- **d_74**: Window North area - referenced by d_89
- **d_75**: Window East area - referenced by d_90
- **d_76**: Window South area - referenced by d_91
- **d_77**: Window West area - referenced by d_92
- **d_78**: Skylight area - referenced by d_93
- **i_73**: Door solar gain - used in p_88 net cost calculation
- **i_74**: Window North solar gain - used in p_89 net cost calculation
- **i_75**: Window East solar gain - used in p_90 net cost calculation
- **i_76**: Window South solar gain - used in p_91 net cost calculation
- **i_77**: Window West solar gain - used in p_92 net cost calculation
- **i_78**: Skylight solar gain - used in p_93 net cost calculation

### From Section 12 (Volume and Surface Metrics):
- **d_101**: Total Area Exposed to Air (Ae) - used in percentage calculations for rows 85-93
- **d_102**: Total Area Exposed to Ground (Ag) - used in percentage calculations for rows 94-95
- **d_105**: Total Conditioned Volume (m3) - used in all phase lag calculations (column Q)
- **g_101**: U-Value for Ae - used in row 98 conditional calculation
- **g_102**: U-Value for Ag - used in row 98 conditional calculation

### From Section 3 (Building Characteristics):
- **l_39**: Thermal Mass Factor (kJ/K) - used in row 99 thermal resilience calculation

---

## Calculation Patterns

### Pattern 1: Standard Transmission Loss (Air-Exposed)
**Rows**: 85, 86, 87
**Formula**: `Area * HDD * 24 / (RSI * 1000)`
**Pattern**: Direct transmission through opaque envelope to exterior air

### Pattern 2: Standard Transmission Gain (Air-Exposed)
**Rows**: 85, 86, 87
**Formula**: `Area * CDD * 24 / (RSI * 1000)`
**Pattern**: Direct transmission through opaque envelope during cooling

### Pattern 3: Opening Transmission Loss (Windows/Doors)
**Rows**: 88-93
**Formula**: `Area_from_S10 * HDD * 24 / (RSI * 1000)`
**Pattern**: Same as Pattern 1 but area references S10

### Pattern 4: Opening Transmission Gain (Windows/Doors)
**Rows**: 88-93
**Formula**: `Area_from_S10 * CDD * 24 / (RSI * 1000)`
**Pattern**: Same as Pattern 2 but area references S10

### Pattern 5: Ground-Facing Transmission Loss
**Rows**: 94, 95
**Formula**: `Area * GF_HDD * 24 / (RSI * 1000)`
**Pattern**: Uses ground-facing HDD (d_22) instead of standard HDD (d_20)

### Pattern 6: Ground-Facing Transmission Gain
**Rows**: 94, 95
**Formula**: `GF_CDD_factor * Area * GF_CDD * 24 / (RSI * 1000)`
**Pattern**: Uses ground-facing CDD values with adjustment factor

### Pattern 7: Net Heating Cost (Opaque)
**Rows**: 85, 86, 87, 94, 95
**Formula**: `Heatloss_kWh * Energy_cost`
**Pattern**: Simple cost calculation

### Pattern 8: Net Heating Cost (Openings)
**Rows**: 88-93
**Formula**: `(Heatloss_kWh - Solar_gain_kWh_from_S10) * Energy_cost`
**Pattern**: Accounts for solar gains from S10 to calculate net cost

### Pattern 9: Thermal Phase Lag
**All component rows**: 85-94
**Formula**: `IF(Area > 0 AND U-value > 0, (1.2 * Volume * 1005 * (Tset - Survival)) / (U-value * Area * (Tset - Coldest)) / 3600, "")`
**Pattern**: Calculates hours of thermal resilience based on envelope thermal mass effect

### Pattern 10: Thermal Bridge Penalty
**Row**: 97
**Formulas**:
- Heating: `Total_heatloss * Penalty_factor`
- Cooling: `IF(climate="Static", 0, Total_heatgain * Penalty_factor)`
**Pattern**: Applies percentage penalty to account for thermal bridging

---

## Implementation Notes

1. **Window/Door Dependencies**: Rows 88-93 directly reference S10 for areas (column D), creating tight coupling between sections
2. **Solar Gain Offset**: Heating costs for openings (88-93) subtract solar gains from S10 to calculate net cost
3. **Ground vs Air Calculation Split**: Rows 85-93 use standard HDD/CDD, rows 94-95 use ground-facing values
4. **Thermal Bridge Application**: Row 97 penalty is applied AFTER calculating row 98 subtotals (note circular reference pattern)
5. **Phase Lag Exclusions**: Row 95 (slab) and row 97 (penalty) excluded from phase lag calculations
6. **Conditional Cooling Penalty**: Row 97 cooling penalty only applies when climate mode is not "Static"
7. **Percentage Calculations**: All percentage fields (columns J, L) reference row 98 totals, creating dependencies
8. **Unit Conversions**: Column E (Rimp) consistently converts from column F (RSI) using factor 5.678

---

## End of Dependency Mapping
