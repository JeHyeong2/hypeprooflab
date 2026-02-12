import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getSupabase } from '@/lib/supabase';
import { getRatelimit } from '@/lib/redis';

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{0,199}$/;
const MAX_CONTENT_LENGTH = 2000;
const MIN_CONTENT_LENGTH = 1;
const VALID_TYPES = ['column', 'novel'];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('comments')
      .select('id, user_id, user_name, user_image, user_role, content, created_at')
      .eq('content_slug', slug)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments: data || [] });
  } catch (error) {
    console.error('Comments GET error:', error);
    return NextResponse.json({ comments: [], error: 'unavailable' });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const { success: rateLimitOk } = await getRatelimit().limit(`comment:${session.user.id}`);
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  let body: { slug?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { slug, content } = body;

  if (!slug || !SLUG_REGEX.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
  }
  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  }

  const trimmed = content.trim();
  if (trimmed.length < MIN_CONTENT_LENGTH || trimmed.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: `Content must be ${MIN_CONTENT_LENGTH}-${MAX_CONTENT_LENGTH} characters` }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const user = session.user as Record<string, unknown>;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content_slug: slug,
        user_id: session.user.id,
        user_name: session.user.name || 'Anonymous',
        user_image: session.user.image || null,
        user_role: (user.role as string) || 'spectator',
        content: trimmed,
      })
      .select('id, user_id, user_name, user_image, user_role, content, created_at')
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data });
  } catch (error) {
    console.error('Comments POST error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const commentId = searchParams.get('id');

  if (!commentId) {
    return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
  }

  try {
    const supabase = getSupabase();
    const user = session.user as Record<string, unknown>;
    const isAdmin = user.role === 'admin';

    // Fetch the comment first
    const { data: comment, error: fetchError } = await supabase
      .from('comments')
      .select('id, user_id')
      .eq('id', commentId)
      .single();

    if (fetchError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Only author or admin can delete
    if (comment.user_id !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('comments')
      .delete()
      .eq('id', comment.id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('Comments DELETE error:', error);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
