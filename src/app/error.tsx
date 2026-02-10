'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-24">
      <div className="mx-auto max-w-5xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-wide text-[var(--orange)] mb-4">Error</p>
        <h1 className="text-4xl tracking-tight text-[var(--black)]">Something went wrong</h1>
        <p className="mt-4 text-[var(--muted)] font-light">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-8">
          <button
            onClick={reset}
            className="font-mono text-xs uppercase tracking-wide border border-[var(--black)] bg-[var(--black)] px-5 py-2.5 text-white hover:bg-[var(--pro-indigo)] hover:border-[var(--pro-indigo)] transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
