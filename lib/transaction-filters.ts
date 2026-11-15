import {z} from 'zod';
import {transactionSchema,type Transaction} from './transactions';
const optionalDate=z.union([transactionSchema.shape.date,z.literal('')]).default('');
export const transactionDateFilterSchema=z.object({date:optionalDate,dateFrom:optionalDate,dateTo:optionalDate}).refine(r=>!r.dateFrom||!r.dateTo||r.dateFrom<=r.dateTo,{message:'Tanggal akhir harus sama atau setelah tanggal awal.'});
export type TransactionFilter={date?:string;dateFrom?:string;dateTo?:string;search?:string};
export function filterTransactions(rows:Transaction[],filter:TransactionFilter){
 const {date='',dateFrom='',dateTo='',search=''}=filter;
 if(!transactionDateFilterSchema.safeParse({date,dateFrom,dateTo}).success)return [];
 return rows.filter(r=>(!date||r.date===date)&&(!dateFrom||r.date>=dateFrom)&&(!dateTo||r.date<=dateTo)&&`${r.product} ${r.invoice} ${r.variant}`.toLowerCase().includes(search.toLowerCase()));
}
export function transactionPeriod(filter:TransactionFilter){
 const display=(date:string)=>date.split('-').reverse().join('/');
 if(filter.dateFrom||filter.dateTo)return `${filter.dateFrom?display(filter.dateFrom):'Awal'} – ${filter.dateTo?display(filter.dateTo):'Terakhir'}`;
 return filter.date?display(filter.date):'Semua tanggal';
}
