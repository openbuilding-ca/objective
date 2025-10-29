/**
 * 4011-MobileDetect.js
 * Mobile device detection for TEUI 4.011 Calculator
 *
 * This script detects iOS and Android mobile devices and applies mobile-specific optimizations
 * including loading the mobile CSS file and disabling features not supported on mobile.
 */

(function () {
  // Add to TEUI namespace
  window.TEUI = window.TEUI || {};

  /**
   * Detects if the current device is a mobile device (iOS or Android)
   * Uses a combination of user agent detection and screen size
   * @returns {boolean} True if the device is a mobile device
   */
  function isMobileDevice() {
    // User agent detection
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Check for iOS devices
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
      return true; // iOS device
    }

    // Check for Android devices
    if (/android/i.test(userAgent)) {
      return true; // Android device
    }

    // Additional check for small screen sizes typical of mobile devices
    if (window.innerWidth <= 768) {
      return true;
    }

    return false;
  }

  /**
   * Loads the mobile-specific CSS file
   */
  function loadMobileCSS() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "4011-MobileStyles.css";
    link.id = "mobile-styles";
    document.head.appendChild(link);
    console.log("Mobile CSS loaded");
  }

  /**
   * Applies mobile-specific optimizations
   * - Adds 'mobile' class to body
   * - Loads mobile CSS file
   * - Disables unsupported features
   */
  function applyMobileOptimizations() {
    // Add mobile class to body for CSS targeting
    document.body.classList.add("mobile");

    // Load mobile CSS
    loadMobileCSS();

    // Disable Excel import/export features
    disableExcelFeatures();

    // Set default to vertical layout for mobile
    document.body.classList.add("vertical-layout");
    document.body.classList.remove("horizontal-layout");

    console.log("Mobile optimizations applied");
  }

  /**
   * Disables Excel import/export features on mobile
   */
  function disableExcelFeatures() {
    // Hide Excel import/export buttons
    const excelButtons = [
      document.getElementById("selectExcelBtn"),
      document.getElementById("import-data-btn"),
      document.getElementById("export-data-btn"),
      document.getElementById("export-excel"),
    ];

    excelButtons.forEach((btn) => {
      if (btn) {
        btn.style.display = "none";
      }
    });

    // Add notice about disabled features if needed
    const downloadBtn = document.getElementById("downloadBtn");
    if (downloadBtn) {
      downloadBtn.setAttribute("title", "Some features disabled on mobile");
    }
  }

  /**
   * Initialize mobile detection and apply optimizations if on mobile device
   */
  function initialize() {
    if (isMobileDevice()) {
      console.log("Mobile device detected");
      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyMobileOptimizations);
      } else {
        applyMobileOptimizations();
      }
    } else {
      console.log("Desktop device detected");
    }
  }

  // Export functions to TEUI namespace
  window.TEUI.MobileDetect = {
    isMobileDevice: isMobileDevice,
    initialize: initialize,
  };

  // Automatically initialize on script load
  initialize();
})();
