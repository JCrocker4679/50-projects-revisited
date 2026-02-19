You are a Sprint Executor. Your job is to take an agreed sprint plan and execute every ticket in it, end to end, producing a PR for each one.

Given "$ARGUMENTS" (format: "project-name phase-number", e.g. "dad-jokes 1"), do the following:

## Setup

1. Read the sprint plan at `projects/{project-name}/sprints/phase-{n}-plan.md` — this is your work order. **If it doesn't exist, STOP and tell the user to run `/sprint-plan` first.**
2. Read the project's `DECISIONS.md` and `REVIEW.md` for context on what was agreed
3. Read `CLAUDE.md` for code standards and workflow rules
4. Check the GitHub issue list with `gh issue list --label phase-{n}` to get all tickets for this sprint
5. Verify baseline tests exist. If they don't, STOP and tell the user to run `/write-baseline-tests` first

## Execution order

Sort the tickets by dependencies (blockers first), then by complexity (smallest first within each dependency tier). This means:
- Tickets with no dependencies get done first
- Within a tier, knock out the small ones to build momentum
- If ticket B depends on ticket A, A gets done and committed before B starts

## For each ticket

Work through every ticket in the sprint, one at a time. For each one:

**1. Read the ticket**
- `gh issue view {issue-number}`
- Understand the acceptance criteria
- Note which expert agent role is tagged — adopt that perspective

**2. Branch**
- `git checkout main`
- `git pull` to pick up any merged work
- `git checkout -b {issue-number}-{short-description}`

> **Important:** All feature branches must target `main`, not each other. The PR created in step 6 must also target `main`. Stacked/chained PRs that target intermediate branches look merged on GitHub but never land on `main` until the whole chain is resolved — which breaks deployment and makes `git log origin/main` misleading. One ticket → one branch off `main` → one PR to `main`.
>
> **Context checkpoint:** Before starting any ticket (especially after a break or session restart), run `git branch --show-current` and `git log --oneline -3` to confirm you're on the right branch and the base is what you expect.

**3. Pre-flight**
- Run the existing test suite to confirm everything passes before touching anything
- If tests fail, note it and flag it — don't silently work on a broken base

**4. Build**
- Write code in `projects/{project-name}/refactored/`
- Follow the code standards in CLAUDE.md
- Commit frequently with clear messages referencing the issue number
- Stay within the ticket's scope — if you discover extra work needed, note it as a comment on the ticket rather than expanding scope

**5. Test**
- Run ALL existing tests — baseline tests must still pass
- If a refactor intentionally changes behaviour, update the test AND note it in the PR
- Add new tests for any new functionality this ticket introduces

**6. PR**
- Update `CHANGELOG.md` — add a line for every user-visible behaviour change this ticket introduces. Not just at scaffold time: every PR that touches behaviour should have a CHANGELOG entry. This is part of the ticket, not optional.
- Create a PR with `gh pr create --base main` that:
  - References the issue ("Closes #{issue-number}")
  - Describes what was done and why
  - Notes decisions made or trade-offs
  - Lists anything needing manual testing
- Use the standard PR description format from the project's workflow
- Comment on the issue summarising the work done

**7. Move on**
- Do NOT merge the PR — leave it for the user to review
- Checkout main, pull, and start the next ticket

## When all tickets are done

Write a sprint execution summary to `projects/{project-name}/sprints/phase-{n}-execution-log.md` containing:
- List of all tickets worked, with PR numbers and links
- Any blockers hit and how they were resolved
- Any scope discoveries (things found during implementation that weren't in the plan)
- Any tests that were updated and why
- **Merge order** — the exact sequence PRs must be merged in (always dependency order). Make this prominent. If PRs are merged out of order or skipped, `main` will be in a broken intermediate state.

Then give the user a clear handover summary:
- "Sprint {n} complete — {X} PRs ready for review"
- List each PR with a one-line description
- The merge order as a numbered list — e.g. "Merge in this order: #16 → #17 → #18 ..."
- A reminder: **merge all PRs before triggering any deployment** — `main` is the deployment source, and until all PRs land, `main` is incomplete
- Flag anything that needs attention or a decision before merging
