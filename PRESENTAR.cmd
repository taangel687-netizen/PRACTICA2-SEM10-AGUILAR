@echo off
cd /d "%~dp0"
if not exist "node_modules\newman\package.json" (
  call npm ci
  if errorlevel 1 goto fin
)
node pruebas\presentar.js
:fin
echo.
pause
