import {useEffect,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import {Loader2,MailCheck,MailWarning} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import * as api from '../services/api.js';
export default function VerifyEmail(){
  const [sp]=useSearchParams(),{user,refreshUser}=useApp(),[st,setSt]=useState('loading'),[msg,setMsg]=useState(''),ran=useRef(false);
  useEffect(()=>{if(ran.current)return;ran.current=true;const uid=sp.get('uid'),token=sp.get('token');
    if(!uid||!token){setSt('error');setMsg('This verification link is incomplete.');return}
    api.verifyEmail({uid,token}).then(d=>{setSt('ok');setMsg(d.detail);if(user)refreshUser()}).catch(e=>{setSt('error');setMsg(e.message)})},[]);
  return(<section className="sec sec--page"><div className="container"><div className="card auth form ctr">
    {st==='loading'&&<><Loader2 size={32} className="spin"/><h1>Verifying…</h1></>}
    {st==='ok'&&<><MailCheck size={40} className="g"/><h1>Email verified</h1><p className="muted">{msg}</p><Link className="btn btn--primary btn--block" to="/foods">Start ordering</Link></>}
    {st==='error'&&<><MailWarning size={40} style={{color:'#b42318'}}/><h1>Could not verify</h1><p className="muted">{msg}</p><p className="muted">Log in and use “Resend email” in the notice at the top of the page to get a fresh link.</p><Link className="btn btn--ghost btn--block" to="/login">Log in</Link></>}</div></div></section>)}
