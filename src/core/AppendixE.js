// 4011-AppendixE.js
// Placeholder for Appendix E definitions from STANDARDIZED-STATES.md
// This will define field-specific behaviors in Reference Mode,
// such as the ability to edit sections while in Reference Mode, to 'try on' scenarios.

window.TEUI = window.TEUI || {};

TEUI.AppendixE = {
  /**
   * Returns an object of Reference Mode Default values.
   * Keys are fieldIds, values are their default values in Reference Mode.
   * These are applied BEFORE standard-specific overrides.
   */
  getReferenceModeDefaults: function () {
    // This will be populated based on STANDARDIZED-STATES.md Appendix E
    // Example:
    // return {
    //     "d_97": "0.05", // Default 5% thermal bridge penalty in Ref Mode
    //     "d_80": "NRC 50%" // Default Net Useable Gains Method
    // };
    return {}; // Placeholder: No specific RefMode defaults defined yet
  },

  /**
   * Determines the behavior category of a field when in Reference Mode.
   * @param {string} fieldId - The ID of the field.
   * @param {string} currentStandardKey - The key of the currently active reference standard.
   * @returns {string} Behavior category, e.g., "Directly Set by Standard",
   *                   "Carry-Over from Application State", "Reference Mode Default",
   *                   "Independently User-Editable in Reference Mode".
   */
  getFieldBehavior: function (fieldId, currentStandardKey) {
    // This logic will become more sophisticated as Appendix E is detailed.
    // For now, a simplistic placeholder logic:

    // Example: Define a few fields as independently editable in Reference Mode
    const independentlyEditableInRefMode = [
      "h_12", // Reporting Year - allows different reporting years for Reference vs Design
      "d_13", // Reference Standard - must always be editable in Reference Mode
      "d_39", // Building Typology (S05) - allows different typology for Reference vs Design
      "d_49", // Water Use Method (S07) - allows different water method for Reference vs Design
      "e_49", // User Defined Water Use (S07) - editable when d_49 = "User Defined" in Reference Mode
      "d_53", // DWHR Efficiency (S07) - independently selectable in Reference Mode
      // "d_68", // Example: Elevators (S09)
      // "g_67"  // Example: Equipment Efficiency level (S09)
    ];
    if (independentlyEditableInRefMode.includes(fieldId)) {
      return "Independently User-Editable in Reference Mode";
    }

    // Check if the standard explicitly defines this field
    if (
      TEUI.ReferenceValues &&
      TEUI.ReferenceValues[currentStandardKey] &&
      Object.prototype.hasOwnProperty.call(
        TEUI.ReferenceValues[currentStandardKey],
        fieldId,
      )
    ) {
      return "Directly Set by Standard";
    }

    // Check if it has a Reference Mode Default (that wasn't overridden by standard)
    const refModeDefaults = this.getReferenceModeDefaults();
    if (Object.prototype.hasOwnProperty.call(refModeDefaults, fieldId)) {
      // This logic is a bit circular if not careful.
      // loadReferenceData applies defaults THEN standard. So if standard DIDN'T define it,
      // AND it had a RefModeDefault, it implies the default stuck.
      // For styling, it implies it was set by a non-application-state source.
      return "Reference Mode Default";
    }

    // Default assumption: Carried over from application state and should be locked
    // unless specified as independently editable.
    return "Carry-Over from Application State";
  },
};
