'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {Shirt,LayoutDashboard,ReceiptText,Package,PanelLeftClose,PanelLeftOpen,Menu,X,History,Download} from 'lucide-react';
import {Button,Modal,Dialog} from './controls';
export const menus=[{id:'overview',label:'Ringkasan',Icon:LayoutDashboard},{id:'transactions',label:'Transaksi harian',Icon:ReceiptText},{id:'inventory',label:'Barang masuk & keluar',Icon:Package},{id:'history',label:'Transaction History',Icon:History},{id:'downloads',label:'Download History',Icon:Download}] as const;
export type MenuId=typeof menus[number]['id'];
export default function Sidebar({name,image,logout,collapsed,onCollapse,active,onSelect,demo=false}:{demo?:boolean;name:string;image?:string;logout?:React.ReactNode;collapsed:boolean;onCollapse:()=>void;active:MenuId;onSelect:(id:MenuId)=>void}){
 const [mobileOpen,setMobileOpen]=useState(false);const [imageFailed,setImageFailed]=useState(false);
 useEffect(()=>{const media=window.matchMedia('(min-width:801px)');const change=()=>{if(media.matches)setMobileOpen(false)};media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[]);
 const root=demo?'/demo':'/';const href=(id:MenuId)=>id==='downloads'?`${demo?'/demo':''}/download-history`:id==='history'?`${demo?'/demo':''}/transaction-history`:`${root}#${id}`;
 const links=(compact:boolean)=><nav aria-label="Menu workspace">{menus.map(({id,label,Icon})=><Button asChild key={id}><Link href={href(id)} className={active===id?'active':''} aria-current={active===id?'location':undefined} title={compact?label:undefined} onClick={()=>{onSelect(id);setMobileOpen(false)}}><Icon size={19} aria-hidden="true"/><span className={compact?'sr-only':''}>{label}</span></Link></Button>)}</nav>;
 const brand=(compact:boolean)=><Link className="brand" href={href("overview")} aria-label="Bajuku — Ringkasan" onClick={()=>{onSelect('overview');setMobileOpen(false)}}><span className="brand-icon"><Shirt size={22}/></span>{!compact&&<span className="brand-word">bajuku<span className="brand-dot">.</span></span>}</Link>;
 const account=(compact:boolean)=><div className={`account ${compact?'account-compact':''}`}><span className="avatar" title={name}>{image&&!imageFailed?<img src={image} alt={`Foto profil ${name}`} referrerPolicy="no-referrer" onError={()=>setImageFailed(true)}/>:name.slice(0,1).toUpperCase()}</span>{!compact&&<div><strong>{name}</strong><small>Akun Google</small></div>}{logout}</div>;
 return <>
  <aside id="desktop-navigation" className={`sidebar floating-sidebar ${collapsed?'is-collapsed':''}`} aria-label="Navigasi utama">
   <div className="sidebar-heading">{brand(collapsed)}<Button className="sidebar-toggle icon-button" onClick={onCollapse} aria-controls="desktop-navigation" aria-label={collapsed?'Perluas sidebar':'Lipat sidebar'} title={collapsed?'Perluas sidebar':'Lipat sidebar'} aria-expanded={!collapsed}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}</Button></div>
   <span className={collapsed?'sr-only':'nav-label'}>WORKSPACE</span>{links(collapsed)}
   {!collapsed&&<div className="sidebar-note"><span className="little-icon"><Shirt size={20}/></span><strong>Setiap pcs berarti.</strong><p>Catatan kecil hari ini,<br/>gambaran usaha esok hari.</p></div>}{account(collapsed)}
  </aside>
  <div className="mobile-brand-bar">{brand(false)}<Button className="mobile-menu-trigger" aria-label="Buka menu navigasi" aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={()=>setMobileOpen(true)}><Menu size={21}/></Button></div>
  <Modal open={mobileOpen} onOpenChange={setMobileOpen} id="mobile-navigation" className="mobile-navigation">
   <Dialog.Title className="sr-only">Menu navigasi</Dialog.Title>
   <div className="mobile-sidebar-content"><div className="sidebar-heading">{brand(false)}<Button className="icon-button" aria-label="Tutup menu navigasi" onClick={()=>setMobileOpen(false)}><X size={22}/></Button></div><span className="nav-label">WORKSPACE</span>{links(false)}{account(false)}</div>
  </Modal>
 </>;
}
