import {chartDays,addExcelCharts} from './excel-charts';
import {browserTimeZone,localTimestamp} from './local-time';
import type {Transaction} from './transactions';

export type ExportContext = {name: string; date: string; search: string; timeZone?:string};
const money = (value: number) => new Intl.NumberFormat('id-ID', {maximumFractionDigits: 0}).format(value);
const period = (date: string) => date ? date.split('-').reverse().join('/') : 'Semua tanggal';
const generated = (timeZone=browserTimeZone()) => localTimestamp(new Date(),timeZone);
const summary = (rows: Transaction[]) => rows.reduce((s, r) => ({pieces: s.pieces + r.quantity, revenue: s.revenue + r.quantity * r.price, cost: s.cost + r.quantity * r.cost, profit: s.profit + r.quantity * (r.price - r.cost)}), {pieces: 0, revenue: 0, cost: 0, profit: 0});
const filename = (date: string) => `Baju-Thieo-Pembukuan-${date || 'semua-tanggal'}`;

export async function buildWorkbook(rows: Transaction[], context: ExportContext) {
  const {default: ExcelJS} = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Baju-Thieo';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Transaksi');
  const headers = ['Tanggal', 'No. nota', 'Produk', 'Ukuran / warna', 'Jumlah (pcs)', 'Harga jual / pcs (Rp)', 'Modal / pcs (Rp)', 'Harga total (Rp)', 'Total modal (Rp)', 'Pembayaran', 'Catatan'];
  sheet.columns = [15, 20, 30, 22, 15, 23, 23, 23, 23, 20, 45].map(width => ({width}));
  sheet.addRow(['BAJU THIEO — PEMBUKUAN PENJUALAN']);
  sheet.mergeCells('A1:K1');
  sheet.getRow(1).font = {bold: true, size: 18, color: {argb: 'FF245D48'}};
  sheet.addRow([`Pemilik: ${context.name}`]);
  sheet.addRow([`Periode: ${period(context.date)} | Pencarian: ${context.search || 'Semua transaksi'}`]);
  sheet.addRow([`Dibuat: ${generated(context.timeZone)}`]);
  for (const n of [2, 3, 4]) sheet.mergeCells(`A${n}:K${n}`);
  sheet.addRow([]);
  const header = sheet.addRow(headers);
  header.font = {bold: true, color: {argb: 'FFFFFFFF'}};
  header.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FF245D48'}};
  header.height = 30;
  header.alignment = {vertical: 'middle', wrapText: true};
  rows.forEach(r => {
    const n = sheet.rowCount + 1;
    sheet.addRow([r.date, r.invoice, r.product, r.variant, r.quantity, r.price, r.cost,
      {formula: `E${n}*F${n}`, result: r.quantity * r.price},
      {formula: `E${n}*G${n}`, result: r.quantity * r.cost},
      r.payment, r.notes]);
    sheet.getRow(n).alignment = {vertical: 'top', wrapText: true};
    if (n % 2) sheet.getRow(n).fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFF0F5ED'}};
  });
  const sums = summary(rows), end = sheet.rowCount;
  const total = sheet.addRow(['TOTAL', '', '', '', sums.pieces, '', '', sums.revenue, sums.cost]);
  for (const [col, value] of [[5, sums.pieces], [8, sums.revenue], [9, sums.cost]]) {
    if (rows.length) total.getCell(col).value = {formula: `SUM(${String.fromCharCode(64 + col)}7:${String.fromCharCode(64 + col)}${end})`, result: value};
  }
  total.font = {bold: true};
  total.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFDCE9DB'}};
  for (const col of [5,6,7,8,9]) sheet.getColumn(col).numFmt = '#,##0;[Red](#,##0)';
  sheet.views = [{state: 'frozen', ySplit: 6}];
  sheet.autoFilter = {from: 'A6', to: `K${Math.max(6, end)}`};
  sheet.addRow(['Profit belum termasuk ongkir, biaya admin, dan operasional.']);
  sheet.mergeCells(`A${sheet.rowCount}:K${sheet.rowCount}`);
  sheet.pageSetup = {orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:6'};
  const border={style:'thin' as const,color:{argb:'FFD5DDD5'}};
  for(let r=6;r<=total.number;r++)for(let c=1;c<=11;c++)sheet.getCell(r,c).border={top:r===total.number?{style:'medium',color:{argb:'FF245D48'}}:border,bottom:border,left:border,right:border};
  const graph=workbook.addWorksheet('Grafik');graph.columns=[{width:17},{width:23},{width:23},...Array.from({length:12},()=>({width:10}))];
  graph.mergeCells('A1:O1');graph.getCell('A1').value='Grafik penjualan harian';graph.getCell('A1').font={size:18,bold:true,color:{argb:'FF245D48'}};
  graph.mergeCells('A2:O2');graph.getCell('A2').value=`Periode: ${period(context.date)} · Filter: ${context.search||'Semua transaksi'}`;
  graph.mergeCells('A3:O3');graph.getCell('A3').value='Sumber: transaksi sesuai filter unduhan. Nilai dalam rupiah.';
  graph.getRow(5).values=['Tanggal','Harga total (Rp)','Total modal (Rp)'];
  chartDays(rows).forEach((day,i)=>{const r=i+6;graph.getRow(r).values=[day.date,{formula:`SUMIF(Transaksi!$A$7:$A$${Math.max(7,end)},A${r},Transaksi!$H$7:$H$${Math.max(7,end)})`,result:day.revenue},{formula:`SUMIF(Transaksi!$A$7:$A$${Math.max(7,end)},A${r},Transaksi!$I$7:$I$${Math.max(7,end)})`,result:day.cost}];});
  for(let r=5;r<=Math.max(5,graph.rowCount);r++)for(let c=1;c<=3;c++)graph.getCell(r,c).border={top:border,bottom:border,left:border,right:border};
  graph.getRow(5).font={bold:true,color:{argb:'FFFFFFFF'}};graph.getRow(5).fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF245D48'}};graph.getRow(5).height=26;
  graph.getColumn(2).numFmt='#,##0';graph.getColumn(3).numFmt='#,##0';graph.views=[{state:'frozen',ySplit:5,showGridLines:false}];
  if(!rows.length){graph.getCell('E5').value='Belum ada transaksi sesuai filter.';}
  workbook.calcProperties.fullCalcOnLoad=true;
  return workbook;
}

export async function buildPdf(rows: Transaction[], context: ExportContext) {
  const [{jsPDF}, {default: autoTable}] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({orientation: 'landscape', unit: 'mm', format: 'a4'});
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(36,93,72);
  doc.text('BAJU THIEO | Pembukuan penjualan', 12, 17);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(45); doc.setFontSize(9);
  const metadata = doc.splitTextToSize(`Pemilik: ${context.name}\nPeriode: ${period(context.date)} | Pencarian: ${context.search || 'Semua transaksi'}\nDibuat: ${generated(context.timeZone)}`, 270);
  doc.text(metadata, 12, 25);
  const sums = summary(rows);
  const start = 28 + metadata.length * 4;
  doc.setFontSize(9);
  doc.text(`${rows.length} transaksi | ${money(sums.pieces)} pcs | Harga total: Rp ${money(sums.revenue)} | Modal: Rp ${money(sums.cost)}`, 12, start);
  autoTable(doc, {
    startY: start + 5, margin: {left:12, right:12, top:14, bottom:18},
    head: [['Tanggal', 'Produk / varian / nota / catatan', 'Qty', 'Harga/pcs\n(Rp)', 'Modal/pcs\n(Rp)', 'Harga total\n(Rp)', 'Total modal\n(Rp)', 'Pembayaran']],
    body: rows.length ? rows.map(r => [period(r.date), [r.product, r.variant, r.invoice && `Nota: ${r.invoice}`, r.notes && `Catatan: ${r.notes}`].filter(Boolean).join('\n'), money(r.quantity), money(r.price), money(r.cost), money(r.price*r.quantity), money(r.cost*r.quantity), r.payment]) : [['Tidak ada transaksi sesuai filter.', '', '', '', '', '', '', '']],
    foot: [['TOTAL', '', money(sums.pieces), '', '', money(sums.revenue), money(sums.cost), '']],
    theme:'grid',tableLineColor:[151,169,155],tableLineWidth:0.25,
    showFoot: 'lastPage', styles: {lineColor:[203,213,204],lineWidth:0.15,fontSize: 7, cellPadding: 2, overflow: 'linebreak'},
    headStyles: {fillColor: [36,93,72]}, footStyles: {fillColor: [220,233,219], textColor: [25,45,40]},
    alternateRowStyles: {fillColor: [245,248,242]},
    columnStyles: {0: {cellWidth:21}, 1: {cellWidth:57}, 2:{halign:'right'}, 3:{halign:'right'}, 4:{halign:'right'}, 5:{halign:'right'}, 6:{halign:'right'}, 7:{cellWidth:24}},
  });
  const pages = doc.getNumberOfPages();
  for (let n=1; n<=pages; n++) {
    doc.setPage(n); doc.setFontSize(7); doc.setTextColor(100);
    doc.text('Profit belum termasuk ongkir, biaya admin, dan operasional.', 12, 201);
    doc.text(`Halaman ${n} / ${pages}`, 285, 201, {align:'right'});
  }
  return doc;
}

export async function createBookkeepingFile(format: 'xlsx' | 'pdf', rows: Transaction[], context: ExportContext) {
  let blob: Blob;
  if (format === 'xlsx') {
    const workbook = await buildWorkbook(rows, context);
    const bytes = await addExcelCharts(new Uint8Array(await workbook.xlsx.writeBuffer()),rows);
    blob = new Blob([new Uint8Array(bytes)], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  } else blob = (await buildPdf(rows, context)).output('blob');
  return {blob,filename:`${filename(context.date)}.${format}`};
}

export function saveBlob(blob:Blob, filename:string){
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function downloadBookkeeping(format:'xlsx'|'pdf',rows:Transaction[],context:ExportContext,demo=false,sort?:{key:string;direction:'asc'|'desc'}){
 if(demo){const file=await createBookkeepingFile(format,rows,context);const {saveDemoDownload}=await import('./downloads');await saveDemoDownload({id:crypto.randomUUID(),filename:file.filename,format,count:rows.length,createdAt:new Date().toISOString(),period:context.date||'Semua tanggal',search:context.search,size:file.blob.size,blob:file.blob});saveBlob(file.blob,file.filename);return;}
 const response=await fetch('/api/downloads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({format,date:context.date,search:context.search,sort,timeZone:context.timeZone||browserTimeZone()})});
 const result=await response.json();if(!response.ok)throw Error(result.error||'Unduhan gagal');
 await redownload(result.id,result.filename);
}
export async function redownload(id:string,filename:string){const response=await fetch(`/api/downloads/${id}`);if(!response.ok)throw Error('File gagal diunduh');saveBlob(await response.blob(),filename);}
