/**
 * VentilationRates.js - the outdoor air a building must receive, by space type.
 *
 * OBC 2024 and NBC 2025 Article 6.3.1.1.(2) (Part 3 buildings): outdoor air "in
 * accordance with" ANSI/ASHRAE 62.1-2016 - normally Section 6.2, the
 * Ventilation Rate Procedure, whose breathing-zone rate is
 *
 *     Vbz = Rp x Pz + Ra x Az        (62.1 Equation 6.2.2.1)
 *
 * Rp (L/s per person) and Ra (L/s per m2) are Table 6.2.2.1's, by space type;
 * Pz the people and Az the floor area. SB-10, ASHRAE 90.1 and the NECB set no
 * rate - they are energy codes. Part 9 houses follow OBC Table 9.32.3.3 instead
 * (the fan's capacity by bedrooms) - PART 9 HOUSES below.
 *
 * Andy 2026-11-18: "we know total conditioned volume and area and occupant
 * count from other cells the user inputs, so we can derive whatever the
 * standard requires us to" - and a rate table instead of one per-person value.
 *
 * SOURCE: Table 6.2.2.1 of 62.1-2016, read from an unofficial copy
 * (hvacsimplified.in) and cross-checked against the 2013 edition: every row
 * here is identical in both. 2016 adds Note H (rates may drop to zero in
 * occupied standby), which the OBC and NBC exclude. Verify against the
 * standard itself before relying on a row.
 *
 * WHY (the V.1.4 check, ComplianceNodes m_119): it read Target per-person /
 * Reference per-person whatever the Ventil. Method, so the default building -
 * Volume by Schedule, which never uses its per-person rate - showed 67% X (its
 * 8.33 against the file's Reference 12.50). 8.33 L/s per person = 30 m3/h per
 * person (not 30 cfm); 62.1 asks roughly 2.7-4.6 L/s per person of typical
 * assembly spaces at their default density. Now: delivered while occupied /
 * this building's Vbz - the default building 743 L/s required, 6,933
 * delivered, 933%.
 *
 * OPEN (also ABCD-OBJECTIVE-PRO.md §4.2 and §6 in ABCD.EARTH):
 *   - the rates are unverified against 62.1-2016 itself (see SOURCE);
 *   - B2 and B3 are stand-ins: 62.1 has no health-care rows (ASHRAE 170);
 *   - Part 9 is judged by its own scope (storeys, footprint - Andy "Yes",
 *     2026-11-18), the footprint taken as conditioned area / storeys: an
 *     approximation of the code's building area. Bedrooms are one count per
 *     dwelling unit - a building of mixed unit sizes is checked as if alike;
 *   - the case studies carry no space type (each takes its occupancy's
 *     default) except 09 Rowing Centre: Gym, sports arena (play area)
 *     (Andy 2026-11-18) - it read 95% X at 14 L/s per person (x 100 = 1,400
 *     L/s against 10 x 100 + 0.9 x 528 m2 = 1,475); its Target now carries
 *     14.75 (Andy: yes), 100% - TEUI 84.02 -> 84.48.
 *
 * DATA, not code: a row is changed here, never in a node.
 */
(function () {
  "use strict";

  window.TEUI = window.TEUI || {};

  // rp: L/s per person · ra: L/s per m2 · density: Table 6.2.2.1's default
  // people per 100 m2 (used only when the occupant count is unknown; null
  // where the table gives none) · group: its Table 6.2.2.1 heading.
  const SPACE_TYPES = {
    // Correctional Facilities
    Cell: { rp: 2.5, ra: 0.6, density: 25, group: "Correctional Facilities" },
    Dayroom: {
      rp: 2.5,
      ra: 0.3,
      density: 30,
      group: "Correctional Facilities",
    },
    "Guard stations": {
      rp: 2.5,
      ra: 0.3,
      density: 15,
      group: "Correctional Facilities",
    },
    "Booking/waiting": {
      rp: 3.8,
      ra: 0.3,
      density: 50,
      group: "Correctional Facilities",
    },
    // Educational Facilities
    "Daycare (through age 4)": {
      rp: 5,
      ra: 0.9,
      density: 25,
      group: "Educational Facilities",
    },
    "Classrooms (ages 5-8)": {
      rp: 5,
      ra: 0.6,
      density: 25,
      group: "Educational Facilities",
    },
    "Classrooms (age 9 plus)": {
      rp: 5,
      ra: 0.6,
      density: 35,
      group: "Educational Facilities",
    },
    "Lecture classroom": {
      rp: 3.8,
      ra: 0.3,
      density: 65,
      group: "Educational Facilities",
    },
    "Lecture hall (fixed seats)": {
      rp: 3.8,
      ra: 0.3,
      density: 150,
      group: "Educational Facilities",
    },
    "Art classroom": {
      rp: 5,
      ra: 0.9,
      density: 20,
      group: "Educational Facilities",
    },
    "Science laboratories": {
      rp: 5,
      ra: 0.9,
      density: 25,
      group: "Educational Facilities",
    },
    "Computer lab": {
      rp: 5,
      ra: 0.6,
      density: 25,
      group: "Educational Facilities",
    },
    "Media center": {
      rp: 5,
      ra: 0.6,
      density: 25,
      group: "Educational Facilities",
    },
    "Music/theater/dance": {
      rp: 5,
      ra: 0.3,
      density: 35,
      group: "Educational Facilities",
    },
    "Multiuse assembly": {
      rp: 3.8,
      ra: 0.3,
      density: 100,
      group: "Educational Facilities",
    },
    // Food and Beverage Service
    "Restaurant dining rooms": {
      rp: 3.8,
      ra: 0.9,
      density: 70,
      group: "Food and Beverage Service",
    },
    "Cafeteria/fast-food dining": {
      rp: 3.8,
      ra: 0.9,
      density: 100,
      group: "Food and Beverage Service",
    },
    "Bars, cocktail lounges": {
      rp: 3.8,
      ra: 0.9,
      density: 100,
      group: "Food and Beverage Service",
    },
    // General
    "Conference/meeting": { rp: 2.5, ra: 0.3, density: 50, group: "General" },
    // Hotels, Motels, Resorts, Dormitories
    "Bedroom/living room": {
      rp: 2.5,
      ra: 0.3,
      density: 10,
      group: "Hotels, Motels, Resorts, Dormitories",
    },
    "Barracks sleeping areas": {
      rp: 2.5,
      ra: 0.3,
      density: 20,
      group: "Hotels, Motels, Resorts, Dormitories",
    },
    "Lobbies/prefunction": {
      rp: 3.8,
      ra: 0.3,
      density: 30,
      group: "Hotels, Motels, Resorts, Dormitories",
    },
    "Multipurpose assembly": {
      rp: 2.5,
      ra: 0.3,
      density: 120,
      group: "Hotels, Motels, Resorts, Dormitories",
    },
    // Office Buildings
    "Office space": { rp: 2.5, ra: 0.3, density: 5, group: "Office Buildings" },
    "Reception areas": {
      rp: 2.5,
      ra: 0.3,
      density: 30,
      group: "Office Buildings",
    },
    "Main entry lobbies": {
      rp: 2.5,
      ra: 0.3,
      density: 10,
      group: "Office Buildings",
    },
    "Telephone/data entry": {
      rp: 2.5,
      ra: 0.3,
      density: 60,
      group: "Office Buildings",
    },
    // Miscellaneous Spaces
    "Banks or bank lobbies": {
      rp: 3.8,
      ra: 0.3,
      density: 15,
      group: "Miscellaneous Spaces",
    },
    "Computer (not printing)": {
      rp: 2.5,
      ra: 0.3,
      density: 4,
      group: "Miscellaneous Spaces",
    },
    "General manufacturing": {
      rp: 5,
      ra: 0.9,
      density: 7,
      group: "Miscellaneous Spaces",
    },
    "Photo studios": {
      rp: 2.5,
      ra: 0.6,
      density: 10,
      group: "Miscellaneous Spaces",
    },
    "Shipping/receiving": {
      rp: 5,
      ra: 0.6,
      density: 2,
      group: "Miscellaneous Spaces",
    },
    "Sorting, packing, light assembly": {
      rp: 3.8,
      ra: 0.6,
      density: 7,
      group: "Miscellaneous Spaces",
    },
    "Transportation waiting": {
      rp: 3.8,
      ra: 0.3,
      density: 100,
      group: "Miscellaneous Spaces",
    },
    Warehouses: {
      rp: 5,
      ra: 0.3,
      density: null,
      group: "Miscellaneous Spaces",
    },
    // Public Assembly Spaces
    "Auditorium seating area": {
      rp: 2.5,
      ra: 0.3,
      density: 150,
      group: "Public Assembly Spaces",
    },
    "Places of religious worship": {
      rp: 2.5,
      ra: 0.3,
      density: 120,
      group: "Public Assembly Spaces",
    },
    Courtrooms: {
      rp: 2.5,
      ra: 0.3,
      density: 70,
      group: "Public Assembly Spaces",
    },
    "Legislative chambers": {
      rp: 2.5,
      ra: 0.3,
      density: 50,
      group: "Public Assembly Spaces",
    },
    Libraries: {
      rp: 2.5,
      ra: 0.6,
      density: 10,
      group: "Public Assembly Spaces",
    },
    Lobbies: {
      rp: 2.5,
      ra: 0.3,
      density: 150,
      group: "Public Assembly Spaces",
    },
    "Museums (children's)": {
      rp: 3.8,
      ra: 0.6,
      density: 40,
      group: "Public Assembly Spaces",
    },
    "Museums/galleries": {
      rp: 3.8,
      ra: 0.3,
      density: 40,
      group: "Public Assembly Spaces",
    },
    // Residential (Note F: 2 people per studio or 1-bedroom unit, +1 per bedroom)
    "Dwelling unit": { rp: 2.5, ra: 0.3, density: null, group: "Residential" },
    // Retail
    "Sales (except as below)": {
      rp: 3.8,
      ra: 0.6,
      density: 15,
      group: "Retail",
    },
    "Mall common areas": { rp: 3.8, ra: 0.3, density: 40, group: "Retail" },
    Barbershop: { rp: 3.8, ra: 0.3, density: 25, group: "Retail" },
    "Beauty and nail salons": { rp: 10, ra: 0.6, density: 25, group: "Retail" },
    "Pet shops (animal areas)": {
      rp: 3.8,
      ra: 0.9,
      density: 10,
      group: "Retail",
    },
    Supermarket: { rp: 3.8, ra: 0.3, density: 8, group: "Retail" },
    "Coin-operated laundries": {
      rp: 3.8,
      ra: 0.6,
      density: 20,
      group: "Retail",
    },
    // Sports and Entertainment
    "Gym, sports arena (play area)": {
      rp: 10,
      ra: 0.9,
      density: 7,
      group: "Sports and Entertainment",
    },
    "Spectator areas": {
      rp: 3.8,
      ra: 0.3,
      density: 150,
      group: "Sports and Entertainment",
    },
    "Swimming (pool & deck)": {
      rp: 0,
      ra: 2.4,
      density: null,
      group: "Sports and Entertainment",
    },
    "Disco/dance floors": {
      rp: 10,
      ra: 0.3,
      density: 100,
      group: "Sports and Entertainment",
    },
    "Health club/aerobics room": {
      rp: 10,
      ra: 0.3,
      density: 40,
      group: "Sports and Entertainment",
    },
    "Health club/weight rooms": {
      rp: 10,
      ra: 0.3,
      density: 10,
      group: "Sports and Entertainment",
    },
    "Bowling alley (seating)": {
      rp: 5,
      ra: 0.6,
      density: 40,
      group: "Sports and Entertainment",
    },
    "Gambling casinos": {
      rp: 3.8,
      ra: 0.9,
      density: 120,
      group: "Sports and Entertainment",
    },
    "Game arcades": {
      rp: 3.8,
      ra: 0.9,
      density: 20,
      group: "Sports and Entertainment",
    },
    "Stages, studios": {
      rp: 5,
      ra: 0.3,
      density: 70,
      group: "Sports and Entertainment",
    },
  };

  // The space types offered for each Major Occupancy (S02 B.1), its DEFAULT
  // first. 62.1 lists no health-care spaces (ASHRAE 170 governs them): B2 and
  // B3 offer the nearest listed rooms, as 62.1's Note 6 directs for an
  // unlisted occupancy - stand-ins, flagged in the tooltip.
  const BY_OCCUPANCY = {
    "A-Assembly": [
      "Auditorium seating area",
      "Places of religious worship",
      "Courtrooms",
      "Legislative chambers",
      "Libraries",
      "Lobbies",
      "Museums/galleries",
      "Museums (children's)",
      "Multipurpose assembly",
      "Lobbies/prefunction",
      "Spectator areas",
      "Gym, sports arena (play area)",
      "Health club/aerobics room",
      "Health club/weight rooms",
      "Swimming (pool & deck)",
      "Bowling alley (seating)",
      "Disco/dance floors",
      "Stages, studios",
      "Gambling casinos",
      "Game arcades",
      "Restaurant dining rooms",
      "Cafeteria/fast-food dining",
      "Bars, cocktail lounges",
      "Daycare (through age 4)",
      "Classrooms (ages 5-8)",
      "Classrooms (age 9 plus)",
      "Lecture classroom",
      "Lecture hall (fixed seats)",
      "Art classroom",
      "Science laboratories",
      "Computer lab",
      "Media center",
      "Music/theater/dance",
      "Multiuse assembly",
      "Transportation waiting",
    ],
    "B1-Detention": ["Cell", "Dayroom", "Guard stations", "Booking/waiting"],
    "B2-Care and Treatment": [
      "Bedroom/living room",
      "Office space",
      "Conference/meeting",
    ],
    "B3-Detention Care & Treatment": ["Cell", "Dayroom", "Bedroom/living room"],
    "C-Residential": [
      "Dwelling unit",
      "Bedroom/living room",
      "Barracks sleeping areas",
    ],
    "D-Business & Personal Services": [
      "Office space",
      "Conference/meeting",
      "Reception areas",
      "Main entry lobbies",
      "Telephone/data entry",
      "Banks or bank lobbies",
      "Barbershop",
      "Beauty and nail salons",
      "Photo studios",
      "Computer (not printing)",
    ],
    "E-Mercantile": [
      "Sales (except as below)",
      "Mall common areas",
      "Supermarket",
      "Pet shops (animal areas)",
      "Coin-operated laundries",
    ],
    "F-Industrial": [
      "General manufacturing",
      "Warehouses",
      "Shipping/receiving",
      "Sorting, packing, light assembly",
    ],
  };

  const STAND_INS = new Set([
    "B2-Care and Treatment",
    "B3-Detention Care & Treatment",
  ]);

  /** The space types offered for an occupancy (every one when it is unknown). */
  function optionsFor(occupancy) {
    return BY_OCCUPANCY[occupancy] || Object.keys(SPACE_TYPES);
  }

  /** The space type in effect: the stored one if the occupancy offers it, else the occupancy's default. */
  function resolve(occupancy, spaceType) {
    const offered = optionsFor(occupancy);
    return offered.includes(spaceType) ? spaceType : offered[0];
  }

  /** Vbz = Rp x people + Ra x area, in L/s, for the space type in effect. */
  function requiredOutdoorAir(occupancy, spaceType, occupants, area) {
    const row = SPACE_TYPES[resolve(occupancy, spaceType)];
    return row.rp * occupants + row.ra * area;
  }

  // ==========================================================================
  // PART 9 HOUSES - OBC 2024 / NBC Table 9.32.3.3 (Andy 2026-11-18: "Yes")
  // ==========================================================================
  // A Part 9 dwelling unit's principal ventilation fan: its normal operating
  // exhaust capacity, L/s, by bedrooms (9.32.3.3.(2)). 9.32.3.1.(1)(b): this
  // Subsection serves dwelling units with 5 or fewer bedrooms; more than 5
  // follow CSA F326 or Part 6 - here, 62.1 above.
  //
  // WHY: 62.1's Dwelling unit row (Ra 0.3 L/s per m2) is written for apartments
  // in Part 3 buildings; on a large house with few people the area term rules -
  // case 02 Collingwood, 2 people, 293.85 m2: 62.1 asks 93 L/s; 9.32.3.3 asks
  // 16-32 L/s for 1-3 bedrooms.
  const PART9_FAN_LS = {
    1: { min: 16, max: 24 },
    2: { min: 18, max: 28 },
    3: { min: 22, max: 32 },
    4: { min: 26, max: 38 },
    5: { min: 30, max: 45 },
  };

  // The bedroom choices (S09 G.1.1, l_63), per dwelling unit: "" derives them
  // from the occupants - 62.1 Note F's 2 people for a studio or 1-bedroom
  // unit, +1 per bedroom, run backwards: occupants per unit - 1, at least 1.
  const BEDROOM_OPTIONS = ["", "1", "2", "3", "4", "5", "More than 5"];

  // Energy standards (S.1) for Part 3 buildings: a building modelled under one
  // keeps 62.1 whatever its size (case 04, a 3-storey 848 m2 NECB apartment).
  function isPart3Standard(standard) {
    const s = String(standard || "");
    return (
      s.startsWith("OBC SB10") || s.startsWith("NECB") || s.startsWith("CaGBC")
    );
  }

  /**
   * Which buildings take the Part 9 rule (Andy 2026-11-18, "Yes" to Part 9's
   * own scope): OBC Div. A 1.3.3.3.(1) - 3 storeys or less, building area 600
   * m2 or less - for a residential occupancy (S02 B.1), not modelled under a
   * Part 3 energy standard. Building area = the footprint, conditioned area /
   * storeys (S12's storeys, d_103). So the SB-12 houses (02, 10) and the
   * Passive House ones (03, 12) alike. One predicate, changed in one place.
   */
  function part9Applies(p) {
    const storeys = Number(p.storeys) || 1;
    return (
      p.occupancy === "C-Residential" &&
      !isPart3Standard(p.standard) &&
      storeys <= 3 &&
      p.area / storeys <= 600
    );
  }

  /** Bedrooms per dwelling unit: the chosen count, or derived from the occupants per unit. */
  function bedroomsInEffect(bedrooms, occupants, units = 1) {
    if (bedrooms === "More than 5") return 6;
    const n = parseInt(bedrooms, 10);
    if (n >= 1) return n;
    return Math.max(1, Math.round(occupants / Math.max(1, units)) - 1);
  }

  /** Dwelling units (S09 G.1.1, m_63): a whole number, at least 1. */
  function unitsInEffect(units) {
    const n = Math.round(Number(String(units ?? "").replace(/,/g, "")));
    return n >= 1 ? n : 1;
  }

  /**
   * The outdoor air the code requires, L/s, and the rule that set it: for a
   * Part 9 building, each dwelling unit's Table 9.32.3.3 minimum (units x the
   * minimum for its bedrooms; a unit of more than 5 bedrooms -> 62.1), else
   * 62.1.
   */
  function requiredForBuilding(p) {
    if (part9Applies(p)) {
      const units = unitsInEffect(p.units);
      const beds = bedroomsInEffect(p.bedrooms, p.occupants, units);
      const row = PART9_FAN_LS[beds];
      if (row)
        return {
          ls: units * row.min,
          rule: "OBC 9.32.3.3",
          units,
          bedrooms: beds,
          max: units * row.max,
        };
    }
    return {
      ls: requiredOutdoorAir(p.occupancy, p.spaceType, p.occupants, p.area),
      rule: "ASHRAE 62.1",
    };
  }

  window.TEUI.VentilationRates = Object.freeze({
    source:
      "ANSI/ASHRAE 62.1-2016, Table 6.2.2.1 (OBC 2024 / NBC 2025 Art. 6.3.1.1.(2)); Part 9 houses OBC 2024 Table 9.32.3.3",
    spaceTypes: SPACE_TYPES,
    byOccupancy: BY_OCCUPANCY,
    part9FanLs: PART9_FAN_LS,
    bedroomOptions: BEDROOM_OPTIONS,
    isStandIn: occupancy => STAND_INS.has(occupancy),
    optionsFor,
    resolve,
    requiredOutdoorAir,
    isPart3Standard,
    part9Applies,
    bedroomsInEffect,
    unitsInEffect,
    requiredForBuilding,
  });
})();
