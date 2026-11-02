/**
 * CrypShare - Main Application Controller
 * Features: Multi-Language (DE/EN/UZ), browser-side Web Crypto flow,
 * Decorative link preview, Live Crypto Inspector, Dual Backend Mode (REST API & Local Fallback)
 */

// --- Mehrsprachiges Wörterbuch (Localization) ---
const I18N = {
  de: {
    brandSubtitle: "Verschlüsselte Dateifreigabe (Demo)",
    dsgvoBadge: "Demo – nicht auditiert",
    tabUpload: "Datei hochladen",
    tabReceive: "Empfangen & Entschlüsseln",
    tabInspector: "Krypto-Demo",
    tabArch: "Architektur & Ausbildung",
    
    heroPill: "Browserbasierte AES-256-GCM-Verschlüsselung (Prototyp)",
    heroTitle: "Dateien verschlüsselt teilen. <span>Prototyp.</span>",
    heroDesc: "Dateien werden vor dem Upload im Browser verschlüsselt. Dieses Lernprojekt wurde nicht unabhängig geprüft und ist keine Zusicherung gegen einen kompromittierten Webserver.",
    
    dropTitle: "Datei hier hineinziehen oder klicken",
    dropSub: "PDF, Bilder, Dokumente oder Archive bis zu 50 MB",
    dropBtn: "Datei auswählen",
    
    optTtlLabel: "Gültigkeitsdauer (TTL)",
    optTtl5m: "5 Minuten (Express)",
    optTtl1h: "1 Stunde (Standard)",
    optTtl24h: "24 Stunden (1 Tag)",
    optTtl7d: "7 Tage (Langzeit)",
    
    optMaxDownLabel: "Download-Limit",
    optDown1: "1x Download (Selbstzerstörung / Burn after reading)",
    optDown3: "3x Downloads",
    optDown10: "10x Downloads",
    optDownUnlim: "Unbegrenzt (bis Ablauf)",
    
    optKeyLabel: "Schlüsselverwaltung",
    modeUrlKey: "🔑 Sicherer Link (Schlüssel in URL-Hash)",
    modePass: "🔒 Manuelles Master-Passwort",
    passPlaceholder: "Sicheres Passwort eingeben...",
    genPassBtn: "Zufällig",
    
    btnEncryptSend: "Verschlüsseln und Senden",
    
    uploadSuccessTitle: "Datei erfolgreich verschlüsselt und bereitgestellt!",
    uploadSuccessSub: "Der vollständige Freigabelink enthält das Geheimnis. Teilen Sie ihn nur mit dem gewünschten Empfänger.",
    copyLinkBtn: "Link kopieren",
    copiedToast: "Link in Zwischenablage kopiert!",
    
    receiveTitle: "Verschlüsselte Datei empfangen",
    receiveDesc: "Geben Sie die Datei-ID oder den Freigabelink ein, um die Daten im Browser zu entschlüsseln.",
    fileIdPlaceholder: "Datei-ID (z.B. cs-7f8a9b...)",
    btnFetchDecrypt: "Herunterladen & Entschlüsseln",
    decryptionSuccess: "Datei erfolgreich verifiziert und entschlüsselt!",
    
    inspectorTitle: "Kryptografie-Demo",
    inspectorDesc: "Sehen Sie, wie der Browser Daten mit AES-256-GCM verschlüsselt. Der Server und die Auslieferung des Client-Codes sind nicht unabhängig geprüft.",
    qrPreviewNotice: "Dekorative Vorschau – kein scanbarer QR-Code",
    
    toastError: "Fehler aufgetreten",
    toastSuccess: "Erfolgreich"
  },
  
  en: {
    brandSubtitle: "Encrypted file sharing (demo)",
    dsgvoBadge: "Demo – not audited",
    tabUpload: "Upload File",
    tabReceive: "Receive & Decrypt",
    tabInspector: "Crypto demo",
    tabArch: "Architecture & Presentation",
    
    heroPill: "Browser-based AES-256-GCM encryption (prototype)",
    heroTitle: "Share encrypted files. <span>Prototype.</span>",
    heroDesc: "Files are encrypted in the browser before upload. This learning project has not been independently reviewed and does not protect against a compromised web server.",
    
    dropTitle: "Drag & drop file here or click to browse",
    dropSub: "PDF, images, documents, or archives up to 50 MB",
    dropBtn: "Browse File",
    
    optTtlLabel: "Expiration Timer (TTL)",
    optTtl5m: "5 Minutes (Express)",
    optTtl1h: "1 Hour (Standard)",
    optTtl24h: "24 Hours (1 Day)",
    optTtl7d: "7 Days (Extended)",
    
    optMaxDownLabel: "Download Limit",
    optDown1: "1x Download (Burn After Reading)",
    optDown3: "3x Downloads",
    optDown10: "10x Downloads",
    optDownUnlim: "Unlimited (until expiry)",
    
    optKeyLabel: "Key Management",
    modeUrlKey: "🔑 Secure Link (Key in URL Hash)",
    modePass: "🔒 Custom Master Password",
    passPlaceholder: "Enter secret password...",
    genPassBtn: "Generate",
    
    btnEncryptSend: "Encrypt and Send",
    
    uploadSuccessTitle: "File encrypted & ready to share!",
    uploadSuccessSub: "The complete sharing link contains the secret. Share it only with the intended recipient.",
    copyLinkBtn: "Copy Link",
    copiedToast: "Link copied to clipboard!",
    
    receiveTitle: "Receive Encrypted File",
    receiveDesc: "Enter file ID or open a share link to decrypt the payload directly in your browser.",
    fileIdPlaceholder: "File ID (e.g. cs-7f8a9b...)",
    btnFetchDecrypt: "Download & Decrypt",
    decryptionSuccess: "File successfully verified & decrypted!",
    
    inspectorTitle: "Cryptography demo",
    inspectorDesc: "See how the browser encrypts data with AES-256-GCM. The server and client-code delivery have not been independently reviewed.",
    qrPreviewNotice: "Decorative preview – not a scannable QR code",
    
    toastError: "An error occurred",
    toastSuccess: "Success"
  },
  
  uz: {
    brandSubtitle: "Shifrlangan fayl almashish (demo)",
    dsgvoBadge: "Demo – audit qilinmagan",
    tabUpload: "Fayl Yuklash",
    tabReceive: "Qabul Qilish va Ochish",
    tabInspector: "Kriptografiya demo",
    tabArch: "Arxitektura va Taqdimot",
    
    heroPill: "🛡️ Brauzerda AES-256-GCM bilan shifrlash",
    heroTitle: "Shifrlangan fayl ulashing. <span>Prototip.</span>",
    heroDesc: "Fayllar yuklashdan oldin brauzerda shifrlanadi. Bu o‘quv prototipi mustaqil tekshirilmagan va buzilgan serverdan himoya kafolati emas.",
    
    dropTitle: "Faylni bu yerga tashlang yoki tanlang",
    dropSub: "PDF, rasm, hujjat yoki arxivlar (50 MB gacha)",
    dropBtn: "Fayl tanlash",
    
    optTtlLabel: "Amal qilish muddati (TTL)",
    optTtl5m: "5 daqiqa (Tezkor)",
    optTtl1h: "1 soat (Standart)",
    optTtl24h: "24 soat (1 kun)",
    optTtl7d: "7 kun (Uzoq muddatli)",
    
    optMaxDownLabel: "Yuklab olishlar soni",
    optDown1: "1 marta (O'qilgach yo'q qilish / Burn)",
    optDown3: "3 marta",
    optDown10: "10 marta",
    optDownUnlim: "Cheksiz (muddati tugaguncha)",
    
    optKeyLabel: "Kalit turi",
    modeUrlKey: "🔑 Xavfsiz havola (Kalit URL #hash da)",
    modePass: "🔒 Maxsus parol o'rnatish",
    passPlaceholder: "Maxfiy parol kiriting...",
    genPassBtn: "Generatsiya",
    
    btnEncryptSend: "Shifrlash va Jo'natish",
    
    uploadSuccessTitle: "Fayl muvaffaqiyatli shifrlanib tayyorlandi!",
    uploadSuccessSub: "To‘liq ulashish havolasida maxfiy kalit bor. Uni faqat kerakli qabul qiluvchiga yuboring.",
    copyLinkBtn: "Havolani nusxalash",
    copiedToast: "Havola nusxalandi!",
    
    receiveTitle: "Shifrlangan faylni qabul qilish",
    receiveDesc: "Fayl ID yoki havolasini kiriting va brauzeringizda faylni tiklang.",
    fileIdPlaceholder: "Fayl ID (masalan: cs-7f8a9b...)",
    btnFetchDecrypt: "Yuklab olish va Deshifrlash",
    decryptionSuccess: "Fayl muvaffaqiyatli tekshirildi va tiklandi!",
    
    inspectorTitle: "Kriptografiya demo",
    inspectorDesc: "Brauzer ma’lumotlarni AES-256-GCM bilan qanday shifrlashini ko‘ring. Server va client kodini yetkazish mustaqil tekshirilmagan.",
    qrPreviewNotice: "Bezak uchun ko‘rinish – skanerlanadigan QR-kod emas",
    
    toastError: "Xatolik yuz berdi",
    toastSuccess: "Muvaffaqiyatli"
  }
};

// --- App State ---
class CrypShareApp {
  constructor() {
    this.currentLang = localStorage.getItem("crypshare_lang") || "de";
    this.selectedFile = null;
    this.keyMode = "url"; // "url" or "password"
    this.generatedKeyPass = "";
    this.crypto = window.crypShareCrypto;
    
    // In-memory fallback storage
    this.localStore = new Map();
    
    this.init();
  }

  init() {
    this.bindElements();
    this.bindEvents();
    this.setLanguage(this.currentLang);
    this.checkUrlForDecryption();
    this.initInspector();
    this.initPresentationDeck();
    this.generateNewKey();
  }

  bindElements() {
    // Nav & Tabs
    this.tabBtns = document.querySelectorAll(".nav-tab-btn");
    this.tabSections = document.querySelectorAll(".tab-content-section");
    this.langBtns = document.querySelectorAll(".lang-btn");
    
    // Upload Form
    this.dropzone = document.getElementById("upload-dropzone");
    this.fileInput = document.getElementById("file-input");
    this.filePreview = document.getElementById("file-preview");
    this.fileNameEl = document.getElementById("preview-file-name");
    this.fileMetaEl = document.getElementById("preview-file-meta");
    this.fileRemoveBtn = document.getElementById("file-remove-btn");
    
    // Options
    this.ttlSelect = document.getElementById("opt-ttl");
    this.maxDownloadsSelect = document.getElementById("opt-max-downloads");
    this.keyModeUrlBtn = document.getElementById("mode-url-btn");
    this.keyModePassBtn = document.getElementById("mode-pass-btn");
    this.passInputContainer = document.getElementById("pass-input-container");
    this.passwordInput = document.getElementById("password-input");
    this.genPassBtn = document.getElementById("gen-pass-btn");
    this.encryptSendBtn = document.getElementById("encrypt-send-btn");
    
    // Progress
    this.progressCard = document.getElementById("progress-card");
    this.progressBarFill = document.getElementById("progress-bar-fill");
    this.progressPct = document.getElementById("progress-pct");
    this.progressStatus = document.getElementById("progress-status");
    this.cryptoLogs = document.getElementById("crypto-step-logs");
    
    // Result
    this.resultCard = document.getElementById("result-card");
    this.shareLinkInput = document.getElementById("share-link-input");
    this.copyLinkBtn = document.getElementById("copy-link-btn");
    this.qrCanvas = document.getElementById("qr-canvas");
    this.resultFileId = document.getElementById("result-file-id");
    this.resultTtl = document.getElementById("result-ttl");
    this.resultDownloads = document.getElementById("result-downloads");
    this.resultChecksum = document.getElementById("result-checksum");
    
    // Receive Tab
    this.receiveFileIdInput = document.getElementById("receive-file-id");
    this.receivePassInput = document.getElementById("receive-password");
    this.receiveFetchBtn = document.getElementById("receive-fetch-btn");
    this.receiveInfoCard = document.getElementById("receive-info-card");
    this.receiveDecryptBtn = document.getElementById("receive-decrypt-btn");
    this.receiveProgressCard = document.getElementById("receive-progress-card");
    this.receiveProgressFill = document.getElementById("receive-progress-fill");
    this.receiveProgressStatus = document.getElementById("receive-progress-status");
  }

  bindEvents() {
    // Language switch
    this.langBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        this.setLanguage(lang);
      });
    });

    // Tab switch
    this.tabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetTab = btn.getAttribute("data-tab");
        this.switchTab(targetTab);
      });
    });

    // Drag & Drop
    if (this.dropzone) {
      this.dropzone.addEventListener("click", () => this.fileInput.click());
      this.dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        this.dropzone.classList.add("drag-over");
      });
      this.dropzone.addEventListener("dragleave", () => {
        this.dropzone.classList.remove("drag-over");
      });
      this.dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        this.dropzone.classList.remove("drag-over");
        if (e.dataTransfer.files.length > 0) {
          this.handleFileSelected(e.dataTransfer.files[0]);
        }
      });
    }

    if (this.fileInput) {
      this.fileInput.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          this.handleFileSelected(e.target.files[0]);
        }
      });
    }

    if (this.fileRemoveBtn) {
      this.fileRemoveBtn.addEventListener("click", () => this.clearSelectedFile());
    }

    // Key Modes
    if (this.keyModeUrlBtn && this.keyModePassBtn) {
      this.keyModeUrlBtn.addEventListener("click", () => this.setKeyMode("url"));
      this.keyModePassBtn.addEventListener("click", () => this.setKeyMode("password"));
    }

    if (this.genPassBtn) {
      this.genPassBtn.addEventListener("click", () => this.generateNewKey());
    }

    // Upload & Encrypt
    if (this.encryptSendBtn) {
      this.encryptSendBtn.addEventListener("click", () => this.startEncryptionAndUpload());
    }

    // Copy Link
    if (this.copyLinkBtn) {
      this.copyLinkBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(this.shareLinkInput.value);
        this.showToast(I18N[this.currentLang].copiedToast, "success");
      });
    }

    // Receive Actions
    if (this.receiveFetchBtn) {
      this.receiveFetchBtn.addEventListener("click", () => this.fetchEncryptedPackage());
    }
  }

  setLanguage(lang) {
    if (!I18N[lang]) return;
    this.currentLang = lang;
    localStorage.setItem("crypshare_lang", lang);

    this.langBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });

    const dict = I18N[lang];
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        if (el.tagName === "INPUT") {
          el.placeholder = dict[key];
        } else {
          el.innerHTML = dict[key];
        }
      }
    });
  }

  switchTab(tabId) {
    this.tabBtns.forEach(btn => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });
    this.tabSections.forEach(section => {
      section.style.display = section.id === `tab-${tabId}` ? "block" : "none";
    });
  }

  setKeyMode(mode) {
    this.keyMode = mode;
    this.keyModeUrlBtn.classList.toggle("active", mode === "url");
    this.keyModePassBtn.classList.toggle("active", mode === "password");
    this.passInputContainer.style.display = mode === "password" ? "block" : "none";
  }

  generateNewKey() {
    this.generatedKeyPass = this.crypto.generateRandomPassphrase(28);
    if (this.passwordInput) {
      this.passwordInput.value = this.generatedKeyPass;
    }
  }

  handleFileSelected(file) {
    if (file.size > 50 * 1024 * 1024) {
      this.showToast("Datei ist zu groß (Max 50 MB)!", "error");
      return;
    }
    this.selectedFile = file;
    this.fileNameEl.textContent = file.name;
    this.fileMetaEl.textContent = `${this.formatBytes(file.size)} • ${file.type || "Binärdatei"}`;
    this.filePreview.classList.add("show");
    this.dropzone.style.display = "none";
    this.encryptSendBtn.disabled = false;
  }

  clearSelectedFile() {
    this.selectedFile = null;
    this.fileInput.value = "";
    this.filePreview.classList.remove("show");
    this.dropzone.style.display = "block";
    this.encryptSendBtn.disabled = true;
    this.resultCard.classList.remove("show");
    this.progressCard.classList.remove("show");
  }

  formatBytes(bytes, decimals = 2) {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- Haupt-Verschlüsselungs- & Upload-Prozess ---
  async startEncryptionAndUpload() {
    if (!this.selectedFile) return;

    this.encryptSendBtn.disabled = true;
    this.progressCard.classList.add("show");
    this.resultCard.classList.remove("show");
    this.cryptoLogs.innerHTML = "";

    const addLog = (text, status = "active") => {
      const el = document.createElement("div");
      el.className = `crypto-step-item ${status}`;
      el.innerHTML = `<span>›</span> <span>${text}</span>`;
      this.cryptoLogs.appendChild(el);
      this.cryptoLogs.scrollTop = this.cryptoLogs.scrollHeight;
    };

    const updateProgress = (pct, text) => {
      this.progressBarFill.style.width = `${pct}%`;
      this.progressPct.textContent = `${pct}%`;
      this.progressStatus.textContent = text;
      addLog(text, pct === 100 ? "done" : "active");
    };

    try {
      updateProgress(5, "Datei wird in den Arbeitsspeicher geladen (ArrayBuffer)...");
      const fileBuffer = await this.selectedFile.arrayBuffer();

      const secretKey = this.keyMode === "url" 
        ? this.generatedKeyPass 
        : (this.passwordInput.value || this.crypto.generateRandomPassphrase(20));

      const metadata = {
        name: this.selectedFile.name,
        type: this.selectedFile.type,
        size: this.selectedFile.size,
        lastModified: this.selectedFile.lastModified
      };

      const encryptedPackage = await this.crypto.encryptFileBuffer(
        fileBuffer,
        secretKey,
        metadata,
        (pct, step) => updateProgress(pct, step)
      );

      // Komplettes Binärpaket packen
      const packagedBinary = this.crypto.packagePayload(
        encryptedPackage.salt,
        encryptedPackage.iv,
        encryptedPackage.metadataBytes,
        encryptedPackage.ciphertext
      );

      updateProgress(90, "Verschlüsseltes Binärpaket wird an Server übertragen...");

      const ttlMinutes = parseInt(this.ttlSelect.value, 10);
      const maxDownloads = parseInt(this.maxDownloadsSelect.value, 10);
      const fileId = "cs-" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).substring(4);

      // Server Upload oder Local Fallback
      await this.saveEncryptedFile(fileId, packagedBinary, {
        ttlMinutes,
        maxDownloads,
        checksum: encryptedPackage.originalChecksum,
        size: packagedBinary.byteLength,
        createdAt: Date.now()
      });

      updateProgress(100, "Verschlüsselung & Upload erfolgreich abgeschlossen!");

      // The URL fragment is not sent in ordinary HTTP requests.
      const baseUrl = window.location.origin + window.location.pathname;
      let shareUrl = `${baseUrl}?id=${fileId}`;
      if (this.keyMode === "url") {
        shareUrl += `#key=${encodeURIComponent(secretKey)}`;
      }

      this.showResult(fileId, shareUrl, encryptedPackage, ttlMinutes, maxDownloads);

    } catch (error) {
      console.error("Verschlüsselungsfehler:", error);
      this.showToast("Fehler bei der Verschlüsselung: " + error.message, "error");
      updateProgress(0, "Fehler aufgetreten!");
    } finally {
      this.encryptSendBtn.disabled = false;
    }
  }

  async saveEncryptedFile(fileId, binaryBuffer, meta) {
    try {
      // 1. Versuch: REST API
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/octet-stream",
          "X-File-Id": fileId,
          "X-TTL-Minutes": meta.ttlMinutes.toString(),
          "X-Max-Downloads": meta.maxDownloads.toString(),
          "X-Checksum": meta.checksum
        },
        body: binaryBuffer
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn("Backend REST API nicht verfügbar, wechsle auf lokalen In-Memory Speicher:", e);
    }

    // 2. Fallback: Lokaler Speicher
    this.localStore.set(fileId, {
      buffer: binaryBuffer,
      meta: {
        ...meta,
        downloadsLeft: meta.maxDownloads === 0 ? Infinity : meta.maxDownloads,
        expiresAt: Date.now() + (meta.ttlMinutes * 60 * 1000)
      }
    });
    return { success: true, mode: "local" };
  }

  showResult(fileId, shareUrl, encryptedPackage, ttlMinutes, maxDownloads) {
    this.resultCard.classList.add("show");
    this.shareLinkInput.value = shareUrl;
    this.resultFileId.textContent = fileId;
    this.resultTtl.textContent = `${ttlMinutes} Min`;
    this.resultDownloads.textContent = maxDownloads === 0 ? "Unbegrenzt" : `${maxDownloads}x`;
    this.resultChecksum.textContent = encryptedPackage.originalChecksum.substring(0, 16) + "...";

    // QR-Code rendern
    this.renderQrCode(shareUrl);
  }

  renderQrCode(text) {
    const canvas = this.qrCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 160;
    canvas.height = 160;

    // Einfache QR-Struktur visualisieren (Matrix Visualizer)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 160, 160);
    ctx.fillStyle = "#0f172a";

    // Hash für deterministisches Muster generieren
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    const gridSize = 16;
    const cellSize = 160 / gridSize;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Ecken-Positionsmuster
        if ((r < 4 && c < 4) || (r < 4 && c >= gridSize - 4) || (r >= gridSize - 4 && c < 4)) {
          if (r === 0 || r === 3 || c === 0 || c === 3 || (r >= gridSize - 4 && (r === gridSize - 4 || r === gridSize - 1)) || (c >= gridSize - 4 && (c === gridSize - 4 || c === gridSize - 1))) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        } else {
          // Datenbits aus Hash
          const bit = (hash ^ (r * 31 + c * 17)) & 1;
          if (bit === 1) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      }
    }
  }

  // --- Empfangen & Entschlüsseln ---
  checkUrlForDecryption() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get("id");
    const hash = window.location.hash;

    if (fileId) {
      this.switchTab("receive");
      this.receiveFileIdInput.value = fileId;
      if (hash.startsWith("#key=")) {
        const key = decodeURIComponent(hash.replace("#key=", ""));
        this.receivePassInput.value = key;
      }
      setTimeout(() => this.fetchEncryptedPackage(), 500);
    }
  }

  async fetchEncryptedPackage() {
    const fileId = this.receiveFileIdInput.value.trim();
    if (!fileId) {
      this.showToast("Bitte geben Sie eine Datei-ID ein!", "error");
      return;
    }

    this.receiveProgressCard.style.display = "block";
    this.receiveProgressFill.style.width = "30%";
    this.receiveProgressStatus.textContent = "Verschlüsseltes Paket wird vom Server geladen...";

    let binaryBuffer = null;
    let meta = null;

    try {
      // 1. REST API
      const response = await fetch(`/api/file/${fileId}`);
      if (response.ok) {
        binaryBuffer = await response.arrayBuffer();
      }
    } catch (e) {
      console.warn("Backend nicht erreichbar, prüfe lokalen Fallback...");
    }

    // 2. Fallback
    if (!binaryBuffer && this.localStore.has(fileId)) {
      const entry = this.localStore.get(fileId);
      if (Date.now() > entry.meta.expiresAt) {
        this.localStore.delete(fileId);
        this.showToast("Datei ist abgelaufen und wurde vernichtet! (TTL Shredding)", "error");
        this.receiveProgressCard.style.display = "none";
        return;
      }
      binaryBuffer = entry.buffer;
      entry.meta.downloadsLeft--;
      if (entry.meta.downloadsLeft <= 0) {
        this.localStore.delete(fileId);
      }
    }

    if (!binaryBuffer) {
      this.showToast("Datei nicht gefunden oder bereits abgelaufen / vernichtet!", "error");
      this.receiveProgressCard.style.display = "none";
      return;
    }

    this.receiveProgressFill.style.width = "70%";
    this.receiveProgressStatus.textContent = "Binärpaket wird entpackt...";

    const unpack = this.crypto.unpackagePayload(binaryBuffer);
    this.receiveProgressCard.style.display = "none";
    this.showReceiveFileDetails(unpack, binaryBuffer);
  }

  showReceiveFileDetails(unpack, binaryBuffer) {
    this.receiveInfoCard.style.display = "block";
    document.getElementById("rec-file-name").textContent = unpack.metadata.name || "Unbekannte Datei";
    document.getElementById("rec-file-size").textContent = this.formatBytes(unpack.metadata.size || 0);
    document.getElementById("rec-file-date").textContent = new Date(unpack.metadata.encryptedAt || Date.now()).toLocaleString();

    this.receiveDecryptBtn.onclick = async () => {
      const passwordOrKey = this.receivePassInput.value.trim();
      if (!passwordOrKey) {
        this.showToast("Bitte Entschlüsselungs-Passwort / Key eingeben!", "error");
        return;
      }

      this.receiveProgressCard.style.display = "block";
      this.receiveProgressFill.style.width = "20%";
      this.receiveProgressStatus.textContent = "AES-256-GCM Entschlüsselung wird gestartet...";

      try {
        const decryptedResult = await this.crypto.decryptFileBuffer(
          unpack.ciphertextBuffer,
          unpack.salt,
          unpack.iv,
          unpack.metadataBytes,
          passwordOrKey,
          (pct, step) => {
            this.receiveProgressFill.style.width = `${pct}%`;
            this.receiveProgressStatus.textContent = step;
          }
        );

        this.showToast(I18N[this.currentLang].decryptionSuccess, "success");

        // Automatischen Download anstoßen
        const blob = new Blob([decryptedResult.decryptedBuffer], { type: unpack.metadata.type || "application/octet-stream" });
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = unpack.metadata.name || "decrypted_file";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 10000);

      } catch (err) {
        this.showToast("Entschlüsselung fehlgeschlagen: " + err.message, "error");
      }
    };
  }

  // --- Krypto- & DSGVO-Inspektor ---
  initInspector() {
    const input = document.getElementById("insp-plain-input");
    const passInput = document.getElementById("insp-pass-input");
    const runBtn = document.getElementById("insp-run-btn");

    if (!runBtn) return;

    runBtn.addEventListener("click", async () => {
      const text = input.value || "CrypShare DSGVO Testnachricht";
      const pass = passInput.value || "MasterKey2026";

      const enc = new TextEncoder();
      const plainBuffer = enc.encode(text).buffer;

      document.getElementById("insp-plain-hex").textContent = this.crypto.bufferToHex(plainBuffer);

      const result = await this.crypto.encryptFileBuffer(plainBuffer, pass, { test: true });

      document.getElementById("insp-salt-hex").textContent = result.saltHex;
      document.getElementById("insp-iv-hex").textContent = result.ivHex;
      document.getElementById("insp-key-hex").textContent = result.derivedKeyHex;
      document.getElementById("insp-cipher-hex").textContent = this.crypto.bufferToHex(result.ciphertext);
      document.getElementById("insp-server-view").textContent = JSON.stringify({
        encryptedPayload: "[BINARY CIPHERTEXT]",
        salt: result.saltHex,
        iv: result.ivHex,
        zeroKnowledgeStatus: "SERVER CANNOT READ PLAINTEXT OR SECRET KEY"
      }, null, 2);

      const decResult = await this.crypto.decryptFileBuffer(
        result.ciphertext,
        result.salt,
        result.iv,
        result.metadataBytes,
        pass
      );

      const decText = new TextDecoder().decode(decResult.decryptedBuffer);
      const decTextEl = document.getElementById("insp-decrypted-text");
      if (decTextEl) decTextEl.textContent = decText;

      const checksumEl = document.getElementById("insp-checksum-val");
      if (checksumEl) checksumEl.textContent = decResult.checksum;
    });
  }

  // --- Interaktives Präsentations-Deck & Sprachtrainer ---
  initPresentationDeck() {
    this.currentSlide = 1;
    this.totalSlides = 6;
    const slides = document.querySelectorAll(".pres-slide");
    const counterEl = document.getElementById("pres-slide-counter");
    const prevBtn = document.getElementById("pres-prev-btn");
    const nextBtn = document.getElementById("pres-next-btn");
    const dotsContainer = document.getElementById("pres-dots-container");

    if (!dotsContainer) return;

    // Dots erstellen
    dotsContainer.innerHTML = "";
    for (let i = 1; i <= this.totalSlides; i++) {
      const dot = document.createElement("div");
      dot.className = `pres-dot ${i === 1 ? "active" : ""}`;
      dot.addEventListener("click", () => this.showSlide(i));
      dotsContainer.appendChild(dot);
    }

    const updateSlideView = () => {
      slides.forEach(s => {
        const num = parseInt(s.getAttribute("data-slide"), 10);
        s.classList.toggle("active", num === this.currentSlide);
      });
      if (counterEl) counterEl.textContent = `Folie ${this.currentSlide} / ${this.totalSlides}`;

      const dots = dotsContainer.querySelectorAll(".pres-dot");
      dots.forEach((d, idx) => {
        d.classList.toggle("active", idx + 1 === this.currentSlide);
      });

      if (prevBtn) prevBtn.disabled = this.currentSlide === 1;
      if (nextBtn) {
        nextBtn.textContent = this.currentSlide === this.totalSlides ? "Neustart ↺" : "Nächste ›";
      }
    };

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentSlide > 1) {
          this.currentSlide--;
          updateSlideView();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.currentSlide < this.totalSlides) {
          this.currentSlide++;
        } else {
          this.currentSlide = 1;
        }
        updateSlideView();
      });
    }

    this.showSlide = (num) => {
      this.currentSlide = num;
      updateSlideView();
    };

    // Speech Trainer (Web Speech API)
    document.querySelectorAll(".speech-play-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-speak");
        if ("speechSynthesis" in window && text) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "de-DE";
          utterance.rate = 0.95;
          window.speechSynthesis.speak(utterance);
          btn.style.transform = "scale(0.95)";
          setTimeout(() => btn.style.transform = "scale(1)", 200);
        } else {
          this.showToast("Sprachausgabe im Browser nicht unterstützt!", "info");
        }
      });
    });
  }
}

// Initialisieren nach DOM Load
window.addEventListener("DOMContentLoaded", () => {
  window.crypShareApp = new CrypShareApp();
  if (window.crypShareApp.initPresentationDeck) {
    window.crypShareApp.initPresentationDeck();
  }
});
