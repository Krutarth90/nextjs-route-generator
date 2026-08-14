# Project Rules — Next.js Route Generator VS Code Extension

These rules are **always active** and must be followed in every implementation
session without exception.

---

## Code Quality

- Follow **KISS, DRY, SOLID, and YAGNI** at all times.
- Do not introduce technical debt for the sake of speed.
- If a requirement is ambiguous, **ask for clarification** before writing code.
- Work on **one feature at a time**. Do not mix unrelated changes.

---

## Git Workflow

This project follows **Git Flow**:

- `main` — always stable and release-ready.
- `develop` — integration branch for completed features.
- `feature/<name>` — one branch per feature or bug fix.
- `release/<version>` — release preparation branches.
- `hotfix/<name>` — urgent fixes branched from `main`.

**Before starting any work:**
1. Check the current branch with `git branch`.
2. Create a `feature/<name>` branch from `develop` if one does not exist.
3. Never commit directly to `main` or `develop`.

---

## Commit Rules

Every commit must be:
- **Atomic** — exactly one logical change.
- **Conventional** — follow the Conventional Commits specification.

### Required format
```
<type>(<scope>): <short description>

[optional body]

[optional footer: BREAKING CHANGE: ...]
```

### Allowed types
`feat` · `fix` · `refactor` · `docs` · `test` · `perf` · `build` · `ci` · `chore`

### Examples
```
feat(generator): add nested route support
fix(group): create route files before prompting for layout
refactor(utils): simplify segment classifier helpers
docs(readme): add dynamic route usage examples
```

Breaking changes use `!` after the type/scope, or a `BREAKING CHANGE:` footer.

---

## Releases

- Follow **Semantic Versioning** (`MAJOR.MINOR.PATCH`).
- Tag every release: `v0.1.0`, `v1.0.0`, etc.
- Every release must include:
  - Updated `CHANGELOG.md`
  - Updated version in `package.json`
  - A git tag
  - Release notes

---

## Documentation

Update the following whenever a feature changes:
- `README.md` — usage, commands, examples
- `CHANGELOG.md` — under the correct version heading
- Screenshots or flow diagrams if behavior changes visibly

Documentation must **never lag behind implementation**.

---

## Feature Lifecycle Checklist

Before marking a feature as complete:
- [ ] Code is implemented and compiles with `npm run compile`
- [ ] Feature is manually verified in the Extension Development Host (F5)
- [ ] Documentation is updated
- [ ] An atomic conventional commit is made
- [ ] The feature branch is ready to merge into `develop`
