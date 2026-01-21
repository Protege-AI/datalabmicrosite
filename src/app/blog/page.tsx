import Link from 'next/link';
import { getNews } from '@/lib/notion';

export const revalidate = 60;

export default async function BlogPage() {
  const articles = await getNews().catch((error) => {
    console.error('Error fetching news:', error);
    return [];
  });

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
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
        <p className="mt-4 text-lg text-gray-600">
          News, insights, and updates from Protege Data Lab.
        </p>

        {articles.length === 0 ? (
          <p className="mt-8 text-gray-500 italic">
            No articles yet. Add articles in Notion to see them here.
          </p>
        ) : (
          <div className="mt-12 space-y-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="block group"
              >
                <article className="border-b border-gray-200 pb-8 hover:bg-gray-50 -mx-4 px-4 py-4 transition-colors rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <time>{formatDate(article.date)}</time>
                    {article.author && (
                      <>
                        <span>•</span>
                        <span>{article.author.name}</span>
                      </>
                    )}
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {article.title}
                  </h2>
                  <p className="mt-2 text-gray-600 line-clamp-2">
                    {article.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-medium text-blue-600">
                    Read more →
                  </span>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
