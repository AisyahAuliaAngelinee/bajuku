import type {Transaction} from './transactions';
export type ChartPeriod='day'|'week'|'month'|'year'|'custom';
const iso=(d:Date)=>d.toISOString().slice(0,10);
export function chartRange(period:ChartPeriod,anchor:string,from:string,to:string){
 if(period==='custom')return{from,to};
 const d=new Date(`${anchor}T00:00:00Z`);if(!Number.isFinite(d.getTime()))return{from:'',to:''};
 if(period==='day')return{from:anchor,to:anchor};
 if(period==='week'){d.setUTCDate(d.getUTCDate()-(d.getUTCDay()+6)%7);const start=iso(d);d.setUTCDate(d.getUTCDate()+6);return{from:start,to:iso(d)}}
 if(period==='month')return{from:iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),1))),to:iso(new Date(Date.UTC(d.getUTCFullYear(),d.getUTCMonth()+1,0)))};
 return{from:`${d.getUTCFullYear()}-01-01`,to:`${d.getUTCFullYear()}-12-31`};
}
export function salesSeries(rows:Transaction[],from:string,to:string,monthly=false){
 if(!from||!to||from>to)return[];
 const start=new Date(`${from}T00:00:00Z`),end=new Date(`${to}T00:00:00Z`);
 if(!Number.isFinite(+start)||!Number.isFinite(+end))return[];
 const grouped=monthly||(+end-+start)/86400000>92;
 const totals=new Map<string,{revenue:number;pieces:number}>();
 for(const r of rows)if(r.date>=from&&r.date<=to){const key=grouped?r.date.slice(0,7):r.date;const current=totals.get(key)??{revenue:0,pieces:0};totals.set(key,{revenue:current.revenue+r.price*r.quantity,pieces:current.pieces+r.quantity})}
 if(grouped)start.setUTCDate(1);
 const result=[];
 while(start<=end&&result.length<1200){const key=grouped?iso(start).slice(0,7):iso(start);result.push({key,label:grouped?new Intl.DateTimeFormat('id-ID',{month:'short',year:'2-digit',timeZone:'UTC'}).format(start):new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',timeZone:'UTC'}).format(start),revenue:totals.get(key)?.revenue||0,pieces:totals.get(key)?.pieces||0});if(grouped)start.setUTCMonth(start.getUTCMonth()+1);else start.setUTCDate(start.getUTCDate()+1)}
 return result;
}
