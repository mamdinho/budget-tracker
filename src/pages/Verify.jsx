import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Verify() {
  const { confirmSignUp } = useAuth();
  const [params] = useSearchParams();
  const emailParam = params.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nav = useNavigate();

  useEffect(() => setEmail(emailParam), [emailParam]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await confirmSignUp({ email, code });
      nav('/login');
    } catch (e) {
      setErr(e?.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container py-5" style={{maxWidth: 480}}>
      <h2 className="mb-3">Verify your email</h2>
      <p className="text-muted">Enter the verification code sent to your email.</p>
      <form onSubmit={onSubmit} className="vstack gap-3">
        <div>
          <label className="form-label">Email</label>
          <input className="form-control" type="email" value={email}
                 onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="form-label">Verification Code</label>
          <input className="form-control" value={code}
                 onChange={e => setCode(e.target.value)} required />
        </div>
        {err && <div className="alert alert-danger py-2">{err}</div>}
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Verifying…' : 'Verify'}
        </button>
      </form>
    </div>
  );
}
