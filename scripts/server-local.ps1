$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$Root = (Get-Location).Path
$Port = 3000
$Listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
$Mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='text/javascript; charset=utf-8';
  '.json'='application/json; charset=utf-8'; '.svg'='image/svg+xml'; '.png'='image/png'; '.ico'='image/x-icon';
  '.webmanifest'='application/manifest+json; charset=utf-8'
}

function Get-SafePath([string]$Path) {
  $decoded = [System.Uri]::UnescapeDataString($Path)
  if ($decoded -eq '/' -or [string]::IsNullOrWhiteSpace($decoded)) { $decoded = '/app-shell.html' }
  if ($decoded -eq '/index.html') {
    $full = Join-Path $Root 'index.html'
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { return $null }
    return $full
  }
  $relative = $decoded.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
  if ($relative.Contains('..')) { return $null }
  $fullPath = [IO.Path]::GetFullPath((Join-Path $Root $relative))
  $rootFull = [IO.Path]::GetFullPath($Root) + [IO.Path]::DirectorySeparatorChar
  if (-not $fullPath.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase)) { return $null }
  if (-not (Test-Path -LiteralPath $fullPath -PathType Leaf)) { return $null }
  return $fullPath
}

function Read-Asset([string]$FilePath) {
  $data = [IO.File]::ReadAllBytes($FilePath)
  if ([IO.Path]::GetExtension($FilePath).ToLowerInvariant() -eq '.html') {
    $text = [Text.Encoding]::UTF8.GetString($data)
    $pageName = [IO.Path]::GetFileName($FilePath).ToLowerInvariant()
    $injection = '<link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#2563eb"><link rel="stylesheet" href="/web/responsive.css">'
    if ($pageName -ne 'login.html' -and $text -notmatch 'web/auth-guard\.js') {
      $injection += '<script type="module" src="/web/auth-guard.js"></script>'
    }
    if ($pageName -ne 'login.html' -and $text -notmatch 'web/minimal-sidebar\.css') {
      $injection += '<link rel="stylesheet" href="/web/minimal-sidebar.css"><link rel="stylesheet" href="/web/minimal-theme.css"><script src="/web/minimal-sidebar.js" defer></script>'
    }
    if ($pageName -eq 'index.html' -and $text -notmatch 'web/index-compat\.js') {
      $injection += '<script src="/web/index-compat.js"></script>'
    }
    if ($text -notmatch 'manifest.webmanifest') {
      $text = $text -replace '(?i)</head>', "$injection</head>"
    } else {
      if ($pageName -ne 'login.html' -and $text -notmatch 'web/auth-guard\.js') {
        $text = $text -replace '(?i)</head>', '<script type="module" src="/web/auth-guard.js"></script></head>'
      }
      if ($pageName -ne 'login.html' -and $text -notmatch 'web/minimal-sidebar\.css') {
        $text = $text -replace '(?i)</head>', '<link rel="stylesheet" href="/web/minimal-sidebar.css"><link rel="stylesheet" href="/web/minimal-theme.css"><script src="/web/minimal-sidebar.js" defer></script></head>'
      }
      if ($pageName -eq 'index.html' -and $text -notmatch 'web/index-compat\.js') {
        $text = $text -replace '(?i)</head>', '<script src="/web/index-compat.js"></script></head>'
      }
    }
    return [Text.Encoding]::UTF8.GetBytes($text)
  }
  return $data
}

function Send-Response($Stream, [int]$Status, [string]$ContentType, [byte[]]$Body) {
  $reason = switch ($Status) { 200 {'OK'} 400 {'Bad Request'} 404 {'Not Found'} 405 {'Method Not Allowed'} 500 {'Internal Server Error'} default {'OK'} }
  $header = "HTTP/1.1 $Status $reason`r`nContent-Type: $ContentType`r`nContent-Length: $($Body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n"
  $headBytes = [Text.Encoding]::ASCII.GetBytes($header)
  $Stream.Write($headBytes, 0, $headBytes.Length)
  if ($Body.Length -gt 0) { $Stream.Write($Body, 0, $Body.Length) }
}

$Listener.Start()
Write-Host "LOCAL server listening on http://127.0.0.1:$Port/"
try {
  while ($true) {
    $Client = $Listener.AcceptTcpClient()
    try {
      $Stream = $Client.GetStream()
      $Reader = [IO.StreamReader]::new($Stream, [Text.Encoding]::ASCII, $false, 8192, $true)
      $requestLine = $Reader.ReadLine()
      while (($line = $Reader.ReadLine()) -ne $null -and $line -ne '') { }
      if ([string]::IsNullOrWhiteSpace($requestLine)) { Send-Response $Stream 400 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Bad Request')); continue }
      $parts = $requestLine.Split(' ')
      if ($parts.Count -lt 2) { Send-Response $Stream 400 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Bad Request')); continue }
      $method = $parts[0].ToUpperInvariant()
      $target = $parts[1].Split('?')[0]
      if ($method -notin @('GET','HEAD')) { Send-Response $Stream 405 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Method Not Allowed')); continue }
      $file = Get-SafePath $target
      if ($null -eq $file) { Send-Response $Stream 404 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Not Found')); continue }
      $body = Read-Asset $file
      $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
      $contentType = $Mime[$ext]; if (-not $contentType) { $contentType = 'application/octet-stream' }
      if ($method -eq 'HEAD') { $body = [byte[]]::new(0) }
      Send-Response $Stream 200 $contentType $body
    } catch {
      try { Send-Response $Stream 500 'text/plain; charset=utf-8' ([Text.Encoding]::UTF8.GetBytes('Internal Server Error')) } catch { }
    } finally {
      if ($Stream) { $Stream.Dispose() }
      $Client.Dispose()
    }
  }
} finally {
  $Listener.Stop()
}
