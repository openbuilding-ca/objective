# 🏗️ Building Phase Lag Calculation (Thermal Mass Approximation)

This method calculates **building thermal phase lag in hours**, using a **component-based steady-state model** and enhancing it with **typology-based thermal mass** via a **capacitance slider**.

---

## 📌 1. Base Phase Lag (Component-Only)

Estimate the time it takes for interior air to reach a survivability threshold **without accounting for building thermal mass (yet)**:

BasePhaseLag = [1.2 × V_air × cp_air × (T_set - T_survive)] ÷ [U × A × (T_set - T_ext)] ÷ 3600

**Where:**

- `V_air`: Interior air volume (m³)
- `cp_air`: Specific heat of air (1005 J/kg·K)
- `U`: U-value of component (W/m²·K)
- `A`: Surface area of component (m²)
- `T_set`: Indoor setpoint temperature (°C)
- `T_survive`: Survival threshold temperature (10°C in our Heating Season model)
- `T_ext`: Exterior design temperature (°C)

**Excel Example (Q98):**

```excel
= (1.2 * D105 * 1005 * (H23 - L23)) / (G85 * D85 * (H23 - D23)) / 3600


📌 2. Adjusted Phase Lag (Incorporating Thermal Mass)

Adjust base lag using a capacitance slider (α) and calculated building mass capacity:

AdjustedLag = BasePhaseLag × (1 + α × (C_mass / C_air))

Where:

α: Capacitance slider (range: 0–1)
C_mass: Thermal mass capacity (J/K)
C_air: Air thermal capacity = 1.2 × V_air × cp_air (J/K)
Excel Example (Q99):

= Q98 * (1 + I21 * ((L39 * 1000) / (1.2 * D105 * 1005)))


📌 3. Typology-Based Thermal Mass Factor

Define mass capacity using typology-specific values (in kJ/m²·K), scaled by total envelope area - all the 'stuff' connecting interior and exterior air, but excluding slabs and partitions and core stuff, which is important but we need to figure out how to tie those values to volume or stories):

Excel (L39):

= SWITCH(D39,
  "Pt.9 Res. Stick Frame", 25,
  "Pt.9 Small Mass Timber", 60,
  "Pt.3 Mass Timber", 80,
  "Pt.3 Concrete", 150,
  "Pt.3 Steel", 40,
  "Pt.3 Office", 60,
  0
) * D101

D39: Typology selection cell
D101: Envelope area exposed to exterior air (m²)

⚠️ Disclaimer
This method simplifies real-world heat flow using steady-state assumptions and approximate capacitance modeling.
It omits dynamic heat transfer, solar gain, internal loads, and mechanical systems.
The capacitance slider approximates the proportion of thermal mass actively moderating temperature.
For critical design applications, use dynamic simulation tools (e.g., EnergyPlus, IES-VE, TRNSYS).
```
