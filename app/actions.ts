'use server';
import {signInvoice,verifyInvoice} from '@/lib/invoice-reservation';
import {productKey} from '@/lib/inventory';
import {auth} from '@/auth';
import {transactionSchema} from '@/lib/transactions';
import {saveTransaction,deleteTransaction,saveStock,deleteStock,reserveInvoice,listStock,deleteHistory} from '@/lib/db';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {stockSchema} from '@/lib/inventory';
export async function mutateTransaction(input:unknown,id?:string,proof=''){const session=await auth();if(!session?.user?.id)return {error:'Silakan login kembali.'};const parsed=transactionSchema.safeParse(input);if(!parsed.success)return{error:'Periksa tanggal, nama baju, jumlah, dan harga.'};if(id&&!z.uuid().safeParse(id).success)return{error:'ID transaksi tidak valid.'};if(!id&&!verifyInvoice(session.user.id,parsed.data.product,parsed.data.variant,parsed.data.invoice,proof))return{error:'Preview nota belum siap. Pilih ulang model dan varian.'};try{await saveTransaction(session.user.id,parsed.data,id);revalidatePath('/');revalidatePath('/transaction-history');return{ok:true};}catch{return{error:'Transaksi gagal disimpan. Silakan coba lagi.'};}}
export async function removeTransaction(id:string){const session=await auth();if(!session?.user?.id)return{error:'Silakan login kembali.'};if(!z.uuid().safeParse(id).success)return{error:'ID tidak valid.'};try{await deleteTransaction(session.user.id,id);revalidatePath('/');revalidatePath('/transaction-history');return{ok:true};}catch{return{error:'Transaksi gagal dihapus.'};}}

export async function mutateStock(input:unknown,id?:string){const session=await auth();if(!session?.user?.id)return{error:'Silakan login kembali.'};const parsed=stockSchema.safeParse(input);if(!parsed.success||parsed.data.direction!=='in')return{error:'Periksa tanggal, produk, dan jumlah barang masuk.'};if(id&&!z.string().uuid().safeParse(id).success)return{error:'ID tidak valid.'};try{await saveStock(session.user.id,parsed.data,id);revalidatePath('/');revalidatePath('/transaction-history');return{ok:true};}catch{return{error:'Pergerakan gagal disimpan.'};}}

export async function removeStock(id:string){const session=await auth();if(!session?.user?.id)return{error:'Silakan login kembali.'};if(!z.uuid().safeParse(id).success)return{error:'ID tidak valid.'};try{await deleteStock(session.user.id,id);revalidatePath('/');revalidatePath('/transaction-history');return{ok:true};}catch{return{error:'Barang masuk gagal dihapus.'};}}

export async function previewInvoice(product:string,variant:string){const session=await auth();if(!session?.user?.id)return{error:'Silakan login kembali.'};if(product.length>120||variant.length>80)return{error:'Produk tidak valid.'};try{const stock=await listStock(session.user.id);if(!stock.some(r=>r.direction==='in'&&productKey(r.product,r.variant)===productKey(product,variant)))return{error:'Pilih produk dan varian dari barang masuk.'};const invoice=await reserveInvoice(session.user.id,product,variant);return{invoice,proof:signInvoice(session.user.id,product,variant,invoice)};}catch{return{error:'Preview nota tidak tersedia atau nomor varian telah mencapai 999.'};}}

export async function removeHistory(id:string){const session=await auth();if(!session?.user?.id)return{error:'Silakan login kembali.'};if(!z.uuid().safeParse(id).success)return{error:'ID riwayat tidak valid.'};try{await deleteHistory(session.user.id,id);revalidatePath('/transaction-history');return{ok:true};}catch{return{error:'Riwayat gagal dihapus.'}}}
