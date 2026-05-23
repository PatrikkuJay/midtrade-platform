import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MIDTRADE | Secure Asset Exchange",
  description: "The most secure protocol for skin trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-white font-sans">
        {/* Main content wrapper */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Global Terminal Overlay (Optional aesthetic touch) */}
        <div className="fixed inset-0 pointer-events-none border-[1px] border-white/5 z-50 rounded-lg m-2" />
      </body>
    </html>
  );
}