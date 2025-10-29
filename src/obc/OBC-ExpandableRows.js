/**
 * OBC-ExpandableRows.js
 * Universal expandable rows utility for OBC Matrix
 *
 * Allows any section to have expandable/collapsible rows using simple class names
 * and data attributes, with automatic data persistence and state management.
 */

window.OBC = window.OBC || {};

window.OBC.ExpandableRows = (function () {
  // Track all expandable row groups across the application
  const expandableGroups = new Map();

  /**
   * Hook into FieldManager to insert expandable controls during cell generation
   * This function will be called by FieldManager when processing column A cells
   */
  function processExpandableTriggerCell(
    cellElement,
    cellDef,
    rowId,
    sectionId,
  ) {
    // Check if this cell should have expandable controls
    if (
      cellDef.classes &&
      cellDef.classes.includes("expandable-row-trigger") &&
      cellDef.attributes
    ) {
      const groupId = cellDef.attributes["data-expandable-group"];
      if (groupId) {
        // console.log(`🔍 PROCESSING EXPANDABLE TRIGGER: ${groupId} in ${sectionId} for row ${rowId}`);

        // Initialize group if not already done - FIX RECURSION
        if (!expandableGroups.has(groupId)) {
          // Mark group as being initialized to prevent recursion
          expandableGroups.set(groupId, { initializing: true });
          initializeExpandableGroup(groupId, sectionId, cellDef.attributes);
        }

        // Insert the expandable controls directly into the cell
        const controlsHtml = `
          <div class="expandable-controls" data-group="${groupId}">
            <button class="btn btn-sm btn-outline-secondary expandable-add-btn" 
                    onclick="window.OBC.ExpandableRows.addRow('${groupId}')" 
                    title="Add additional row">
                    +
            </button>
            <button class="btn btn-sm btn-outline-secondary expandable-remove-btn" 
                    onclick="window.OBC.ExpandableRows.removeRow('${groupId}')" 
                    title="Remove last row" 
                    style="display: none;">
                    −
            </button>
          </div>
        `;

        cellElement.innerHTML = controlsHtml;

        // Add CSS if not already added
        addExpandableRowsCSS();

        // Visibility initialization now handled by initializeExpandableGroup after config is complete

        // console.log(`✅ EXPANDABLE CONTROLS INSERTED for ${groupId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Initialize a specific expandable group
   */
  function initializeExpandableGroup(groupId, sectionId, attributes) {
    // console.log(`🔍 INITIALIZING GROUP: ${groupId} in section ${sectionId}`);

    // Check if group is already fully initialized (prevent recursion)
    const existing = expandableGroups.get(groupId);
    if (existing && existing.expandableRows) {
      console.log(
        `🔍 GROUP ${groupId} already fully initialized, skipping duplicate`,
      );
      return;
    }

    // If it's just the placeholder, continue with initialization
    if (existing && existing.initializing) {
      // Continue with initialization
    }

    const config = {
      groupId: groupId,
      sectionId: sectionId,
      expandableRows: (attributes["data-expandable-rows"] || "")
        .split(",")
        .filter((id) => id.trim()),
      defaultVisible: parseInt(attributes["data-default-visible"] || "1", 10),
      maxRows: 0, // Will be calculated
      currentVisible: 0,
    };

    // console.log(`🔍 GROUP INIT: Config for ${groupId}:`, config);

    // Calculate max rows (default + expandable)
    config.maxRows = config.defaultVisible + config.expandableRows.length;

    // Load saved state or use default
    config.currentVisible = loadGroupState(groupId) || config.defaultVisible;

    // console.log(`🔍 GROUP INIT: Final config for ${groupId}:`, config);

    // Store final configuration (replaces initializing placeholder)
    expandableGroups.set(groupId, config);

    // console.log(`✅ GROUP INIT: Successfully initialized expandable group: ${groupId}`, config);

    // Schedule visibility initialization now that config is complete
    setTimeout(() => {
      initializeGroupVisibility(groupId);
    }, 150);
  }

  /**
   * Add CSS styles for expandable rows
   */
  function addExpandableRowsCSS() {
    if (!document.getElementById("expandable-rows-css")) {
      const style = document.createElement("style");
      style.id = "expandable-rows-css";
      style.textContent = `
        /* Universal expandable rows styling */
        .expandable-row-trigger {
          text-align: center !important;
          vertical-align: middle !important;
          padding: 2px !important;
          width: 70px !important;
        }
        
        .expandable-controls {
          display: flex !important;
          gap: 2px !important;
          justify-content: center !important;
          align-items: center !important;
        }
        
        .expandable-add-btn,
        .expandable-remove-btn {
          border: 1px solid #6c757d !important;
          border-radius: 4px !important;
          padding: 2px 6px !important;
          font-size: 14px !important;
          font-weight: bold !important;
          min-width: 24px !important;
          height: 24px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          transition: all 0.2s ease !important;
          color: #6c757d !important;
          background-color: white !important;
          margin: 0 !important;
        }
        
        .expandable-add-btn:hover,
        .expandable-remove-btn:hover {
          background-color: #f8f9fa !important;
          border-color: #495057 !important;
          color: #495057 !important;
          transform: scale(1.05) !important;
        }
        
        .expandable-add-btn:active,
        .expandable-remove-btn:active {
          transform: scale(0.95) !important;
        }
        
        /* Color differentiation */
        .expandable-add-btn {
          border-color: #28a745 !important;
          color: #28a745 !important;
        }
        
        .expandable-add-btn:hover {
          background-color: #d4edda !important;
          border-color: #1e7e34 !important;
          color: #1e7e34 !important;
        }
        
        .expandable-remove-btn {
          border-color: #dc3545 !important;
          color: #dc3545 !important;
        }
        
        .expandable-remove-btn:hover {
          background-color: #f8d7da !important;
          border-color: #bd2130 !important;
          color: #bd2130 !important;
        }
        
        /* Expandable row cells that contain controls */
        .data-table .expandable-row-trigger {
          width: 70px !important;
          min-width: 70px !important;
          max-width: 70px !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Initialize visibility for a group based on saved state
   */
  function initializeGroupVisibility(groupId) {
    const config = expandableGroups.get(groupId);
    if (!config) return;

    // Safety check: ensure config is fully initialized (not just placeholder)
    if (config.initializing || !config.expandableRows) {
      console.log(`🔍 VISIBILITY INIT SKIPPED: ${groupId} config not ready`);
      return;
    }

    // console.log(`🔍 INITIALIZING VISIBILITY for ${groupId}: current=${config.currentVisible}, default=${config.defaultVisible}, expandableRows:`, config.expandableRows);

    // Hide all expandable rows initially
    config.expandableRows.forEach((rowId) => {
      const rowElement = document.querySelector(`tr[data-id="${rowId}"]`);
      if (rowElement) {
        rowElement.style.display = "none";
        // console.log(`🔍 Hidden row ${rowId}`);
      } else {
        console.warn(`🔍 Row ${rowId} not found in DOM`);
      }
    });

    // Show the appropriate number of rows based on saved state
    const targetVisible = config.currentVisible;
    config.currentVisible = config.defaultVisible; // Reset to base

    // console.log(`🔍 Will show ${targetVisible} rows total (default: ${config.defaultVisible})`);

    for (let i = config.defaultVisible; i < targetVisible; i++) {
      const rowIndex = i - config.defaultVisible;
      if (rowIndex < config.expandableRows.length) {
        const rowId = config.expandableRows[rowIndex];
        const rowElement = document.querySelector(`tr[data-id="${rowId}"]`);
        if (rowElement) {
          rowElement.style.display = "";
          config.currentVisible++;
          // console.log(`🔍 Showed row ${rowId} (${config.currentVisible}/${config.maxRows})`);
        }
      }
    }

    // Update button visibility
    updateButtonVisibility(groupId);
  }

  /**
   * Add one row to an expandable group
   */
  function addRow(groupId) {
    const config = expandableGroups.get(groupId);
    if (!config || config.currentVisible >= config.maxRows) return;

    // console.log(`🔍 ADDING ROW to ${groupId}: current=${config.currentVisible}, max=${config.maxRows}`);

    // Show next hidden row
    const nextRowIndex = config.currentVisible - config.defaultVisible;
    const rowId = config.expandableRows[nextRowIndex];
    const rowElement = document.querySelector(`tr[data-id="${rowId}"]`);

    if (rowElement) {
      rowElement.style.display = "";
      config.currentVisible++;
      updateButtonVisibility(groupId);
      saveGroupState(groupId, config.currentVisible);
      // console.log(`✅ Added row ${rowId} (${config.currentVisible}/${config.maxRows})`);
    }
  }

  /**
   * Remove one row from an expandable group
   */
  function removeRow(groupId) {
    const config = expandableGroups.get(groupId);
    if (!config || config.currentVisible <= config.defaultVisible) return;

    // console.log(`🔍 REMOVING ROW from ${groupId}: current=${config.currentVisible}, default=${config.defaultVisible}`);

    // Hide last visible row
    const lastRowIndex = config.currentVisible - config.defaultVisible - 1;
    const rowId = config.expandableRows[lastRowIndex];
    const rowElement = document.querySelector(`tr[data-id="${rowId}"]`);

    if (rowElement) {
      rowElement.style.display = "none";
      config.currentVisible--;
      updateButtonVisibility(groupId);
      saveGroupState(groupId, config.currentVisible);
      // console.log(`✅ Removed row ${rowId} (${config.currentVisible}/${config.maxRows})`);
    }
  }

  /**
   * Update button visibility for a group
   */
  function updateButtonVisibility(groupId) {
    const config = expandableGroups.get(groupId);
    if (!config) return;

    const addBtn = document.querySelector(
      `.expandable-add-btn[onclick*="${groupId}"]`,
    );
    const removeBtn = document.querySelector(
      `.expandable-remove-btn[onclick*="${groupId}"]`,
    );

    if (addBtn) {
      addBtn.style.display =
        config.currentVisible < config.maxRows ? "inline-flex" : "none";
    }

    if (removeBtn) {
      removeBtn.style.display =
        config.currentVisible > config.defaultVisible ? "inline-flex" : "none";
    }

    // console.log(`🔍 BUTTON VISIBILITY for ${groupId}: add=${config.currentVisible < config.maxRows ? 'visible' : 'hidden'}, remove=${config.currentVisible > config.defaultVisible ? 'visible' : 'hidden'}`);
  }

  /**
   * Save group state to localStorage
   */
  function saveGroupState(groupId, visibleCount) {
    try {
      localStorage.setItem(
        `OBC_ExpandableRows_${groupId}`,
        visibleCount.toString(),
      );
    } catch (e) {
      console.warn(`Could not save state for expandable group ${groupId}:`, e);
    }
  }

  /**
   * Load group state from localStorage
   */
  function loadGroupState(groupId) {
    try {
      const saved = localStorage.getItem(`OBC_ExpandableRows_${groupId}`);
      return saved ? parseInt(saved, 10) : null;
    } catch (e) {
      console.warn(`Could not load state for expandable group ${groupId}:`, e);
      return null;
    }
  }

  /**
   * Get all expandable rows for a group (for calculations that need to include hidden rows)
   */
  function getAllRowsInGroup(groupId) {
    const config = expandableGroups.get(groupId);
    if (!config) return [];

    // Return IDs of all rows (default + expandable)
    return config.expandableRows;
  }

  /**
   * Check if a row is currently visible
   */
  function isRowVisible(rowId) {
    const rowElement = document.querySelector(`tr[data-id="${rowId}"]`);
    return rowElement ? rowElement.style.display !== "none" : false;
  }

  // Public API
  return {
    processExpandableTriggerCell: processExpandableTriggerCell,
    addRow: addRow,
    removeRow: removeRow,
    getAllRowsInGroup: getAllRowsInGroup,
    isRowVisible: isRowVisible,

    // For debugging
    getGroupConfig: (groupId) => expandableGroups.get(groupId),
    getAllGroups: () => Array.from(expandableGroups.keys()),
  };
})();

// Initialize CSS when loaded
document.addEventListener("DOMContentLoaded", function () {
  // console.log('🔍 EXPANDABLE ROWS: DOM ready, system loaded');
});
