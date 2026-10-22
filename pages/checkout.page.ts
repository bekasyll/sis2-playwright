import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Address } from '../data/user.factory';

/**
 * The four-step checkout wizard at /checkout:
 * 1 cart → 2 sign in → 3 billing address → 4 payment.
 */
export class CheckoutPage extends BasePage {
  // step 1: cart
  readonly lineTitle: Locator;
  readonly lineQuantity: Locator;
  readonly linePrice: Locator;
  private readonly proceedFromCart: Locator;
  // step 2: sign in (already signed in → just continue)
  private readonly proceedSignedIn: Locator;
  // step 3: address
  private readonly street: Locator;
  private readonly houseNumber: Locator;
  private readonly city: Locator;
  private readonly state: Locator;
  private readonly country: Locator;
  private readonly postalCode: Locator;
  private readonly proceedFromAddress: Locator;
  // step 4: payment
  private readonly paymentMethod: Locator;
  private readonly finishButton: Locator;
  readonly paymentSuccess: Locator;
  /** The confirmation shows the invoice number, e.g. "INV-2026000123". */
  readonly invoiceNumber: Locator;

  constructor(page: Page) {
    super(page);
    this.lineTitle = page.getByTestId('product-title');
    this.lineQuantity = page.getByTestId('product-quantity');
    this.linePrice = page.getByTestId('line-price');
    this.proceedFromCart = page.getByTestId('proceed-1');
    this.proceedSignedIn = page.getByTestId('proceed-2');
    this.street = page.getByTestId('street');
    this.houseNumber = page.getByTestId('house_number');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.proceedFromAddress = page.getByTestId('proceed-3');
    this.paymentMethod = page.getByTestId('payment-method');
    this.finishButton = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
    // Matched on the invoice-number format, not on the "Thanks for your order"
    // wording, so the locator survives copy changes and translation.
    this.invoiceNumber = page.getByText(/INV-\d+/);
  }

  async proceedToSignIn(): Promise<void> {
    await this.proceedFromCart.click();
  }

  async continueAsSignedInCustomer(): Promise<void> {
    await this.proceedSignedIn.click();
  }

  async enterBillingAddress(address: Address): Promise<void> {
    await this.country.selectOption(address.country);
    await this.postalCode.fill(address.postal_code);
    await this.houseNumber.fill(address.house_number);
    await this.street.fill(address.street);
    await this.city.fill(address.city);
    await this.state.fill(address.state);
    await this.proceedFromAddress.click();
  }

  /** First click on "Check payment": the payment is validated, not yet ordered. */
  async payCashOnDelivery(): Promise<void> {
    await this.paymentMethod.selectOption('cash-on-delivery');
    await this.finishButton.click();
  }

  /** Second click on the same button, now labelled "Confirm": places the order. */
  async confirmOrder(): Promise<void> {
    await this.finishButton.click();
  }
}
