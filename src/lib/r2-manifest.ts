import fs from "fs";
import path from "path";

export interface R2ManifestItem {
  name: string;
  path: string;
  extension: string;
  size: number;
  updatedAt: string;
  r2Url: string;
}

export interface R2Manifest {
  updatedAt?: string;
  publicUrl?: string;
  files: Record<string, R2ManifestItem>;
}

const DEFAULT_R2_PUBLIC_URL =
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  "https://pub-a68ee219ff734434855a3a368f617eb2.r2.dev";

export function encodeR2Key(key: string): string {
  return key
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment).replace(
        /[!'()*]/g,
        (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
      )
    )
    .join("/");
}

export function getR2PublicUrl(relPath: string): string {
  const baseUrl = DEFAULT_R2_PUBLIC_URL.replace(/\/$/, "");
  return `${baseUrl}/${encodeR2Key(relPath)}`;
}

export function readR2Manifest(): R2Manifest {
  try {
    const manifestPath = path.resolve(process.cwd(), "vault", ".r2-manifest.json");
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        updatedAt: parsed.updatedAt,
        publicUrl: parsed.publicUrl || DEFAULT_R2_PUBLIC_URL,
        files: parsed.files || {},
      };
    }
  } catch (err) {
    console.error("Failed to read .r2-manifest.json:", err);
  }
  return { publicUrl: DEFAULT_R2_PUBLIC_URL, files: {} };
}
