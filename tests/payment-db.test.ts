import test from 'node:test';
import assert from 'node:assert/strict';
import {saveTransaction,listTransactions,ensureStockPrices} from '../lib/db';
import {paymentSchemaSql} from '../lib/payment-schema';
import {readFileSync} from 'node:fs';
const calls:{sql:string;values?:unknown[]}[]=[];
let persisted:number|null=null;
const client={release(){},async query(sql:string,values?:unknown[]){
 calls.push({sql,values});
 if(sql.startsWith('SELECT id,price'))return{rowCount:1,rows:[{id:'stock',price:50000,cost:30000}]};
 if(sql.startsWith('SELECT id FROM transactions'))return{rowCount:0,rows:[]};
 if(sql.startsWith('INSERT INTO transactions')||sql.startsWith('UPDATE transactions SET sale_date'))persisted=values![9] as number;
 if(sql.startsWith("SELECT id,to_char(sale_date"))return{rowCount:1,rows:[{id:'sale',amountReceived:persisted}]};
 return{rowCount:1,rows:[]};
}};
process.env.DATABASE_URL='postgres://test-only';(globalThis as any).bajukuPool={connect:async()=>client,query:client.query};
const row={date:'2026-11-15',invoice:'K001',product:'Kaos',variant:'M',quantity:2,price:50000,cost:30000,payment:'Tunai' as const,notes:'',imageId:'',amountReceived:60000};
test('runtime and deployment migration add the same nullable payment column',async()=>{
 assert.equal(readFileSync(new URL('../migrations/008_transaction_receipts.sql',import.meta.url),'utf8').trim(),paymentSchemaSql);
 await ensureStockPrices();assert.ok(calls.some(c=>c.sql===paymentSchemaSql));
});
test('insert and edit persist receipts with owner scope and read the amount back',async()=>{
 calls.length=0;await saveTransaction('owner-a',row);
 const insert=calls.find(c=>c.sql.startsWith('INSERT INTO transactions'))!;
 assert.match(insert.sql,/image_id,amount_received,owner_id,id,invoice/);assert.equal(insert.values?.[9],60000);assert.equal(insert.values?.[10],'owner-a');assert.equal(insert.values?.[12],'K001');
 assert.equal((await listTransactions('owner-a'))[0].amountReceived,60000);
 calls.length=0;await saveTransaction('owner-a',{...row,amountReceived:110000},'sale');
 const update=calls.find(c=>c.sql.startsWith('UPDATE transactions SET sale_date'))!;
 assert.match(update.sql,/amount_received=\$10 WHERE owner_id=\$11 AND id=\$12 AND deleted_at IS NULL/);
 assert.equal(update.values?.[9],110000);assert.equal(update.values?.[10],'owner-a');assert.equal(update.values?.[11],'sale');
 assert.equal((await listTransactions('owner-a'))[0].amountReceived,110000);
});
