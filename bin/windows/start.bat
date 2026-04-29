@echo off
REM ====================================================
REM Hugo Teek - Development Server (原生 Hugo 版，无 VitePress 转译)
REM ====================================================

chcp 65001 >nul 2>nul
setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%..\..\"
set ROOT_DIR=%CD%

echo ====================================================
echo Hugo Teek - 原生 Hugo 服务器 (已关闭 VitePress 转译)
echo ====================================================
echo Project directory: %ROOT_DIR%
echo.

REM 自动读取主题
set THEME=
if exist "hugo-teek-site\config\_default\hugo.toml" (
    for /f "tokens=2 delims== " %%a in ('findstr /r "^theme *= *" hugo-teek-site\config\_default\hugo.toml 2^>nul') do (
        set THEME=%%a
    )
)
if defined THEME set "THEME=!THEME:"=!"
if not defined THEME set THEME=hugo-teek

echo 已启用主题: %THEME%
echo.

echo ====================================================
echo 清理旧文件（不生成 VP 转译目录）
echo ====================================================
rmdir /s /q "hugo-teek-site\public" 2>nul
rmdir /s /q "hugo-teek-site\resources" 2>nul
rmdir /s /q "hugo-teek-site\.content-vp-converted" 2>nul
del ".content-watcher.pid.win" 2>nul
del ".content-watcher.pid" 2>nul
echo 清理完成！
echo.

echo ====================================================
echo 启动 原生 Hugo 服务器
echo ====================================================
echo 内容目录: content/ (原生模式，无转换)
echo 访问: http://localhost:9090
echo.

bin\windows\hugo.exe server ^
--environment=%THEME% ^
--source="%ROOT_DIR%\hugo-teek-site" ^
--contentDir="%ROOT_DIR%\hugo-teek-site\content" ^
--bind=0.0.0.0 ^
--port=9090 ^
--buildDrafts ^
--disableFastRender ^
--poll 500ms

echo.
echo [完成] 服务器已停止
pause
exit /b 0