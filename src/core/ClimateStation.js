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

  /**
   * Humidity ratio, g/kg, from the dry bulb and the wet bulb (C) at pressure
   * p (Pa) - ASHRAE Fundamentals ch. 1 eq. 33 (wet bulb above freezing), on
   * the saturation ratio at the wet bulb. F280's Ho, from the design cooling
   * dry bulb and its coincident wet bulb.
   */
  function humidityRatioFromWetBulb(tdb, twb, p) {
    const ws = humidityRatio(twb, 100, p) / 1000;
    const w =
      ((2501 - 2.326 * twb) * ws - 1.006 * (tdb - twb)) /
      (2501 + 1.86 * tdb - 4.186 * twb);
    return 1000 * w;
  }

  const cache = new Map();
  const pending = new Map();
  // Stations whose files did not load: id -> the reason. request() does not
  // fetch these again (every recalculation would fail the same way); a page
  // reload, the browser coming back online, retry() or load() tries again.
  const failed = new Map();
  // The failed stations the status line has named, to say when one arrives.
  const reported = new Set();

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
      failed.delete(id);
      return station;
    });
    pending.set(id, p);
    // registered first, so it has run by the time a caller's handler does
    p.catch(err => {
      pending.delete(id);
      failed.set(id, err.message);
    });
    return p;
  }

  function get(id) {
    return cache.get(id) || null;
  }

  /**
   * Why a station's files did not load, else null - which tells "failed"
   * from "still loading" where get() and request() answer null for both.
   */
  function failure(id) {
    return failed.get(id) || null;
  }

  function recalculate() {
    if (window.TEUI.Calculator?.calculateAll)
      window.TEUI.Calculator.calculateAll();
  }

  /** The app's status line (FileHandler.showStatus), where there is one. */
  function showStatus(message, type) {
    const handler = window.TEUI.FileHandler;
    if (typeof handler?.showStatus === "function")
      handler.showStatus(message, type);
  }

  /**
   * For a graph node: the station if loaded, else null - and start the load,
   * which recalculates the page when it lands (a node cannot await). A load
   * that failed is not started again on every recalculation: the station
   * stays null, failure(id) gives the reason, and the status line says, once
   * per failed load, that the cooling rows have no climate data behind them
   * (they read 0, which understates TEUI).
   */
  function request(id) {
    if (!id) return null;
    const station = get(id);
    if (station || pending.has(id) || failed.has(id)) return station;
    load(id).then(
      () => {
        if (reported.delete(id))
          showStatus(`Climate data loaded (station ${id}).`, "success");
        recalculate();
      },
      err => {
        console.warn(
          `[ClimateStation] ${id}: ${err.message} (served over http?)`
        );
        reported.add(id);
        showStatus(
          `Climate data unavailable (station ${id}): cooling is not calculated.`,
          "error"
        );
        // once more, for the nodes that tell failed from loading
        recalculate();
      }
    );
    return null;
  }

  /**
   * Forget the failures and recalculate, which requests those stations
   * again. Runs when the browser comes back online.
   */
  function retry() {
    if (!failed.size) return;
    failed.clear();
    recalculate();
  }
  if (typeof window.addEventListener === "function")
    window.addEventListener("online", retry);

  /**
   * Per month, on the hourly year:
   *   hours, kh        the hours the outdoor air is cooler AND drier than the
   *                    indoor state, and the sum of (setpoint - outdoor) over
   *                    them, K.h - free cooling's credit
   *   hotHours, hotKh  the hours the outdoor air is warmer than the setpoint,
   *                    and the sum of (outdoor - setpoint) over them, K.h -
   *                    the hours heat recovery runs in cooling (the HRV
   *                    bypasses its core in the others)
   *   wIn              the indoor humidity ratio, g/kg: the setpoint at
   *                    indoorRHPct and the station's pressure, unless wInGkg
   *                    gives it (S08's F280 basis, 9.3 g/kg)
   */
  function freeCooling(station, setpointC, indoorRHPct, wInGkg) {
    const wIn = Number.isFinite(wInGkg)
      ? wInGkg
      : humidityRatio(setpointC, indoorRHPct, pressureAt(station.meta.elev));
    const hours = new Array(12).fill(0);
    const kh = new Array(12).fill(0);
    const hotHours = new Array(12).fill(0);
    const hotKh = new Array(12).fill(0);
    const { t, w } = station.hourly;
    for (let k = 0; k < HOURS; k++) {
      const m = MONTH_OF_HOUR[k];
      if (t[k] < setpointC && w[k] < wIn) {
        hours[m] += 1;
        kh[m] += setpointC - t[k];
      } else if (t[k] > setpointC) {
        hotHours[m] += 1;
        hotKh[m] += t[k] - setpointC;
      }
    }
    return { hours, kh, hotHours, hotKh, wIn };
  }

  window.TEUI.ClimateStation = {
    DAYS,
    pSat,
    pressureAt,
    humidityRatio,
    humidityRatioFromWetBulb,
    stationFor,
    load,
    get,
    failure,
    request,
    retry,
    freeCooling,
  };
})();
