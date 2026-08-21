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

## Autorização e propriedade

- `admin`: acesso administrativo global conforme a matriz de permissões.
- `gestor`: acesso aos módulos administrativos/de gestão explicitamente permitidos; não recebe operações de fechamento, auditoria ou ajustes sem permissão correspondente.
- `colaborador`: acesso somente aos próprios registros de colaborador, apontamentos, férias, folgas e banco de horas; relatórios quando habilitados devem ser forçados ao próprio `colaboradorId`.
- A API nunca confia no `colaboradorId` enviado pelo cliente para um usuário com perfil `colaborador`; o identificador é derivado do vínculo `colaboradores.usuario_id`.
- Tentativas de acessar registros de outro colaborador retornam `403`.

## Produção

O sistema completo precisa de runtime Node.js + PostgreSQL. GitHub Pages não é usado para a aplicação full-stack, pois não executa o backend Node nem conecta diretamente ao PostgreSQL.
