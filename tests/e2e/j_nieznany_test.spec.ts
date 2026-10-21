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

test.describe('prescription consultation', () => {
  test('shows summary for drug found by search', async ({ homePage, prescriptionPage }) => {
    await homePage.goto();
    await homePage.startPrescriptionConsultation();

    await prescriptionPage.chooseDrug('Zyrtec', 'Zyrtec, Cetirizini dihydrochloridum, 10 mg, 30 tabl.');
    await expect(prescriptionPage.summaryHeading).toBeVisible();
    await expect(prescriptionPage.selectedDrugPackage).toHaveText('opakowanie: 30 tabl.');

    await prescriptionPage.acceptAllConsents();
    await expect(prescriptionPage.contactConsent).toBeChecked();
    await expect(prescriptionPage.noPrescriptionGuaranteeConsent).toBeChecked();
    await expect(prescriptionPage.attendanceConsent).toBeChecked();
  });

  test.describe('drug search keyboard support', () => {
    test.beforeEach(async ({ prescriptionPage }) => {
      await prescriptionPage.goto();
      await prescriptionPage.searchDrug('Zyrtec');
      await expect(prescriptionPage.drugSuggestions).toBeVisible();
    });

    // Typing highlights the first suggestion, so one ArrowDown selects the second one
    // (suggestion order comes from the e-prescription search API).
    test('selects drug with arrow keys and Enter', async ({ page, prescriptionPage }) => {
      await expect(prescriptionPage.firstDrugSuggestion).toHaveAccessibleName(/^Zyrtec,/);

      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');

      await expect(prescriptionPage.summaryHeading).toBeVisible();
      await expect(prescriptionPage.selectedDrugPackage).toHaveText('opakowanie: 1 butelka 10 ml');
    });

    test('clears search input with Escape', async ({ page, prescriptionPage }) => {
      await page.keyboard.press('Escape');

      await expect(prescriptionPage.drugSearchInput).toHaveValue('');
      await expect(prescriptionPage.summaryHeading).toBeHidden();
    });
  });

  test('shows correctly worded consents', { tag: '@known-bug' }, async ({ prescriptionPage }) => {
    await prescriptionPage.goto();
    await prescriptionPage.chooseDrug('Zyrtec', 'Zyrtec, Cetirizini dihydrochloridum, 10 mg, 30 tabl.');

    await expect
      .soft(prescriptionPage.contactConsent)
      .toHaveAccessibleName(
        'Jestem świadomy/a, że po wypełnieniu formularza oraz umówieniu konsultacji lekarskiej lekarz może się ze mną kontaktować telefonicznie lub na czacie.*',
      );
    await expect
      .soft(prescriptionPage.noPrescriptionGuaranteeConsent)
      .toHaveAccessibleName(
        'Rozumiem, że umówienie e-konsultacji nie gwarantuje otrzymania wnioskowanej recepty. Lekarz stawia diagnozę na podstawie deklarowanych objawów oraz decyduje o ilości i dawkowaniu.*',
      );
    // Known bug: "zobowiązny/a" instead of "zobowiązany/a", "odebranie" instead of "odebrania",
    // missing comma after "jeśli tego nie zrobię"
    await expect
      .soft(prescriptionPage.attendanceConsent)
      .toHaveAccessibleName(
        'Rozumiem, że jestem zobowiązany/a do wejścia w konsultację czat z lekarzem lub odebrania połączenia. Jestem świadomy/a, że jeśli tego nie zrobię, nie ma podstaw do reklamacji w przypadku niewystawienia recepty.*',
      );
  });
});

test.describe('remote consultation (own account)', () => {
  test.use({ loginAs: 'own' });

  // Known bug BUG-01: the specializations API (validate=true) returns an empty list for this account,
  // so the user cannot pick any specialization. Expected to fail until the bug is fixed.
  test('shows available online specializations (BUG-01)', { tag: '@known-bug' }, async ({ remoteConsultationPage }) => {
    const specializationsResponse = remoteConsultationPage.waitForSpecializations();
    await remoteConsultationPage.goto();

    const body: { total: number } = await (await specializationsResponse).json();
    expect.soft(body.total).toBeGreaterThan(0);

    await remoteConsultationPage.openSpecializationList();
    await expect(remoteConsultationPage.noResultsMessage).toBeHidden();
    await expect(remoteConsultationPage.specializationOptions).not.toHaveCount(0);
  });
});
