import {Link} from 'react-router-dom';
export default function NotFound(){return<div className="container sec sec--page"><div className="empty-s"><h4>Page not found</h4><p>The page you're looking for doesn't exist.</p><Link className="btn btn--primary" to="/">Go home</Link></div></div>}
