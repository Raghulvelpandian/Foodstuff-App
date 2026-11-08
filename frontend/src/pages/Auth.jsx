import {useState} from 'react';
import {Link,useNavigate,useLocation} from 'react-router-dom';
import {Loader2,UtensilsCrossed,Info} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import {CONFIG} from '../config.js';
export default function Auth({mode}){const signup=mode==='signup',{login,signup:doSignup,notify}=useApp(),nav=useNavigate(),loc=useLocation();
  const [v,setV]=useState({name:'',email:'',phone:'',password:''}),[e,setE]=useState({}),[busy,setBusy]=useState(false),[err,setErr]=useState('');
  const on=ev=>{setV({...v,[ev.target.name]:ev.target.value});setE({...e,[ev.target.name]:''})};
  async function submit(ev){ev.preventDefault();if(busy)return;const x={};
    if(signup&&!v.name.trim())x.name='Enter your name.';if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))x.email='Enter a valid email address.';if(v.password.length<8)x.password='Password must be at least 8 characters.';
    setE(x);if(Object.keys(x).length)return;setBusy(true);setErr('');
    try{const u=await(signup?doSignup:login)(v);notify(`Welcome${u.name?', '+u.name.split(' ')[0]:''}!`);nav(loc.state?.from||'/',{replace:true})}catch(er){setErr(er.message)}finally{setBusy(false)}}
  const F=({n,l,t='text',ac,ph})=><div className={`fld ${e[n]?'has-err':''}`}><label htmlFor={n}>{l}</label><input id={n} name={n} type={t} autoComplete={ac} placeholder={ph} value={v[n]} onChange={on} aria-invalid={!!e[n]}/>{e[n]&&<small role="alert">{e[n]}</small>}</div>;
  return(<section className="sec sec--page"><div className="container"><form className="card auth form" onSubmit={submit} noValidate><span className="logo__i auth__i"><UtensilsCrossed size={22}/></span>
    <h1>{signup?'Create your account':'Welcome back'}</h1><p className="muted">{signup?'Order faster and track every delivery.':'Log in to check out and track your orders.'}</p>
    {signup&&F({n:"name",l:"Full name",ac:"name",ph:"Your name"})}{F({n:"email",l:"Email",t:"email",ac:"email",ph:"you@example.com"})}{signup&&F({n:"phone",l:"Phone (optional)",t:"tel",ac:"tel",ph:"+1 555 000 0000"})}
    {F({n:"password",l:"Password",t:"password",ac:signup?'new-password':'current-password',ph:"At least 8 characters"})}
    {!signup&&<Link className="link" to="/forgot-password" style={{justifySelf:'end'}}>Forgot password?</Link>}
    {!CONFIG.apiUrl&&<p className="alert dev"><Info size={16}/>Demo mode: any valid email and a password of 8+ characters will sign you in. Accounts live in this browser only.</p>}
    {err&&<p className="alert bad" role="alert">{err}</p>}<button className="btn btn--primary btn--block" disabled={busy}>{busy?<><Loader2 size={16} className="spin"/>Please wait…</>:signup?'Sign Up':'Log In'}</button>
    {signup&&<p className="muted legal-note">By signing up you agree to our <Link className="link" to="/privacy">Privacy Policy</Link> and <Link className="link" to="/refunds">Refund &amp; Cancellation Policy</Link>.</p>}
    <p className="ctr muted">{signup?'Already have an account?':'New to Foodstuff?'} <Link className="link" to={signup?'/login':'/signup'} state={loc.state}>{signup?'Log in':'Create an account'}</Link></p></form></div></section>)}
