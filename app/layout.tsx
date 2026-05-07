import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Moonstack",
  description: "A personal operating system for ambitious builders.",
  icons: [{ rel: "icon", url: "/favicon.svg", type: "image/svg+xml" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
