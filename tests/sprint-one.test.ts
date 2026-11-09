import test from 'node:test';
import assert from 'node:assert/strict';
import {chartRange,salesSeries} from '../lib/chart-data';
import {inventorySummary} from '../lib/inventory';
import type {Transaction} from '../lib/transactions';

const sale:Transaction={id:'demo',date:'2026-11-07',invoice:'BJK-000001',product:'Kaos',variant:'M',quantity:2,price:120000,cost:75000,payment:'Tunai',notes:'',imageId:''};
test('weekly chart includes Monday through Sunday and sums quantity times price',()=>{
 const range=chartRange('week',sale.date,'','');
 assert.deepEqual(range,{from:'2026-11-02',to:'2026-11-08'});
 const data=salesSeries([sale,{...sale,date:'2026-11-09'}],range.from,range.to);
 assert.equal(data.length,7);assert.equal(data.reduce((sum,p)=>sum+p.revenue,0),240000);
});
test('inventory incorporates sales once, matches normalized products, and reflects edits/removals',()=>{
 const movements=[{id:'stock',date:sale.date,product:' kaos ',variant:'m',quantity:5,direction:'in' as const,notes:''}];
 assert.equal(inventorySummary(movements,[sale])[0].balance,3);
 assert.equal(inventorySummary(movements,[{...sale,quantity:4}])[0].balance,1);
 assert.equal(inventorySummary(movements,[])[0].balance,5);
});
test('stock stays scoped to product and variant across stock and sale edits/deletes',()=>{
 const incoming={id:'in',date:sale.date,product:'Kaos',variant:'M',quantity:10,direction:'in' as const,notes:''};
 const other={...incoming,id:'other',variant:'L',quantity:7};
 const summary=inventorySummary([incoming,other],[sale]);
 assert.equal(summary.find(p=>p.variant==='M')?.balance,8);
 assert.equal(summary.find(p=>p.variant==='L')?.balance,7);
 assert.equal(inventorySummary([{...incoming,quantity:6}],[sale])[0].balance,4);
 assert.equal(inventorySummary([],[sale])[0].balance,-2);
 assert.equal(inventorySummary([incoming],[])[0].balance,10);
 assert.equal(inventorySummary([incoming,{...incoming,id:'legacy',direction:'out',quantity:5}],[sale])[0].outgoing,2);
});

import {invoicePrefix,formatInvoice} from '../lib/invoice';
import {signInvoice,verifyInvoice} from '../lib/invoice-reservation';
import {sortRows} from '../lib/sorting';
test('invoice code normalizes model and size/color order with three digit sequence',()=>{
 assert.equal(invoicePrefix('Essential Cotton Tee','Hitam / L'),'ECT-L-HITAM');
 assert.equal(invoicePrefix('Essential Cotton Tee','L / Hitam'),'ECT-L-HITAM');
 assert.equal(formatInvoice('ECT-L-HITAM',1),'ECT-L-HITAM-001');
 assert.equal(formatInvoice('ECT-L-HITAM',999),'ECT-L-HITAM-999');
 assert.throws(()=>formatInvoice('ECT-L-HITAM',1000));
});
test('invoice reservation is bound to owner, model, variant and invoice',()=>{
 process.env.AUTH_SECRET='test-only-secret';
 const proof=signInvoice('owner','Kaos','L / Hitam','K-L-HITAM-001');
 assert.ok(verifyInvoice('owner','Kaos','L / Hitam','K-L-HITAM-001',proof));
 assert.equal(verifyInvoice('other','Kaos','L / Hitam','K-L-HITAM-001',proof),false);
 assert.equal(verifyInvoice('owner','Kaos','M / Hitam','K-L-HITAM-001',proof),false);
 assert.equal(verifyInvoice('owner','Kaos','L / Hitam','K-L-HITAM-002',proof),false);
 assert.equal(verifyInvoice('owner','Kaos','L / Hitam','K-L-HITAM-001','invalid'),false);
});
test('table sorting compares numbers numerically without mutating the source',()=>{
 const values=[{n:10},{n:2},{n:30}];
 assert.deepEqual(sortRows(values,{key:'n',direction:'asc'},r=>r.n).map(r=>r.n),[2,10,30]);
 assert.deepEqual(sortRows(values,{key:'n',direction:'desc'},r=>r.n).map(r=>r.n),[30,10,2]);
 assert.deepEqual(values.map(r=>r.n),[10,2,30]);
});

import {recentHistory,type HistoryEntry} from '../lib/history';
test('history expires at exactly 30 days based on recorded activity time',()=>{
 const now=Date.UTC(2026,10,8,12);const row:HistoryEntry={id:'audit',sourceId:'sale',source:'sale',action:'created',product:'Kaos',variant:'M',quantity:2,direction:'out',notes:'',invoice:'K-M-NA-001',occurredAt:new Date(now).toISOString()};
 const old={...row,id:'old',occurredAt:new Date(now-30*86400000).toISOString()};
 const recent={...row,id:'recent',occurredAt:new Date(now-30*86400000+1).toISOString()};
 assert.deepEqual(recentHistory([old,recent,row],now).map(r=>r.id),['recent','audit']);
 assert.equal(row.quantity,2);
});

import {latestStockPrice} from '../lib/inventory';
test('stock prices use newest input rather than movement date and stay variant scoped',()=>{
 const base={id:'old',date:'2026-12-01',product:'Kaos',variant:'M',quantity:5,direction:'in' as const,notes:'',price:100,cost:60,createdAt:'2026-11-01T00:00:00Z'};
 const newer={...base,id:'new',date:'2026-10-01',price:150,cost:80,createdAt:'2026-11-08T00:00:00Z'};
 assert.equal(latestStockPrice([base,newer],'kaos','m')?.price,150);
 assert.equal(latestStockPrice([newer],'Kaos','L'),undefined);
 assert.equal(inventorySummary([base,newer],[])[0].createdAt,newer.createdAt);
});

test('remaining stock carries into following days without duplicate incoming records',()=>{
 const stock=[{id:'first',date:'2026-11-07',product:'Kaos',variant:'M',quantity:10,direction:'in' as const,notes:''},{id:'next',date:'2026-11-09',product:'Kaos',variant:'M',quantity:5,direction:'in' as const,notes:''}];
 const sold={...sale,date:'2026-11-07',quantity:3};
 assert.equal(inventorySummary(stock,[sold],'2026-11-07')[0].balance,7);
 assert.equal(inventorySummary(stock,[sold],'2026-11-08')[0].balance,7);
 assert.equal(inventorySummary(stock,[sold],'2026-11-09')[0].balance,12);
 assert.equal(stock.length,2);
});

import {groupProducts} from '../lib/inventory';
import {greetingForHour} from '../lib/local-time';
test('product grouping combines variants without losing stock counts or mixing products',()=>{
 const input=[{id:'a',date:sale.date,product:'Kaos',variant:'M Hitam',quantity:5,direction:'in' as const,notes:''},{id:'b',date:sale.date,product:' kaos ',variant:'L Putih',quantity:8,direction:'in' as const,notes:''},{id:'c',date:sale.date,product:'Jaket',variant:'M',quantity:4,direction:'in' as const,notes:''}];
 const grouped=groupProducts(inventorySummary(input,[{...sale,variant:'M Hitam'}]));
 assert.equal(grouped.length,2);const kaos=grouped.find(g=>g.key==='kaos')!;assert.equal(kaos.variants.length,2);assert.equal(kaos.incoming,13);assert.equal(kaos.outgoing,2);assert.equal(kaos.balance,11);
});
test('greeting changes at local morning, noon, afternoon and night boundaries',()=>{
 assert.equal(greetingForHour(4),'Selamat malam');assert.equal(greetingForHour(5),'Selamat pagi');assert.equal(greetingForHour(11),'Selamat siang');assert.equal(greetingForHour(15),'Selamat sore');assert.equal(greetingForHour(18),'Selamat malam');
});
