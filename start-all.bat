@echo off
setlocal enabledelayedexpansion

REM Navigate to repository root (this script resides there)
set "ROOT=%~dp0"
pushd "%ROOT%"

echo === Congo Gaming Portal bootstrap ===

where pnpm >nul 2>&1
if errorlevel 1 (
  echo [ERREUR] pnpm n'est pas disponible dans le PATH. Installez-le (^npm i -g pnpm^) puis relancez.
  goto :end
)

echo === Installation des dependances (pnpm install) ===
call pnpm install
if errorlevel 1 (
  echo [ERREUR] pnpm install a echoue. Consultez les messages ci-dessus.
  goto :end
)

echo === Lancement des watchers ===
start "@cg/shared" cmd /k "cd /d %ROOT% && pnpm --filter @cg/shared exec tsc --watch"
start "@cg/api" cmd /k "cd /d %ROOT% && pnpm --filter @cg/api start:dev"
start "@cg/web" cmd /k "cd /d %ROOT% && pnpm --filter @cg/web dev"

echo Tout est lance. Les fenetres ouvertes restent actives pour chaque service.

:end
popd
pause
endlocal
