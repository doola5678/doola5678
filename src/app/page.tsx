"use client";

import { useState } from "react";

const TEMPLATES = ["비즈니스 제안서", "기술 제안서", "마케팅 제안서", "프로젝트 제안서"];

type Step = "idle" | "scraping" | "generating" | "done" | "error";

export default function Home() {
  const [url, setUrl] = useState("");
  const [template, setTemplate] = useState(TEMPLATES[0]);
  const [step, setStep] = useState<Step>("idle");
  const [proposal, setProposal] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleGenerate() {
    if (!url) return;
    setStep("scraping");
    setProposal("");
    setErrorMsg("");

    try {
      // 1) 스크래핑
      const scrapeRes = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const scrapeData = await scrapeRes.json();
      if (!scrapeRes.ok) throw new Error(scrapeData.error);

      // 2) AI 생성
      setStep("generating");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scrapeData, template }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error);

      setProposal(genData.proposal);
      setStep("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "알 수 없는 오류");
      setStep("error");
    }
  }

  const isLoading = step === "scraping" || step === "generating";

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none" />
              <circle cx="7" cy="7" r="2" fill="white" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">ProposalAI</span>
        </div>
        <nav>
          <a href="/settings" className="glass-btn text-xs px-4 py-2 flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle cx="6.5" cy="6.5" r="2" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" />
              <path d="M6.5 1V2M6.5 11V12M1 6.5H2M11 6.5H12M2.4 2.4L3.1 3.1M9.9 9.9L10.6 10.6M2.4 10.6L3.1 9.9M9.9 3.1L10.6 2.4"
                stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="text-white/60">AI 설정</span>
          </a>
        </nav>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center px-6 pb-20">
        {/* Hero — input 영역에 집중할 때는 위로 올림 */}
        <div className={`text-center transition-all duration-500 ${step !== "idle" ? "mt-6 mb-6" : "mt-16 mb-12"}`}>
          {step === "idle" && (
            <>
              <div className="inline-flex items-center gap-2 glass px-4 py-1.5 rounded-full mb-6 text-xs text-white/50">
                <span className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block" />
                Claude Opus 4.6 · OpenRouter
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4 leading-tight">
                URL을 입력하면<br />
                <span className="text-white/40">AI가 제안서를 작성합니다</span>
              </h1>
              <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed">
                웹사이트 주소를 입력하면 AI가 내용을 분석하여<br />
                전문적인 제안서를 자동으로 생성합니다.
              </p>
            </>
          )}
        </div>

        {/* Input Card */}
        <div className="glass-strong w-full max-w-2xl p-6 mb-4">
          <label className="block text-xs text-white/40 font-medium mb-3 tracking-wider uppercase">
            웹사이트 URL
          </label>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !isLoading && handleGenerate()}
              placeholder="https://example.com"
              disabled={isLoading}
              className="glass-input flex-1 px-4 py-3 text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={!url || isLoading}
              className="glass-btn-primary px-6 py-3 text-sm font-semibold min-w-[96px]"
            >
              {isLoading ? (
                <span className="animate-pulse-subtle">
                  {step === "scraping" ? "분석 중..." : "생성 중..."}
                </span>
              ) : "생성하기"}
            </button>
          </div>

          {/* Template selector */}
          <div className="mt-4 pt-4 border-t border-white/[0.06]">
            <label className="block text-xs text-white/30 mb-3 tracking-wider uppercase">
              제안서 유형
            </label>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  disabled={isLoading}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    template === t
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/60"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="glass w-full max-w-2xl p-5 flex items-center gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/50"
                  style={{ animation: `pulse-subtle 1.2s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <p className="text-sm text-white/50">
              {step === "scraping"
                ? "웹사이트 내용을 분석하고 있습니다..."
                : "AI가 제안서를 작성하고 있습니다... (30초~1분 소요)"}
            </p>
          </div>
        )}

        {/* 에러 */}
        {step === "error" && (
          <div className="w-full max-w-2xl p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-sm text-white/50">
              <span className="text-white/70 font-medium">오류:</span> {errorMsg}
            </p>
          </div>
        )}

        {/* 결과 */}
        {step === "done" && proposal && (
          <div className="glass-strong w-full max-w-2xl p-6 mt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs text-white/30 uppercase tracking-wider">생성된 제안서</span>
                <h2 className="text-sm font-semibold text-white/80 mt-0.5">{template}</h2>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(proposal);
                }}
                className="glass-btn text-xs px-3 py-1.5"
              >
                복사
              </button>
            </div>
            <div className="border-t border-white/[0.06] pt-4">
              <pre className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed font-sans">
                {proposal}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-white/20 text-xs">
        ProposalAI · AI 기반 제안서 생성기
      </footer>
    </div>
  );
}
