import {auth,signOut} from '@/auth';
import {redirect} from 'next/navigation';
import {listTransactions} from '@/lib/db';
import Dashboard from './ui/dashboard';
export const dynamic='force-dynamic';
export default async function Page(){const session=await auth();if(!session?.user?.id)redirect('/login');let rows;try{rows=await listTransactions(session.user.id);}catch{return <main className="setup"><h1>Penyimpanan belum tersedia</h1><p>Konfigurasi database dan jalankan migrasi sebelum mencatat transaksi.</p><a href="/demo">Lihat demo</a></main>;}return <Dashboard initialRows={rows} name={session.user.name||'Pemilik toko'} logout={<form action={async()=>{'use server';await signOut({redirectTo:'/login'});}}><button className="logout">Keluar</button></form>}/>}
