// @ts-check
/**
 * The house CSV round trip for the F280 inputs (Andy 2026-11-19: "We need to be sure ALL set fields
 * export/import via the house .csv format").
 *
 *   npx playwright test test/csvRoundTripF280.spec.cjs --config=playwright.config.cjs
 *
 * Every F280 input (S03 G.4.3-G.4.8, S12 B.18.1 / B.19, S13 ATRE, S21's mode and form) and a 4-decimal
 * U-value set to a distinctive value - the Reference's different where the field is per model, commas in
 * the text - then the app's own export, another case loaded over it, the export imported back: each
 * value must return exactly, Target and Reference. On the code before 2026-11-19 six were lost: the
 * U-value cut to 3 decimals, and S21's form (never exported).
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// One server per parallel worker (its own port): a shared port let the first worker to finish kill the
// server under the others (8 of 8 failed at --repeat-each=8 --workers=4).
let URL = process.env.F280_URL;
let server = null;
test.beforeAll(async ({}, testInfo) => {
  if (process.env.F280_URL) return;
  const PORT = 8772 + testInfo.parallelIndex;
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

const SET = { // target value, reference value (null = same as target)
  f280_mode: ["On", "Off"], l_25: ["5", "7"], d_26: ["1.5", "1.25"], h_26: ["40", "41"], l_26: ["1.2", "1.3"], d_26b: ["5", "6"],
  g_111: ["Custom", "Custom"], d_112: ["500", "450"], g_112: ["5.5", "6"], d_112b: ["3", "5"], g_112b: ["2", "4"], d_112c: ["3", "1"],
  g_112c: ["4", "5"], d_112d: ["Semi-Detached", "Detached"], g_112d: ["Crawl Space", "Shallow"], d_112e: ["Exhaust only", "Supply only"], g_112e: ["100", "150"],
  l_123: ["25", "10"], d_108: ["AL-3B", "AL-5A"], g_88: ["0.9091", "0.8333"],
  f280_proj_num: ["P-123, Unit 4", null], f280_code_ref: ["NBC 2025 9.33.5", null], f280_cap_heat: ["12000", null], f280_cap_cool: ["7000", null],
  f280_dsgn_name: ["Jane Q. Doe", null], f280_dsgn_co: ["Acme, Inc.", null], f280_cert_type: ["OAA", null], f280_cert_num: ["A-1", null], f280_svc_org: ["HRAI", null],
};

test("F280 inputs survive the house CSV round trip", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto(URL);
  await auto;
  const csv = fs.readFileSync(path.join(__dirname, "computation", "case-studies", "F280-1-Archetype1-2010s-Ottawa.csv"), "utf8");
  await page.evaluate((t) => window.TEUI.FileHandler.processImportedCSV(t), csv);
  await page.waitForTimeout(3000);
  const attest = await page.evaluate(() => [...(document.querySelector('select[data-field-id="f280_attest"]')?.options || [])].map((o) => o.value));
  SET.f280_attest = [attest[attest.length - 1], null];
  await page.evaluate((set) => {
    const SM = window.TEUI.StateManager;
    for (const [id, [t, r]] of Object.entries(set)) {
      SM.setValue(id, t, "user-modified");
      SM.setValue("ref_" + id, r ?? t, "user-modified");
    }
  }, SET);
  await page.waitForTimeout(2000);
  const download = page.waitForEvent("download");
  await page.evaluate(() => window.TEUI.FileHandler.exportToCSV());
  const text = fs.readFileSync(await (await download).path(), "utf8");
  await page.evaluate(() =>
    fetch("src/template/case-studies/01-assembly-obc-sb10.csv").then((r) => r.text()).then((t) => window.TEUI.FileHandler.processImportedCSV(t))
  );
  await page.waitForTimeout(3000);
  await page.evaluate((t) => window.TEUI.FileHandler.processImportedCSV(t), text);
  await page.waitForTimeout(3000);
  const got = await page.evaluate(
    (ids) => Object.fromEntries(ids.map((id) => [id, [window.TEUI.StateManager.getValue(id), window.TEUI.StateManager.getValue("ref_" + id)]])),
    Object.keys(SET)
  );
  for (const [id, [t, r]] of Object.entries(SET)) {
    expect([String(got[id][0]), String(got[id][1])], id).toEqual([String(t), String(r ?? t)]);
  }
});

// The older inputs the house CSV did not carry (Andy 2026-11-19, "yes"): S04 l_33, S12 g_106, S19 Wombat's
// d_154 / d_158-d_160, and S03's CDD as the user's OVERRIDE only (d_21o; d_21 shows the computed CDD).
test("older inputs and the CDD override survive the round trip; a city change still clears the override", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto(URL);
  await auto;
  const csv = fs.readFileSync(path.join(__dirname, "computation", "case-studies", "F280-1-Archetype1-2010s-Ottawa.csv"), "utf8");
  await page.evaluate((t) => window.TEUI.FileHandler.processImportedCSV(t), csv);
  await page.waitForTimeout(3000);
  const opts = await page.evaluate(() =>
    Object.fromEntries(["d_158", "d_159", "d_160"].map((id) => [id, [...(document.querySelector(`select[data-field-id="${id}"]`)?.options || [])].map((o) => o.value)]))
  );
  const set = { l_33: ["0.0123", "0.0456"], g_106: ["3.1", "2.9"], d_154: ["0.75", "0.5"] };
  for (const id of ["d_158", "d_159", "d_160"]) set[id] = [opts[id][opts[id].length - 1], opts[id][0]];
  await page.evaluate((s) => {
    const SM = window.TEUI.StateManager;
    for (const [id, [t, r]] of Object.entries(s)) {
      SM.setValue(id, t, "user-modified");
      SM.setValue("ref_" + id, r, "user-modified");
    }
    SM.setValue("d_21", "333", "user-modified"); // the Target's typed CDD; the Reference keeps the city's
  }, set);
  await page.waitForTimeout(2500);
  const cdd = () =>
    page.evaluate(() => {
      const ci = window.TEUI.ComputationIntegration, s = ci.getState(), r = ci.getRefModelId(), t = s.getModelIds().find((i) => i !== r);
      return [s.getValueForModel(t, "climate.cooling.degreedays"), s.getValueForModel(r, "climate.cooling.degreedays")];
    });
  // poll: a fixed wait can read the graph mid-recompute (undefined)
  await expect.poll(async () => (await cdd())[0], { timeout: 15000 }).toBe(333);
  const before = await cdd();
  const download = page.waitForEvent("download");
  await page.evaluate(() => window.TEUI.FileHandler.exportToCSV());
  const text = fs.readFileSync(await (await download).path(), "utf8");
  await page.evaluate(() =>
    fetch("src/template/case-studies/01-assembly-obc-sb10.csv").then((r) => r.text()).then((t) => window.TEUI.FileHandler.processImportedCSV(t))
  );
  await page.waitForTimeout(3000);
  await page.evaluate((t) => window.TEUI.FileHandler.processImportedCSV(t), text);
  await page.waitForTimeout(3500);
  const got = await page.evaluate(
    (ids) => Object.fromEntries(ids.map((id) => [id, [window.TEUI.StateManager.getValue(id), window.TEUI.StateManager.getValue("ref_" + id)]])),
    Object.keys(set)
  );
  for (const [id, [t, r]] of Object.entries(set)) expect([String(got[id][0]), String(got[id][1])], id).toEqual([t, r]);
  await expect.poll(cdd, { timeout: 15000, message: "CDD: the Target's override and the Reference's city value, as saved" }).toEqual(before);
  // a city change clears the override (a fresh lookup for the new city)
  await page.evaluate(() => window.TEUI.StateManager.setValue("h_19", "Kenora", "user-modified"));
  await page.waitForTimeout(2500);
  await expect.poll(async () => (await cdd())[0], { timeout: 15000, message: "the override survived a city change" }).not.toBe(333);
  expect(await page.evaluate(() => window.TEUI.StateManager.getValue("d_21o"))).toBe("");
});
