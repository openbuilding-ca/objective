# F280 whole-house verification: start here

> **Current state (2026-11-19, late).** F280-1 on **BASESIMP** (S03 G.4.3) and **AIM-2** (S12 B.19.1): loss
> **10 839 W (92.0 %, under the 98–120 % band)** = envelope 8384 (above grade 6997 + basement 1387) + infiltration
> 1737 (AIM-2, LRairh 0.14865 AC/H) + ventilation 718 (Cl. 5.2.3.2 at the clause's 1.2); sensible gain **5014 W
> (68.5 %)**, now `f280.totalSensibleHeatGain` (Cl. 6.2.9), which carries Cl. 6.2.7's ventilation gain (374 W, ATRE 0:
> OBJECTIVE takes none) in place of S15's season-average ventilation (0 W). On the OBJECTIVE methods (U·A to 10 °C,
> N-factor) the same house reads 14 412 W (122.3 %). Next: the design-hour solar gain (Cl. 6.2.2.1: ~2150 W for
> F280-1's windows against the season average 289 W). Open with Andy: B.18.4's ELA vs NBC's NLA10, and an ATRE input.
> The plan and handoff: ABCD.EARTH `ABCD-OBJECTIVE-PRO.md` §0 and §4.6.
>
> **AIM-2** (2026-11-19): `src/core/Aim2.js` is AIM2.xls's AIM_2_Calcs cell for cell (tables `src/core/Aim2Data.js`;
> January / July winds in `F280Weather.js`). Witness `test/aim2.test.cjs`: six inputs Excel computed
> (`tools/f280/aim2_variants.py`) at 1e-9, NRCan's 2015 test cases to 4 decimals. In the app: S12 B.19.1 Infiltration
> Method (OBJECTIVE (N-factor) | AIM-2 (CSA F280)), B.19.2-B.19.12 its inputs (greyed unless AIM-2), B.19.13 / B.19.14
> LRairh / LRairc shown either way. It sets F280's air-leakage loss (Cl. 5.2.3) and gain (Cl. 6.2.6) and the annual
> `i_103` (Andy: "when you get to a fork in the road, take it"): AIM-2 per month on the climate station's mean
> temperature and wind, HDD-weighted (F280-1: 2687 → 2859 kWh). ✅ S12 B.18.4 is now a true ELA at 10 Pa (it computed
> ACH50 × volume / 3600, the 50 Pa flow): AIM-2's ELA in effect, else from the ACH50 at AIM2's nearest type's n (F280-1: 0.304 → 0.0394 m²).
>
> **BASESIMP** (2026-11-19): `src/core/Basesimp.js` is BasementHLR.xls cell for cell (coefficients
> `src/core/BasesimpData.js` from FoundationCC.xls; weather `src/core/F280Weather.js` from F280_Weather.xls, 675 of
> S03's 679 cities). Witness `test/basesimp.test.cjs`: 6 workbooks EXCEL computed (NRCan's BWEB_2/3/4, the
> interpolation path, F280-1's two basement rooms 791 + 593 W), 220 checks at 1e-9. In the app: S03 G.4.3 Ground
> Heatloss Method (OBJECTIVE | BASESIMP (CSA F280)), G.4.4-G.4.8 its inputs (greyed unless BASESIMP), G.4.9 the deep
> ground temperature, G.4.10 BASESIMP's load (shown under either method). It sets S15 T.6.4 (`d_137`) and so F280's
> envelope; and the ANNUAL figures (S11 rows 94-95, S12 `i_102` and so TEL / TEDI): the heating season's loss,
> 365 − Days Cooling days centred on the coldest day, BASESIMP's harmonic integrated exactly (Andy 2026-11-19).
> F280-1: ground 26 936 → 5777 kWh/yr, TEDI 144.29 → 71.11 kWh/m²·yr. F280-1 as one
> foundation: an 18.47 x 4.89 m rectangle from the slab area and the exposed perimeter 46.72 m, 1387 W, against F280's
> room-by-room 1384 W.

Sandbox only (Andy, 2026-11-18): the F280 cases and Annex J's values stay in `andy-rnd`. The plan and the
rulings are in the ABCD.EARTH repo, `ABCD-OBJECTIVE-PRO.md` §4.3.

**Roles (CSA F280-12 Cl. 8.2):** Andy (with Claude) is the qualified operator, who produces the base case
and runs OBJECTIVE. Kieran is the verification agent, who checks the base case, makes the variants, compares
each result to Annex J and writes the verification report. The whole-house claim is Cl. 8.1.2 b): 8.3.2,
8.3.4–8.3.9 and the 8.4.1 band.

**What Annex J compares:** design-condition capacity in W. That is the heat loss at the heating design
temperature (Cl. 5.2.7) and the total sensible gain at the cooling design condition (Cl. 6.2.9). It never
compares annual energy.

## The files

| File | What |
|---|---|
| `test/computation/case-studies/F280-1-Archetype1-2010s-Ottawa.csv` | The base case (Cl. 8.3.1) as an OBJECTIVE case CSV |
| `docs/f280/F280-1-crosswalk.md` | Each of its 68 fields: value, status (standard · derived · equivalent · estimate · placeholder), source table |
| `tools/f280/build_case.py` | Builds both from Annex G.1's imperial take-offs, Annexes H.3 / I.3 and Tables 6F / 6I |
| `test/fixtures/f280-annex-j.json` | Annex J's expected values: all 32 models of 8.3.9 (W and Btuh, each pair cross-checked) and the base case's variant changes |
| `tools/f280/annex_j_fixture.py` | Builds that fixture from the text extract of the standard |
| `test/f280WholeHouse.spec.cjs` | The harness: imports each F280 case, applies the variants, reads S21, records against Annex J and the 8.4.1 band → `test/f280-results.json` |
| `test/fixtures/f280-aim2-workbook.json` | The 2015 workbook's AIM-2 results (natural ACH vs volume, vs exhaust-only flow): AIM-2's first witness |

Run it with `npx playwright test test/f280WholeHouse.spec.cjs --config=playwright.config.cjs`. The band
is recorded, not enforced (`ENFORCE_BAND = false`), until the base case is signed off as modelled.

Note: running the old parity spec (`caseStudyValidation.spec.cjs`) now includes F280-1 (13 of 13 match) and
re-records `test/case-study-results.json`. That file dates from March, so don't commit the refresh with
F280 work.

## First run (2026-11-18, served app, corrected), before any fix

The first runs loaded the app from `file://`. There the ISO 52016 cooling (which carries every window row's
cooling gain) cannot fetch its climate data, so solar cooling read 0. A served app also auto-imports a
sample case 1.5 s after start (`src/core/init.js`), which can land on top of the F280 case. The harness now
serves the app, waits for that auto-load, and checks each run's identity by slab area. F280-1 is now on
Capacitance (Andy: OBJECTIVE ground-couples through it); it had inherited Static from the template.

| | OBJECTIVE | Annex J | Ratio | 8.4.1 |
|---|---|---|---|---|
| Loss | 12 716 W | 11 787 W | 107.9 % | pass, **but see finding 1** |
| Sensible gain | 5122 W | 7321 W | 70.0 % | fail |

Loss parts: envelope 8917 W, infiltration 1194 W, ventilation 2605 W. Variants: 3.0 ACH50 gives +1194 W
loss and +95 W gain (Annex J: +1925 and +118). Turning the house (each window's Section 10 orientation
dropdown, all eight points) moves the gain by 171–343 W (Annex J: about 2000–2500).

## Findings to check first

1. **The F280 ventilation loss reads 3.6× high.** `f280.peakVentilationHeatLoss` multiplies
   `ventilation.volumeRate` (labelled m³/h, L/s × 3.6 in `VentilationNodes.js`) by 1.21, which is the
   per-L/s figure (ρc ≈ 1.21 W per L/s·K). The base reads 2605 W = 1.21 × 186.9 m³/h × 0.24 × 48 K; in
   L/s it is about 724 W. With that, the loss would be about 10 835 W (91.9 %, low). Exhaust-only shows the
   same factor (+8249 W).
2. **The peak solar is the cooling season's average, not a peak hour.** `energy.peakCooling.totalKw` adds
   the season's solar kWh ÷ (cooling days × 24). That's why turning the house moves the gain about ten times
   less than Annex J. F280 uses peak-hour solar by façade (Cl. 6.2.2); the CTO's gap analysis §6.2 already
   names this.
3. ✅ **FIXED (Andy: "You can change OBJECTIVE's method of calc to fix this bug"):** U = 1 / max(RSI, the row's
   interior surface film, `R_SI_MAP`), so RSI 0 on the slab reads U 5.88 and loses heat; every other RSI is
   untouched (the 13 cases' parity results identical before and after; witness `test/transmissionRsiZero.spec.cjs`
   fails on the old code, U 0). The history:
   **The RSI-0 bug (Andy: "that is a real bug").** `TransmissionLossNodes.js:159` returns
   `rsi > 0 ? 1 / rsi : 0`, so an RSI of 0 becomes U 0 and the row shows 0 W, the opposite of an uninsulated
   assembly. The same node reads a BLANK RSI as 5 (`parseNum(…, 5)`). Andy's rule ("no fallbacks") points to
   an RSI ≤ 0 showing the row as an error, not a number. F280-1 no longer enters 0: Table I.3's slab 0 is the
   ADDED insulation, so the slab carries its uninsulated assembly, 102 mm concrete (0.00045/mm, Table 7B) + the
   slab film 0.17 = RSI 0.216.
   ✅ **ALSO FIXED (Andy: "yes, use the 10 °C ground temp"):** S15's enclosure peaks now give ground-facing
   surfaces OBJECTIVE's 10 °C ground: heating U·A × (setpoint − 10); at peak cooling the ground adds no gain and
   no credit (a credit would undersize: over, never under). Across the 12 case studies the heating enclosure peak
   falls 13–40 % and the cooling enclosure peak 16–57 %; their annual results are identical. F280-1: loss 20 041 W
   (170 %), sensible gain 4927 W (67.3 %).
   **What that exposed (before the fix):** S15's peak heating (`EnergyNodes.js:514–516`) multiplies ground-facing U·A by the
   OUTDOOR design ΔT (setpoint − coldest), while OBJECTIVE's annual method gives ground-facing areas a 10 °C
   ground (ground-facing HDD). An uninsulated slab at −25 °C air makes the peak 41 481 W (352 %); its row alone
   is 29 502 kWh/yr. F280 takes below grade from BASESIMP. The cooling peak does the same with (hottest − 24).
4. **There is no AIM-2.** Infiltration is 1.21 × NRL50 × area ÷ N-factor × ΔT. F280 Cl. 5.2.3.1 takes the
   leakage rate from AIM-2, which also handles exhaust-only (unbalanced) ventilation. The 2015 workbook's
   AIM-2 results are the target; its inputs are in `AIM2-F280_Example.xls` (open in Excel).

## Matching the gains by OBJECTIVE's own inputs (Andy 2026-11-18)

Andy: *"Ideally we match gains NOT by inventing new methods, but by choosing standard OBJECTIVE input values,
occupant activity levels, and lighting and plug loads and schedule (assumed 12hrs/day residential)."* And:
*"we derived factors from dynamic modelling... so irradiance/etc. is all included in our factors."* So F280-1
now uses:

- **Overhangs → each window row's Summer Shading % slider (Section 10).** Annex A's shade line (S = F × O,
  F by facing and latitude) on each G.1.11 window gives the shaded area. Cl. 6.2.2.1 treats shade as
  north-facing, so the share of a row's solar removed is shaded/total × (1 − 93 / that facing's solar):
  N 0, E 0 (every drop below its shade line), S 10.10 %, W 1.08 %. The latitude (45.47) is an estimate.
- **Internal gains → OBJECTIVE's standard options:** 12 h/day, activity Normal, lighting 1.5 W/m²,
  equipment Regular (the template, a PH house, had Efficient: 3 W/m² instead of 5), gains utilization NRC 40%
  (annual heating only). The plug density is computed: 5 W/m² for any residential occupancy.

| Peak gain term (S15 `energy.peakCooling.totalKw`) | OBJECTIVE (W) | F280's own rule |
|---|---|---|
| Enclosure U·A·(design temp − 24 °C) | 1115 | Cl. 6.2.1–6.2.3 |
| Internal: (plug 5 + lighting 1.5 + equipment 5 W/m²) × 289 m² | 3325 | 4 W/m² × 289 = 1156 (min 800), Cl. 6.2.5 |
| Glazing rows' share of the ISO cooling need (season average) | 923 | peak-hour solar by facing, Cl. 6.2.2 |
| Occupants (season average) | 204 | 5 × 70 = 350, Cl. 6.2.4 |

**Where OBJECTIVE's gains come from (Andy 2026-11-18):** *"AFAIK our gains for plugs/equipment reference a table in
the actual building code"*; *"F280 seems to undercount, our loads reflect current actual utility bill values."* In the
code: `src/core/ReferenceValues.js` (sourced from `sources of truth 3037/CODE-VALUES.csv`) sets NBC T1's plug load 5.0
W/m², lighting 2.0, SHGC max 0.50, slab RSI min 1.96, HRV SRE 60, TB default 50 ("Not Defined in Codes"); equipment
by occupancy is `EQUIPMENT_LOADS_TABLE` in `InternalGainsNodes.js` (residential Regular 5, Efficient 3). The
equipment table's sources (Andy, 2026-11-18): NREL building data and ComStock, CBECS, RECS, the NECB, ASHRAE
90.1 and the ASHRAE Handbook, and BPI, now cited in the code. Andy: *"F280 should use them but does not."* The plug figure (5.0 W/m², NBC T1)
still names no source. **SHGC:** F280 does prescribe it by window type (Table 6F): double-glazed
low-e 0.40, clear 0.53–0.58. Archetype 1's window is low-e (H.3), so 0.40 is the standard's; Andy's practice for
more window gain is 0.6.

**Andy's review in the app (2026-11-18)** set: NBC T1 as the reference standard, TB penalty 30 %, Electricity in
S13, the NBC water method, DWHR 0 % (NBC 9.36), no EV charging (the template had 2787 kWh). **Now:** loss
41 481 W (352 %) and sensible gain 8500 W (116 %), the loss dominated by the slab at the outdoor ΔT (finding 3).
Before the slab change (RSI 0, the bug's 0 W): loss 15 391 W (131 %), gain 5900 W (81 %).

## What needs the PDF (the text extract cannot settle these)

- The conditioned floor area and volume: the plans G.1.1–G.1.3 are images, so `h_15` and `d_105` are estimates.
- Whether Table G.1.8's wall areas are gross. The build subtracts windows and doors, and does not split out
  the house/garage walls (I.3 gives RSI 3.364 for those).
- Table 6F's column order: the 13 mm argon row was read as RSI 0.64, SHGC 0.40.
- Annex I.3's 2010s values: the extract interleaves the vintages, and the assignment was made by matching
  H.3's layers.
- Annex J's variant tables (8.3.4–8.3.8) come through column-shifted, and the SIGN of each expected change is
  not settled (`sign_settled: false`). 8.3.4 c) reads −897 W loss for exhaust-only, which looks backwards.
- G.1.11's overhangs and drops shade the base case (Annex A). OBJECTIVE's summer shading is 0 % for now,
  which is the 8.3.6 b) variant, not the base.
