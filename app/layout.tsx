import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "ERR South Darfur",
  description: "South Darfur Emergency Response Rooms"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
