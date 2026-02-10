import { MetadataRoute } from 'next';
import { getNews, getResearchProjects } from '@/lib/notion';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://datalab.withprotege.ai';

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/people`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/research`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/contact`, changeFrequency: 'yearly', priority: 0.5 },
  ];

  const [news, research] = await Promise.all([
    getNews().catch(() => []),
    getResearchProjects().catch(() => []),
  ]);

  const newsPages: MetadataRoute.Sitemap = news.map((item) => ({
    url: `${siteUrl}/news/${item.id}`,
    lastModified: item.date || undefined,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const researchPages: MetadataRoute.Sitemap = research.map((item) => ({
    url: `${siteUrl}/research/${item.id}`,
    lastModified: item.date || undefined,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticPages, ...newsPages, ...researchPages];
}
