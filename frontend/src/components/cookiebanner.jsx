import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {Cookie,X} from 'lucide-react';
import {useConsent} from '../context/Consent.jsx';
export default function CookieBanner(){
  const {consent,save,open,setOpen}=useConsent(),[pref,setPref]=useState(consent.preferences);
  useEffect(()=>{if(open)setPref(consent.preferences)},[open]);
  useEffect(()=>{if(!open)return;const k=e=>e.key==='Escape'&&setOpen(false);addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[open]);
  if(open)return(<div className="modal" role="dialog" aria-modal="true" aria-labelledby="ck-t" onClick={()=>setOpen(false)}><div className="ck card" onClick={e=>e.stopPropagation()}>
    <button className="icon-btn ck__x" aria-label="Close" onClick={()=>setOpen(false)}><X size={20}/></button>
    <h2 id="ck-t">Cookie preferences</h2><p className="muted">Choose what this site may store in your browser. Details are in our <Link to="/cookies" onClick={()=>setOpen(false)}>Cookie Policy</Link>.</p>
    <ul className="ck__l">
      <li><div><b>Strictly necessary</b><p>Keeps you logged in, remembers your cart and your cookie choice, and keeps the site secure. Always on.</p></div><input type="checkbox" checked disabled aria-label="Strictly necessary, always on"/></li>
      <li><div><b>Preferences</b><p>Remembers your chosen delivery location for next time.</p></div><input type="checkbox" checked={pref} onChange={e=>setPref(e.target.checked)} aria-label="Preferences"/></li>
      <li><div><b>Analytics</b><p>Not used. We do not run analytics or advertising trackers on this site.</p></div><input type="checkbox" checked={false} disabled aria-label="Analytics, not used"/></li></ul>
    <div className="row"><button className="btn btn--primary" onClick={()=>save({preferences:pref})}>Save choices</button><button className="btn btn--ghost" onClick={()=>save({preferences:true})}>Accept all</button></div></div></div>);
  if(consent.decided)return null;
  return(<div className="cb card" role="region" aria-label="Cookie notice"><Cookie size={22} className="cb__i"/><p>We store a few things in your browser to run the site (login, cart). With your OK we also remember your delivery location. See our <Link to="/cookies">Cookie Policy</Link>.</p>
    <div className="row"><button className="btn btn--primary btn--sm" onClick={()=>save({preferences:true})}>Accept all</button><button className="btn btn--ghost btn--sm" onClick={()=>save({preferences:false})}>Necessary only</button><button className="btn btn--ghost btn--sm" onClick={()=>setOpen(true)}>Customise</button></div></div>);
}
