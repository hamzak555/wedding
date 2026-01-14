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
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
  themeColor: "#7d1b1b",
  openGraph: {
    title: "Bogdana & Hamza | Wedding Celebration",
    description: "Join us in celebrating the wedding of Bogdana and Hamza on June 20, 2026.",
    url: "https://bogdanahamza.com",
    siteName: "Bogdana & Hamza Wedding",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/Wedding%20Invite%20Card.png",
        width: 1200,
        height: 630,
        alt: "Bogdana & Hamza Wedding Invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bogdana & Hamza | Wedding Celebration",
    description: "Join us in celebrating the wedding of Bogdana and Hamza on June 20, 2026.",
    images: ["/Wedding%20Invite%20Card.png"],
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
