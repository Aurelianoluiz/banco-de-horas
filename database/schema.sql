-- Banco de Horas v1.0
-- PostgreSQL 16+
-- Valores de tempo são armazenados em minutos para manter os cálculos determinísticos.

create table if not exists usuarios (
  id uuid primary key,
  nome varchar(160) not null,
  email varchar(255) not null unique,
  senha_hash text not null,
  perfil varchar(20) not null check (perfil in ('admin','gestor','colaborador')),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists colaboradores (
  id uuid primary key,
  usuario_id uuid unique references usuarios(id),
  nome varchar(160) not null,
  salario numeric(12,2),
  carga_seg_qui_min integer not null default 540 check (carga_seg_qui_min >= 0),
  carga_sexta_min integer not null default 480 check (carga_sexta_min >= 0),
  tolerancia_min integer not null default 15 check (tolerancia_min >= 0),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create table if not exists apontamentos (
  id uuid primary key,
  colaborador_id uuid not null references colaboradores(id),
  data date not null,
  entrada_min integer check (entrada_min between 0 and 1439),
  intervalo_min integer not null default 0 check (intervalo_min >= 0),
  saida_min integer check (saida_min between 0 and 1439),
  ocorrencia varchar(30) not null default 'Normal',
  minutos_trabalhados integer,
  minutos_previstos integer,
  saldo_min integer,
  extra_min integer default 0,
  noturno_min integer default 0,
  observacao text,
  aprovado boolean not null default false,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now(),
  unique (colaborador_id, data)
);

create table if not exists feriados (
  id uuid primary key,
  data date not null unique,
  descricao varchar(160) not null,
  tipo varchar(20) not null check (tipo in ('Nacional','Estadual','Municipal','Empresa'))
);

create table if not exists ferias (
  id uuid primary key,
  colaborador_id uuid not null references colaboradores(id),
  inicio date not null,
  fim date not null,
  dias integer not null check (dias >= 0),
  status varchar(20) not null check (status in ('Programada','Solicitada','Aprovada','Cancelada')),
  check (fim >= inicio)
);

create table if not exists folgas (
  id uuid primary key,
  colaborador_id uuid not null references colaboradores(id),
  data date not null,
  motivo varchar(160) not null,
  origem varchar(30) not null check (origem in ('Banco de horas','Escala','Outro')),
  status varchar(20) not null check (status in ('Solicitada','Aprovada','Cancelada')),
  unique (colaborador_id, data)
);

create table if not exists atestados (
  id uuid primary key,
  colaborador_id uuid not null references colaboradores(id),
  inicio date not null,
  fim date not null,
  motivo text,
  status varchar(20) not null default 'Pendente',
  check (fim >= inicio)
);

create table if not exists ajustes (
  id uuid primary key,
  colaborador_id uuid not null references colaboradores(id),
  data date not null,
  minutos integer not null,
  motivo varchar(255) not null,
  usuario_id uuid not null references usuarios(id),
  criado_em timestamptz not null default now()
);

create table if not exists fechamentos (
  id uuid primary key,
  colaborador_id uuid not null references colaboradores(id),
  competencia char(7) not null,
  saldo_anterior_min integer not null default 0,
  creditos_min integer not null default 0,
  debitos_min integer not null default 0,
  saldo_final_min integer not null,
  fechado_por uuid not null references usuarios(id),
  fechado_em timestamptz not null default now(),
  unique (colaborador_id, competencia)
);

create table if not exists auditoria (
  id uuid primary key,
  usuario_id uuid references usuarios(id),
  entidade varchar(50) not null,
  registro_id uuid,
  acao varchar(30) not null,
  valor_anterior jsonb,
  valor_novo jsonb,
  ip inet,
  sessao varchar(255),
  criado_em timestamptz not null default now()
);

create table if not exists configuracoes (
  chave varchar(100) primary key,
  valor jsonb not null,
  atualizado_por uuid references usuarios(id),
  atualizado_em timestamptz not null default now()
);

create index if not exists idx_apontamentos_colaborador_data on apontamentos(colaborador_id, data);
create index if not exists idx_apontamentos_data on apontamentos(data);
create index if not exists idx_ferias_colaborador_periodo on ferias(colaborador_id, inicio, fim);
create index if not exists idx_folgas_colaborador_data on folgas(colaborador_id, data);
create index if not exists idx_atestados_colaborador_periodo on atestados(colaborador_id, inicio, fim);
create index if not exists idx_ajustes_colaborador_data on ajustes(colaborador_id, data);
create index if not exists idx_ajustes_usuario_data on ajustes(usuario_id, criado_em);
create index if not exists idx_fechamentos_colaborador_competencia on fechamentos(colaborador_id, competencia);
create index if not exists idx_auditoria_entidade_registro on auditoria(entidade, registro_id, criado_em);
create index if not exists idx_auditoria_usuario_data on auditoria(usuario_id, criado_em);
