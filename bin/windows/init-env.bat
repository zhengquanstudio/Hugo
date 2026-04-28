@echo off
REM ====================================================
REM Hugo Teek - Environment Initialization
REM ====================================================

setlocal enabledelayedexpansion
chcp 65001 >nul 2>nul

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%..\..\"
if errorlevel 1 (
    echo [ERROR] Cannot navigate to project root
    exit /b 1
)

set PROJECT_ROOT=%CD%
echo Project Root: %PROJECT_ROOT%
echo.

set ENV_FILE=%PROJECT_ROOT%\.env
set ENV_EXAMPLE=%PROJECT_ROOT%\.env.example

if not exist "%ENV_EXAMPLE%" (
    echo [ERROR] .env.example file not found
    exit /b 1
)

REM Check if .env exists - if not, create from example with port conversion
if not exist "%ENV_FILE%" (
    echo Creating .env file from .env.example for Windows...
    echo Converting Linux ports to Windows ports ^(+1000^)...
    (for /f "usebackq delims=" %%a in ("%ENV_EXAMPLE%") do (
        set "line=%%a"
        REM Replace __PROJECT_ROOT__ placeholder
        set "line=!line:__PROJECT_ROOT__=%PROJECT_ROOT%!"

        REM Convert Linux ports to Windows ports
        set "line=!line:HUGO_TEEK_PORT=8888=HUGO_TEEK_PORT=9888!"
        set "line=!line:HUGO_TEEK_HUGO_PORT=8090=HUGO_TEEK_HUGO_PORT=9090!"
        set "line=!line:HUGO_TEEK_VITE_PORT=5173=HUGO_TEEK_VITE_PORT=6173!"

        echo !line!
    )) > "%ENV_FILE%"
    echo [OK] .env file created with Windows ports
    echo.
)

REM ====================================================
REM Sync new variables from .env.example
REM ====================================================
if exist "%ENV_FILE%" (
    echo Checking for new variables from .env.example...
    set "SYNC_COUNT=0"

    REM Extract variable names from .env.example and check if missing in .env
    for /f "usebackq tokens=1 delims== " %%v in ("%ENV_EXAMPLE%") do (
        set "var_name=%%v"
        REM Skip comments and empty lines
        echo !var_name! | findstr /r "^[A-Z_][A-Z0-9_]*$" >nul 2>nul
        if not errorlevel 1 (
            REM Check if variable exists in .env
            findstr /b /c:"!var_name!=" "%ENV_FILE%" >nul 2>nul
            if errorlevel 1 (
                REM Variable missing, find and add it from .env.example
                for /f "usebackq delims=" %%a in ("%ENV_EXAMPLE%") do (
                    set "line=%%a"
                    echo !line! | findstr /b /c:"!var_name!=" >nul 2>nul
                    if not errorlevel 1 (
                        REM Convert ports for Windows
                        set "line=!line:HUGO_TEEK_PORT=8888=HUGO_TEEK_PORT=9888!"
                        set "line=!line:HUGO_TEEK_HUGO_PORT=8090=HUGO_TEEK_HUGO_PORT=9090!"
                        set "line=!line:HUGO_TEEK_VITE_PORT=5173=HUGO_TEEK_VITE_PORT=6173!"
                        set "line=!line:__PROJECT_ROOT__=%PROJECT_ROOT%!"
                        echo !line! >> "%ENV_FILE%"
                        echo [+] Added: !var_name!
                        set /a "SYNC_COUNT+=1"
                    )
                )
            )
        )
    )

    if !SYNC_COUNT! equ 0 (
        echo [OK] .env is up to date ^(no new variables^)
    ) else (
        echo [OK] Added !SYNC_COUNT! new variable^(s^) to .env
    )
    echo.
)

REM ====================================================
REM Auto-migrate old Linux ports to Windows ports
REM ====================================================
echo Checking for Linux port configuration...
set "NEEDS_MIGRATION=0"

REM Check each port variable for Linux defaults
findstr /c:"HUGO_TEEK_PORT=8888" "%ENV_FILE%" >nul 2>nul
if not errorlevel 1 set "NEEDS_MIGRATION=1"

findstr /c:"HUGO_TEEK_HUGO_PORT=8090" "%ENV_FILE%" >nul 2>nul
if not errorlevel 1 set "NEEDS_MIGRATION=1"

findstr /c:"HUGO_TEEK_VITE_PORT=5173" "%ENV_FILE%" >nul 2>nul
if not errorlevel 1 set "NEEDS_MIGRATION=1"

if "%NEEDS_MIGRATION%"=="1" (
    echo [INFO] Detected Linux port configuration, migrating to Windows ports...

    REM Backup old .env with timestamp
    set "TIMESTAMP=%DATE:~0,4%%DATE:~5,2%%DATE:~8,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
    set "TIMESTAMP=!TIMESTAMP: =0!"
    copy "%ENV_FILE%" "%ENV_FILE%.backup.!TIMESTAMP!" >nul

    REM Create temp file with migrated ports
    set "TEMP_ENV=%TEMP%\env_migrate_%RANDOM%.txt"
    (for /f "usebackq delims=" %%a in ("%ENV_FILE%") do (
        set "line=%%a"
        set "line=!line:HUGO_TEEK_PORT=8888=HUGO_TEEK_PORT=9888!"
        set "line=!line:HUGO_TEEK_HUGO_PORT=8090=HUGO_TEEK_HUGO_PORT=9090!"
        set "line=!line:HUGO_TEEK_VITE_PORT=5173=HUGO_TEEK_VITE_PORT=6173!"
        echo !line!
    )) > "!TEMP_ENV!"

    REM Replace original .env
    move /y "!TEMP_ENV!" "%ENV_FILE%" >nul

    echo [OK] Port migration complete:
    echo     8888 -^> 9888 ^(Backend^)
    echo     8090 -^> 9090 ^(Hugo^)
    echo     5173 -^> 6173 ^(Vite^)
    echo     Backup saved: %ENV_FILE%.backup.!TIMESTAMP!
    echo.
) else (
    echo [OK] Already using Windows ports
    echo.
)

echo Loading environment variables...
echo.

REM ====================================================
REM Create temp file to export variables to parent scope
REM ====================================================
set "EXPORT_FILE=%TEMP%\hugo_teek_env_%RANDOM%.bat"
(
    echo @echo off
    echo REM Hugo Teek Environment Variables Export
) > "%EXPORT_FILE%"

REM Parse .env file and generate export commands
for /f "usebackq delims=" %%L in ("%ENV_FILE%") do (
    set "line=%%L"
    set "firstchar=!line:~0,1!"
    REM Skip comments and empty lines
    if not "!firstchar!"=="#" (
        if not "!line!"=="" (
            REM Parse VAR=VALUE format
            for /f "tokens=1* delims==" %%A in ("!line!") do (
                set "varname=%%A"
                set "varvalue=%%B"
                REM Trim trailing spaces from varname
                for /f "tokens=*" %%C in ("!varname!") do set "varname=%%C"
                if not "!varname!"=="" (
                    REM Replace forward slashes with backslashes for path variables
                    set "exportvalue=!varvalue:/=\!"
                    REM Expand ${HUGO_TEEK_BASE_DIR} placeholder
                    set "exportvalue=!exportvalue:${HUGO_TEEK_BASE_DIR}=%PROJECT_ROOT%!"
                    REM Expand ${HUGO_TEEK_DATA_DIR} placeholder
                    set "data_dir=%PROJECT_ROOT%\hugo-teek-site\data"
                    set "exportvalue=!exportvalue:${HUGO_TEEK_DATA_DIR}=!data_dir!!"
                    REM Expand ${HUGO_TEEK_STATIC_DIR} placeholder
                    set "static_dir=%PROJECT_ROOT%\hugo-teek-site\static"
                    set "exportvalue=!exportvalue:${HUGO_TEEK_STATIC_DIR}=!static_dir!!"
                    echo set "!varname!=!exportvalue!" >> "%EXPORT_FILE%"
                )
            )
        )
    )
)

REM Add validation and defaults
(
    echo if not defined HUGO_TEEK_PORT set "HUGO_TEEK_PORT=9888"
    echo if not defined HUGO_TEEK_HUGO_PORT set "HUGO_TEEK_HUGO_PORT=9090"
    echo if not defined HUGO_TEEK_VITE_PORT set "HUGO_TEEK_VITE_PORT=6173"
    echo if not defined HUGO_TEEK_MODE set "HUGO_TEEK_MODE=debug"
) >> "%EXPORT_FILE%"

REM Ensure .env file exists with correct Windows ports (init done)
REM Environment variables are loaded directly by caller from .env file
exit /b 0
