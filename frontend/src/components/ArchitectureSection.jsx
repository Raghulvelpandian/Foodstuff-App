import {useState} from 'react';
import {Monitor,Network,Server,Database,Maximize2,X,ArrowRight,ArrowLeft,ShieldCheck,Zap,Link2,Search} from 'lucide-react';
const LAYERS=[
 {id:'fe',c:'#FF6B35',icon:Monitor,label:'Customer Interface',name:'Frontend',items:['React.js','HTML5','CSS3','JavaScript','Axios']},
 {id:'api',c:'#2F6FED',icon:Network,label:'API Communication Layer',name:'API',items:['REST API','HTTP Requests','JSON Responses','JWT Authentication']},
 {id:'be',c:'#228B55',icon:Server,label:'Application Layer',name:'Backend',items:['Python','Django','Django REST Framework','Business Logic','Authentication','Order Processing']},
 {id:'db',c:'#7A4DD8',icon:Database,label:'Data Layer',name:'Database',items:['MySQL','Relational Tables','Indexing','Data Validation']}];
// ER data: [x,y] grid positions on 1000x760 canvas
const ENT={
 users:{p:[0,0],f:['user_id|PK','full_name','email','password_hash','phone','address','created_at']},
 cart:{p:[1,0],f:['cart_id|PK','user_id|FK','created_at']},
 cart_items:{p:[2,0],f:['cart_item_id|PK','cart_id|FK','product_id|FK','quantity']},
 orders:{p:[0,1],f:['order_id|PK','user_id|FK','total_amount','delivery_address','order_status','created_at']},
 order_items:{p:[1,1],f:['order_item_id|PK','order_id|FK','product_id|FK','quantity','unit_price']},
 products:{p:[2,1],f:['product_id|PK','category_id|FK','product_name','description','price','image','availability']},
 payments:{p:[0,2],f:['payment_id|PK','order_id|FK','payment_method','payment_status','transaction_reference','paid_at']},
 deliveries:{p:[1,2],f:['delivery_id|PK','order_id|FK','delivery_status','delivery_person','estimated_delivery','delivered_at']},
 categories:{p:[2,2],f:['category_id|PK','category_name','description']}};
// [from,to,fromCard,toCard]  — design choices: cart 1:1 per user, payments 1:N (retries), deliveries 1:1
const REL=[['users','cart','1','1'],['users','orders','1','N'],['categories','products','1','N'],['cart','cart_items','1','N'],['products','cart_items','1','N'],
 ['orders','order_items','1','N'],['products','order_items','1','N'],['orders','payments','1','N'],['orders','deliveries','1','1']];
const W=200,RH=17,HH=28,box=k=>{const e=ENT[k],x=20+e.p[0]*380,y=20+e.p[1]*250,h=HH+e.f.length*RH+8;return{x,y,h,cx:x+W/2,cy:y+h/2}};
function ER({big}){return(<svg className="er" viewBox="0 0 1000 740" role="img" aria-label="Entity relationship diagram of the Foodstuff MySQL database" style={{minWidth:big?0:760}}>
  <defs><marker id="ar" markerWidth="6" markerHeight="6" refX="3" refY="3"><circle cx="3" cy="3" r="2" fill="#242424"/></marker></defs>
  {REL.map(([a,b,ca,cb])=>{const A=box(a),B=box(b),pt=t=>[A.cx+(B.cx-A.cx)*t,A.cy+(B.cy-A.cy)*t];const l1=pt(.36),l2=pt(.64);
    return(<g key={a+b}><line x1={A.cx} y1={A.cy} x2={B.cx} y2={B.cy} stroke="#242424" strokeWidth="1.4" strokeOpacity=".55"/>
      <text x={l1[0]} y={l1[1]-5} className="er__c">{ca}</text><text x={l2[0]} y={l2[1]-5} className="er__c">{cb}</text></g>)})}
  {Object.entries(ENT).map(([k,e])=>{const b=box(k);return(<g key={k}><rect x={b.x} y={b.y} width={W} height={b.h} rx="10" fill="#fff" stroke="#e6ddd2"/>
    <path d={`M${b.x} ${b.y+HH}V${b.y+10}a10 10 0 0 1 10-10h${W-20}a10 10 0 0 1 10 10V${b.y+HH}z`} fill="#7A4DD8"/>
    <text x={b.x+12} y={b.y+19} className="er__t">{k}</text>
    {e.f.map((f,i)=>{const [n,t]=f.split('|');return(<g key={f}><text x={b.x+12} y={b.y+HH+16+i*RH} className={`er__f ${t?'k':''}`}>{n}</text>
      {t&&<text x={b.x+W-12} y={b.y+HH+16+i*RH} textAnchor="end" className={`er__k ${t}`}>{t}</text>}</g>)})}</g>)})}</svg>);}
const HL=[[Link2,'API-Driven Communication','React communicates with Django REST Framework through structured REST endpoints and JSON responses.'],
[Database,'Relational Data Management','MySQL maintains structured relationships between customers, products, orders, and payment records.'],
[ShieldCheck,'Secure Authentication','JWT-based authentication and protected API endpoints control access to customer and administrative operations.'],
[Zap,'Efficient Query Processing','Database indexes, relational constraints, and optimized ORM queries support efficient data retrieval.']];
export default function ArchitectureSection(){
  const [hot,setHot]=useState(null),[zoom,setZoom]=useState(false);
  const near=id=>{if(!hot)return false;const i=LAYERS.findIndex(l=>l.id===id),j=LAYERS.findIndex(l=>l.id===hot);return Math.abs(i-j)===1};
  return(<section id="architecture" className="sec sec--white"><div className="container">
    <div className="sec__head"><p className="eyebrow">UNDER THE HOOD</p><h2>Engineered for Performance. Designed for Scale.</h2><p>Explore how Foodstuff connects modern frontend experiences, powerful backend services, and structured relational data to deliver a seamless food ordering experience.</p></div>
    <h3 className="sub">System Architecture</h3><p className="muted sub__p">A modular full-stack architecture connecting the customer interface, backend services, and relational database through secure API communication.</p>
    <div className="panel"><div className="flow">{LAYERS.map((L,i)=>{const I=L.icon;return(<div key={L.id} className="flow__cell">
      <div className={`layer ${hot===L.id?'is-on':''} ${near(L.id)?'is-near':''} ${hot&&hot!==L.id&&!near(L.id)?'is-dim':''}`} style={{'--c':L.c}} tabIndex={0}
        onMouseEnter={()=>setHot(L.id)} onMouseLeave={()=>setHot(null)} onFocus={()=>setHot(L.id)} onBlur={()=>setHot(null)}>
        <span className="layer__ic"><I size={20}/></span><small>Layer {i+1} · {L.name}</small><h4>{L.label}</h4><ul>{L.items.map(t=><li key={t}>{t}</li>)}</ul></div>
      {i<3&&<div className="arrows" aria-hidden="true"><span><ArrowRight size={16}/>Request</span><span><ArrowLeft size={16}/>Response</span></div>}</div>)})}</div>
      <p className="path"><b>Request:</b> Customer → React Frontend → REST API → Django Backend → MySQL Database. <b>Response:</b> returns in reverse as JSON.</p>
      <ul className="legend">{LAYERS.map(l=><li key={l.id}><i style={{background:l.c}}/>{l.name}</li>)}</ul></div>
    <h3 className="sub">Relational Database Design</h3><p className="muted sub__p">Foodstuff uses a structured MySQL database to maintain relationships between customers, food products, shopping carts, orders, payments, and delivery information.</p>
    <div className="panel"><div className="er__tools"><ul className="legend"><li><i className="pk">PK</i>Primary key</li><li><i className="fk">FK</i>Foreign key</li><li>1 / N = one / many</li></ul>
      <button className="btn btn--ghost btn--sm" onClick={()=>setZoom(true)}><Maximize2 size={14}/>Expand</button></div>
      <div className="er__scroll"><ER/></div>
      <p className="path">Cardinality: users→cart 1:1, users→orders 1:N, categories→products 1:N, cart→cart_items 1:N, orders→order_items 1:N, products→cart_items / order_items 1:N, orders→payments 1:N (retries), orders→deliveries 1:1.</p></div>
    <div className="grid4">{HL.map(([I,t,d])=><div key={t} className="card mini"><I size={20}/><h4>{t}</h4><p>{d}</p></div>)}</div>
    <p className="note">Design notes: describe these as implemented only once the matching Django features are built.</p>
    {zoom&&<div className="modal" role="dialog" aria-modal="true" aria-label="ER diagram" onClick={()=>setZoom(false)}><div className="modal__in" onClick={e=>e.stopPropagation()}>
      <button className="icon-btn modal__x" aria-label="Close" onClick={()=>setZoom(false)}><X size={20}/></button><ER big/></div></div>}
  </div></section>);
}
