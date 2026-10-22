# SIS 2 — Description

**Student:** Assylbekov Bekassyl
**Course:** Software Testing and Debugging, KBTU 2026
**Application under test:** Toolshop, <https://practicesoftwaretesting.com> (sprint 5, Angular front end over a REST API at `api.practicesoftwaretesting.com`)
**Framework:** Playwright Test, TypeScript, Chromium

## What I want to do

Automate the five end-to-end test cases from the SIS 2 brief as a small, maintainable Playwright suite that:

- runs from a clean clone with `npm install`, `npx playwright install` and `npx playwright test`, without any manual setup or seeded data;
- passes when the tests run in any order and in parallel;
- proves something in every test: each test has an assertion that would fail if the feature broke, not only a navigation;
- keeps the specs readable as requirements: no locators in spec files; all page interaction lives in page objects that reach the specs through a fixture.

## Test cases to be automated

Every test creates its own customer with a unique email (`data/user.factory.ts`), through the API, so no test depends on another or on the shared seeded accounts.

| ID | Test case | Preconditions | Steps | Expected result |
|----|-----------|---------------|-------|-----------------|
| TC-1a | Register a new customer | None | 1. Open `/auth/register`<br>2. Fill every field with a new unique customer<br>3. Submit | Redirect to `/auth/login`. The email and password just entered are accepted by the login API (proves the account exists, not only that a redirect happened). |
| TC-1b | Register with an email already in use (negative) | A customer with email X exists | Register a new customer using email X | Error containing "already" shown; user stays on `/auth/register`. |
| TC-2a | Log in with valid credentials | A customer exists | 1. Open `/auth/login`<br>2. Enter their email and password<br>3. Submit | Redirect to `/account`; the header menu shows the customer's first and last name. |
| TC-2b | Log in with a wrong password (negative) | A customer exists | Enter the right email with a wrong password | `login-error` shown; still on `/auth/login`; "Sign in" link still visible (not signed in). |
| TC-3 | Buy a product | A customer exists and is signed in | 1. Open the catalogue; open the first product that is in stock and not discounted<br>2. Set quantity 2; add to cart<br>3. Open the cart<br>4. Proceed; continue as the signed-in customer; enter billing address<br>5. Pay "cash on delivery"; confirm | Product page shows the product chosen in the catalogue. Cart badge shows 2. Cart line: the same product, quantity 2, line price = 2 × catalogue price. "Payment was successful" message, then an invoice number `INV-…` on the confirmation. |
| TC-4 | Compare two products | None | 1. Open the catalogue<br>2. Mark the first two in-stock, non-discounted products for comparison, noting each name and price<br>3. Open the comparison page | Comparison bar reports 2 products. The comparison table has exactly 2 columns: the same two products, and each column's price equals that product's catalogue price. |
| TC-5a | Reset a password for a known email | A customer exists | 1. Open `/auth/forgot-password`<br>2. Enter the customer's email; submit | A confirmation banner is shown. The new password `welcome02` is accepted by the login API and the old password is no longer accepted. |
| TC-5b | Reset a password for an unknown email (negative) | None | Submit an email that was never registered | An error banner containing "invalid" is shown. |

Eight automated tests cover the five required test cases: each of TC-1, TC-2 and TC-5 has a positive and a negative test.

## Decisions

| Decision | Why |
|----------|-----|
| Fresh customer per test, created through the API | On this application, "forgot password" sets the account's password to `welcome02`, and 3 wrong passwords lock an account (`UserService.php` in the app's public source). Any student's suite that resets or mistypes the seeded `customer@practicesoftwaretesting.com` breaks it for everyone else. A fresh customer makes my tests independent of other people and of each other. |
| Sign in through the API for TC-3 | Only the login test has login as its subject. TC-3 puts the API token into `localStorage` (`auth-token`, where the app keeps it) before the page loads, so a broken login page fails one test, not every test that needs a signed-in user. |
| `testIdAttribute: 'data-test'` | The Toolshop marks elements with `data-test`, not `data-testid`. With this setting `getByTestId` works everywhere. |
| Locator priority: test id → role → text pattern | All locators are `getByTestId`, except: catalogue cards (`getByRole('link')` filtered by a product name inside), forgot-password banners (`getByRole('alert')`, they have no test id) and the invoice number (`getByText(/INV-\d+/)`, which matches a data format, not wording). No CSS classes, no XPath. |
| Products chosen by what the card shows, not by name | The shared catalogue can change. The tests take the first product that is in stock and not discounted, so the price arithmetic is not affected by discounts. |
| Outcomes checked through the API where the UI cannot prove them | A redirect after registration and a banner after a password reset do not prove that anything happened. The API checks do. |
| No `waitForTimeout` | Every wait is a web-first assertion or an action's built-in auto-wait. |

## Not automated, and why

| Item | Reason |
|------|--------|
| Credit card, bank transfer, gift card and "buy now pay later" payments | One payment method is enough to prove checkout completes; the others are a data-driven extension. |
| Guest checkout, social login, TOTP two-factor login | Outside the five required test cases. |
| Wording and layout of messages | Needs human judgement (week 5: "the oracle is human judgement → do not automate"). |
| Exact moment the reset banner disappears (3 s fade-out) | Timing-dependent; would make the test flaky. |

## How to run

```bash
npm install
npx playwright install chromium
npx playwright test          # all tests, headless
npx playwright test --ui     # UI mode
npx playwright show-report   # HTML report after a run
npm run test:bugs            # same suite against with-bugs.practicesoftwaretesting.com
```
