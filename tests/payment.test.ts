import test from 'node:test';
import assert from 'node:assert/strict';
import {paymentSummary,transactionSchema,totals,type TransactionInput} from '../lib/transactions';
import {totalStock,dailyInventory} from '../lib/inventory';
import {buildWorkbook,buildPdf} from '../lib/export-bookkeeping';
const row:TransactionInput={date:'2026-11-15',invoice:'K001',product:'Kaos',variant:'M',quantity:2,price:50000,cost:30000,payment:'Tunai',notes:'',imageId:''};
test('receipt tracks partial, unpaid, exact, and extra payments without changing sales or profit',()=>{
 for(const [received,debt,extra,status] of [[60000,40000,0,'Dibayar sebagian'],[0,100000,0,'Belum dibayar'],[100000,0,0,'Lunas'],[110000,0,10000,'Lunas + kelebihan']] as const){
  const data={...row,amountReceived:received};
  assert.deepEqual(paymentSummary(data),{total:100000,received,debt,extra,status});
  assert.deepEqual(totals([data]),{pieces:2,revenue:100000,cost:60000,profit:40000});
 }
});
test('legacy transactions retain payment defaults and explicit zero overrides paid defaults',()=>{
 assert.equal(paymentSummary(row).received,100000);
 assert.equal(paymentSummary({...row,payment:'Utang'}).debt,100000);
 assert.equal(paymentSummary({...row,amountReceived:null}).received,100000);
 assert.equal(paymentSummary({...row,amountReceived:0}).debt,100000);
 assert.equal(paymentSummary({...row,payment:'Utang',amountReceived:100000}).status,'Lunas');
});
test('receipt validation rejects negative, fractional, nonfinite and oversized amounts',()=>{
 for(const amountReceived of [-1,0.5,NaN,Infinity,100000000000001,'100000'])assert.equal(transactionSchema.safeParse({...row,amountReceived}).success,false);
 for(const amountReceived of [0,110000,100000000000000])assert.equal(transactionSchema.safeParse({...row,amountReceived}).success,true);
});
test('total stock includes all days independently of daily balances and receipt amounts',()=>{
 const stock=[{id:'a',date:'2026-11-14',product:'Kaos',variant:'M',quantity:10,direction:'in' as const,notes:''},{id:'b',date:'2026-11-20',product:'Kaos',variant:'M',quantity:5,direction:'in' as const,notes:''}];
 const sales=[{...row,id:'sale',amountReceived:0}];
 assert.equal(totalStock(stock,sales),13);
 assert.equal(dailyInventory(stock,sales,'2026-11-14')[0].balance,10);
 assert.equal(dailyInventory(stock,sales,'2026-11-15')[0].balance,8);
 assert.equal(totalStock(stock,sales),13);
});
test('payment details survive Excel export and PDF contains payment amounts',async()=>{
 const data={...row,id:'sale',amountReceived:60000};
 const workbook=await buildWorkbook([data],{name:'Demo',date:'',search:''});
 const sheet=workbook.getWorksheet('Pembayaran')!;
 assert.equal(sheet.getCell('D2').value,100000);assert.equal(sheet.getCell('E2').value,60000);assert.equal(sheet.getCell('F2').value,40000);assert.equal(sheet.getCell('G2').value,0);
 const pdf=await buildPdf([data],{name:'Demo',date:'',search:''});
 assert.match(pdf.output(),/Diterima: 60\.000/);assert.match(pdf.output(),/Utang: 40\.000/);
});
