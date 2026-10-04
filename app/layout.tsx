import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DAYLY — Make Today Count",
  description: "Your AI-powered everyday life companion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
