import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_SYSTEM_PROMPT = `당신은 전문적인 비즈니스 제안서 작성 전문가입니다.
주어진 웹사이트 정보를 바탕으로 명확하고 설득력 있는 제안서를 한국어로 작성합니다.
제안서는 마크다운 형식으로 작성하며, 구조적이고 전문적인 문체를 사용합니다.`;

const TEMPLATE_PROMPTS: Record<string, string> = {
  "비즈니스 제안서": `다음 구조로 비즈니스 제안서를 작성해주세요:
## 1. 제안 개요
## 2. 회사/서비스 소개
## 3. 문제 정의
## 4. 제안 솔루션
## 5. 기대 효과
## 6. 추진 일정
## 7. 맺음말`,

  "기술 제안서": `다음 구조로 기술 제안서를 작성해주세요:
## 1. 프로젝트 개요
## 2. 기술 스택 및 환경
## 3. 시스템 아키텍처
## 4. 구현 범위
## 5. 기술적 차별점
## 6. 개발 일정
## 7. 결론`,

  "마케팅 제안서": `다음 구조로 마케팅 제안서를 작성해주세요:
## 1. 시장 분석
## 2. 타겟 고객
## 3. 마케팅 전략
## 4. 채널 및 캠페인 계획
## 5. 예상 성과 지표 (KPI)
## 6. 예산 계획
## 7. 결론`,

  "프로젝트 제안서": `다음 구조로 프로젝트 제안서를 작성해주세요:
## 1. 프로젝트 배경
## 2. 목표 및 범위
## 3. 수행 방법
## 4. 팀 구성
## 5. 일정 계획
## 6. 기대 산출물
## 7. 결론`,
};

export async function POST(req: NextRequest) {
  const { url, title, description, content, template, systemPrompt, model, temperature } =
    await req.json();

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenRouter API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  const selectedTemplate =
    TEMPLATE_PROMPTS[template] || TEMPLATE_PROMPTS["비즈니스 제안서"];
  const finalSystemPrompt = systemPrompt || DEFAULT_SYSTEM_PROMPT;

  const userMessage = `다음 웹사이트 정보를 바탕으로 제안서를 작성해주세요.

**웹사이트 제목:** ${title}
**설명:** ${description}
**주요 내용:**
${content}

---
${selectedTemplate}`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://proposal-ai.vercel.app",
        "X-Title": "ProposalAI",
      },
      body: JSON.stringify({
        model: model || "anthropic/claude-opus-4-6",
        messages: [
          { role: "system", content: finalSystemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        temperature: temperature ?? 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json(
        { error: err.error?.message || "AI 생성 실패" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const proposal = data.choices?.[0]?.message?.content || "";

    // Supabase에 저장
    const { data: saved, error: dbError } = await supabaseAdmin
      .from("proposals")
      .insert({ url: url || "", title, template, content: proposal })
      .select("id")
      .single();

    if (dbError) {
      console.error("Supabase 저장 오류:", dbError.message);
    }

    return NextResponse.json({ proposal, id: saved?.id ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 생성 오류";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
