import { getAllNovels } from '@/lib/novels';
import HomeClient from './HomeClient';

export default function Home() {
  const allNovels = getAllNovels('ko');
  const chapterCount = allNovels.filter(
    n => n.frontmatter.author.toLowerCase() === 'cipher'
  ).length;

  return <HomeClient novelChapterCount={chapterCount} />;
}
