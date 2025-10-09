import type { Metadata } from "next";
import { Varela_Round, Geist_Mono } from "next/font/google";
import "./globals.css";

import { getSiteSettings } from "@/lib/sanity/getSiteSettings";
import { SiteSettings } from "@/lib/sanity/query/site.query";
import SiteBanner from "@/components/SiteBanner";
import SiteSocialLinks from "@/components/SiteSocialLinks";
import SiteSearch from "@/components/SiteSearch";
import SiteLogoAndName from "@/components/SiteLogoAndName";
import { SanityLive } from "@/lib/sanity/live";
import SiteFooter from "@/components/SiteFooter";
import SiteNavigation from "@/components/SiteNavigation";

const varela = Varela_Round({
  subsets: ["latin"],
  weight: "400",              // Varela Round has a single weight
  variable: "--font-varela",  // expose as CSS variable
  display: "swap",            // optional
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const siteSettings: SiteSettings = await getSiteSettings();

  // Debug favicon

  const metadata: Metadata = {
    title: siteSettings.siteName,
    description: siteSettings.tagline,
    openGraph: {
      title: siteSettings.siteName,
      description: siteSettings.tagline,
      url: siteSettings.baseUrl,
      siteName: siteSettings.siteName,
      locale: siteSettings.locale || 'en',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: siteSettings.siteName,
      description: siteSettings.tagline,
    },
    metadataBase: new URL(siteSettings.baseUrl),
  };

  // Add favicon with fallback
  if (siteSettings.favicon) {
    metadata.icons = {
      icon: [
        { url: siteSettings.favicon, sizes: '32x32', type: 'image/png' },
        { url: siteSettings.favicon, sizes: '16x16', type: 'image/png' },
      ],
      shortcut: siteSettings.favicon,
      apple: siteSettings.favicon,
    };
  } else {
    // Fallback to default favicon
    metadata.icons = {
      icon: '/favicon.ico',
    };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings: SiteSettings = await getSiteSettings();

  return (
    <html lang="en">
      <body
        className={`${varela.className} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >

        <div id="top">
          <SiteBanner banner={siteSettings.banner} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 p-2 mx-auto container max-w-6xl">
          <SiteLogoAndName logo={siteSettings.logo} siteName={siteSettings.siteName} />

          <SiteSearch />

          <SiteSocialLinks links={siteSettings.socials} />
        </div>

        <SiteNavigation />

        <div className="sm:block px-4 py-1 text-center w-full bg-gray-50">
          <p className="text-xs text-gray-400">{siteSettings.tagline}</p>
        </div>
        <SanityLive />

        <main className="flex-1 max-w-full mx-auto p-0 w-full text-center">
          {children}
        </main>

        <SiteFooter />

      </body>
    </html>
  );
}
