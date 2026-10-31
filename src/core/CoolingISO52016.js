/**
 * CoolingISO52016.js - the monthly cooling need, ISO 52016-1:2017 monthly
 * method, on the location's climate station (ClimateStation.js).
 *
 * Source, until the ISO texts arrive: the EPB Center's reference workbook
 * Demo_ISO_52016-1_v2.92_Soff_Ath_HECO_2023-10-04.xlsm, sheet Calc_C_m (each
 * column labelled with its 52016-1 clause). Per month m, t_m hours:
 *
 *   Q_C,ht = Q_C,tr + Q_C,ve                                     (6.6.4.4)
 *     Q_C,tr = [H_tr (θset - θe,m) + H_gr (θset - θe,year)] t_m   (6.6.5.1;
 *              ground against the ANNUAL mean outdoor temperature, col. I)
 *     Q_C,ve = H_ve (θset - θe,m) t_m                            (6.6.6.1)
 *   Q_C,gn = Q_C,int + Q_C,sol - Q_r                             (6.6.4.4, 6.6.7, 6.6.8)
 *   γ = Q_C,gn / Q_C,ht;  a = a0 + τ/τ0;  τ = C_m A / (3600 ΣH)   (6.6.10.3, 6.6.10.4, 6.6.11.4)
 *   η_C,ls = (1 - γ^-a) / (1 - γ^-(a+1)),  a/(a+1) at γ = 1,  1 at γ < 0   (col. T)
 *   Q_C,nd = Q_C,gn - η_C,ls Q_C,ht                              (6.6.4.3, col. U)
 *
 * What this app adds or chooses, each ruled by Andy 2026-10-30
 * (ABCD-OBJECTIVE-PRO §4.1):
 *  - FREE COOLING is the summer boost's EXTRA flow, (boost - 1) x the
 *    ventilation rate, counted only on the hours the outdoor air is cooler
 *    than the setpoint AND drier than the indoor air (ClimateStation.
 *    freeCooling's K.h). It enters Q_C,ve, so the need caps it through η -
 *    the workbook's φV;cool, but hourly-gated where ISO has no weather test.
 *    With boost "None" it is zero; the ordinary ventilation still cools at
 *    the monthly mean through H_ve, as ISO does.
 *  - HEAT RECOVERY in cooling only when the outdoor air is warmer than the
 *    setpoint (the HRV bypasses its core otherwise; Andy's ruling was by the
 *    month, applied here by the HOUR since the hourly year is loaded - a
 *    month's mean below the setpoint still has hot afternoons). Summed over
 *    the hours, the month's ventilation loss is exactly
 *      H_ve [(θset - θe,m) t_m + ε Σ_hot (θe - θset)],
 *    and τ takes H_ve's time average, H_ve (1 - ε hot hours / t_m). The
 *    boost flow always bypasses.
 *  - THERMAL MASS from Section 5's typology (CM_PER_AREA).
 *  - Continuous cooling: a_red = 1 (the workbook's 0.8 is an office's weekend
 *    setback).
 *
 * The need is then ATTRIBUTED to the rows the app already shows (the Sankey
 * keeps its shape): in each month with a need, every term that brings heat
 * IN - internal gains, solar through each glazing row, solar on the opaque
 * envelope, and any transmission / ventilation / leakage term whose outdoor
 * side is warmer (η x its inflow) - takes the need in proportion to its
 * inflow. The rows sum to the need exactly; a term carrying heat OUT takes
 * none. Free cooling and recovery are the differences between three runs:
 * none, recovery only, both.
 *
 * LATENT (ABCD-OBJECTIVE-PRO §4.1 step 7) is CSA F280-12 Annex B's direct
 * method (B.6.3.1): the design humidity difference DHD = Ho - Hi (never < 0),
 * 3 W per L/s per g/kg on the air leakage and the ventilation, 67 W per
 * occupant. Two readings of it:
 *  - ANNUAL (the energy): per month, Ho = the station's mean humidity ratio
 *    and Hi = the indoor air at the setpoint and i_59's RH (the same indoor
 *    state free cooling's "drier" test reads; 24 °C at 50 % is F280's own
 *    9.3 g/kg), over the share of the month that is cooling (f_C) - the
 *    coil removes moisture only while it runs. Added to the rows it belongs
 *    to: ventilation, leakage, internal (the occupants'). Free cooling's
 *    extra air enters only on hours drier than inside, so it adds none (it
 *    would remove some; not credited). The HRV moves no moisture.
 *  - DESIGN (the sizing, designLatent): F280's own figures - Ho from the
 *    July 2.5 % dry bulb and its coincident wet bulb at standard pressure
 *    (as its Table 5), Hi = 9.3 g/kg, every occupant home.
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  /** W/K per L/s: ρc of air, the app's own figure (VentilationNodes' 1.21 kJ/(m³K)). */
  const RHO_C = 1.21;

  // The loss-utilisation reference parameters, informative Table B.35; the
  // workbook's Method_input D218-D219.
  const A_C0 = 1;
  const TAU_C0 = 15; // h
  // ... and for the heating need's gain utilisation (Method_input D216-D217),
  // used here only to split each month between heating and cooling.
  const A_H0 = 1;
  const TAU_H0 = 15; // h

  // Opaque solar and sky radiation, the workbook's Input_0 rows 36, 42-44 and
  // Method_input D208: absorption 0.6, h_ce 20 and h_re 4.14 W/(m²K), sky
  // view 0.5 for a wall (1 for a roof: (1 + cos tilt)/2), and the outdoor air
  // 11 K warmer than the sky.
  const A_SOL = 0.6;
  const H_CE = 20;
  const H_RE = 4.14;
  const F_SKY_VERTICAL = 0.5;
  const F_SKY_HORIZONTAL = 1;
  const D_THETA_SKY = 11; // K

  // CSA F280-12 Annex B.6.3.1, the direct latent method: W per (L/s · g/kg)
  // (ρ h_fg of air, 1.2 kg/m³ x 2501 kJ/kg / 1000), W per occupant, and the
  // indoor humidity ratio at design, g/kg.
  const LATENT_W_PER_LS_GKG = 3;
  const LATENT_W_PER_PERSON = 67;
  const F280_INDOOR_W = 9.3;
  // ... and the pressure its Table 5 OHR is computed at: standard sea level
  // (from C-2's design dry and wet bulbs, within 0.6 g/kg of the Table at the
  // six cities witnessed, five rounding to it; at each station's own pressure
  // Calgary, 1 045 m, is 1.2 off).
  const F280_PRESSURE = 101325; // Pa

  /**
   * C_m per m² of floor, J/(m²K), from Section 5's typology - ISO 52016-1's
   * classes (Andy 2026-10-30: steel "should never get the benefit of being
   * considered 'heavy'").
   */
  const CM_PER_AREA = {
    "Pt.9 Res. Stick Frame": 110000, // Light (HOT2000's default too)
    "Pt.9 Small Mass Timber": 165000, // Medium
    "Pt.3 Mass Timber": 165000,
    "Pt.3 Steel": 165000,
    "Pt.3 Office": 165000,
    "Pt.3 Concrete": 260000, // Heavy
  };
  const CM_DEFAULT = 165000; // Medium; "Modelled Value" and anything unknown

  const SOLAR_KEY = {
    North: "sol_N",
    NorthEast: "sol_NE",
    East: "sol_E",
    SouthEast: "sol_SE",
    South: "sol_S",
    SouthWest: "sol_SW",
    West: "sol_W",
    NorthWest: "sol_NW",
    Skylight: "sol_H",
    Horizontal: "sol_H",
  };
  const VERTICALS = [
    "sol_N",
    "sol_NE",
    "sol_E",
    "sol_SE",
    "sol_S",
    "sol_SW",
    "sol_W",
    "sol_NW",
  ];

  function cmPerArea(typology) {
    return CM_PER_AREA[typology] || CM_DEFAULT;
  }

  /** Month m's irradiation on a surface, kWh/m²; "Average" = the mean of the 8 verticals. */
  function irradiation(months, orientation, m) {
    const key = SOLAR_KEY[orientation];
    if (key) return months[key][m];
    return VERTICALS.reduce((s, k) => s + months[k][m], 0) / VERTICALS.length;
  }

  /** η_C,ls, the workbook's col. T. */
  function lossUtilisation(gamma, a) {
    if (!Number.isFinite(gamma) || gamma < 0) return 1;
    if (gamma === 0) return 0;
    if (gamma === 1) return a / (a + 1);
    return (1 - gamma ** -a) / (1 - gamma ** (-a - 1));
  }

  /** η_H,gn, the workbook's Calc_H_m col. AV (1/γ at γ < 0: the need is then 0). */
  function gainUtilisation(gamma, a) {
    if (gamma === 0 || !Number.isFinite(gamma)) return 1;
    if (gamma === 1) return a / (a + 1);
    if (gamma > 0) return (1 - gamma ** a) / (1 - gamma ** (a + 1));
    return 1 / gamma;
  }

  /** A month's HEATING balance, Calc_H_m cols. L, AT-AW: Q_H,nd = Q_H,ht - η_H,gn Q_H,gn. */
  function heatingBalance({ qht, qgn, cmA, sumH }) {
    const tau = sumH > 0 ? cmA / 3600 / sumH : 0;
    const a = A_H0 + tau / TAU_H0;
    const gamma = qht !== 0 ? qgn / qht : Infinity;
    const eta = gainUtilisation(gamma, a);
    return { gamma, a, tau, eta, need: Math.max(0, qht - eta * qgn) };
  }

  /**
   * One month's balance from its terms (kWh) and conductances (W/K):
   *   {qht, qgn, cmA (J/K), sumH (W/K)} -> {gamma, a, tau, eta, need}.
   */
  function monthBalance({ qht, qgn, cmA, sumH }) {
    const tau = sumH > 0 ? cmA / 3600 / sumH : 0;
    const a = A_C0 + tau / TAU_C0;
    const gamma = qht !== 0 ? qgn / qht : qgn > 0 ? Infinity : 0;
    const eta = lossUtilisation(gamma, a);
    return { gamma, a, tau, eta, need: Math.max(0, qgn - eta * qht) };
  }

  /**
   * A building's monthly cooling need on a station.
   *
   * b = {
   *   setpoint, heatingSetpoint (°C), floorArea (m²), typology,
   *   air:    [{key, A, U, tilt: "roof"|"wall"|"floor", orientation?, opaque}],  S11 rows 85-93
   *   ground: [{key, A, U}],                                                    S11 rows 94-95
   *   tbPercent,                                                                S11 thermal bridge %
   *   glazing:[{key, A, shgc, summerShading (%), orientation}],                 S10 rows 73-78
   *   ventLs, boost (≥ 1), hrvPercent, leakLs,
   *   internalKWh (annual)
   * }
   * fc = ClimateStation.freeCooling(station, setpoint, indoorRH) -
   *      {kh, hours, hotKh, hotHours}, 12 each
   * opts = {freeCooling, recovery}
   */
  /** Month m's gains (kWh) and sky radiation (kWh): the same for heating and cooling. */
  function monthGains(b, months, m, t) {
    const gain = { internal: (b.internalKWh * DAYS[m]) / 365 };
    for (const g of b.glazing) {
      gain[g.key] =
        g.A *
        g.shgc *
        (1 - g.summerShading / 100) *
        irradiation(months, g.orientation, m);
    }
    let sky = 0;
    for (const e of b.air) {
      const rse = e.U / (H_CE + H_RE); // R_se x U: the outer surface's share
      const fSky =
        e.tilt === "roof"
          ? F_SKY_HORIZONTAL
          : e.tilt === "wall"
            ? F_SKY_VERTICAL
            : 0;
      sky += (rse * e.A * H_RE * fSky * D_THETA_SKY * t) / 1000;
      if (e.opaque && e.tilt !== "floor") {
        const orient =
          e.tilt === "roof" ? "Horizontal" : e.orientation || "Average";
        gain[`opaque:${e.key}`] =
          A_SOL * rse * e.A * irradiation(months, orient, m);
      }
    }
    return { gain, sky };
  }

  function yearMean(months) {
    return (
      months.t_mean.reduce((s, t, m) => s + t * DAYS[m], 0) /
      DAYS.reduce((s, d) => s + d, 0)
    );
  }

  /**
   * The monthly HEATING need at b.heatingSetpoint, HRV recovering throughout
   * - not the app's heating (that stays NRC's, ruled 2026-10-30): only the
   * share of each month that is cooling, f_C = Q_C,nd / (Q_C,nd + Q_H,nd)
   * (the workbook's Calc_C_m col. X), which turns months into days of
   * active cooling.
   */
  function heatingNeeds(b, months) {
    const tYear = yearMean(months);
    const hAir =
      b.air.reduce((s, e) => s + e.A * e.U, 0) * (1 + b.tbPercent / 100);
    const hGround =
      b.ground.reduce((s, e) => s + e.A * e.U, 0) * (1 + b.tbPercent / 100);
    const hAirflow = RHO_C * (b.ventLs * (1 - b.hrvPercent / 100) + b.leakLs);
    const cmA = cmPerArea(b.typology) * b.floorArea;
    return DAYS.map((d, m) => {
      const t = d * 24;
      const dAir = b.heatingSetpoint - months.t_mean[m];
      const qht =
        (((hAir + hAirflow) * dAir + hGround * (b.heatingSetpoint - tYear)) *
          t) /
        1000;
      const { gain, sky } = monthGains(b, months, m, t);
      const qgn = Object.values(gain).reduce((s, v) => s + v, 0) - sky;
      return heatingBalance({ qht, qgn, cmA, sumH: hAir + hGround + hAirflow })
        .need;
    });
  }

  function run(b, months, fc, opts) {
    const tYear = yearMean(months);
    const hAir = b.air.reduce((s, e) => s + e.A * e.U, 0);
    const hGround = b.ground.reduce((s, e) => s + e.A * e.U, 0);
    const tb = b.tbPercent / 100;
    const cmA = cmPerArea(b.typology) * b.floorArea;
    const extraLs = Math.max(0, b.boost - 1) * b.ventLs;
    const out = [];
    for (let m = 0; m < 12; m++) {
      const t = DAYS[m] * 24;
      const dAir = b.setpoint - months.t_mean[m];
      const dGround = b.setpoint - tYear;
      const eps = opts.recovery ? b.hrvPercent / 100 : 0;
      const hVent = RHO_C * b.ventLs * (1 - (eps * fc.hotHours[m]) / t); // time average
      const hLeak = RHO_C * b.leakLs;
      // losses, kWh (negative = heat in)
      const loss = {};
      for (const e of b.air) loss[e.key] = (e.A * e.U * dAir * t) / 1000;
      for (const e of b.ground) loss[e.key] = (e.A * e.U * dGround * t) / 1000;
      loss.tb = (tb * (hAir * dAir + hGround * dGround) * t) / 1000;
      loss.vent = (RHO_C * b.ventLs * (dAir * t + eps * fc.hotKh[m])) / 1000;
      loss.leak = (hLeak * dAir * t) / 1000;
      const fcKWh = opts.freeCooling ? (RHO_C * extraLs * fc.kh[m]) / 1000 : 0;
      loss.freeCooling = fcKWh;
      const { gain, sky } = monthGains(b, months, m, t);
      const qht = Object.values(loss).reduce((s, v) => s + v, 0);
      const qgn = Object.values(gain).reduce((s, v) => s + v, 0) - sky;
      const hFc = (RHO_C * extraLs * (opts.freeCooling ? fc.hours[m] : 0)) / t;
      const sumH = hAir + hGround + tb * (hAir + hGround) + hVent + hLeak + hFc;
      const bal = monthBalance({ qht, qgn, cmA, sumH });
      out.push({ month: m, loss, gain, sky, qht, qgn, ...bal });
    }
    return out;
  }

  /**
   * Each heat-in term's share of the need, summed over the year:
   * {key: kWh}. Opaque solar is credited to its element's key.
   */
  function attribute(monthsOut) {
    const rows = {};
    for (const mo of monthsOut) {
      if (mo.need <= 0) continue;
      const inflow = {};
      for (const [k, v] of Object.entries(mo.gain)) {
        const key = k.startsWith("opaque:") ? k.slice(7) : k;
        inflow[key] = (inflow[key] || 0) + Math.max(0, v);
      }
      for (const [k, v] of Object.entries(mo.loss)) {
        if (v < 0) inflow[k] = (inflow[k] || 0) + mo.eta * -v;
      }
      const total = Object.values(inflow).reduce((s, v) => s + v, 0);
      if (total <= 0) continue;
      for (const [k, v] of Object.entries(inflow)) {
        rows[k] = (rows[k] || 0) + (mo.need * v) / total;
      }
    }
    return rows;
  }

  /**
   * The annual latent load, kWh, F280 Annex B per month (header): DHD_m =
   * max(0, w̄_out,m - wIn) on the leakage and ventilation, the occupants'
   * 67 W over their share of the hours, each month weighted by f_C.
   *   -> {vent, leak, people, total, months: [{dhd, vent, leak, people}]}
   */
  function latentLoad(b, months, wIn, fC) {
    const occupiedShare = Math.min(1, (b.occupiedHours || 0) / 8760);
    const out = { vent: 0, leak: 0, people: 0, total: 0, months: [] };
    for (let m = 0; m < 12; m++) {
      const t = DAYS[m] * 24 * fC[m]; // the month's cooling hours
      const dhd = Math.max(0, months.w_mean[m] - wIn);
      const mo = {
        dhd,
        vent: (LATENT_W_PER_LS_GKG * b.ventLs * dhd * t) / 1000,
        leak: (LATENT_W_PER_LS_GKG * b.leakLs * dhd * t) / 1000,
        people:
          (LATENT_W_PER_PERSON * (b.occupants || 0) * occupiedShare * t) / 1000,
      };
      out.vent += mo.vent;
      out.leak += mo.leak;
      out.people += mo.people;
      out.months.push(mo);
    }
    out.total = out.vent + out.leak + out.people;
    return out;
  }

  /**
   * The design latent gain, W - F280 Annex B.6.3.1 as written: DHD = ho -
   * 9.3 g/kg (never < 0), ho the outdoor humidity ratio at the July 2.5 %
   * dry bulb and its coincident wet bulb, g/kg.
   */
  function designLatent({ occupants, ventLs, leakLs, ho }) {
    const dhd = Math.max(0, ho - F280_INDOOR_W);
    return (
      LATENT_W_PER_PERSON * occupants +
      LATENT_W_PER_LS_GKG * (leakLs + ventLs) * dhd
    );
  }

  /**
   * The year: the three runs and what the app's ids read.
   *   sensible      Σ need, no free cooling, no recovery
   *   latent        latentLoad, the same in every run (free cooling's air
   *                 is drier than inside; the HRV moves no moisture)
   *   unmitigated   sensible + latent                         (d_129)
   *   recovered     the recovery's saving                    (d_123)
   *   freeCooling   the free cooling's saving, after recovery (h_124)
   *   freeCoolingPotential  Σ the extra flow's K.h credit, uncapped
   *   mitigated     Σ need with both, + latent                (m_129)
   *   rowsSensible  the sensible need by term (attribute)
   *   rows          rowsSensible + the latent on vent, leak and internal;
   *                 they sum to unmitigated
   *   coolingDays   Σ days x f_C, f_C = Q_C,nd / (Q_C,nd + Q_H,nd) on the
   *                 mitigated run (m_124)
   */
  function annual(b, months, fc) {
    const none = run(b, months, fc, { freeCooling: false, recovery: false });
    const hr = run(b, months, fc, { freeCooling: false, recovery: true });
    const both = run(b, months, fc, { freeCooling: true, recovery: true });
    const sum = r => r.reduce((s, mo) => s + mo.need, 0);
    const extraLs = Math.max(0, b.boost - 1) * b.ventLs;
    const heating = heatingNeeds(b, months);
    const fC = both.map((mo, m) =>
      mo.need > 0 ? mo.need / (mo.need + heating[m]) : 0
    );
    const latent = latentLoad(b, months, fc.wIn, fC);
    const rowsSensible = attribute(none);
    const rows = { ...rowsSensible };
    for (const [row, kWh] of [
      ["vent", latent.vent],
      ["leak", latent.leak],
      ["internal", latent.people],
    ]) {
      if (kWh > 0) rows[row] = (rows[row] || 0) + kWh;
    }
    return {
      sensible: sum(none),
      latent,
      unmitigated: sum(none) + latent.total,
      recovered: sum(none) - sum(hr),
      freeCooling: sum(hr) - sum(both),
      freeCoolingPotential:
        (RHO_C * extraLs * fc.kh.reduce((s, v) => s + v, 0)) / 1000,
      mitigated: sum(both) + latent.total,
      rowsSensible,
      rows,
      coolingDays: fC.reduce((s, f, m) => s + f * DAYS[m], 0),
      months: { none, hr, both, heating, fC },
    };
  }

  window.TEUI.CoolingISO52016 = {
    DAYS,
    CM_PER_AREA,
    cmPerArea,
    irradiation,
    lossUtilisation,
    gainUtilisation,
    monthBalance,
    heatingBalance,
    heatingNeeds,
    run,
    attribute,
    latentLoad,
    designLatent,
    F280_INDOOR_W,
    F280_PRESSURE,
    annual,
  };
})();
