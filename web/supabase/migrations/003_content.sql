-- HypeProof Lab — Content tables (Track 1A: markdown → DB migration)
-- Defined in docs/MIGRATION-RFC.md §5
-- Auth.js manages users externally (JWT); content tables are public-read for status='published'.

-- ============================================================
-- articles  (columns)
-- ============================================================
CREATE TABLE articles (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug            TEXT NOT NULL,
  locale          TEXT NOT NULL,                          -- 'ko' | 'en'
  title           TEXT NOT NULL,
  creator         TEXT NOT NULL,
  creator_image   TEXT,
  date            DATE NOT NULL,
  updated         DATE,
  category        TEXT,
  tags            TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  read_time       TEXT,
  excerpt         TEXT,
  citations       JSONB,
  references_list JSONB,
  author_type     TEXT,                                   -- 'human' | 'ai'
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'published',      -- 'draft' | 'published'
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);

CREATE INDEX idx_articles_status_date    ON articles (status, date DESC);
CREATE INDEX idx_articles_locale_status  ON articles (locale, status);
CREATE INDEX idx_articles_tags_gin       ON articles USING GIN (tags);

-- ============================================================
-- novels  (KO only for now)
-- ============================================================
CREATE TABLE novels (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  series        TEXT NOT NULL,
  volume        INT,
  chapter       INT,
  author        TEXT NOT NULL,                            -- AI persona name (e.g. CIPHER)
  author_human  TEXT,                                     -- real author (e.g. Jay)
  author_image  TEXT,
  ai_model      TEXT,                                     -- frontmatter-only, NOT for UI display
  date          DATE,
  category      TEXT,
  tags          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  read_time     TEXT,
  excerpt       TEXT,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'published',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_novels_series_volume_chapter ON novels (series, volume, chapter);
CREATE INDEX idx_novels_status_date           ON novels (status, date DESC);

-- ============================================================
-- research_posts
-- ============================================================
CREATE TABLE research_posts (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug          TEXT NOT NULL,
  locale        TEXT NOT NULL,
  title         TEXT NOT NULL,
  creator       TEXT,
  creator_image TEXT,
  date          DATE NOT NULL,
  tags          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  excerpt       TEXT,
  body          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'published',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slug, locale)
);

CREATE INDEX idx_research_status_date   ON research_posts (status, date DESC);
CREATE INDEX idx_research_locale_status ON research_posts (locale, status);

-- ============================================================
-- updated_at auto-touch trigger (shared)
-- ============================================================
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER touch_articles_updated_at        BEFORE UPDATE ON articles        FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_novels_updated_at          BEFORE UPDATE ON novels          FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
CREATE TRIGGER touch_research_posts_updated_at  BEFORE UPDATE ON research_posts  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- Row-Level Security
--   Server uses service_role (bypasses RLS).
--   Anon key access is read-only and filtered to status='published'.
-- ============================================================
ALTER TABLE articles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE novels          ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_posts  ENABLE ROW LEVEL SECURITY;

-- articles
CREATE POLICY "Published articles are viewable by everyone"
  ON articles FOR SELECT
  USING (status = 'published');

-- novels
CREATE POLICY "Published novels are viewable by everyone"
  ON novels FOR SELECT
  USING (status = 'published');

-- research_posts
CREATE POLICY "Published research is viewable by everyone"
  ON research_posts FOR SELECT
  USING (status = 'published');

-- INSERT/UPDATE/DELETE deliberately have NO policies — clients cannot modify.
-- All writes flow through API routes that authenticate first and use service_role.
