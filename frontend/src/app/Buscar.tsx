import React, { useState } from 'react';
import { api } from '../api';

type Doc = { id:number, titulo:string, expediente_id:number, expediente_numero?:string };

export default function Buscar({ token, onOpen }:{ token:string, onOpen:(expId:number)=>void }) {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Doc[]>([]);
  const [error, setError] = useState<string|null>(null);

  async function search(e:React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const r = await api(`/api/busqueda?q=${encodeURIComponent(q)}`, 'GET', undefined, token);
      setItems(r);
    } catch (e:any) { setError(e.message); }
  }

  return (
    <div>
      <h2>Buscar</h2>
      <form onSubmit={search}>
        <input placeholder="palabra clave..." value={q} onChange={e=>setQ(e.target.value)} />
        <button>Buscar</button>
      </form>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      <ul>
        {items.map(x => (
          <li key={x.id}>
            <b>{x.titulo}</b> – exp #{x.expediente_id} {x.expediente_numero ? `(${x.expediente_numero})` : ''}
            <button style={{ marginLeft: 8 }} onClick={()=>onOpen(x.expediente_id)}>Abrir expediente</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
