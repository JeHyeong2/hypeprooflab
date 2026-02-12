import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { getRedis, getRatelimit } from '@/lib/redis';

const BOT_PATTERNS = /bot|crawler|spider|slurp|googlebot|bingbot|yandex|baidu|duckduck|facebookexternalhit|twitterbot|linkedinbot|embedly|quora|pinterest|semrush|ahref/i;

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,199}$/;

// H4: Strong IP hashing with HMAC-SHA256
function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) {
    throw new Error('IP_HASH_SALT environment variable is required');
  }
  return createHmac('sha256', salt)
    .update(ip)
    .digest('hex')
    .slice(0, 16);
}

export async function POST(request: NextRequest) {
  try {
    const ua = request.headers.get('user-agent') || '';
    if (BOT_PATTERNS.test(ua)) {
      return NextResponse.json({ counted: false, reason: 'bot' });
    }

    const { slug } = await request.json();
    if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
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
      // M2: Cap batch size to 50
      const slugList = slugs.split(',').filter(Boolean).slice(0, 50);
      // Validate each slug
      for (const s of slugList) {
        if (!SLUG_REGEX.test(s)) {
          return NextResponse.json({ error: 'Invalid slug in batch' }, { status: 400 });
        }
      }
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

    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const count = (await redis.get<number>(`views:${slug}`)) || 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Views GET error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
