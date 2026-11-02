#!/usr/bin/env bash
set -e

echo "===================================================="
echo "🚀 CrypShare - Docker Launch (macOS / Linux)"
echo "===================================================="

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ XATO: Docker topilmadi. Iltimos Docker Desktop-ni ishga tushiring."
  exit 1
fi

echo "📍 Ilova manzili: http://localhost:8080"
echo "📦 Docker konteynerlari yig'ilmoqda va ishga tushirilmoqda..."
echo "----------------------------------------------------"

if command -v docker-compose >/dev/null 2>&1; then
  docker-compose up --build
else
  docker compose up --build
fi
