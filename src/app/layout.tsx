// src/app/layout.tsx
// UPDATE: Integrate the TradingProvider and structural layout composition
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { TradingProvider } from "@/context/TradingContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Prop-Firm Guardian AI | 0G Network",
  description: "Verifiable AI risk management for prop-firm traders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-950 text-slate-50 min-h-screen flex flex-col`}>
        <TradingProvider>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <div className="flex-1 overflow-x-hidden bg-slate-950/40">
              {children}
            </div>
          </div>
        </TradingProvider>
      </body>
    </html>
  );
}