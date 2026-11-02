# ==============================================================================
# CrypShare – Docker Containerization
# DSGVO-Konforme Zero-Knowledge Cloud-Dateifreigabe
# ==============================================================================

FROM python:3.11-alpine

LABEL maintainer="CrypShare Security Team"
LABEL description="Zero-Knowledge Secure File Sharing Platform according to EU DSGVO standards"

WORKDIR /app

# Non-root user for maximum container security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY index.html style.css crypto.js app.js server.py ./

RUN mkdir -p /app/storage && chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/api/health')"

CMD ["python", "server.py"]
