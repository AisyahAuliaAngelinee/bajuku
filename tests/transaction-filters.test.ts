import test from 'node:test';
import assert from 'node:assert/strict';
import {filterTransactions,transactionDateFilterSchema,transactionPeriod} from '../lib/transaction-filters';
import {sortRows} from '../lib/sorting';
import {buildWorkbook,createBookkeepingFile} from '../lib/export-bookkeeping';
import type {Transaction} from '../lib/transactions';
const row:Transaction={id:'a',date:'2026-11-01',createdAt:'2026-11-15T03:00:00Z',invoice:'A',product:'Kaos',variant:'M',quantity:1,price:100,cost:50,payment:'Tunai',notes:'',imageId:''};
const rows=[row,{...row,id:'b',date:'2026-11-14',createdAt:'2026-11-14T01:00:00Z'},{...row,id:'c',date:'2026-11-15',createdAt:'2026-11-15T02:00:00Z',product:'Kemeja'}];
test('default lists all dates sorted by latest input including backdated transactions',()=>{
 const result=sortRows(filterTransactions(rows,{}),{key:'createdAt',direction:'desc'},r=>r.createdAt||'');
 assert.deepEqual(result.map(r=>r.id),['a','c','b']);assert.equal(rows[0],row);
});
test('range includes boundaries and combines search with open and same-day ranges',()=>{
 assert.deepEqual(filterTransactions(rows,{dateFrom:'2026-11-14',dateTo:'2026-11-15'}).map(r=>r.id),['b','c']);
 assert.deepEqual(filterTransactions(rows,{dateFrom:'2026-11-14',search:'kaos'}).map(r=>r.id),['b']);
 assert.deepEqual(filterTransactions(rows,{dateTo:'2026-11-01'}).map(r=>r.id),['a']);
 assert.deepEqual(filterTransactions(rows,{dateFrom:'2026-11-15',dateTo:'2026-11-15'}).map(r=>r.id),['c']);
});
test('invalid and reversed dates are rejected and old single-day export filter still works',()=>{
 for(const filter of [{dateFrom:'2026-02-30'},{dateTo:'abc'},{dateFrom:'2026-11-15',dateTo:'2026-11-14'}]){
 assert.equal(transactionDateFilterSchema.safeParse(filter).success,false);assert.deepEqual(filterTransactions(rows,filter),[]);
 }
 assert.deepEqual(filterTransactions(rows,{date:'2026-11-01'}).map(r=>r.id),['a']);
});
test('range metadata and export filename match filtered data',async()=>{
 const context={name:'Demo',date:'',search:'',dateFrom:'2026-11-14',dateTo:'2026-11-15'};
 assert.equal(transactionPeriod(context),'14/11/2026 – 15/11/2026');
 const filtered=filterTransactions(rows,context);const book=await buildWorkbook(filtered,context);
 assert.match(String(book.getWorksheet('Transaksi')!.getCell('A3').value),/14\/11\/2026 – 15\/11\/2026/);
 assert.equal(book.getWorksheet('Transaksi')!.getCell('B7').value,'A');
 const file=await createBookkeepingFile('pdf',filtered,context);assert.equal(file.filename,'Baju-Thieo-Pembukuan-2026-11-14_sampai_2026-11-15.pdf');
});
