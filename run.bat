@echo off
title CrypShare - Docker Launch (Windows)
cls
echo ====================================================
echo    CrypShare - Docker Launch (Windows)
echo ====================================================
echo.

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [XATO] Docker topilmadi yoki ishga tushmagan.
    echo Iltimos, Docker Desktop dasturini ishga tushiring.
    pause
    exit /b 1
)

echo [INFO] Ilova manzili: http://localhost:8080
echo [INFO] Docker konteynerlari yig'ilmoqda va ishga tushirilmoqda...
echo ----------------------------------------------------

docker compose up --build
if %errorlevel% neq 0 (
    docker-compose up --build
)

pause
