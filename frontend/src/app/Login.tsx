import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ onLogin }: { onLogin: (t: string) => void }) {
  const [email, setEmail] = useState('admin@muni.cl');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await api('/api/auth/login', 'POST', { email, password });
      onLogin(res.token);
    } catch (e: any) { setError(e.message); }
  }

  return (
    <form onSubmit={submit}>
      <h2>Ingreso</h2>
      <p><label>Email<br/><input value={email} onChange={e => setEmail(e.target.value)} /></label></p>
      <p><label>Contraseña<br/><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label></p>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <button>Entrar</button>
    </form>
  );
}
