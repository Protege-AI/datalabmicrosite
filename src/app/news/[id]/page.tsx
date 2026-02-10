import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNewsArticle, getNews } from '@/lib/notion';
import { ArticleContent } from '@/components/BlockRenderer';
import { formatDate } from '@/lib/utils';

export const revalidate = 3600;

const getCachedNewsArticle = cache(getNewsArticle);

// Generate static paths for all news articles
export async function generateStaticParams() {
  const news = await getNews().catch(() => []);
  return news.map((article) => ({
    id: article.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getCachedNewsArticle(id);

  if (!article) {
    return { title: 'Blog' };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      ...(article.date && { publishedTime: article.date }),
      ...(article.author?.name && { authors: [article.author.name] }),
    },
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getCachedNewsArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-2xl px-6">
        {/* Back link */}
        <Link
          href="/blog"
          className="font-mono text-xs uppercase tracking-wide text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors mb-10 inline-block"
        >
          ← Blog
        </Link>

        {/* Article header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 font-mono text-xs text-[var(--muted)] mb-4">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            {article.author && (
              <>
                <span>/</span>
                <span>{article.author.name}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl tracking-tight text-[var(--black)] leading-tight">
            {article.title}
          </h1>
          {article.description && (
            <p className="mt-4 text-[var(--muted)] font-light border-l border-[var(--cloud)] pl-4">
              {article.description}
            </p>
          )}
        </header>

        {/* Article content */}
        <article>
          {article.content.length > 0 ? (
            <ArticleContent blocks={article.content} />
          ) : (
            <p className="font-mono text-sm text-[var(--muted)]">
              // Content coming soon
            </p>
          )}
        </article>

        {/* Footer */}
        <footer className="mt-14 pt-8 border-t border-[var(--cloud)]">
          <Link
            href="/blog"
            className="font-mono text-xs uppercase tracking-wide text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors"
          >
            ← All articles
          </Link>
        </footer>
      </div>
    </div>
  );
}
