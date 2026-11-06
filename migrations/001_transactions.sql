CREATE TABLE IF NOT EXISTS transactions (
 id uuid PRIMARY KEY, owner_id text NOT NULL, sale_date date NOT NULL,
 invoice varchar(80) NOT NULL DEFAULT '', product varchar(120) NOT NULL,
 variant varchar(80) NOT NULL DEFAULT '', quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 10000),
 price integer NOT NULL CHECK(price BETWEEN 0 AND 1000000000),cost integer NOT NULL CHECK(cost BETWEEN 0 AND 1000000000),
 payment text NOT NULL CHECK(payment IN ('Tunai','Transfer bank','QRIS','E-wallet','Kartu')),
 notes varchar(500) NOT NULL DEFAULT '',created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS transactions_owner_date_idx ON transactions(owner_id,sale_date DESC);
