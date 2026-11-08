import type {Transaction} from './transactions';

export type ExportContext = {name: string; date: string; search: string};
const money = (value: number) => new Intl.NumberFormat('id-ID', {maximumFractionDigits: 0}).format(value);
const period = (date: string) => date ? date.split('-').reverse().join('/') : 'Semua tanggal';
const generated = () => new Intl.DateTimeFormat('id-ID', {dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta'}).format(new Date()) + ' WIB';
const summary = (rows: Transaction[]) => rows.reduce((s, r) => ({pieces: s.pieces + r.quantity, revenue: s.revenue + r.quantity * r.price, cost: s.cost + r.quantity * r.cost, profit: s.profit + r.quantity * (r.price - r.cost)}), {pieces: 0, revenue: 0, cost: 0, profit: 0});
const filename = (date: string) => `Bajuku-Pembukuan-${date || 'semua-tanggal'}`;

export async function buildWorkbook(rows: Transaction[], context: ExportContext) {
  const {default: ExcelJS} = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Bajuku';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet('Transaksi');
  const headers = ['Tanggal', 'No. nota', 'Produk', 'Ukuran / warna', 'Jumlah (pcs)', 'Harga jual / pcs (Rp)', 'Modal / pcs (Rp)', 'Penjualan (Rp)', 'Total modal (Rp)', 'Laba kotor (Rp)', 'Pembayaran', 'Catatan'];
  sheet.columns = [15, 20, 30, 22, 15, 23, 23, 23, 23, 23, 20, 45].map(width => ({width}));
  sheet.addRow(['BAJUKU — PEMBUKUAN PENJUALAN']);
  sheet.mergeCells('A1:L1');
  sheet.getRow(1).font = {bold: true, size: 18, color: {argb: 'FF245D48'}};
  sheet.addRow([`Pemilik: ${context.name}`]);
  sheet.addRow([`Periode: ${period(context.date)} | Pencarian: ${context.search || 'Semua transaksi'}`]);
  sheet.addRow([`Dibuat: ${generated()}`]);
  for (const n of [2, 3, 4]) sheet.mergeCells(`A${n}:L${n}`);
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
      {formula: `H${n}-I${n}`, result: r.quantity * (r.price - r.cost)}, r.payment, r.notes]);
    sheet.getRow(n).alignment = {vertical: 'top', wrapText: true};
    if (n % 2) sheet.getRow(n).fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFF0F5ED'}};
  });
  const sums = summary(rows), end = sheet.rowCount;
  const total = sheet.addRow(['TOTAL', '', '', '', sums.pieces, '', '', sums.revenue, sums.cost, sums.profit]);
  for (const [col, value] of [[5, sums.pieces], [8, sums.revenue], [9, sums.cost], [10, sums.profit]]) {
    if (rows.length) total.getCell(col).value = {formula: `SUM(${String.fromCharCode(64 + col)}7:${String.fromCharCode(64 + col)}${end})`, result: value};
  }
  total.font = {bold: true};
  total.fill = {type: 'pattern', pattern: 'solid', fgColor: {argb: 'FFDCE9DB'}};
  for (const col of [5,6,7,8,9,10]) sheet.getColumn(col).numFmt = '#,##0;[Red](#,##0)';
  sheet.views = [{state: 'frozen', ySplit: 6}];
  sheet.autoFilter = {from: 'A6', to: `L${Math.max(6, end)}`};
  sheet.addRow(['Laba kotor belum termasuk ongkir, biaya admin, dan operasional.']);
  sheet.mergeCells(`A${sheet.rowCount}:L${sheet.rowCount}`);
  sheet.pageSetup = {orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:6'};
  return workbook;
}

export async function buildPdf(rows: Transaction[], context: ExportContext) {
  const [{jsPDF}, {default: autoTable}] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({orientation: 'landscape', unit: 'mm', format: 'a4'});
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor(36,93,72);
  doc.text('BAJUKU | Pembukuan penjualan', 12, 17);
  doc.setFont('helvetica', 'normal'); doc.setTextColor(45); doc.setFontSize(9);
  const metadata = doc.splitTextToSize(`Pemilik: ${context.name}\nPeriode: ${period(context.date)} | Pencarian: ${context.search || 'Semua transaksi'}\nDibuat: ${generated()}`, 270);
  doc.text(metadata, 12, 25);
  const sums = summary(rows);
  const start = 28 + metadata.length * 4;
  doc.setFontSize(9);
  doc.text(`${rows.length} transaksi | ${money(sums.pieces)} pcs | Penjualan: Rp ${money(sums.revenue)} | Modal: Rp ${money(sums.cost)} | Laba kotor: Rp ${money(sums.profit)}`, 12, start);
  autoTable(doc, {
    startY: start + 5, margin: {left:12, right:12, top:14, bottom:18},
    head: [['Tanggal', 'Produk / varian / nota / catatan', 'Qty', 'Harga/pcs\n(Rp)', 'Modal/pcs\n(Rp)', 'Penjualan\n(Rp)', 'Total modal\n(Rp)', 'Laba kotor\n(Rp)', 'Pembayaran']],
    body: rows.length ? rows.map(r => [period(r.date), [r.product, r.variant, r.invoice && `Nota: ${r.invoice}`, r.notes && `Catatan: ${r.notes}`].filter(Boolean).join('\n'), money(r.quantity), money(r.price), money(r.cost), money(r.price*r.quantity), money(r.cost*r.quantity), money((r.price-r.cost)*r.quantity), r.payment]) : [['Tidak ada transaksi sesuai filter.', '', '', '', '', '', '', '', '']],
    foot: [['TOTAL', '', money(sums.pieces), '', '', money(sums.revenue), money(sums.cost), money(sums.profit), '']],
    showFoot: 'lastPage', styles: {fontSize: 7, cellPadding: 2, overflow: 'linebreak'},
    headStyles: {fillColor: [36,93,72]}, footStyles: {fillColor: [220,233,219], textColor: [25,45,40]},
    alternateRowStyles: {fillColor: [245,248,242]},
    columnStyles: {0: {cellWidth:21}, 1: {cellWidth:57}, 2:{halign:'right'}, 3:{halign:'right'}, 4:{halign:'right'}, 5:{halign:'right'}, 6:{halign:'right'}, 7:{halign:'right'}, 8:{cellWidth:24}},
  });
  const pages = doc.getNumberOfPages();
  for (let n=1; n<=pages; n++) {
    doc.setPage(n); doc.setFontSize(7); doc.setTextColor(100);
    doc.text('Laba kotor belum termasuk ongkir, biaya admin, dan operasional.', 12, 201);
    doc.text(`Halaman ${n} / ${pages}`, 285, 201, {align:'right'});
  }
  return doc;
}

export async function createBookkeepingFile(format: 'xlsx' | 'pdf', rows: Transaction[], context: ExportContext) {
  let blob: Blob;
  if (format === 'xlsx') {
    const workbook = await buildWorkbook(rows, context);
    const bytes = await workbook.xlsx.writeBuffer();
    blob = new Blob([new Uint8Array(bytes)], {type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  } else blob = (await buildPdf(rows, context)).output('blob');
  return {blob,filename:`${filename(context.date)}.${format}`};
}

export function saveBlob(blob:Blob, filename:string){
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function downloadBookkeeping(format:'xlsx'|'pdf',rows:Transaction[],context:ExportContext,demo=false,sort?:{key:string;direction:'asc'|'desc'}){
 if(demo){const file=await createBookkeepingFile(format,rows,context);const {saveDemoDownload}=await import('./downloads');await saveDemoDownload({id:crypto.randomUUID(),filename:file.filename,format,count:rows.length,createdAt:new Date().toISOString(),period:context.date||'Semua tanggal',search:context.search,size:file.blob.size,blob:file.blob});saveBlob(file.blob,file.filename);return;}
 const response=await fetch('/api/downloads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({format,date:context.date,search:context.search,sort})});
 const result=await response.json();if(!response.ok)throw Error(result.error||'Unduhan gagal');
 await redownload(result.id,result.filename);
}
export async function redownload(id:string,filename:string){const response=await fetch(`/api/downloads/${id}`);if(!response.ok)throw Error('File gagal diunduh');saveBlob(await response.blob(),filename);}
