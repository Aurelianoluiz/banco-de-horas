import { authSession } from './auth-session.js';

const isPublic = () => {
  const path = window.location.pathname;
  return path === '/login.html' || path.startsWith('/api/');
};

if (!isPublic()) {
  authSession.requireAuth({ redirect: '/login.html' });
}

if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', () => {
    if (!isPublic()) authSession.requireAuth({ redirect: '/login.html' });
  });
}
