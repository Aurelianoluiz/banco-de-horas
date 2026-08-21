import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const PASSWORD_ITERATIONS = 600000;
const permissions = {
  admin: { '*': ['read', 'create', 'update', 'delete', 'approve'] },
  gestor: {
    dashboard: ['read'], colaboradores: ['read', 'create', 'update'], apontamentos: ['read', 'create', 'update'], bancoHoras: ['read'], ferias: ['read', 'create', 'update'], folgas: ['read', 'create', 'update'], relatorios: ['read'], configuracoes: ['read']
  },
  colaborador: {
    dashboard: ['read'], apontamentos: ['read', 'create'], bancoHoras: ['read'], ferias: ['read'], folgas: ['read']
  }
};

const normalizeRole = (perfil) => String(perfil || '').toLowerCase();
const hashPassword = (password, salt = randomBytes(16).toString('hex')) => {
  if (!password) throw new TypeError('senha é obrigatória');
  const hash = pbkdf2Sync(password, salt, PASSWORD_ITERATIONS, 32, 'sha256').toString('hex');
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt}$${hash}`;
};
const verifyPassword = (password, encoded) => {
  try {
    const [, rawIterations, salt, expected] = String(encoded || '').split('$');
    const iterations = Number(rawIterations);
    if (!Number.isInteger(iterations) || iterations <= 0 || !salt || !expected) return false;
    const actual = pbkdf2Sync(password || '', salt, iterations, 32, 'sha256').toString('hex');
    const a = Buffer.from(actual, 'hex'); const b = Buffer.from(expected, 'hex');
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
};
const sign = (payload, secret) => { const body = Buffer.from(JSON.stringify(payload)).toString('base64url'); const signature = createHmac('sha256', secret).update(body).digest('base64url'); return `${body}.${signature}`; };
const verifyToken = (token, secret) => {
  try {
    const [body, signature] = String(token || '').split('.'); if (!body || !signature) return null;
    const expected = createHmac('sha256', secret).update(body).digest('base64url'); const a = Buffer.from(signature); const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    return payload.exp && payload.exp < Date.now() ? null : payload;
  } catch { return null; }
};

export const createPostgresAuth = ({ repository, tokenSecret } = {}) => {
  if (!repository?.query) throw new TypeError('repository PostgreSQL inválido');
  if (!tokenSecret || tokenSecret.length < 32) throw new Error('AUTH_TOKEN_SECRET deve ter pelo menos 32 caracteres');
  const login = async ({ email, senha }) => {
    if (!email || !senha) return null;
    const result = await repository.query('SELECT id, nome, senha_hash, perfil, ativo FROM usuarios WHERE lower(email) = lower($1) LIMIT 1', [email]);
    const user = result.rows[0]; if (!user || !user.ativo || !verifyPassword(senha, user.senha_hash)) return null;
    const role = normalizeRole(user.perfil); if (!permissions[role]) return null;
    return { token: sign({ sub: user.id, role, exp: Date.now() + 8 * 60 * 60 * 1000 }, tokenSecret), user: { id: user.id, nome: user.nome, role } };
  };
  return { login, authenticate: async (token) => verifyToken(token, tokenSecret), authorize: async (identity, resource, action) => { if (!identity) return false; const role = permissions[normalizeRole(identity.role)] || {}; return role['*']?.includes(action) || role[resource]?.includes(action) || false; }, hashPassword };
};

export { hashPassword, verifyPassword, normalizeRole, PASSWORD_ITERATIONS };
