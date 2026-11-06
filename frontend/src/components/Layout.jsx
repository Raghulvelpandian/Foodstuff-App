import {useEffect} from 'react';
import {Outlet,useLocation} from 'react-router-dom';
import Navbar from './Navbar.jsx'; import Footer from './Footer.jsx'; import CartDrawer from './CartDrawer.jsx'; import {useApp} from '../context/AppContext.jsx';
import {CheckCircle2} from 'lucide-react';
export default function Layout(){const {pathname,hash}=useLocation(),{toast}=useApp();
  useEffect(()=>{if(hash){const t=setTimeout(()=>document.getElementById(hash.slice(1))?.scrollIntoView(),60);return()=>clearTimeout(t)}scrollTo(0,0)},[pathname,hash]);
  return(<><a className="skip" href="#main">Skip to content</a><Navbar/><main id="main"><Outlet/></main><Footer/><CartDrawer/>
    <div className="toast-w" aria-live="polite">{toast&&<div key={toast.k} className="toast"><CheckCircle2 size={16}/>{toast.m}</div>}</div></>)}
