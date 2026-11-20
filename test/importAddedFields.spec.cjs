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
  test("each takes its default in both models, not the previous project's value", async ({
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

    /** Each added field: StateManager and graph, Target and Reference. */
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
          out[id] = {
            default: String(input.defaultValue),
            target: String(SM.getValue(id)),
            reference: String(SM.getValue(`ref_${id}`)),
            targetGraph: model(state.getActiveModelId()),
            referenceGraph: model(CI.getRefModelId()),
          };
        }
        return out;
      }, ADDED);

    // The previous project: a full file, then every added field off its
    // default in both models
    await page.evaluate(
      ({ csv, previous }) => {
        window.TEUI.FileHandler.processImportedCSV(csv);
        const SM = window.TEUI.StateManager;
        for (const [id, value] of Object.entries(previous)) {
          SM.setValue(id, value, "user-modified");
          SM.setValue(`ref_${id}`, value, "user-modified");
        }
        window.TEUI.Calculator.calculateAll();
      },
      { csv, previous: PREVIOUS }
    );
    await page.waitForTimeout(500);

    const before = await read();
    expect(Object.keys(before).sort()).toEqual([...ADDED].sort());
    for (const id of ADDED) {
      expect(before[id], `${id} before`).toMatchObject({
        target: PREVIOUS[id],
        reference: PREVIOUS[id],
        targetGraph: PREVIOUS[id],
        referenceGraph: PREVIOUS[id],
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
      expect(after[id], `${id} after`).toMatchObject({
        target: want,
        reference: want,
        targetGraph: want,
        referenceGraph: want,
      });
    }
  });
});
