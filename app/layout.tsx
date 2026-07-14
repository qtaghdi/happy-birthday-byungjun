import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "병준아 생일 축하한다",
  description: "촌스럽지만 진심인 병준이의 뽕짝 생일잔치",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
