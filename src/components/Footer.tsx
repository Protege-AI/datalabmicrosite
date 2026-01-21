import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wide text-neutral-900">Protege Data Lab</h3>
            <p className="mt-3 text-sm text-neutral-500 font-light">
              Advancing research in data science and machine learning.
            </p>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wide text-neutral-900">Links</h4>
            <ul className="mt-3 space-y-2">
              <li><Link href="/about" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">About</Link></li>
              <li><Link href="/people" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">People</Link></li>
              <li><Link href="/blog" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Blog</Link></li>
              <li><Link href="/research" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Research</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wide text-neutral-900">Contact</h4>
            <p className="mt-3 text-sm text-neutral-500 font-light">
              contact@protegedatalab.com
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-neutral-200 pt-6 text-xs text-neutral-400 font-mono">
          © {new Date().getFullYear()} Protege Data Lab
        </div>
      </div>
    </footer>
  );
}
