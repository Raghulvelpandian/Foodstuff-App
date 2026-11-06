import {Star,GitFork,Circle,ExternalLink,FolderGit2} from 'lucide-react';
import {ago} from '../lib/github.js';
export default function RepositoryCards({repos,loading,error}){
  const list=repos?.length?repos:null;
  if(!list&&!loading)return(<div className="grid3">{[0,1,2].map(i=><div key={i} className="card repo repo--ph"><FolderGit2 size={22}/><h4>Repository {i+1}</h4><p>{error||'Public repositories will appear here once a GitHub username is configured.'}</p></div>)}</div>);
  return(<div className="grid3">{(list||[0,1,2]).map((r,i)=>r.id?(
    <a key={r.id} className="card repo" href={r.html_url} target="_blank" rel="noreferrer"><h4><FolderGit2 size={18}/>{r.name}</h4><p>{r.description||'No description provided.'}</p>
      <div className="repo__m">{r.language&&<span><Circle size={10} fill="#FF6B35" stroke="none"/>{r.language}</span>}<span><Star size={14}/>{r.stargazers_count}</span><span><GitFork size={14}/>{r.forks_count}</span></div>
      <small>Updated {ago(r.pushed_at||r.updated_at)}<ExternalLink size={12}/></small></a>):<div key={i} className="card repo skel"/>)}</div>);
}
