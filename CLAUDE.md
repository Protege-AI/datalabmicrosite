# Daylab Microsite

## Project Context
This is the Daylab microsite - a marketing/informational website for Daylab.

## Git Workflow (Ask Every Session)

**At the start of each session**, ask the user:
> "Are you starting new work, or continuing on an existing branch?"

**If starting new work:**
1. Sync with latest main:
   ```bash
   git checkout main
   git fetch origin
   git reset --hard origin/main
   ```
2. Ask what they're working on
3. Create a new branch: `git checkout -b <descriptive-branch-name>`

**If continuing existing work:**
1. Run `git status` to show current branch and state
2. Proceed with their request

**Branch naming**: Use descriptive kebab-case names (e.g., `add-contact-form`, `fix-nav-bug`)

**Why this matters**: After a PR is merged, GitHub auto-deletes the branch. Starting new work on a stale/deleted branch causes issues.

**Why `reset --hard` instead of `pull`**: When PRs are squash-merged on GitHub, the commit hash changes. This can cause local main to diverge from origin/main, making `git pull` fail. Using `fetch` + `reset --hard` ensures local main always matches origin exactly.

## Design Standards
When working on any frontend code (HTML, CSS, React components, pages, layouts):

1. **Always apply the `frontend-design` skill** - Create distinctive, production-grade interfaces that avoid generic "AI slop" aesthetics. Commit to bold aesthetic directions with intentional typography, color, motion, and spatial composition.

2. **Follow `web-design-guidelines`** - Ensure compliance with Vercel's web interface standards.

## Security Standards
When implementing authentication, handling user input, creating API endpoints, or working with sensitive data:

3. **Apply `security-review` skill** - Follow security best practices for secrets management, input validation, SQL injection prevention, XSS/CSRF protection, and rate limiting.

## Key Principles
- Choose distinctive, characterful fonts (avoid Inter, Roboto, Arial)
- Use cohesive color themes with CSS variables
- Add purposeful motion and animations
- Create unexpected layouts with asymmetry and visual interest
- Match the existing site aesthetic while pushing creative boundaries
- Never hardcode secrets - use environment variables
- Validate all user inputs with schemas (e.g., Zod)
- Use parameterized queries for database operations
