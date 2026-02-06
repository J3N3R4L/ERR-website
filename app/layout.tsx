import "./globals.css";
import type { ReactNode } from "react";
import { Cairo, Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo"
});

export const metadata = {
  title: "ERR South Darfur",
  description: "South Darfur Emergency Response Rooms"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${cairo.variable}`}>
      <body>{children}</body>
    </html>
  );
}
