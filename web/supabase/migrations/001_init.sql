-- HypeProof Lab — Initial Schema
-- Auth.js manages users externally (JWT), so no FK to users table

-- Role enum
CREATE TYPE user_role AS ENUM ('admin', 'author', 'spectator');

-- Profiles table (user_id = Auth.js user id string)
CREATE TABLE profiles (
  user_id    TEXT PRIMARY KEY,
  email      TEXT UNIQUE,
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
  user_id      TEXT NOT NULL,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_slug, content_type)
);

-- Bookmarks table
CREATE TABLE bookmarks (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, content_slug, content_type)
);

-- Comments table (denormalized user info for display without joins)
CREATE TABLE comments (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      TEXT NOT NULL,
  content_slug TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'column',
  content      TEXT NOT NULL,
  user_name    TEXT NOT NULL DEFAULT 'Anonymous',
  user_image   TEXT,
  user_role    TEXT NOT NULL DEFAULT 'spectator',
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_likes_content ON likes(content_slug, content_type);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX idx_comments_content ON comments(content_slug, content_type);
