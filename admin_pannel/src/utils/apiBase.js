export function getApiBase() {
  // In development, always use relative '/api' so requests go through Vite proxy
  if (import.meta.env && import.meta.env.DEV) {
    return '/api';
  }
  const backend = import.meta.env.VITE_BACKEND_SERVER || import.meta.env.VITE_APP_BASE_URL || '';
  if (!backend) return '/api';
  const base = backend.replace(/\/$/, '');
  // ensure the '/api' prefix is present for backend routes
  return base.replace(/\/?api\/?$/i, '').replace(/\/$/, '') + '/api';
}

export default getApiBase;
