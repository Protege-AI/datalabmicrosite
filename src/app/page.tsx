import Link from 'next/link';
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
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Protege Data Lab
          </h1>
          <p className="mt-6 max-w-2xl text-xl text-gray-600">
            We conduct cutting-edge research in data science, machine learning, and
            data infrastructure. Our mission is to advance the field through innovative
            research and train the next generation of data scientists.
          </p>
          <div className="mt-8 flex gap-4">
            <Link
              href="/research"
              className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
            >
              Explore Our Research
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
            >
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
          <div className="mt-8 space-y-6">
            {displayNews.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.id}`}
                className="block border-l-4 border-blue-600 pl-4 hover:bg-gray-50 -ml-4 pl-8 py-2 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-blue-600">{formatDate(item.date)}</span>
                  {item.author && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{item.author.name}</span>
                    </>
                  )}
                </div>
                <h3 className="mt-1 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-1 text-gray-600">{item.description}</p>
              </Link>
            ))}
          </div>
          {news.length === 0 && (
            <p className="mt-4 text-sm text-gray-500 italic">
              Add news items in Notion to see them here.
            </p>
          )}
          <div className="mt-6">
            <Link
              href="/blog"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all news →
            </Link>
          </div>
        </div>
      </section>

      {/* Research Highlights */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-gray-900">Research Highlights</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {displayResearch.map((item) => (
              <div key={item.id} className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
                <div className="h-40 w-full rounded-md bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                  <span className="text-4xl">📊</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/research"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all research →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
