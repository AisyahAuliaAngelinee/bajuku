-- Keep original rows and attachments intact for restoration within 30 days.
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE download_history ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
DROP TRIGGER IF EXISTS sale_history ON transactions;
DROP TRIGGER IF EXISTS stock_history ON stock_movements;
CREATE INDEX IF NOT EXISTS transactions_deleted ON transactions(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS stock_deleted ON stock_movements(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS downloads_deleted ON download_history(deleted_at) WHERE deleted_at IS NOT NULL;
