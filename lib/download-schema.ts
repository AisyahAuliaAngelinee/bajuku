export const downloadSchemaSql = `CREATE TABLE IF NOT EXISTS download_history (
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
ALTER TABLE download_history ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
CREATE INDEX IF NOT EXISTS downloads_deleted ON download_history(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS download_history_owner_time ON download_history(owner_id,created_at DESC);
`;
