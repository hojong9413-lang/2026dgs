"use client";

import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

interface SecurityLockScreenProps {
  onSuccess: () => void;
}

export default function SecurityLockScreen({ onSuccess }: SecurityLockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("비밀번호를 입력해 주십시오.");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setErrorMsg(data.message || "비밀번호가 일치하지 않습니다. 다시 확인해 주십시오.");
      }
    } catch (err) {
      setErrorMsg("인증 서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6 selection:bg-sky-500 selection:text-white relative overflow-hidden font-sans">
      {/* 배경 은은한 보안 그리드 및 그라데이션 */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0a_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0a_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* 보안 로그인 카드 컨테이너 */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-md space-y-8">
        {/* 상단 엠블럼 & 타이틀 */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-[11px] font-bold text-sky-400 tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              보안 인증 시스템 (대외비)
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight pt-1">
              2026DGS 과업 자료실
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed break-keep pt-0.5">
              FGI과업 비공개 플랫폼입니다. 승인된 관계자/연구진만 접근하십시오.
            </p>
          </div>
        </div>

        {/* 패스워드 입력 폼 */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              보안 패스워드 (Security Access Code)
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="패스워드를 입력하십시오"
                disabled={isLoading}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/40 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 에러 피드백 */}
            {errorMsg && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-medium pt-1 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* 인증 확인 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm tracking-wide transition-all shadow-md hover:shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>보안 인증 접속</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 푸터 안내 */}
        <div className="pt-2 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
          소관: 한국관광공사 관광AX기획팀 용역과업<br />
          보안 도메인: 2026dgs.cloud
        </div>
      </div>
    </div>
  );
}
