import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CreatorLens AI — Premium Dashboard",
  description:
    "Potencia tu contenido de YouTube con IA: títulos optimizados, miniaturas y guiones adaptados a tu canal.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={inter.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-background text-on-surface overflow-x-hidden selection:bg-primary/10 selection:text-primary font-sans">
        <Nav />
        <main className="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
