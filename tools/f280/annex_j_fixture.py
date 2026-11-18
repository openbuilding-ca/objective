#!/usr/bin/env python3
"""Record CSA F280-12 Annex J's whole-house expected values as a test fixture.

    python3 tools/f280/annex_j_fixture.py <path to 2421751-F280.txt> > test/fixtures/f280-annex-j.json

The source is the text extract of Andy's licensed copy of F280-12, kept in the ABCD.EARTH
repo (`artex-osx/docs/reference guides/2421751-F280.txt`). This sandbox only (Andy,
2026-11-18): the F280 cases and their expected values never go to the public repo.

What it reads:
  * Cl. 8.3.9 (location + vintage): whole-house heat loss and sensible heat gain for each
    archetype (1-4) x vintage (1960s, 1980s, 2010s, net zero) x location (Ottawa (Orleans),
    Vancouver (City Hall)) - the Annex J "Reference" columns, in W and in Btuh. The extract
    prints each table twice (imperial, then SI); every SI value is checked against its
    imperial twin (W = Btuh / 3.412 within 0.1 %; Annex J's own conversion and rounding) and
    the script fails loudly if any pair disagrees, so a mis-paired table cannot slip through.
  * The variant changes of Cl. 8.3.4-8.3.8 on the base case (Archetype 1 / 2010s / Ottawa).
    These tables come through the extract column-shifted, so each carries the reading made
    on 2026-11-18 and `verified: false` until Kieran (verification agent) checks it against
    the PDF. Signs are NOT settled: Annex J prints an "expected change" without saying
    whether it is variant minus base or base minus variant.
"""
import json
import re
import sys

BTUH_PER_W = 3.412
PAIR_TOLERANCE = 0.001  # relative; a mis-paired table is off by far more

VARIANTS = [
    # (clause, variant, quantity, W, Btuh, note)
    ("8.3.4 b", "ventilation supplied directly to the bedrooms", "loss", 0, 0,
     "whole house unchanged; a room test (Annex K)"),
    ("8.3.4 b", "ventilation supplied directly to the bedrooms", "gain", 0, 0,
     "whole house unchanged; a room test (Annex K)"),
    ("8.3.4 c", "exhaust-only at the HRV's flow", "loss", -897, -3059,
     "read as 8.3.4 c; the sign is suspect (losing 76 % recovery should RAISE the loss)"),
    ("8.3.4 c", "exhaust-only at the HRV's flow", "gain", 108, 368, ""),
    ("8.3.5 b", "blinds or curtains on every window", "gain", 1489, 5080, "a reduction in gain"),
    ("8.3.5 c", "reflective blinds on every window", "gain", 2084, 7112, "a reduction in gain"),
    ("8.3.6 b", "no external shading", "gain", 165, 563, "placement in the extract uncertain"),
    ("8.3.7 b", "3.0 ACH50, ELA10 844 cm2 (base 1.5 ACH50)", "loss", 1925, 6568, ""),
    ("8.3.7 b", "3.0 ACH50, ELA10 844 cm2 (base 1.5 ACH50)", "gain", 118, 403, ""),
    ("8.3.8", "front door SE", "gain", 1995, 6808, ""),
    ("8.3.8", "front door E", "gain", 2467, 8419, ""),
    ("8.3.8", "front door NE", "gain", 2014, 6873, ""),
    ("8.3.8", "front door N", "gain", 3, 9, ""),
    ("8.3.8", "front door NW", "gain", 2073, 7073, ""),
    ("8.3.8", "front door W", "gain", 2529, 8630, ""),
    ("8.3.8", "front door SW", "gain", 2054, 7008, ""),
]


def clean(text):
    text = re.sub(r"\(text\) Licensed.*?interdit\.", "", text, flags=re.S)
    return re.sub(r"\s*\|\s*|\s+", " ", text)


def location_and_vintage(text):
    start = text.find("Clause 8.3.9 a) WHOLE HOUSE VERIFICATION")
    if start < 0:
        start = text.find("LOCATION AND VINTAGE VERIFICATION")
    # The 8.3.9 tables sit just before and after that heading; take a generous window.
    window = text[start - 20000:start + 20000]
    title = re.compile(r"(Ottawa|Vancouver), (1960s|1980s|2010s|net zero) vintage \((imperial|SI)\)")
    num = r"(\d{1,3}(?: \d{3})+|\d+)"
    row = re.compile(r"Archetype\s+(\d)\s+" + num + r"\s+" + num + r"\s+PASS")
    titles = [(m.start(), m.group(1), m.group(2), m.group(3)) for m in title.finditer(window)]
    out = {}
    for m in row.finditer(window):
        before = [t for t in titles if t[0] < m.start()]
        if not before:
            continue
        _, city, vintage, units = before[-1]
        key = (city, vintage, int(m.group(1)))
        loss, gain = (int(g.replace(" ", "")) for g in (m.group(2), m.group(3)))
        out.setdefault(key, {})[units] = (loss, gain)
    return out


def main():
    text = clean(open(sys.argv[1], encoding="utf-8").read())
    table = location_and_vintage(text)
    models = []
    for (city, vintage, arch), units in sorted(table.items()):
        if "SI" not in units or "imperial" not in units:
            sys.exit(f"8.3.9 {city} {vintage} archetype {arch}: missing a unit table {sorted(units)}")
        (lw, gw), (lb, gb) = units["SI"], units["imperial"]
        for w, b, what in ((lw, lb, "loss"), (gw, gb, "gain")):
            if abs(b / BTUH_PER_W - w) > max(1.0, PAIR_TOLERANCE * abs(w)):
                sys.exit(f"8.3.9 {city} {vintage} archetype {arch} {what}: {w} W vs {b} Btuh do not pair")
        models.append({
            "location": "Ottawa (Orleans)" if city == "Ottawa" else "Vancouver (City Hall)",
            "vintage": vintage,
            "archetype": arch,
            "loss_W": lw, "gain_W": gw, "loss_Btuh": lb, "gain_Btuh": gb,
        })
    if len(models) != 32:
        sys.exit(f"8.3.9: expected 32 models (4 archetypes x 4 vintages x 2 locations), read {len(models)}")
    for _, variant, q, w, b, _ in VARIANTS:
        if abs(b / BTUH_PER_W - w) > max(1.0, PAIR_TOLERANCE * abs(w)):
            sys.exit(f"variant {variant} {q}: {w} W vs {b} Btuh do not pair")
    fixture = {
        "source": "CSA F280-12 Annex J (whole house), read from the text extract of Andy's licensed copy",
        "recorded": "2026-11-18",
        "sandbox_only": True,
        "verified_against_pdf": False,
        "gain_is": "total SENSIBLE heat gain (Cl. 6.2.9), before the latent load factor of Cl. 6.3",
        "band_8_4_1": {
            "low": "result >= 98 % of expected OR no more than 146.5 W below it",
            "high": "result <= 120 % of expected OR no more than 146.5 W above it",
            "low_fraction": 0.98, "high_fraction": 1.20, "absolute_W": 146.5,
        },
        "base_case": {"archetype": 1, "vintage": "2010s", "location": "Ottawa (Orleans)", "case": "F280-1"},
        "location_and_vintage_8_3_9": models,
        "variants_on_base_case": [
            {"clause": c, "variant": v, "quantity": q, "expected_change_W": w,
             "expected_change_Btuh": b, "sign_settled": False, "verified": False, "note": n}
            for c, v, q, w, b, n in VARIANTS
        ],
    }
    json.dump(fixture, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
