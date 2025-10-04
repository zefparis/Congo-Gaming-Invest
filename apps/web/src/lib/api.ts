const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export async function apiFetch(path: string, init?: RequestInit) {
  const url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { credentials: 'include', ...init });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} @ ${url}\n${text}`);
  }
  return res;
}
