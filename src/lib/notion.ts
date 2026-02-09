import { Client } from '@notionhq/client';

// Validate Notion ID format (UUID with or without dashes)
// This prevents injection attacks and invalid API calls
const NOTION_ID_REGEX = /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i;

export function isValidNotionId(id: string): boolean {
  return NOTION_ID_REGEX.test(id);
}

// Lazy initialization to ensure environment variables are loaded
let notionClient: Client | null = null;

function getNotionClient(): Client {
  if (!notionClient) {
    const token = process.env.NOTION_TOKEN;
    if (!token) {
      throw new Error('NOTION_TOKEN environment variable is not set');
    }
    notionClient = new Client({ auth: token });
  }
  return notionClient;
}

// Database IDs - accessed lazily
function getNewsDb(): string {
  const db = process.env.NOTION_NEWS_DB;
  if (!db) throw new Error('NOTION_NEWS_DB environment variable is not set');
  return db;
}

function getPeopleDb(): string {
  const db = process.env.NOTION_PEOPLE_DB;
  if (!db) throw new Error('NOTION_PEOPLE_DB environment variable is not set');
  return db;
}

function getPublicationsDb(): string {
  const db = process.env.NOTION_PUBLICATIONS_DB;
  if (!db) throw new Error('NOTION_PUBLICATIONS_DB environment variable is not set');
  return db;
}

function getResearchDb(): string {
  const db = process.env.NOTION_RESEARCH_DB;
  if (!db) throw new Error('NOTION_RESEARCH_DB environment variable is not set');
  return db;
}

// Helper to extract text from rich text
function getRichText(richText: any[]): string {
  return richText?.map((t: any) => t.plain_text).join('') || '';
}

// Helper to parse rich text with formatting
function parseRichText(richText: any[]): RichTextSpan[] {
  if (!richText || richText.length === 0) return [];

  return richText.map((t: any) => {
    const span: RichTextSpan = {
      text: t.plain_text || '',
    };

    // Apply annotations
    if (t.annotations) {
      if (t.annotations.bold) span.bold = true;
      if (t.annotations.italic) span.italic = true;
      if (t.annotations.strikethrough) span.strikethrough = true;
      if (t.annotations.underline) span.underline = true;
      if (t.annotations.code) span.code = true;
      if (t.annotations.color && t.annotations.color !== 'default') {
        span.color = t.annotations.color;
      }
    }

    // Handle links
    if (t.href) {
      span.link = t.href;
    }

    return span;
  });
}

// Helper to extract image URL from Notion files field
function getFileUrl(files: any[]): string {
  if (!files || files.length === 0) return '';
  const file = files[0];
  if (file.type === 'external') {
    return file.external?.url || '';
  } else if (file.type === 'file') {
    return file.file?.url || '';
  }
  return '';
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
  linkedin?: string;
  twitter?: string;
  googleScholar?: string;
  photo?: string;
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
  articleType: string;
  tags: string[];
  team: string;
  order: number;
  featuredOnHome: boolean;
  date: string;
  authors: string;
  previewImage: string;
}

// Query helper with pagination - using type assertion due to incomplete SDK types
async function queryDatabase(databaseId: string, filter?: any, sorts?: any[]): Promise<any> {
  const notion = getNotionClient() as any;
  const allResults: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
      start_cursor: cursor,
      page_size: 100,
    });
    allResults.push(...response.results);
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  return { results: allResults };
}

// Get page by ID
async function getPage(pageId: string): Promise<any> {
  const notion = getNotionClient();
  return await notion.pages.retrieve({ page_id: pageId });
}

// Get page blocks (content) with parallel child fetching and depth limit
async function getBlocks(blockId: string, depth = 0, maxDepth = 5): Promise<any[]> {
  if (depth >= maxDepth) return [];

  const notion = getNotionClient();
  const blocks: any[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    blocks.push(...response.results);
    cursor = response.has_more ? (response.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Fetch children in parallel for blocks that have them (tables, toggles, etc.)
  const childBlocks = blocks.filter(block => block.has_children);
  if (childBlocks.length > 0) {
    const childResults = await Promise.all(
      childBlocks.map(block => getBlocks(block.id, depth + 1, maxDepth))
    );
    childBlocks.forEach((block, i) => {
      block.children = childResults[i];
    });
  }

  return blocks;
}

// Rich text span with formatting
export interface RichTextSpan {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strikethrough?: boolean;
  underline?: boolean;
  code?: boolean;
  link?: string;
  color?: string;
}

// Content block type
export interface ContentBlock {
  id: string;
  type: string;
  content: string; // Plain text for backwards compatibility
  richText?: RichTextSpan[]; // Formatted text
  children?: ContentBlock[];
  // Additional properties for specific block types
  language?: string; // For code blocks
  url?: string; // For images
  caption?: RichTextSpan[]; // For images
  icon?: string; // For callouts
  cells?: RichTextSpan[][]; // For table rows
  tableWidth?: number; // For tables
  hasColumnHeader?: boolean; // For tables
  hasRowHeader?: boolean; // For tables
}

// Fetch News
export async function getNews(): Promise<NewsItem[]> {
  const response = await queryDatabase(
    getNewsDb(),
    { property: 'Published', checkbox: { equals: true } },
    [{ property: 'Date', direction: 'descending' }]
  );

  // Collect unique author IDs across all news items
  const authorIds = new Set<string>();
  for (const page of response.results) {
    const authorRelation = page.properties.Author?.relation;
    if (authorRelation && authorRelation.length > 0) {
      authorIds.add(authorRelation[0].id);
    }
  }

  // Batch fetch all unique authors in parallel
  const authorMap = new Map<string, { id: string; name: string }>();
  await Promise.all(
    Array.from(authorIds).map(async (id) => {
      try {
        const authorPage = await getPage(id);
        authorMap.set(id, {
          id: authorPage.id,
          name: getRichText(authorPage.properties.Name?.title),
        });
      } catch {
        // Author fetch failed
      }
    })
  );

  // Map results back to news items
  return response.results.map((page: any) => {
    const authorRelation = page.properties.Author?.relation;
    let author: { id: string; name: string } | undefined;
    if (authorRelation && authorRelation.length > 0) {
      author = authorMap.get(authorRelation[0].id);
    }

    return {
      id: page.id,
      title: getRichText(page.properties.Title?.title),
      date: page.properties.Date?.date?.start || '',
      description: getRichText(page.properties.Description?.rich_text),
      author,
    };
  });
}

// Fetch single news article with content
export async function getNewsArticle(id: string): Promise<(NewsItem & { content: ContentBlock[] }) | null> {
  // Validate ID format to prevent invalid API calls
  if (!isValidNotionId(id)) {
    return null;
  }

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
    const result: ContentBlock = {
      id: block.id,
      type: block.type,
      content: '',
    };

    switch (block.type) {
      case 'paragraph':
        result.richText = parseRichText(block.paragraph?.rich_text);
        result.content = getRichText(block.paragraph?.rich_text);
        break;
      case 'heading_1':
        result.richText = parseRichText(block.heading_1?.rich_text);
        result.content = getRichText(block.heading_1?.rich_text);
        break;
      case 'heading_2':
        result.richText = parseRichText(block.heading_2?.rich_text);
        result.content = getRichText(block.heading_2?.rich_text);
        break;
      case 'heading_3':
        result.richText = parseRichText(block.heading_3?.rich_text);
        result.content = getRichText(block.heading_3?.rich_text);
        break;
      case 'bulleted_list_item':
        result.richText = parseRichText(block.bulleted_list_item?.rich_text);
        result.content = getRichText(block.bulleted_list_item?.rich_text);
        break;
      case 'numbered_list_item':
        result.richText = parseRichText(block.numbered_list_item?.rich_text);
        result.content = getRichText(block.numbered_list_item?.rich_text);
        break;
      case 'quote':
        result.richText = parseRichText(block.quote?.rich_text);
        result.content = getRichText(block.quote?.rich_text);
        break;
      case 'callout':
        result.richText = parseRichText(block.callout?.rich_text);
        result.content = getRichText(block.callout?.rich_text);
        // Get callout icon
        if (block.callout?.icon) {
          if (block.callout.icon.type === 'emoji') {
            result.icon = block.callout.icon.emoji;
          }
        }
        break;
      case 'code':
        result.content = getRichText(block.code?.rich_text);
        result.language = block.code?.language || 'plaintext';
        result.caption = parseRichText(block.code?.caption);
        break;
      case 'image':
        // Handle both external and uploaded images
        if (block.image?.type === 'external') {
          result.url = block.image.external?.url || '';
        } else if (block.image?.type === 'file') {
          result.url = block.image.file?.url || '';
        }
        result.caption = parseRichText(block.image?.caption);
        result.content = result.url || '';
        break;
      case 'table':
        result.tableWidth = block.table?.table_width || 0;
        result.hasColumnHeader = block.table?.has_column_header || false;
        result.hasRowHeader = block.table?.has_row_header || false;
        result.content = 'table';
        // Parse table rows from children
        if (block.children) {
          result.children = parseBlocks(block.children);
        }
        break;
      case 'table_row':
        result.cells = block.table_row?.cells?.map((cell: any[]) => parseRichText(cell)) || [];
        result.content = 'table_row';
        break;
      case 'divider':
        result.content = '---';
        break;
      case 'toggle':
        result.richText = parseRichText(block.toggle?.rich_text);
        result.content = getRichText(block.toggle?.rich_text);
        // Parse toggle children
        if (block.children) {
          result.children = parseBlocks(block.children);
        }
        break;
      default:
        result.content = '';
    }

    return result;
  }).filter(block =>
    block.content ||
    block.type === 'divider' ||
    block.type === 'table' ||
    block.type === 'table_row' ||
    (block.richText && block.richText.length > 0)
  );
}

// Fetch People
export async function getPeople(): Promise<Person[]> {
  const response = await queryDatabase(
    getPeopleDb(),
    { property: 'Published', checkbox: { equals: true } },
    [{ property: 'Order', direction: 'ascending' }]
  );

  return response.results.map((page: any) => ({
    id: page.id,
    name: getRichText(page.properties.Name?.title),
    role: page.properties.Role?.select?.name || getRichText(page.properties.Role?.rich_text) || '',
    bio: getRichText(page.properties.Bio?.rich_text),
    email: page.properties.Email?.email || undefined,
    website: page.properties.Website?.url || page.properties['Website URL']?.url || undefined,
    linkedin: page.properties.LinkedIn?.url || page.properties['LinkedIn URL']?.url || undefined,
    twitter: page.properties.X?.url || page.properties['X URL']?.url || undefined,
    googleScholar: page.properties['Google Scholar']?.url || page.properties['Google Scholar URL']?.url || undefined,
    photo: getFileUrl(page.properties.Headshot?.files) || getFileUrl(page.properties.Photo?.files) || undefined,
    year: getRichText(page.properties.Year?.rich_text) || undefined,
    currentPosition: getRichText(page.properties['Current Position']?.rich_text) || undefined,
    order: page.properties.Order?.number || 0,
  }));
}

// Fetch person bio (page content blocks)
export async function getPersonBio(id: string): Promise<ContentBlock[]> {
  if (!isValidNotionId(id)) {
    return [];
  }

  try {
    const blocks = await getBlocks(id);
    return parseBlocks(blocks);
  } catch {
    return [];
  }
}

// Fetch Publications
export async function getPublications(): Promise<Publication[]> {
  const response = await queryDatabase(
    getPublicationsDb(),
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
    getResearchDb(),
    { property: 'Published', checkbox: { equals: true } }
  );

  // Collect unique author IDs across all projects
  const authorIds = new Set<string>();
  for (const page of response.results) {
    const authorRelations = page.properties['Author(s)']?.relation || [];
    for (const rel of authorRelations) {
      authorIds.add(rel.id);
    }
  }

  // Batch fetch all unique authors in parallel
  const authorMap = new Map<string, string>();
  await Promise.all(
    Array.from(authorIds).map(async (id) => {
      try {
        const authorPage = await getPage(id);
        authorMap.set(id, getRichText(authorPage.properties.Name?.title));
      } catch {
        // Author fetch failed
      }
    })
  );

  // Map results back to projects
  const projects: ResearchProject[] = response.results.map((page: any) => {
    const authorRelations = page.properties['Author(s)']?.relation || [];
    const authors = authorRelations
      .map((rel: { id: string }) => authorMap.get(rel.id))
      .filter(Boolean)
      .join(', ');

    return {
      id: page.id,
      title: getRichText(page.properties.Title?.title),
      description: getRichText(page.properties.Description?.rich_text),
      status: page.properties.Status?.select?.name || 'Active',
      articleType: page.properties['Article Type']?.select?.name || '',
      tags: page.properties.Tags?.multi_select?.map((t: any) => t.name) || [],
      team: getRichText(page.properties.Team?.rich_text),
      order: page.properties['Order (if featured)']?.number || 0,
      featuredOnHome: page.properties['Featured on Home?']?.checkbox || false,
      date: page.properties['Publish Date']?.date?.start || page.created_time || '',
      authors,
      previewImage: getFileUrl(page.properties['Preview Image']?.files),
    };
  });

  // Sort: featured items first (by order ascending), then non-featured (by date descending)
  return projects.sort((a, b) => {
    // Featured items come first
    if (a.featuredOnHome && !b.featuredOnHome) return -1;
    if (!a.featuredOnHome && b.featuredOnHome) return 1;

    // Both featured: sort by order ascending
    if (a.featuredOnHome && b.featuredOnHome) {
      return a.order - b.order;
    }

    // Both not featured: sort by date descending (reverse chronological)
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

// Fetch single research article with content
export async function getResearchArticle(id: string): Promise<(ResearchProject & { content: ContentBlock[] }) | null> {
  // Validate ID format to prevent invalid API calls
  if (!isValidNotionId(id)) {
    return null;
  }

  try {
    const page = await getPage(id);

    // Check if published
    if (!page.properties.Published?.checkbox) {
      return null;
    }

    // Get authors from relation field
    const authorRelations = page.properties['Author(s)']?.relation || [];
    let authors = '';

    if (authorRelations.length > 0) {
      const authorNames = await Promise.all(
        authorRelations.map(async (rel: { id: string }) => {
          try {
            const authorPage = await getPage(rel.id);
            return getRichText(authorPage.properties.Name?.title);
          } catch {
            return null;
          }
        })
      );
      authors = authorNames.filter(Boolean).join(', ');
    }

    // Get page content blocks
    const blocks = await getBlocks(id);
    const content = parseBlocks(blocks);

    return {
      id: page.id,
      title: getRichText(page.properties.Title?.title),
      description: getRichText(page.properties.Description?.rich_text),
      status: page.properties.Status?.select?.name || 'Active',
      articleType: page.properties['Article Type']?.select?.name || '',
      tags: page.properties.Tags?.multi_select?.map((t: any) => t.name) || [],
      team: getRichText(page.properties.Team?.rich_text),
      order: page.properties['Order (if featured)']?.number || 0,
      featuredOnHome: page.properties['Featured on Home?']?.checkbox || false,
      date: page.properties['Publish Date']?.date?.start || page.created_time || '',
      authors,
      previewImage: getFileUrl(page.properties['Preview Image']?.files),
      content,
    };
  } catch {
    return null;
  }
}
