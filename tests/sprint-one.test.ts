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
