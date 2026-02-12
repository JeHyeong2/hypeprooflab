import { getAllNovels } from '@/lib/novels';
import { getAllColumns } from '@/lib/columns';
import HomeClient from './HomeClient';

export default function Home() {
  const allNovels = getAllNovels('ko');
  const chapterCount = allNovels.filter(
    n => n.frontmatter.author.toLowerCase() === 'cipher'
  ).length;

  // Fetch columns server-side for SSR
  const koColumns = getAllColumns('ko').slice(0, 3).map(c => ({
    slug: c.frontmatter.slug,
    title: c.frontmatter.title,
    excerpt: c.frontmatter.excerpt,
    date: c.frontmatter.date,
    category: c.frontmatter.category,
  }));
  const enColumns = getAllColumns('en').slice(0, 3).map(c => ({
    slug: c.frontmatter.slug,
    title: c.frontmatter.title,
    excerpt: c.frontmatter.excerpt,
    date: c.frontmatter.date,
    category: c.frontmatter.category,
  }));

  return (
    <HomeClient
      novelChapterCount={chapterCount}
      koColumns={koColumns}
      enColumns={enColumns}
    />
  );
}
