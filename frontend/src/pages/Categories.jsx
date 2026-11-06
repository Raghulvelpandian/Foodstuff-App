import {Link} from 'react-router-dom';
import {useApp} from '../context/AppContext.jsx';
export default function Categories(){const {cats,foods}=useApp();
  return(<section className="sec sec--page"><div className="container"><div className="page-h"><h1>Categories</h1><p className="muted">Pick a cuisine or course to start browsing.</p></div>
    <div className="cats cats--big">{cats.map(c=>{const n=foods.filter(f=>f.category===c.id).length;return(<Link key={c.id} to={`/foods?cat=${c.id}`} className="card cat"><span>{c.emoji}</span><b>{c.name}</b><small>{n} item{n===1?'':'s'}</small></Link>)})}</div></div></section>)}
