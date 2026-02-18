You are facilitating a final project retrospective. This runs at the END of a project (after all sprints are complete) and is a comprehensive review of the entire project lifecycle — not just the last sprint.

Given the project "$ARGUMENTS", read EVERYTHING:
- `REVIEW.md` — the original plan
- `DECISIONS.md` — how decisions evolved over time
- All sprint plans and reviews in `sprints/`
- All expert reviews in `reviews/`
- `CHANGELOG.md`
- All session logs in `notes/sessions/`
- The original code vs the final refactored code
- Any content plans or drafts in `blog/`

**Project outcomes:**
- What did we set out to build? What did we actually build? Where's the gap?
- How did the scope change from the original REVIEW.md to what was delivered?
- Track every major decision in DECISIONS.md — were they the right calls in hindsight?
- What's the before/after comparison? Lines of code, features, test coverage, accessibility, performance

**Agent performance review:**
For EACH expert agent, assess:
- Did this agent add value? What was their best contribution?
- Where were they wrong, unhelpful, or redundant?
- Were their recommendations followed? If not, should they have been?
- How should this agent's prompt be refined for future projects?

**Process review:**
- The workflow (review → team review → decisions → tests → sprint plan → build → review) — did it work? What was friction, what was smooth?
- Were the sprint sizes right? Too ambitious? Too conservative?
- Did the ticket/PR/branch workflow add value or just overhead for a project this size?
- How effective were the slash commands? Which were used often, which were never used?
- What commands are MISSING that we wished we had?

**AI workflow review:**
- How much human steering was needed vs autonomous agent work?
- Which tasks did the AI handle well independently?
- Where did the AI need the most correction or guidance?
- How did different models compare if multiple were used?
- What prompting strategies worked best?

**Recommendations for future projects:**
- Specific changes to slash command prompts (quote the old text, suggest the new)
- New agents or commands to add
- Agents or commands to remove or merge
- Process changes for the workflow
- Things to do differently from the start on the next project
- Complexity scaling — what needs to change as projects get more complex than this one?

**Overall grade:**
Rate the project on: scope delivery, code quality, process effectiveness, AI utilisation, learning value. Be honest.

Write the retrospective to `projects/{project-name}/RETROSPECTIVE.md`.
