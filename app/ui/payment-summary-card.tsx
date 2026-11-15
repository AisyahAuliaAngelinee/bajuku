import {paymentSummary,type TransactionInput} from '@/lib/transactions';

const money=(value:number)=>Number.isFinite(value)?new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(value):'—';

export default function PaymentSummaryCard({row}:{row:TransactionInput}){
 const receipt=paymentSummary(row);
 const valid=[receipt.total,receipt.received,row.quantity,row.price].every(n=>Number.isFinite(n)&&n>=0)&&row.quantity>0;
 return <section className="payment-summary" aria-label="Rincian transaksi" aria-live="polite">
  <div className="payment-summary-heading"><h3>Rincian transaksi</h3><span className={valid&&receipt.debt>0?'stock-outgoing':'positive'}>{valid?receipt.status:'Lengkapi nominal'}</span></div>
  <p>{row.product||'Pilih produk'} · {row.variant||'Tanpa varian'}</p>
  <dl>
   <div><dt>Jumlah × harga / pcs</dt><dd>{Number.isFinite(row.quantity)?row.quantity:'—'} pcs × {money(row.price)}</dd></div>
   <div><dt>Total belanja</dt><dd>{money(receipt.total)}</dd></div>
   <div><dt>Uang diterima</dt><dd>{money(receipt.received)}</dd></div>
   <div><dt>Sisa utang</dt><dd className={valid&&receipt.debt>0?'stock-outgoing':''}>{money(receipt.debt)}</dd></div>
   <div><dt>Kelebihan tanpa kembalian</dt><dd>{money(receipt.extra)}</dd></div>
  </dl>
  <small>Harga total dan profit barang mengikuti harga jual. Kelebihan pembayaran dicatat terpisah.</small>
 </section>;
}
