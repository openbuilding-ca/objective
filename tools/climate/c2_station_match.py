"""Each NBC Table C-2 location -> its CWEC 2020 station, by the code's own rule.

NBC 2025 Note A-9.36.6.5.(1): where a location has no CWEC file, choose an
alternative with "the same climatic zone, the same geographic area or
characteristics, the heating degree-days (HDD) of the alternative location
are within 10% of the target location's HDD, and the January 1% heating
design criteria of the alternative location is within 2°C of the target
location's same criteria". Proximity breaks ties: the NEAREST passing station
wins. "The same geographic area" is read as within MAX_KM.

The target's HDD and January 1 % are C-2's. The STATION's are C-2's too,
taken from its C-2 TWIN — the C-2 location nearest the station, within
TWIN_KM — because a CWEC year is a typical year and its January tail is mild
(measured: see the printed bias); the CWEC year's own values are the
fallback for a station with no twin. Every row records the station, the
distance, the margins and where the station's values came from; a location
no station passes is `"station": null` (NASA POWER fills it).

    python3 -I tools/climate/c2_station_match.py data/climate/c2-geocode.json \
        data/climate/cwec2020-monthly.json data/climate/c2-station-match.json
"""
import json
import math
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from c2_geocode import c2_locations  # noqa: E402

MAX_KM = 250.0
TWIN_KM = 15.0
HDD_MARGIN = 0.10
JAN1_MARGIN = 2.0


def zone(hdd):
    """NBC 9.36 climate zone from HDD18 (Table 9.36.1.3.)."""
    for bound, z in ((3000, "4"), (4000, "5"), (5000, "6"), (6000, "7A"), (7000, "7B")):
        if hdd < bound:
            return z
    return "8"


def km(lat1, lon1, lat2, lon2):
    """Great-circle distance (haversine), km."""
    r = math.pi / 180
    a = (
        math.sin((lat2 - lat1) * r / 2) ** 2
        + math.cos(lat1 * r) * math.cos(lat2 * r) * math.sin((lon2 - lon1) * r / 2) ** 2
    )
    return 2 * 6371.0 * math.asin(math.sqrt(a))


def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def main(geo_path, cwec_path, out_path):
    geo = {(r["province"], r["name"]): r for r in json.load(open(geo_path))["locations"]}
    stations = json.load(open(cwec_path))["stations"]
    c2 = []
    for prov, name, v in c2_locations():
        g = geo.get((prov, name), {})
        c2.append({
            "province": prov, "name": name,
            "lat": g.get("lat"), "lon": g.get("lon"),
            "hdd18": num(v.get("HDD18")), "jan_1": num(v.get("January_1")),
            "elev": num(v.get("Elev ASL (m)")),
        })
    placed = [t for t in c2 if t["lat"] is not None and t["hdd18"] and t["jan_1"] is not None]

    # The station's design values: its C-2 twin's, else its CWEC year's.
    bias_hdd, bias_jan = [], []
    for s in stations:
        twin = min(placed, key=lambda t: km(s["lat"], s["lon"], t["lat"], t["lon"]))
        d = km(s["lat"], s["lon"], twin["lat"], twin["lon"])
        if d <= TWIN_KM:
            s["design"] = {"from": "c2_twin", "twin": f'{twin["province"]} {twin["name"]}',
                           "twin_km": round(d, 1), "hdd18": twin["hdd18"], "jan_1": twin["jan_1"]}
            bias_hdd.append(s["year"]["hdd18"] / twin["hdd18"] - 1)
            bias_jan.append(s["year"]["jan_1"] - twin["jan_1"])
        else:
            s["design"] = {"from": "cwec_year", "hdd18": s["year"]["hdd18"], "jan_1": s["year"]["jan_1"]}
    twins = sum(s["design"]["from"] == "c2_twin" for s in stations)
    print(f"{twins} of {len(stations)} stations have a C-2 twin within {TWIN_KM} km")
    print(f"CWEC year vs twin: HDD18 median {100 * statistics.median(bias_hdd):+.1f} %, "
          f"January 1 % median {statistics.median(bias_jan):+.1f} C "
          f"(range {min(bias_jan):+.1f} .. {max(bias_jan):+.1f})")

    rows = []
    for t in c2:
        row = {"province": t["province"], "name": t["name"], "station": None}
        if t["lat"] is None:
            row["why"] = "not geocoded"
        elif not t["hdd18"] or t["jan_1"] is None:
            row["why"] = "C-2 has no HDD18 or January 1 %"
        else:
            best = None
            for s in stations:
                sd = s["design"]
                d = km(t["lat"], t["lon"], s["lat"], s["lon"])
                d_hdd = sd["hdd18"] / t["hdd18"] - 1
                d_jan = sd["jan_1"] - t["jan_1"]
                if (d <= MAX_KM and zone(sd["hdd18"]) == zone(t["hdd18"])
                        and abs(d_hdd) <= HDD_MARGIN and abs(d_jan) <= JAN1_MARGIN
                        and (best is None or d < best[0])):
                    best = (d, s, d_hdd, d_jan)
            if best is None:
                row["why"] = f"no station within {MAX_KM:.0f} km passes the Note's rule"
            else:
                d, s, d_hdd, d_jan = best
                row.update({
                    "station": s["id"], "station_name": s["name"], "km": round(d, 1),
                    "zone": zone(t["hdd18"]), "d_hdd18_pct": round(100 * d_hdd, 1),
                    "d_jan_1": round(d_jan, 1), "station_values": s["design"]["from"],
                    "d_elev_m": None if t["elev"] is None else round(s["elev"] - t["elev"]),
                })
        rows.append(row)

    doc = {
        "rule": "NBC 2025 Note A-9.36.6.5.(1): same zone, HDD18 within 10 %, January 1 % within 2 C, nearest wins",
        "max_km": MAX_KM, "twin_km": TWIN_KM,
        "tool": "tools/climate/c2_station_match.py",
        "locations": rows,
    }
    with open(out_path, "w") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
    matched = [r for r in rows if r["station"]]
    print(f"{len(matched)} of {len(rows)} C-2 locations matched -> {out_path}")
    if matched:
        ks = sorted(r["km"] for r in matched)
        print(f"distance: median {statistics.median(ks):.0f} km, 90th {ks[int(0.9 * len(ks))]:.0f} km, max {ks[-1]:.0f} km")
    whys = {}
    for r in rows:
        if not r["station"]:
            whys[r["why"]] = whys.get(r["why"], 0) + 1
    for w, n in whys.items():
        print(f"  {n:4} {w}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
