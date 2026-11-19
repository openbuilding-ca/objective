# F280 whole-house verification: start here

> **CURRENT STATE (2026-11-19 close, branch `f280-review-format`). F280-1 PASSES Cl. 8.4.1 ON BOTH COUNTS:**
> **loss 11 681 W vs Annex J 11 787 (99.1 %); gain 7347 W vs 7321 (100.4 %).** `ENFORCE_BAND` in the harness stays false until
> the verification agent (Kieran) signs off.
>
> **How the gain is compared.** Annex J's (and K's) "gain" is the NOMINAL capacity, Cl. 6.3.1 CSCn = LM x the sum of HGsr at
> LM 1.3, not the sensible sum. Shown by Annex K 8.3.3 (pp. 188-190): spreading Archetype 1's internal gains over its 18 rooms
> moves the four occupied rooms -387 W and the other 14 +111 W, an internal total of ~1995 W = 1.3 x (5 x 70 + 4 x 295.57) =
> 1992 W; no floor area explains it without the 1.3. The harness compares S21's sensible sum (5652 W) x 1.3 (`ANNEX_J_LM`).
> The app's own nominal capacity (the sensible + Annex B's design latent) is unchanged.
>
> **Read from the PDF (Andy's screenshots, 2026-11-19), every value checked against the build and the fixture:** Table 6F and
> H.3.14 (the window: RSI 0.51, SHGC 0.47 - the text extract had given 0.64 / 0.40, the largest single error); G.1.1-G.1.3 (each
> floor's area and ceiling height: 295.57 m2; Vb 795.1 m3 with the floors' joist spaces, as NRCan's F280_SpreadsheetHelp.doc
> defines AIM-2's house volume); G.1.8 (walls, gross) and G.1.11 (windows); I.3 (the RSIs); all of Annex J (8.3.2 c-f, every
> 8.3.4-8.3.8 variant, all 32 rows of 8.3.9 a), 8.3.10 c-d); Annex K 8.3.3. Details: "What needs the PDF" below and the fixture
> `test/fixtures/f280-annex-j.json` (`verified_against_pdf`).
>
> **The variants (x 1.3, magnitudes - Annex J prints them with no consistent sign):** the eight turns 0.94-0.96 of Annex J's
> change; 3.0 ACH50 (8.3.7 b) 0.95 gain / 0.94 loss; exhaust-only (8.3.4 c) 0.98 gain / 1.04 loss; no external shading (8.3.6 b)
> 1.21. Not modelled: 8.3.4 b and 8.3.3 (room tests), 8.3.5 b-c (no interior-shading input).
>
> **Open, for Kieran:** (1) the turns' last ~5 %: walls take Table 3's solar correction on the compass mean (OBJECTIVE gives them
> no facing), so they do not turn; by facing they would. (2) 8.3.6 b over by 35 W: Annex A's shading as summer shading per row.
> (3) Vb with or without the joist spaces (+47.2 m3; we include them, NRCan's definition). (4) A suspected ERRATUM in F280-12:
> 8.3.9 a)'s Vancouver 1960s Archetype 2 row repeats Vancouver 1980s Archetype 1 digit for digit. (5) The other 31 cases of
> 8.3.9 are not built (F280-1 is Archetype 1 / 2010s / Ottawa).
>
> **What the app does (all shipped 2026-11-18/19):** S21 F280 Mode is the master switch, per model (Target and Reference
> independent): On puts BASESIMP and AIM-2 in the annual stream and holds F280's internal gains in S09 (70 W per person, Cl.
> 6.2.4; 4 W/m2, 800 W floor, Cl. 6.2.5); Off hides every F280-only input and S21 and runs OBJECTIVE's methods. S21 computes F280's
> way in either mode: BASESIMP (Cl. 5.2.2.1), AIM-2 (Cl. 5.2.3, 6.2.6), ventilation (Cl. 5.2.3.2, 6.2.7 with ATRE), design-hour
> solar (Cl. 6.2.2.1), Table 3's opaque solar correction (Cl. 6.2.1), the gains of Cl. 6.2.4 / 6.2.5. An input a method cannot give
> makes its readers Unavailable, never 0. The house CSV carries every F280 input (`test/csvRoundTripF280.spec.cjs`). Sample
> Projects carries a "CSA F280 Review Format" row under each Part 9 house (`tools/f280/review_case.py`,
> `test/f280ReviewCases.spec.cjs`): under Mode On every house reads below its bills, because F280's design-hour gains also become
> the house's plug electricity for the year ("F280 Mode as an ANNUAL model", below).
>
> **AIM-2** (2026-11-19): `src/core/Aim2.js` is AIM2.xls's AIM_2_Calcs cell for cell (tables `src/core/Aim2Data.js`;
> January / July winds in `F280Weather.js`). Witness `test/aim2.test.cjs`: six inputs Excel computed
> (`tools/f280/aim2_variants.py`) at 1e-9, NRCan's 2015 test cases to 4 decimals. In the app: S12 B.19.2-B.19.12 its inputs
> (shown under S21 F280 Mode On; the B.19.1 selector retired 2026-11-19 - the mode chooses), B.19.13 / B.19.14
> LRairh / LRairc shown either way. It sets F280's air-leakage loss (Cl. 5.2.3) and gain (Cl. 6.2.6) and, under Mode On, the annual
> `i_103` (Andy: "when you get to a fork in the road, take it"): AIM-2 per month on the climate station's mean
> temperature and wind, HDD-weighted (F280-1: 2687 → 2859 kWh). ✅ S12 B.18.4 is now a true ELA at 10 Pa (it computed
> ACH50 × volume / 3600, the 50 Pa flow): AIM-2's ELA in effect, else from the ACH50 at AIM2's nearest type's n (F280-1: 0.304 → 0.0394 m²).
>
> **BASESIMP** (2026-11-19): `src/core/Basesimp.js` is BasementHLR.xls cell for cell (coefficients
> `src/core/BasesimpData.js` from FoundationCC.xls; weather `src/core/F280Weather.js` from F280_Weather.xls, 675 of
> S03's 679 cities). Witness `test/basesimp.test.cjs`: 6 workbooks EXCEL computed (NRCan's BWEB_2/3/4, the
> interpolation path, F280-1's two basement rooms 791 + 593 W), 220 checks at 1e-9. In the app: S03 G.4.4-G.4.8 its inputs
> (shown under S21 F280 Mode On; the G.4.3 selector retired 2026-11-19 - the mode chooses; a slab-on-grade configuration runs
> NRCan's SlabOnGradeHLR.xls, `test/basesimpSlab.test.cjs`, 186 checks against Excel), G.4.9 the deep
> ground temperature, G.4.10 BASESIMP's load (shown under either method). It sets S15 T.6.4 (`d_137`) and so F280's
> envelope; and, under Mode On, the ANNUAL figures (S11 rows 94-95, S12 `i_102` and so TEL / TEDI): the heating season's loss,
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
| `docs/f280/F280-1-crosswalk.md` | Each of its 96 fields: value, status (standard · derived · equivalent · estimate · placeholder), source table |
| `tools/f280/build_case.py` | Builds both from Annex G.1's plans and imperial take-offs, Annexes H.3 / I.3 and Tables 6F / 6I; each table marked with the PDF page it was checked against (2026-11-19) |
| `test/fixtures/f280-annex-j.json` | Annex J's expected values: all 32 models of 8.3.9 (W and Btuh, each pair cross-checked) and the base case's variant changes |
| `tools/f280/annex_j_fixture.py` | Built the first fixture from the text extract. ⛔ Do NOT rerun: the fixture is now verified against the PDF by hand (pages, `sign_convention`, `gain_is`, the erratum) and the script would overwrite that |
| `test/f280WholeHouse.spec.cjs` | The harness: imports each F280 case, applies the variants, reads S21, records against Annex J and the 8.4.1 band → `test/f280-results.json` |
| `test/f280ReviewCases.spec.cjs` · `tools/f280/review_case.py` | The "CSA F280 Review Format" rows: each Part 9 house Off / On / bills → `test/f280-review-results.json` |
| `test/f280InternalGains.test.cjs` | Cl. 6.2.4 / 6.2.5 in S09 under Mode On and in S21 either way (`node`) |
| `test/fixtures/f280-aim2-workbook.json` | The 2015 workbook's AIM-2 results (natural ACH vs volume, vs exhaust-only flow): AIM-2's first witness |

Run it with `npx playwright test test/f280WholeHouse.spec.cjs --config=playwright.config.cjs`. The band
is recorded, not enforced (`ENFORCE_BAND = false`), until the base case is signed off as modelled. The gain is compared
as sensible x 1.3 (`ANNEX_J_LM`, Cl. 6.3.1; see the current state above).

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

## Findings to check first (2026-11-18, ALL RESOLVED - kept as the record of the first run)

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

## F280 Mode as an ANNUAL model: what F280's gains do to TEUI (for Kieran; Andy 2026-11-19)

**The rule (Andy):** *"F280 ON should use F280 gains, and F280 OFF should return to OBJECTIVE methods/defaults"*
(OBJECTIVE's: plug load by standard and occupancy, equipment by occupancy, elevators and Regular / Efficient,
lighting the user's). Under On, S09 holds Cl. 6.2.4's 70 W per person and Cl. 6.2.5's max(4 W/m² × A, 800 W) for
lights, appliances and plug loads (lighting and equipment 0, the clause's one figure carries them); S21 uses the same
figures at the design hour in either mode (`window.TEUI.F280Gains`).

**What follows, and it is not a bug:** S09's gains do two jobs in the annual model. They are HEAT in the house (what
F280 is about), and they are the house's plug, lighting and equipment ELECTRICITY, which TEUI counts. Cl. 6.2.5's
4 W/m² is a design-hour heat allowance, not an energy figure, so under On it also becomes the house's plug
electricity for the year. **TEUI under On therefore falls below the bills - the honest result of applying F280's
design-hour allowance to a whole year.** Andy, 2026-11-19: *"it is imperative that [this] ends up in Kieran's
analysis"*. Measured on the four Part 9 houses (the "CSA F280 Review Format" rows, `test/f280-review-results.json`):

| House (TEUI, kWh/m²·yr) | Off (OBJECTIVE) | On, BASESIMP + AIM-2 only | On, + F280's gains | Bills |
|---|---|---|---|---|
| 03 Hemmingford | 57.1 | 57.9 | 56.7 | 56.3 |
| 02 Collingwood | 103.4 | 99.6 | 84.7 | 103.5 |
| 12 Hawkesbury | 63.4 | 64.0 | 46.6 | 57.8 |
| 10 Port Credit | 13.2 | 13.3 | −12.1 (net of on-site PV) | 14.8 |

The "BASESIMP + AIM-2 only" column isolates F280's heat-loss methods (foundation, air leakage): they move TEUI by
−3.8 to +0.8. The gains move it by −1.2 to −25.4. For Annex J none of this matters: Annex J compares design W
(above), never annual energy. It matters for any claim that "F280, annualized, predicts energy use".

## Matching the gains by OBJECTIVE's own inputs (Andy 2026-11-18) - SUPERSEDED 2026-11-19 for S21

S21 now takes Cl. 6.2.4 / 6.2.5 directly (the section above); F280-1's gain 7040 → 5155 W (70.4 %). Kept for the
overhang-to-shading mapping and the sources of OBJECTIVE's own gains, which Off still uses.

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

## What needed the PDF (the text extract could not settle these) - read 2026-11-19

- ✅ The floor area and volume from the plans (Figures G.1.1 b) - G.1.3 b), the PDF 2026-11-19): 90.30 + 96.02 +
  109.25 = 295.57 m2 (was 289.14: the main floor is not the basement's footprint), Vb 795.1 m3 (was 730.3) with the floors'
  0.23 m joist spaces, as NRCan's F280_SpreadsheetHelp.doc defines AIM-2's house volume ("including ... floors";
  closets are inside each floor's area). F280-1's LOSS PASSES Cl. 8.4.1.
- ✅ F280's take-off measures as OBJECTIVE does (Andy 2026-11-19: interior dimensions, the rough opening the handoff
  between wall and window, "a pure topology model"): G.1.8's wall lengths sum to the plans' perimeters (main + stair
  156.62 ft vs 156.6; upper + stair 154.35 vs 154), the basement box is "INT." and the floors share its 35 ft 4.5 in;
  wall heights are the ceiling heights and the rim joists their own 0.23 m row (G.1.7) - even the two-storey stair wall
  is 2.77 + 2.46 = 5.23 m - so walls and rims tile the elevation once; windows are rough openings (Table 6F note 1).
- ✅ Table G.1.8's wall areas are GROSS (area = length x height on every row; the PDF, 2026-11-19): the build's
  subtraction of windows and doors is right. G.1.8 b)'s SI rows are misaligned with their labels: use a). Still
  open: the house/garage walls are not split out (I.3 gives RSI 3.364 for those).
- ✅ Table 6F (p. 40, the PDF 2026-11-19): operable vinyl, insulating spacer, low-E, 13 mm argon is RSI 0.51,
  SHGC 0.47 - the extract had given 0.64 / 0.40. Loss 10 839 -> 11 528 W (97.8 %), gain 5155 -> 5619 W (76.7 %).
  ⚠ The turns (8.3.8) now change by 0.72-0.74 of Annex J's on every facing (0.615 at SHGC 0.40): Annex J
  behaves as if SHGC ~0.65 (Table 6F's CLEAR double glazing). ✅ Table H.3.14 (p. 159) CONFIRMS the build's window
  (vinyl operable, double, 13 mm, insulated spacer, argon, single low-e, no interior shading): SHGC 0.47 is the
  standard's. So the turn ratio is NOT the window. Suspect: `test/fixtures/f280-annex-j.json` itself, read from the
  same column-shifting extract (`verified_against_pdf: false`) - check its base case and variants against Annex J.
- ✅ Annex I.3 b)'s 2010s values (p. 167, the PDF 2026-11-19): the build's eight RSIs are right.
- Annex J's variant tables (8.3.4–8.3.8) come through column-shifted, and the SIGN of each expected change is
  not settled (`sign_settled: false`). 8.3.4 c) reads −897 W loss for exhaust-only, which looks backwards.
- G.1.11's overhangs and drops shade the base case (Annex A). OBJECTIVE's summer shading is 0 % for now,
  which is the 8.3.6 b) variant, not the base.
