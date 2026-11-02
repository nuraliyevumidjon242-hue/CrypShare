# CrypShare – Verschlüsselte Dateifreigabe (Prototyp)

![Architecture](https://img.shields.io/badge/Architecture-Client--Side%20Encryption-blue?style=for-the-badge)
![Encryption](https://img.shields.io/badge/Encryption-AES--256--GCM-orange?style=for-the-badge)

> **Zweck:** Lern- und Portfolio-Projekt
> **Status:** Prototyp; nicht unabhängig sicherheitsgeprüft und nicht für den produktiven Einsatz freigegeben
> **Sprachen:** Deutsch | English | O'zbekcha

---

## Überblick

CrypShare demonstriert clientseitige Dateiverschlüsselung mit der Web Crypto API und drei einfachen HTTP-Server-Varianten (Python, Node.js und PowerShell). Die Dateien werden im Browser mit AES-256-GCM verschlüsselt, bevor sie an den Server gesendet werden. Beim URL-Modus befindet sich das Geheimnis im URL-Fragment; Browser senden dieses Fragment nicht in HTTP-Anfragen. Behandle den vollständigen Freigabelink trotzdem wie ein Passwort.

Die Anwendung ist **kein geprüftes Zero-Knowledge-Produkt**. Ein kompromittierter oder veränderter Webserver kann manipuliertes JavaScript ausliefern. Es gibt keine unabhängige Sicherheitsprüfung und keine bestätigte DSGVO-Konformität.

## Implementierte Eckdaten

| Bereich | Implementierung |
|---|---|
| Verschlüsselung | AES-256-GCM über Web Crypto API |
| Passwortableitung | PBKDF2 / SHA-256, 100.000 Iterationen |
| Upload-Grenze | 50 MiB pro Anfrage |
| Ablaufsteuerung | TTL und Download-Zähler; Löschung/Überschreiben ist Best-Effort, keine garantierte physische Vernichtung |
| Statische Dateien | Nur die Frontend-Dateien werden von den mitgelieferten Servern ausgeliefert |
| Link-/QR-Vorschau | Die dargestellte Matrix ist dekorativ und kein scanbarer QR-Code |

## Starten

Windows:
```cmd
start_server.bat
```

Python:
```bash
python server.py
```

Node.js:
```bash
node server.js
```

Docker:
```bash
docker compose up --build
```

## Grenzen und Veröffentlichung

- Die Server bieten keine Anmeldung, Autorisierung, Ratenbegrenzung oder TLS-Terminierung. Nicht direkt öffentlich betreiben; für externe Nutzung wären unter anderem ein geprüftes Deployment mit HTTPS, Missbrauchsschutz, Monitoring und Sicherheitsreview erforderlich.
- Überschreiben vor dem Löschen garantiert keine sichere physische Löschung auf SSDs, Copy-on-Write-Dateisystemen, Snapshots oder Backups.
- Die Beispiel-Präsentation und Konzeptdateien sind Lernmaterial, keine Rechtsberatung, Sicherheitszertifizierung oder Nachweis der DSGVO-Konformität.
- `/storage` enthält Laufzeitdaten und wird nicht versioniert.
