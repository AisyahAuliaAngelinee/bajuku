import {test} from 'node:test';import assert from 'node:assert/strict';
import {transactionSchema,totals} from '../lib/transactions';
const row={date:'2026-11-07',invoice:'A',product:'Kaos',variant:'L',quantity:3,price:100000,cost:60000,payment:'Tunai' as const,notes:''};
test('unit price and cost multiplied by quantity',()=>assert.deepEqual(totals([row]),{pieces:3,revenue:300000,cost:180000,profit:120000}));
test('reject invalid quantities, prices and dates',()=>{for(const patch of [{quantity:0},{quantity:1.5},{price:-1},{cost:-1},{date:'2026-02-30'},{product:''}])assert.equal(transactionSchema.safeParse({...row,...patch}).success,false);});
test('zero price and loss are valid',()=>{assert.equal(transactionSchema.safeParse({...row,price:0}).success,true);assert.equal(totals([{...row,price:0}]).profit,-180000);});
