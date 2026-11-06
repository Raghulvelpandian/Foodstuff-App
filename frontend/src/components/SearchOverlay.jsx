import {useEffect,useRef,useState} from 'react';
import {useNavigate,Link} from 'react-router-dom';
import {Search,X} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import FoodImg from './FoodImg.jsx'; import {money} from '../lib/format.js';
export default function SearchOverlay({open,onClose}){const {foods}=useApp(),[q,setQ]=useState(''),ref=useRef(),nav=useNavigate();
  useEffect(()=>{if(open){setQ('');setTimeout(()=>ref.current?.focus(),50)}const k=e=>e.key==='Escape'&&onClose();addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[open]);
  if(!open)return null;const r=q.trim()?foods.filter(f=>(f.name+f.desc+f.category).toLowerCase().includes(q.toLowerCase())).slice(0,5):[];
  const submit=e=>{e.preventDefault();if(q.trim()){nav(`/foods?q=${encodeURIComponent(q.trim())}`);onClose()}};
  return(<div className="modal modal--top" role="dialog" aria-modal="true" aria-label="Search foods" onClick={onClose}><div className="sbox" onClick={e=>e.stopPropagation()}>
    <form onSubmit={submit} className="sbox__f"><Search size={20}/><input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search burgers, pizza, salads…" aria-label="Search foods"/><button type="button" className="icon-btn" aria-label="Close search" onClick={onClose}><X size={18}/></button></form>
    {q.trim()&&<ul className="sbox__r">{r.length?r.map(f=><li key={f.id}><Link to={`/food/${f.id}`} onClick={onClose}><FoodImg food={f} className="fimg--s"/><span><b>{f.name}</b><small>{f.category}</small></span><em>{money(f.price)}</em></Link></li>):<li className="empty">No matches for “{q}”.</li>}</ul>}</div></div>)}
