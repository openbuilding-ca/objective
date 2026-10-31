"""ISO 52010-1 — solar position and irradiance on inclined surfaces.

Hourly global and diffuse horizontal irradiance -> total irradiance on a
surface of any orientation and tilt, by the Perez (1990) anisotropic sky
model as ISO 52010-1 applies it. Checked hour by hour against the EPB
Center's demo output (Demo_ISO_52010-1_Output_TMY_Strasbourg_2021-10-01)
by test_iso52010.py.

Angle conventions follow ISO 52010-1: azimuths are measured from SOUTH,
positive towards EAST, negative towards WEST (north = 180); tilt is from
horizontal (vertical = 90). Hours are numbered 1..24 and each value is the
mean over the hour ENDING at that hour.
"""
import math

DEG = math.pi / 180.0
SOLAR_CONSTANT = 1370.0  # W/m2, ISO 52010-1


def declination(nday):
    """Solar declination, degrees (nday = day of year, 1..365)."""
    r = 360.0 / 365.0 * nday * DEG
    return (
        0.33281
        - 22.984 * math.cos(r)
        - 0.3499 * math.cos(2 * r)
        - 0.1398 * math.cos(3 * r)
        + 3.7872 * math.sin(r)
        + 0.03205 * math.sin(2 * r)
        + 0.07187 * math.sin(3 * r)
    )


def equation_of_time(nday):
    """Equation of time, minutes."""
    if nday < 21:
        return 2.6 + 0.44 * nday
    if nday < 136:
        return 5.2 + 9.0 * math.cos((nday - 43) * 0.0357)
    if nday < 241:
        return 1.4 - 5.0 * math.cos((nday - 135) * 0.0449)
    if nday < 336:
        return -6.3 - 10.0 * math.cos((nday - 306) * 0.036)
    return 0.45 * (nday - 359)


def solar_position(nday, hour, lat, lon, tz):
    """(altitude, azimuth) in degrees for the middle of the hour ending at `hour`."""
    t_shift = tz - lon / 15.0
    t_sol = hour - equation_of_time(nday) / 60.0 - t_shift
    omega = 180.0 / 12.0 * (12.5 - t_sol)  # hour angle, positive before solar noon
    if omega > 180:
        omega -= 360
    if omega < -180:
        omega += 360
    d = declination(nday) * DEG
    phi = lat * DEG
    w = omega * DEG
    sin_alt = math.sin(d) * math.sin(phi) + math.cos(d) * math.cos(phi) * math.cos(w)
    alt = math.asin(max(-1.0, min(1.0, sin_alt)))
    if math.cos(alt) < 1e-9:
        return alt / DEG, 0.0
    sin_az = math.cos(d) * math.sin(w) / math.cos(alt)
    cos_az = (math.cos(w) * math.cos(d) * math.sin(phi) - math.sin(d) * math.cos(phi)) / math.cos(alt)
    az = math.atan2(sin_az, cos_az)
    return alt / DEG, az / DEG


# Perez et al. (1990) brightness-bin coefficients, as tabulated in ISO 52010-1.
# Each row: upper bound of epsilon, f11, f12, f13, f21, f22, f23.
PEREZ = [
    (1.065, -0.008, 0.588, -0.062, -0.060, 0.072, -0.022),
    (1.230, 0.130, 0.683, -0.151, -0.019, 0.066, -0.029),
    (1.500, 0.330, 0.487, -0.221, 0.055, -0.064, -0.026),
    (1.950, 0.568, 0.187, -0.295, 0.109, -0.152, -0.014),
    (2.800, 0.873, -0.392, -0.362, 0.226, -0.462, 0.001),
    (4.500, 1.132, -1.237, -0.412, 0.288, -0.823, 0.056),
    (6.200, 1.060, -1.600, -0.359, 0.264, -1.127, 0.131),
    (math.inf, 0.678, -0.327, -0.250, 0.156, -1.377, 0.251),
]
KAPPA = 1.041  # rad^-3 (Perez: 5.535e-6 deg^-3)


def air_mass(alt):
    if alt >= 10:
        return 1.0 / math.sin(alt * DEG)
    return 1.0 / (math.sin(alt * DEG) + 0.15 * (alt + 3.885) ** -1.253)


def perez_f1_f2(nday, alt, g_dif, g_dir_n):
    """Circumsolar (F1) and horizon (F2) brightening coefficients."""
    if g_dif <= 0 or alt <= 0:
        return 0.0, 0.0
    z = (90.0 - alt) * DEG
    eps = ((g_dif + g_dir_n) / g_dif + KAPPA * z**3) / (1 + KAPPA * z**3)
    i_ext = SOLAR_CONSTANT * (1 + 0.033 * math.cos(360.0 / 365.0 * nday * DEG))
    delta = air_mass(alt) * g_dif / i_ext
    for bound, f11, f12, f13, f21, f22, f23 in PEREZ:
        if eps < bound:
            f1 = max(0.0, f11 + f12 * delta + f13 * z)
            f2 = f21 + f22 * delta + f23 * z
            return f1, f2
    raise AssertionError("unreachable")


def irradiance(nday, alt, az, g_dif, g_dir_n, tilt, orient, rho=0.2):
    """(total, diffuse) W/m2 on a surface; diffuse per ISO 52010-1 excludes
    the circumsolar part (counted with direct) and includes the horizon band
    and the ground-reflected part."""
    if alt <= 0:
        return 0.0, 0.0
    b = tilt * DEG
    cos_ic = math.sin(alt * DEG) * math.cos(b) + math.cos(alt * DEG) * math.sin(b) * math.cos((az - orient) * DEG)
    f1, f2 = perez_f1_f2(nday, alt, g_dif, g_dir_n)
    a_ = max(0.0, cos_ic)
    b_ = max(math.cos(85 * DEG), math.sin(alt * DEG))
    direct = g_dir_n * a_
    circumsolar = g_dif * f1 * a_ / b_
    sky = g_dif * ((1 - f1) * (1 + math.cos(b)) / 2 + f2 * math.sin(b))
    ground = (g_dir_n * math.sin(alt * DEG) + g_dif) * rho * (1 - math.cos(b)) / 2
    return direct + circumsolar + sky + ground, sky + ground
