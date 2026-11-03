import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/noto-sans-ethiopic";
import "./globals.css";

export const metadata: Metadata = {
  title: "Askly | AI answers from your own documents",
  description:
    "An embeddable AI chat widget that answers visitors' questions from your own documents, in English and Amharic, with sources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}