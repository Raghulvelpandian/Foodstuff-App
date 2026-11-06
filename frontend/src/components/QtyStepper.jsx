import {Minus,Plus} from 'lucide-react';
export default function QtyStepper({qty,onChange,label=''}){return(<div className="qty" role="group" aria-label={`Quantity ${label}`}>
  <button type="button" aria-label="Decrease quantity" onClick={()=>onChange(qty-1)}><Minus size={14}/></button><b aria-live="polite">{qty}</b>
  <button type="button" aria-label="Increase quantity" onClick={()=>onChange(qty+1)}><Plus size={14}/></button></div>)}
