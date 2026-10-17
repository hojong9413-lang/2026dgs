import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { checkIsAuthenticated } from "@/lib/auth";
import { readR2Manifest, R2ManifestItem } from "@/lib/r2-manifest";

export interface FileNode {
  name: string;
  path: string; // relative to vault root
  type: "directory" | "file";
  extension?: string;
  size?: number;
  updatedAt?: string;
  r2Url?: string;
  children?: FileNode[];
}

function sortNodes(nodes: FileNode[]): FileNode[] {
  return nodes.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name, "ko", { numeric: true, sensitivity: "base" });
  });
}

function scanVault(
  dirPath: string,
  r2Files: Record<string, R2ManifestItem>,
  relativePath: string = ""
): FileNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const nodes: FileNode[] = [];

  for (const entry of entries) {
    // 제외할 시스템 폴더/파일
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
      const children = scanVault(fullPath, r2Files, relPath);
      nodes.push({
        name: entry.name,
        path: relPath,
        type: "directory",
        children,
      });
    } else if (entry.isFile()) {
      const stats = fs.statSync(fullPath);
      const ext = path.extname(entry.name).toLowerCase();
      const r2Item = r2Files[relPath];
      nodes.push({
        name: entry.name,
        path: relPath,
        type: "file",
        extension: ext,
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
        ...(r2Item ? { r2Url: r2Item.r2Url } : {}),
      });
    }
  }

  return sortNodes(nodes);
}

// Git에는 제외(.gitignore)되어 서버 디스크에는 없지만 R2 매니페스트에 존재하는 대용량 파일(.mp4 등)을 트리에 병합
function mergeR2VirtualFiles(
  tree: FileNode[],
  r2Files: Record<string, R2ManifestItem>
): void {
  for (const item of Object.values(r2Files)) {
    const segments = item.path.split("/").filter(Boolean);
    if (segments.length === 0) continue;

    let currentLevel = tree;
    let currentPath = "";

    for (let i = 0; i < segments.length - 1; i++) {
      const folderName = segments[i];
      currentPath = currentPath ? `${currentPath}/${folderName}` : folderName;

      let dirNode = currentLevel.find(
        (n) => n.type === "directory" && n.name === folderName
      );
      if (!dirNode) {
        dirNode = {
          name: folderName,
          path: currentPath,
          type: "directory",
          children: [],
        };
        currentLevel.push(dirNode);
        sortNodes(currentLevel);
      }
      if (!dirNode.children) {
        dirNode.children = [];
      }
      currentLevel = dirNode.children;
    }

    const fileName = segments[segments.length - 1];
    const existingFile = currentLevel.find(
      (n) => n.type === "file" && n.name === fileName
    );
    if (!existingFile) {
      currentLevel.push({
        name: item.name,
        path: item.path,
        type: "file",
        extension: item.extension,
        size: item.size,
        updatedAt: item.updatedAt,
        r2Url: item.r2Url,
      });
      sortNodes(currentLevel);
    } else if (!existingFile.r2Url) {
      existingFile.r2Url = item.r2Url;
    }
  }
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    if (!checkIsAuthenticated(request)) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }
    const vaultPath = path.join(process.cwd(), "vault");
    if (!fs.existsSync(vaultPath)) {
      return NextResponse.json({ error: "Vault directory not found" }, { status: 404 });
    }

    const manifest = readR2Manifest();
    const tree = scanVault(vaultPath, manifest.files);
    mergeR2VirtualFiles(tree, manifest.files);

    return NextResponse.json({ success: true, tree });
  } catch (error) {
    console.error("Vault tree scan error:", error);
    return NextResponse.json({ error: "Failed to scan vault" }, { status: 500 });
  }
}

