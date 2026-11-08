import {auth} from '@/auth';
import {db,ensureDownloadSchema} from '@/lib/db';
import {z} from 'zod';
export const runtime='nodejs';
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){
 const session=await auth();if(!session?.user?.id)return new Response('Unauthorized',{status:401});const {id}=await params;if(!z.string().uuid().safeParse(id).success)return new Response('Not found',{status:404});
 await ensureDownloadSchema();const result=await db().query('SELECT filename,content_type,data FROM download_history WHERE owner_id=$1 AND id=$2',[session.user.id,id]);if(!result.rowCount)return new Response('Not found',{status:404});const file=result.rows[0];
 return new Response(new Uint8Array(file.data),{headers:{'Content-Type':file.content_type,'Content-Disposition':`attachment; filename="${file.filename}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
}
