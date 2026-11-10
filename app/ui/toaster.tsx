'use client';
import {Toast} from '@animate-ui/react/primitives/base-ui/toast';
import {useEffect,useState,type ReactNode} from 'react';
import {usePathname} from 'next/navigation';
import {CheckCircle2,AlertCircle,Info,X} from 'lucide-react';
export const toastManager=Toast.createToastManager();
export function notify(message:string,type:'success'|'error'|'info'='success'){if(message)toastManager.add({title:message,type,timeout:type==='error'?7000:4500});}
export function useFeedbackState(type:'success'|'error'='success'){
 const [value,setValue]=useState('');
 return [value,(message:string)=>{setValue(message);if(message)notify(message,type)}] as const;
}
function ToastList(){const {toasts}=Toast.useToastManager();return toasts.map(item=><Toast.Root key={item.id} toast={item} className={`activity-toast ${item.type||'info'}`}><Toast.Content className="activity-toast-content">{item.type==='error'?<AlertCircle size={21}/>:item.type==='success'?<CheckCircle2 size={21}/>:<Info size={21}/>}<div><Toast.Title className="activity-toast-title"/><Toast.Description/></div><Toast.Close className="activity-toast-close" aria-label="Tutup notifikasi"><X size={18}/></Toast.Close></Toast.Content></Toast.Root>)}
export default function Toaster({children,signedIn}:{children:ReactNode;signedIn:boolean}){
 const path=usePathname();
 useEffect(()=>{const url=new URL(location.href),status=url.searchParams.get('activity');if(status==='login'&&signedIn)notify('Berhasil masuk. Selamat datang!');if(status==='logout'&&!signedIn)notify('Berhasil keluar dari akun.');if(url.searchParams.has('error'))notify('Login gagal atau dibatalkan. Silakan coba kembali.','error');if(status||url.searchParams.has('error')){url.searchParams.delete('activity');url.searchParams.delete('error');history.replaceState(history.state,'',url.pathname+url.search+url.hash)}},[path,signedIn]);
 return <Toast.Provider toastManager={toastManager} limit={3}><div onSubmitCapture={event=>{const kind=(event.target as HTMLFormElement).dataset.authAction;if(kind)notify(kind==='login'?'Menghubungkan ke Google...':'Sedang keluar dari akun...','info')}}>{children}</div><Toast.Portal><Toast.Viewport className="activity-toast-viewport"><ToastList/></Toast.Viewport></Toast.Portal></Toast.Provider>
}
