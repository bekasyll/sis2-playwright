import { test, expect } from '../fixtures/pages.fixture';
import { newCustomer, RESET_PASSWORD } from '../data/user.factory';

test.describe('TC-5 Reset a password', () => {
  test('a known email gets a confirmation and the password is really replaced', async ({ forgotPasswordPage, existingCustomer, api }) => {
    // A fresh customer, never the seeded one: on this application a reset
    // replaces the password with "welcome02" for everybody who uses that account.
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(existingCustomer.email);

    await expect(forgotPasswordPage.alert).toBeVisible();
    // The banner proves only that something was shown. The effect must be checked:
    expect(await api.loginStatus(existingCustomer.email, RESET_PASSWORD)).toBe(200);
    expect(await api.loginStatus(existingCustomer.email, existingCustomer.password)).not.toBe(200);
  });

  test('an unknown email is rejected with an error', async ({ forgotPasswordPage }) => {
    const neverRegistered = newCustomer().email;

    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(neverRegistered);

    await expect(forgotPasswordPage.alert).toContainText(/invalid/i);
  });
});
