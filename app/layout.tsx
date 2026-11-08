import './globals.css';
import {auth,signOut} from '@/auth';
import WorkspaceShell from './ui/workspace-shell';
import type {Metadata} from 'next';
export const metadata:Metadata={title:'Bajuku — Buku penjualan harian',description:'Catat penjualan baju, modal per satuan, dan laba kotor setiap hari.'};
export default async function Layout({children}:{children:React.ReactNode}){const session=await auth();return <html lang="id"><body><WorkspaceShell name={session?.user?.name||'Pemilik toko'} image={session?.user?.image||undefined} logout={<form action={async()=>{'use server';await signOut({redirectTo:'/login'})}}><button className="logout">Keluar</button></form>}>{children}</WorkspaceShell></body></html>}
