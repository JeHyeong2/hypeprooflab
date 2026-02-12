import fs from 'fs';
import path from 'path';

export interface NovelFrontmatter {
  title: string;
  author: string;        // AI 페르소나 이름 (CIPHER)
  authorHuman: string;   // 실제 사람 (Jay)
  date: string;
  category: string;      // "Novel"
  tags: string[];
  slug: string;
  readTime: string;
  excerpt: string;
  series: string;        // "SIMULACRA"
  volume: number;
  chapter: number;
  authorImage?: string;
  aiModel?: string;      // "Claude Sonnet 4"
}

export interface Novel {
  frontmatter: NovelFrontmatter;
  content: string;
  locale: string;
  slug: string;
}

export interface NovelSeries {
  name: string;
  author: string;
  authorHuman: string;
  description: string;
  genre: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  totalChapters: number;
  authorImage?: string;
  coverImage?: string;
  aiModel?: string;
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, any>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, content: raw };
  
  const frontmatterStr = match[1];
  const content = match[2].trim();
  const frontmatter: Record<string, any> = {};
  
  for (const line of frontmatterStr.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();
    
    // Remove quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Parse arrays
    if (value.startsWith('[')) {
      try {
        frontmatter[key] = JSON.parse(value);
      } catch {
        frontmatter[key] = value;
      }
    } else if (!isNaN(Number(value))) {
      // Parse numbers
      frontmatter[key] = Number(value);
    } else {
      frontmatter[key] = value;
    }
  }
  
  return { frontmatter, content };
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content/novels');

export function getNovelSlugs(locale: string = 'ko'): string[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

export function getNovel(slug: string, locale: string = 'ko'): Novel | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, content } = parseFrontmatter(raw);
  
  return {
    frontmatter: frontmatter as unknown as NovelFrontmatter,
    content,
    locale,
    slug,
  };
}

export function getAllNovels(locale: string = 'ko'): Novel[] {
  const slugs = getNovelSlugs(locale);
  return slugs
    .map(slug => getNovel(slug, locale))
    .filter((n): n is Novel => n !== null)
    .sort((a, b) => {
      // Sort by series first, then by volume, then by chapter
      if (a.frontmatter.series !== b.frontmatter.series) {
        return a.frontmatter.series.localeCompare(b.frontmatter.series);
      }
      if (a.frontmatter.volume !== b.frontmatter.volume) {
        return a.frontmatter.volume - b.frontmatter.volume;
      }
      return a.frontmatter.chapter - b.frontmatter.chapter;
    });
}

export function getNovelsBySeries(series: string, locale: string = 'ko'): Novel[] {
  return getAllNovels(locale)
    .filter(novel => novel.frontmatter.series === series)
    .sort((a, b) => {
      if (a.frontmatter.volume !== b.frontmatter.volume) {
        return a.frontmatter.volume - b.frontmatter.volume;
      }
      return a.frontmatter.chapter - b.frontmatter.chapter;
    });
}

export function getNovelSeries(locale: string = 'ko'): NovelSeries[] {
  const novels = getAllNovels(locale);
  const seriesMap = new Map<string, NovelSeries>();
  
  novels.forEach(novel => {
    const { series, author, authorHuman, authorImage, aiModel } = novel.frontmatter;
    
    if (!seriesMap.has(series)) {
      // Generate description based on series name for now
      let description = '';
      let genre: string[] = [];
      
      if (series === 'SIMULACRA') {
        description = '현실과 가상의 경계가 모호해진 근미래, 의식의 본질에 대한 철학적 탐구';
        genre = ['SF', '철학적 스릴러', '사이버펑크'];
      } else {
        description = `${series} 시리즈`;
        genre = ['SF'];
      }
      
      seriesMap.set(series, {
        name: series,
        author,
        authorHuman,
        description,
        genre,
        status: 'ongoing',
        totalChapters: 0,
        authorImage,
        aiModel,
      });
    }
    
    const seriesData = seriesMap.get(series)!;
    seriesData.totalChapters++;
  });
  
  return Array.from(seriesMap.values())
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAvailableLocalesForSlug(slug: string): string[] {
  const locales = ['ko', 'en'];
  return locales.filter(locale => {
    const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);
    return fs.existsSync(filePath);
  });
}

export function getNextChapter(currentSlug: string, locale: string = 'ko'): Novel | null {
  const current = getNovel(currentSlug, locale);
  if (!current) return null;
  
  const seriesNovels = getNovelsBySeries(current.frontmatter.series, locale);
  const currentIndex = seriesNovels.findIndex(n => n.slug === currentSlug);
  
  if (currentIndex >= 0 && currentIndex < seriesNovels.length - 1) {
    return seriesNovels[currentIndex + 1];
  }
  
  return null;
}

export function getPreviousChapter(currentSlug: string, locale: string = 'ko'): Novel | null {
  const current = getNovel(currentSlug, locale);
  if (!current) return null;
  
  const seriesNovels = getNovelsBySeries(current.frontmatter.series, locale);
  const currentIndex = seriesNovels.findIndex(n => n.slug === currentSlug);
  
  if (currentIndex > 0) {
    return seriesNovels[currentIndex - 1];
  }
  
  return null;
}