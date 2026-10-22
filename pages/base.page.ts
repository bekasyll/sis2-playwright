import { Locator, Page } from '@playwright/test';

/** Elements of the shared header that every screen has. */
export abstract class BasePage {
  readonly signInLink: Locator;
  readonly userMenu: Locator;
  readonly cartQuantity: Locator;
  readonly cartLink: Locator;

  constructor(protected readonly page: Page) {
    this.signInLink = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu'); // shows "<first name> <last name>" when signed in
    this.cartQuantity = page.getByTestId('cart-quantity');
    this.cartLink = page.getByTestId('nav-cart');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
