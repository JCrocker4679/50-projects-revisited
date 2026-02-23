# 50 Projects Revisited

## What this project is
Revisiting old tutorial projects (Traversy Media 50 Projects in 50 Days, Frontend Mentor, etc.) and refactoring them from tutorial code into production-viable applications using AI-assisted development.

This is NOT a coding tutorial series. It's a product-thinking series. The focus is on the gap between "I followed a tutorial" and "this is a real product" — covering error handling, accessibility, user stories, architecture, testing, analytics, marketing, deployment, and everything else tutorials skip.

## Who it's for
- Junior devs who can follow tutorials but want to understand how real development teams think
- Busy people (dads, side hustlers) exploring what's possible with agentic AI workflows in limited spare time

## How we work

### The expert team (slash commands)
We simulate a full product team using expert agent commands. Each agent reviews the project from their specialist perspective and writes their assessment to `projects/{project-name}/reviews/`.

| Command | Role | Focus |
|---------|------|-------|
| `/agent-technical-architect` | Technical Architect | System design, scalability, tech choices, data model, infrastructure |
| `/agent-frontend` | Frontend Engineer | UI architecture, components, state, performance, framework, build tooling |
| `/agent-backend` | Backend Engineer | API design, database, auth, server logic, when/why we need a backend |
| `/agent-ux` | UX Designer | User flows, accessibility, mobile, interaction design, visual direction |
| `/agent-qa` | QA Engineer | Testing strategy, edge cases, bug report, test plan |
| `/agent-copywriter` | Copywriter | UI copy, brand voice, error messages, landing page, SEO, email |
| `/agent-security` | Security Specialist | Vulnerabilities, threat model, data privacy, compliance |
| `/agent-business` | CFO / Business Stakeholder | Revenue model, costs, profitability, unit economics, P&L, commercial pressure |
| `/agent-visionary` | Product Visionary | Big-picture thinking, ambitious features, 10x vision, what this COULD become |
| `/agent-product-marketing` | Product Marketing Manager | User acquisition, positioning, launch strategy, feature marketing, growth |
| `/team-review` | All of the above | Runs every expert, then produces a summary with consensus, tensions, and priorities |

### Product decisions (slash commands)
After the expert reviews, decisions need to be made before planning can start.

| Command | Purpose |
|---------|---------|
| `/product-decisions` | Synthesise expert reviews into concrete decisions. Resolves disagreements, sets scope, produces a Sprint Brief that drives planning |

This creates `DECISIONS.md` in the project folder — the single source of truth for what we're doing and why. Every decision records the context, options considered, what was chosen, and when to revisit. Sprint planning consumes the Sprint Brief at the bottom of this document.

### Sprint workflow (slash commands)
We use GitHub Issues, branches, and PRs to manage work — just like a real team. Phases become sprints, work is broken into tickets, each ticket gets a branch and PR.

| Command | Purpose |
|---------|---------|
| `/sprint-plan` | Break a phase into a sprint — reads DECISIONS.md Sprint Brief, creates epic, user stories, and tasks as GitHub issues |
| `/sprint-run` | Start a sprint — maps all tickets into dependency waves, executes Wave 1, then stops for merges |
| `/sprint-resume` | Continue a sprint after merging — detects where you are, executes the next wave, stops again. Repeat until done |
| `/work-ticket` | Pick up a single ticket manually — creates branch, does the work, commits, opens a PR. Use this if you want to cherry-pick one ticket rather than run the whole sprint |
| `/sprint-review` | End-of-sprint review and retro — what shipped, what didn't, what we learned, reprioritise for next sprint |

### Project lifecycle (slash commands)

| Command | Purpose |
|---------|---------|
| `/project-retrospective` | End-of-project review — outcomes, agent performance, process review, recommendations for future projects |

### Content creation (slash commands)
Commands for turning project work into blog posts and videos. Note: `/content-extract` sits OUTSIDE the simulated team — it looks at the project with fresh eyes to find teachable moments.

| Command | Purpose |
|---------|---------|
| `/content-extract` | Extract learning value from a project — web dev lessons, AI workflow lessons, PM lessons, "aha" moments |
| `/content-plan` | Turn a project's work into a content plan — narrative arc, episode structure, talking points, audience value |
| `/content-review` | Editorial review of a draft — brand voice, consistency, value check, honesty check |
| `/content-next` | Figure out what to create next — series status, gaps, what's ready, 3 specific suggestions |
| `/session-log` | Capture a working session for future content (raw material) |

### The full workflow for each project
1. **Review** — PM-style audit of the original tutorial code (`/review-project`)
2. **Team review** — Expert agent perspectives (`/team-review` or individual agents)
3. **Decisions** — Synthesise reviews into concrete decisions and a Sprint Brief (`/product-decisions`). This is where scope gets set and disagreements get resolved
4. **Baseline tests** — Write tests that lock down the current behaviour BEFORE changing anything (`/write-baseline-tests`). Prerequisite for all refactoring
5. **Sprint plan** — Break the Sprint Brief into tickets on GitHub (`/sprint-plan`). Only plans work that's in scope per DECISIONS.md
6. **Build** — Start with `/sprint-run`, which maps all tickets into waves and builds Wave 1. Merge those PRs, then `/sprint-resume` to build the next wave. Repeat until all waves are done. Or use `/work-ticket` to handle a single ticket manually. Tests must pass before any PR is opened
7. **Sprint review** — Review what shipped, retro, reprioritise (`/sprint-review`). Feed learnings back into decisions for next sprint
8. **Log** — Capture the session for content (`/session-log`)
9. **Content** — Plan and produce blog/video content (`/content-plan`, `/content-review`)
10. **Next** — Figure out what's next (`/content-next`, then back to step 3 for next sprint — decisions may change based on what we learned)
11. **Project retrospective** — When the project is done, run `/project-retrospective` for a full review of outcomes, agent performance, and process improvements
12. **Extract learnings** — Run `/content-extract` to identify teachable moments for the blog/video series

### Code standards
- Accessibility is not optional — WCAG AA minimum
- Error handling for every external call
- No `innerHTML` where `textContent` will do
- Tests for anything non-trivial
- Mobile-first responsive design
- Semantic HTML

### GitHub workflow
- Repo lives on JCrocker4679 account
- All work happens on feature branches, never directly on main
- One branch per ticket, one PR per ticket
- PRs reference their issue ("Closes #12")
- Claude Code creates issues, branches, and PRs via `gh` CLI — Joe reviews and merges

### Capturing learnings
After each significant piece of work, update:
- The project's `REVIEW.md` — check off completed items, add to the AI models table, note learnings
- `notes/` — any observations about the AI workflow, surprising outputs, prompt strategies

## Series structure
The series runs in three acts (see `notes/blog-vision.md` for full detail):
1. **Act 1 — Solo AI:** Refactor 2-3 small projects using a single AI agent with no structure. Establishes the baseline.
2. **Act 2 — Full team AI:** Redo the SAME projects using the full agent team workflow. The comparison is the content.
3. **Act 3 — Scaling up:** Take on more complex projects using the team approach, pushing toward real business viability.

For Act 1/2 comparison projects, both attempts live under the same project folder in `solo/` and `team/` subdirectories.

## Project structure
```
projects/
  {project-name}/
    original/         — Original tutorial code, untouched
    solo/             — Act 1: the unstructured single-agent attempt
    refactored/       — Act 2+: the structured team attempt (aliased as "team" output)
    reviews/          — Expert agent assessments
    sprints/          — Sprint plans and reviews
    assets/           — Screenshots, recordings, design files
    REVIEW.md         — PM audit, refactor plan, progress tracking
    DECISIONS.md      — Product decisions driving sprint planning
    CHANGELOG.md      — What changed and why (create when refactoring starts)

blog/                 — Blog posts / video scripts
notes/                — Working notes, vision docs, model comparisons
```

## Original project sources
- GitHub (old account): https://github.com/just-joe27
- GitHub (current): https://github.com/JCrocker4679
- Local: Archive/JC Media and Technology/Projects/50 Projects

## Current focus
**Dad Jokes project** — See `projects/dad-jokes/REVIEW.md` and `notes/dad-jokes-big-vision.md`.
