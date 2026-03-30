import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Support Tools",
  description: "Internal support template & SQL script generation tool",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
