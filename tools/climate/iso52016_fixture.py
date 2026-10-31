"""Record the EPB Center workbook's monthly cooling balance as a test fixture
(test/fixtures/iso52016-calc-c-m.json), for test/coolingISO52016.test.cjs.

    python3 -I tools/climate/iso52016_fixture.py <Demo_ISO_52016-1_v2.92_...xlsm>

From sheet Calc_C_m, one row per month (rows 14-25, January-December): the
loss and gain totals (K, Q), the conductances the time constant uses (F, the
ground's adjusted G6, H), and what the workbook computes from them - τ (L),
γ (R), a (S), η_C,ls (T), the continuous need (U). And from sheet Calc_H_m
the heating balance the same way (rows 14-25: K, Q, F + G6 + H, then L, AT,
AU, AV, AW), its continuous reduction factor a_H,red = 1 in every month
(col. AO), so AS = K. C_m x A from Input_0 (D23 x D12), as col. L reads it.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import xlsx_cells as X  # noqa: E402

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def num(c, ref):
    return float(c[ref][0])


def main(path):
    wb = X.WB(path)
    c = wb.cells("Calc_C_m")
    i = wb.cells("Input_0")
    cm_a = num(i, "D23") * num(i, "D12")
    g6 = num(c, "G6")
    months = []
    for r in range(14, 26):
        months.append({
            "month": c[f"A{r}"][0], "hours": num(c, f"C{r}"),
            "theta_e": num(c, f"D{r}"), "theta_set": num(c, f"E{r}"),
            "qht": num(c, f"K{r}"), "qgn": num(c, f"Q{r}"),
            "sumH": num(c, f"F{r}") + g6 + num(c, f"H{r}"),
            "tau": num(c, f"L{r}"), "gamma": num(c, f"R{r}"), "a": num(c, f"S{r}"),
            "eta": num(c, f"T{r}"), "need_cont": num(c, f"U{r}"),
        })
    h = wb.cells("Calc_H_m")
    hg6 = num(h, "G6")
    heating = []
    for r in range(14, 26):
        assert num(h, f"AO{r}") == 1.0, f"Calc_H_m AO{r}: intermittent heating"
        heating.append({
            "month": h[f"A{r}"][0], "qht": num(h, f"AS{r}"), "qgn": num(h, f"Q{r}"),
            "sumH": num(h, f"F{r}") + hg6 + num(h, f"H{r}"),
            "tau": num(h, f"L{r}"), "gamma": num(h, f"AT{r}"), "a": num(h, f"AU{r}"),
            "eta": num(h, f"AV{r}"), "need": num(h, f"AW{r}"),
        })
    doc = {"source": os.path.basename(path), "sheets": ["Calc_C_m", "Calc_H_m"], "cmA_J_per_K": cm_a,
           "months": months, "heating": heating}
    out = os.path.join(REPO, "test/fixtures/iso52016-calc-c-m.json")
    with open(out, "w") as f:
        json.dump(doc, f, indent=1, ensure_ascii=False)
    print(f"{len(months)} months -> {out}")


if __name__ == "__main__":
    main(sys.argv[1])
