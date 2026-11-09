import test from 'node:test';
import assert from 'node:assert/strict';
import {createBookkeepingFile} from '../lib/export-bookkeeping';
import type {Transaction} from '../lib/transactions';
const row:Transaction={id:'demo',date:'2026-11-08',invoice:'K-M-NA-001',product:'Kaos',variant:'M',quantity:2,price:120000,cost:75000,payment:'Tunai',notes:'Lunas',imageId:''};
test('archived Excel retains original values after the source changes',async()=>{
 const source={...row};const file=await createBookkeepingFile('xlsx',[source],{name:'Demo',date:row.date,search:''});source.price=1;
 const {default:ExcelJS}=await import('exceljs');const book=new ExcelJS.Workbook();await book.xlsx.load(await file.blob.arrayBuffer());const sheet=book.getWorksheet('Transaksi')!;
 assert.equal(sheet.getCell('H6').value,'Harga total (Rp)');assert.equal(sheet.getCell('J6').value,'Pembayaran');assert.equal(sheet.columnCount,11);
 assert.equal(sheet.getCell('B7').value,row.invoice);assert.equal(sheet.getCell('F7').value,120000);assert.equal(sheet.getCell('K7').value,'Lunas');assert.equal(file.filename,'Baju-Thieo-Pembukuan-2026-11-08.xlsx');
});
test('PDF archive is a valid binary document, including an empty filtered export',async()=>{
 const file=await createBookkeepingFile('pdf',[],{name:'Demo',date:'',search:'Tidak ada'});const bytes=new Uint8Array(await file.blob.arrayBuffer());assert.equal(new TextDecoder().decode(bytes.slice(0,5)),'%PDF-');assert.equal(file.blob.type,'application/pdf');assert.equal(file.filename,'Baju-Thieo-Pembukuan-semua-tanggal.pdf');
});
