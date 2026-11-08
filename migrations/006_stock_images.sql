ALTER TABLE stock_movements ADD COLUMN IF NOT EXISTS image_id uuid REFERENCES transaction_images(id) ON DELETE SET NULL;
