import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { MobileNav } from "@/components/layout/mobile-nav";
import { JsonLd } from "@/components/seo/json-ld";
import { siteConfig } from "@/config/site";
import { websiteJsonLd } from "@/lib/seo/json-ld";
import { siteOrigin } from "@/lib/seo/urls";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: siteConfig.logo.src, type: "image/png" },
    ],
    apple: siteConfig.logo.src,
    shortcut: "/favicon.png",
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-text">
        <JsonLd data={websiteJsonLd()} />
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
