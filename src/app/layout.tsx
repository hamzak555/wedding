import type { Metadata } from "next";
import { Geist, Geist_Mono, Playwrite_NO, Parisienne } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playwriteNO = Playwrite_NO({
  variable: "--font-playwrite-no",
  weight: ["100", "200", "300", "400"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${playwriteNO.variable} ${parisienne.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
