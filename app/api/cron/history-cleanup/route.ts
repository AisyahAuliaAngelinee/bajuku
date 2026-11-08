import {purgeExpiredHistory} from '@/lib/db';
export const dynamic='force-dynamic';
// A fixed, idempotent expiry sweep. No caller-controlled scope/cutoff or data response.
export async function GET(){try{await purgeExpiredHistory();return Response.json({ok:true})}catch{return Response.json({error:'Cleanup unavailable'},{status:503})}}
