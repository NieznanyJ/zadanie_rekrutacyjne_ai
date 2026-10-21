import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly mainMenu: Locator;
  readonly bookButton: Locator;
  readonly bookingMenu: Locator;

  constructor(readonly page: Page) {
    this.mainMenu = page.getByRole('navigation', { name: 'Menu główne' });
    this.bookButton = page.getByRole('button', { name: 'Umów się' });
    this.bookingMenu = page.getByRole('navigation', { name: 'Menu umawiania konsultacji' });
  }

  async goto() {
    await this.page.goto('');
  }

  async startPrescriptionConsultation() {
    await this.bookButton.click();
    await this.bookingMenu.getByRole('button', { name: 'Recepta' }).click();
  }
}
