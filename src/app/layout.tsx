import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://datalab.withprotege.ai'),
  title: {
    default: "Data Lab by Protege",
    template: "%s | Data Lab by Protege",
  },
  description: "The Data Lab builds the datasets that push AI forward. Research, tools, and resources for high-quality training and evaluation data.",
  openGraph: {
    siteName: "Data Lab by Protege",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" href="/fonts/SuisseIntlMono-Regular-WebXL.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Plain-Light.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Plain-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-mono focus:text-[var(--pro-indigo)] focus:border focus:border-[var(--pro-indigo)]">
          Skip to content
        </a>
        <Navigation />
        <main id="main-content" className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
