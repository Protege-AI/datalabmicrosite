import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-[var(--sand)] bg-[var(--sand)]/30">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/protege-logo.svg"
                alt="Protege"
                width={20}
                height={20}
                className="w-5 h-5"
              />
              <h3 className="font-mono text-xs uppercase tracking-wide text-[var(--black)]">Data Lab by Protege</h3>
            </div>
            <p className="mt-3 text-sm text-[var(--muted)] font-light">
              Tackling the fundamental challenges in data for AI.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wide text-[var(--black)]">Contact</h4>
            <a href="mailto:data@withprotege.ai" className="mt-3 block text-sm text-[var(--muted)] font-light hover:text-[var(--pro-indigo)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)]">
              data@withprotege.ai
            </a>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wide text-[var(--black)]">Need Data?</h4>
            <a href="https://withprotege.ai" target="_blank" rel="noopener noreferrer" className="mt-3 block text-sm text-[var(--muted)] font-light hover:text-[var(--pro-indigo)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)]">
              Visit withprotege.ai
            </a>
          </div>
        </div>
        <div className="mt-6 border-t border-[var(--cloud)] pt-4 text-xs text-[var(--muted)] font-mono">
          © {new Date().getFullYear()} Data Lab by Protege
        </div>
      </div>
    </footer>
  );
}
