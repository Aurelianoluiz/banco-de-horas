# Operacao em producao — Banco de Horas

## Compose de producao

Use `docker-compose.production.yml` em um servidor que tenha Docker Compose.

Defina os segredos fora do Git:

```bash
export POSTGRES_PASSWORD='senha-forte-do-banco'
export AUTH_TOKEN_SECRET='segredo-longo-com-pelo-menos-32-caracteres'
```

Suba os servicos:

```bash
docker compose -f docker-compose.production.yml up --build -d
```

A aplicacao fica acessivel localmente em `127.0.0.1:3000`. O PostgreSQL fica somente na rede interna do Compose e nao publica a porta 5432 no host.

## TLS / reverse proxy

Em producao, coloque um reverse proxy ou load balancer na frente da aplicacao e termine TLS nele.

Exemplo de fluxo:

```text
Internet
   |
 HTTPS :443
   v
Reverse proxy / load balancer
   |
 HTTP 127.0.0.1:3000
   v
Banco de Horas
   |
 PostgreSQL (rede Docker interna)
```

O certificado e a chave nao devem ser gravados no repositorio.

## Health check

A aplicacao possui `/health` e so retorna `database: ok` quando o PostgreSQL responde.

```bash
curl -fsS http://127.0.0.1:3000/health
```

O container da aplicacao tambem possui healthcheck Docker baseado nesse endpoint.

## Backup

O backup e restore operacionais ficam em:

```text
database/backup.sh
database/restore.sh
```

O backup deve ser copiado para armazenamento externo ao host Docker e testado por restore periodico.

## Atualizacao

1. Fazer backup.
2. Atualizar a imagem/build.
3. Subir a nova versao.
4. Confirmar healthcheck dos dois containers.
5. Executar smoke HTTP.
6. Monitorar logs.
7. Manter a imagem anterior disponivel para rollback.

## Rollback

O rollback deve apontar para a imagem/commit anterior e manter o volume PostgreSQL. Mudancas de schema devem possuir estrategia de compatibilidade antes do rollback.

## Observacoes de seguranca

- Nao publicar a porta 5432 externamente.
- Nao colocar `POSTGRES_PASSWORD` ou `AUTH_TOKEN_SECRET` no Git.
- Usar TLS valido no reverse proxy.
- Restringir acesso administrativo ao host e ao reverse proxy.
- Fazer backup antes de migracoes de schema.
