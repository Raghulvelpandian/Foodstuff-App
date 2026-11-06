import {useMemo} from 'react';
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export default function ContributionHeatmap({days,year,years,onYear,total,loading,error}){
  const {weeks,months}=useMemo(()=>{
    if(!days?.length)return{weeks:[],months:[]};
    const pad=new Date(days[0].date+'T00:00:00').getDay(),cells=[...Array(pad).fill(null),...days],w=[];
    for(let i=0;i<cells.length;i+=7)w.push(cells.slice(i,i+7));
    let last=-1;const m=w.map(wk=>{const f=wk.find(Boolean);const mo=f?new Date(f.date+'T00:00:00').getMonth():-1;const s=mo!==last&&mo>-1;if(mo>-1)last=mo;return s?MON[mo]:''});
    return{weeks:w,months:m}},[days]);
  return(<div className="card hm"><div className="hm__top"><h3>{total!=null?`${total.toLocaleString()} contributions`:'Contribution activity'}</h3>
    <select aria-label="Select year" value={year} onChange={e=>onYear(e.target.value)}><option value="last">Last 12 months</option>{years.map(y=><option key={y}>{y}</option>)}</select></div>
    {error?<p className="empty">{error}</p>:loading?<div className="skel"/>:!days?.length?<p className="empty">Contribution data appears here once a GitHub username is configured.</p>:
    <div className="hm__scroll"><div className="hm__wrap"><div className="hm__days"><span/><span>Mon</span><span/><span>Wed</span><span/><span>Fri</span><span/></div>
      <div><div className="hm__months" style={{gridTemplateColumns:`repeat(${weeks.length},13px)`}}>{months.map((m,i)=><span key={i}>{m}</span>)}</div>
        <div className="hm__grid" role="img" aria-label="Contribution calendar">{weeks.map((wk,i)=><div key={i} className="hm__col">{Array.from({length:7},(_,j)=>{const d=wk[j];
          return d?<i key={j} className={`lv${d.level}`} title={`${d.count} contribution${d.count===1?'':'s'} on ${new Date(d.date+'T00:00:00').toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}`}/>:<i key={j} className="blank"/>})}</div>)}</div></div></div></div>}
    <div className="hm__leg"><span>Less</span>{[0,1,2,3,4].map(l=><i key={l} className={`lv${l}`}/>)}<span>More</span></div></div>);
}
