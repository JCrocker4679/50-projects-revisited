You are a Sprint Executor starting a brand new sprint.

Given "$ARGUMENTS" (format: "project-name phase-number", e.g. "dad-jokes 1"), do the following:

## Setup

1. Read the sprint plan at `projects/{project-name}/sprints/phase-{n}-plan.md`. **If it doesn't exist, STOP and tell the user to run `/sprint-plan` first.**
2. Read `DECISIONS.md`, `REVIEW.md`, and `CLAUDE.md` for context and code standards
3. Get all tickets for this sprint: `gh issue list --label phase-{n} --state open`
4. Verify baseline tests exist. **If they don't, STOP and tell the user to run `/write-baseline-tests` first.**
5. Check for existing PRs: `gh pr list --state open`. If open PRs already exist for this sprint's issues, **STOP and tell the user this sprint has already been started — use `/sprint-resume` to continue.**

## Map the full execution plan

Before touching any code, analyse all tickets and group them into dependency tiers based on their `Blocked by:` references. Show the user the full picture upfront:

```
Sprint {n} execution plan:

Tier 1 (no blockers): #12, #13, #14
Tier 2 (needs Tier 1 merged first): #15, #16
Tier 3 (needs Tier 2 merged first): #17

Execution model: one ticket at a time, stop for merge after each PR.
Total merge checkpoints: ~{total tickets}
```

This is important — the user needs to understand the cadence. Each ticket gets its own merge checkpoint.

**Note on parallel-safe tickets:** If two or more tickets in the same tier are labelled `parallel-safe`, tell the user they can run those tickets in separate terminal sessions simultaneously using `/work-ticket`. All parallel-safe tickets in a tier must be merged before starting the next tier.

## Execute the first ticket

Work through tickets one at a time, starting with the first ticket in Tier 1. Within a tier, tackle smallest complexity first.

**Why one at a time?** Multiple open PRs touching the same files cause merge conflicts. The per-ticket merge model eliminates this entirely — each branch always cuts from a current `main`.

For each ticket:

**1. Read it** — `gh issue view {issue-number}`. Note the acceptance criteria, UX notes (added by `/sprint-plan-review`), and the expert agent role tagged on it — adopt that specialist perspective.

**2. Branch** — `git checkout main && git pull`, then `git checkout -b {issue-number}-{short-description}`. Confirm with `git log --oneline -3` that your base is what you expect.

**3. Pre-flight** — Run the full test suite before touching anything. If tests fail, flag it and stop — don't build on a broken base.

**4. Build** — Write code in `projects/{project-name}/refactored/`. Follow code standards in `CLAUDE.md`. Commit frequently with messages referencing the issue number. Stay within scope — note discoveries on the issue rather than expanding the ticket.

**5. Test** — Run all existing tests. Baseline tests must still pass. If a refactor intentionally changes behaviour, update the test and note it in the PR. Add new tests for any new functionality.

**6. PR** — Update `CHANGELOG.md`, then `gh pr create --base main` referencing the issue ("Closes #{issue-number}"). Include what was done, why, key trade-offs, and what needs manual testing.

**7. Stop** — Hand off to the user for this ticket. Do NOT move to the next ticket.

## Hand off after each ticket

After each ticket's PR is opened, stop and hand off:

```
PR ready: #{issue-number} — [title]

Please review and merge this PR, then run:
  /sprint-resume {project-name} {n}

Next up: #{next-issue} — [title]
Remaining: {X} tickets
```

If two or more tickets in the current tier are `parallel-safe`, you may offer:

```
Alternatively, #13 and #14 are both parallel-safe — they touch entirely different files.
You can run /work-ticket {project-name} 13 and /work-ticket {project-name} 14 in separate
terminal sessions simultaneously, then merge both before continuing.
```
