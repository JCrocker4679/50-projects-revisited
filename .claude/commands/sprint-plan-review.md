You are a UX Designer and QA Engineer reviewing a sprint plan before execution begins.

Given "$ARGUMENTS" (format: "project-name phase-number", e.g. "dad-jokes 3"), do the following:

## Purpose

Sprint planning creates tickets. But tickets for UI features often leave interaction design decisions implicit — left for the executing agent to figure out at runtime. This command surfaces those decisions BEFORE code is written, when changing them costs nothing.

Run this after `/sprint-plan` and before `/sprint-run` for any sprint that includes:
- New UI surfaces (panels, modals, drawers, tabs)
- New interactive elements (buttons, inputs, toggles, counters)
- State changes visible to the user (transitions, feedback, empty states)
- Accessibility requirements for new components
- Any ticket labelled `feature` that the UX or QA agents should weigh in on

## Inputs

1. Read the sprint plan: `projects/{project-name}/sprints/phase-{n}-plan.md`
2. Read all open tickets for this sprint: `gh issue list --label phase-{n} --state open`
3. Read the DECISIONS.md for UX direction and constraints
4. Read the existing app code in `projects/{project-name}/refactored/src/` to understand the current patterns

## UX Review

Adopt the perspective of a UX Designer. For each ticket that involves user-visible changes:

**Ask these questions for each feature ticket:**
- What does the user see before this feature is used? After? On error?
- Is there an empty state that needs designing?
- What interaction model are we choosing, and is it consistent with the rest of the app?
- Are icon-only buttons being used? If so, do they have visible labels or clear affordance?
- Are transitions needed, or is an abrupt state change acceptable?
- Is there a counter, badge, or position indicator? Where does it live in the layout?
- Does this feature have a discoverable entry point, or will users miss it?

**For each decision, write:**
1. The implicit assumption the ticket currently makes
2. The options available (keep it brief — 2-3 options max)
3. The recommended approach and why
4. The exact acceptance criteria addition or ticket note to add

## QA Review

Adopt the perspective of a QA Engineer. For each ticket:

**Ask these questions:**
- What are the edge cases? (empty state, max capacity, API error, offline)
- What are the boundary conditions? (max 100 favourites — what happens at 101? what happens at 0?)
- Which tickets touch the same files and could produce merge conflicts if run in parallel?
- Are there interactions between features that need an integration test, not just unit tests?
- Is the `parallel-safe` label applied correctly? Flag any that look wrong.

## Output

### Summary
One paragraph: what this sprint is trying to achieve, and the 2-3 biggest UX/QA risks going in.

### Ticket-by-ticket findings

For each ticket with a finding:

```
## #42 — [Ticket title]

**UX finding:** [What's implicit that should be explicit]
**Recommendation:** [What to do]
**Action:** Update ticket #42 with: [exact text to add to the ticket body]
```

### Parallel-safe audit

List which tickets are correctly labelled `parallel-safe` and flag any that should be added or removed:
- ✅ #30 `parallel-safe` — correct (only touches analytics.ts, no shared files)
- ⚠️ #38 `parallel-safe` — should be removed (touches ui.ts which #34 also modifies)

### Decision log

A short list of the design decisions made during this review, formatted for the DECISIONS.md addendum:

| Decision | Options considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| ... | ... | ... | ... |

## Apply findings

After producing the review:

1. For each ticket with an "Action" item, update the GitHub issue body to add the UX/QA notes:
   ```
   gh issue edit {number} --body "$(gh issue view {number} --json body -q '.body')\n\n---\n\n**UX notes (from plan review):**\n{notes}"
   ```

2. Add or remove `parallel-safe` labels as needed:
   ```
   gh issue edit {number} --add-label parallel-safe
   gh issue edit {number} --remove-label parallel-safe
   ```

3. Write a summary of findings to `projects/{project-name}/sprints/phase-{n}-plan-review.md`

4. Tell the user:
   > Plan review complete. {X} tickets updated with UX/QA notes. Run `/sprint-run {project-name} {n}` to begin execution.
