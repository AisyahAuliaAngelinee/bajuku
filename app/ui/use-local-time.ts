'use client';
import {useEffect,useState} from 'react';
import {browserTimeZone,localToday,greetingForHour} from '@/lib/local-time';
// Empty first render keeps server HTML identical to hydration in any time zone.
export function useLocalTime(){
 const [clock,setClock]=useState({timeZone:'',today:'',greeting:'Halo'});
 useEffect(()=>{const sync=()=>{const timeZone=browserTimeZone(),today=localToday(timeZone),greeting=greetingForHour(new Date().getHours());setClock(old=>old.timeZone===timeZone&&old.today===today&&old.greeting===greeting?old:{timeZone,today,greeting})};sync();const timer=setInterval(sync,30000);window.addEventListener('focus',sync);return()=>{clearInterval(timer);window.removeEventListener('focus',sync)}},[]);
 return clock;
}
