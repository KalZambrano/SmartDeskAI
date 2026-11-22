<#
    Datos de demostracion para SmartDesk AI.

    Crea el primer administrador (si la base aun no tiene usuarios), los usuarios
    solicitante y tecnico, una incidencia de red y la marca como vencida si el
    modo demostracion esta activo (DEMO_MODE_ENABLED=true). Es idempotente.

    Uso (PowerShell):
        pwsh infra/scripts/seed-demo.ps1
        pwsh infra/scripts/seed-demo.ps1 -BaseUrl http://localhost:8080/api/v1
#>
param(
    [string]$BaseUrl = "http://localhost:8080/api/v1",
    [string]$AdminEmail = "admin@smartdesk.local",
    [string]$DemoPassword = "SmartDeskDemo2026!"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
    param([string]$Method, [string]$Path, $Body)

    $params = @{
        Method = $Method
        Uri = "$BaseUrl$Path"
        Headers = @{}
    }
    if ($null -ne $Body) {
        $params.ContentType = "application/json"
        $params.Body = ($Body | ConvertTo-Json -Compress -Depth 5)
    }
    if ($script:Token) { $params.Headers["Authorization"] = "Bearer $script:Token" }

    try {
        Invoke-RestMethod @params
    } catch {
        # 409 = el recurso ya existe; es esperado al repetir el seed.
        if ($_.Exception.Response.StatusCode.value__ -eq 409) { return $null }
        throw
    }
}

$script:Token = $null

# 1. Administrador inicial (solo si la tabla de usuarios esta vacia).
$admin = Invoke-Api -Method Post -Path "/auth/bootstrap" -Body @{
    fullName = "Administrador"
    email = $AdminEmail
    password = $DemoPassword
}
if ($admin) {
    Write-Host "Administrador creado: $AdminEmail"
} else {
    Write-Host "Administrador ya existe: $AdminEmail"
}

# 2. Sesion de administrador.
$session = Invoke-Api -Method Post -Path "/auth/login" -Body @{
    email = $AdminEmail
    password = $DemoPassword
}
$script:Token = $session.token

# 3. Usuarios de demostracion.
$demoUsers = @(
    @{ fullName = "Solicitante Demo"; email = "solicitante@smartdesk.local"; role = "REQUESTER" },
    @{ fullName = "Tecnico Demo"; email = "tecnico@smartdesk.local"; role = "TECHNICIAN" }
)
foreach ($demoUser in $demoUsers) {
    $created = Invoke-Api -Method Post -Path "/users" -Body @{
        fullName = $demoUser.fullName
        email = $demoUser.email
        password = $DemoPassword
        role = $demoUser.role
    }
    if ($created) {
        Write-Host "$($demoUser.role) creado: $($demoUser.email)"
    } else {
        Write-Host "$($demoUser.role) ya existe: $($demoUser.email)"
    }
}

# 4. Especialidad de red del tecnico (requerida para la asignacion automatica).
$categories = Invoke-Api -Method Get -Path "/categories"
$network = $categories | Where-Object { $_.code -eq 'NETWORK' } | Select-Object -First 1
$users = Invoke-Api -Method Get -Path "/users"
$technician = $users | Where-Object { $_.email -eq 'tecnico@smartdesk.local' } | Select-Object -First 1
if ($network -and $technician) {
    Invoke-Api -Method Put -Path "/users/$($technician.id)/specialties" -Body @{
        categoryIds = @($network.id)
    } | Out-Null
    Write-Host "Especialidad de red asignada al tecnico"
}

# 5. Incidencia de demostracion.
$requesterSession = Invoke-Api -Method Post -Path "/auth/login" -Body @{
    email = "solicitante@smartdesk.local"
    password = $DemoPassword
}
$script:Token = $requesterSession.token
$existing = Invoke-Api -Method Get -Path "/tickets?q=Demo"
$ticket = $existing | Where-Object { $_.title -like 'Demo: wifi intermitente*' } | Select-Object -First 1
if (-not $ticket) {
    $ticket = Invoke-Api -Method Post -Path "/tickets" -Body @{
        title = "Demo: wifi intermitente en piso 2"
        description = "La conexion wifi se corta cada pocos minutos en el piso 2. Afecta a varias laptops."
        priority = "HIGH"
        categoryId = $network.id
    }
    Write-Host "Incidencia demo creada: $($ticket.ticketCode)"
}

# 6. Marcar como vencida requiere DEMO_MODE_ENABLED=true en el backend.
$script:Token = $session.token
try {
    $overdue = Invoke-Api -Method Post -Path "/demo/tickets/$($ticket.id)/overdue" -Body @{}
    if ($overdue) { Write-Host "Incidencia demo vencida: $($overdue.ticketCode)" }
} catch {
    Write-Host "Modo demostracion desactivado:define DEMO_MODE_ENABLED=true para simular vencimientos."
}

Write-Host ""
Write-Host "Credenciales de demostracion (contrasena: $DemoPassword)"
Write-Host "  ADMIN      $AdminEmail"
Write-Host "  REQUESTER  solicitante@smartdesk.local"
Write-Host "  TECHNICIAN tecnico@smartdesk.local"
