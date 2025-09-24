import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn, user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || '/app';

  // If already authenticated, go straight to app
  useEffect(() => {
    if (user) nav(from, { replace: true });
  }, [user, from, nav]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await signIn({ email, password });
      nav(from, { replace: true });
    } catch (e) {
      const msg = e?.message || '';
      // If Amplify says we’re already signed in, either redirect or force sign out then retry
      if (/already.*signed in/i.test(msg)) {
        // Option A: Just redirect to the app
        nav('/app', { replace: true });
        // Option B (alternative): force sign out then retry sign-in
        // await signOut({ global: true });
        // await signIn({ email, password });
        // nav(from, { replace: true });
        return;
      }
      setErr(msg || 'Failed to sign in');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5" style={{maxWidth: 480}}>
      <h2 className="mb-3">Login</h2>
      <form onSubmit={onSubmit} className="vstack gap-3">
        <div>
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input className="form-control" type="password" value={password}
                 onChange={e => setPassword(e.target.value)} required />
        </div>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </button>
        <p className="mt-2 mb-0 text-muted">
          Don’t have an account? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
