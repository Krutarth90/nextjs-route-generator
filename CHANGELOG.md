# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.1] — 2026-08-14

### Added
- Added VS Code Marketplace metadata (`publisher`, `repository`, `keywords`, etc.) to `package.json`.
- Added MIT `LICENSE` file.

### Fixed
- Fixed publisher ID correctly pointing to `krutarth.pipaliya`.

---

## [0.1.0] — 2026-08-14

### Added
- Explorer context menu command **Create Next.js Route** on any folder.
- Nested route creation by splitting input on `/` — e.g. `blog/[postId]/comments`.
  - Intermediate segments receive only a folder; all boilerplate files land in the deepest leaf.
- Dynamic route segment detection (`[param]`):
  - Generates typed `params` prop in `page.tsx`.
  - Merges multiple dynamic ancestor params into a single type object.
- Auto-detection of Next.js version from the workspace `package.json`:
  - Next.js 15: `params` is a `Promise`.
  - Next.js 14: `params` is a plain object.
  - Falls back to Next.js 15 behaviour if no `next` dependency is found.
- Route group support (`(name)`):
  - No `page.tsx` generated for the group folder itself.
  - Prompts to add a shared `layout.tsx` **after** all child routes are written.
  - Interactive sub-route creation when the group is the terminal segment.
  - Contextual prompts include the parent group name (e.g. `Creating nested route 1/2 for (auth)`).
- Parallel route support (`@slot`):
  - Generates `default.tsx` in addition to the standard file set.
- Intercepting route support (`(..)segment`).
- Boilerplate generated for: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `default.tsx`.
- PascalCase component naming derived from the raw segment name:
  - `[postId]` → `PostIdPage`
  - `(auth)` → `AuthPage`
  - `my-route` → `MyRoutePage`
- Whitespace trimming on all path segments to prevent malformed folder names.

### Fixed
- Route files are now written to disk before the shared layout prompt is shown,
  preventing data loss when the prompt loses focus.

[0.1.0]: https://github.com/your-org/nextjs-route-generator/releases/tag/v0.1.0
