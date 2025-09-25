import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SMS Gateway Tatanggi",
  description: "Sistem SMS Gateway dengan Multi-Client dan Payment Gateway",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
