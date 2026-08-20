CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('ADMIN', 'GESTOR', 'COLABORADOR')),
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colaboradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID UNIQUE REFERENCES usuarios(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  salario NUMERIC(12,2),
  jornada TEXT,
  tolerancia INTERVAL NOT NULL DEFAULT INTERVAL '15 minutes',
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS apontamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  data DATE NOT NULL,
  entrada TIME,
  saida TIME,
  intervalo INTERVAL NOT NULL DEFAULT INTERVAL '0 minutes',
  ocorrencia TEXT NOT NULL DEFAULT 'Normal',
  horas_trabalhadas INTERVAL,
  horas_previstas INTERVAL,
  saldo INTERVAL,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (colaborador_id, data)
);

CREATE TABLE IF NOT EXISTS ferias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  inicio DATE NOT NULL,
  fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'planejada',
  CHECK (fim >= inicio)
);

CREATE TABLE IF NOT EXISTS folgas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  data DATE NOT NULL,
  motivo TEXT,
  origem TEXT,
  status TEXT NOT NULL DEFAULT 'planejada',
  UNIQUE (colaborador_id, data)
);

CREATE TABLE IF NOT EXISTS feriados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data DATE NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  UNIQUE (data, nome)
);

CREATE TABLE IF NOT EXISTS atestados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  inicio DATE NOT NULL,
  fim DATE NOT NULL,
  motivo TEXT,
  CHECK (fim >= inicio)
);

CREATE TABLE IF NOT EXISTS ajustes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  competencia CHAR(7) NOT NULL,
  minutos INTEGER NOT NULL,
  motivo TEXT NOT NULL,
  usuario_id UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fechamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id),
  competencia CHAR(7) NOT NULL,
  saldo_anterior INTEGER NOT NULL DEFAULT 0,
  creditos INTEGER NOT NULL DEFAULT 0,
  debitos INTEGER NOT NULL DEFAULT 0,
  saldo_final INTEGER NOT NULL,
  fechado_por UUID REFERENCES usuarios(id),
  fechado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (colaborador_id, competencia)
);

CREATE TABLE IF NOT EXISTS auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  acao TEXT NOT NULL,
  entidade TEXT NOT NULL,
  registro_id TEXT,
  antes JSONB,
  depois JSONB,
  sessao_id TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_apontamentos_colaborador_data ON apontamentos (colaborador_id, data);
CREATE INDEX IF NOT EXISTS idx_auditoria_entidade_registro ON auditoria (entidade, registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_data ON auditoria (usuario_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_ferias_colaborador_inicio ON ferias (colaborador_id, inicio);
CREATE INDEX IF NOT EXISTS idx_folgas_colaborador_data ON folgas (colaborador_id, data);
CREATE INDEX IF NOT EXISTS idx_ajustes_colaborador_competencia ON ajustes (colaborador_id, competencia);
CREATE INDEX IF NOT EXISTS idx_fechamentos_competencia ON fechamentos (competencia);
