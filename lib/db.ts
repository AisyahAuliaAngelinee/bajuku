import {Pool} from 'pg';
import type {Transaction,TransactionInput} from './transactions';
import type {StockInput,StockMovement} from './inventory';
const globalDb=globalThis as unknown as {bajukuPool?:Pool};
export function db(){if(!process.env.DATABASE_URL)throw new Error('Database belum dikonfigurasi');return globalDb.bajukuPool??=new Pool({connectionString:process.env.DATABASE_URL,max:5,connectionTimeoutMillis:10000,idleTimeoutMillis:30000});}
export async function listTransactions(owner:string):Promise<Transaction[]>{const r=await db().query(`SELECT id,to_char(sale_date,'YYYY-MM-DD') AS date,invoice,product,variant,quantity,price,cost,payment,notes,COALESCE(image_id::text,'') AS "imageId" FROM transactions WHERE owner_id=$1 ORDER BY sale_date DESC,created_at DESC`,[owner]);return r.rows;}
export async function saveTransaction(owner:string,data:TransactionInput,id?:string){
 const c=await db().connect();try{await c.query('BEGIN');
 if(data.imageId&&!(await c.query('SELECT id FROM transaction_images WHERE id=$1 AND owner_id=$2',[data.imageId,owner])).rowCount)throw Error('Gambar tidak ditemukan');
 const values=[data.date,data.product,data.variant,data.quantity,data.price,data.cost,data.payment,data.notes,data.imageId||null,owner];
 if(id){const r=await c.query('UPDATE transactions SET sale_date=$1,product=$2,variant=$3,quantity=$4,price=$5,cost=$6,payment=$7,notes=$8,image_id=$9 WHERE owner_id=$10 AND id=$11 RETURNING id',[...values,id]);if(!r.rowCount)throw Error('Not found');}
 else{
  const counter=await c.query(`INSERT INTO invoice_counters(owner_id,value) VALUES ($1,(SELECT COALESCE(MAX(substring(invoice from 5)::bigint),0)+1 FROM transactions WHERE owner_id=$1 AND invoice ~ '^BJK-[0-9]{1,12}$')) ON CONFLICT(owner_id) DO UPDATE SET value=invoice_counters.value+1 RETURNING value`,[owner]);
  const invoice=`BJK-${String(counter.rows[0].value).padStart(6,'0')}`;
  await c.query('INSERT INTO transactions(sale_date,product,variant,quantity,price,cost,payment,notes,image_id,owner_id,id,invoice) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[...values,crypto.randomUUID(),invoice]);
 }
 await c.query('COMMIT');}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}
}
export async function deleteTransaction(owner:string,id:string){const r=await db().query('DELETE FROM transactions WHERE owner_id=$1 AND id=$2 RETURNING id',[owner,id]);if(!r.rowCount)throw Error('Not found');}
export async function listStock(owner:string):Promise<StockMovement[]>{return(await db().query(`SELECT id,to_char(movement_date,'YYYY-MM-DD') AS date,product,variant,quantity,direction,notes FROM stock_movements WHERE owner_id=$1 ORDER BY movement_date DESC,created_at DESC`,[owner])).rows;}
export async function saveStock(owner:string,data:StockInput,id?:string){const values=[data.date,data.product,data.variant,data.quantity,data.direction,data.notes,owner];if(id){const r=await db().query('UPDATE stock_movements SET movement_date=$1,product=$2,variant=$3,quantity=$4,direction=$5,notes=$6 WHERE owner_id=$7 AND id=$8 RETURNING id',[...values,id]);if(!r.rowCount)throw Error('Not found');}else await db().query('INSERT INTO stock_movements(movement_date,product,variant,quantity,direction,notes,owner_id,id) VALUES($1,$2,$3,$4,$5,$6,$7,$8)',[...values,crypto.randomUUID()]);}

export async function deleteStock(owner:string,id:string){const r=await db().query('DELETE FROM stock_movements WHERE owner_id=$1 AND id=$2 RETURNING id',[owner,id]);if(!r.rowCount)throw Error('Not found');}
