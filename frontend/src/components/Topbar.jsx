import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Topbar({ onToggleSidebar }) {
  const { token, logout } = useAuth();
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="btn ghost-btn" onClick={onToggleSidebar} aria-label="menu">☰</button>
      </div>
      <div className="topbar-right">
        <button className="btn ghost-btn" onClick={()=>alert('Share: coming soon')}>Share</button>
        <button className="btn ghost-btn" onClick={()=>alert('Starred!')}>☆</button>
        {token && <button className="btn" onClick={logout}>登出</button>}
      </div>
    </header>
  );
}


