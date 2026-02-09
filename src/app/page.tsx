import Link from 'next/link';
import Image from 'next/image';
import { getNews, getResearchProjects } from '@/lib/notion';
import { formatDate, isNotionImage } from '@/lib/utils';
import HomeClient from '../components/HomeClient';
import PixelGrid from '../components/PixelGrid';

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function Home() {
  const [news, researchProjects] = await Promise.all([
    getNews().catch(() => []),
    getResearchProjects().catch(() => []),
  ]);

  // Get latest 3 news items in reverse chronological order (already sorted by Notion)
  const displayNews = news.slice(0, 3);

  // Get latest 3 research projects
  const displayResearch = researchProjects.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-[var(--cloud)]">
        <PixelGrid />
        <div className="relative z-10 mx-auto max-w-5xl px-6 pt-12 pb-20 sm:pt-16 sm:pb-28 lg:pt-20 lg:pb-36">
          <div className="max-w-2xl">
            <h1 className="text-4xl tracking-tight text-[var(--black)] sm:text-5xl">
              Welcome to the Data Lab
            </h1>
            <p className="mt-6 text-lg text-[var(--muted)] font-light leading-relaxed">
              We are a team of research scientists committed to tackling the fundamental
              challenges and open questions regarding data for AI. We&apos;re committed to
              bridging the gap between research theory and data deployment to push the
              frontier forward.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
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
              <HomeClient />
            </div>
          </div>
        </div>
      </section>

      {/* News Section */}
      {displayNews.length > 0 && (
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2><Link href="/blog" className="text-2xl font-mono uppercase tracking-wide text-[var(--orange)] hover:text-[var(--orange)]/70 transition-colors mb-8 block">Latest News</Link></h2>
            <div className="space-y-0 divide-y divide-[var(--cloud)]/50">
              {displayNews.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.id}`}
                  className="block py-5 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                    <time dateTime={item.date} className="font-mono text-xs text-[var(--muted)] group-hover:text-[var(--orange)] transition-colors shrink-0 sm:w-28">{formatDate(item.date)}</time>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base text-[var(--black)] group-hover:text-[var(--orange)] transition-colors">{item.title}</h3>
                      <p className="mt-1 text-sm text-[var(--muted)] font-light line-clamp-1 group-hover:text-[var(--orange)] transition-colors hidden sm:block">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
      )}

      {/* Research Highlights */}
      <section className="border-t border-[var(--cloud)] py-16">
        <div className="mx-auto max-w-5xl px-6">
          <h2><Link href="/research" className="text-2xl font-mono uppercase tracking-wide text-[var(--purple)] hover:text-[var(--purple)]/70 transition-colors mb-8 block">Research</Link></h2>

          <div className="grid gap-6 md:grid-cols-3">
            {displayResearch.map((item) => (
              <Link
                key={item.id}
                href={`/research/${item.id}`}
                className="group border border-[var(--cloud)] hover:border-[var(--purple)]/30 transition-colors flex flex-col"
              >
                {/* Preview Image */}
                {item.previewImage && (
                  <div className="w-full h-48 relative overflow-hidden bg-[var(--cloud)]/20">
                    <Image
                      src={item.previewImage}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      unoptimized={isNotionImage(item.previewImage)}
                    />
                  </div>
                )}
                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-mono text-sm text-[var(--black)] group-hover:text-[var(--purple)] transition-colors">{item.title}</h3>
                  <p className="mt-2 text-sm text-[var(--muted)] font-light group-hover:text-[var(--purple)] transition-colors flex-1">{item.description}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {item.tags.map((tag: string) => (
                        <span key={tag} className="font-mono text-xs text-[var(--purple)]">
                          [{tag}]
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
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
    </>
  );
}
