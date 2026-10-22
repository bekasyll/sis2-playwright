import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductSummary {
  name: string;
  price: string; // as displayed, e.g. "$14.15"
}

/** The catalogue on the home page. */
export class ProductListPage extends BasePage {
  /** Every product card. A card is the link that contains a product name. */
  readonly cards: Locator;
  readonly comparisonBar: Locator;
  private readonly compareLink: Locator;

  constructor(page: Page) {
    super(page);
    this.cards = page.getByRole('link').filter({ has: page.getByTestId('product-name') });
    this.comparisonBar = page.getByTestId('comparison-bar');
    this.compareLink = page.getByTestId('compare-link');
  }

  async open(): Promise<void> {
    await this.page.goto('/');
    // Wait for real cards, not the loading skeletons.
    await expect(this.cards.first()).toBeVisible();
  }

  /**
   * Cards that can be bought at the plain catalogue price:
   * in stock and without a discount. Chosen by what the card says,
   * not by a hard-coded product name that the shared data may change.
   */
  private plainPricedInStock(): Locator {
    return this.cards
      .filter({ hasNot: this.page.getByTestId('out-of-stock') })
      .filter({ hasNot: this.page.getByTestId('product-discount-price') });
  }

  async summaryOf(card: Locator): Promise<ProductSummary> {
    const name = (await card.getByTestId('product-name').innerText()).trim();
    const price = (await card.getByTestId('product-price').innerText()).trim();
    return { name, price };
  }

  /** Opens the first buyable product and returns what the catalogue said about it. */
  async openFirstBuyableProduct(): Promise<ProductSummary> {
    const card = this.plainPricedInStock().first();
    const summary = await this.summaryOf(card);
    await card.click();
    return summary;
  }

  /** Marks the first `count` buyable products for comparison; returns their summaries. */
  async selectForComparison(count: number): Promise<ProductSummary[]> {
    const selected: ProductSummary[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.plainPricedInStock().nth(i);
      selected.push(await this.summaryOf(card));
      await card.getByTestId('compare-btn').click();
    }
    return selected;
  }

  async openComparison(): Promise<void> {
    await this.compareLink.click();
  }
}
