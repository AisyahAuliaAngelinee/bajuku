import {auth} from '@/auth';
import {db} from '@/lib/db';
import {z} from 'zod';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const session=await auth();if(!session?.user?.id)return new Response('Unauthorized',{status:401});const{id}=await params;if(!z.string().uuid().safeParse(id).success)return new Response('Not found',{status:404});const r=await db().query('SELECT content_type,data FROM transaction_images WHERE id=$1 AND owner_id=$2',[id,session.user.id]);if(!r.rowCount)return new Response('Not found',{status:404});return new Response(new Uint8Array(r.rows[0].data),{headers:{'Content-Type':r.rows[0].content_type,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});}
