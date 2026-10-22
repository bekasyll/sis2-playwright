import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { ProductSummary } from './product-list.page';

/** Side-by-side comparison (/comparison). One column per product. */
export class ComparisonPage extends BasePage {
  readonly table: Locator;
  readonly productNames: Locator;
  readonly prices: Locator;

  constructor(page: Page) {
    super(page);
    this.table = page.getByTestId('comparison-table');
    this.productNames = this.table.getByTestId('product-name');
    this.prices = this.table.getByTestId('compare-price');
  }

  /**
   * Reads the table column by column and pairs each product with the price in
   * the same column. Call only after the table has the expected number of
   * columns (assert that first), because this is a one-off read.
   */
  async columns(): Promise<ProductSummary[]> {
    const names = (await this.productNames.allInnerTexts()).map((n) => n.trim());
    const prices = (await this.prices.allInnerTexts()).map((p) => p.trim());
    return names.map((name, i) => ({ name, price: prices[i] }));
  }
}
