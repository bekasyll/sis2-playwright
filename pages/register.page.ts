import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { Customer } from '../data/user.factory';

export class RegisterPage extends BasePage {
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly dob: Locator;
  private readonly country: Locator;
  private readonly postalCode: Locator;
  private readonly houseNumber: Locator;
  private readonly street: Locator;
  private readonly city: Locator;
  private readonly state: Locator;
  private readonly phone: Locator;
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.dob = page.getByTestId('dob');
    this.country = page.getByTestId('country');
    this.postalCode = page.getByTestId('postal_code');
    this.houseNumber = page.getByTestId('house_number');
    this.street = page.getByTestId('street');
    this.city = page.getByTestId('city');
    this.state = page.getByTestId('state');
    this.phone = page.getByTestId('phone');
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('register-submit');
    this.error = page.getByTestId('register-error');
  }

  async open(): Promise<void> {
    await this.page.goto('/auth/register');
  }

  /**
   * Fills the form in on-screen order. Country is chosen before the postal code
   * because the postal code is validated against the selected country's format.
   */
  async register(customer: Customer): Promise<void> {
    await this.firstName.fill(customer.first_name);
    await this.lastName.fill(customer.last_name);
    await this.dob.fill(customer.dob);
    await this.country.selectOption(customer.address.country);
    await this.postalCode.fill(customer.address.postal_code);
    await this.houseNumber.fill(customer.address.house_number);
    await this.street.fill(customer.address.street);
    await this.city.fill(customer.address.city);
    await this.state.fill(customer.address.state);
    await this.phone.fill(customer.phone);
    await this.email.fill(customer.email);
    await this.password.fill(customer.password);
    await this.submit.click();
  }
}
