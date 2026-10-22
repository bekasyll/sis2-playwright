import { APIRequestContext, expect } from '@playwright/test';
import { Customer } from '../data/user.factory';

/**
 * Thin client for the Toolshop REST API.
 * Used for two things only:
 *   1. Arranging data fast (create a customer without clicking through the form).
 *   2. Checking outcomes the UI cannot prove on its own
 *      (e.g. "the new password really works").
 * The behaviour under test is always exercised through the UI.
 */
export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  async registerCustomer(customer: Customer): Promise<void> {
    const response = await this.request.post(`${API_URL}/users/register`, { data: customer });
    expect(response.status(), `register ${customer.email}: ${await response.text()}`).toBe(201);
  }

  /** Returns the HTTP status of a login attempt (200 = credentials accepted). */
  async loginStatus(email: string, password: string): Promise<number> {
    const response = await this.request.post(`${API_URL}/users/login`, { data: { email, password } });
    return response.status();
  }

  /** Logs in and returns the bearer token the web app keeps in localStorage. */
  async loginToken(email: string, password: string): Promise<string> {
    const response = await this.request.post(`${API_URL}/users/login`, { data: { email, password } });
    expect(response.status(), `login ${email}: ${await response.text()}`).toBe(200);
    const body = await response.json();
    return body.access_token as string;
  }
}
