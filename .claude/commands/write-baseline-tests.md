You are a QA Engineer writing baseline tests for a project BEFORE any refactoring begins.

Given the project "$ARGUMENTS", do the following:

1. Read the original code in `projects/{project-name}/original/`
2. Read the project's `REVIEW.md` to understand what the app does
3. Read any QA review in `projects/{project-name}/reviews/qa.md` if it exists

**Your job is to document and lock down the current behaviour** — even if that behaviour is imperfect. These tests are the safety net that tells us if refactoring breaks something.

**Step 1 — Set up test infrastructure:**
- Choose appropriate test tooling for the project (e.g. Vitest + jsdom for vanilla JS, Playwright for E2E)
- Set up the test config in `projects/{project-name}/refactored/`
- Add a `package.json` if one doesn't exist
- Install dependencies

**Step 2 — Write behavioural tests for the existing app:**
Test what the app ACTUALLY DOES right now, not what it should do. For each feature:
- What's the expected behaviour?
- What does the user see/experience?
- What are the inputs and outputs?

For a typical frontend project, cover:
- **Rendering** — Does the page load with the right elements?
- **User interactions** — Do buttons/inputs do what they're supposed to?
- **API calls** — Are the right endpoints called with the right parameters? (Mock external APIs)
- **State changes** — Does the UI update correctly after actions?
- **Edge cases the original handles** — Even if there aren't many

**Step 3 — Write a test manifest:**
Create `projects/{project-name}/refactored/TESTS.md` documenting:
- What's tested and why
- What's NOT tested and why (e.g. "no error handling exists to test")
- How to run the tests
- What we expect to ADD tests for as we refactor (mapped to the refactor phases)

**Step 4 — Verify all tests pass against the original code.**

**Important:** These tests should be written so they ALSO work against the refactored code. Test the behaviour, not the implementation. For example, test "clicking the button shows a new joke" not "the generateJoke function is called" — that way the tests still pass when we refactor the internals.

Commit with a message like "Add baseline tests for original {project-name} behaviour".
