import {Link} from 'react-router-dom';
import {ArrowRight,Tag,MousePointerClick,CreditCard,MapPinned,Star,Leaf,Flame} from 'lucide-react';
import Hero from '../components/Hero.jsx'; import WhyChooseUs from '../components/WhyChooseUs.jsx'; import FoodCard from '../components/FoodCard.jsx';
import {useApp} from '../context/AppContext.jsx'; import {APP} from '../config.js'; import {money} from '../lib/format.js';
const STEPS=[[MousePointerClick,'Pick your meal','Browse the menu, filter by category or diet and add favourites to your cart.'],[CreditCard,'Check out in seconds','Confirm your address and choose how to pay.'],[MapPinned,'Track your order','Follow your order from the kitchen to your door.']];
const FAQ=[['How do I track my order?','Open My Orders after you place an order. The status moves from Confirmed to Preparing, On the way and Delivered.'],
 ['What payment options are there?','Choose online payment or cash on delivery at checkout.'],
 ['Is there a delivery fee?',`Delivery is free on orders over ${money(APP.freeDeliveryOver)}. Smaller orders pay ${money(APP.deliveryFee)}.`],
 ['Are there vegetarian options?','Yes. Use the Vegetarian filter on Explore Foods, or see the vegetarian picks on this page.'],
 ['How do I change my delivery address?','Search for a new address at checkout, or use the Deliver to selector at the top of the page.']];
function Row({icon:I,title,to,label='See all',loading,items}){return(<section className="sec sec--tight"><div className="container"><div className="sec__row"><h2>{I&&<I size={22}/>}{title}</h2><Link to={to} className="link">{label}<ArrowRight size={14}/></Link></div>
  <div className="foods">{loading?[0,1,2,3].map(i=><div key={i} className="skel sk-card"/>):items.map(f=><FoodCard key={f.id} food={f}/>)}</div></div></section>)}
export default function Home(){const {foods,cats,loading}=useApp();
  const by=(fn)=>[...foods].sort(fn),pop=foods.filter(f=>f.popular).slice(0,4),top=by((a,b)=>b.rating-a.rating||b.reviews-a.reviews).slice(0,4),veg=by((a,b)=>b.rating-a.rating).filter(f=>f.veg).slice(0,4);
  return(<><Hero/>
    <section className="sec sec--tight"><div className="container"><div className="sec__row"><h2>Browse by Category</h2><Link to="/categories" className="link">All categories<ArrowRight size={14}/></Link></div>
      <div className="cats">{cats.map(c=><Link key={c.id} to={`/foods?cat=${c.id}`} className="card cat"><span>{c.emoji}</span><b>{c.name}</b><small>{foods.filter(f=>f.category===c.id).length} items</small></Link>)}</div></div></section>
    <Row icon={Flame} title="Popular Right Now" to="/popular" loading={loading} items={pop}/>
    <section className="container"><div className="promo"><Tag size={28}/><div><h3>{APP.promoPercent}% off your first order</h3><p>Use code <b>{APP.promoCode}</b> at checkout. Free delivery on orders over {money(APP.freeDeliveryOver)}.</p></div><Link className="btn btn--primary" to="/foods">Order Now</Link></div></section>
    <Row icon={Star} title="Top Rated" to="/foods?sort=rating" loading={loading} items={top}/>
    <Row icon={Leaf} title="Vegetarian Picks" to="/foods?veg=1" label="See all vegetarian" loading={loading} items={veg}/>
    <WhyChooseUs/>
    <section className="sec sec--white"><div className="container"><div className="sec__head"><h2>How It Works</h2><p>From craving to doorstep in three simple steps.</p></div>
      <ol className="how">{STEPS.map(([I,t,d],i)=><li key={t}><span className="feat__ic"><I size={24}/></span><h3>{i+1}. {t}</h3><p>{d}</p></li>)}</ol></div></section>
    <section className="sec"><div className="container faq-w"><div className="sec__head"><h2>Frequently Asked Questions</h2><p>Quick answers about ordering with Foodstuff.</p></div>
      <div className="faq">{FAQ.map(([q,a])=><details key={q} className="card"><summary>{q}</summary><p>{a}</p></details>)}</div></div></section>
    <section className="container"><div className="band"><div><h2>Hungry? Your next meal is a few taps away.</h2><p>Browse {foods.length||'our'} dishes from local kitchens.</p></div><Link className="btn btn--light" to="/foods">Explore Foods<ArrowRight size={16}/></Link></div></section></>)}
