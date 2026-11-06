import {useEffect,useId,useRef,useState} from 'react';
import {MapPin,LocateFixed,Loader2,Search} from 'lucide-react';
import {searchAddress,reverseGeocode} from '../lib/geocode.js';
// Searchable address combobox. onChange(text) fires while typing; onSelect({label,lat,lon}) when a suggestion/location is chosen.
export default function AddressSearch({id,label,value,onChange,onSelect,error,placeholder='Search your street, building or area',compact}){
  const uid=useId(),list=uid+'-l',[res,setRes]=useState([]),[open,setOpen]=useState(false),[act,setAct]=useState(-1),[busy,setBusy]=useState(false),[msg,setMsg]=useState(''),typed=useRef(false);
  useEffect(()=>{if(!typed.current)return;const q=value.trim();setMsg('');
    if(q.length<3){setRes([]);setBusy(false);return}
    const ac=new AbortController(),t=setTimeout(async()=>{setBusy(true);
      try{const r=await searchAddress(q,ac.signal);setRes(r);setOpen(true);setAct(-1);if(!r.length)setMsg('No matches. You can keep typing your address manually.')}
      catch(e){if(e.name!=='AbortError'){setRes([]);setMsg('Address search is unavailable. Type your full address manually.')}}
      finally{setBusy(false)}},350);
    return()=>{clearTimeout(t);ac.abort()}},[value]);
  const pick=i=>{typed.current=false;onChange(i.label);onSelect?.(i);setOpen(false);setRes([]);setMsg('')};
  const key=e=>{if(!open||!res.length)return;
    if(e.key==='ArrowDown'){e.preventDefault();setAct(a=>(a+1)%res.length)}else if(e.key==='ArrowUp'){e.preventDefault();setAct(a=>(a<=0?res.length:a)-1)}
    else if(e.key==='Enter'&&act>=0){e.preventDefault();pick(res[act])}else if(e.key==='Escape')setOpen(false)};
  const locate=()=>{if(!navigator.geolocation)return setMsg('Location is not supported by this browser.');setBusy(true);setMsg('');
    navigator.geolocation.getCurrentPosition(async p=>{try{pick(await reverseGeocode(p.coords.latitude,p.coords.longitude))}catch(e){setMsg(e.message)}finally{setBusy(false)}},
      ()=>{setBusy(false);setMsg('Location permission denied. Search for your address instead.')},{timeout:10000})};
  return(<div className={`fld addr ${error?'has-err':''}`}>{label&&<label htmlFor={id}>{label}</label>}
    <div className="addr__box"><Search size={16} className="addr__i"/><input id={id} role="combobox" aria-expanded={open&&res.length>0} aria-controls={list} aria-autocomplete="list" aria-activedescendant={act>=0?`${uid}-${act}`:undefined} aria-invalid={!!error}
      autoComplete="off" placeholder={placeholder} value={value} onChange={e=>{typed.current=true;onChange(e.target.value)}} onKeyDown={key} onFocus={()=>res.length&&setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),150)}/>
      {busy&&<Loader2 size={16} className="spin addr__s"/>}</div>
    {open&&res.length>0&&<ul id={list} role="listbox" className="addr__l">{res.map((r,i)=><li key={r.label} id={`${uid}-${i}`} role="option" aria-selected={i===act} className={i===act?'on':''} onMouseDown={e=>{e.preventDefault();pick(r)}} onMouseEnter={()=>setAct(i)}><MapPin size={15}/><span>{r.label}</span></li>)}</ul>}
    {!compact&&<button type="button" className="link addr__loc" onClick={locate}><LocateFixed size={14}/>Use my current location</button>}
    {msg&&<small className="addr__m" role="status">{msg}</small>}{error&&<small role="alert">{error}</small>}</div>)}
