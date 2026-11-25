// @ts-check
/**
 * The opening rows (src/core/Openings.js; Andy 2026-11-20): S10's door and window rows after the first,
 * shown by + and hidden by -, each with an S11 twin that takes its area and holds its U-value.
 *
 *   npx playwright test test/openings.spec.cjs --config=playwright.config.cjs
 *
 * Witnesses, on Hemmingford (03):
 *   - + shows G.8.6 and its twin B.8.6 (G.8.7 stays hidden); the new row copies the nearest WINDOW above
 *     (G.8.4, not G.8.5's skylight - its SHGC set apart to tell them apart) in both models, faces North;
 *   - an area of 10 m2 reaches S11 in both models, and B.8.6's heat loss is A x U x HDD x 24 / 1000 to the
 *     digit; both TEUIs rise;
 *   - the Sankeys draw the row as its own node, named with its orientation, and follow a change of it;
 *   - the house CSV carries the row: exported, a file without the rows loaded (the row goes, area 0), the
 *     export loaded back (the row returns, the TEUI as before);
 *   - - hides the row, its area 0 in both models, and both TEUIs return to the house's own.
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
  const shown = (id) => document.querySelector(`tr[data-id="${id}"]`)?.style.display !== "none";
  return {
    teui: st.getValueForModel(t, "keyValues.target.teui"),
    refTeui: st.getValueForModel(r, "keyValues.target.teui"),
    shown: { g86: shown("G.8.6"), b86: shown("B.8.6"), g87: shown("G.8.7") },
    sm: Object.fromEntries(["d_78a", "e_78a", "f_78a", "g_78a", "h_78a", "f_77", "g_77", "h_77", "g_93a", "g_92"].flatMap((f) => [[f, SM.getValue(f)], [`ref_${f}`, SM.getValue(`ref_${f}`)]])),
    area: [st.getValueForModel(t, "transmissionLoss.window6.area"), st.getValueForModel(r, "transmissionLoss.window6.area")],
    u: st.getValueForModel(t, "transmissionLoss.window6.uValue"),
    loss: st.getValueForModel(t, "transmissionLoss.window6.heatLoss"),
    hdd: st.getValueForModel(t, "climate.heating.degreedays"),
    heatingNodes: window.TEUI.SectionModules.sect16.buildSankeyData().nodes.map((n) => n.name),
    coolingNodes: window.TEUI.CoolingSankey.getCoolingSankeyData().nodes.map((n) => n.name),
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
const click = (page, section, group, which) =>
  page.evaluate(([s, g, w]) => document.querySelector(`.openings-controls[data-section="${s}"][data-group="${g}"] .expandable-${w}-btn`).click(), [section, group, which]);
const set = (page, values) =>
  page.evaluate((v) => Object.entries(v).forEach(([k, x]) => window.TEUI.StateManager.setValue(k, x, "user-modified")), values);

test("opening rows: + / twin / Sankey / CSV / -", async ({ page }) => {
  test.setTimeout(240000);
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto(URL);
  await auto;

  const house = await load(page, "src/template/case-studies/03-residence-phi-classic.csv");
  expect(house.shown).toEqual({ g86: false, b86: false, g87: false });

  // the skylight's SHGC apart from the windows', so the copy shows which row it came from
  await set(page, { f_78: "0.25", ref_f_78: "0.25" });
  await settle(page);
  await click(page, "s10", "windows", "add");
  const added = await settle(page);
  expect(added.shown).toEqual({ g86: true, b86: true, g87: false });
  for (const p of ["", "ref_"]) {
    expect(added.sm[`${p}f_78a`], `${p}SHGC from G.8.4`).toBe(added.sm[`${p}f_77`]);
    expect(added.sm[`${p}f_78a`]).not.toBe("0.25");
    expect(added.sm[`${p}g_78a`]).toBe(added.sm[`${p}g_77`]);
    expect(added.sm[`${p}h_78a`]).toBe(added.sm[`${p}h_77`]);
    expect(added.sm[`${p}g_93a`], `${p}U from B.8.4`).toBe(added.sm[`${p}g_92`]);
  }
  expect(added.teui, "an empty row moves nothing").toBe(house.teui);

  await set(page, { d_78a: "10", ref_d_78a: "10" });
  const withRow = await settle(page);
  expect(withRow.area).toEqual([10, 10]);
  expect(withRow.loss).toBeCloseTo((10 * parseFloat(withRow.u) * parseFloat(withRow.hdd) * 24) / 1000, 9);
  expect(withRow.teui).toBeGreaterThan(house.teui);
  expect(withRow.refTeui).toBeGreaterThan(house.refTeui);
  expect(withRow.heatingNodes).toContain("G.8.6 Window · N");
  expect(withRow.heatingNodes).toContain("B.8.6 Window · N");
  expect(withRow.coolingNodes).toContain("G.8.6 Window · N");
  expect(withRow.heatingNodes.some((n) => /^G\.8\.7/.test(n)), "a hidden row draws no node").toBe(false);

  // both models: an import resets the Target through the graph, but a stored ref_ value outlives it
  // (Mark's #123 review, the latent fields) - the Reference is where a stale row would leak
  await set(page, { e_78a: "South", ref_e_78a: "South" });
  const south = await settle(page);
  expect(south.heatingNodes).toContain("G.8.6 Window · S");
  expect(south.teui).not.toBe(withRow.teui);

  // the house CSV: export, a file without the rows, the export back
  const download = page.waitForEvent("download");
  await page.evaluate(() => window.TEUI.FileHandler.exportToCSV());
  const text = fs.readFileSync(await (await download).path(), "utf8");
  const other = await load(page, "src/template/case-studies/01-assembly-obc-sb10.csv");
  expect(other.shown.g86, "a file without the rows has none").toBe(false);
  expect(parseFloat(other.sm.d_78a)).toBe(0);
  // every column back to the row's default, both models: the previous project's South never returns
  expect([other.sm.e_78a, other.sm.ref_e_78a]).toEqual(["North", "North"]);
  await page.evaluate((t) => window.TEUI.FileHandler.processImportedCSV(t), text);
  const back = await settle(page);
  expect(back.shown.g86).toBe(true);
  expect(parseFloat(back.sm.d_78a)).toBe(10);
  expect(back.sm.e_78a).toBe("South");
  expect(back.teui).toBe(south.teui);
  expect(back.refTeui).toBe(south.refTeui);

  await click(page, "s10", "windows", "remove");
  const removed = await settle(page);
  expect(removed.shown).toEqual({ g86: false, b86: false, g87: false });
  expect([removed.sm.d_78a, removed.sm.ref_d_78a]).toEqual(["0", "0"]);
  // the skylight's SHGC 0.25 moves nothing (Hemmingford has no skylight area): the house's own TEUIs
  expect(removed.teui).toBe(house.teui);
  expect(removed.refTeui).toBe(house.refTeui);

  // "Set Values" (a standard's values, through the import path, and a change to the house) is not a
  // project file: a row with an area keeps it, its orientation and its place
  await click(page, "s10", "windows", "add");
  await set(page, { d_78a: "10", e_78a: "South" });
  await settle(page);
  await page.evaluate(() =>
    window.TEUI.FileHandler.applyReferenceValuesFromStandard(window.TEUI.StateManager.getValue("d_13"), "target")
  );
  const setValues = await settle(page);
  expect(parseFloat(setValues.sm.d_78a), "Set Values keeps the row's area").toBe(10);
  expect(setValues.sm.e_78a).toBe("South");
  expect(setValues.shown.g86).toBe(true);
});
