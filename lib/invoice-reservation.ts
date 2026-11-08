import {createHmac,timingSafeEqual} from 'node:crypto';
import {productKey} from './inventory';
function signature(owner:string,product:string,variant:string,invoice:string){const secret=process.env.AUTH_SECRET;if(!secret)throw Error('Auth secret missing');return createHmac('sha256',secret).update(JSON.stringify([owner,productKey(product,variant),invoice])).digest('hex')}
export function signInvoice(owner:string,product:string,variant:string,invoice:string){return signature(owner,product,variant,invoice)}
export function verifyInvoice(owner:string,product:string,variant:string,invoice:string,proof:string){if(!/^[a-f0-9]{64}$/.test(proof))return false;return timingSafeEqual(Buffer.from(proof,'hex'),Buffer.from(signature(owner,product,variant,invoice),'hex'))}
