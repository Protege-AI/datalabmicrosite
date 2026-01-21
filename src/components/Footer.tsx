import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Protege Data Lab</h3>
            <p className="mt-2 text-sm text-gray-600">
              Advancing research in data science and machine learning.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Quick Links</h4>
            <ul className="mt-2 space-y-2">
              <li><Link href="/people" className="text-sm text-gray-600 hover:text-blue-600">People</Link></li>
              <li><Link href="/blog" className="text-sm text-gray-600 hover:text-blue-600">Blog</Link></li>
              <li><Link href="/research" className="text-sm text-gray-600 hover:text-blue-600">Research</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
            <p className="mt-2 text-sm text-gray-600">
              contact@protegedatalab.com
            </p>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Protege Data Lab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
