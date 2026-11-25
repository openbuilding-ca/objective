"""Check cwec_monthly against the EPW files' own measured columns.

    python3 -I tools/climate/test_cwec_monthly.py ~/Documents/OpenBuilding/climate-data/cwec2020/epw

1. Horizontal solar: on a horizontal surface the Perez sum must return the
   measured global (direct * sin(altitude) + diffuse), so each station's
   annual sol_H must equal its EPW GHI column summed. Result 2026-10-30, all
   564 stations: median 0.16 %, worst 0.35 % (the low-sun hours, where
   ISO 52010-1 clamps sin(altitude) at cos 85 deg).
   POSITIVE CONTROL: the same check with the solar hour shifted by one must
   FAIL — the agreement depends on the timing convention, not on luck.
2. Humidity: the humidity ratio from the dew point must agree with the one
   from RH * p_sat(dry bulb). Result: mean |d| <= 0.07 g/kg at every station.
"""
import os
import statistics
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cwec_monthly as c  # noqa: E402
import iso52010  # noqa: E402

SOLAR_TOL_PCT = 0.5
HUMIDITY_TOL_GKG = 0.1


def annual_horizontal(header, rows, hour_shift=0):
    total = 0.0
    for r in rows:
        if r["ghi"] <= 0:
            continue
        nday = c.MONTH_START[r["month"] - 1] + r["day"]
        alt, az = iso52010.solar_position(nday, r["hour"] + hour_shift, header["lat"], header["lon"], header["tz"])
        tot, _ = iso52010.irradiance(nday, alt, az, r["dhi"], r["dni"], 0, 0)
        total += tot
    return total


def main(root):
    files = c.epw_files(root)
    solar, shifted, humid = [], [], []
    for i, f in enumerate(files):
        h, rows = c.read_epw(f)
        ghi = sum(r["ghi"] for r in rows)
        solar.append((abs(annual_horizontal(h, rows) / ghi - 1) * 100, h["name"]))
        if i % 50 == 0:
            shifted.append((abs(annual_horizontal(h, rows, 1) / ghi - 1) * 100, h["name"]))
        d = []
        for r in rows:
            pv = r["rh"] / 100 * c.p_sat(r["t"])
            d.append(abs(c.humidity_ratio(r["dew"], r["p"]) - 0.622 * pv / (r["p"] - pv)) * 1000)
        humid.append((statistics.mean(d), h["name"]))

    ok = True
    worst = max(solar)
    print(f"horizontal vs GHI, {len(solar)} stations: median {statistics.median(s for s, _ in solar):.2f} %, worst {worst[0]:.2f} % ({worst[1]})")
    ok &= worst[0] <= SOLAR_TOL_PCT
    least = min(shifted)
    print(f"positive control, hour shifted by one ({len(shifted)} stations): least {least[0]:.2f} % ({least[1]}) — must exceed {SOLAR_TOL_PCT} %")
    ok &= least[0] > SOLAR_TOL_PCT
    worst = max(humid)
    print(f"humidity ratio, dew point vs RH: worst mean |d| {worst[0]:.3f} g/kg ({worst[1]})")
    ok &= worst[0] <= HUMIDITY_TOL_GKG
    print("PASS" if ok else "FAIL")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main(os.path.expanduser(sys.argv[1]))
