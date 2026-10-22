import { defineConfig, devices } from '@playwright/test';

/**
 * The application under test is a shared public demo. BASE_URL / API_URL can be
 * overridden to point the same suite at the deliberately buggy build
 * (see the "test:bugs" npm script).
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0, // retry only in CI; locally a failure must stay visible
  workers: process.env.CI ? 2 : undefined,
  timeout: 60_000, // shared public server: allow for slow responses
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test', // the Toolshop marks elements with data-test, not data-testid
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
