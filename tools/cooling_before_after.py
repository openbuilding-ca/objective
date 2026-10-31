#!/usr/bin/env python3
"""The cooling before/after table (ABCD-OBJECTIVE-PRO §4.1 step 8).

Three runs of test/coolingBaseline.spec.cjs over the 12 case studies:
  BEFORE  test/cooling-baseline.json            the live engine (4c90628)
  STEP 6  test/cooling-iso52016.json @ 36b8062  ISO 52016-1 monthly, no latent
  NOW     test/cooling-iso52016.json            + F280 Annex B latent, the ERV,
                                                the S08 basis, the method selector

Writes docs/COOLING_ISO52016_BEFORE_AFTER.md. Every TEUI difference is the
cooling electricity's (d_117 / area - witnessed to the kWh), d_117 = CED
mitigated / COP, and NOW's CED mitigated = its sensible part + the latent; so
each case's change splits exactly into NOW's sensible part minus BEFORE's
whole CED (which carried the old latent factor) plus NOW's latent, divided by
the same COP. That split is the explanation column.

    python3 tools/cooling_before_after.py
"""
import json
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parent.parent
STEP6_COMMIT = "36b8062"
BAR = 10.0  # % on TEUI (Andy 2026-10-30)

CHAIN = [
    ("energy.teui", "TEUI", "kWh/m²·yr"),
    ("energy.ced.unmitigated", "CED unmitigated (d_129)", "kWh"),
    ("energy.ced.mitigated", "CED mitigated (m_129)", "kWh"),
    ("cooling.freeCoolingLimit", "Free cooling (h_124)", "kWh"),
    ("ventilation.energyRecoveredCooling", "Heat recovery, cooling (d_123)", "kWh"),
    ("cooling.daysActiveCooling", "Days of active cooling (m_124)", "days"),
    ("radiantGains.subtotal.coolingGain", "Solar, glazing (k_79)", "kWh"),
    ("internal.coolingLoad.occupants", "Internal (k_71)", "kWh"),
    ("envelope.total.heatGain", "Envelope (k_104)", "kWh"),
    ("transmissionLoss.thermalBridgePenalty.heatGain", "Thermal bridges (k_97)", "kWh"),
    ("airTightness.heatGain", "Air leakage (k_103)", "kWh"),
    ("ventilation.heatGain", "Ventilation (d_122)", "kWh"),
    ("cooling.latentLoadFactor", "Latent load factor (design)", ""),
    ("energy.peakCooling.totalKw", "Peak cooling (d_139)", "kW"),
    ("f280.nominalCoolingCapacity", "F280 nominal capacity", "W"),
    ("mechanical.cooling.electricalDemand", "Cooling electricity (d_117)", "kWh"),
]


def num(v):
    try:
        return float(str(v).replace(",", ""))
    except (TypeError, ValueError):
        return None


def load(path=None, commit=None):
    if commit:
        text = subprocess.run(
            ["git", "show", f"{commit}:test/cooling-iso52016.json"],
            cwd=ROOT, check=True, capture_output=True, text=True,
        ).stdout
    else:
        text = (ROOT / path).read_text()
    return json.loads(text)["results"]


def fmt(v, unit):
    if v is None:
        return "—"
    if unit in ("kWh", "W"):
        return f"{v:,.0f}"
    if unit == "days":
        return f"{v:.0f}"
    return f"{v:,.2f}"


def pct(new, old):
    if new is None or not old:
        return None
    return (new - old) / old * 100


def explain(b, n, model):
    """One case-model's TEUI change, split exactly by the cooling electricity
    (CED mitigated / COP / area), each run on its own COP."""
    area = num(n["building.conditionedFloorArea"])
    cop = num(n["mechanical.cooling.effectiveCop"])
    if n["mechanical.cooling.systemType"] == "No Cooling" or not cop:
        return "No cooling system: the load stands, unmet - TEUI does not move."
    iso = n.get("cooling.iso52016") or {}
    latent = iso.get("latent") or 0.0
    ced_b = num(b["energy.ced.mitigated"]) or 0.0
    ced_n = num(n["energy.ced.mitigated"]) or 0.0
    elec_b = num(b["mechanical.cooling.electricalDemand"]) or 0.0
    cop_b = ced_b / elec_b if elec_b else cop  # BEFORE's COP, from its own d_117
    d_teui = (num(n["energy.teui"]) or 0) - (num(b["energy.teui"]) or 0)
    vent_m2 = (num(n["ventilation.volumetricRate"]) or 0) / area if area else 0
    if abs(cop_b - cop) < 0.005:
        sens = (ced_n - latent) - ced_b
        head = (
            f"ΔTEUI {d_teui:+.1f} = (NOW sensible − BEFORE CED {sens / area:+.1f} + NOW latent"
            f" {latent / area:+.1f} kWh/m²) ÷ COP {cop:.2f}"
        )
    else:
        head = (
            f"ΔTEUI {d_teui:+.1f} = NOW (sensible {(ced_n - latent) / area:.1f} + latent {latent / area:.1f}"
            f" kWh/m²) ÷ COP {cop:.2f} − BEFORE {ced_b / area:.1f} kWh/m² ÷ COP {cop_b:.2f}"
        )
    parts = [
        head,
        f"latent: ventilation {iso.get('latentVent', 0):,.0f}, leakage {iso.get('latentLeak', 0):,.0f}, "
        f"occupants {iso.get('latentPeople', 0):,.0f} kWh",
        f"ventilation {vent_m2:.2f} L/s·m²",
    ]
    if model == "reference" and abs(cop_b - cop) >= 0.005:
        parts.append(
            f"the reference's cooling COP moved from {cop_b:.2f} (derived from the heat pump's HSPF) to {cop:.2f},"
            " the standard's minimum (Andy 2026-10-31: reference = the standard's minimum, in Reference mode only)"
        )
    elif cop < 1.5:
        parts.append(
            f"COP {cop:.2f} is the target heat pump's derived cooling COP, max(1, HSPF/3.412 − 1) - it multiplies"
            " every kWh"
        )
    return " · ".join(parts)


def main():
    before = load("test/cooling-baseline.json")
    step6 = load(commit=STEP6_COMMIT)
    now = load("test/cooling-iso52016.json")
    cases = sorted(before)

    out = [
        "# Cooling — before / after (ISO 52016-1 monthly + F280 Annex B latent)",
        "",
        "Generated by `tools/cooling_before_after.py` — do not hand-edit; re-run the harness and this script.",
        "",
        "- **BEFORE**: the live engine (`test/cooling-baseline.json`, recorded at `4c90628`).",
        f"- **⑥**: ISO 52016-1 monthly cooling, no latent (`test/cooling-iso52016.json` at `{STEP6_COMMIT}`).",
        "- **NOW**: + the F280 Annex B latent, the HRV/ERV split, the S08 latent basis and the latent method selector,"
        " all at their defaults (F280 method, F280 50 % basis, HRV).",
        f"- **The bar**: TEUI within {BAR:.0f} % of BEFORE (Andy 2026-10-30). Every TEUI difference is the cooling"
        " electricity's alone (d_117 ÷ area), d_117 = CED mitigated ÷ COP; the explanation splits it exactly into"
        " NOW's sensible part minus BEFORE's whole CED (which carried the old latent factor, ×1.6–1.9 on ventilation)"
        " plus NOW's latent, over the same COP.",
        "",
        "## Summary — TEUI",
        "",
        "| Case | Model | BEFORE | ⑥ | Δ ⑥ | NOW | Δ NOW | ≤ 10 % |",
        "|---|---|---:|---:|---:|---:|---:|:---:|",
    ]
    within = 0
    total = 0
    misses = []
    for c in cases:
        for m in ("target", "reference"):
            tb = num(before[c][m]["energy.teui"])
            t6 = num(step6[c][m]["energy.teui"])
            tn = num(now[c][m]["energy.teui"])
            d6, dn = pct(t6, tb), pct(tn, tb)
            ok = dn is not None and abs(dn) <= BAR
            within += ok
            total += 1
            if not ok:
                misses.append((c, m))
            out.append(
                f"| {c[:-4]} | {m} | {tb:.1f} | {t6:.1f} | {d6:+.1f} % | {tn:.1f} | {dn:+.1f} % | {'✓' if ok else '✗'} |"
            )
    out += ["", f"**{within} of {total} within {BAR:.0f} %.**", "", "## Every miss, explained", ""]
    for c, m in misses:
        out.append(f"- **{c[:-4]} — {m}**: {explain(before[c][m], now[c][m], m)}")
    out += ["", "## The full cooling chain, per case", ""]
    for c in cases:
        out += [
            f"### {c[:-4]}",
            "",
            f"{now[c]['target']['climate.location.city']} · heating {now[c]['target']['mechanical.heating.systemType']}"
            f" · cooling {now[c]['target']['mechanical.cooling.systemType']}",
            "",
            "| | unit | Target BEFORE | ⑥ | NOW | Reference BEFORE | ⑥ | NOW |",
            "|---|---|---:|---:|---:|---:|---:|---:|",
        ]
        for key, label, unit in CHAIN:
            row = [label, unit]
            for m in ("target", "reference"):
                for run in (before, step6, now):
                    row.append(fmt(num(run[c][m].get(key)), unit))
            out.append("| " + " | ".join(row) + " |")
        for m in ("target", "reference"):
            iso = now[c][m].get("cooling.iso52016") or {}
            out.append(
                f"| NOW latent, {m} | kWh | sensible {iso.get('sensible', 0):,.0f} + latent {iso.get('latent', 0):,.0f}"
                " | | | | | |"
            )
        out.append("")
    dest = ROOT / "docs" / "COOLING_ISO52016_BEFORE_AFTER.md"
    dest.write_text("\n".join(out) + "\n")
    print(f"wrote {dest.relative_to(ROOT)}: {within} of {total} within {BAR:.0f} %, {len(misses)} explained")


if __name__ == "__main__":
    main()
