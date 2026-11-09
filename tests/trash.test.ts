import test from 'node:test';
import assert from 'node:assert/strict';
import {addDemoHistory,demoTrash,demoHistory} from '../lib/history';
const store=new Map<string,string>();
Object.defineProperty(globalThis,'sessionStorage',{value:{getItem:(k:string)=>store.get(k)||null,setItem:(k:string,v:string)=>store.set(k,v)},configurable:true});
Object.defineProperty(globalThis,'window',{value:new EventTarget(),configurable:true});
// No archived downloads in these sale/stock fixtures.
Object.defineProperty(globalThis,'indexedDB',{value:{open:()=>{const request:any={};queueMicrotask(()=>{request.result={close(){},transaction(){return {objectStore(){return {getAll(){const req:any={};queueMicrotask(()=>{req.result=[];req.onsuccess()});return req}}}}}};request.onsuccess()});return request}},configurable:true});
const sale={id:'sale-1',product:'Baju',variant:'M / Hitam',quantity:2,price:150000,cost:90000,date:'2026-11-09',createdAt:'2026-11-09T01:00:00Z',invoice:'BAJU-M-HITAM-001',notes:'Lunas',payment:'Tunai',imageId:'image-1'};
const stock={...sale,id:'stock-1',quantity:5,direction:'in'};
test('bulk temporary delete and restore retain complete source records',async()=>{
 store.clear();store.set('bajuku-demo-data',JSON.stringify({rows:[sale],stock:[stock]}));
 await demoTrash([{source:'sale',id:sale.id},{source:'stock',id:stock.id}]);
 assert.deepEqual(JSON.parse(store.get('bajuku-demo-data')!),{rows:[],stock:[]});assert.equal((await demoHistory()).length,2);
 await demoTrash([{source:'sale',id:sale.id},{source:'stock',id:stock.id}],true);
 assert.deepEqual(JSON.parse(store.get('bajuku-demo-data')!),{rows:[sale],stock:[stock]});assert.equal((await demoHistory()).length,0);
});
test('stale bulk selection does not remove valid rows partially',async()=>{
 store.clear();const original=JSON.stringify({rows:[sale],stock:[stock]});store.set('bajuku-demo-data',original);
 await assert.rejects(demoTrash([{source:'sale',id:sale.id},{source:'stock',id:'missing'}]));assert.equal(store.get('bajuku-demo-data'),original);
});
test('History only collects deleted records, and a second restore is rejected',async()=>{
 store.clear();addDemoHistory('sale','created',sale);addDemoHistory('sale','updated',sale);assert.equal(store.size,0);
 store.set('bajuku-demo-data',JSON.stringify({rows:[sale],stock:[]}));await demoTrash([{source:'sale',id:sale.id}]);await demoTrash([{source:'sale',id:sale.id}],true);await assert.rejects(demoTrash([{source:'sale',id:sale.id}],true));assert.equal(JSON.parse(store.get('bajuku-demo-data')!).rows.length,1);
});
