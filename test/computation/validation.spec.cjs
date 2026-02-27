// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * Validation Test - Compares old StateManager values to new ComputationGraph values
 *
 * This test loads the main application (which initializes StateManager with data)
 * then creates a new ComputationGraph and compares computed values.
 */

test.describe('Computation System Validation', () => {
  test('compare old vs new computation values', async ({ page }) => {
    // Navigate to the main app using file:// URL
    const fileUrl = 'file://' + path.join(__dirname, '../../index.html');
    await page.goto(fileUrl);

    // Wait for app to fully load (StateManager should exist and have values)
    await page.waitForFunction(() => {
      return window.TEUI?.StateManager?.getValue !== undefined;
    }, { timeout: 30000 });

    // Wait a bit more for calculations to settle
    await page.waitForTimeout(2000);

    // Run validation comparison inside the browser
    const results = await page.evaluate(async () => {
      const StateManager = window.TEUI.StateManager;

      // Field mappings to compare
      const FIELD_MAPPINGS = {
        // Climate (S03)
        'climate.heating.degreedays': 'd_20',
        'climate.cooling.degreedays': 'd_21',
        'climate.zone': 'd_19',

        // Building (S02)
        'building.conditionedFloorArea': 'd_12',

        // Volume (S12)
        'volume.conditioned': 'd_105',
        'envelope.airFacing.area': 'd_101',
        'envelope.groundFacing.area': 'd_102',
        'envelope.airFacing.uValue': 'g_101',
        'envelope.groundFacing.uValue': 'g_102',

        // Transmission Loss (S11)
        'transmissionLoss.thermalBridgePenalty': 'd_97',
        'transmissionLoss.components.subtotalHeatLoss': 'i_98',
        'transmissionLoss.thermalBridgePenalty.heatLoss': 'i_97',

        // Ventilation (S13)
        'ventilation.volumetricRate': 'd_120',
        'ventilation.grossHeatLoss': 'd_121',
        'ventilation.netHeatLoss': 'm_121',

        // Key Values
        'energy.teui': 'k_6',
        'energy.tedi': 'h_6',
        'emissions.ghgi': 'h_8',
      };

      // Create computation system
      const graph = window.TEUI.ComputationGraph.create();

      // Register all nodes
      const nodes = window.TEUI.ComputationNodes || {};
      const moduleOrder = [
        'Climate', 'BuildingInfo', 'Envelope', 'Mechanical',
        'SpaceHeating', 'WaterHeating', 'Renewable', 'Energy',
        'Forestry', 'Emissions', 'Occupancy',
        'RadiantGains', 'TransmissionLoss', 'VolumeMetrics', 'Ventilation',
        'KeyValues'
      ];

      let moduleCount = 0;
      for (const name of moduleOrder) {
        if (nodes[name]) {
          nodes[name].register(graph);
          moduleCount++;
        }
      }

      // Create state and sync from StateManager
      const state = window.TEUI.MultiModelState.create();
      const targetMeta = window.TEUI.ModelMetadata.createTarget('Validation');
      state.addModel(targetMeta);

      // Sync inputs
      const inputIds = graph.getAllInputIds ? graph.getAllInputIds() : [];
      let syncCount = 0;
      const syncedValues = {};

      for (const semanticPath of inputIds) {
        const inputNode = graph.getInput(semanticPath);
        const legacyId = inputNode?.legacyId;

        if (legacyId) {
          const value = StateManager.getValue(legacyId);
          if (value !== undefined && value !== null && value !== '') {
            state.setValueForModel(targetMeta.id, semanticPath, value);
            syncCount++;
            // Track some key values for debugging
            if (['d_97', 'd_101', 'd_102', 'd_120', 'd_20'].includes(legacyId)) {
              syncedValues[legacyId] = value;
            }
          }
        }
      }

      // Compute
      const engine = window.TEUI.MultiModelEngine.create({ state, graph });
      const computeResult = engine.computeAllForModel(targetMeta.id);

      // Compare values
      const comparisons = [];
      let matchCount = 0;
      let closeCount = 0;
      let mismatchCount = 0;
      let missingCount = 0;

      function parseNum(value, defaultVal = 0) {
        if (value === null || value === undefined || value === 'N/A' || value === 'Unavailable') return defaultVal;
        const num = parseFloat(String(value).replace(/,/g, ''));
        return isNaN(num) ? defaultVal : num;
      }

      for (const [semanticPath, legacyId] of Object.entries(FIELD_MAPPINGS)) {
        const oldValue = StateManager.getValue(legacyId);
        const newValue = state.getValue(semanticPath);

        const comparison = {
          semanticPath,
          legacyId,
          oldValue: oldValue,
          newValue: newValue,
          status: 'missing',
          diff: null
        };

        if (oldValue === undefined || oldValue === null || oldValue === '' || oldValue === 'N/A') {
          comparison.status = 'missing';
          missingCount++;
        } else if (newValue === undefined || newValue === null) {
          comparison.status = 'missing';
          missingCount++;
        } else {
          const oldNum = parseNum(oldValue);
          const newNum = parseNum(newValue);

          if (isNaN(oldNum) || isNaN(newNum)) {
            if (String(oldValue) === String(newValue)) {
              comparison.status = 'match';
              matchCount++;
            } else {
              comparison.status = 'mismatch';
              mismatchCount++;
            }
          } else {
            const diff = Math.abs(oldNum - newNum);
            const relDiff = oldNum !== 0 ? (diff / Math.abs(oldNum)) * 100 : (diff === 0 ? 0 : 100);
            comparison.diff = relDiff;

            if (diff < 0.001 || relDiff < 0.01) {
              comparison.status = 'match';
              matchCount++;
            } else if (relDiff < 1) {
              comparison.status = 'close';
              closeCount++;
            } else {
              comparison.status = 'mismatch';
              mismatchCount++;
            }
          }
        }

        comparisons.push(comparison);
      }

      return {
        moduleCount,
        syncCount,
        syncedValues,
        computedNodes: computeResult.computedNodes,
        duration: computeResult.duration,
        total: comparisons.length,
        matchCount,
        closeCount,
        mismatchCount,
        missingCount,
        comparisons: comparisons.filter(c => c.status !== 'match') // Only return non-matches for brevity
      };
    });

    // Log results
    console.log('\n=== VALIDATION RESULTS ===');
    console.log(`Modules loaded: ${results.moduleCount}`);
    console.log(`Values synced: ${results.syncCount}`);
    console.log(`Nodes computed: ${results.computedNodes} in ${results.duration.toFixed(2)}ms`);
    console.log('\nSynced key values:', JSON.stringify(results.syncedValues, null, 2));
    console.log('\n--- Comparison Summary ---');
    console.log(`Total fields: ${results.total}`);
    console.log(`✓ Exact match: ${results.matchCount}`);
    console.log(`~ Close (<1%): ${results.closeCount}`);
    console.log(`✗ Mismatch: ${results.mismatchCount}`);
    console.log(`? Missing: ${results.missingCount}`);

    if (results.comparisons.length > 0) {
      console.log('\n--- Non-matching Fields ---');
      for (const c of results.comparisons) {
        const diffStr = c.diff !== null ? ` (${c.diff.toFixed(2)}% diff)` : '';
        console.log(`[${c.status.toUpperCase()}] ${c.legacyId} (${c.semanticPath}): OLD=${c.oldValue} NEW=${c.newValue}${diffStr}`);
      }
    }

    // Assertions
    expect(results.moduleCount).toBeGreaterThan(10);
    expect(results.syncCount).toBeGreaterThan(50);

    // Log match rate
    const matchRate = ((results.matchCount + results.closeCount) / (results.total - results.missingCount) * 100).toFixed(1);
    console.log(`\nMatch rate: ${matchRate}%`);
  });
});
