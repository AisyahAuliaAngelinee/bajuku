import {z} from 'zod';
import {transactionSchema,type Transaction} from './transactions';
export const stockSchema=transactionSchema.pick({date:true,product:true,variant:true,quantity:true,notes:true}).extend({direction:z.enum(['in','out']),imageId:transactionSchema.shape.imageId.optional(),price:transactionSchema.shape.price.nullable().optional(),cost:transactionSchema.shape.cost.nullable().optional()});
export type StockInput=z.infer<typeof stockSchema>;
export type StockMovement=StockInput&{id:string;createdAt?:string};
export const productKey=(product:string,variant:string)=>JSON.stringify([product.trim().toLocaleLowerCase('id-ID'),variant.trim().toLocaleLowerCase('id-ID')]);
export function inventorySummary(movements:StockMovement[],sales:Transaction[],asOf?:string){
 const map=new Map<string,{product:string;variant:string;incoming:number;outgoing:number;balance:number;createdAt:string}>();
 const add=(r:{product:string;variant:string;quantity:number;createdAt?:string},incoming:boolean)=>{const key=productKey(r.product,r.variant);const item=map.get(key)??{product:r.product,variant:r.variant,incoming:0,outgoing:0,balance:0,createdAt:r.createdAt||''};if((r.createdAt||'')>item.createdAt)item.createdAt=r.createdAt!;if(incoming)item.incoming+=r.quantity;else item.outgoing+=r.quantity;item.balance=item.incoming-item.outgoing;map.set(key,item)};
 movements.filter(r=>r.direction==='in'&&(!asOf||r.date<=asOf)).forEach(r=>add(r,true));sales.filter(r=>!asOf||r.date<=asOf).forEach(r=>add(r,false));
 return [...map.values()].sort((a,b)=>a.product.localeCompare(b.product,'id'));
}
export function inventoryHistory(movements:StockMovement[],sales:Transaction[]){return [...movements.map(r=>({...r,source:'manual' as const})),...sales.map(r=>({id:r.id,date:r.date,product:r.product,variant:r.variant,quantity:r.quantity,direction:'out' as const,notes:r.invoice||'Penjualan',source:'sale' as const}))].sort((a,b)=>b.date.localeCompare(a.date));}

export function latestStockPrice(stock:StockMovement[],product:string,variant:string){return stock.filter(r=>r.direction==='in'&&productKey(r.product,r.variant)===productKey(product,variant)).sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''))[0]}

export function groupProducts(rows:ReturnType<typeof inventorySummary>){
 const groups=new Map<string,{key:string;product:string;variants:typeof rows;incoming:number;outgoing:number;balance:number}>();
 for(const row of rows){const key=row.product.trim().toLocaleLowerCase('id-ID');const group=groups.get(key)||{key,product:row.product,variants:[],incoming:0,outgoing:0,balance:0};group.variants.push(row);group.incoming+=row.incoming;group.outgoing+=row.outgoing;group.balance+=row.balance;groups.set(key,group)}
 return [...groups.values()];
}
