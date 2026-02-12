import { NextRequest, NextResponse } from 'next/server';
import { getRedis, getRatelimit } from '@/lib/redis';

const BOT_PATTERNS = /bot|crawler|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|semrush|ahref/i;

function hashIp(ip: string): string {
  let hash = 0;
  const str = ip + (process.env.IP_HASH_SALT || 'hypeproof-salt');
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (BOT_PATTERNS.test(ua)) {
      return NextResponse.json({ counted: false, reason: 'bot' });
    }

    const { slug } = await request.json();
    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'slug required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || '0.0.0.0';
    const ipHash = hashIp(ip);

    const redis = getRedis();

    // Rate limit
    const { success } = await getRatelimit().limit(ipHash);
    if (!success) {
      return NextResponse.json({ counted: false, reason: 'rate-limited' }, { status: 429 });
    }

    // 중복 체크 (24시간 TTL)
    const uniqueKey = `views:unique:${ipHash}:${slug}`;
    const alreadyViewed = await redis.get(uniqueKey);
    if (alreadyViewed) {
      const count = (await redis.get<number>(`views:${slug}`)) || 0;
      return NextResponse.json({ counted: false, count });
    }

    await redis.set(uniqueKey, '1', { ex: 86400 });
    const count = await redis.incr(`views:${slug}`);

    return NextResponse.json({ counted: true, count });
  } catch (error) {
    console.error('Views API error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const redis = getRedis();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const slugs = searchParams.get('slugs');

    if (slugs) {
      const slugList = slugs.split(',').filter(Boolean);
      const pipeline = redis.pipeline();
      for (const s of slugList) {
        pipeline.get(`views:${s}`);
      }
      const results = await pipeline.exec();
      const counts: Record<string, number> = {};
      slugList.forEach((s, i) => {
        counts[s] = (results[i] as number) || 0;
      });
      return NextResponse.json({ counts });
    }

    if (!slug) {
      return NextResponse.json({ error: 'slug or slugs required' }, { status: 400 });
    }

    const count = (await redis.get<number>(`views:${slug}`)) || 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Views GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
