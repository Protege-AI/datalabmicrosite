import Link from 'next/link';
import Image from 'next/image';
import { getNews } from '@/lib/notion';
import { formatDate } from '@/lib/utils';

export const revalidate = 3600;

export const metadata = {
  title: 'Blog',
  description: 'News, insights, and updates from the Data Lab on data science, AI training data, and evaluation benchmarks.',
};

export default async function BlogPage() {
  const articles = await getNews().catch((error) => {
    console.error('Error fetching news:', error);
    return [];
  });

  return (
    <div className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header with image */}
        <div className="relative h-32 sm:h-48 mb-10 overflow-hidden border border-[var(--cloud)]">
          <Image
            src="/images/photography-collage.webp"
            alt="Research and collaboration"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover object-[50%_75%]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl tracking-tight text-white">Blog</h1>
          </div>
        </div>
        <p className="text-[var(--muted)] font-light">
          News, insights, and updates from the Data Lab.
        </p>

        {articles.length === 0 ? (
          <p className="mt-12 font-mono text-sm text-[var(--muted)]">
            // No articles yet
          </p>
        ) : (
          <div className="mt-12 divide-y divide-[var(--cloud)]/50">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="block py-6 group"
              >
                <article>
                  <div className="flex items-center gap-3 text-xs font-mono text-[var(--muted)]">
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                    {article.author && (
                      <>
                        <span>/</span>
                        <span>{article.author.name}</span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-2 text-xl text-[var(--black)] group-hover:text-[var(--pro-indigo)] transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-[var(--muted)] font-light line-clamp-2">
                    {article.description}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
