import {useEffect,useState} from 'react';
import {Github} from 'lucide-react';
import {CONFIG} from '../config.js'; import {gh} from '../lib/github.js';
import GitHubProfile from './GitHubProfile.jsx'; import ContributionHeatmap from './ContributionHeatmap.jsx';
import RepositoryCards from './RepositoryCards.jsx'; import RecentActivity from './RecentActivity.jsx';
const U=CONFIG.githubUser,API='https://api.github.com/users/'+U;
const NOW=new Date().getFullYear(),YEARS=[NOW,NOW-1,NOW-2,NOW-3];
export default function GitHubSection(){
  const [s,set]=useState({user:null,repos:null,events:null,heat:null,err:{},loading:!!U}),[year,setYear]=useState('last'),[hl,setHl]=useState(!!U);
  useEffect(()=>{if(!U)return;let on=true;
    Promise.allSettled([gh(API),gh(`${API}/repos?sort=pushed&per_page=30&type=owner`),gh(`${API}/events/public?per_page=30`)]).then(([u,r,e])=>{if(!on)return;
      const repos=r.value&&r.value.filter(x=>!x.fork).sort((a,b)=>b.stargazers_count-a.stargazers_count||new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,3);
      set(p=>({...p,user:u.value||null,repos,events:e.value||null,loading:false,err:{u:u.reason?.message,r:r.reason?.message,e:e.reason?.message}}))});return()=>{on=false}},[]);
  useEffect(()=>{if(!U)return;let on=true;setHl(true);
    // Third-party GitHub contribution calendar API (GitHub's REST API has no contribution calendar). Swap for your Django proxy if preferred.
    gh(`https://github-contributions-api.jogruber.de/v4/${U}?y=${year}`).then(d=>on&&set(p=>({...p,heat:d,err:{...p.err,h:null}}))).catch(e=>on&&set(p=>({...p,heat:null,err:{...p.err,h:e.message}}))).finally(()=>on&&setHl(false));return()=>{on=false}},[year]);
  const total=s.heat?(year==='last'?s.heat.contributions.reduce((a,c)=>a+c.count,0):s.heat.total?.[year]):null;
  return(<section id="github" className="sec"><div className="container">
    <div className="sec__head"><h2>Building in Public. Growing Every Day.</h2><p>Every contribution represents a step forward. Explore my development activity, repositories, and continuous journey of building software.</p></div>
    {!U&&<p className="note note--c">Set <code>VITE_GITHUB_USERNAME</code> in <code>.env</code> to load live GitHub data.</p>}
    <div className="stack"><GitHubProfile user={s.user} total={total} url={CONFIG.githubUrl} loading={s.loading}/>
      <ContributionHeatmap days={s.heat?.contributions} year={year} years={YEARS} onYear={setYear} total={total} loading={hl&&!!U} error={s.err.h}/>
      <h3 className="sub">Repository Highlights</h3><RepositoryCards repos={s.repos} loading={s.loading} error={s.err.r}/>
      <RecentActivity events={s.events} loading={s.loading} error={s.err.e} url={CONFIG.githubUrl}/></div>
    <div className="cta-c"><p>Want to explore my code?</p><a className="btn btn--primary" href={CONFIG.githubUrl} target="_blank" rel="noreferrer"><Github size={16}/>Visit My GitHub Profile</a></div>
  </div></section>);
}
