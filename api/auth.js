const roles = {
  admin: { '*': ['read', 'create', 'update', 'delete', 'approve'] },
  gestor: {
    dashboard: ['read'], colaboradores: ['read', 'create', 'update'], apontamentos: ['read', 'create', 'update'], bancoHoras: ['read'], ferias: ['read', 'create', 'update'], folgas: ['read', 'create', 'update'], relatorios: ['read'], configuracoes: ['read']
  },
  colaborador: {
    dashboard: ['read'], apontamentos: ['read', 'create'], bancoHoras: ['read'], ferias: ['read'], folgas: ['read']
  }
};

export const createAuth = ({ users = [], tokenSecret = 'development-only' } = {}) => {
  const findUser = (email) => users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  const encode = (payload) => Buffer.from(JSON.stringify({ ...payload, secret: tokenSecret })).toString('base64url');
  const decode = (token) => {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
      return payload.secret === tokenSecret ? payload : null;
    } catch { return null; }
  };

  const login = ({ email, senha }) => {
    const user = findUser(email || '');
    if (!user || user.senha !== senha) return null;
    return { token: encode({ sub: user.id, role: user.role }), user: { id: user.id, nome: user.nome, role: user.role } };
  };

  const authenticate = (token) => decode(token);
  const authorize = (identity, resource, action) => {
    if (!identity) return false;
    const permissions = roles[identity.role] || {};
    return permissions['*']?.includes(action) || permissions[resource]?.includes(action) || false;
  };

  return { login, authenticate, authorize };
};
