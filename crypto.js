/**
 * CrypShare - Browser Cryptographic Prototype
 * Standard: HTML5 Web Crypto API (SubtleCrypto)
 * Algorithmen: AES-256-GCM (Verschlüsselung), PBKDF2 (Schlüsselableitung), SHA-256 (Integrität)
 * Client-side encryption prototype; not independently audited
 */

class CrypShareCrypto {
  constructor() {
    this.crypto = window.crypto || window.msCrypto;
    if (!this.crypto || !this.crypto.subtle) {
      throw new Error("Web Crypto API wird von diesem Browser nicht unterstützt!");
    }
    this.PBKDF2_ITERATIONS = 100000;
    this.SALT_BYTES = 16;     // 128-bit Salt
    this.IV_BYTES = 12;       // 96-bit IV für AES-GCM
    this.KEY_LENGTH = 256;    // 256-bit AES Schlüssel
  }

  /**
   * Generiert kryptografisch sichere Zufalls-Bytes
   */
  getRandomBytes(length) {
    const bytes = new Uint8Array(length);
    this.crypto.getRandomValues(bytes);
    return bytes;
  }

  /**
   * Generiert ein hochsicheres, zufälliges Passwort / Secret Key
   */
  generateRandomPassphrase(length = 24) {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*+=-_";
    const randomValues = new Uint32Array(length);
    this.crypto.getRandomValues(randomValues);
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
    return result;
  }

  /**
   * Berechnet den SHA-256 Hash einer Datei / eines Buffers (Hex-String)
   */
  async computeSHA256(arrayBuffer) {
    const hashBuffer = await this.crypto.subtle.digest("SHA-256", arrayBuffer);
    return this.bufferToHex(hashBuffer);
  }

  /**
   * Leitet einen 256-Bit AES-GCM Schlüssel aus einem Passwort und Salt via PBKDF2 ab
   */
  async deriveKeyFromPassword(password, saltUint8Array, onProgress = null) {
    if (onProgress) onProgress(20, "PBKDF2 Schlüsselableitung wird initialisiert...");
    const enc = new TextEncoder();
    const keyMaterial = await this.crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );

    if (onProgress) onProgress(40, "100.000 Iterationen mit SHA-256 werden berechnet...");
    const derivedKey = await this.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltUint8Array,
        iterations: this.PBKDF2_ITERATIONS,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: this.KEY_LENGTH },
      true, // exportable for key inspect
      ["encrypt", "decrypt"]
    );

    return derivedKey;
  }

  /**
   * Importiert einen rohen 256-Bit Key direkt (z.B. aus URL Hash Fragment)
   */
  async importRawKey(rawKeyBytes) {
    return await this.crypto.subtle.importKey(
      "raw",
      rawKeyBytes,
      { name: "AES-GCM", length: this.KEY_LENGTH },
      true,
      ["encrypt", "decrypt"]
    );
  }

  /**
   * Exportiert einen AES-GCM Key als Raw Bytes
   */
  async exportRawKey(cryptoKey) {
    return await this.crypto.subtle.exportKey("raw", cryptoKey);
  }

  /**
   * Verschlüsselt einen ArrayBuffer mit AES-256-GCM
   */
  async encryptFileBuffer(fileArrayBuffer, passwordOrKey, metadata = {}, onProgress = null) {
    const startTime = performance.now();

    if (onProgress) onProgress(10, "Kryptografischer Salt und IV werden generiert...");
    const salt = this.getRandomBytes(this.SALT_BYTES);
    const iv = this.getRandomBytes(this.IV_BYTES);

    let key;
    let isDirectKey = false;

    if (typeof passwordOrKey === "string") {
      key = await this.deriveKeyFromPassword(passwordOrKey, salt, onProgress);
    } else if (passwordOrKey instanceof CryptoKey) {
      key = passwordOrKey;
      isDirectKey = true;
    } else if (passwordOrKey instanceof Uint8Array || passwordOrKey instanceof ArrayBuffer) {
      key = await this.importRawKey(passwordOrKey);
      isDirectKey = true;
    } else {
      throw new Error("Ungültiger Schlüsseltyp!");
    }

    if (onProgress) onProgress(60, "Originale Prüfsumme (SHA-256) wird berechnet...");
    const originalChecksum = await this.computeSHA256(fileArrayBuffer);

    // Zusätzliche Metadaten als Additional Authenticated Data (AAD)
    const metaObj = {
      ...metadata,
      checksum: originalChecksum,
      encryptedAt: new Date().toISOString(),
      size: fileArrayBuffer.byteLength
    };
    const metaString = JSON.stringify(metaObj);
    const metaBytes = new TextEncoder().encode(metaString);

    if (onProgress) onProgress(80, "AES-256-GCM Verschlüsselung läuft...");
    const ciphertextBuffer = await this.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
        additionalData: metaBytes
      },
      key,
      fileArrayBuffer
    );

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    if (onProgress) onProgress(100, "Verschlüsselung erfolgreich abgeschlossen!");

    // Exportierbare Raw Key Daten für Live-Inspektor
    let exportedKeyHex = "";
    try {
      const rawKey = await this.crypto.subtle.exportKey("raw", key);
      exportedKeyHex = this.bufferToHex(rawKey);
    } catch (e) {
      exportedKeyHex = "[GESCHÜTZT]";
    }

    return {
      ciphertext: ciphertextBuffer,
      salt: salt,
      saltHex: this.bufferToHex(salt),
      saltBase64: this.bufferToBase64(salt),
      iv: iv,
      ivHex: this.bufferToHex(iv),
      ivBase64: this.bufferToBase64(iv),
      metadata: metaObj,
      metadataBytes: metaBytes,
      metadataBase64: this.bufferToBase64(metaBytes),
      originalChecksum: originalChecksum,
      derivedKeyHex: exportedKeyHex,
      durationMs: durationMs,
      ciphertextSize: ciphertextBuffer.byteLength
    };
  }

  /**
   * Entschlüsselt einen Ciphertext-Buffer mit AES-256-GCM
   */
  async decryptFileBuffer(ciphertextBuffer, salt, iv, metadataBytes, passwordOrKey, onProgress = null) {
    const startTime = performance.now();

    if (onProgress) onProgress(15, "Schlüssel für Entschlüsselung wird vorbereitet...");
    let key;

    if (typeof passwordOrKey === "string") {
      key = await this.deriveKeyFromPassword(passwordOrKey, salt, onProgress);
    } else if (passwordOrKey instanceof CryptoKey) {
      key = passwordOrKey;
    } else if (passwordOrKey instanceof Uint8Array || passwordOrKey instanceof ArrayBuffer) {
      key = await this.importRawKey(passwordOrKey);
    } else {
      throw new Error("Ungültiges Schlüsselformat für Entschlüsselung!");
    }

    if (onProgress) onProgress(60, "AES-256-GCM Entschlüsselung und Integritätsprüfung...");
    let decryptedBuffer;
    try {
      decryptedBuffer = await this.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv,
          additionalData: metadataBytes
        },
        key,
        ciphertextBuffer
      );
    } catch (error) {
      throw new Error("Authentifizierungsfehler: Falsches Passwort oder manipulierte Datei! (AES-GCM Auth Tag Mismatch)");
    }

    if (onProgress) onProgress(85, "SHA-256 Prüfsumme der entschlüsselten Datei wird verifiziert...");
    const verifiedChecksum = await this.computeSHA256(decryptedBuffer);

    // Metadaten parsen
    let parsedMetadata = {};
    try {
      parsedMetadata = JSON.parse(new TextDecoder().decode(metadataBytes));
    } catch (e) {
      parsedMetadata = {};
    }

    if (parsedMetadata.checksum && parsedMetadata.checksum !== verifiedChecksum) {
      throw new Error("Kritischer Integritätsfehler: SHA-256 Prüfsumme stimmt nicht überein!");
    }

    const endTime = performance.now();
    const durationMs = Math.round(endTime - startTime);

    if (onProgress) onProgress(100, "Datei erfolgreich entschlüsselt und verifiziert!");

    return {
      decryptedBuffer: decryptedBuffer,
      metadata: parsedMetadata,
      checksum: verifiedChecksum,
      durationMs: durationMs,
      size: decryptedBuffer.byteLength
    };
  }

  /**
   * Verpackt alle Komponenten in ein transportables Binärpaket
   * Format:
   * [4 Bytes Magic 'CRYP']
   * [1 Byte Version = 1]
   * [1 Byte SaltLength = 16]
   * [Salt Bytes]
   * [1 Byte IVLength = 12]
   * [IV Bytes]
   * [4 Bytes MetaLength (Big Endian UInt32)]
   * [Meta JSON Bytes]
   * [AES-256-GCM Ciphertext + Tag]
   */
  packagePayload(salt, iv, metadataBytes, ciphertextBuffer) {
    const magic = new Uint8Array([0x43, 0x52, 0x59, 0x50]); // 'CRYP'
    const version = 1;
    const metaLen = metadataBytes.byteLength;
    const headerSize = 4 + 1 + 1 + salt.byteLength + 1 + iv.byteLength + 4 + metaLen;
    const totalSize = headerSize + ciphertextBuffer.byteLength;

    const packageBuffer = new ArrayBuffer(totalSize);
    const view = new DataView(packageBuffer);
    const uint8 = new Uint8Array(packageBuffer);

    let offset = 0;
    // Magic
    uint8.set(magic, offset); offset += 4;
    // Version
    view.setUint8(offset, version); offset += 1;
    // Salt
    view.setUint8(offset, salt.byteLength); offset += 1;
    uint8.set(salt, offset); offset += salt.byteLength;
    // IV
    view.setUint8(offset, iv.byteLength); offset += 1;
    uint8.set(iv, offset); offset += iv.byteLength;
    // MetaLen & MetaBytes
    view.setUint32(offset, metaLen, false); offset += 4;
    uint8.set(metadataBytes, offset); offset += metaLen;
    // Ciphertext
    uint8.set(new Uint8Array(ciphertextBuffer), offset);

    return packageBuffer;
  }

  /**
   * Entpackt ein transportables Binärpaket
   */
  unpackagePayload(packageBuffer) {
    const view = new DataView(packageBuffer);
    const uint8 = new Uint8Array(packageBuffer);
    let offset = 0;

    // Check Magic
    const magicStr = String.fromCharCode(uint8[0], uint8[1], uint8[2], uint8[3]);
    if (magicStr !== "CRYP") {
      throw new Error("Ungültiges CrypShare-Dateiformat!");
    }
    offset += 4;

    const version = view.getUint8(offset); offset += 1;
    if (version !== 1) {
      throw new Error(`Nicht unterstützte Dateiversion: ${version}`);
    }

    const saltLen = view.getUint8(offset); offset += 1;
    const salt = uint8.slice(offset, offset + saltLen); offset += saltLen;

    const ivLen = view.getUint8(offset); offset += 1;
    const iv = uint8.slice(offset, offset + ivLen); offset += ivLen;

    const metaLen = view.getUint32(offset, false); offset += 4;
    const metadataBytes = uint8.slice(offset, offset + metaLen); offset += metaLen;

    const ciphertextBuffer = packageBuffer.slice(offset);

    let metadata = {};
    try {
      metadata = JSON.parse(new TextDecoder().decode(metadataBytes));
    } catch (e) {
      metadata = {};
    }

    return {
      salt,
      iv,
      metadataBytes,
      metadata,
      ciphertextBuffer
    };
  }

  // --- Hilfsfunktionen für Encodings ---

  bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hex = "";
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, "0");
    }
    return hex;
  }

  hexToBuffer(hexString) {
    const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, "");
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes.buffer;
  }

  bufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToBuffer(base64) {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  base64UrlEncode(strOrBuffer) {
    let base64 = typeof strOrBuffer === "string" ? btoa(strOrBuffer) : this.bufferToBase64(strOrBuffer);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  base64UrlDecode(base64Url) {
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return this.base64ToBuffer(base64);
  }
}

// Global instanziieren
window.crypShareCrypto = new CrypShareCrypto();
