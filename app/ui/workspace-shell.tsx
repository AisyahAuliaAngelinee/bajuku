'use client';
import {usePathname} from 'next/navigation';
import {useState,useEffect} from 'react';
import Sidebar,{type MenuId} from './sidebar';
export default function WorkspaceShell({children,name,image,logout}:{children:React.ReactNode;name:string;image?:string;logout:React.ReactNode}){
 const path=usePathname(),[collapsed,setCollapsed]=useState(false),[hash,setHash]=useState('overview');
 useEffect(()=>{const sync=()=>setHash(location.hash.split('#').filter(Boolean)[0]||'overview');sync();window.addEventListener('hashchange',sync);return()=>window.removeEventListener('hashchange',sync)},[path]);
 if(path==='/login')return children;
 const demo=path.startsWith('/demo');const active:MenuId=path.endsWith('/download-history')?'downloads':path.endsWith('/transaction-history')?'history':['overview','inventory','transactions'].includes(hash)?hash as MenuId:'overview';
 return <div className={`shell ${collapsed?'sidebar-collapsed':''}`}><Sidebar name={demo?'Pemilik toko':name} image={demo?undefined:image} logout={demo?undefined:logout} demo={demo} collapsed={collapsed} onCollapse={()=>setCollapsed(v=>!v)} active={active} onSelect={setHash}/><div className="workspace">{children}</div></div>
}
