import { test, expect } from '../fixtures/pages.fixture';
import { newCustomer } from '../data/user.factory';

test.describe('TC-1 Register a new customer', () => {
  test('a new customer registers and is sent to the login page with a working account', async ({ registerPage, page, api }) => {
    const customer = newCustomer(); // unique email every run

    await registerPage.open();
    await registerPage.register(customer);

    await expect(page).toHaveURL(/\/auth\/login/);
    // The redirect alone does not prove an account was created:
    // the credentials just typed must now be accepted.
    expect(await api.loginStatus(customer.email, customer.password)).toBe(200);
  });

  test('registration with an email that is already in use is rejected', async ({ registerPage, page, existingCustomer }) => {
    const duplicate = newCustomer({ email: existingCustomer.email });

    await registerPage.open();
    await registerPage.register(duplicate);

    await expect(registerPage.error).toContainText(/already/i);
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
