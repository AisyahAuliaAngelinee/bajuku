import {z} from 'zod';
import {transactionSchema,type Transaction} from './transactions';
export const stockSchema=transactionSchema.pick({date:true,product:true,variant:true,quantity:true,notes:true}).extend({direction:z.enum(['in','out'])});
export type StockInput=z.infer<typeof stockSchema>;
export type StockMovement=StockInput&{id:string};
export const productKey=(product:string,variant:string)=>JSON.stringify([product.trim().toLocaleLowerCase('id-ID'),variant.trim().toLocaleLowerCase('id-ID')]);
export function inventorySummary(movements:StockMovement[],sales:Transaction[]){
 const map=new Map<string,{product:string;variant:string;incoming:number;outgoing:number;balance:number}>();
 const add=(r:{product:string;variant:string;quantity:number},incoming:boolean)=>{const key=productKey(r.product,r.variant);const item=map.get(key)??{product:r.product,variant:r.variant,incoming:0,outgoing:0,balance:0};if(incoming)item.incoming+=r.quantity;else item.outgoing+=r.quantity;item.balance=item.incoming-item.outgoing;map.set(key,item)};
 movements.filter(r=>r.direction==='in').forEach(r=>add(r,true));sales.forEach(r=>add(r,false));
 return [...map.values()].sort((a,b)=>a.product.localeCompare(b.product,'id'));
}
export function inventoryHistory(movements:StockMovement[],sales:Transaction[]){return [...movements.map(r=>({...r,source:'manual' as const})),...sales.map(r=>({id:r.id,date:r.date,product:r.product,variant:r.variant,quantity:r.quantity,direction:'out' as const,notes:r.invoice||'Penjualan',source:'sale' as const}))].sort((a,b)=>b.date.localeCompare(a.date));}
