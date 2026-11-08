import test from 'node:test';
import assert from 'node:assert/strict';
import {localToday,localTimestamp,validTimeZone} from '../lib/local-time';
import {stockSchema} from '../lib/inventory';
import {buildWorkbook} from '../lib/export-bookkeeping';
test('local calendar day follows user zone across midnight and DST',()=>{
 const now=new Date('2026-11-08T17:30:00Z');
 assert.equal(localToday('Asia/Jakarta',now),'2026-11-09');
 assert.equal(localToday('America/Los_Angeles',now),'2026-11-08');
 assert.equal(localToday('Pacific/Auckland',now),'2026-11-09');
 assert.equal(localToday('America/New_York',new Date('2026-03-08T04:30:00Z')),'2026-03-07');
 assert.equal(localToday('America/New_York',new Date('2026-03-09T04:30:00Z')),'2026-03-09');
 assert.ok(validTimeZone('Asia/Makassar'));assert.equal(validTimeZone('unknown/zone'),false);
 assert.notEqual(localTimestamp(now,'Asia/Jakarta'),localTimestamp(now,'America/Los_Angeles'));
});
test('stock accepts optional images and rejects invalid references',()=>{
 const stock={date:'2026-11-08',product:'Kaos',variant:'M',quantity:1,direction:'in',notes:'',price:100,cost:60};
 assert.ok(stockSchema.safeParse(stock).success);
 assert.ok(stockSchema.safeParse({...stock,imageId:''}).success);
 const id='b0ab073c-59d1-4d39-a90d-663bd8c82c43';
 assert.equal(stockSchema.parse({...stock,imageId:id}).imageId,id);
 assert.equal(stockSchema.safeParse({...stock,imageId:'https://example.com/image.png'}).success,false);
});
test('export timestamp uses the supplied user zone instead of server zone',async()=>{
 const sheet=(await buildWorkbook([],{name:'Demo',date:'',search:'',timeZone:'Pacific/Honolulu'})).getWorksheet('Transaksi')!;
 assert.match(String(sheet.getCell('A4').value),/(?:GMT-10|HAST|HST)/);
});
