import type { Metadata } from "next";
import { Inter, Syne, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartSlideover from "@/components/CartSlideover";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { clsx } from "clsx";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "IMPULSIVE | Modern Luxury Fashion",
  description: "Curated collections for the modern era. Experience refined shopping.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(inter.variable, syne.variable, playfair.variable, mono.variable, "font-sans antialiased bg-charcoal text-alabaster overflow-x-hidden")}>
        <CartSlideover />
        <Navbar />
        <main className="min-h-screen">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
      </body>
    </html>
  );
}
