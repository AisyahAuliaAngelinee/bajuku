import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyInventory,dailyOutgoing,type StockMovement} from '../lib/inventory';
import type {Transaction} from '../lib/transactions';
const receipt:StockMovement={id:'in',date:'2026-11-14',product:'Kaos',variant:'M',quantity:10,direction:'in',notes:''};
const sale:Transaction={id:'out',date:'2026-11-14',product:'Kaos',variant:'M',quantity:3,price:100,cost:50,payment:'Tunai',notes:'',invoice:'K001',imageId:''};
test('daily stock carries only the previous closing balance and excludes future records',()=>{
 const rows=dailyInventory([receipt,{...receipt,id:'new',date:'2026-11-15',quantity:5},{...receipt,id:'future',date:'2026-11-17',quantity:100}],[sale,{...sale,id:'today',date:'2026-11-15',quantity:2}],'2026-11-15');
 assert.equal(rows[0].opening,7);assert.equal(rows[0].received,5);assert.equal(rows[0].incoming,12);assert.equal(rows[0].outgoing,2);assert.equal(rows[0].balance,10);
});
test('days without movements carry stock but no outgoing, including gaps',()=>{
 const row=dailyInventory([receipt],[sale],'2026-11-20')[0];
 assert.equal(row.opening,7);assert.equal(row.received,0);assert.equal(row.outgoing,0);assert.equal(row.balance,7);
 assert.equal(dailyInventory([receipt],[sale],'2026-11-13').length,0);
});
test('deletions/restores recalculate opening stock and variants remain isolated',()=>{
 assert.equal(dailyInventory([receipt],[],'2026-11-15')[0].opening,10);
 assert.equal(dailyInventory([receipt],[sale],'2026-11-15')[0].opening,7);
 const rows=dailyInventory([receipt,{...receipt,id:'L',variant:'L',quantity:4}],[sale],'2026-11-15');
 assert.equal(rows.find(r=>r.variant==='L')?.opening,4);
 assert.equal(dailyInventory([], [sale], '2026-11-15')[0].opening,-3);
});

test('outgoing is limited to the selected day and sorted by latest input',()=>{
 const rows=[sale,{...sale,id:'early',date:'2026-11-15',createdAt:'2026-11-15T01:00:00Z'},{...sale,id:'late',date:'2026-11-15',createdAt:'2026-11-15T02:00:00Z'}];
 assert.deepEqual(dailyOutgoing(rows,'2026-11-15').map(r=>r.id),['late','early']);
 assert.deepEqual(dailyOutgoing(rows,'2026-11-16'),[]);
 assert.equal(rows[0].id,'out');
});
