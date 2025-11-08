// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

/**
 * Observer Pattern Architecture Tests
 *
 * These tests run the HTML test suite in a headless browser
 * and verify that all tests pass.
 */

test.describe('Observer Pattern - StateManager & ZenMaster', () => {
  test('all test suite tests should pass', async ({ page }) => {
    // Navigate to the test suite HTML file
    const testFile = 'file://' + path.join(__dirname, 'test-suite.html');
    await page.goto(testFile);

    // Wait for tests to complete (summary should be populated)
    await page.waitForSelector('#total-tests:not(:empty)', { timeout: 10000 });

    // Extract test results
    const total = await page.locator('#total-tests').textContent();
    const passed = await page.locator('#passed-tests').textContent();
    const failed = await page.locator('#failed-tests').textContent();

    const totalTests = parseInt(total || '0');
    const passedTests = parseInt(passed || '0');
    const failedTests = parseInt(failed || '0');

    // Log results for CI visibility
    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed, ${failedTests} failed\n`);

    // If there are failures, extract the failure details
    if (failedTests > 0) {
      const failedTestElements = await page.locator('.test-case.failed').all();

      for (const testElement of failedTestElements) {
        const testName = await testElement.locator('.test-name').textContent();
        const errorMessage = await testElement.locator('.test-error').textContent();
        console.error(`\n❌ Failed: ${testName}`);
        console.error(`   Error: ${errorMessage}\n`);
      }
    }

    // Assert all tests passed
    expect(failedTests, `${failedTests} test(s) failed - see details above`).toBe(0);
    expect(passedTests).toBeGreaterThan(0);
    expect(totalTests).toBe(passedTests + failedTests);
  });

  test('StateManager should have observer methods', async ({ page }) => {
    const testFile = 'file://' + path.join(__dirname, 'test-suite.html');
    await page.goto(testFile);

    // Wait for StateManager to load
    await page.waitForFunction(() => window.TEUI?.StateManager !== undefined);

    // Verify observer API exists
    const hasObserverAPI = await page.evaluate(() => {
      const sm = window.TEUI.StateManager;
      return (
        typeof sm.addObserver === 'function' &&
        typeof sm.removeObserver === 'function'
      );
    });

    expect(hasObserverAPI).toBe(true);
  });

  test('ZenMaster should implement observer interface', async ({ page }) => {
    const testFile = 'file://' + path.join(__dirname, 'test-suite.html');
    await page.goto(testFile);

    // Wait for ZenMaster to load
    await page.waitForFunction(() => window.TEUI?.ZenMaster !== undefined);

    // Verify ZenMaster has observer methods
    const hasObserverMethods = await page.evaluate(() => {
      const zenMaster = new window.TEUI.ZenMaster();
      return (
        typeof zenMaster.onGetValue === 'function' &&
        typeof zenMaster.onSetValue === 'function'
      );
    });

    expect(hasObserverMethods).toBe(true);
  });
});
