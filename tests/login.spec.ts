import { test, expect } from '../fixtures/pages.fixture';

test.describe('TC-2 Log in', () => {
  test('valid credentials open the account page and show the customer as signed in', async ({ loginPage, page, existingCustomer }) => {
    await loginPage.open();
    await loginPage.signIn(existingCustomer.email, existingCustomer.password);

    await expect(page).toHaveURL(/\/account/);
    await expect(loginPage.userMenu).toContainText(`${existingCustomer.first_name} ${existingCustomer.last_name}`);
  });

  test('a wrong password shows an error and does not sign the customer in', async ({ loginPage, page, existingCustomer }) => {
    // One wrong attempt only: the API locks an account after 3 failures.
    await loginPage.open();
    await loginPage.signIn(existingCustomer.email, `${existingCustomer.password}-wrong`);

    await expect(loginPage.error).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(loginPage.signInLink).toBeVisible();
  });
});
