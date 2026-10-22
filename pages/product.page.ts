import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Product detail page (/product/:id). */
export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly unitPrice: Locator; // number only, e.g. "14.15" (the "$" is outside the element)
  private readonly quantity: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
  }

  async addToCart(quantity: number): Promise<void> {
    await this.quantity.fill(String(quantity));
    await this.addToCartButton.click();
  }
}
