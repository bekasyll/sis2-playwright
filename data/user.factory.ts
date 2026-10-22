/**
 * Test data factory. Every call returns a brand-new customer with a unique
 * email, so tests never collide with each other (parallel runs) or with
 * previous runs ("email already in use"), and never touch the shared seeded
 * accounts that other students also use.
 */
export interface Address {
  street: string;
  house_number: string;
  city: string;
  state: string;
  country: string; // ISO code, the value of the <option> in the country select
  postal_code: string;
}

export interface Customer {
  first_name: string;
  last_name: string;
  dob: string; // YYYY-MM-DD; the API requires age between 18 and 75
  phone: string;
  email: string;
  password: string;
  address: Address;
}

/** Password the API sets when "forgot password" is used (UserService::resetPassword). */
export const RESET_PASSWORD = 'welcome02';

function uniqueSuffix(): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${Date.now()}${random}`;
}

export function newCustomer(overrides: Partial<Customer> = {}): Customer {
  const id = uniqueSuffix();
  return {
    first_name: 'Sis',
    last_name: `Tester${id.slice(-5)}`, // API limit: last_name max 20 chars
    dob: '1995-05-15',
    phone: '77011234567',
    email: `sis2.${id}@example.com`,
    // Mixed case + digit + symbol + length >= 8, and random so the API's
    // "uncompromised password" check does not reject it.
    password: `Sis2!${id}Aa`,
    address: {
      street: 'Invalidenstrasse',
      house_number: '117',
      city: 'Berlin',
      state: 'Berlin',
      country: 'DE',
      postal_code: '10115', // must match the DE pattern: 5 digits
    },
    ...overrides,
  };
}
