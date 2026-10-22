import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  private readonly email: Locator;
  private readonly submit: Locator;
  /**
   * The success and the error banner have no data-test attribute; both are
   * rendered with role="alert", which is what a screen reader announces.
   * Note: both banners fade out after 3 seconds (fadeOutMessage in the app),
   * so assertions on them must be web-first (retrying), never a one-off read.
   */
  readonly alert: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.submit = page.getByTestId('forgot-password-submit');
    this.alert = page.getByRole('alert');
  }

  async open(): Promise<void> {
    await this.page.goto('/auth/forgot-password');
  }

  async requestReset(email: string): Promise<void> {
    await this.email.fill(email);
    await this.submit.click();
  }
}
