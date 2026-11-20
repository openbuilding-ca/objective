#!/usr/bin/env python3
"""The "CSA F280 Review Format" case beside each Part 9 case study (Andy 2026-11-19).

    python3 tools/f280/review_case.py            # writes all four, checks the untouched cases are unchanged

Each review case is ONE house read two ways (Andy 2026-11-20: "Target uses OBJECTIVE values, Reference uses
F280 values"): the TARGET is the case study's own Target, F280 Mode Off (OBJECTIVE's methods); the REFERENCE
is the IDENTICAL building - the Target row, copied - with F280 Mode On (BASESIMP + AIM-2 in the annual
stream, F280's internal gains). Both rows carry the house's foundation and AIM-2 facts (Andy's, 2026-11-19,
ABCD.EARTH ABCD-OBJECTIVE-PRO.md §0), so S21 reads F280's way in either model, and every column is written
on both rows, so nothing is inherited from the project loaded before it. (Until 2026-11-20 the Target ran
F280 and the Reference was the case's code-minimum Reference: the 296 TEUI on Hemmingford's Reference.)

Inputs left blank (0) on purpose, each taking the house's own figure:
  G.4.6 h_26  exposed perimeter      -> Wombat's footprint perimeter (S19 19.2b)
  B.19.3 d_112 ELA for Custom        -> from S12's ACH50 in effect (B.18.4's rule)
  B.19.4 g_112 highest ceiling       -> storeys x S12's Typ. F2F Ht.
Never touches the case studies themselves (src/template/case-studies/<NN>-*.csv): it reads them.
"""
import csv
import io
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
CASES = ROOT / "src" / "template" / "case-studies"

# The F280 inputs a review case writes, with the label the app's export gives each column (F280-1's
# header), and the value each takes when nothing below sets it (the field defaults; Reference and Target).
COLUMNS = {
    "f280_mode": ("F280 Mode", "Off"),
    "l_25": ("Foundation Configuration (BASESIMP)", "1"),
    "d_26": ("Depth Below Grade", "2.06"),
    "h_26": ("Exposed Perimeter", "0"),
    "l_26": ("Soil Conductivity", "0.85"),
    "d_26b": ("Water Table Depth", "8"),
    "l_123": ("ATRE (F280)", "0"),
    "g_111": ("Air Tightness (AIM-2)", "Custom"),
    "d_112": ("ELA at 10 Pa for Custom (cm²)", "0"),
    "g_112": ("Highest Ceiling Above Grade (m)", "0"),
    "d_112b": ("Building Site Terrain", "4"),
    "g_112b": ("Weather Station Terrain", "3"),
    "d_112c": ("Wall Shielding", "2"),
    "g_112c": ("Flue Shielding", "2"),
    "d_112d": ("House Type", "Detached"),
    "g_112d": ("Foundation Type", "Full"),
    "d_112e": ("Ventilation Balance", "Balanced"),
    "g_112e": ("Flue Diameter (mm)", "0"),
}

# Per house: the Target's F280 inputs. Configuration numbers are FoundationCC.xls's (BSMCFG.TXT's words).
# All four heat by electricity or heat pump (no flue) and ventilate through an HRV / ERV (Balanced).
REVIEW = {
    "03-residence-phi-classic.csv": {
        # slab on grade, "fully insulated. Slab edge also": SCB_31, bottom fully insulated incl. under the
        # footings, thermal break at the edge
        "l_25": "81", "d_112d": "Detached", "g_112d": "Slab-on-Grade",
    },
    "02-residence-sb12-net-zero.csv": {
        # slab on grade, "full insulated frostwall and uninsulated footings. Frost wall depth is 5'":
        # SCB_33, bottom insulated except under the footing, edge break, vertical skirt. BASESIMP's skirt is
        # 0.6 m (BASESIMP_configurations.pdf), the 1.52 m frost wall cannot be entered; the shallower skirt
        # loses more, so the figure errs over
        "l_25": "56", "d_112d": "Detached", "g_112d": "Slab-on-Grade",
    },
    "12-residence-phi-low-energy.csv": {
        # "a crawlspace building": BASESIMP has no crawl-space family; its slab configurations are "concrete
        # or soil (for crawl space) floor" (BSMCFG.TXT), and S11 carries the crawl floor as the slab (no
        # below-grade wall). SCB_31 as Hemmingford, the floor's insulation detail to confirm with Andy
        "l_25": "81", "d_112d": "Detached", "g_112d": "Crawl Space",
    },
    "10-residence-sb12-duplex.csv": {
        # "full basement with a walkout portion on the South elevation": BCIB_4, interior insulation full
        # height, slab fully insulated except under footings, thermal break. ONE element at the full depth:
        # F280 Cl. 5.2.2.1 takes each foundation element on its own depth, and OBJECTIVE has one foundation
        # (the walkout's shallower element: open, with Andy)
        "l_25": "22", "d_112d": "Semi-Detached", "g_112d": "Full",
    },
}


def review_name(case):
    return case.replace(".csv", "-f280.csv")


def build(case, settings):
    text = (CASES / case).read_text(encoding="utf-8")
    rows = list(csv.reader(io.StringIO(text)))
    header, target = rows[0], rows[1]
    ids = [h.split(":")[0] for h in header]
    target += [""] * (len(header) - len(target))
    for fid, (label, default) in COLUMNS.items():
        if fid in ids:
            raise SystemExit(f"{case}: already has {fid}; edit the case, not this script")
        header.append(f"{fid}: {label}")
        target.append(settings.get(fid, default))  # f280_mode: "Off", OBJECTIVE's methods
    name = ids.index("h_14")
    target[name] = f"{target[name]} (CSA F280 Review Format)"
    reference = list(target)  # the identical building
    reference[header.index("f280_mode: F280 Mode")] = "On"
    # The identical MACHINE too, as Mirror All Inputs makes it (ReferenceToggle): the Target's heat pump
    # cools at M.1.3, computed from its HSPF; the Reference's at its own M.3.3, the standard's minimum when
    # blank (Andy 2026-10-31 / 11-19). So the Reference's M.3.3 is the Target's COPc, by MechanicalNodes'
    # formulas (copHeat = HSPF / 3.412; copCoolDerived = max(1, copHeat - 1), each to 4 places).
    # f280ReviewCases.spec.cjs holds it: the Reference turned Off reads the Target's TEUI.
    heating, cooling = target[ids.index("d_113")], target[ids.index("d_116")]
    if heating == "Heatpump" and cooling not in ("No Cooling", "Separate Cooling"):
        cop_heat = round(float(target[ids.index("f_113")]) / 3.412, 4)
        reference[ids.index("j_116")] = f"{max(1.0, round(cop_heat - 1, 4)):.4f}"
    out = io.StringIO()
    csv.writer(out, lineterminator="\n").writerows([header, target, reference])
    return out.getvalue()


def main():
    for case, settings in REVIEW.items():
        before = (CASES / case).read_bytes()
        path = CASES / review_name(case)
        path.write_text(build(case, settings), encoding="utf-8")
        if (CASES / case).read_bytes() != before:
            sys.exit(f"{case} changed")
        print(f"wrote {path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
