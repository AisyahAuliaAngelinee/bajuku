'use server';
import {auth} from '@/auth';
import {transactionSchema} from '@/lib/transactions';
import {saveTransaction,deleteTransaction} from '@/lib/db';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
export async function mutateTransaction(input:unknown,id?:string){const session=await auth();if(!session?.user?.id)return {error:'Silakan login kembali.'};const parsed=transactionSchema.safeParse(input);if(!parsed.success)return{error:'Periksa tanggal, nama baju, jumlah, dan harga.'};if(id&&!z.uuid().safeParse(id).success)return{error:'ID transaksi tidak valid.'};try{await saveTransaction(session.user.id,parsed.data,id);revalidatePath('/');return{ok:true};}catch{return{error:'Transaksi gagal disimpan. Silakan coba lagi.'};}}
export async function removeTransaction(id:string){const session=await auth();if(!session?.user?.id)return{error:'Silakan login kembali.'};if(!z.uuid().safeParse(id).success)return{error:'ID tidak valid.'};try{await deleteTransaction(session.user.id,id);revalidatePath('/');return{ok:true};}catch{return{error:'Transaksi gagal dihapus.'};}}
