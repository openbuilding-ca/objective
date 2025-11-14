/**
 * ToggleUISync - Centralized utility for synchronizing Reference/Target toggle UI
 *
 * This module provides a single source of truth for toggle UI synchronization
 * across all dual-state sections (S02-S16), eliminating code duplication.
 *
 * @module ToggleUISync
 */

window.TEUI = window.TEUI || {};

window.TEUI.ToggleUISync = {
  /**
   * Synchronizes toggle UI elements to match the current mode
   *
   * @param {Object} toggleElements - DOM elements to sync
   * @param {HTMLElement} toggleElements.toggleSwitch - The main toggle switch element
   * @param {HTMLElement} toggleElements.slider - The slider element inside the toggle
   * @param {HTMLElement} toggleElements.stateIndicator - The text indicator showing current state
   * @param {string} mode - Current mode: "target" or "reference"
   * @param {string} sectionId - Section identifier for logging (e.g., "S02", "S16")
   * @param {boolean} [debugMode] - Enable debug logging (reads from window.TEUI.config.debugReferenceMode if not specified)
   */
  syncToggleUI(toggleElements, mode, sectionId, debugMode = null) {
    // Use global debug config if not explicitly provided
    if (debugMode === null) {
      debugMode = window.TEUI?.config?.debugReferenceMode || false;
    }

    // Early return if toggle elements not initialized
    if (!toggleElements) {
      if (debugMode) {
        console.warn(
          `[${sectionId}] Toggle elements not yet initialized, skipping UI sync`
        );
      }
      return;
    }

    const { toggleSwitch, slider, stateIndicator } = toggleElements;
    const isReference = mode === "reference";

    // Update toggle switch visual state to match mode
    toggleSwitch.classList.toggle("active", isReference);

    if (isReference) {
      slider.style.transform = "translateX(20px)";
      toggleSwitch.style.backgroundColor = "#28a745";
      stateIndicator.textContent = "REFERENCE";
      stateIndicator.style.backgroundColor = "rgba(40, 167, 69, 0.7)";
    } else {
      slider.style.transform = "translateX(0px)";
      toggleSwitch.style.backgroundColor = "#ccc";
      stateIndicator.textContent = "TARGET";
      stateIndicator.style.backgroundColor = "rgba(0, 123, 255, 0.5)";
    }

    // Optional debug logging
    if (debugMode) {
      console.log(
        `[${sectionId}] Synced toggle UI to ${mode.toUpperCase()} mode`
      );
    }
  },
};
