import { RichTextSpan } from '@/lib/notion';

interface RichTextProps {
  spans: RichTextSpan[];
  className?: string;
}

export function RichText({ spans, className = '' }: RichTextProps) {
  if (!spans || spans.length === 0) return null;

  return (
    <span className={className}>
      {spans.map((span, index) => (
        <RichTextSpanRenderer key={index} span={span} />
      ))}
    </span>
  );
}

function RichTextSpanRenderer({ span }: { span: RichTextSpan }) {
  let content: React.ReactNode = span.text;

  // Apply formatting in order: code, then bold/italic/etc, then link
  if (span.code) {
    content = (
      <code className="font-mono text-sm bg-[var(--cloud)]/30 px-1.5 py-0.5 rounded">
        {content}
      </code>
    );
  }

  if (span.bold) {
    content = <strong className="font-bold">{content}</strong>;
  }

  if (span.italic) {
    content = <em className="italic">{content}</em>;
  }

  if (span.strikethrough) {
    content = <s className="line-through">{content}</s>;
  }

  if (span.underline) {
    content = <u className="underline">{content}</u>;
  }

  if (span.link) {
    content = (
      <a
        href={span.link}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--pro-indigo)] hover:underline transition-colors"
      >
        {content}
      </a>
    );
  }

  // Handle Notion colors
  if (span.color && !span.code) {
    const colorClass = getColorClass(span.color);
    if (colorClass) {
      content = <span className={colorClass}>{content}</span>;
    }
  }

  return <>{content}</>;
}

function getColorClass(color: string): string | null {
  // Map Notion colors to CSS classes
  // Map Notion colors to site palette CSS variables where possible
  const colorMap: Record<string, string> = {
    gray: 'text-[var(--muted)]',
    brown: 'text-amber-700',
    orange: 'text-[var(--orange)]',
    yellow: 'text-[var(--yellow)]',
    green: 'text-green-600',
    blue: 'text-[var(--blue)]',
    purple: 'text-[var(--purple)]',
    pink: 'text-pink-500',
    red: 'text-red-500',
    gray_background: 'bg-[var(--cloud)]/30 px-1 rounded',
    brown_background: 'bg-[var(--sand)]/30 px-1 rounded',
    orange_background: 'bg-[var(--orange)]/15 px-1 rounded',
    yellow_background: 'bg-[var(--yellow)]/20 px-1 rounded',
    green_background: 'bg-green-100 px-1 rounded',
    blue_background: 'bg-[var(--sky)]/30 px-1 rounded',
    purple_background: 'bg-[var(--powder)]/50 px-1 rounded',
    pink_background: 'bg-pink-100 px-1 rounded',
    red_background: 'bg-red-100 px-1 rounded',
  };

  return colorMap[color] || null;
}
