// Small helper to refresh access token from backend
export async function refreshAccessToken() {
  const res = await fetch('/api/clients/refresh', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to refresh token');
  const data = await res.json();
  if (!data.ok || !data.token) throw new Error('Refresh failed');
  localStorage.setItem('token', data.token);
  return data.token;
}
