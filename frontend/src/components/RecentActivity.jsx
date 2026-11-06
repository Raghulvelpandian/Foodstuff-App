import {GitCommitHorizontal,GitPullRequest,CircleDot,FolderPlus,Star,GitFork,Activity} from 'lucide-react';
const M={PushEvent:[GitCommitHorizontal,e=>`Pushed ${e.payload.size??e.payload.commits?.length??''} commit(s)`.replace('  ',' ')],PullRequestEvent:[GitPullRequest,e=>`${cap(e.payload.action)} a pull request`],
 IssuesEvent:[CircleDot,e=>`${cap(e.payload.action)} an issue`],CreateEvent:[FolderPlus,e=>`Created ${e.payload.ref_type}${e.payload.ref?` ${e.payload.ref}`:''}`],
 WatchEvent:[Star,()=>'Starred a repository'],ForkEvent:[GitFork,()=>'Forked a repository']};
const cap=s=>s?s[0].toUpperCase()+s.slice(1):'';
export default function RecentActivity({events,loading,error,url}){
  const list=(events||[]).filter(e=>M[e.type]).slice(0,8);
  return(<div className="card act"><h3>Recent Activity</h3>
    {loading?<div className="skel"/>:!list.length?<p className="empty">{error||'No recent public activity to show.'} <a className="link" href={url} target="_blank" rel="noreferrer">View GitHub profile</a></p>:
    <ol>{list.map(e=>{const [I,t]=M[e.type];return(<li key={e.id}><span className="act__ic"><I size={16}/></span><div><b>{e.repo.name}</b><p>{t(e)}</p></div>
      <time dateTime={e.created_at}>{new Date(e.created_at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</time></li>)})}</ol>}</div>);
}
