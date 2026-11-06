import {useState} from 'react';
import {Link,useParams} from 'react-router-dom';
import {Star,Clock,Flame,Leaf,ChevronLeft,ShoppingBag} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import FoodImg from '../components/FoodImg.jsx'; import QtyStepper from '../components/QtyStepper.jsx'; import FoodCard from '../components/FoodCard.jsx'; import {money} from '../lib/format.js';
export default function FoodDetail(){const {id}=useParams(),{foods,loading,add,setCartOpen}=useApp(),[q,setQ]=useState(1),f=foods.find(x=>String(x.id)===id);
  if(loading)return<div className="container sec sec--page"><div className="skel" style={{height:380}}/></div>;
  if(!f)return<div className="container sec sec--page"><div className="empty-s"><h4>Food not found</h4><Link className="btn btn--primary" to="/foods">Back to menu</Link></div></div>;
  const rel=foods.filter(x=>x.category===f.category&&x.id!==f.id).slice(0,4);
  return(<section className="sec sec--page"><div className="container"><Link to="/foods" className="link back"><ChevronLeft size={16}/>Back to menu</Link>
    <div className="detail"><FoodImg food={f} className="fimg--l"/><div><p className="eyebrow">{f.category.toUpperCase()}</p><h1>{f.name}</h1>
      <div className="fc__m big"><span><Star size={16} fill="#FF6B35" stroke="none"/>{f.rating} ({f.reviews} reviews)</span><span><Clock size={16}/>{f.time} min</span><span><Flame size={16}/>{f.cal} kcal</span>{f.veg&&<span className="g"><Leaf size={16}/>Vegetarian</span>}</div>
      <p className="lead">{f.desc}</p><div className="price">{money(f.price)}</div>
      <div className="row ctr-y"><QtyStepper qty={q} label={f.name} onChange={n=>setQ(Math.max(1,Math.min(20,n)))}/>
        <button className="btn btn--primary" onClick={()=>add(f.id,q)}><ShoppingBag size={16}/>Add to Cart · {money(f.price*q)}</button><button className="btn btn--ghost" onClick={()=>setCartOpen(true)}>View Cart</button></div></div></div>
    {rel.length>0&&<><h2 className="rel">You might also like</h2><div className="foods">{rel.map(r=><FoodCard key={r.id} food={r}/>)}</div></>}</div></section>)}
