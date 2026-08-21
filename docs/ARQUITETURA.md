# Arquitetura — Banco de Horas

## Visão

```text
Browser / PWA
     |
     v
server.js
     |
     +--> Web shell / módulos
     |
     +--> HTTP API
             |
             v
          Services
             |
             v
       Regras de negócio
             |
             v
       PostgreSQLRepository
             |
             v
         PostgreSQL
```

## Camadas

### Web

- `app-shell.html`
- `web/*-controller.js`
- `web/*-view.js`
- `web/api-client.js`
- `web/auth-session.js`
- `web/auth-guard.js`

### API

- `api/http.js`
- `api/application.js`
- `api/auth-postgres.js`
- `api/services/*`

### Regras

- `rules/jornada.js`
- `rules/fechamento.js`
- `rules/compensacao.js`

### Persistência

- `api/repository-postgres.js`
- `database/schema.sql`

## Fonte de verdade

A partir da arquitetura modular, PostgreSQL é a fonte operacional de verdade. `localStorage` permanece somente em código legado isolado e não faz parte do fluxo principal servido em `/`.

## Produção

O sistema completo precisa de runtime Node.js + PostgreSQL. GitHub Pages não é usado para a aplicação full-stack, pois não executa o backend Node nem conecta diretamente ao PostgreSQL.
