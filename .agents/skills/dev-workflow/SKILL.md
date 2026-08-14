---
name: dev-workflow
description: >-
  Complete development workflow for the Next.js Route Generator VS Code
  extension. Covers Git Flow branching, atomic conventional commits, semantic
  versioning, release preparation, and the full feature lifecycle checklist.
  Activate when starting a new feature, preparing a release, or reviewing
  workflow compliance.
---

# Development Workflow — Next.js Route Generator

---

## Project Overview

| Item | Value |
|---|---|
| Language | TypeScript |
| Runtime | Node.js (VS Code Extension Host) |
| Entry point | `src/extension.ts` |
| Templates | `src/templates.ts` |
| Build command | `npm run compile` |
| Test environment | F5 → Extension Development Host |
| Package command | `npx vsce package` |

---

## Branch Model (Git Flow)

```
main          ← always stable; tagged releases only
  └─ develop  ← integration of completed features
       └─ feature/<name>   ← one per feature/fix
       └─ release/<semver> ← release prep
  └─ hotfix/<name>         ← urgent fixes from main
```

### Starting a new feature

```bash
git checkout develop
git pull origin develop          # sync if remote exists
git checkout -b feature/<name>   # e.g. feature/catch-all-routes
```

### Finishing a feature

```bash
# On feature/<name>:
git checkout develop
git merge --no-ff feature/<name>
git branch -d feature/<name>
```

---

## Commit Workflow

### 1. Stage only what belongs to this logical change
```bash
git add <specific files>    # never `git add .` blindly
git diff --staged           # review before committing
```

### 2. Write a Conventional Commit message

```
<type>(<scope>): <imperative, lowercase description>

[optional body — explain WHY, not WHAT]

[optional footer]
BREAKING CHANGE: <description>   ← only if applicable
```

**Types:**

| Type | When to use |
|---|---|
| `feat` | New user-facing capability |
| `fix` | Bug correction |
| `refactor` | Code restructure with no behavior change |
| `docs` | README, CHANGELOG, comments only |
| `test` | Adding or fixing tests |
| `perf` | Performance improvement |
| `build` | Build system, `package.json`, `tsconfig` |
| `ci` | GitHub Actions / CI scripts |
| `chore` | Maintenance tasks (deps, `.gitignore`, etc.) |

**Scope examples for this project:** `generator`, `group`, `dynamic`, `templates`, `utils`, `cli`, `readme`, `changelog`

### 3. Examples

```
feat(generator): add nested route support via / splitting

fix(group): write route files before prompting for shared layout

refactor(utils): extract toComponentName into a pure helper

docs(readme): document (route-group) flow with examples

chore(deps): upgrade @types/vscode to 1.90.0
```

---

## Feature Lifecycle Checklist

Run through this for **every** feature before merging:

```
[ ] Feature branch created from develop
[ ] Code implemented
[ ] `npm run compile` exits with code 0
[ ] Manually verified in Extension Development Host (F5)
[ ] README updated if behavior visible to users
[ ] CHANGELOG.md updated under [Unreleased]
[ ] Atomic conventional commit(s) made
[ ] Ready to merge into develop
```

---

## Release Process

### 1. Create a release branch
```bash
git checkout develop
git checkout -b release/0.2.0
```

### 2. Bump the version
- Update `version` in `package.json`
- Move `[Unreleased]` entries in `CHANGELOG.md` under the new version heading

```markdown
## [0.2.0] — 2025-08-14

### Added
- Nested route support via `/` splitting
- Auto-detection of Next.js version from package.json

### Fixed
- Route files now created before layout prompt to prevent data loss on focus loss
```

### 3. Compile & verify
```bash
npm run compile
# F5 to verify in Extension Development Host
```

### 4. Package
```bash
npx vsce package
# Produces nextjs-route-generator-0.2.0.vsix
```

### 5. Commit, merge, tag
```bash
git add package.json CHANGELOG.md
git commit -m "chore(release): bump version to 0.2.0"

# Merge to main
git checkout main
git merge --no-ff release/0.2.0
git tag -a v0.2.0 -m "Release v0.2.0"

# Back-merge to develop
git checkout develop
git merge --no-ff release/0.2.0

git branch -d release/0.2.0
```

---

## Hotfix Process

```bash
git checkout main
git checkout -b hotfix/<description>

# Fix the bug, commit atomically
git commit -m "fix(scope): <description>"

# Merge to main and develop
git checkout main
git merge --no-ff hotfix/<description>
git tag -a v0.1.1 -m "Hotfix v0.1.1"

git checkout develop
git merge --no-ff hotfix/<description>

git branch -d hotfix/<description>
```

---

## Semantic Versioning Rules

| Change type | Version bump | Example |
|---|---|---|
| Bug fix, patch improvement | PATCH | `0.1.0 → 0.1.1` |
| New feature, backward-compatible | MINOR | `0.1.0 → 0.2.0` |
| Breaking change | MAJOR | `0.x.x → 1.0.0` |

---

## Documentation Update Rules

When a feature changes user-visible behavior, always update:

1. **README.md** — usage section, commands, examples
2. **CHANGELOG.md** — under `[Unreleased]` with the correct category (`Added`, `Changed`, `Fixed`, `Removed`)
3. Screenshots or GIFs if the prompt flow changes

---

## Anti-Patterns (Never Do These)

- ❌ `git add .` without reviewing the diff
- ❌ Commits like `"fix stuff"` or `"wip"` or `"updates"`
- ❌ Mixing a feature and a bug fix into the same commit
- ❌ Committing directly to `main` or `develop`
- ❌ Leaving `CHANGELOG.md` or `README.md` stale after a feature lands
- ❌ Starting a second feature before the first one is committed and merged
