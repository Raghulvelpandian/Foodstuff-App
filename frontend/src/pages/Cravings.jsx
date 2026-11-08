import {useState} from 'react';
import {ArrowRight,Clock,Shuffle,Sparkles,Star} from 'lucide-react';
import {Link} from 'react-router-dom';
import FoodImg from '../components/FoodImg.jsx';
import FoodCard from '../components/FoodCard.jsx';
import {useApp} from '../context/AppContext.jsx';
import {money} from '../lib/format.js';
import './Cravings.css';

const MOODS=[
  {id:'comfort',emoji:'🍔',title:'Comfort food',hint:'Warm, filling favourites for a proper treat.',match:f=>['burgers','pizza','pasta','sides'].includes(f.category)},
  {id:'fresh',emoji:'🥗',title:'Fresh & light',hint:'Bright, fresh picks that leave you feeling good.',match:f=>['salads','drinks'].includes(f.category)||/salad|bowl|avocado|quinoa|lemon|orange juice|sushi/i.test(`${f.name} ${f.desc}`)},
  {id:'spicy',emoji:'🌶️',title:'Bring the heat',hint:'A little kick, a lot of flavour.',match:f=>/spicy|chilli|chili|jalapeño|jalapeno|hot honey|arrabbiata|pepper/i.test(`${f.name} ${f.desc}`)},
  {id:'sweet',emoji:'🍰',title:'Something sweet',hint:'Finish on a high note with a little treat.',match:f=>f.category==='desserts'}
];

export default function Cravings(){
  const {foods,loading}=useApp();
  const [moodId,setMoodId]=useState(MOODS[0].id);
  const [pickedId,setPickedId]=useState(null);
  const mood=MOODS.find(x=>x.id===moodId)||MOODS[0];
  const matches=foods.filter(mood.match);
  const featured=matches.find(x=>x.id===pickedId)||matches[0];
  const alternatives=matches.filter(x=>x.id!==featured?.id).slice(0,3);

  function surprise(){
    if(!matches.length)return;
    const others=matches.filter(x=>x.id!==featured?.id);
    const pool=others.length?others:matches;
    setPickedId(pool[Math.floor(Math.random()*pool.length)].id);
  }

  function chooseMood(id){setMoodId(id);setPickedId(null)}

  return(<section className="sec crave-page"><div className="container">
    <header className="crave-head"><p className="eyebrow"><Sparkles size={15}/> A little help with the big question</p><h1>What are you craving?</h1><p>Pick a mood and we’ll find a good match from the Foodstuff menu.</p></header>
    <div className="crave-moods" role="group" aria-label="Choose your food mood">
      {MOODS.map(item=><button key={item.id} type="button" className="crave-mood" aria-pressed={moodId===item.id} onClick={()=>chooseMood(item.id)}><span aria-hidden="true">{item.emoji}</span><b>{item.title}</b></button>)}
    </div>
    {loading?<div className="card crave-empty" role="status">Finding something delicious…</div>:featured?<>
      <section className="crave-pick" aria-live="polite" aria-label={`${mood.title} recommendation`}>
        <div className="crave-pick__copy"><p className="crave-label">Your mood: {mood.title}</p><h2>A tasty match.</h2><p>{mood.hint}</p><button type="button" className="crave-surprise" onClick={surprise}><Shuffle size={16}/>Surprise me</button></div>
        <article className="crave-featured"><FoodImg food={featured} className="crave-featured__image"/><div className="crave-featured__body"><p className="crave-label">Foodstuff pick</p><h3>{featured.name}</h3><p>{featured.desc}</p><div className="crave-meta"><span><Star size={15} fill="currentColor"/>{featured.rating} <small>({featured.reviews})</small></span><span><Clock size={15}/>{featured.time} min</span><b>{money(featured.price)}</b></div><Link className="btn btn--primary" to={`/food/${featured.id}`}>View this dish<ArrowRight size={16}/></Link></div></article>
      </section>
      {alternatives.length>0&&<section className="crave-more"><div className="sec__row"><h2>More in this mood</h2><Link to="/foods" className="link">Explore the menu<ArrowRight size={14}/></Link></div><div className="foods">{alternatives.map(food=><FoodCard key={food.id} food={food}/>)}</div></section>}
    </>:<div className="card crave-empty"><h2>No matches just yet</h2><p>Try another mood or browse the full menu.</p><Link className="btn btn--primary" to="/foods">Explore Foods<ArrowRight size={16}/></Link></div>}
  </div></section>);
}
