/**
 * KlimaWerten.js
 * Klimadaten für deutsche Standorte
 *
 * Klimadaten basierend auf DWD (Deutscher Wetterdienst) und DIN-Normen
 * Angepasst an die Struktur von ClimateValues.js für kanadische Standorte
 */

// Create namespace
window.TEUI = window.TEUI || {};

// Klimadaten-Objekt mit deutschen Standorten
window.TEUI.ClimateData = {
  "Baden-Württemberg": {
    Stuttgart: {
      Location: "Stuttgart",
      "Elev ASL (m)": 245, // Höhe über Meeresspiegel (m)
      January_2_5: -10, // Januar Auslegungstemperatur 2,5% (°C)
      January_1: -12, // Januar Auslegungstemperatur 1% (°C)
      July_2_5_Tdb: 32, // Juli 2,5% Trockentemperatur (°C)
      July_2_5_Twb: 21, // Juli 2,5% Feuchttemperatur (°C)
      Future_July_2_5_Tdb: 35, // Zukünftige Juli 2,5% Trockentemperatur (°C)
      Future_July_2_5_Twb: 23, // Zukünftige Juli 2,5% Feuchttemperatur (°C)
      HDD18: 3000, // Heizgradtage Basis 18°C
      HDD15: 2200, // Heizgradtage Basis 15°C
      HDD18_2021_2050: 2700, // Heizgradtage 18°C (2021-2050 Projektion)
      CDD24: 150, // Kühlgradtage Basis 24°C
      CDD24_2021_2050: 250, // Kühlgradtage 24°C (2021-2050 Projektion)
      Over_30Tdb_2021_2050: 25, // Tage über 30°C Trockentemperatur (2021-2050)
      Extreme_Hot_Tdb_1991_2020: 38, // Extreme Hitze Trockentemperatur 1991-2020 (°C)
      Rain_15_min_mm: 15, // Regen 15 Minuten (mm)
      Rain_15_min_mm_New: 18, // Regen 15 Minuten neu (mm)
      "Rain_1_day_1/50mm": 65, // 1-Tag Regen 1/50 Jahr (mm)
      "Rain_1_day_1/50mm_New": 75, // 1-Tag Regen 1/50 Jahr neu (mm)
      Rain_Annual_mm: 650, // Jährlicher Niederschlag (mm)
      Rain_Annual_mm_New: 700, // Jährlicher Niederschlag neu (mm)
      Moisture_Index_New: 0.8, // Feuchtigkeitsindex neu
      Precip_Annual_mm: 700, // Jährlicher Gesamtniederschlag (mm)
      Precip_Annual_mm_New: 750, // Jährlicher Gesamtniederschlag neu (mm)
      "Driving_Rain_Wind_Pa_1/5": 180, // Schlagregen-Wind 1/5 Jahr (Pa)
      "Driving_Rain_Wind_Pa_1/5_New": 200, // Schlagregen-Wind 1/5 Jahr neu (Pa)
      "Snow_kPa_1/50_Ss": 0.8, // Schneelast 1/50 Jahr Ss (kPa)
      "Snow_kPa_1/50_Sr": 0.2, // Schneelast 1/50 Jahr Sr (kPa)
      "Snow_kPa_1/1000_Ss": 1.2, // Schneelast 1/1000 Jahr Ss (kPa)
      "Snow_kPa_1/1000_Sr": 0.3, // Schneelast 1/1000 Jahr Sr (kPa)
      "Wind_Hourly_kPa_1/10": 0.40, // Stündliche Windlast 1/10 Jahr (kPa)
      "Wind_Hourly_kPa_1/10_New": 0.45, // Stündliche Windlast 1/10 Jahr neu (kPa)
      "Wind_Hourly_kPa_1/50": 0.55, // Stündliche Windlast 1/50 Jahr (kPa)
      "Wind_Hourly_kPa_1/50_New": 0.60, // Stündliche Windlast 1/50 Jahr neu (kPa)
      "Wind_Hourly_kPa_1/500_New": 0.80, // Stündliche Windlast 1/500 Jahr neu (kPa)
      Winter_Tdb_Avg: 2, // Winter Durchschnittstemperatur (°C)
      Winter_Windspeed_Avg: 3.5, // Winter Durchschnittswindgeschwindigkeit (m/s)
      Summer_Tdb_Avg: 19, // Sommer Durchschnittstemperatur (°C)
      Summer_Twb_Avg: 16, // Sommer Durchschnittsfeuchttemperatur (°C)
      Summer_RH_1500_LST: 55, // Sommer relative Luftfeuchte 15:00 Uhr (%)
    },
  },
  Berlin: {
    Berlin: {
      Location: "Berlin",
      "Elev ASL (m)": 55, // Höhe über Meeresspiegel (m)
      January_2_5: -12, // Januar Auslegungstemperatur 2,5% (°C)
      January_1: -14, // Januar Auslegungstemperatur 1% (°C)
      July_2_5_Tdb: 30, // Juli 2,5% Trockentemperatur (°C)
      July_2_5_Twb: 20, // Juli 2,5% Feuchttemperatur (°C)
      Future_July_2_5_Tdb: 34, // Zukünftige Juli 2,5% Trockentemperatur (°C)
      Future_July_2_5_Twb: 22, // Zukünftige Juli 2,5% Feuchttemperatur (°C)
      HDD18: 3200, // Heizgradtage Basis 18°C
      HDD15: 2400, // Heizgradtage Basis 15°C
      HDD18_2021_2050: 2900, // Heizgradtage 18°C (2021-2050 Projektion)
      CDD24: 120, // Kühlgradtage Basis 24°C
      CDD24_2021_2050: 220, // Kühlgradtage 24°C (2021-2050 Projektion)
      Over_30Tdb_2021_2050: 20, // Tage über 30°C Trockentemperatur (2021-2050)
      Extreme_Hot_Tdb_1991_2020: 37, // Extreme Hitze Trockentemperatur 1991-2020 (°C)
      Rain_15_min_mm: 12, // Regen 15 Minuten (mm)
      Rain_15_min_mm_New: 15, // Regen 15 Minuten neu (mm)
      "Rain_1_day_1/50mm": 55, // 1-Tag Regen 1/50 Jahr (mm)
      "Rain_1_day_1/50mm_New": 65, // 1-Tag Regen 1/50 Jahr neu (mm)
      Rain_Annual_mm: 570, // Jährlicher Niederschlag (mm)
      Rain_Annual_mm_New: 620, // Jährlicher Niederschlag neu (mm)
      Moisture_Index_New: 0.7, // Feuchtigkeitsindex neu
      Precip_Annual_mm: 600, // Jährlicher Gesamtniederschlag (mm)
      Precip_Annual_mm_New: 650, // Jährlicher Gesamtniederschlag neu (mm)
      "Driving_Rain_Wind_Pa_1/5": 200, // Schlagregen-Wind 1/5 Jahr (Pa)
      "Driving_Rain_Wind_Pa_1/5_New": 220, // Schlagregen-Wind 1/5 Jahr neu (Pa)
      "Snow_kPa_1/50_Ss": 1.0, // Schneelast 1/50 Jahr Ss (kPa)
      "Snow_kPa_1/50_Sr": 0.25, // Schneelast 1/50 Jahr Sr (kPa)
      "Snow_kPa_1/1000_Ss": 1.5, // Schneelast 1/1000 Jahr Ss (kPa)
      "Snow_kPa_1/1000_Sr": 0.35, // Schneelast 1/1000 Jahr Sr (kPa)
      "Wind_Hourly_kPa_1/10": 0.45, // Stündliche Windlast 1/10 Jahr (kPa)
      "Wind_Hourly_kPa_1/10_New": 0.50, // Stündliche Windlast 1/10 Jahr neu (kPa)
      "Wind_Hourly_kPa_1/50": 0.60, // Stündliche Windlast 1/50 Jahr (kPa)
      "Wind_Hourly_kPa_1/50_New": 0.65, // Stündliche Windlast 1/50 Jahr neu (kPa)
      "Wind_Hourly_kPa_1/500_New": 0.85, // Stündliche Windlast 1/500 Jahr neu (kPa)
      Winter_Tdb_Avg: 0, // Winter Durchschnittstemperatur (°C)
      Winter_Windspeed_Avg: 4.0, // Winter Durchschnittswindgeschwindigkeit (m/s)
      Summer_Tdb_Avg: 18, // Sommer Durchschnittstemperatur (°C)
      Summer_Twb_Avg: 15, // Sommer Durchschnittsfeuchttemperatur (°C)
      Summer_RH_1500_LST: 52, // Sommer relative Luftfeuchte 15:00 Uhr (%)
    },
  },
};

// Helper-Funktionen
function getClimateData(region, location) {
  if (window.TEUI.ClimateData[region] && window.TEUI.ClimateData[region][location]) {
    return window.TEUI.ClimateData[region][location];
  }
  return null;
}

function getAllRegions() {
  return Object.keys(window.TEUI.ClimateData);
}

function getLocationsByRegion(region) {
  if (window.TEUI.ClimateData[region]) {
    return Object.keys(window.TEUI.ClimateData[region]);
  }
  return [];
}

function getAllLocations() {
  const locations = [];
  Object.keys(window.TEUI.ClimateData).forEach(region => {
    Object.keys(window.TEUI.ClimateData[region]).forEach(location => {
      locations.push({
        region: region,
        location: location,
        fullName: `${location}, ${region}`
      });
    });
  });
  return locations;
}

// Funktionen zum globalen Namespace hinzufügen (nicht-aufzählbar, damit sie nicht in Dropdowns erscheinen)
Object.defineProperty(window.TEUI.ClimateData, 'getClimateData', {
  value: getClimateData,
  enumerable: false,
  writable: false,
  configurable: false
});
Object.defineProperty(window.TEUI.ClimateData, 'getAllRegions', {
  value: getAllRegions,
  enumerable: false,
  writable: false,
  configurable: false
});
Object.defineProperty(window.TEUI.ClimateData, 'getLocationsByRegion', {
  value: getLocationsByRegion,
  enumerable: false,
  writable: false,
  configurable: false
});
Object.defineProperty(window.TEUI.ClimateData, 'getAllLocations', {
  value: getAllLocations,
  enumerable: false,
  writable: false,
  configurable: false
});
