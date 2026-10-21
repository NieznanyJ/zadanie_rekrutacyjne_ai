import type { Locator, Page } from '@playwright/test';

export class RemoteConsultationPage {
  readonly specializationSearch: Locator;
  readonly specializationOptions: Locator;
  readonly noResultsMessage: Locator;

  constructor(readonly page: Page) {
    // The combobox has no accessible name – the "Wyszukaj..." placeholder is not linked to it (a11y issue);
    // it is the only combobox on the page
    this.specializationSearch = page.getByRole('combobox');
    this.specializationOptions = page.getByRole('listbox').getByRole('option');
    this.noResultsMessage = page.getByText('Brak wyników');
  }

  async goto() {
    await this.page.goto('make-consultation');
  }

  waitForSpecializations() {
    return this.page.waitForResponse(
      (response) => response.url().includes('/api/v2/specializations') && response.url().includes('validate=true'),
    );
  }

  async openSpecializationList() {
    await this.specializationSearch.click();
  }
}
