import {Link} from 'react-router-dom';
import {Star,Clock,Plus,Leaf} from 'lucide-react';
import FoodImg from './FoodImg.jsx'; import QtyStepper from './QtyStepper.jsx'; import {useApp} from '../context/AppContext.jsx'; import {money} from '../lib/format.js';
export default function FoodCard({food:f}){const {add,qtyOf,setQty}=useApp(),q=qtyOf(f.id);
  return(<article className="card fc"><Link to={`/food/${f.id}`} className="fc__img" aria-label={`View ${f.name}`}><FoodImg food={f}/>{f.veg&&<span className="veg"><Leaf size={12}/>Veg</span>}{f.popular&&<span className="pop">Popular</span>}</Link>
    <div className="fc__b"><Link to={`/food/${f.id}`}><h3>{f.name}</h3></Link><p>{f.desc}</p>
      <div className="fc__m"><span><Star size={14} fill="#FF6B35" stroke="none"/>{f.rating} ({f.reviews})</span><span><Clock size={14}/>{f.time} min</span></div>
      <div className="fc__f"><b>{money(f.price)}</b>{q?<QtyStepper qty={q} label={f.name} onChange={n=>setQty(f.id,n)}/>:<button className="btn btn--primary btn--sm" onClick={()=>add(f.id)}><Plus size={14}/>Add</button>}</div></div></article>)}
