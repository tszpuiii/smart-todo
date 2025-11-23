import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register, loading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    const ok = await register(name, email, password);
    if (ok) navigate('/', { replace: true });
  }

  return (
    <div className="login-container">
      <div className="top" />
      <div className="bottom" />
      <div className="center">
        <h2>Create Account</h2>
        <form onSubmit={onSubmit} className="login-form">
          <input
            placeholder="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <div className="error" style={{margin:'8px 0'}}>{error}</div>}
          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </form>
        <div style={{marginTop:12}}>
          <span style={{color:'var(--muted)'}}>Already have an account?</span>{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}


