import {useMemo,useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {Search,SearchX,Leaf,SlidersHorizontal} from 'lucide-react';
import FoodCard from '../components/FoodCard.jsx'; import {useApp} from '../context/AppContext.jsx'; import {money} from '../lib/format.js';
const SORTS={recommended:null,popular:(a,b)=>b.reviews-a.reviews,rating:(a,b)=>b.rating-a.rating,price_asc:(a,b)=>a.price-b.price,price_desc:(a,b)=>b.price-a.price,fastest:(a,b)=>a.time-b.time};
export default function Explore({popular=false}){
  const {foods,cats,loading,err}=useApp(),[sp,setSp]=useSearchParams(),[fo,setFo]=useState(false);
  const q=sp.get('q')||'',cat=sp.get('cat')||'all',veg=sp.get('veg')==='1',sort=sp.get('sort')||(popular?'popular':'recommended'),max=Number(sp.get('max'))||0;
  const set=(k,v)=>{const n=new URLSearchParams(sp);v?n.set(k,v):n.delete(k);setSp(n,{replace:true})};
  const top=Math.ceil(Math.max(0,...foods.map(f=>f.price)))||20,t=q.trim().toLowerCase();
  const base=useMemo(()=>foods.filter(f=>(!popular||f.popular)&&(!veg||f.veg)&&(!max||f.price<=max)&&(!t||(f.name+' '+f.desc+' '+f.category).toLowerCase().includes(t))),[foods,popular,veg,max,t]);
  const list=useMemo(()=>{const l=base.filter(f=>cat==='all'||f.category===cat);return SORTS[sort]?[...l].sort(SORTS[sort]):l},[base,cat,sort]);
  const active=q||cat!=='all'||veg||max;
  return(<section className="sec sec--page"><div className="container"><div className="page-h"><h1>{popular?'Popular Foods':'Explore Foods'}</h1><p className="muted">{popular?'Customer favourites, ranked by reviews.':'Fresh meals from local kitchens, ready when you are.'}</p></div>
    <button className="btn btn--ghost filters-btn" onClick={()=>setFo(!fo)} aria-expanded={fo}><SlidersHorizontal size={16}/>Filters{active?' •':''}</button>
    <div className="explore"><aside className={`filters card ${fo?'open':''}`} aria-label="Filters"><div className="filters__h"><h3>Filters</h3>{active&&<button className="link" onClick={()=>setSp(popular?{}:{})}>Clear all</button>}</div>
      <label className="tb-search"><Search size={18}/><input type="search" value={q} onChange={e=>set('q',e.target.value)} placeholder="Search foods" aria-label="Search foods"/></label>
      <h4>Category</h4><ul className="flist"><li><button className={cat==='all'?'on':''} onClick={()=>set('cat','')}>All<span>{base.length}</span></button></li>
        {cats.map(c=><li key={c.id}><button className={cat===c.id?'on':''} onClick={()=>set('cat',c.id)}>{c.emoji} {c.name}<span>{base.filter(f=>f.category===c.id).length}</span></button></li>)}</ul>
      <h4>Diet</h4><label className="check"><input type="checkbox" checked={veg} onChange={e=>set('veg',e.target.checked?'1':'')}/><Leaf size={14}/>Vegetarian only</label>
      <h4>Max price <b>{max?money(max):'Any'}</b></h4><input type="range" min="3" max={top} step="1" value={max||top} aria-label="Maximum price" onChange={e=>set('max',+e.target.value>=top?'':e.target.value)}/>
      <h4>Sort by</h4><select aria-label="Sort foods" value={sort} onChange={e=>set('sort',e.target.value)}><option value="recommended">Recommended</option><option value="popular">Most reviewed</option><option value="rating">Top rated</option><option value="fastest">Fastest</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select></aside>
      <div className="explore__r">{err&&<p className="alert bad">{err}</p>}
        {loading?<div className="foods">{[0,1,2,3,4,5].map(i=><div key={i} className="skel sk-card"/>)}</div>:list.length?<><p className="muted count" aria-live="polite">{list.length} item{list.length>1?'s':''}{cat!=='all'&&` in ${cats.find(c=>c.id===cat)?.name||cat}`}</p><div className="foods">{list.map(f=><FoodCard key={f.id} food={f}/>)}</div></>
        :<div className="empty-s"><SearchX size={40}/><h4>No foods found</h4><p>Try a different search or clear your filters.</p><button className="btn btn--ghost" onClick={()=>setSp({})}>Clear filters</button></div>}</div></div></div></section>)}
