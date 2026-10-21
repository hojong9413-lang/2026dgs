import fs from "fs";
import path from "path";

export interface FgiSyncRecord {
  id: number;
  timestamp: string;
  channel: string;
  birthYear: number | null;
  age: number | null;
  ageGroup: string;
  gender: string;
  region: string;
  attend: string;
  sessions: string;
  targetGroup: string;
  isEligible: boolean;
  excludeReasons: string[];
}

export const FGI_SUMMARY_NOTE_FILENAME =
  "20261022 FGI 사용자 참가자 지원 현황.md";

export const FGI_SUMMARY_NOTE_REL_PATH =
  `02_주요진행상황/${FGI_SUMMARY_NOTE_FILENAME}`;

function findExistingSummaryNotePath(vaultRoot: string): string | null {
  function walk(dir: string): string | null {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return null;
    }
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = walk(fullPath);
        if (found) return found;
      } else if (entry.isFile() && entry.name === FGI_SUMMARY_NOTE_FILENAME) {
        return fullPath;
      }
    }
    return null;
  }
  return walk(vaultRoot);
}

function toKstDateParts(isoOrStr?: string): {
  year: string;
  month: string;
  day: string;
  hours: string;
  minutes: string;
  dateKey: string;
  fullDate: string;
} | null {
  if (!isoOrStr) return null;
  const d = new Date(isoOrStr);
  if (isNaN(d.getTime())) {
    const match = isoOrStr.match(/(\d{4})[.-]\s*(\d{1,2})[.-]\s*(\d{1,2})/);
    if (match) {
      const y = match[1];
      const m = match[2].padStart(2, "0");
      const day = match[3].padStart(2, "0");
      return {
        year: y,
        month: m,
        day,
        hours: "00",
        minutes: "00",
        dateKey: `${m}.${day}`,
        fullDate: `${y}-${m}-${day}`,
      };
    }
    return null;
  }

  // KST (UTC+9) 변환
  const kstTime = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  const year = String(kstTime.getUTCFullYear());
  const month = String(kstTime.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kstTime.getUTCDate()).padStart(2, "0");
  const hours = String(kstTime.getUTCHours()).padStart(2, "0");
  const minutes = String(kstTime.getUTCMinutes()).padStart(2, "0");

  return {
    year,
    month,
    day,
    hours,
    minutes,
    dateKey: `${month}.${day}`,
    fullDate: `${year}-${month}-${day}`,
  };
}

function countDistribution(
  records: FgiSyncRecord[],
  getter: (r: FgiSyncRecord) => string,
  fixedOrder?: string[]
) {
  const counts: Record<string, number> = {};
  let validTotal = 0;

  for (const r of records) {
    const val = (getter(r) || "").trim() || "미응답";
    counts[val] = (counts[val] || 0) + 1;
    validTotal++;
  }

  const entries = Object.entries(counts).map(([label, count]) => ({
    label,
    count,
    pct: validTotal > 0 ? Math.round((count / validTotal) * 1000) / 10 : 0,
  }));

  if (fixedOrder && fixedOrder.length > 0) {
    return entries.sort((a, b) => {
      const idxA = fixedOrder.indexOf(a.label);
      const idxB = fixedOrder.indexOf(b.label);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.count - a.count;
    });
  }

  return entries.sort((a, b) => b.count - a.count);
}

function renderProgressBar(pct: number): string {
  const totalBlocks = 10;
  const filled = Math.round((pct / 100) * totalBlocks);
  const empty = Math.max(0, totalBlocks - filled);
  return "🟦".repeat(filled) + "⬜".repeat(empty);
}

export function buildFgiSummaryMarkdown(
  records: FgiSyncRecord[],
  updatedAtIso?: string
): string {
  const nowParts =
    toKstDateParts(updatedAtIso || new Date().toISOString()) ||
    toKstDateParts(new Date().toISOString())!;
  const todayFullDate = nowParts.fullDate;
  const syncTimestampStr = `${nowParts.year}-${nowParts.month}-${nowParts.day} ${nowParts.hours}:${nowParts.minutes}`;

  const totalCount = records.length;
  const eligibleCount = records.filter((r) => r.isEligible).length;
  const ineligibleCount = totalCount - eligibleCount;
  const eligibleRate =
    totalCount > 0 ? Math.round((eligibleCount / totalCount) * 1000) / 10 : 0;

  const todayCount = records.filter((r) => {
    const p = toKstDateParts(r.timestamp);
    return p?.fullDate === todayFullDate;
  }).length;

  const todayEligibleCount = records.filter((r) => {
    const p = toKstDateParts(r.timestamp);
    return p?.fullDate === todayFullDate && r.isEligible;
  }).length;

  const g1Count = records.filter((r) => (r.targetGroup || "").includes("G1")).length;
  const g2Count = records.filter((r) => (r.targetGroup || "").includes("G2")).length;
  const g3Count = records.filter((r) => (r.targetGroup || "").includes("G3")).length;
  const g4Count = records.filter((r) => (r.targetGroup || "").includes("G4")).length;

  const ageOrder = ["20대", "30대", "40대", "50대", "60대 이상", "10대 이하", "미상"];
  const ageStats = countDistribution(records, (r) => r.ageGroup, ageOrder);
  const genderStats = countDistribution(records, (r) => r.gender, ["여성", "남성"]);
  const channelStats = countDistribution(records, (r) => r.channel);

  const ageTableRows =
    ageStats.length > 0
      ? ageStats
          .map(
            (item) =>
              `| **${item.label}** | ${item.count}명 | ${item.pct}% | ${renderProgressBar(item.pct)} |`
          )
          .join("\n")
      : `| 데이터 없음 | 0명 | 0% | - |`;

  const genderTableRows =
    genderStats.length > 0
      ? genderStats
          .map(
            (item) =>
              `| **${item.label}** | ${item.count}명 | ${item.pct}% | ${renderProgressBar(item.pct)} |`
          )
          .join("\n")
      : `| 데이터 없음 | 0명 | 0% | - |`;

  const channelTableRows =
    channelStats.length > 0
      ? channelStats
          .map(
            (item) =>
              `| ${item.label} | **${item.count}명** | ${item.pct}% | ${renderProgressBar(item.pct)} |`
          )
          .join("\n")
      : `| 데이터 없음 | 0명 | 0% | - |`;

  return `---
출처: 대한민국 구석구석 사용자 FGI 모집 구글 설문폼 (실시간 연동)
일자: ${todayFullDate}
단계: 4단계 FGI 조사설계 및 사용자 모집
보안등급: 내부용
AI생성여부: Y
검수자: 정호종 연구원
tags:
  - FGI
  - 사용자FGI
  - 설문현황
  - 리크루팅
---
# FGI 사용자 참가자 지원 현황

> [!INFO] 데이터 연동 안내
> - 구글 설문폼 응답 시트와 주기적 연동으로 갱신됨 (실시간 연동은 2026dgs.cloud 참조)
> - **최종 갱신 일시**: \`${syncTimestampStr}\` (KST 기준)
> - **집계 기준**: 설문 응답 완료자 집계 (개인식별정보 원천 제외)

---

## 1. 참가자 모집 총괄 요약

| 전체 참가자 수 (누적) | 금일 참가자 수 (${nowParts.dateKey}) | 적격 후보자 수 (적격률) | 스크리닝 제외 |
| :---: | :---: | :---: | :---: |
| **${totalCount}명** | **${todayCount}명** (적격 ${todayEligibleCount}명) | **${eligibleCount}명** (${eligibleRate}%) | ${ineligibleCount}명 |

### 타깃 그룹별 후보 분포 (G1 ~ G4)

| G1 핫(리워드) | G2 핫(콘텐츠) | G3 콜드(휴면) | G4 잠재(비회원) |
| :---: | :---: | :---: | :---: |
| **${g1Count}명** | **${g2Count}명** | **${g3Count}명** | **${g4Count}명** |

---

## 2. 유입 채널 분포

| 유입 채널 (Ⅰ-1) | 응답자 수 | 비율 | 분포 현황 |
| :--- | :---: | :---: | :--- |
${channelTableRows}

---

## 3. 연령대 분포

| 연령대 (Ⅰ-2) | 응답자 수 | 비율 | 분포 현황 |
| :---: | :---: | :---: | :--- |
${ageTableRows}

---

## 4. 성별 분포

| 성별 (Ⅰ-3) | 응답자 수 | 비율 | 분포 현황 |
| :---: | :---: | :---: | :--- |
${genderTableRows}

---

## 5. 관련 링크
- 연관 문서: [[사용자 FGI 설문 문항]]
- 연관 일정: [[2026-10-20 FGI 참가자 1차 모집 시작]]
`;
}

export function writeFgiSummaryMarkdownToVault(
  records: FgiSyncRecord[],
  updatedAtIso?: string
): { written: boolean; filePath: string } {
  const vaultRoot = path.join(process.cwd(), "vault");
  const existingPath = findExistingSummaryNotePath(vaultRoot);
  const vaultFilePath =
    existingPath ||
    path.join(vaultRoot, "02_주요진행상황", FGI_SUMMARY_NOTE_FILENAME);

  try {
    const dir = path.dirname(vaultFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const markdown = buildFgiSummaryMarkdown(records, updatedAtIso);
    fs.writeFileSync(vaultFilePath, markdown, "utf-8");
    return { written: true, filePath: vaultFilePath };
  } catch (err) {
    // 읽기 전용 서버리스 환경에서는 파일 쓰기 생략
    console.warn("Skipped writing FGI summary markdown to disk:", err);
    return { written: false, filePath: vaultFilePath };
  }
}
