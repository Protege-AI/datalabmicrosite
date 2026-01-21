import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNewsArticle, getNews, ContentBlock } from '@/lib/notion';

export const revalidate = 60;

// Generate static paths for all news articles
export async function generateStaticParams() {
  const news = await getNews().catch(() => []);
  return news.map((article) => ({
    id: article.id,
  }));
}

// Render a content block
function BlockRenderer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'heading_1':
      return <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{block.content}</h1>;
    case 'heading_2':
      return <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-3">{block.content}</h2>;
    case 'heading_3':
      return <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{block.content}</h3>;
    case 'paragraph':
      return block.content ? (
        <p className="text-gray-700 leading-relaxed mb-4">{block.content}</p>
      ) : (
        <div className="h-4" />
      );
    case 'bulleted_list_item':
      return (
        <li className="text-gray-700 ml-6 mb-2 list-disc">{block.content}</li>
      );
    case 'numbered_list_item':
      return (
        <li className="text-gray-700 ml-6 mb-2 list-decimal">{block.content}</li>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 text-gray-600 italic">
          {block.content}
        </blockquote>
      );
    case 'callout':
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
          <p className="text-gray-700">{block.content}</p>
        </div>
      );
    case 'divider':
      return <hr className="my-8 border-gray-200" />;
    default:
      return null;
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = await getNewsArticle(id);

  if (!article) {
    notFound();
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        {/* Back link */}
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-500 mb-8 inline-block"
        >
          ← Back to Home
        </Link>

        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 text-gray-600">
            <time>{formatDate(article.date)}</time>
            {article.author && (
              <>
                <span>•</span>
                <span>{article.author.name}</span>
              </>
            )}
          </div>
          {article.description && (
            <p className="mt-4 text-lg text-gray-600 border-l-4 border-blue-500 pl-4">
              {article.description}
            </p>
          )}
        </header>

        {/* Article content */}
        <article className="prose prose-lg max-w-none">
          {article.content.length > 0 ? (
            article.content.map((block) => (
              <BlockRenderer key={block.id} block={block} />
            ))
          ) : (
            <p className="text-gray-500 italic">
              Full article content coming soon. Add content to this page in Notion.
            </p>
          )}
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-500"
          >
            ← Back to all news
          </Link>
        </footer>
      </div>
    </div>
  );
}
