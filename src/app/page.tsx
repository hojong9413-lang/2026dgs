export default function ComingSoonPage() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-100 px-6 py-12 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background subtle gradient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-300 tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Coming Soon
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          오픈 예정
        </h1>

        <p className="text-slate-400 text-sm sm:text-base leading-relaxed break-keep">
          더 나은 서비스를 제공하기 위해 준비 중입니다.<br />
          빠른 시일 내에 찾아뵙겠습니다.
        </p>

        <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500">
          © 2026. All rights reserved.
        </div>
      </div>
    </main>
  );
}
