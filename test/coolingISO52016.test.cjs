/**
 * CoolingISO52016.js, without a browser.
 *
 *   node test/coolingISO52016.test.cjs
 *
 * 1. THE BALANCE IS THE WORKBOOK'S. On the EPB Center workbook's own monthly
 *    totals (test/fixtures/iso52016-calc-c-m.json, recorded by
 *    tools/climate/iso52016_fixture.py from sheet Calc_C_m), monthBalance
 *    gives the workbook's τ, a, η_C,ls and continuous need in every month.
 *    The same for the heating balance (sheet Calc_H_m), which here only
 *    splits a month between heating and cooling (f_C).
 *    POSITIVE CONTROL: τ0 = 1.5 h instead of 15 h moves the need.
 * 2. THE ROWS ARE THE NEED. On Toronto City's station and a small house, the
 *    attributed rows sum to the unmitigated need, and unmitigated - recovered
 *    - free cooling = mitigated.
 * 3. THE SWITCHES READ. Boost "None" (1) gives zero free cooling and a boost
 *    of 1.5 gives some; HRV 0 % recovers nothing and 89 % recovers some;
 *    a heavier building (C_m) needs less; free cooling never exceeds its
 *    uncapped potential; f_C keeps January's active cooling under a day
 *    and July's over 25 days.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
global.window = {};
require(path.join(ROOT, "src/core/ClimateStations.js"));
require(path.join(ROOT, "src/core/ClimateStation.js"));
require(path.join(ROOT, "src/core/CoolingISO52016.js"));
const CS = window.TEUI.ClimateStation;
const ISO = window.TEUI.CoolingISO52016;

const read = (p, kind) => {
  const full = path.join(ROOT, p);
  if (kind === "json") return Promise.resolve(JSON.parse(fs.readFileSync(full, "utf8")));
  const b = fs.readFileSync(full);
  return Promise.resolve(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};

const rel = (a, b) => Math.abs(a - b) / Math.max(1e-9, Math.abs(b));

const HOUSE = {
  setpoint: 24,
  heatingSetpoint: 22,
  floorArea: 150,
  typology: "Pt.9 Res. Stick Frame",
  air: [
    { key: "roof", tilt: "roof", opaque: true, A: 90, U: 1 / 8.67 },
    { key: "walls", tilt: "wall", opaque: true, A: 160, U: 1 / 4.87 },
    { key: "doors", tilt: "wall", opaque: false, A: 4, U: 1.2 },
    { key: "windowSouth", tilt: "wall", opaque: false, A: 14, U: 1.0 },
    { key: "windowWest", tilt: "wall", opaque: false, A: 8, U: 1.0 },
  ],
  ground: [{ key: "slabOnGrade", A: 90, U: 1 / 2.64 }],
  tbPercent: 20,
  glazing: [
    { key: "glazing76", A: 14, shgc: 0.4, summerShading: 30, orientation: "South" },
    { key: "glazing77", A: 8, shgc: 0.4, summerShading: 0, orientation: "West" },
  ],
  ventLs: 40,
  boost: 1,
  hrvPercent: 0,
  leakLs: 8,
  internalKWh: 6000,
};

(async () => {
  let ok = true;
  const fail = (msg) => {
    console.log("  FAIL " + msg);
    ok = false;
  };

  // 1
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, "fixtures/iso52016-calc-c-m.json"), "utf8"));
  let worst = 0;
  let moved = 0;
  for (const m of fx.months) {
    const bal = ISO.monthBalance({ qht: m.qht, qgn: m.qgn, cmA: fx.cmA_J_per_K, sumH: m.sumH });
    for (const [mine, theirs] of [
      [bal.tau, m.tau],
      [bal.a, m.a],
      [bal.eta, m.eta],
      [bal.need, m.need_cont],
    ]) {
      worst = Math.max(worst, rel(mine, theirs));
    }
    // the control: the same month with τ0 = 1.5 h (sumH x 10 does the same to τ/τ0)
    const ctl = ISO.monthBalance({ qht: m.qht, qgn: m.qgn, cmA: fx.cmA_J_per_K * 10, sumH: m.sumH });
    moved = Math.max(moved, rel(ctl.need, m.need_cont));
  }
  for (const m of fx.heating) {
    const bal = ISO.heatingBalance({ qht: m.qht, qgn: m.qgn, cmA: fx.cmA_J_per_K, sumH: m.sumH });
    for (const [mine, theirs] of [
      [bal.tau, m.tau],
      [bal.a, m.a],
      [bal.eta, m.eta],
    ]) {
      worst = Math.max(worst, rel(mine, theirs));
    }
    worst = Math.max(worst, Math.abs(bal.need - m.need) / Math.max(1, m.need));
  }
  console.log(`workbook ${fx.source}: worst relative difference over τ, a, η, need (cooling + heating) = ${worst.toExponential(2)}`);
  if (worst > 1e-9) fail("balance vs workbook");
  console.log(`  control τ x 10: need moves by up to ${(100 * moved).toFixed(1)} %`);
  if (moved < 0.01) fail("control indistinguishable");

  // 2
  const st = await CS.load(CS.stationFor("ON", "Toronto (City Hall)"), read);
  const run = (over) => {
    const b = { ...HOUSE, ...over };
    return ISO.annual(b, st.months, CS.freeCooling(st, b.setpoint, 50));
  };
  const both = run({ boost: 1.5, hrvPercent: 89 });
  const rowSum = Object.values(both.rows).reduce((s, v) => s + v, 0);
  console.log(
    `Toronto house, boost 1.5, HRV 89 %: need ${both.unmitigated.toFixed(1)} kWh, rows sum ${rowSum.toFixed(1)}, ` +
      `recovered ${both.recovered.toFixed(1)}, free cooling ${both.freeCooling.toFixed(1)} (potential ${both.freeCoolingPotential.toFixed(1)}), ` +
      `mitigated ${both.mitigated.toFixed(1)}`
  );
  if (rel(rowSum, both.unmitigated) > 1e-9) fail("rows do not sum to the need");
  if (rel(both.unmitigated - both.recovered - both.freeCooling, both.mitigated) > 1e-9) fail("mitigated");
  console.log(
    "  rows: " +
      Object.entries(both.rows)
        .map(([k, v]) => `${k} ${v.toFixed(0)}`)
        .join(", ")
  );

  // 3
  const none = run({});
  console.log(`  boost None: free cooling ${none.freeCooling.toFixed(2)}; HRV 0 %: recovered ${none.recovered.toFixed(2)}`);
  if (none.freeCooling !== 0) fail("boost None should give no free cooling");
  if (none.recovered !== 0) fail("HRV 0 % should recover nothing");
  if (!(both.freeCooling > 0)) fail("boost 1.5 should give free cooling");
  if (!(both.recovered > 0)) fail("HRV 89 % should recover");
  if (both.freeCooling > both.freeCoolingPotential + 1e-9) fail("free cooling above its potential");
  const heavy = run({ typology: "Pt.3 Concrete" });
  console.log(`  C_m light ${none.unmitigated.toFixed(1)} -> heavy ${heavy.unmitigated.toFixed(1)} kWh`);
  if (!(heavy.unmitigated < none.unmitigated)) fail("heavier should need less");
  const days = (m) => both.months.fC[m] * window.TEUI.CoolingISO52016.DAYS[m];
  console.log(`  active cooling: January ${days(0).toFixed(2)} days, July ${days(6).toFixed(1)}; year ${both.coolingDays.toFixed(1)}`);
  if (!(days(0) < 1 && days(6) > 25)) fail("f_C");

  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
})();
