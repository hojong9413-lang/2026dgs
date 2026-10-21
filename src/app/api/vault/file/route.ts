import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { checkIsAuthenticated } from "@/lib/auth";
import { readR2Manifest } from "@/lib/r2-manifest";
import {
  FGI_SUMMARY_NOTE_FILENAME,
  buildFgiSummaryMarkdown,
  writeFgiSummaryMarkdownToVault,
} from "@/lib/fgi-obsidian-sync";
import { getSavedScriptUrl } from "@/app/api/fgi/recruitment/route";

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

    // FGI 실시간 요약 노트 조회 시(폴더 이동 여부 무관) 최신 설문 데이터로 즉시 갱신
    if (path.basename(targetPath) === FGI_SUMMARY_NOTE_FILENAME) {
      try {
        const scriptUrl = getSavedScriptUrl();
        if (scriptUrl) {
          const res = await fetch(scriptUrl, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
            redirect: "follow",
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data?.records)) {
              writeFgiSummaryMarkdownToVault(data.records, data.updatedAt);
              const freshContent = buildFgiSummaryMarkdown(
                data.records,
                data.updatedAt
              );
              return NextResponse.json({
                success: true,
                file: {
                  name: path.basename(targetPath),
                  path: normalizedRelPath,
                  extension: ".md",
                  size: Buffer.byteLength(freshContent, "utf-8"),
                  updatedAt: data.updatedAt || new Date().toISOString(),
                  isText: true,
                  content: freshContent,
                },
              });
            }
          }
        }
      } catch (e) {
        console.warn("Failed to live-refresh FGI summary markdown:", e);
      }
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
    const isText = [".md", ".txt", ".json", ".csv", ".gs"].includes(ext);

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

