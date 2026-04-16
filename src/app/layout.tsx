import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProposalAI — AI 제안서 생성기",
  description: "URL을 입력하면 AI가 제안서를 자동으로 생성합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="bg-mesh min-h-full antialiased">{children}</body>
    </html>
  );
}
