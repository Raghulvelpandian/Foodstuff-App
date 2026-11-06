import {Link} from 'react-router-dom';
import {UtensilsCrossed,Github,Linkedin,Mail,ArrowUp} from 'lucide-react';
import {CONFIG} from '../config.js';
const Q=[['Home','/'],['Explore Foods','/foods'],['Categories','/categories'],['Popular','/popular'],['Featured Project','/about#featured'],['Architecture','/about#architecture'],['GitHub','/about#github'],['Contact','/about#contact']];
export default function Footer(){
  return(<footer className="foot"><div className="container"><div className="foot__grid">
    <div><Link to="/" className="logo logo--w"><span className="logo__i"><UtensilsCrossed size={18}/></span>Foodstuff</Link><p>Fresh Food. Seamless Experience. Delivered with Care.</p></div>
    <nav aria-label="Footer"><h4>Quick Links</h4><ul>{Q.map(([l,h])=><li key={l}><Link to={h}>{l}</Link></li>)}</ul></nav>
    <div><h4>Connect With Me</h4><div className="soc"><a href={CONFIG.githubUrl} aria-label="GitHub" target="_blank" rel="noreferrer"><Github size={18}/></a>
      <a href={CONFIG.linkedinUrl} aria-label="LinkedIn" target="_blank" rel="noreferrer"><Linkedin size={18}/></a><a href={`mailto:${CONFIG.email}`} aria-label="Email"><Mail size={18}/></a></div></div></div>
    <div className="foot__bot"><span>© 2026 Foodstuff. All Rights Reserved.</span><span>Designed &amp; Developed with Passion.</span><a href="#top" onClick={e=>{e.preventDefault();scrollTo({top:0,behavior:'smooth'})}}>Back to Top<ArrowUp size={14}/></a></div></div></footer>);
}
