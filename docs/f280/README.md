# F280 whole-house verification: start here

> **CURRENT STATE (2026-11-19 close; on `main` by PR #5, from `f280-review-format`). F280-1 PASSES Cl. 8.4.1 ON BOTH COUNTS:**
> **loss 11 680 W vs Annex J 11 787 (99.1 %); gain 7347 W vs 7321 (100.4 %).** `ENFORCE_BAND` in the harness stays false until
> the verification agent (Kieran) signs off. BASESIMP's basement wall height is B.9's H since 2026-11-20 (S11's L x H
> columns; F280-1 enters Table G.1.5 a)'s 7.75 ft): before, the walls' area over the exposed perimeter, 110.39 / 46.72 =
> 2.3628 m against the table's 2.3622 m, which put the loss 1 W high (11 681 W).
>
> **How the gain is compared.** Annex J's (and K's) "gain" is the NOMINAL capacity, Cl. 6.3.1 CSCn = LM x the sum of HGsr at
> LM 1.3, not the sensible sum. Shown by Annex K 8.3.3 (pp. 188-190): spreading Archetype 1's internal gains over its 18 rooms
> moves the four occupied rooms -387 W and the other 14 +111 W, an internal total of ~1995 W = 1.3 x (5 x 70 + 4 x 295.57) =
> 1992 W; no floor area explains it without the 1.3. **The app shows the whole chain in S15** (Andy: *"Both numbers, the gain, the
> multiplier, and the total. Full transparency since this messed us up all day"*): T.6.10 loss 11 680 W · T.6.11 sensible 5652 W ·
> T.6.12 x LM 1.30 = 7347 W nominal (`f280.s15.nominalHeatGain`). The harness compares that cell and checks it equals sensible x 1.3
> (`ANNEX_J_LM`). S21's own nominal capacity (the sensible + Annex B's design latent) is unchanged.
>
> **Read from the PDF (Andy's screenshots, 2026-11-19), every value checked against the build and the fixture:** Table 6F and
> H.3.14 (the window: RSI 0.51, SHGC 0.47 - the text extract had given 0.64 / 0.40, the largest single error); G.1.1-G.1.3 (each
> floor's area and ceiling height: 295.57 m2; Vb 795.1 m3 with the floors' joist spaces, as NRCan's F280_SpreadsheetHelp.doc
> defines AIM-2's house volume); G.1.8 (walls, gross) and G.1.11 (windows); I.3 (the RSIs); all of Annex J (8.3.2 c-f, every
> 8.3.4-8.3.8 variant, all 32 rows of 8.3.9 a), 8.3.10 c-d); Annex K 8.3.3. Details: "What needs the PDF" below and the fixture
> `test/fixtures/f280-annex-j.json` (`verified_against_pdf`), rebuilt and checked by `tools/f280/annex_j_fixture.py --check`.
>
> **The variants (x 1.3, magnitudes - Annex J prints them with no consistent sign):** the eight turns 0.94-0.96 of Annex J's
> change; 3.0 ACH50 (8.3.7 b) 0.95 gain / 0.94 loss; exhaust-only (8.3.4 c) 0.98 gain / 1.04 loss; no external shading (8.3.6 b)
> 1.21. Not modelled: 8.3.4 b and 8.3.3 (room tests), 8.3.5 b-c (no interior-shading input).
>
> **Open, for Kieran:** (1) the turns' last ~5 % (each turn 85-142 W short of Annex J's change). Since 2026-11-20 S11's walls
> are ROWS with a facing each, and Table 3 reads every wall's facing; F280-1 still enters its walls as one row facing Average
> (the compass mean), so they do not turn. **Walls by facing are NOT the gap** - estimated (`tools/f280/turns_walls_estimate.py`,
> its assumptions in its header: G.1.8 a)'s page-1 facings and an even E/W split): the diagonal turns would gain +12 to +14 W,
> a tenth of their shortfall, and the 90-degree turns would LOSE ~71 W, the wrong way (the large E/W walls turn to N/S and take
> Table 3's negative columns). The remainder is elsewhere, likely the windows' design-hour solar or shading, the same in every
> turn. (2) 8.3.6 b over by 35 W: Annex A's shading as summer shading per row.
> (3) Vb with or without the joist spaces (+47.2 m3; we include them, NRCan's definition). (4) A suspected ERRATUM in F280-12:
> 8.3.9 a)'s Vancouver 1960s Archetype 2 row repeats Vancouver 1980s Archetype 1 digit for digit. (5) The other 31 cases of
> 8.3.9 are not built (F280-1 is Archetype 1 / 2010s / Ottawa).
>
> **Peak loads, OBJECTIVE vs F280** on the four Part 9 houses: the section of that name below (envelopes within 4 %; OBJECTIVE's
> S15 peaks omit the air and the latent F280 adds).
>
> **What the app does (all shipped 2026-11-18/19):** S21 F280 Mode is the master switch, per model (Target and Reference
> independent): On puts BASESIMP and AIM-2 in the annual stream and holds F280's internal gains in S09 (70 W per person, Cl.
> 6.2.4; 4 W/m2, 800 W floor, Cl. 6.2.5); Off hides every F280-only input and S21 and runs OBJECTIVE's methods. S21 computes F280's
> way in either mode: BASESIMP (Cl. 5.2.2.1), AIM-2 (Cl. 5.2.3, 6.2.6), ventilation (Cl. 5.2.3.2, 6.2.7 with ATRE), design-hour
> solar (Cl. 6.2.2.1), Table 3's opaque solar correction (Cl. 6.2.1), the gains of Cl. 6.2.4 / 6.2.5. An input a method cannot give
> makes its readers Unavailable, never 0. The house CSV carries every F280 input (`test/csvRoundTripF280.spec.cjs`). Sample
> Projects carries a "CSA F280 Review Format" row under each Part 9 house (`tools/f280/review_case.py`,
> `test/f280ReviewCases.spec.cjs`): ONE building, the Target OBJECTIVE's (F280 Mode Off, the case study's own) and the Reference
> the identical house under F280 Mode On (Andy 2026-11-20; until then the Target ran F280 and the Reference was the case's
> code-minimum one). Under Mode On every house reads below its bills, because F280's design-hour gains also become
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

## Note to Kieran: the validation proposal, Rev. 4

*From Andy and Claude, 2026-11-20, on "Proposal: OBJECTIVE Standards Validation" (Rev. 4, 2026-11-19), before it goes to
the OpenBuilding directors.* The proposal is clear and the methodology is sound. Most of what follows comes from the F280
work already in this README and is there to make your requirements matrix concrete.

**Must fix**

1. **Schedule order, Phase 2.** 2.1 (ASHRAE 140 requirements matrix, due 26 Dec) falls after 2.2 (assessment, due 23
   Dec). The matrix must come first.
2. **Roles under Cl. 8.2.** F280 separates the *qualified operator*, who builds the base case and runs the software,
   from the *verification agent*. As set up, Andy is the operator and you are the verification agent: you check the
   base case, make the variants, compare to Annex J and write the report. Objective 2 currently says you run OBJECTIVE.
   State the split, since the independence is what makes the report credible.
3. **Name the claim and the base case.** The whole-house claim is Cl. 8.1.2 b): 8.3.2, 8.3.4–8.3.9 and the 8.4.1 band.
   Add Cl. 8.3.1, the base case (F280-1, Archetype 1 / 2010s / Ottawa), to the scope list: everything else is a
   variant of it.

**Should add**

4. **State the acceptance criterion now.** Cl. 8.4.1 prescribes it, so "standard-defined tolerance" can be replaced
   with the actual band. A result passes if it is at least 98 % of Annex J's value or no more than 146.5 W below it,
   and at most 120 % or no more than 146.5 W above it.
5. **The gain comparison basis.** Annex J's "gain" is the *nominal* cooling capacity: Cl. 6.3.1, LM 1.3 × the sensible
   gain, not the sensible sum. Compared against the sensible figure, a correct result looks like a 30 % fail. Put the
   basis in the matrix explicitly. The current results are loss 11 680 W against 11 787 (99.1 %) and nominal gain
   7347 W against 7321 (100.4 %).
6. **Pre-declared exclusions, with reasons.** These are not modelled in a single-zone tool:
   - 8.3.3 and 8.3.4 b (room-by-room tests);
   - 8.3.5 b–c (no interior-shading input).

   Also confirm whether 8.3.10 (foundation, c–d) is in scope: Annex J values for it exist in the fixture.
7. **Known open items, to carry as "Investigation required":**
   - the eight orientation turns land 85–142 W short of Annex J's change (about 5 %);
   - 8.3.6 b (no external shading) reads 35 W over;
   - house volume Vb with or without the joist spaces (+47.2 m³; we follow NRCan's definition);
   - a suspected erratum in 8.3.9 a): the Vancouver 1960s Archetype 2 row repeats Vancouver 1980s Archetype 1 digit
     for digit.
8. **The 31 other 8.3.9 cases.** Only F280-1 is built. Say who builds the remaining 31 location/vintage cases
   (operator work) and whether that fits the fixed fee and the 30 Nov date.
9. **Base-case input review.** `docs/f280/F280-1-crosswalk.md` lists all 96 inputs with a status: standard, derived,
   equivalent, estimate or placeholder. Your review should give every "estimate" and "placeholder" row a disposition.
10. **Use, or independently check, the existing harness.** `test/f280WholeHouse.spec.cjs` already runs the base case and
    variants against Annex J and records the 8.4.1 band, but the band is not enforced (`ENFORCE_BAND = false`) until
    the verification agent signs off. Say whether you will rerun the comparisons yourself or audit the harness. Your
    sign-off can be the concrete act that turns that gate on.
11. **Reference-data provenance.** Annex J's values in `test/fixtures/f280-annex-j.json` were transcribed twice
    independently and checked against the printed pages. As verifier you should confirm them against the PDF yourself.

**Scope statements the directors will need**

12. **F280 verifies design loads, not energy.** Annex J compares design-condition capacity in watts only. Nothing in
    this phase validates OBJECTIVE's annual TEUI. The "CSA F280 Review Format" comparisons on the four case-study houses
    are diagnostic, not F280 tests.
13. **ASHRAE 140 acceptance.** 140 is a method of test. Confirm whether the Class II reference ranges are normative
    acceptance criteria or informative. If informative, report "within the reference range" rather than "pass".
14. **ASHRAE 140 settings.** Class II §12.2.1.13 requires no latent heat extraction; OBJECTIVE has an ASHRAE 140 setting
    for that (S13 latent method). Also check which Class II cases need hourly behaviour a static single-zone tool can't
    represent, and list them as not applicable.

**Consider**

15. **Re-test loop.** If a Fail is fixed during the engagement, how many re-tests does the fixed fee cover? Each one
    needs a build hash recorded (A.3).
16. **Version identifier.** For the web app this is the git commit hash (`src/build-info.js`) plus the repository it
    was run from (andy-rnd or the live objective).
17. **Distribution.** The evidence package contains CSA's and ASHRAE's reference values. Keep it internal; the F280
    cases are deliberately sandboxed in andy-rnd.
18. **A signed statement.** A brief statement of qualifications and independence, and a signed conformance statement
    limited to the defined scope in each report.

Points 13 and 14 rest on our reading of ASHRAE 140's structure, not on its text: please check them against the standard.

## The files

| File | What |
|---|---|
| `test/computation/case-studies/F280-1-Archetype1-2010s-Ottawa.csv` | The base case (Cl. 8.3.1) as an OBJECTIVE case CSV |
| `docs/f280/F280-1-crosswalk.md` | Each of its 96 fields: value, status (standard · derived · equivalent · estimate · placeholder), source table |
| `tools/f280/build_case.py` | Builds both from Annex G.1's plans and imperial take-offs, Annexes H.3 / I.3 and Tables 6F / 6I; each table marked with the PDF page it was checked against (2026-11-19) |
| `test/fixtures/f280-annex-j.json` | Annex J's expected values: all 32 models of 8.3.9 (W and Btuh, each pair cross-checked) and the base case's variant changes |
| `tools/f280/annex_j_fixture.py` | Builds that fixture from two independent readings: the 8.3.9 a) table from the text extract, and a transcription of the printed pages (every Annex J table, each with its page). It fails unless the two agree on all 32 rows. `python3 tools/f280/annex_j_fixture.py <2421751-F280.txt>` rebuilds; `--check` confirms the committed fixture. To verify: open the PDF at the page given in the script, compare, rerun |
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
| 03 Hemmingford | 57.1 | 57.9* | 57.3 | 56.3 |
| 02 Collingwood | 103.4 | 99.6 | 84.7 | 103.5 |
| 12 Hawkesbury | 63.4 | 64.0 | 46.6 | 57.8 |
| 10 Port Credit | 13.2 | 13.3* | −11.8 (net of on-site PV) | 14.8 |

\* Measured with B.19.4 blank (AIM-2 at storeys × F2F, 4.05 m). Since 2026-11-20 Hemmingford types B.19.4 = 4.69 m:
a 1.5-storey house with pony walls under a cathedral ceiling, so its highest ceiling is the ridge (Wombat's, eave 3.82 +
rise 0.87, until the drawings give it). That moved the "+ F280's gains" figure 56.7 → 57.0 (infiltration 498 → 541 kWh);
this column was not re-measured. Since the same day Hemmingford and Port Credit also carry Wombat's footprint
from Andy's screenshots (S19 19.1 aspect −1.10 and −0.10, gable roofs): G.4.6 is blank in both, so BASESIMP takes
Wombat's perimeter, 47.65 → 44.14 m and 58.21 → 50.47 m, and its ground loss rises (1002 → 1064 kWh; 4129 → 4427 kWh).
The "+ F280's gains" figures moved 57.0 → 57.3 and −12.1 → −11.8; the starred column was not re-measured.

The "BASESIMP + AIM-2 only" column isolates F280's heat-loss methods (foundation, air leakage): they move TEUI by
−3.8 to +0.8. The gains move it by −1.2 to −25.4. For Annex J none of this matters: Annex J compares design W
(above), never annual energy. It matters for any claim that "F280, annualized, predicts energy use".

## BASESIMP and the footprint's shape: why a longer slab can read LESS loss (2026-11-20)

**The question (Andy):** a 12 × 12 m footprint has 48 m of perimeter; the same 144 m² as 6 × 24 m has 60 m, so
arguably more heat loss, more slab edge. Yet giving Hemmingford's slab a longer outline LOWERED its F280 ground loss
(perimeter 44.14 → 47.65 m: 1064 → 1002 kWh).

**What F280 assumes.** Cl. 5.2.2.1 sends every foundation element through NRCan's BasementHLR / SlabOnGradeHLR
(BASESIMP). BASESIMP sees a RECTANGLE, outside length × width; the exposed fraction of the perimeter only scales the
loss of an attached foundation. There is no perimeter method in F280. OBJECTIVE turns S11's area and S03 G.4.6 (or
Wombat's outline) into that rectangle (L + W = P/2, L × W = A), so the perimeter matters only through the WIDTH it
implies.

**BASESIMP splits the loss in two, and they answer shape in opposite directions** (BaseSimp REPORT §2.2–2.3):
- the EDGE, above grade: `Sag = SUMUO × 2(L + W)`, proportional to perimeter. It behaves like a floor header: more
  perimeter, more loss.
- the CORE, below grade to the deep ground: `Sbg,avg = SUMUR × {2(L − W) + 4·W·Fcs}`, where SUMUR rises with the slab's
  WIDTH, `(q2 + r2·width) / wtable^(s2 + t2·width)`: heat under the middle of a wide slab has nowhere to go but down.

At ordinary insulation the two balance and the core follows AREA, as physics expects. At high insulation the core's
insulation-dependent part fades, the width term is left, and a narrow slab's core reads far smaller than a square
one's (`Basesimp.compute`, the Ottawa SCB_31 fixture's ground and weather):

| Slab (A = 144 m²) | P | Edge `Sag` | Core `Sbg,avg` | Area / RSI, the most the board can pass |
|---|---|---|---|---|
| RSI 1.76, 12 × 12 | 48 m | 1.93 W/K | 33.65 W/K | 81.82 W/K |
| RSI 1.76, 24 × 6 | 60 m | 2.41 W/K | 34.09 W/K | 81.82 W/K |
| RSI 8.75, 12 × 12 | 48 m | 2.26 W/K | **18.75 W/K** | 16.46 W/K |
| RSI 8.75, 24 × 6 | 60 m | 2.83 W/K | 10.49 W/K | 16.46 W/K |

Hemmingford (106.45 m², slab RSI 8.75, SCB_31): edge 321 → 343 → 370 kWh as the outline lengthens (square, −1.10,
−2.0), core 855 → 615 → 515 kWh; the core wins.

**The square RSI 8.75 slab breaks a physical bound.** All heat leaving downward passes through the sub-slab board
(SCB_31: "bottom fully insulated", under the footings too), so the core conductance cannot exceed area / RSI unless
the soil beneath is colder than the ground temperature BASESIMP uses. BASESIMP gives 14 % over that bound for 12 × 12
(Hemmingford's square shape: 13.23 vs 12.17 W/K, 9 % over); at RSI 1.76 and 5 every shape is well under it. All of
these inputs are inside the report's fitted range (width 5–12 m, width ≤ length, RSI 1.5–9.0), so this is the
correlation's own error near the top of its RSI range, not an extrapolation and not a port error (`Basesimp.js`
matches SlabOnGradeHLR to 1e-9, `test/basesimpSlab.test.cjs`). The reading: **the edge behaves as intuition says; the
"longer loses less" result comes from the correlation over-reading a wide, heavily insulated slab's core.** F280
requires BASESIMP, so its figures carry this.

**What follows for inputs:** BASESIMP should get each foundation's true outside L × W. A jogged or L-shaped plan's
true perimeter, turned into an equivalent rectangle, makes that rectangle NARROWER than the house, and for a
well-insulated slab the width BASESIMP sees moves the result more than the perimeter does.

## Peak loads: OBJECTIVE vs F280 on the four Part 9 houses (measured 2026-11-19)

Each house loaded as its case study (OBJECTIVE, F280 Mode Off) and as its "CSA F280 Review Format" case (Mode On; since
2026-11-20 that case's Reference, the same figures), every
figure read from the app (`main` at `04c72b4`). **No column is "reality":** the bills give annual energy only, so nothing
measured says what these houses' peak loads are. Note the scopes: OBJECTIVE's S15 heating peak (T.6.4, `d_137`) is the
ENCLOSURE ONLY (no leakage, no ventilation); its cooling peak (T.6.5, `d_139`) is SENSIBLE, with the cooling season's
AVERAGE solar. F280's figures (S21) are full design loads.

**Heating peak (kW)**

| House | OBJECTIVE enclosure (Off) | F280 enclosure (On) | F280 air: leakage + ventilation | F280 total design loss |
|---|---|---|---|---|
| 03 Hemmingford | 3.13 | 3.24 | 0.73 | **3.97** |
| 02 Collingwood | 6.97 | 6.82 | 0.57 | **7.38** |
| 12 Hawkesbury | 2.87 | 2.97 | 0.57 | **3.54** |
| 10 Port Credit | 8.69 | 8.62 | 3.97 | **12.58** |

The envelopes agree within ±4 % (OBJECTIVE's ground at 10 °C vs F280's BASESIMP). The whole difference is AIR, which
OBJECTIVE's S15 heating peak does not carry: small in the tight PH houses (~0.6 kW), but 4 kW at Port Credit, 32 % of the
design loss (AIM-2 on a large semi-detached volume, 1476 m³, and an HRV at 55 % recovery). OBJECTIVE's heating peak
under-reads wherever the air terms matter.

**Cooling peak (kW)**

| House | OBJECTIVE sensible (Off) | F280 sensible (T.6.11) | F280 nominal x 1.3 (T.6.12, Annex J's) | S21 nominal (Annex B latent) |
|---|---|---|---|---|
| 03 Hemmingford | 6.98 | 8.44 | 10.97 | 9.38 |
| 02 Collingwood | 3.50 | 3.24 | 4.21 | 3.91 |
| 12 Hawkesbury | 2.48 | 3.35 | 4.35 | 4.12 |
| 10 Port Credit | 5.84 | 5.24 | 6.81 | 6.49 |

Sensible against sensible, it splits by house type. In the two SB12 houses OBJECTIVE is 8-12 % HIGHER (its own internal
gains, 5 W/m² plug plus lighting and equipment, exceed F280's 4 W/m² for everything). In the two PH houses it is
17-26 % LOWER: they have large glazing, and F280 takes DESIGN-HOUR solar by facing (Cl. 6.2.2.1) where OBJECTIVE's peak
averages the season's solar (the first run's finding 2, still true of S15). With the latent added, either F280 nominal
is above OBJECTIVE's sensible figure for every house.

Side notes:
- **Hemmingford's F280 cooling looks wrong:** 11 kW nominal on 152 m², for a house that has no cooling (S13 "No
  Cooling") and no overheating on record. That is the 8.4 kW design-hour sensible gain: most likely unshaded PH glazing at
  full design-hour solar. Check the case's summer shading before reading anything into it.
- **Mode On moves OBJECTIVE's own cooling peak:** under On, S15 T.6.5 falls (Collingwood 3.50 -> 1.87 kW) because S09
  then carries F280's smaller gains - as ruled (On = F280's gains), and the same effect as on TEUI (the section above).
- Mode Off leaves S21's loss Unavailable on the three slab houses: their case studies carry no BASESIMP slab
  configuration (S03 G.4.4); their review cases do.

**In short:** OBJECTIVE's ENVELOPE heating agrees with F280's within 4 %, but its peaks omit what F280 adds - the air in
heating, the latent in cooling - and its cooling peak averages the solar F280 takes at the design hour. Without measured
peaks, these houses cannot say which is nearer the truth.

## Matching the gains by OBJECTIVE's own inputs (Andy 2026-11-18) - SUPERSEDED 2026-11-19 for S21

S21 now takes Cl. 6.2.4 / 6.2.5 directly (the section above); F280-1's sensible gain 7040 → 5155 W (70.4 % read as sensible;
compared as Annex J's nominal, 1.3 x, the gain now passes: 100.4 %, the current state above). Kept for the
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
  SHGC 0.47 - the extract had given 0.64 / 0.40. Loss 10 839 -> 11 528 W (97.8 %), sensible gain 5155 -> 5619 W; with the plans and Annex J's nominal (x 1.3)
  that became the PASS on both (99.1 % / 100.4 %).
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
