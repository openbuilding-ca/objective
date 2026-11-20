// @ts-check
const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

// A case study saved before notes travelled in the CSV: no s18_notes column
const OLDER_FILE = path.join(
  __dirname,
  "computation",
  "case-studies",
  "02-SolarQ.csv"
);

test.describe("Project Notes on CSV import", () => {
  test("only a file with the notes column replaces the notes", async ({
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
        window.TEUI?.FileHandler?.processImportedCSV &&
        window.TEUI?.SectionModules?.sect20?.setNotes,
      { timeout: 60000 }
    );

    const older = fs
      .readFileSync(OLDER_FILE, "utf-8")
      .split(/\r?\n/)
      .filter((row) => row.trim() !== "");
    expect(older[0]).not.toContain("s18_notes");
    const withNotes = (cell) =>
      [
        `${older[0]},s18_notes: Project Notes`,
        `${older[1]},${cell}`,
        `${older[2]},`,
      ].join("\n");

    // Notes before the import are "EXISTING"; set, import and read in one
    // turn, so the startup auto-load of case study 01 cannot land between
    const notesAfterImport = (csv, options) =>
      page.evaluate(
        ([csv, options]) => {
          const sect20 = window.TEUI.SectionModules.sect20;
          sect20.setNotes("EXISTING");
          window.TEUI.FileHandler.processImportedCSV(csv, options);
          return {
            notes: sect20.getNotes(),
            stored: localStorage.getItem("S19_USER_NOTES"),
          };
        },
        [csv, options]
      );

    // The column with text sets the notes
    expect(await notesAfterImport(withNotes('"Slab, R-20"'))).toEqual({
      notes: "Slab, R-20",
      stored: "Slab, R-20",
    });

    // The column with an empty cell clears them (a new building)
    expect(await notesAfterImport(withNotes(""))).toEqual({
      notes: "",
      stored: "",
    });

    // No column: the file could not carry notes, so they stay
    expect(await notesAfterImport(older.join("\n"))).toEqual({
      notes: "EXISTING",
      stored: "EXISTING",
    });

    // ...unless the caller says the file is the whole project (a sample)
    expect(
      await notesAfterImport(older.join("\n"), { replaceNotes: true })
    ).toEqual({ notes: "", stored: "" });

    // A file that imports nothing changes nothing
    expect(
      await notesAfterImport("s18_notes: Project Notes\nLOST")
    ).toEqual({ notes: "EXISTING", stored: "EXISTING" });
  });
});
