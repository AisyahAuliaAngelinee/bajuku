import Dashboard from '../ui/dashboard';
import {jakartaToday} from '@/lib/transactions';
export const dynamic='force-dynamic';
export default function Demo(){return <Dashboard demo name="Pemilik toko" initialRows={[{id:'demo-1',date:jakartaToday(),invoice:'INV-001',product:'Essential Cotton Tee',variant:'Hitam / L',quantity:2,price:125000,cost:65000,payment:'QRIS',notes:'',imageId:''},{id:'demo-2',date:jakartaToday(),invoice:'INV-002',product:'Oversized Everyday',variant:'Cream / XL',quantity:1,price:165000,cost:85000,payment:'Transfer bank',notes:'',imageId:''},{id:'demo-3',date:jakartaToday(),invoice:'INV-003',product:'Classic Pocket Tee',variant:'Olive / M',quantity:3,price:110000,cost:55000,payment:'Tunai',notes:'',imageId:''}]}/>}
