'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { ContentBlock } from '@/lib/notion';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleSidebarProps {
  content: ContentBlock[];
  articleType?: string;
  articleTypeColor?: string;
}

export function ArticleSidebar({ content, articleType, articleTypeColor }: ArticleSidebarProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tocRef = useRef<HTMLUListElement>(null);
  const rafRef = useRef<number>(0);
  const [tocHeight, setTocHeight] = useState(0);

  // Extract headings for TOC
  const headings: TOCItem[] = useMemo(() => content
    .filter((block) => ['heading_1', 'heading_2', 'heading_3'].includes(block.type))
    .map((block) => ({
      id: block.id,
      text: block.content,
      level: parseInt(block.type.replace('heading_', '')),
    })), [content]);

  // Measure TOC height for progress bar
  useEffect(() => {
    if (tocRef.current) {
      setTocHeight(tocRef.current.offsetHeight);
    }
  }, [headings]);

  // Track scroll position for progress bar and active section
  const handleScroll = useCallback(() => {
    const article = document.querySelector('article');
    if (!article) return;

    const articleRect = article.getBoundingClientRect();
    const articleTop = articleRect.top + window.scrollY;
    const articleHeight = articleRect.height;
    const scrollPosition = window.scrollY;
    const windowHeight = window.innerHeight;

    // Calculate progress
    const start = articleTop - windowHeight * 0.3;
    const end = articleTop + articleHeight - windowHeight * 0.7;
    const currentProgress = Math.max(0, Math.min(1, (scrollPosition - start) / (end - start)));
    setProgress(currentProgress * 100);

    // Find active heading
    let currentActiveId = '';
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.top <= 150) {
          currentActiveId = heading.id;
        }
      }
    }
    setActiveId(currentActiveId);
  }, [headings]);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        handleScroll();
        rafRef.current = 0;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  };

  if (headings.length === 0) return null;

  // Calculate the position and size of the progress indicator
  const indicatorHeight = Math.max(40, tocHeight * 0.15); // At least 40px, or 15% of TOC height
  const indicatorTop = (progress / 100) * (tocHeight - indicatorHeight);

  // Always use indigo for the progress bar
  const accentColor = 'var(--pro-indigo)';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-48 shrink-0">
        <div className="sticky top-24">
          {/* Progress track */}
          <div className="flex">
            <div
              className="relative w-0.5 mr-3 shrink-0"
              style={{ height: tocHeight > 0 ? tocHeight : 'auto' }}
            >
              <div className="absolute inset-0 bg-[var(--cloud)]" />
              <div
                className="absolute left-0 right-0 transition-all duration-150 ease-out"
                style={{
                  top: indicatorTop,
                  height: indicatorHeight,
                  backgroundColor: accentColor,
                }}
              />
            </div>

            {/* TOC links */}
            <nav className="flex-1">
              <ul ref={tocRef} className="space-y-1.5">
                {headings.map((heading) => (
                  <li
                    key={heading.id}
                    style={{ paddingLeft: `${(heading.level - 1) * 8}px` }}
                  >
                    <button
                      onClick={() => scrollToHeading(heading.id)}
                      className={`text-left text-xs leading-snug transition-colors duration-150 hover:text-[var(--pro-indigo)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)] ${
                        activeId === heading.id
                          ? 'text-[var(--black)] font-medium'
                          : 'text-[var(--muted)]/70'
                      }`}
                    >
                      {heading.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>

      {/* Mobile Progress Bar */}
      <div className="lg:hidden fixed top-14 left-0 right-0 z-40 h-1 bg-[var(--cloud)]">
        <div
          className="h-full transition-all duration-150"
          style={{
            width: `${progress}%`,
            backgroundColor: articleTypeColor || 'var(--pro-indigo)',
          }}
        />
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-[var(--black)] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[var(--pro-indigo)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        aria-label="Table of contents"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ${
          isMenuOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-xs uppercase tracking-wide text-[var(--muted)]">
              Contents
            </h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 -mr-2 text-[var(--muted)] hover:text-[var(--black)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pro-indigo)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <ul className="space-y-3">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
              >
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={`text-left text-sm transition-colors ${
                    activeId === heading.id
                      ? 'text-[var(--pro-indigo)] font-medium'
                      : 'text-[var(--muted)]'
                  }`}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
