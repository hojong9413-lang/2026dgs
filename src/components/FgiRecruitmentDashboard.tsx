"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  BarChart3,
  RefreshCw,
  Users,
  UserCheck,
  ShieldCheck,
  Calendar,
  MapPin,
  Smartphone,
  Compass,
  MessageSquareQuote,
  Settings,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Printer,
  Filter,
  Clock,
  Sparkles,
  ExternalLink,
  X,
} from "lucide-react";

export interface FgiRespondentRecord {
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
  exp: string;
  joinReason: string;
  freq: string;
  device: string;
  services: string;
  mainPurpose: string;
  push: string;
  badgeRank: string;
  stopReason: string;
  mainScreen: string;
  searchFreq: string;
  otherApps: string;
  tripCount: string;
  tripDist: string;
  infoSource: string;
  genAi: string;
  stampReward: string;
  isMember: string;
  opinion: string;
  targetGroup: string;
  isEligible: boolean;
  excludeReasons: string[];
}

interface ApiResponse {
  success: boolean;
  isPreview?: boolean;
  configuredUrl?: string;
  updatedAt?: string;
  sheetName?: string;
  totalCount?: number;
  eligibleCount?: number;
  records?: FgiRespondentRecord[];
  error?: string;
}

const APPS_SCRIPT_CODE = `function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Form_Responses') || ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();

    if (!data || data.length <= 1) {
      return createJsonResponse({
        success: true,
        updatedAt: new Date().toISOString(),
        sheetName: sheet.getName(),
        totalCount: 0,
        records: []
      });
    }

    var headers = data[0].map(function(h) { return String(h || '').trim(); });
    function findCol(codePrefix, fallbackIdx) {
      for (var i = 0; i < headers.length; i++) {
        if (headers[i].indexOf(codePrefix) !== -1) return i;
      }
      return fallbackIdx;
    }

    var COL = {
      TIMESTAMP: 0,
      I1_CHANNEL: findCol('Ⅰ-1', 1),
      I2_BIRTH: findCol('Ⅰ-2', 2),
      I3_GENDER: findCol('Ⅰ-3', 3),
      I4_REGION: findCol('Ⅰ-4', 4),
      I5_ATTEND: findCol('Ⅰ-5', 5),
      I6_SESSIONS: findCol('Ⅰ-6', 6),
      II1_EXP: findCol('Ⅱ-1', 7),
      II2_JOIN_REASON: findCol('Ⅱ-2', 8),
      II3_FREQ: findCol('Ⅱ-3', 9),
      II4_DEVICE: findCol('Ⅱ-4', 10),
      II5_SERVICES: findCol('Ⅱ-5', 11),
      II6_MAIN_PURPOSE: findCol('Ⅱ-6', 12),
      II7_PUSH: findCol('Ⅱ-7', 13),
      II8_BADGE_RANK: findCol('Ⅱ-8', 14),
      II9_STOP_REASON: findCol('Ⅱ-9', 15),
      II10_MAIN_SCREEN: findCol('Ⅱ-10', 16),
      II11_SEARCH_FREQ: findCol('Ⅱ-11', 17),
      II12_OTHER_APPS: findCol('Ⅱ-12', 18),
      III1_TRIP_COUNT: findCol('Ⅲ-1', 19),
      III2_TRIP_DIST: findCol('Ⅲ-2', 20),
      III3_INFO_SOURCE: findCol('Ⅲ-3', 21),
      III4_GEN_AI: findCol('Ⅲ-4', 22),
      III5_STAMP_REWARD: findCol('Ⅲ-5', 23),
      IV1_JOB_EXCLUDE: findCol('Ⅳ-1', 24),
      IV2_ATTENTION: findCol('Ⅳ-2', 25),
      IV3_PAST_FGI: findCol('Ⅳ-3', 26),
      V1_OPINION: findCol('Ⅴ-1', 27),
      // V-2(성함), V-3(휴대전화), V-4(이메일), V-5-1(회원ID)는 개인정보이므로 원천 제외
      V5_IS_MEMBER: findCol('Ⅴ-5.', 31),
      V6_AGREE_COLLECT: findCol('Ⅴ-6', 33),
      V7_AGREE_LOG: findCol('Ⅴ-7', 34),
      V8_AGREE_THIRD: findCol('Ⅴ-8', 35),
      V9_AGREE_REC: findCol('Ⅴ-9', 36)
    };

    var records = [];
    var baseYear = 2026;

    for (var r = 1; r < data.length; r++) {
      var row = data[r];
      if (!row[COL.TIMESTAMP] && !row[COL.I1_CHANNEL] && !row[COL.I2_BIRTH]) continue;

      var rawTs = row[COL.TIMESTAMP];
      var isoTs = (rawTs instanceof Date) ? rawTs.toISOString() : String(rawTs || '').trim();
      var birthYear = parseInt(String(row[COL.I2_BIRTH] || '').replace(/\\D/g, ''), 10);
      var age = (birthYear && birthYear > 1900 && birthYear <= baseYear) ? (baseYear - birthYear) : null;
      var ageGroup = '미상';
      if (age !== null) {
        if (age < 20) ageGroup = '10대 이하';
        else if (age < 30) ageGroup = '20대';
        else if (age < 40) ageGroup = '30대';
        else if (age < 50) ageGroup = '40대';
        else if (age < 60) ageGroup = '50대';
        else ageGroup = '60대 이상';
      }

      var attend = String(row[COL.I5_ATTEND] || '').trim();
      var exp = String(row[COL.II1_EXP] || '').trim();
      var purpose = String(row[COL.II6_MAIN_PURPOSE] || '').trim();
      var badgeRank = String(row[COL.II8_BADGE_RANK] || '').trim();
      var mainScreen = String(row[COL.II10_MAIN_SCREEN] || '').trim();
      var searchFreq = String(row[COL.II11_SEARCH_FREQ] || '').trim();
      var tripCount = String(row[COL.III1_TRIP_COUNT] || '').trim();
      var jobExclude = String(row[COL.IV1_JOB_EXCLUDE] || '').trim();
      var attention = String(row[COL.IV2_ATTENTION] || '').trim();
      var pastFgi = String(row[COL.IV3_PAST_FGI] || '').trim();
      var agreeCollect = String(row[COL.V6_AGREE_COLLECT] || '').trim();
      var agreeThird = String(row[COL.V8_AGREE_THIRD] || '').trim();
      var agreeRec = String(row[COL.V9_AGREE_REC] || '').trim();

      var targetGroup = '미분류';
      if (exp.indexOf('최근 3개월') !== -1 && exp.indexOf('이용한 적이 있다') !== -1) {
        if (purpose.indexOf('보상') !== -1 || purpose.indexOf('이벤트') !== -1 || purpose.indexOf('미션') !== -1 || purpose.indexOf('혜택') !== -1) {
          targetGroup = 'G1 (핫·리워드/혜택형)';
        } else if (purpose.indexOf('정보') !== -1 || purpose.indexOf('기사') !== -1 || purpose.indexOf('코스') !== -1) {
          targetGroup = 'G2 (핫·콘텐츠/탐색형)';
        } else {
          targetGroup = 'G1/G2 (핫 유저)';
        }
      } else if (exp.indexOf('거의 또는 전혀') !== -1 || exp.indexOf('1년') !== -1 || exp.indexOf('이용하지 않았다') !== -1) {
        targetGroup = 'G3 (콜드·휴면/이탈)';
      } else if (exp.indexOf('회원은 아니') !== -1 || exp.indexOf('본 적이 없다') !== -1 || exp.indexOf('모르겠다') !== -1 || exp.indexOf('비회원') !== -1) {
        targetGroup = 'G4 (잠재·비회원)';
      }

      var excludeReasons = [];
      if (attend.indexOf('어렵습니다') !== -1 || attend.indexOf('아니요') !== -1) excludeReasons.push('대면참석 불가');
      if (age !== null && age < 19) excludeReasons.push('연령 미달');
      if (badgeRank.indexOf('있다') !== -1 || badgeRank.indexOf('예') !== -1) excludeReasons.push('배지랜드 상위랭커');
      if (targetGroup.indexOf('G4') !== -1) {
        if (mainScreen.indexOf('이름도 알고 있다') !== -1) excludeReasons.push('잠재고객 기인지자');
        if (searchFreq.indexOf('한 달에') !== -1 || searchFreq.indexOf('드물게') !== -1) excludeReasons.push('탐색빈도 낮음');
        if (tripCount === '없다' || tripCount === '1번' || tripCount === '1회') excludeReasons.push('숙박여행 2회 미만');
      }
      if (jobExclude && jobExclude.indexOf('해당 없음') === -1 && jobExclude.indexOf('없다') === -1) excludeReasons.push('배제 업종 해당');
      if (attention && attention.indexOf('3') === -1) excludeReasons.push('주의문항 오답');
      if (pastFgi.indexOf('있다') !== -1 || pastFgi.indexOf('예') !== -1) excludeReasons.push('최근 좌담회 이력');

      var completedForm = Boolean(agreeCollect && agreeThird && agreeRec);
      if (!completedForm && excludeReasons.length === 0) excludeReasons.push('중도 종료/미동의');

      records.push({
        id: r,
        timestamp: isoTs,
        channel: String(row[COL.I1_CHANNEL] || '').trim(),
        birthYear: birthYear || null,
        age: age,
        ageGroup: ageGroup,
        gender: String(row[COL.I3_GENDER] || '').trim(),
        region: String(row[COL.I4_REGION] || '').trim(),
        attend: attend,
        sessions: String(row[COL.I6_SESSIONS] || '').trim(),
        exp: exp,
        joinReason: String(row[COL.II2_JOIN_REASON] || '').trim(),
        freq: String(row[COL.II3_FREQ] || '').trim(),
        device: String(row[COL.II4_DEVICE] || '').trim(),
        services: String(row[COL.II5_SERVICES] || '').trim(),
        mainPurpose: purpose,
        push: String(row[COL.II7_PUSH] || '').trim(),
        badgeRank: badgeRank,
        stopReason: String(row[COL.II9_STOP_REASON] || '').trim(),
        mainScreen: mainScreen,
        searchFreq: searchFreq,
        otherApps: String(row[COL.II12_OTHER_APPS] || '').trim(),
        tripCount: tripCount,
        tripDist: String(row[COL.III2_TRIP_DIST] || '').trim(),
        infoSource: String(row[COL.III3_INFO_SOURCE] || '').trim(),
        genAi: String(row[COL.III4_GEN_AI] || '').trim(),
        stampReward: String(row[COL.III5_STAMP_REWARD] || '').trim(),
        isMember: String(row[COL.V5_IS_MEMBER] || '').trim(),
        opinion: String(row[COL.V1_OPINION] || '').trim(),
        targetGroup: targetGroup,
        isEligible: excludeReasons.length === 0 && completedForm,
        excludeReasons: excludeReasons
      });
    }

    return createJsonResponse({
      success: true,
      updatedAt: new Date().toISOString(),
      sheetName: sheet.getName(),
      totalCount: records.length,
      eligibleCount: records.filter(function(item) { return item.isEligible; }).length,
      records: records
    });
  } catch (err) {
    return createJsonResponse({ success: false, error: String(err) });
  }
}

function createJsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}`;

function countSingleChoice(
  records: FgiRespondentRecord[],
  getter: (r: FgiRespondentRecord) => string
) {
  const counts: Record<string, number> = {};
  let validTotal = 0;
  for (const r of records) {
    const val = (getter(r) || "").trim();
    if (!val) continue;
    counts[val] = (counts[val] || 0) + 1;
    validTotal++;
  }
  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      pct: validTotal > 0 ? Math.round((count / validTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// 체크박스(복수응답) 분리 집계 헬퍼 (괄호 안 쉼표 등 보호)
function countMultiChoice(
  records: FgiRespondentRecord[],
  getter: (r: FgiRespondentRecord) => string,
  knownOptions?: string[]
) {
  const counts: Record<string, number> = {};
  let respondentCount = 0;

  for (const r of records) {
    const raw = (getter(r) || "").trim();
    if (!raw) continue;
    respondentCount++;

    if (knownOptions && knownOptions.length > 0) {
      let matchedAny = false;
      for (const opt of knownOptions) {
        if (raw.includes(opt)) {
          counts[opt] = (counts[opt] || 0) + 1;
          matchedAny = true;
        }
      }
      if (!matchedAny) {
        counts[raw] = (counts[raw] || 0) + 1;
      }
    } else {
      const parts = raw
        .split(/,\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
      for (const p of parts) {
        counts[p] = (counts[p] || 0) + 1;
      }
    }
  }

  return Object.entries(counts)
    .map(([label, count]) => ({
      label,
      count,
      pct:
        respondentCount > 0
          ? Math.round((count / respondentCount) * 1000) / 10
          : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

function formatKoreanDateTime(isoOrStr?: string) {
  if (!isoOrStr) return "-";
  const d = new Date(isoOrStr);
  if (isNaN(d.getTime())) return isoOrStr;
  return d.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function extractDateKey(isoOrStr?: string): string {
  if (!isoOrStr) return "기타";
  const d = new Date(isoOrStr);
  if (!isNaN(d.getTime())) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${m}.${day}`;
  }
  const match = isoOrStr.match(/(\d{1,2})\.\s*(\d{1,2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}.${match[2].padStart(2, "0")}`;
  }
  return "기타";
}

function HorizontalStatCard({
  title,
  subtitle,
  codeBadge,
  items,
  barColor = "bg-sky-600",
  emptyText = "아직 집계된 응답이 없습니다.",
}: {
  title: string;
  subtitle?: string;
  codeBadge?: string;
  items: { label: string; count: number; pct: number }[];
  barColor?: string;
  emptyText?: string;
}) {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              {codeBadge && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {codeBadge}
                </span>
              )}
              <h3 className="font-bold text-slate-900 text-sm sm:text-[15px]">
                {title}
              </h3>
            </div>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-3 mt-3">
            {items.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-medium text-slate-700 break-keep">
                    {item.label}
                  </span>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {item.count}명{" "}
                    <span className="text-slate-400 font-normal">
                      ({item.pct}%)
                    </span>
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${Math.max(item.pct, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FgiRecruitmentDashboard() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<
    "overview" | "service" | "travel" | "screening" | "voices"
  >("overview");
  const [groupFilter, setGroupFilter] = useState<string>("ALL");

  // 연동 설정 모달 상태
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [scriptUrlInput, setScriptUrlInput] = useState("");
  const [savingUrl, setSavingUrl] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const fetchRecruitmentData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const localUrl =
        typeof window !== "undefined"
          ? localStorage.getItem("fgi_apps_script_url") || ""
          : "";
      const endpoint = localUrl
        ? `/api/fgi/recruitment?scriptUrl=${encodeURIComponent(localUrl)}`
        : "/api/fgi/recruitment";
      const res = await fetch(endpoint, { cache: "no-store" });
      const json: ApiResponse = await res.json();
      setData(json);
      if (json.configuredUrl) {
        setScriptUrlInput(json.configuredUrl);
      } else if (localUrl) {
        setScriptUrlInput(localUrl);
      }
    } catch (err: any) {
      setData({
        success: false,
        error: err?.message || "데이터를 불러오지 못했습니다.",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecruitmentData(false);
  }, [fetchRecruitmentData]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchRecruitmentData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchRecruitmentData]);

  const handleSaveScriptUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUrl(true);
    setConfigError(null);

    try {
      const cleanUrl = scriptUrlInput.trim();
      const res = await fetch("/api/fgi/recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scriptUrl: cleanUrl }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setConfigError(json.error || "URL 저장에 실패했습니다.");
        setSavingUrl(false);
        return;
      }
      if (typeof window !== "undefined") {
        if (cleanUrl) {
          localStorage.setItem("fgi_apps_script_url", cleanUrl);
        } else {
          localStorage.removeItem("fgi_apps_script_url");
        }
      }
      setIsConfigOpen(false);
      await fetchRecruitmentData(false);
    } catch (err: any) {
      setConfigError(err?.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSavingUrl(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const allRecords = useMemo(() => data?.records || [], [data?.records]);

  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      if (onlyEligible && !r.isEligible) return false;
      if (groupFilter !== "ALL" && !r.targetGroup.includes(groupFilter)) {
        return false;
      }
      return true;
    });
  }, [allRecords, onlyEligible, groupFilter]);

  // 상단 요약 지표 계산
  const summaryMetrics = useMemo(() => {
    const total = allRecords.length;
    const eligible = allRecords.filter((r) => r.isEligible).length;
    const eligibleRate = total > 0 ? Math.round((eligible / total) * 100) : 0;

    const todayKey = extractDateKey(new Date().toISOString());
    const todayCount = allRecords.filter(
      (r) => extractDateKey(r.timestamp) === todayKey
    ).length;

    const g1Count = allRecords.filter((r) =>
      r.targetGroup.includes("G1")
    ).length;
    const g2Count = allRecords.filter((r) =>
      r.targetGroup.includes("G2")
    ).length;
    const g3Count = allRecords.filter((r) =>
      r.targetGroup.includes("G3")
    ).length;
    const g4Count = allRecords.filter((r) =>
      r.targetGroup.includes("G4")
    ).length;

    // 일자별 추이
    const byDateMap: Record<string, { total: number; eligible: number }> = {};
    for (const r of allRecords) {
      const dk = extractDateKey(r.timestamp);
      if (!byDateMap[dk]) byDateMap[dk] = { total: 0, eligible: 0 };
      byDateMap[dk].total += 1;
      if (r.isEligible) byDateMap[dk].eligible += 1;
    }
    const dailyTrend = Object.entries(byDateMap)
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      total,
      eligible,
      eligibleRate,
      todayCount,
      g1Count,
      g2Count,
      g3Count,
      g4Count,
      dailyTrend,
    };
  }, [allRecords]);

  // 세부 차트 집계
  const stats = useMemo(() => {
    const targetList = filteredRecords;

    const channels = countSingleChoice(targetList, (r) => r.channel);
    const ageGroups = countSingleChoice(targetList, (r) => r.ageGroup);
    const genders = countSingleChoice(targetList, (r) => r.gender);
    const regions = countSingleChoice(targetList, (r) => r.region);
    const attendStatus = countSingleChoice(targetList, (r) => r.attend);
    const sessions = countMultiChoice(targetList, (r) => r.sessions, [
      "2026. 11. 19(목) 오전 10:00~11:30",
      "2026. 11. 19(목) 오후 13:00~14:30",
      "2026. 11. 20(금) 오전 10:00~11:30",
      "2026. 11. 20(금) 오후 13:00~14:30",
    ]);

    const expTypes = countSingleChoice(targetList, (r) => r.exp);
    const joinReasons = countSingleChoice(targetList, (r) => r.joinReason);
    const freqs = countSingleChoice(targetList, (r) => r.freq);
    const devices = countSingleChoice(targetList, (r) => r.device);
    const services = countMultiChoice(targetList, (r) => r.services, [
      "여행기사·여행지 정보 보기",
      "여행코스 보기·만들기",
      "AI콕콕(AI 추천·플래너)",
      "가볼래-터 미션·여행복권",
      "퀴즈·룰렛 등 이벤트 참여",
      "배지랜드(배지 모으기)",
      "발도장(여행지 현장 방문 인증)",
      "좋아요·댓글·여행후기 작성",
      "디지털 관광주민증",
      "대한민국 반값여행",
      "여행상품 홍보관",
      "기억나는 것이 없다",
    ]);
    const mainPurposes = countSingleChoice(targetList, (r) => r.mainPurpose);
    const pushTypes = countSingleChoice(targetList, (r) => r.push);
    const badgeRanks = countSingleChoice(targetList, (r) => r.badgeRank);
    const stopReasons = countMultiChoice(targetList, (r) => r.stopReason);
    const mainScreens = countSingleChoice(targetList, (r) => r.mainScreen);
    const searchFreqs = countSingleChoice(targetList, (r) => r.searchFreq);
    const otherApps = countMultiChoice(targetList, (r) => r.otherApps);

    const tripCounts = countSingleChoice(targetList, (r) => r.tripCount);
    const tripDists = countSingleChoice(targetList, (r) => r.tripDist);
    const infoSources = countMultiChoice(targetList, (r) => r.infoSource, [
      "포털 검색(네이버·다음 등)",
      "블로그·카페",
      "유튜브",
      "인스타그램",
      "예약 플랫폼의 후기·기획전",
      "ChatGPT 등 생성형 AI",
      "지자체·공공 관광 사이트",
      "대한민국 구석구석",
      "주변 사람의 추천",
    ]);
    const genAiTypes = countSingleChoice(targetList, (r) => r.genAi);
    const stampRewards = countSingleChoice(targetList, (r) => r.stampReward);

    // Ⅳ. 참가 자격 및 스크리닝 통계 (Ⅳ-1, Ⅳ-2, Ⅳ-3, Ⅴ-5)
    const jobExcludeStats = countSingleChoice(targetList, (r) =>
      r.excludeReasons.includes("배제 업종 해당")
        ? "배제 대상 기관·업종 종사 (스크리닝 제외)"
        : "해당 없음 (적격)"
    );
    const attentionStats = countSingleChoice(targetList, (r) =>
      r.excludeReasons.includes("주의문항 오답")
        ? "오답 또는 미선택 (스크리닝 제외)"
        : "'3번' 정상 선택 (성실 응답 통과)"
    );
    const pastFgiStats = countSingleChoice(targetList, (r) =>
      r.excludeReasons.includes("최근 좌담회 이력")
        ? "참여 이력 있음 (중복 참여 제외)"
        : "없다 (적격)"
    );
    const memberStatus = countSingleChoice(targetList, (r) =>
      r.isMember ? `대구석 회원 여부: ${r.isMember}` : ""
    );
    const screeningBreakdown = countMultiChoice(targetList, (r) =>
      r.isEligible ? "1차 적격 후보 (통과)" : r.excludeReasons.join(", ")
    );

    return {
      channels,
      ageGroups,
      genders,
      regions,
      attendStatus,
      sessions,
      expTypes,
      joinReasons,
      freqs,
      devices,
      services,
      mainPurposes,
      pushTypes,
      badgeRanks,
      stopReasons,
      mainScreens,
      searchFreqs,
      otherApps,
      tripCounts,
      tripDists,
      infoSources,
      genAiTypes,
      stampRewards,
      jobExcludeStats,
      attentionStats,
      pastFgiStats,
      memberStatus,
      screeningBreakdown,
    };
  }, [filteredRecords]);

  return (
    <div className="min-h-full bg-[#f8fafc] text-slate-900 p-4 sm:p-8 font-sans select-text print:bg-white print:p-0">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 1. 상단 헤더 & 컨트롤 바 */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 overflow-x-auto">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200 whitespace-nowrap shrink-0">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>2026 대한민국 구석구석 FGI</span>
              </span>

              {data?.isPreview ? (
                <button
                  onClick={() => setIsConfigOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>시트 실시간 연동 설정 필요</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Google Sheets 실시간 연동중</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200 whitespace-nowrap shrink-0">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>개인정보(성명·연락처·이메일) 원천 비식별화</span>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              FGI(집단 심층 인터뷰) 참가자 모집 실시간 통계 대시보드
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              모집 기간: <strong className="text-slate-700">2026. 10. 20.(화) ~ 10. 30.(금)</strong>{" "}
              | 마지막 동기화:{" "}
              <span className="font-mono text-slate-700">
                {formatKoreanDateTime(data?.updatedAt)}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 print:hidden">
            <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
              />
              <span>30초 자동갱신</span>
            </label>

            <button
              onClick={() => fetchRecruitmentData(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  refreshing || loading ? "animate-spin" : ""
                }`}
              />
              <span>실시간 새로고침</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
              title="PDF 저장 또는 보고서 인쇄"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">보고서 인쇄/PDF</span>
            </button>
          </div>
        </div>

        {/* 연동 안내 배너 (아직 URL 미설정 시에만 표시) */}
        {data?.isPreview && (
          <div className="bg-gradient-to-r from-sky-50 via-indigo-50/70 to-purple-50 border border-sky-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
            <div className="space-y-1">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span>
                  현재 시트에 입력된 테스트 응답(1973년생·1985년생 2건) 기준 미리보기 화면입니다.
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                우측 <strong>[1분 만에 구글 시트 실시간 연결하기]</strong> 버튼을 눌러 Apps Script 웹 앱 URL만 등록하시면, 내일부터 들어오는 모든 설문 응답이 0초 딜레이로 즉시 집계됩니다.
              </p>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shrink-0 shadow-xs transition-colors cursor-pointer"
            >
              1분 만에 구글 시트 실시간 연결하기 →
            </button>
          </div>
        )}

        {/* 2. 상단 4대 핵심 KPI 요약 카드 (가로 폭 비율 최적화로 줄바꿈 원천 방지 + 컬러 액센트 디자인) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[0.88fr_1.05fr_1.45fr_1.05fr] gap-4">
          {/* 카드 1: 누적 응답자 수 */}
          <div className="bg-gradient-to-br from-sky-50/90 via-white to-blue-50/60 border border-sky-200 border-t-4 border-t-sky-500 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-sky-900 mb-2.5 gap-1">
                <span className="whitespace-nowrap">총 누적 신청(응답) 수</span>
                <span className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap my-1">
                <span className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {summaryMetrics.total}
                </span>
                <span className="text-base font-extrabold text-slate-700">명</span>
                {summaryMetrics.todayCount > 0 && (
                  <span className="ml-auto text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-600 text-white shadow-2xs whitespace-nowrap shrink-0">
                    오늘 +{summaryMetrics.todayCount}명
                  </span>
                )}
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-sky-200/70 flex items-center justify-between text-xs text-slate-600 gap-2 whitespace-nowrap bg-white/80 rounded-lg px-2.5 py-1.5 border">
              <span className="font-semibold text-slate-500 shrink-0">최근 신청 시각</span>
              <span className="font-mono font-bold text-sky-900 shrink-0">
                {allRecords.length > 0
                  ? formatKoreanDateTime(
                      allRecords[allRecords.length - 1].timestamp
                    )
                  : "-"}
              </span>
            </div>
          </div>

          {/* 카드 2: 1차 적격 후보자 풀 */}
          <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 border border-emerald-200 border-t-4 border-t-emerald-500 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-950 mb-2.5 gap-1">
                <span className="whitespace-nowrap">1차 스크리닝 적격 후보</span>
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 whitespace-nowrap my-1">
                <span className="text-4xl font-black text-emerald-600 font-mono tracking-tight">
                  {summaryMetrics.eligible}
                </span>
                <span className="text-base font-extrabold text-emerald-900">명</span>
                <span className="ml-auto text-xs font-mono font-extrabold px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-2xs whitespace-nowrap shrink-0">
                  적격률 {summaryMetrics.eligibleRate}%
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-200/70 text-[11px] font-semibold text-emerald-900 whitespace-nowrap truncate bg-white/80 rounded-lg px-2.5 py-1.5 border">
              대면참석 · 배제업종 비해당 · 주의문항 통과
            </div>
          </div>

          {/* 카드 3: 타깃 그룹별 확보 현황 (G1~G4) */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/60 border border-indigo-200 border-t-4 border-t-indigo-500 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-950 mb-2.5 gap-2">
              <span className="whitespace-nowrap">타깃 그룹별 후보 분포</span>
              <span className="text-xs font-mono text-white bg-indigo-600 px-2.5 py-0.5 rounded-full font-extrabold whitespace-nowrap shrink-0 shadow-2xs">
                G1 ~ G4
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <div className="bg-white/95 rounded-xl px-3 py-2 border border-sky-200 shadow-2xs flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="text-xs font-bold text-sky-900 shrink-0">
                  G1 핫(리워드)
                </span>
                <span className="text-base font-black font-mono text-sky-600 shrink-0">
                  {summaryMetrics.g1Count}명
                </span>
              </div>
              <div className="bg-white/95 rounded-xl px-3 py-2 border border-indigo-200 shadow-2xs flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="text-xs font-bold text-indigo-900 shrink-0">
                  G2 핫(콘텐츠)
                </span>
                <span className="text-base font-black font-mono text-indigo-600 shrink-0">
                  {summaryMetrics.g2Count}명
                </span>
              </div>
              <div className="bg-white/95 rounded-xl px-3 py-2 border border-amber-200 shadow-2xs flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="text-xs font-bold text-amber-900 shrink-0">
                  G3 콜드(휴면)
                </span>
                <span className="text-base font-black font-mono text-amber-600 shrink-0">
                  {summaryMetrics.g3Count}명
                </span>
              </div>
              <div className="bg-white/95 rounded-xl px-3 py-2 border border-emerald-200 shadow-2xs flex items-center justify-between gap-2 whitespace-nowrap">
                <span className="text-xs font-bold text-emerald-900 shrink-0">
                  G4 잠재(비회원)
                </span>
                <span className="text-base font-black font-mono text-emerald-600 shrink-0">
                  {summaryMetrics.g4Count}명
                </span>
              </div>
            </div>
          </div>

          {/* 카드 4: 일자별 유입 & 모집 일정 */}
          <div className="bg-gradient-to-br from-purple-50/90 via-white to-fuchsia-50/60 border border-purple-200 border-t-4 border-t-purple-500 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-purple-950 mb-2 gap-1">
                <span className="whitespace-nowrap">FGI 세션별 참석 가능 풀</span>
                <span className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Calendar className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="space-y-1.5 mt-1">
                {[
                  { short: "11/19(목) 오전", match: "19(목) 오전" },
                  { short: "11/19(목) 오후", match: "19(목) 오후" },
                  { short: "11/20(금) 오전", match: "20(금) 오전" },
                  { short: "11/20(금) 오후", match: "20(금) 오후" },
                ].map((sess) => {
                  const totalCnt = allRecords.filter((r) =>
                    r.sessions.includes(sess.match)
                  ).length;
                  const eligCnt = allRecords.filter(
                    (r) => r.isEligible && r.sessions.includes(sess.match)
                  ).length;
                  return (
                    <div
                      key={sess.short}
                      className="flex items-center justify-between text-xs gap-2 whitespace-nowrap bg-white/85 border border-purple-100 rounded-lg px-2.5 py-1"
                    >
                      <span className="text-slate-700 font-bold shrink-0">
                        {sess.short}
                      </span>
                      <span className="font-mono font-extrabold text-purple-700 bg-purple-100/80 px-2 py-0.2 rounded shrink-0">
                        {totalCnt}명{" "}
                        <span className="text-[11px] font-semibold text-purple-600">
                          (적격 {eligCnt})
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 3. 서브 탭 & 필터 바 (시선 집중형 네비게이션 독 디자인) */}
        <div className="bg-gradient-to-r from-slate-100/95 via-indigo-50/70 to-sky-50/80 border-2 border-indigo-200/80 rounded-2xl p-3.5 sm:p-4 shadow-sm space-y-3 print:hidden">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveSubTab("overview")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeSubTab === "overview"
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 -translate-y-0.5"
                  : "bg-white text-slate-800 border-slate-300/90 shadow-xs hover:border-sky-400 hover:bg-sky-50/50 hover:text-sky-950 hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                  activeSubTab === "overview"
                    ? "bg-white/20 text-white"
                    : "bg-sky-100 text-sky-700"
                }`}
              >
                Ⅰ
              </span>
              <span>유입경로 · 인구통계 · 참석시간</span>
            </button>

            <button
              onClick={() => setActiveSubTab("service")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeSubTab === "service"
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 -translate-y-0.5"
                  : "bg-white text-slate-800 border-slate-300/90 shadow-xs hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-950 hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                  activeSubTab === "service"
                    ? "bg-white/20 text-white"
                    : "bg-indigo-100 text-indigo-700"
                }`}
              >
                Ⅱ
              </span>
              <span>대구석 이용 행태 통계</span>
            </button>

            <button
              onClick={() => setActiveSubTab("travel")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeSubTab === "travel"
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 -translate-y-0.5"
                  : "bg-white text-slate-800 border-slate-300/90 shadow-xs hover:border-violet-400 hover:bg-violet-50/50 hover:text-violet-950 hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                  activeSubTab === "travel"
                    ? "bg-white/20 text-white"
                    : "bg-violet-100 text-violet-700"
                }`}
              >
                Ⅲ
              </span>
              <span>국내여행 · AI 활용 통계</span>
            </button>

            <button
              onClick={() => setActiveSubTab("screening")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeSubTab === "screening"
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 -translate-y-0.5"
                  : "bg-white text-slate-800 border-slate-300/90 shadow-xs hover:border-emerald-400 hover:bg-emerald-50/50 hover:text-emerald-950 hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                  activeSubTab === "screening"
                    ? "bg-white/20 text-white"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                Ⅳ
              </span>
              <span>참가 자격 · 스크리닝 통계</span>
            </button>

            <button
              onClick={() => setActiveSubTab("voices")}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-[13px] font-extrabold flex items-center gap-2 border-2 transition-all cursor-pointer ${
                activeSubTab === "voices"
                  ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 -translate-y-0.5"
                  : "bg-white text-slate-800 border-slate-300/90 shadow-xs hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-950 hover:-translate-y-0.5"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[11px] font-black shrink-0 ${
                  activeSubTab === "voices"
                    ? "bg-white/20 text-white"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                Ⅴ
              </span>
              <span>신청자 익명 의견(VOC) & 응답 목록</span>
            </button>
          </div>

          {/* 하단 필터 바 (전체 vs 적격 후보자만 / 그룹 필터) */}
          <div className="pt-2.5 border-t border-indigo-200/60 flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-600 font-bold">그룹:</span>
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="bg-transparent font-extrabold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="ALL">전체 그룹 ({allRecords.length}명)</option>
                <option value="G1">G1 핫·리워드형</option>
                <option value="G2">G2 핫·콘텐츠형</option>
                <option value="G3">G3 콜드·휴면형</option>
                <option value="G4">G4 잠재·비회원</option>
              </select>
            </div>

            <label className="inline-flex items-center gap-1.5 bg-emerald-600/10 border-2 border-emerald-400 text-emerald-950 rounded-xl px-3.5 py-1.5 text-xs font-extrabold cursor-pointer hover:bg-emerald-600/20 transition-colors shadow-2xs">
              <input
                type="checkbox"
                checked={onlyEligible}
                onChange={(e) => setOnlyEligible(e.target.checked)}
                className="rounded border-emerald-500 text-emerald-600 focus:ring-emerald-500"
              />
              <span>1차 적격 후보만 집계 ({filteredRecords.length}명)</span>
            </label>

            <span className="text-xs sm:text-[13px] text-indigo-700 font-extrabold px-1.5">
              * 적격 후보 표시는 신청자의 문항별 답변을 기준으로만 표시됩니다. 최종 적격은 대시보드에서 판단하지 않습니다.
            </span>
          </div>
        </div>

        {/* 4. 탭별 본문 통계 차트 영역 */}
        {activeSubTab === "overview" && (
          <div className="space-y-6">
            {/* 일자별 신청 추이 바 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>일자별 참가 신청 유입 추이</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    설문 제출 타임스탬프 기준 일별 전체 응답 수 및 1차 적격자 수
                  </p>
                </div>
              </div>

              {summaryMetrics.dailyTrend.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  데이터가 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                  {summaryMetrics.dailyTrend.map((d) => (
                    <div
                      key={d.date}
                      className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 flex flex-col items-center text-center"
                    >
                      <span className="text-xs font-mono font-semibold text-slate-500">
                        {d.date}
                      </span>
                      <span className="text-xl font-extrabold font-mono text-slate-900 mt-1">
                        {d.total}명
                      </span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-200/60">
                        적격 {d.eligible}명
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <HorizontalStatCard
                codeBadge="Ⅰ-1"
                title="설문 참여 유입 경로"
                subtitle="이 설문에 어떤 경로로 참여하게 되셨나요?"
                items={stats.channels}
                barColor="bg-sky-600"
              />

              <HorizontalStatCard
                codeBadge="Ⅰ-6"
                title="FGI 세션별 참석 가능 인원 (복수응답)"
                subtitle="2026. 11. 19(목) ~ 20(금) 중 참석 가능한 시간대"
                items={stats.sessions}
                barColor="bg-purple-600"
              />

              <HorizontalStatCard
                codeBadge="Ⅰ-2"
                title="연령대별 분포 (출생연도 자동 환산)"
                subtitle="2026년 기준 연령대 집계"
                items={stats.ageGroups}
                barColor="bg-indigo-600"
              />

              <HorizontalStatCard
                codeBadge="Ⅰ-3"
                title="성별 분포"
                subtitle="참가 신청자 성별 비율"
                items={stats.genders}
                barColor="bg-emerald-600"
              />

              <HorizontalStatCard
                codeBadge="Ⅰ-4"
                title="현재 거주 지역(시·도) 분포"
                subtitle="수도권(서울·경기·인천) 및 지역별 신청 현황"
                items={stats.regions}
                barColor="bg-amber-500"
              />

              <HorizontalStatCard
                codeBadge="Ⅰ-5"
                title="대면 FGI(서울 강남구, 90분) 참석 가능 여부"
                subtitle="참석 불가 응답자는 스크리닝에서 자동 제외됨"
                items={stats.attendStatus}
                barColor="bg-teal-600"
              />
            </div>
          </div>
        )}

        {activeSubTab === "service" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <HorizontalStatCard
              codeBadge="Ⅱ-1"
              title="대한민국 구석구석 이용 경험 구분"
              subtitle="핫 유저(최근 3개월 이용) / 콜드 유저(미이용·휴면) / 잠재 유저 분류 기준"
              items={stats.expTypes}
              barColor="bg-sky-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-5"
              title="최근 3개월 내 이용 세부 서비스 (복수응답)"
              subtitle="여행기사, AI콕콕, 가볼래-터, 이벤트, 배지랜드, 관광주민증 등"
              items={stats.services}
              barColor="bg-indigo-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-6"
              title="대구석 주 이용 목적"
              subtitle="정보 탐색형(G2) vs 리워드·혜택형(G1) 분류 핵심 지표"
              items={stats.mainPurposes}
              barColor="bg-purple-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-2"
              title="최초 회원가입 계기"
              subtitle="디지털 관광주민증, 반값여행, 이벤트 응모, 여행정보 탐색 등"
              items={stats.joinReasons}
              barColor="bg-emerald-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-3"
              title="최근 2개월 이용 빈도"
              subtitle="거의 매일 ~ 한 달에 1번 이하"
              items={stats.freqs}
              barColor="bg-amber-500"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-4"
              title="주 이용 기기 및 접속 방식"
              subtitle="스마트폰 앱 vs 모바일웹 vs PC"
              items={stats.devices}
              barColor="bg-teal-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-7"
              title="앱 푸시 알림 수신 및 확인 행태"
              subtitle="알림 수신 및 열람 적극성"
              items={stats.pushTypes}
              barColor="bg-blue-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-8"
              title="최근 1년 내 배지랜드 월간·연간 랭킹 10위 이내 여부"
              subtitle="극단적 헤비유저(아웃라이어) 확인 문항"
              items={stats.badgeRanks}
              barColor="bg-cyan-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-9"
              title="이용 감소 또는 중단 이유 (복수응답)"
              subtitle="콜드 유저(휴면·이탈군)의 주요 이탈 원인"
              items={stats.stopReasons}
              barColor="bg-rose-500"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-10"
              title="[잠재유저] 대구석 메인 화면 인지 여부"
              subtitle="비회원·미이용자의 브랜드/화면 사전 인지 수준"
              items={stats.mainScreens}
              barColor="bg-violet-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-11"
              title="[잠재유저] 평소 여행 정보 탐색 빈도"
              subtitle="앱·검색·SNS 등을 통한 여행 정보 탐색 주기"
              items={stats.searchFreqs}
              barColor="bg-fuchsia-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-12"
              title="[잠재유저] 여행 시 주로 이용하는 타사 앱·서비스"
              subtitle="지도, 숙박·액티비티 플랫폼, 공공 관광 사이트 등"
              items={stats.otherApps}
              barColor="bg-orange-500"
            />
          </div>
        )}

        {activeSubTab === "travel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <HorizontalStatCard
              codeBadge="Ⅲ-3"
              title="국내여행 정보 주요 탐색 채널 (최대 3개 복수응답)"
              subtitle="포털 검색, 블로그, 유튜브, 인스타그램, 생성형 AI 등"
              items={stats.infoSources}
              barColor="bg-sky-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅲ-4"
              title="여행 계획 시 생성형 AI(ChatGPT·제미나이 등) 활용 경험"
              subtitle="AI 여행 플래너 수용도 파악 지표"
              items={stats.genAiTypes}
              barColor="bg-purple-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅲ-1"
              title="최근 1년 국내 1박 이상 숙박여행 횟수"
              subtitle="잠재 유저(G4) 적격 기준: 연간 2회 이상"
              items={stats.tripCounts}
              barColor="bg-indigo-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅲ-2"
              title="주 방문 국내여행지 이동 소요시간"
              subtitle="거주지 기준 2시간 이내 근거리 vs 원거리 비중"
              items={stats.tripDists}
              barColor="bg-emerald-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅲ-5"
              title="현장 방문 인증 리워드(스탬프 투어·발도장 등) 참여 경험"
              subtitle="오프라인 방문 인증형 미션 참여도"
              items={stats.stampRewards}
              barColor="bg-amber-500"
            />
          </div>
        )}

        {activeSubTab === "screening" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <HorizontalStatCard
              codeBadge="종합"
              title="1차 스크리닝 적격 판정 및 제외 사유 분포"
              subtitle="전체 신청자 중 적격 통과자 및 사유별 배제 현황"
              items={stats.screeningBreakdown}
              barColor="bg-emerald-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅳ-1"
              title="본인·가족 배제 대상 기관·업종 종사 여부"
              subtitle="한국관광공사, 대구석 협력사, 여행업, 광고·마케팅, 조사업, 언론 종사자 배제"
              items={stats.jobExcludeStats}
              barColor="bg-sky-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅳ-2"
              title="성실 응답 주의 확인 문항 ('3번' 선택 여부)"
              subtitle="불성실·무작위 응답자를 걸러내기 위한 검증 문항"
              items={stats.attentionStats}
              barColor="bg-indigo-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅳ-3"
              title="최근 6개월 내 한국관광공사 좌담회·FGI 참여 이력"
              subtitle="대구석·가볼래-터·SNS 관련 좌담회 중복 참여자 배제"
              items={stats.pastFgiStats}
              barColor="bg-purple-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅴ-5"
              title="현재 대한민국 구석구석 회원 가입 여부"
              subtitle="신청자의 현재 대구석 회원/비회원 응답 분포"
              items={stats.memberStatus}
              barColor="bg-teal-600"
            />

            <HorizontalStatCard
              codeBadge="Ⅱ-8"
              title="배지랜드 월간·연간 랭킹 10위 이내(아웃라이어) 여부"
              subtitle="극단적 상위 랭커 편중 방지를 위한 확인 문항"
              items={stats.badgeRanks}
              barColor="bg-amber-500"
            />
          </div>
        )}

        {activeSubTab === "voices" && (
          <div className="space-y-6">
            {/* 주관식 의견 카드 모음 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Ⅴ-1
                    </span>
                    <h3 className="font-bold text-slate-900 text-base">
                      국내여행 정보 탐색 시 불편했던 점 / 필요한 기능 (신청자 익명 VOC)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    성함·연락처·이메일 등 개인정보를 제거하고 응답 순번과 연령·성별·거주지·후보그룹만 매칭하여 공유합니다.
                  </p>
                </div>
              </div>

              {filteredRecords.filter((r) => r.opinion).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  작성된 주관식 의견이 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredRecords
                    .filter((r) => r.opinion)
                    .slice()
                    .reverse()
                    .map((r) => (
                      <div
                        key={r.id}
                        className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200 px-2 py-0.5 rounded">
                              응답 #{r.id}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                              {r.ageGroup}
                              {r.birthYear ? `(${r.birthYear})` : ""} ·{" "}
                              {r.gender || "-"} · {r.region || "-"}
                            </span>
                            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                              {r.targetGroup}
                            </span>
                          </div>
                          {r.isEligible ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              1차 적격
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              제외({r.excludeReasons.join(", ")})
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-slate-800 leading-relaxed break-keep bg-white p-3 rounded-lg border border-slate-200/80">
                          “{r.opinion}”
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>유입: {r.channel || "-"}</span>
                          <span className="font-mono">
                            {formatKoreanDateTime(r.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 전체 비식별 응답 요약 테이블 */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-2xs overflow-hidden">
              <h3 className="font-bold text-slate-900 text-base mb-1">
                실시간 응답자 비식별 현황표 (최근 순)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                개인정보 보호를 위해 성명·전화번호·이메일·회원ID는 서버로 전송되지 않으며, 통계·분류 정보만 표시됩니다.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-200 text-slate-700 font-bold">
                      <th className="py-2.5 px-3">순번</th>
                      <th className="py-2.5 px-3">응답일시</th>
                      <th className="py-2.5 px-3">유입경로(Ⅰ-1)</th>
                      <th className="py-2.5 px-3">연령대(출생)</th>
                      <th className="py-2.5 px-3">성별/지역</th>
                      <th className="py-2.5 px-3">1차 후보그룹</th>
                      <th className="py-2.5 px-3">참석가능 세션(Ⅰ-6)</th>
                      <th className="py-2.5 px-3">적격 판정</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {filteredRecords
                      .slice()
                      .reverse()
                      .map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            #{r.id}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                            {formatKoreanDateTime(r.timestamp)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700">
                            {r.channel || "-"}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                            {r.ageGroup}{" "}
                            {r.birthYear ? (
                              <span className="text-slate-400 font-mono">
                                ({r.birthYear})
                              </span>
                            ) : (
                              ""
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                            {r.gender || "-"} · {r.region || "-"}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="inline-block font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/70 whitespace-nowrap">
                              {r.targetGroup}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 max-w-[220px] truncate">
                            {r.sessions || "-"}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {r.isEligible ? (
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>적격 후보</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <AlertCircle className="w-3 h-3" />
                                <span>{r.excludeReasons.join(", ")}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. 구글 시트 Apps Script 연동 설정 모달 */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">
                  구글 스프레드시트 실시간 연동 설정 (1분 완료)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  어제 수정하신 설문폼은 전혀 건드리지 않고, 응답 시트(Form_Responses)에서 개인정보를 제외한 통계만 실시간으로 읽어옵니다.
                </p>
              </div>
              <button
                onClick={() => setIsConfigOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="font-bold text-slate-900">
                  단계 1. 응답 스프레드시트에서 [확장 프로그램] &gt; [Apps Script] 열기
                </div>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
                  <li>
                    구글 스프레드시트{" "}
                    <strong className="text-slate-800">
                      「2026 대한민국 구석구석 FGI(집단 심층 인터뷰) 참가 신청(응답)-최종」
                    </strong>{" "}
                    상단 메뉴에서 <strong>[확장 프로그램] &gt; [Apps Script]</strong>를 클릭합니다.
                  </li>
                  <li>
                    새로 열린 스크립트 화면에 있는{" "}
                    <code className="bg-slate-200 px-1 py-0.5 rounded">
                      function myFunction() &#123;&#125;
                    </code>
                    을 지우고, 아래 <strong>[스크립트 코드 복사하기]</strong> 버튼을 눌러 전체 붙여넣은 뒤 저장(<kbd>Ctrl+S</kbd>)합니다.
                  </li>
                  <li>
                    우측 상단 파란색 <strong>[배포] &gt; [새 배포]</strong> 클릭 &rarr; 왼쪽 톱니바퀴에서 <strong>[웹 앱]</strong> 선택
                  </li>
                  <li>
                    <strong>액세스 권한이 있는 사용자</strong>를 반드시{" "}
                    <strong className="text-sky-700 underline">[모든 사용자]</strong>로 변경 후 <strong>[배포]</strong>를 누릅니다. (권한 승인 창이 뜨면 <em>고급 &rarr; 안전하지 않음으로 이동 &rarr; 허용</em> 클릭)
                  </li>
                  <li>
                    발급된 <strong>웹 앱 URL</strong>(<code className="bg-slate-200 px-1 py-0.5 rounded">https://script.google.com/macros/s/.../exec</code>)을 아래 입력창에 붙여넣고 저장하면 즉시 연동됩니다!
                  </li>
                </ol>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    파일 보관 위치: vault/50_FGI/FGI 사용자/대구석_FGI_모집현황_실시간연동.gs
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>복사 완료! Apps Script에 붙여넣으세요</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>스크립트 코드 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveScriptUrl} className="space-y-3">
                <label className="block font-bold text-slate-900 text-xs sm:text-sm">
                  단계 2. 발급받은 Google Apps Script 웹 앱 URL 붙여넣기
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
                {configError && (
                  <p className="text-xs text-rose-600 font-semibold">
                    {configError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    닫기
                  </button>
                  <button
                    type="submit"
                    disabled={savingUrl}
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    {savingUrl ? "저장 및 연동 확인 중..." : "저장 및 실시간 연동 시작"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
