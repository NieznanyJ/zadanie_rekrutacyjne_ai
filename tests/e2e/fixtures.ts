import fs from 'node:fs';
import { test as base, expect, type Page } from '@playwright/test';
import { accounts } from './env';
import { loginFailedMarker } from './auth-paths';
import { CookieBanner } from './pages/CookieBanner';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { PrescriptionConsultationPage } from './pages/PrescriptionConsultationPage';

type Account = 'shared' | 'own';

type TestOptions = {
  loginAs: Account | null;
};

type TestFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  prescriptionPage: PrescriptionConsultationPage;
};

export const test = base.extend<TestOptions & TestFixtures>({
  // Tests start logged in to the shared account; login tests opt out with test.use({ loginAs: null }),
  // tests on the candidate's own account use test.use({ loginAs: 'own' }).
  loginAs: ['shared', { option: true }],

  page: async ({ page, loginAs }, use) => {
    await new CookieBanner(page).acceptWhenShown();
    if (loginAs) {
      await logIn(page, loginAs);
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

async function logIn(page: Page, account: Account) {
  const marker = loginFailedMarker(account);
  if (fs.existsSync(marker)) {
    throw new Error(`Login to the ${account} account already failed in this run – not retrying (lockout risk)`);
  }

  const { user, password } = accounts[account];
  const loginPage = new LoginPage(page);
  const homePage = new HomePage(page);
  await loginPage.goto();
  await loginPage.login(user, password);
  // The lockout message can be shown together with the account picker (it may concern the other account
  // linked to the same email), so wait for any outcome instead of exactly one element.
  await expect(
    homePage.mainMenu
      .or(loginPage.chooseAccountDialog)
      .or(loginPage.invalidCredentialsError)
      .or(loginPage.lockoutError),
  ).not.toHaveCount(0);
  if (await loginPage.chooseAccountDialog.isVisible()) {
    // The own account's email is linked to more than one account
    await loginPage.chooseAccountByPesel(accounts.own.pesel);
  } else if (await loginPage.lockoutError.isVisible()) {
    fs.writeFileSync(marker, '');
    throw new Error(`The ${account} account is temporarily locked (too many failed logins) – try again in 5 minutes`);
  } else if (!(await homePage.mainMenu.isVisible())) {
    fs.writeFileSync(marker, '');
    throw new Error(`Login to the ${account} account failed – check its credentials in .env`);
  }
  // The main menu is rendered while the session is still loading; the booking button gets enabled only
  // once it is ready. Navigating away earlier leaves the app stuck on a loading spinner.
  await expect(homePage.bookButton).toBeEnabled();
}

export { expect };
