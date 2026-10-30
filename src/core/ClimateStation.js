/**
 * ClimateStation.js - a location's climate station: its monthly table and its
 * hourly year, fetched on demand, plus the hourly free-cooling count.
 *
 * Files (written by tools/climate/build_station_files.py):
 *   src/core/ClimateStations.js     C-2 location -> station (loaded with the page)
 *   climate/stations/<id>.json      the monthly table (T, daily max/min, dew
 *                                   point, humidity ratio, RH, solar on 9
 *                                   surfaces, HDD18) - CWEC 2020 by NBC Note
 *                                   A-9.36.6.5.(1), else NASA POWER
 *   climate/stations/<id>.bin       one hourly year: Int16 LE dry bulb x 10,
 *                                   then humidity ratio x 100 (g/kg), 8760 each
 *
 * Free cooling (Andy 2026-10-29/30: "only when it is cooler AND drier"): an
 * hour counts when the outdoor air is BOTH cooler and drier than the indoor
 * state - dry bulb below the cooling setpoint AND humidity ratio below the
 * indoor one (the setpoint at the indoor RH, i_59). Cooler-and-drier implies
 * a lower enthalpy, so the test is stricter than ASHRAE 90.1's differential-
 * enthalpy economiser. Counting it on the hourly year, rather than on a
 * fixed evening window of monthly means, drops the muggy hours wherever in
 * the day they fall. The month's credit is the sum of (setpoint - outdoor)
 * over those hours, in K.h: multiplied by the extra airflow's conductance it
 * is the heat the extra ventilation can carry out, which the ISO 52016-1
 * monthly balance then caps by the need.
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  const HOURS = 8760;
  const DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const MONTH_OF_HOUR = new Uint8Array(HOURS);
  {
    let h = 0;
    DAYS.forEach((d, m) => {
      MONTH_OF_HOUR.fill(m, h, h + d * 24);
      h += d * 24;
    });
  }

  /** Saturation vapour pressure over water, Pa (Magnus - CoolingNodes.js's coefficients). */
  function pSat(t) {
    return 610.94 * Math.exp((17.625 * t) / (t + 243.04));
  }

  /** Station pressure from elevation, Pa (hypsometric, 8.4 km scale height). */
  function pressureAt(elevM) {
    return 101325 * Math.exp(-(elevM || 0) / 8400);
  }

  /** Humidity ratio, g water / kg dry air, of air at t (C) and rh (%) at pressure p (Pa). */
  function humidityRatio(t, rhPct, p) {
    const pv = (rhPct / 100) * pSat(t);
    return (1000 * 0.622 * pv) / (p - pv);
  }

  const cache = new Map();
  const pending = new Map();

  function stationFor(province, city) {
    const byProv = (window.TEUI.ClimateStations || {})[province];
    const entry = byProv && byProv[city];
    return entry ? entry.station : null;
  }

  function decode(buffer) {
    const view = new DataView(buffer);
    const t = new Float32Array(HOURS);
    const w = new Float32Array(HOURS);
    for (let k = 0; k < HOURS; k++) {
      t[k] = view.getInt16(2 * k, true) / 10;
      w[k] = view.getInt16(2 * (HOURS + k), true) / 100;
    }
    return { t, w };
  }

  /**
   * Load a station (cached). `read(path, kind)` defaults to fetch relative to
   * the page; kind is "json" or "buffer". Resolves to {meta, months, hourly}.
   */
  function load(id, read) {
    if (cache.has(id)) return Promise.resolve(cache.get(id));
    if (pending.has(id)) return pending.get(id);
    const reader =
      read ||
      ((path, kind) =>
        fetch(path).then(r => {
          if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
          return kind === "json" ? r.json() : r.arrayBuffer();
        }));
    const base = `climate/stations/${id}`;
    const p = Promise.all([
      reader(`${base}.json`, "json"),
      reader(`${base}.bin`, "buffer"),
    ]).then(([meta, buffer]) => {
      const station = { id, meta, months: meta.months, hourly: decode(buffer) };
      cache.set(id, station);
      pending.delete(id);
      return station;
    });
    pending.set(id, p);
    return p;
  }

  function get(id) {
    return cache.get(id) || null;
  }

  /**
   * Hours per month the outdoor air is cooler AND drier than the indoor state,
   * and the month's sum of (setpoint - outdoor) over them, K.h.
   */
  function freeCooling(station, setpointC, indoorRHPct) {
    const wIn = humidityRatio(
      setpointC,
      indoorRHPct,
      pressureAt(station.meta.elev)
    );
    const hours = new Array(12).fill(0);
    const kh = new Array(12).fill(0);
    const { t, w } = station.hourly;
    for (let k = 0; k < HOURS; k++) {
      if (t[k] < setpointC && w[k] < wIn) {
        const m = MONTH_OF_HOUR[k];
        hours[m] += 1;
        kh[m] += setpointC - t[k];
      }
    }
    return { hours, kh, wIn };
  }

  window.TEUI.ClimateStation = {
    DAYS,
    pSat,
    pressureAt,
    humidityRatio,
    stationFor,
    load,
    get,
    freeCooling,
  };
})();
