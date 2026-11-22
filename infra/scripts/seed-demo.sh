#!/usr/bin/env bash
# Datos de demostracion para SmartDesk AI (Linux, macOS o dentro de un contenedor).
# Crea usuarios, asigna una especialidad, registra una incidencia de red y la marca
# como vencida si DEMO_MODE_ENABLED=true. Es idempotente.
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
ADMIN_TOKEN="$TOKEN"

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

# Especialidad de red del tecnico (requerida para la asignacion automatica).
categories=$(api GET "/categories")
network_id=$(printf '%s' "$categories" | sed -n 's/.*"id":\([0-9]*\),"name":"[^"]*","code":"NETWORK".*/\1/p')
users=$(api GET "/users")
technician_id=$(printf '%s' "$users" | sed -n 's/.*"id":\([0-9]*\),"fullName":"[^"]*","email":"tecnico@smartdesk.local".*/\1/p')
if [ -n "$network_id" ] && [ -n "$technician_id" ]; then
  api PUT "/users/$technician_id/specialties" "{\"categoryIds\":[$network_id]}" >/dev/null
  echo "Especialidad de red asignada al tecnico"
fi

# Incidencia de demostracion.
requester_login=$(api POST "/auth/login" \
  "{\"email\":\"solicitante@smartdesk.local\",\"password\":\"$DEMO_PASSWORD\"}")
TOKEN=$(printf '%s' "$requester_login" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
existing=$(api GET "/tickets?q=Demo")
ticket_id=$(printf '%s' "$existing" | sed -n 's/.*"id":\([0-9]*\),"ticketCode":"[^"]*","title":"Demo: wifi intermitente[^"]*".*/\1/p')
if [ -z "$ticket_id" ]; then
  created=$(api POST "/tickets" "{\"title\":\"Demo: wifi intermitente en piso 2\",\"description\":\"La conexion wifi se corta cada pocos minutos en el piso 2. Afecta a varias laptops.\",\"priority\":\"HIGH\",\"categoryId\":$network_id}")
  ticket_id=$(printf '%s' "$created" | sed -n 's/.*"id":\([0-9]*\),"ticketCode".*/\1/p')
  echo "Incidencia demo creada: $ticket_id"
fi

# Marcar como vencida requiere DEMO_MODE_ENABLED=true en el backend.
TOKEN="$ADMIN_TOKEN"
overdue=$(api POST "/demo/tickets/$ticket_id/overdue" '{}' || true)
if printf '%s' "$overdue" | grep -q 'ticketCode'; then
  echo "Incidencia demo vencida: $overdue"
else
  echo "Modo demostracion desactivado: defina DEMO_MODE_ENABLED=true para simular vencimientos."
fi

echo ""
echo "Credenciales de demostracion (contrasena: $DEMO_PASSWORD)"
echo "  ADMIN      $ADMIN_EMAIL"
echo "  REQUESTER  solicitante@smartdesk.local"
echo "  TECHNICIAN tecnico@smartdesk.local"
