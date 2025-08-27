export function getApiBase() {
  const backend = import.meta.env.VITE_BACKEND_SERVER || import.meta.env.VITE_APP_BASE_URL || '';
  if (!backend) return '/api'; // use Vite proxy in dev which keeps requests same-origin and sends cookies
  const base = backend.replace(/\/$/, '');
  // ensure the '/api' prefix is present for backend routes
  return base.replace(/\/?api\/?$/i, '').replace(/\/$/, '') + '/api';
}

export default getApiBase;
