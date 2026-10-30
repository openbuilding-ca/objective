"""NASA POWER fills the C-2 locations no CWEC station passes (Andy 2026-10-30:
NASA encouraged its use; RESNET does). Same monthly values, same code as
cwec_monthly — the hourly series is fetched and handed to its `summarise`.

POWER is reanalysis and satellite (MERRA-2 meteorology on a ~0.5 x 0.625 deg
grid, CERES SYN1deg solar on 1 deg), not "measured ... at the weather
station" — the fallback, never the source where CWEC passes.

Per location: YEARS of hourly T2M, T2MDEW, RH2M, PS, WS10M and the all-sky
GHI / DNI / diffuse, local standard time. Measured 2026-10-30 (Campbell
River, 2019): POWER's LST hour h is the hour STARTING at h — EPW's hour h+1
(RMS of DNI*sin(alt)+DHI against GHI is least at +1 h, and the morning /
afternoon bias crosses zero there); the zone is the civil standard one, taken
from the nearest CWEC station's EPW header. Its own GHI, DNI and diffuse do
not close exactly (RMS ~33 W/m2): the vertical surfaces carry that.
Temperature is an hourly MEAN where EPW's is the observation at the hour.

A grid cell's height is its terrain's mean, and on the BC coast that is the
mountains, not the fjord town: Bella Coola's cell stands at 1,002 m, the town
at 40 m (C-2), and raw POWER gives HDD18 5,760 against C-2's 3,560. So each
location is brought to its C-2 elevation by the standard lapse rate (the
nearest station's height where C-2 has none). Measured 2026-10-30 against
C-2's HDD18: Bella Coola 3,612 (3,560), Gold River 3,120 (3,230), Merritt
3,876 (3,900), Ocean Falls 3,588 (3,400); the flat North and the Shield move
by under 1 %. The lapse rate does NOT fix the January 1 % in interior
valleys (Dog Creek, Burns Lake: 7-10 C mild) — winter inversions pool cold
air below the cell — so the design tail stays a C-2 value, never POWER's.

Raw years are cached, gzipped, under the climate-data folder (outside both
repos); a rerun fetches only what is missing.

    python3 -I tools/climate/power_monthly.py data/climate/c2-station-match.json \
        data/climate/c2-geocode.json data/climate/cwec2020-monthly.json \
        ~/Documents/OpenBuilding/climate-data/power data/climate/power-monthly.json
"""
import gzip
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cwec_monthly as cm  # noqa: E402
from c2_geocode import c2_locations  # noqa: E402
from c2_station_match import km  # noqa: E402

API = "https://power.larc.nasa.gov/api/temporal/hourly/point"
PARAMS = ["T2M", "T2MDEW", "RH2M", "PS", "WS10M", "ALLSKY_SFC_SW_DWN", "ALLSKY_SFC_SW_DNI", "ALLSKY_SFC_SW_DIFF"]
YEARS = range(2001, 2021)  # 20 years
LAPSE = 0.0065  # K/m, the standard atmosphere's
SCALE_HEIGHT = 8400.0  # m


def fetch_year(lat, lon, year, cache_dir):
    path = os.path.join(cache_dir, f"{lat:.4f}_{lon:.4f}_{year}.json.gz")
    if os.path.exists(path):
        with gzip.open(path, "rt") as f:
            return json.load(f)
    q = urllib.parse.urlencode({
        "parameters": ",".join(PARAMS), "community": "RE", "latitude": lat, "longitude": lon,
        "start": f"{year}0101", "end": f"{year}1231", "format": "JSON", "time-standard": "LST",
    })
    for attempt in range(4):
        try:
            with urllib.request.urlopen(f"{API}?{q}", timeout=120) as r:
                d = json.load(r)
            break
        except OSError:
            if attempt == 3:
                raise
            time.sleep(10 * (attempt + 1))
    keep = {"geometry": d["geometry"], "parameter": d["properties"]["parameter"]}
    with gzip.open(path, "wt") as f:
        json.dump(keep, f, separators=(",", ":"))
    time.sleep(1)
    return keep


def rows_of(d, dz=0.0):
    """POWER's hourly dict -> cwec_monthly rows (EPW hour = POWER hour + 1;
    29 February dropped, as a CWEC year has none), brought from the grid
    cell's height down to the town's by `dz` = town - cell, metres:
    temperature by the standard lapse rate, pressure hypsometrically; the dew
    point is kept (the air keeps its moisture) and RH re-derived."""
    p = d["parameter"]
    dt = -LAPSE * dz
    p_ratio = math.exp(-dz / SCALE_HEIGHT)
    rows = []
    for k in sorted(p["T2M"]):
        month, day, hour = int(k[4:6]), int(k[6:8]), int(k[8:10])
        if month == 2 and day == 29:
            continue
        v = {name: p[name][k] for name in PARAMS}
        if any(x == -999 for x in v.values()):
            raise ValueError(f"fill value at {k}")
        t = v["T2M"] + dt
        dew = min(v["T2MDEW"], t)
        rows.append({
            "month": month, "day": day, "hour": hour + 1,
            "t": t, "dew": dew, "rh": 100 * cm.p_sat(dew) / cm.p_sat(t), "p": 1000 * v["PS"] * p_ratio,
            "ghi": v["ALLSKY_SFC_SW_DWN"], "dni": v["ALLSKY_SFC_SW_DNI"], "dhi": v["ALLSKY_SFC_SW_DIFF"],
            "wind": v["WS10M"],
        })
    if len(rows) != 8760:
        raise ValueError(f"{len(rows)} hourly rows, expected 8760")
    return rows


def main(match_path, geo_path, cwec_path, cache_dir, out_path):
    cache_dir = os.path.expanduser(cache_dir)
    os.makedirs(cache_dir, exist_ok=True)
    geo = {(r["province"], r["name"]): r for r in json.load(open(geo_path))["locations"]}
    stations = json.load(open(cwec_path))["stations"]
    misses = [r for r in json.load(open(match_path))["locations"] if r["station"] is None]
    c2_elev = {}
    for prov, name, v in c2_locations():
        try:
            c2_elev[(prov, name)] = float(v.get("Elev ASL (m)"))
        except (TypeError, ValueError):
            pass
    out = []
    for r in misses:
        g = geo[(r["province"], r["name"])]
        near = min(stations, key=lambda s: km(g["lat"], g["lon"], s["lat"], s["lon"]))
        years = [fetch_year(g["lat"], g["lon"], y, cache_dir) for y in YEARS]
        lon, lat, grid_elev = years[0]["geometry"]["coordinates"]
        town_elev = c2_elev.get((r["province"], r["name"]))
        if town_elev is None:
            town_elev = near["elev"]
        dz = town_elev - grid_elev
        h = {"name": r["name"], "prov": r["province"], "lat": g["lat"], "lon": g["lon"],
             "tz": near["tz"], "elev": town_elev, "grid_lat": lat, "grid_lon": lon,
             "grid_elev": grid_elev, "lapse_dT": round(-LAPSE * dz, 2)}
        out.append({"id": f'power:{r["province"]}:{r["name"]}', **h,
                    **cm.summarise(h, [rows_of(y, dz) for y in years])})
        print(f'{r["province"]} {r["name"]}: HDD18 {out[-1]["year"]["hdd18"]:.0f}, January 1 % {out[-1]["year"]["jan_1"]}', flush=True)
    doc = {
        "source": f"NASA POWER hourly (MERRA-2, CERES SYN1deg), {YEARS[0]}-{YEARS[-1]}, local standard time",
        "tool": "tools/climate/power_monthly.py",
        "stations": out,
    }
    with open(out_path, "w") as f:
        json.dump(doc, f, separators=(",", ":"))
    print(f"{len(out)} locations -> {out_path}")


if __name__ == "__main__":
    main(*sys.argv[1:6])
