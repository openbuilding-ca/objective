/* eslint-disable no-dupe-keys */
/**
 * 4012-ReferenzWerten-DE.js
 *
* Eine strukturierte Darstellung der Referenzwerte.
* Jeder Standard ist ein Objekt, in dem die Schlüssel den Anwendungs-Feld-IDs entsprechen
* und die Werte diejenigen Zeichenketten enthalten, die dieser Standard für die vom Benutzer
* bearbeitbaren Felder definiert.
* Diese Daten stammen in erster Linie aus: Zitaten/Quellenangaben.
*
* Hinweis: Werte für die Feld-ID 'j_27' (Gesamtstromverbrauch aus CODE-VALUES.csv T.3.1),
* die zuvor formelbasiert waren, wurden bewusst aus dieser Struktur entfernt.
* Eine überarbeitete Berechnungsmethode für abhängige Zellen (z. B. M10) erfordert
* diese komplexen Lookup-Prozesse hier nicht mehr.
*
*
* Es muss eine Kaskadierungsmethode festgelegt werden, die auf das nicht präfixierte
* Target-Modell, das Referenzmodell und die T-Zellen (Helper) angewendet wird,
* wie erforderlich — z. B. d_52, ref_d_52, t_52.
*
* DIN V 18599 Neubau / Sanierung: gesetzliche Mindestanforderungen an Bauteile (U-Werte, Wirkungsgrade), bundesweit einheitlich.
* Klimazonen 1–3: klimatisch bedingte Parameter (HDD, Design-Temperaturen, SCOP/Lüftungskorrekturen) für Berechnungen von Lasten und Energie; Bauteilmindestwerte bleiben unverändert.
*
* Ein übergeordnetes Metadatenobjekt erstellen, z. B.:
* "DIN18599_Klimazonen": { "1": {...}, "2": {...}, "3": {...} }
*/

window.TEUI = window.TEUI || {};

TEUI.ReferenceValues = {
  "DIN18599_Klimazone_1": { //Klimazone 1 – mild, norddeutsche Küsten und Rhein-Main-Region (Hamburg, Bremen, Düsseldorf, Köln, Bremerhaven, Sylt)
    h_23: "20", // Heiztemperatur-Sollwert nach GEG (typisch 20 °C)
    d_52: "100", // Warmwasserbereitung elektrisch – Systemwirkungsgrad (%)
    k_52: "92", // Warmwasser AFUE für Gas/Öl (%)
    d_53: "0.00", // DWHR – in Deutschland kaum normativ berücksichtigt
    d_56: "300", // Radon-Referenzwert in Deutschland (BfS: 300 Bq/m³)
    d_57: "1000", // CO₂-Grenzwert Innenraum (EN 16798, Kategorie II)
    d_58: "150", // CO-Grenzwert (weiterhin nach PH-Standard)
    d_59: "45", // Relative Feuchte (Jahresmittel)
    d_65: "2.1", // Leistungsdichte für Geräte (DIN 18599)
    d_66: "1.1", // Beleuchtungsleistungsdichte (DIN 18599-4)
    g_67: "Effizient", // Systemwirkungsgrad-Einstufung
    f_73: "0.50", // g-Wert Obergrenze (SHGC)
    f_74: "0.50",
    f_75: "0.50",
    f_76: "0.50",
    f_77: "0.50",
    f_78: "0.50",

    d_80: "DIN 18599", // Berechnungsmethode für Neubau GEG

    // --- Bauteile: RSI-Werte (m²K/W) aus GEG-Maximal-U-Werten ---
    f_85: "5.000", // Mindest-RSI Dach (U=0.20 W/m²K)
    f_86: "4.167", // Mindest-RSI Wand (U=0.24 W/m²K)
    f_87: "3.333", // Mindest-RSI Bodenplatte/Decke gegen Erdreich (U=0.30 W/m²K)

    // --- Fenster: max. U-Werte (W/m²K), alle auf 3 Dezimalstellen ---
    g_88: "1.300", // Fenster Uw nach GEG Neubau
    g_89: "1.300",
    g_90: "1.300",
    g_91: "1.300",
    g_92: "1.300",
    g_93: "1.300",

    // --- Weitere RSI-Werte falls getrennt nötig ---
    f_94: "3.333", // Boden/Platte (U=0.30)
    f_95: "3.333", // Gleich wie oben

    d_97: "5", // Wärmebrückenzuschlag (vereinfacht, DIN 4108 Beiblatt 2)
    d_108: "GEG_n50", // Luftdichtheit: GEG n50 ≤ 3.0 (oder ≤1.5 mit Lüftungsanlage)
    j_115: "0.90", // AFUE Heizen Gas/Öl Mindestwert (konservativ übernommen)
    j_116: "3.0", // COP für Kühlung (DIN 18599 Mindestwert)

    /* Wärmepumpe effizienter in warmen Regionen */
    f_113: "4.0", // Heizungs-SCOP (typischer Wert für Luft-WP, DIN 18599)

    d_118: "75", // Wärmerückgewinnungsgrad Lüftung (%)
    l_118: "0.45", // Mindest-Volumenstrom pro Volumenmethode (l/(s·m²))
    d_119: "8.33", // Mindest-Volumenstrom pro Person (l/s·Person)

    /* --- Klimazone 1 Spezifisch --- */
    c_200: "2000",  // Heizgradtage (HDD)
    c_201: "-7",    // Auslegungs-Außentemperatur (°C)
    c_202: "0.85",  // Heizklimafaktor (geringer Heizbedarf)
    c_203: "1.10",  // Kühlklimafaktor (mehr Kühlbedarf)
    c_204: "1.05",  // Solarfaktor (höhere Einstrahlung)
    c_205: "0.90",  // Wind/Konvektion (geringer)
    c_206: "1.05",  // Wärmepumpen-SCOP Verbesserung
    c_207: "1.10",  // erhöhte Kühllast
    c_208: "0.90"   // geringere Lüftungsverluste
  },

  "DIN18599_Klimazone_2": { //Beispielstädte: Berlin, Frankfurt, Leipzig, Köln, Nürnberg).
    h_23: "20", // Heiztemperatur-Sollwert nach GEG (typisch 20 °C)
    d_52: "100", // Warmwasserbereitung elektrisch – Systemwirkungsgrad (%)
    k_52: "92", // Warmwasser AFUE für Gas/Öl (%)
    d_53: "0.00", // DWHR – in Deutschland kaum normativ berücksichtigt
    d_56: "300", // Radon-Referenzwert in Deutschland (BfS: 300 Bq/m³)
    d_57: "1000", // CO₂-Grenzwert Innenraum (EN 16798, Kategorie II)
    d_58: "150", // CO-Grenzwert (weiterhin nach PH-Standard)
    d_59: "45", // Relative Feuchte (Jahresmittel)
    d_65: "2.1", // Leistungsdichte für Geräte (DIN 18599)
    d_66: "1.1", // Beleuchtungsleistungsdichte (DIN 18599-4)
    g_67: "Effizient", // Systemwirkungsgrad-Einstufung

    f_73: "0.50", // g-Wert Obergrenze (SHGC)
    f_74: "0.50",
    f_75: "0.50",
    f_76: "0.50",
    f_77: "0.50",
    f_78: "0.50",

    d_80: "DIN 18599", // Berechnungsmethode für Neubau GEG

    // --- Bauteile: RSI-Werte (m²K/W) aus GEG-Maximal-U-Werten ---
    f_85: "5.000", // Mindest-RSI Dach (U=0.20 W/m²K)
    f_86: "4.167", // Mindest-RSI Wand (U=0.24 W/m²K)
    f_87: "3.333", // Mindest-RSI Bodenplatte/Decke gegen Erdreich (U=0.30 W/m²K)

    // --- Fenster: max. U-Werte (W/m²K), alle auf 3 Dezimalstellen ---
    g_88: "1.300", // Fenster Uw nach GEG Neubau
    g_89: "1.300",
    g_90: "1.300",
    g_91: "1.300",
    g_92: "1.300",
    g_93: "1.300",

    // --- Weitere RSI-Werte falls getrennt nötig ---
    f_94: "3.333", // Boden/Platte (U=0.30)
    f_95: "3.333", // Gleich wie oben

    d_97: "5", // Wärmebrückenzuschlag (vereinfacht, DIN 4108 Beiblatt 2)
    d_108: "GEG_n50", // Luftdichtheit: GEG n50 ≤ 3.0 (oder ≤1.5 mit Lüftungsanlage)
    j_115: "0.90", // AFUE Heizen Gas/Öl Mindestwert (konservativ übernommen)
    j_116: "3.0", // COP für Kühlung (DIN 18599 Mindestwert)

    /* Wärmepumpen realistisch in mittelkaltem Klima */
    f_113: "3.5", // Heizungs-SCOP (typischer Wert für Luft-WP, DIN 18599)

    d_118: "75", // Wärmerückgewinnungsgrad Lüftung (%)
    l_118: "0.45", // Mindest-Volumenstrom pro Volumenmethode (l/(s·m²))
    d_119: "8.33", // Mindest-Volumenstrom pro Person (l/s·Person)

    /* --- Klimazone 2 Spezifisch --- */
    c_200: "3000",  // Heizgradtage (HDD)
    c_201: "-10",   // Auslegungs-Außentemperatur (°C)
    c_202: "1.00",  // Heizklimafaktor (Normklima)
    c_203: "1.00",  // Kühlklimafaktor (moderate Kühlung)
    c_204: "1.00",  // Solarfaktor
    c_205: "1.00",  // Wind/Konvektion mittleres Niveau
    c_206: "1.00",  // Wärmepumpen-SCOP neutral
    c_207: "1.00",  // Kühllast neutral
    c_208: "1.00"   // Lüftungsverluste neutral
  },

  "DIN18599_Klimazone_3": { //Typische Regionen: Oberpfalz, Thüringer Wald, Erzgebirge, Schwarzwaldhöhen, Alpenvorland.
    h_23: "20", // Heiztemperatur-Sollwert nach GEG (typisch 20 °C)
    d_52: "100", // Warmwasserbereitung elektrisch – Systemwirkungsgrad (%)
    k_52: "92", // Warmwasser AFUE für Gas/Öl (%)
    d_53: "0.00", // DWHR – in Deutschland kaum normativ berücksichtigt
    d_56: "300", // Radon-Referenzwert in Deutschland (BfS: 300 Bq/m³)
    d_57: "1000", // CO₂-Grenzwert Innenraum (EN 16798, Kategorie II)
    d_58: "150", // CO-Grenzwert (weiterhin nach PH-Standard)
    d_59: "45", // Relative Feuchte (Jahresmittel)
    d_65: "2.1", // Leistungsdichte für Geräte (DIN 18599)
    d_66: "1.1", // Beleuchtungsleistungsdichte (DIN 18599-4)
    g_67: "Effizient", // Systemwirkungsgrad-Einstufung

    f_73: "0.50", // g-Wert Obergrenze (SHGC)
    f_74: "0.50",
    f_75: "0.50",
    f_76: "0.50",
    f_77: "0.50",
    f_78: "0.50",

    d_80: "DIN 18599", // Berechnungsmethode für Neubau GEG

    // --- Bauteile: RSI-Werte (m²K/W) aus GEG-Maximal-U-Werten ---
    f_85: "5.000", // Mindest-RSI Dach (U=0.20 W/m²K)
    f_86: "4.167", // Mindest-RSI Wand (U=0.24 W/m²K)
    f_87: "3.333", // Mindest-RSI Bodenplatte/Decke gegen Erdreich (U=0.30 W/m²K)

    // --- Fenster: max. U-Werte (W/m²K), alle auf 3 Dezimalstellen ---
    g_88: "1.300", // Fenster Uw nach GEG Neubau
    g_89: "1.300",
    g_90: "1.300",
    g_91: "1.300",
    g_92: "1.300",
    g_93: "1.300",

    // --- Weitere RSI-Werte falls getrennt nötig ---
    f_94: "3.333", // Boden/Platte (U=0.30)
    f_95: "3.333", // Gleich wie oben

    d_97: "5", // Wärmebrückenzuschlag (vereinfacht, DIN 4108 Beiblatt 2)
    d_108: "GEG_n50", // Luftdichtheit: GEG n50 ≤ 3.0 (oder ≤1.5 mit Lüftungsanlage)
    j_115: "0.90", // AFUE Heizen Gas/Öl Mindestwert (konservativ übernommen)
    j_116: "3.0", // COP für Kühlung (DIN 18599 Mindestwert)

    /* Wärmepumpen schlechter in kalten Regionen */
    f_113: "3.2", // Heizungs-SCOP (typischer Wert für Luft-WP, DIN 18599)

    d_118: "75", // Wärmerückgewinnungsgrad Lüftung (%)
    l_118: "0.45", // Mindest-Volumenstrom pro Volumenmethode (l/(s·m²))
    d_119: "8.33", // Mindest-Volumenstrom pro Person (l/s·Person)

    /* --- Klimazone 3 Spezifisch --- */
    c_200: "4000",   // Heizgradtage (HDD)
    c_201: "-14",    // Auslegungs-Außentemperatur (°C)
    c_202: "1.20",   // Heizklimafaktor (deutlich höherer Bedarf)
    c_203: "0.90",   // Kühlklimafaktor (weniger Kühlung)
    c_204: "0.95",   // Solarfaktor (geringere Einstrahlung/Einfallswinkel)
    c_205: "1.10",   // Wind-/Konvektionsverluste höher
    c_206: "0.92",   // WP-SCOP Verschlechterung
    c_207: "0.90",   // geringere Kühllast
    c_208: "1.15"    // erhöhte Lüftungswärmeverluste
  },
  "DIN V 18599 Neubau": { //General Standard for NeuBau
    h_23: "20", // Heiztemperatur-Sollwert nach GEG (typisch 20 °C)
    d_52: "100", // Warmwasserbereitung elektrisch – Systemwirkungsgrad (%)
    k_52: "92", // Warmwasser AFUE für Gas/Öl (%)
    d_53: "0.00", // DWHR – in Deutschland kaum normativ berücksichtigt
    d_56: "300", // Radon-Referenzwert in Deutschland (BfS: 300 Bq/m³)
    d_57: "1000", // CO₂-Grenzwert Innenraum (EN 16798, Kategorie II)
    d_58: "150", // CO-Grenzwert (weiterhin nach PH-Standard)
    d_59: "45", // Relative Feuchte (Jahresmittel)
    d_65: "2.1", // Leistungsdichte für Geräte (DIN 18599)
    d_66: "1.1", // Beleuchtungsleistungsdichte (DIN 18599-4)
    g_67: "Effizient", // Systemwirkungsgrad-Einstufung
    f_73: "0.50", // g-Wert Obergrenze (SHGC)
    f_74: "0.50",
    f_75: "0.50",
    f_76: "0.50",
    f_77: "0.50",
    f_78: "0.50",
    d_80: "DIN 18599", // Berechnungsmethode für Neubau GEG

    // --- Bauteile: RSI-Werte (m²K/W) aus GEG-Maximal-U-Werten ---
    f_85: "5.000", // Mindest-RSI Dach (U=0.20 W/m²K)
    f_86: "4.167", // Mindest-RSI Wand (U=0.24 W/m²K)
    f_87: "3.333", // Mindest-RSI Bodenplatte/Decke gegen Erdreich (U=0.30 W/m²K)

    // --- Fenster: max. U-Werte (W/m²K), alle auf 3 Dezimalstellen ---
    g_88: "1.300", // Fenster Uw nach GEG Neubau
    g_89: "1.300",
    g_90: "1.300",
    g_91: "1.300",
    g_92: "1.300",
    g_93: "1.300",

    // --- Weitere RSI-Werte falls getrennt nötig ---
    f_94: "3.333", // Boden/Platte (U=0.30)
    f_95: "3.333", // Gleich wie oben

    d_97: "5", // Wärmebrückenzuschlag (vereinfacht, DIN 4108 Beiblatt 2)
    d_108: "GEG_n50", // Luftdichtheit: GEG n50 ≤ 3.0 (oder ≤1.5 mit Lüftungsanlage)
    j_115: "0.90", // AFUE Heizen Gas/Öl Mindestwert (konservativ übernommen)
    j_116: "3.0", // COP für Kühlung (DIN 18599 Mindestwert)
    f_113: "3.5", // Heizungs-SCOP (typischer Wert für Luft-WP, DIN 18599)
    d_118: "75", // Wärmerückgewinnungsgrad Lüftung (%)
    l_118: "0.45", // Mindest-Volumenstrom pro Volumenmethode (l/(s·m²))
    d_119: "8.33" // Mindest-Volumenstrom pro Person (l/s·Person)
  },
  "DIN V 18599 Sanierung_Bestand": {
    h_23: "20", // Heiztemperatur-Sollwert nach GEG (typisch 20 °C)
    d_52: "100", // Warmwasserbereitung elektrisch – Systemwirkungsgrad
    k_52: "92", // Warmwasser AFUE für Gas/Öl
    d_53: "0.00", // DWHR – in Deutschland selten gefordert
    d_56: "300", // Radon-Referenzwert Deutschland (BfS)
    d_57: "1000", // CO₂ Grenzwert Innenraum
    d_58: "150", // CO-Grenzwert
    d_59: "45", // Relative Feuchte
    d_65: "2.1", // Geräte-/Steckdosenlast (ähnlich DIN 18599)
    d_66: "1.1", // Beleuchtungslast (DIN 18599-4)
    g_67: "Effizient", // Systemkennzeichnung

    f_73: "0.50", // g-Wert der Verglasung (SHGC)
    f_74: "0.50",
    f_75: "0.50",
    f_76: "0.50",
    f_77: "0.50",
    f_78: "0.50",

    d_80: "DIN 18599", // Berechnungsmethode für GEG-Bestand

    // --- Bauteile: RSI-Werte nach Sanierungsanforderungen GEG Anlage 7 ---
    // Außenwand: U = 0.24–0.30 je nach Aufbau – Standard: 0.30 → RSI = 3.333
    f_85: "4.000", // Dach/oberste Geschossdecke: U=0.25 → RSI=4.0
    f_86: "3.333", // Außenwand: U=0.30 → RSI=3.333
    f_87: "2.500", // Boden / Kellerdecke: U=0.40 → RSI=2.5

    // --- Fenster: GEG-Sanierungsanforderung Uw <= 1.40 ---
    g_88: "1.400",
    g_89: "1.400",
    g_90: "1.400",
    g_91: "1.400",
    g_92: "1.400",
    g_93: "1.400",

    // --- Weitere RSI-Werte falls getrennt benötigt ---
    f_94: "2.500", // Boden/Platte (U=0.40)
    f_95: "2.500",

    d_97: "5", // Standardwärmebrückenzuschlag (konservativ)
    d_108: "GEG_n50", // Luftdichtheit Bestand: n50 ≤ 3.0 (≤1.5 mit Lüftungsanlage)
    j_115: "0.90", // AFUE Heizen (Gas/Öl)
    j_116: "3.0", // Minimaler COP Kühlung
    f_113: "3.0", // SCOP Bestands-WP realistisch konservativ
    d_118: "65", // WRG Mindestanforderung im Bestand (ERV/HRV)
    l_118: "0.45", // Volumenstrom pro Volumenmethode (DIN EN 16798)
    d_119: "8.33" // Volumenstrom pro Person
  },
  "PHI_DE": {
    h_23: "20",            // Heiztemperatur-Sollwert
    d_52: "100",           // Warmwasser elektrisch, Systemwirkungsgrad
    k_52: "92",            // Warmwasser AFUE Gas/Öl
    d_53: "0.80",          // DWHR / Wärmerückgewinnung 80% falls integriert
    d_56: "150",           // Max. Radon Bq/m3
    d_57: "1000",          // Max. CO2 Innenraum ppm
    d_58: "150",           // Max. CO ppm
    d_59: "45",            // Relative Luftfeuchte %
    d_65: "2.1",           // Geräte-/Steckdosenlast W/m²
    d_66: "1.0",           // Beleuchtungslast W/m²
    g_67: "SehrEffizient", // Standard System-Effizienz

    f_73: "0.50",           // SHGC Verglasung
    f_74: "0.50",
    f_75: "0.50",
    f_76: "0.50",
    f_77: "0.50",
    f_78: "0.50",

    d_80: "PHI_Method",     // Berechnungsmethode PHI

    /* Bauteile: sehr hohe Dämmung nach PHI */
    f_85: "8.00",           // Dach RSI (U≈0,125)
    f_86: "6.67",           // Außenwand RSI (U≈0,15)
    f_87: "6.67",           // Boden/Fußboden RSI (U≈0,15)

    /* Fenster U-Werte */
    g_88: "0.800",
    g_89: "0.800",
    g_90: "0.800",
    g_91: "0.800",
    g_92: "0.800",
    g_93: "0.800",

    f_94: "6.67",           // Boden/Platte RSI
    f_95: "6.67",

    d_97: "1.0",            // Thermische Brücken-Penalty minimal
    d_108: "PHI_n50",       // Luftdichtheit n50 ≤ 0,6/h
    j_115: "0.95",          // Heizung Gas/Öl AFUE hoch
    j_116: "4.0",           // COP Kühlung falls benötigt
    f_113: "5.0",           // SCOP WP hoch
    d_118: "85",            // WRG/ERV Effizienz %
    l_118: "0.45",          // Volumenstrom Lüftung (m³/h pro m²)
    d_119: "8.33"           // Volumenstrom pro Person (l/s)
  }
};

function getStandardData(standardName) {
  return TEUI.ReferenceValues[standardName] || null;
}

function getAllStandardNames() {
  return Object.keys(TEUI.ReferenceValues);
}

const _data = TEUI.ReferenceValues; // Keep direct access for modules that might need it.

function getStandardFields(standardName) {
  // Wrapper for backward compatibility if needed
  return _data[standardName] || null;
}

function getStandards() {
  // Wrapper for backward compatibility
  return Object.keys(_data);
}

// For now, to ensure no immediate breakage if other parts of the app use the old IIFE style:
const referenceStandardsData = TEUI.ReferenceValues; // Save the actual data

// Add helper functions to the existing object without overwriting it
TEUI.ReferenceValues.getStandardFields = getStandardFields;
TEUI.ReferenceValues.getStandards = getStandards;
TEUI.ReferenceValues._data = referenceStandardsData; // Backup reference to data
TEUI.ReferenceValues.getStandardData = getStandardData;
TEUI.ReferenceValues.getAllStandardNames = getAllStandardNames;
