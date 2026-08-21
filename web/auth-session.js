const TOKEN_KEY = 'bh.auth.token';
const USER_KEY = 'bh.auth.user';

const storage = () => {
  if (typeof sessionStorage === 'undefined') throw new Error('sessionStorage indisponível');
  return sessionStorage;
};

export const authSession = {
  get token() { try { return storage().getItem(TOKEN_KEY); } catch { return null; } },
  get user() { try { const raw = storage().getItem(USER_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } },
  isAuthenticated() { return Boolean(this.token && this.user); },
  set({ token, user }) {
    if (!token || !user?.id || !user?.role) throw new TypeError('Sessão inválida');
    storage().setItem(TOKEN_KEY, token); storage().setItem(USER_KEY, JSON.stringify(user));
    return this.user;
  },
  clear() { try { storage().removeItem(TOKEN_KEY); storage().removeItem(USER_KEY); } catch {} },
  requireAuth({ redirect = '/login.html' } = {}) {
    if (this.isAuthenticated()) return true;
    if (typeof window !== 'undefined') window.location.assign(redirect);
    return false;
  }
};

if (typeof window !== 'undefined') window.BancoHorasAuth = authSession;
