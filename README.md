# Banco de Horas

Aplicação web full-stack para gestão de jornada, banco de horas, férias, folgas, feriados, atestados, ajustes, relatórios e auditoria.

## Início rápido local — Windows

O repositório já contém um launcher de **1 clique** com duas opções:

```text
scripts/start-local.bat

[1] SQL - PostgreSQL + aplicação
[2] LOCAL - sem SQL/Docker
[0] Sair
```

### Modo SQL

Usa Docker Desktop, PostgreSQL 16, Node e o seed de homologação. O iniciador cria os segredos locais em `.local/`, sobe a stack, espera `/health`, executa `database/seed-homologacao.js` e abre:

```text
http://127.0.0.1:3000/
```

### Modo LOCAL

Não exige Docker, PostgreSQL ou Node.js. Usa o servidor `scripts/server-local.ps1`, baseado em `TcpListener`, e abre a mesma entrada modular:

```text
http://127.0.0.1:3000/
```

Esse modo evita a dependência do `HttpListener`/HTTP.sys que causou HTTP 403 em algumas instalações Windows.

### Guia completo

Consulte `docs/LOCAL.md` para:

- requisitos;
- modo SQL e modo LOCAL;
- diagnóstico do Docker/WSL;
- solução do HTTP 403;
- Sidebar e `index-compat.js`;
- comandos de parada;
- backup/restore;
- estrutura do ambiente.

## Arquitetura

```text
Browser / PWA
   ↓
server.js
   ├── Web shell e módulos
   └── HTTP API
          ↓
      Services
          ↓
      Regras de negócio
          ↓
   PostgreSQL Repository
          ↓
      PostgreSQL
```

Documentação detalhada: `docs/ARQUITETURA.md`.

## Módulos

- Dashboard
- Apontamentos
- Banco de Horas
- Calendário
- Férias
- Folgas
- Feriados
- Atestados
- Ajustes
- Colaboradores
- Fechamento
- Relatórios
- Auditoria
- Configurações

## Fonte de verdade

O fluxo principal usa PostgreSQL como fonte operacional de verdade. O `localStorage` permanece somente em código legado isolado e não faz parte da entrada principal servida em `/`.

## Autenticação e segurança

- Login com PostgreSQL
- Perfis ADMIN, GESTOR e COLABORADOR
- Autorização por módulo/ação
- Auditoria de alterações
- Secrets via variáveis de ambiente
- CodeQL
- Dependency Review
- `npm audit`
- Headers básicos de segurança no servidor

## PWA e responsividade

A aplicação possui manifest, service worker, registro PWA e CSS responsivo para desktop, tablet e celular.

## Sidebar

A entrada oficial é `app-shell.html`. Para compatibilidade com `index.html`, o servidor injeta `web/index-compat.js`, que mantém o menu, referências DOM e layout responsivo consistentes. O launcher LOCAL também usa o mesmo shell e injeta o compat layer quando necessário.

## Relatórios

Os relatórios disponíveis incluem:

- Espelho de ponto
- Banco de horas
- Férias
- Folgas
- Fechamento
- Atrasos
- XLSX
- PDF
- Impressão

## Importação XLS

A importação segue o fluxo:

```text
XLS
 ↓
Análise
 ↓
Validação
 ↓
Prévia
 ↓
Confirmação
 ↓
Importação
```

Nenhuma regra de negócio deve ser considerada definitiva sem comparação com a planilha de referência.

## Desenvolvimento

```bash
npm install
npm run check
npm test
npm start
```

Variáveis obrigatórias para execução SQL:

```text
DATABASE_URL
AUTH_TOKEN_SECRET
```

Modelo de configuração: `.env.example`.

## PostgreSQL

Aplicar o schema:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

## Homologação

O checklist está em `docs/HOMOLOGACAO.md`.

A homologação real ainda exige execução contra PostgreSQL com dados representativos, teste funcional completo e validação final do CI.

## Deploy

A aplicação completa requer runtime Node.js + PostgreSQL. GitHub Pages não é o destino de produção do backend; o workflow de deploy valida o contrato de produção até que o host definitivo seja configurado.

## Estado do projeto

A fundação, API, PostgreSQL, autenticação, permissões, auditoria, fechamento, calendário, relatórios, importação XLS, PWA, responsividade, shell modular e configuração local SQL/LOCAL já estão implementados no branch de desenvolvimento atual.

A versão `v1.0` só deve ser marcada após homologação real, validação integral das regras do XLS, execução CI verde e configuração do ambiente de produção.
