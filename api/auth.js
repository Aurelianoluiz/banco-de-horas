import { createHmac, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const roles = {
  admin: { '*': ['read', 'create', 'update', 'delete', 'approve'] },
  gestor: {
    dashboard: ['read'], colaboradores: ['read', 'create', 'update'], apontamentos: ['read', 'create', 'update'], bancoHoras: ['read'], ferias: ['read', 'create', 'update'], folgas: ['read', 'create', 'update'], relatorios: ['read'], configuracoes: ['read']
  },
  colaborador: {
    dashboard: ['read'], apontamentos: ['read', 'create'], bancoHoras: ['read'], ferias: ['read'], folgas: ['read']
  }
};

const hashPassword = (password, salt = randomBytes(16).toString('hex')) => {
  const hash = pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex');
  return `pbkdf2$120000$${salt}$${hash}`;
};

const verifyPassword = (password, encoded) => {
  try {
    const [, iterations, salt, expected] = encoded.split('$');
    if (!iterations || !salt || !expected) return false;
    const actual = pbkdf2Sync(password, salt, Number(iterations), 32, 'sha256').toString('hex');
    return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
  } catch { return false; }
};

const sign = (payload, secret) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
};

const verifyToken = (token, secret) => {
  try {
    const [body, signature] = token.split('.');
    if (!body || !signature) return null;
    const expected = createHmac('sha256', secret).update(body).digest('base64url');
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
};

export const createAuth = ({ users = [], tokenSecret } = {}) => {
  if (!tokenSecret || tokenSecret.length < 32) throw new Error('AUTH_TOKEN_SECRET deve ter pelo menos 32 caracteres');
  const findUser = (email) => users.find((user) => user.email?.toLowerCase() === email.toLowerCase()) ?? null;

  const login = ({ email, senha }) => {
    const user = findUser(email || '');
    if (!user || !verifyPassword(senha || '', user.senhaHash)) return null;
    return {
      token: sign({ sub: user.id, role: user.role, exp: Date.now() + 8 * 60 * 60 * 1000 }, tokenSecret),
      user: { id: user.id, nome: user.nome, role: user.role }
    };
  };

  const authenticate = (token) => verifyToken(token, tokenSecret);
  const authorize = (identity, resource, action) => {
    if (!identity) return false;
    const permissions = roles[identity.role] || {};
    return permissions['*']?.includes(action) || permissions[resource]?.includes(action) || false;
  };

  return { login, authenticate, authorize, hashPassword };
};
