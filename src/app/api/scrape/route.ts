import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `페이지를 불러올 수 없습니다. (${res.status})` },
        { status: 400 }
      );
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // 불필요한 태그 제거
    $("script, style, nav, footer, iframe, img, svg, noscript").remove();

    const title = $("title").text().trim() || $("h1").first().text().trim();
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // 본문 텍스트 추출 (최대 3000자)
    const bodyText = $("body")
      .text()
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 3000);

    return NextResponse.json({ title, description, content: bodyText });
  } catch (err) {
    const message = err instanceof Error ? err.message : "스크래핑 실패";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
