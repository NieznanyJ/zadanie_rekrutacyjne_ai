import { randomUUID } from 'node:crypto';
import { test, expect } from './fixtures';
import { accounts } from './env';

test.describe('login', () => {
  test.use({ loginAs: null });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('logs in with valid email and password', async ({ page, loginPage, homePage }) => {
    await loginPage.login(accounts.shared.user, accounts.shared.password);

    await expect(homePage.mainMenu).toBeVisible();
    await expect(homePage.bookButton).toBeVisible();
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('shows required field errors when submitting empty form', async ({ page, loginPage }) => {
    await loginPage.submitButton.click();

    await expect(loginPage.requiredFieldErrors).toHaveCount(2);
    await expect(page).toHaveURL(/\/login/);
  });

  test('rejects non-existent user', async ({ page, loginPage }) => {
    const nonExistentUser = `nonexistent-${randomUUID()}@example.com`;

    await loginPage.login(nonExistentUser, `Wrong-${randomUUID()}`);

    await expect(loginPage.invalidCredentialsError).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  // Counts towards the 5-attempt lockout of the own account – runs once, never repeated.
  test('rejects wrong password for existing account', { tag: '@lockout-risk' }, async ({ page, loginPage }) => {
    await loginPage.login(accounts.own.user, `Wrong-${randomUUID()}`);

    // Shared email - choose correct account by pesel
    await loginPage.chooseAccountByPesel(accounts.own.pesel);

    await expect(loginPage.invalidCredentialsError).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('switches language to English', async ({ page, loginPage }) => {
    await loginPage.changeLanguage('EN');

    await expect(page).toHaveURL(/\/en\/login/);
  });

  test('logs in to account chosen by PESEL when email has many accounts', async ({ loginPage, homePage }) => {
    await loginPage.login(accounts.own.user, accounts.own.password);
    await expect(loginPage.chooseAccountDialog).toBeVisible();

    await loginPage.chooseAccountByPesel(accounts.own.pesel);

    await expect(homePage.mainMenu).toBeVisible();
  });
});
