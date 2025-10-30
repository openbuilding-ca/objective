/**
 * 4011-ExcelLocationHandler.js
 * Specialized handler for location data processing
 */

window.TEUI = window.TEUI || {};

TEUI.ExcelLocationHandler = (function () {
  // Province ranges in the CANADA worksheet
  const PROVINCE_RANGES = {
    BC: { start: 6, end: 114 }, // British Columbia
    AB: { start: 116, end: 170 }, // Alberta
    SK: { start: 172, end: 202 }, // Saskatchewan
    MB: { start: 204, end: 227 }, // Manitoba
    ON: { start: 229, end: 458 }, // Ontario
    QC: { start: 460, end: 584 }, // Quebec
    NB: { start: 586, end: 603 }, // New Brunswick
    NS: { start: 605, end: 630 }, // Nova Scotia
    PE: { start: 632, end: 635 }, // Prince Edward Island
    NL: { start: 637, end: 654 }, // Newfoundland and Labrador
    YT: { start: 656, end: 664 }, // Yukon
    NT: { start: 666, end: 682 }, // Northwest Territory
    NU: { start: 684, end: 699 }, // Nunavut
  };

  const PROVINCE_NAMES = {
    BC: "British Columbia",
    AB: "Alberta",
    SK: "Saskatchewan",
    MB: "Manitoba",
    ON: "Ontario",
    QC: "Quebec",
    NB: "New Brunswick",
    NS: "Nova Scotia",
    PE: "Prince Edward Island",
    NL: "Newfoundland and Labrador",
    YT: "Yukon",
    NT: "Northwest Territories",
    NU: "Nunavut",
  };

  let locationData = null;

  function initialize() {
    // Initialize dropdowns with empty options
    initializeDropdowns();

    // Listen for location data loaded event
    document.addEventListener("location-data-ready", function () {
      updateProvinceDropdowns();
    });
  }

  function initializeDropdowns() {
    const provinceDropdowns = document.querySelectorAll(
      '[data-dropdown-id="dd_d_19"]',
    );
    const cityDropdowns = document.querySelectorAll(
      '[data-dropdown-id="dd_h_19"]',
    );

    provinceDropdowns.forEach((dropdown) => {
      dropdown.innerHTML = '<option value="">Select Province</option>';
      dropdown.onchange = function () {
        updateCityDropdowns(this.value);
      };
    });

    cityDropdowns.forEach((dropdown) => {
      dropdown.innerHTML = '<option value="">Select City</option>';
    });
  }

  // Display status message using the feedback area
  function showStatus(message, type) {
    // Get the feedback area
    const feedbackArea = document.getElementById("feedback-area");
    if (feedbackArea) {
      // Define colors for different message types
      const colors = {
        info: "#0dcaf0", // light blue
        success: "#198754", // green
        warning: "#ffc107", // yellow
        error: "#dc3545", // red
      };

      // Set the message with appropriate color
      feedbackArea.textContent = message;
      feedbackArea.style.color = colors[type] || "#0dcaf0";

      // Auto-clear success and info messages after a delay
      if (type === "success" || type === "info") {
        setTimeout(() => {
          if (feedbackArea.textContent === message) {
            feedbackArea.textContent = "";
          }
        }, 5000);
      }
    }
  }

  function processLocationData(workbook) {
    showStatus("Processing location data...", "info");

    if (!validateWorkbook(workbook)) {
      console.error("Invalid workbook structure, missing CANADA sheet");
      showStatus(
        "Error: Invalid workbook structure, missing CANADA sheet",
        "error",
      );
      throw new Error("Invalid workbook structure: Missing CANADA sheet");
    }

    const sheet = workbook.Sheets["CANADA"];
    locationData = {};

    // Process each province
    Object.entries(PROVINCE_RANGES).forEach(([province, range]) => {
      locationData[province] = {
        name: PROVINCE_NAMES[province],
        cities: getCitiesForRange(sheet, range),
      };
    });

    printLocationDataSummary();
    showStatus("Location data processed successfully", "success");
    return locationData;
  }

  function validateWorkbook(wb) {
    if (!wb || !wb.SheetNames.includes("CANADA") || !wb.Sheets["CANADA"]) {
      console.error("Invalid workbook structure:", wb?.SheetNames);
      return false;
    }
    return true;
  }

  function getCitiesForRange(sheet, range) {
    const cities = [];
    for (let row = range.start; row <= range.end; row++) {
      const cityCell = sheet[`A${row}`];
      if (cityCell && cityCell.v) {
        cities.push({
          name: cityCell.v.trim(),
          data: getWeatherDataForRow(sheet, row),
        });
      }
    }
    return cities;
  }

  function getWeatherDataForRow(sheet, row) {
    // Get the current occupancy type from StateManager
    const occupancyType = window.TEUI?.StateManager?.getValue("d_12") || "";
    const isCritical = occupancyType.includes("Care");

    // Determine which January temperature column to use
    // Column C is January_2_5, Column D is January_1
    const janTempColumn = isCritical ? `D${row}` : `C${row}`;

    // Get the value from the correct column based on occupancy
    const januaryDesignTemp = sheet[janTempColumn]?.v || null;
    const jan25Temp = sheet[`C${row}`]?.v || null; // Get 2.5% as fallback
    const jan1Temp = sheet[`D${row}`]?.v || null; // Get 1% for storage

    return {
      city: sheet[`A${row}`]?.v?.trim() || "",
      Elevation_ASL: sheet[`B${row}`]?.v || null,
      // Store both raw values for potential re-evaluation later
      January_2_5: jan25Temp,
      January_1: jan1Temp,
      // Use the conditionally selected temperature for the main value used by Section 3
      January_Design_Temp:
        januaryDesignTemp !== null
          ? januaryDesignTemp
          : jan25Temp !== null
            ? jan25Temp
            : "-24", // More robust fallback
      July_2_5_Tdb: sheet[`E${row}`]?.v || null,
      July_2_5_Twb: sheet[`F${row}`]?.v || null,
      Future_July_2_5_Tdb: sheet[`G${row}`]?.v || null,
      Future_July_2_5_Twb: sheet[`H${row}`]?.v || null,
      HDD18: sheet[`I${row}`]?.v || null,
      HDD15: sheet[`J${row}`]?.v || null,
      HDD18_2021_2050: sheet[`K${row}`]?.v || null,
      CDD24: sheet[`L${row}`]?.v || null,
      CDD24_2021_2050: sheet[`M${row}`]?.v || null,
      Over_30Tdb_2021_2050: sheet[`N${row}`]?.v || null,
      Extreme_Hot_Tdb_1991_2020: sheet[`O${row}`]?.v || null,
      Rain_15_min_mm: sheet[`P${row}`]?.v || null,
      Rain_15_min_mm_New: sheet[`Q${row}`]?.v || null,
      Rain_1_day_1_50mm: sheet[`R${row}`]?.v || null,
      Rain_1_day_1_50mm_New: sheet[`S${row}`]?.v || null,
      Rain_Annual_mm: sheet[`T${row}`]?.v || null,
      Rain_Annual_mm_New: sheet[`U${row}`]?.v || null,
      Moisture_Index_New: sheet[`V${row}`]?.v || null,
      Precip_Annual_mm: sheet[`W${row}`]?.v || null,
      Precip_Annual_mm_New: sheet[`X${row}`]?.v || null,
      Driving_Rain_Wind_Pa_1_5: sheet[`Y${row}`]?.v || null,
      Driving_Rain_Wind_Pa_1_5_New: sheet[`Z${row}`]?.v || null,
      Snow_kPa_1_50_Ss: sheet[`AA${row}`]?.v || null,
      Snow_kPa_1_50_Sr: sheet[`AB${row}`]?.v || null,
      Snow_kPa_1_1000_Ss: sheet[`AC${row}`]?.v || null,
      Snow_kPa_1_1000_Sr: sheet[`AD${row}`]?.v || null,
      Wind_Hourly_kPa_1_10: sheet[`AE${row}`]?.v || null,
      Wind_Hourly_kPa_1_10_New: sheet[`AF${row}`]?.v || null,
      Wind_Hourly_kPa_1_50: sheet[`AG${row}`]?.v || null,
      Wind_Hourly_kPa_1_50_New: sheet[`AH${row}`]?.v || null,
      Wind_Hourly_kPa_1_500_New: sheet[`AI${row}`]?.v || null,
      Winter_Tdb_Avg: sheet[`AJ${row}`]?.v || null,
      Winter_Windspeed_Avg: sheet[`AK${row}`]?.v || null,
      Summer_Tdb_Avg: sheet[`AL${row}`]?.v || null,
      Summer_Twb_Avg: sheet[`AM${row}`]?.v || null,
      Summer_RH_1500_LST: sheet[`AN${row}`]?.v || null,
    };
  }

  function updateProvinceDropdowns() {
    const provinceDropdowns = document.querySelectorAll(
      'select[data-dropdown-id="dd_d_19"]',
    );

    if (provinceDropdowns.length === 0) {
      // No province dropdowns found - they may not be rendered yet
    }

    if (locationData === null) {
      console.error(
        "Location data is null when trying to update province dropdowns",
      );
      showStatus("Error: No location data available", "error");
      return;
    }

    provinceDropdowns.forEach((dropdown) => {
      // Clear existing options except the first placeholder
      dropdown.innerHTML = '<option value="">Select Province</option>';

      // Add province options
      Object.keys(locationData).forEach((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = locationData[code].name;
        dropdown.appendChild(option);
      });

      // Add change handler
      dropdown.onchange = function () {
        updateCityDropdowns(this.value);
      };
    });
    showStatus("Province dropdowns updated successfully", "info");
  }

  function updateCityDropdowns(provinceCode) {
    const cityDropdowns = document.querySelectorAll(
      'select[data-dropdown-id="dd_h_19"]',
    );

    if (cityDropdowns.length === 0) {
      // No city dropdowns found - they may not be rendered yet
    }

    if (locationData === null) {
      console.error(
        "Location data is null when trying to update city dropdowns",
      );
      showStatus("Error: No location data available", "error");
      return;
    }

    if (!provinceCode) {
      console.warn("No province code provided when updating city dropdowns");
      showStatus("Please select a province first", "warning");
      return;
    }

    if (!locationData[provinceCode]) {
      console.error(`Province ${provinceCode} not found in location data`);
      showStatus(
        `Error: Province ${provinceCode} not found in location data`,
        "error",
      );
      return;
    }

    const cities = locationData[provinceCode].cities || [];

    cityDropdowns.forEach((dropdown) => {
      dropdown.innerHTML = '<option value="">Select City</option>'; // Clear existing options
      cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city.name;
        option.textContent = city.name;
        dropdown.appendChild(option);
      });
    });
    showStatus(
      `${cities.length} cities loaded for ${locationData[provinceCode].name}`,
      "info",
    );
  }

  function printLocationDataSummary() {
    if (!locationData) {
      return;
    }

    for (const province in locationData) {
      if (Object.prototype.hasOwnProperty.call(locationData, province)) {
        const cityCount = locationData[province].cities.length;
        if (cityCount > 0) {
          const _firstCity = locationData[province].cities[0];
        }
      }
    }
  }

  // Initialize when document is ready
  document.addEventListener("DOMContentLoaded", initialize);

  // Note: Moved init call to the bottom AFTER defining loadExcelFile
  /**
   * Reads an Excel file and processes location data.
   * @param {File} file - The Excel file object.
   * @returns {Promise<object>} A promise that resolves with the processed location data.
   */
  function loadExcelFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        return reject(new Error("No file selected"));
      }

      showStatus("Reading Excel file...", "info");
      const reader = new FileReader();

      reader.onload = function (e) {
        try {
          const data = e.target.result;
          // Use {cellDates: true} if date parsing is needed later
          const workbook = XLSX.read(data, { type: "binary" });

          // Process the data
          const processedData = processLocationData(workbook);

          // Trigger event for other modules (like init.js) to update UI
          document.dispatchEvent(new CustomEvent("location-data-ready"));

          resolve(processedData); // Resolve promise with data
        } catch (error) {
          console.error("Error processing Excel file:", error);
          showStatus(`Error processing file: ${error.message}`, "error");
          reject(error); // Reject promise on error
        }
      };

      reader.onerror = function (e) {
        console.error("Error reading file:", e);
        showStatus("Error reading file", "error");
        reject(new Error("File reading error"));
      };

      reader.readAsBinaryString(file);
    });
  }

  // Public API
  return {
    initialize,
    getLocationData: () => locationData,
    loadExcelFile, // Expose the file loading function
    updateProvinceDropdowns,
    updateCityDropdowns,
  };
})();
