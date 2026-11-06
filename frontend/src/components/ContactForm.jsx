import {useState} from 'react';
import axios from 'axios';
import {Send,Loader2,CheckCircle2,AlertCircle,Info} from 'lucide-react';
import {CONFIG} from '../config.js';
const INIT={name:'',email:'',subject:'',message:'',website:''}; // 'website' = honeypot for bots
const validate=v=>{const e={};if(!v.name.trim())e.name='Please enter your full name.';
  if(!v.email.trim())e.email='Please enter your email address.';else if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email))e.email='Enter a valid email, like name@example.com.';
  if(!v.subject.trim())e.subject='Please add a subject.';if(v.message.trim().length<10)e.message='Message should be at least 10 characters.';return e};
export default function ContactForm(){
  const [v,setV]=useState(INIT),[err,setErr]=useState({}),[st,setSt]=useState('idle'),[msg,setMsg]=useState('');
  const on=e=>{setV({...v,[e.target.name]:e.target.value});if(err[e.target.name])setErr({...err,[e.target.name]:''})};
  async function submit(e){e.preventDefault();if(st==='loading')return;
    const x=validate(v);setErr(x);if(Object.keys(x).length)return;
    if(v.website)return setSt('success');                       // bot: pretend success, send nothing
    if(!CONFIG.apiUrl){setSt('dev');setMsg('Development mode: no backend is configured (VITE_API_URL), so this message was not sent.');return}
    setSt('loading');
    try{await axios.post(`${CONFIG.apiUrl.replace(/\/$/,'')}/api/contact/`,{name:v.name,email:v.email,subject:v.subject,message:v.message},{timeout:15000});setSt('success');setV(INIT)}
    catch(er){setSt('error');setMsg(er.response?.status===429?'Too many requests. Please wait a few minutes and try again.':'Your message could not be sent. Please try again or email me directly.')}}
  const F=({n,l,t='text',ph,area})=>{const C=area?'textarea':'input';return(<div className={`fld ${err[n]?'has-err':''}`}><label htmlFor={n}>{l}</label>
    <C id={n} name={n} type={area?undefined:t} rows={area?5:undefined} placeholder={ph} value={v[n]} onChange={on} aria-invalid={!!err[n]} aria-describedby={err[n]?n+'-e':undefined} autoComplete={n==='name'?'name':n==='email'?'email':'off'}/>
    {err[n]&&<small id={n+'-e'} role="alert">{err[n]}</small>}</div>)};
  return(<form className="card form" onSubmit={submit} noValidate>{F({n:"name",l:"Full Name",ph:"Your full name"})}{F({n:"email",l:"Email Address",t:"email",ph:"you@example.com"})}
    {F({n:"subject",l:"Subject",ph:"What's this about?"})}{F({n:"message",l:"Message",ph:"Tell me a bit about your project or opportunity…",area:true})}
    <input className="hp" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" value={v.website} onChange={on}/>
    <button className="btn btn--primary btn--block" disabled={st==='loading'}>{st==='loading'?<><Loader2 size={16} className="spin"/>Sending…</>:<><Send size={16}/>Send Message</>}</button>
    <div aria-live="polite">{st==='success'&&<p className="alert ok"><CheckCircle2 size={16}/>Thanks! Your message has been sent. I'll reply soon.</p>}
      {st==='error'&&<p className="alert bad"><AlertCircle size={16}/>{msg}</p>}{st==='dev'&&<p className="alert dev"><Info size={16}/>{msg}</p>}</div></form>);
}
