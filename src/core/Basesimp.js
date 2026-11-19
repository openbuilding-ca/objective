/**
 * Basesimp.js - a basement's heat loss to the soil, by BASESIMP, as CSA F280-12 requires.
 *
 * F280-12 Cl. 5.2.2.1: "For those foundation elements that are in contact with soil, including basement
 * walls above grade, the spreadsheet calculation called BasementHLR.xls shall be used." Its inputs are
 * the clause's list a)-q): length, width, height and depth below grade; soil conductivity; water table;
 * the configuration number (FoundationCC.xls); interior, exterior and slab added insulation; overlap;
 * heating degree days; deep ground temperature; the monthly mean dry bulbs; room, design and slab
 * temperatures; the exposed perimeter; the windows and doors in the above-grade wall. Its output is "the
 * heat loss for the foundation element in the designated winter month, January".
 *
 * This file is that spreadsheet (BasementHLR_2014.xls, NRCan, B. Bradley 2010-2011), cell for cell:
 *   Input  -> the Moore ground-surface harmonic (B49:B53), the exposed fraction (L7), the wall area net of
 *             openings (K11)
 *   Loads  -> the representative insulation (B7:B15), the interpolation below RSI 1.5 (B20:F27), the
 *             monthly harmonic loss FHLmon (G34:G45), the heating (B49) and cooling (B54) loads
 *   BS1    -> SUMUO, SUMUR, ATTEN, PHASE and the corner corrections Fcs, Fcv for the configuration
 *   BS2    -> the same for its uninsulated twin (iUnInsul), with the insulation terms dropped
 *   RadFloor -> the radiant-slab share
 * The method: Beausoleil-Morrison & Mitalas, "BASESIMP", Building Simulation '97 (BASESIMP_theory.pdf),
 * equations 2-8 and 16-19. Coefficients: src/core/BasesimpData.js (generated, tools/f280/basesimp_data.py).
 *
 * Where the spreadsheet differs from the paper, the SPREADSHEET wins - the standard names it:
 *   - BS2 (the uninsulated twin) has sheet-scoped names: its own corner column from the twin's CCF,
 *     rs = 0 (BS2!B35), rsi1c = 0.001 (BS2!B18), and the insulation terms of SUMUO and SUMUR dropped.
 *   - The Moore phase is ATAN(E/F), not ATAN2.
 *   - The cooling load omits the openings fraction K11 that the heating load applies.
 * Witness: test/basesimp.test.cjs against the workbooks' own cached values.
 */
(function () {
  window.TEUI = window.TEUI || {};

  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const WRSI = 2.29; // Loads!B22, "For Basements only"
  // RadFloor!B5:E5 - the structure's own RSI: concrete walls, concrete floors, wood walls, wood floors
  const STRUCTURE_RSI = { concreteWall: 0.116, concreteFloor: 0.0578, woodWall: 0.417, woodFloor: 0.833 };

  function data() {
    const d = window.TEUI.BasesimpData;
    if (!d) throw new Error("Basesimp: BasesimpData.js is not loaded");
    return d;
  }

  function config(n) {
    const c = data().configs[n];
    if (!c) throw new Error(`Basesimp: no configuration #${n} in FoundationCC`);
    return c;
  }

  // CORC!B52:B60 - flags 6, 7, 8 choose how the added insulation is represented.
  function inflag(c) {
    const f6 = c.iFndFlag6, f7 = c.iFndFlag7, f8 = c.iFndFlag8;
    if (f6 < 1 && f7 < 1) return 1;
    if (f6 < 1 && f7 > 0 && f8 < 1) return 2;
    if (f6 < 1 && f7 > 0 && f8 > 0) return 3;
    if (f6 > 0 && f7 > 0 && f8 < 1) return 4;
    if (f6 > 0 && f7 < 1 && f8 < 1) return 2;
    if (f6 > 0 && f7 < 1 && f8 > 0) return 3;
    if (f6 > 0 && f7 > 0 && f8 > 0) return 5;
    throw new Error(`Basesimp: configuration ${c.name} has flags 6-8 = ${f6},${f7},${f8}`);
  }

  // Loads!B7:B13 - the "representative" insulation value rsi1.
  function representativeRsi(flag, ins) {
    const wall = Math.max(ins.interior, ins.exterior);
    switch (flag) {
      case 1: return 0;
      case 2: return wall;
      case 3: return 0.88 * wall + 0.12 * ins.slab;
      case 4: return ins.interior + ins.exterior;
      case 5: return (ins.interior + ins.exterior) * 0.44 + 0.12 * ins.slab;
    }
    throw new Error(`Basesimp: Inflag ${flag}`);
  }

  // BS1!B6:B17 - the corner-correction column, from CCF or (CCF 99) from the overlap.
  function cornerColumn(ccf, g) {
    if (ccf !== 99) return ccf;
    const wilen = g.height - g.depth + g.overlap;
    const welen = 0.1 + g.depth;
    if (g.overlap / 0.6 < 0.9999) return 4;
    return welen / wilen > 1 ? 5 : 3;
  }

  // BS1!B41:B45 (and B56:B60) - one corner-correction polynomial, row iuse of CornerCF.
  function cornerFactor(iuse, rs, soilk, wby2, dept, wtable) {
    const k = data().cornerCF[iuse - 1];
    return (
      k[0] + k[1] * rs + k[2] * soilk + k[3] * wby2 + k[4] * dept + k[5] * wtable +
      k[6] * rs ** 2 + k[7] * soilk * rs + k[8] * wby2 * rs + k[9] * wby2 * soilk + k[10] * wby2 ** 2 +
      k[11] * dept * rs + k[12] * dept * soilk + k[13] * dept * wby2 + k[14] * dept ** 2 +
      k[15] * wtable * rs + k[16] * wtable * soilk + k[17] * wtable * wby2 + k[18] * wtable * dept
    );
  }

  // BS1 (insulated: rsi = rsi2) or BS2 (uninsulated twin: insulated = false, rsi1c 0.001). `corner` is
  // BS1's {iuse, rs, dept, wby2}: BS2 reads BS1's cells for these (see the header).
  function shapeFactors(c, g, rsi, insulated, corner) {
    const { length, width, height, depth, soilk, wtable, overlap } = g;
    const hd = height - depth;
    // SUMUO (eq. 16), BS1!B20:B24
    const rpart1 = insulated
      ? (c.a1 + c.b1 * hd + c.cc1 / soilk) / rsi ** c.d1
      : c.a1 + c.b1 * hd + c.cc1 / soilk;
    const rpart2 = 1 / (c.e1 + c.i1 * overlap ** c.f1 * rsi ** c.g1 * hd ** c.h1);
    const sumuo = rpart1 * rpart2 + c.j1;
    const sag = sumuo * 2 * (length + width);
    // SUMUR (eq. 17), BS1!B27:B31
    const r1 = (c.q2 + c.rr2 * width) * (c.u2 + c.v2 * soilk) * (c.w2 + c.x2 * depth);
    const r2 = wtable ** (c.s2 + c.t2 * width + c.y2 * depth);
    const r3 = c.a2 * depth ** c.b2 * soilk ** c.cc2;
    const r4 = insulated
      ? wtable ** c.d2 * rsi ** (c.e2 + c.f2 * soilk + c.g2 * depth + c.h2 * overlap)
      : wtable ** c.d2;
    const sumur = r1 / r2 + r3 / r4;
    // Corner corrections, BS1!B34:B45 and B55:B60
    const fcs = cornerFactor(corner.iuse, corner.rs, soilk, corner.wby2, corner.dept, wtable);
    const fcv = cornerFactor(corner.iuse + 1, corner.rs, soilk, corner.wby2, corner.dept, wtable);
    const sbgAvg = sumur * (2 * (length - width) + 4 * fcs * width);
    // ATTEN (eq. 18), BS1!B50:B53
    const a1 = c.a3 + c.b3 * soilk + c.cc3 * depth;
    const a2 = c.e3 + c.f3 * soilk + c.g3 * depth;
    const a3 = rsi ** (c.h3 + c.i3 * overlap);
    const atten = a3 > 0 ? a1 + a2 / a3 : a1;
    const sbgVar = atten * (2 * (length - width) + 4 * width * fcv);
    // PHASE (eq. 19), BS1!B66
    const phase = c.a4 + c.b4 / rsi ** c.cc4;
    return { sumuo, sag, sumur, fcs, fcv, sbgAvg, atten, sbgVar, phase };
  }

  // Input!B33:B53 - the Moore ground-surface harmonic from the monthly dry bulbs and the HDD.
  function groundHarmonic(monthly, hdd) {
    let e = 0, f = 0, sum = 0;
    monthly.forEach((t, i) => {
      const w = (Math.PI / 6) * (i + 1 - 0.5);
      e += t * Math.sin(w);
      f += t * Math.cos(w);
      sum += t;
    });
    const amp0 = -Math.sqrt(e * e + f * f) / 6;
    const ph0 = Math.atan(e / f);
    // Not in the spreadsheet: the day of the year the same air harmonic is coldest (its maximum lies at
    // atan2(E, F) on the month angle pi/6 x (m - 0.5), a day angle 2 pi / 365 from January 1).
    const coldest = Math.atan2(e, f) + Math.PI;
    const twoPi = 2 * Math.PI;
    return {
      tempS: sum / 12 + 0.0009189 * hdd - 1.438,
      amps: -(amp0 + 0.00197 * hdd - 7.8747),
      phs: ph0 + 0.00002128 * hdd - 0.0756,
      coldestDay: (((coldest % twoPi) + twoPi) % twoPi) * (365 / twoPi),
    };
  }

  /**
   * The foundation's heat loss by BasementHLR.xls.
   * @param {object} p
   *   configuration  FoundationCC configuration number (BSMCFG.TXT describes each)
   *   length, width  outside dimensions, m (the larger is taken as the length, Input!E7:E8)
   *   height, depth  wall height and depth below grade, m
   *   soilk, wtable  soil conductivity W/mK, water-table depth m
   *   interior, exterior, slab   ADDED insulation, RSI (never exactly 0 for the configuration's own
   *                  insulation: BasementHLR.doc, "Use 0.01 if needed")
   *   overlap        m (BasementHLR Input!B22:B27; 0 unless the configuration has both)
   *   exposedPerimeter  m, 0 = the whole perimeter (Input!G7)
   *   windowArea, doorArea  in the above-grade wall, m2
   *   hdd, deepGround, monthly[12]  the station's weather
   *   heating: {month, room, design, slab}   slab 0 = no radiant floor
   *   cooling: {month, room, design}
   */
  function compute(p) {
    const c = config(p.configuration);
    const twin = config(c.iUnInsul > 0 ? c.iUnInsul : p.configuration);
    const g = {
      length: Math.max(p.length, p.width),
      width: Math.min(p.length, p.width),
      height: p.height,
      depth: p.depth,
      soilk: p.soilk,
      wtable: p.wtable,
      overlap: p.overlap || 0,
    };
    const ins = { interior: p.interior, exterior: p.exterior, slab: p.slab };
    const flag = inflag(c);
    const rsi1 = representativeRsi(flag, ins);
    const rsi2 = rsi1 > 1.5 ? rsi1 : 1.5;

    // BS1!B34:B40 and BS2!B34:B40 - each tab has its own corner column (its configuration's CCF) and
    // its own rs: the insulation (capped at 5) in BS1, the constant 0 in BS2 (BS2!B35).
    const corner = (ccf, rss) => {
      const icol = cornerColumn(ccf, g);
      return {
        iuse: 2 * ((icol === 98 ? 3 : icol) - 1) + 1,
        rs: icol === 98 ? 0 : rss,
        dept: Math.min(g.depth, 2),
        wby2: Math.min(g.width, 10) / 2,
      };
    };
    const set1 = shapeFactors(c, g, rsi2, true, corner(c.CCF, Math.min(rsi2, 5)));
    const set2 = shapeFactors(twin, g, 0.001, false, corner(twin.CCF, 0));
    const interpolate = rsi1 > 0.01 && rsi1 < 1.501;
    const denom = Math.exp(WRSI * rsi1);
    const pick = k => (interpolate ? set1[k] + (set2[k] - set1[k]) / denom : set1[k]);
    const out = { sag: pick("sag"), sbgAvg: pick("sbgAvg"), sbgVar: pick("sbgVar"), phase: pick("phase") };

    // Loads!B32:G45 - the monthly harmonic below-grade loss (W, the month's mean)
    const h = groundHarmonic(p.monthly, p.hdd);
    const omega = (2 * Math.PI) / 365;
    const ca1 = (out.sbgVar * h.amps) / omega;
    const ca2 = out.phase - Math.PI / 2 - h.phs;
    const fhl = [];
    let prev = Math.cos(ca2);
    let day = 0;
    DAYS.forEach(n => {
      day += n;
      const now = Math.cos(omega * day + ca2);
      fhl.push((ca1 * (prev - now)) / n);
      prev = now;
    });

    // Input!G7:L7, G11:K11
    const perimeter = 2 * (g.length + g.width);
    const exposed = p.exposedPerimeter > 0 ? p.exposedPerimeter : perimeter;
    const exposedFraction = Math.min(1, Math.max(exposed / perimeter, 0));
    const aboveGradeWall = (g.height - g.depth) * perimeter;
    const openingsFraction = (aboveGradeWall - (p.windowArea || 0) - (p.doorArea || 0)) / aboveGradeWall;

    // RadFloor - the radiant slab's share of the mean below-grade loss
    const wallRsi = c.iFndFlag4 > 0 ? STRUCTURE_RSI.woodWall : STRUCTURE_RSI.concreteWall;
    const floorRsi = c.iFndFlag5 > 0 ? STRUCTURE_RSI.woodFloor : STRUCTURE_RSI.concreteFloor;
    const uWalls = (g.height * perimeter) / (ins.interior + ins.exterior + wallRsi);
    const uFloor = (g.length * g.width) / (ins.slab + floorRsi);
    const radiantAlpha = p.heating.slab > 0 ? (out.sbgAvg * uFloor) / Math.max(uWalls + uFloor, 0.1) : 0;
    // RadFloor's own split of the below-grade loss between floor and walls (its Alpha3 / Alpha2)
    const floorShare = uFloor / Math.max(uWalls + uFloor, 0.1);

    // Loads!B49 and B54
    const H = p.heating, C = p.cooling;
    const heatingLoad =
      (out.sag * openingsFraction * (H.room - H.design) +
        fhl[H.month - 1] +
        out.sbgAvg * (H.room - p.deepGround) +
        radiantAlpha * (H.slab - p.deepGround)) *
      exposedFraction;
    const coolingLoad =
      (out.sag * (C.room - C.design) + fhl[C.month - 1] + out.sbgAvg * (C.room - p.deepGround)) * exposedFraction;

    return {
      configuration: c.name,
      inflag: flag,
      rsi1,
      rsi2,
      interpolated: interpolate,
      set1,
      set2,
      ...out,
      ground: h,
      fhl,
      ca1,
      ca2,
      omega,
      floorShare,
      exposedFraction,
      openingsFraction,
      heatingLoad,
      coolingLoad,
    };
  }

  /**
   * The foundation's heat loss over a heating season, kWh - OBJECTIVE's annual figure under BASESIMP
   * (Andy 2026-11-19). NOT the spreadsheet (BasementHLR gives a design hour and monthly means): the same
   * three terms, integrated over `days` days centred on the coldest day of the year (the Moore air
   * harmonic's minimum), the length OBJECTIVE's heating season already has (365 - Days Cooling):
   *   above grade   Sag x K11 x (room - outdoorMean) x days         (outdoorMean: S03 L.3.3)
   *   mean below    SbgAvg x (room - deepGround) x days
   *   harmonic      the integral of the spreadsheet's own rate Ca1 x omega x sin(omega t + Ca2) (W, t in
   *                 days from January 1; FHLmon is its monthly mean): Ca1 x (cos(omega t0 + Ca2) -
   *                 cos(omega t1 + Ca2)), exactly
   * all x the exposed fraction x 24 / 1000. The below-grade part splits floor : walls by floorShare
   * (RadFloor's U-weighted share); the above-grade part is the walls'.
   * @param r  a compute() result
   * @param s  { room, outdoorMean, deepGround, days }
   */
  function seasonLoss(r, s) {
    const t0 = r.ground.coldestDay - s.days / 2;
    const t1 = t0 + s.days;
    const k = r.exposedFraction * 24 / 1000;
    const above = r.sag * r.openingsFraction * (s.room - s.outdoorMean) * s.days * k;
    const mean = r.sbgAvg * (s.room - s.deepGround) * s.days * k;
    const harmonic = r.ca1 * (Math.cos(r.omega * t0 + r.ca2) - Math.cos(r.omega * t1 + r.ca2)) * k;
    const below = mean + harmonic;
    return {
      startDay: t0,
      days: s.days,
      above,
      mean,
      harmonic,
      total: above + below,
      slab: below * r.floorShare,
      walls: above + below * (1 - r.floorShare),
    };
  }

  window.TEUI.Basesimp = Object.freeze({ compute, seasonLoss, config, DAYS });
})();
