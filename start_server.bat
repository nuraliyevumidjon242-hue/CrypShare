@echo off
title CrypShare - Zero-Knowledge Cloud-Dateifreigabe (DSGVO)
cls
echo =====================================================================
echo    CrypShare GmbH - Sichere Zero-Knowledge Dateifreigabe
echo    DSGVO Art. 32 Konforme Cloud-Plattform
echo =====================================================================
echo.
echo Server wird initialisiert...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process 'http://localhost:8080'"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080

pause
