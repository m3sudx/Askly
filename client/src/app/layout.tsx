import type { Metadata } from "next";
import { Inter, Fraunces, Noto_Sans_Ethiopic } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const ethiopic = Noto_Sans_Ethiopic({ subsets: ["ethiopic"], variable: "--font-ethiopic" });

export const metadata: Metadata = {
  title: "Askly | AI answers from your own documents",
  description:
    "An embeddable AI chat widget that answers visitors' questions from your own documents, in English and Amharic, with sources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${ethiopic.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}