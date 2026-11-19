// @ts-check
/**
 * The "CSA F280 Review Format" cases (Andy 2026-11-19): each Part 9 house read three ways - F280 Mode Off
 * (the case study as it is), On (its review case, tools/f280/review_case.py) and its bills.
 *
 *   npx playwright test test/f280ReviewCases.spec.cjs --config=playwright.config.cjs
 *
 * Witnesses, per house:
 *   - the review case runs F280's methods with no error: BASESIMP on the house's configuration and Wombat's
 *     perimeter, AIM-2 from the house (ELA from the ACH50, height from the storeys);
 *   - the review case changes ONLY F280 inputs: its Target with Mode turned Off reads the case's TEUI, and
 *     its Reference reads the case's Reference TEUI;
 *   - loading the untouched case after the review case reads Mode Off (nothing inherited).
 * Writes test/f280-review-results.json (the Off / On / bills table in ABCD.EARTH ABCD-OBJECTIVE-PRO.md §0).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const HOUSES = [
  "03-residence-phi-classic",
  "02-residence-sb12-net-zero",
  "12-residence-phi-low-energy",
  "10-residence-sb12-duplex",
];
const CASES = path.join(__dirname, "..", "src", "template", "case-studies");

let URL = process.env.F280_URL;
let server = null;
test.beforeAll(async ({}, testInfo) => {
  if (process.env.F280_URL) return;
  const PORT = 8782 + testInfo.parallelIndex;
  URL = `http://127.0.0.1:${PORT}/index.html`;
  server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: path.join(__dirname, ".."), stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try {
      if ((await fetch(URL)).ok) return;
    } catch (_) {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 100));
  }
  throw new Error(`no server at ${URL}`);
});
test.afterAll(() => server && server.kill());

const READ = () => {
  const CI = window.TEUI.ComputationIntegration;
  const state = CI.getState();
  const id = state.getActiveModelId();
  const ref = CI.getRefModelId();
  const num = (m, k) => parseFloat(state.getValueForModel(m, k));
  const bs = state.getValueForModel(id, "ground.basesimp") || {};
  const aim2 = state.getValueForModel(id, "airTightness.aim2") || {};
  return {
    mode: window.TEUI.StateManager.getValue("f280_mode"),
    teui: num(id, "keyValues.target.teui"),
    bills: num(id, "keyValues.actual.teui"),
    tedi: num(id, "energy.tedi"),
    refTeui: num(ref, "keyValues.target.teui"),
    groundMethod: state.getValueForModel(id, "ground.methodInEffect"),
    infiltrationMethod: state.getValueForModel(id, "airTightness.infiltrationMethodInEffect"),
    annualGround_kWh: num(id, "envelope.groundFacing.totalHeatLoss"),
    annualInfiltration_kWh: num(id, "airTightness.heatLoss"),
    basesimp_W: num(id, "ground.basesimp.peakHeatLoss"),
    basesimpError: bs.error || null,
    basesimpConfig: bs.error ? null : window.TEUI.BasesimpData.configs[state.getValueForModel(id, "ground.basesimp.configuration")]?.name,
    perimeter_m: num(id, "wombat.footprint.perimeter"),
    aim2Error: aim2.error || null,
    aim2_LRairh: num(id, "aim2.heatingRate"),
    aim2_LRairc: num(id, "aim2.coolingRate"),
    loss_W: num(id, "f280.totalDesignHeatLoss"),
    sensibleGain_W: num(id, "f280.totalSensibleHeatGain"),
  };
};

async function settle(page) {
  // settle: the same TEUI on two reads 1 s apart
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

test("the CSA F280 Review Format cases: Off / On / bills", async ({ page }) => {
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
    const on = await load(page, reviewText);
    // the review case's Target turned Off, as a user would (S21 F280 Mode)
    await page.evaluate(() => window.TEUI.StateManager.setValue("f280_mode", "Off", "user-modified"));
    const reviewOff = await settle(page);
    const after = await load(page, caseText);
    results[house] = { off, on, reviewOff: { teui: reviewOff.teui, refTeui: reviewOff.refTeui }, after: { mode: after.mode, teui: after.teui } };

    expect(off.groundMethod, `${house} Off`).toBe("OBJECTIVE");
    expect(on.mode, house).toBe("On");
    expect(on.groundMethod, house).toBe("BASESIMP");
    expect(on.infiltrationMethod, house).toBe("AIM2");
    expect(on.basesimpError, house).toBeNull();
    expect(on.aim2Error, house).toBeNull();
    expect(Number.isFinite(on.teui), `${house} TEUI ${on.teui}`).toBe(true);
    expect(on.teui, house).not.toBe(off.teui);
    expect(on.bills, house).toBe(off.bills);
    expect(on.refTeui, `${house}: the Reference is the case's`).toBe(off.refTeui);
    expect(reviewOff.teui, `${house}: Mode Off reads the case`).toBe(off.teui);
    expect(after.mode, `${house}: the case after its review`).not.toBe("On");
    expect(after.teui, house).toBe(off.teui);
  }
  fs.writeFileSync(path.join(__dirname, "f280-review-results.json"), JSON.stringify(results, null, 2) + "\n");
  for (const [h, r] of Object.entries(results)) {
    console.log(
      `${h}: TEUI Off ${r.off.teui.toFixed(1)} On ${r.on.teui.toFixed(1)} bills ${r.on.bills.toFixed(1)} | ` +
        `ground ${r.off.annualGround_kWh.toFixed(0)} -> ${r.on.annualGround_kWh.toFixed(0)} kWh (${r.on.basesimpConfig}, P ${r.on.perimeter_m.toFixed(2)} m, ${r.on.basesimp_W.toFixed(0)} W) | ` +
        `air ${r.off.annualInfiltration_kWh.toFixed(0)} -> ${r.on.annualInfiltration_kWh.toFixed(0)} kWh | ` +
        `S21 loss ${r.on.loss_W.toFixed(0)} W, gain ${r.on.sensibleGain_W.toFixed(0)} W`
    );
  }
});
