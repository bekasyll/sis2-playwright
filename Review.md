# Review

The exact prompts and tools are in [Prompt.md](Prompt.md). In short: Claude (Opus 5.5) wrote the project in a claude.ai chat. Then I used Claude Code on my laptop to run it against the real site and collect the results below.

## 1. What the AI gave me

A complete Playwright + TypeScript project:

- config (`playwright.config.ts`) with `data-test` as the test id attribute, trace on retry, retries only in CI, and a `test:bugs` script for the buggy version of the site;
- 7 page objects in `pages/`, one per screen (login, register, forgot password, product list, product page, comparison, checkout);
- a fixture (`fixtures/pages.fixture.ts`) that creates a fresh customer through the API for each test, and can also log that customer in;
- a small API helper (`api/toolshop.api.ts`) and a data factory (`data/`);
- 8 tests in 5 spec files: TC-1 to TC-5, plus negative tests for register, login and reset password.

The chat could not open practicesoftwaretesting.com, so the AI took the locators from the app's source code on GitHub (`testsmith-io/practice-software-testing`), not from memory. Because of that, it never ran the tests. It only type-checked them and listed them. So everything had to be checked on my side.

## 2. What it found in the app's source

Some of this changed how the tests are written:

- **Forgot password doesn't send an email.** It just sets the password to `welcome02`. If a test reset the shared `customer@…` account, it would break that account for everyone else using the site. So TC-5 makes its own customer and then checks through the API that `welcome02` works and the old password doesn't.
- **The account locks after 3 wrong passwords.** The negative login test does only one wrong attempt.
- **Wrong translation key on the forgot password page.** The template uses `page.forgot-password.confirm`, but `en.json` only has `pages.forgot-password.confirm`. I checked it on the live site and it's a real bug: the banner shows the raw key (screenshot 07, bug report at the end).
- Product comparison is a real feature (`/comparison`), so TC-4 tests that page and doesn't just read two prices from two product pages.
- At checkout the same button is first "Check payment" and then "Confirm", so `CheckoutPage` has two separate steps for it.

## 3. How I checked it

All runs were on 2026-10-22 against the live site.

**1. Full run.** It wasn't green every time. Out of 4 full runs, 2 were "8 passed" (the fastest took 7.5 s) and 2 were "7 passed, 1 failed". It was TC-3 (buying a product) both times. On its own TC-3 passed 3 times out of 3. I opened the trace of a failed run: after clicking Confirm, `POST /invoices` returned 422 with "The city does not belong to the selected country". The address was Berlin / DE / 10115, the same one that works in the other runs. The page doesn't show any error, the Confirm button just does nothing. So this is the server being flaky, not the test.

**2. Flakiness.** I also ran it twice with `--workers=4`. The first time 6 tests failed while creating the test customer, because `POST /users/register` returned 500 "Something went wrong". A few minutes later the same run passed 8/8. So the shared server is unstable sometimes (a 500 on register, a 422 on invoices). The good part is that the test output shows exactly which request failed.

**3. Buggy build (`npm run test:bugs`).** All 8 failed (screenshot 05), but not for a useful reason. 5 failed before the test even started, because the API on the buggy build expects a different format for registration (`address` as a string, plus `city` and `country`). The other 3 timed out on locators that are different there. So this run doesn't show that my assertions catch bugs. I decided not to adapt the project to the old API, and used check 4 instead.

**4. Breaking an assertion on purpose.** In TC-3 I changed the expected cart badge from 2 to 3. The test failed with `Locator: getByTestId('cart-quantity')`, `Expected: "3"`, `Received: "2"` and pointed to line 15. From that message it's clear what's wrong. I reverted the change after that.

**5. Do the `data-test` values exist on the site?** I didn't click through DevTools page by page. I used a script that collected all `data-test` values from the home page, product list pages 2–6, one product page, login, register and forgot password, and compared them with the 43 values used in `pages/`. 18 were missing, but these only show up later: in the cart, at checkout, in error messages, on the comparison page, or after login. All 18 are used in tests that passed, so they exist. Two values I couldn't confirm:
- `product-discount-price` is only used inside a `hasNot` filter. If the name were wrong, the filter would just do nothing and no test would notice. It is in the source code, but I didn't find any discounted product on the pages I scanned.
- `unit-price` (`ProductPage.unitPrice`) isn't used by any test at all.

**6. Forbidden patterns.** `grep` for `waitForTimeout`, `xpath` and `locator(` found nothing. There is also no `getBy` inside `tests/`, all locators are in the page objects.

**7. Does each test check what its name says?** Mostly yes. TC-1 checks the redirect and that the new account can actually log in. TC-2 checks the URL and the name in the user menu, and in the negative case the error, the URL and that the sign-in link is still there. TC-3 checks the badge, the cart line, the price and the invoice number. TC-4 compares names and prices column by column. The problem is TC-5: the name says "gets a confirmation", but the test only checks that some alert is visible. That's why it stays green even though the alert shows the raw key. TC-4 also has a weak check, `toContainText('2')` on the comparison bar (a "12" would pass too), but the table check after it covers that.

## 4. What I changed

I didn't change any test code. The only code change was the broken assertion in check 4, and I reverted it. What I added:

- in Prompt.md: the effort setting (High) and a note about Claude Code;
- this review, with the real results;
- screenshots 02–05 and 07;
- `package-lock.json`, so CI installs the same versions.

Things I left as they are on purpose:

- **TC-3.** It fails because the server sometimes rejects a valid address. If I added a retry or a workaround in the test, that problem would be hidden. In CI there are 2 retries anyway, and the trace shows the 422.
- **TC-5 alert check.** It should check the text. But with the bug on the site it would then fail every time. My plan is to check the text and mark the test with `test.fail()` and a link to BUG-01. Then the run stays green, but the bug isn't forgotten.
- **`ProductPage.unitPrice`.** Not used, I'll delete it next time I clean up.
- **`test:bugs`.** See check 3.

Things I still want to keep an eye on:

- The forgot password alerts are found with `getByRole('alert')` because they have no `data-test`. If another alert ever shows up on that page, Playwright will fail on strict mode. The fix would go in `forgot-password.page.ts`.
- At checkout the address form can be pre-filled, and the postcode lookup can change the street and city. The test fills all fields again. If `proceed-3` ever stays disabled, the trace is the first place to look.
- The cart price is checked as 2 × the catalogue price. That only works for products without a discount, which is why discounted products are skipped (and why `product-discount-price` matters).

## 5. Decisions I'm keeping

- **One spec file per test case, with a negative test where the requirement has an error path.** The brief asks for one file per test case, and bugs are usually found in the invalid inputs (week 3).
- **Setup and result checks through the API.** Week 5: create data through the API, not through the UI. A redirect or a banner alone doesn't prove that something actually happened.
- **A new customer for every test, never the seeded accounts.** The site is shared with other students (week 6), and a password reset would break the shared account.
- **No retries locally, 2 in CI.** I want to see failures locally and not re-run until it's green (week 5).
- **Not automated:** other payment methods, guest checkout, exact message wording. The reasons are in Description.md.

## BUG-01: forgot password banner shows a raw translation key

- **Where:** https://practicesoftwaretesting.com, v2.5 (built 2026-10-11), Chromium via Playwright 1.56, 2026-10-22
- **Before you start:** a registered customer (use a new one, because this resets the password)
- **Steps:**
  1. Open `/auth/forgot-password`.
  2. Enter the customer's email.
  3. Click "Set New Password".
- **Expected:** a normal confirmation message
- **Actual:** the green banner says `page.forgot-password.confirm`
- **Evidence:** [screenshot 07](screenshots/07-bug-forgot-password-raw-key.png). In the source the template uses `page.…`, but `en.json` only has `pages.…`.
- **Severity / priority:** minor / medium. The reset works, but the user doesn't get a message they can understand.
- **Reproducible:** I saw it once. Since the wrong key is hard-coded in the template, it should happen every time.

## Note: checkout sometimes rejects a valid address

Sometimes `POST /invoices` returns 422 "The city does not belong to the selected country" for Berlin / DE / 10115, and the same address works in other runs. The page shows nothing, Confirm just doesn't respond. I saw it in 2 out of 4 full runs and couldn't reproduce it on purpose, so for now it's a note and not a full bug report.
