@echo off
REM Script de Sincronización Git para Windows - Frutas & Verduras

setlocal enabledelayedexpansion

REM Colores
cls

echo.
echo ========================================
echo   Git Sync - Frutas y Verduras
echo ========================================
echo.

REM Verificar si estamos en un repositorio git
if not exist ".git" (
    echo Error: No estas en un repositorio git
    exit /b 1
)

echo Selecciona una opcion:
echo.
echo 1 - Push (subir cambios)
echo 2 - Pull (descargar cambios)
echo 3 - Ver estado
echo 4 - Sync completo
echo 5 - Salir
echo.

set /p option="Opcion (1-5): "

if "%option%"=="1" (
    call :push_changes
) else if "%option%"=="2" (
    call :pull_changes
) else if "%option%"=="3" (
    call :show_status
) else if "%option%"=="4" (
    call :pull_changes
    call :push_changes
) else if "%option%"=="5" (
    echo Hasta luego!
    exit /b 0
) else (
    echo Opcion invalida
    exit /b 1
)

goto :eof

:show_status
echo.
echo [Estado actual]
git status --short
echo.
exit /b 0

:pull_changes
echo.
echo [Descargando cambios desde GitHub...]
git pull origin main
echo Cambios descargados
echo.
exit /b 0

:push_changes
echo.
echo [Estado actual]
git status --short
echo.

set /p message="Mensaje del commit (Enter para defecto): "

if "%message%"=="" (
    set message=Actualizacion de codigo
)

echo.
echo [Agregando archivos...]
git add .

echo [Creando commit: %message%]
git commit -m "%message%"

echo [Subiendo a GitHub...]
git push origin main

echo Cambios subidos exitosamente
echo.
exit /b 0
