import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkFootnotes from '@/lib/remarkFootnotes';
import remarkGlossaryLinks from '@/lib/remarkGlossaryLinks';

// Extend sanitize schema to allow footnote + GFM checklist elements
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'sup', 'input'],
  attributes: {
    ...defaultSchema.attributes,
    a: [...(defaultSchema.attributes?.a || []), 'id', 'title'],
    sup: ['className'],
    input: ['type', 'checked', 'disabled'],
    li: [...(defaultSchema.attributes?.li || []), 'className'],
  },
};

// Table → scrollable card; list-item → GFM checklist-aware styling
const markdownComponents = {
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="table-wrapper">
      <table {...props}>{children}</table>
    </div>
  ),
  li: ({ className, children, ...props }: React.LiHTMLAttributes<HTMLLIElement>) => {
    const isTask = className?.includes('task-list-item');
    return (
      <li
        {...props}
        className={`${className || ''} ${isTask ? 'list-none -ml-6 flex gap-2 items-start' : ''}`.trim()}
      >
        {children}
      </li>
    );
  },
};

interface Props {
  content: string;
  locale: string;
}

export default function ColumnContent({ content, locale }: Props) {
  return (
    <div
      className={`column-content prose prose-invert max-w-none ${
        locale === 'ko'
          ? 'text-[18px] leading-[32px] tracking-[0.03em] md:text-[18px] md:leading-[32px]'
          : 'text-[18px] leading-[30px] tracking-[0.01em] md:text-[18px] md:leading-[30px]'
      } text-zinc-300 prose-headings:text-white prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:font-bold prose-h3:mt-10 prose-h3:mb-4 prose-strong:text-white prose-strong:font-semibold prose-blockquote:border-l-2 prose-blockquote:border-purple-500 prose-blockquote:pl-6 prose-blockquote:my-8 prose-blockquote:text-zinc-300 prose-blockquote:italic prose-blockquote:text-lg prose-hr:border-zinc-800 prose-hr:my-12 prose-p:mb-6 prose-p:leading-relaxed prose-li:mb-2 prose-li:ml-4 /* link styles via globals.css .column-content a */`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkFootnotes, remarkGlossaryLinks]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={markdownComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
