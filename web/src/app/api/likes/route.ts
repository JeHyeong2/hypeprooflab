import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const contentType = searchParams.get('type') || 'column';

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();

    // Get total count
    const { count, error: countError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_slug', slug)
      .eq('content_type', contentType);

    if (countError) throw countError;

    // Check if current user liked
    let liked = false;
    const session = await auth();
    if (session?.user?.id) {
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('content_slug', slug)
        .eq('content_type', contentType)
        .maybeSingle();
      liked = !!data;
    }

    return NextResponse.json({ count: count || 0, liked });
  } catch (error) {
    console.error('Likes GET error:', error);
    return NextResponse.json({ count: 0, liked: false });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const body = await req.json();
  const { slug, type: contentType = 'column' } = body;

  if (!slug) {
    return NextResponse.json({ error: 'slug required' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const userId = session.user.id;

    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('content_slug', slug)
      .eq('content_type', contentType)
      .maybeSingle();

    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
    } else {
      await supabase.from('likes').insert({
        user_id: userId,
        content_slug: slug,
        content_type: contentType,
      });
    }

    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_slug', slug)
      .eq('content_type', contentType);

    return NextResponse.json({ count: count || 0, liked: !existing });
  } catch (error) {
    console.error('Likes POST error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
