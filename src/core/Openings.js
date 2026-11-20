/**
 * Openings.js - the doors and windows: S10's rows (radiant gains) and their S11 twins (transmission).
 *
 * One list, read by both sections and by every node file that walks the openings (RadiantGains,
 * TransmissionLoss, Cooling, SectionCompliance, F280Compliance, VolumeMetrics), the Sankeys and the CSV.
 * Andy 2026-11-20: an opening is a ROW with its own orientation, not a compass label - a row added in
 * S10 brings its twin in S11, which takes its area and holds its U-value. The model carries every row
 * (they are pre-built, as the OBC Matrix's are); + shows the next one, - hides the last one and takes it
 * out of the calculation (its area 0, in both models). A row with an area stays shown.
 *
 * The first rows keep the IDs files have always used (73-78, 88-93), so every saved project reads as
 * before; the rows after them take a letter (73a, 78a ...). n numbers the row within its group: S10's
 * G.7.n / G.8.n, S11's B.7.n / B.8.n (S11's first door row keeps its B.7.0).
 */
(function () {
  window.TEUI = window.TEUI || {};

  const DOORS = [
    { s10: "73", s11: "88", id: "doors", n: 1, kind: "door" },
    { s10: "73a", s11: "88a", id: "door2", n: 2, kind: "door" },
    { s10: "73b", s11: "88b", id: "door3", n: 3, kind: "door" },
    { s10: "73c", s11: "88c", id: "door4", n: 4, kind: "door" },
  ];

  const WINDOWS = [
    { s10: "74", s11: "89", id: "windowNorth", n: 1, kind: "window" },
    { s10: "75", s11: "90", id: "windowEast", n: 2, kind: "window" },
    { s10: "76", s11: "91", id: "windowSouth", n: 3, kind: "window" },
    { s10: "77", s11: "92", id: "windowWest", n: 4, kind: "window" },
    { s10: "78", s11: "93", id: "skylights", n: 5, kind: "skylight" },
    ...["a", "b", "c", "d", "e", "f", "g"].map((letter, i) => ({
      s10: `78${letter}`,
      s11: `93${letter}`,
      id: `window${6 + i}`,
      n: 6 + i,
      kind: "window",
    })),
  ];

  const ALL = [...DOORS, ...WINDOWS];

  // The rows every model has always shown; the rest wait for +
  const BASE = new Set(["73", "74", "75", "76", "77", "78"]);
  const isSlot = o => !BASE.has(o.s10);

  const GROUPS = {
    doors: { rows: DOORS, label: "door", s10Trigger: "73", s11Trigger: "88" },
    windows: {
      rows: WINDOWS,
      label: "window",
      s10Trigger: "74",
      s11Trigger: "89",
    },
  };

  const s10RowId = o => (o.kind === "door" ? `G.7.${o.n}` : `G.8.${o.n}`);
  const s11RowId = o =>
    o.kind === "door" ? (o.n === 1 ? "B.7.0" : `B.7.${o.n}`) : `B.8.${o.n}`;

  // Short orientation names, for a label beside the row's number ("G.8.1 Window · N")
  const SHORT = {
    North: "N",
    NorthEast: "NE",
    East: "E",
    SouthEast: "SE",
    South: "S",
    SouthWest: "SW",
    West: "W",
    NorthWest: "NW",
    Average: "Avg",
    Skylight: "Sky",
  };

  // ------------------------------------------------------------------------------------------------
  // Which rows show: per group, the rows revealed by + this session, and never fewer than reach the
  // last row with an area in either model (a loaded project shows every opening it has)
  // ------------------------------------------------------------------------------------------------
  const revealed = { doors: 0, windows: 0 };

  function areaOf(o) {
    const SM = window.TEUI.StateManager;
    if (!SM) return 0;
    const num = v => {
      const n = parseFloat(String(v ?? "").replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    };
    return Math.max(
      num(SM.getValue(`d_${o.s10}`)),
      num(SM.getValue(`ref_d_${o.s10}`))
    );
  }

  /** How many of the group's slot rows show (0 = only the rows every model has). */
  function shownSlots(group) {
    const slots = GROUPS[group].rows.filter(isSlot);
    let last = 0;
    slots.forEach((o, i) => {
      if (areaOf(o) > 0) last = i + 1;
    });
    return Math.min(slots.length, Math.max(revealed[group], last));
  }

  function isShown(o) {
    if (!isSlot(o)) return true;
    const group = o.kind === "door" ? "doors" : "windows";
    const slots = GROUPS[group].rows.filter(isSlot);
    return slots.indexOf(o) < shownSlots(group);
  }

  function notify() {
    document.dispatchEvent(new CustomEvent("teui-openings-changed"));
  }

  /** A project loaded: the rows shown are its own (those with an area), not the ones + revealed before. */
  function resetShown() {
    revealed.doors = revealed.windows = 0;
  }

  /**
   * +: show the group's next row. An empty row starts as a copy of the row above it (of its own kind), in both models -
   * its SHGC and shading (S10) and its U-value (S11) - so a second window is like the first until it
   * is told otherwise; its area and orientation stay its own (0, North for a window).
   */
  function add(group) {
    const rows = GROUPS[group].rows;
    const slots = rows.filter(isSlot);
    const shown = shownSlots(group);
    if (shown >= slots.length) return;
    const o = slots[shown];
    // the nearest row above of its own kind (G.8.6 copies G.8.4, a window, not G.8.5's skylight)
    const above = rows
      .slice(0, rows.indexOf(o))
      .reverse()
      .find(r => r.kind === o.kind);
    const SM = window.TEUI.StateManager;
    if (SM && above && !(areaOf(o) > 0)) {
      ["", "ref_"].forEach(prefix => {
        const copy = (from, to) => {
          const value = SM.getValue(`${prefix}${from}`);
          if (value !== undefined && value !== null && value !== "")
            SM.setValue(`${prefix}${to}`, value, "user-modified");
        };
        ["f", "g", "h"].forEach(col =>
          copy(`${col}_${above.s10}`, `${col}_${o.s10}`)
        );
        copy(`g_${above.s11}`, `g_${o.s11}`);
      });
    }
    revealed[group] = shown + 1;
    notify();
    // the copied sliders and fields, shown (the graph took them through the StateManager)
    window.TEUI.DOMBridge?.stampInputsForMode?.();
  }

  /** -: hide the group's last shown row and take it out of the calculation (its area 0, both models). */
  function remove(group) {
    const slots = GROUPS[group].rows.filter(isSlot);
    const shown = shownSlots(group);
    if (shown === 0) return;
    const o = slots[shown - 1];
    const SM = window.TEUI.StateManager;
    revealed[group] = shown - 1;
    if (SM) {
      SM.setValue(`d_${o.s10}`, "0", "user-modified");
      SM.setValue(`ref_d_${o.s10}`, "0", "user-modified");
    }
    notify();
  }

  /** Show or hide a section's rows to match (S10 or S11), and set its +/- buttons. */
  function applyVisibility(section) {
    const key = section === "S10" ? "s10" : "s11";
    const rowId = section === "S10" ? s10RowId : s11RowId;
    ALL.forEach(o => {
      document.querySelectorAll(`tr[data-id="${rowId(o)}"]`).forEach(tr => {
        tr.style.display = isShown(o) ? "" : "none";
      });
    });
    Object.keys(GROUPS).forEach(group => {
      const slots = GROUPS[group].rows.filter(isSlot);
      const shown = shownSlots(group);
      document
        .querySelectorAll(
          `.openings-controls[data-section="${key}"][data-group="${group}"]`
        )
        .forEach(c => {
          const addBtn = c.querySelector(".expandable-add-btn");
          const removeBtn = c.querySelector(".expandable-remove-btn");
          if (addBtn)
            addBtn.style.visibility =
              shown < slots.length ? "visible" : "hidden";
          if (removeBtn)
            removeBtn.style.visibility = shown > 0 ? "visible" : "hidden";
        });
    });
  }

  /** The +/- controls, in the first cell of each group's first row. S11's follow S10's (one model). */
  function installControls(section) {
    const key = section === "S10" ? "s10" : "s11";
    Object.entries(GROUPS).forEach(([group, g]) => {
      const trigger =
        section === "S10" ? s10RowId(g.rows[0]) : s11RowId(g.rows[0]);
      const tr = document.querySelector(`tr[data-id="${trigger}"]`);
      const cell = tr?.firstElementChild;
      if (!cell || cell.querySelector(".openings-controls")) return;
      cell.classList.add("expandable-row-trigger");
      cell.innerHTML =
        `<div class="expandable-controls openings-controls" data-section="${key}" data-group="${group}">` +
        `<button type="button" class="expandable-add-btn" title="Add a ${g.label} row">+</button>` +
        `<button type="button" class="expandable-remove-btn" title="Remove the last ${g.label} row (its area leaves the calculation)">−</button>` +
        `</div>`;
      cell
        .querySelector(".expandable-add-btn")
        .addEventListener("click", () => add(group));
      cell
        .querySelector(".expandable-remove-btn")
        .addEventListener("click", () => remove(group));
    });
    applyVisibility(section);
  }

  /**
   * Clone a row definition onto another row: every _<from> ID becomes _<to>, the semantic path's
   * component <pathFrom> becomes <pathTo>, and the field labels matching textPattern read textTo. The
   * copy starts empty: area and calculated cells 0, the orientation `orientation`.
   */
  function cloneRow(
    row,
    from,
    to,
    { id, label, pathFrom, pathTo, textPattern, textTo, orientation }
  ) {
    const json = JSON.stringify(row)
      .replace(new RegExp(`_${from}(?![0-9a-z])`, "g"), `_${to}`)
      .split(`.${pathFrom}.`)
      .join(`.${pathTo}.`)
      .replace(textPattern, textTo);
    const copy = JSON.parse(json);
    copy.id = copy.rowId = id;
    copy.label = label;
    copy.cells.c = { label };
    Object.entries(copy.cells).forEach(([col, cell]) => {
      if (!cell || typeof cell !== "object" || !cell.fieldId) return;
      if (col === "d" || cell.type === "calculated")
        cell.value = col === "n" ? cell.value : "0.00";
      if (col === "e" && cell.type === "dropdown" && orientation)
        cell.value = orientation;
    });
    return copy;
  }

  window.TEUI.Openings = Object.freeze({
    DOORS,
    WINDOWS,
    ALL,
    SLOTS: ALL.filter(isSlot),
    GROUPS,
    SHORT,
    isSlot,
    s10RowId,
    s11RowId,
    shownSlots,
    isShown,
    add,
    remove,
    resetShown,
    applyVisibility,
    installControls,
    cloneRow,
  });
})();
