import fs from "fs";
import path from "path";
import crypto from "crypto";
import https from "https";

// .env.local 파서
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv(path.resolve(process.cwd(), ".env.local"));

const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const ENDPOINT = process.env.R2_ENDPOINT;
const BUCKET = process.env.R2_BUCKET_NAME || "2026dgs-media";
const PUBLIC_URL = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "").replace(/\/$/, "");

if (!ACCESS_KEY || !SECRET_KEY || !ENDPOINT || !PUBLIC_URL) {
  console.error("❌ .env.local에 Cloudflare R2 환경변수가 누락되어 있습니다.");
  process.exit(1);
}

const ENDPOINT_HOST = new URL(ENDPOINT).hostname;
const VAULT_ROOT = path.resolve(process.cwd(), "vault");
const MANIFEST_PATH = path.join(VAULT_ROOT, ".r2-manifest.json");

// R2 업로드 대상 기준:
// 1) 모든 오디오/비디오 파일 (.mp4, .mov, .webm, .mkv, .avi, .m4a, .mp3, .wav)
// 2) 또는 4MB 이상인 대용량 파일 (Vercel Serverless 4.5MB 페이로드 제한 우회 및 고속 전송)
const MEDIA_EXTENSIONS = new Set([
  ".mp4",
  ".mov",
  ".webm",
  ".mkv",
  ".avi",
  ".m4a",
  ".mp3",
  ".wav",
]);
const LARGE_FILE_THRESHOLD = 4 * 1024 * 1024; // 4MB

const MIME_TYPES = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".m4a": "audio/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".xls": "application/vnd.ms-excel",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".ppt": "application/vnd.ms-powerpoint",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".hwp": "application/x-hwp",
  ".zip": "application/zip",
};

function hmac(key, data) {
  return crypto.createHmac("sha256", key).update(data).digest();
}

function sha256Hex(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function encodeS3Key(key) {
  return key
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase())
    )
    .join("/");
}

function s3Request({ method, objectKey, query = "", headers = {}, body = Buffer.alloc(0) }) {
  return new Promise((resolve, reject) => {
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.slice(0, 8);
    const region = "auto";
    const service = "s3";

    const payloadHash = sha256Hex(body);
    const encodedKey = encodeS3Key(objectKey);
    const canonicalUri = `/${BUCKET}/${encodedKey}`;

    const allHeaders = {
      host: ENDPOINT_HOST,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      ...headers,
    };

    const sortedHeaderKeys = Object.keys(allHeaders)
      .map((k) => k.toLowerCase())
      .sort();

    const canonicalHeaders = sortedHeaderKeys
      .map((k) => `${k}:${String(allHeaders[k]).trim()}\n`)
      .join("");
    const signedHeaders = sortedHeaderKeys.join(";");

    const canonicalRequest = [
      method,
      canonicalUri,
      query,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(Buffer.from(canonicalRequest, "utf-8")),
    ].join("\n");

    const kSigning = hmac(
      hmac(hmac(hmac("AWS4" + SECRET_KEY, dateStamp), region), service),
      "aws4_request"
    );
    const signature = crypto.createHmac("sha256", kSigning).update(stringToSign).digest("hex");

    const authorization = `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const reqPath = query ? `${canonicalUri}?${query}` : canonicalUri;
    const req = https.request(
      {
        hostname: ENDPOINT_HOST,
        path: reqPath,
        method,
        headers: {
          ...allHeaders,
          Authorization: authorization,
          "Content-Length": body.length,
        },
      },
      (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => {
          const responseText = Buffer.concat(chunks).toString("utf-8");
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({ statusCode: res.statusCode, headers: res.headers, body: responseText });
          } else {
            reject(
              new Error(`S3 ${method} failed (${res.statusCode}): ${responseText}`)
            );
          }
        });
      }
    );

    req.on("error", reject);
    if (body.length > 0) {
      req.write(body);
    }
    req.end();
  });
}

// 단일 PUT 또는 대용량(80MB 초과) 멀티파트 업로드
async function uploadFileToR2(fullPath, relPath, contentType, fileSize) {
  const MULTIPART_THRESHOLD = 80 * 1024 * 1024; // 80MB
  const PART_SIZE = 20 * 1024 * 1024; // 20MB per part

  if (fileSize <= MULTIPART_THRESHOLD) {
    const buffer = fs.readFileSync(fullPath);
    await s3Request({
      method: "PUT",
      objectKey: relPath,
      headers: {
        "content-type": contentType,
      },
      body: buffer,
    });
    return;
  }

  // 1. Initiate Multipart Upload
  const initRes = await s3Request({
    method: "POST",
    objectKey: relPath,
    query: "uploads=",
    headers: {
      "content-type": contentType,
    },
  });

  const uploadIdMatch = initRes.body.match(/<UploadId>([^<]+)<\/UploadId>/);
  if (!uploadIdMatch) {
    throw new Error("Failed to get UploadId from R2 multipart initiation");
  }
  const uploadId = uploadIdMatch[1];

  const fd = fs.openSync(fullPath, "r");
  const etags = [];
  let partNumber = 1;
  let offset = 0;

  try {
    while (offset < fileSize) {
      const chunkSize = Math.min(PART_SIZE, fileSize - offset);
      const chunkBuffer = Buffer.alloc(chunkSize);
      fs.readSync(fd, chunkBuffer, 0, chunkSize, offset);

      const query = `partNumber=${partNumber}&uploadId=${encodeURIComponent(uploadId)}`;
      const partRes = await s3Request({
        method: "PUT",
        objectKey: relPath,
        query,
        body: chunkBuffer,
      });

      const etag = partRes.headers.etag;
      etags.push({ partNumber, etag });
      process.stdout.write(
        `   ↳ 파트 ${partNumber} 업로드 완료 (${((offset + chunkSize) / 1024 / 1024).toFixed(1)} / ${(fileSize / 1024 / 1024).toFixed(1)} MB)\r`
      );

      offset += chunkSize;
      partNumber++;
    }
    process.stdout.write("\n");

    // 2. Complete Multipart Upload
    const xmlParts = etags
      .map((p) => `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>${p.etag}</ETag></Part>`)
      .join("");
    const completeXml = `<CompleteMultipartUpload>${xmlParts}</CompleteMultipartUpload>`;

    await s3Request({
      method: "POST",
      objectKey: relPath,
      query: `uploadId=${encodeURIComponent(uploadId)}`,
      headers: {
        "content-type": "application/xml",
      },
      body: Buffer.from(completeXml, "utf-8"),
    });
  } catch (err) {
    await s3Request({
      method: "DELETE",
      objectKey: relPath,
      query: `uploadId=${encodeURIComponent(uploadId)}`,
    }).catch(() => {});
    throw err;
  } finally {
    fs.closeSync(fd);
  }
}

function scanTargetFiles(dirPath, relativePath = "", results = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (
      entry.name === ".obsidian" ||
      entry.name === ".git" ||
      entry.name === ".DS_Store" ||
      entry.name === ".r2-manifest.json" ||
      entry.name.startsWith("~$")
    ) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      scanTargetFiles(fullPath, relPath, results);
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      const ext = path.extname(entry.name).toLowerCase();

      if (MEDIA_EXTENSIONS.has(ext) || stats.size >= LARGE_FILE_THRESHOLD) {
        results.push({
          name: entry.name,
          path: relPath,
          fullPath,
          extension: ext,
          size: stats.size,
          updatedAt: stats.mtime.toISOString(),
        });
      }
    }
  }
  return results;
}

async function main() {
  console.log("🚀 Cloudflare R2 대용량 미디어 및 문서 동기화 시작...");
  console.log(`📦 대상 버킷: ${BUCKET} (${PUBLIC_URL})`);

  let existingManifest = { files: {} };
  if (fs.existsSync(MANIFEST_PATH)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"));
    } catch {
      existingManifest = { files: {} };
    }
  }

  const targetFiles = scanTargetFiles(VAULT_ROOT);
  console.log(`🔍 발견된 R2 연동 대상 파일(미디어 및 4MB 이상 파일): 총 ${targetFiles.length}건\n`);

  const updatedFilesMap = { ...(existingManifest.files || {}) };
  let uploadedCount = 0;
  let skippedCount = 0;

  for (const file of targetFiles) {
    const prev = updatedFilesMap[file.path];
    const r2Url = `${PUBLIC_URL}/${encodeS3Key(file.path)}`;

    // 이미 동일한 파일 크기로 업로드된 경우 건너뜀
    if (prev && prev.size === file.size && prev.r2Url === r2Url) {
      skippedCount++;
      continue;
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    console.log(`⬆️ 업로드 중: ${file.path} (${sizeMB} MB)...`);

    const contentType = MIME_TYPES[file.extension] || "application/octet-stream";
    await uploadFileToR2(file.fullPath, file.path, contentType, file.size);

    updatedFilesMap[file.path] = {
      name: file.name,
      path: file.path,
      extension: file.extension,
      size: file.size,
      updatedAt: file.updatedAt,
      r2Url,
    };
    uploadedCount++;
  }

  const newManifest = {
    updatedAt: new Date().toISOString(),
    publicUrl: PUBLIC_URL,
    files: updatedFilesMap,
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(newManifest, null, 2), "utf-8");

  console.log("\n✅ Cloudflare R2 동기화 완료!");
  console.log(`   - 신규/변경 업로드: ${uploadedCount}건`);
  console.log(`   - 기존 유지(건너뜀): ${skippedCount}건`);
  console.log(`   - 총 R2 관리 파일: ${Object.keys(updatedFilesMap).length}건`);
  console.log(`   - 매니페스트 저장: vault/.r2-manifest.json`);
}

main().catch((err) => {
  console.error("❌ R2 동기화 오류:", err);
  process.exit(1);
});
