#!/usr/bin/env python3
"""Build F280 test cases as OBJECTIVE case-study CSVs, with a crosswalk of every input's source.

    python3 tools/f280/build_case.py

Writes
  test/computation/case-studies/F280-1-Archetype1-2010s-Ottawa.csv   (the case, harness only)
  docs/f280/F280-1-crosswalk.md                                       (each field: value, source, status)

SANDBOX ONLY (Andy, 2026-11-18): the F280 cases live in andy-rnd's harness, never in the shipped
dropdown (src/template/case-studies) or the public repo.

F280-12 Cl. 8.3.1: the qualified operator produces the base case (Archetype 1, 2010s vintage,
Ottawa (Orleans)); the verification agent (Kieran) checks it is modelled as specified. Every value
below cites its table. Status says how far to trust it:
  standard   - read from the standard's table (text extract; Kieran checks against the PDF)
  derived    - arithmetic on standard values, shown in the crosswalk
  equivalent - an equivalent input (ASHRAE 140 Cl. 5.2.1.5 in spirit): OBJECTIVE has no direct field
  estimate   - not in the text extract (the floor plans G.1.1-G.1.3 are images); take off the PDF
  placeholder- needs a method OBJECTIVE lacks; the value is a stand-in and the gap is named
  objective  - OBJECTIVE's own standard option (Andy: match gains by OBJECTIVE's inputs, never a new method)

Units: Annex G's imperial take-offs are used (the SI tables come through the extract column-
shifted; the imperial ones multiply out). 1 ft2 = 0.09290304 m2 exactly.
"""
import csv
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
TEMPLATE = os.path.join(ROOT, "test/computation/case-studies/12-AberdeenHouse.csv")
OUT_CSV = os.path.join(ROOT, "test/computation/case-studies/F280-1-Archetype1-2010s-Ottawa.csv")
OUT_MD = os.path.join(ROOT, "docs/f280/F280-1-crosswalk.md")
FT2 = 0.09290304

# ---- Annex G.1 take-offs, Archetype 1 (imperial) -------------------------------------------
# Table G.1.11 a) windows: (room, facing, width ft, height ft, overhang ft, drop ft, area ft2)
WINDOWS = [
    ("Base area 1", "N", 4.50, 1.33, 1.33, 9.85, 6), ("Base area 1", "N", 4.50, 1.33, 1.33, 9.85, 6),
    ("Family", "N", 3.33, 6.33, 1.33, 8.85, 21), ("Family", "N", 3.33, 6.33, 1.33, 1.00, 21),
    ("Family", "E", 2.00, 6.00, 1.33, 8.85, 12), ("Family", "E", 2.00, 6.00, 1.33, 8.85, 12),
    ("Nook", "N", 5.00, 6.67, 1.33, 8.85, 33.3), ("Entry", "S", 1.50, 6.67, 4.00, 2.00, 10),
    ("Entry", "S", 4.33, 1.00, 4.00, 1.00, 4), ("Living", "S", 8.00, 6.67, 1.33, 8.85, 53),
    ("Stairs", "W", 4.00, 4.00, 1.33, 1.00, 16), ("Dining", "N", 5.50, 6.33, 1.33, 8.85, 35),
    ("Master", "S", 3.58, 1.33, 1.33, 1.00, 5), ("Master", "S", 7.50, 4.75, 1.33, 2.33, 35.6),
    ("Ensuite", "S", 5.00, 4.00, 1.33, 1.00, 20), ("Bed 2", "S", 8.00, 5.67, 1.33, 2.50, 45),
    ("Bed 2", "S", 3.83, 1.50, 1.33, 1.00, 6), ("Bed 3", "N", 6.00, 4.00, 1.33, 1.00, 24),
    ("Bath", "N", 2.00, 3.50, 1.33, 1.00, 7), ("Bed 4", "N", 4.00, 4.00, 1.33, 1.00, 16),
]
# Annex A: the shade-line factor F by facing and north latitude (40, 45, 50, 55); north has none.
SHADE_F = {"E": (0.8, 0.8, 0.8, 0.8), "W": (0.8, 0.8, 0.8, 0.8), "S": (2.6, 2.0, 1.7, 1.4)}
# Cl. 6.2.2.1: design solar W/m2 by facing; south (and SE/SW) take the latitude factor.
SOLAR0 = {"N": 93, "E": 285, "W": 285, "S": 160}
LATITUDE = 45.47   # Ottawa (Orleans): ESTIMATE, Kieran confirms F280's latitude for the location
# Table G.1.10 a) doors: (room, facing, area ft2); "Up" = attic hatches in the ceiling
DOORS = [("Entry", "E", 20), ("Entry", "S", 20), ("WIC", "N", 9), ("WIC", "Up", 4),
         ("Laundry", "Up", 4), ("Laundry", "Up", 4)]
# Table G.1.8 a) above-grade walls: area ft2 per row (gross; see the crosswalk's note)
WALLS = [140, 175, 11, 132, 81, 40, 29, 7, 34, 49, 80, 71, 169, 116, 139, 100, 116, 73, 49,
         162, 142, 64, 148, 102, 89, 102, 47, 26, 99, 80]
# Table G.1.7 a) rim joists: lengths ft, all at height 0.77 ft
RIM_LENGTHS = [37.69, 2.17, 34.02, 14.02, 41.48, 5.22, 19.97, 15.43, 9.85, 1.17, 14.54, 11.95,
               3.24, 0.77, 3.71, 5.34, 8.86, 7.78, 18.87, 12.03, 8.08, 11.06, 12.81]
RIM_HEIGHT = 0.77
# Table G.1.9 a) ceilings ft2
CEILINGS = {"Family": 95.1, "Nook": 11.1, "Stairs": 103.7, "WIC": 54.7, "Master": 305.3,
            "Ensuite": 100.4, "Bed 2": 180.3, "Bed 3": 140.0, "Bath": 63.3, "Laundry": 80.6,
            "Bed 4": 139.8}
# Table G.1.6 a) exposed floors ft2 (the rooms over the garage)
EXPOSED_FLOORS = {"Master": 264.3, "Ensuite": 4.9, "Laundry": 0.8}
# Table G.1.5 a) basement walls: (length ft, height ft, depth below grade ft)
BASEMENT_WALLS = [(86.69, 7.75, 6.75), (66.63, 7.75, 6.75)]
# Table G.1.4 a) basement slab ft2
SLAB = [546.8, 425.3]
BEDROOMS = ["Master", "Bed 2", "Bed 3", "Bed 4"]

# ---- Annex H.3 (2010s vintage) and Annex I.3 (2010s effective RSI, SI) ------------------------
RSI = {"ceiling": 9.050, "exposed_floor": 5.348, "basement_wall": 2.760, "slab": 0.0,
       "wall_brick": 3.429, "house_garage_wall": 3.364, "rim": 3.587, "house_garage_header": 3.362}
ACH50 = 1.5            # Table H.3.2
PVC_LS = 51.91         # Table H.3.3 b), HRV-simplified
ASE_PCT = 76           # Table H.3.3 b), apparent sensible effectiveness
WINDOW_RSI, WINDOW_SHGC = 0.64, 0.40   # Table 6F: operable vinyl, insulating spacer, low-e, 13 mm argon
DOOR_RSI = 1.1         # Table 6I: insulated metal, polyurethane core, no storm door


def m2(ft2):
    return ft2 * FT2


def shade_factor(d):
    lats = (40, 45, 50, 55)
    f = SHADE_F[d]
    x = min(max(LATITUDE, lats[0]), lats[-1])
    for i in range(3):
        if lats[i] <= x <= lats[i + 1]:
            return f[i] + (f[i + 1] - f[i]) * (x - lats[i]) / (lats[i + 1] - lats[i])
    return f[-1]


def summer_shading(d):
    """Annex A's shaded area for one facing, as OBJECTIVE's Summer Shading % on that window row.

    Cl. 6.2.2.1 treats a shaded area as north-facing (93 W/m2), so the share of the facing's solar that
    the overhangs remove is shaded/total x (1 - 93 / Solar). North windows: no shading change (already north).
    """
    if d == "N":
        return 0, "north: Cl. 6.2.2.1 treats shade as north-facing, so no change"
    f = shade_factor(d)
    shaded = total = 0.0
    for _room, facing, w, h, o, drop, _a in WINDOWS:
        if facing != d:
            continue
        s = f * o
        shaded += min(h * w, w * max(0.0, s - drop))
        total += h * w
    lf = min(1.3, max(0.7, 1 + (LATITUDE - 40) * 0.0375)) if d == "S" else 1.0
    solar = SOLAR0[d] * lf
    pct = 100 * (shaded / total) * (1 - SOLAR0["N"] / solar) if total else 0
    return round(pct, 2), (
        f"Annex A: F {f:.3f} (lat {LATITUDE}), shaded {shaded:.1f} of {total:.1f} ft2 (W x H); shaded area at "
        f"north's 93 W/m2 vs {solar:.1f} -> {pct:.2f} % of this row's solar removed")


def build():
    rows = []  # (field, label, value, status, source, both_rows)

    def put(field, value, status, source, both=True):
        rows.append((field, value, status, source, both))

    win = {d: m2(sum(w[6] for w in WINDOWS if w[1] == d)) for d in "NESW"}
    wall_doors_ft2 = sum(a for _, f, a in DOORS if f != "Up")
    doors_ft2 = sum(a for _, _, a in DOORS)
    walls_gross = m2(sum(WALLS))
    walls_net = walls_gross - sum(win.values()) - m2(wall_doors_ft2)
    rim = m2(sum(RIM_LENGTHS) * RIM_HEIGHT)
    wall_area = walls_net + rim
    wall_rsi = wall_area / (walls_net / RSI["wall_brick"] + rim / RSI["rim"])
    ceiling = m2(sum(CEILINGS.values()))
    exposed = m2(sum(EXPOSED_FLOORS.values()))
    bsmt_wall = m2(sum(l * h for l, h, _ in BASEMENT_WALLS))
    slab = m2(sum(SLAB))
    upper = m2(sum(v for k, v in CEILINGS.items() if k not in ("Family", "Nook")))
    floor_area = slab + slab + upper        # basement + main (on the basement's footprint) + upper
    volume = slab * 2.36 + slab * 2.77 + upper * 2.46   # storey heights from G.1.5 / G.1.8
    occupants = len(BEDROOMS) + 1           # Cl. 6.2.4: bedrooms + 1 when unknown

    put("h_14", "F280-1 Archetype 1 / 2010s / Ottawa (Orleans)", "standard", "Cl. 8.3.1 base case")
    put("d_12", "C-Residential", "standard", "Part 9 house")
    put("d_13", "NBC T1", "objective",
        "Andy 2026-11-18: NBC T1 (a non-PH standard, so the heating setpoint is the residential 22 C)")
    put("d_14", "Targeted Use", "equivalent", "a design case, no bills")
    put("d_19", "ON", "standard", "Cl. 8.3.1 Ottawa (Orleans)")
    put("h_19", "Ottawa (Orléans)", "standard", "Cl. 8.3.1; OBJECTIVE's station 6106001, NBC Note A-9.36.6.5.(1)")
    put("d_39", "Pt.9 Res. Stick Frame", "standard", "Annex H.3: 2x6 wood frame")
    # Cl. 5.2.2.1: foundation elements in contact with soil by BasementHLR.xls (BASESIMP), S03 G.4.3-G.4.8
    put("h_25", "BASESIMP", "standard", "Cl. 5.2.2.1: BasementHLR.xls for every foundation element in contact with soil")
    put("l_25", 1, "equivalent",
        "BCIN_1 (FoundationCC #1): concrete walls and floor, interior insulation full height (Table H.3.8: 203 mm "
        "concrete, 2x6 @ 16 in w/R20 batt; H.3.9 slab uninsulated); the walls' 2.760 (f_94, Table I.3) is the added RSI")
    put("d_26", 2.06, "standard", "Table G.1.4/G.1.5 b): depth below grade 2.06 m, both base areas")
    put("h_26", 46.72, "derived",
        "Table G.1.4 b): exposed perimeters 26.42 + 20.30 m; with d_95 a 18.47 x 4.89 m rectangle, height d_94 / 46.72 "
        "= 2.363 m (G.1.5: 2.36); one foundation reads 1387 W against F280's two rooms 1384 W (791 + 593)")
    put("l_26", 0.85, "standard", "H.3.1 'Dry sand, loam, clay': BasementHLR.xls's suggested value (Cl. 5.2.2.1 b))")
    put("d_26b", 8, "standard", "H.3.1 'Normal (23-33 ft, 7-10 m)': BasementHLR.xls's suggested value")
    put("h_21", "Capacitance", "standard",
        "Andy 2026-11-18: OBJECTIVE ground-couples through the Capacitance setting (the template had Static)")
    put("h_15", round(floor_area, 2), "estimate",
        f"basement {slab:.2f} (G.1.4) + main on the same footprint {slab:.2f} + upper {upper:.2f} "
        "(G.1.9 ceilings less Family/Nook) m2; take the plans G.1.1-G.1.3 off the PDF")
    put("d_105", round(volume, 1), "estimate",
        "basement x 2.36 m + main x 2.77 m + upper x 2.46 m (heights from G.1.5 / G.1.8); "
        "inside dimensions per Cl. 5.2.3.1's Vb; take off the PDF")
    put("d_63", occupants, "derived", f"Cl. 6.2.4: bedrooms ({len(BEDROOMS)}) + 1")
    put("g_63", 12, "objective", "OBJECTIVE's standard residential schedule, 12 h/day (Andy 2026-11-18)")
    put("d_64", "Normal", "objective", "OBJECTIVE's standard activity level (F280 Cl. 6.2.4 counts 70 W sensible a person)")
    put("d_66", 1.5, "objective", "OBJECTIVE's standard lighting density (F280 Cl. 6.2.5: 4 W/m2 for lights AND appliances)")
    put("g_67", "Regular", "objective", "OBJECTIVE's default equipment spec (the template, a PH house, had Efficient)")
    put("d_80", "NRC 40%", "objective", "OBJECTIVE's default gains utilization (annual heating only; the template had PH Method)")
    for field, d in (("d_74", "N"), ("d_75", "E"), ("d_76", "S"), ("d_77", "W")):
        put(field, round(win[d], 3), "derived", f"Table G.1.11 a): {d}-facing windows summed, ft2 -> m2")
    put("d_78", 0, "standard", "no skylights in G.1.11")
    for field in ("f_74", "f_75", "f_76", "f_77"):
        put(field, WINDOW_SHGC, "standard", "Table 6F (H.3: operable vinyl, double, 13 mm argon, low-e, insulating spacer)")
    for field in ("g_89", "g_90", "g_91", "g_92"):
        put(field, round(1 / WINDOW_RSI, 4), "derived", f"1 / RSI {WINDOW_RSI} (Table 6F)")
    for field in ("g_74", "g_75", "g_76", "g_77"):
        put(field, 0, "standard", "no winter shading in the heating calculation")
    for field, d in (("h_74", "N"), ("h_75", "E"), ("h_76", "S"), ("h_77", "W")):
        pct, why = summer_shading(d)
        put(field, pct, "derived", why)
    put("d_73", round(m2(doors_ft2), 3), "derived",
        "Table G.1.10 a): two entry doors, the WIC knee-wall door and three attic hatches")
    put("f_73", 0, "standard", "opaque doors")
    put("g_88", round(1 / DOOR_RSI, 4), "derived", f"1 / RSI {DOOR_RSI} (Table 6I)")
    put("d_85", round(ceiling, 3), "derived", "Table G.1.9 a): ceilings summed")
    put("f_85", RSI["ceiling"], "standard", "Table I.3 (2010s): ceilings")
    put("d_86", round(wall_area, 3), "equivalent",
        f"Table G.1.8 a) walls {walls_gross:.2f} m2 gross, less windows {sum(win.values()):.2f} and wall "
        f"doors {m2(wall_doors_ft2):.2f} = {walls_net:.2f} net; plus G.1.7 rim joists {rim:.2f}")
    put("f_86", round(wall_rsi, 4), "equivalent",
        f"area-weighted: walls RSI {RSI['wall_brick']} (I.3 brick) and rim RSI {RSI['rim']} (I.3); "
        "the house/garage walls (I.3 RSI 3.364) are not split out of G.1.8")
    put("d_87", round(exposed, 3), "derived", "Table G.1.6 a): floors over the garage")
    put("f_87", RSI["exposed_floor"], "standard", "Table I.3 (2010s): exposed floors")
    put("d_94", round(bsmt_wall, 3), "derived", "Table G.1.5 a): (86.69 + 66.63) ft x 7.75 ft")
    put("f_94", RSI["basement_wall"], "standard",
        "Table I.3 (2010s): basement walls, insulated full height; F280 computes below grade by BASESIMP")
    put("d_95", round(slab, 3), "derived", "Table G.1.4 a): basement slab")
    slab_rsi = round(0.00045 * 102 + 0.17, 3)
    put("f_95", slab_rsi, "derived",
        "the UNINSULATED assembly: Table I.3's 0 is the ADDED insulation; 102 mm concrete (H.3.9) x 0.00045 per mm "
        "(Table 7B, 2400 kg/m3) + OBJECTIVE's slab surface film 0.17 (TransmissionLossNodes.js). Never 0: OBJECTIVE "
        "reads RSI 0 as U 0, zero loss (the RSI-0 bug)")
    put("d_96", round(slab + upper, 3), "estimate", "interior floors: main + upper (estimate)")
    put("d_97", 0, "standard",
        "Andy 2026-11-18, later: \"remove the TB penalty\" for F280-1. Annex I's RSIs are EFFECTIVE (framing "
        "included) and F280 has no thermal-bridge adder. (Earlier the same day: 30 %, OBJECTIVE's default for real buildings.)")
    put("d_108", "MEASURED", "standard", "Table H.3.2")
    put("g_109", ACH50, "standard", "Table H.3.2: 1.5 ACH50")
    put("g_118", "Volume Constant", "equivalent", "a constant principal ventilation rate (PVC)")
    put("l_118", round(PVC_LS * 3.6 / volume, 4), "equivalent",
        f"PVC {PVC_LS} L/s (Table H.3.3 b) x 3.6 / volume; moves with the volume estimate")
    put("l_119", "None", "standard", "no summer boost in F280")
    put("d_118", ASE_PCT, "standard", "Table H.3.3 b): ASE 76 % (OBJECTIVE's field is labelled SRE)")
    put("e_118", "HRV", "standard", "Table H.3.3: HRV-simplified, ATRE 0 %")
    put("l_122", 0, "standard", "ATRE 0 % (Table H.3.3)")
    put("g_59", "F280", "standard", "the latent load at F280's indoor state")
    put("i_122", "F280", "standard", "the L-4 method selector: F280")
    put("l_24", 24, "standard", "F280 cooling indoor 24 C")
    put("d_116", "Cooling", "standard", "central air conditioning sized by Cl. 6.3")
    put("d_113", "Electricity", "objective", "Andy 2026-11-18: Electricity, so gains and losses read in kWh (the template had Heatpump)")
    put("d_46", 0, "objective", "no EV charging (the template had 2787 kWh)")
    put("d_49", "NBC Method", "objective", "Andy 2026-11-18: NBC method; its standby losses flow to gains (the template had User Defined, 170 L/pp/day)")
    put("d_53", 0, "objective", "Andy 2026-11-18: 0 % for NBC 9.36 (42 % would be OBC; the template had 21 %)")
    for field in ("d_27", "d_28", "d_29", "d_30", "d_31", "l_28", "l_29", "l_30", "l_31", "d_44"):
        put(field, 0, "standard", "a design case: no bills, no on-site renewables")
    return rows


NEW_COLUMNS = {
    "h_25": "Ground Heatloss Method",
    "l_25": "Foundation Configuration (BASESIMP)",
    "d_26": "Depth Below Grade",
    "h_26": "Exposed Perimeter",
    "l_26": "Soil Conductivity",
    "d_26b": "Water Table Depth",
}


def main():
    with open(TEMPLATE, newline="", encoding="utf-8") as fh:
        header, target, reference = list(csv.reader(fh))
    # Fields newer than the template (2026-11-19, S03 G.4.3-G.4.8): appended as columns, labelled as the
    # app's CSV export labels them.
    for field, label in NEW_COLUMNS.items():
        if not any(h.split(":")[0].strip() == field for h in header):
            header.append(f"{field}: {label}")
            target.append("")
            reference.append("")
    index = {h.split(":")[0].strip(): i for i, h in enumerate(header)}
    rows = build()
    for field, value, _status, _source, both in rows:
        if field not in index:
            raise SystemExit(f"{field}: not a column of the template")
        target[index[field]] = str(value)
        if both:
            reference[index[field]] = str(value)
    with open(OUT_CSV, "w", newline="", encoding="utf-8") as fh:
        csv.writer(fh).writerows([header, target, reference])
    os.makedirs(os.path.dirname(OUT_MD), exist_ok=True)
    labels = {h.split(":")[0].strip(): h for h in header}
    with open(OUT_MD, "w", encoding="utf-8") as fh:
        fh.write("# F280-1 — Archetype 1 / 2010s / Ottawa (Orleans): the input crosswalk\n\n")
        fh.write("Generated by `tools/f280/build_case.py`. Sandbox only. CSA F280-12 Cl. 8.3.1's base case, built by the\n"
                 "qualified operator; the verification agent checks each row against the PDF (Annexes G, H, I, Tables 6F, 6I).\n"
                 "Template: `12-AberdeenHouse.csv` (fields not listed keep the template's value; the Reference row keeps\n"
                 "its code values except the fields below). Status: standard · derived · equivalent · estimate · placeholder.\n\n")
        fh.write("| Field | Value | Status | Source |\n|---|---|---|---|\n")
        for field, value, status, source, _ in rows:
            fh.write(f"| `{labels[field]}` | {value} | {status} | {source} |\n")
    print(f"wrote {os.path.relpath(OUT_CSV, ROOT)} and {os.path.relpath(OUT_MD, ROOT)} ({len(rows)} fields)")


if __name__ == "__main__":
    main()
