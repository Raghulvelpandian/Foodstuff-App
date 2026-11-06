import {createContext,useContext,useEffect,useMemo,useState,useCallback} from 'react';
import {APP} from '../config.js'; import * as api from '../services/api.js'; import {CATEGORIES} from '../data/foods.js';
const Ctx=createContext(null);export const useApp=()=>useContext(Ctx);
const load=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
export function AppProvider({children}){
  const [cats,setCats]=useState(CATEGORIES),[foods,setFoods]=useState([]),[loading,setLoading]=useState(true),[err,setErr]=useState('');
  const [cart,setCart]=useState(()=>load('fs:cart',[])),[user,setUser]=useState(()=>load('fs:user',null)),[promo,setPromo]=useState(()=>load('fs:promo',null));
  const [location,setLocation]=useState(()=>load('fs:loc','Your Location')),[cartOpen,setCartOpen]=useState(false),[toast,setToast]=useState(null);
  useEffect(()=>{api.getFoods().then(setFoods).catch(e=>setErr(e.message)).finally(()=>setLoading(false))},[]);
  useEffect(()=>{api.getCategories().then(setCats).catch(()=>{})},[]);
  useEffect(()=>{const f=()=>{setUser(null);setToast({m:'Session expired. Please log in again.',k:Date.now()})};addEventListener('fs:logout',f);return()=>removeEventListener('fs:logout',f)},[]);
  useEffect(()=>{localStorage.setItem('fs:cart',JSON.stringify(cart))},[cart]);
  useEffect(()=>{localStorage.setItem('fs:user',JSON.stringify(user))},[user]);
  useEffect(()=>{localStorage.setItem('fs:promo',JSON.stringify(promo))},[promo]);
  useEffect(()=>{localStorage.setItem('fs:loc',JSON.stringify(location))},[location]);
  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),2600);return()=>clearTimeout(t)},[toast]);
  const notify=useCallback(m=>setToast({m,k:Date.now()}),[]);
  const lines=useMemo(()=>cart.map(c=>({food:foods.find(f=>f.id===c.id),qty:c.qty})).filter(l=>l.food),[cart,foods]);
  const count=cart.reduce((a,c)=>a+c.qty,0);
  const totals=useMemo(()=>{const subtotal=lines.reduce((a,l)=>a+l.food.price*l.qty,0),discount=promo?+(subtotal*APP.promoPercent/100).toFixed(2):0;
    const delivery=!lines.length||subtotal-discount>=APP.freeDeliveryOver?0:APP.deliveryFee;return{subtotal,discount,delivery,total:subtotal-discount+delivery}},[lines,promo]);
  const add=(id,q=1)=>{setCart(c=>c.some(x=>x.id===id)?c.map(x=>x.id===id?{...x,qty:Math.min(20,x.qty+q)}:x):[...c,{id,qty:q}]);const f=foods.find(f=>f.id===id);notify(`${f?.name||'Item'} added to cart`)};
  const setQty=(id,q)=>setCart(c=>q<=0?c.filter(x=>x.id!==id):c.map(x=>x.id===id?{...x,qty:Math.min(20,q)}:x));
  const qtyOf=id=>cart.find(c=>c.id===id)?.qty||0;
  const applyPromo=code=>{if(code.trim().toUpperCase()===APP.promoCode){setPromo(APP.promoCode);return''}return'That promo code is not valid.'};
  const auth=fn=>async d=>{const u=await fn(d);setUser(u);return u};
  const value={foods,loading,err,cats,cart,lines,count,totals,promo,add,setQty,qtyOf,clear:()=>setCart([]),applyPromo,removePromo:()=>setPromo(null),
    user,login:auth(api.login),signup:auth(api.signup),logout:()=>{api.logout();setUser(null);notify('Signed out')},location,setLocation,cartOpen,setCartOpen,toast,notify};
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
