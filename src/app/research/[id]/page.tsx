import { cache } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getResearchArticle, getResearchProjects } from '@/lib/notion';
import { ArticleContent } from '@/components/BlockRenderer';
import { ArticleSidebar } from '@/components/ArticleSidebar';
import { nameToSlug, formatDate } from '@/lib/utils';
import { getArticleTypeColor } from '@/lib/constants';

export const revalidate = 3600;

const getCachedResearchArticle = cache(getResearchArticle);

// Generate static paths for all research articles
export async function generateStaticParams() {
  const projects = await getResearchProjects().catch(() => []);
  return projects.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getCachedResearchArticle(id);

  if (!article) {
    return { title: 'Research' };
  }

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      ...(article.date && { publishedTime: article.date }),
      ...(article.authors && { authors: [article.authors] }),
      ...(article.previewImage && { images: [{ url: article.previewImage }] }),
    },
  };
}

export default async function ResearchArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getCachedResearchArticle(id);

  if (!article) {
    notFound();
  }

  const displayAuthors = article.authors || 'Data Lab';
  const typeColor = getArticleTypeColor(article.articleType);

  // Check if content has wide elements (images, tables, code)
  const hasWideContent = article.content.some((block) =>
    ['image', 'table', 'code'].includes(block.type)
  );

  return (
    <div className="min-h-screen">
      {/* Header Section - Full Width */}
      <header className="border-b border-[var(--pro-indigo)]/20 bg-gradient-to-b from-[var(--pro-indigo)]/5 to-white">
        <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
          {/* Back link */}
          <Link
            href="/research"
            className="font-mono text-xs uppercase tracking-wide text-[var(--pro-indigo)] hover:text-[var(--pro-indigo)]/70 transition-colors mb-8 inline-flex items-center gap-2"
          >
            <span>←</span>
            <span>Research</span>
          </Link>

          {/* Article metadata */}
          <div className="mt-8">
            {/* Article type and date */}
            <div className="flex items-center gap-3 font-mono text-xs mb-4">
              {article.articleType && (
                <>
                  <span className={`${typeColor.text} px-2 py-1 rounded`} style={{ backgroundColor: `${typeColor.bg}1a` }}>
                    {article.articleType}
                  </span>
                  <span className="text-[var(--pro-indigo)]/40">/</span>
                </>
              )}
              <time dateTime={article.date} className="text-[var(--black)]/50">{formatDate(article.date, { long: true })}</time>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl tracking-tight text-[var(--black)] leading-tight max-w-4xl">
              {article.title}
            </h1>

            {/* Authors */}
            <p className="mt-5 text-lg">
              <span className="text-[var(--black)]/50">by </span>
              <Link
                href={`/people?person=${nameToSlug(displayAuthors.split(',')[0]?.trim() || 'data-lab')}`}
                className="text-[var(--pro-indigo)] font-medium hover:underline transition-colors"
              >
                {displayAuthors}
              </Link>
            </p>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-xs text-[var(--pro-indigo)]/70 border border-[var(--pro-indigo)]/30 px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description/Abstract */}
            {article.description && (
              <p className="mt-8 text-lg md:text-xl text-[var(--black)]/60 leading-relaxed max-w-3xl">
                {article.description}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Content Section - Two Column Layout */}
      <div className="mx-auto max-w-5xl px-6 py-12 lg:py-16">
        <div className="flex gap-0 lg:gap-10">
          {/* Sidebar */}
          <ArticleSidebar
            content={article.content}
            articleType={article.articleType}
            articleTypeColor={typeColor.bg}
          />

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <article className={hasWideContent ? 'max-w-none' : 'max-w-2xl'}>
              {article.content.length > 0 ? (
                <ArticleContent blocks={article.content} />
              ) : (
                <p className="font-mono text-sm text-[var(--muted)]">
                  // Content coming soon
                </p>
              )}
            </article>

            {/* Footer */}
            <footer className="mt-16 pt-8 border-t border-[var(--cloud)]">
              <Link
                href="/research"
                className="font-mono text-xs uppercase tracking-wide text-[var(--muted)] hover:text-[var(--pro-indigo)] transition-colors inline-flex items-center gap-2"
              >
                <span>←</span>
                <span>All research</span>
              </Link>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
