import React, { useEffect, useState } from 'react';
import Login from './Login';
import Expedientes from './Expedientes';
import Subir from './Subir';
import Buscar from './Buscar';
import VerExp from './VerExp';

type View = 'login' | 'expedientes' | 'subir' | 'buscar' | 'verExp';

export default function App() {
  const [view, setView] = useState<View>('login');
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [expId, setExpId] = useState<number | null>(null);

  useEffect(() => { if (token) setView('expedientes'); }, []);

  function onLogin(t: string) { localStorage.setItem('token', t); setToken(t); setView('expedientes'); }
  function logout() { localStorage.removeItem('token'); setToken(null); setView('login'); }

  return (
    <div style={{ maxWidth: 1000, margin: '32px auto', fontFamily: 'system-ui, Arial' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>🏛️ MuniDocs</h1>
        {token && <button onClick={logout}>Salir</button>}
      </header>
      {token && (
        <nav style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <button onClick={() => setView('expedientes')}>Expedientes</button>
          <button onClick={() => setView('subir')}>Subir documento</button>
          <button onClick={() => setView('buscar')}>Buscar</button>
        </nav>
      )}
      {!token && <Login onLogin={onLogin} />}
      {token && view === 'expedientes' && <Expedientes token={token} onOpen={(id) => { setExpId(id); setView('verExp'); }} />}
      {token && view === 'subir' && <Subir token={token} />}
      {token && view === 'buscar' && <Buscar token={token} onOpen={(id) => { setExpId(id); setView('verExp'); }} />}
      {token && view === 'verExp' && expId && <VerExp token={token} id={expId} />}
    </div>
  );
}
