import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const contentType = searchParams.get('type') || 'column';

    const supabase = getSupabase();

    if (slug) {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', session.user.id)
        .eq('content_slug', slug)
        .eq('content_type', contentType)
        .maybeSingle();
      return NextResponse.json({ bookmarked: !!data });
    }

    const { data } = await supabase
      .from('bookmarks')
      .select('content_slug, content_type, created_at')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ bookmarks: data || [] });
  } catch (error) {
    console.error('Bookmarks GET error:', error);
    return NextResponse.json({ bookmarked: false, bookmarks: [] });
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

    const { data: existing } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_slug', slug)
      .eq('content_type', contentType)
      .maybeSingle();

    if (existing) {
      await supabase.from('bookmarks').delete().eq('id', existing.id);
    } else {
      await supabase.from('bookmarks').insert({
        user_id: userId,
        content_slug: slug,
        content_type: contentType,
      });
    }

    return NextResponse.json({ bookmarked: !existing });
  } catch (error) {
    console.error('Bookmarks POST error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
