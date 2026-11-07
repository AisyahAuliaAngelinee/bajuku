CREATE TABLE IF NOT EXISTS invoice_counters(owner_id text PRIMARY KEY,value bigint NOT NULL CHECK(value>0));
CREATE TABLE IF NOT EXISTS stock_movements(
 id uuid PRIMARY KEY,owner_id text NOT NULL,movement_date date NOT NULL,product varchar(120) NOT NULL,variant varchar(80) NOT NULL DEFAULT '',quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 10000),direction text NOT NULL CHECK(direction IN ('in','out')),notes varchar(500) NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS stock_owner_date ON stock_movements(owner_id,movement_date DESC);
CREATE TABLE IF NOT EXISTS transaction_images(id uuid PRIMARY KEY,owner_id text NOT NULL,content_type text NOT NULL CHECK(content_type IN ('image/jpeg','image/png','image/webp')),data bytea NOT NULL CHECK(octet_length(data)<=3145728),created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS images_owner_idx ON transaction_images(owner_id);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS image_id uuid REFERENCES transaction_images(id);
