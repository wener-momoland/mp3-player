@echo off
chcp 65001 >nul
echo ================================
echo   MP3 Player 安装脚本
echo ================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js (https://nodejs.org/)
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✓ Node.js 版本: %NODE_VERSION%
echo.

REM 安装依赖
echo 正在安装依赖...
call npm install

if %ERRORLEVEL% equ 0 (
    echo.
    echo ✓ 依赖安装成功！
    echo.
    echo ================================
    echo   安装完成
    echo ================================
    echo.
    echo 运行方式：
    echo   开发模式: npm start
    echo   打包应用: npm run build-win
    echo.
) else (
    echo.
    echo ❌ 依赖安装失败，请检查网络连接或 npm 配置
    pause
    exit /b 1
)

pause
