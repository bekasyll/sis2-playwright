# SIS 2 — Playwright tests for the Toolshop

[![Playwright Tests](https://github.com/bekasyll/sis2-playwright/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/bekasyll/sis2-playwright/actions/workflows/playwright.yml)

End-to-end tests for <https://practicesoftwaretesting.com>, written with Playwright Test in TypeScript.
Software Testing and Debugging, KBTU 2026 · Assylbekov Bekassyl

| Document | Contents |
|----------|----------|
| [Description.md](Description.md) | What is automated, the test cases, decisions, what is not automated |
| [Prompt.md](Prompt.md) | The AI tool and the exact prompts |
| [Review.md](Review.md) | How the AI output was reviewed and changed |
| [screenshots/](screenshots/) | AI response, run results, report |

## Run it

Requires Node.js 20 or newer.

```bash
npm ci
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

[![Playwright Tests](https://github.com/bekasyll/sis2-playwright/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/bekasyll/sis2-playwright/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. The repository already lives on GitHub, so Actions needs no server of its own, is free for a public repository, keeps artefacts next to the run, and supports a job matrix for sharding out of the box. (Jenkins, covered in Week 10, would need its own server and a tunnel for GitHub webhooks.)

**Pipeline** (`.github/workflows/playwright.yml`):

- runs on every push to any branch and on every pull request (plus `workflow_dispatch` for manual runs);
- `actions/setup-node` with `cache: npm` (keyed on `package-lock.json`), then `npm ci`;
- Chromium installed with system dependencies: `npx playwright install --with-deps chromium`;
- the full suite, no `--grep` or `--project` filters, split into 4 shards (`--shard=i/4`) running in parallel; `fail-fast: false` so one red shard does not cancel the others;
- the `merge-reports` job downloads the 4 blob reports and merges them into one HTML report and one JUnit file (`merge.config.ts`);
- reports and traces are uploaded with `if: !cancelled()`, i.e. also when tests fail;
- `concurrency` cancels an outdated run when a new commit is pushed to the same branch.

**Artefacts** (Actions → the run → Artifacts), kept for 14 days:

| Artefact | Contents |
|----------|----------|
| `playwright-report` | merged HTML report of all 4 shards, traces included |
| `test-results-1` … `test-results-4` | per shard: traces, screenshots and videos of failed/retried tests, `reports/junit.xml` |
| `junit-report` | merged `junit-merged.xml` |
| `blob-report-1` … `blob-report-4` | intermediate shard reports, kept 1 day |

To open a trace: download the artefact, then `npx playwright show-trace trace.zip`, or drop the file onto <https://trace.playwright.dev>.

**CI settings** (`playwright.config.ts`, active when `CI` is set; GitHub Actions sets it automatically):

| Setting | Locally | In CI | Why |
|---------|---------|-------|-----|
| `forbidOnly` | `false` | `true` | a forgotten `test.only` fails the run instead of silently running one test |
| `retries` | `0` | `2` | the site is a shared public demo; a slow response makes a test *flaky*, not red |
| `workers` | auto | `2` | GitHub runners have 2–4 vCPUs |
| `reporter` | `list`, `html` | `list`, `blob`, `junit` (`reports/junit.xml`) | blob for merging shards, JUnit for any CI tool |
| `trace` | `on-first-retry` | `on-first-retry` | a trace of exactly the attempt that failed |

`fullyParallel: true` lets `--shard` split individual tests, not whole files. `BASE_URL` and `API_URL` can be set under Settings → Secrets and variables → Actions → Variables; if they are not set, the public Toolshop is used.

### Runtime

"Before" is the same workflow with one job (`shardIndex: [1]`, `shardTotal: [1]`), "after" is the 4-shard version. Both numbers come from GitHub Actions.

| Configuration | Total run time | Run tests step (slowest shard) | Run |
|---------------|----------------|--------------------------------|-----|
| 1 job, no sharding | TODO | TODO | [run](TODO) |
| 4 shards + merge | TODO | TODO | [run](TODO) |

Conclusion: TODO

### Running locally in CI mode

```bash
npm ci
npx playwright install --with-deps chromium   # --with-deps only matters on Linux
CI=true npx playwright test                   # PowerShell: $env:CI="true"; npx playwright test
```

Shards and the report merge, the same way CI does it:

```bash
mkdir -p all-blob-reports
CI=true npx playwright test --shard=1/2 && cp blob-report/*.zip all-blob-reports/
CI=true npx playwright test --shard=2/2 && cp blob-report/*.zip all-blob-reports/
npx playwright merge-reports --config merge.config.ts ./all-blob-reports
npx playwright show-report
```

Checked locally before the first push: the CI run writes `blob-report/` and `reports/junit.xml`; with a temporary `test.only` the CI run fails (`exit 1`, error points at the `test.only` line); two shards merge into one report with all 8 tests in `reports/junit-merged.xml`.
