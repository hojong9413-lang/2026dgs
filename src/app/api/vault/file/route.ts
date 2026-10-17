import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { checkIsAuthenticated } from "@/lib/auth";
import { readR2Manifest } from "@/lib/r2-manifest";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!checkIsAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const filePathParam = searchParams.get("path");

    if (!filePathParam) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 });
    }

    const normalizedRelPath = filePathParam.replace(/\\/g, "/");
    const manifest = readR2Manifest();
    const r2Item = manifest.files[normalizedRelPath];

    const vaultRoot = path.resolve(process.cwd(), "vault");
    const targetPath = path.resolve(vaultRoot, filePathParam);

    // 보안 검증: vault 외부 경로 탈출 차단
    if (!targetPath.startsWith(vaultRoot)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 로컬(또는 서버 디스크)에 파일이 없지만 R2 매니페스트에 존재하는 대용량 미디어(.mp4 등)인 경우
    if (!fs.existsSync(targetPath)) {
      if (r2Item) {
        return NextResponse.json({
          success: true,
          file: {
            name: r2Item.name,
            path: r2Item.path,
            extension: r2Item.extension,
            size: r2Item.size,
            updatedAt: r2Item.updatedAt,
            isText: false,
            content: null,
            r2Url: r2Item.r2Url,
          },
        });
      }
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const stats = fs.statSync(targetPath);
    if (!stats.isFile()) {
      return NextResponse.json({ error: "Target is not a file" }, { status: 400 });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const isText = [".md", ".txt", ".json", ".csv"].includes(ext);

    let content: string | null = null;
    if (isText) {
      content = fs.readFileSync(targetPath, "utf-8");
    }

    return NextResponse.json({
      success: true,
      file: {
        name: path.basename(targetPath),
        path: normalizedRelPath,
        extension: ext,
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
        isText,
        content,
        ...(r2Item ? { r2Url: r2Item.r2Url } : {}),
      },
    });
  } catch (error) {
    console.error("Vault file read error:", error);
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}

