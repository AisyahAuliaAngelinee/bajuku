export function browserTimeZone(){return Intl.DateTimeFormat().resolvedOptions().timeZone||'UTC'}
export function validTimeZone(value:string){try{new Intl.DateTimeFormat('en',{timeZone:value});return true}catch{return false}}
export function localToday(timeZone=browserTimeZone(),now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=(type:string)=>parts.find(p=>p.type===type)!.value;
 return `${part('year')}-${part('month')}-${part('day')}`;
}
export function localTimestamp(value:string|Date,timeZone:string){return new Intl.DateTimeFormat('id-ID',{timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',timeZoneName:'short'}).format(new Date(value))}

export function greetingForHour(hour:number){return hour>=5&&hour<11?'Selamat pagi':hour>=11&&hour<15?'Selamat siang':hour>=15&&hour<18?'Selamat sore':'Selamat malam'}
