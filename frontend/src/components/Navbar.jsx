import {useState,useEffect} from 'react';
import {Link,NavLink,useNavigate} from 'react-router-dom';
import {Search,MapPin,ShoppingCart,Menu,X,UtensilsCrossed,User,LogOut,Package} from 'lucide-react';
import AddressSearch from './AddressSearch.jsx'; import {useApp} from '../context/AppContext.jsx'; import SearchOverlay from './SearchOverlay.jsx';
const LINKS=[['Home','/'],['Explore Foods','/foods'],['Categories','/categories'],['Popular','/popular'],['About Us','/about']];
export default function Navbar(){
  const {count,setCartOpen,user,logout,location,setLocation}=useApp(),nav=useNavigate();
  const [open,setOpen]=useState(false),[scrolled,setScrolled]=useState(false),[search,setSearch]=useState(false),[locOpen,setLocOpen]=useState(false),[um,setUm]=useState(false),[loc,setLoc]=useState(location);
  useEffect(()=>{const f=()=>setScrolled(scrollY>8);f();addEventListener('scroll',f);return()=>removeEventListener('scroll',f)},[]);
  useEffect(()=>{document.body.style.overflow=open?'hidden':''},[open]);
  const cls=({isActive})=>isActive?'active':undefined;
  return(<header className={`nav ${scrolled?'nav--scrolled':''}`}><div className="nav__in container">
    <Link to="/" className="logo" aria-label="Foodstuff home"><span className="logo__i"><UtensilsCrossed size={18}/></span>Foodstuff</Link>
    <nav className="nav__links" aria-label="Primary">{LINKS.map(([l,h])=><NavLink key={l} to={h} end={h==='/'} className={cls}>{l}</NavLink>)}</nav>
    <div className="nav__act">
      <button className="icon-btn" aria-label="Search" onClick={()=>setSearch(true)}><Search size={19}/></button>
      <div className="pop-wrap"><button className="loc" aria-expanded={locOpen} onClick={()=>{setLoc(location);setLocOpen(!locOpen)}}><MapPin size={16}/><span>Deliver to: <b>{location}</b></span></button>
        {locOpen&&<div className="popover card popover--w"><AddressSearch id="loc" label="Delivery location" value={loc} onChange={setLoc} onSelect={i=>{setLocation(i.label);setLocOpen(false)}} placeholder="Search area or street"/><button type="button" className="btn btn--ghost btn--sm btn--block" onClick={()=>{setLocation(loc.trim()||'Your Location');setLocOpen(false)}}>Use as typed</button></div>}</div>
      <button className="icon-btn cart" aria-label={`Cart, ${count} items`} onClick={()=>setCartOpen(true)}><ShoppingCart size={19}/><span className="badge">{count}</span></button>
      {user?<div className="pop-wrap nav__login"><button className="btn btn--ghost btn--sm" onClick={()=>setUm(!um)} aria-expanded={um}><User size={15}/>{user.name?.split(' ')[0]}</button>
        {um&&<div className="popover card menu" onClick={()=>setUm(false)}><Link to="/orders"><Package size={15}/>My Orders</Link><button onClick={()=>{logout();nav('/')}}><LogOut size={15}/>Sign out</button></div>}</div>
        :<Link className="btn btn--primary btn--sm nav__login" to="/login">Login / Sign Up</Link>}
      <button className="icon-btn burger" aria-label="Open menu" aria-expanded={open} onClick={()=>setOpen(true)}><Menu size={22}/></button></div></div>
    <div className={`drawer-bg ${open?'on':''}`} onClick={()=>setOpen(false)}/>
    <aside className={`drawer ${open?'on':''}`} aria-hidden={!open}><div className="drawer__top"><span className="logo"><span className="logo__i"><UtensilsCrossed size={18}/></span>Foodstuff</span><button className="icon-btn" aria-label="Close menu" onClick={()=>setOpen(false)}><X size={22}/></button></div>
      {LINKS.map(([l,h])=><NavLink key={l} to={h} end={h==='/'} className={cls} onClick={()=>setOpen(false)}>{l}</NavLink>)}
      {user&&<NavLink to="/orders" onClick={()=>setOpen(false)}>My Orders</NavLink>}
      {user?<button className="btn btn--ghost btn--block" onClick={()=>{logout();setOpen(false)}}>Sign out ({user.name?.split(' ')[0]})</button>:<Link className="btn btn--primary btn--block" to="/login" onClick={()=>setOpen(false)}>Login / Sign Up</Link>}</aside>
    <SearchOverlay open={search} onClose={()=>setSearch(false)}/></header>);
}
