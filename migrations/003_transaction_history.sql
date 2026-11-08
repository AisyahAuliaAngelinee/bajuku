CREATE TABLE IF NOT EXISTS transaction_history (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id text NOT NULL,
 source_id uuid NOT NULL, source text NOT NULL CHECK(source IN ('sale','stock')),
 action text NOT NULL CHECK(action IN ('created','updated','deleted')),
 product text NOT NULL, variant text NOT NULL DEFAULT '', quantity integer NOT NULL,
 direction text NOT NULL, notes text NOT NULL DEFAULT '', invoice text NOT NULL DEFAULT '',
 occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS history_owner_time ON transaction_history(owner_id,occurred_at DESC);
CREATE INDEX IF NOT EXISTS history_expiry ON transaction_history(occurred_at);
CREATE OR REPLACE FUNCTION record_transaction_history() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE item jsonb; BEGIN
 item := CASE WHEN TG_OP='DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END;
 INSERT INTO transaction_history(owner_id,source_id,source,action,product,variant,quantity,direction,notes,invoice)
 VALUES(item->>'owner_id',(item->>'id')::uuid,CASE WHEN TG_TABLE_NAME='transactions' THEN 'sale' ELSE 'stock' END,
 CASE TG_OP WHEN 'INSERT' THEN 'created' WHEN 'UPDATE' THEN 'updated' ELSE 'deleted' END,
 item->>'product',COALESCE(item->>'variant',''),(item->>'quantity')::integer,
 CASE WHEN TG_TABLE_NAME='transactions' THEN 'out' ELSE item->>'direction' END,
 COALESCE(item->>'notes',''),COALESCE(item->>'invoice',''));
 IF TG_OP='DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END $$;
DROP TRIGGER IF EXISTS sale_history ON transactions;
CREATE TRIGGER sale_history AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION record_transaction_history();
DROP TRIGGER IF EXISTS stock_history ON stock_movements;
CREATE TRIGGER stock_history AFTER INSERT OR UPDATE OR DELETE ON stock_movements FOR EACH ROW EXECUTE FUNCTION record_transaction_history();
INSERT INTO transaction_history(owner_id,source_id,source,action,product,variant,quantity,direction,notes,invoice,occurred_at)
 SELECT owner_id,id,'sale','created',product,variant,quantity,'out',notes,invoice,created_at FROM transactions WHERE created_at>now()-interval '30 days';
INSERT INTO transaction_history(owner_id,source_id,source,action,product,variant,quantity,direction,notes,occurred_at)
 SELECT owner_id,id,'stock','created',product,variant,quantity,direction,notes,created_at FROM stock_movements WHERE created_at>now()-interval '30 days';
