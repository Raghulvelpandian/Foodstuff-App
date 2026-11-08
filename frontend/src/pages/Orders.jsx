import {useEffect,useState} from 'react';
import {Link,Navigate} from 'react-router-dom';
import {Package,ChevronRight} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import * as api from '../services/api.js'; import {money,when} from '../lib/format.js';
export default function Orders(){const {user}=useApp(),[o,setO]=useState(null),[err,setErr]=useState('');
  useEffect(()=>{if(user)api.getOrders(user.email).then(setO).catch(e=>setErr(e.message))},[user]);
  if(!user)return<Navigate to="/login" state={{from:'/orders'}} replace/>;
  return(<section className="sec sec--page"><div className="container narrow"><div className="page-h"><h1>My Orders</h1></div>{err&&<p className="alert bad">{err}</p>}
    {!o?<div className="skel" style={{height:120}}/>:!o.length?<div className="empty-s"><Package size={40}/><h4>No orders yet</h4><p>Your orders will show up here.</p><Link className="btn btn--primary" to="/foods">Order something</Link></div>
    :<ul className="olist">{o.map(x=><li key={x.id}><Link className="card orow" to={`/orders/${x.id}`}><div><b>{x.id}</b><small>{when(x.createdAt)} · {x.items.reduce((a,i)=>a+i.qty,0)} items</small></div><span className={`pill ${x.statusIndex<0?'sx':'s'+x.statusIndex}`}>{x.status}</span><b>{money(x.totals.total)}</b><ChevronRight size={18}/></Link></li>)}</ul>}</div></section>)}
