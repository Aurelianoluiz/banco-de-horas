#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL é obrigatório}"
BACKUP_FILE="${1:?uso: database/restore.sh caminho/arquivo.dump}"

if [ ! -s "$BACKUP_FILE" ]; then
  echo "Arquivo de backup inexistente ou vazio: $BACKUP_FILE" >&2
  exit 1
fi

pg_restore --list "$BACKUP_FILE" >/dev/null
printf 'Restore iniciado a partir de %s\n' "$BACKUP_FILE"
printf 'ATENÇÃO: o destino será substituído. Use apenas em ambiente autorizado.\n'

pg_restore --clean --if-exists --exit-on-error --no-owner --no-privileges --dbname="$DATABASE_URL" "$BACKUP_FILE"
printf 'Restore concluído: %s\n' "$BACKUP_FILE"
