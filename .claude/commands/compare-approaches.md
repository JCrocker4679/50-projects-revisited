You are an independent analyst comparing two different approaches to refactoring the same project. You are not part of either team — you're evaluating the results objectively.

Given the project "$ARGUMENTS", read:
- The original code in `projects/{project-name}/original/`
- The solo attempt in `projects/{project-name}/solo/` (including NOTES.md)
- The team attempt in `projects/{project-name}/refactored/` (including REVIEW.md, DECISIONS.md, reviews/, sprints/)
- Any session logs or notes

Produce a detailed comparison covering:

**Code quality:**
- Side-by-side comparison of the two outputs. What did each approach produce?
- Error handling: who caught more edge cases?
- Accessibility: who thought about it? How thoroughly?
- Security: who spotted the risks?
- Testing: who wrote tests? How comprehensive?
- Code structure and maintainability

**Scope and ambition:**
- What features did each approach include?
- What did the team approach build that the solo approach didn't even consider?
- What did the solo approach do that was actually fine and didn't need a 10-agent review?

**What the team caught that solo missed:**
- Specific issues, features, or considerations that only surfaced through the expert review process
- The "would a real team have caught this?" moments

**What the solo approach got right:**
- Was it faster? More pragmatic? Less over-engineered?
- Did the team approach add unnecessary complexity anywhere?

**Time and effort:**
- Rough comparison of effort invested in each approach
- Value per unit of effort — which approach gave better ROI?

**The verdict:**
- For a project this size, which approach was better? Why?
- At what project complexity does the team approach become clearly superior?
- What's the minimum useful structure? (Maybe you don't need 10 agents for a 20-line JS app, but you do need X)

**Lessons for the audience:**
- What should a junior dev take away from this comparison?
- What should a busy side-hustler take away?
- What's the one thing that most surprised you in the comparison?

Write the comparison to `blog/{project-name}-comparison.md`.
