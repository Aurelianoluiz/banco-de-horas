$ErrorActionPreference = 'SilentlyContinue'
Set-Location (Join-Path $PSScriptRoot '..')
$Runtime = Join-Path (Get-Location).Path '.local'
$pidFile = Join-Path $Runtime 'local-server.pid'
if (Test-Path $pidFile) {
  $pidValue = Get-Content $pidFile | Select-Object -First 1
  if ($pidValue) { Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue }
  Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
}
if (Get-Command docker -ErrorAction SilentlyContinue) {
  $compose = Join-Path (Get-Location).Path 'docker-compose.homologacao.yml'
  if (Test-Path $compose) { docker compose -f $compose down 2>$null | Out-Null }
}
Write-Host 'Local services stopped.'
