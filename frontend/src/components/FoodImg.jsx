import {useState} from 'react';
export default function FoodImg({food,className=''}){const [bad,setBad]=useState(false);
  return(<div className={`fimg ${className}`}>{bad?<span className="fimg__e" role="img" aria-label={food.name}>{food.emoji}</span>:<img src={food.img} alt={food.name} loading="lazy" onError={()=>setBad(true)}/>}</div>)}
