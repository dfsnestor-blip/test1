import React, { useEffect, useState } from 'react';
import { api } from '../api';

export default function VerExp({ token, id }:{ token:string, id:number }) {
  const [exp, setExp] = useState<any>(null);
  const [error, setError] = useState<string|null>(null);

  async function load() {
    try {
      const r = await api(`/api/expedientes/${id}`, 'GET', undefined, token);
      setExp(r);
    } catch (e:any) { setError(e.message); }
  }
  useEffect(()=>{ load(); }, [id]);

  return (
    <div>
      <h2>Expediente #{id}</h2>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {exp && (
        <div>
          <p><b>Número:</b> {exp.expediente.numero || '-'}</p>
          <p><b>Título:</b> {exp.expediente.titulo}</p>
          <p><b>Estado:</b> {exp.expediente.estado}</p>
          <h3>Documentos</h3>
          <ul>
            {exp.documentos.map((d:any) => (
              <li key={d.id}>
                {d.titulo} ({d.mime || 'archivo'}) 
                <a style={{ marginLeft: 8 }} href={(import.meta.env.VITE_API_URL || 'http://localhost:4001') + `/api/documentos/${d.id}/download`} target="_blank">Descargar</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
