/**
 * Aim2.js - a house's air leakage at the design condition, by AIM-2, as CSA F280-12 requires.
 *
 * F280-12 Cl. 5.2.3: the envelope air-leakage rate for heating, LRairh (AC/H), is "the output from the
 * spreadsheet" AIM2.xls, and the heat loss due to air leakage is
 *     HLairb = LRairh x Vb / 3.6 x DTDh x 1.2                       (W)
 * (Cl. 6.2.6 likewise for cooling, from LRairc). AIM2.xls is NRCan's implementation of AIM-2 (Walker &
 * Wilson, U. of Alberta TR 71, 1990), the model HOT2000 has used since 1993: blower-door C and n from
 * ACH50 and ELA; stack and wind pressures at the design temperatures and the January / July wind;
 * leakage split ceiling / walls / floor by house type, storeys and foundation; flues; shielding and
 * terrain; balanced and unbalanced mechanical ventilation combined by the Kiel-Wilson rule.
 *
 * This file is AIM2.xls's AIM_2_Calcs tab, cell for cell (names are the workbook's); its selections are
 * src/core/Aim2Data.js (tools/f280/aim2_data.py). Where the workbook differs from the paper, the
 * WORKBOOK wins - the standard names it:
 *   - S_w = Sw_o x (1 - Y) + Sw_flue x 1.5 Y (the workbook notes the paper's "(1 + Y)" as a discrepancy)
 *   - the natural rate it reports is Ven_T - Q_unbal_total - Q_bal: the infiltration net of the
 *     mechanical flows (exhaust-only ventilation therefore LOWERS it)
 *   - P_s takes |T_in - T_out| / (273.15 + T_in) with RhoOut at the outdoor design temperature
 * Witness: test/aim2.test.cjs against numbers Excel computed from AIM2.xls.
 */
(function () {
  window.TEUI = window.TEUI || {};

  const RHO = 101.325 / (0.287055 * 293.15); // AIM_2_Calcs B2
  const BETA = 10000 / (0.611 * Math.sqrt(2 / RHO)); // B4
  const CON2 = 11572.94 * Math.sqrt(1.2040973); // B9
  const RHO_AIR = 1.177; // B23, kg/m3
  const CP_AIR = 1005; // B24, J/kg.K
  const RHO_CON = 352.981; // B25
  const CD = 0.5; // B20
  const P_REF = 4; // B21

  function data() {
    const d = window.TEUI.Aim2Data;
    if (!d) throw new Error("Aim2: Aim2Data.js is not loaded");
    return d;
  }

  /**
   * @param {object} p
   *   indoorHeating, indoorCooling      C (AIM_2_Selection B2, B3)
   *   designHeating, designCooling      C, outdoor design dry bulbs
   *   janWind, julWind                  km/h (F280's weather table)
   *   stationTerrain, siteTerrain       1-8, Aim2Data.terrain (B301, B315)
   *   anemometerHeight                  m (C393; 10)
   *   wallShielding, flueShielding      1-5, Aim2Data.shielding (B320, B330)
   *   buildingType, storeys, foundation names in Aim2Data (B338, B345, B355)
   *   tightness                         a prescribed type's name (Aim2Data.tightness), or "Custom"
   *   ach50, ela, elaPa                 Custom only: blower-door ACH @ 50 Pa, ELA (cm2) at elaPa (4 or 10)
   *   volume                            house volume, m3 (B407)
   *   ceilingHeight                     above-grade height of the highest ceiling, m (B409)
   *   flues                             up to 4 diameters, mm (A401:D401)
   *   supplyLs, exhaustLs               mechanical ventilation, L/s (C395, C396)
   *   furnaceFlueLs                     IqFon, L/s (C398; 0 for sealed combustion)
   */
  function compute(p) {
    const d = data();
    // the air-tightness selection (AIM_2_Selection D385, E385; AIM_2_Calcs E12:E15)
    let ach, ela, paEla;
    if (p.tightness === "Custom") {
      ach = p.ach50;
      ela = p.ela;
      paEla = p.elaPa || 10;
    } else {
      const t = d.tightness.find(x => x.name === p.tightness);
      if (!t) throw new Error(`Aim2: no air-tightness type "${p.tightness}"`);
      ach = t.ach50;
      ela = CON2 * t.cnorm * p.volume * 10 ** (t.n - 0.5);
      paEla = 10;
    }
    // blower-door C and n (B5:B7)
    const alphaC = BETA / (3600 * Math.sqrt(paEla));
    const n = Math.log10((alphaC * ach * p.volume) / ela) / Math.log10(50 / paEla);
    const c50 = ela / (BETA * paEla ** (n - 0.5));
    // flues (B22, B28:B32)
    const flueA = (Math.PI * (p.flues || []).reduce((s, dmm) => s + dmm * dmm, 0)) / 4000000;
    const cFlue = (CD * flueA * Math.sqrt(2 / RHO_AIR)) / P_REF ** (n - 0.5);
    const cTotal = c50 + cFlue;
    const y = cFlue / cTotal;
    const code = `${d.buildingType[p.buildingType]}${d.storeys[p.storeys]}${d.foundation[p.foundation]}`;
    const leak = d.leakage[code];
    if (!leak) throw new Error(`Aim2: no leakage distribution for ${p.buildingType} / ${p.storeys} / ${p.foundation}`);
    const rs = (leak.ceiling + leak.floor) * (1 - y);
    const x = (leak.ceiling - leak.floor) * (1 - y);
    // terrain and wind (B33)
    const zMet = d.terrain[p.stationTerrain - 1]?.z0;
    const zSite = d.terrain[p.siteTerrain - 1]?.z0;
    if (zMet === undefined || zSite === undefined) throw new Error("Aim2: terrain index out of 1-8");
    const H = p.ceilingHeight;
    const hMet = p.anemometerHeight;
    const cT = (Math.log10(60 / zMet) * Math.log10(H / zSite)) / (Math.log10(hMet / zMet) * Math.log10(60 / zSite));
    const cCon = (cTotal * 3600) / p.volume; // B34
    const swO = d.shielding[p.wallShielding - 1]?.sw;
    const swFlue = d.shielding[p.flueShielding - 1]?.sw;
    if (swO === undefined || swFlue === undefined) throw new Error("Aim2: shielding index out of 1-5");
    const sW = swO * (1 - y) + swFlue * (1.5 * y); // B35
    // stack and wind factors (B37:B49)
    const S = 0.5 * (x + rs + 2 * y);
    const M = Math.min((x + (2 * n + 1) * y) ** 2 / (2 - rs), 1);
    const betaF = (H + 1.5) / H;
    const xC = rs + (2 * (1 - rs - y)) / (n + 1) - 2 * y * (betaF - 1) ** n;
    const F = n * y * (betaF - 1) ** ((3 * n - 1) / 3) * (1 - (3 * (xC - x) ** 2 * rs ** (1 - n)) / (2 * (betaF + 1)));
    const fsFlue = ((1 + n * rs) / (n + 1)) * (0.5 - 0.5 * M ** 1.25) ** (n + 1) + F;
    const fwFlue = 0.19 * (2 - n) * (1 - ((x + rs) / 2) ** (1.5 - y)) - 0.25 * y * (S - 2 * y * S ** 4);
    const fsNoFlue = ((1 + n * rs) / (n + 1)) * (0.5 - 0.5 * (x ** 2 / (2 - rs)) ** 1.25) ** (n + 1);
    const fwNoFlue = 0.19 * (2 - n) * (1 - ((x + rs) / 2) ** 1.5);
    const fs = flueA > 0 ? fsFlue : fsNoFlue;
    const fw = flueA > 0 ? fwFlue : fwNoFlue;
    // mechanical ventilation, AC/H (AIM_2_Selection E388:E389, E398; B51:B52)
    const supplyAch = ((p.supplyLs || 0) * 3.6) / p.volume;
    const exhaustAch = ((p.exhaustLs || 0) * 3.6) / p.volume;
    const qBal = Math.min(exhaustAch, supplyAch);
    const qUnbal = Math.abs(exhaustAch - supplyAch);
    const iqFonAch = ((p.furnaceFlueLs || 0) * 3.6) / p.volume;

    // one season (B58:B72 heating, G58:G72 cooling)
    const season = (indoor, outdoor, wind, deltaT) => {
      const uE = (cT * wind) / 3.6;
      const rhoOut = RHO_CON / (273.15 + outdoor);
      const pW = 0.5 * rhoOut * (uE * sW) ** 2;
      const pS = 9.8 * rhoOut * H * (Math.abs(deltaT) / (273.15 + indoor));
      const qW = cCon * fw * pW ** n;
      const qS = cCon * fs * pS ** n;
      const qInf = (qS ** (1 / n) + qW ** (1 / n) - (1 / 3) * (qS * qW) ** (0.5 / n)) ** n;
      const qUnbalTotal = qUnbal + iqFonAch;
      const venT = qBal + Math.sqrt(qUnbalTotal * qUnbalTotal + qInf ** 2);
      const natural = venT - qUnbalTotal - qBal;
      const flow = (natural * p.volume) / 3600;
      return { uE, rhoOut, pW, pS, qW, qS, qInf, venT, natural, flow, heatLoss: flow * CP_AIR * (RHO_AIR * deltaT) };
    };
    const dTh = Math.abs(p.designHeating - p.indoorHeating); // AIM_2_Selection C298
    const dTc = p.indoorCooling - p.designCooling; // D298 (negative in summer)
    const heating = season(p.indoorHeating, p.designHeating, p.janWind, dTh);
    const cooling = season(p.indoorCooling, p.designCooling, p.julWind, dTc);
    // forced ventilation (B75:G76): the larger of supply and exhaust
    const venRate = Math.max(p.supplyLs || 0, p.exhaustLs || 0) / 1000;
    const venHeating = venRate * CP_AIR * Math.abs(RHO_AIR * dTh);
    const venCooling = venRate * CP_AIR * (RHO_AIR * dTc);
    return {
      n, c50, ela, ach, alphaC, flueA, cFlue, cTotal, y, rs, x, cT, cCon, sW, S, M, betaF, xC, F, fs, fw,
      qBal, qUnbal, leakage: leak, heating, cooling,
      ventilationHeating: venHeating, ventilationCooling: venCooling,
      totalHeating: heating.heatLoss + venHeating, totalCooling: cooling.heatLoss + venCooling,
    };
  }

  /**
   * The heating season's AVERAGE natural rate by AIM-2, AC/H - OBJECTIVE's annual figure under AIM-2
   * (Andy 2026-11-19: "when you get to a fork in the road, take it"). NOT AIM2.xls (a design hour): the
   * same model run once per month at that month's mean outdoor temperature and mean wind (the climate
   * station's), the indoor at the ENERGY set-point, and the twelve rates averaged with the month's
   * heating degree days as weights - so that rate x volume x HDD stands where OBJECTIVE's N-factor rate
   * (NRL50 x area / N) stood. HOT2000 runs AIM-2 the same way, through the season rather than at one hour.
   * @param p        compute()'s inputs (the house, site and ventilation)
   * @param indoor   the energy set-point, C
   * @param tMean    12 monthly mean outdoor temperatures, C
   * @param windMs   12 monthly mean wind speeds, m/s (at the station's anemometer)
   * @param hdd      12 monthly heating degree days (the weights)
   */
  function seasonalRate(p, indoor, tMean, windMs, hdd) {
    let sumW = 0, sumWR = 0;
    const monthly = tMean.map((t, i) => {
      const r = compute({ ...p, indoorHeating: indoor, designHeating: t, janWind: windMs[i] * 3.6 });
      sumW += hdd[i];
      sumWR += hdd[i] * r.heating.natural;
      return r.heating.natural;
    });
    if (!(sumW > 0)) throw new Error("Aim2: no heating degree days to weight the months");
    return { monthly, rate: sumWR / sumW };
  }

  /**
   * The ELA (cm2, at pa Pa) of a house of ACH50 and volume at flow exponent n - AIM2.xls's own relation
   * (AIM_2_Calcs B5:B6, n = log(Alpha_C x ACH x V / ELA) / log(50 / Pa)) solved for the ELA.
   */
  function elaFromAch50(ach50, volume, n, pa = 10) {
    const alphaC = BETA / (3600 * Math.sqrt(pa));
    return (alphaC * ach50 * volume) / (50 / pa) ** n;
  }

  /**
   * A flow exponent for a house known only by its ACH50: the n of AIM2.xls's prescribed air-tightness type
   * nearest in ACH50 (AIM_2_Calcs A12:D15: 10.35 / 0.725, 4.55 / 0.698, 3.57 / 0.7125, 1.5 / 0.7028).
   */
  function typicalN(ach50) {
    const t = data().tightness.reduce((best, x) => (Math.abs(x.ach50 - ach50) < Math.abs(best.ach50 - ach50) ? x : best));
    return { n: t.n, type: t.name };
  }

  window.TEUI.Aim2 = Object.freeze({ compute, seasonalRate, elaFromAch50, typicalN });
})();
