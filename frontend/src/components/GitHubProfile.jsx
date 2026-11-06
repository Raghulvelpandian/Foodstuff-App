import {Github,BookMarked,GitCommitHorizontal,Users,UserPlus,ExternalLink} from 'lucide-react';
export default function GitHubProfile({user,total,url,loading}){
  const S=[[BookMarked,'Public Repositories',user?.public_repos],[GitCommitHorizontal,'Total Contributions',total],[Users,'Followers',user?.followers],[UserPlus,'Following',user?.following]];
  return(<div className="card gp"><div className="gp__top">
    {user?<img className="gp__av" src={user.avatar_url} alt={`${user.login} avatar`}/>:<span className="gp__av gp__av--ph"><Github size={34}/></span>}
    <div className="gp__id"><h3>{user?.name||(loading?'Loading…':'GitHub Developer')}</h3><p className="muted">@{user?.login||'username'}</p>
      <p>{user?.bio||'Profile bio will appear here once a GitHub username is configured.'}</p>
      <a className="link" href={url} target="_blank" rel="noreferrer"><ExternalLink size={14}/>{url.replace('https://','')}</a></div>
    <a className="btn btn--primary btn--sm" href={url} target="_blank" rel="noreferrer"><UserPlus size={15}/>Follow</a></div>
    <ul className="gp__stats">{S.map(([I,l,v])=><li key={l}><I size={18}/><b>{v==null?'–':Number(v).toLocaleString()}</b><span>{l}</span></li>)}</ul></div>);
}
