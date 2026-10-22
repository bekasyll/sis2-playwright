import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-submit');
    this.error = page.getByTestId('login-error');
  }

  async open(): Promise<void> {
    await this.page.goto('/auth/login');
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.submit.click();
  }
}
