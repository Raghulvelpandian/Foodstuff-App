import {useState} from 'react';
import {MailWarning} from 'lucide-react';
import {useApp} from '../context/AppContext.jsx'; import * as api from '../services/api.js'; import {CONFIG} from '../config.js';
export default function VerifyBanner(){
  const {user,notify}=useApp(),[busy,setBusy]=useState(false);
  if(!CONFIG.apiUrl||!user||user.emailVerified!==false)return null;
  const resend=async()=>{setBusy(true);try{notify(await api.resendVerification())}catch(e){notify(e.message)}finally{setBusy(false)}};
  return(<div className="vb" role="status"><MailWarning size={18}/><span>Please verify your email address. We sent a link to <b>{user.email}</b>.</span><button className="link" onClick={resend} disabled={busy}>{busy?'Sending…':'Resend email'}</button></div>);
}
