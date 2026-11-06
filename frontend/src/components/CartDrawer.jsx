import {useEffect} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {X,ShoppingBag,Trash2} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import FoodImg from './FoodImg.jsx'; import QtyStepper from './QtyStepper.jsx'; import {money} from '../lib/format.js'; import {APP} from '../config.js';
export default function CartDrawer(){const {cartOpen,setCartOpen,lines,totals,setQty,count}=useApp(),nav=useNavigate();
  useEffect(()=>{const k=e=>e.key==='Escape'&&setCartOpen(false);if(cartOpen)addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[cartOpen]);
  const go=p=>{setCartOpen(false);nav(p)};
  return(<><div className={`panel-bg ${cartOpen?'on':''}`} onClick={()=>setCartOpen(false)}/>
    <aside className={`cdrawer ${cartOpen?'on':''}`} role="dialog" aria-label="Shopping cart" aria-hidden={!cartOpen}>
      <div className="cdrawer__h"><h3>Your Cart <small>({count})</small></h3><button className="icon-btn" aria-label="Close cart" onClick={()=>setCartOpen(false)}><X size={20}/></button></div>
      {!lines.length?<div className="empty-s"><ShoppingBag size={40}/><h4>Your cart is empty</h4><p>Add something delicious to get started.</p><button className="btn btn--primary" onClick={()=>go('/foods')}>Browse Foods</button></div>:<>
        <ul className="cdrawer__l">{lines.map(({food:f,qty})=><li key={f.id}><FoodImg food={f} className="fimg--s"/><div><b>{f.name}</b><small>{money(f.price)}</small><QtyStepper qty={qty} label={f.name} onChange={n=>setQty(f.id,n)}/></div>
          <div className="cdrawer__r"><b>{money(f.price*qty)}</b><button className="icon-btn" aria-label={`Remove ${f.name}`} onClick={()=>setQty(f.id,0)}><Trash2 size={16}/></button></div></li>)}</ul>
        <div className="cdrawer__f"><p><span>Subtotal</span><b>{money(totals.subtotal)}</b></p>{totals.discount>0&&<p className="g"><span>Promo</span><b>−{money(totals.discount)}</b></p>}
          <p><span>Delivery</span><b>{totals.delivery?money(totals.delivery):'Free'}</b></p>{totals.delivery>0&&<small>Free delivery over {money(APP.freeDeliveryOver)}</small>}
          <p className="tot"><span>Total</span><b>{money(totals.total)}</b></p><button className="btn btn--primary btn--block" onClick={()=>go('/checkout')}>Checkout</button>
          <Link to="/foods" className="link ctr" onClick={()=>setCartOpen(false)}>Continue shopping</Link></div></>}</aside></>)}
