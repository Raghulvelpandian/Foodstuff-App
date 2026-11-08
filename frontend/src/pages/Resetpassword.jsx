import {useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Loader2,KeyRound,CheckCircle2} from 'lucide-react';
import * as api from '../services/api.js';
export default function ResetPassword(){
  const [sp]=useSearchParams(),uid=sp.get('uid')||'',token=sp.get('token')||'';
  const [pw,setPw]=useState(''),[pw2,setPw2]=useState(''),[e,setE]=useState({}),[err,setErr]=useState(''),[done,setDone]=useState(''),[busy,setBusy]=useState(false);
  async function submit(ev){ev.preventDefault();if(busy)return;const x={};if(pw.length<8)x.pw='Password must be at least 8 characters.';if(pw2!==pw)x.pw2='Passwords do not match.';setE(x);if(Object.keys(x).length)return;
    setBusy(true);setErr('');try{setDone(await api.resetPassword({uid,token,password:pw}))}catch(er){setErr(er.message)}finally{setBusy(false)}}
  if(!uid||!token)return<section className="sec sec--page"><div className="container"><div className="card auth form"><h1>Link not valid</h1><p className="muted">This reset link is incomplete. Request a new one.</p><Link className="btn btn--primary btn--block" to="/forgot-password">Request a new link</Link></div></div></section>;
  const fld=(id,l,v,set,k)=><div className={`fld ${e[k]?'has-err':''}`}><label htmlFor={id}>{l}</label><input id={id} type="password" autoComplete="new-password" value={v} onChange={ev=>{set(ev.target.value);setE({...e,[k]:''})}} aria-invalid={!!e[k]}/>{e[k]&&<small role="alert">{e[k]}</small>}</div>;
  return(<section className="sec sec--page"><div className="container"><form className="card auth form" onSubmit={submit} noValidate><span className="logo__i auth__i"><KeyRound size={22}/></span><h1>Choose a new password</h1>
    {done?<><p className="alert ok" role="status"><CheckCircle2 size={16}/>{done}</p><Link className="btn btn--primary btn--block" to="/login">Log in</Link></>
    :<>{fld('pw','New password',pw,setPw,'pw')}{fld('pw2','Confirm new password',pw2,setPw2,'pw2')}{err&&<p className="alert bad" role="alert">{err} <Link className="link" to="/forgot-password">Request a new link</Link></p>}
      <button className="btn btn--primary btn--block" disabled={busy}>{busy?<><Loader2 size={16} className="spin"/>Saving…</>:'Change password'}</button></>}</form></div></section>)}
