import './globals.css';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Bajuku — Buku penjualan harian',description:'Catat penjualan baju, modal per satuan, dan laba kotor setiap hari.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="id"><body>{children}</body></html>}
