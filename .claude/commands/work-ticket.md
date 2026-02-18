You are working on a specific ticket from the sprint board.

Given "$ARGUMENTS" (format: "project-name #issue-number", e.g. "dad-jokes #12"), do the following:

1. Read the ticket details with `gh issue view {issue-number}`
2. Read the project's `REVIEW.md`, sprint plan, and any relevant expert reviews
3. Read the existing codebase (original and refactored)
4. Check which agent role is tagged on the ticket and adopt that specialist perspective

**Before writing any code:**
- Check that baseline tests exist in the project. If they don't, STOP and tell the user to run `/write-baseline-tests` first — never refactor without a safety net
- Run the existing test suite to confirm everything passes before you touch anything
- Create a feature branch: `git checkout -b {issue-number}-{short-description}`
- Confirm you understand the acceptance criteria

**While working:**
- Write code in `projects/{project-name}/refactored/`
- Follow the code standards in CLAUDE.md
- Commit frequently with clear messages referencing the issue number (e.g. "Add error handling for API calls, refs #12")
- If you hit a blocker or discover something that changes scope, note it — don't silently expand the ticket

**When done:**
- Run ALL existing tests — baseline tests must still pass. If a refactor intentionally changes behaviour, update the test AND note it in the PR description explaining why the old behaviour changed
- Add new tests for any new functionality introduced by this ticket
- Update `CHANGELOG.md` with what changed
- Create a PR with `gh pr create` that:
  - References the issue ("Closes #12")
  - Describes what was done and why
  - Notes any decisions made or trade-offs
  - Lists anything that needs manual testing
- Update the issue with a comment summarising the work done

**PR description format:**
```
## What
Brief description of the change.

## Why
Link to issue, explain the reasoning.

## How
Key implementation decisions and trade-offs.

## Testing
What was tested, what needs manual verification.

## Screenshots
If there are visual changes, describe them.
```
