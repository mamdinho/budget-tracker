import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Logout() {
  const { signOut } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        // Global = revoke refresh token server-side too
        await signOut({ global: true });
      } finally {
        nav('/login', { replace: true });
      }
    })();
  }, [nav, signOut]);

  return <div className="container py-5">Signing you out…</div>;
}
