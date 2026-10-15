import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface FileNode {
  name: string;
  path: string; // relative to vault root
  type: "directory" | "file";
  extension?: string;
  size?: number;
  updatedAt?: string;
  children?: FileNode[];
}

function scanVault(dirPath: string, relativePath: string = ""): FileNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    // 제외할 시스템 폴더/파일
    if (
      entry.name === ".obsidian" ||
      entry.name === ".git" ||
      entry.name === ".DS_Store" ||
      entry.name.startsWith("~$")
    ) {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const children = scanVault(fullPath, relPath);
      nodes.push({
        name: entry.name,
        path: relPath,
        type: "directory",
        children,
      });
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      const ext = path.extname(entry.name).toLowerCase();
      nodes.push({
        name: entry.name,
        path: relPath,
        type: "file",
        extension: ext,
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
      });
    }
  }

  // 폴더 우선, 그 다음 파일 / 숫자 및 한글 자연스러운 정렬
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name, "ko", { numeric: true, sensitivity: "base" });
  });
}

export async function GET() {
  try {
    const vaultPath = path.join(process.cwd(), "vault");
    if (!fs.existsSync(vaultPath)) {
      return NextResponse.json({ error: "Vault directory not found" }, { status: 404 });
    }

    const tree = scanVault(vaultPath);
    return NextResponse.json({ success: true, tree });
  } catch (error) {
    console.error("Vault tree scan error:", error);
    return NextResponse.json({ error: "Failed to scan vault" }, { status: 500 });
  }
}
