import { test, expect } from '../fixtures/pages.fixture';
import { formatPrice, parsePrice } from '../data/money';

test.describe('TC-3 Buy a product', () => {
  test('a signed-in customer buys two units of a product and receives an invoice number', async ({
    signedInCustomer, productListPage, productPage, checkoutPage,
  }) => {
    const quantity = 2;

    await productListPage.open();
    const product = await productListPage.openFirstBuyableProduct();
    await expect(productPage.name).toHaveText(product.name);

    await productPage.addToCart(quantity);
    await expect(productPage.cartQuantity).toHaveText(String(quantity));

    // The cart shows the right item, quantity and line price.
    await productPage.openCart();
    await expect(checkoutPage.lineTitle).toContainText(product.name);
    await expect(checkoutPage.lineQuantity).toHaveValue(String(quantity));
    await expect(checkoutPage.linePrice).toHaveText(formatPrice(parsePrice(product.price) * quantity));

    // Checkout completes.
    await checkoutPage.proceedToSignIn();
    await checkoutPage.continueAsSignedInCustomer();
    await checkoutPage.enterBillingAddress(signedInCustomer.address);
    await checkoutPage.payCashOnDelivery();
    await expect(checkoutPage.paymentSuccess).toBeVisible();

    await checkoutPage.confirmOrder();
    await expect(checkoutPage.invoiceNumber).toBeVisible();
  });
});
