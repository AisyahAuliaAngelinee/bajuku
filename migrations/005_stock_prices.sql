ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS price bigint CHECK (price>=0 AND price<=1000000000);
ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS cost bigint CHECK (cost>=0 AND cost<=1000000000);
