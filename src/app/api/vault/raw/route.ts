import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
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
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

import { checkIsAuthenticated } from "@/lib/auth";
import { readR2Manifest, getR2PublicUrl } from "@/lib/r2-manifest";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!checkIsAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filePathParam = searchParams.get("path");
    const isDownload = searchParams.get("download") === "true";

    if (!filePathParam) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    const normalizedRelPath = filePathParam.replace(/\\/g, "/");
    const manifest = readR2Manifest();
    const r2Item = manifest.files[normalizedRelPath];

    // R2에 동기화된 대용량/미디어 파일은 Cloudflare R2 퍼블릭 URL로 즉시 리다이렉트 (서버리스 용량 제한 우회 및 고속 스트리밍)
    if (r2Item && r2Item.r2Url) {
      return NextResponse.redirect(r2Item.r2Url, 302);
    }

    const vaultRoot = path.resolve(process.cwd(), "vault");
    const targetPath = path.resolve(vaultRoot, filePathParam);

    // 보안 검증
    if (!targetPath.startsWith(vaultRoot)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    if (!fs.existsSync(targetPath)) {
      const ext = path.extname(normalizedRelPath).toLowerCase();
      if ([".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4a", ".mp3", ".wav"].includes(ext)) {
        return NextResponse.redirect(getR2PublicUrl(normalizedRelPath), 302);
      }
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stats = fs.statSync(targetPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: "Target is not a file" }, { status: 400 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileName = path.basename(targetPath);

    // 한글 파일명 헤더 인코딩
    const encodedFileName = encodeURIComponent(fileName).replace(/['()]/g, escape).replace(/\*/g, "%2A");
    const dispositionType = isDownload ? "attachment" : "inline";

    const fileBuffer = fs.readFileSync(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": stats.size.toString(),
        "Content-Disposition": `${dispositionType}; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Vault raw file error:", error);
    return NextResponse.json({ error: "Failed to load raw file" }, { status: 500 });
  }
}

