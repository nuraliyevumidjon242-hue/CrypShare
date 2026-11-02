<#
    CrypShare - Native Windows REST API & Static File Server
    Technology: .NET System.Net.HttpListener (Zero Dependencies)
    Endpoints:
      GET  /                 -> Serves index.html, style.css, crypto.js, app.js
      POST /api/upload       -> Stores encrypted payload + metadata
      GET  /api/file/{id}    -> Returns binary ciphertext & checks TTL / download limit
      GET  /api/health       -> System status
#>

param(
    [int]$Port = 8080
)

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if ([string]::IsNullOrWhiteSpace($rootDir)) {
    $rootDir = Get-Location
}

$storageDir = Join-Path $rootDir "storage"
if (!(Test-Path $storageDir)) {
    New-Item -ItemType Directory -Path $storageDir -Force | Out-Null
}

$metaFile = Join-Path $storageDir "metadata.json"
$globalMeta = @{}
if (Test-Path $metaFile) {
    try {
        $json = Get-Content $metaFile -Raw -Encoding UTF8
        $globalMeta = $json | ConvertFrom-Json -AsHashtable
    } catch {
        $globalMeta = @{}
    }
}

function Save-Metadata {
    $json = $globalMeta | ConvertTo-Json -Depth 5
    [System.IO.File]::WriteAllText($metaFile, $json, [System.Text.Encoding]::UTF8)
}

function Purge-ExpiredFiles {
    $now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    $keysToRemove = @()
    foreach ($id in $globalMeta.Keys) {
        $item = $globalMeta[$id]
        $expiresAt = $item["expiresAt"]
        $downloadsLeft = $item["downloadsLeft"]
        
        if ($expiresAt -gt 0 -and $now -ge $expiresAt) {
            $keysToRemove += $id
        } elseif ($downloadsLeft -le 0) {
            $keysToRemove += $id
        }
    }

    foreach ($id in $keysToRemove) {
        $filePath = Join-Path $storageDir "$id.bin"
        if (Test-Path $filePath) {
            # Secure Shredding: overwrite before delete
            try {
                $len = (Get-Item $filePath).Length
                $zeroes = New-Object byte[] $len
                [System.IO.File]::WriteAllBytes($filePath, $zeroes)
                Remove-Item -Path $filePath -Force
            } catch {}
        }
        $globalMeta.Remove($id)
        Write-Host "[SHREDDED] Expired file purged: $id" -ForegroundColor Yellow
    }
    if ($keysToRemove.Count -gt 0) {
        Save-Metadata
    }
}

# Start HttpListener
$listener = New-Object System.Net.HttpListener
$prefix = "http://localhost:$Port/"
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
} catch {
    Write-Host "Konnte Port $Port nicht binden: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "   CrypShare - Prototype Server gestartet                 " -ForegroundColor Green
Write-Host "   URL: $prefix                                         " -ForegroundColor Cyan
Write-Host "   Speicherpfad: $storageDir                             " -ForegroundColor DarkCyan
Write-Host "   Drücken Sie STRG+C zum Beenden                        " -ForegroundColor Gray
Write-Host "=========================================================" -ForegroundColor Cyan

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".svg"  = "image/svg+xml"
    ".png"  = "image/png"
    ".ico"  = "image/x-icon"
}

$staticFiles = @{
    "/" = "index.html"
    "/index.html" = "index.html"
    "/style.css" = "style.css"
    "/crypto.js" = "crypto.js"
    "/app.js" = "app.js"
}

$lastPurge = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $now = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        if ($now - $lastPurge -gt 5000) {
            Purge-ExpiredFiles
            $lastPurge = $now
        }

        # CORS Headers
        $response.AddHeader("Access-Control-Allow-Origin", "*")
        $response.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        $response.AddHeader("Access-Control-Allow-Headers", "*")

        if ($request.HttpMethod -eq "OPTIONS") {
            $response.StatusCode = 200
            $response.Close()
            continue
        }

        $rawUrl = $request.RawUrl
        $path = $rawUrl.Split('?')[0]

        # REST API: Upload
        if ($request.HttpMethod -eq "POST" -and $path -eq "/api/upload") {
            $fileId = $request.Headers["X-File-Id"]
            if ([string]::IsNullOrWhiteSpace($fileId)) {
                $fileId = "cs-" + [System.Guid]::NewGuid().ToString("N").Substring(0, 12)
            }

            $ttlMin = 60
            if (![string]::IsNullOrWhiteSpace($request.Headers["X-TTL-Minutes"])) {
                [int]::TryParse($request.Headers["X-TTL-Minutes"], [ref]$ttlMin) | Out-Null
            }

            $maxDown = 1
            if (![string]::IsNullOrWhiteSpace($request.Headers["X-Max-Downloads"])) {
                [int]::TryParse($request.Headers["X-Max-Downloads"], [ref]$maxDown) | Out-Null
            }

            $checksum = $request.Headers["X-Checksum"]
            if ([string]::IsNullOrWhiteSpace($checksum)) { $checksum = "unknown" }

            $filePath = Join-Path $storageDir "$fileId.bin"
            $fileStream = [System.IO.File]::Create($filePath)
            $request.InputStream.CopyTo($fileStream)
            $fileStream.Close()

            $expiresAt = if ($ttlMin -gt 0) { $now + ($ttlMin * 60 * 1000) } else { 0 }
            $downloadsLeft = if ($maxDown -gt 0) { $maxDown } else { 999999 }

            $globalMeta[$fileId] = @{
                "fileId" = $fileId
                "checksum" = $checksum
                "size" = (Get-Item $filePath).Length
                "createdAt" = $now
                "expiresAt" = $expiresAt
                "ttlMinutes" = $ttlMin
                "maxDownloads" = $maxDown
                "downloadsLeft" = $downloadsLeft
            }
            Save-Metadata

            $resJson = @{
                "success" = $true
                "fileId" = $fileId
                "message" = "Encrypted binary payload safely stored in zero-knowledge vault."
            } | ConvertTo-Json

            $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            $response.ContentType = "application/json; charset=utf-8"
            $response.StatusCode = 200
            $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            $response.Close()
            Write-Host "[UPLOAD] Stored encrypted file: $fileId (TTL: $ttlMin m, MaxDown: $maxDown)" -ForegroundColor Green
            continue
        }

        # REST API: Download / Get File
        if ($request.HttpMethod -eq "GET" -and $path -match "^/api/file/(.+)$") {
            $fileId = $matches[1]
            if ($globalMeta.ContainsKey($fileId)) {
                $item = $globalMeta[$fileId]
                $expiresAt = $item["expiresAt"]
                $downloadsLeft = $item["downloadsLeft"]

                if (($expiresAt -gt 0 -and $now -gt $expiresAt) -or ($downloadsLeft -le 0)) {
                    Purge-ExpiredFiles
                    $response.StatusCode = 404
                    $response.Close()
                    continue
                }

                $filePath = Join-Path $storageDir "$fileId.bin"
                if (Test-Path $filePath) {
                    $bytes = [System.IO.File]::ReadAllBytes($filePath)
                    
                    # Decrement downloads
                    $item["downloadsLeft"] = [int]$item["downloadsLeft"] - 1
                    Save-Metadata

                    if ($item["downloadsLeft"] -le 0) {
                        # Immediate shredding after last download
                        Purge-ExpiredFiles
                    }

                    $response.ContentType = "application/octet-stream"
                    $response.StatusCode = 200
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                    $response.Close()
                    Write-Host "[DOWNLOAD] Sent encrypted file: $fileId (Left: $($item['downloadsLeft']))" -ForegroundColor Cyan
                    continue
                }
            }

            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes('{"error":"File not found or expired"}')
            $response.ContentType = "application/json"
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
            $response.Close()
            continue
        }

        # REST API: Health Check
        if ($request.HttpMethod -eq "GET" -and $path -eq "/api/health") {
            $resJson = @{
                "status" = "healthy"
                "engine" = "CrypShare PowerShell Prototype"
                "activeVaultFiles" = $globalMeta.Keys.Count
            } | ConvertTo-Json
            $resBytes = [System.Text.Encoding]::UTF8.GetBytes($resJson)
            $response.ContentType = "application/json"
            $response.StatusCode = 200
            $response.OutputStream.Write($resBytes, 0, $resBytes.Length)
            $response.Close()
            continue
        }

        # Serve only the frontend assets; never expose storage or project files.
        if (!$staticFiles.ContainsKey($path)) {
            $response.StatusCode = 404
            $response.Close()
            continue
        }
        $localFilePath = Join-Path $rootDir $staticFiles[$path]

        if (Test-Path $localFilePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localFilePath).ToLower()
            $contentType = if ($mimeMap.ContainsKey($ext)) { $mimeMap[$ext] } else { "application/octet-stream" }

            $bytes = [System.IO.File]::ReadAllBytes($localFilePath)
            $response.ContentType = $contentType
            $response.StatusCode = 200
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            $response.Close()
        } else {
            $response.StatusCode = 404
            $response.Close()
        }
    } catch {
        Write-Host "Request Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
