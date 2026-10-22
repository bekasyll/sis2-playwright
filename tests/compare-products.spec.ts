import { test, expect } from '../fixtures/pages.fixture';
import { ProductSummary } from '../pages/product-list.page';

const byName = (a: ProductSummary, b: ProductSummary) => a.name.localeCompare(b.name);

test.describe('TC-4 Compare two products', () => {
  test('the comparison page shows exactly the two selected products, each with its catalogue price', async ({
    productListPage, comparisonPage,
  }) => {
    await productListPage.open();
    const selected = await productListPage.selectForComparison(2);
    await expect(productListPage.comparisonBar).toContainText('2');

    await productListPage.openComparison();
    await expect(comparisonPage.productNames).toHaveCount(2);

    // Statement under test: same two products, and each price on the comparison
    // page is the price the catalogue showed for that same product
    // (paired per column, so swapped prices would fail).
    const columns = await comparisonPage.columns();
    expect([...columns].sort(byName)).toEqual([...selected].sort(byName));
  });
});
