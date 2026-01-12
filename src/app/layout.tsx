import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "KODAFLOW Marketing - Quảng cáo AI tự động",
  description: "Chạy quảng cáo Google, Facebook, YouTube chỉ với một nút bấm. AI tự động tạo nội dung và tối ưu chiến dịch.",
  keywords: ["quảng cáo", "marketing", "google ads", "facebook ads", "AI", "automation"],
  openGraph: {
    title: "KODAFLOW Marketing",
    description: "Quảng cáo đa nền tảng với AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
