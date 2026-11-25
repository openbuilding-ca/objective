#!/usr/bin/env python3
"""How much would F280-1's walls BY FACING move Annex J's turns (Cl. 8.3.8)? An estimate, 2026-11-20.

    python3 -I tools/f280/turns_walls_estimate.py

Since 2026-11-20 OBJECTIVE's S11 walls are rows with a facing each, and F280 Table 3's opaque solar correction
reads every wall's facing (F280ComplianceNodes.js). F280-1 still enters its walls as one row facing Average
(Table 3's compass mean), so its turns move only the windows. This asks what one row per facing would add.

ASSUMPTIONS (the reason it is an estimate):
  - Table G.1.8 a)'s facings: rows 5-18 from the standard's text extract (page 2); rows 1-8 (page 1, blank in
    the extract) labelled as G.1.8 b) lists them - check against the PDF (pp. 91-92) before relying on it;
  - a combined facing ("E/W", "SE/SW") splits its area evenly between the two;
  - net wall = gross less that facing's windows (G.1.11) and wall doors (G.1.10); RSI 3.429 (I.3 brick); no
    rim joists or thermal-bridge factor; DTDc 6 (Ottawa 30 C less the 24 C set-point);
  - a turn moves every facade with the front door (the harness's convention, test/f280WholeHouse.spec.cjs);
  - Annex J's changes are nominal: x 1.3 (Cl. 6.3.1).

RESULT: no. The diagonal turns gain +12 to +14 W (about a tenth of the 85-129 W each falls short of Annex J);
the 90-degree turns (front door E, W) LOSE about 71 W, the wrong way: the largest walls face E/W, and turned
to N/S they take Table 3's negative columns. The turns' remaining ~5 % is not the walls' solar correction.
"""
import importlib.util
import os

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("build_case", os.path.join(HERE, "build_case.py"))
bc = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bc)

FT2 = 0.09290304
PAGE1 = [("N", 140), ("E/W", 175), ("SE/SW", 11), ("S", 132), ("N", 81), ("E/W", 40), ("E/W", 29), ("E/W", 7)]
PAGE2 = [("SE/SW", 34), ("E/W", 49), ("E/W", 80), ("S", 71), ("E/W", 169), ("S", 116), ("E/W", 139), ("N", 100),
         ("E/W", 116), ("N", 73), ("E/W", 49), ("E/W", 162), ("S", 142), ("S", 64), ("E/W", 148), ("S", 102),
         ("N", 89), ("E/W", 102), ("N", 47), ("E/W", 26), ("N", 99), ("E/W", 80)]
ORDER = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
SC = {"N": -3.8, "NE": -0.6, "E": 1.7, "SE": 0.6, "S": -2.2, "SW": 0.6, "W": 1.7, "NW": -0.6}  # Table 3, <= 14 C
DTDC = 6
# Today's shortfall of OBJECTIVE's change against Annex J's, W (test/f280-results.json, 2026-11-20)
SHORT = {"SE": 121, "E": 127, "NE": 85, "N": -47, "NW": 93, "W": 142, "SW": 129}


def main():
    assert [a for _, a in PAGE1 + PAGE2] == bc.WALLS, "the facings' areas no longer match build_case.WALLS"
    gross, win, door = {}, {}, {}
    for facing, a in PAGE1 + PAGE2:
        parts = facing.split("/")
        for p in parts:
            gross[p] = gross.get(p, 0) + a / len(parts)
    for w in bc.WINDOWS:
        win[w[1]] = win.get(w[1], 0) + w[6]
    for _, f, a in bc.DOORS:
        if f != "Up":
            door[f] = door.get(f, 0) + a
    net = {f: (gross.get(f, 0) - win.get(f, 0) - door.get(f, 0)) * FT2 for f in ORDER}
    u = 1 / bc.RSI["wall_brick"]

    def term(sc):
        return max(0, DTDC + sc) - max(0, DTDC)

    def walls(turn):
        return sum(net[f] * u * term(SC[ORDER[(ORDER.index(f) - turn) % 8]]) for f in ORDER)

    print("net wall m2 by facing:", {f: round(a, 1) for f, a in net.items() if a})
    for k, d in enumerate(["SE", "E", "NE", "N", "NW", "W", "SW"], 1):
        add = 1.3 * (walls(k) - walls(0))
        print(f"front door {d:2}: walls by facing add {add:+6.1f} W; short {SHORT[d]:+4d} W -> {SHORT[d] - add:+6.1f} W")


if __name__ == "__main__":
    main()
