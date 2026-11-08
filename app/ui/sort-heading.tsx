'use client';
import {ArrowDown,ArrowUp,ArrowUpDown} from 'lucide-react';
import {Button} from './controls';
import type {SortState} from '@/lib/sorting';
export function SortHeading({label,column,sort,onSort}:{label:string;column:string;sort:SortState;onSort:(s:SortState)=>void}){const selected=sort.key===column;return <th aria-sort={selected?(sort.direction==='asc'?'ascending':'descending'):'none'}><Button className="sort-heading" onClick={()=>onSort({key:column,direction:selected&&sort.direction==='asc'?'desc':'asc'})}>{label}{selected?(sort.direction==='asc'?<ArrowUp size={13}/>:<ArrowDown size={13}/>):<ArrowUpDown size={13}/>}</Button></th>}
