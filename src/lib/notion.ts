import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

// Database IDs
const NEWS_DB = process.env.NOTION_NEWS_DB!;
const PEOPLE_DB = process.env.NOTION_PEOPLE_DB!;
const PUBLICATIONS_DB = process.env.NOTION_PUBLICATIONS_DB!;
const RESEARCH_DB = process.env.NOTION_RESEARCH_DB!;

// Helper to extract text from rich text
function getRichText(richText: any[]): string {
  return richText?.map((t: any) => t.plain_text).join('') || '';
}

// Types
export interface NewsItem {
  id: string;
  title: string;
  date: string;
  description: string;
  author?: {
    id: string;
    name: string;
  };
}

export interface Person {
  id: string;
  name: string;
  role: string;
  bio: string;
  email?: string;
  website?: string;
  year?: string;
  currentPosition?: string;
  order: number;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number;
  paperUrl?: string;
  codeUrl?: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  status: string;
  tags: string[];
  team: string;
  order: number;
}

// Query helper
async function queryDatabase(databaseId: string, filter?: any, sorts?: any[]): Promise<any> {
  return await (notion as any).databases.query({
    database_id: databaseId,
    filter,
    sorts,
  });
}

// Get page by ID
async function getPage(pageId: string): Promise<any> {
  return await (notion as any).pages.retrieve({ page_id: pageId });
}

// Get page blocks (content)
async function getBlocks(blockId: string): Promise<any[]> {
  const blocks: any[] = [];
  let cursor: string | undefined;

  do {
    const response: any = await (notion as any).blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return blocks;
}

// Content block type
export interface ContentBlock {
  id: string;
  type: string;
  content: string;
  children?: ContentBlock[];
}

// Fetch News
export async function getNews(): Promise<NewsItem[]> {
  const response = await queryDatabase(
    NEWS_DB,
    { property: 'Published', checkbox: { equals: true } },
    [{ property: 'Date', direction: 'descending' }]
  );

  // Fetch author details for each news item
  const newsItems = await Promise.all(
    response.results.map(async (page: any) => {
      const authorRelation = page.properties.Author?.relation;
      let author: { id: string; name: string } | undefined;

      if (authorRelation && authorRelation.length > 0) {
        try {
          const authorPage = await getPage(authorRelation[0].id);
          author = {
            id: authorPage.id,
            name: getRichText(authorPage.properties.Name?.title),
          };
        } catch {
          // Author fetch failed, leave undefined
        }
      }

      return {
        id: page.id,
        title: getRichText(page.properties.Title?.title),
        date: page.properties.Date?.date?.start || '',
        description: getRichText(page.properties.Description?.rich_text),
        author,
      };
    })
  );

  return newsItems;
}

// Fetch single news article with content
export async function getNewsArticle(id: string): Promise<(NewsItem & { content: ContentBlock[] }) | null> {
  try {
    const page = await getPage(id);

    // Check if published
    if (!page.properties.Published?.checkbox) {
      return null;
    }

    // Get author
    const authorRelation = page.properties.Author?.relation;
    let author: { id: string; name: string } | undefined;
    if (authorRelation && authorRelation.length > 0) {
      try {
        const authorPage = await getPage(authorRelation[0].id);
        author = {
          id: authorPage.id,
          name: getRichText(authorPage.properties.Name?.title),
        };
      } catch {
        // Author fetch failed
      }
    }

    // Get page content blocks
    const blocks = await getBlocks(id);
    const content = parseBlocks(blocks);

    return {
      id: page.id,
      title: getRichText(page.properties.Title?.title),
      date: page.properties.Date?.date?.start || '',
      description: getRichText(page.properties.Description?.rich_text),
      author,
      content,
    };
  } catch {
    return null;
  }
}

// Parse Notion blocks to simpler format
function parseBlocks(blocks: any[]): ContentBlock[] {
  return blocks.map((block) => {
    let content = '';

    switch (block.type) {
      case 'paragraph':
        content = getRichText(block.paragraph?.rich_text);
        break;
      case 'heading_1':
        content = getRichText(block.heading_1?.rich_text);
        break;
      case 'heading_2':
        content = getRichText(block.heading_2?.rich_text);
        break;
      case 'heading_3':
        content = getRichText(block.heading_3?.rich_text);
        break;
      case 'bulleted_list_item':
        content = getRichText(block.bulleted_list_item?.rich_text);
        break;
      case 'numbered_list_item':
        content = getRichText(block.numbered_list_item?.rich_text);
        break;
      case 'quote':
        content = getRichText(block.quote?.rich_text);
        break;
      case 'callout':
        content = getRichText(block.callout?.rich_text);
        break;
      case 'divider':
        content = '---';
        break;
      default:
        content = '';
    }

    return {
      id: block.id,
      type: block.type,
      content,
    };
  }).filter(block => block.content || block.type === 'divider');
}

// Fetch People
export async function getPeople(): Promise<Person[]> {
  const response = await queryDatabase(
    PEOPLE_DB,
    { property: 'Published', checkbox: { equals: true } },
    [{ property: 'Order', direction: 'ascending' }]
  );

  return response.results.map((page: any) => ({
    id: page.id,
    name: getRichText(page.properties.Name?.title),
    role: page.properties.Role?.select?.name || '',
    bio: getRichText(page.properties.Bio?.rich_text),
    email: page.properties.Email?.email || undefined,
    website: page.properties.Website?.url || undefined,
    year: getRichText(page.properties.Year?.rich_text) || undefined,
    currentPosition: getRichText(page.properties['Current Position']?.rich_text) || undefined,
    order: page.properties.Order?.number || 0,
  }));
}

// Fetch Publications
export async function getPublications(): Promise<Publication[]> {
  const response = await queryDatabase(
    PUBLICATIONS_DB,
    { property: 'Published', checkbox: { equals: true } },
    [{ property: 'Year', direction: 'descending' }]
  );

  return response.results.map((page: any) => ({
    id: page.id,
    title: getRichText(page.properties.Title?.title),
    authors: getRichText(page.properties.Authors?.rich_text),
    venue: getRichText(page.properties.Venue?.rich_text),
    year: page.properties.Year?.number || new Date().getFullYear(),
    paperUrl: page.properties['Paper URL']?.url || undefined,
    codeUrl: page.properties['Code URL']?.url || undefined,
  }));
}

// Fetch Research Projects
export async function getResearchProjects(): Promise<ResearchProject[]> {
  const response = await queryDatabase(
    RESEARCH_DB,
    { property: 'Published', checkbox: { equals: true } },
    [{ property: 'Order', direction: 'ascending' }]
  );

  return response.results.map((page: any) => ({
    id: page.id,
    title: getRichText(page.properties.Title?.title),
    description: getRichText(page.properties.Description?.rich_text),
    status: page.properties.Status?.select?.name || 'Active',
    tags: page.properties.Tags?.multi_select?.map((t: any) => t.name) || [],
    team: getRichText(page.properties.Team?.rich_text),
    order: page.properties.Order?.number || 0,
  }));
}
