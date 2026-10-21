import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly identifierInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly invalidCredentialsError: Locator;
  readonly requiredFieldErrors: Locator;
  readonly lockoutError: Locator;
  readonly chooseAccountDialog: Locator;
  readonly languageSwitcher: Locator;
  readonly languageMenu: Locator;

  constructor(readonly page: Page) {
    this.identifierInput = page.getByRole('textbox', { name: 'E-mail, PESEL lub identyfikator' });
    // exact: the password-visibility toggle ("zmień widoczność hasła") is next to the field
    this.passwordInput = page.getByRole('textbox', { name: 'Hasło', exact: true });
    // exact: there is also a "Zaloguj się" heading and a "Zaloguj się bez hasła" button
    this.submitButton = page.getByRole('button', { name: 'Zaloguj się', exact: true });
    this.invalidCredentialsError = page.getByText('Nieprawidłowe dane logowania');
    this.requiredFieldErrors = page.getByText('Pole jest wymagane', { exact: true });
    this.lockoutError = page.getByText('Wystąpiło więcej niż 5 nieudanych prób logowania');
    // The dialog has no accessible name, so it is identified by its heading
    this.chooseAccountDialog = page
      .getByRole('dialog')
      .filter({ has: page.getByRole('heading', { name: 'Wybierz konto' }) });
    // The language switcher is exposed as "Profil użytkownika" (misleading accessible name)
    this.languageSwitcher = page.getByRole('button', { name: 'Profil użytkownika' });
    this.languageMenu = page.getByRole('menu');
  }

  async goto() {
    await this.page.goto('login');
  }

  async login(identifier: string, password: string) {
    await this.identifierInput.fill(identifier);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async changeLanguage(languageCode: string) {
    await this.languageSwitcher.click();
    await this.languageMenu.getByRole('button', { name: languageCode, exact: true }).click();
  }

  /** Picks an account in the "Wybierz konto" dialog by its masked PESEL (*********XY). */
  async chooseAccountByPesel(pesel: string) {
    const maskedPesel = `*********${pesel.slice(-2)}`;
    await this.chooseAccountDialog
      .getByRole('row')
      .filter({ has: this.page.getByRole('cell', { name: maskedPesel, exact: true }) })
      .getByRole('button', { name: 'Wybierz' })
      .click();
  }
}
