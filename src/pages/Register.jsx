import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await signUp({ email, password });
      nav(`/verify?email=${encodeURIComponent(email)}`);
    } catch (e) {
      setErr(e?.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5" style={{maxWidth: 480}}>
      <h2 className="mb-3">Create your account</h2>
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
          {submitting ? 'Creating…' : 'Create account'}
        </button>
        <p className="mt-2 mb-0 text-muted">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}
