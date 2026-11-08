CREATE TABLE IF NOT EXISTS download_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_id text NOT NULL,
 filename text NOT NULL,
 format text NOT NULL CHECK (format IN ('xlsx','pdf')),
 transaction_count integer NOT NULL,
 period text NOT NULL,
 search text NOT NULL DEFAULT '',
 content_type text NOT NULL,
 data bytea NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS download_history_owner_time ON download_history(owner_id,created_at DESC);
