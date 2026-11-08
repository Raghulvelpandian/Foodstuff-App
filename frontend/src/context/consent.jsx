import {createContext,useContext,useState} from 'react';
const KEY='fs:consent', Ctx=createContext(null);
export const useConsent=()=>useContext(Ctx);
// Necessary storage is always on. Preferences (remember delivery location) needs a choice. Analytics is not used by this site.
export function ConsentProvider({children}){
  const [c,setC]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY))}catch{return null}}),[open,setOpen]=useState(false);
  const save=v=>{const n={necessary:true,preferences:!!v.preferences,analytics:false,decided:true,at:new Date().toISOString()};setC(n);try{localStorage.setItem(KEY,JSON.stringify(n))}catch{}setOpen(false)};
  const consent=c||{necessary:true,preferences:false,analytics:false,decided:false};
  return <Ctx.Provider value={{consent,save,open,setOpen}}>{children}</Ctx.Provider>;
}
