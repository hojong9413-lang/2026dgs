import type { NextConfig } from "next";

// Cloudflare R2(vault/.r2-manifest.json)로 분리 서빙되는 미디어 및 대용량 문서 확장자를
// Vercel Serverless Function 번들(Output File Tracing)에서 제외 (Function Storage 용량 99% 절감)
const r2Excludes = [
  "./vault/.obsidian/**",
  "./vault/**/*.mp4",
  "./vault/**/*.mov",
  "./vault/**/*.webm",
  "./vault/**/*.mkv",
  "./vault/**/*.avi",
  "./vault/**/*.m4a",
  "./vault/**/*.mp3",
  "./vault/**/*.wav",
  "./vault/**/*.pdf",
  "./vault/**/*.pptx",
];

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  outputFileTracingExcludes: {
    "*": r2Excludes,
    "/api/fgi/recruitment": [
      ...r2Excludes,
      "./vault/**/*.png",
      "./vault/**/*.jpg",
      "./vault/**/*.jpeg",
      "./vault/**/*.gif",
      "./vault/**/*.webp",
      "./vault/**/*.xlsx",
      "./vault/**/*.docx",
      "./vault/**/*.hwp",
    ],
  },
};

export default nextConfig;


