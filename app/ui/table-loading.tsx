import {LoaderCircle} from 'lucide-react';
export function TableLoading({label='Memuat data...'}:{label?:string}){return <div className="table-loading" role="status" aria-live="polite"><LoaderCircle className="loading-spinner" size={18}/><span>{label}</span></div>}
