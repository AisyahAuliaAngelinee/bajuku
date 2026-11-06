import {z} from 'zod';
export const transactionSchema=z.object({
 date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===v},'Tanggal tidak valid'),
 invoice:z.string().trim().max(80),product:z.string().trim().min(1,'Nama baju wajib diisi').max(120),variant:z.string().trim().max(80),
 quantity:z.number().int().min(1).max(10000),price:z.number().int().min(0).max(1000000000),cost:z.number().int().min(0).max(1000000000),
 payment:z.enum(['Tunai','Transfer bank','QRIS','E-wallet','Kartu']),notes:z.string().trim().max(500)
});
export type TransactionInput=z.infer<typeof transactionSchema>;
export type Transaction=TransactionInput&{id:string};
export function totals(rows:TransactionInput[]){return rows.reduce((a,r)=>({pieces:a.pieces+r.quantity,revenue:a.revenue+r.quantity*r.price,cost:a.cost+r.quantity*r.cost,profit:a.profit+r.quantity*(r.price-r.cost)}),{pieces:0,revenue:0,cost:0,profit:0});}
export function jakartaToday(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());}
