import type { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly mainMenu: Locator;
  readonly bookButton: Locator;

  constructor(readonly page: Page) {
    this.mainMenu = page.getByRole('navigation', { name: 'Menu główne' });
    this.bookButton = page.getByRole('button', { name: 'Umów się' });
  }
}
