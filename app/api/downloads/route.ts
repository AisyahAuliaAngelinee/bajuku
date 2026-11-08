import {auth} from '@/auth';
import {db,ensureDownloadSchema,listTransactions} from '@/lib/db';
import {createBookkeepingFile} from '@/lib/export-bookkeeping';
import {sortRows} from '@/lib/sorting';
import {z} from 'zod';
export const runtime='nodejs';
const schema=z.object({format:z.enum(['xlsx','pdf']),date:z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/),search:z.string().max(200),sort:z.object({key:z.enum(['invoice','product','date','quantity','price','revenue','payment']),direction:z.enum(['asc','desc'])}).optional()});
export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return Response.json({error:'Silakan login kembali.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Permintaan tidak valid.'},{status:403});
 if(Number(request.headers.get('content-length'))>4096)return Response.json({error:'Permintaan terlalu besar.'},{status:413});
 try{const parsed=schema.safeParse(await request.json());if(!parsed.success)return Response.json({error:'Filter unduhan tidak valid.'},{status:400});const {format,date,search,sort}=parsed.data;
 const rows=sortRows((await listTransactions(session.user.id)).filter(r=>(!date||r.date===date)&&`${r.product} ${r.invoice} ${r.variant}`.toLowerCase().includes(search.toLowerCase())),sort||{key:'date',direction:'desc'},(r,key)=>key==='product'?`${r.product} ${r.invoice}`:key==='revenue'?r.price*r.quantity:r[key as 'invoice'|'date'|'quantity'|'price'|'payment']);
 const {blob,filename}=await createBookkeepingFile(format,rows,{name:session.user.name||'Pemilik toko',date,search});
 if(blob.size>20*1024*1024)return Response.json({error:'File terlalu besar. Persempit filter transaksi.'},{status:413});
 await ensureDownloadSchema();const id=crypto.randomUUID();await db().query('INSERT INTO download_history(id,owner_id,filename,format,transaction_count,period,search,content_type,data) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,session.user.id,filename,format,rows.length,date||'Semua tanggal',search,blob.type,Buffer.from(await blob.arrayBuffer())]);
 return Response.json({id,filename},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'File gagal disiapkan. Silakan coba lagi.'},{status:500})}
}
