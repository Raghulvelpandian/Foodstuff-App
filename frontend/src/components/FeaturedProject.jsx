import {Activity,Database,ShieldCheck,Server,CheckCircle2,CreditCard,MapPin,ExternalLink,Github,Layers,Plug,Smartphone,Table2} from 'lucide-react';
import {CONFIG} from '../config.js';
const HL=[[Activity,'Real-Time Order Management','Dynamic order status updates, allowing customers to follow their orders from confirmation to delivery.'],
[Database,'Optimized Database Architecture','MySQL-powered relational database designed to manage users, products, orders, payments, and inventory efficiently.'],
[ShieldCheck,'Secure Authentication & Payments','User authentication, protected API endpoints, and secure payment gateway integration.'],
[Server,'Scalable Backend Architecture','Django REST Framework APIs supporting product management, cart operations, order processing, and delivery workflows.']];
const STACK=[['React.js','Frontend','#61DAFB'],['Python','Backend Language','#3776AB'],['Django','Backend Framework','#0C4B33'],['Django REST Framework','REST APIs','#A30000'],['MySQL','Database','#00758F'],['HTML5 / CSS3','UI Styling','#E34F26'],['JavaScript','Client-side Logic','#F7DF1E']];
const STATS=[[Layers,'Full-Stack Architecture'],[Plug,'REST API Integration'],[Smartphone,'Responsive Interface'],[Table2,'Relational Database']];
const Highlight=({i,icon:I,t,d})=><div className="hl"><span className="hl__n">{String(i+1).padStart(2,'0')}</span><div><h4><I size={16}/>{t}</h4><p>{d}</p></div></div>;
const Badge=({n,r,c})=><span className="tech" title={r}><i style={{background:c}}/>{n}</span>;
function Mockup(){
  const foods=[['🍔','Classic Burger','$8.50'],['🍕','Margherita','$11.00'],['🥗','Garden Salad','$7.25'],['🍟','Loaded Fries','$5.00']];
  return(<div className="mock"><div className="browser"><div className="browser__bar"><i/><i/><i/><span>foodstuff.app/menu</span></div>
    <div className="browser__body"><div className="mock__menu"><div className="mock__tabs"><b>All</b><span>Burgers</span><span>Pizza</span><span>Salads</span></div>
      <div className="mock__grid">{foods.map(([e,n,p])=><div key={n} className="mock__item"><span>{e}</span><b>{n}</b><em>{p}</em></div>)}</div></div>
      <div className="mock__side"><h5>Your Cart</h5><p><span>Classic Burger ×2</span><b>$17.00</b></p><p><span>Loaded Fries ×1</span><b>$5.00</b></p><p className="tot"><span>Total</span><b>$22.00</b></p>
        <div className="steps"><i className="d"/><i className="d"/><i className="c"/><i/></div><small>Confirmed · Preparing · On the way · Delivered</small></div></div></div>
    <div className="float fl1"><CheckCircle2 size={16}/>Order Confirmed</div><div className="float fl2"><CreditCard size={16}/>Payment Successful</div><div className="float fl3"><MapPin size={16}/>Live Order Tracking</div></div>);
}
export default function FeaturedProject(){
  return(<section id="featured" className="sec sec--white"><div className="container">
    <div className="sec__head"><h2>More Than Food Delivery. A Complete Digital Experience.</h2><p>Foodstuff combines modern frontend experiences with powerful backend architecture to deliver a seamless food ordering platform, from browsing menus to real-time order tracking and secure checkout.</p></div>
    <div className="fp"><Mockup/><div className="fp__info"><h3>Foodstuff – Full-Stack Food Delivery Platform</h3>
      <p className="muted">A full-stack e-commerce food delivery application designed to simplify food discovery, ordering, payment, and delivery management through a scalable and responsive architecture.</p>
      <div className="hls">{HL.map(([icon,t,d],i)=><Highlight key={t} i={i} icon={icon} t={t} d={d}/>)}</div>
      <div className="techs">{STACK.map(([n,r,c])=><Badge key={n} n={n} r={r} c={c}/>)}</div>
      <ul className="stats">{STATS.map(([I,l])=><li key={l}><I size={18}/>{l}</li>)}</ul>
      <div className="row"><a className="btn btn--primary" href={CONFIG.liveUrl} target="_blank" rel="noreferrer"><ExternalLink size={16}/>Explore Live Project</a>
        <a className="btn btn--ghost" href={CONFIG.repoUrl} target="_blank" rel="noreferrer"><Github size={16}/>View Source Code</a></div></div></div>
  </div></section>);
}
