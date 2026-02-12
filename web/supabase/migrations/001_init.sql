-- HypeProof Lab — Initial Schema
-- Profiles, Likes, Bookmarks, Comments with RLS

-- Role enum
CREATE TYPE user_role AS ENUM ('admin', 'author', 'spectator');

-- Profiles table
CREATE TABLE profiles (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT,
  role       user_role NOT NULL DEFAULT 'spectator',
  avatar_url TEXT,
  bio        TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Likes table
CREATE TABLE likes (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_slug, content_type)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_slug, content_type)
);

-- Comments table
CREATE TABLE comments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_likes_content ON likes(content_slug, content_type);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_comments_content ON comments(content_slug, content_type);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Profiles RLS: users can read all profiles, update only their own
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Likes RLS: anyone can read counts, authenticated users can insert/delete their own
CREATE POLICY "likes_select_all" ON likes FOR SELECT USING (true);
CREATE POLICY "likes_insert_own" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_delete_own" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks RLS: users can only see and manage their own
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE USING (auth.uid() = user_id);

-- Comments RLS: anyone can read, authenticated can insert, owner can update/delete
CREATE POLICY "comments_select_all" ON comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_own" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_update_own" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Seed known members into profiles (run after Auth.js creates user records)
-- These are applied via the Auth.js callback automatically, but for reference:
--
-- Admin: Jay (jayleekr0125@gmail.com) → admin
-- Authors:
--   kiwonam96@gmail.com (Kiwon)
--   tj456852@gmail.com (TJ)
--   jkimak1124@gmail.com (Ryan)
--   jysin0102@gmail.com (JY)
--   xoqhdgh@gmail.com (BH)
--
-- Profile creation happens in the Auth.js JWT callback on first login.
-- The callback checks email against the known members list and assigns the role.
