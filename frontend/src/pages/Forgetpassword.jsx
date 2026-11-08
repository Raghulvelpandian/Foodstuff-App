import {useState} from 'react';
import {Link} from 'react-router-dom';
import {Loader2,KeyRound,CheckCircle2} from 'lucide-react';
import * as api from '../services/api.js';
export default function ForgotPassword(){
  const [email,setEmail]=useState(''),[err,setErr]=useState(''),[done,setDone]=useState(''),[busy,setBusy]=useState(false);
  async function submit(e){e.preventDefault();if(busy)return;if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))return setErr('Enter a valid email address.');
    setBusy(true);setErr('');try{setDone(await api.forgotPassword(email.trim()))}catch(er){setErr(er.message)}finally{setBusy(false)}}
  return(<section className="sec sec--page"><div className="container"><form className="card auth form" onSubmit={submit} noValidate><span className="logo__i auth__i"><KeyRound size={22}/></span>
    <h1>Forgot your password?</h1>{done?<><p className="alert ok" role="status"><CheckCircle2 size={16}/>{done}</p><p className="muted">The link works for 1 hour. Check your spam folder if you do not see it.</p><Link className="btn btn--ghost btn--block" to="/login">Back to log in</Link></>
    :<><p className="muted">Enter your account email and we will send you a link to choose a new password.</p>
      <div className={`fld ${err?'has-err':''}`}><label htmlFor="email">Email</label><input id="email" type="email" autoComplete="email" value={email} onChange={e=>{setEmail(e.target.value);setErr('')}} placeholder="you@example.com" aria-invalid={!!err}/>{err&&<small role="alert">{err}</small>}</div>
      <button className="btn btn--primary btn--block" disabled={busy}>{busy?<><Loader2 size={16} className="spin"/>Sending…</>:'Send reset link'}</button><p className="ctr"><Link className="link" to="/login">Back to log in</Link></p></>}</form></div></section>)}
