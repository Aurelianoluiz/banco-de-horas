# Homologação — Banco de Horas

## Configuração local rápida

Para Windows, use `scripts/start-local.bat`. O launcher oferece:

```text
[1] SQL - PostgreSQL + aplicação
[2] LOCAL - sem SQL/Docker
[0] Sair
```

O modo SQL é o recomendado para homologação funcional completa. O modo LOCAL é útil para testes de interface sem dependências externas.

Guia completo de instalação e diagnóstico: `docs/LOCAL.md`.

## Pré-requisitos SQL

- Node.js 20+
- Docker/Compose (recomendado para homologação reproduzível)
- PostgreSQL 16+ quando executado fora do Compose
- `DATABASE_URL`
- `AUTH_TOKEN_SECRET` com pelo menos 32 caracteres

## Opção A — Homologação com Docker Compose

Defina os segredos no ambiente do shell (não grave no Git):

```bash
export POSTGRES_PASSWORD='uma-senha-local-forte'
export AUTH_TOKEN_SECRET='um-segredo-local-com-pelo-menos-32-caracteres'
```

Suba a stack:

```bash
docker compose -f docker-compose.homologacao.yml up --build -d
```

Smoke test:

```bash
curl -fsS http://localhost:3000/health
```

Resultado esperado:

```json
{"status":"ok","database":"ok"}
```

Seed de dados fictícios:

```bash
export SEED_ADMIN_PASSWORD='senha-temporaria-admin'
export SEED_GESTOR_PASSWORD='senha-temporaria-gestor'
export SEED_COLABORADOR_PASSWORD='senha-temporaria-colaborador'
npm run seed:homologacao
```

O seed é idempotente e somente-aditivo: registros existentes não são sobrescritos.

Contas de homologação:

```text
admin.homologacao@bancodehoras.local
gestor.homologacao@bancodehoras.local
colaborador.homologacao@bancodehoras.local
```

Use senhas temporárias exclusivas do ambiente de homologação e troque/remova-as antes de qualquer uso fora desse ambiente.

Encerrar:

```bash
docker compose -f docker-compose.homologacao.yml down
```

## Opção B — Node + PostgreSQL local

Instalar dependências:

```bash
npm install
```

Aplicar o schema:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

Iniciar:

```bash
npm start
```

Health check:

```bash
curl -fsS http://localhost:3000/health
```

Seed:

```bash
export SEED_ADMIN_PASSWORD='senha-temporaria-admin'
export SEED_GESTOR_PASSWORD='senha-temporaria-gestor'
export SEED_COLABORADOR_PASSWORD='senha-temporaria-colaborador'
npm run seed:homologacao
```

A aplicação fica disponível na porta definida por `PORT` (padrão `3000`).

## Checklist funcional

### Autenticação

- Login válido
- Credencial inválida retorna 401
- Sessão expira
- Perfil ADMIN
- Perfil GESTOR
- Perfil COLABORADOR

### Jornada

- Criar apontamento
- Editar apontamento
- Excluir apontamento
- Jornada individual
- Tolerância individual
- Sexta-feira
- Sábado/domingo
- Crédito
- Débito

### Ausências

- Férias
- Folgas
- Feriados
- Atestados

### Banco de horas

- Saldo anterior
- Créditos
- Débitos
- Saldo final
- Fechamento mensal
- Bloqueio lógico por fechamento/auditoria

### Auditoria

- Criar
- Alterar
- Excluir
- Fechamento
- Identificação do usuário

### Relatórios

- Espelho de ponto
- Banco de horas
- Férias
- Folgas
- Fechamento
- Atrasos
- XLSX
- PDF
- Impressão

## Critérios técnicos

```bash
npm run check
npm test
```

A homologação não deve ser considerada concluída sem validar os dois comandos acima, o smoke test `/health` e um teste real contra PostgreSQL.
