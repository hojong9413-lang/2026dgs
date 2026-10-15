import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  path: string; // relative to vault root
  allDay: boolean;
  completed?: boolean | null;
  tags?: string[];
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("dgs_access_token");
    if (token?.value !== "authenticated_user") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const vaultRoot = path.resolve(process.cwd(), "vault");
    const scheduleDir = path.resolve(vaultRoot, "01_과업일정");

    if (!fs.existsSync(scheduleDir)) {
      return NextResponse.json({ success: true, events: [] });
    }

    const files = fs.readdirSync(scheduleDir);
    const events: CalendarEvent[] = [];

    for (const fileName of files) {
      if (!fileName.endsWith(".md")) continue;

      const fullPath = path.join(scheduleDir, fileName);
      const stat = fs.statSync(fullPath);
      if (!stat.isFile()) continue;

      const content = fs.readFileSync(fullPath, "utf-8");

      // 기본 날짜 및 타이틀 추출
      let title = fileName.replace(/\.md$/, "");
      let date = "";
      const dateInFilename = fileName.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateInFilename) {
        date = dateInFilename[1];
        title = fileName.slice(dateInFilename[1].length).trim().replace(/\.md$/, "");
      }

      let allDay = true;
      let completed: boolean | null = null;
      let tags: string[] = [];

      // YAML Frontmatter 파싱
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
      if (fmMatch) {
        const rawYaml = fmMatch[1];
        const lines = rawYaml.split(/\r?\n/);
        let inTags = false;

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith("#")) continue;

          if (trimmed.startsWith("tags:")) {
            inTags = true;
            const inlineTags = trimmed.slice(5).trim();
            if (inlineTags.startsWith("[") && inlineTags.endsWith("]")) {
              tags = inlineTags
                .slice(1, -1)
                .split(",")
                .map((s) => s.trim().replace(/^['"]|['"]$/g, ""))
                .filter(Boolean);
              inTags = false;
            }
            continue;
          }

          if (inTags) {
            const tagItem = line.match(/^\s*-\s+(.*)$/);
            if (tagItem) {
              tags.push(tagItem[1].trim());
              continue;
            } else {
              inTags = false;
            }
          }

          const colonIdx = line.indexOf(":");
          if (colonIdx > 0) {
            const key = line.slice(0, colonIdx).trim().toLowerCase();
            const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, "");

            if (key === "title" && val) {
              title = val;
            } else if (key === "date" && val) {
              date = val;
            } else if (key === "allday") {
              allDay = val !== "false";
            } else if (key === "completed") {
              completed = val === "true" ? true : val === "false" ? false : null;
            }
          }
        }
      }

      // 시간 표기 정제 (예: 10_00_13_00 -> 10:00~13:00)
      title = title.replace(/_(\d{2})_(\d{2})_(\d{2})_(\d{2})/g, " ($1:$2~$3:$4)");
      title = title.replace(/_(\d{2})_(\d{2})/g, ":$1");

      if (date) {
        events.push({
          id: `cal-${fileName}`,
          title,
          date,
          path: `01_과업일정/${fileName}`,
          allDay,
          completed,
          tags,
        });
      }
    }

    // 날짜 오름차순, 타이틀 정렬
    events.sort((a, b) => {
      const cmp = a.date.localeCompare(b.date);
      if (cmp !== 0) return cmp;
      return a.title.localeCompare(b.title, "ko", { numeric: true });
    });

    return NextResponse.json({ success: true, events });
  } catch (error) {
    console.error("Calendar events fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch calendar events" }, { status: 500 });
  }
}
