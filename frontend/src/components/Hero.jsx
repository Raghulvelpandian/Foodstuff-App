import {ArrowRight,Clock,Leaf,Star} from 'lucide-react';
import {Link} from 'react-router-dom';
import {FOODS} from '../data/foods.js';
import {money} from '../lib/format.js';
import './BurgerHero.css';

const FEATURED=FOODS[0];

export default function Hero(){
  return(<section id="home" className="hero burger-hero"><div className="container burger-hero__inner">
    <div className="burger-hero__copy">
      <p className="burger-hero__eyebrow">Fresh food, delivered fast</p>
      <h1 className="burger-hero__title"><span>Good food.</span><span className="burger-hero__amber">Big mood.</span><span>Zero fuss.</span></h1>
      <p className="burger-hero__lead">Big, juicy flavours from local kitchens, delivered to your door while they’re still hot. Meet your new favourite meal.</p>
      <div className="burger-hero__actions"><Link to={`/food/${FEATURED.id}`} className="burger-hero__primary">Try the {FEATURED.name}<ArrowRight size={17}/></Link><Link to="/foods" className="burger-hero__secondary">Explore the menu</Link></div>
      <div className="burger-hero__proof"><span className="burger-hero__proof-icon"><Star size={15} fill="currentColor"/></span><span><b>{FEATURED.rating} · {FEATURED.reviews} reviews</b><small>Loved by 10K+ food fans</small></span></div>
    </div>
    <div className="burger-hero__visual" aria-label={FEATURED.name}>
      <div className="burger-hero__orb" aria-hidden="true"/>
      <figure className="burger-hero__photo"><img src={FEATURED.img} alt={FEATURED.name} fetchPriority="high"/><figcaption><span>Classic Smash Burger</span><b>{money(FEATURED.price)}</b></figcaption></figure>
      <div className="burger-hero__badge burger-hero__badge--fresh"><Leaf size={15}/><span>Fresh from<br/><b>local kitchens</b></span></div>
      <div className="burger-hero__badge burger-hero__badge--time"><Clock size={16}/><span><b>{FEATURED.time} min</b><br/>delivery</span></div>
      <span className="burger-hero__ingredient burger-hero__ingredient--tomato" aria-hidden="true">🍅</span>
      <span className="burger-hero__ingredient burger-hero__ingredient--leaf" aria-hidden="true">🥬</span>
      <span className="burger-hero__ingredient burger-hero__ingredient--cheese" aria-hidden="true">🧀</span>
      <span className="burger-hero__spark burger-hero__spark--one" aria-hidden="true">✳</span>
      <span className="burger-hero__spark burger-hero__spark--two" aria-hidden="true">✦</span>
    </div>
  </div>
  <div className="burger-hero__ribbon"><span>Local kitchens · quality ingredients</span><b>Made to crave <i>✦</i> made for you</b><span>Good food, right on time</span></div>
  </section>);
}
