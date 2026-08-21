@echo off
setlocal
cd /d "%~dp0.."
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%CD%\scripts\start-local.ps1"
if errorlevel 1 (
  echo.
  echo Banco de Horas encerrou com erro. Consulte a mensagem acima.
  pause
)
endlocal
