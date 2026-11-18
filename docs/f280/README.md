# F280 whole-house verification: start here

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
3. **A Section 11 row at RSI 0 shows 0 W.** The slab row (95) reads U 0 and 0 W heat loss
   (`rsi > 0 ? 1 / rsi : 0`). Andy expects an RSI-0 row to show its loss on its own row; F280 itself
   computes below grade by BASESIMP.
4. **There is no AIM-2.** Infiltration is 1.21 × NRL50 × area ÷ N-factor × ΔT. F280 Cl. 5.2.3.1 takes the
   leakage rate from AIM-2, which also handles exhaust-only (unbalanced) ventilation. The 2015 workbook's
   AIM-2 results are the target; its inputs are in `AIM2-F280_Example.xls` (open in Excel).

## Inherited from the template (12-AberdeenHouse), not yet set from F280

Fields the build does not set keep the template's values. The ones that can move the peak gain are the
internal-gain inputs (plug, lighting, equipment densities and the occupant activity). F280 itself uses
70 W per person (Cl. 6.2.4) and 4 W/m² of floor area with an 800 W minimum (Cl. 6.2.5). Also inherited:
the gains utilization `d_80` = "PH Method" (annual heating only) and the heating system (heat pump).

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
