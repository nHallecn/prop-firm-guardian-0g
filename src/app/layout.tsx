import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { TradingProvider } from "@/context/TradingContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Prop-Firm Guardian | 0G Network",
  description: "Verifiable prop-firm risk logs anchored to 0G Storage.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-[#030712] font-sans text-slate-50 antialiased`}>
        <TradingProvider>
          <Header />
          <div className="flex w-full">
            <Sidebar />
            <div className="min-w-0 flex-1 overflow-x-hidden bg-[#050914]">
              {children}
            </div>
          </div>
        </TradingProvider>
      </body>
    </html>
  );
}
