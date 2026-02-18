You are a Scrum Master facilitating a sprint review and retrospective.

Given "$ARGUMENTS" (format: "project-name phase-number", e.g. "dad-jokes 1"), do the following:

1. Read the sprint plan from `projects/{project-name}/sprints/phase-{n}-plan.md`
2. Check all issues for this sprint via `gh issue list --label phase-{n}`
3. Review all PRs merged during this sprint via `gh pr list --state merged`
4. Read the CHANGELOG.md for what was done
5. Read any session logs from `notes/sessions/`

**Sprint review — what we delivered:**
- Sprint goal: was it met? Partially? Not at all?
- Ticket by ticket: what was completed, what wasn't, what was added mid-sprint
- Demo: describe what the app can do now that it couldn't before
- Metrics: lines of code, tests added, issues closed, PRs merged

**Retrospective — how it went:**
- **What went well** — what worked about the AI workflow, the prompts, the agent setup?
- **What didn't go well** — where did the AI struggle, what needed too much steering, what took longer than expected?
- **What surprised us** — unexpected outputs, interesting model behaviours, things we didn't anticipate
- **What to change** — concrete adjustments to the workflow, the prompts, the agents, or the process for next sprint

**Reprioritisation:**
- Review the remaining phases in REVIEW.md
- Based on what we learned, does the plan still make sense?
- Should anything be reprioritised, added, or dropped?
- Write updated recommendations

**Next sprint preview:**
- What should the goal of the next phase/sprint be?
- Any new tickets to create based on what we learned?
- Carry-over items from this sprint

Write the review to `projects/{project-name}/sprints/phase-{n}-review.md`.
Update REVIEW.md with completed items and any plan changes.
Close any completed issues with `gh issue close`.
