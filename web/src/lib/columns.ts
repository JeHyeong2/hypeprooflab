import fs from 'fs';
import path from 'path';

export interface Citation {
  title: string;
  url: string;
  author?: string;
  year?: string;
}

export interface ColumnFrontmatter {
  title: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  slug: string;
  readTime: string;
  excerpt: string;
  authorImage?: string;
  citations?: Citation[];
  references?: string[];
}

export interface Column {
  frontmatter: ColumnFrontmatter;
  content: string;
  locale: string;
  slug: string;
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
    } else {
      frontmatter[key] = value;
    }
  }
  
  return { frontmatter, content };
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content/columns');

export function getColumnSlugs(locale: string = 'ko'): string[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => f.replace('.md', ''));
}

export function getColumn(slug: string, locale: string = 'ko'): Column | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  
  const raw = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, content } = parseFrontmatter(raw);
  
  return {
    frontmatter: frontmatter as unknown as ColumnFrontmatter,
    content,
    locale,
    slug,
  };
}

export function getAllColumns(locale: string = 'ko'): Column[] {
  const slugs = getColumnSlugs(locale);
  return slugs
    .map(slug => getColumn(slug, locale))
    .filter((c): c is Column => c !== null)
    .sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

export function getAvailableLocalesForSlug(slug: string): string[] {
  const locales = ['ko', 'en'];
  return locales.filter(locale => {
    const filePath = path.join(CONTENT_DIR, locale, `${slug}.md`);
    return fs.existsSync(filePath);
  });
}
