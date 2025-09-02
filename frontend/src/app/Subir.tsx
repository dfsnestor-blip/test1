import React, { useState } from 'react';
import { api } from '../api';

export default function Subir({ token }:{ token:string }) {
  const [file, setFile] = useState<File|null>(null);
  const [expedienteId, setExpedienteId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [msg, setMsg] = useState<string| null>(null);
  const [error, setError] = useState<string| null>(null);

  async function submit(e:React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setMsg(null); setError(null);
    const fd = new FormData();
    fd.append('file', file);
    if (expedienteId) fd.append('expedienteId', expedienteId);
    if (titulo) fd.append('titulo', titulo);
    try {
      await api('/api/documentos/upload', 'POST', fd, token);
      setMsg('Documento subido');
      setFile(null); setTitulo(''); setExpedienteId('');
    } catch (e:any) { setError(e.message); }
  }

  return (
    <form onSubmit={submit}>
      <h2>Subir documento</h2>
      <p><input type="file" onChange={e => setFile(e.target.files?.[0] || null)} /></p>
      <p><label>Expediente ID (opcional)<br/><input value={expedienteId} onChange={e=>setExpedienteId(e.target.value)} /></label></p>
      <p><label>Título (opcional)<br/><input value={titulo} onChange={e=>setTitulo(e.target.value)} /></label></p>
      <button>Subir</button>
      {msg && <p style={{ color: 'green' }}>{msg}</p>}
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
    </form>
  );
}
