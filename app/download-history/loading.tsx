import {TableLoading,Skeleton} from '../ui/table-loading';
export default function Loading(){return <main className="content"><h1>Download History</h1><Skeleton className="skeleton-notice"/><section className="transactions"><Skeleton className="skeleton-title"/><TableLoading/></section></main>}
