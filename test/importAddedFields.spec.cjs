// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const CASE_STUDIES_DIR = path.join(__dirname, "computation", "case-studies");

// The fields added 2026-11-18 (e_12, the space type, follows its occupancy
// through Section 02 and is not checked here)
const ADDED = ["l_63", "m_63", "g_59", "e_118", "l_122", "i_122"];

// What a previous project leaves in both models: none of it a default
const PREVIOUS = {
  l_63: "3",
  m_63: "2",
  g_59: "Target",
  e_118: "ERV",
  l_122: "72",
  i_122: "OBJECTIVE",
};

/** A row's cells as written, split on the commas outside quotes. */
function splitRow(row) {
  const cells = [""];
  let quoted = false;
  for (const char of row) {
    if (char === '"') quoted = !quoted;
    if (char === "," && !quoted) cells.push("");
    else cells[cells.length - 1] += char;
  }
  return cells;
}

/** The file as one saved before 2026-11-18: without the added columns. */
function withoutAddedColumns(csv) {
  const rows = csv
    .split(/\r?\n/)
    .filter(row => row.trim() !== "")
    .map(splitRow);
  const kept = rows[0].map(
    header =>
      !["e_12", ...ADDED].includes(header.replace(/^"/, "").split(":")[0])
  );
  return rows.map(row => row.filter((_, i) => kept[i]).join(",")).join("\n");
}

test.describe("Import of a file without the fields added 2026-11-18", () => {
  test("each takes and shows its default in both models, not the previous project's value", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("disclaimerSeen", "true");
    });

    const indexPath = path.join(__dirname, "..", "index.html");
    await page.goto(`file://${indexPath}`);

    await page.waitForFunction(
      () =>
        window.TEUI?.ComputationIntegration?.isInitialized?.() &&
        window.TEUI?.StateManager &&
        window.TEUI?.FileHandler?.processImportedCSV,
      { timeout: 60000 }
    );
    // init.js loads a sample of its own shortly after: let it land first
    await page.waitForTimeout(3000);

    const csv = fs.readFileSync(
      path.join(CASE_STUDIES_DIR, "03-Meadow.csv"),
      "utf-8"
    );
    const olderCsv = withoutAddedColumns(csv);
    expect(olderCsv).not.toContain("e_118");

    /**
     * Each added field: StateManager and graph, Target and Reference, and
     * what its cell shows (a number as the number: "1.00" is 1).
     */
    const read = () =>
      page.evaluate(added => {
        const SM = window.TEUI.StateManager;
        const CI = window.TEUI.ComputationIntegration;
        const state = CI.getState();
        const graph = CI.getGraph();
        const out = {};
        for (const inputId of graph.getAllInputIds()) {
          const input = graph.getInput(inputId);
          if (!added.includes(input?.legacyId)) continue;
          const id = input.legacyId;
          const model = modelId =>
            String(state.getValueForModel(modelId, inputId));
          const cell = document.querySelector(`[data-field-id="${id}"]`);
          const select =
            cell.tagName === "SELECT" ? cell : cell.querySelector("select");
          out[id] = {
            default: String(input.defaultValue),
            target: String(SM.getValue(id)),
            reference: String(SM.getValue(`ref_${id}`)),
            targetGraph: model(state.getActiveModelId()),
            referenceGraph: model(CI.getRefModelId()),
            shown: select
              ? select.value
              : String(parseFloat(cell.textContent)),
          };
        }
        return out;
      }, ADDED);

    // In whichever model is on screen
    for (const mode of ["target", "reference"]) {
      // The previous project: a full file, then every added field off its
      // default in both models, and shown
      await page.evaluate(
        ({ csv, previous, mode }) => {
          window.TEUI.ReferenceToggle.switchMode("target");
          window.TEUI.FileHandler.processImportedCSV(csv);
          const SM = window.TEUI.StateManager;
          for (const [id, value] of Object.entries(previous)) {
            SM.setValue(id, value, "user-modified");
            SM.setValue(`ref_${id}`, value, "user-modified");
          }
          window.TEUI.Calculator.calculateAll();
          window.TEUI.ReferenceToggle.switchMode(mode);
          window.TEUI.DOMBridge.stampInputsForMode();
        },
        { csv, previous: PREVIOUS, mode }
      );
      await page.waitForTimeout(500);

      const before = await read();
      expect(Object.keys(before).sort()).toEqual([...ADDED].sort());
      for (const id of ADDED) {
        expect(before[id], `${id} before, ${mode} on screen`).toMatchObject({
          target: PREVIOUS[id],
          reference: PREVIOUS[id],
          targetGraph: PREVIOUS[id],
          referenceGraph: PREVIOUS[id],
          shown: PREVIOUS[id],
        });
        expect(before[id].default, `${id} default`).not.toBe(PREVIOUS[id]);
      }

      // The older file
      await page.evaluate(
        older => window.TEUI.FileHandler.processImportedCSV(older),
        olderCsv
      );
      await page.waitForTimeout(500);

      const after = await read();
      for (const id of ADDED) {
        const want = after[id].default;
        expect(after[id], `${id} after, ${mode} on screen`).toMatchObject({
          target: want,
          reference: want,
          targetGraph: want,
          referenceGraph: want,
          shown: want,
        });
      }
    }
  });

  // Mark's #134 review: the F280 inputs (added 2026-11-19) were outside the reset, and F280 Mode's default
  // sat in processImportedCSV, so an Excel workbook left it as it was
  const F280_INPUTS = ["l_25", "d_26", "h_26", "l_26", "d_26b", "g_111", "d_112", "g_112", "d_112b", "g_112b",
    "d_112c", "g_112c", "d_112d", "g_112d", "d_112e", "g_112e", "l_123"];
  const TEMPLATES = path.join(__dirname, "..", "src", "template", "case-studies");
  const F280_HOUSE = fs.readFileSync(path.join(TEMPLATES, "03-residence-phi-classic-f280.csv"), "utf-8");
  const OLDER = fs.readFileSync(path.join(TEMPLATES, "04-apartment-necb-small.csv"), "utf-8"); // 128 columns

  async function open(page) {
    await page.addInitScript(() => localStorage.setItem("disclaimerSeen", "true"));
    await page.goto("/index.html");
    await page.waitForFunction(
      () => window.TEUI?.ComputationIntegration?.isInitialized?.() && window.TEUI?.FileHandler?.processImportedCSV,
      { timeout: 60000 }
    );
    await page.waitForTimeout(3000); // init.js's own sample lands first
  }

  /** The F280 house, with its Reference's F280 inputs and F280 Mode On in the Target too. */
  async function loadF280House(page) {
    await page.evaluate(({ csv, ids }) => {
      window.TEUI.FileHandler.processImportedCSV(csv);
      const SM = window.TEUI.StateManager;
      for (const id of [...ids, "f280_mode"]) SM.setValue(id, SM.getValue(`ref_${id}`), "user-modified");
      window.TEUI.Calculator.calculateAll();
    }, { csv: F280_HOUSE, ids: F280_INPUTS });
    await page.waitForTimeout(500);
  }

  /** Every field's stored value in both models (F280 Mode included), and the F280 inputs' defaults. */
  const snapshot = page =>
    page.evaluate(ids => {
      const SM = window.TEUI.StateManager, FM = window.TEUI.FieldManager, values = {}, defaults = {};
      for (const id of [...Object.keys(FM.getAllUserEditableFields()), "f280_mode"]) {
        values[id] = String(SM.getValue(id));
        values[`ref_${id}`] = String(SM.getValue(`ref_${id}`));
      }
      for (const id of ids) defaults[id] = String(FM.getField(id)?.defaultValue ?? "");
      return { values, defaults };
    }, F280_INPUTS);

  test("an older file resets the F280 inputs and F280 Mode, by CSV or by Excel", async ({ browser }) => {
    const fresh = await browser.newPage();
    await open(fresh);
    await fresh.evaluate(csv => window.TEUI.FileHandler.processImportedCSV(csv), OLDER);
    await fresh.waitForTimeout(500);
    const want = (await snapshot(fresh)).values;

    const page = await browser.newPage();
    await open(page);
    await loadF280House(page);
    const { values: before, defaults } = await snapshot(page);
    const offDefault = F280_INPUTS.filter(id => before[id] !== defaults[id]);
    expect(offDefault.length, "the F280 house sets some F280 inputs off their defaults").toBeGreaterThan(0);
    expect([before.f280_mode, before.ref_f280_mode]).toEqual(["On", "On"]);

    // By CSV: every field as a fresh import of the same file leaves it - none the F280 house's
    await page.evaluate(csv => window.TEUI.FileHandler.processImportedCSV(csv), OLDER);
    await page.waitForTimeout(500);
    const { values: byCsv } = await snapshot(page);
    const leaks = Object.keys(want).filter(k => byCsv[k] !== want[k]).map(k => `${k}: ${byCsv[k]}, fresh ${want[k]}`);
    expect(leaks, "fields the previous project left").toEqual([]);
    for (const id of F280_INPUTS) {
      expect([byCsv[id], byCsv[`ref_${id}`]], `${id} by CSV`).toEqual([defaults[id], defaults[id]]);
    }

    // By Excel: processImportedExcel's path (each model's sheet through updateStateFromImportData, no
    // F280 columns), fed the same file's two rows
    await loadF280House(page);
    await page.evaluate(csv => {
      const split = row => {
        const cells = [""];
        let quoted = false;
        for (const ch of row) {
          if (ch === '"') quoted = !quoted;
          else if (ch === "," && !quoted) cells.push("");
          else cells[cells.length - 1] += ch;
        }
        return cells;
      };
      const [header, target, reference] = csv.split(/\r?\n/).filter(r => r.trim() !== "").map(split);
      const ids = header.map(h => h.split(":")[0].trim());
      const sheet = (row, prefix) =>
        Object.fromEntries(ids.map((id, i) => [`${prefix}${id}`, row[i]]).filter(([id]) => !id.endsWith("s18_notes")));
      const FH = window.TEUI.FileHandler, SM = window.TEUI.StateManager;
      SM.muteListeners();
      try {
        FH.updateStateFromImportData(sheet(target, ""), 0, false);
        FH.updateStateFromImportData(sheet(reference, "ref_"), 0, true);
      } finally {
        SM.unmuteListeners();
      }
      window.TEUI.Calculator.calculateAll();
    }, OLDER);
    await page.waitForTimeout(500);
    const { values: byExcel } = await snapshot(page);
    expect([byExcel.f280_mode, byExcel.ref_f280_mode], "F280 Mode by Excel").toEqual(["Off", "Off"]);
    for (const id of F280_INPUTS) {
      expect([byExcel[id], byExcel[`ref_${id}`]], `${id} by Excel`).toEqual([defaults[id], defaults[id]]);
    }
  });
});
