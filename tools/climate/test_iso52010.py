"""Check iso52010 against the EPB Center's ISO 52010-1 demo output.

The oracle is a CSV exported from Demo_ISO_52010-1_Output_TMY_Strasbourg
(sheet `data`, rows 21+, columns E..AL), passed as the first argument:

    python3 -I tools/climate/test_iso52010.py ~/Documents/OpenBuilding/climate-data/oracles/strasbourg_52010.csv

Result 2026-10-30: solar position matches EXACTLY (0.000000 deg, every sun-up
hour). Irradiance: median hourly |d| ~1 W/m2; annual totals 0.02 % (HOR) to
1.5 % (north vertical) LOW. Part is the oracle's missing input (G_dif must be
recovered from (1 - F1) * G_dif, multi-rooted at low sun); the systematic,
diffuse-weighted part likely means ISO 52010-1 tabulates Perez coefficients
that differ from the 1990 composite set used here. Closing it needs the ISO
52010-1 text (ABCD-OBJECTIVE-PRO.md section 6, the ask to Dr. Kesik).
"""
import csv
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import iso52010  # noqa: E402

LAT, LON, TZ = 48.585, 7.736, 1


def recover_g_dif(nday, alt, g_hor, hor_d, s_alt):
    """The demo publishes G_hor and the horizontal sky diffuse (1 - F1) * G_dif,
    not G_dif itself. Near the horizon (G_hor - G_dif) / sin(alt) makes the
    equation multi-rooted, so scan for every root and take the one whose F1 is
    smallest — the root the demo's own direct/diffuse input produced is not
    knowable from its output, so low-sun hours are reported separately."""
    def resid(gd):
        f1, _ = iso52010.perez_f1_f2(nday, alt, gd, (g_hor - gd) / s_alt)
        return (1 - f1) * gd - hor_d, f1

    steps = 2000
    roots = []
    prev_gd, (prev_r, _) = 0.0, resid(0.0)
    for i in range(1, steps + 1):
        gd = g_hor * i / steps
        r, _ = resid(gd)
        if (prev_r <= 0 < r) or (prev_r >= 0 > r):
            lo, hi = prev_gd, gd
            for _ in range(60):
                mid = (lo + hi) / 2
                if (resid(mid)[0] > 0) == (r > 0):
                    hi = mid
                else:
                    lo = mid
            roots.append((resid((lo + hi) / 2)[1], (lo + hi) / 2))
        prev_gd, prev_r = gd, r
    return max(roots, key=lambda fr: fr[1])[1] if roots else hor_d


def main(path):
    rows = list(csv.DictReader(open(path)))[744:]  # skip the December warm-up month
    worst_alt = worst_az = 0.0
    for r in rows:
        alt_ref = float(r["alt"])
        if alt_ref <= 0:
            continue
        alt, az = iso52010.solar_position(int(r["dy"]), int(r["hd"]), LAT, LON, TZ)
        worst_alt = max(worst_alt, abs(alt - alt_ref))
        d_az = (az - float(r["azi"]) + 180) % 360 - 180
        worst_az = max(worst_az, abs(d_az))
    print(f"sun up hours: worst |d alt| = {worst_alt:.6f} deg, worst |d azimuth| = {worst_az:.6f} deg")

    # Irradiance. The demo's horizontal "diffuse" is (1 - F1) * G_dif, so the
    # raw G_dif is recovered per hour by bisection before the 9 surfaces are
    # computed from it.
    surfaces = [("NV", 90, 180), ("EV", 90, 90), ("SV", 90, 0), ("WV", 90, -90),
                ("N45", 45, 180), ("E45", 45, 90), ("S45", 45, 0), ("W45", 45, -90), ("HOR", 0, 0)]
    sums = {k: [0.0, 0.0] for k, _, _ in surfaces}
    worst = worst_high = 0.0
    for r in rows:
        alt, az, nday = float(r["alt"]), float(r["azi"]), int(r["dy"])
        g_hor, hor_d = float(r["HOR"]), float(r["HORd"])
        if alt <= 0 or g_hor <= 0:
            continue
        s_alt = iso52010.math.sin(alt * iso52010.DEG)
        gd = recover_g_dif(nday, alt, g_hor, hor_d, s_alt)
        gbn = (g_hor - gd) / s_alt
        for k, tilt, orient in surfaces:
            tot, _ = iso52010.irradiance(nday, alt, az, gd, gbn, tilt, orient)
            ref = float(r[k])
            worst = max(worst, abs(tot - ref))
            if alt >= 5:
                worst_high = max(worst_high, abs(tot - ref))
            sums[k][0] += tot
            sums[k][1] += ref
    print(f"hourly irradiance: worst |d| = {worst:.4f} W/m2 (all hours), {worst_high:.4f} W/m2 (sun >= 5 deg)")
    for k, (mine, ref) in sums.items():
        print(f"  {k:4} annual {mine / 1000:8.2f} kWh/m2  demo {ref / 1000:8.2f}  d = {100 * (mine - ref) / ref:+.4f} %")


if __name__ == "__main__":
    main(sys.argv[1])
