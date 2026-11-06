import {ExternalLink,Github,ArrowRight,Search} from 'lucide-react';
// Configure real links here
export const PROJECTS=[
 {n:'01',cat:'REAL-TIME APPLICATION',title:'Delivery Connect',kind:'chat',desc:'A real-time communication application that simulates driver-to-customer messaging during food deliveries. Supports instant message delivery, live communication, and dynamic conversation updates.',stack:['React.js','Node.js','Socket.io','Express.js'],live:'#',repo:'#'},
 {n:'02',cat:'API INTEGRATION',title:'NutriTrack API',kind:'nutri',desc:'A nutritional information application that retrieves food data through external APIs and displays calories, macronutrients, and allergen information to help users make informed food choices.',stack:['React.js','Express.js','REST API','Axios'],live:'#',repo:'#'},
 {n:'03',cat:'ADMIN DASHBOARD',title:'StockPilot',kind:'admin',desc:'A restaurant inventory management dashboard that allows administrators to manage food items, update prices, monitor stock availability, and analyze daily sales performance.',stack:['Next.js','PostgreSQL','Tailwind CSS','REST API'],live:'#',repo:'#'}];
const Chat=()=>(<div className="pv pv--chat"><div className="pv__hd"><span className="av">D</span><div><b>Driver · Sam</b><small><i className="dot"/>Online</small></div></div>
  <p className="b in">Hi! I'm two minutes away.<time>12:41</time></p><p className="b out">Great, gate code is 2210.<time>12:41</time></p><p className="b in">On my way up 👍<time>12:42</time></p><p className="b in typing"><i/><i/><i/></p></div>);
const Nutri=()=>(<div className="pv pv--nutri"><div className="srch"><Search size={13}/>grilled chicken salad</div><div className="cal"><b>340</b><small>kcal</small></div>
  {[['Protein',62,'#228B55'],['Carbs',35,'#FF6B35'],['Fat',48,'#d9a400']].map(([l,w,c])=><div key={l} className="bar"><span>{l}</span><i><u style={{width:w+'%',background:c}}/></i></div>)}
  <div className="tags"><span>Contains: Nuts</span><span>Gluten-free</span></div></div>);
const Admin=()=>(<div className="pv pv--admin"><div className="kpis"><p><b>128</b>Products</p><p><b>112</b>Available</p><p><b>16</b>Out</p></div>
  <div className="bars">{[40,65,50,80,60,90,70].map((h,i)=><i key={i} style={{height:h+'%'}}/>)}</div>
  {[['Burger','In stock'],['Pizza','Low'],['Salad','Out']].map(([n,s])=><div key={n} className="tr"><span>{n}</span><em className={s==='Out'?'o':s==='Low'?'l':''}>{s}</em></div>)}</div>);
const PV={chat:Chat,nutri:Nutri,admin:Admin};
export default function SupplementaryProjects(){
  return(<section id="projects" className="sec"><div className="container">
    <div className="sec__head"><h2>Exploring Beyond Foodstuff.</h2><p>Building practical applications that solve real-world problems through modern technologies, intelligent integrations, and clean engineering.</p></div>
    <div className="grid3">{PROJECTS.map(p=>{const P=PV[p.kind];return(
      <article key={p.n} className="card proj"><div className={`proj__img proj__img--${p.kind}`}><P/></div>
        <div className="proj__body"><div className="proj__meta"><span>Project {p.n}</span><span className="cat">{p.cat}</span></div><h3>{p.title}</h3><p>{p.desc}</p>
          <div className="techs">{p.stack.map(s=><span key={s} className="tech">{s}</span>)}</div>
          <div className="row proj__btns"><a className="btn btn--primary btn--sm" href={p.live} target="_blank" rel="noreferrer"><ExternalLink size={14}/>View Project</a>
            <a className="btn btn--ghost btn--sm" href={p.repo} target="_blank" rel="noreferrer"><Github size={14}/>Source Code</a></div></div></article>)})}</div>
    <div className="cta-c"><p>Interested in exploring more?</p><a className="btn btn--primary" href="#github">View All Projects<ArrowRight size={16}/></a></div>
  </div></section>);
}
