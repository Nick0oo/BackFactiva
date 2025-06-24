# General Engineering Rules

## 1. Code Design Principles

- Apply *SOLID principles* in all object-oriented codebases.
- Avoid duplication using *DRY* ("Don't Repeat Yourself").
- Favor *composition over inheritance* whenever possible.
- Keep things simple — follow the *KISS* principle.
- Don't over-engineer — remember *YAGNI* ("You Aren't Gonna Need It").
- Apply the *Single Responsibility Principle* not only to classes but also to files and functions.

## 2. Code Style & Structure

- Functions should be small, pure, and focused on a single task.
- File names, variables, classes, and functions must be descriptive and consistent.
- Prefer early returns to avoid deep nesting.
- Keep files under control — split logic into modules/components/services.
- Enforce *immutability* where practical.
- Use linters & formatters (auto-format on save):
  - JavaScript/TypeScript: ESLint + Prettier
  - Python: flake8, black, isort
  - PHP: PHP-CS-Fixer or phpcs
- Add an .editorconfig to ensure consistent spacing, line endings, etc.

## 3. Git Workflow & Commit Standards

- Use clear, atomic commits (e.g. fix: login error on Safari).
- Follow feature/, bugfix/, hotfix/, refactor/ branch naming conventions.
- Pull requests must be reviewed before merging.
- Keep the main branch always deployable.
- Optionally use *Conventional Commits* (feat:, fix:, etc.).

## 4. Project Organization

- Follow a clear folder structure: isolate business logic, infrastructure, and utilities.
- Use .env files for config and secrets (and always .gitignore them).
- Keep configs in version control (.eslintrc, .prettierrc, tsconfig.json, etc.).
- Define scripts in package.json, Makefile, or pyproject.toml for common tasks.

## 5. Testing

- Cover business logic with *unit tests*.
- Add *integration tests* for workflows and edge cases.
- Use clear and behavior-focused test names.
- Aim for meaningful coverage, but don't chase 100%.

## 6. Security & Secrets

- Never commit credentials, API keys, or access tokens.
- Sanitize and validate all user input.
- Avoid exposing internal logic or error traces to end users.
- Keep dependencies up to date and scan them regularly (npm audit, pip-audit, etc.).

## 7. Performance & Scalability

- Monitor performance of critical paths.
- Optimize for clarity first, performance when needed.
- Use lazy loading, caching, and pagination where relevant.
- Prefer async/non-blocking code when it improves UX or throughput.

## 8. Documentation

- Every project must have a README.md with:
  - Setup instructions
  - Environment variables
  - Useful scripts or commands
  - Tech stack overview
- Comment only where the *why* isn't obvious from the *what*.
- Use consistent code documentation conventions (JSDoc, docstrings, etc.).

## 9. Developer Experience

- Make setup easy: use scripts or tools like make, nvm, Docker, etc.
- Format and lint automatically on save or before commits.
- Use pre-commit hooks or CI to enforce quality where appropriate.

## 10. Communication & Collaboration

- Use clear, concise, and respectful code reviews.
- Leave helpful comments and request clarification when needed.
- Document major decisions in DECISIONS.md or in the repo wiki. 