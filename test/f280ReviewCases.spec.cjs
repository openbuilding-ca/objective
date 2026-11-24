// @ts-check
/**
 * The "CSA F280 Review Format" cases: each Part 9 house read as ONE building two ways (Andy 2026-11-20:
 * "Target uses OBJECTIVE values, Reference uses F280 values") - the Target with F280 Mode Off, the Reference
 * the identical building with F280 Mode On (tools/f280/review_case.py) - beside its bills.
 *
 *   npx playwright test test/f280ReviewCases.spec.cjs --config=playwright.config.cjs
 *
 * Witnesses, per house:
 *   - the review case's Target IS the case study's Target: Mode Off, the case's TEUI to the digit;
 *   - its Reference runs F280's methods with no error: BASESIMP on the house's configuration and Wombat's
 *     perimeter, AIM-2 from the house (ELA from the ACH50, height from the storeys), and F280's gains in S09;
 *   - the Reference is the identical building: turned to Mode Off, it reads the Target's TEUI;
 *   - loading the untouched case after the review case reads Mode Off in both models (nothing inherited).
 * Writes test/f280-review-results.json (the Off / On / bills table in ABCD.EARTH ABCD-OBJECTIVE-PRO.md §0).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const HOUSES = [
  "03-residence-phi-classic",
  "02-residence-sb12-net-zero",
  "12-residence-phi-low-energy",
  "10-residence-sb12-duplex",
];
const CASES = path.join(__dirname, "..", "src", "template", "case-studies");

// The suite's own server (playwright.config.cjs's baseURL); F280_URL points at another running app.
// (Each spec started its own python3 server until Mark's #134 review: three shared 8782.)
const URL = process.env.F280_URL || "/index.html";

// Both models' readings; S09 as shown in the view open now (Target, unless the Reference is toggled in)
const READ = () => {
  const CI = window.TEUI.ComputationIntegration;
  const state = CI.getState();
  const SM = window.TEUI.StateManager;
  const model = (m) => {
    const num = (k) => parseFloat(state.getValueForModel(m, k));
    const bs = state.getValueForModel(m, "ground.basesimp") || {};
    const aim2 = state.getValueForModel(m, "airTightness.aim2") || {};
    return {
      teui: num("keyValues.target.teui"),
      tedi: num("energy.tedi"),
      groundMethod: state.getValueForModel(m, "ground.methodInEffect"),
      infiltrationMethod: state.getValueForModel(m, "airTightness.infiltrationMethodInEffect"),
      annualGround_kWh: num("envelope.groundFacing.totalHeatLoss"),
      annualInfiltration_kWh: num("airTightness.heatLoss"),
      basesimp_W: num("ground.basesimp.peakHeatLoss"),
      basesimpError: bs.error || null,
      basesimpConfig: bs.error ? null : window.TEUI.BasesimpData.configs[state.getValueForModel(m, "ground.basesimp.configuration")]?.name,
      perimeter_m: num("wombat.footprint.perimeter"),
      aim2Error: aim2.error || null,
      aim2_LRairh: num("aim2.heatingRate"),
      aim2_LRairc: num("aim2.coolingRate"),
      internalAnnual_kWh: num("internal.total.annual"),
      loss_W: num("f280.totalDesignHeatLoss"),
      sensibleGain_W: num("f280.totalSensibleHeatGain"),
    };
  };
  return {
    mode: SM.getValue("f280_mode"),
    refMode: SM.getValue("ref_f280_mode"),
    bills: parseFloat(state.getValueForModel(state.getActiveModelId(), "keyValues.actual.teui")),
    target: model(state.getActiveModelId()),
    reference: model(CI.getRefModelId()),
    // S09 as shown: under Mode On, F280's gains, calculated; lighting locked at its value in effect
    s09: Object.fromEntries(["d_65", "d_66", "d_67", "g_64"].map((f) => {
      const td = document.querySelector(`td[data-field-id="${f}"]`);
      return [f, td ? `${td.textContent.trim()}${td.getAttribute("contenteditable") === "true" ? " (editable)" : ""}` : null];
    })),
  };
};

async function settle(page) {
  // settle: the same readings twice, 1 s apart
  let last = null;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(1000);
    const now = await page.evaluate(READ);
    if (last && JSON.stringify(now) === JSON.stringify(last)) return now;
    last = now;
  }
  return last;
}

async function load(page, text) {
  await page.evaluate((t) => window.TEUI.FileHandler.processImportedCSV(t), text);
  return settle(page);
}

// S09 in the Reference view (the user's Reference toggle), then back to the Target
async function referenceS09(page) {
  await page.evaluate(() => window.TEUI.ReferenceToggle.toggleReferenceDisplay());
  const shown = (await settle(page)).s09;
  await page.evaluate(() => window.TEUI.ReferenceToggle.toggleReferenceDisplay());
  return shown;
}

test("the CSA F280 Review Format cases: Target Off / Reference On / bills", async ({ page }) => {
  test.setTimeout(600000);
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto(URL);
  await auto;
  const results = {};
  for (const house of HOUSES) {
    const caseText = fs.readFileSync(path.join(CASES, `${house}.csv`), "utf8");
    const reviewText = fs.readFileSync(path.join(CASES, `${house}-f280.csv`), "utf8");
    const off = await load(page, caseText);
    const review = await load(page, reviewText);
    const refS09 = await referenceS09(page);
    // the review case's Reference turned Off, as a user would (S21 F280 Mode, in the Reference)
    await page.evaluate(() => window.TEUI.StateManager.setValue("ref_f280_mode", "Off", "user-modified"));
    const refOff = await settle(page);
    const after = await load(page, caseText);
    const on = review.reference;
    results[house] = {
      off: off.target,
      on,
      bills: review.bills,
      refOffTeui: refOff.reference.teui,
      s09On: refS09,
      after: { mode: after.mode, refMode: after.refMode, teui: after.target.teui, s09: after.s09 },
    };

    expect(off.target.groundMethod, `${house} Off`).toBe("OBJECTIVE");
    expect(review.mode, `${house}: the Target runs OBJECTIVE's methods`).not.toBe("On");
    expect(review.target.teui, `${house}: the review's Target is the case's`).toBe(off.target.teui);
    expect(review.target.groundMethod, house).toBe("OBJECTIVE");
    expect(review.refMode, house).toBe("On");
    expect(on.groundMethod, house).toBe("BASESIMP");
    expect(on.infiltrationMethod, house).toBe("AIM2");
    expect(on.basesimpError, house).toBeNull();
    expect(on.aim2Error, house).toBeNull();
    expect(Number.isFinite(on.teui), `${house} TEUI ${on.teui}`).toBe(true);
    expect(on.teui, house).not.toBe(off.target.teui);
    expect(review.bills, house).toBe(off.bills);
    expect(refOff.reference.teui, `${house}: the Reference is the identical building`).toBe(off.target.teui);
    expect(after.mode, `${house}: the case after its review`).not.toBe("On");
    expect(after.refMode, `${house}: the case's Reference after the review`).not.toBe("On");
    expect(after.target.teui, house).toBe(off.target.teui);
    // S09 (Cl. 6.2.4 / 6.2.5): the Reference shows F280's figures, lighting 0 and locked; the case after it, its own
    expect(refS09.d_66, house).toBe("0.00");
    expect(refS09.d_67, house).toMatch(/^0(\.0+)?$/);
    expect(refS09.g_64, house).toMatch(/^70(\.0+)?$/);
    expect(after.s09.d_66, house).toMatch(/\(editable\)$/);
    expect(after.s09.g_64, house).not.toMatch(/^70(\.0+)?$/);
  }
  fs.writeFileSync(path.join(__dirname, "f280-review-results.json"), JSON.stringify(results, null, 2) + "\n");
  for (const [h, r] of Object.entries(results)) {
    console.log(
      `${h}: TEUI Off ${r.off.teui.toFixed(1)} On ${r.on.teui.toFixed(1)} bills ${r.bills.toFixed(1)} | ` +
        `ground ${r.off.annualGround_kWh.toFixed(0)} -> ${r.on.annualGround_kWh.toFixed(0)} kWh (${r.on.basesimpConfig}, P ${r.on.perimeter_m.toFixed(2)} m, ${r.on.basesimp_W.toFixed(0)} W) | ` +
        `air ${r.off.annualInfiltration_kWh.toFixed(0)} -> ${r.on.annualInfiltration_kWh.toFixed(0)} kWh | ` +
        `internal ${r.off.internalAnnual_kWh.toFixed(0)} -> ${r.on.internalAnnual_kWh.toFixed(0)} kWh | ` +
        `S21 loss ${r.on.loss_W.toFixed(0)} W, gain ${r.on.sensibleGain_W.toFixed(0)} W | S09 On ${JSON.stringify(r.s09On)}`
    );
  }
});
