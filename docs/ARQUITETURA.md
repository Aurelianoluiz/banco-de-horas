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

## Autorização

A API aplica permissões por perfil antes da execução do handler e também aplica escopo de propriedade para o perfil `colaborador`.

| Módulo | ADMIN | GESTOR | COLABORADOR |
|---|---|---|---|
| Dashboard | total | leitura | leitura |
| Colaboradores | total | leitura/criar/editar | sem acesso |
| Apontamentos | total | leitura/criar/editar | leitura/criar — próprios |
| Banco de Horas | total | leitura | leitura — próprio |
| Férias | total | leitura/criar/editar | leitura — próprias |
| Folgas | total | leitura/criar/editar | leitura — próprias |
| Feriados | total | sem acesso | sem acesso |
| Atestados | total | sem acesso | sem acesso |
| Ajustes | total | sem acesso | sem acesso |
| Configurações | total | leitura | sem acesso |
| Fechamentos | aprovar/total | sem acesso | sem acesso |
| Auditoria | total | sem acesso | sem acesso |
| Relatórios | total | leitura | leitura — próprios |

A matriz é coberta por `tests/permission-matrix.test.js` e o fluxo HTTP real de homologação por `tests/permission-http-smoke.mjs`.

Para colaboradores, o backend resolve `usuarios.id -> colaboradores.usuario_id` e nunca confia no `colaboradorId` enviado pelo cliente para definir a propriedade do registro.

## Produção

O sistema completo precisa de runtime Node.js + PostgreSQL. GitHub Pages não é usado para a aplicação full-stack, pois não executa o backend Node nem conecta diretamente ao PostgreSQL.
