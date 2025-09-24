import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  fetchAuthSession,
  signIn as amplifySignIn,
  signOut as amplifySignOut,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
} from 'aws-amplify/auth';

const AuthContext = createContext(null);

// helper to grab email from the ID token
async function getEmailFromSession() {
  try {
    const s = await fetchAuthSession();
    const id = s?.tokens?.idToken?.toString?.();
    if (!id) return null;
    const payload = JSON.parse(atob(id.split('.')[1]));
    return payload?.email || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // { username, userId, email }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await getCurrentUser(); // throws if not signed in
        const email = await getEmailFromSession();
        if (!mounted) return;
        setUser({ username: u.username, userId: u.userId, email });
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async signIn({ email, password }) {
        const res = await amplifySignIn({ username: email, password });
        const mail = await getEmailFromSession();
        setUser({ username: res?.isSignedIn ? email : undefined, userId: email, email: mail || email });
        return res;
      },
      async signOut(opts = {}) {
        await amplifySignOut(opts);
        setUser(null);
      },
      async signUp({ email, password }) {
        return amplifySignUp({
          username: email,
          password,
          options: { userAttributes: { email }, autoSignIn: false },
        });
      },
      async confirmSignUp({ email, code }) {
        return amplifyConfirmSignUp({ username: email, confirmationCode: code });
      },
      async getAccessToken() {
        const s = await fetchAuthSession();
        return s?.tokens?.accessToken?.toString() || null;
      },
      async getIdToken() {
        const s = await fetchAuthSession();
        return s?.tokens?.idToken?.toString() || null;
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
