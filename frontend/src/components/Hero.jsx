import {Star,Truck,Users,Clock,Leaf,Heart} from 'lucide-react';
import {Link} from 'react-router-dom';
import {CONFIG} from '../config.js';
export default function Hero(){
  return(<section id="home" className="hero"><div className="container hero__in">
    <div className="hero__txt">
      <p className="eyebrow">FRESH FOOD, DELIVERED FAST</p>
      <h1><span className="accent">Delicious Food,</span> Delivered Straight to Your Door.</h1>
      <p className="lead">Discover your favourite meals, fresh ingredients, and delicious treats. Order online and enjoy quality food delivered right to your doorstep.</p>
      <div className="row"><Link to="/foods" className="btn btn--primary">Explore Foods</Link><Link to="/popular" className="btn btn--ghost">Order Now</Link></div>
      <ul className="trust">
        <li><Users size={18}/><span><b>10K+</b> Happy Customers</span></li>
        <li><Star size={18}/><span><b>4.9/5</b> Customer Rating</span></li>
        <li><Truck size={18}/><span><b>Fast</b> Delivery</span></li></ul>
    </div>
    <div className="hero__vis">
      <div className="hero__img"><img src={CONFIG.heroImage} alt="Assortment of burgers, pizza, fries, salad and drinks" loading="eager"/></div>
      <div className="float f1"><Clock size={18}/><div><b>30 Min Delivery</b><small>Hot &amp; on time</small></div></div>
      <div className="float f2"><Leaf size={18}/><div><b>Fresh &amp; Quality Food</b><small>Local kitchens</small></div></div>
      <div className="float f3"><Heart size={18}/><div><b>Customer Favourite</b><small>Top rated</small></div></div>
    </div></div></section>);
}
