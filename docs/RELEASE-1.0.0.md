# Release 1.0.0 — Banco de Horas

## Versão

- Aplicação: `1.0.0`
- Branch de trabalho: `feat/xls-importacao`

## Fases 1–30 — programação consolidada

```text
01 Levantamento da estrutura                  CONCLUÍDA
02 Arquitetura                                CONCLUÍDA
03 Modelagem de dados                         CONCLUÍDA
04 Persistência / repositories                CONCLUÍDA
05 Regras de jornada                          CONCLUÍDA
06 Apontamentos                               CONCLUÍDA
07 Colaboradores                              CONCLUÍDA
08 Banco de Horas                             CONCLUÍDA
09 Ausências                                  CONCLUÍDA
10 Fechamento mensal                          CONCLUÍDA
11 Auditoria                                  CONCLUÍDA
12 API / HTTP                                 CONCLUÍDA
13 Testes automatizados                       CONCLUÍDA
14 Segurança                                  CONCLUÍDA
15 Relatórios / exportações                   CONCLUÍDA
16 Importação XLS                             CONCLUÍDA
17 Performance                                CONCLUÍDA
18 Homologação funcional                      CONCLUÍDA
19 Documentação / operação                    CONCLUÍDA
20 Preparação da v1.0                         CONCLUÍDA
21 Servidor local 1 clique                    CONCLUÍDA
22 Correção HTTP 403 local                    CONCLUÍDA
23 Compatibilidade do index.html              CONCLUÍDA
24 Centralização do ambiente no repo          CONCLUÍDA
25 Sidebar minimalista                       CONCLUÍDA
26 Design System visual                       CONCLUÍDA
27 Smoke de runtime local                    CONCLUÍDA
28 CI de runtime/visual                      CONCLUÍDA
29 Operação de produção                      CONCLUÍDA
30 Consolidação final da v1.0                CONCLUÍDA
```

A programação das fases 1–30 está encerrada. Os gates de infraestrutura e execução real permanecem como validações operacionais do ambiente, não como trabalho de programação pendente.

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
- [x] Runtime smoke do shell, Sidebar e Design System
- [x] Smoke de carga
- [x] Matriz de permissões
- [x] Rotinas versionadas de backup/restore
- [x] Compose de produção com PostgreSQL interno
- [x] Healthcheck do container da aplicação
- [x] Contrato de TLS documentado
- [x] Modo LOCAL sem Docker/PostgreSQL
- [x] Inicialização SQL/LOCAL em um clique

## Verificador final

Antes de uma liberação operacional, execute:

```bash
npm run check
npm test
npm run smoke:runtime
npm run release:check
```

O `release:check` confirma versão `1.0.0`, arquivos obrigatórios, contrato do compose de produção e sintaxe dos componentes críticos.

## Gates operacionais

Estes itens dependem do ambiente real e não podem ser simulados integralmente no repositório:

- Execução real do GitHub Actions
- Homologação real em PostgreSQL
- Configuração de produção com segredos reais
- HTTPS/TLS no reverse proxy
- Backup real e restore autorizado
- Monitoramento e alertas do ambiente
- Validação visual final no Windows/Edge/Chrome

## Operação

### Health

`GET /health` retorna `200` com `{"status":"ok","database":"ok"}` quando Node e PostgreSQL estão saudáveis. Se a aplicação estiver viva mas o banco estiver indisponível, retorna `503` e `{"status":"degraded","database":"down"}`.

### Local

Use `scripts/start-local.bat` e escolha:

```text
[1] SQL - PostgreSQL + aplicação
[2] LOCAL - sem SQL/Docker
```

### Produção

Use `docker-compose.production.yml`, mantendo PostgreSQL somente na rede interna e colocando um reverse proxy com TLS na frente da aplicação.
