import fs from 'node:fs';
import { test as base, expect } from '@playwright/test';
import { accounts } from './env';
import { SHARED_LOGIN_FAILED_MARKER, sharedStorageStatePath } from './auth-paths';
import { CookieBanner } from './pages/CookieBanner';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';

type TestFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
};

type WorkerFixtures = {
  workerStorageState: string;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  page: async ({ page }, use) => {
    await new CookieBanner(page).acceptWhenShown();
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  // Tests get the shared account session by default; login tests opt out with an empty storageState.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // One fresh login to the shared account per worker.
  workerStorageState: [
    async ({ browser }, use, workerInfo) => {
      if (fs.existsSync(SHARED_LOGIN_FAILED_MARKER)) {
        throw new Error('Shared account login already failed in another worker – not retrying (lockout risk)');
      }

      const { baseURL } = workerInfo.project.use;
      if (!baseURL) {
        throw new Error('baseURL is not set in playwright.config.ts');
      }
      const statePath = sharedStorageStatePath(workerInfo.parallelIndex);
      const context = await browser.newContext({
        baseURL,
        storageState: { cookies: [], origins: [] },
      });
      const page = await context.newPage();
      await new CookieBanner(page).acceptWhenShown();
      const loginPage = new LoginPage(page);
      const homePage = new HomePage(page);

      await loginPage.goto();
      await loginPage.login(accounts.shared.user, accounts.shared.password);
      await expect(homePage.mainMenu.or(loginPage.invalidCredentialsError).or(loginPage.lockoutError)).toBeVisible();
      if (!(await homePage.mainMenu.isVisible())) {
        fs.writeFileSync(SHARED_LOGIN_FAILED_MARKER, '');
        await context.close();
        throw new Error('Shared account login failed – check SHARED_USER / SHARED_PASSWORD in .env');
      }

      await context.storageState({ path: statePath });
      await context.close();
      await use(statePath);
    },
    { scope: 'worker' },
  ],
});

export { expect };
