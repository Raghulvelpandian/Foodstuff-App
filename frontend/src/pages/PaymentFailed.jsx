import {useEffect,useState} from 'react';
import {Link,Navigate,useNavigate,useParams} from 'react-router-dom';
import {CreditCard,Banknote,Loader2,AlertTriangle} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import * as api from '../services/api.js'; import {money} from '../lib/format.js';
export default function PaymentFailed(){
  const {id}=useParams(),{user,notify}=useApp(),nav=useNavigate(),[o,setO]=useState(null),[err,setErr]=useState(''),[busy,setBusy]=useState('');
  useEffect(()=>{if(user)api.getOrder(id).then(setO).catch(e=>setErr(e.message))},[id,user]);
  if(!user)return<Navigate to="/login" state={{from:`/payment-failed/${id}`}} replace/>;
  const pay=async m=>{setBusy(m);setErr('');try{await api.changePayment(id,m);notify(m==='cod'?'Switched to cash on delivery':'Payment restarted');nav(`/orders/${id}`)}catch(e){setErr(e.message)}finally{setBusy('')}};
  if(!o)return<div className="container sec sec--page">{err?<div className="empty-s"><h4>{err}</h4><Link className="btn btn--primary" to="/orders">My orders</Link></div>:<div className="skel" style={{height:260}}/>}</div>;
  const failed=o.paymentStatus==='Failed';
  return(<section className="sec sec--page"><div className="container narrow"><div className="card auth form ctr" style={{maxWidth:560}}>
    <AlertTriangle size={44} style={{color:failed?'#b42318':'var(--g)'}}/><h1>{failed?'Payment did not go through':'No payment problem'}</h1>
    {failed?<><p className="muted">We could not complete the online payment for order <b>{o.id}</b> ({money(o.totals.total)}). Your order is on hold, and you have not been charged for a failed payment. Choose what to do next:</p>
      {err&&<p className="alert bad" role="alert">{err}</p>}
      <button className="btn btn--primary btn--block" disabled={!!busy} onClick={()=>pay('online')}>{busy==='online'?<Loader2 size={16} className="spin"/>:<CreditCard size={16}/>}Try online payment again</button>
      <button className="btn btn--ghost btn--block" disabled={!!busy} onClick={()=>pay('cod')}>{busy==='cod'?<Loader2 size={16} className="spin"/>:<Banknote size={16}/>}Pay cash on delivery instead</button>
      <p className="muted">Charged but still seeing this? <Link className="link" to="/refunds">Read our refund policy</Link> and contact us with your order number.</p></>
    :<><p className="muted">Order {o.id} does not have a failed payment right now.</p><Link className="btn btn--primary btn--block" to={`/orders/${o.id}`}>View order</Link></>}</div></div></section>)}
