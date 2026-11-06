import {useEffect,useState} from 'react';
import {Link,useParams,Navigate} from 'react-router-dom';
import {Check,ChefHat,Bike,PackageCheck,ChevronLeft} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import * as api from '../services/api.js'; import {money,when} from '../lib/format.js';
const ICONS=[Check,ChefHat,Bike,PackageCheck],NOTE=['We received your order.','The kitchen is preparing your food.','Your order is on its way.','Delivered. Enjoy your meal!'];
export default function OrderTracking(){const {id}=useParams(),{user}=useApp(),[o,setO]=useState(null),[err,setErr]=useState('');
  useEffect(()=>{if(!user)return;let on=true,t;const tick=()=>api.getOrder(id).then(x=>{if(!on)return;setO(x);if(x.statusIndex<3)t=setTimeout(tick,4000)}).catch(e=>on&&setErr(e.message));tick();return()=>{on=false;clearTimeout(t)}},[id,user]);
  if(!user)return<Navigate to="/login" state={{from:`/orders/${id}`}} replace/>;
  if(err)return<div className="container sec sec--page"><div className="empty-s"><h4>{err}</h4><Link className="btn btn--primary" to="/orders">My orders</Link></div></div>;
  if(!o)return<div className="container sec sec--page"><div className="skel" style={{height:300}}/></div>;
  return(<section className="sec sec--page"><div className="container narrow"><Link to="/orders" className="link back"><ChevronLeft size={16}/>All orders</Link>
    <div className="page-h"><h1>Order {o.id}</h1><p className="muted">Placed {when(o.createdAt)}</p></div>
    <div className="card trk"><p className="trk__n" aria-live="polite">{NOTE[o.statusIndex]}</p>
      <ol className="trk__s">{api.STEPS.map((s,i)=>{const I=ICONS[i];return(<li key={s} className={i<o.statusIndex?'done':i===o.statusIndex?'cur':''}><span><I size={18}/></span><b>{s}</b></li>)})}</ol>
      {o.statusIndex<3&&<small className="muted">Status updates automatically. (Demo timing; live data comes from your Django order API.)</small>}</div>
    <div className="card form"><h3>Items</h3><ul className="sum">{o.items.map(i=><li key={i.id}><span>{i.name} × {i.qty}</span><b>{money(i.price*i.qty)}</b></li>)}</ul>
      <div className="cdrawer__f"><p><span>Subtotal</span><b>{money(o.totals.subtotal)}</b></p>{o.totals.discount>0&&<p className="g"><span>Promo</span><b>−{money(o.totals.discount)}</b></p>}<p><span>Delivery</span><b>{o.totals.delivery?money(o.totals.delivery):'Free'}</b></p><p className="tot"><span>Total</span><b>{money(o.totals.total)}</b></p></div>
      <p className="muted"><b>Deliver to:</b> {o.address}<br/><b>Payment:</b> {o.payment}</p></div></div></section>)}
