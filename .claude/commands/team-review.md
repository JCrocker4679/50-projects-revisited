Run a full team review of the project "$ARGUMENTS".

Create the folder `projects/{project-name}/reviews/` if it doesn't exist.

Then, one by one, adopt each of the following expert perspectives and write a separate review document for each. Read the project's REVIEW.md, original code, refactored code (if any), and any relevant notes before starting.

For EACH role, fully inhabit that perspective — think like they would, prioritise what they would, push for what they would. Each review should be written to its own file in `projects/{project-name}/reviews/`:

1. **Technical Architect** → `technical-architect.md` — System design, scalability, tech choices, data model, infrastructure
2. **Frontend Engineer** → `frontend.md` — UI architecture, components, state, performance, framework choice, build tooling
3. **Backend Engineer** → `backend.md` — API design, database, auth, server logic, costs, when/why we need a backend
4. **UX Designer** → `ux-design.md` — User flows, accessibility, mobile, interaction design, visual direction
5. **QA Engineer** → `qa.md` — Testing strategy, edge cases, bug report, test plan, cross-browser
6. **Copywriter** → `copywriter.md` — UI copy, brand voice, error messages, landing page, SEO, email, microcopy
7. **Security Specialist** → `security.md` — Vulnerabilities, threat model, data privacy, compliance, secure practices
8. **Business Advisor** → `business.md` — Market, revenue, costs, growth, risks, legal, metrics, honest commercial assessment

After all reviews are written, create a `projects/{project-name}/reviews/SUMMARY.md` that:
- Lists the top 3 priorities from each expert
- Identifies where experts agree (consensus) and where they disagree (tensions to resolve)
- Recommends a prioritised action plan that balances all perspectives

This is the equivalent of a full team sprint planning session. Take it seriously.
