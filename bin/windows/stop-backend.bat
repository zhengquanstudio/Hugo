@echo off
REM ====================================================
REM Hugo Teek - Stop Backend Server
REM ====================================================

echo Stopping all backend server processes...

REM Kill by executable name
tasklist | findstr /I "hugo-teek-tools.exe" >nul 2>nul
if not errorlevel 1 (
    echo Stopping hugo-teek-tools.exe processes...
    taskkill /F /IM hugo-teek-tools.exe
    if errorlevel 1 (
        echo [WARNING] Some processes could not be stopped
    ) else (
        echo [OK] Processes stopped
    )
) else (
    echo [INFO] No backend server processes found
)

REM Also check specific ports (both Linux and Windows defaults) using PowerShell for reliable port checking
for %%p in (8888 9888) do (
    for /f %%pid in ('powershell -Command "try { Get-NetTCPConnection -LocalPort %%p -State Listen -ErrorAction SilentlyContinue ^| Select-Object -ExpandProperty OwningProcess } catch { netstat -ano ^| Select-String ':%%p\s.*LISTENING' ^| ForEach-Object { ($_ -split '\s+')[-1] } }" 2^>nul') do (
        echo Stopping process %%pid on port %%p...
        taskkill /F /PID %%pid >nul 2>nul
    )
)

echo.
echo [OK] Backend cleanup complete
pause
