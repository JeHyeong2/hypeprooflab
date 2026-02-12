-- HypeProof Lab — Row-Level Security Policies
-- Defense-in-depth: server uses service_role (bypasses RLS),
-- but these policies protect against anon key access patterns.

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Profiles
-- ============================================================
-- Anyone can read profiles (public info)
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================================
-- Likes
-- ============================================================
-- Anyone can read like counts
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

-- Authenticated users can insert their own likes
CREATE POLICY "Users can insert own likes"
  ON likes FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own likes
CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================================
-- Bookmarks
-- ============================================================
-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks"
  ON bookmarks FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks"
  ON bookmarks FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ============================================================
-- Comments
-- ============================================================
-- Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- Authenticated users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON comments FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub')
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
