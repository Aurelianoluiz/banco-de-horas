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
- [x] Health check com verificação do PostgreSQL
- [x] Seed reproduzível de homologação
- [x] CI com validação estrutural e homologação automatizada
- [x] Smoke de carga
- [x] Matriz de permissões
- [x] Rotinas versionadas de backup/restore
- [x] Contrato de TLS documentado

## Gates de liberação

A release não deve ser marcada como aprovada enquanto qualquer item abaixo estiver pendente:

- [ ] Execução real do GitHub Actions com `validate` e `homologacao` verdes
- [ ] Homologação real contra PostgreSQL
- [ ] Ambiente de produção com `DATABASE_URL` e `AUTH_TOKEN_SECRET` configurados
- [ ] HTTPS/TLS terminado no ambiente de produção
- [ ] Backup real criado e restaurado com sucesso em ambiente autorizado
- [ ] Monitoramento/alertas configurados

## Operação

### Health

`GET /health` retorna `200` com `{"status":"ok","database":"ok"}` quando Node e PostgreSQL estão saudáveis. Se a aplicação estiver viva mas o banco estiver indisponível, retorna `503` e `{"status":"degraded","database":"down"}`.

### Backup

```bash
export DATABASE_URL='postgres://...'
export BACKUP_DIR='./backups'
npm run backup:db
```

O backup usa formato custom do PostgreSQL e é validado com `pg_restore --list`.

### Restore

```bash
export DATABASE_URL='postgres://...'
npm run restore:db -- ./backups/banco-de-horas-YYYYMMDDTHHMMSSZ.dump
```

O restore é destrutivo no banco de destino e deve ser executado apenas em ambiente autorizado.

### TLS

A produção deve terminar HTTPS/TLS em reverse proxy ou load balancer. O contrato de ambiente mantém `TLS_CERT_FILE` e `TLS_KEY_FILE` documentados para futuras execuções HTTPS diretas, mas a configuração recomendada para produção é a terminação TLS na camada de infraestrutura.

## Procedimento

1. Executar o CI no GitHub.
2. Corrigir qualquer falha encontrada e repetir o ciclo.
3. Executar a homologação funcional.
4. Validar PostgreSQL e backup/restore.
5. Configurar TLS, monitoramento e alertas no ambiente de produção.
6. Publicar a release `1.0.0` somente após todos os gates verdes.

## Regra de manutenção

Qualquer alteração posterior à aprovação deve repetir `npm run check`, `npm test` e a homologação funcional antes de ser considerada liberada.
