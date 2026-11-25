"""Write the files the web app reads for a location's climate (ABCD-OBJECTIVE-PRO
section 0, step 5).

    src/core/ClimateStations.js     loaded with the page: every C-2 location ->
                                    its station id, and how it was matched
    climate/stations/<id>.json      fetched on demand: the station's monthly
                                    table (cwec_monthly's fields)
    climate/stations/<id>.bin       fetched on demand: one hourly year, two
                                    little-endian Int16 runs of 8760 —
                                    dry bulb x 10 (0.1 C), then humidity
                                    ratio x 100 (0.01 g/kg); hour k is EPW
                                    hour (k mod 24) + 1 of day k div 24
                                    (non-leap, 1 January first)

The hourly year is what free cooling is counted on: an hour cools for free
only when the outdoor air is cooler AND drier than the indoor state (Andy
2026-10-29/30), and that depends on the user's setpoint and indoor RH, so
the count runs in the app. Two bytes per value keep a station at 35 KB.

Only stations some C-2 location uses get files (286 CWEC + the NASA POWER
fills). A CWEC station's hourly year is its EPW. A POWER location has 20
years; its hourly year is a composite TYPICAL year built the way CWEC's own
months are chosen, simplified: for each month, the year whose monthly mean
dry bulb and humidity ratio sit nearest the 20-year means (distance in
units of each one's across-year standard deviation). Its monthly TABLE stays
the 20-year mean (power_monthly.py) — the better estimate of a month — so
for POWER the table and the hourly year agree only to within a typical
month's spread.

    python3 -I tools/climate/build_station_files.py
    npx prettier --write src/core/ClimateStations.js   # the repo's format

Inputs (Mark's #123 review: the files could not be rebuilt from a clean checkout):
    data/climate/*.json        IN THE REPO (1.3 MB): c2-geocode, c2-station-match, cwec2020-monthly,
                               power-monthly - the outputs of c2_geocode.py, c2_station_match.py,
                               cwec_monthly.py and power_monthly.py, whose headers say how to rerun them
    <climate data>/cwec2020/epw   NOT in the repo: ECCC's CWEC 2020 EPW set (564 stations, ~1 GB), to
                               download; <climate data> is $OBJECTIVE_CLIMATE_DATA, or
                               ~/Documents/OpenBuilding/climate-data
    <climate data>/power       NASA POWER hourly years, fetched and cached by power_monthly.fetch_year
                               on first use (network)
"""
import json
import os
import re
import statistics
import struct
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cwec_monthly as cm  # noqa: E402
import power_monthly as pm  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DATA = os.path.join(REPO, "data/climate")
CLIMATE = os.path.expanduser(os.environ.get("OBJECTIVE_CLIMATE_DATA", "~/Documents/OpenBuilding/climate-data"))
OUT = os.path.join(REPO, "climate/stations")


def slug(station_id):
    return re.sub(r"[^A-Za-z0-9]+", "-", station_id).strip("-").lower()


def pack(rows):
    t = [round(10 * r["t"]) for r in rows]
    w = [round(100 * 1000 * cm.humidity_ratio(r["dew"], r["p"])) for r in rows]
    return struct.pack(f"<{len(t)}h{len(w)}h", *t, *w)


def typical_year(years):
    """One composite year: per month, the year nearest the multi-year means."""
    def stats(rows, m):
        mr = [r for r in rows if r["month"] == m]
        return (cm.mean([r["t"] for r in mr]),
                cm.mean([cm.humidity_ratio(r["dew"], r["p"]) for r in mr]))
    out = []
    picked = []
    for m in range(1, 13):
        s = [stats(rows, m) for rows in years]
        mt, mw = cm.mean([x[0] for x in s]), cm.mean([x[1] for x in s])
        st = statistics.pstdev([x[0] for x in s]) or 1.0
        sw = statistics.pstdev([x[1] for x in s]) or 1.0
        best = min(range(len(years)), key=lambda i: ((s[i][0] - mt) / st) ** 2 + ((s[i][1] - mw) / sw) ** 2)
        picked.append(pm.YEARS[best])
        out += [r for r in years[best] if r["month"] == m]
    return out, picked


def write_station(sid, meta, months, rows):
    name = slug(sid)
    with open(os.path.join(OUT, name + ".json"), "w") as f:
        json.dump({**meta, "months": months}, f, separators=(",", ":"), ensure_ascii=False)
    with open(os.path.join(OUT, name + ".bin"), "wb") as f:
        f.write(pack(rows))
    return name


def main():
    os.makedirs(OUT, exist_ok=True)
    match = json.load(open(os.path.join(DATA, "c2-station-match.json")))["locations"]
    cwec = {s["id"]: s for s in json.load(open(os.path.join(DATA, "cwec2020-monthly.json")))["stations"]}
    power = {s["id"]: s for s in json.load(open(os.path.join(DATA, "power-monthly.json")))["stations"]}
    epw = {os.path.basename(p): p for p in cm.epw_files(os.path.join(CLIMATE, "cwec2020/epw"))}
    if not epw:
        sys.exit(f"no CWEC 2020 EPW files under {os.path.join(CLIMATE, 'cwec2020/epw')}: download ECCC's "
                 "CWEC 2020 set there, or set OBJECTIVE_CLIMATE_DATA to the folder that holds cwec2020/epw")

    files = {}
    for sid in sorted({r["station"] for r in match if r["station"]}):
        s = cwec[sid]
        _, rows = cm.read_epw(epw[s["file"]])
        meta = {"id": sid, "source": "CWEC 2020", "name": s["name"], "prov": s["prov"],
                "lat": s["lat"], "lon": s["lon"], "elev": s["elev"], "year": s["year"]}
        files[sid] = write_station(sid, meta, s["months"], rows)
    for sid, s in power.items():
        dz = s["elev"] - s["grid_elev"]
        years = [pm.rows_of(pm.fetch_year(s["lat"], s["lon"], y, os.path.join(CLIMATE, "power")), dz) for y in pm.YEARS]
        rows, picked = typical_year(years)
        meta = {"id": sid, "source": "NASA POWER 2001-2020, lapse-corrected", "name": s["name"], "prov": s["prov"],
                "lat": s["lat"], "lon": s["lon"], "elev": s["elev"], "year": s["year"],
                "lapse_dT": s["lapse_dT"], "typical_year_months": picked}
        files[sid] = write_station(sid, meta, s["months"], rows)

    loc = {}
    for r in match:
        if r["station"]:
            entry = {"station": files[r["station"]], "by": "NBC Note A-9.36.6.5.(1)", "km": r["km"],
                     "dHDD": r["d_hdd18_pct"], "dJan1": r["d_jan_1"]}
        else:
            entry = {"station": files[f'power:{r["province"]}:{r["name"]}'], "by": "NASA POWER", "why": r["why"]}
        loc.setdefault(r["province"], {})[r["name"]] = entry

    js = (
        "/**\n * ClimateStations.js — generated by tools/climate/build_station_files.py; do not edit.\n"
        " * Each NBC Table C-2 location -> the climate station whose monthly table\n"
        " * (climate/stations/<station>.json) and hourly year (<station>.bin) the\n"
        " * cooling reads: CWEC 2020 by NBC Note A-9.36.6.5.(1), NASA POWER where no\n"
        " * station passes the Note.\n */\n"
        "window.TEUI = window.TEUI || {};\n"
        f"window.TEUI.ClimateStations = {json.dumps(loc, ensure_ascii=False, indent=1)};\n"
    )
    with open(os.path.join(REPO, "src/core/ClimateStations.js"), "w") as f:
        f.write(js)
    print(f"{len(files)} stations -> {OUT}; {sum(len(v) for v in loc.values())} locations -> src/core/ClimateStations.js")


if __name__ == "__main__":
    main()
