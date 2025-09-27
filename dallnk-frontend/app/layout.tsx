import type { Metadata } from "next";
// import { Quicksand } from "next/font/google";
import "./globals.css";

// const quicksand = Quicksand({
//   variable: "--quicksand",
//   subsets: ["latin"],
//   weight: ["400", "500", "600", "700"],
//   display: "swap",
//   adjustFontFallback: false,
// });

export const metadata: Metadata = {
  title: "dallnk",
  description: "Decentralized | Data sharing platform built on filecoin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* className={`${quicksand.variable}`} */}
      <body>{children}</body>
    </html>
  );
}
