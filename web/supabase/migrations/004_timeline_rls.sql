-- HypeProof Lab — Timeline RLS
-- Server actions use Service Role (bypasses RLS). These policies guard
-- against direct anon-key access patterns (e.g. browser using anon key).

ALTER TABLE timeline_events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_tasks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_reusable_assets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_meta             ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_task_log         ENABLE ROW LEVEL SECURITY;

-- Read: any authenticated member can see all timeline data
CREATE POLICY "auth read events"
  ON timeline_events FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "auth read tasks"
  ON timeline_tasks FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "auth read assets"
  ON timeline_reusable_assets FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "auth read meta"
  ON timeline_meta FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "auth read task log"
  ON timeline_task_log FOR SELECT
  TO authenticated USING (true);

-- Write: only Service Role (server actions, skill) — no explicit policy needed
-- (Service Role bypasses RLS). For client-side updates, route via server actions.
