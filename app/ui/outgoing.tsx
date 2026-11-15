 'use client';
import {useState} from 'react';
import {useLocalTime} from './use-local-time';
import {localToday} from '@/lib/local-time';
import {dailyOutgoing} from '@/lib/inventory';
import type {Transaction} from '@/lib/transactions';
import {Button} from './controls';
import PaginatedTable from './paginated-table';
import {TableLoading} from './table-loading';
import {Pencil,Trash2} from 'lucide-react';
export default function Outgoing({sales,demo=false,loading=false,onEdit,onDelete}:{sales:Transaction[];demo?:boolean;loading?:boolean;onEdit:(id:string)=>void;onDelete:(id:string)=>void}){
 const {today}=useLocalTime();const [date,setDate]=useState(''),[search,setSearch]=useState('');const day=date||today;
 const rows=dailyOutgoing(sales,day).filter(r=>`${r.product} ${r.variant} ${r.invoice}`.toLowerCase().includes(search.toLowerCase()));
 return <section className="inventory-card" id="outgoing"><div className="section-heading"><div><span className="eyebrow">PERSEDIAAN</span><h2>Barang keluar</h2><p>Hanya penjualan pada tanggal terpilih. Tidak dibawa ke hari berikutnya.</p></div></div><div className="period"><label>Tanggal barang keluar <input type="date" aria-label="Tanggal barang keluar" value={day} onChange={e=>setDate(e.target.value)}/></label><Button onClick={()=>setDate(localToday())}>Hari ini</Button></div><div className="stock-filters"><input aria-label="Cari barang keluar" placeholder="Cari produk, varian, atau nota..." value={search} onChange={e=>setSearch(e.target.value)}/></div><div className="table-scroll" aria-busy={loading}>{loading&&<TableLoading/>}<PaginatedTable demo={demo} label="Barang keluar" resetKey={JSON.stringify([day,search])}><thead><tr><th>PRODUK</th><th>VARIAN</th><th>TANGGAL</th><th>KODE NOTA</th><th>KELUAR (PCS)</th><th>AKSI</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} data-record-label={r.product} data-records={`sale:${r.id}`}><td>{r.product}</td><td><span className="variant-badge">{r.variant||'Tanpa varian'}</span></td><td>{r.date}</td><td>{r.invoice}</td><td className="stock-outgoing">{r.quantity}</td><td><div className="row-actions"><Button disabled={loading} aria-label={`Edit barang keluar ${r.product}`} onClick={()=>onEdit(r.id)}><Pencil size={16}/></Button><Button disabled={loading} aria-label={`Hapus barang keluar ${r.product}`} onClick={()=>onDelete(r.id)}><Trash2 size={16}/></Button></div></td></tr>)}</tbody></PaginatedTable>{!rows.length&&!loading&&<div className="empty">Belum ada barang keluar pada tanggal ini.</div>}</div>{rows.length>0&&<div className="table-footer"><span>Total barang keluar</span><strong className="stock-outgoing">{rows.reduce((n,r)=>n+r.quantity,0)} pcs</strong></div>}</section>
}
