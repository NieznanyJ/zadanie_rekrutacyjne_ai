import fs from 'node:fs';
import { test as base, expect, type Page } from '@playwright/test';
import { accounts } from './env';
import { SHARED_LOGIN_FAILED_MARKER } from './auth-paths';
import { CookieBanner } from './pages/CookieBanner';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PrescriptionConsultationPage } from './pages/PrescriptionConsultationPage';

type TestOptions = {
  loginAs: 'shared' | null;
};

type TestFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  prescriptionPage: PrescriptionConsultationPage;
};

export const test = base.extend<TestOptions & TestFixtures>({
  // Tests start logged in to the shared account; login tests opt out with test.use({ loginAs: null }).
  loginAs: ['shared', { option: true }],

  page: async ({ page, loginAs }, use) => {
    await new CookieBanner(page).acceptWhenShown();
    if (loginAs === 'shared') {
      await loginAsSharedUser(page);
    }
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  prescriptionPage: async ({ page }, use) => {
    await use(new PrescriptionConsultationPage(page));
  },
});

async function loginAsSharedUser(page: Page) {
  if (fs.existsSync(SHARED_LOGIN_FAILED_MARKER)) {
    throw new Error('Shared account login already failed in this run – not retrying (lockout risk)');
  }

  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  await loginPage.goto();
  await loginPage.login(accounts.shared.user, accounts.shared.password);
  await expect(homePage.mainMenu.or(loginPage.invalidCredentialsError).or(loginPage.lockoutError)).toBeVisible();
  if (!(await homePage.mainMenu.isVisible())) {
    fs.writeFileSync(SHARED_LOGIN_FAILED_MARKER, '');
    throw new Error('Shared account login failed – check SHARED_USER / SHARED_PASSWORD in .env');
  }
  // The main menu is rendered while the session is still loading; the booking button gets enabled only
  // once it is ready. Navigating away earlier leaves the app stuck on a loading spinner.
  await expect(homePage.bookButton).toBeEnabled();
}

export { expect };
