// @ts-check
/**
 * CSA F280-12 WHOLE HOUSE verification harness (Cl. 8.1.2 b): sandbox only.
 *
 *   npx playwright test test/f280WholeHouse.spec.cjs --config=playwright.config.cjs
 *
 * For each F280 case (test/computation/case-studies/F280-*.csv, built by tools/f280/build_case.py)
 * and each variant OBJECTIVE can express, it imports the case, reads S21's whole-house figures, and
 * records them against Annex J's expected values (test/fixtures/f280-annex-j.json) and Cl. 8.4.1's
 * band. Output: test/f280-results.json. The app is SERVED (see URL below), never file://.
 *
 *   LOSS = f280.totalDesignHeatLoss (W), Cl. 5.2.7.
 *   GAIN = f280.totalSensibleHeatGain (W), the total SENSIBLE heat gain (Cl. 6.2.9) - Annex J's
 *          "gain". f280.nominalCoolingCapacity is that x max(1, latent load factor) (Cl. 6.3).
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
const { spawn } = require("child_process");

// SERVED, never file://: the ISO 52016-1 cooling (cooling.iso52016, which carries every glazing
// row's cooling gain) fetches the climate station's monthly data, and a file:// page cannot.
// F280_URL points at a running server; otherwise the harness serves the repo on 127.0.0.1:8771.
const PORT = 8771;
const URL = process.env.F280_URL || `http://127.0.0.1:${PORT}/index.html`;
let server = null;
test.beforeAll(async () => {
  if (process.env.F280_URL) return;
  server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], {
    cwd: path.join(__dirname, ".."),
    stdio: "ignore",
  });
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(URL);
      if (r.ok) return;
    } catch (_) {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 100));
  }
  throw new Error(`no server at ${URL}`);
});
test.afterAll(() => server && server.kill());

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
// Cl. 6.3.1's latent load multiplier as Annex J's reference applies it (see the base comparison below)
const ANNEX_J_LM = 1.3;

const VARIANTS = [
  // Each reaches AIM-2 (S12 B.19, the base case's infiltration method): until 2026-11-19 the 8.3.7 b
  // variant set only B.18.2, which AIM-2 does not read (it runs on B.19.2's type), so it changed nothing.
  { clause: "8.3.7 b", variant: "3.0 ACH50, ELA10 844 cm2 (base 1.5 ACH50)", set: { g_109: "3.0", g_111: "Custom", d_112: "844" },
    note: "AIM-2 Custom: B.18.2's ACH50 + B.19.3's ELA, Annex J's pair" },
  { clause: "8.3.4 c", variant: "exhaust-only at the HRV's flow", set: { d_118: "0", d_112e: "Exhaust only" },
    note: "no recovery (SRE 0 %, Andy 2026-11-18) and AIM-2's ventilation balance Exhaust only" },
  // Cl. 8.3.6 b: no external shading - the base case's G.1.11 overhangs are its Section 10 summer shading (Annex A,
  // tools/f280/build_case.py), so the variant sets them to 0
  { clause: "8.3.6 b", variant: "no external shading", set: { h_74: "0", h_75: "0", h_76: "0", h_77: "0" },
    note: "the overhangs' summer shading (h_74-h_77) at 0" },
  // Cl. 8.3.8: the front door turns from S through each eighth; every window's Section 10
  // orientation dropdown (e_74-e_77) turns with the house. Doors stay "Average" (opaque, SHGC 0).
  ...["SE", "E", "NE", "N", "NW", "W", "SW"].map((d, k) => ({
    clause: "8.3.8", variant: `front door ${d}`, turn: k + 1,
  })),
];
const NOT_MODELLED = [
  { clause: "8.3.4 b", reason: "a room test (Annex K); whole house unchanged" },
  { clause: "8.3.5 b, c", reason: "OBJECTIVE has no interior-shading input (blinds, reflective blinds)" },
];

// The compass, clockwise. Turning the front door from S to SE (one eighth) turns every facade
// one eighth counter-clockwise: S -> SE, E -> NE, N -> NW, W -> SW.
const COMPASS = ["North", "NorthEast", "East", "SouthEast", "South", "SouthWest", "West", "NorthWest"];
const ORIENTATION_FIELDS = ["e_74", "e_75", "e_76", "e_77"]; // the four window rows' dropdowns

function band(result, expected) {
  const b = FIXTURE.band_8_4_1;
  const lowOk = result >= b.low_fraction * expected || result >= expected - b.absolute_W;
  const highOk = result <= b.high_fraction * expected || result <= expected + b.absolute_W;
  return { lowOk, highOk, pass: lowOk && highOk, ratio: result / expected };
}

function withOverrides(csvText, set, turn) {
  const lines = csvText.split(/\r?\n/);
  const header = parseLine(lines[0]);
  const target = parseLine(lines[1]);
  const col = (f) => header.findIndex((h) => h.split(":")[0].trim() === f);
  for (const [f, v] of Object.entries(set || {})) {
    const i = col(f);
    if (i < 0) throw new Error(`${f}: not a column`);
    target[i] = v;
  }
  if (turn) {
    for (const f of ORIENTATION_FIELDS) {
      const i = col(f);
      const k = COMPASS.indexOf(target[i]);
      if (k < 0) throw new Error(`${f}: orientation ${target[i]} is not a compass point`);
      target[i] = COMPASS[(k - turn + 8) % 8];
    }
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

const READ = () => {
  const state = window.TEUI.ComputationIntegration.getState();
  const id = state.getActiveModelId();
  const get = (k) => parseFloat(state.getValueForModel(id, k));
  return {
            loss: get("f280.totalDesignHeatLoss"),
            envelope: get("f280.peakEnvelopeHeatLoss"),
            infiltration: get("f280.peakInfiltrationHeatLoss"),
            ventilation: get("f280.peakVentilationHeatLoss"),
            // the annual ground method (F280 Mode's), and BASESIMP's foundation load (F280 Cl. 5.2.2.1) either way
            groundMethod: state.getValueForModel(id, "ground.methodInEffect"),
            basesimp_W: get("ground.basesimp.peakHeatLoss"),
            basesimpError: (state.getValueForModel(id, "ground.basesimp") || {}).error || null,
            // S12 B.19.1: the infiltration method, and AIM-2's design rates (F280 Cl. 5.2.3 / 6.2.6) either way
            infiltrationMethod: state.getValueForModel(id, "airTightness.infiltrationMethodInEffect"),
            aim2_LRairh: get("aim2.heatingRate"),
            aim2_LRairc: get("aim2.coolingRate"),
            aim2Error: (state.getValueForModel(id, "airTightness.aim2") || {}).error || null,
            annualInfiltration_kWh: get("airTightness.heatLoss"),
            annualGround_kWh: get("envelope.groundFacing.totalHeatLoss"),
            sensibleGain: get("f280.totalSensibleHeatGain"),
            infiltrationGain_W: get("f280.peakInfiltrationHeatGain"),
            ventilationGain_W: get("f280.peakVentilationHeatGain"),
            atre: get("mechanical.ventilation.atre"),
            solarGain_W: get("f280.peakSolarHeatGain"),
            opaqueSolarCorrection_W: get("f280.opaqueSolarCorrection"),
            s15Cells: ["d_140b", "h_140b"].map((f) => {
              const td = document.querySelector(`td[data-field-id="${f}"]`);
              return td ? `${td.textContent.trim()}${td.closest("tr")?.classList.contains("f280-hidden-row") ? " (hidden)" : ""}` : null;
            }),
            dtdc: get("climate.temperature.hottest") - get("climate.cooling.setpoint"),
            f280Latitude: (window.TEUI.F280Weather.lookup(state.getValueForModel(id, "climate.location.province"),
              state.getValueForModel(id, "climate.location.city")) || {}).lat,
            designLatent_W: get("cooling.designLatentW"),
            nominalCooling: get("f280.nominalCoolingCapacity"),
            latentLoadFactor: get("cooling.latentLoadFactor"),
            peakCoolingKw: get("energy.peakCooling.totalKw"),
            ventLs: get("ventilation.volumetricRate"),
            ventEfficiency: get("mechanical.ventilation.efficiency"),
            designSetpoint: get("climate.heating.obcSetpoint"),
            coldest: get("climate.temperature.coldest"),
            hottest: get("climate.temperature.hottest"),
            coolingSetpoint: get("climate.cooling.setpoint"),
            radiantCoolingGain_kWh: get("radiantGains.subtotal.coolingGain"),
            // Diagnostics: each window row's solar, and each ground row's U and loss.
            rows: Object.fromEntries(
              [74, 75, 76, 77].flatMap((r) =>
                ["orientation", "area", "shgc", "summerShading", "gainFactor", "heatingGain", "coolingGain"].map((k) => [
                  `row${r}.${k}`,
                  state.getValueForModel(id, `radiantGains.row${r}.${k}`),
                ])
              )
            ),
            ground: Object.fromEntries(
              ["slabOnGrade", "wallsBelowGrade"].flatMap((g) =>
                ["rsi", "uValue", "area", "heatLoss"].map((k) => [`${g}.${k}`, state.getValueForModel(id, `transmissionLoss.${g}.${k}`)])
              )
            ),
            coolingDays: get("climate.coolingDays"),
            // The peak sensible gain's terms (energy.peakCooling.totalKw, EnergyNodes.js), in W.
            peakTerms: (() => {
              const area = get("building.conditionedFloorArea");
              const dens = ["internal.plugLoadDensity", "internal.lightingDensity", "internal.equipmentDensity"].map(get);
              const iso = state.getValueForModel(id, "cooling.iso52016");
              const hours = get("climate.coolingDays") * 24;
              const latent = (iso && iso.latent) || {};
              return {
                enclosure_W: 1000 * get("energy.peakCooling.enclosureKw"),
                densities_Wm2: { plug: dens[0], lighting: dens[1], equipment: dens[2] },
                floorArea_m2: area,
                internalDensity_W: (dens[0] + dens[1] + dens[2]) * area,
                // not in F280's gain since 2026-11-19 (Cl. 6.2.2.1 replaces it: solarGain_W)
                solarSeasonAverage_W: (1000 * get("radiantGains.subtotal.coolingGain")) / hours,
                // not in F280's gain since 2026-11-19 (Cl. 6.2.7 replaces it: ventilationGain_W)
                ventilationSeasonAverage_W: (1000 * (get("ventilation.heatGain") - (latent.vent || 0))) / hours,
                occupantsSeasonAverage_W: (1000 * (get("internal.occupants.coolingGain") - (latent.people || 0))) / hours,
              };
            })(),
            iso52016: (() => {
              const iso = state.getValueForModel(id, "cooling.iso52016");
              if (!iso) return { present: false };
              return { present: true, keys: Object.keys(iso), rows: iso.rows || null };
            })(),
          };
};

async function run(page, csvText) {
  const slabArea = (() => {
    const lines = csvText.split(/\r?\n/);
    const header = parseLine(lines[0]);
    const i = header.findIndex((h) => h.split(":")[0].trim() === "d_95");
    return parseFloat(parseLine(lines[1])[i]);
  })();
  // Import, then read until the figures hold still: a served app finishes its climate fetch and the
  // ISO 52016 cooling after the import returns, so a fixed wait can read a half-computed state.
  await page.evaluate((csv) => window.TEUI.FileHandler.processImportedCSV(csv), csvText);
  let last = null;
  let same = 0;
  let snap = null;
  for (let i = 0; i < 100; i++) {
    await page.waitForTimeout(150);
    snap = await page.evaluate(READ);
    const key = JSON.stringify([snap.loss, snap.nominalCooling, snap.iso52016.present, snap.radiantCoolingGain_kWh]);
    same = key === last ? same + 1 : 0;
    last = key;
    // Identity: the app's own startup load (a served app fetches its default case study) must not
    // be what we read. The run counts only when its slab area is the imported case's.
    const isOurs = Math.abs(parseFloat(snap.ground["slabOnGrade.area"]) - slabArea) < 1e-6;
    if (same >= 4 && snap.iso52016.present && isOurs) return snap;
  }
  throw new Error(
    `the figures never settled on the imported case (slab ${slabArea} m2; the app shows slab ` +
      `${snap && snap.ground["slabOnGrade.area"]} m2, loss ${snap && Math.round(snap.loss)} W)`
  );
}

test.describe("CSA F280-12 whole house (sandbox)", () => {
  test("F280 cases against Annex J", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
    // A served app auto-imports a sample case 1.5 s after start (src/core/init.js); wait for it, or
    // it lands on top of the F280 case.
    const autoLoaded = page.waitForEvent("console", {
      predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()),
      timeout: 30000,
    });
    await page.goto(URL);
    await page.waitForFunction(
      () => window.TEUI?.ComputationIntegration?.isInitialized?.() && window.TEUI?.FileHandler?.processImportedCSV,
      { timeout: 60000 }
    );
    await autoLoaded;

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
      expect(base.iso52016.present, "cooling.iso52016 missing: is the app served?").toBe(true);
      // What Annex J (and K) call "gain" is the NOMINAL capacity, Cl. 6.3.1 CSCn = LM x the sum of HGsr, at its LM 1.3 ("In
      // most applications a multiplier of 1.3 is appropriate"). Shown by Annex K 8.3.3 (pp. 188-190): spreading Archetype 1's
      // internal gains evenly moves the four occupied rooms -387 W and the other 14 +111 W, so the total is ~1995 W =
      // 1.3 x (5 x 70 + 4 x 295.57) = 1992 W. Our sensible gain (S21) is the HGsr sum; compare it x 1.3.
      const sensible = base.sensibleGain;
      const gain = sensible * ANNEX_J_LM;
      for (const v of [base.loss, gain]) expect(Number.isFinite(v) && v > 0).toBe(true);
      // Units witness (always on): F280's ventilation loss is the clause's 1.2 W per (L/s·K) × the flow
      // in L/s × (1 − E) × the design ΔT, Cl. 5.2.3.2. It once read the flow in m³/h (3.6× high).
      const ventHand = 1.2 * base.ventLs * (1 - base.ventEfficiency / 100) * (base.designSetpoint - base.coldest);
      expect(Math.abs(base.ventilation - ventHand)).toBeLessThanOrEqual(1);
      // And its gain, Cl. 6.2.7: 1.2 × PVC × DTDc × (1 − ATRE), ATRE S13 l_123 (F280-1: 0, Table H.3.3).
      const ventGainHand = 1.2 * base.ventLs * (base.hottest - base.coolingSetpoint) * (1 - base.atre / 100);
      expect(Math.abs(base.ventilationGain_W - ventGainHand)).toBeLessThanOrEqual(1e-9);
      // The design solar, Cl. 6.2.2.1, by hand from the S10 rows: Σ A × SHGC × Solar0 × LFactor (S, SE,
      // SW) × (1 − summer shading); F280-1's door row (Average) has SHGC 0.
      const SOLAR0 = { North: 93, NorthEast: 194, East: 285, SouthEast: 252, South: 160, SouthWest: 252, West: 285, NorthWest: 194, Skylight: 534 };
      const lf = Math.min(1.3, Math.max(0.7, 1 + (base.f280Latitude - 40) * 0.0375));
      let solarHand = 0;
      for (const r of [74, 75, 76, 77, 78]) {
        if (!(Number(base.rows[`row${r}.area`]) > 0)) continue; // an empty row (F280-1's skylight)
        const o = base.rows[`row${r}.orientation`];
        const corr = ["South", "SouthEast", "SouthWest"].includes(o) ? lf : 1;
        solarHand += Number(base.rows[`row${r}.area`]) * Number(base.rows[`row${r}.shgc`]) * SOLAR0[o] * corr *
          (1 - Number(base.rows[`row${r}.summerShading`]) / 100);
      }
      expect(Math.abs(base.solarGain_W - solarHand)).toBeLessThanOrEqual(1e-9);
      // The nominal capacity is Annex B's HGb: the sensible + the design latent, the latent factor taken
      // over the same sensible (rounded to the W).
      expect(Math.abs(base.nominalCooling - (base.sensibleGain + base.designLatent_W))).toBeLessThanOrEqual(0.5);
      records.push({
        case: name, clause: "8.3.9", ...where,
        loss: { result_W: Math.round(base.loss), expected_W: expected.loss_W, ...band(base.loss, expected.loss_W) },
        gain: { result_W: Math.round(gain), sensible_W: Math.round(sensible), lm: ANNEX_J_LM, expected_W: expected.gain_W, ...band(gain, expected.gain_W) },
        parts_W: base,
      });

      if (name !== FIXTURE.base_case.case) continue;
      // TWO STREAMS (Andy 2026-11-19): F280 Mode Off puts the ANNUAL figures on OBJECTIVE's methods and
      // leaves S21 - F280's own stream - exactly where it was.
      const off = await run(page, withOverrides(csvText, { f280_mode: "Off" }));
      for (const k of ["loss", "envelope", "infiltration", "ventilation", "sensibleGain", "nominalCooling"]) {
        expect(off[k], `F280 Mode Off moved S21's ${k}`).toBe(base[k]);
      }
      expect(off.annualGround_kWh, "F280 Mode Off left the annual ground on BASESIMP").not.toBe(base.annualGround_kWh);
      expect(off.annualInfiltration_kWh, "F280 Mode Off left the annual leakage on AIM-2").not.toBe(base.annualInfiltration_kWh);

      for (const v of VARIANTS) {
        const r = await run(page, withOverrides(csvText, v.set, v.turn));
        const g = r.sensibleGain;
        const exp = FIXTURE.variants_on_base_case.filter((x) => x.clause === v.clause && x.variant === v.variant);
        const change = { loss: r.loss - base.loss, gain: (g - sensible) * ANNEX_J_LM };
        records.push({
          case: name, clause: v.clause, variant: v.variant, note: v.note || "",
          change_W: { loss: Math.round(change.loss), gain: Math.round(change.gain) },
          expected_change_W: Object.fromEntries(exp.map((x) => [x.quantity, x.expected_change_W])),
          // Annex J prints these changes with no consistent sign (the fixture's sign_convention): compare magnitudes
          magnitude_ratio: exp.length ? Object.fromEntries(exp.map((x) => [x.quantity, x.expected_change_W ? +(Math.abs(change[x.quantity]) / Math.abs(x.expected_change_W)).toFixed(3) : null])) : null,
          parts_W: { loss: r.loss, envelope: r.envelope, infiltration: r.infiltration, ventilation: r.ventilation,
            nominalCooling: r.nominalCooling, latentLoadFactor: r.latentLoadFactor, ground: r.ground },
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
          `gain ${r.gain.result_W} W (sensible ${r.gain.sensible_W} x ${r.gain.lm}) vs ${r.gain.expected_W} (${(100 * r.gain.ratio).toFixed(1)} %, ${r.gain.pass ? "PASS" : "FAIL"})`
      );
      if (ENFORCE_BAND) {
        expect(r.loss.pass, `${r.case} loss outside Cl. 8.4.1`).toBe(true);
        expect(r.gain.pass, `${r.case} gain outside Cl. 8.4.1`).toBe(true);
      }
    }
  });
});
