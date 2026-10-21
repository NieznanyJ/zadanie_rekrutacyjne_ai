import type { Locator, Page } from '@playwright/test';

export class PrescriptionConsultationPage {
  readonly drugSearchInput: Locator;
  readonly drugSuggestions: Locator;
  readonly firstDrugSuggestion: Locator;
  readonly summaryHeading: Locator;
  readonly selectedDrugPackage: Locator;
  readonly selectAllConsentsLabel: Locator;
  readonly contactConsent: Locator;
  readonly noPrescriptionGuaranteeConsent: Locator;
  readonly attendanceConsent: Locator;

  constructor(readonly page: Page) {
    // The search combobox has no accessible name (a11y issue); it is the only combobox on the page
    this.drugSearchInput = page.getByRole('combobox');
    this.drugSuggestions = page.getByRole('listbox');
    this.firstDrugSuggestion = this.drugSuggestions.getByRole('option').first();
    this.summaryHeading = page.getByRole('heading', { name: 'Twoja konsultacja z e-receptą' });
    this.selectedDrugPackage = page.getByText(/^opakowanie:/);
    // The checkbox inputs are hidden behind custom styling – users (and tests) click the label text
    this.selectAllConsentsLabel = page.getByText('Zaznacz wszystkie', { exact: true });
    // Consents are located by a stable prefix, so text assertions can report the full wording
    this.contactConsent = page.getByRole('checkbox', { name: /^Jestem świadomy\/a, że po wypełnieniu formularza/ });
    this.noPrescriptionGuaranteeConsent = page.getByRole('checkbox', { name: /^Rozumiem, że umówienie e-konsultacji/ });
    this.attendanceConsent = page.getByRole('checkbox', { name: /^Rozumiem, że jestem zobowiąz/ });
  }

  async goto() {
    await this.page.goto('make-prescription-consultation');
  }

  async searchDrug(name: string) {
    await this.drugSearchInput.click();
    await this.drugSearchInput.fill(name);
  }

  async chooseDrug(name: string, option: string) {
    await this.searchDrug(name);
    await this.drugSuggestions.getByRole('option', { name: option, exact: true }).click();
  }

  async acceptAllConsents() {
    await this.selectAllConsentsLabel.click();
  }
}
