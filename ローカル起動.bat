@echo off
chcp 65001 >nul
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js が見つかりません。
  echo https://nodejs.org/ からNode.jsをインストールしてください。
  pause
  exit /b 1
)

if not exist node_modules (
  echo 初回セットアップを行っています...
  call npm install
  if errorlevel 1 (
    echo セットアップに失敗しました。
    pause
    exit /b 1
  )
)

echo.
echo Staff Plannerを起動します。
echo ブラウザで http://localhost:5173 を開いてください。
echo 終了する場合は Ctrl+C を押します。
echo.
call npm run dev
pause
