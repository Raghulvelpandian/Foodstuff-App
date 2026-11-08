import {useEffect,useState} from 'react';
import {Link,useParams,Navigate} from 'react-router-dom';
import {Check,ChefHat,Bike,PackageCheck,ChevronLeft,XCircle,AlertTriangle,Loader2} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import * as api from '../services/api.js'; import {money,when} from '../lib/format.js';
const ICONS=[Check,ChefHat,Bike,PackageCheck],NOTE=['We received your order.','The kitchen is preparing your food.','Your order is on its way.','Delivered. Enjoy your meal!'];
export default function OrderTracking(){const {id}=useParams(),{user,notify}=useApp(),[o,setO]=useState(null),[err,setErr]=useState(''),[ask,setAsk]=useState(false),[busy,setBusy]=useState(false),[cerr,setCerr]=useState('');
  useEffect(()=>{if(!user)return;let on=true,t;const tick=()=>api.getOrder(id).then(x=>{if(!on)return;setO(x);if(x.statusIndex>=0&&x.statusIndex<3)t=setTimeout(tick,4000)}).catch(e=>on&&setErr(e.message));tick();return()=>{on=false;clearTimeout(t)}},[id,user]);
  if(!user)return<Navigate to="/login" state={{from:`/orders/${id}`}} replace/>;
  if(err)return<div className="container sec sec--page"><div className="empty-s"><h4>{err}</h4><Link className="btn btn--primary" to="/orders">My orders</Link></div></div>;
  if(!o)return<div className="container sec sec--page"><div className="skel" style={{height:300}}/></div>;
  const cancelled=o.statusIndex<0,failed=o.paymentStatus==='Failed'&&!cancelled,eta=o.estimatedDelivery&&o.statusIndex>=0&&o.statusIndex<3;
  const doCancel=async()=>{setBusy(true);setCerr('');try{setO(await api.cancelOrder(o.id));setAsk(false);notify('Order cancelled')}catch(e){setCerr(e.message)}finally{setBusy(false)}};
  return(<section className="sec sec--page"><div className="container narrow"><Link to="/orders" className="link back"><ChevronLeft size={16}/>All orders</Link>
    <div className="page-h"><h1>Order {o.id}</h1><p className="muted">Placed {when(o.createdAt)}</p></div>
    {failed&&<div className="alert bad pf" role="alert"><AlertTriangle size={18}/><div><b>Payment failed.</b> Your order is on hold until payment is sorted out.</div><Link className="btn btn--primary btn--sm" to={`/payment-failed/${o.id}`}>Fix payment</Link></div>}
    <div className="card trk">{cancelled?<><p className="trk__n"><XCircle size={20} style={{color:'#b42318',verticalAlign:'-4px'}}/> This order was cancelled.</p>
        {o.paymentStatus==='Refunded'?<p className="muted">Your payment is being refunded to your original payment method. See the <Link className="link" to="/refunds">refund policy</Link> for timing.</p>:<p className="muted">No payment was taken for this order.</p>}</>
      :<><p className="trk__n" aria-live="polite">{NOTE[o.statusIndex]}</p>
        <ol className="trk__s">{api.STEPS.map((s,i)=>{const I=ICONS[i];return(<li key={s} className={i<o.statusIndex?'done':i===o.statusIndex?'cur':''}><span><I size={18}/></span><b>{s}</b></li>)})}</ol>
        {eta&&<p className="muted">Estimated delivery: <b>{when(o.estimatedDelivery)}</b>. See <Link className="link" to="/delivery">delivery information</Link>.</p>}
        {o.statusIndex<3&&<small className="muted">Status updates automatically.</small>}
        {o.cancellable&&(!ask?<button className="btn btn--ghost btn--sm" style={{justifySelf:'start'}} onClick={()=>setAsk(true)}>Cancel order</button>
          :<div className="alert dev" style={{display:'grid',gap:10}}><span>Cancel this order? You can only do this before the kitchen starts preparing it.</span>{cerr&&<span className="err" role="alert">{cerr}</span>}
            <span className="row"><button className="btn btn--primary btn--sm" disabled={busy} onClick={doCancel}>{busy?<Loader2 size={14} className="spin"/>:null}Yes, cancel order</button><button className="btn btn--ghost btn--sm" onClick={()=>setAsk(false)}>Keep order</button></span></div>)}
        {!o.cancellable&&o.statusIndex>0&&o.statusIndex<3&&<small className="muted">Preparation has started, so this order can no longer be cancelled online. <Link className="link" to="/refunds">Cancellation policy</Link></small>}</>}</div>
    <div className="card form"><h3>Items</h3><ul className="sum">{o.items.map(i=><li key={i.id}><span>{i.name} × {i.qty}</span><b>{money(i.price*i.qty)}</b></li>)}</ul>
      <div className="cdrawer__f"><p><span>Subtotal</span><b>{money(o.totals.subtotal)}</b></p>{o.totals.discount>0&&<p className="g"><span>Promo</span><b>−{money(o.totals.discount)}</b></p>}<p><span>Delivery</span><b>{o.totals.delivery?money(o.totals.delivery):'Free'}</b></p><p className="tot"><span>Total</span><b>{money(o.totals.total)}</b></p></div>
      <p className="muted"><b>Deliver to:</b> {o.address}<br/><b>Payment:</b> {o.payment}{o.paymentStatus?` (${o.paymentStatus})`:''}</p></div></div></section>)}
