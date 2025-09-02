import React, { useEffect, useState } from 'react';
import { api } from '../api';

type Expediente = { id:number, numero:string, titulo:string, estado:string, created_at:string };

export default function Expedientes({ token, onOpen }:{ token:string, onOpen:(id:number)=>void }) {
  const [items, setItems] = useState<Expediente[]>([]);
  const [titulo, setTitulo] = useState('');
  const [error, setError] = useState<string|null>(null);

  async function load() {
    try { const r = await api('/api/expedientes', 'GET', undefined, token); setItems(r); }
    catch (e:any) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function crear(e:React.FormEvent) {
    e.preventDefault();
    try {
      const r = await api('/api/expedientes', 'POST', { titulo }, token);
      setTitulo('');
      await load();
      onOpen(r.id);
    } catch (e:any) { setError(e.message); }
  }

  return (
    <div>
      <h2>Expedientes</h2>
      <form onSubmit={crear} style={{ marginBottom: 12 }}>
        <input placeholder="Título del expediente" value={titulo} onChange={e=>setTitulo(e.target.value)} />
        <button style={{ marginLeft: 8 }}>Crear</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <table width="100%" cellPadding="6" style={{ borderCollapse:'collapse' }}>
        <thead><tr><th>ID</th><th>Número</th><th>Título</th><th>Estado</th><th>Acción</th></tr></thead>
        <tbody>
          {items.map(x => (
            <tr key={x.id} style={{ borderTop:'1px solid #ddd' }}>
              <td>{x.id}</td><td>{x.numero || '-'}</td><td>{x.titulo}</td><td>{x.estado}</td>
              <td><button onClick={()=>onOpen(x.id)}>Abrir</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
