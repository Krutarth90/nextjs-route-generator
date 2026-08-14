// ─── Page Templates ───────────────────────────────────────────────────────────

export const getPageTemplate = (name: string) => `export default function ${name}Page() {
  return (
    <div>
      <h1>${name} Page</h1>
    </div>
  );
}
`;

/** Next.js 14: params is a plain object */
export const getDynamicPageTemplate14 = (
  name: string,
  params: Record<string, string>
) => {
  const paramsType = Object.keys(params)
    .map((k) => `${k}: string`)
    .join('; ');
  const destructured = Object.keys(params).join(', ');
  return `export default function ${name}Page({ params }: { params: { ${paramsType} } }) {
  const { ${destructured} } = params;

  return (
    <div>
      <h1>${name} Page</h1>
    </div>
  );
}
`;
};

/** Next.js 15: params is a Promise */
export const getDynamicPageTemplate15 = (
  name: string,
  params: Record<string, string>
) => {
  const paramsType = Object.keys(params)
    .map((k) => `${k}: string`)
    .join('; ');
  const destructured = Object.keys(params).join(', ');
  return `export default async function ${name}Page({ params }: { params: Promise<{ ${paramsType} }> }) {
  const { ${destructured} } = await params;

  return (
    <div>
      <h1>${name} Page</h1>
    </div>
  );
}
`;
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export const getLayoutTemplate = (name: string) => `export default function ${name}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      {children}
    </section>
  );
}
`;

// ─── Loading ──────────────────────────────────────────────────────────────────

export const getLoadingTemplate = () => `export default function Loading() {
  return <div>Loading...</div>;
}
`;

// ─── Error ────────────────────────────────────────────────────────────────────

export const getErrorTemplate = () => `'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
`;

// ─── Not Found ────────────────────────────────────────────────────────────────

export const getNotFoundTemplate = () => `import Link from 'next/link';

export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <Link href="/">Return Home</Link>
    </div>
  );
}
`;

// ─── Default (Parallel Routes) ────────────────────────────────────────────────

export const getDefaultTemplate = () => `export default function Default() {
  return null;
}
`;
