# Prompts

## AI tool

| Field | Value |
|-------|-------|
| Tool | Claude, Anthropic — Claude app (claude.ai) |
| Model | Claude Opus 5.5 (`claude-opus-5-5`) |
| Effort setting | High |
| Date | 2026-10-22 |
| Mode | A single conversation. The model had file and shell tools: it read the application's public source code on GitHub, wrote the project files, and type-checked them. It could not open practicesoftwaretesting.com from its sandbox, so it never ran the tests. |

## Second tool: running the tests

| Field | Value |
|-------|-------|
| Tool | Claude Code (CLI), model Claude Opus 5.5, 2026-10-22 |
| What it did | Ran the suite on my machine against the live site and the buggy build, found the cause of the TC-3 flake in the trace (`POST /invoices` → 422), checked the forgot-password banner, made screenshots `02`–`05` and `07`, and filled Review.md sections 3–4 plus the defect report from what it measured (assertion broken on purpose and reverted, a script that checks the `data-test` values on the live site, `--workers=4` runs). It did not change any test code. |
| Prompts | `Сделай все что осталось: скриншоты и тд` ("Do everything that is left: screenshots etc."), after I pasted the summary of the first conversation; then `заполни FILL IN в Review.md` ("fill in the FILL IN lines in Review.md"). |

## The prompts, exactly as sent

The conversation had three messages. They are copied below without changes, including the language (Russian) and the typos.

### Prompt 1

Attached: the lecture slides for weeks 1–6 (PDF).

```text
Изучи подробнее эти лекции
```

### Prompt 2

Attached: my week 3 practice (PDF) and my week 4 documentation pack (`Week4.md`).

```text
Вот мои домашние задания
```

### Prompt 3: the prompt that produced this repository

```text
Сделай это задание

SIS 2 
Test Automation with Playwright 
LINK to Site to be tested 
https://practicesoftwaretesting.com/

1. At least 5 AT suits mentioned in the Pres - use any language you want with the Playwright framework. 
2.  Description.md - file: explain what you want to do 
   1. List of TCs to be automated 
3. [Prompt.md](http://prompt.md) file save exactly the prompt you used for the AI tool; mark exactly which tool you gonna use, like Claude Opus 5 Max efforts, etc 
4. [Review.md](http://review.md): explain what the AI results were about, how you reviewed and modified them, and justify your decisions 
5. Screenshots - AI response, Run results or whatever you think matters 
6. Link to public GitHub repository.
```

## Why the prompt looks like this

Prompt 3 is the assignment text, pasted as it is, with "Сделай это задание" ("Do this assignment") above it. It contains none of the rails from the week 5 lecture: allowed locators only, no `waitForTimeout`, and TODO-ORACLE instead of an invented assertion. The model still followed them, because prompt 1 had given it the week 5 and week 6 lectures in the same conversation. My review of the output is in [Review.md](Review.md).
