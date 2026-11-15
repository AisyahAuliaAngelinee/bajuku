ALTER TABLE transactions ADD COLUMN IF NOT EXISTS amount_received bigint CHECK (amount_received >= 0 AND amount_received <= 100000000000000);
