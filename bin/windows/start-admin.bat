@echo off
REM ====================================================
REM Hugo Teek - Admin Server
REM ====================================================
REM Starts both backend and frontend development servers
REM ====================================================

REM Navigate to project root
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%..\..\"
if errorlevel 1 (
    echo [ERROR] Cannot change to project root directory
    pause
    exit /b 1
)
set ROOT_DIR=%CD%

echo ====================================================
echo Hugo Teek - Admin Server
echo ====================================================
echo Project directory: %ROOT_DIR%
echo.

REM Configuration
set "BACKEND_PORT=8888"
set "FRONTEND_PORT=5173"

echo Backend port: %BACKEND_PORT%
echo Frontend port: %FRONTEND_PORT%
echo.

REM Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found
    echo Please install Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found:
for /f "delims=" %%v in ('node --version 2^>nul') do echo   %%v

REM Check pnpm (install if not found)
where pnpm >nul 2>nul
if errorlevel 1 (
    echo [INFO] pnpm not found, installing...
    npm install -g pnpm
    if errorlevel 1 (
        echo [ERROR] Failed to install pnpm
        pause
        exit /b 1
    )
)

echo [OK] pnpm found:
for /f "delims=" %%v in ('pnpm --version 2^>nul') do echo   %%v
echo.

REM Check and update hugo-teek-tools.exe (always check for updates)
echo [INFO] Checking for hugo-teek-tools.exe updates...
call "%SCRIPT_DIR%check-and-install.bat"
if errorlevel 1 (
    echo [ERROR] Failed to check/update hugo-teek-tools.exe
    echo.
    echo Please manually download from:
    echo https://download.xxdevops.cn/dist/hugo-teek-tools/win/
    pause
    exit /b 1
)

echo [OK] hugo-teek-tools.exe ready
echo.

REM Install frontend dependencies (always run to ensure complete)
echo Installing frontend dependencies...
cd admin-frontend
call pnpm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo [OK] Dependencies installed
echo.

REM Generate analysis data if not exists
if not exist "hugo-teek-site\data\docAnalysis.json" (
    echo [INFO] Generating analysis data...
    "%SCRIPT_DIR%hugo-teek-tools.exe" analysis
    if errorlevel 1 (
        echo [WARNING] Failed to generate analysis data
    ) else (
        echo [OK] Analysis data generated
    )
    echo.
)

REM Start backend (background)
echo Starting backend service...
start /B "" "%SCRIPT_DIR%hugo-teek-tools.exe" server --port=%BACKEND_PORT% --mode=debug
echo   Backend PID: (see Task Manager)
echo   Backend API: http://localhost:%BACKEND_PORT%
echo.

REM Wait for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend (blocking)
echo Starting frontend service...
echo   Frontend UI: http://localhost:%FRONTEND_PORT%/admin
echo.
cd admin-frontend
set "VITE_API_BACKEND=http://localhost:%BACKEND_PORT%"
set "PORT=%FRONTEND_PORT%"
call pnpm run dev
cd ..

REM Cleanup on exit (when pnpm dev exits)
echo.
echo Stopping backend service...
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":%BACKEND_PORT%.*LISTENING"') do (
    taskkill /F /PID %%p >nul 2>nul
)
echo [OK] Done
pause