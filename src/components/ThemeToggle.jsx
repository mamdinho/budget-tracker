import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  return (
    <button
      className="btn btn-sm btn-outline-secondary"
      onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? 'Dark' : 'Light'} mode
    </button>
  );
}
