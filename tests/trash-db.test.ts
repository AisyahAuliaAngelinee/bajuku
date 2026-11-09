import test from 'node:test';
import assert from 'node:assert/strict';
import {changeTrash,ensureStockPrices,ensureDownloadSchema} from '../lib/db';
const calls:{sql:string;values?:unknown[]}[]=[];let stale=false;
const client={release(){},async query(sql:string,values?:unknown[]){calls.push({sql,values});if(sql.startsWith('UPDATE '))return{rowCount:stale&&sql.includes('stock_movements')?0:(values?.[1] as string[]).length,rows:[]};return {rowCount:1,rows:[]}}};
process.env.DATABASE_URL='postgres://test-only';(globalThis as any).bajukuPool={connect:async()=>client};
test('bulk server mutation scopes all sources to owner and rolls back stale selections',async()=>{
 await ensureStockPrices();await ensureDownloadSchema();calls.length=0;stale=true;
 await assert.rejects(changeTrash('owner-a',[{source:'sale',id:'sale-id'},{source:'stock',id:'stock-id'}]));
 const updates=calls.filter(c=>c.sql.startsWith('UPDATE '));assert.equal(updates.length,2);for(const c of updates){assert.match(c.sql,/owner_id=\$1 AND id=ANY\(\$2::uuid\[\]\)/);assert.equal(c.values?.[0],'owner-a');assert.match(c.sql,/deleted_at IS NULL/)}assert.equal(calls.at(-1)?.sql,'ROLLBACK');assert.equal(calls.some(c=>c.sql==='COMMIT'),false);
});
test('restore keeps original data and rejects expired entries in SQL',async()=>{
 calls.length=0;stale=false;await changeTrash('owner-b',[{source:'download',id:'file-id'}],true);
 const update=calls.find(c=>c.sql.startsWith('UPDATE '))!;assert.match(update.sql,/UPDATE download_history SET deleted_at=NULL/);assert.match(update.sql,/deleted_at>now\(\)-interval '30 days'/);assert.deepEqual(update.values,['owner-b',['file-id']]);assert.equal(calls.at(-1)?.sql,'COMMIT');
});
