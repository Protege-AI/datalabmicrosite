import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-[var(--pro-indigo)] mb-4">404</p>
        <h1 className="text-4xl tracking-tight text-[var(--black)]">Page not found</h1>
        <p className="mt-4 text-[var(--muted)] font-light">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-8">
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wide text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
