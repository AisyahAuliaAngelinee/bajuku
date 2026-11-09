'use client';
import {Children,cloneElement,isValidElement,useEffect,useRef,useState,type ReactElement,type ReactNode} from 'react';
import {Button,Select} from './controls';
import {ChevronLeft,ChevronRight} from 'lucide-react';
export default function PaginatedTable({children,label,resetKey='',unit='baris'}:{children:ReactNode;label:string;resetKey?:string;unit?:string}){
 const [size,setSize]=useState(5),[selection,setSelection]=useState({key:resetKey,page:1});
 const sections=Children.toArray(children);const body=sections.find(el=>isValidElement(el)&&el.type==='tbody') as ReactElement<{children:ReactNode}>|undefined;
 const rows=Children.toArray(body?.props.children),pages=Math.max(1,Math.ceil(rows.length/size));
 const page=Math.min(selection.key===resetKey?selection.page:1,pages),start=(page-1)*size;
 const viewport=useRef<HTMLDivElement>(null);
 useEffect(()=>{const element=viewport.current;if(!element)return;const measure=()=>{const trs=Array.from(element.querySelectorAll('tbody>tr'));const header=element.querySelector('thead')?.getBoundingClientRect().height||0;element.style.maxHeight=trs.length>5?`${Math.ceil(header+trs.slice(0,5).reduce((height,row)=>height+row.getBoundingClientRect().height,0)+2)}px`:'none'};measure();const observer=new ResizeObserver(measure);const table=element.querySelector('table');if(table)observer.observe(table);return()=>observer.disconnect()},[children,page,size]);
 useEffect(()=>{viewport.current?.scrollTo({top:0})},[page,size,resetKey]);
 return <div className="paginated-table"><div className="table-body-scroll" ref={viewport} tabIndex={0} role="region" aria-label={label}><table>{sections.map(section=>section===body?cloneElement(body!,{},rows.slice(start,start+size)):section)}</table></div><div className="pagination" aria-label={`Pagination ${label}`}><div className="page-size"><span>Tampilkan</span><Select label={`Jumlah tampil ${label}`} value={String(size)} onValueChange={value=>{setSize(Number(value));setSelection({key:resetKey,page:1})}} options={[5,15,25,50].map(n=>({value:String(n),label:String(n)}))}/><span>{unit}</span></div><span role="status">{rows.length?start+1:0}–{Math.min(start+size,rows.length)} dari {rows.length}</span><div className="page-buttons"><Button className="icon-button" aria-label={`Halaman sebelumnya ${label}`} disabled={page===1} onClick={()=>setSelection({key:resetKey,page:page-1})}><ChevronLeft size={17}/></Button><span>{page} / {pages}</span><Button className="icon-button" aria-label={`Halaman berikutnya ${label}`} disabled={page===pages} onClick={()=>setSelection({key:resetKey,page:page+1})}><ChevronRight size={17}/></Button></div></div></div>
}
