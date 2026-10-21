import { defineConfig, devices } from '@playwright/test';

// Trailing slash is required: page.goto('login') must resolve to /pl/login, not /login.
const BASE_URL = 'https://testyautomatyczne.telemedi.com/pl/';

// Credentials live in a local, uncommitted .env file. A missing file is fine
// (e.g. on CI the variables come from the environment).
try {
  process.loadEnvFile();
} catch {
  // no .env file – rely on variables already present in process.env
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/e2e/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  /* No retries: failed-login tests must never be repeated (shared account lockout). */
  retries: 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'html',
  use: {
    baseURL: BASE_URL,
    // Traces record fill() values (passwords) and the CI report is a downloadable artifact – keep them local only.
    trace: process.env.CI ? 'off' : 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
