Review and audit a tutorial project for refactoring.

Given the project name "$ARGUMENTS", do the following:

1. Find and read the original source code (check GitHub repos just-joe27 and JCrocker4679, or local files)
2. Set up the project folder from the template in `projects/.template/`
3. Save the original code in `projects/{project-name}/original/`
4. Do a PM-style audit covering:
   - What works in the original
   - What's missing for production (error handling, accessibility, loading states, security, testing, SEO, responsive design)
   - Who would actually use this and why
   - What a "real" v2 would look like — user stories, features, the full vision
   - A phased refactor plan (foundations → features → polish)
5. Write it all up in the project's `REVIEW.md`
6. Check if any APIs or external dependencies the project uses are still active

Don't start refactoring yet — this is the review and planning stage only.
