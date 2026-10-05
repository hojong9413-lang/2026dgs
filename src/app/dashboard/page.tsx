"use client";

import React, { useState } from "react";
import {
  Home,
  Mail,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Users,
  Briefcase,
  FileText,
  FileCheck,
  Clock,
  ChevronLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import TaskCalendar from "@/components/TaskCalendar";

export default function DgsDashboardPage() {
  // 현재 활성화된 메뉴: 'home' | 'taskSchedule' | 'fgiSchedule' | 'interviewSchedule' 등
  const [activeMenu, setActiveMenu] = useState<string>("home");
  // 패널 모집 탭 (신청 현황 vs 선발 현황)
  const [panelTab, setPanelTab] = useState<"신청현황" | "선발현황">("신청현황");

  const isCalendarView =
    activeMenu === "taskSchedule" ||
    activeMenu === "fgiSchedule" ||
    activeMenu === "interviewSchedule";

  return (
    <div className="min-h-screen bg-white text-slate-900 flex font-sans antialiased">
      {/* ========================================================= */}
      {/* 1. 좌측 사이드바 (LNB) */}
      {/* ========================================================= */}
      <aside className="w-64 border-r border-slate-300 bg-white flex flex-col shrink-0 select-none">
        {/* 상단 로고 & 퀵 아이콘 바 */}
        <div className="h-14 border-b border-slate-300 flex items-center justify-between px-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-xs font-black px-2.5 py-1 rounded-full tracking-wider">
              DGS
            </span>
            <button
              onClick={() => setActiveMenu("home")}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded transition-colors ${
                activeMenu === "home"
                  ? "bg-slate-200 text-slate-900"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>홈</span>
            </button>
          </div>

          {/* 알림 메시지 아이콘 (뱃지 1) */}
          <button className="relative p-1.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Mail className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-sky-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              1
            </span>
          </button>
        </div>

        {/* 사이드바 메뉴 네비게이션 */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6 text-sm">
          {/* 과업일정관리 */}
          <div>
            <button
              onClick={() => setActiveMenu("taskSchedule")}
              className={`w-full text-left font-bold py-1.5 px-2 rounded transition-colors ${
                activeMenu === "taskSchedule"
                  ? "bg-sky-50 text-sky-700 font-extrabold"
                  : "text-slate-900 hover:bg-slate-100"
              }`}
            >
              과업일정관리
            </button>
          </div>

          {/* FGI관리 */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 px-2 py-1">FGI관리</div>
            <ul className="space-y-0.5 pl-2 text-xs text-slate-700">
              <li>
                <button
                  onClick={() => setActiveMenu("panelRecruit")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "panelRecruit"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>패널모집현황</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu("moderator")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "moderator"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>모더레이터현황</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu("fgiOperation")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "fgiOperation"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>FGI 운영관리</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu("fgiSchedule")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "fgiSchedule"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>FGI 일정관리</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu("fgiMinutes")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "fgiMinutes"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>FGI 회의록파일</span>
                </button>
              </li>
            </ul>
          </div>

          {/* 공사·플랫폼 인터뷰 */}
          <div className="space-y-1">
            <div className="font-bold text-slate-900 px-2 py-1">공사·플랫폼 인터뷰</div>
            <ul className="space-y-0.5 pl-2 text-xs text-slate-700">
              <li>
                <button
                  onClick={() => setActiveMenu("interviewSchedule")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "interviewSchedule"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>인터뷰 일정관리</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu("interviewOperation")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "interviewOperation"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>인터뷰 운영관리</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveMenu("interviewMinutes")}
                  className={`w-full text-left py-1 px-2 rounded flex items-center gap-1.5 transition-colors ${
                    activeMenu === "interviewMinutes"
                      ? "bg-sky-50 text-sky-700 font-bold"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <Plus className="w-3 h-3 text-slate-400" />
                  <span>인터뷰 회의록파일</span>
                </button>
              </li>
            </ul>
          </div>

          {/* 과업수행보고 */}
          <div>
            <button
              onClick={() => setActiveMenu("taskReport")}
              className={`w-full text-left font-bold py-1.5 px-2 rounded transition-colors ${
                activeMenu === "taskReport"
                  ? "bg-sky-50 text-sky-700 font-extrabold"
                  : "text-slate-900 hover:bg-slate-100"
              }`}
            >
              과업수행보고
            </button>
          </div>

          {/* 최종 산출물 공유 */}
          <div>
            <button
              onClick={() => setActiveMenu("finalDeliverables")}
              className={`w-full text-left font-bold py-1.5 px-2 rounded transition-colors ${
                activeMenu === "finalDeliverables"
                  ? "bg-sky-50 text-sky-700 font-extrabold"
                  : "text-slate-900 hover:bg-slate-100"
              }`}
            >
              최종 산출물 공유
            </button>
          </div>
        </nav>
      </aside>

      {/* ========================================================= */}
      {/* 2. 메인 콘텐츠 영역 (캘린더 뷰 vs 대시보드 뷰) */}
      {/* ========================================================= */}
      {isCalendarView ? (
        <TaskCalendar onBackToDashboard={() => setActiveMenu("home")} />
      ) : (
        <main className="flex-1 flex flex-col min-w-0 bg-white">
          {/* 상단 타이틀 바 */}
          <header className="h-14 border-b border-slate-300 px-6 flex items-center justify-center bg-white">
            <h1 className="text-sm font-semibold text-slate-800">
              공지 안내 표시 영역 (확인 요청 메시지)
            </h1>
          </header>

          {/* 메인 스크롤 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ------------------------------------------------------- */}
          {/* [1] 공지 안내 표시 영역 (파란색 배너 박스) */}
          {/* ------------------------------------------------------- */}
          <div className="bg-[#00a4e4] text-white rounded-2xl p-5 shadow-sm space-y-1.5 font-medium">
            <div className="flex items-start gap-2">
              <span className="text-lg leading-none mt-0.5">•</span>
              <p className="text-sm sm:text-base tracking-tight">
                10월 22일 공사 담당자, 플랫폼 관계자 인터뷰 : 오전 11시 ~ 12시 진행
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg leading-none mt-0.5">•</span>
              <p className="text-sm sm:text-base tracking-tight">
                인터뷰 질문서 확인바랍니다.
              </p>
              <button
                onClick={() => setActiveMenu("interviewOperation")}
                className="inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4 hover:text-sky-100 transition-colors ml-1 cursor-pointer"
              >
                인터뷰 운영관리 확인 바로가기
                <ChevronRight className="w-4 h-4 inline" />
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* [2] 금주 일정 (구글 캘린더 주간 뷰 레퍼런스 스타일) */}
          {/* ------------------------------------------------------- */}
          <section className="border border-slate-300 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>금주 일정</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="text-slate-400">2026년 9월 ~ 10월</span>
                <button
                  onClick={() => setActiveMenu("taskSchedule")}
                  className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  전체 일정보기
                </button>
              </div>
            </div>

            {/* 구글 캘린더 주간 그리드 */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              {/* 날짜 헤더 행 */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50/70 text-center text-xs divide-x divide-slate-200">
                {/* 타임라인 레이블 헤더 */}
                <div className="py-2.5 px-1 text-slate-400 font-mono text-[11px] flex items-center justify-center">
                  GMT+09
                </div>

                {/* 9/27 (일) */}
                <div className="py-2 px-1">
                  <div className="text-slate-500 text-[11px]">일</div>
                  <div className="text-sm font-semibold text-slate-800">27</div>
                </div>

                {/* 9/28 (월) */}
                <div className="py-2 px-1">
                  <div className="text-slate-500 text-[11px]">월</div>
                  <div className="text-sm font-semibold text-slate-800">28</div>
                </div>

                {/* 9/29 (화) */}
                <div className="py-2 px-1">
                  <div className="text-slate-500 text-[11px]">화</div>
                  <div className="text-sm font-semibold text-slate-800">29</div>
                </div>

                {/* 9/30 (수) */}
                <div className="py-2 px-1">
                  <div className="text-slate-500 text-[11px]">수</div>
                  <div className="text-sm font-semibold text-slate-800">30</div>
                </div>

                {/* 10/1 (목) - 오늘 하이라이트 */}
                <div className="py-2 px-1 bg-sky-50/50">
                  <div className="text-sky-600 font-semibold text-[11px]">목</div>
                  <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold my-0.5">
                    1
                  </div>
                  <div className="mt-1">
                    <span className="inline-block bg-emerald-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                      국군의날
                    </span>
                  </div>
                </div>

                {/* 10/2 (금) */}
                <div className="py-2 px-1">
                  <div className="text-slate-500 text-[11px]">금</div>
                  <div className="text-sm font-semibold text-slate-800">2</div>
                </div>

                {/* 10/3 (토) */}
                <div className="py-2 px-1">
                  <div className="text-slate-500 text-[11px]">토</div>
                  <div className="text-sm font-semibold text-slate-800">3</div>
                  <div className="mt-1">
                    <span className="inline-block bg-emerald-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full">
                      개천절
                    </span>
                  </div>
                </div>
              </div>

              {/* 시간대별 타임라인 그리드 행 (오전 7시 ~ 11시) */}
              <div className="divide-y divide-slate-100 text-xs">
                {/* 07:00 */}
                <div className="grid grid-cols-8 h-8 divide-x divide-slate-100">
                  <div className="text-[11px] text-slate-400 text-right pr-2 pt-1 font-mono">오전 7시</div>
                  <div></div><div></div><div></div><div></div>
                  <div className="bg-sky-50/30"></div>
                  <div></div><div></div>
                </div>

                {/* 08:00 */}
                <div className="grid grid-cols-8 h-8 divide-x divide-slate-100">
                  <div className="text-[11px] text-slate-400 text-right pr-2 pt-1 font-mono">오전 8시</div>
                  <div></div><div></div><div></div><div></div>
                  <div className="bg-sky-50/30"></div>
                  <div></div><div></div>
                </div>

                {/* 09:00 */}
                <div className="grid grid-cols-8 h-8 divide-x divide-slate-100">
                  <div className="text-[11px] text-slate-400 text-right pr-2 pt-1 font-mono">오전 9시</div>
                  <div></div><div></div><div></div><div></div>
                  <div className="bg-sky-50/30"></div>
                  <div></div><div></div>
                </div>

                {/* 10:00 */}
                <div className="grid grid-cols-8 h-8 divide-x divide-slate-100">
                  <div className="text-[11px] text-slate-400 text-right pr-2 pt-1 font-mono">오전 10시</div>
                  <div></div><div></div><div></div><div></div>
                  <div className="bg-sky-50/30"></div>
                  <div></div><div></div>
                </div>

                {/* 11:00 */}
                <div className="grid grid-cols-8 h-8 divide-x divide-slate-100">
                  <div className="text-[11px] text-slate-400 text-right pr-2 pt-1 font-mono">오전 11시</div>
                  <div></div><div></div><div></div><div></div>
                  <div className="bg-sky-50/30"></div>
                  <div></div><div></div>
                </div>
              </div>
            </div>
          </section>

          {/* ------------------------------------------------------- */}
          {/* [3] FGI 패널 모집 현황 (신청 현황 & 선발 현황) */}
          {/* ------------------------------------------------------- */}
          <section className="border border-slate-300 rounded-2xl bg-white p-5 shadow-sm space-y-6">
            <h2 className="text-base font-bold text-slate-900">
              FGI 패널 모집 현황
            </h2>

            {/* --- (1) 신청 현황 차트 영역 --- */}
            <div className="space-y-3">
              <div className="inline-block">
                <span className="inline-block px-4 py-1.5 rounded-full border border-slate-700 bg-slate-50 text-slate-800 text-xs font-bold">
                  신청 현황
                </span>
              </div>

              {/* 가로 막대 차트 4분면 (성별, 연령별, 거주지, 신청분야) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 pb-4">
                {/* 1. 성별 */}
                <div className="space-y-2">
                  <div className="text-center font-bold text-xs text-slate-700 border-b border-slate-200 pb-1.5">
                    성별
                  </div>
                  <div className="space-y-2 text-xs pt-1 pl-1 border-l-2 border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-slate-600 text-right shrink-0">남자</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-6 overflow-hidden flex items-center">
                        <div
                          className="bg-[#00a4e4] h-full flex items-center justify-end pr-2 text-white font-bold text-[11px]"
                          style={{ width: "70%" }}
                        >
                          70%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-slate-600 text-right shrink-0">여자</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-6 overflow-hidden flex items-center">
                        <div
                          className="bg-[#e091d3] h-full flex items-center justify-end pr-2 text-white font-bold text-[11px]"
                          style={{ width: "55%" }}
                        >
                          55%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 연령별 */}
                <div className="space-y-2">
                  <div className="text-center font-bold text-xs text-slate-700 border-b border-slate-200 pb-1.5">
                    연령별
                  </div>
                  <div className="space-y-2 text-xs pt-1 pl-1 border-l-2 border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-slate-600 text-right shrink-0">20대</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden flex items-center">
                        <div
                          className="bg-[#00a4e4] h-full flex items-center justify-end pr-1 text-white font-bold text-[10px]"
                          style={{ width: "80%" }}
                        >
                          80%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-slate-600 text-right shrink-0">30대</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden flex items-center">
                        <div
                          className="bg-[#e091d3] h-full flex items-center justify-end pr-1 text-white font-bold text-[10px]"
                          style={{ width: "65%" }}
                        >
                          65%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-slate-600 text-right shrink-0">40대</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden flex items-center">
                        <div
                          className="bg-[#99d58f] h-full flex items-center justify-end pr-1 text-white font-bold text-[10px]"
                          style={{ width: "45%" }}
                        >
                          45%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 거주지 */}
                <div className="space-y-2">
                  <div className="text-center font-bold text-xs text-slate-700 border-b border-slate-200 pb-1.5">
                    거주지
                  </div>
                  <div className="space-y-2 text-xs pt-1 pl-1 border-l-2 border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-slate-600 text-right shrink-0">서울</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-6 overflow-hidden flex items-center">
                        <div
                          className="bg-[#00a4e4] h-full flex items-center justify-end pr-2 text-white font-bold text-[11px]"
                          style={{ width: "85%" }}
                        >
                          85%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-8 text-slate-600 text-right shrink-0">경기</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-6 overflow-hidden flex items-center">
                        <div
                          className="bg-[#e091d3] h-full flex items-center justify-end pr-2 text-white font-bold text-[11px]"
                          style={{ width: "40%" }}
                        >
                          40%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. 신청분야 */}
                <div className="space-y-2">
                  <div className="text-center font-bold text-xs text-slate-700 border-b border-slate-200 pb-1.5">
                    신청분야
                  </div>
                  <div className="space-y-2 text-xs pt-1 pl-1 border-l-2 border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-slate-600 text-right shrink-0">핫유저</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden flex items-center">
                        <div
                          className="bg-[#00a4e4] h-full flex items-center justify-end pr-1 text-white font-bold text-[10px]"
                          style={{ width: "90%" }}
                        >
                          90%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-slate-600 text-right shrink-0">콜드유저</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden flex items-center">
                        <div
                          className="bg-[#e091d3] h-full flex items-center justify-end pr-1 text-white font-bold text-[10px]"
                          style={{ width: "75%" }}
                        >
                          75%
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-12 text-slate-600 text-right shrink-0">잠재유저</span>
                      <div className="flex-1 bg-slate-100 rounded-sm h-5 overflow-hidden flex items-center">
                        <div
                          className="bg-[#99d58f] h-full flex items-center justify-end pr-1 text-white font-bold text-[10px]"
                          style={{ width: "60%" }}
                        >
                          60%
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* --- (2) 선발 현황 카드 영역 --- */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="inline-block">
                <span className="inline-block px-4 py-1.5 rounded-full border border-slate-700 bg-slate-50 text-slate-800 text-xs font-bold">
                  선발 현황
                </span>
              </div>

              {/* FGI 1차 / 2차 / 3차 그룹 카드 그리드 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                {/* [FGI 1차] 업계 인터뷰 */}
                <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                  <div className="text-center font-bold text-xs text-slate-800 border-b border-slate-200 pb-1.5">
                    FGI 1차
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* 플랫폼사업자 */}
                    <div className="bg-[#e3f4e3] border border-emerald-300/60 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="text-[11px] font-medium text-slate-700 leading-tight">
                        플랫폼사업자
                      </div>
                      <div className="text-xl font-bold mt-2">
                        <span className="text-red-500">3</span>
                        <span className="text-slate-700">/5</span>
                      </div>
                    </div>

                    {/* 전통 여행사 */}
                    <div className="bg-[#e3f4e3] border border-emerald-300/60 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="text-[11px] font-medium text-slate-700 leading-tight">
                        전통 여행사
                      </div>
                      <div className="text-xl font-bold mt-2">
                        <span className="text-red-500">2</span>
                        <span className="text-slate-700">/5</span>
                      </div>
                    </div>

                    {/* 기타 유관사업자 */}
                    <div className="bg-[#e3f4e3] border border-emerald-300/60 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="text-[11px] font-medium text-slate-700 leading-tight">
                        기타 유관사업자
                      </div>
                      <div className="text-xl font-bold mt-2">
                        <span className="text-red-500">0</span>
                        <span className="text-slate-700">/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* [FGI 2차] 사용자 - 핫유저 */}
                <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                  <div className="text-center font-bold text-xs text-slate-800 border-b border-slate-200 pb-1.5">
                    FGI 2차
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* 핫유저1 */}
                    <div className="bg-[#fce8de] border border-orange-200 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="text-xs font-medium text-slate-700">
                        핫유저1
                      </div>
                      <div className="text-xl font-bold mt-2">
                        <span className="text-red-500">5</span>
                        <span className="text-slate-700">/5</span>
                      </div>
                    </div>

                    {/* 핫유저2 */}
                    <div className="bg-[#fce8de] border border-orange-200 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="text-xs font-medium text-slate-700">
                        핫유저2
                      </div>
                      <div className="text-xl font-bold mt-2">
                        <span className="text-red-500">5</span>
                        <span className="text-slate-700">/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* [FGI 3차] 사용자 - 콜드/잠재유저 */}
                <div className="border border-slate-300 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                  <div className="text-center font-bold text-xs text-slate-800 border-b border-slate-200 pb-1.5">
                    FGI 3차
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* 콜드유저 */}
                    <div className="bg-[#e4eff8] border border-sky-200 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="text-xs font-medium text-slate-700">
                        콜드유저
                      </div>
                      <div className="text-xl font-bold mt-2">
                        <span className="text-red-500">4</span>
                        <span className="text-slate-700">/5</span>
                      </div>
                    </div>

                    {/* 잠재유저 */}
                    <div className="bg-[#e4eff8] border border-sky-200 rounded-xl p-2.5 text-center flex flex-col justify-between">
                      <div className="text-xs font-medium text-slate-700">
                        잠재유저
                      </div>
                      <div className="text-xl font-bold mt-2">
                        <span className="text-red-500">3</span>
                        <span className="text-slate-700">/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
      )}
    </div>
  );
}
