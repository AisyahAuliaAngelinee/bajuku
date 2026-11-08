export type SortState={key:string;direction:'asc'|'desc'};
export function sortRows<T>(rows:T[],sort:SortState,value:(row:T,key:string)=>string|number){return [...rows].sort((a,b)=>{const x=value(a,sort.key),y=value(b,sort.key);const n=typeof x==='number'&&typeof y==='number'?x-y:String(x).localeCompare(String(y),'id',{numeric:true,sensitivity:'base'});return sort.direction==='asc'?n:-n})}
