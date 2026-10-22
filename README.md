# SIS 2 — Playwright tests for the Toolshop

End-to-end tests for <https://practicesoftwaretesting.com>, written with Playwright Test in TypeScript.
Software Testing and Debugging, KBTU 2026 · Assylbekov Bekassyl

| Document | Contents |
|----------|----------|
| [Description.md](Description.md) | What is automated, the test cases, decisions, what is not automated |
| [Prompt.md](Prompt.md) | The AI tool and the exact prompts |
| [Review.md](Review.md) | How the AI output was reviewed and changed |
| [screenshots/](screenshots/) | AI response, run results, report |

## Run it

Requires Node.js 18 or newer.

```bash
npm install
npx playwright install chromium
npx playwright test
npx playwright show-report
```

Other ways to run:

```bash
npx playwright test --ui                 # UI mode: pick tests, time-travel through steps
npx playwright test tests/login.spec.ts  # one file
npx playwright test --headed             # watch the browser
npm run test:bugs                        # same suite against the deliberately buggy build
```

`npm run test:bugs` uses Unix syntax for environment variables. In Windows PowerShell, run it like this instead:

```powershell
$env:BASE_URL="https://with-bugs.practicesoftwaretesting.com"; $env:API_URL="https://api-with-bugs.practicesoftwaretesting.com"; npx playwright test
```

The tests use the public, shared site. No seeded account is used and no setup is needed: every test creates its own customer with a unique email.

## Structure

```
tests/          one spec per test case: what must be true, no locators
pages/          one page object per screen: how to do it
fixtures/       hands page objects, an API helper and fresh customers to every test
data/           customer factory (unique email per call), price helpers
api/            REST calls used for setup and for checking outcomes
playwright.config.ts
```

## Tests

| File | Tests |
|------|-------|
| `register.spec.ts` | New customer registers → login page, account works · Duplicate email rejected |
| `login.spec.ts` | Valid credentials → account page, name in header · Wrong password → error, not signed in |
| `buy-product.spec.ts` | Two units to cart → correct line → checkout → invoice number |
| `compare-products.spec.ts` | Two products → comparison table shows the same two, each with its catalogue price |
| `reset-password.spec.ts` | Known email → confirmation, new password works, old one does not · Unknown email → error |

## Rules this suite follows

- No `waitForTimeout`. Only web-first assertions and auto-waiting actions.
- No CSS classes and no XPath. Locators are `getByTestId` (the app uses `data-test`, set in the config), `getByRole`, or a data-format text match.
- No locator in any spec file.
- Every test is independent and creates its own data, so tests can run in parallel and in any order.
- Retries only in CI. A trace is recorded on the first retry.

## CI

`.github/workflows/playwright.yml` runs the suite on every push and uploads the HTML report as an artifact (Actions → the run → Artifacts → `playwright-report`).
