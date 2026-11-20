#!/usr/bin/env python3
"""Have EXCEL compute SlabOnGradeHLR.xls (NRCan's slab-on-grade twin of BasementHLR.xls) for witness inputs.

    python3 tools/f280/slab_variants.py <dir holding SlabOnGradeHLR_2014.xls and FoundationCC.xlsx>

macOS + Microsoft Excel only (driven by osascript), as tools/f280/basesimp_variants.py. The directory must
be one Excel may write without asking - its sandbox container, e.g.
~/Library/Containers/com.microsoft.Excel/Data/<folder>. For each variant it opens a fresh
SlabOnGradeHLR_2014.xls, pastes the configuration's FoundationCC row into CORC and its uninsulated twin's
into CORC2 (SlabOnGradeHLR.doc: "By pasting the entire row (transposed) from this sheet ..."), sets the
Input cells, recalculates, and saves slab-<name>.xlsx. tools/f280/slab_fixture.py then records them.

Variants (the shipped example is SCB_25, #52, Winnipeg, 12.1 x 6.1 m, added RSI 1.4 - the interpolation):
  scb25        the shipped example, unchanged
  scb25-thick  added RSI 3.5: above 1.5, BS1 alone
  scn1         SCN_1 (#28), uninsulated: its own twin, added RSI 0
  radiant      the shipped example with a radiant slab at 30 C (Input!B58; the heating load takes MAX)
  attached     the shipped example with 20 m of its 36.4 m perimeter exposed (Input!G7)
  ottawa       SCB_31 (#81, fully insulated including under the footing), 10.6 x 10.0 m, added RSI 1.76,
               Ottawa (Orleans) from F280_Weather.xls (HDD 4500, design -26 / 30, deep ground 8), room 22 / 24
"""
import os
import subprocess
import sys

import openpyxl

ORLEANS = [-11, -10, -3, 5, 13, 18, 21, 19, 14, 8, 1, -7]
VARIANTS = {
    "scb25": {"config": 52, "input": {}},
    "scb25-thick": {"config": 52, "input": {"B17": 3.5}},
    "scn1": {"config": 28, "input": {"B17": 0}},
    "radiant": {"config": 52, "input": {"B58": 30}},
    "attached": {"config": 52, "input": {"G7": 20}},
    "ottawa": {"config": 81, "months": ORLEANS,
               "input": {"B7": 10.6, "B8": 10.0, "B17": 1.76, "B32": 4500, "F32": 8,
                         "B56": 22, "B57": -26, "B61": 24, "B62": 30}},
}


def column(values):
    return "{" + ",".join("{%r}" % v for v in values) + "}"


def run(d, name, v, fcc):
    row = fcc[v["config"]]
    twin = fcc[row[39]] if row[39] > 0 else row  # iUnInsul (CORC!A40)
    sets = [f'set value of range "A1:A49" of worksheet "CORC" of wb to {column(row)}',
            f'set value of range "A1:A49" of worksheet "CORC2" of wb to {column(twin)}',
            f'set value of range "B16" of worksheet "Input" of wb to {v["config"]!r}']
    sets += [f'set value of range "{k}" of worksheet "Input" of wb to {val!r}' for k, val in v["input"].items()]
    for i, t in enumerate(v.get("months", [])):
        sets.append(f'set value of range "C{34 + i}" of worksheet "Input" of wb to {t!r}')
    src, out = os.path.join(d, "SlabOnGradeHLR_2014.xls"), os.path.join(d, f"slab-{name}.xlsx")
    script = f'''tell application "Microsoft Excel"
set display alerts to false
open POSIX file "{src}"
set wb to workbook "SlabOnGradeHLR_2014.xls"
{chr(10).join(sets)}
calculate
save workbook as wb filename (POSIX file "{out}" as text) file format Excel XML file format
close workbook "slab-{name}.xlsx" saving no
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
