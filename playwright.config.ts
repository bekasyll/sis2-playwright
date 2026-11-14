import { defineConfig, devices } from '@playwright/test';

/**
 * The application under test is a shared public demo. BASE_URL / API_URL can be
 * overridden to point the same suite at the deliberately buggy build
 * (see the "test:bugs" npm script).
 *
 * All CI behaviour is switched on by one variable, CI. GitHub Actions sets it
 * automatically; locally run `CI=true npx playwright test` to get the same config.
 */
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // shards split tests, not whole files
  forbidOnly: isCI, // a forgotten test.only fails CI instead of silently running one test
  retries: isCI ? 2 : 0, // in CI a flaky test is reported as flaky, not red; locally a failure must stay visible
  workers: isCI ? 2 : undefined, // GitHub runners have 2-4 vCPUs
  timeout: 60_000, // shared public server: allow for slow responses
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [
        ['list'],
        ['blob'], // one blob per shard; the merge-reports job turns them into one HTML report
        ['junit', { outputFile: 'reports/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test', // the Toolshop marks elements with data-test, not data-testid
    trace: 'on-first-retry', // trace of exactly the attempt that failed
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
