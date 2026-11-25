"""Check c2-station-match.json against the Note's rule, re-derived here.

    python3 -I tools/climate/test_c2_station_match.py data/climate/c2-station-match.json

1. Every matched row passes NBC Note A-9.36.6.5.(1) on its recorded margins:
   HDD18 within 10 %, January 1 % within 2 C, within MAX_KM. (The zone is
   checked by the matcher; a row records only the target's.)
2. The cities whose CWEC station is in town get it (one per region).
3. POSITIVE CONTROL: rule 1 applied with half the HDD margin must reject
   some rows — the check reads the margins, it does not pass by default.
"""
import json
import sys

KNOWN = {
    ("ON", "Toronto (City Hall)"): "TORONTO CITY",
    ("QC", "Montréal (City Hall)"): "MCTAVISH",
    ("MB", "Winnipeg"): "WINNIPEG THE FORKS",
    ("AB", "Calgary"): "CALGARY INTL A",
    ("NS", "Halifax"): "HALIFAX DOCKYARD",
    ("NU", "Iqaluit"): "IQALUIT A",
}


def passes(r, max_km, hdd_margin):
    return (
        r["km"] <= max_km
        and abs(r["d_hdd18_pct"]) <= 100 * hdd_margin
        and abs(r["d_jan_1"]) <= 2.0
    )


def main(path):
    doc = json.load(open(path))
    rows = doc["locations"]
    matched = [r for r in rows if r["station"]]
    ok = True
    bad = [r["name"] for r in matched if not passes(r, doc["max_km"], 0.10)]
    print(f"{len(matched)} matched rows; {len(bad)} outside the Note's margins {bad[:5]}")
    ok &= not bad
    by = {(r["province"], r["name"]): r for r in rows}
    for key, want in KNOWN.items():
        got = by[key].get("station_name")
        print(f"  {key[1]} -> {got}" + ("" if got == want else f"  (WANT {want})"))
        ok &= got == want
    tight = [r for r in matched if not passes(r, doc["max_km"], 0.05)]
    print(f"positive control, HDD margin 5 %: {len(tight)} rows rejected — must be > 0")
    ok &= len(tight) > 0
    print("PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main(sys.argv[1])
