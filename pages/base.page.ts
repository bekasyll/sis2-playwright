import { Locator, Page } from '@playwright/test';

/** Elements of the shared header that every screen has. */
export abstract class BasePage {
  readonly signInLink: Locator;
  readonly userMenu: Locator;
  readonly cartQuantity: Locator;
  readonly cartLink: Locator;
  /** Cloudflare's "verify you are human" page that replaces the site for some visitors (e.g. GitHub runner IPs). */
  private readonly botCheck: Locator;

  constructor(protected readonly page: Page) {
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu'); // shows "<first name> <last name>" when signed in
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.cartLink = page.getByTestId('nav-cart');
    this.botCheck = page.getByRole('heading', { name: 'Performing security verification' });
  }

  /**
   * True when Cloudflare showed its bot check instead of the page. Waits until either the
   * signed-in header or the bot check appears; if neither does, returns false and the
   * test's own assertion reports the real failure.
   */
  async isBlockedByBotCheck(): Promise<boolean> {
    try {
      await this.userMenu.or(this.botCheck).first().waitFor({ state: 'visible', timeout: 10_000 });
    } catch {
      return false;
    }
    return this.botCheck.isVisible();
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
