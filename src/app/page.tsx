import React from "react";
import {
  FileText,
  Folder,
  Video,
  FileCheck,
  Download,
  ExternalLink,
  ShieldCheck,
  Layers,
  Database,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const categories = [
    { code: "00", name: "과업개요", desc: "과업 추진 배경 및 기본 지침", count: "문서 및 계획서" },
    { code: "01", name: "과업일정", desc: "주간/월간 공정표 및 마일스톤", count: "공정 현황" },
    { code: "03", name: "회의록", desc: "착수보고, 중간보고 및 주간 회의록", count: "회의 기록" },
    { code: "04", name: "보고서파일", desc: "착수계, 중간보고서 및 산출물 원본", count: "PDF / PPTX" },
    { code: "30", name: "관계자인터뷰", desc: "전문가 및 이해관계자 인터뷰 결과", count: "인터뷰 분석" },
    { code: "50", name: "FGI", desc: "초점집단면접(FGI) 결과 및 녹화본", count: "녹취록 / 영상" },
    { code: "80", name: "최종결과보고", desc: "종합 결과보고서 및 최종 성과품", count: "최종 산출물" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* 상단 GNB */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 text-white text-xs font-bold px-2.5 py-1 rounded">
              2026DGS
            </span>
            <div className="h-4 w-px bg-slate-200" />
            <h1 className="text-sm font-semibold text-slate-800">
              대한민국구석구석 FGI 과업 문서 공유 플랫폼
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              보관함 연동됨 (Read-Only)
            </span>
          </div>
        </div>
      </header>

      {/* 메인 히어로 영역 */}
      <section className="bg-white border-b border-slate-200 py-10 px-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
            <ShieldCheck className="w-3.5 h-3.5" />
            한국관광공사 용역과업 공유 시스템
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            2026 대한민국구석구석 이용자 심층조사(FGI) 과업 자료실
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
            로컬 옵시디언(Obsidian) 보관함과 연동된 과업 회의록, 보고서 파일(.pdf, .pptx) 및
            인터뷰 대용량 동영상(.mp4)을 안전하게 열람·다운로드할 수 있는 플랫폼입니다.
          </p>

          {/* 스토리지 및 전송 정책 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              <FileText className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">옵시디언 마크다운 문서</div>
                <div className="text-xs text-slate-500 mt-0.5">회의록·분석서 인라인 뷰어 (수정 방지)</div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              <FileCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">실무 첨부파일 다운로드</div>
                <div className="text-xs text-slate-500 mt-0.5">보고서 PDF 즉시열람 및 원본 다운로드</div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3">
              <Video className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-800">대용량 미디어 스트리밍</div>
                <div className="text-xs text-slate-500 mt-0.5">Cloudflare R2 기반 400MB 무제한 전송</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 보관함 디렉토리 섹션 */}
      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-slate-700" />
            <h3 className="text-base font-bold text-slate-900">과업 분류별 보관함 구조</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">D:\뉴프로젝트\2026dgs\vault</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.code}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-shadow hover:shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">
                    {cat.code}
                  </span>
                  <span className="text-[11px] text-slate-400">{cat.count}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">{cat.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>열람 가능</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 space-y-1">
          <p className="font-medium text-slate-600">
            2026 대한민국구석구석 이용자 유형별 심층조사(FGI) 용역 과업 플랫폼
          </p>
          <p className="text-[11px] text-slate-400">
            도메인: 2026dgs.cloud | 저장소: hojong9413-lang/2026dgs | 보안 읽기 전용 모드
          </p>
        </div>
      </footer>
    </div>
  );
}
