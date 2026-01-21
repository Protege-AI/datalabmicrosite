import Link from 'next/link';
import Image from 'next/image';
import { getNews, getResearchProjects } from '@/lib/notion';

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const [news, researchProjects] = await Promise.all([
    getNews().catch(() => []),
    getResearchProjects().catch(() => []),
  ]);

  // Use Notion data if available, otherwise show placeholder
  const displayNews = news.length > 0 ? news.slice(0, 3) : [
    { id: '1', date: 'January 2025', title: 'New paper accepted at ICML 2025', description: 'Our work on scalable data pipelines has been accepted.' },
    { id: '2', date: 'December 2024', title: 'Lab wins Best Paper Award', description: 'Congratulations to the team for this achievement.' },
    { id: '3', date: 'November 2024', title: 'Welcome new PhD students', description: 'We are excited to welcome three new members to the lab.' },
  ];

  const displayResearch = researchProjects.length > 0 ? researchProjects.slice(0, 3) : [
    { id: '1', title: 'Data Infrastructure', description: 'Building scalable systems for data processing and management.', tags: [] },
    { id: '2', title: 'Machine Learning', description: 'Developing novel ML algorithms for real-world applications.', tags: [] },
    { id: '3', title: 'Data Visualization', description: 'Creating intuitive interfaces for complex data exploration.', tags: [] },
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="border-b border-[var(--cloud)] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h1 className="text-4xl tracking-tight text-[var(--black)] sm:text-5xl">
                Welcome to the Protege Data Lab
              </h1>
              <p className="mt-6 text-lg text-[var(--muted)] font-light leading-relaxed">
                We are a team of research scientists committed to tackling the fundamental
                challenges and open questions regarding data for AI. We're committed to
                bridging the gap between research theory and data deployment to push the
                frontier forward.
              </p>
              <div className="mt-8 flex gap-3">
                <Link
                  href="/about"
                  className="border border-[var(--black)] bg-[var(--black)] px-5 py-2.5 text-xs font-mono uppercase tracking-wide text-white hover:bg-[var(--pro-indigo)] hover:border-[var(--pro-indigo)] transition-colors"
                >
                  Learn More
                </Link>
                <Link
                  href="/contact"
                  className="border border-[var(--cloud)] px-5 py-2.5 text-xs font-mono uppercase tracking-wide text-[var(--muted)] hover:border-[var(--pro-indigo)] hover:text-[var(--pro-indigo)] transition-colors"
                >
                  Join Us
                </Link>
              </div>
            </div>
            <div className="relative h-64 lg:h-80 overflow-hidden border border-[var(--cloud)]">
              <Image
                src="/images/data-visualization.png"
                alt="Data visualization showing AI model comparisons"
                fill
                className="object-cover object-left"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-mono uppercase tracking-wide text-[var(--orange)] mb-8">Latest News</h2>
          <div className="space-y-0 divide-y divide-[var(--cloud)]/50">
            {displayNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="block py-5 group"
              >
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-[var(--muted)] group-hover:text-[var(--orange)] transition-colors shrink-0 w-28">{formatDate(item.date)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base text-[var(--black)] group-hover:text-[var(--orange)] transition-colors">{item.title}</h3>
                    <p className="mt-1 text-sm text-[var(--muted)] font-light line-clamp-1 group-hover:text-[var(--orange)] transition-colors">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {news.length === 0 && (
            <p className="mt-4 text-sm text-[var(--muted)] font-mono">
              // No news items yet
            </p>
          )}
          <div className="mt-8">
            <Link
              href="/blog"
              className="font-mono text-xs uppercase tracking-wide text-[var(--muted)] hover:text-[var(--orange)] transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
      </section>

      {/* Research Highlights */}
      <section className="border-t border-[var(--cloud)] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-2xl font-mono uppercase tracking-wide text-[var(--purple)] mb-8">Research</h2>

          {/* Pixelated Data Imagery */}
          <div className="relative h-32 mb-8 overflow-hidden border border-[var(--cloud)]">
            <Image
              src="/images/pixelated-data.png"
              alt="Pixelated data imagery representing Healthcare, Biology, and Audio & Speech domains"
              fill
              className="object-cover object-center"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {displayResearch.map((item) => (
              <div key={item.id} className="group border border-[var(--cloud)] p-5 hover:border-[var(--purple)]/30 transition-colors">
                <h3 className="font-mono text-sm text-[var(--black)] group-hover:text-[var(--purple)] transition-colors">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--muted)] font-light group-hover:text-[var(--purple)] transition-colors">{item.description}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="font-mono text-xs text-[var(--purple)]">
                        [{tag}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/research"
              className="font-mono text-xs uppercase tracking-wide text-[var(--muted)] hover:text-[var(--purple)] transition-colors"
            >
              View all →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
