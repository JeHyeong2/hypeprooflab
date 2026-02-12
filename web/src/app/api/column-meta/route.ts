import { NextRequest, NextResponse } from 'next/server';
import { getColumn } from '@/lib/columns';

export async function GET(request: NextRequest) {
  const slugsParam = request.nextUrl.searchParams.get('slugs') || '';
  const slugs = slugsParam.split(',').filter(Boolean);

  const titles: Record<string, string> = {};
  for (const slug of slugs) {
    const col = getColumn(slug, 'ko') || getColumn(slug, 'en');
    if (col) {
      titles[slug] = col.frontmatter.title;
    }
  }

  return NextResponse.json({ titles });
}
