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
 * 4. LATENT IS F280 ANNEX B'S. The indoor state at 24 °C / 50 % is F280's
 *    Hi = 9.3 g/kg (so i_59 reproduces the standard at its own RH); the
 *    design Ho from C-2's July 2.5 % dry and wet bulbs, at standard
 *    pressure, lands within 0.6 g/kg of F280 Table 5's OHR at six cities
 *    (five round to it; Regina 11.4 vs 12) - at each station's own pressure
 *    three miss and Calgary is 1.2 off, so the Table is sea-level (the
 *    control); the annual latent is the difference between the
 *    need and its sensible part, lands on vent / leak / internal, and is
 *    near zero on the dry prairie (Calgary) where Toronto's is real; a drier
 *    indoor setting (i_59 40 %) costs more latent AND counts fewer free-
 *    cooling hours - the one slider moves both, the same way.
 *    POSITIVE CONTROL: the identity wet bulb = dry bulb gives saturation.
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
  occupants: 4,
  occupiedHours: 4380,
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

  // 4
  const hi = CS.humidityRatio(24, 50, CS.pressureAt(0));
  console.log(`latent: indoor 24 °C / 50 % at sea level = ${hi.toFixed(2)} g/kg (F280 Hi ${ISO.F280_INDOOR_W})`);
  if (Math.abs(hi - ISO.F280_INDOOR_W) > 0.05) fail("indoor state vs F280's 9.3 g/kg");
  const sat = CS.humidityRatio(20, 100, 101325);
  if (Math.abs(CS.humidityRatioFromWetBulb(20, 20, 101325) - sat) > 1e-9) fail("wet bulb = dry bulb should be saturation");
  window.TEUI.ClimateData = undefined;
  require(path.join(ROOT, "src/core/ClimateValues.js"));
  const C2 = window.TEUI.ClimateData;
  // F280-12 Table 5's OHR, g/kg (the standard prints whole numbers)
  const OHR = [
    ["BC", "Vancouver (City Hall)", 11],
    ["AB", "Calgary", 8],
    ["SK", "Regina", 12],
    ["MB", "Winnipeg", 15],
    ["ON", "Toronto (City Hall)", 14],
    ["NS", "Halifax", 12],
  ];
  // F280 computes Ho at standard pressure: within 0.6 g/kg of the Table at
  // all six (the Table prints whole numbers of rounded design temperatures);
  // at the station's own pressure the high cities drift (Calgary, 1 045 m).
  let worstStd = 0;
  let worstStation = 0;
  const ohrLine = OHR.map(([prov, city, ohr]) => {
    const d = C2[prov][city];
    const ho = CS.humidityRatioFromWetBulb(d.July_2_5_Tdb, d.July_2_5_Twb, ISO.F280_PRESSURE);
    const hoSt = CS.humidityRatioFromWetBulb(d.July_2_5_Tdb, d.July_2_5_Twb, CS.pressureAt(d["Elev ASL (m)"]));
    worstStd = Math.max(worstStd, Math.abs(ho - ohr));
    worstStation = Math.max(worstStation, Math.abs(hoSt - ohr));
    return `${city} ${ho.toFixed(2)} (${ohr})`;
  });
  console.log(`  design Ho vs F280 Table 5 OHR: ${ohrLine.join(", ")}`);
  console.log(
    `  worst: standard pressure ${worstStd.toFixed(2)} g/kg, station pressure ${worstStation.toFixed(2)} (control)`
  );
  if (worstStd > 0.6) fail("design Ho vs F280 Table 5");
  if (!(worstStation > 1)) fail("control: station pressure should drift from the Table");
  const dl = ISO.designLatent({ occupants: 4, ventLs: 40, leakLs: 8, ho: 14.4 });
  if (Math.abs(dl - (4 * 67 + 3 * 48 * (14.4 - 9.3))) > 1e-9) fail("designLatent arithmetic");

  const L = both.latent;
  console.log(
    `  Toronto annual latent ${L.total.toFixed(1)} kWh (vent ${L.vent.toFixed(1)}, leak ${L.leak.toFixed(1)}, people ${L.people.toFixed(1)}); ` +
      `July DHD ${L.months[6].dhd.toFixed(2)} g/kg; sensible ${both.sensible.toFixed(1)}`
  );
  if (!(L.vent > 0 && L.leak > 0 && L.people > 0)) fail("Toronto latent should be real on every term");
  // the coil removes moisture only while it cools: January's f_C ~ 0.02
  console.log(`  occupants' latent: January ${L.months[0].people.toFixed(2)} kWh, July ${L.months[6].people.toFixed(1)}`);
  if (!(L.months[0].people < 0.05 * L.months[6].people)) fail("latent should follow f_C");
  if (rel(both.unmitigated - both.sensible, L.total) > 1e-9) fail("unmitigated = sensible + latent");
  if (rel(both.rows.vent - (both.rowsSensible.vent || 0), L.vent) > 1e-9) fail("vent latent on the vent row");
  if (rel(both.rows.internal - both.rowsSensible.internal, L.people) > 1e-9) fail("people latent on the internal row");
  const yyc = await CS.load(CS.stationFor("AB", "Calgary"), read);
  const dry = ISO.annual(HOUSE, yyc.months, CS.freeCooling(yyc, 24, 50));
  const airDry = dry.latent.vent + dry.latent.leak;
  console.log(`  Calgary air latent ${airDry.toFixed(1)} kWh vs Toronto ${(L.vent + L.leak).toFixed(1)}`);
  if (!(airDry < 0.1 * (L.vent + L.leak))) fail("the dry prairie should carry next to no air latent");
  const fc40 = CS.freeCooling(st, 24, 40);
  const fc50 = CS.freeCooling(st, 24, 50);
  const at40 = ISO.annual({ ...HOUSE, boost: 1.5 }, st.months, fc40);
  const at50 = ISO.annual({ ...HOUSE, boost: 1.5 }, st.months, fc50);
  const hrs = (fc) => fc.hours.reduce((s, v) => s + v, 0);
  console.log(
    `  i_59 40 % vs 50 %: latent ${at40.latent.total.toFixed(1)} vs ${at50.latent.total.toFixed(1)} kWh, ` +
      `free-cooling hours ${hrs(fc40)} vs ${hrs(fc50)}`
  );
  if (!(at40.latent.total > at50.latent.total)) fail("drier indoors should cost more latent");
  // S08's basis: F280 pins the indoor state at 9.3 g/kg whatever the slider
  // says (latent and free-cooling hours both stay put); Target follows it
  const f280At = (rh) => CS.freeCooling(st, 24, rh, ISO.F280_INDOOR_W);
  const fA = f280At(40);
  const fB = f280At(60);
  const lA = ISO.annual({ ...HOUSE, boost: 1.5 }, st.months, fA).latent.total;
  const lB = ISO.annual({ ...HOUSE, boost: 1.5 }, st.months, fB).latent.total;
  console.log(
    `  basis F280: wIn ${fA.wIn} g/kg; slider 40 % vs 60 %: latent ${lA.toFixed(1)} vs ${lB.toFixed(1)}, hours ${hrs(fA)} vs ${hrs(fB)}`
  );
  if (fA.wIn !== ISO.F280_INDOOR_W || lA !== lB || hrs(fA) !== hrs(fB)) fail("F280 basis should ignore the slider");
  if (!(Math.abs(fc50.wIn - ISO.F280_INDOOR_W) < 0.2)) fail("Target at 50 % should sit near F280's 9.3 at Toronto's pressure");

  // only an ERV recovers latent: 60 % LRE leaves 40 % of the ventilation's,
  // leakage and occupants untouched; the same 60 % typed under HRV is ignored
  const fcT = CS.freeCooling(st, 24, 50);
  const erv = ISO.annual({ ...HOUSE, recoveryType: "ERV", ervLatentPercent: 60 }, st.months, fcT).latent;
  const hrv = ISO.annual({ ...HOUSE, recoveryType: "HRV", ervLatentPercent: 60 }, st.months, fcT).latent;
  const off = ISO.annual(HOUSE, st.months, fcT).latent;
  console.log(
    `  ERV 60 %: vent latent ${erv.vent.toFixed(1)} vs HRV ${hrv.vent.toFixed(1)} (no recovery ${off.vent.toFixed(1)}); ` +
      `leak ${erv.leak.toFixed(1)} / ${off.leak.toFixed(1)}`
  );
  if (rel(erv.vent, 0.4 * off.vent) > 1e-9) fail("ERV should leave (1 - LRE) of the ventilation latent");
  if (hrv.vent !== off.vent) fail("an HRV recovers no latent, whatever LRE says");
  if (erv.leak !== off.leak || erv.people !== off.people) fail("ERV touches only the ventilation");

  // the latent METHOD (i_122): design latent with an ERV at 60 % LRE
  const dIn = { occupants: 4, ventLs: 40, leakLs: 8, ho: 14.4, recoveryType: "ERV", ervLatentPercent: 60 };
  const dF = ISO.designLatent({ ...dIn, method: "F280" });
  const dO = ISO.designLatent({ ...dIn, method: "OBJECTIVE" });
  const dA = ISO.designLatent({ ...dIn, method: "ASHRAE140" });
  const dhdD = 14.4 - 9.3;
  console.log(`  design latent, ERV 60 %: F280 ${dF.toFixed(1)} W, OBJECTIVE ${dO.toFixed(1)} W, ASHRAE 140 ${dA} W`);
  if (Math.abs(dF - (4 * 67 + 3 * 48 * dhdD)) > 1e-9) fail("F280 gives the ERV no design credit");
  if (Math.abs(dO - (4 * 67 + 3 * (8 + 40 * 0.4) * dhdD)) > 1e-9) fail("OBJECTIVE credits the ERV at design");
  if (dA !== 0) fail("ASHRAE 140 extracts no latent at design");
  const dOh = ISO.designLatent({ ...dIn, recoveryType: "HRV", method: "OBJECTIVE" });
  if (dOh !== dF) fail("OBJECTIVE with an HRV equals F280 (nothing to credit)");
  // ... and annual: ASHRAE 140 carries none, so the rows are the sensible need
  const a140 = ISO.annual({ ...HOUSE, latentMethod: "ASHRAE140" }, st.months, fcT);
  const a140rows = Object.values(a140.rows).reduce((s, v) => s + v, 0);
  console.log(`  annual, ASHRAE 140: latent ${a140.latent.total}, need ${a140.unmitigated.toFixed(1)} = sensible ${a140.sensible.toFixed(1)}`);
  if (a140.latent.total !== 0 || rel(a140rows, a140.sensible) > 1e-9) fail("ASHRAE 140 annual should be sensible only");
  const aObj = ISO.annual({ ...HOUSE, latentMethod: "OBJECTIVE" }, st.months, fcT);
  if (aObj.latent.total !== off.total) fail("the annual latent is the same under F280 and OBJECTIVE");
  if (!(hrs(fc40) < hrs(fc50))) fail("drier indoors should count fewer free-cooling hours");

  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
})();
