import axios from 'axios';
const TTL=10*60*1000;
// Cached public GitHub fetch (sessionStorage). No tokens in the browser; route via a Django proxy if you need auth.
export async function gh(url){
  const k='gh:'+url;
  try{const c=JSON.parse(sessionStorage.getItem(k)||'null');if(c&&Date.now()-c.t<TTL)return c.d}catch{}
  try{const {data}=await axios.get(url,{headers:{Accept:'application/vnd.github+json'}});
    try{sessionStorage.setItem(k,JSON.stringify({t:Date.now(),d:data}))}catch{}return data}
  catch(e){const s=e.response?.status;
    throw new Error(s===403||s===429?'GitHub rate limit reached. Please try again later.':s===404?'GitHub user not found.':'Could not load GitHub data.')}
}
export const ago=d=>new Date(d).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'});
