@echo off
chcp 65001 >nul
title BUZZ-ROOT バズルート
echo.
echo  ╔══════════════════════════════════════╗
echo  ║     🔥 BUZZ-ROOT (バズルート)         ║
echo  ║     サーバー起動中...                  ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/2] バックエンド起動中 (port 8000)...
start "BUZZ-ROOT Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --reload --port 8000"

echo [2/2] フロントエンド起動中 (port 3000)...
start "BUZZ-ROOT Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo  ✅ 起動完了！ブラウザを開きます...
echo  フロントエンド: http://localhost:3000
echo  バックエンド:   http://localhost:8000/docs
echo.

start http://localhost:3000

echo  ※ 終了するには開いたターミナルウィンドウを閉じてください
pause
