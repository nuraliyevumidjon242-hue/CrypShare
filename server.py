#!/usr/bin/env python3
"""
CrypShare – Browser Encryption Prototype REST API & Static Server
Compatible with Python 3.8+ (Zero external dependencies)
"""

import http.server
import socketserver
import os
import json
import time
import threading
import mimetypes
import uuid
import re

PORT = int(os.environ.get("PORT", 8080))
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
META_FILE = os.path.join(STORAGE_DIR, "metadata.json")
FILE_ID_REGEX = re.compile(r"^[a-zA-Z0-9_-]+$")
MAX_UPLOAD_SIZE = 50 * 1024 * 1024  # 50 MB max payload limit
STATIC_FILES = {
    "/": "index.html",
    "/index.html": "index.html",
    "/style.css": "style.css",
    "/crypto.js": "crypto.js",
    "/app.js": "app.js",
}

os.makedirs(STORAGE_DIR, exist_ok=True)
lock = threading.Lock()

def load_metadata():
    if os.path.exists(META_FILE):
        try:
            with open(META_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_metadata(meta):
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

def shred_file(file_path):
    """Overwrites file with random bytes/zeroes before unlinking (Secure Shredding)"""
    try:
        abs_path = os.path.abspath(file_path)
        if os.path.commonpath([STORAGE_DIR, abs_path]) != STORAGE_DIR:
            print(f"[SECURITY ALERT] Prevented unauthorized shredding outside STORAGE_DIR: {abs_path}")
            return False
        if os.path.exists(abs_path):
            length = os.path.getsize(abs_path)
            with open(abs_path, "wb") as f:
                f.write(b"\x00" * length)
            os.remove(abs_path)
            return True
    except Exception as e:
        print(f"[SHRED ERROR] {e}")
    return False

def cleanup_worker():
    """Background worker to purge expired files based on TTL and max downloads"""
    while True:
        try:
            time.sleep(5)
            now_ms = int(time.time() * 1000)
            with lock:
                meta = load_metadata()
                to_delete = []
                for file_id, item in meta.items():
                    expires_at = item.get("expiresAt", 0)
                    downloads_left = item.get("downloadsLeft", 1)
                    if (expires_at > 0 and now_ms >= expires_at) or downloads_left <= 0:
                        to_delete.append(file_id)

                for file_id in to_delete:
                    file_path = os.path.join(STORAGE_DIR, f"{file_id}.bin")
                    shred_file(file_path)
                    del meta[file_id]
                    print(f"[SHREDDED] Expired file purged: {file_id}")

                if to_delete:
                    save_metadata(meta)
        except Exception as e:
            print(f"[CLEANUP ERROR] {e}")

class CrypShareHTTPHandler(http.server.BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "*")
        # Security Hardening Headers
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("X-XSS-Protection", "1; mode=block")
        self.send_header("Content-Security-Policy", "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?")[0]

        # REST API: Health Check
        if path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            with lock:
                count = len(load_metadata())
            res = {
                "status": "healthy",
                "engine": "CrypShare Python Engine",
                "dsgvoCompliant": None,
                "securityLevel": "not-audited",
                "activeVaultFiles": count
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))
            return

        # REST API: Download / Get Encrypted File
        if path.startswith("/api/file/"):
            file_id = path.replace("/api/file/", "").strip()
            if not FILE_ID_REGEX.match(file_id):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid file ID format"}).encode("utf-8"))
                return

            now_ms = int(time.time() * 1000)
            binary_data = None

            with lock:
                meta = load_metadata()
                if file_id in meta:
                    item = meta[file_id]
                    expires_at = item.get("expiresAt", 0)
                    downloads_left = item.get("downloadsLeft", 1)

                    if (expires_at > 0 and now_ms > expires_at) or downloads_left <= 0:
                        del meta[file_id]
                        save_metadata(meta)
                        shred_file(os.path.join(STORAGE_DIR, f"{file_id}.bin"))
                    else:
                        file_path = os.path.abspath(os.path.join(STORAGE_DIR, f"{file_id}.bin"))
                        if os.path.commonpath([STORAGE_DIR, file_path]) == STORAGE_DIR and os.path.exists(file_path):
                            with open(file_path, "rb") as f:
                                binary_data = f.read()
                            item["downloadsLeft"] = downloads_left - 1
                            if item["downloadsLeft"] <= 0:
                                del meta[file_id]
                                save_metadata(meta)
                                shred_file(file_path)
                            else:
                                save_metadata(meta)

            if binary_data:
                self.send_response(200)
                self.send_header("Content-Type", "application/octet-stream")
                self.send_header("Content-Length", str(len(binary_data)))
                self.end_headers()
                self.wfile.write(binary_data)
                print(f"[DOWNLOAD] Served encrypted file: {file_id}")
                return

            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "File not found or expired"}).encode("utf-8"))
            return

        # Serve only the frontend assets; never expose storage or project files.
        static_file = STATIC_FILES.get(path)
        if static_file is None:
            self.send_response(404)
            self.end_headers()
            return
        full_path = os.path.join(BASE_DIR, static_file)

        if os.path.isfile(full_path):
            mime, _ = mimetypes.guess_type(full_path)
            mime = mime or "application/octet-stream"
            with open(full_path, "rb") as f:
                content = f.read()

            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        path = self.path.split("?")[0]

        if path == "/api/upload":
            file_id = self.headers.get("X-File-Id") or f"cs-{uuid.uuid4().hex[:12]}"
            if not FILE_ID_REGEX.match(file_id):
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Invalid X-File-Id header"}).encode("utf-8"))
                return

            ttl_min = int(self.headers.get("X-TTL-Minutes", "60"))
            max_down = int(self.headers.get("X-Max-Downloads", "1"))
            checksum = self.headers.get("X-Checksum", "unknown")
            content_length = int(self.headers.get("Content-Length", 0))

            if content_length > MAX_UPLOAD_SIZE:
                self.send_response(413)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Payload Too Large. Maximum allowed size is 50MB."}).encode("utf-8"))
                return

            binary_data = self.rfile.read(content_length)

            file_path = os.path.abspath(os.path.join(STORAGE_DIR, f"{file_id}.bin"))
            if os.path.commonpath([STORAGE_DIR, file_path]) != STORAGE_DIR:
                self.send_response(403)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Access Denied: Path Traversal Attempt"}).encode("utf-8"))
                return

            with open(file_path, "wb") as f:
                f.write(binary_data)

            now_ms = int(time.time() * 1000)
            expires_at = now_ms + (ttl_min * 60 * 1000) if ttl_min > 0 else 0
            downloads_left = max_down if max_down > 0 else 999999

            with lock:
                meta = load_metadata()
                meta[file_id] = {
                    "fileId": file_id,
                    "checksum": checksum,
                    "size": len(binary_data),
                    "createdAt": now_ms,
                    "expiresAt": expires_at,
                    "ttlMinutes": ttl_min,
                    "maxDownloads": max_down,
                    "downloadsLeft": downloads_left
                }
                save_metadata(meta)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            res = {
                "success": True,
                "fileId": file_id,
                "message": "Encrypted package stored."
            }
            self.wfile.write(json.dumps(res).encode("utf-8"))
            print(f"[UPLOAD] Saved encrypted file: {file_id} ({len(binary_data)} bytes)")
            return

        self.send_response(404)
        self.end_headers()

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True

def main():
    cleaner = threading.Thread(target=cleanup_worker, daemon=True)
    cleaner.start()

    server = ThreadedHTTPServer(("0.0.0.0", PORT), CrypShareHTTPHandler)
    print("=" * 60)
    print(f"  CrypShare Python Prototype Server")
    print(f"  Listening on: http://localhost:{PORT}")
    print(f"  Storage directory: {STORAGE_DIR}")
    print("=" * 60)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopping...")
        server.server_close()

if __name__ == "__main__":
    main()
