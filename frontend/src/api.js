const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4001';

export async function api(path, method = 'GET', body, token) {
  const isForm = (typeof FormData !== 'undefined') && (body instanceof FormData);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isForm ? body : (body !== undefined ? JSON.stringify(body) : undefined)
  });
  if (!res.ok) {
    let msg = 'Error';
    try { const err = await res.json(); msg = err.error || JSON.stringify(err); } catch {}
    throw new Error(msg);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res;
}
