import {TableLoading} from './ui/table-loading';
export default function Loading(){return <main className="loading-page"><h1>Memuat pembukuan</h1>{['Barang masuk & keluar','Transaksi harian'].map(label=><section className="transactions" key={label}><h2>{label}</h2><TableLoading/><div className="table-skeleton"/></section>)}</main>}
