// Article type color mapping used across research pages
export const ARTICLE_TYPE_COLORS: Record<string, { text: string; bg: string }> = {
  'Research Paper': { text: 'text-[var(--pro-indigo)]', bg: 'var(--pro-indigo)' },
  'Case Study': { text: 'text-[var(--blue)]', bg: 'var(--blue)' },
  'Technical Report': { text: 'text-[var(--purple)]', bg: 'var(--purple)' },
  'Blog Post': { text: 'text-[var(--orange)]', bg: 'var(--orange)' },
  'White Paper': { text: 'text-[var(--sky)]', bg: 'var(--sky)' },
  'Tutorial': { text: 'text-[var(--yellow)]', bg: 'var(--yellow)' },
  'Analysis': { text: 'text-[var(--sand)]', bg: 'var(--sand)' },
};

export function getArticleTypeColor(articleType: string): { text: string; bg: string } {
  return ARTICLE_TYPE_COLORS[articleType] || { text: 'text-[var(--muted)]', bg: 'var(--muted)' };
}
