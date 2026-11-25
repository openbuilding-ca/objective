#!/usr/bin/env python3
"""Record BasementHLR.xls's own results as the witness fixture for src/core/Basesimp.js.

    python3 tools/f280/basesimp_fixture.py <FoundationCC.xlsx> <workbook.xlsx> [...] > test/fixtures/basesimp-workbooks.json

Each workbook is a BasementHLR .xls saved as .xlsx by Excel, so every number here was computed BY EXCEL,
from the spreadsheet's own formulas (openpyxl reads the cached values; it evaluates nothing). Two sources:
  * the BWEB2/3/4 workbooks as shipped in F280_Package (NRCan's examples, Winnipeg);
  * variants that tools/f280/basesimp_variants.py had Excel recalculate: the interpolation path (an
    added RSI below 1.5) and CSA F280-12 Archetype 1's two basement rooms (Table G.1.4/G.1.5, BCIN_1,
    Ottawa (Orleans) from F280_Weather.xls).
The CORC and CORC2 tabs hold pasted coefficients; each is checked against FoundationCC's row for the
configuration (Input!B16) and its uninsulated twin, so a workbook with a stale paste fails here.
"""

import json
import sys

import openpyxl

INPUT = {  # Input tab cell -> Basesimp.compute() field
    "B7": "length", "B8": "width", "B11": "height", "B12": "depth", "B14": "soilk", "B15": "wtable",
    "B16": "configuration", "B17": "interior", "B18": "exterior", "B19": "slab", "B27": "overlap",
    "G7": "exposedPerimeter", "H11": "windowArea", "I11": "doorArea", "B32": "hdd", "F32": "deepGround",
}


def fcc_rows(path):
    ws = openpyxl.load_workbook(path, data_only=True)["CorrCoef"]
    return {int(r[0]): list(r[2:51]) for r in ws.iter_rows(min_row=4, values_only=True) if r[0] is not None}


def record(path, fcc):
    w = openpyxl.load_workbook(path, data_only=True)
    I, L, B1 = w["Input"], w["Loads"], w["BS1"]
    p = {v: I[k].value for k, v in INPUT.items()}
    p["monthly"] = [I.cell(r, 3).value for r in range(34, 46)]
    p["heating"] = {"month": I["B55"].value, "room": I["B56"].value, "design": I["B57"].value, "slab": I["B58"].value}
    p["cooling"] = {"month": I["B60"].value, "room": I["B61"].value, "design": I["B62"].value}
    cfg = p["configuration"]
    corc = [w["CORC"].cell(r, 1).value for r in range(1, 50)]
    corc2 = [w["CORC2"].cell(r, 1).value for r in range(1, 50)]
    if corc != fcc[cfg]:
        raise SystemExit(f"{path}: CORC is not FoundationCC #{cfg}")
    twin = fcc[cfg][39]  # iUnInsul (CORC!A40)
    if twin > 0 and corc2 != fcc[twin]:
        raise SystemExit(f"{path}: CORC2 is not FoundationCC #{twin} (#{cfg}'s iUnInsul)")
    cols = "CDEF"
    names = ["sag", "sbgAvg", "sbgVar", "phase"]
    return {
        "source": path.split("/")[-1],
        "inputs": p,
        "expected": {
            "rsi1": L["B13"].value,
            "rsi2": L["B15"].value,
            "interpolated": L["B26"].value,
            "set1": dict(zip(names, (L[f"{c}21"].value for c in cols))),
            "set2": dict(zip(names, (L[f"{c}20"].value for c in cols))),
            **dict(zip(names, (L[f"{c}27"].value for c in cols))),
            "bs1": {k: B1[a].value for k, a in
                    {"sumuo": "B23", "sumur": "B31", "fcs": "B45", "atten": "B53", "fcv": "B60"}.items()},
            "ground": {"tempS": I["B51"].value, "amps": I["B52"].value, "phs": I["B53"].value},
            "fhl": [L.cell(r, 7).value for r in range(34, 46)],
            "heatingLoad": L["B49"].value,
            "coolingLoad": L["B54"].value,
        },
    }


def main(fcc_path, *books):
    fcc = fcc_rows(fcc_path)
    print(json.dumps([record(b, fcc) for b in books], indent=1))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    main(*sys.argv[1:])
