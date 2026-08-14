import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
  getPageTemplate,
  getDynamicPageTemplate14,
  getDynamicPageTemplate15,
  getLayoutTemplate,
  getLoadingTemplate,
  getErrorTemplate,
  getNotFoundTemplate,
  getDefaultTemplate,
} from './templates';

// ─── Types ────────────────────────────────────────────────────────────────────

type NextVersion = '14' | '15';

// ─── Segment Classifier Helpers ───────────────────────────────────────────────

/** [postId] */
const isDynamic = (s: string) => /^\[.+\]$/.test(s);

/** (auth) — must NOT match (..) or (.) intercepting prefixes */
const isRouteGroup = (s: string) => /^\([^.][^)]*\)$/.test(s);

/** @modal */
const isParallel = (s: string) => s.startsWith('@');

/** Extracts raw param key: [postId] → postId */
const extractParam = (s: string) => s.slice(1, -1);

/**
 * Converts any segment into a valid PascalCase React component name.
 *   [postId]   → PostId
 *   (auth)     → Auth
 *   @modal     → Modal
 *   (..)photo  → Photo
 *   my-route   → MyRoute
 */
const toComponentName = (segment: string): string => {
  const clean = segment
    .replace(/^\[(.+)\]$/, '$1')   // [postId] → postId
    .replace(/^\(\.{0,3}\)/, '')   // (..)/(.)/(...) prefix → ''
    .replace(/^\((.+)\)$/, '$1')   // (auth) → auth
    .replace(/^@/, '')             // @modal → modal
    .replace(/[-_]/g, ' ');        // my-route → my route

  return clean
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
};

// ─── Version Auto-Detection ───────────────────────────────────────────────────

/**
 * Walks up from `startDir` until it finds a package.json that lists "next"
 * as a dependency. Returns the major version number (14 or 15) or falls back
 * to 15 if undetectable.
 */
function detectNextVersion(startDir: string): NextVersion {
  let dir = startDir;
  const root = path.parse(dir).root;

  while (dir !== root) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };
        const nextVersion: string | undefined = deps['next'];
        if (nextVersion) {
          // Strip semver range prefix (^, ~, >=, etc.) and grab first number
          const major = parseInt(nextVersion.replace(/[^0-9]/, ''), 10);
          if (!isNaN(major)) {
            return major >= 15 ? '15' : '14';
          }
        }
      } catch {
        // malformed package.json — keep walking up
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) { break; }
    dir = parent;
  }

  // Fallback
  return '15';
}

// ─── File Writer ──────────────────────────────────────────────────────────────

/**
 * Writes the standard set of Next.js boilerplate files into `dir`.
 * Pass `skipPage: true` to omit page.tsx (used for route-group layout-only mode).
 * Pass `includeDefault: true` to add default.tsx (parallel routes).
 */
function writeRouteFiles(
  dir: string,
  segment: string,
  dynamicParams: Record<string, string>,
  version: NextVersion,
  options: { skipPage?: boolean; includeDefault?: boolean } = {}
): void {
  const componentName = toComponentName(segment);
  const hasDynamic = Object.keys(dynamicParams).length > 0;

  const files: string[] = [];
  if (!options.skipPage) { files.push('page.tsx'); }
  files.push('layout.tsx', 'loading.tsx', 'error.tsx', 'not-found.tsx');
  if (options.includeDefault) { files.push('default.tsx'); }

  for (const file of files) {
    let content = '';
    switch (file) {
      case 'page.tsx':
        if (hasDynamic) {
          content = version === '15'
            ? getDynamicPageTemplate15(componentName, dynamicParams)
            : getDynamicPageTemplate14(componentName, dynamicParams);
        } else {
          content = getPageTemplate(componentName);
        }
        break;
      case 'layout.tsx':   content = getLayoutTemplate(componentName); break;
      case 'loading.tsx':  content = getLoadingTemplate(); break;
      case 'error.tsx':    content = getErrorTemplate(); break;
      case 'not-found.tsx': content = getNotFoundTemplate(); break;
      case 'default.tsx':  content = getDefaultTemplate(); break;
    }
    fs.writeFileSync(path.join(dir, file), content);
  }
}

// ─── Core Route Builder ───────────────────────────────────────────────────────

/**
 * Recursively walks `segments`, creates folders, and writes files into the
 * last non-group leaf segment. Route groups trigger their own sub-flow.
 *
 * @param baseDir          Absolute directory to start from.
 * @param segments         Remaining path segments to process.
 * @param accumulatedParams Dynamic params inherited from ancestors.
 * @param version          Detected Next.js version.
 */
async function buildSegments(
  baseDir: string,
  segments: string[],
  accumulatedParams: Record<string, string>,
  version: NextVersion,
  /** Human-readable label of the parent route group, used for contextual prompts */
  groupLabel?: string
): Promise<void> {
  if (segments.length === 0) { return; }

  const [segment, ...rest] = segments;
  const currentDir = path.join(baseDir, segment);
  fs.mkdirSync(currentDir, { recursive: true });

  // Accumulate dynamic param from this segment
  const params = { ...accumulatedParams };
  if (isDynamic(segment)) {
    params[extractParam(segment)] = 'string';
  }

  if (isRouteGroup(segment)) {
    // ── Route Group Flow ───────────────────────────────────────────────────
    // Bug fix #2: use segment as groupLabel for every nested prompt below

    if (rest.length > 0) {
      // Remaining segments after the group are routed inside it.
      // Create those route files FIRST, then ask about layout.
      await buildSegments(currentDir, rest, params, version, segment);

      // Bug fix #1: ask about shared layout AFTER child routes are written
      const layoutPick = await vscode.window.showQuickPick(
        [
          { label: 'Yes', description: `Create a shared layout.tsx inside ${segment}` },
          { label: 'No',  description: 'No shared layout' },
        ],
        { placeHolder: `Route group ${segment} — add a shared layout.tsx?` }
      );
      if (layoutPick?.label === 'Yes') {
        const componentName = toComponentName(segment);
        fs.writeFileSync(path.join(currentDir, 'layout.tsx'), getLayoutTemplate(componentName));
      }
    } else {
      // The group is the last segment — interactive sub-route creation.
      // Ask how many routes first.
      const countStr = await vscode.window.showInputBox({
        prompt: `How many routes do you want to create inside ${segment}?`,
        placeHolder: '2',
        validateInput: (v) => (isNaN(parseInt(v, 10)) || parseInt(v, 10) < 1 ? 'Enter a positive number' : null),
      });
      if (!countStr) { return; }

      const count = parseInt(countStr, 10);

      // Bug fix #1: create all sub-routes first, then ask about shared layout
      for (let i = 0; i < count; i++) {
        // Bug fix #2: include the group name in each prompt
        const subRoute = await vscode.window.showInputBox({
          prompt: `Creating nested route ${i + 1}/${count} for ${segment} — enter the path (e.g., home, blog/[postId])`,
          placeHolder: 'home',
        });
        if (!subRoute) { return; }

        const subSegments = subRoute.split('/').map((s) => s.trim()).filter(Boolean);
        const subTopDir = path.join(currentDir, subSegments[0]);
        if (fs.existsSync(subTopDir)) {
          vscode.window.showWarningMessage(`"${subSegments[0]}" already exists inside ${segment}, skipping.`);
          continue;
        }
        await buildSegments(currentDir, subSegments, params, version, segment);
      }

      // Bug fix #1: ask about shared layout only after all routes are written
      const layoutPick = await vscode.window.showQuickPick(
        [
          { label: 'Yes', description: `Create a shared layout.tsx inside ${segment}` },
          { label: 'No',  description: 'No shared layout' },
        ],
        { placeHolder: `Route group ${segment} — add a shared layout.tsx?` }
      );
      if (layoutPick?.label === 'Yes') {
        const componentName = toComponentName(segment);
        fs.writeFileSync(path.join(currentDir, 'layout.tsx'), getLayoutTemplate(componentName));
      }
    }

  } else if (rest.length === 0) {
    // ── Leaf Segment ───────────────────────────────────────────────────────
    writeRouteFiles(currentDir, segment, params, version, {
      includeDefault: isParallel(segment),
    });

  } else {
    // ── Intermediate Non-Group Segment ─────────────────────────────────────
    // Only create the folder; files go in the deepest leaf.
    await buildSegments(currentDir, rest, params, version, groupLabel);
  }
}

// ─── Extension Entry Point ────────────────────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    'nextjs-routes.createRoute',
    async (uri: vscode.Uri) => {
      if (!uri) {
        vscode.window.showErrorMessage('Please use this command from the Explorer context menu.');
        return;
      }
      const targetPath = uri.fsPath;

      // 1. Auto-detect Next.js version from the workspace's package.json
      const version = detectNextVersion(targetPath);

      // 2. Prompt for route path
      const routeInput = await vscode.window.showInputBox({
        prompt: 'Enter the route path (e.g., dashboard, blog/[postId]/comments, (marketing))',
        placeHolder: 'blog/[postId]/comments',
      });
      if (!routeInput) { return; }

      const segments = routeInput.split('/').map((s) => s.trim()).filter(Boolean);
      if (segments.length === 0) {
        vscode.window.showErrorMessage('Invalid route path.');
        return;
      }

      // 3. Guard: top-level folder must not already exist
      const topLevelDir = path.join(targetPath, segments[0]);
      if (fs.existsSync(topLevelDir)) {
        vscode.window.showErrorMessage(`Directory "${segments[0]}" already exists.`);
        return;
      }

      // 4. Build the route tree
      try {
        await buildSegments(targetPath, segments, {}, version);
        vscode.window.showInformationMessage(`✅ Route created: ${routeInput} (Next.js ${version})`);
      } catch (error: any) {
        vscode.window.showErrorMessage(`Failed to create route: ${error.message}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
