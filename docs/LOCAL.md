# Ambiente local — Banco de Horas

Este documento centraliza a configuração local do projeto. Existem dois modos independentes.

## 1. Modo LOCAL — sem SQL e sem Docker

Use este modo para testar a interface e os fluxos legados que usam `localStorage`. Ele não precisa de PostgreSQL, Docker Desktop ou Node.js.

```text
start-local.bat
  -> menu
  -> [2] LOCAL
  -> servidor TCP local em 127.0.0.1:3000
  -> / usa app-shell.html
  -> /index.html usa index-compat.js
```

Abra:

```text
http://127.0.0.1:3000/
```

O servidor LOCAL não usa `HttpListener`/HTTP.sys. Isso evita o HTTP 403 observado com `localhost` quando a URL ACL do Windows não estava configurada.

## 2. Modo SQL — PostgreSQL + aplicação completa

Pré-requisitos:

- Docker Desktop instalado e funcionando
- virtualização/WSL2 configurados no Windows quando exigidos pelo Docker Desktop

O iniciador cria segredos locais em `.local/` e executa:

```text
Docker Desktop
  -> PostgreSQL 16
  -> schema.sql
  -> aplicação Node
  -> /health
  -> seed:homologacao
```

Abra:

```text
http://127.0.0.1:3000/
```

Health:

```text
http://127.0.0.1:3000/health
```

O seed cria contas fictícias de homologação:

```text
ADMIN
admin.homologacao@bancodehoras.local

GESTOR
gestor.homologacao@bancodehoras.local

COLABORADOR
colaborador.homologacao@bancodehoras.local
```

As senhas são geradas/definidas somente no ambiente local e nunca são gravadas no Git.

## 3. Inicialização com um clique

No Windows:

```text
start-local.bat
```

Menu:

```text
[1] SQL - PostgreSQL + aplicação
[2] LOCAL - sem SQL/Docker
[0] Sair
```

Os scripts PowerShell correspondentes ficam em `scripts/`.

## 4. Parar

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\stop-local.ps1
```

O comando encerra o servidor LOCAL e, quando escolhido, derruba a stack SQL.

## 5. Diagnóstico do Docker

Se o modo SQL mostrar erro como:

```text
Docker Desktop is unable to start
```

ou não conseguir conectar em `docker_engine`, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\diagnostico-docker.ps1
```

O diagnóstico verifica:

- `docker version`
- `docker info`
- estado do Docker Desktop
- WSL (`wsl --status`)
- memória/virtualização reportadas pelo ambiente quando disponíveis

## 6. Erro HTTP 403 no modo LOCAL

O servidor LOCAL atual usa `TcpListener` em `127.0.0.1` e não `HttpListener`. Isso evita dependência de URL ACL do Windows/HTTP.sys.

A entrada `/` serve `app-shell.html`, que é a entrada oficial modular. `index.html` permanece disponível para compatibilidade e recebe `web/index-compat.js` quando servido diretamente.

## 7. Sidebar

O sidebar oficial está no shell modular. Para `index.html`, `web/index-compat.js` garante:

- itens de navegação visíveis no desktop;
- referências DOM sem depender de variáveis globais implícitas do navegador;
- fallback do menu;
- layout responsivo;
- `margin-left` compatível com a largura do sidebar.

## 8. Estrutura relevante

```text
app-shell.html                 entrada principal
index.html                     compatibilidade/legado
server.js                      servidor SQL/produção
scripts/start-local.ps1        menu SQL/LOCAL
scripts/server-local.ps1       servidor HTTP LOCAL via TcpListener
scripts/stop-local.ps1         parada
scripts/diagnostico-docker.ps1 diagnóstico
web/index-compat.js            compatibilidade do sidebar
Dockerfile                     imagem Node
 docker-compose.homologacao.yml PostgreSQL + aplicação
 database/schema.sql            banco
 database/seed-homologacao.js  dados fictícios
```

## 9. Verificações

Antes de considerar a instalação saudável:

```bash
npm run check
npm test
```

No modo SQL:

```bash
curl -fsS http://127.0.0.1:3000/health
```

Resultado esperado:

```json
{"status":"ok","database":"ok"}
```

## 10. Regras de operação

- Não grave senhas, `DATABASE_URL` reais ou `AUTH_TOKEN_SECRET` reais no Git.
- O modo LOCAL e o modo SQL têm armazenamento separado.
- O modo LOCAL não é fonte operacional de produção.
- O modo SQL é o caminho recomendado para homologação funcional completa.
- Backup/restore ficam em `database/backup.sh` e `database/restore.sh`.
