export function invoicePrefix(product:string,variant:string){
 const clean=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]/g,'');
 const words=product.trim().split(/\s+/);const model=(words.length>1?words.map(w=>clean(w)[0]||'').join(''):clean(product)).slice(0,12)||'MODEL';
 const parts=variant.split('/').map(s=>s.trim()).filter(Boolean);
 const sizeIndex=parts.findIndex(s=>/^(?:[2-6]?X[SL]|XX[SL]|[SML]|ALL\s*SIZE|ONE\s*SIZE|\d{1,3})$/i.test(s));
 const size=sizeIndex>=0?clean(parts[sizeIndex]):'OS';
 const color=clean(parts.filter((_,i)=>i!==sizeIndex).join(' ')).slice(0,18)||'NA';
 return `${model}-${size}-${color}`;
}
export function formatInvoice(prefix:string,number:number){if(number<1||number>999)throw Error('Nomor untuk model dan varian ini sudah mencapai 999.');return `${prefix}-${String(number).padStart(3,'0')}`;}
