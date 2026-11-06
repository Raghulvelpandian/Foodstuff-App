import {Zap,Leaf,ShoppingBag} from 'lucide-react';
const ITEMS=[
 {icon:Zap,tone:'orange',t:'Hyper-Local Routing',d:'Enjoy faster deliveries with intelligent driver dispatching and optimized delivery routes, bringing your favourite meals to your doorstep without unnecessary delays.'},
 {icon:Leaf,tone:'green',t:'Freshness Tracking',d:'Every meal matters. We partner with quality-focused local kitchens and prioritize freshness, careful handling, and food quality from preparation to delivery.'},
 {icon:ShoppingBag,tone:'orange',t:'Frictionless Checkout',d:'Enjoy a simple ordering experience with an easy checkout process, convenient payment options, and real-time order status updates.'}];
export default function WhyChooseUs(){
  return(<section id="why" className="sec"><div className="container">
    <div className="sec__head"><h2>Why People Choose Foodstuff</h2><p>We bring together speed, freshness, and convenience to make every food delivery experience better.</p></div>
    <div className="grid3">{ITEMS.map(({icon:I,tone,t,d})=>(
      <article key={t} className={`card feat feat--${tone}`}><span className="feat__ic"><I size={26}/></span><h3>{t}</h3><p>{d}</p></article>))}</div>
  </div></section>);
}
