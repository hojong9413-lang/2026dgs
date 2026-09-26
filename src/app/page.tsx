"use client";

import { useState } from "react";
import {
  FileText,
  Play,
  Pause,
  Download,
  Volume2,
  Clock,
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  Database,
  Cloud,
  FileCheck,
  Filter,
} from "lucide-react";

interface FGIGroup {
  id: string;
  name: string;
  target: string;
  status: "완료" | "진행중" | "예정";
  date: string;
  participants: number;
  duration: string;
  summary: string[];
  painPoints: string[];
  aiRequests: string[];
  tags: string[];
  audioFile: string;
  audioSize: string;
  docFile: string;
  docSize: string;
}

const FGI_GROUPS: FGIGroup[] = [
  {
    id: "g1",
    name: "1그룹: 2030 개별자유여행객 (MZ 핫플레이스형)",
    target: "SNS 여행 콘텐츠 소비 및 즉흥 여행을 선호하는 20~30대 6인",
    status: "완료",
    date: "2026.09.23",
    participants: 6,
    duration: "1시간 48분",
    summary: [
      "기존 대구석 앱은 정보의 공신력은 높으나 트렌디한 인스타 감성 맛집/카페 정보가 부족하다는 평가",
      "복잡한 카테고리 검색보다 내 현재 위치 기반 1박 2일 추천 코스를 한눈에 보기를 선호",
      "인터뷰이 전원이 2027년 AI 챗봇 도입 시 '내 취향 맞춤형 실시간 경로 최적화'를 최우선 기능으로 꼽음",
    ],
    painPoints: [
      "검색 필터가 너무 공공기관 중심적(지자체 시군구 분류 위주)",
      "방문자 실제 리뷰나 실시간 혼잡도 정보 부재",
      "코스 짜기 기능에서 대중교통 환승 정보 연동 미흡",
    ],
    aiRequests: [
      "\"비 올 때 가기 좋은 실내 드라이브 코스 3곳 알려줘\" 같은 자연어 대화형 추천",
      "인스타그램 릴스/사진 업로드 시 유사한 국내 숨은 명소 매칭 기능",
      "주말 당일치기 뚜벅이 여행자를 위한 분 단위 맞춤 일정표 자동 생성",
    ],
    tags: ["#2030MZ", "#인스타핫플", "#취향맞춤AI", "#당일치기", "#뚜벅이여행"],
    audioFile: "2026DGS_FGI_Group01_2030MZ_Full.mp3",
    audioSize: "48.5 MB",
    docFile: "2026DGS_FGI_01그룹_전사록_및_AI분석보고서.pdf",
    docSize: "14.2 MB",
  },
  {
    id: "g2",
    name: "2그룹: 3040 가족단위 여행객 (아이/부모 동반 힐링형)",
    target: "미취학~초등학생 자녀 또는 고령 부모님과 함께 여행하는 30~40대 6인",
    status: "완료",
    date: "2026.09.25",
    participants: 6,
    duration: "1시간 52분",
    summary: [
      "주차 편의성, 유모차/휠체어 이동 가능 여부(배리어프리), 수유실 정보가 여행지 선정의 절대적 기준",
      "아이와 함께 체험 가능한 지자체 생태·역사 프로그램 발굴에 대구석 사이트가 큰 도움이 됨",
      "AI 기능으로는 '아이 연령대별 피로도 반영 쉼터 포함 여행 코스'에 매우 높은 관심 표명",
    ],
    painPoints: [
      "주차장 만차 여부나 실시간 주차 정보 확인 불가",
      "수유실, 키즈존, 유모차 대여 여부 등 세부 편의시설 필터링 한계",
      "가족 동반 식당(아기의자 구비 등)과의 유기적 연계 부족",
    ],
    aiRequests: [
      "\"초등 2학년 남아와 70대 부모님이 걷기 편한 가을 숲길\" 조건부 복합 검색",
      "비상시 근처 소아과/응급실 및 쉼터 위치 자동 안내 알림",
      "가족 구성원별 이동 동선 최적화 및 넉넉한 휴식 시간 자동 배분",
    ],
    tags: ["#가족여행", "#키즈존", "#배리어프리", "#무장애관광", "#주차편의"],
    audioFile: "2026DGS_FGI_Group02_Family_Full.mp3",
    audioSize: "52.1 MB",
    docFile: "2026DGS_FGI_02그룹_전사록_및_AI분석보고서.pdf",
    docSize: "16.8 MB",
  },
  {
    id: "g3",
    name: "3그룹: 5060 액티브 시니어 (자연·문화유산 탐방형)",
    target: "은퇴 후 국내 소도시 및 웰니스·문화탐방을 즐기는 50~60대 6인",
    status: "진행중",
    date: "2026.09.28 (예정)",
    participants: 6,
    duration: "예정 (2시간)",
    summary: [
      "사전 설문 결과 글자 크기(가독성) 및 직관적인 큰 버튼 UI에 대한 개선 요구가 최우선",
      "지역 전통 축제, 오일장, 템플스테이, 걷기 좋은 둘레길에 대한 높은 선호도",
      "음성 기반 대화형 AI 도우미(말로 물어보면 말로 답해주는 기능)에 대한 긍정적 기대",
    ],
    painPoints: ["모바일 화면의 글자 크기가 작음", "예약 페이지 이동 시 회원가입 절차 복잡"],
    aiRequests: ["말로 질문하면 바로 알려주는 음성 비서 기능", "건강 상태에 맞춘 완만한 걷기 코스 추천"],
    tags: ["#액티브시니어", "#둘레길", "#웰니스관광", "#큰글씨UI", "#음성AI검색"],
    audioFile: "2026DGS_FGI_Group03_Senior_Prep.mp3",
    audioSize: "대기중",
    docFile: "2026DGS_FGI_03그룹_사전설문_가이드북.pdf",
    docSize: "4.5 MB",
  },
  {
    id: "g4",
    name: "4그룹: 방한 외국인 자유여행객 (K-컬처 로컬 투어형)",
    target: "서울 외 지방 로컬 명소 및 K-컬처 체험을 원하는 외국인 개별 관광객 6인",
    status: "예정",
    date: "2026.10.02 (예정)",
    participants: 6,
    duration: "예정 (2시간)",
    summary: [
      "사전 인터뷰: 지방 소도시 대중교통(고속버스/기차/시내버스) 예매 및 결제 장벽이 가장 큰 애로사항",
      "외국인 대상 다국어(영·일·중) AI 실시간 자동번역 챗봇 도입 시급",
    ],
    painPoints: ["로컬 매장의 영어 메뉴판 및 다국어 안내 부족", "외국인 카드 결제 지원 미흡"],
    aiRequests: ["다국어 실시간 로컬 길찾기", "사진 촬영 시 한국어 간판/메뉴판 즉시 번역 설명"],
    tags: ["#외국인관광객", "#K컬처", "#다국어지원", "#지방로컬여행", "#글로벌AI"],
    audioFile: "2026DGS_FGI_Group04_Global_Prep.mp3",
    audioSize: "대기중",
    docFile: "2026DGS_FGI_04그룹_영어질의서_안내.pdf",
    docSize: "3.8 MB",
  },
];

export default function Home() {
  const [selectedGroup, setSelectedGroup] = useState<FGIGroup>(FGI_GROUPS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(28); // 28%
  const [playbackSpeed, setPlaybackSpeed] = useState("1.0x");
  const [searchQuery, setSearchQuery] = useState("");
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  const speeds = ["1.0x", "1.25x", "1.5x", "2.0x"];

  const handleSpeedChange = () => {
    const idx = speeds.indexOf(playbackSpeed);
    const nextIdx = (idx + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  const handleAskAI = (presetQuestion?: string) => {
    const q = presetQuestion || searchQuery;
    if (!q) return;

    if (q.includes("불만") || q.includes("단점") || q.includes("개선")) {
      setAiAnswer(
        "💡 [AI 인사이트 분석 결과]\n" +
          "1그룹(2030)과 2그룹(3040) 모두 공통적으로 '공공기관 특유의 행정구역식 카테고리 분류'와 '실시간 현장 정보(주차 현황, 대기 시간, 인스타 핫플레이스 리뷰) 부족'을 가장 큰 개선점으로 지적했습니다. 특히 모바일 앱 검색 시 다단계 필터를 거치지 않고 자연어로 바로 찾을 수 있는 AI 대화창 도입이 시급한 것으로 분석됩니다."
      );
    } else if (q.includes("챗봇") || q.includes("2027") || q.includes("AI")) {
      setAiAnswer(
        "🤖 [2027 AI 챗봇 추천 기능 요구사항 분석]\n" +
          "1. 2030세대: 감성/상황 맞춤형 추천 (\"비 오는 날 드라이브 갈 만한 고즈넉한 카페 코스\")\n" +
          "2. 3040가족: 동반자 배려형 추천 (\"유모차 이동 가능 + 수유실 있는 공원 + 10분 거리 키즈존 식당\")\n" +
          "3. 5060시니어: 음성 대화형 안내 (\"화면 안 보고 말로 물어보고 말로 듣는 여행길잡이\")"
      );
    } else {
      setAiAnswer(
        `🔍 [${q}] 에 대한 인터뷰 데이터 분석 결과:\n` +
          `현재 1그룹 및 2그룹 전사 데이터에서 관련 키워드가 14회 언급되었습니다. 참여자들은 일방적인 관광지 나열보다, '실시간 조건(날씨, 요일, 동행인 수)'을 고려해 실패 확률을 줄여주는 똑똑한 지능형 추천 플랫폼으로의 전환을 강력히 원하고 있습니다.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              DGS
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg">
                  2026 대한민국 구석구석 FGI 리서치 허브
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  한국관광공사 전용
                </span>
              </div>
              <p className="text-xs text-slate-500">
                이용자 유형별 심층조사(FGI) 및 AI 기반 데이터 분석 공유 포털
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>보안 PIN 인증됨</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-mono font-medium">
              <Cloud className="w-3.5 h-3.5 text-sky-600" />
              <span>2026dgs.cloud</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Project KPI & Status Banner */}
        <section className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            <div className="lg:col-span-2 space-y-2">
              <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-200 text-xs px-2.5 py-1 rounded-full border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>AI 혁신 조사 과업 적용</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                대한민국 구석구석 2026 FGI 심층조사
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                한국관광공사 과업내용서에 따른 이용자 유형별(2030, 3040가족, 5060시니어, 외국인)
                심층 인터뷰 원본 음성, AI 팟캐스트 요약본 및 인사이트 전사 자료를 실시간으로
                제공합니다.
              </p>
            </div>

            <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/10">
              <div className="text-center p-2">
                <div className="text-xs text-slate-300">조사진행률</div>
                <div className="text-2xl font-bold text-sky-300 mt-0.5">50%</div>
                <div className="text-[10px] text-slate-400">총 4개 그룹 중 2개</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xs text-slate-300">수집 음성</div>
                <div className="text-2xl font-bold text-emerald-300 mt-0.5">3.7h</div>
                <div className="text-[10px] text-slate-400">고음질 원본 보관</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xs text-slate-300">AI 요약 완료</div>
                <div className="text-2xl font-bold text-amber-300 mt-0.5">6건</div>
                <div className="text-[10px] text-slate-400">당일 즉시 납품</div>
              </div>
              <div className="text-center p-2">
                <div className="text-xs text-slate-300">중간보고</div>
                <div className="text-2xl font-bold text-rose-300 mt-0.5">D-12</div>
                <div className="text-[10px] text-slate-400">일정 정상 진행</div>
              </div>
            </div>
          </div>
        </section>

        {/* Group Selector Cards */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>조사 대상 그룹별 현황 (FGI)</span>
            </h2>
            <span className="text-xs text-slate-500">그룹을 클릭하여 상세 데이터 열람</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {FGI_GROUPS.map((group) => {
              const isSelected = selectedGroup.id === group.id;
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 relative ${
                    isSelected
                      ? "bg-white border-blue-600 shadow-md ring-2 ring-blue-500/20"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        group.status === "완료"
                          ? "bg-emerald-100 text-emerald-800"
                          : group.status === "진행중"
                          ? "bg-amber-100 text-amber-800 animate-pulse"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {group.status}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{group.date}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 h-8">{group.target}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-600">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{group.duration}</span>
                    </span>
                    <span className="font-semibold text-blue-600 flex items-center space-x-1">
                      <span>자세히 보기</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Selected Group Detail Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Audio Player & AI Insight Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Audio Player Component */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                      {selectedGroup.name} 음성 녹음 스트리밍
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cloudflare R2 고음질 무제한 스트리밍 및 타임스탬프 지원
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSpeedChange}
                    className="text-xs font-bold px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {playbackSpeed}
                  </button>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedGroup.audioSize}
                  </span>
                </div>
              </div>

              {/* Waveform / Progress bar */}
              <div className="space-y-2 pt-2">
                <div
                  className="h-10 bg-slate-100 rounded-lg flex items-center px-3 cursor-pointer relative overflow-hidden group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const pct = Math.round((clickX / rect.width) * 100);
                    setPlayProgress(pct);
                  }}
                >
                  {/* Waveform bars simulation */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 opacity-30">
                    {[40, 65, 30, 80, 95, 45, 60, 85, 35, 70, 90, 50, 75, 40, 60, 85, 95, 30].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="w-1 bg-slate-800 rounded-full"
                          style={{ height: `${h}%` }}
                        />
                      )
                    )}
                  </div>
                  {/* Active played overlay */}
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500/20 border-r-2 border-blue-600 transition-all duration-150"
                    style={{ width: `${playProgress}%` }}
                  />
                  <div className="relative z-10 w-full flex justify-between text-[11px] font-mono font-medium text-slate-700">
                    <span>재생중: {Math.floor((playProgress * 108) / 100 / 60)}분 {(playProgress * 108) % 60}초</span>
                    <span>전체: {selectedGroup.duration}</span>
                  </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition-transform active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">
                        {isPlaying ? "재생 중..." : "일시 정지됨"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {selectedGroup.status === "완료"
                          ? "녹음 음성 즉시 청취 가능"
                          : "인터뷰 진행 후 당일 업로드"}
                      </div>
                    </div>
                  </div>

                  {/* Direct Timestamps */}
                  <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500">
                    <span className="text-[11px] text-slate-400">주요 구간:</span>
                    <button
                      onClick={() => setPlayProgress(5)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px]"
                    >
                      05:00 첫인상
                    </button>
                    <button
                      onClick={() => setPlayProgress(42)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px]"
                    >
                      45:20 불만사항
                    </button>
                    <button
                      onClick={() => setPlayProgress(78)}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[11px]"
                    >
                      1:24:00 AI요구
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* AI Insight & Summary Section (Core Mandate from RFP) */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">
                    AI 핵심 3줄 요약 및 브리핑 리포트
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedGroup.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 3 Summary Bullets */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wide flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span>인터뷰 핵심 인사이트 3선</span>
                </h4>
                <div className="space-y-2">
                  {selectedGroup.summary.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pain Point vs AI Solution Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 space-y-2">
                  <h5 className="text-xs font-bold text-rose-800 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>주요 불만 사항 (Pain Points)</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-rose-900">
                    {selectedGroup.painPoints.map((p, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-rose-400">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 space-y-2">
                  <h5 className="text-xs font-bold text-sky-800 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>2027 AI 챗봇 기능 요구사항</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-sky-900">
                    {selectedGroup.aiRequests.map((r, i) => (
                      <li key={i} className="flex items-start space-x-1.5">
                        <span className="text-sky-400">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Right Col: AI Q&A Search & Downloads */}
          <div className="space-y-6">
            {/* Interactive AI Smart Search */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Search className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">FGI 인터뷰 데이터 AI 검색</h3>
                  <p className="text-[11px] text-slate-500">인터뷰 내용 중 궁금한 점을 질문하세요</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAskAI()}
                    placeholder="예: 2030이 제안한 AI 기능은?"
                    className="w-full pl-3 pr-9 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                  <button
                    onClick={() => handleAskAI()}
                    className="absolute right-1.5 top-1.5 p-1 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Preset quick pills */}
                <div className="flex flex-wrap gap-1 text-[11px]">
                  <button
                    onClick={() => handleAskAI("불만사항 핵심")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-md transition-colors"
                  >
                    #불만사항 요약
                  </button>
                  <button
                    onClick={() => handleAskAI("2027 AI 챗봇 요구사항")}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-purple-50 text-slate-600 hover:text-purple-700 rounded-md transition-colors"
                  >
                    #AI챗봇 기대기능
                  </button>
                </div>
              </div>

              {/* AI Answer Box */}
              {aiAnswer && (
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 space-y-1.5 animate-fadeIn">
                  <div className="font-bold text-purple-900 flex items-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI 실시간 답변</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed text-[11px] sm:text-xs">
                    {aiAnswer}
                  </p>
                </div>
              )}
            </section>

            {/* Cloudflare R2 Download Center */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">산출물 다운로드</h3>
                    <p className="text-[11px] text-slate-500">Cloudflare R2 트래픽 0원 초고속 전송</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  R2 Storage
                </span>
              </div>

              <div className="space-y-2.5">
                {/* File 1: Audio */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <Volume2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {selectedGroup.audioFile}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        원본 녹음 파일 • {selectedGroup.audioSize}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      alert(`${selectedGroup.audioFile} 다운로드가 요청되었습니다. (R2 연동 준비 완료)`)
                    }
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 shrink-0 shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                {/* File 2: PDF Document */}
                <div className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center space-x-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {selectedGroup.docFile}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        전사록 및 분석보고서 • {selectedGroup.docSize}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      alert(`${selectedGroup.docFile} 다운로드가 요청되었습니다.`)
                    }
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-rose-500 text-slate-700 hover:text-rose-600 shrink-0 shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* RFP Document Reference */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1 text-[11px]">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>공사 공식 과업내용서</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">202 KB (PDF)</span>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 text-center border-t border-slate-200 pt-6">
        <p className="text-xs text-slate-400">
          2026 대한민국 구석구석(DGS) 이용자 유형별 심층조사(FGI) 연구용역 리서치 포털
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          인프라: GitHub + Vercel + Supabase(Seoul) + Cloudflare R2 | 도메인: 2026dgs.cloud
        </p>
      </footer>
    </div>
  );
}
