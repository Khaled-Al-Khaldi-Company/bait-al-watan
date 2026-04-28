// Build trigger: 2026-04-28-v2
import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "بوابة بيت الوطن | نظام التعاون العقاري",
  description: "منصة آمنة لإدارة الاستثمارات العقارية",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
