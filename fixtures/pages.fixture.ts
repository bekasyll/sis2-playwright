import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { ProductListPage } from '../pages/product-list.page';
import { ProductPage } from '../pages/product.page';
import { ComparisonPage } from '../pages/comparison.page';
import { CheckoutPage } from '../pages/checkout.page';
import { ToolshopApi } from '../api/toolshop.api';
import { Customer, newCustomer } from '../data/user.factory';

type Fixtures = {
  // page objects
  loginPage: LoginPage;
  registerPage: RegisterPage;
  forgotPasswordPage: ForgotPasswordPage;
  productListPage: ProductListPage;
  productPage: ProductPage;
  comparisonPage: ComparisonPage;
  checkoutPage: CheckoutPage;
  // data and helpers
  api: ToolshopApi;
  /** A brand-new customer that already exists in the system (created via the API). */
  existingCustomer: Customer;
  /** Like existingCustomer, and the browser is already signed in as them. */
  signedInCustomer: Customer;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  forgotPasswordPage: async ({ page }, use) => { await use(new ForgotPasswordPage(page)); },
  productListPage: async ({ page }, use) => { await use(new ProductListPage(page)); },
  productPage: async ({ page }, use) => { await use(new ProductPage(page)); },
  comparisonPage: async ({ page }, use) => { await use(new ComparisonPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },

  api: async ({ request }, use) => { await use(new ToolshopApi(request)); },

  /**
   * Why not the seeded customer@practicesoftwaretesting.com?
   *  - The site is shared: anyone's "forgot password" run resets that account
   *    to welcome02, and three wrong passwords lock it.
   *  - A test must create its own data (week 5: independent, deterministic).
   * Creating the account through the API takes ~1 s instead of a UI form.
   */
  existingCustomer: async ({ api }, use) => {
    const customer = newCustomer();
    await api.registerCustomer(customer);
    await use(customer);
  },

  /**
   * Signs in through the API and puts the token where the web app keeps it
   * (localStorage "auth-token") before any page loads. Only the login test
   * signs in through the UI, because login is its subject.
   */
  signedInCustomer: async ({ api, page, existingCustomer }, use) => {
    const token = await api.loginToken(existingCustomer.email, existingCustomer.password);
    await page.addInitScript((value) => {
      window.localStorage.setItem('auth-token', value);
    }, token);
    await use(existingCustomer);
  },
});

export { expect } from '@playwright/test';
