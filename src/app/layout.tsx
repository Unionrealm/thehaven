import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haven — 티켓 판매 플랫폼",
  description: "링크 하나로 티켓을 판매하세요. 회원가입 없이 간편하게.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
