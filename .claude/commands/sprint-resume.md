You are a Sprint Executor resuming an in-progress sprint after a merge checkpoint.

Given "$ARGUMENTS" (format: "project-name phase-number", e.g. "dad-jokes 1"), do the following:

## Determine where we are

Check the current state of the sprint before doing anything:

1. Get all tickets for this sprint: `gh issue list --label phase-{n} --state all`
2. Find merged PRs: `gh pr list --state merged`
3. Find open (unreviewed) PRs: `gh pr list --state open`
4. Cross-reference to identify ticket status:
   - **Done** — issue closed, PR merged
   - **Awaiting merge** — PR open, not yet merged
   - **Not started** — issue open, no PR

**If any "awaiting merge" PRs exist, STOP.** The user hasn't finished merging the previous wave yet. Tell them:

```
There are still open PRs from the previous wave that need to be merged before I can continue:
  #12 — [title]
  #14 — [title]

Merge these first (in dependency order if applicable), then re-run /sprint-resume.
```

## Identify the next wave

Once all previous wave PRs are confirmed merged, figure out which tickets are now unblocked:

A ticket is ready to build if:
- It has no `Blocked by:` references, OR
- Every issue listed in its `Blocked by:` is now closed/merged

Group the ready tickets into the next wave. If nothing is unblocked, the sprint is complete — skip to the wrap-up section.

Show the user what's about to happen:
```
Resuming Sprint {n} — Wave {current wave number}

Building now: #15, #16
Still waiting (will be Wave {n+1}): #17 (depends on #15)
```

## Execute the next wave

Work through every ticket in this wave, one at a time. Smallest complexity first within the wave.

For each ticket:

**1. Read it** — `gh issue view {issue-number}`. Note the acceptance criteria and the expert agent role tagged — adopt that specialist perspective.

**2. Branch** — `git checkout main && git pull`, then `git checkout -b {issue-number}-{short-description}`. Confirm with `git log --oneline -3` that the merged work from the previous wave is present on `main` before starting.

**3. Pre-flight** — Run the full test suite before touching anything. If tests fail, flag it and stop.

**4. Build** — Write code in `projects/{project-name}/refactored/`. Follow code standards in `CLAUDE.md`. Commit frequently with messages referencing the issue number. Stay within scope — note discoveries on the issue rather than expanding.

**5. Test** — Run all existing tests. Baseline tests must still pass. Update tests if a refactor intentionally changes behaviour, and note it in the PR. Add new tests for new functionality.

**6. PR** — Update `CHANGELOG.md`, then `gh pr create --base main` referencing the issue ("Closes #{issue-number}"). Include what was done, why, key trade-offs, and what needs manual testing.

**7. Continue** — Do NOT merge. `git checkout main` and move to the next ticket in this wave.

## Hand off after this wave

When all tickets in this wave have open PRs:

```
Wave {n} complete — {X} PRs ready for review.

Please review and merge in this order:
1. #15 — [title] (independent)
2. #16 — [title] (depends on #15, merge after)

Then run:
  /sprint-resume {project-name} {phase}    ← if more waves remain
  /sprint-review {project-name} {phase}    ← if this was the final wave
```

Be explicit about which is applicable — don't make the user guess whether they're done.

## Sprint wrap-up (final wave only)

When all issues are closed and all PRs merged, write the full execution summary to `projects/{project-name}/sprints/phase-{n}-execution-log.md`:

- All tickets worked, PR numbers, which wave each belonged to
- Any blockers hit and how they were resolved
- Any scope discoveries noted during implementation
- Any tests updated and why

Then tell the user:
```
Sprint {n} complete — all {X} tickets shipped.

Run /sprint-review {project-name} {n} to close out the sprint, update DECISIONS.md, and plan what's next.
```
