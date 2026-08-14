# Next.js Route Generator

A VS Code extension that lets you scaffold Next.js App Router routes from the
Explorer context menu — without leaving the editor.

Right-click any folder → **Create Next.js Route** → type a path → done.

---

## Features

- **Nested route creation** via `/` splitting — `blog/[postId]/comments` creates the full folder tree.
- **Dynamic route support** — segments like `[postId]` automatically inject typed `params` props into `page.tsx`.
- **Auto Next.js version detection** — reads your `package.json` and generates the correct params signature for Next.js 14 or 15 automatically (no prompt needed).
- **Route group support** — `(auth)` creates a route group folder with an optional shared `layout.tsx` and interactive sub-route creation.
- **Parallel route support** — `@modal` generates `default.tsx` automatically.
- **Intercepting routes** — `(..)photo` creates the correctly named folder.
- **Boilerplate for all special files** — `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `default.tsx` (where applicable).

---

## Installation

### From source (development)

```bash
git clone https://github.com/your-org/nextjs-route-generator
cd nextjs-route-generator
npm install
```

Press `F5` in VS Code to launch the Extension Development Host.

### From VSIX

```bash
npx vsce package
# Then in VS Code: Extensions → ··· → Install from VSIX
```

---

## Usage

1. Open your Next.js project in VS Code.
2. In the **Explorer** sidebar, right-click any folder (e.g., `app/`).
3. Click **Create Next.js Route**.
4. Type the route path and press `Enter`.

### Route path examples

| Input | What gets created |
|---|---|
| `dashboard` | `dashboard/` with all files |
| `blog/[postId]/comments` | `blog/[postId]/comments/` — only leaf gets files |
| `(auth)` | Route group with optional layout + interactive sub-routes |
| `(auth)/dashboard` | `(auth)/` optional layout, then `dashboard/` with all files |
| `@modal` | Parallel route with `default.tsx` included |
| `(..)photo` | Intercepting route folder with all files |

---

## Generated file types

| File | When generated |
|---|---|
| `page.tsx` | Always (leaf segment) |
| `layout.tsx` | Always (leaf segment) |
| `loading.tsx` | Always (leaf segment) |
| `error.tsx` | Always (leaf segment) |
| `not-found.tsx` | Always (leaf segment) |
| `default.tsx` | Only for parallel routes (`@slot`) |

---

## Dynamic route params

If any segment in the path is dynamic (e.g., `[postId]`), the extension reads
your project's `package.json` to detect the Next.js version and generates the
correct `params` signature automatically.

**Next.js 15** (params is a Promise):
```tsx
export default async function CommentsPage({
  params,
}: {
  params: Promise<{ postId: string }>;
}) {
  const { postId } = await params;
  // ...
}
```

**Next.js 14** (params is a plain object):
```tsx
export default function CommentsPage({
  params,
}: {
  params: { postId: string };
}) {
  const { postId } = params;
  // ...
}
```

Multiple dynamic ancestors are merged into a single type:
```
blog/[postId]/comments/[commentId]
→ params: { postId: string; commentId: string }
```

---

## Route groups

Entering `(marketing)` triggers a guided flow:

1. **How many routes to create inside `(marketing)`?**
2. For each route: **name?** (supports nested paths and dynamic segments)
3. **Add a shared `layout.tsx`?** (asked after all routes are written)

---

## Development

```bash
npm install        # install dependencies
npm run compile    # compile TypeScript
npm run watch      # watch mode
```

Press `F5` to open the Extension Development Host for manual testing.

---

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

---

## License

MIT
