import {z} from 'zod';
export const transactionSchema=z.object({
 date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T00:00:00Z');return !isNaN(d.getTime())&&d.toISOString().slice(0,10)===v},'Tanggal tidak valid'),
 invoice:z.string().trim().max(80),product:z.string().trim().min(1,'Nama baju wajib diisi').max(120),variant:z.string().trim().max(80),
 quantity:z.number().int().min(1).max(10000),price:z.number().int().min(0).max(1000000000),cost:z.number().int().min(0).max(1000000000),
 amountReceived:z.number().int().min(0).max(100000000000000).nullable().optional(),
 payment:z.enum(['Tunai','Transfer bank','QRIS','E-wallet','Kartu','Utang']),notes:z.string().trim().max(500),imageId:z.union([z.string().uuid(),z.literal('')]).default('')
});
export type TransactionInput=z.infer<typeof transactionSchema>;
export type Transaction=TransactionInput&{id:string;createdAt?:string};
export function totals(rows:TransactionInput[]){return rows.reduce((a,r)=>({pieces:a.pieces+r.quantity,revenue:a.revenue+r.quantity*r.price,cost:a.cost+r.quantity*r.cost,profit:a.profit+r.quantity*(r.price-r.cost)}),{pieces:0,revenue:0,cost:0,profit:0});}

/** Legacy paid rows default to their sale total; legacy debt rows default to unpaid. */
export function paymentSummary(row:TransactionInput){
 const total=row.price*row.quantity;
 const received=row.amountReceived??(row.payment==='Utang'?0:total);
 const debt=Math.max(total-received,0),extra=Math.max(received-total,0);
 const status=debt>0?(received===0?'Belum dibayar':'Dibayar sebagian'):extra>0?'Lunas + kelebihan':'Lunas';
 return {total,received,debt,extra,status};
}
