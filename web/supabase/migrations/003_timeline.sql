-- HypeProof Lab — Project Timeline (events + sub-tasks)
-- Source of truth migrates from web/data/project-timeline.json into Postgres.
-- The web app and /cal skill talk to these tables via the Supabase JS client
-- (or Service Role from server actions).

-- ─── Enums ───────────────────────────────────────────────
CREATE TYPE timeline_lane AS ENUM ('direct', 'channel', 'reusable');
CREATE TYPE timeline_event_status AS ENUM (
  'planned', 'in-progress', 'done', 'deferred', 'wrap-up', 'cancelled'
);
CREATE TYPE timeline_task_priority AS ENUM ('low', 'med', 'high');
CREATE TYPE timeline_date_kind AS ENUM ('date', 'month', 'quarter', 'ongoing');
CREATE TYPE timeline_part_of_day AS ENUM ('AM', 'PM');

-- ─── Events ──────────────────────────────────────────────
CREATE TABLE timeline_events (
  id              TEXT PRIMARY KEY,              -- 'ev-boa-dental' etc
  lane            timeline_lane NOT NULL,
  title           TEXT NOT NULL,
  subtitle        TEXT,
  status          timeline_event_status NOT NULL DEFAULT 'planned',

  -- FuzzyDate flattened (one of: iso / (year, month) / (year, quarter) / ongoing)
  date_kind       timeline_date_kind NOT NULL,
  date_iso        DATE,
  date_year       INT,
  date_month      INT,
  date_quarter    INT,
  date_part_of_day timeline_part_of_day,

  contacts        TEXT[],
  notes           TEXT[],
  owner           TEXT,
  links           JSONB,                          -- [{label,url}]
  tags            TEXT[],
  external_ids    JSONB,                          -- {gcal, supabase}
  needs_classification BOOLEAN DEFAULT FALSE,

  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,

  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX timeline_events_lane_idx ON timeline_events(lane);
CREATE INDEX timeline_events_status_idx ON timeline_events(status);
CREATE INDEX timeline_events_date_iso_idx ON timeline_events(date_iso);

-- ─── Sub-tasks (체크리스트, event-attached or unattached) ─
CREATE TABLE timeline_tasks (
  id              TEXT PRIMARY KEY,                            -- 't-001' or uuid
  event_id        TEXT REFERENCES timeline_events(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  assignees       TEXT[] NOT NULL DEFAULT '{}',                -- displayName[]
  reporter        TEXT,                                         -- email
  due_date        DATE,
  priority        timeline_task_priority DEFAULT 'med',

  done            BOOLEAN NOT NULL DEFAULT FALSE,
  done_at         TIMESTAMPTZ,
  done_by         TEXT,                                         -- displayName

  source_excerpt  TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX timeline_tasks_event_idx ON timeline_tasks(event_id);
CREATE INDEX timeline_tasks_done_idx ON timeline_tasks(done) WHERE done = FALSE;
CREATE INDEX timeline_tasks_assignees_idx ON timeline_tasks USING GIN (assignees);
CREATE INDEX timeline_tasks_due_idx ON timeline_tasks(due_date) WHERE due_date IS NOT NULL;

-- ─── Reusable assets ─────────────────────────────────────
CREATE TYPE timeline_asset_status AS ENUM ('idea', 'draft', 'ready');

CREATE TABLE timeline_reusable_assets (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  status      timeline_asset_status NOT NULL DEFAULT 'draft',
  owned_by    TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Singleton config (priority banner, gcal config, lanes meta) ─
CREATE TABLE timeline_meta (
  id              TEXT PRIMARY KEY DEFAULT 'singleton',
  priority_banner JSONB,                                        -- {headline, body, severity}
  lanes           JSONB NOT NULL,                               -- {direct:{label,color}, ...}
  gcal            JSONB,                                        -- {calendarId, lastSyncAt}
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT timeline_meta_singleton CHECK (id = 'singleton')
);

-- ─── Audit log (task transitions) — Jira-like ────────────
CREATE TABLE timeline_task_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id         TEXT REFERENCES timeline_tasks(id) ON DELETE CASCADE,
  actor           TEXT,                                         -- email or 'mother-bot'
  action          TEXT NOT NULL,                                -- 'created'|'done:true'|'assignee:add:TJ'
  before_value    JSONB,
  after_value     JSONB,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX timeline_task_log_task_idx ON timeline_task_log(task_id, created_at DESC);

-- ─── updated_at trigger ──────────────────────────────────
CREATE OR REPLACE FUNCTION timeline_touch_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER timeline_events_touch
  BEFORE UPDATE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION timeline_touch_updated_at();

CREATE TRIGGER timeline_meta_touch
  BEFORE UPDATE ON timeline_meta
  FOR EACH ROW EXECUTE FUNCTION timeline_touch_updated_at();

-- ─── Seed default lanes ──────────────────────────────────
INSERT INTO timeline_meta (id, lanes)
VALUES ('singleton', jsonb_build_object(
  'direct',   jsonb_build_object('label', 'HypeProof Direct',    'color', '#a78bfa'),
  'channel',  jsonb_build_object('label', 'Filamentree Channel', 'color', '#34d399'),
  'reusable', jsonb_build_object('label', 'Reusable Asset Layer','color', '#94a3b8')
));
