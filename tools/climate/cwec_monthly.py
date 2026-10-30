"""CWEC 2020 hourly years -> monthly climate per station, for the ISO 52016-1
monthly method (ABCD-OBJECTIVE-PRO.md section 4.1, Tier 1).

Reads every ECCC CWEC 2020 EPW under a directory (564 stations) and writes one
JSON with, per station and month:

    t_mean        mean dry bulb, deg C (all hours)
    t_max, t_min  mean of the daily maximum / minimum, deg C
    dew_mean      mean dew point, deg C
    w_mean        mean humidity ratio, g/kg dry air (from the dew point and
                  the station pressure)
    rh_mean       mean RH, %
    rh_1500       mean RH at 15:00 LST, % (C-2's Summer_RH_1500_LST)
    t_eve, w_eve, rh_eve
                  the same at the EVENING hours 18:00-21:00 LST — the
                  "average daily end-of-day RH" that decides whether night
                  air is free cooling or latent load
    wind_mean     mean wind speed, m/s
    hdd18         heating degree-days below 18 deg C, daily mean taken as
                  (max + min) / 2 (ECCC's degree-day convention)
    sol_*         solar irradiation, kWh/m2 per month, on the 9 surfaces the
                  monthly method sums: H (horizontal) and vertical N NE E SE
                  S SW W NW — by iso52010 (Perez), ground reflectance 0.2

and per station a year: hdd18, jan_1 / jan_2_5 (the January 1 % / 2.5 %
hourly dry bulbs) and jul_2_5_tdb (the July 2.5 % dry bulb). A CWEC year is a
TYPICAL year (each month chosen as typical), so these design values run
milder than C-2's long-record ones; matching_rule.py measures by how much.

EPW conventions: temperatures and humidity are observations AT the hour;
radiation is the total over the hour ENDING at the hour (Wh/m2 = mean W/m2),
which is iso52010's convention. Hours are local standard time.

    python3 -I tools/climate/cwec_monthly.py ~/Documents/OpenBuilding/climate-data/cwec2020/epw data/climate/cwec2020-monthly.json
"""
import json
import math
import os
import sys
from multiprocessing import Pool

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import iso52010  # noqa: E402

DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
MONTH_START = [sum(DAYS[:m]) for m in range(12)]  # day-of-year offset, non-leap
EVENING = (18, 19, 20, 21)

# ISO 52010-1 azimuths: from SOUTH, positive EAST (north = 180).
SURFACES = [
    ("H", 0, 0),
    ("N", 90, 180),
    ("NE", 90, 135),
    ("E", 90, 90),
    ("SE", 90, 45),
    ("S", 90, 0),
    ("SW", 90, -45),
    ("W", 90, -90),
    ("NW", 90, -135),
]


def p_sat(t):
    """Saturation vapour pressure over water, Pa (Magnus; the coefficients
    OBJECTIVE's CoolingNodes.js already uses)."""
    return 610.94 * math.exp(17.625 * t / (t + 243.04))


def humidity_ratio(dew, p):
    """kg water / kg dry air from the dew point (deg C) and pressure (Pa)."""
    pv = p_sat(dew)
    return 0.622 * pv / (p - pv)


def read_epw(path):
    with open(path, encoding="latin-1") as f:
        lines = f.read().splitlines()
    loc = lines[0].split(",")
    header = {
        "name": loc[1],
        "prov": loc[2],
        "wmo": loc[5],
        "lat": float(loc[6]),
        "lon": float(loc[7]),
        "tz": float(loc[8]),
        "elev": float(loc[9]),
    }
    rows = []
    for line in lines[8:]:
        c = line.split(",")
        if len(c) < 22:
            continue
        rows.append(
            {
                "month": int(c[1]),
                "day": int(c[2]),
                "hour": int(c[3]),
                "t": float(c[6]),
                "dew": float(c[7]),
                "rh": float(c[8]),
                "p": float(c[9]),
                "ghi": float(c[13]),
                "dni": float(c[14]),
                "dhi": float(c[15]),
                "wind": float(c[21]),
            }
        )
    if len(rows) != 8760:
        raise ValueError(f"{path}: {len(rows)} hourly rows, expected 8760")
    return header, rows


def percentile_low(values, frac):
    s = sorted(values)
    return s[int(frac * len(s))]


def percentile_high(values, frac):
    s = sorted(values, reverse=True)
    return s[int(frac * len(s))]


def mean(xs):
    return sum(xs) / len(xs)


def station_monthly(path):
    h, rows = read_epw(path)
    climate_id = os.path.basename(path).split("_")[-2]
    return {"id": climate_id, "file": os.path.basename(path), **h, **summarise(h, [rows])}


def summarise(h, years):
    """`years`: one or more 8760-row hourly years at the same place. Monthly
    values are each year's, averaged over the years; the design percentiles
    pool every year's hours (as a long-record design value does)."""
    per_year = [one_year(h, rows) for rows in years]
    months = {k: [mean([y[k][m] for y in per_year]) for m in range(12)] for k in per_year[0]}
    jan = [r["t"] for rows in years for r in rows if r["month"] == 1]
    jul = [r["t"] for rows in years for r in rows if r["month"] == 7]
    year = {
        "hdd18": sum(months["hdd18"]),
        "jan_1": percentile_low(jan, 0.01),
        "jan_2_5": percentile_low(jan, 0.025),
        "jul_2_5_tdb": percentile_high(jul, 0.025),
    }
    return {
        "year": {k: round(v, 2) for k, v in year.items()},
        "months": {k: [round(x, 2) for x in v] for k, v in months.items()},
    }


def one_year(h, rows):
    lat, lon, tz = h["lat"], h["lon"], h["tz"]
    months = {k: [] for k in (
        "t_mean", "t_max", "t_min", "dew_mean", "w_mean", "rh_mean", "rh_1500",
        "t_eve", "w_eve", "rh_eve", "wind_mean", "hdd18",
    )}
    for name, _, _ in SURFACES:
        months["sol_" + name] = []

    for m in range(1, 13):
        mr = [r for r in rows if r["month"] == m]
        days = {}
        for r in mr:
            days.setdefault(r["day"], []).append(r["t"])
        tmax = [max(v) for v in days.values()]
        tmin = [min(v) for v in days.values()]
        w = [humidity_ratio(r["dew"], r["p"]) for r in mr]
        eve = [r for r in mr if r["hour"] in EVENING]
        months["t_mean"].append(mean([r["t"] for r in mr]))
        months["t_max"].append(mean(tmax))
        months["t_min"].append(mean(tmin))
        months["dew_mean"].append(mean([r["dew"] for r in mr]))
        months["w_mean"].append(1000 * mean(w))
        months["rh_mean"].append(mean([r["rh"] for r in mr]))
        months["rh_1500"].append(mean([r["rh"] for r in mr if r["hour"] == 15]))
        months["t_eve"].append(mean([r["t"] for r in eve]))
        months["w_eve"].append(1000 * mean([humidity_ratio(r["dew"], r["p"]) for r in eve]))
        months["rh_eve"].append(mean([r["rh"] for r in eve]))
        months["wind_mean"].append(mean([r["wind"] for r in mr]))
        months["hdd18"].append(sum(max(0.0, 18 - (a + b) / 2) for a, b in zip(tmax, tmin)))

        sums = [0.0] * len(SURFACES)
        for r in mr:
            if r["ghi"] <= 0:
                continue
            nday = MONTH_START[m - 1] + r["day"]
            alt, az = iso52010.solar_position(nday, r["hour"], lat, lon, tz)
            for i, (_, tilt, orient) in enumerate(SURFACES):
                tot, _ = iso52010.irradiance(nday, alt, az, r["dhi"], r["dni"], tilt, orient)
                sums[i] += tot
        for i, (name, _, _) in enumerate(SURFACES):
            months["sol_" + name].append(sums[i] / 1000)
    return months


def epw_files(root):
    out = []
    for d, _, files in os.walk(root):
        out += [os.path.join(d, f) for f in files if f.endswith(".epw")]
    return sorted(out)


def main(root, out_path):
    files = epw_files(root)
    with Pool() as pool:
        stations = pool.map(station_monthly, files)
    doc = {
        "source": "ECCC CWEC 2020 (CWEC_FMCCE_v_2020), hourly EPW, one typical year per station",
        "tool": "tools/climate/cwec_monthly.py",
        "surfaces": [{"name": n, "tilt": t, "azimuth_from_south_east_positive": a} for n, t, a in SURFACES],
        "evening_hours_lst": list(EVENING),
        "stations": stations,
    }
    os.makedirs(os.path.dirname(os.path.abspath(out_path)), exist_ok=True)
    with open(out_path, "w") as f:
        json.dump(doc, f, separators=(",", ":"))
    print(f"{len(stations)} stations -> {out_path}")


if __name__ == "__main__":
    main(os.path.expanduser(sys.argv[1]), sys.argv[2])
