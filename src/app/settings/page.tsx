"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MODELS = [
  { id: "anthropic/claude-opus-4-6", label: "Claude Opus 4.6" },
  { id: "anthropic/claude-sonnet-4-5", label: "Claude Sonnet 4.5" },
  { id: "openai/gpt-4o", label: "GPT-4o" },
];

const DEFAULT_SYSTEM_PROMPT = `당신은 전문적인 비즈니스 제안서 작성 전문가입니다.
주어진 웹사이트 정보를 바탕으로 명확하고 설득력 있는 제안서를 한국어로 작성합니다.
제안서는 마크다운 형식으로 작성하며, 구조적이고 전문적인 문체를 사용합니다.`;

export default function SettingsPage() {
  const router = useRouter();
  const [model, setModel] = useState(MODELS[0].id);
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT);
  const [temperature, setTemperature] = useState(0.7);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    localStorage.setItem("ai_model", model);
    localStorage.setItem("ai_system_prompt", systemPrompt);
    localStorage.setItem("ai_temperature", String(temperature));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleReset() {
    setModel(MODELS[0].id);
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
    setTemperature(0.7);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="glass-btn p-2 rounded-lg"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.2" fill="none" />
                <circle cx="7" cy="7" r="2" fill="white" />
              </svg>
            </div>
            <span className="text-white font-semibold text-sm tracking-wide">ProposalAI</span>
          </div>
        </div>
        <span className="text-white/40 text-xs">AI 설정</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pb-20">
        <div className="w-full max-w-2xl mt-8">
          <h1 className="text-2xl font-bold text-white mb-1">AI 설정</h1>
          <p className="text-white/40 text-sm mb-8">모델과 시스템 프롬프트를 수정합니다.</p>

          {/* 모델 선택 */}
          <div className="glass-strong p-6 mb-4">
            <label className="block text-xs text-white/40 font-medium mb-4 tracking-wider uppercase">
              AI 모델
            </label>
            <div className="flex flex-col gap-2">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                    model === m.id
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-transparent border-white/[0.07] text-white/40 hover:border-white/15 hover:text-white/60"
                  }`}
                >
                  <span>{m.label}</span>
                  {model === m.id && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7L5.5 10.5L12 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 온도 설정 */}
          <div className="glass-strong p-6 mb-4">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs text-white/40 font-medium tracking-wider uppercase">
                창의성 (Temperature)
              </label>
              <span className="text-sm text-white font-mono">{temperature.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-white opacity-60 hover:opacity-100 transition-opacity"
            />
            <div className="flex justify-between text-xs text-white/20 mt-2">
              <span>정확함</span>
              <span>창의적</span>
            </div>
          </div>

          {/* 시스템 프롬프트 */}
          <div className="glass-strong p-6 mb-6">
            <label className="block text-xs text-white/40 font-medium mb-4 tracking-wider uppercase">
              시스템 프롬프트
            </label>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              className="glass-input w-full px-4 py-3 text-sm resize-none leading-relaxed"
              placeholder="AI에게 역할과 지시사항을 입력하세요..."
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className={`glass-btn-primary flex-1 py-3 text-sm font-semibold transition-all ${
                saved ? "bg-white/80" : ""
              }`}
            >
              {saved ? "저장됨 ✓" : "설정 저장"}
            </button>
            <button
              onClick={handleReset}
              className="glass-btn px-6 py-3 text-sm text-white/50"
            >
              초기화
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-white/20 text-xs">
        ProposalAI · AI 기반 제안서 생성기
      </footer>
    </div>
  );
}
