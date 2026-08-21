$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$Root = (Get-Location).Path
$Runtime = Join-Path $Root '.local'
New-Item -ItemType Directory -Force -Path $Runtime | Out-Null

function Pause-Exit([int]$Code = 0) {
  Write-Host ''
  if ($Code -ne 0) { Write-Host 'Startup failed. See the message above.' -ForegroundColor Red }
  Read-Host 'Press Enter to continue' | Out-Null
  exit $Code
}

function Test-DockerReady {
  cmd /c 'docker info >nul 2>&1'
  return ($LASTEXITCODE -eq 0)
}

function Wait-Docker([int]$Seconds = 90) {
  for ($i = 10; $i -le $Seconds; $i += 10) {
    if (Test-DockerReady) { return $true }
    Start-Sleep -Seconds 10
    Write-Host ("Waiting for Docker Engine... {0}/{1}s" -f $i, $Seconds)
  }
  return (Test-DockerReady)
}

function Ensure-Docker {
  if (Test-DockerReady) { return $true }
  $Candidates = @(
    (Join-Path ${env:ProgramFiles} 'Docker\Docker\Docker Desktop.exe'),
    (Join-Path ${env:LOCALAPPDATA} 'Programs\Docker Desktop\Docker Desktop.exe')
  )
  $DockerDesktop = $Candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
  if (-not $DockerDesktop) {
    Write-Host 'Docker Desktop was not found.' -ForegroundColor Red
    return $false
  }
  Start-Process -FilePath $DockerDesktop | Out-Null
  Write-Host 'Docker Desktop start requested.'
  return (Wait-Docker)
}

function New-LocalSecrets {
  $pgPassword = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')
  $tokenSecret = [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N') + 'BancoHoras'
  $adminPassword = 'AdminLocal@2026'
  $gestorPassword = 'GestorLocal@2026'
  $colaboradorPassword = 'ColaboradorLocal@2026'
  $envFile = Join-Path $Runtime '.env.sql'
  @(
    "POSTGRES_PASSWORD=$pgPassword",
    "AUTH_TOKEN_SECRET=$tokenSecret",
    "SEED_ADMIN_PASSWORD=$adminPassword",
    "SEED_GESTOR_PASSWORD=$gestorPassword",
    "SEED_COLABORADOR_PASSWORD=$colaboradorPassword"
  ) | Set-Content -Path $envFile -Encoding ascii
  return @{ Path = $envFile; Admin=$adminPassword; Gestor=$gestorPassword; Colaborador=$colaboradorPassword }
}

function Start-SqlMode {
  Write-Host '[1/6] Checking Docker Desktop...'
  if (-not (Ensure-Docker)) {
    Write-Host 'Docker Engine is not available. Run scripts\diagnostico-docker.ps1 for details.' -ForegroundColor Red
    Pause-Exit 1
  }
  Write-Host '[2/6] Preparing local secrets...'
  $secrets = New-LocalSecrets
  Write-Host '[3/6] Starting PostgreSQL and application...'
  docker compose --env-file $secrets.Path -f docker-compose.homologacao.yml up --build -d
  if ($LASTEXITCODE -ne 0) { Pause-Exit 1 }
  Write-Host '[4/6] Waiting for application health...'
  for ($i = 1; $i -le 60; $i++) {
    try {
      $health = Invoke-RestMethod -Uri 'http://127.0.0.1:3000/health' -TimeoutSec 2
      if ($health.status -eq 'ok' -and $health.database -eq 'ok') { break }
    } catch { }
    Start-Sleep -Seconds 1
    if ($i -eq 60) { docker compose --env-file $secrets.Path -f docker-compose.homologacao.yml logs --tail=80; Pause-Exit 1 }
  }
  Write-Host '[5/6] Seeding homologation data...'
  docker compose --env-file $secrets.Path -f docker-compose.homologacao.yml run --rm -e SEED_ADMIN_PASSWORD=$($secrets.Admin) -e SEED_GESTOR_PASSWORD=$($secrets.Gestor) -e SEED_COLABORADOR_PASSWORD=$($secrets.Colaborador) app node database/seed-homologacao.js
  if ($LASTEXITCODE -ne 0) { Pause-Exit 1 }
  Write-Host '[6/6] Opening browser...'
  Start-Process 'http://127.0.0.1:3000/' | Out-Null
  Write-Host 'SQL mode ready: http://127.0.0.1:3000/' -ForegroundColor Green
}

function Start-LocalMode {
  Write-Host '[1/3] Starting LOCAL server (no Docker/PostgreSQL)...'
  $pidFile = Join-Path $Runtime 'local-server.pid'
  if (Test-Path $pidFile) {
    $oldPid = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($oldPid -and (Get-Process -Id $oldPid -ErrorAction SilentlyContinue)) {
      Write-Host 'LOCAL server is already running.'
      Start-Process 'http://127.0.0.1:3000/' | Out-Null
      return
    }
  }
  $proc = Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File', (Join-Path $PSScriptRoot 'server-local.ps1')) -PassThru -WindowStyle Minimized
  Set-Content -Path $pidFile -Value $proc.Id -Encoding ascii
  Write-Host '[2/3] Waiting for LOCAL server...'
  for ($i = 1; $i -le 20; $i++) {
    try {
      $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3000/' -UseBasicParsing -TimeoutSec 2
      if ($r.StatusCode -eq 200) { break }
    } catch { }
    Start-Sleep -Milliseconds 500
    if ($i -eq 20) { Write-Host 'LOCAL server did not become ready.' -ForegroundColor Red; Pause-Exit 1 }
  }
  Write-Host '[3/3] Opening browser...'
  Start-Process 'http://127.0.0.1:3000/' | Out-Null
  Write-Host 'LOCAL mode ready: http://127.0.0.1:3000/' -ForegroundColor Green
}

Clear-Host
Write-Host '========================================='
Write-Host ' Banco de Horas - Local Launcher'
Write-Host '========================================='
Write-Host ''
Write-Host '[1] SQL - PostgreSQL + application'
Write-Host '[2] LOCAL - no SQL/Docker'
Write-Host '[0] Exit'
Write-Host ''
$choice = Read-Host 'Choose mode'
switch ($choice) {
  '1' { Start-SqlMode }
  '2' { Start-LocalMode }
  '0' { exit 0 }
  default { Write-Host 'Invalid option.' -ForegroundColor Yellow; Pause-Exit 1 }
}
Read-Host 'Press Enter to close' | Out-Null
