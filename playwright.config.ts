import { defineConfig, devices } from '@playwright/test';

const BASE_URL = 'https://agentic-check-mvpapp.telemedi.com/submit/public/qa';

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
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  /* No retries: failed-login tests must never be repeated (shared account lockout). */
  retries: 0,
  reporter: 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
