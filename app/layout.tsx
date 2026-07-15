import type { Metadata } from "next";
import "./globals.css";
import { defaultBirthdayName, getBirthdayNameForms } from "./birthday-config";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const { vocative } = getBirthdayNameForms(defaultBirthdayName);

export const metadata: Metadata = {
  title: `${vocative} 생일 축하한다`,
  description: `${vocative} 태어난걸 축하한다. 앞으로도 오래오래 살아라`,
  icons: {
    icon: `${basePath}/favicon.svg`,
    shortcut: `${basePath}/favicon.svg`,
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
