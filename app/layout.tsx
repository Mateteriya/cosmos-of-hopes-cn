import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Noto_Sans_SC } from "next/font/google";
import "./globals.css";
import GlobalAmuletProvider from "@/components/amulet/GlobalAmuletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Китайский шрифт
const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "火马之路 - Путь Огненной Лошади",
  description: "Китайский Новый год 2026. Создавайте амулеты желаний, объединяйтесь в комнатах, запускайте фонарики в небо",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${notoSansSC.variable} antialiased`}
        style={{ fontFamily: 'var(--font-noto-sans-sc), var(--font-inter), sans-serif' }}
      >
        <GlobalAmuletProvider />
        {children}
      </body>
    </html>
  );
}

