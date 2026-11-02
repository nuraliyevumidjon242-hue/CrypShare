Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "🚀 CrypShare - Docker Launch (Windows PowerShell)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ XATO: Docker topilmadi yoki ishga tushmagan." -ForegroundColor Red
    Write-Host "Iltimos, Docker Desktop dasturini ishga tushiring." -ForegroundColor Yellow
    Read-Host "Davom etish uchun Enter bosing..."
    exit 1
}

Write-Host "📍 Ilova manzili: http://localhost:8080" -ForegroundColor Yellow
Write-Host "📦 Docker konteynerlari yig'ilmoqda va ishga tushirilmoqda..." -ForegroundColor Green
Write-Host "----------------------------------------------------"

try {
    docker compose up --build
} catch {
    docker-compose up --build
}
