import Image from 'next/image';
import { ContentBlock } from '@/lib/notion';
import { RichText } from './RichText';

interface BlockRendererProps {
  block: ContentBlock;
  isWide?: boolean; // For images/tables that should break out of narrow column
  compact?: boolean; // Notion-like tight spacing (for modals, embedded content)
}

// Group consecutive list items for proper HTML semantics
type BlockGroup =
  | { type: 'single'; block: ContentBlock }
  | { type: 'bulleted_list'; blocks: ContentBlock[] }
  | { type: 'numbered_list'; blocks: ContentBlock[] };

function groupBlocks(blocks: ContentBlock[]): BlockGroup[] {
  const groups: BlockGroup[] = [];
  for (const block of blocks) {
    if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
      const listType = block.type === 'bulleted_list_item' ? 'bulleted_list' : 'numbered_list';
      const lastGroup = groups[groups.length - 1];
      if (lastGroup?.type === listType) {
        lastGroup.blocks.push(block);
      } else {
        groups.push({ type: listType, blocks: [block] });
      }
    } else {
      groups.push({ type: 'single', block });
    }
  }
  return groups;
}

interface ArticleContentProps {
  blocks: ContentBlock[];
  compact?: boolean;
  wideTypes?: string[];
}

export function ArticleContent({ blocks, compact = false, wideTypes = [] }: ArticleContentProps) {
  const groups = groupBlocks(blocks);
  return (
    <>
      {groups.map((group) => {
        if (group.type === 'bulleted_list') {
          return (
            <ul key={group.blocks[0].id} className={compact ? 'my-1' : 'my-4'}>
              {group.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} compact={compact} />
              ))}
            </ul>
          );
        }
        if (group.type === 'numbered_list') {
          return (
            <ol key={group.blocks[0].id} className={compact ? 'my-1' : 'my-4'}>
              {group.blocks.map(block => (
                <BlockRenderer key={block.id} block={block} compact={compact} />
              ))}
            </ol>
          );
        }
        const b = group.block;
        return (
          <BlockRenderer
            key={b.id}
            block={b}
            compact={compact}
            isWide={wideTypes.includes(b.type)}
          />
        );
      })}
    </>
  );
}

export function BlockRenderer({ block, isWide = false, compact = false }: BlockRendererProps) {
  const wideClass = isWide && !compact ? 'relative sm:-mx-8 md:-mx-16 lg:-mx-24' : '';

  switch (block.type) {
    case 'heading_1':
      return (
        <h2
          id={block.id}
          className={compact
            ? "text-xl font-mono tracking-tight text-[var(--pro-indigo)] mt-5 mb-1"
            : "text-2xl font-mono tracking-tight text-[var(--pro-indigo)] mt-12 mb-4 scroll-mt-24"
          }
        >
          {block.richText ? <RichText spans={block.richText} /> : block.content}
        </h2>
      );

    case 'heading_2':
      return (
        <h3
          id={block.id}
          className={compact
            ? "text-lg font-mono tracking-tight text-[var(--black)] mt-4 mb-1 flex items-center gap-2"
            : "text-xl font-mono tracking-tight text-[var(--black)] mt-10 mb-3 scroll-mt-24 flex items-center gap-3"
          }
        >
          <span className={`rounded-full bg-[var(--pro-indigo)] shrink-0 ${compact ? 'w-1.5 h-1.5' : 'w-2 h-2'}`} />
          {block.richText ? <RichText spans={block.richText} /> : block.content}
        </h3>
      );

    case 'heading_3':
      return (
        <h4
          id={block.id}
          className={compact
            ? "text-base font-mono tracking-tight text-[var(--black)]/80 mt-3 mb-1 pl-4 border-l-2 border-[var(--pro-indigo)]/30"
            : "text-lg font-mono tracking-tight text-[var(--black)]/80 mt-8 mb-2 scroll-mt-24 pl-5 border-l-2 border-[var(--pro-indigo)]/30"
          }
        >
          {block.richText ? <RichText spans={block.richText} /> : block.content}
        </h4>
      );

    case 'paragraph':
      if (!block.content && (!block.richText || block.richText.length === 0)) {
        return <div className={compact ? "h-4" : "h-5"} />;
      }
      return (
        <p className={compact
          ? "text-[var(--black)]/70 leading-relaxed mb-4"
          : "text-[var(--black)]/70 leading-relaxed mb-5"
        }>
          {block.richText ? <RichText spans={block.richText} /> : block.content}
        </p>
      );

    case 'bulleted_list_item':
      return (
        <li className={`text-[var(--black)]/70 ml-5 list-none relative before:content-[''] before:absolute before:-left-4 before:top-2.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-[var(--pro-indigo)] ${compact ? 'mb-0.5' : 'mb-2'}`}>
          {block.richText ? <RichText spans={block.richText} /> : block.content}
        </li>
      );

    case 'numbered_list_item':
      return (
        <li className={`text-[var(--black)]/70 ml-5 list-decimal marker:text-[var(--pro-indigo)] marker:font-mono marker:font-medium ${compact ? 'mb-0.5' : 'mb-2'}`}>
          {block.richText ? <RichText spans={block.richText} /> : block.content}
        </li>
      );

    case 'quote':
      if (compact) {
        return (
          <blockquote className="my-6 py-5 border-y border-[var(--cloud)] relative">
            <span className="absolute -top-4 left-0 text-5xl leading-none text-[var(--pro-indigo)]/25 font-serif select-none" aria-hidden="true">&ldquo;</span>
            <p className="text-lg text-[var(--black)]/90 italic leading-relaxed pl-1">
              {block.richText ? <RichText spans={block.richText} /> : block.content}
            </p>
          </blockquote>
        );
      }
      return (
        <blockquote className="border-l-4 border-[var(--pro-indigo)] pl-6 py-2 bg-[var(--pro-indigo)]/5 my-8">
          <p className="text-lg text-[var(--black)]/80 italic leading-relaxed">
            {block.richText ? <RichText spans={block.richText} /> : block.content}
          </p>
        </blockquote>
      );

    case 'callout':
      return (
        <div className={`border-l-4 border-[var(--pro-indigo)] bg-gradient-to-r from-[var(--pro-indigo)]/10 to-transparent flex gap-4 ${compact ? 'p-3 my-2' : 'p-5 my-6'}`}>
          {block.icon && <span className={`shrink-0 ${compact ? 'text-lg' : 'text-2xl'}`}>{block.icon}</span>}
          <div className="text-[var(--black)]/80">
            {block.richText ? <RichText spans={block.richText} /> : block.content}
          </div>
        </div>
      );

    case 'code':
      return (
        <div className={compact ? `my-2 ${wideClass}` : `my-8 ${wideClass}`}>
          <div className="bg-[#1a1625] rounded-lg overflow-hidden border border-[var(--pro-indigo)]/20">
            {block.language && (
              <div className="px-4 py-2 border-b border-[var(--pro-indigo)]/20 bg-[var(--pro-indigo)]/10 flex items-center justify-between">
                <span className="font-mono text-xs text-[var(--pro-indigo)] uppercase tracking-wider">
                  {block.language}
                </span>
              </div>
            )}
            <pre className={compact ? "p-4 overflow-x-auto" : "p-5 overflow-x-auto"}>
              <code className="font-mono text-sm text-[var(--powder)] leading-relaxed">
                {block.content}
              </code>
            </pre>
          </div>
          {block.caption && block.caption.length > 0 && (
            <p className="mt-2 text-sm text-[var(--muted)] text-center font-mono">
              <RichText spans={block.caption} />
            </p>
          )}
        </div>
      );

    case 'image':
      if (!block.url) return null;
      return (
        <figure className={compact ? `my-2 ${wideClass}` : `my-8 ${wideClass}`}>
          <div className="relative w-full">
            <Image
              src={block.url}
              alt={block.caption?.map(s => s.text).join('') || 'Article image'}
              width={1200}
              height={800}
              className="w-full h-auto rounded-lg"
              unoptimized={block.url.includes('notion')} // Notion URLs expire, use unoptimized
            />
          </div>
          {block.caption && block.caption.length > 0 && (
            <figcaption className="mt-2 text-sm text-[var(--muted)] text-center font-light">
              <RichText spans={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case 'table':
      return (
        <div className={compact ? `my-2 overflow-x-auto ${wideClass}` : `my-8 overflow-x-auto ${wideClass}`}>
          <table className="w-full border-collapse">
            <tbody>
              {block.children?.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={
                    block.hasColumnHeader && rowIndex === 0
                      ? 'bg-[var(--pro-indigo)]/10'
                      : rowIndex % 2 === 0
                      ? 'bg-white'
                      : 'bg-[var(--pro-indigo)]/5'
                  }
                >
                  {row.cells?.map((cell, cellIndex) => {
                    const isHeader =
                      (block.hasColumnHeader && rowIndex === 0) ||
                      (block.hasRowHeader && cellIndex === 0);
                    const CellTag = isHeader ? 'th' : 'td';
                    return (
                      <CellTag
                        key={cellIndex}
                        className={`border border-[var(--pro-indigo)]/20 px-4 py-3 text-left ${
                          isHeader
                            ? 'font-mono text-sm text-[var(--pro-indigo)]'
                            : 'text-[var(--black)]/70'
                        }`}
                      >
                        <RichText spans={cell} />
                      </CellTag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'toggle':
      return (
        <details className={`group border border-[var(--pro-indigo)]/20 rounded-lg overflow-hidden ${compact ? 'my-1' : 'my-4'}`}>
          <summary className="cursor-pointer font-mono text-sm text-[var(--black)] hover:text-[var(--pro-indigo)] transition-colors list-none flex items-center gap-3 p-4 bg-[var(--pro-indigo)]/5 hover:bg-[var(--pro-indigo)]/10">
            <span className="text-[var(--pro-indigo)] group-open:rotate-90 transition-transform">
              ▶
            </span>
            {block.richText ? <RichText spans={block.richText} /> : block.content}
          </summary>
          <div className="p-4 border-t border-[var(--pro-indigo)]/20">
            {block.children?.map((child) => (
              <BlockRenderer key={child.id} block={child} compact={compact} />
            ))}
          </div>
        </details>
      );

    case 'divider':
      return compact ? (
        <div className="my-3 h-px bg-[var(--cloud)]" />
      ) : (
        <div className="my-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--pro-indigo)]/30 to-transparent" />
          <div className="w-2 h-2 rounded-full bg-[var(--pro-indigo)]/40" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--pro-indigo)]/30 to-transparent" />
        </div>
      );

    default:
      return null;
  }
}
