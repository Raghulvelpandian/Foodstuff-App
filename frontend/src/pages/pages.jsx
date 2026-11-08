import {Link} from 'react-router-dom';
import {useConsent} from '../context/Consent.jsx'; import {BUSINESS} from '../config.js';
import * as C from './legalContent.js';
function Doc({doc}){const {setOpen}=useConsent();
  return(<section className="sec sec--page"><div className="container legal"><div className="page-h"><h1>{doc.title}</h1><p className="muted">Last updated {BUSINESS.updated}</p></div>
    <p className="lead">{doc.intro}</p>
    {doc.cookiesTable&&<button className="btn btn--primary" onClick={()=>setOpen(true)}>Change cookie preferences</button>}
    {doc.sections.map(s=><div key={s.h} className="legal__s"><h2>{s.h}</h2>{s.p?.map(t=><p key={t}>{t}</p>)}
      {s.table&&<div className="legal__t"><table><thead><tr><th>Name</th><th>Purpose</th><th>Type</th><th>Kept</th></tr></thead><tbody>{s.table.map(r=><tr key={r[0]}>{r.map((c,i)=><td key={i} data-label={['Name','Purpose','Type','Kept'][i]}>{c}</td>)}</tr>)}</tbody></table></div>}
      {s.list&&<ul>{s.list.map(t=><li key={t}>{t}</li>)}</ul>}{s.p2?.map(t=><p key={t}>{t}</p>)}</div>)}
    <p className="muted legal__f">Related: <Link to="/privacy">Privacy</Link> · <Link to="/cookies">Cookies</Link> · <Link to="/refunds">Refunds &amp; Cancellation</Link> · <Link to="/delivery">Delivery</Link></p></div></section>)}
export const Privacy=()=><Doc doc={C.privacy()}/>;
export const Cookies=()=><Doc doc={C.cookies()}/>;
export const Refunds=()=><Doc doc={C.refunds()}/>;
export const Delivery=()=><Doc doc={C.delivery()}/>;
