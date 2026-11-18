// @ts-check
/**
 * CSA F280-12 WHOLE HOUSE verification harness (Cl. 8.1.2 b): sandbox only.
 *
 *   npx playwright test test/f280WholeHouse.spec.cjs --config=playwright.config.cjs
 *
 * For each F280 case (test/computation/case-studies/F280-*.csv, built by tools/f280/build_case.py)
 * and each variant OBJECTIVE can express, it imports the case, reads S21's whole-house figures, and
 * records them against Annex J's expected values (test/fixtures/f280-annex-j.json) and Cl. 8.4.1's
 * band. Output: test/f280-results.json.
 *
 *   LOSS = f280.totalDesignHeatLoss (W), Cl. 5.2.7.
 *   GAIN = the total SENSIBLE heat gain (Cl. 6.2.9) - Annex J's "gain" - which OBJECTIVE does not
 *          expose on its own: f280.nominalCoolingCapacity is sensible x max(1, latent load factor)
 *          (Cl. 6.3), so the harness divides that factor back out.
 *
 * ENFORCE_BAND is false until the verification agent (Kieran) signs off that F280-1 is modelled as
 * the standard specifies (Cl. 8.3.1-8.3.2). Until then the harness RECORDS pass/fail and asserts
 * only that every figure is a finite, positive number. Known gaps on 2026-11-18, named in each
 * record: no AIM-2 (Cl. 5.2.3.1), no BASESIMP (slab RSI 0 counts as zero loss), the base case's
 * external shading (Annex A) not yet expressed, peak solar and internal gains approximated.
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const ENFORCE_BAND = false;
const CASES_DIR = path.join(__dirname, "computation", "case-studies");
const FIXTURE = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures", "f280-annex-j.json"), "utf8"));
const RESULTS_FILE = path.join(__dirname, "f280-results.json");

// Which Annex J model each case is (Cl. 8.3.9's grid). Add a row as each F280-n is built.
const CASES = {
  "F280-1": { archetype: 1, vintage: "2010s", location: "Ottawa (Orleans)" },
};

// The Cl. 8.3.4-8.3.8 variants OBJECTIVE can express today, as field overrides on F280-1's Target
// row. The others are listed with the reason they are not modelled yet.
const VARIANTS = [
  { clause: "8.3.7 b", variant: "3.0 ACH50, ELA10 844 cm2 (base 1.5 ACH50)", set: { g_109: "3.0" },
    note: "OBJECTIVE's leakage is NRL50 x area / N-factor, not AIM-2" },
  { clause: "8.3.4 c", variant: "exhaust-only at the HRV's flow", set: { d_118: "0" },
    note: "SRE 0 % (Andy 2026-11-18); AIM-2's unbalanced-flow input does not exist yet" },
  { clause: "8.3.8", variant: "front door E", rotate: 1 },
  { clause: "8.3.8", variant: "front door N", rotate: 2 },
  { clause: "8.3.8", variant: "front door W", rotate: 3 },
];
const NOT_MODELLED = [
  { clause: "8.3.4 b", reason: "a room test (Annex K); whole house unchanged" },
  { clause: "8.3.5 b, c", reason: "OBJECTIVE has no interior-shading input (blinds, reflective blinds)" },
  { clause: "8.3.6 b", reason: "the base case's G.1 overhangs are not expressed yet (Annex A), so 'no shading' is not a change" },
  { clause: "8.3.8 SE, NE, NW, SW", reason: "OBJECTIVE holds windows in four orientations; a 45-degree turn has no home" },
];

// A front-door turn moves each window orientation round the compass: S->E->N->W for one quarter
// turn of the house counter-clockwise, as Annex J's sequence reads (base: door S).
const ORIENT_FIELDS = ["d_76", "d_75", "d_74", "d_77"]; // S, E, N, W

function band(result, expected) {
  const b = FIXTURE.band_8_4_1;
  const lowOk = result >= b.low_fraction * expected || result >= expected - b.absolute_W;
  const highOk = result <= b.high_fraction * expected || result <= expected + b.absolute_W;
  return { lowOk, highOk, pass: lowOk && highOk, ratio: result / expected };
}

function withOverrides(csvText, set, rotate) {
  const lines = csvText.split(/\r?\n/);
  const header = parseLine(lines[0]);
  const target = parseLine(lines[1]);
  const col = (f) => header.findIndex((h) => h.split(":")[0].trim() === f);
  for (const [f, v] of Object.entries(set || {})) {
    const i = col(f);
    if (i < 0) throw new Error(`${f}: not a column`);
    target[i] = v;
  }
  if (rotate) {
    const vals = ORIENT_FIELDS.map((f) => target[col(f)]);
    ORIENT_FIELDS.forEach((f, k) => {
      target[col(f)] = vals[(k - rotate + 4) % 4];
    });
  }
  lines[1] = target.map(quote).join(",");
  return lines.join("\n");
}

function parseLine(line) {
  const out = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

function quote(v) {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

async function run(page, csvText) {
  return page.evaluate(
    (csv) =>
      new Promise((resolve) => {
        window.TEUI.FileHandler.processImportedCSV(csv);
        setTimeout(() => {
          const state = window.TEUI.ComputationIntegration.getState();
          const id = state.getActiveModelId();
          const get = (k) => parseFloat(state.getValueForModel(id, k));
          resolve({
            loss: get("f280.totalDesignHeatLoss"),
            envelope: get("f280.peakEnvelopeHeatLoss"),
            infiltration: get("f280.peakInfiltrationHeatLoss"),
            ventilation: get("f280.peakVentilationHeatLoss"),
            nominalCooling: get("f280.nominalCoolingCapacity"),
            latentLoadFactor: get("cooling.latentLoadFactor"),
          });
        }, 500);
      }),
    csvText
  );
}

test.describe("CSA F280-12 whole house (sandbox)", () => {
  test("F280 cases against Annex J", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
    await page.goto(`file://${path.join(__dirname, "..", "index.html")}`);
    await page.waitForFunction(
      () => window.TEUI?.ComputationIntegration?.isInitialized?.() && window.TEUI?.FileHandler?.processImportedCSV,
      { timeout: 60000 }
    );

    const records = [];
    const files = fs.readdirSync(CASES_DIR).filter((f) => /^F280-\d+-.*\.csv$/.test(f)).sort();
    expect(files.length).toBeGreaterThan(0);

    for (const file of files) {
      const name = file.match(/^(F280-\d+)/)[1];
      const where = CASES[name];
      expect(where, `${name}: add it to CASES`).toBeTruthy();
      const expected = FIXTURE.location_and_vintage_8_3_9.find(
        (m) => m.archetype === where.archetype && m.vintage === where.vintage && m.location === where.location
      );
      const csvText = fs.readFileSync(path.join(CASES_DIR, file), "utf8");
      const base = await run(page, csvText);
      const gain = base.nominalCooling / Math.max(1, base.latentLoadFactor);
      for (const v of [base.loss, gain]) expect(Number.isFinite(v) && v > 0).toBe(true);
      records.push({
        case: name, clause: "8.3.9", ...where,
        loss: { result_W: Math.round(base.loss), expected_W: expected.loss_W, ...band(base.loss, expected.loss_W) },
        gain: { result_W: Math.round(gain), expected_W: expected.gain_W, ...band(gain, expected.gain_W) },
        parts_W: base,
      });

      if (name !== FIXTURE.base_case.case) continue;
      for (const v of VARIANTS) {
        const r = await run(page, withOverrides(csvText, v.set, v.rotate));
        const g = r.nominalCooling / Math.max(1, r.latentLoadFactor);
        const exp = FIXTURE.variants_on_base_case.filter((x) => x.clause === v.clause && x.variant === v.variant);
        const change = { loss: r.loss - base.loss, gain: g - gain };
        records.push({
          case: name, clause: v.clause, variant: v.variant, note: v.note || "",
          change_W: { loss: Math.round(change.loss), gain: Math.round(change.gain) },
          expected_change_W: Object.fromEntries(exp.map((x) => [x.quantity, x.expected_change_W])),
          sign_settled: false,
        });
      }
    }

    const out = {
      timestamp: new Date().toISOString(),
      enforce_band: ENFORCE_BAND,
      fixture_verified_against_pdf: FIXTURE.verified_against_pdf,
      not_modelled: NOT_MODELLED,
      records,
    };
    fs.writeFileSync(RESULTS_FILE, JSON.stringify(out, null, 2) + "\n");
    for (const r of records.filter((x) => x.clause === "8.3.9")) {
      console.log(
        `${r.case}: loss ${r.loss.result_W} W vs ${r.loss.expected_W} (${(100 * r.loss.ratio).toFixed(1)} %, ${r.loss.pass ? "PASS" : "FAIL"}) · ` +
          `gain ${r.gain.result_W} W vs ${r.gain.expected_W} (${(100 * r.gain.ratio).toFixed(1)} %, ${r.gain.pass ? "PASS" : "FAIL"})`
      );
      if (ENFORCE_BAND) {
        expect(r.loss.pass, `${r.case} loss outside Cl. 8.4.1`).toBe(true);
        expect(r.gain.pass, `${r.case} gain outside Cl. 8.4.1`).toBe(true);
      }
    }
  });
});
