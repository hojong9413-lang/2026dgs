"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
  Search,
} from "lucide-react";

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  path: string; // relative to vault
  allDay: boolean;
  completed?: boolean | null;
  tags?: string[];
}

interface ObsidianCalendarViewProps {
  onOpenNote: (path: string) => void;
}

type ViewMode = "month" | "week" | "day" | "list";

export default function ObsidianCalendarView({ onOpenNote }: ObsidianCalendarViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  // 기본 기준일: 2026년 10월 15일 (과업 활성 기준일)
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 15));
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: CalendarEvent[] } | null>(null);

  // 1. 과업 일정 API 호출
  useEffect(() => {
    async function fetchCalendarEvents() {
      try {
        setLoading(true);
        const res = await fetch("/api/vault/calendar");
        if (res.ok) {
          const data = await res.json();
          if (data.events) {
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCalendarEvents();
  }, []);

  // 2. 날짜별 이벤트 인덱스 맵 (빠른 조회용)
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      if (searchFilter && !ev.title.toLowerCase().includes(searchFilter.toLowerCase())) {
        continue;
      }
      if (!map.has(ev.date)) {
        map.set(ev.date, []);
      }
      map.get(ev.date)!.push(ev);
    }
    return map;
  }, [events, searchFilter]);

  // 3. 네비게이션 함수들
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed (9 = 10월)

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 86400000));
    }
  };

  const handleNext = () => {
    if (viewMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === "week") {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 86400000));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 86400000));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 9, 15)); // 과업 현재 기준일
  };

  // 4. 월간 달력 날짜 그리드 계산 (일요일 시작)
  const monthGridDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0(일) ~ 6(토)

    const days = [];

    // 이전 달 날짜들 채우기
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      const prevDateObj = new Date(year, month - 1, d);
      const dateStr = `${prevDateObj.getFullYear()}-${String(prevDateObj.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateNumber: d,
        dateStr,
        isCurrentMonth: false,
      });
    }

    // 이번 달 날짜들 채우기
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= daysInCurrentMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateNumber: d,
        dateStr,
        isCurrentMonth: true,
      });
    }

    // 다음 달 날짜들 채우기 (총 35일 또는 42일로 맞춤)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - days.length;
    for (let d = 1; d <= remainingSlots; d++) {
      const nextDateObj = new Date(year, month + 1, d);
      const dateStr = `${nextDateObj.getFullYear()}-${String(nextDateObj.getMonth() + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({
        dateNumber: d,
        dateStr,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  return (
    <div className="h-full w-full flex flex-col bg-white text-slate-900 select-none font-sans overflow-hidden">
      {/* 1. 상단 컨트롤 헤더 (옵시디언 Full Calendar 스타일) */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-white/90 shrink-0">
        {/* 좌측: 네비게이션 (< > today) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="이전"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="다음"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer ml-1"
          >
            today
          </button>
        </div>

        {/* 중앙: 월/연도 타이틀 (October 2026) */}
        <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>{monthNames[month]} {year}</span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200/80">
            총 {events.length}개 과업 일정
          </span>
        </div>

        {/* 우측: 뷰 모드 전환 버튼 (month / week / day / list) */}
        <div className="flex items-center gap-3">
          {/* 일정 검색 필터 */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="일정 검색..."
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs w-36 focus:w-48 focus:bg-white focus:outline-none focus:border-purple-500 transition-all font-sans"
            />
          </div>

          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
            {(["month", "week", "day", "list"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer capitalize ${
                  viewMode === mode
                    ? "bg-[#705dcf] text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 로딩 상태 */}
      {loading && (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
          <span className="inline-block w-5 h-5 border-2 border-[#705dcf] border-t-transparent rounded-full animate-spin mr-2" />
          과업 일정 동기화 중...
        </div>
      )}

      {/* 3. 메인 뷰: 월간 달력 그리드 (Month View) */}
      {!loading && viewMode === "month" && (
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          {/* 요일 헤더 행 (Sun ~ Sat) */}
          <div className="grid grid-cols-7 border-b border-slate-200 text-center text-xs font-semibold py-2 bg-slate-50/60 shrink-0">
            <div className="text-rose-500">Sun</div>
            <div className="text-slate-600">Mon</div>
            <div className="text-slate-600">Tue</div>
            <div className="text-slate-600">Wed</div>
            <div className="text-slate-600">Thu</div>
            <div className="text-slate-600">Fri</div>
            <div className="text-sky-600">Sat</div>
          </div>

          {/* 달력 본체 그리드 */}
          <div className="flex-1 grid grid-cols-7 grid-rows-5 border-l border-slate-200 min-h-0">
            {monthGridDays.map((day, idx) => {
              const dayEvents = eventsByDate.get(day.dateStr) || [];
              const isToday = day.dateStr === "2026-10-15";
              const maxVisible = 4;
              const overflowCount = dayEvents.length - maxVisible;

              return (
                <div
                  key={idx}
                  className={`border-r border-b border-slate-200 p-1 flex flex-col overflow-hidden transition-colors ${
                    !day.isCurrentMonth
                      ? "bg-slate-50/40 text-slate-400"
                      : isToday
                      ? "bg-purple-50/30"
                      : "bg-white hover:bg-slate-50/60"
                  }`}
                >
                  {/* 날짜 번호 표시 */}
                  <div className="flex items-center justify-between px-1 py-0.5 text-[11px] font-medium shrink-0">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${
                        isToday
                          ? "bg-[#705dcf] text-white font-bold"
                          : !day.isCurrentMonth
                          ? "text-slate-300"
                          : idx % 7 === 0
                          ? "text-rose-500"
                          : idx % 7 === 6
                          ? "text-sky-600"
                          : "text-slate-700"
                      }`}
                    >
                      {day.dateNumber}
                    </span>
                  </div>

                  {/* 일정 블록 목록 (옵시디언 보라색 칩) */}
                  <div className="flex-1 overflow-y-auto space-y-1 mt-0.5 scrollbar-none">
                    {dayEvents.slice(0, maxVisible).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => onOpenNote(ev.path)}
                        title={`${ev.title}\n(클릭 시 해당 노트 열기)`}
                        className="bg-[#705dcf] hover:bg-[#604ebb] text-white text-[11px] px-1.5 py-0.5 rounded transition-all cursor-pointer truncate shadow-xs flex items-center gap-1 group font-sans leading-tight"
                      >
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}

                    {/* 초과 일정 (+N more) */}
                    {overflowCount > 0 && (
                      <button
                        onClick={() => setSelectedDayEvents({ date: day.dateStr, events: dayEvents })}
                        className="text-[10px] text-purple-700 font-semibold px-1 py-0.5 hover:bg-purple-100 rounded w-full text-left transition-colors cursor-pointer"
                      >
                        +{overflowCount} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. 메인 뷰: 일정 목록 뷰 (List View) */}
      {!loading && viewMode === "list" && (
        <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#705dcf]" />
              전체 과업 일정 타임라인
            </h2>
            <span className="text-xs text-slate-500">총 {events.length}개 세부 일정 등록됨</span>
          </div>

          <div className="space-y-3">
            {events
              .filter((ev) => !searchFilter || ev.title.toLowerCase().includes(searchFilter.toLowerCase()))
              .map((ev) => {
                const isToday = ev.date === "2026-10-15";
                return (
                  <div
                    key={ev.id}
                    onClick={() => onOpenNote(ev.path)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isToday
                        ? "bg-purple-50/70 border-purple-300 shadow-xs"
                        : "bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-24 shrink-0 font-mono text-xs font-semibold text-slate-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{ev.date}</span>
                      </div>
                      <div className="font-medium text-slate-800 group-hover:text-purple-700 transition-colors text-sm">
                        {ev.title}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {ev.tags?.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          #{tag}
                        </span>
                      ))}
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors ml-2" />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 5. 주간/일간 뷰 안내 (현재 월간 및 목록 우선 제공) */}
      {!loading && (viewMode === "week" || viewMode === "day") && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
          <CalendarIcon className="w-12 h-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700 mb-1">
            {viewMode === "week" ? "주간(Week) 캘린더 뷰" : "일간(Day) 상세 뷰"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            과업 마일스톤은 상단의 <strong>[month] (월간 종합 뷰)</strong> 및 <strong>[list] (타임라인 목록 뷰)</strong>에서 가장 최적화되어 열람하실 수 있습니다.
          </p>
          <button
            onClick={() => setViewMode("month")}
            className="px-4 py-2 bg-[#705dcf] hover:bg-[#604ebb] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            월간 캘린더(Month)로 보기
          </button>
        </div>
      )}

      {/* 6. 모달: 특정 날짜 일정 전체 보기 (+N more 클릭 시) */}
      {selectedDayEvents && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#705dcf]" />
                <span>{selectedDayEvents.date} 일정 ({selectedDayEvents.events.length}건)</span>
              </div>
              <button
                onClick={() => setSelectedDayEvents(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {selectedDayEvents.events.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedDayEvents(null);
                    onOpenNote(ev.path);
                  }}
                  className="p-2.5 rounded-lg bg-purple-50/60 hover:bg-purple-100 border border-purple-200/80 text-purple-900 text-xs font-medium cursor-pointer transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{ev.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-700 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
