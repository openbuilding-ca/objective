// @ts-check
/**
 * Wombat (S19) reads S11's TYPE SUMS, not the first rows' own fields (Andy 2026-11-20, after S11's opaque
 * rows: an element is a ROW with its own type). Its windows are every S10 window row, each with its own
 * orientation, in the model being drawn.
 *
 *   npx playwright test test/wombatTypeSums.spec.cjs --config=playwright.config.cjs
 *
 * Witnesses, on Hemmingford's review case (03-f280: Target OBJECTIVE, Reference F280):
 *   - the solver's footprint is the slabs' type sum and its roof the roofs' type sum, in both models;
 *   - + shows B.10.2 (a below-grade row), typed Slab with 20 m2: the Target's footprint grows by 20 and
 *     the rectangle keeps it exactly; the Reference, which has no such row, keeps its own;
 *   - a second roof row (B.4.2, L 10 x H 2) adds 20 m2 to the roof the solver holds;
 *   - a window row after the fourth (G.8.6) is placed by its own orientation: NorthEast halves onto
 *     north and east (the old map spelled it "Northeast" and dropped it on north), Average quarters;
 *   - the Reference's windows are the Reference's rows (ref_), not the Target's.
 */
const { test, expect } = require("@playwright/test");
const path = require("path");
const { spawn } = require("child_process");

let URL = process.env.F280_URL;
let server = null;
test.beforeAll(async ({}, testInfo) => {
  if (process.env.F280_URL) return;
  const PORT = 8792 + testInfo.parallelIndex;
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
  const CI = window.TEUI.ComputationIntegration, st = CI.getState();
  const t = st.getActiveModelId(), r = CI.getRefModelId();
  const S19 = window.TEUI.SectionModules.sect19;
  const geo = (isRef) => {
    const g = S19.solveGeometry(isRef);
    return { footprintArea: g.footprintArea, rect: g.footprint.width * g.footprint.length, roofArea: g.roofArea };
  };
  return {
    slab: parseFloat(st.getValueForModel(t, "transmissionLoss.slabOnGrade.area")),
    roof: parseFloat(st.getValueForModel(t, "transmissionLoss.roof.area")),
    refSlab: parseFloat(st.getValueForModel(r, "transmissionLoss.slabOnGrade.area")),
    refRoof: parseFloat(st.getValueForModel(r, "transmissionLoss.roof.area")),
    target: geo(false),
    reference: geo(true),
    win: window.TEUI.WombatWindows.mapWindowsToFacades(false),
    refWin: window.TEUI.WombatWindows.mapWindowsToFacades(true),
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
const add = (page, group) =>
  page.evaluate((g) => document.querySelector(`.openings-controls[data-section="s11"][data-group="${g}"] .expandable-add-btn`).click(), group);
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
const setSM = (page, values) => page.evaluate((vs) => Object.entries(vs).forEach(([k, v]) => window.TEUI.StateManager.setValue(k, v, "user-modified")), values);

test("Wombat reads the type sums and every window row", async ({ page }) => {
  test.setTimeout(300000);
  await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
  const auto = page.waitForEvent("console", { predicate: (m) => /\[init\.js\] Auto-load/.test(m.text()), timeout: 30000 });
  await page.goto(URL);
  await auto;

  const house = await load(page, "src/template/case-studies/03-residence-phi-classic-f280.csv");
  expect(house.slab).toBeGreaterThan(0);
  expect(house.target.footprintArea, "the footprint is the slabs' sum").toBeCloseTo(house.slab, 9);
  expect(house.target.rect, "the rectangle keeps it").toBeCloseTo(house.slab, 9);
  expect(house.target.roofArea, "the roof is the roofs' sum").toBeCloseTo(house.roof, 9);
  expect(house.reference.footprintArea).toBeCloseTo(house.refSlab, 9);
  expect(house.reference.roofArea).toBeCloseTo(house.refRoof, 9);

  // A second slab row, B.10.2 (95a): the Target's footprint gains it
  await add(page, "below");
  await settle(page);
  await choose(page, "c_95a", "slabOnGrade");
  await type(page, "d_95a", "20");
  const slab2 = await settle(page);
  expect(slab2.slab).toBeCloseTo(house.slab + 20, 9);
  expect(slab2.target.footprintArea, "B.10.2 joins the footprint").toBeCloseTo(house.slab + 20, 9);
  expect(slab2.target.rect).toBeCloseTo(house.slab + 20, 9);

  // A second roof row, B.4.2 (87a, L 10 x H 2): the solver's roof gains 20
  await add(page, "above");
  await settle(page);
  await choose(page, "c_87a", "roof");
  await type(page, "dl_87a", "10");
  await type(page, "dh_87a", "2");
  const roof2 = await settle(page);
  expect(roof2.roof).toBeCloseTo(house.roof + 20, 9);
  expect(roof2.target.roofArea, "B.4.2 joins the roof").toBeCloseTo(house.roof + 20, 9);

  // A window row after the fourth, by its own orientation, in its own model
  await setSM(page, { d_78a: "6", e_78a: "NorthEast", ref_d_78a: "8", ref_e_78a: "Average" });
  const win = await settle(page);
  expect(win.win.north - house.win.north, "NorthEast: half on north").toBeCloseTo(3, 9);
  expect(win.win.east - house.win.east, "and half on east").toBeCloseTo(3, 9);
  expect(win.win.south).toBeCloseTo(house.win.south, 9);
  expect(win.win.west).toBeCloseTo(house.win.west, 9);
  for (const f of ["north", "east", "south", "west"]) {
    expect(win.refWin[f] - house.refWin[f], `the Reference's Average: a quarter on ${f}`).toBeCloseTo(2, 9);
  }
});
