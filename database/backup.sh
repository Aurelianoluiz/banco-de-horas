#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL é obrigatório}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"
OUTPUT="$BACKUP_DIR/banco-de-horas-$STAMP.dump"

pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$OUTPUT"

if [ ! -s "$OUTPUT" ]; then
  echo "Backup vazio: $OUTPUT" >&2
  exit 1
fi

pg_restore --list "$OUTPUT" >/dev/null
printf 'Backup criado e validado: %s\n' "$OUTPUT"
