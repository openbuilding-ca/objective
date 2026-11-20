#!/usr/bin/env python3
"""Record SlabOnGradeHLR.xls's own results as the slab witness fixture for src/core/Basesimp.js.

    python3 tools/f280/slab_fixture.py <FoundationCC.xlsx> <slab-*.xlsx> [...] > test/fixtures/basesimp-slab-workbooks.json

Each workbook is SlabOnGradeHLR_2014.xls (NRCan, F280_Package) recalculated and saved as .xlsx BY EXCEL
(tools/f280/slab_variants.py), so every number here is the spreadsheet's own; openpyxl reads the cached
values and evaluates nothing. The CORC and CORC2 pastes are checked against FoundationCC's row for the
configuration and its uninsulated twin, so a stale paste fails here, not in the test.
"""

import json
import os
import sys

import openpyxl

INPUT = {  # Input tab cell -> Basesimp.compute() field (the slab workbook's single "Added insulation" is B17)
    "B7": "length", "B8": "width", "B11": "height", "B12": "depth", "B14": "soilk", "B15": "wtable",
    "B16": "configuration", "B17": "slab", "G7": "exposedPerimeter", "B32": "hdd", "F32": "deepGround",
}


def fcc_rows(path):
    ws = openpyxl.load_workbook(path, data_only=True)["CorrCoef"]
    return {int(r[0]): list(r[2:51]) for r in ws.iter_rows(min_row=4, values_only=True) if r[0] is not None}


def record(path, fcc):
    w = openpyxl.load_workbook(path, data_only=True)
    I, L = w["Input"], w["Loads"]
    p = {v: I[k].value for k, v in INPUT.items()}
    p["interior"] = 0
    p["exterior"] = 0
    p["overlap"] = 0
    p["monthly"] = [I.cell(r, 3).value for r in range(34, 46)]
    p["heating"] = {"month": I["B55"].value, "room": I["B56"].value, "design": I["B57"].value, "slab": I["B58"].value or 0}
    p["cooling"] = {"month": I["B60"].value, "room": I["B61"].value, "design": I["B62"].value}
    cfg = p["configuration"]
    corc = [w["CORC"].cell(r, 1).value for r in range(1, 50)]
    corc2 = [w["CORC2"].cell(r, 1).value for r in range(1, 50)]
    row = fcc[cfg]
    twin = fcc[row[39]] if row[39] > 0 else row
    if corc != row:
        raise SystemExit(f"{path}: CORC is not FoundationCC #{cfg}")
    if corc2 != twin:
        raise SystemExit(f"{path}: CORC2 is not FoundationCC #{cfg}'s twin")
    cols = "CDEF"
    pick = lambda r: {k: L[f"{c}{r}"].value for k, c in zip(["sag", "sbgAvg", "sbgVar", "phase"], cols)}
    return {
        "name": os.path.basename(path),
        "input": p,
        "expect": {
            "rsi1": L["B12"].value,
            "rsi2": L["B14"].value,
            "interpolated": bool(L["B25"].value),
            "set2": pick(19),
            "set1": pick(20),
            "output": pick(26),
            "ca1": L["E31"].value,
            "ca2": L["H31"].value,
            "fhl": [L.cell(r, 7).value for r in range(33, 45)],
            "exposedFraction": I["L7"].value,
            "heatingLoad": L["B48"].value,
            "coolingLoad": L["B53"].value,
        },
    }


def main(fcc_path, paths):
    fcc = fcc_rows(fcc_path)
    print(json.dumps({"source": "SlabOnGradeHLR_2014.xls (NRCan F280_Package), recalculated by Excel",
                      "records": [record(p, fcc) for p in paths]}, indent=1))


if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2:])
