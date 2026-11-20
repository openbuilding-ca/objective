// @ts-check
const { defineConfig, devices } = require("@playwright/test");

// The specs open the app over http (test/static-server.cjs): the ISO 52016-1
// cooling fetches each location's climate station, which a file:// page
// cannot, so over file:// the suite passed without the cooling ever running.
const PORT = Number(process.env.TEST_PORT) || 8771;
const BASE_URL = `http://127.0.0.1:${PORT}`;

/**
 * Playwright configuration for OBJECTIVE Calculator tests
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: "./test",
  testMatch: "**/*.spec.cjs",

  // Maximum time one test can run (2 min for 12 case study reloads)
  timeout: 120 * 1000,

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use (open: 'never' prevents auto-opening browser)
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],

  use: {
    // Base URL for all tests
    baseURL: BASE_URL,

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Screenshot only on failure
    screenshot: "only-on-failure",
  },

  // Serve the repo root for the run. Never reuse a server already on the
  // port: it may be serving another checkout.
  webServer: {
    command: `node test/static-server.cjs ${PORT}`,
    url: `${BASE_URL}/index.html`,
    reuseExistingServer: false,
  },

  // Configure projects for major browsers
  projects: [
    // Chromium has SIGSEGV crashes on macOS - use webkit
    // {
    //   name: "chromium",
    //   use: { ...devices["Desktop Chrome"] },
    // },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
