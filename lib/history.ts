export type HistoryEntry={id:string;sourceId:string;source:'sale'|'stock'|'download';action:'created'|'updated'|'deleted';product:string;variant:string;quantity:number;direction:string;notes:string;invoice:string;occurredAt:string;payload?:Record<string,unknown>};
export const HISTORY_DAYS=30;
export const historyAction={created:'Ditambahkan',updated:'Diedit',deleted:'Dihapus'};
export const historyKind={sale:'Transaksi harian',stock:'Barang masuk',download:'Unduhan'};
export function recentHistory(rows:HistoryEntry[],now=Date.now()){return rows.filter(r=>new Date(r.occurredAt).getTime()>now-HISTORY_DAYS*86400000)}
export function addDemoHistory(source:'sale'|'stock',action:HistoryEntry['action'],row:{id:string;product:string;variant:string;quantity:number;notes:string;invoice?:string;direction?:string}){if(action!=='deleted')return;const rows=JSON.parse(sessionStorage.getItem('bajuku-demo-history')||'[]') as HistoryEntry[];sessionStorage.setItem('bajuku-demo-history',JSON.stringify(recentHistory([{...row,id:row.id,sourceId:row.id,source,action,payload:{...row},invoice:row.invoice||'',direction:source==='sale'?'out':row.direction||'in',occurredAt:new Date().toISOString()},...rows])))}
export type TrashRecord={source:HistoryEntry['source'];id:string};
export const recordKey=(source:TrashRecord['source'],id:string)=>`${source}:${id}`;
export async function demoTrash(records:TrashRecord[],restore=false){
 const data=JSON.parse(sessionStorage.getItem('bajuku-demo-data')||'{"rows":[],"stock":[]}');let history=recentHistory(JSON.parse(sessionStorage.getItem('bajuku-demo-history')||'[]')) as HistoryEntry[];
 const {listDemoDownloads,saveDemoDownload}=await import('./downloads');const files=await listDemoDownloads(true);
 // Validate the whole selection before changing any source rows.
 for(const r of records){if(r.source==='download'){if(!files.some(f=>f.id===r.id&&!!f.deletedAt===restore))throw Error('Arsip tidak tersedia.');}else if(restore?!history.some(h=>h.source===r.source&&h.id===r.id&&h.payload):!data[r.source==='sale'?'rows':'stock'].some((x:{id:string})=>x.id===r.id))throw Error('Data tidak tersedia.');}
 for(const r of records){if(r.source==='download'){const file=files.find(f=>f.id===r.id)!;await saveDemoDownload({...file,deletedAt:restore?undefined:new Date().toISOString()});continue;}const key=r.source==='sale'?'rows':'stock';if(restore){const entry=history.find(h=>h.id===r.id&&h.source===r.source)!;if(data[key].some((x:{id:string})=>x.id===r.id))throw Error('Data sudah dipulihkan.');data[key].push(entry.payload);history=history.filter(h=>h!==entry);}else{const row=data[key].find((x:{id:string})=>x.id===r.id);history.unshift({...row,id:row.id,sourceId:row.id,source:r.source,action:'deleted',payload:{...row},invoice:row.invoice||'',direction:r.source==='sale'?'out':'in',occurredAt:new Date().toISOString()});data[key]=data[key].filter((x:{id:string})=>x.id!==r.id);}}
 sessionStorage.setItem('bajuku-demo-data',JSON.stringify(data));sessionStorage.setItem('bajuku-demo-history',JSON.stringify(history));window.dispatchEvent(new Event('baju-data-changed'));
}
export async function demoHistory(){const {listDemoDownloads}=await import('./downloads');const files=await listDemoDownloads(true);const rows=recentHistory(JSON.parse(sessionStorage.getItem('bajuku-demo-history')||'[]') as HistoryEntry[]).filter(r=>r.action==='deleted'&&r.payload);sessionStorage.setItem('bajuku-demo-history',JSON.stringify(rows));return [...rows,...files.filter(f=>f.deletedAt).map(f=>({id:f.id,sourceId:f.id,source:'download' as const,action:'deleted' as const,product:f.filename,variant:f.format,quantity:f.count,direction:'',notes:'',invoice:'',occurredAt:f.deletedAt!}))];}

export async function permanentlyDeleteDemo(records:TrashRecord[]){
 const history=await demoHistory();
 if(records.some(r=>!history.some(h=>h.source===r.source&&h.sourceId===r.id)))throw Error('Data tidak tersedia di History.');
 const {deleteDemoDownloads}=await import('./downloads');
 const ids=records.filter(r=>r.source==='download').map(r=>r.id);if(ids.length)await deleteDemoDownloads(ids);
 sessionStorage.setItem('bajuku-demo-history',JSON.stringify(history.filter(h=>h.source!=='download'&&!records.some(r=>r.source===h.source&&r.id===h.sourceId))));window.dispatchEvent(new Event('baju-data-changed'));
}
