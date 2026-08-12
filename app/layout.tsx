import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Inter, Syne, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartSlideover from "@/components/CartSlideover";
import NotificationToast from "@/components/NotificationToast";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import AuthListener from "@/components/AuthListener";
import { clsx } from "clsx";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.wearimpulsive.site'),
  title: {
    default: "WEARIMPULSIVE | Modern Luxury Fashion",
    template: "%s | WEARIMPULSIVE"
  },
  description: "Curated collections for the modern era. Experience refined shopping. Archival design systems.",
  icons: {
    icon: '/images/impulsive-logo-new-removebg-preview.png',
    shortcut: '/images/impulsive-logo-new-removebg-preview.png',
    apple: '/images/impulsive-logo-new-removebg-preview.png',
  },
  openGraph: {
    title: "WEARIMPULSIVE",
    description: "Curated collections for the modern era. Experience refined shopping. Archival design systems built for longevity.",
    url: 'https://www.wearimpulsive.site',
    siteName: 'WEARIMPULSIVE',
    images: [
      {
        url: '/images/wi-logo.png',
        width: 1200,
        height: 1200,
        alt: 'WEARIMPULSIVE Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WEARIMPULSIVE',
    description: 'Curated collections for the modern era. Experience refined shopping. Archival design systems built for longevity.',
    images: ['/images/wi-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={clsx(inter.variable, syne.variable, playfair.variable, mono.variable, "font-sans antialiased bg-charcoal text-alabaster overflow-x-hidden")}>
        <AuthListener />
        <CartSlideover />
        <NotificationToast />
        <Navbar />
        <main className="min-h-screen">
          <Suspense fallback={
            <div className="min-h-screen bg-charcoal text-alabaster flex items-center justify-center">
              <p className="text-xs uppercase tracking-[0.3em] font-semibold text-stone animate-pulse">Loading...</p>
            </div>
          }>
            <PageTransition>
              {children}
            </PageTransition>
          </Suspense>
        </main>
        <Footer />
      </body>
    </html>
  );
}
