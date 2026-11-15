<#
    Datos de demostracion para SmartDesk AI.

    Crea el primer administrador (si la base aun no tiene usuarios) y los usuarios
    solicitante y tecnico. Es idempotente: se puede ejecutar varias veces sin fallar.

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
        $params.Body = ($Body | ConvertTo-Json -Compress)
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

Write-Host ""
Write-Host "Credenciales de demostracion (contrasena: $DemoPassword)"
Write-Host "  ADMIN      $AdminEmail"
Write-Host "  REQUESTER  solicitante@smartdesk.local"
Write-Host "  TECHNICIAN tecnico@smartdesk.local"
