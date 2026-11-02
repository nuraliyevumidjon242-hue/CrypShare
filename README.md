# CrypShare

### Browser-based encrypted file-sharing prototype

**[Download the English project presentation (PPTX)](./CrypShare_Project_Presentation_EN.pptx)** · **[View the source presentation](./CrypShare_Ausbildung_Presentation_095527.pptx)**

CrypShare is a learning project that demonstrates encrypting files in the browser before uploading them to a lightweight HTTP server. It uses the Web Crypto API and offers Python, Node.js, and PowerShell server implementations.

> **Prototype notice:** CrypShare has not been independently security-audited and is not approved for production use. It does not establish GDPR compliance or guaranteed zero-knowledge security. A compromised server could deliver modified client-side code.

## Project at a glance

### 01 · The idea

Encrypt a file in the browser, then store and share the encrypted package through a small server. The project is intended for learning and portfolio demonstrations—not as a replacement for a reviewed file-sharing service.

### 02 · How it works

1. The browser derives or generates a key and encrypts the selected file with **AES-256-GCM**.
2. The encrypted package is uploaded with a file ID, expiry setting, and download limit.
3. A recipient downloads the package and decrypts it in their browser using the key or password.
4. The URL-fragment mode keeps the key out of ordinary HTTP requests, but the **entire sharing link must be treated as a secret**.

### 03 · Technology

- **Frontend:** HTML, CSS, JavaScript, and the Web Crypto API
- **Encryption:** AES-256-GCM; PBKDF2 with SHA-256 and 100,000 iterations for password-derived keys
- **Backends:** Python, Node.js, or PowerShell; optional Docker Compose setup
- **Upload limit:** 50 MiB per request

### 04 · What this prototype does not guarantee

- No independent security review, authentication, rate limiting, or built-in TLS termination.
- Expiry and download limits trigger deletion attempts; overwriting does not guarantee physical erasure on SSDs, snapshots, backups, or copy-on-write filesystems.
- Client-side encryption alone does not protect against a server that changes the JavaScript it serves.
- The visual link preview is decorative; it is **not** a scannable QR code.
- GDPR compliance depends on the real deployment and processing context and is not certified by this project.

Do not expose an instance directly to the public internet. A real deployment would need a threat-model review, independent security assessment, HTTPS, access controls, abuse protections, and an appropriate privacy/legal review.

## Run locally

**Windows**

```cmd
start_server.bat
```

**Python**

```bash
python server.py
```

**Node.js**

```bash
node server.js
```

**Docker**

```bash
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080).

## Repository contents

- [English presentation (PPTX)](./CrypShare_Project_Presentation_EN.pptx)
- [Technical notes and limitations](./DSGVO_Technical_Notes.md)
- [Application source](./index.html)
- [Python server](./server.py) · [Node.js server](./server.js) · [PowerShell server](./server.ps1)

The original project concept, technical specification, and German presentation are also included as supplementary learning materials. Runtime uploads and metadata in `/storage` are excluded from Git.
