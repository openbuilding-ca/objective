#!/usr/bin/env python3
"""CSA F280-12 Annex J's expected whole-house values as a test fixture, verified against the PDF.

    python3 tools/f280/annex_j_fixture.py <2421751-F280.txt>            # write test/fixtures/f280-annex-j.json
    python3 tools/f280/annex_j_fixture.py <2421751-F280.txt> --check    # the committed fixture is what this builds

The licensed PDF cannot be read by tools (it is encrypted, with protected fonts: text comes out scrambled and pages
render blank), so the values come from two independent readings:

  1. The text extract of Andy's licensed copy (ABCD.EARTH `artex-osx/docs/reference guides/2421751-F280.txt`). Its
     prose is sound; its TABLES shift columns. The 8.3.9 a) table is read from it here, and each SI value must pair
     with its imperial twin (W = Btuh / 3.412, Annex J's own conversion).
  2. A transcription of the printed pages (Andy's screenshots of the PDF, 2026-11-19), held below as data, each table
     with its page. Every value was checked by eye against the page.

The script fails unless (1) and (2) agree on all 32 rows of 8.3.9 a). The rest of Annex J (the variant changes, the
8.3.2 reference values, 8.3.10, Annex K 8.3.3) is reading (2) alone: the extract scrambles those tables. To verify:
open the PDF at the page given, compare the numbers below, rerun with --check.

Sandbox only (Andy, 2026-11-18): the F280 cases and their expected values never go to the public repo.
"""
import json
import pathlib
import re
import sys

BTUH_PER_W = 3.412
PAIR_TOLERANCE = 0.001  # relative; a mis-paired table is off by far more
FIXTURE = pathlib.Path(__file__).resolve().parents[2] / "test" / "fixtures" / "f280-annex-j.json"
CHECKED = "Andy's screenshots 2026-11-19"

# 8.3.9 a) WHOLE HOUSE VERIFICATION, pp. 177-182: (location, vintage) -> per archetype 1-4,
# (loss W, gain W, loss Btuh, gain Btuh), as printed.
PDF_8_3_9 = {
    ("Ottawa (Orleans)", "1960s"): [(30063, 9755, 102574, 33285), (39022, 17656, 133143, 60243),
                                    (19608, 6798, 66901, 23194), (16186, 4608, 55227, 15723)],
    ("Ottawa (Orleans)", "1980s"): [(23927, 8637, 81638, 29468), (31852, 16512, 108680, 56339),
                                    (15700, 6119, 53567, 20879), (12705, 4004, 43348, 13660)],
    ("Ottawa (Orleans)", "2010s"): [(11787, 7321, 40216, 24979), (15753, 14641, 53748, 49957),
                                    (7329, 5358, 25007, 18282), (5607, 3468, 19130, 11834)],
    ("Ottawa (Orleans)", "net zero"): [(8299, 4732, 28318, 16146), (11276, 7860, 38472, 26820),
                                       (5324, 3420, 18164, 11670), (4245, 2605, 14482, 8888)],
    ("Vancouver (City Hall)", "1960s"): [(16014, 8767, 54641, 29914), (12962, 7892, 44226, 26929),
                                         (10203, 6135, 34812, 20934), (8131, 4094, 27742, 13970)],
    ("Vancouver (City Hall)", "1980s"): [(12962, 7892, 44226, 26929), (16856, 16002, 57514, 54600),
                                         (8339, 5596, 28453, 19094), (6533, 3609, 22291, 12315)],
    ("Vancouver (City Hall)", "2010s"): [(6873, 6855, 23451, 23390), (9056, 14491, 30899, 49442),
                                         (4233, 4982, 14444, 16999), (3163, 3171, 10794, 10820)],
    ("Vancouver (City Hall)", "net zero"): [(4716, 4376, 16091, 14930), (6325, 7585, 21582, 25878),
                                            (2993, 3147, 10212, 10738), (2322, 2380, 7922, 8121)],
}

# Cl. 8.3.4-8.3.8 on the base case (Archetype 1 / 2010s / Ottawa), "Expected change - Whole house", pp. 173-176:
# (clause, variant, quantity, W, Btuh, page, note). Values as printed, signs included (see SIGN_CONVENTION).
VARIANTS = [
    ("8.3.4 b", "ventilation supplied directly to the bedrooms", "loss", 0, 0, "173-174",
     "whole house unchanged; a room test (Annex K)"),
    ("8.3.4 b", "ventilation supplied directly to the bedrooms", "gain", 0, 0, "173-174",
     "whole house unchanged; a room test (Annex K)"),
    ("8.3.4 c", "exhaust-only at the HRV's flow", "loss", -897, -3059, 174,
     "printed -897: the MAGNITUDE (exhaust-only at the HRV's flow without recovery must raise the loss; superposing "
     "the exhaust on AIM-2's leakage gives about +930 W by hand)"),
    ("8.3.4 c", "exhaust-only at the HRV's flow", "gain", 108, 368, 174, ""),
    ("8.3.5 b", "blinds or curtains on every window", "gain", 1489, 5080, "174-175", "a reduction in gain"),
    ("8.3.5 c", "reflective blinds on every window", "gain", 2084, 7112, "174-175", "a reduction in gain"),
    ("8.3.6 b", "no external shading", "gain", 165, 563, 175, "an increase in gain (the overhangs removed)"),
    ("8.3.7 b", "3.0 ACH50, ELA10 844 cm2 (base 1.5 ACH50)", "loss", 1925, 6568, 175, ""),
    ("8.3.7 b", "3.0 ACH50, ELA10 844 cm2 (base 1.5 ACH50)", "gain", 118, 403, 175, ""),
    ("8.3.8", "front door SE", "gain", 1995, 6808, 176, ""),
    ("8.3.8", "front door E", "gain", 2467, 8419, 176, ""),
    ("8.3.8", "front door NE", "gain", 2014, 6873, 176, ""),
    ("8.3.8", "front door N", "gain", 3, 9, 176, ""),
    ("8.3.8", "front door NW", "gain", 2073, 7073, 176, ""),
    ("8.3.8", "front door W", "gain", 2529, 8630, 176, ""),
    ("8.3.8", "front door SW", "gain", 2054, 7008, 176, ""),
]

SIGN_CONVENTION = (
    "Annex J prints the 8.3.4-8.3.8 changes with no consistent sign (checked against the PDF 2026-11-19): positive for a "
    "REDUCTION (8.3.5 blinds), positive for an INCREASE (8.3.6 no shading, 8.3.7 3.0 ACH50, 8.3.8 turns), negative for an "
    "increase (8.3.4 c exhaust-only loss). Compare magnitudes; check each direction by physics.")

GAIN_IS = (
    "the NOMINAL cooling capacity, Cl. 6.3.1 CSCn = LM x sum of HGsr at LM 1.3 - SETTLED 2026-11-19 by Annex K 8.3.3 "
    "(pp. 188-190): spreading Archetype 1's internal gains over its 18 rooms moves the 4 occupied rooms -387 W and the "
    "other 14 +111 W, a total of ~1995 W = 1.3 x (5 x 70 + 4 x 295.57) = 1992 W (no floor area explains it without the "
    "1.3: 4A + 350 = 1995 needs 411 m2)")

ERRATUM = (
    "8.3.9 a) Vancouver 1960s Archetype 2 (12 962 W / 7892 W; 44 226 / 26 929 Btuh) is digit for digit Vancouver 1980s "
    "Archetype 1, and smaller than 1960s Archetype 1 though Archetype 2 is the larger house (Ottawa 1960s: 39 022 vs "
    "30 063 W). Transcribed as printed; Kieran to confirm before it is used as a target.")

# Cl. 8.3.2 c)-f), pp. 171-173: the reference model's own inputs
REPORT_REVIEW_8_3_2 = {
    "page": "171-173", "verified": True,
    "effective_rsi_c": {"above_grade_wall": 3.428, "garage_wall": 3.363, "above_grade_header": 3.587,
                        "garage_wall_header": 3.361, "below_grade_wall_added": 2.76, "ceiling": 9.05,
                        "exposed_floor": 5.349, "floor_slab_added": 0.0},
    # Cl. 8.3.2 c) cites Annex I: the values to report against (Kieran, Rev. 7, I9; Table I.3 b), pp. 165-168)
    "effective_rsi_annex_i_table_i3b": {"above_grade_wall": 3.429, "garage_wall": 3.364, "above_grade_header": 3.587,
                                        "garage_wall_header": 3.362},
    "effective_rsi_note": ("Cl. 8.3.2 c) cites Annex I: report against Table I.3 b) (pp. 165-168), which differs from Annex J's "
                           "copy above by 0.001 on three assemblies (Kieran, Rev. 7, I9). The build (tools/f280/build_case.py "
                           "RSI) uses these."),
    "window_d": {"shgc": 0.47, "rsi": 0.511},
    "door_rsi_e": 1.101,
    "hrv_f": {"ase": 0.76, "atre": 0},
}

# Cl. 8.3.10 c)-d), p. 183
FOUNDATION_8_3_10 = {
    "page": 183, "verified": True,
    "base": "Archetype 2, Ottawa, 1980s, facing northeast, no slab or perimeter insulation",
    "variants": [
        {"clause": "8.3.10 c", "variant": "R10 perimeter insulation where the slab is < 24 in below grade (the walk-out)",
         "loss_change_W": -18, "loss_change_Btuh": -61, "gain_change_W": 0},
        {"clause": "8.3.10 d", "variant": "R10 under the full slab", "loss_change_W": -191, "loss_change_Btuh": -652,
         "gain_change_W": 0},
    ],
}

# Annex K Cl. 8.3.3, pp. 188-190 (the room test that settles GAIN_IS)
ANNEX_K_8_3_3 = {
    "page": "188-190", "verified": True,
    "note": "room test (Annex K); whole house 0. Family, Kitchen, Living, Dining -387 W each; the other 14 rooms +111 W each",
}


def pairs(w, b):
    return abs(b / BTUH_PER_W - w) <= max(1.0, PAIR_TOLERANCE * abs(w))


def clean(text):
    text = re.sub(r"\(text\) Licensed.*?interdit\.", "", text, flags=re.S)
    return re.sub(r"\s*\|\s*|\s+", " ", text)


def extract_8_3_9(text):
    """8.3.9 a) from the text extract: {(location, vintage, archetype): {units: (loss, gain)}}."""
    start = text.find("Clause 8.3.9 a) WHOLE HOUSE VERIFICATION")
    if start < 0:
        start = text.find("LOCATION AND VINTAGE VERIFICATION")
    window = text[start - 20000:start + 20000]  # the tables sit just before and after that heading
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
        location = "Ottawa (Orleans)" if city == "Ottawa" else "Vancouver (City Hall)"
        loss, gain = (int(g.replace(" ", "")) for g in (m.group(2), m.group(3)))
        out.setdefault((location, vintage, int(m.group(1))), {})[units] = (loss, gain)
    return out


def build(extract_path):
    extracted = extract_8_3_9(clean(open(extract_path, encoding="utf-8").read()))
    models, problems = [], []
    for (location, vintage), rows in PDF_8_3_9.items():
        for arch, (lw, gw, lb, gb) in enumerate(rows, 1):
            for w, b, what in ((lw, lb, "loss"), (gw, gb, "gain")):
                if not pairs(w, b):
                    problems.append(f"8.3.9 {location} {vintage} archetype {arch} {what}: {w} W vs {b} Btuh do not pair")
            got = extracted.get((location, vintage, arch), {})
            if got.get("SI") != (lw, gw) or got.get("imperial") != (lb, gb):
                problems.append(f"8.3.9 {location} {vintage} archetype {arch}: the PDF reads SI {(lw, gw)} / imperial "
                                f"{(lb, gb)}, the text extract {got or 'nothing'}")
            models.append({"location": location, "vintage": vintage, "archetype": arch,
                           "loss_W": lw, "gain_W": gw, "loss_Btuh": lb, "gain_Btuh": gb})
    if len(extracted) != 32:
        problems.append(f"8.3.9: the text extract gave {len(extracted)} models, not 32")
    for c, v, q, w, b, _, _ in VARIANTS:
        if not pairs(w, b):
            problems.append(f"{c} {v} {q}: {w} W vs {b} Btuh do not pair")
    for f in FOUNDATION_8_3_10["variants"]:
        if not pairs(f["loss_change_W"], f["loss_change_Btuh"]):
            problems.append(f"{f['clause']}: {f['loss_change_W']} W vs {f['loss_change_Btuh']} Btuh do not pair")
    if problems:
        sys.exit("\n".join(problems))
    return {
        "source": "CSA F280-12 Annex J (whole house), read from the text extract of Andy's licensed copy",
        "recorded": "2026-11-18",
        "sandbox_only": True,
        "verified_against_pdf": ("yes for Annex J pp. 171-183 (" + CHECKED + "): 8.3.2 c-f, every 8.3.4-8.3.8 variant, "
                                 "all 32 rows of 8.3.9 a) (W and Btuh), 8.3.10 c-d"),
        "gain_is": GAIN_IS,
        "band_8_4_1": {
            "low": "result >= 98 % of expected OR no more than 146.5 W below it",
            "high": "result <= 120 % of expected OR no more than 146.5 W above it",
            "low_fraction": 0.98, "high_fraction": 1.2, "absolute_W": 146.5,
        },
        "base_case": {"archetype": 1, "vintage": "2010s", "location": "Ottawa (Orleans)", "case": "F280-1"},
        "location_and_vintage_8_3_9": models,
        "variants_on_base_case": [
            {"clause": c, "variant": v, "quantity": q, "expected_change_W": w, "expected_change_Btuh": b,
             "verified": True, "note": n, "page": page}
            for c, v, q, w, b, page, n in VARIANTS
        ],
        "sign_convention": SIGN_CONVENTION,
        "report_review_8_3_2": REPORT_REVIEW_8_3_2,
        "location_and_vintage_8_3_9_page": "177-182",
        "suspected_erratum_in_f280_12": ERRATUM,
        "foundation_8_3_10": FOUNDATION_8_3_10,
        "annex_k_8_3_3": ANNEX_K_8_3_3,
    }


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) != 1:
        sys.exit(__doc__)
    text = json.dumps(build(args[0]), indent=2, ensure_ascii=False) + "\n"
    if "--check" in sys.argv:
        if FIXTURE.read_text(encoding="utf-8") != text:
            sys.exit(f"{FIXTURE.name} differs from what the script builds: rebuild it (no --check) and review the diff")
        print(f"{FIXTURE.name}: matches; 32 models of 8.3.9 a) agree between the text extract and the PDF")
        return
    FIXTURE.write_text(text, encoding="utf-8")
    print(f"wrote {FIXTURE}")


if __name__ == "__main__":
    main()
