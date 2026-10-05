"use client";

import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Filter,
  X,
  Tag,
} from "lucide-react";

export interface ScheduleEvent {
  id: string;
  title: string;
  category: "milestone" | "fgi_user" | "fgi_industry" | "interview" | "holiday";
  categoryName: string;
  startDate: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
  startTime?: string; // "HH:mm"
  endTime?: string;   // "HH:mm"
  location?: string;
  participants?: string;
  description: string;
  status: "완료" | "진행예정" | "진행중";
  colorBg: string;
  colorBorder: string;
  colorText: string;
}

// 과업내용서에 명시된 실제 과업 일정 데이터 (2026년 10월 ~ 12월)
const INITIAL_EVENTS: ScheduleEvent[] = [
  {
    id: "e-01",
    title: "국군의날 (임시공휴일)",
    category: "holiday",
    categoryName: "공휴일",
    startDate: "2026-10-01",
    status: "진행예정",
    description: "법정공휴일",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-300",
    colorText: "text-emerald-700",
  },
  {
    id: "e-02",
    title: "개천절",
    category: "holiday",
    categoryName: "공휴일",
    startDate: "2026-10-03",
    status: "진행예정",
    description: "법정공휴일",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-300",
    colorText: "text-emerald-700",
  },
  {
    id: "e-03",
    title: "착수보고회 (한국관광공사)",
    category: "milestone",
    categoryName: "과업 마일스톤",
    startDate: "2026-10-08",
    startTime: "14:00",
    endTime: "16:00",
    location: "한국관광공사 서울센터 회의실",
    participants: "국내디지털마케팅팀 담당자(5인), 용역 총괄PM 등",
    status: "진행예정",
    description: "과업 수행방안, 세부 추진일정 및 FGI 패널 모집 계획 착수보고 (보고 1일 전 산출물 제출)",
    colorBg: "bg-indigo-50",
    colorBorder: "border-indigo-300",
    colorText: "text-indigo-700",
  },
  {
    id: "e-04",
    title: "한글날",
    category: "holiday",
    categoryName: "공휴일",
    startDate: "2026-10-09",
    status: "진행예정",
    description: "법정공휴일",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-300",
    colorText: "text-emerald-700",
  },
  {
    id: "e-05",
    title: "대구석 플랫폼 현황 분석 및 서비스 리뷰",
    category: "interview",
    categoryName: "현황 분석",
    startDate: "2026-10-14",
    endDate: "2026-10-16",
    startTime: "10:00",
    endTime: "17:00",
    location: "사무실 / 온라인 회의",
    participants: "플랫폼 운영사, 리서치팀",
    status: "진행예정",
    description: "대구석 주요 서비스 구성 현황 분석 및 플랫폼 수행업체 사전 미팅",
    colorBg: "bg-amber-50",
    colorBorder: "border-amber-300",
    colorText: "text-amber-800",
  },
  {
    id: "e-06",
    title: "공사 담당자 & 플랫폼 관계자 인터뷰",
    category: "interview",
    categoryName: "관계자 인터뷰",
    startDate: "2026-10-22",
    startTime: "11:00",
    endTime: "12:00",
    location: "한국관광공사 서울센터 또는 비대면 화상회의",
    participants: "공사 담당자, 플랫폼 운영사 핵심 실무진",
    status: "진행예정",
    description: "인터뷰 질문서 기반 사업 관계자 인터뷰 진행 및 플랫폼 운영 애로사항 청취",
    colorBg: "bg-sky-50",
    colorBorder: "border-sky-300",
    colorText: "text-sky-700",
  },
  {
    id: "e-07",
    title: "FGI 조사 설계 및 문항 개발 완료",
    category: "milestone",
    categoryName: "과업 마일스톤",
    startDate: "2026-10-28",
    startTime: "15:00",
    endTime: "17:00",
    location: "내부 회의실",
    participants: "리서치 책임자, 전문 모더레이터",
    status: "진행예정",
    description: "핫/콜드/잠재 유저 및 업계 그룹별 세부 심층 질문지(FGI 가이드라인) 최종 확정",
    colorBg: "bg-indigo-50",
    colorBorder: "border-indigo-300",
    colorText: "text-indigo-700",
  },
  {
    id: "e-08",
    title: "FGI 1차: 관광업계 심층 인터뷰 (플랫폼/여행사)",
    category: "fgi_industry",
    categoryName: "업계 FGI",
    startDate: "2026-11-05",
    startTime: "14:00",
    endTime: "16:30",
    location: "전문 FGI 미러룸 (강남/종로)",
    participants: "관광플랫폼 사업자(5인), 전통여행사(5인), 공사 참관인",
    status: "진행예정",
    description: "민관협업 현황 및 향후 데이터 교류·협업 확대 방안 조사, AI 녹음 및 당일 요약본 생성",
    colorBg: "bg-emerald-50",
    colorBorder: "border-emerald-300",
    colorText: "text-emerald-800",
  },
  {
    id: "e-09",
    title: "FGI 2차: 핫유저 1·2그룹 사용자 심층 인터뷰",
    category: "fgi_user",
    categoryName: "사용자 FGI",
    startDate: "2026-11-19",
    startTime: "13:30",
    endTime: "17:30",
    location: "전문 FGI 룸 (원웨이 미러룸)",
    participants: "핫유저 패널 10인(2개 그룹), 모더레이터, 공사 참관인(5인)",
    status: "진행예정",
    description: "대구석 활발 이용자의 서비스 개선의견 및 '27년 AI 챗봇 추천 기능 니즈 인터뷰",
    colorBg: "bg-orange-50",
    colorBorder: "border-orange-300",
    colorText: "text-orange-800",
  },
  {
    id: "e-10",
    title: "FGI 3차: 콜드유저 & 잠재유저 인터뷰",
    category: "fgi_user",
    categoryName: "사용자 FGI",
    startDate: "2026-11-20",
    startTime: "14:00",
    endTime: "16:30",
    location: "전문 FGI 룸 (원웨이 미러룸)",
    participants: "콜드유저(5인), 잠재유저(5인), 모더레이터",
    status: "진행예정",
    description: "비이용/이탈 원인 분석 및 대구석 유입을 위한 콘텐츠/기능 개선 인사이트 도출",
    colorBg: "bg-sky-50",
    colorBorder: "border-sky-300",
    colorText: "text-sky-800",
  },
  {
    id: "e-11",
    title: "최종 결과보고서 작성 및 제출 (기한 엄수)",
    category: "milestone",
    categoryName: "과업 마일스톤",
    startDate: "2026-12-01",
    startTime: "18:00",
    location: "한국관광공사 국내디지털마케팅팀",
    participants: "용역수행 총괄팀",
    status: "진행예정",
    description: "인터뷰 결과 분석, AI 녹취 요약본, 오디오 팟캐스트, 단기·중장기 플랫폼 고도화 제언 수록",
    colorBg: "bg-rose-50",
    colorBorder: "border-rose-300",
    colorText: "text-rose-700",
  },
];

interface TaskCalendarProps {
  onBackToDashboard?: () => void;
}

export default function TaskCalendar({ onBackToDashboard }: TaskCalendarProps) {
  // 현재 기준 월: 2026년 10월
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 1-12
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [events, setEvents] = useState<ScheduleEvent[]>(INITIAL_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // 새 일정 폼 상태
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<ScheduleEvent["category"]>("fgi_user");
  const [newDate, setNewDate] = useState("2026-10-15");
  const [newStartTime, setNewStartTime] = useState("14:00");
  const [newEndTime, setNewEndTime] = useState("16:00");
  const [newLocation, setNewLocation] = useState("한국관광공사 서울센터");
  const [newDescription, setNewDescription] = useState("");

  // 월 이동
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10);
  };

  // 날짜 계산 (해당 월의 첫날 요일 및 총 일수)
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(일) ~ 6(토)
  const totalDaysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // 이전 달의 마지막 일수
  const prevMonthTotalDays = new Date(currentYear, currentMonth - 1, 0).getDate();

  // 캘린더 그리드 셀 생성 (6주 x 7일 = 42셀)
  const calendarCells = [];

  // 1. 이전 달 날짜들
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthTotalDays - i;
    const prevMonthNum = currentMonth === 1 ? 12 : currentMonth - 1;
    const prevYearNum = currentMonth === 1 ? currentYear - 1 : currentYear;
    const dateStr = `${prevYearNum}-${String(prevMonthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      day,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // 2. 현재 달 날짜들
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      day,
      dateStr,
      isCurrentMonth: true,
    });
  }

  // 3. 다음 달 날짜들 (42칸 채우기)
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextMonthNum = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYearNum = currentMonth === 12 ? currentYear + 1 : currentYear;
    const dateStr = `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    calendarCells.push({
      day,
      dateStr,
      isCurrentMonth: false,
    });
  }

  // 특정 날짜에 해당하는 일정 필터링
  const getEventsForDate = (dateStr: string) => {
    return events.filter((ev) => {
      if (filterCategory !== "all" && ev.category !== filterCategory) return false;
      if (ev.endDate) {
        return dateStr >= ev.startDate && dateStr <= ev.endDate;
      }
      return ev.startDate === dateStr;
    });
  };

  // 새 일정 등록 핸들러
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let categoryName = "기타 일정";
    let colorBg = "bg-slate-100";
    let colorBorder = "border-slate-300";
    let colorText = "text-slate-800";

    if (newCategory === "milestone") {
      categoryName = "과업 마일스톤";
      colorBg = "bg-indigo-50";
      colorBorder = "border-indigo-300";
      colorText = "text-indigo-700";
    } else if (newCategory === "fgi_user") {
      categoryName = "사용자 FGI";
      colorBg = "bg-orange-50";
      colorBorder = "border-orange-300";
      colorText = "text-orange-800";
    } else if (newCategory === "fgi_industry") {
      categoryName = "업계 FGI";
      colorBg = "bg-emerald-50";
      colorBorder = "border-emerald-300";
      colorText = "text-emerald-800";
    } else if (newCategory === "interview") {
      categoryName = "공사·플랫폼 인터뷰";
      colorBg = "bg-sky-50";
      colorBorder = "border-sky-300";
      colorText = "text-sky-700";
    }

    const created: ScheduleEvent = {
      id: `e-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      categoryName,
      startDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      location: newLocation,
      description: newDescription,
      status: "진행예정",
      colorBg,
      colorBorder,
      colorText,
    };

    setEvents([...events, created]);
    setIsAddModalOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* ========================================================= */}
      {/* 1. 구글 캘린더 스타일 상단 툴바 */}
      {/* ========================================================= */}
      <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <CalendarIcon className="w-5 h-5" />
            </span>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              과업 및 FGI 일정관리
            </h1>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          {/* 오늘 버튼 */}
          <button
            onClick={handleToday}
            className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            오늘
          </button>

          {/* 이전 / 다음 월 버튼 */}
          <div className="flex items-center">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 년/월 타이틀 */}
          <div className="text-base font-bold text-slate-800 ml-1">
            {currentYear}년 {currentMonth}월
          </div>
        </div>

        {/* 우측 도구: 필터, 뷰 전환, 일정 등록 */}
        <div className="flex items-center gap-3">
          {/* 범주 필터 */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">전체 일정 보기</option>
              <option value="milestone">과업 마일스톤</option>
              <option value="fgi_user">사용자 FGI</option>
              <option value="fgi_industry">업계 FGI</option>
              <option value="interview">공사·플랫폼 인터뷰</option>
              <option value="holiday">공휴일</option>
            </select>
          </div>

          {/* 월간 / 주간 뷰 전환 */}
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === "month"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              월간
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-md transition-colors ${
                viewMode === "week"
                  ? "bg-white text-slate-900 shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              주간
            </button>
          </div>

          {/* + 새 일정 추가 버튼 (구글 캘린더 스타일) */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#00a4e4] hover:bg-[#0090c9] text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>일정 등록</span>
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. 캘린더 범례(Legend) 및 알림 배너 */}
      {/* ========================================================= */}
      <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-slate-700">일정 구분:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            과업 마일스톤 (착수/결과보고)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            1차 업계 FGI
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            2·3차 사용자 FGI (핫/콜드/잠재)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            공사·플랫폼 인터뷰
          </span>
        </div>

        <div className="text-[11px] text-slate-400">
          ※ 일정을 클릭하면 상세 내용 및 회의 정보를 열람할 수 있습니다.
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 캘린더 메인 그리드 */}
      {/* ========================================================= */}
      {viewMode === "month" ? (
        // ------------------ [월간 뷰] ------------------
        <div className="flex-1 flex flex-col min-h-0 bg-slate-100/50 p-4 overflow-y-auto">
          <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col overflow-hidden">
            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-semibold py-2.5 bg-slate-50/70 divide-x divide-slate-100">
              <div className="text-red-500">일</div>
              <div className="text-slate-700">월</div>
              <div className="text-slate-700">화</div>
              <div className="text-slate-700">수</div>
              <div className="text-slate-700">목</div>
              <div className="text-slate-700">금</div>
              <div className="text-blue-500">토</div>
            </div>

            {/* 6주 x 7일 날짜 그리드 */}
            <div className="flex-1 grid grid-cols-7 grid-rows-6 divide-x divide-y divide-slate-100 text-xs">
              {calendarCells.map((cell, idx) => {
                const isToday = cell.dateStr === "2026-10-01";
                const isSunday = idx % 7 === 0;
                const isSaturday = idx % 7 === 6;
                const dayEvents = getEventsForDate(cell.dateStr);

                return (
                  <div
                    key={cell.dateStr + idx}
                    className={`min-h-[105px] p-1.5 flex flex-col transition-colors hover:bg-slate-50/80 ${
                      !cell.isCurrentMonth
                        ? "bg-slate-50/30 text-slate-300"
                        : "bg-white text-slate-800"
                    } ${isToday ? "bg-sky-50/20" : ""}`}
                  >
                    {/* 날짜 상단 번호 */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`inline-flex items-center justify-center text-xs font-semibold ${
                          isToday
                            ? "w-6 h-6 rounded-full bg-blue-600 text-white font-bold"
                            : isSunday
                            ? "text-red-500"
                            : isSaturday
                            ? "text-blue-500"
                            : ""
                        }`}
                      >
                        {cell.day}
                      </span>

                      {isToday && (
                        <span className="text-[10px] font-bold text-blue-600">
                          오늘
                        </span>
                      )}
                    </div>

                    {/* 해당 날짜 일정 칩 리스트 */}
                    <div className="space-y-1 flex-1 overflow-y-auto">
                      {dayEvents.map((ev) => (
                        <button
                          key={ev.id}
                          onClick={() => setSelectedEvent(ev)}
                          className={`w-full text-left px-1.5 py-0.5 rounded text-[11px] font-medium border truncate transition-all hover:brightness-95 cursor-pointer block ${ev.colorBg} ${ev.colorBorder} ${ev.colorText}`}
                          title={`${ev.startTime ? `[${ev.startTime}] ` : ""}${ev.title}`}
                        >
                          {ev.startTime && (
                            <span className="font-semibold mr-1 opacity-80">
                              {ev.startTime}
                            </span>
                          )}
                          <span>{ev.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // ------------------ [주간 뷰] ------------------
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1">
            {/* 주간 헤더 (2026.09.27 ~ 10.03 주간) */}
            <div className="grid grid-cols-8 border-b border-slate-200 text-center text-xs bg-slate-50/70 divide-x divide-slate-100 py-3">
              <div className="text-slate-400 font-mono text-[11px] flex items-center justify-center">
                시간
              </div>
              <div><div className="text-red-500">일 27</div></div>
              <div><div className="text-slate-700">월 28</div></div>
              <div><div className="text-slate-700">화 29</div></div>
              <div><div className="text-slate-700">수 30</div></div>
              <div className="bg-sky-50/60 font-bold">
                <div className="text-blue-600">목 1 (오늘)</div>
                <span className="inline-block bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full mt-0.5">
                  국군의날
                </span>
              </div>
              <div><div className="text-slate-700">금 2</div></div>
              <div>
                <div className="text-blue-500">토 3</div>
                <span className="inline-block bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full mt-0.5">
                  개천절
                </span>
              </div>
            </div>

            {/* 시간대별 타임 슬롯 (오전 8시 ~ 오후 6시) */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
              {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => (
                <div key={hour} className="grid grid-cols-8 min-h-[50px] divide-x divide-slate-100">
                  <div className="text-[11px] text-slate-400 text-right pr-2 pt-1 font-mono bg-slate-50/40">
                    {hour < 12 ? `오전 ${hour}시` : hour === 12 ? `오후 12시` : `오후 ${hour - 12}시`}
                  </div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  {/* 목요일(10/1) */}
                  <div className="bg-sky-50/20 p-1 relative">
                    {hour === 11 && (
                      <div className="bg-sky-100 border border-sky-300 rounded p-1.5 text-[11px] text-sky-800 font-medium shadow-2xs">
                        <div className="font-bold">사전 설문 및 모더레이터 미팅</div>
                        <div className="text-[10px] text-sky-600">11:00 ~ 12:00</div>
                      </div>
                    )}
                  </div>
                  <div></div>
                  <div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. 일정 상세 모달 (Popup Dialog) */}
      {/* ========================================================= */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* 상단 닫기 및 카테고리 배지 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${selectedEvent.colorBg} ${selectedEvent.colorBorder} ${selectedEvent.colorText}`}>
                {selectedEvent.categoryName}
              </span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 일정 제목 */}
            <div className="mt-4">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                {selectedEvent.title}
              </h3>
            </div>

            {/* 상세 항목 리스트 */}
            <div className="mt-4 space-y-3 text-xs text-slate-700">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {selectedEvent.startDate}
                  {selectedEvent.endDate ? ` ~ ${selectedEvent.endDate}` : ""}
                  {selectedEvent.startTime ? ` (${selectedEvent.startTime} ~ ${selectedEvent.endTime || ""})` : ""}
                </span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.participants && (
                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{selectedEvent.participants}</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100">
                <div className="text-slate-500 font-semibold mb-1">상세 내용 및 과업 지침</div>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800 leading-relaxed text-xs">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. 새 일정 등록 모달 */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-sky-600" />
                새 과업/인터뷰 일정 등록
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  일정 제목 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="예: 2차 핫유저 FGI 사전 미팅"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    구분 *
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ScheduleEvent["category"])}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="milestone">과업 마일스톤</option>
                    <option value="fgi_user">사용자 FGI</option>
                    <option value="fgi_industry">업계 FGI</option>
                    <option value="interview">공사·플랫폼 인터뷰</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    일자 *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  장소
                </label>
                <input
                  type="text"
                  placeholder="예: 원웨이 미러룸 또는 줌 링크"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  메모 및 설명
                </label>
                <textarea
                  rows={3}
                  placeholder="회의 취지나 준비사항을 입력하세요."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00a4e4] hover:bg-[#0090c9] text-white rounded-xl font-bold transition-colors shadow-2xs"
                >
                  일정 등록
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
