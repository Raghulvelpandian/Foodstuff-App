import {Mail,Github,Linkedin,ArrowUpRight} from 'lucide-react';
import {CONFIG} from '../config.js'; import ContactForm from './ContactForm.jsx';
const CARDS=[[Mail,'Email',CONFIG.email,'Send Email',`mailto:${CONFIG.email}`],[Github,'GitHub','GitHub Profile','View GitHub',CONFIG.githubUrl],[Linkedin,'LinkedIn','LinkedIn Profile','Connect on LinkedIn',CONFIG.linkedinUrl]];
export default function ContactSection(){
  return(<section id="contact" className="sec"><div className="container">
    <div className="sec__head"><p className="eyebrow">LET'S CONNECT</p><h2>Have a Project in Mind? Let's Talk.</h2><p>I'm always interested in connecting with developers, exploring opportunities, and discussing innovative ideas. Feel free to reach out.</p></div>
    <div className="contact"><div><h3>Let's Start a Conversation</h3><p className="muted">Whether it's a job opportunity, collaboration, or simply a conversation about technology, I'd love to hear from you.</p>
      <a className="bigmail" href={`mailto:${CONFIG.email}`}><Mail size={20}/>{CONFIG.email}</a>
      <div className="ccards">{CARDS.map(([I,t,v,a,h])=><a key={t} className="card cc" href={h} {...(t!=='Email'&&{target:'_blank',rel:'noreferrer'})}><span className="feat__ic"><I size={20}/></span><div><small>{t}</small><b>{v}</b></div><span className="cc__a">{a}<ArrowUpRight size={14}/></span></a>)}</div></div>
      <ContactForm/></div></div></section>);
}
