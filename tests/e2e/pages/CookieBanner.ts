import type { Locator, Page } from '@playwright/test';

export class CookieBanner {
  readonly acceptButton: Locator;

  constructor(readonly page: Page) {
    this.acceptButton = page.getByRole('button', { name: 'Akceptuję' });
  }

  /** The banner can appear at any time and cover other elements – accept it whenever it shows up. */
  async acceptWhenShown() {
    await this.page.addLocatorHandler(this.acceptButton, async (button) => {
      await button.click();
    });
  }
}
