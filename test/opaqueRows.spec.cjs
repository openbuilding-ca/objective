// @ts-check
/**
 * S11's OPAQUE rows (src/core/Openings.js; Andy 2026-11-20): above grade B.4-B.6 and 9 more, below grade
 * B.9-B.10 and 4 more, each with its type, a wall its facing, its area typed or L x H.
 *
 *   npx playwright test test/opaqueRows.spec.cjs --config=playwright.config.cjs
 *
 * Witnesses, on Hemmingford's review case (03-f280: Target OBJECTIVE, Reference F280):
 *   - + shows B.5.2, a wall facing North, B.5's RSI copied; L 10 x H 2.5 gives its area 25 (no longer
 *     typed) and the walls' sum gains 25;
 *   - its facing reaches F280's Table 3 correction: North -3.8, South -2.2 against B.5's mean, by hand;
 *   - typed Roof, its area leaves the walls for the roof, its correction takes the roofs' +15, its
 *     facing hides, and it is numbered B.4.2 - in S11 and the Sankey;
 *   - the house CSV carries type, facing, L and H: exported, another file loaded (the row goes), back;
 *   - an older file (no type column) puts B.5 back to a wall, facing Average, in both models;
 *   - the Reference model's RSI for a row is the STANDARD's for the type the row holds (code minimum):
 *     a row turned to Roof takes f_85's, a wall f_86's;
 *   - - hides the row, its area 0 and its L / H gone in both models: the house reads as before.
 */
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

// The suite's own server (playwright.config.cjs's baseURL); F280_URL points at another running app.
// (Each spec started its own python3 server until Mark's #134 review: three shared 8782.)
const URL = process.env.F280_URL || "/index.html";

const READ = () => {
  const CI = window.TEUI.ComputationIntegration, st = CI.getState(), SM = window.TEUI.StateManager;
  const t = st.getActiveModelId(), r = CI.getRefModelId();
  const v = (k) => st.getValueForModel(t, k);
  const row = document.querySelector('tr[data-id="B.87a"]');
  return {
    teui: v("keyValues.target.teui"),
    refTeui: st.getValueForModel(r, "keyValues.target.teui"),
    shown: row?.style.display !== "none",
    id: row?.children[1]?.textContent,
    wallsA: v("transmissionLoss.walls.area"),
    roofA: v("transmissionLoss.roof.area"),
    rowA: parseFloat(v("transmissionLoss.opaque87a.area")),
    rowUA: parseFloat(v("transmissionLoss.opaque87a.area")) * parseFloat(v("transmissionLoss.opaque87a.uValue")),
    sc: v("f280.opaqueSolarCorrection"),
    // Table 3's terms: DTDc (design hottest - the cooling set-point) and the thermal-bridge factor on U
    dtdc: parseFloat(v("climate.temperature.hottest")) - parseFloat(v("climate.cooling.setpoint")),
    tb: 1 + parseFloat(v("transmissionLoss.thermalBridgePenalty")) / 100,
    areaEditable: document.querySelector('td[data-field-id="d_87a"]')?.contentEditable,
    facingShown: document.querySelector('select[data-field-id="cf_87a"]')?.style.display !== "none",
    sm: Object.fromEntries(["c_86", "cf_86", "c_87a", "cf_87a", "dl_87a", "dh_87a", "d_87a", "f_87a", "f_86"].flatMap((f) => [[f, SM.getValue(f)], [`ref_${f}`, SM.getValue(`ref_${f}`)]])),
    refRsi87a: st.getValueForModel(r, "transmissionLoss.opaque87a.rsi"),
    sankey: window.TEUI.SectionModules.sect16.buildSankeyData().nodes.map((n) => n.name),
  };
};

async function settle(page) {
  let last = null;
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(800);
    const now = await page.evaluate(READ);
    if (last && JSON.stringify(now) === JSON.stringify(last)) return now;
    last = now;
  }
  return last;
}
const load = async (page, file) => {
  await page.evaluate((f) => fetch(f).then((r) => r.text()).then((t) => window.TEUI.FileHandler.processImportedCSV(t)), file);
  return settle(page);
};
const click = (page, which) =>
  page.evaluate((w) => document.querySelector(`.openings-controls[data-section="s11"][data-group="above"] .expandable-${w}-btn`).click(), which);
// a user's typing: focus, text, blur (S11's blur handler stores and applies L x H)
const type = (page, fieldId, text) =>
  page.evaluate(([id, t]) => {
    const td = document.querySelector(`td[data-field-id="${id}"]`);
    td.focus();
    td.textContent = t;
    td.blur();
  }, [fieldId, text]);
const choose = (page, fieldId, value) =>
  page.evaluate(([id, v]) => {
    const s = document.querySelector(`select[data-field-id="${id}"]`);
    s.value = v;
    s.dispatchEvent(new Event("change", { bubbles: true }));
  }, [fieldId, value]);

test("opaque rows: + / L x H / facing / type / CSV / older file / Reference / -", async ({ page }) => {
  test.setTimeout(300000);
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto(URL);
  await auto;

  const house = await load(page, "src/template/case-studies/03-residence-phi-classic-f280.csv");
  expect(house.shown).toBe(false);
  expect([house.sm.c_86, house.sm.cf_86]).toEqual(["walls", "Average"]);

  await click(page, "add");
  const added = await settle(page);
  expect(added.shown).toBe(true);
  expect(added.id).toBe("B.5.2");
  expect([added.sm.c_87a, added.sm.cf_87a]).toEqual(["walls", "North"]);
  expect(added.sm.f_87a, "B.5's RSI copied").toBe(added.sm.f_86);
  expect(added.teui, "an empty row moves nothing").toBe(house.teui);

  await type(page, "dl_87a", "10");
  await type(page, "dh_87a", "2.5");
  const lh = await settle(page);
  expect(lh.rowA).toBe(25);
  expect(lh.areaEditable, "L x H gives the area").toBe("false");
  expect(lh.wallsA).toBeCloseTo(house.wallsA + 25, 9);
  expect(lh.teui).toBeGreaterThan(house.teui);
  // F280 Table 3 at Hemmingford (summer range 12: the first column): a row adds UA x tb x
  // (max(0, DTDc + SC) - max(0, DTDc)); a wall facing North, SC -3.8
  const term = (s, sc) => s.rowUA * s.tb * (Math.max(0, s.dtdc + sc) - Math.max(0, s.dtdc));
  expect(lh.sc - house.sc, "North: Table 3's -3.8 on its UA").toBeCloseTo(term(lh, -3.8), 6);

  await choose(page, "cf_87a", "South");
  const south = await settle(page);
  expect(south.sc - lh.sc, "South (-2.2) against North (-3.8)").toBeCloseTo(term(south, -2.2) - term(south, -3.8), 6);
  expect(south.sankey).toContain("B.5.2 Wall above grade · S");

  await choose(page, "c_87a", "roof");
  const roof = await settle(page);
  expect(roof.roofA).toBeCloseTo(house.roofA + 25, 9);
  expect(roof.wallsA).toBeCloseTo(house.wallsA, 9);
  expect(roof.sc - south.sc, "the roofs' +15 against South's -2.2").toBeCloseTo(term(roof, 15) - term(roof, -2.2), 6);
  expect(roof.facingShown).toBe(false);
  expect(roof.id).toBe("B.4.2");
  expect(roof.sankey).toContain("B.4.2 Roof");

  // the house CSV: type, facing, L and H travel
  const download = page.waitForEvent("download");
  await page.evaluate(() => window.TEUI.FileHandler.exportToCSV());
  const text = fs.readFileSync(await (await download).path(), "utf8");
  const other = await load(page, "src/template/case-studies/01-assembly-obc-sb10.csv");
  expect(other.shown).toBe(false);
  await page.evaluate((t) => window.TEUI.FileHandler.processImportedCSV(t), text);
  const back = await settle(page);
  expect(back.shown).toBe(true);
  expect([back.sm.c_87a, back.sm.cf_87a, parseFloat(back.sm.dl_87a), parseFloat(back.sm.dh_87a)]).toEqual(["roof", "South", 10, 2.5]);
  expect(back.teui).toBe(roof.teui);

  // an older file (no type column): B.5 back to a wall facing Average, both models
  await choose(page, "c_86", "roof");
  await page.evaluate(() => window.TEUI.StateManager.setValue("ref_c_86", "roof", "user-modified"));
  await settle(page);
  const older = await load(page, "src/template/case-studies/03-residence-phi-classic.csv");
  expect([older.sm.c_86, older.sm.ref_c_86, older.sm.cf_86]).toEqual(["walls", "walls", "Average"]);

  // the Reference's RSI for a row it has no value for: the standard's, by the row's type in the Reference
  const std = await page.evaluate(() => {
    const RV = window.TEUI.ReferenceValues[window.TEUI.StateManager.getValue("d_13")];
    return { roof: RV.f_85, walls: RV.f_86 };
  });
  await click(page, "add");
  await page.evaluate(() => {
    const SM = window.TEUI.StateManager;
    SM.setValue("ref_f_87a", "", "user-modified"); // no value of its own: the standard decides
    SM.setValue("ref_c_87a", "roof", "user-modified");
    window.TEUI.ComputationIntegration.populateReferenceModel();
    window.TEUI.Calculator.calculateAll();
  });
  const refRoof = await settle(page);
  expect(String(refRoof.refRsi87a), "a row turned to Roof takes the standard's roof RSI").toBe(String(std.roof));
  // (the recompute wrote the Reference's 87a RSI back to ref_f_87a - its own value now, priority 1 - so
  // clear it again: the standard decides only for a row with no value of its own)
  await page.evaluate(() => {
    window.TEUI.StateManager.setValue("ref_f_87a", "", "user-modified");
    window.TEUI.StateManager.setValue("ref_c_87a", "walls", "user-modified");
    window.TEUI.ComputationIntegration.populateReferenceModel();
    window.TEUI.Calculator.calculateAll();
  });
  const refWall = await settle(page);
  expect(String(refWall.refRsi87a), "as a wall, the standard's wall RSI").toBe(String(std.walls));

  await click(page, "remove");
  const removed = await settle(page);
  expect(removed.shown).toBe(false);
  expect([removed.sm.d_87a, removed.sm.ref_d_87a, removed.sm.dl_87a, removed.sm.dh_87a]).toEqual(["0", "0", "", ""]);
  expect(removed.teui).toBe(older.teui);
});
