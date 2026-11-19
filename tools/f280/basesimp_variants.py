#!/usr/bin/env python3
"""Have EXCEL compute BasementHLR.xls for inputs the shipped examples don't cover.

    python3 tools/f280/basesimp_variants.py <dir holding BasementHLR_2014.xls and FoundationCC.xlsx>

macOS + Microsoft Excel only (driven by osascript). The directory must be one Excel may write without
asking - its sandbox container, e.g. ~/Library/Containers/com.microsoft.Excel/Data/<folder>. For each
variant it opens a fresh BasementHLR_2014.xls, pastes the configuration's FoundationCC row into CORC and
its uninsulated twin's into CORC2 (as BasementHLR.doc instructs, "Paste special ... Transpose"), sets the
Input cells, recalculates, and saves <name>.xlsx. tools/f280/basesimp_fixture.py then records them.

Variants:
  interp      BWEB_4 (the shipped example) with exterior RSI 1.0: rsi1 1.072, the Loads tab's
              interpolation between BS1 and BS2 (an added RSI between 0.01 and 1.5).
  f280-room1  CSA F280-12 Archetype 1, base area 1 (Table G.1.4/G.1.5 SI): 7.13 x 7.13 m, exposed
  f280-room2  perimeter 26.42 m; base area 2: 6.29 x 6.29 m, exposed 20.30 m. Both: height 2.36, depth
              2.06; BCIN_1 (#1: concrete, interior insulation full height, uninsulated slab) with the
              2010s added insulation of Table I.3 (walls RSI 2.760, slab 0); soil 0.85 W/mK and water table
              8 m (the spreadsheet's suggested values; H.3.1: "Dry sand, loam, clay", "Normal (7-10 m)");
              Ottawa (Orleans) from F280_Weather.xls (HDD 4500, design -26 / 30, deep ground 8, monthly
              -11 -10 -3 5 13 18 21 19 14 8 1 -7); room 22 C heating, 24 C cooling.
"""

import os
import subprocess
import sys

import openpyxl

ORLEANS = [-11, -10, -3, 5, 13, 18, 21, 19, 14, 8, 1, -7]
F280_ROOM = {"B11": 2.36, "B12": 2.06, "B14": 0.85, "B15": 8, "B16": 1, "B17": 2.76, "B18": 0, "B19": 0,
             "B32": 4500, "F32": 8, "B55": 1, "B56": 22, "B57": -26, "B58": 0, "B60": 7, "B61": 24, "B62": 30,
             "H11": 0, "I11": 0}
VARIANTS = {
    "interp": {"config": 139, "input": {"B18": 1.0}},
    "f280-room1": {"config": 1, "months": ORLEANS, "input": {**F280_ROOM, "B7": 7.13, "B8": 7.13, "G7": 26.42}},
    "f280-room2": {"config": 1, "months": ORLEANS, "input": {**F280_ROOM, "B7": 6.29, "B8": 6.29, "G7": 20.30}},
}


def column(values):
    return "{" + ",".join("{%r}" % v for v in values) + "}"


def run(d, name, v, fcc):
    row = fcc[v["config"]]
    twin = fcc[row[39]] if row[39] > 0 else row  # iUnInsul (CORC!A40)
    sets = [f'set value of range "A1:A49" of worksheet "CORC" of wb to {column(row)}',
            f'set value of range "A1:A49" of worksheet "CORC2" of wb to {column(twin)}']
    sets += [f'set value of range "{k}" of worksheet "Input" of wb to {val!r}' for k, val in v["input"].items()]
    for i, t in enumerate(v.get("months", [])):
        sets.append(f'set value of range "C{34 + i}" of worksheet "Input" of wb to {t!r}')
    src, out = os.path.join(d, "BasementHLR_2014.xls"), os.path.join(d, name + ".xlsx")
    script = f'''tell application "Microsoft Excel"
set display alerts to false
open POSIX file "{src}"
set wb to workbook "BasementHLR_2014.xls"
{chr(10).join(sets)}
calculate
save workbook as wb filename (POSIX file "{out}" as text) file format Excel XML file format
close workbook "{name}.xlsx" saving no
end tell'''
    subprocess.run(["osascript", "-e", script], check=True, timeout=120)
    print(out)


def main(d):
    ws = openpyxl.load_workbook(os.path.join(d, "FoundationCC.xlsx"), data_only=True)["CorrCoef"]
    fcc = {int(r[0]): list(r[2:51]) for r in ws.iter_rows(min_row=4, values_only=True) if r[0] is not None}
    for name, v in VARIANTS.items():
        run(d, name, v, fcc)


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
