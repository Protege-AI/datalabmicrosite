// Generate URL-friendly slug from a name
export function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

// Match a slug back to a name (for finding person from URL)
export function slugMatches(name: string, slug: string): boolean {
  return nameToSlug(name) === slug;
}

// Check if image URL is from Notion (expires after ~1 hour)
export function isNotionImage(url: string): boolean {
  return url.includes('notion.so') || url.includes('s3.us-west-2.amazonaws.com');
}

// Format a date string for display
export function formatDate(dateStr: string, options?: { long?: boolean }): string {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: options?.long ? 'long' : 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
