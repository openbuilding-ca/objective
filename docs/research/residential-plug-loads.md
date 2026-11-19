# Residential plug and equipment loads: North American sources (2026-11-18)

Asked by Andy to "validate or revise our standard 5 W/m² for residential uses" from reputable North American
sources. The plan that acts on it is in the ABCD.EARTH repo, `ABCD-OBJECTIVE-PRO.md` §4.4.

## How OBJECTIVE applies its densities today

The S09 densities are **in-use (peak) densities run on the occupancy schedule**, not round-the-clock averages.
F280-1 shows it exactly: plug loads 5 W/m² × 289.14 m² × 4,380 h (12 h/day × 365) = 6,332.17 kWh/yr.

| OBJECTIVE, C-Residential, no elevators | In-use W/m² | Annual mean W/m² (12 h/day) |
|---|---|---|
| Plug loads (P.1, `ReferenceValues.js`; NBC T1 5.0) | 5.0 | 2.5 |
| Lighting (P.2) | 1.5 (NBC T1 reference 2.0) | 0.75 |
| Equipment (P.3.1, `EQUIPMENT_LOADS_TABLE`: Regular 5, Efficient 3) | 3–5 | 1.5–2.5 |
| **Combined** | 9.5–11.5 | **4.75–5.75** |

The peak sizing (S15 `energy.peakCooling.totalKw`) applies the full in-use densities × floor area.

## The sources

Every annual figure is converted to W/m² = kWh/yr × 1000 ÷ 8760 ÷ floor area (m²). The reference homes are a
detached house of 2,000 ft² (185.8 m², 3 bedrooms, 3 occupants) and an apartment of 850 ft² (79 m², 2 bedrooms,
2 occupants). "MELs" means miscellaneous electric loads (plug-in devices, electronics, small appliances).

| Source | Covers | Original figure | Annual mean W/m² | Citation |
|---|---|---|---|---|
| **NECB 2011 / 2017 / 2020**, space type "Dwelling units general" | All in-suite receptacle equipment (NECB has no separate appliance line) | **5.0 W/m² peak**, Schedule G: 10.6 full-load h/day (3,869 h/yr) | **2.21** (19.3 kWh/m²·yr) | ✅ **verified in NECB 2020** (`[T] LOCAL FILES/[T] NBC/necb2020_p1.pdf`): Table A-8.4.3.2.(2)-B, "Dwelling units – general": 25 m²/occupant, **peak receptacle 5 W/m²**, SWH 500 W/occupant, Schedule G ("long-term": 2.5 W/m², Schedule J). Schedule G (Table A-8.4.3.2.(1)-G) receptacle fractions, every day: 0.2 ×6, 0.8 ×2, 0.4 ×7, 0.5, 0.2, 0.9, 0.9, 0.7, 0.5, 0.5, 0.5, 0.3 = 10.6 full-load h. Note A-8.4.3.2.(2): the receptacle defaults cover "common electrical equipment directly operated by the occupants, as well as some automatically operated electrical equipment" |
| NECB, dwelling-unit lighting (context) | Lighting | 5.0 W/m² peak, Schedule G 5.6 h/day | 1.17 | same files |
| **ANSI/RESNET/ICC 301-2022**, residual MELs | MELs only (no TVs, lighting or appliances) | 0.91 kWh/yr per ft² of conditioned floor area (§4.2.2.7.2.1, Table 4.2.2.5(1)) | **1.12** (any floor area) | resnet.us/wp-content/uploads/ANSIRESNETICC301-2022_resnetpblshd.pdf |
| RESNET 301-2022, residual MELs + TVs | Plug loads with TVs | + TVs 413 + 69 × bedrooms kWh/yr | 1.50 house / 1.91 apartment | same |
| RESNET 301-2022, everything | Interior lighting (455 + 0.8 × CFA) + refrigerator, range, dryer, dishwasher, washer + MELs | 6,602 kWh/yr house; 4,357 apartment | 4.06 house / 6.30 apartment | same; internal gains Table 4.2.2(3) (residual MELs sensible 7.27 Btu/day·ft² ≈ 0.96 W/m²) |
| **Building America House Simulation Protocols 2014** (Wilson et al., NREL/TP-5500-60988), Table 25 | MELs: plug loads, TVs, electronics, small appliances, ceiling fans | 1185.4 + 180.2 × bedrooms + 0.3188 × ft² kWh/yr | 1.45 house / 2.63 apartment | docs.nlr.gov/docs/fy14osti/60988.pdf (OSTI 1126820) |
| BA HSP 2014, Table 27 (itemised, 3 bedrooms, 1,920 ft²) | MELs | 3,373 kWh/yr | 2.16 | same. ⚠ disagrees with its own Table 25 equation (2,338 kWh, 1.50 W/m², same house); unreconciled in the report |
| BA HSP 2014, everything | Lighting + appliances + MELs | 6,044 kWh/yr house | 3.71 house / 6.61 apartment | same |
| **OpenStudio-HPXML / ResStock defaults** (fitted to RECS 2020) | "Other" plug loads, and with TV | House: 786.9 + 241.8 × occupants + 0.33 × CFA; TV 334 + 92.2 × occupants + 0.06 × CFA | 1.33 (+TV 1.78) house; 1.58 (+TV 2.22) apartment | openstudio-hpxml.readthedocs.io/en/latest/workflow_inputs.html ("HPXML Plug Loads"); sensible fraction 0.855, latent 0.045 |
| **EIA RECS 2020**, all US homes, residual (total electricity minus every itemised end use) | Un-itemised MELs | 1,653 kWh/household | 1.12 (1,818 ft² total) / 1.26 (1,614 ft² heated) | subtraction from Tables CE4.1, CE5.1a, CE5.1b; floor area HC10.9 (eia.gov/consumption/residential/data/2020/); total 10,565 kWh/household matches EIA's published 10,566 |
| RECS 2020: residual + TVs and peripherals + microwaves | Plug loads | 2,367 kWh all homes; 2,760 single-family detached; 2,256 very cold / cold climates | 1.60 all; 1.50 detached (2,264 ft²); 1.40 cold | same |
| RECS 2020: lighting alone (context) | Lighting | 654 kWh | 0.39 | CE5.3a |
| RECS 2020: all electricity except space heating, cooling and water heating | Lighting + appliances + MELs + pools + EV charging | "Other" + refrigerators = 20.3 million Btu ≈ 5,950 kWh | ≈ 4.0 | CE4.6 |
| RECS 2020: total household electricity (context) | Everything, heating and cooling included | 10,565 kWh | 7.1 | CE4.1 |
| **NRCan Comprehensive Energy Use Database 2023**, residential, Canada | "Other appliances" (microwaves, TVs, cable boxes, stereos, computers) | 78.9 PJ; 15.668 M households; 2,353 M m² | **1.06** (1,399 kWh/household) | oee.nrcan.gc.ca CEUD residential, Canada, Tables 2, 18, 24 (year 2023) |
| CEUD 2023: all appliances + lighting | Appliances + lighting | 195.8 + 59.4 PJ | 3.44 | same |
| **NBC 2025 9.36.6.4.(4) and Table 9.36.6.4** (was 9.36.5.4 in NBC 2015) | Occupant metabolic heat + occupant-dependent appliance, lighting and receptacle loads; NOT exterior or unconditioned-space lighting, SWH or HVAC equipment (Note (1)) | Hourly schedule "fixed for every day of the year": house without a secondary suite sums to **18.42 kWh/day** (767 W mean; 429 W at 4 a.m. to 1305 W at 7 p.m.); each dwelling unit in a building of two or more **11.23 kWh/day** (468 W); + 3.58 W/m² in common spaces. Per dwelling, not per m² | house 5.1 at 150 m², 3.8 at 200 m², **2.65 at F280-1's 289 m²**; unit 5.8 at 80 m² (**includes occupants**) | ✅ **verified in NBC 2025** (`[T] LOCAL FILES/[T] NBC/NBC2025p1.pdf`), Sentence 9.36.6.4.(4) and Table 9.36.6.4; also 9.36.6.4.(5)–(6): heating set-points 20 °C living, 19 °C basements, cooling 25 °C |
| **NRCan EnerGuide (ERS) standard operating conditions** | Lighting + appliances + other electrical | 19.5 kWh/day; 2 adults + 1 child, home 50 % of the time | 5.4 at 150 m²; 4.1 at 200 m² | NRCan EnerGuide glossary in a 2025 HOT2000 report (images.greenbuildingadvisor.com/app/uploads/2025/03/26211343/63177_1743038023_1.pdf). ⚠ end-use split not verified |
| **ASHRAE Handbook—Fundamentals 2017**, Ch. 17, Eq. 30 | Sensible occupant + lighting + appliance gain at the 4 pm DESIGN hour (a peak) | q = 464 + 0.7 × ft² + 75 × occupants Btu/h | 2.21 W/m² area term + 136 W fixed + 22 W per occupant | handbook.ashrae.org/Handbooks/F17/IP/f17_ch17/f17_ch17_ip.aspx |
| ENERGY STAR Multifamily High-Rise / CAGBC multifamily guideline (NECB 2011 ACP) | In-unit plug loads (major appliances separate) | 1.05 kWh/yr per ft² | 1.29 | portal.cagbc.org/cagbcdocs/leed/Canada_Multifamily_Energy_Model_Simulation_Guidelines_for_NECB_ACP.pdf |
| City of Vancouver Energy Modelling Guidelines v1.0 (2017) | In-suite "plug loads" **including fridge, dishwasher, dryer** | 5 W/m² with a schedule | ~2.2 on NECB's schedule | ⚠ secondary only: Pratus Group, *Modelling Appliance Loads in MURBs*, Apr 2018 (sbcanada.org); the Vancouver PDF returned 403. Same report: BC Hydro's 2016 guide uses 7.2 W/m² peak for suites incl. appliances |
| CSA F280-12 Cl. 6.2.5 (for context) | Lights + appliances + plugs, at the design hour | 4 W/m² of gross floor area, minimum 800 W | (a peak) | the standard, in-tree text |

**Not verified:** ASHRAE 90.2 and 90.1 Appendix G (paywalled; 90.1 Appendix G sets receptacle loads equal to the
proposed design rather than a residential default, as far as known); NRCan's Survey of Household Energy Use
microdata (CEUD stands in for it here); the LBNL 880-home Northern California MEL metering study (2012, OSTI
1172006) reports watts per device, not whole-home totals.

## What the sources say

1. **Plug loads alone, detached houses: 1.1–1.8 W/m² annual mean.** Every independent source lands there: RESNET
   (1.1; 1.5 with TVs), BA HSP (1.45), ResStock / RECS 2020 (1.3–1.8), RECS measured (1.1–1.6), CEUD Canada
   (1.06), ENERGY STAR multifamily (1.3). Small apartments run higher, about 2–2.6 W/m², because part of the load
   is fixed per household.
2. **OBJECTIVE's 5 W/m² is NECB's dwelling-unit receptacle density** (verified, NECB 2020 Table A-8.4.3.2.(2)-B). As a peak run on a schedule it is
   code-aligned: OBJECTIVE's 2.5 W/m² mean (12 h/day) is close to NECB's 2.2 (Schedule G, 10.6 h/day). It sits
   above the measured plug-only range because **NECB's 5 W/m² includes the major appliances** (refrigerator,
   range, laundry).
3. **The likely over-count is the equipment line on top of it.** OBJECTIVE adds a separate residential
   "equipment" density of 3–5 W/m² (1.5–2.5 W/m² mean). If the plug line already holds the appliances (as NECB's
   does), the equipment line counts them, or something like them, a second time. Combined, OBJECTIVE's
   4.75–5.75 W/m² mean sits at or above the top of the measured lighting + appliance + plug range (3.4–5.5 for
   houses).
4. **NBC's Part 9 reference is per dwelling, not per m².** NBC 2025 Table 9.36.6.4 fixes a house's occupant +
   appliance + lighting + receptacle gains at 18.42 kWh/day whatever its size: 2.65 W/m² for F280-1's 289 m²,
   against OBJECTIVE's ~6.8 W/m² on the same house (plug 2.5 + lighting 0.75 + equipment 2.5 + occupants ~1.0).
5. **Sensible fraction for heat gains:** about 0.86–0.93 of plug-load energy becomes sensible heat in the space
   (OpenStudio-HPXML 0.855 sensible + 0.045 latent; RESNET Table 4.2.2(3)).

The refinement this suggests, and how to test it without fitting to F280, is `ABCD-OBJECTIVE-PRO.md` §4.4.
