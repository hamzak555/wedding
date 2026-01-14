import type { Metadata } from "next";
import { Geist, Geist_Mono, Parisienne } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const ragitha = localFont({
  src: "../../fonts/Ragitha.ttf",
  variable: "--font-ragitha",
});

const ptSerif = localFont({
  src: "../../fonts/PTSerif-Regular.ttf",
  variable: "--font-pt-serif",
});

const diplomaScript = localFont({
  src: "../../fonts/Diploma Script Pro Regular.ttf",
  variable: "--font-diploma-script",
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bogdana & Hamza | Wedding Celebration",
  description: "Join us in celebrating the wedding of Bogdana and Hamza on June 20, 2026. We can't wait to share our special day with you!",
  metadataBase: new URL("https://bogdanahamza.com"),
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Bogdana & Hamza | Wedding Celebration",
    description: "Join us in celebrating the wedding of Bogdana and Hamza on June 20, 2026.",
    url: "https://bogdanahamza.com",
    siteName: "Bogdana & Hamza Wedding",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bogdana & Hamza | Wedding Celebration",
    description: "Join us in celebrating the wedding of Bogdana and Hamza on June 20, 2026.",
  },
  keywords: ["wedding", "Bogdana", "Hamza", "celebration", "June 2026"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${ragitha.variable} ${parisienne.variable} ${ptSerif.variable} ${diplomaScript.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
