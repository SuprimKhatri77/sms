#!/usr/bin/env bash
set -euo pipefail

# Pulls a full schema+data dump from a Neon database and restores it into
# the local Docker Postgres container used for development.
#
# SAFETY: this script has no idea what "dev" or "prod" means — it will
# happily dump whatever connection string you give it. Only ever pass the
# DEV Neon connection string here, confirmed as such beforehand. Never
# point this at the production Neon database.

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <dev-neon-database-url>" >&2
  echo "Pass the DEV Neon connection string only — never prod." >&2
  exit 1
fi

NEON_DEV_URL="$1"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$ROOT_DIR/docker-compose.dev.yml"

set -a
# shellcheck disable=SC1091
source "$ROOT_DIR/.env.development"
set +a

LOCAL_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?sslmode=disable"
DUMP_FILE="$(mktemp -t sms-neon-dev-XXXXXX.dump)"

cleanup() {
  rm -f "$DUMP_FILE"
}
trap cleanup EXIT

echo "==> Starting local Docker Postgres..."
docker compose -f "$COMPOSE_FILE" up -d db

echo "==> Waiting for local Postgres to be healthy..."
until docker compose -f "$COMPOSE_FILE" exec -T db pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; do
  sleep 1
done

echo "==> Dumping from Neon (this is only as 'dev' as the URL you passed in)..."
pg_dump "$NEON_DEV_URL" -Fc --no-owner --no-privileges -f "$DUMP_FILE"

echo "==> Restoring into local Docker Postgres (replaces existing local data)..."
pg_restore --clean --if-exists --no-owner --no-privileges \
  -d "$LOCAL_URL" "$DUMP_FILE"

echo "==> Done. Local db now mirrors the Neon database you dumped from."
