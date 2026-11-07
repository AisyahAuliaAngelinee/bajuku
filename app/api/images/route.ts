import {auth} from '@/auth';
import {db} from '@/lib/db';
export const runtime='nodejs';
export async function POST(request:Request){
 const session=await auth();if(!session?.user?.id)return Response.json({error:'Silakan login kembali.'},{status:401});
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Permintaan tidak valid.'},{status:403});
 if(Number(request.headers.get('content-length'))>3*1024*1024+65536)return Response.json({error:'Gambar maksimal 3 MB.'},{status:413});
 try{const form=await request.formData(),file=form.get('image');if(!(file instanceof File)||!file.size||file.size>3*1024*1024)return Response.json({error:'Pilih gambar maksimal 3 MB.'},{status:400});const bytes=Buffer.from(await file.arrayBuffer());
 const png=[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v),jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255,webp=bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP';const type=png?'image/png':jpg?'image/jpeg':webp?'image/webp':null;if(!type)return Response.json({error:'Gunakan JPG, PNG, atau WebP.'},{status:400});
 const id=crypto.randomUUID();await db().query('INSERT INTO transaction_images(id,owner_id,content_type,data) VALUES($1,$2,$3,$4)',[id,session.user.id,type,bytes]);return Response.json({id});
 }catch{return Response.json({error:'Gambar gagal diunggah.'},{status:500});}
}
