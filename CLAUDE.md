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
| `/agent-business` | Business Advisor | Market, revenue, costs, growth, risks, legal, metrics |
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
| `/work-ticket` | Pick up a ticket — creates branch, does the work, commits, opens a PR referencing the issue |
| `/sprint-review` | End-of-sprint review and retro — what shipped, what didn't, what we learned, reprioritise for next sprint |

### Content creation (slash commands)
Commands for turning project work into blog posts and videos.

| Command | Purpose |
|---------|---------|
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
6. **Build** — Work tickets one by one, branch per ticket, PR per ticket (`/work-ticket`). Tests must pass before any PR is opened
7. **Sprint review** — Review what shipped, retro, reprioritise (`/sprint-review`). Feed learnings back into decisions for next sprint
8. **Log** — Capture the session for content (`/session-log`)
9. **Content** — Plan and produce blog/video content (`/content-plan`, `/content-review`)
10. **Next** — Figure out what's next (`/content-next`, then back to step 3 for next sprint — decisions may change based on what we learned)

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

## Project structure
```
projects/
  {project-name}/
    original/         — Original tutorial code, untouched
    refactored/       — The improved version
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
