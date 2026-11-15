#!/usr/bin/env bash
# Datos de demostracion para SmartDesk AI (Linux, macOS o dentro de un contenedor).
# Crea el primer administrador (si la base aun no tiene usuarios) y los usuarios
# solicitante y tecnico. Es idempotente: se puede ejecutar varias veces.
#
#   bash infra/scripts/seed-demo.sh [base_url]

set -euo pipefail

BASE_URL="${1:-http://localhost:8080/api/v1}"
ADMIN_EMAIL="admin@smartdesk.local"
DEMO_PASSWORD="SmartDeskDemo2026!"
TOKEN=""

api() {
  local method="$1" path="$2" body="${3:-}"
  local args=(-s -X "$method" "$BASE_URL$path" -H "Content-Type: application/json")
  [ -n "$TOKEN" ] && args+=(-H "Authorization: Bearer $TOKEN")
  [ -n "$body" ] && args+=(-d "$body")
  curl "${args[@]}"
}

bootstrap=$(api POST "/auth/bootstrap" \
  "{\"fullName\":\"Administrador\",\"email\":\"$ADMIN_EMAIL\",\"password\":\"$DEMO_PASSWORD\"}" || true)
if [ -n "$bootstrap" ] && ! printf '%s' "$bootstrap" | grep -q '"error"'; then
  echo "Administrador creado: $ADMIN_EMAIL"
else
  echo "Administrador ya existe: $ADMIN_EMAIL"
fi

login=$(api POST "/auth/login" \
  "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$DEMO_PASSWORD\"}")
TOKEN=$(printf '%s' "$login" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
if [ -z "$TOKEN" ]; then
  echo "No se pudo iniciar sesion como administrador" >&2
  exit 1
fi

create_user() {
  local name="$1" email="$2" role="$3"
  local result
  result=$(api POST "/users" \
    "{\"fullName\":\"$name\",\"email\":\"$email\",\"password\":\"$DEMO_PASSWORD\",\"role\":\"$role\"}" || true)
  if [ -n "$result" ] && ! printf '%s' "$result" | grep -q '"error"'; then
    echo "$role creado: $email"
  else
    echo "$role ya existe: $email"
  fi
}

create_user "Solicitante Demo" "solicitante@smartdesk.local" "REQUESTER"
create_user "Tecnico Demo" "tecnico@smartdesk.local" "TECHNICIAN"

echo ""
echo "Credenciales de demostracion (contrasena: $DEMO_PASSWORD)"
echo "  ADMIN      $ADMIN_EMAIL"
echo "  REQUESTER  solicitante@smartdesk.local"
echo "  TECHNICIAN tecnico@smartdesk.local"
