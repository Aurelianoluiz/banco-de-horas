# Release 1.0.0 — Banco de Horas

## Versão

- Aplicação: `1.0.0`
- Branch de trabalho: `feat/xls-importacao`

## Critérios técnicos

- [x] Shell modular servido em `/`
- [x] PostgreSQL como fonte operacional de verdade
- [x] Autenticação e autorização por perfil
- [x] Isolamento de registros do colaborador
- [x] Auditoria
- [x] Fechamento transacional
- [x] Paginação e limites de consulta
- [x] Relatórios XLSX/PDF
- [x] PWA
- [x] Health check `/health`
- [x] Seed reproduzível de homologação
- [x] CI com validação estrutural e homologação automatizada
- [x] Smoke de carga
- [x] Matriz de permissões

## Gates de liberação

A release não deve ser marcada como aprovada enquanto qualquer item abaixo estiver pendente:

- [ ] Execução real do GitHub Actions com `validate` e `homologacao` verdes
- [ ] Homologação real contra PostgreSQL
- [ ] Ambiente de produção com `DATABASE_URL` e `AUTH_TOKEN_SECRET` configurados
- [ ] HTTPS/TLS terminado no ambiente de produção
- [ ] Backup e restauração do PostgreSQL validados
- [ ] Monitoramento/alertas configurados

## Procedimento

1. Executar o CI no GitHub.
2. Corrigir qualquer falha encontrada e repetir o ciclo.
3. Executar a homologação funcional.
4. Validar PostgreSQL e backup/restore.
5. Publicar a release `1.0.0` somente após todos os gates verdes.

## Regra de manutenção

Qualquer alteração posterior à aprovação deve repetir `npm run check`, `npm test` e a homologação funcional antes de ser considerada liberada.
