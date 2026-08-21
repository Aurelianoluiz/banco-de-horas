# Homologação — Banco de Horas

## Pré-requisitos

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
{"status":"ok"}
```

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
