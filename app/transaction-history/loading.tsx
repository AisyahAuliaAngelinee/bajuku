import {TableLoading} from '../ui/table-loading';
export default function Loading(){return <main className="loading-page"><h1>Transaction History</h1><section className="transactions"><TableLoading label="Memuat riwayat transaksi..."/><div className="table-skeleton"/></section></main>}
