import {auth,signOut} from '@/auth';
import {redirect} from 'next/navigation';
import {listHistory} from '@/lib/db';
import HistoryPage from '../ui/history-page';
import {Button} from '../ui/controls';
export const dynamic='force-dynamic';
export default async function Page(){const session=await auth();if(!session?.user?.id)redirect('/login');const rows=await listHistory(session.user.id);return <HistoryPage initialRows={rows} name={session.user.name||'Pemilik toko'} image={session.user.image||undefined} logout={<form action={async()=>{'use server';await signOut({redirectTo:'/login'})}}><Button className="logout">Keluar</Button></form>}/>}
