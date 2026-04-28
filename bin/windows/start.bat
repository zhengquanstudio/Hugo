@echo off
REM ====================================================
REM Hugo Teek - Development Server
REM ====================================================

REM 设置控制台编码为 UTF-8，解决中文乱码问题
chcp 65001 >nul 2>nul

setlocal enabledelayedexpansion

REM Navigate to project root
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%..\..\"
if errorlevel 1 (
    echo [ERROR] Cannot change to project root directory
    echo Script location: %SCRIPT_DIR%
    echo Current directory: %CD%
    pause
    exit /b 1
)
set ROOT_DIR=%CD%

echo ====================================================
echo Hugo Teek - Development Server
echo ====================================================
echo Project directory: %ROOT_DIR%
echo.

REM ====================================================
REM Detect Theme from hugo.toml
REM ====================================================
REM Auto-detect theme (similar to Makefile behavior)
set THEME=
REM Try to find theme in config\_default\hugo.toml (merged config)
if exist "hugo-teek-site\config\_default\hugo.toml" (
    for /f "tokens=2 delims== " %%a in ('findstr /r "^theme *= *" hugo-teek-site\config\_default\hugo.toml 2^>nul') do (
        set THEME=%%a
    )
)
REM Remove quotes from theme name
if defined THEME (
    set "THEME=!THEME:"=!"
)
REM Fallback to default if not found
if not defined THEME set THEME=hugo-teek
if "%THEME%"=="" set THEME=hugo-teek

echo Detected theme: %THEME%
echo.

REM Check and install tools (pass through any arguments like --force)
call "%SCRIPT_DIR%check-and-install.bat" %*
if errorlevel 1 (
    echo.
    echo [ERROR] Tool check failed
    pause
    exit /b 1
)

REM Initialize environment variables
echo.
echo Initializing environment variables...
for /f "delims=" %%i in ('call "%SCRIPT_DIR%init-env.bat"') do (
    set "ENV_EXPORT_FILE=%%i"
)
if defined ENV_EXPORT_FILE (
    if exist "%ENV_EXPORT_FILE%" (
        call "%ENV_EXPORT_FILE%"
        del "%ENV_EXPORT_FILE%" 2>nul
    )
)
if not defined HUGO_TEEK_HUGO_PORT (
    echo [WARNING] Environment initialization may have failed, using default port...
    set "HUGO_TEEK_HUGO_PORT=9090"
    set "HUGO_TEEK_PORT=9888"
    set "HUGO_TEEK_VITE_PORT=6173"
)

REM Create short variable aliases for consistency with Linux version
set "PORT=%HUGO_TEEK_HUGO_PORT%"

REM Verify hugo.toml exists
if not exist "hugo-teek-site\hugo.toml" (
    echo.
    echo [ERROR] Configuration file not found: hugo-teek-site\hugo.toml
    echo This is the main configuration file for Hugo Teek.
    pause
    exit /b 1
)

echo.
echo ====================================================
echo Clean Old Files
echo ====================================================
echo.

bin\windows\hugo-teek-tools.exe clean

REM Clean auto-generated sidebar data
echo Cleaning auto-generated sidebar data...
if exist "hugo-teek-site\data\sidebar" rmdir /s /q "hugo-teek-site\data\sidebar"
if exist "hugo-teek-site\static\data\sidebar" rmdir /s /q "hugo-teek-site\static\data\sidebar"

echo.
echo ====================================================
echo Merge Configurations
echo ====================================================
echo.

REM Merge Configurations
echo [0/6] Merge Configurations...
bin\windows\hugo-teek-tools.exe config merge

echo.
echo ====================================================
echo Generate Data
echo ==================================================== Fix Front Matter
echo [1/6] Fix Front Matter...
bin\windows\hugo-teek-tools.exe frontmatter

REM Generate Permalink
echo [2/6] Generate Permalink...
bin\windows\hugo-teek-tools.exe permalink

REM Generate Index Pages (MUST before sidebar!)
echo [3/6] Generate Index Pages...
bin\windows\hugo-teek-tools.exe index

REM Generate Sidebar Order
echo [4/6] Generate Sidebar Order...
bin\windows\hugo-teek-tools.exe sidebar

REM Copy sidebar data to static directory
echo [4.5/6] Copy sidebar data to static...
if not exist "hugo-teek-site\static\data\sidebar" mkdir "hugo-teek-site\static\data\sidebar"
if exist "hugo-teek-site\data\sidebar" (
    xcopy /E /I /Y /Q "hugo-teek-site\data\sidebar" "hugo-teek-site\static\data\sidebar" >nul 2>nul
    echo Sidebar data copied to static directory
)
echo.

REM VitePress Syntax Conversion
echo [5/6] VitePress Syntax Conversion...
bin\windows\hugo-teek-tools.exe convert

REM Document Analysis
echo [6/7] Document Analysis...
bin\windows\hugo-teek-tools.exe analysis

REM ====================================================
REM Step 7: Start Content Watcher
REM ====================================================
echo.
echo [7/7] Start Content Watcher...
echo   Watching: content/ (auto-convert VitePress syntax)
echo.

REM Clean up cross-platform PID files
if exist ".content-watcher.pid" (
    del ".content-watcher.pid" 2>nul
)

REM Check if content-watcher is already running (using Windows-specific PID file)
set "PID_FILE=.content-watcher.pid.win"
if exist "%PID_FILE%" (
    set /p WATCHER_PID=<%PID_FILE%

    REM Validate PID is not empty and is numeric
    echo !WATCHER_PID! | findstr /R "^[0-9][0-9]*$" >nul 2>nul
    if errorlevel 1 (
        echo   [INFO] Invalid PID in file, cleaning...
        del "%PID_FILE%" 2>nul
        set "WATCHER_PID="
    ) else (
        REM Check if process exists
        tasklist /FI "PID eq !WATCHER_PID!" 2>nul | find /I "!WATCHER_PID!" >nul
        if not errorlevel 1 (
            echo   [WARNING] Content watcher already running ^(PID: !WATCHER_PID!^), skipping startup
            goto :skip_watcher_start
        ) else (
            echo   [INFO] Cleaning up stale PID file...
            del "%PID_FILE%" 2>nul
            set "WATCHER_PID="
        )
    )
)

REM Use hugo-teek-tools watch to start the watcher
if exist "bin\windows\hugo-teek-tools.exe" (
    echo   [*] Starting hugo-teek-tools watch...
    start /B "" "%ROOT_DIR%\bin\windows\hugo-teek-tools.exe" watch > "%ROOT_DIR%\.content-watcher.log" 2>&1

    REM Wait for process to start
    timeout /t 2 /nobreak >nul 2>nul

    REM Get hugo-teek-tools.exe process PID (using tasklist instead of wmic)
    for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq hugo-teek-tools.exe" /NH 2^>nul ^| findstr /R "^hugo-teek-tools"') do (
        set "WATCHER_PID=%%i"
        goto :found_watcher_pid
    )

    :found_watcher_pid
    if defined WATCHER_PID (
        echo !WATCHER_PID! > "%PID_FILE%"
        echo   [OK] Content watcher started successfully ^(PID: !WATCHER_PID!^)
    ) else (
        echo   [WARNING] Could not get watcher PID, check .content-watcher.log
    )
) else (
    echo   [WARNING] hugo-teek-tools.exe not found, skipping content watcher
)

:skip_watcher_start

echo.
echo ====================================================
echo Build Site for Search Index
echo ====================================================
echo.

REM Build site to generate HTML files for Pagefind indexing
echo Building site...
bin\windows\hugo.exe --environment=%THEME% --source=hugo-teek-site --contentDir=.content-vp-converted --minify
if errorlevel 1 (
    echo.
    echo [WARNING] Hugo build failed, search may not work properly
    echo Continuing anyway...
    echo.
)

echo.
echo ====================================================
echo FlexSearch index already generated
echo ====================================================
echo.
echo FlexSearch index was generated during data generation phase
echo No additional indexing step needed
echo.

echo.
echo ====================================================
echo Starting Hugo Development Server
echo ====================================================
echo.
echo [INFO] Starting Hugo Server...
echo   Content Directory: .content-vp-converted (VitePress syntax converted)
echo   Content Watcher: Enabled (editing content/ will auto-convert)
echo   Access: http://localhost:%PORT%
echo   Press Ctrl+C to stop (will auto-cleanup background processes)
echo.

REM Start Hugo (blocking foreground process)
bin\windows\hugo.exe server --environment=%THEME% --source="%ROOT_DIR%\hugo-teek-site" --contentDir="%ROOT_DIR%\hugo-teek-site\.content-vp-converted" --bind=0.0.0.0 --port=%PORT% --buildDrafts --logLevel info --poll 500ms --disableFastRender
if errorlevel 1 (
    echo.
    echo [ERROR] Hugo server failed to start
    pause
    exit /b 1
)

REM Cleanup after Hugo exits
echo.
echo Stopping development server...

REM Stop content-watcher
set "PID_FILE=.content-watcher.pid.win"
if exist "%PID_FILE%" (
    set /p WATCHER_PID=<%PID_FILE%
    if defined WATCHER_PID (
        echo   Stopping content watcher - PID !WATCHER_PID!...
        taskkill /PID !WATCHER_PID! /F >nul 2>nul
    )
    del "%PID_FILE%" 2>nul
)

REM Also clean up Linux PID file if present (cleanup cross-platform)
if exist .content-watcher.pid (
    del .content-watcher.pid 2>nul
)

echo.
echo [SUCCESS] Cleanup complete
pause
exit /b 0
