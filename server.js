/**
 * CrypShare - Node.js REST API & Static Server
 * Zero-dependency Node.js HTTP implementation
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const BASE_DIR = __dirname;
const STORAGE_DIR = path.join(BASE_DIR, 'storage');
const META_FILE = path.join(STORAGE_DIR, 'metadata.json');
const FILE_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const MAX_UPLOAD_SIZE = 50 * 1024 * 1024; // 50MB limit
const STATIC_FILES = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/style.css', 'style.css'],
  ['/crypto.js', 'crypto.js'],
  ['/app.js', 'app.js']
]);

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function loadMetadata() {
  try {
    if (fs.existsSync(META_FILE)) {
      return JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveMetadata(meta) {
  try {
    fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2), 'utf8');
  } catch (e) {}
}

function shredFile(filePath) {
  try {
    const resolved = path.resolve(filePath);
    const rel = path.relative(STORAGE_DIR, resolved);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      console.error(`[SECURITY ALERT] Prevented shredding outside STORAGE_DIR: ${resolved}`);
      return;
    }
    if (fs.existsSync(resolved)) {
      const stat = fs.statSync(resolved);
      fs.writeFileSync(resolved, Buffer.alloc(stat.size, 0));
      fs.unlinkSync(resolved);
    }
  } catch (e) {}
}

// Background cleanup
setInterval(() => {
  const meta = loadMetadata();
  const now = Date.now();
  let modified = false;

  for (const [fileId, item] of Object.entries(meta)) {
    if ((item.expiresAt > 0 && now >= item.expiresAt) || item.downloadsLeft <= 0) {
      const filePath = path.join(STORAGE_DIR, `${fileId}.bin`);
      shredFile(filePath);
      delete meta[fileId];
      modified = true;
      console.log(`[SHREDDED] Expired file purged: ${fileId}`);
    }
  }
  if (modified) saveMetadata(meta);
}, 5000);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;");
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // REST API: Upload
  if (req.method === 'POST' && pathname === '/api/upload') {
    const fileId = req.headers['x-file-id'] || `cs-${Math.random().toString(36).substring(2, 10)}`;
    if (!FILE_ID_REGEX.test(fileId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid file ID format' }));
    }

    const ttlMin = parseInt(req.headers['x-ttl-minutes'] || '60', 10);
    const maxDown = parseInt(req.headers['x-max-downloads'] || '1', 10);
    const checksum = req.headers['x-checksum'] || 'unknown';

    let totalSize = 0;
    const chunks = [];
    req.on('data', chunk => {
      totalSize += chunk.length;
      if (totalSize > MAX_UPLOAD_SIZE) {
        req.destroy();
        res.writeHead(413, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Payload Too Large. Max allowed size is 50MB.' }));
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (res.writableEnded) return;
      const buffer = Buffer.concat(chunks);
      const filePath = path.resolve(path.join(STORAGE_DIR, `${fileId}.bin`));
      const rel = path.relative(STORAGE_DIR, filePath);
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Access Denied: Path Traversal Attempt' }));
      }

      fs.writeFileSync(filePath, buffer);

      const now = Date.now();
      const meta = loadMetadata();
      meta[fileId] = {
        fileId,
        checksum,
        size: buffer.length,
        createdAt: now,
        expiresAt: ttlMin > 0 ? now + (ttlMin * 60 * 1000) : 0,
        ttlMinutes: ttlMin,
        maxDownloads: maxDown,
        downloadsLeft: maxDown > 0 ? maxDown : 999999
      };
      saveMetadata(meta);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, fileId, message: 'Stored in zero-knowledge vault.' }));
      console.log(`[UPLOAD] Stored: ${fileId} (${buffer.length} bytes)`);
    });
    return;
  }

  // REST API: Download
  if (req.method === 'GET' && pathname.startsWith('/api/file/')) {
    const fileId = pathname.replace('/api/file/', '').trim();
    if (!FILE_ID_REGEX.test(fileId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid file ID format' }));
    }

    const meta = loadMetadata();

    if (meta[fileId]) {
      const item = meta[fileId];
      const now = Date.now();
      if ((item.expiresAt > 0 && now > item.expiresAt) || item.downloadsLeft <= 0) {
        delete meta[fileId];
        saveMetadata(meta);
        shredFile(path.join(STORAGE_DIR, `${fileId}.bin`));
      } else {
        const filePath = path.resolve(path.join(STORAGE_DIR, `${fileId}.bin`));
        const rel = path.relative(STORAGE_DIR, filePath);
        if (rel.startsWith('..') || path.isAbsolute(rel)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Access Denied: Path Traversal Attempt' }));
        }

        if (fs.existsSync(filePath)) {
          const data = fs.readFileSync(filePath);
          item.downloadsLeft -= 1;
          if (item.downloadsLeft <= 0) {
            delete meta[fileId];
            saveMetadata(meta);
            shredFile(filePath);
          } else {
            saveMetadata(meta);
          }

          res.writeHead(200, { 
            'Content-Type': 'application/octet-stream',
            'Content-Length': data.length 
          });
          return res.end(data);
        }
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: 'File not found or expired' }));
  }

  // REST API: Health Check
  if (req.method === 'GET' && pathname === '/api/health') {
    const meta = loadMetadata();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'healthy',
      engine: 'CrypShare Node.js Engine',
      dsgvoCompliant: null,
      securityLevel: 'not-audited',
      activeVaultFiles: Object.keys(meta).length
    }));
  }

  // Serve only the frontend assets; never expose storage or project files.
  const staticFile = STATIC_FILES.get(pathname);
  if (!staticFile) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('404 Not Found');
  }
  const fullPath = path.join(BASE_DIR, staticFile);

  if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    return fs.createReadStream(fullPath).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('404 Not Found');
});

server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  CrypShare Secure Node.js Server running at http://localhost:${PORT}`);
  console.log(`=================================================`);
});
