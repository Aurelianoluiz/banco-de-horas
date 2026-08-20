# Banco PostgreSQL

As migrations desta pasta definem o schema da v1.0.

## Arquivos

- `001_initial.sql`: tabelas, relacionamentos, constraints e índices principais.
- `002_indexes.sql`: índices complementares para consultas frequentes.
- `env.example`: variáveis necessárias para conexão e autenticação.

## Configuração

Copie `env.example` para o arquivo de ambiente usado pelo servidor e preencha os valores reais. Nunca faça commit de credenciais reais.

Variáveis:

- `DATABASE_URL`: string de conexão PostgreSQL.
- `AUTH_SECRET`: segredo com pelo menos 32 caracteres.

## Aplicação

Execute as migrations em ordem (`001_initial.sql`, depois `002_indexes.sql`) em um banco PostgreSQL de desenvolvimento antes de produção.

## Regras estruturais

- `colaboradores.usuario_id` é opcional e único.
- Um colaborador não pode ter dois apontamentos no mesmo dia.
- Uma folga não pode ser duplicada para o mesmo colaborador/data.
- Uma competência só pode ser fechada uma vez por colaborador.
- Férias e atestados não aceitam intervalo com fim anterior ao início.
- Valores de auditoria são armazenados como `JSONB`.
- Índices são criados para consultas por colaborador, competência, data e auditoria.
