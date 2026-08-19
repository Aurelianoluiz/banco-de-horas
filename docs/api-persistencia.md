# API e persistência — v1.0

A aplicação atual continua usando `localStorage` como protótipo. O próximo estágio substitui essa implementação por API + PostgreSQL, sem mover regras de negócio para a interface.

## Camadas

```text
Web/PWA
  ↓
API HTTP
  ↓
Serviços de domínio
  ↓
Repositórios
  ↓
PostgreSQL
```

## Recursos

- `GET/POST /api/colaboradores`
- `GET/PATCH/DELETE /api/colaboradores/:id`
- `GET/POST /api/apontamentos`
- `GET/PATCH/DELETE /api/apontamentos/:id`
- `GET/POST /api/ferias`
- `GET/POST /api/folgas`
- `GET/POST /api/feriados`
- `GET/POST /api/atestados`
- `GET/POST /api/ajustes`
- `GET/POST /api/fechamentos`
- `GET /api/auditoria`
- `GET/PATCH /api/configuracoes`

## Regras de autorização

- `admin`: acesso completo.
- `gestor`: colaboradores, jornada, aprovações, fechamentos e relatórios conforme escopo.
- `colaborador`: somente os próprios apontamentos, férias, folgas, atestados e relatórios autorizados.

A autorização deve ser aplicada no servidor. Ocultar um botão na UI não é controle de segurança.

## Fechamento

Um fechamento deve ser transacional. Após fechado, o período não pode ser alterado diretamente. Uma correção deve gerar um `ajuste` e uma entrada de `auditoria`.

## Persistência

O schema inicial está em `database/schema.sql` e usa minutos inteiros para os valores calculados, evitando ambiguidades de ponto flutuante.

## Migração do protótipo

1. Ler dados do `localStorage`.
2. Validar contra o modelo de domínio.
3. Mostrar prévia.
4. Criar registros no PostgreSQL.
5. Registrar a importação na auditoria.
6. Alternar a aplicação para a API.

Não remover o armazenamento local antes de existir uma migração verificável.
