# Homologação — Banco de Horas

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16+
- `DATABASE_URL`
- `AUTH_TOKEN_SECRET`

## Preparação

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

A homologação não deve ser considerada concluída sem validar os dois comandos acima e um teste real contra PostgreSQL.
