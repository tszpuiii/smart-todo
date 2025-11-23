import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  async function onSubmit(e) {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate(from, { replace: true });
  }

  return (
    <div className={`login-container ${loading ? 'logging' : ''}`}>
      <div className="top" />
      <div className="bottom" />
      <div className="center">
        <h2>Please Sign In</h2>
        <form onSubmit={onSubmit} className="login-form">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <div className="error" style={{margin:'8px 0'}}>{error}</div>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div style={{marginTop:12}}>
          <span style={{color:'var(--muted)'}}>No account?</span>{' '}
          <Link to="/register">Create one</Link>
        </div>
      </div>
      <div className="login-overlay">
        <div className="spinner" />
      </div>
    </div>
  );
}


