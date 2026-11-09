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
test('Excel exports bordered tables and two native charts with daily totals',async()=>{
 const file=await createBookkeepingFile('xlsx',[row,{...row,id:'second',quantity:1}],{name:'Demo',date:'',search:''});
 const bytes=await file.blob.arrayBuffer();const {default:ExcelJS}=await import('exceljs');const book=new ExcelJS.Workbook();await book.xlsx.load(bytes);
 const sheet=book.getWorksheet('Transaksi')!,graph=book.getWorksheet('Grafik')!;
 assert.equal(sheet.getCell('A7').border.left?.style,'thin');assert.equal(sheet.getCell('K9').border.top?.style,'medium');
 assert.equal(graph.getCell('B6').result,360000);assert.equal(graph.getCell('C6').result,225000);assert.match(graph.getCell('B6').formula,/SUMIF/);
 const {default:JSZip}=await import('jszip');const zip=await JSZip.loadAsync(bytes);
 for(const [n,kind] of [[1,'line'],[2,'bar']] as const){const chart=await zip.file(`xl/charts/chart${n}.xml`)!.async('string');assert.match(chart,new RegExp(`<c:${kind}Chart>`));assert.match(chart,/<c:legendPos val="b"/);assert.match(chart,/<c:v>360000<\/c:v>/);assert.match(chart,/<c:v>225000<\/c:v>/);}
 assert.match(await zip.file('xl/worksheets/sheet2.xml')!.async('string'),/drawing r:id="rIdCharts"/);
});
test('empty Excel chart export has no fabricated sales points',async()=>{
 const file=await createBookkeepingFile('xlsx',[],{name:'Demo',date:'',search:''});const {default:JSZip}=await import('jszip');const zip=await JSZip.loadAsync(await file.blob.arrayBuffer());
 assert.match(await zip.file('xl/charts/chart1.xml')!.async('string'),/<c:ptCount val="0"/);
});
