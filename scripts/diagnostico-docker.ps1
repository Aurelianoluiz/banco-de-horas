$ErrorActionPreference = 'SilentlyContinue'
Set-Location (Join-Path $PSScriptRoot '..')
$Runtime = Join-Path (Get-Location).Path '.local'
New-Item -ItemType Directory -Force -Path $Runtime | Out-Null
$Out = Join-Path $Runtime 'docker-diagnostic.txt'
$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("Banco de Horas - Docker diagnostic")
$lines.Add((Get-Date).ToString('s'))
$lines.Add('')
$lines.Add('=== docker version ===')
$lines.AddRange([string[]](& cmd /c 'docker version 2>&1'))
$lines.Add('')
$lines.Add('=== docker info ===')
$lines.AddRange([string[]](& cmd /c 'docker info 2>&1'))
$lines.Add('')
$lines.Add('=== docker context ===')
$lines.AddRange([string[]](& cmd /c 'docker context ls 2>&1'))
$lines.Add('')
$lines.Add('=== WSL status ===')
$lines.AddRange([string[]](& cmd /c 'wsl --status 2>&1'))
$lines.Add('')
$lines.Add('=== Docker Desktop processes ===')
$lines.AddRange([string[]](Get-Process 'Docker Desktop' -ErrorAction SilentlyContinue | Select-Object Id,ProcessName,StartTime | Format-Table | Out-String))
$lines | Set-Content -Path $Out -Encoding utf8
Write-Host "Diagnostic saved to $Out"
Get-Content $Out
