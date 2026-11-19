#!/usr/bin/env python3
"""Have EXCEL compute AIM2.xls (CSA F280-12 Cl. 5.2.3) for a set of inputs, and record the results.

    python3 tools/f280/aim2_variants.py <dir holding AIM2.xlsx> > test/fixtures/aim2-workbooks.json

macOS + Microsoft Excel only (osascript). <dir> must be one Excel may write without asking - its sandbox
container, e.g. ~/Library/Containers/com.microsoft.Excel/Data/<folder> - holding AIM2.xls saved as .xlsx.
AIM2 carries ActiveX controls and an auto-open macro: Excel asks to open it read-only and reports the
macro missing; this tool answers both dialogs. For each variant it opens a fresh AIM2.xlsx, sets the
cells the input form would (AIM_2_Selection), recalculates, saves <name>.xlsx and reads back - with
openpyxl, which evaluates nothing - the inputs as set and AIM_2_Calcs' results. Every number in the
fixture is EXCEL's.

The variants (the workbook as shipped: Winnipeg, custom ACH50 1.5 / ELA 305.8 cm2 @ 10 Pa, 566.3 m3,
ceiling 6.4 m, open-flat station, suburban site, very heavy wall / heavy flue shielding, detached two
storeys full basement, 10 L/s exhaust only):
  shipped          as is
  f280-1-hrv       CSA F280-12 Archetype 1 / 2010s / Ottawa (Orleans): H.3.1 "Low crops x/H > 20",
                   "Light local shielding" (walls and flue); detached, two storeys, full basement; H.3.2
                   1.5 ACH50 = AIM2's "Energy Tight" type; volume 730.3 m3 (the F280-1 crosswalk);
                   highest ceiling 5.53 m above grade (0.30 basement strip + 2.77 + 2.46, G.1.5/G.1.8);
                   H.3.3 HRV 51.91 L/s balanced; 22 / 24 C indoors
  f280-1-exhaust   the same, 51.91 L/s exhaust only (Cl. 8.3.4 c)'s variant)
  flues-semi       two flues (100, 75 mm), heavy wall / no flue shielding, semi-detached, one and a half
                   storeys, slab-on-grade, custom ACH50 3.0 / ELA 844 cm2
  ela4-city        ELA at 4 Pa, city-centre site, three storeys, crawl space, 20 L/s supply only,
                   IqFon 5 L/s
  volume-500       the shipped house at 500 m3 (with its 10 L/s exhaust; F280_2015_TestCases' volume rows,
                   test/fixtures/f280-aim2-workbook.json, have no ventilation: test/aim2.test.cjs runs them)
"""

import json
import os
import subprocess
import sys
import time

import openpyxl

F280_1 = {"B293": "Ottawa (Orleans)", "B2": 22, "B3": 24, "B301": 3, "C393": 10, "B315": 4, "B320": 2,
          "B330": 2, "B338": "Detached", "B345": "Two", "B355": "Full", "G378": "Energy Tight (ACH=1.5)",
          "B407": 730.3, "B409": 5.53, "C398": 0, "A401": 0, "B401": 0, "C401": 0, "D401": 0}
VARIANTS = {
    "shipped": {},
    "f280-1-hrv": {**F280_1, "C395": 51.91, "C396": 51.91},
    "f280-1-exhaust": {**F280_1, "C395": 0, "C396": 51.91},
    "flues-semi": {"A401": 100, "B401": 75, "B320": 3, "B330": 1, "B338": "Semi-Detached",
                   "B345": "One & Half", "B355": "Slab-on-Grade", "G378": "Custom - BDT values",
                   "A405": 3.0, "B405": 844, "G375": "ELA @ 10 Pa."},
    "ela4-city": {"B315": 8, "B345": "Three", "B355": "Crawl Space", "G378": "Custom - BDT values",
                  "A405": 2.0, "B405": 250, "G375": "ELA @ 4 Pa.", "C395": 20, "C396": 0, "C398": 5},
    "volume-500": {"B407": 500},
}
# AIM_2_Selection cells read back as the inputs Aim2.compute() takes
READ_INPUTS = {"indoorHeating": "B2", "indoorCooling": "B3", "designHeating": "C297", "designCooling": "D297",
               "janWind": "H297", "julWind": "I297", "stationTerrain": "B301", "anemometerHeight": "C393",
               "siteTerrain": "B315", "wallShielding": "B320", "flueShielding": "B330", "buildingType": "B338",
               "storeys": "B345", "foundation": "B355", "volume": "B407", "ceilingHeight": "B409",
               "supplyLs": "C395", "exhaustLs": "C396", "furnaceFlueLs": "C398"}
READ_CALCS = {"n": "B6", "c50": "B7", "flueA": "B22", "cFlue": "B28", "y": "B30", "rs": "B31", "x": "B32",
              "cT": "B33", "cCon": "B34", "sW": "B35", "fs": "B48", "fw": "B49", "qBal": "B51", "qUnbal": "B52",
              "heatingNatural": "B70", "coolingNatural": "G70", "heatingLoss": "B72", "coolingLoss": "G72",
              "ventilationHeating": "B76", "ventilationCooling": "G76", "totalHeating": "B78",
              "totalCooling": "G78"}


def osa(script, timeout=60):
    return subprocess.run(["osascript", "-e", script], capture_output=True, text=True, timeout=timeout)


def answer_dialogs(seconds=20):
    """Click Excel's 'Open as Read-Only' and the missing-macro 'OK' while they appear."""
    end = time.time() + seconds
    while time.time() < end:
        r = osa('tell application "System Events" to tell process "Microsoft Excel" to '
                'get name of every button of front window')
        names = r.stdout
        if "Open as Read-Only" in names:
            osa('tell application "System Events" to tell process "Microsoft Excel" to '
                'click button "Open as Read-Only" of front window')
        elif "OK" in names and "Cancel" not in names:
            osa('tell application "System Events" to tell process "Microsoft Excel" to click button "OK" of front window')
        else:
            r = osa('tell application "Microsoft Excel" to get name of every workbook')
            if "AIM2.xlsx" in r.stdout:
                return
        time.sleep(1)
    raise SystemExit("Excel did not open AIM2.xlsx")


def run(d, name, cells):
    src, out = os.path.join(d, "AIM2.xlsx"), os.path.join(d, f"aim2-{name}.xlsx")
    subprocess.Popen(["osascript", "-e", f'tell application "Microsoft Excel" to open POSIX file "{src}"'])
    answer_dialogs()
    sets = [f'set value of range "{k}" of worksheet "AIM_2_Selection" of wb to {json.dumps(v)}'
            for k, v in cells.items()]
    r = osa(f'''tell application "Microsoft Excel"
set display alerts to false
set wb to workbook "AIM2.xlsx"
{chr(10).join(sets)}
calculate
save workbook as wb filename (POSIX file "{out}" as text) file format Excel XML file format
close workbook "aim2-{name}.xlsx" saving no
end tell''', timeout=120)
    if r.returncode:
        raise SystemExit(f"{name}: {r.stderr}")
    answer_dialogs_after_close()
    return out


def answer_dialogs_after_close():
    for _ in range(5):
        r = osa('tell application "System Events" to tell process "Microsoft Excel" to get name of every button of front window')
        if "OK" in r.stdout and "Cancel" not in r.stdout:
            osa('tell application "System Events" to tell process "Microsoft Excel" to click button "OK" of front window')
        time.sleep(0.5)


def record(name, path):
    wb = openpyxl.load_workbook(path, data_only=True)
    sel, calcs = wb["AIM_2_Selection"], wb["AIM_2_Calcs"]
    inputs = {k: sel[c].value for k, c in READ_INPUTS.items()}
    custom = sel["H378"].value in (0, None)  # ACH_combo 0: the custom blower-door values
    inputs["tightness"] = "Custom" if custom else str(sel["G378"].value).split(" (")[0]
    if custom:
        inputs.update(ach50=sel["A405"].value, ela=sel["B405"].value, elaPa=sel["D372"].value)
    inputs["flues"] = [sel[c].value for c in ("A401", "B401", "C401", "D401")]
    return {"variant": name, "city": sel["B293"].value, "inputs": inputs,
            "expected": {k: calcs[c].value for k, c in READ_CALCS.items()}}


def main(d):
    records = [record(name, run(d, name, cells)) for name, cells in VARIANTS.items()]
    print(json.dumps({"source": "AIM2.xls (CSA F280-12 Cl. 5.2.3), computed by Excel; tools/f280/aim2_variants.py",
                      "records": records}, indent=1))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    main(sys.argv[1])
