/**
 * TEUI Performance Clock - Real-time calculation timing display
 * Displays in Key Values header feedback area: Init vs Current calculation times
 * Author: TEUI Development Team
 * Version: 4.012RF
 */

window.TEUI = window.TEUI || {};

window.TEUI.Clock = {
  initTime: null,
  initDisplayed: false,

  /**
   * Initialize performance tracking
   * Called once during app startup
   */
  init() {
    // Initialize global timing namespace
    if (!window.TEUI.timing) {
      window.TEUI.timing = {
        initStartTime: null,
        currentStartTime: null,
        isInitialLoad: true,
      };
    }

    console.log("[CLOCK] Performance monitoring initialized");
  },

  /**
   * Start timing measurement
   * @param {boolean} isInitialLoad - True for first app load, false for subsequent calculations
   */
  startTiming(isInitialLoad = false) {
    const now = performance.now();

    if (isInitialLoad) {
      window.TEUI.timing.initStartTime = now;
      window.TEUI.timing.isInitialLoad = true;
      console.log("[CLOCK] Starting initial load timing");
    } else {
      window.TEUI.timing.currentStartTime = now;
      console.log("[CLOCK] Starting current calculation timing");
    }
  },

  /**
   * End timing measurement and update display
   * @param {boolean} isInitialLoad - True for first app load, false for subsequent calculations
   */
  endTiming(isInitialLoad = false) {
    const now = performance.now();

    if (isInitialLoad && window.TEUI.timing.initStartTime) {
      this.initTime = now - window.TEUI.timing.initStartTime;
      this.initDisplayed = true;
      window.TEUI.timing.isInitialLoad = false;
      console.log(
        `🕐 [CLOCK] ⭐ INITIALIZATION COMPLETE: ${this.initTime.toFixed(0)}ms (all calculations finalized)`,
      );
    } else if (window.TEUI.timing.currentStartTime) {
      const currentTime = now - window.TEUI.timing.currentStartTime;
      window.TEUI.timing.lastCalculationTime = currentTime;
      console.log(
        `🕐 [CLOCK] ⚡ CALCULATION COMPLETE: ${currentTime.toFixed(0)}ms (subsequent update)`,
      );
    }

    this.updateDisplay();
  },

  /**
   * Update the visual display in Key Values header
   */
  updateDisplay() {
    const feedbackArea = document.getElementById("feedback-area");
    if (!feedbackArea) {
      console.warn("[CLOCK] Feedback area not found - cannot display timing");
      return;
    }

    let displayText = "";

    if (this.initTime && this.initDisplayed) {
      // Show initialization time (persistent)
      displayText = `Load: ${this.formatTime(this.initTime)}`;

      // Add current time if we have recent calculation data
      if (window.TEUI.timing.lastCalculationTime) {
        displayText += ` | Current: ${this.formatTime(window.TEUI.timing.lastCalculationTime)}`;
      }
    } else if (window.TEUI.timing.initStartTime) {
      // Show ongoing initialization
      const elapsed = performance.now() - window.TEUI.timing.initStartTime;
      displayText = `Loading: ${this.formatTime(elapsed)}...`;
    }

    // Apply styling for white text and proper formatting
    feedbackArea.innerHTML = displayText;
    feedbackArea.style.color = "white";
    feedbackArea.style.fontSize = "0.8rem";
    feedbackArea.style.fontFamily = "monospace";
    feedbackArea.style.whiteSpace = "nowrap";
  },

  /**
   * Format milliseconds for display
   * @param {number} ms - Milliseconds to format
   * @returns {string} Formatted time string
   */
  formatTime(ms) {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      return `${Math.round(ms)}ms`;
    }
  },

  /**
   * Convenience method for marking calculation start
   * Automatically determines if this is initial load or subsequent calculation
   */
  markCalculationStart() {
    const isInitial = window.TEUI.timing.isInitialLoad && !this.initDisplayed;
    this.startTiming(isInitial);
  },

  /**
   * Convenience method for marking calculation end
   * Automatically determines if this is initial load or subsequent calculation
   */
  markCalculationEnd() {
    const isInitial = window.TEUI.timing.isInitialLoad && !this.initDisplayed;
    this.endTiming(isInitial);
  },

  /**
   * Mark start of user interaction (dropdown, slider, input change)
   * This tracks user-perceived performance: interaction → h_10 settlement
   */
  markUserInteractionStart() {
    if (this.initDisplayed) {
      // Only track subsequent interactions after init
      window.TEUI.timing.currentStartTime = performance.now();
      console.log(
        "[CLOCK] 🎯 User interaction started - timing to h_10 settlement",
      );
    }
  },

  /**
   * Mark end of user interaction chain (called from S01 h_10 completion)
   * This gives us the real user-perceived calculation time
   */
  markUserInteractionEnd() {
    if (this.initDisplayed && window.TEUI.timing.currentStartTime) {
      const currentTime =
        performance.now() - window.TEUI.timing.currentStartTime;
      window.TEUI.timing.lastCalculationTime = currentTime;
      console.log(
        `🕐 [CLOCK] ⚡ USER INTERACTION COMPLETE: ${currentTime.toFixed(0)}ms (interaction → h_10 settlement)`,
      );
      this.updateDisplay();
    }
  },

  /**
   * Reset timing for new session (useful for testing)
   */
  reset() {
    this.initTime = null;
    this.initDisplayed = false;
    window.TEUI.timing = {
      initStartTime: null,
      currentStartTime: null,
      isInitialLoad: true,
    };
    console.log("[CLOCK] Performance timing reset");
  },
};

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.TEUI.Clock.init();
  });
} else {
  window.TEUI.Clock.init();
}

// Note: User interaction timing now handled automatically by StateManager integration
