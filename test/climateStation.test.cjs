/**
 * ClimateStation.js against the CWEC EPW it was built from (no browser).
 *
 *   node test/climateStation.test.cjs [path/to/CWEC/epw/root]
 *
 * 1. Every C-2 location in ClimateStations.js names a station whose .json and
 *    .bin exist.
 * 2. The monthly table reads back (Toronto City, July: 22.56 C, 12.00 g/kg).
 * 3. The free-cooling hours the module counts on the shipped .bin equal an
 *    independent count straight off the EPW (dew point + station pressure ->
 *    humidity ratio) to within the .bin's quantisation (0.1 C, 0.01 g/kg):
 *    at most QUANT_SLACK hours a month.
 * 4. POSITIVE CONTROLS: "cooler OR drier", "cooler only" and "drier only"
 *    each give a different July count - the test reads the AND rule.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const EPW_ROOT =
  process.argv[2] ||
  path.join(process.env.HOME, "Documents/OpenBuilding/climate-data/cwec2020/epw");
const QUANT_SLACK = 3;

global.window = {};
require(path.join(ROOT, "src/core/ClimateStations.js"));
require(path.join(ROOT, "src/core/ClimateStation.js"));
const CS = window.TEUI.ClimateStation;

const read = (p, kind) => {
  const full = path.join(ROOT, p);
  if (kind === "json") return Promise.resolve(JSON.parse(fs.readFileSync(full, "utf8")));
  const b = fs.readFileSync(full);
  return Promise.resolve(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};

function epwRows(file) {
  return fs
    .readFileSync(file, "latin1")
    .split(/\r?\n/)
    .slice(8)
    .filter((l) => l.split(",").length > 21)
    .map((l) => {
      const c = l.split(",");
      return { month: +c[1] - 1, t: +c[6], dew: +c[7], p: +c[9] };
    });
}

function oracle(rows, setpoint, wIn, rule) {
  const hours = new Array(12).fill(0);
  for (const r of rows) {
    const pv = CS.pSat(r.dew);
    const w = (1000 * 0.622 * pv) / (r.p - pv);
    const cooler = r.t < setpoint;
    const drier = w < wIn;
    if (rule(cooler, drier)) hours[r.month] += 1;
  }
  return hours;
}

(async () => {
  let ok = true;
  const fail = (msg) => {
    console.log("  FAIL " + msg);
    ok = false;
  };

  // 1
  let missing = 0;
  let n = 0;
  for (const prov of Object.values(window.TEUI.ClimateStations)) {
    for (const entry of Object.values(prov)) {
      n++;
      for (const ext of [".json", ".bin"]) {
        if (!fs.existsSync(path.join(ROOT, "climate/stations", entry.station + ext))) missing++;
      }
    }
  }
  console.log(`${n} locations, ${missing} station files missing`);
  if (missing) fail("station files missing");

  // 2
  const id = CS.stationFor("ON", "Toronto (City Hall)");
  const st = await CS.load(id, read);
  console.log(`Toronto (City Hall) -> ${id} ${st.meta.name}; July ${st.months.t_mean[6]} C, ${st.months.w_mean[6]} g/kg`);
  if (st.months.t_mean[6] !== 22.56 || st.months.w_mean[6] !== 12.0) fail("monthly table");

  // 3
  const setpoint = 24;
  const rh = 50;
  const fc = CS.freeCooling(st, setpoint, rh);
  const epw = epwRows(path.join(EPW_ROOT, "epw.CWEC_2020_ON", "CAN_ON_TORONTO-CITY_6158355_CWEC.epw"));
  const and = oracle(epw, setpoint, fc.wIn, (c, d) => c && d);
  const worst = Math.max(...and.map((h, m) => Math.abs(h - fc.hours[m])));
  console.log(`free-cooling hours, ${setpoint} C / ${rh} % (w_in ${fc.wIn.toFixed(2)} g/kg):`);
  console.log(`  module ${fc.hours.join(" ")}`);
  console.log(`  oracle ${and.join(" ")}   worst month |d| = ${worst}`);
  if (worst > QUANT_SLACK) fail("module vs oracle");

  // 4
  const july = fc.hours[6];
  for (const [name, rule] of [
    ["cooler OR drier", (c, d) => c || d],
    ["cooler only", (c) => c],
    ["drier only", (c, d) => d],
  ]) {
    const h = oracle(epw, setpoint, fc.wIn, rule)[6];
    console.log(`  control ${name}: July ${h} (AND: ${july})`);
    if (Math.abs(h - july) <= QUANT_SLACK) fail(`control ${name} indistinguishable`);
  }

  console.log(ok ? "PASS" : "FAIL");
  process.exit(ok ? 0 : 1);
})();
