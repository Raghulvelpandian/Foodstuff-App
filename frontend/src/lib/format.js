import {APP} from '../config.js';
const f=new Intl.NumberFormat('en-US',{style:'currency',currency:APP.currency});
export const money=n=>f.format(n||0);
export const when=t=>new Date(t).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
