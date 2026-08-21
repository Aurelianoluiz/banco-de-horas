# Banco de Horas

Aplicação web full-stack para gestão de jornada, banco de horas, férias, folgas, feriados, atestados, ajustes, relatórios e auditoria.

## Objetivo

Transformar a estrutura funcional da planilha `Apontamento.xls` em uma aplicação web moderna, preservando as regras de jornada, tolerância, créditos, débitos, acumulados e fechamento mensal que forem validadas contra o XLS.

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

Variáveis obrigatórias:

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

A homologação real ainda exige uma execução contra PostgreSQL com dados representativos e validação final do CI.

## Deploy

A aplicação completa requer runtime Node.js + PostgreSQL. GitHub Pages não é o destino de produção do backend; o workflow de deploy apenas valida o contrato de produção até que o host definitivo seja configurado.

## Estado do projeto

A fundação, API, PostgreSQL, autenticação, permissões, auditoria, fechamento, calendário, relatórios, importação XLS, PWA, responsividade e shell modular já estão implementados no branch de desenvolvimento atual.

A versão `v1.0` só deve ser marcada após homologação real, validação integral das regras do XLS, execução CI verde e configuração do ambiente de produção.
